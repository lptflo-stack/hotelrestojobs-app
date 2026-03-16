import { Hono } from 'hono';
import type { Bindings, User, CreateUserRequest, LoginRequest } from '../types';

const auth = new Hono<{ Bindings: Bindings }>();

// Helper pour hasher les mots de passe (simplifié pour démo)
// En production, utiliser bcrypt ou argon2
function hashPassword(password: string): string {
  // Pour la démo, on utilise un hash simple
  // En production, utiliser une vraie librairie de hashing
  return `$2a$10$${password}`;
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Inscription
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<CreateUserRequest>();
    const { email, password, first_name, last_name, role, phone } = body;

    // Validation
    if (!email || !password || !first_name || !last_name || !role) {
      return c.json({ error: 'Champs requis manquants' }, 400);
    }

    if (!['candidate', 'employer'].includes(role)) {
      return c.json({ error: 'Rôle invalide' }, 400);
    }

    // Vérifier si l'email existe déjà
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first<{ id: number }>();

    if (existing) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    }

    // Hasher le mot de passe
    const password_hash = hashPassword(password);

    // Créer l'utilisateur
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(email, password_hash, first_name, last_name, role, phone || null).run();

    const userId = result.meta.last_row_id;

    // Si c'est un employeur, créer une entrée company
    if (role === 'employer') {
      await c.env.DB.prepare(`
        INSERT INTO companies (user_id, name)
        VALUES (?, ?)
      `).bind(userId, `${first_name} ${last_name}`).run();
    }

    // Si c'est un candidat, créer un profil
    if (role === 'candidate') {
      await c.env.DB.prepare(`
        INSERT INTO candidate_profiles (user_id)
        VALUES (?)
      `).bind(userId).run();
    }

    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        first_name,
        last_name,
        role
      }
    }, 201);
  } catch (error) {
    console.error('Erreur inscription:', error);
    return c.json({ error: 'Erreur lors de l\'inscription' }, 500);
  }
});

// Connexion
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    // Récupérer l'utilisateur
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_hash, first_name, last_name, role
      FROM users
      WHERE email = ?
    `).bind(email).first<User>();

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier le mot de passe
    if (!verifyPassword(password, user.password_hash)) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // En production, générer un JWT token
    // Pour la démo, on retourne juste les infos utilisateur
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    return c.json({ error: 'Erreur lors de la connexion' }, 500);
  }
});

// Récupérer le profil utilisateur
auth.get('/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const user = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, phone, created_at
      FROM users
      WHERE id = ?
    `).bind(userId).first<User>();

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    let profile: any = { ...user };

    // Si candidat, récupérer le profil
    if (user.role === 'candidate') {
      const candidateProfile = await c.env.DB.prepare(`
        SELECT * FROM candidate_profiles WHERE user_id = ?
      `).bind(userId).first();
      profile.candidate_profile = candidateProfile;
    }

    // Si employeur, récupérer l'entreprise
    if (user.role === 'employer') {
      const company = await c.env.DB.prepare(`
        SELECT * FROM companies WHERE user_id = ?
      `).bind(userId).first();
      profile.company = company;
    }

    return c.json(profile);
  } catch (error) {
    console.error('Erreur profil:', error);
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500);
  }
});

export default auth;
