import { Context } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Bindings } from '../types';

// Secret JWT - EN PRODUCTION, UTILISER UNE VARIABLE D'ENVIRONNEMENT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Interface pour le payload JWT
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  company_id?: number;
  exp: number;
}

// Interface pour le contexte avec utilisateur authentifié
export interface AuthContext extends Context {
  get(key: 'user'): JWTPayload;
  set(key: 'user', value: JWTPayload): void;
}

/**
 * Génère un token JWT pour un utilisateur
 */
export async function generateToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 heures
  
  return await sign(
    {
      ...payload,
      exp,
    },
    JWT_SECRET
  );
}

/**
 * Middleware: Vérifie le token JWT et extrait l'utilisateur
 * Ajoute l'utilisateur au context dans c.get('user')
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token manquant ou invalide' }, 401);
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const payload = await verify(token, JWT_SECRET) as JWTPayload;

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return c.json({ error: 'Token expiré' }, 401);
    }

    // Vérifier que l'utilisateur est toujours actif
    const user = await c.env.DB.prepare(`
      SELECT id, email, role, company_id, is_active
      FROM users
      WHERE id = ?
    `).bind(payload.userId).first<{
      id: number;
      email: string;
      role: string;
      company_id: number | null;
      is_active: number;
    }>();

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 401);
    }

    if (!user.is_active) {
      return c.json({ error: 'Compte désactivé' }, 403);
    }

    // Ajouter l'utilisateur au context
    c.set('user', {
      userId: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id || undefined,
      exp: payload.exp
    });

    await next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    return c.json({ error: 'Token invalide' }, 401);
  }
}

/**
 * Middleware: Vérifie que l'utilisateur est un admin
 */
export async function requireAdmin(c: Context, next: () => Promise<void>) {
  const user = c.get('user') as JWTPayload;

  if (!user) {
    return c.json({ error: 'Authentification requise' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Accès réservé aux administrateurs' }, 403);
  }

  await next();
}

/**
 * Middleware: Vérifie que l'utilisateur est un employeur
 */
export async function requireEmployer(c: Context, next: () => Promise<void>) {
  const user = c.get('user') as JWTPayload;

  if (!user) {
    return c.json({ error: 'Authentification requise' }, 401);
  }

  if (user.role !== 'employer') {
    return c.json({ error: 'Accès réservé aux employeurs' }, 403);
  }

  await next();
}

/**
 * Middleware: Vérifie que l'utilisateur est un candidat
 */
export async function requireCandidate(c: Context, next: () => Promise<void>) {
  const user = c.get('user') as JWTPayload;

  if (!user) {
    return c.json({ error: 'Authentification requise' }, 401);
  }

  if (user.role !== 'candidate') {
    return c.json({ error: 'Accès réservé aux candidats' }, 403);
  }

  await next();
}

/**
 * Middleware: Vérifie que l'utilisateur est soit l'employeur soit un admin
 */
export async function requireEmployerOrAdmin(c: Context, next: () => Promise<void>) {
  const user = c.get('user') as JWTPayload;

  if (!user) {
    return c.json({ error: 'Authentification requise' }, 401);
  }

  if (user.role !== 'employer' && user.role !== 'admin') {
    return c.json({ error: 'Accès non autorisé' }, 403);
  }

  await next();
}

/**
 * Middleware: Vérifie que l'utilisateur est soit le candidat concerné soit un admin
 */
export async function requireCandidateOrAdmin(c: Context, next: () => Promise<void>) {
  const user = c.get('user') as JWTPayload;

  if (!user) {
    return c.json({ error: 'Authentification requise' }, 401);
  }

  if (user.role !== 'candidate' && user.role !== 'admin') {
    return c.json({ error: 'Accès non autorisé' }, 403);
  }

  await next();
}

/**
 * Utilitaire: Récupère l'utilisateur depuis le context
 */
export function getCurrentUser(c: Context): JWTPayload {
  return c.get('user') as JWTPayload;
}
