/**
 * Système Anti-Abus pour les Inscriptions Employeur
 * Empêche la création de multiples comptes pour obtenir des crédits gratuits
 */

import type { D1Database } from '@cloudflare/workers-types';

/**
 * Vérifier si une IP a dépassé la limite d'inscriptions
 * Limite: 3 inscriptions par IP par 24h
 */
export async function checkIPRateLimit(db: D1Database, ipAddress: string): Promise<{
  allowed: boolean;
  count: number;
  message?: string;
}> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const result = await db.prepare(`
    SELECT COUNT(*) as count
    FROM employer_registrations_audit
    WHERE ip_address = ?
    AND created_at > ?
  `).bind(ipAddress, twentyFourHoursAgo).first<{ count: number }>();

  const count = result?.count || 0;
  const MAX_REGISTRATIONS_PER_IP = 3;

  if (count >= MAX_REGISTRATIONS_PER_IP) {
    return {
      allowed: false,
      count,
      message: `Limite d'inscriptions atteinte pour cette adresse IP. Maximum ${MAX_REGISTRATIONS_PER_IP} inscriptions par 24h. Veuillez réessayer plus tard ou contactez-nous si vous avez besoin d'aide.`
    };
  }

  return { allowed: true, count };
}

/**
 * Vérifier si un nom d'entreprise similaire existe déjà
 * Utilise une comparaison approximative pour détecter les variantes
 */
export async function checkSimilarCompanyName(db: D1Database, companyName: string): Promise<{
  exists: boolean;
  similarName?: string;
  message?: string;
}> {
  // Normaliser le nom: minuscules, sans espaces multiples, sans caractères spéciaux
  const normalized = companyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/gi, '');

  // Rechercher noms similaires (avec LIKE approximatif)
  const result = await db.prepare(`
    SELECT name
    FROM companies
    WHERE LOWER(REPLACE(REPLACE(name, ' ', ''), '-', '')) = ?
    LIMIT 1
  `).bind(normalized.replace(/\s/g, '')).first<{ name: string }>();

  if (result) {
    return {
      exists: true,
      similarName: result.name,
      message: `Une entreprise avec un nom similaire "${result.name}" existe déjà. Si c'est votre entreprise, veuillez vous connecter avec votre compte existant.`
    };
  }

  return { exists: false };
}

/**
 * Enregistrer une nouvelle inscription dans l'audit
 */
export async function logRegistration(
  db: D1Database,
  userId: number,
  email: string,
  ipAddress: string | null,
  userAgent: string | null,
  companyName: string
): Promise<void> {
  await db.prepare(`
    INSERT INTO employer_registrations_audit
    (user_id, email, ip_address, user_agent, company_name)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    userId,
    email,
    ipAddress || 'unknown',
    userAgent || 'unknown',
    companyName
  ).run();
}

/**
 * Attribuer le crédit gratuit initial (1 crédit)
 * Uniquement si c'est la première inscription de l'employeur
 */
export async function grantFreeInitialCredit(
  db: D1Database,
  userId: number
): Promise<{ success: boolean; message: string }> {
  // Vérifier si l'utilisateur a déjà utilisé son crédit gratuit
  const existing = await db.prepare(`
    SELECT first_free_credit_used
    FROM employer_credits
    WHERE user_id = ?
  `).bind(userId).first<{ first_free_credit_used: number }>();

  if (existing && existing.first_free_credit_used === 1) {
    return {
      success: false,
      message: 'Le crédit gratuit a déjà été utilisé pour ce compte.'
    };
  }

  // Créer ou mettre à jour l'entrée credits
  if (existing) {
    // Mettre à jour
    await db.prepare(`
      UPDATE employer_credits
      SET credits_remaining = credits_remaining + 1,
          first_free_credit_used = 1
      WHERE user_id = ?
    `).bind(userId).run();
  } else {
    // Créer nouvelle entrée
    await db.prepare(`
      INSERT INTO employer_credits (user_id, credits_remaining, first_free_credit_used)
      VALUES (?, 1, 1)
    `).bind(userId).run();
  }

  return {
    success: true,
    message: '✅ Félicitations ! Vous avez reçu 1 crédit gratuit pour publier votre première offre d\'emploi.'
  };
}

/**
 * Extraire l'adresse IP de la requête
 * Prend en compte les proxies (CF-Connecting-IP, X-Forwarded-For)
 */
export function getClientIP(request: Request): string | null {
  // Cloudflare fournit l'IP réelle via CF-Connecting-IP
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;

  // Fallback sur X-Forwarded-For
  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback sur X-Real-IP
  const realIP = request.headers.get('X-Real-IP');
  if (realIP) return realIP;

  return null;
}

/**
 * Obtenir le User-Agent de la requête
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('User-Agent');
}

/**
 * Vérification complète anti-abus lors de l'inscription
 */
export async function validateNewEmployerRegistration(
  db: D1Database,
  request: Request,
  email: string,
  companyName: string
): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // 1. Vérifier limite IP
  const ipAddress = getClientIP(request);
  if (ipAddress) {
    const ipCheck = await checkIPRateLimit(db, ipAddress);
    if (!ipCheck.allowed) {
      errors.push(ipCheck.message!);
    }
  }

  // 2. Vérifier email unique (déjà fait dans auth.ts mais on double-check)
  const existingEmail = await db.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first();

  if (existingEmail) {
    errors.push('Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.');
  }

  // 3. Vérifier nom d'entreprise similaire
  const companyCheck = await checkSimilarCompanyName(db, companyName);
  if (companyCheck.exists) {
    errors.push(companyCheck.message!);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
