import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import type { Bindings, User, CreateUserRequest, LoginRequest } from '../types';
import { generateToken, requireAuth, getCurrentUser } from '../middleware/auth';

const auth = new Hono<{ Bindings: Bindings }>();

// Hasher un mot de passe avec bcrypt
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Vérifier un mot de passe avec bcrypt
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
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

    // Hasher le mot de passe avec bcrypt
    const password_hash = await hashPassword(password);

    // Créer l'utilisateur
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(email, password_hash, first_name, last_name, role, phone || null).run();

    const userId = result.meta.last_row_id;

    // Si c'est un employeur, créer une entrée company et mettre à jour company_id
    if (role === 'employer') {
      const companyResult = await c.env.DB.prepare(`
        INSERT INTO companies (user_id, name)
        VALUES (?, ?)
      `).bind(userId, `${first_name} ${last_name}`).run();
      
      const companyId = companyResult.meta.last_row_id;
      
      // Mettre à jour le company_id de l'utilisateur
      await c.env.DB.prepare(`
        UPDATE users SET company_id = ? WHERE id = ?
      `).bind(companyId, userId).run();
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
      SELECT id, email, password_hash, first_name, last_name, role, company_id, is_active
      FROM users
      WHERE email = ?
    `).bind(email).first<User>();

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier si l'utilisateur est actif
    if (!user.is_active) {
      return c.json({ error: 'Votre compte est désactivé. Contactez votre administrateur.' }, 403);
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Générer un JWT token sécurisé
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id || undefined
    });

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_id: user.company_id,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    return c.json({ error: 'Erreur lors de la connexion' }, 500);
  }
});

// Récupérer le profil utilisateur (protégé par JWT)
auth.get('/profile', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);

    const user = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, phone, company_id, is_active, created_at
      FROM users
      WHERE id = ?
    `).bind(currentUser.userId).first<User>();

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    let profile: any = { ...user };

    // Si candidat, récupérer le profil
    if (user.role === 'candidate') {
      const candidateProfile = await c.env.DB.prepare(`
        SELECT * FROM candidate_profiles WHERE user_id = ?
      `).bind(currentUser.userId).first();
      profile.candidate_profile = candidateProfile;
    }

    // Si employeur, récupérer l'entreprise
    if (user.role === 'employer' && user.company_id) {
      const company = await c.env.DB.prepare(`
        SELECT * FROM companies WHERE id = ?
      `).bind(user.company_id).first();
      profile.company = company;
    }

    return c.json(profile);
  } catch (error) {
    console.error('Erreur profil:', error);
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500);
  }
});

// Ancienne route pour compatibilité (à supprimer après migration frontend)
auth.get('/profile/:userId', async (c) => {
  return c.json({ 
    error: 'Cette route est dépréciée. Utilisez GET /api/auth/profile avec un token JWT' 
  }, 410);
});

export default auth;
