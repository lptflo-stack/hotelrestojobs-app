import { Hono } from 'hono';
import type { Bindings, JobOffer, CreateJobOfferRequest } from '../types';
import { requireAuth, requireEmployer, getCurrentUser } from '../middleware/auth';
import { getJobInLanguage, prepareBilingualJobData, getPreferredLanguage } from '../utils/bilingual';

const jobs = new Hono<{ Bindings: Bindings }>();

// Lister les emplois (avec filtres)
jobs.get('/', async (c) => {
  try {
    const city = c.req.query('city');
    const position_type = c.req.query('position_type');
    const employment_type = c.req.query('employment_type');
    const featured_only = c.req.query('featured');
    const search = c.req.query('search');
    const language = c.req.query('language') as 'fr' | 'en' | undefined;
    
    // Obtenir la langue préférée depuis le header ou le paramètre
    const preferredLang = language || getPreferredLanguage(c.req.header('Accept-Language'));

    let query = `
      SELECT 
        jo.*,
        c.name as company_name,
        c.logo_url as company_logo
      FROM job_offers jo
      LEFT JOIN companies c ON jo.company_id = c.id
      WHERE jo.status = 'active'
    `;
    const bindings: any[] = [];

    if (city) {
      // Recherche flexible : LIKE avec trim et insensible aux accents
      query += ' AND LOWER(TRIM(jo.city)) LIKE LOWER(?)';
      bindings.push(`%${city.trim()}%`);
    }

    if (position_type) {
      query += ' AND jo.position_type = ?';
      bindings.push(position_type);
    }

    if (employment_type) {
      query += ' AND jo.employment_type = ?';
      bindings.push(employment_type);
    }

    if (featured_only === 'true') {
      query += ' AND jo.is_featured = 1 AND jo.featured_until > datetime("now")';
    }
    
    // Filtre par langue de l'offre
    if (language) {
      query += ' AND (jo.job_language = ? OR jo.job_language = ?)';
      bindings.push(language, 'bilingual');
    }

    if (search) {
      // Recherche dans les deux langues + nom d'entreprise + ville
      query += ` AND (
        LOWER(jo.title) LIKE LOWER(?) OR LOWER(jo.description) LIKE LOWER(?) OR 
        LOWER(jo.title_fr) LIKE LOWER(?) OR LOWER(jo.description_fr) LIKE LOWER(?) OR
        LOWER(jo.title_en) LIKE LOWER(?) OR LOWER(jo.description_en) LIKE LOWER(?) OR
        LOWER(c.name) LIKE LOWER(?) OR LOWER(jo.city) LIKE LOWER(?)
      )`;
      const searchPattern = `%${search}%`;
      bindings.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY jo.is_featured DESC, jo.created_at DESC LIMIT 50';

    const stmt = c.env.DB.prepare(query);
    const { results } = await stmt.bind(...bindings).all();
    
    // Adapter les résultats à la langue préférée
    const jobsInLanguage = results.map((job: any) => getJobInLanguage(job, preferredLang));

    return c.json({ jobs: jobsInLanguage });
  } catch (error) {
    console.error('Erreur liste emplois:', error);
    return c.json({ error: 'Erreur lors de la récupération des emplois' }, 500);
  }
});

// Récupérer un emploi par ID
jobs.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const language = c.req.query('language') as 'fr' | 'en' | undefined;
    const preferredLang = language || getPreferredLanguage(c.req.header('Accept-Language'));

    const job = await c.env.DB.prepare(`
      SELECT 
        jo.*,
        c.name as company_name,
        c.description as company_description,
        c.website as company_website,
        c.logo_url as company_logo
      FROM job_offers jo
      LEFT JOIN companies c ON jo.company_id = c.id
      WHERE jo.id = ?
    `).bind(id).first();

    if (!job) {
      return c.json({ error: 'Offre d\'emploi non trouvée' }, 404);
    }

    // Incrémenter le compteur de vues
    await c.env.DB.prepare(`
      UPDATE job_offers SET views_count = views_count + 1 WHERE id = ?
    `).bind(id).run();
    
    // Retourner l'offre dans la langue appropriée
    const jobInLanguage = getJobInLanguage(job, preferredLang);

    return c.json({ job: jobInLanguage });
  } catch (error) {
    console.error('Erreur détail emploi:', error);
    return c.json({ error: 'Erreur lors de la récupération de l\'emploi' }, 500);
  }
});

// Créer une offre d'emploi (employeur) - SÉCURISÉ JWT
jobs.post('/', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const user_id = currentUser.userId;
    
    const body = await c.req.json<CreateJobOfferRequest>();
    
    // Préparer les données bilingues
    const bilingualData = prepareBilingualJobData(body);
    
    const {
      position_type,
      employment_type,
      salary_min,
      salary_max,
      salary_type,
      location,
      city,
      province
    } = body;

    // Récupérer company_id depuis le token JWT
    if (!currentUser.company_id) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    const company_id = currentUser.company_id;

    // IMPORTANT: Vérifier les crédits AVANT de créer l'annonce
    const credits = await c.env.DB.prepare(`
      SELECT credits_remaining, unlimited_until
      FROM employer_credits
      WHERE user_id = ?
    `).bind(user_id).first<any>();

    const hasUnlimited = credits?.unlimited_until && new Date(credits.unlimited_until) > new Date();
    const hasCredits = credits && credits.credits_remaining > 0;

    if (!hasUnlimited && !hasCredits) {
      return c.json({ 
        error: 'Crédits insuffisants. Vous devez acheter un forfait pour publier une annonce.',
        credits_remaining: credits?.credits_remaining || 0,
        needs_purchase: true
      }, 400);
    }

    // Calculer la date d'expiration (30 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Créer l'offre d'emploi avec statut 'active' et colonnes bilingues
    const result = await c.env.DB.prepare(`
      INSERT INTO job_offers (
        company_id, employer_id, job_language,
        title, description, requirements, benefits,
        title_fr, title_en, description_fr, description_en,
        requirements_fr, requirements_en, benefits_fr, benefits_en,
        position_type, employment_type,
        salary_min, salary_max, salary_type, location, city, province,
        status, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).bind(
      company_id,
      user_id,
      bilingualData.job_language,
      bilingualData.title,
      bilingualData.description,
      bilingualData.requirements || null,
      bilingualData.benefits || null,
      bilingualData.title_fr || null,
      bilingualData.title_en || null,
      bilingualData.description_fr || null,
      bilingualData.description_en || null,
      bilingualData.requirements_fr || null,
      bilingualData.requirements_en || null,
      bilingualData.benefits_fr || null,
      bilingualData.benefits_en || null,
      position_type,
      employment_type,
      salary_min || null,
      salary_max || null,
      salary_type || null,
      location,
      city,
      province,
      expiresAt.toISOString()
    ).run();

    const jobId = result.meta.last_row_id;

    // Déduire 1 crédit si pas de forfait illimité
    if (!hasUnlimited) {
      const balanceBefore = credits.credits_remaining;
      const balanceAfter = balanceBefore - 1;

      await c.env.DB.prepare(`
        UPDATE employer_credits
        SET credits_remaining = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(balanceAfter, user_id).run();

      // Enregistrer la transaction
      await c.env.DB.prepare(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, credits_amount, balance_before, balance_after,
          job_offer_id, description
        ) VALUES (?, 'deduction', ?, ?, ?, ?, ?)
      `).bind(
        user_id,
        -1,
        balanceBefore,
        balanceAfter,
        jobId,
        `Publication de l'annonce: ${bilingualData.title}`
      ).run();
    }

    // Créer les notifications d'expiration
    const notifications = [
      { type: 'warning_7days', days: 23 },  // 30 - 7 = 23 jours
      { type: 'warning_3days', days: 27 },  // 30 - 3 = 27 jours
      { type: 'expired', days: 30 }
    ];

    for (const notif of notifications) {
      await c.env.DB.prepare(`
        INSERT INTO expiration_notifications (
          user_id, job_offer_id, notification_type
        ) VALUES (?, ?, ?)
      `).bind(user_id, jobId, notif.type).run();
    }

    return c.json({
      success: true,
      job_id: jobId,
      message: 'Annonce publiée avec succès !',
      expires_at: expiresAt.toISOString(),
      credits_remaining: hasUnlimited ? 'unlimited' : (credits.credits_remaining - 1)
    }, 201);
  } catch (error) {
    console.error('Erreur création emploi:', error);
    return c.json({ error: 'Erreur lors de la création de l\'offre' }, 500);
  }
});

// Mettre à jour une offre d'emploi - SÉCURISÉ JWT
jobs.put('/:id', requireAuth, requireEmployer, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getCurrentUser(c);
    const body = await c.req.json<Partial<CreateJobOfferRequest>>();

    // Vérifier que l'utilisateur est propriétaire de l'offre via company_id
    const job = await c.env.DB.prepare(`
      SELECT jo.*
      FROM job_offers jo
      WHERE jo.id = ? AND jo.company_id = ?
    `).bind(id, currentUser.company_id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée ou non autorisée' }, 404);
    }

    // Préparer les données bilingues
    const bilingualData = prepareBilingualJobData(body);
    
    // Fusionner avec les données non-bilingues
    const updateData: any = {
      ...body,
      ...bilingualData
    };
    
    // Retirer les champs non autorisés à la mise à jour
    delete updateData.company_id;
    delete updateData.employer_id;
    delete updateData.status;
    delete updateData.created_at;

    // Construire la requête de mise à jour
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    await c.env.DB.prepare(`
      UPDATE job_offers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(...values, id).run();

    return c.json({ success: true, message: 'Offre mise à jour' });
  } catch (error) {
    console.error('Erreur mise à jour emploi:', error);
    return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
  }
});

// Supprimer une offre d'emploi - SÉCURISÉ JWT
jobs.delete('/:id', requireAuth, requireEmployer, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getCurrentUser(c);

    // Vérifier que l'utilisateur est propriétaire de l'offre via company_id
    const job = await c.env.DB.prepare(`
      SELECT jo.*
      FROM job_offers jo
      WHERE jo.id = ? AND jo.company_id = ?
    `).bind(id, currentUser.company_id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée ou non autorisée' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM job_offers WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Offre supprimée' });
  } catch (error) {
    console.error('Erreur suppression emploi:', error);
    return c.json({ error: 'Erreur lors de la suppression' }, 500);
  }
});

// Récupérer les emplois d'un employeur - SÉCURISÉ JWT
jobs.get('/employer/me', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);

    const { results } = await c.env.DB.prepare(`
      SELECT jo.*
      FROM job_offers jo
      WHERE jo.company_id = ?
      ORDER BY jo.created_at DESC
    `).bind(currentUser.company_id).all();

    return c.json({ jobs: results });
  } catch (error) {
    console.error('Erreur emplois employeur:', error);
    return c.json({ error: 'Erreur lors de la récupération des emplois' }, 500);
  }
});

// Republier une annonce expirée - SÉCURISÉ JWT
jobs.post('/:id/republish', requireAuth, requireEmployer, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getCurrentUser(c);
    const user_id = currentUser.userId;

    // Vérifier que l'offre existe et appartient à l'utilisateur
    const job = await c.env.DB.prepare(`
      SELECT jo.*
      FROM job_offers jo
      WHERE jo.id = ? AND jo.company_id = ?
    `).bind(id, currentUser.company_id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée ou non autorisée' }, 404);
    }

    // Vérifier que l'annonce est expirée
    if (job.status !== 'expired') {
      return c.json({ error: 'Seules les annonces expirées peuvent être republiées' }, 400);
    }

    // Vérifier les crédits de l'employeur
    const credits = await c.env.DB.prepare(`
      SELECT credits_remaining, unlimited_until
      FROM employer_credits
      WHERE user_id = ?
    `).bind(user_id).first<any>();

    const hasUnlimited = credits?.unlimited_until && new Date(credits.unlimited_until) > new Date();
    const hasCredits = credits && credits.credits_remaining > 0;

    if (!hasUnlimited && !hasCredits) {
      return c.json({ error: 'Crédits insuffisants' }, 400);
    }

    // Remettre le statut à 'active' (pas de validation) et recalculer la date d'expiration
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await c.env.DB.prepare(`
      UPDATE job_offers
      SET status = 'active',
          expires_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newExpiresAt.toISOString(), id).run();

    // Déduire 1 crédit si pas de forfait illimité
    if (!hasUnlimited) {
      const balanceBefore = credits.credits_remaining;
      const balanceAfter = balanceBefore - 1;

      await c.env.DB.prepare(`
        UPDATE employer_credits
        SET credits_remaining = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(balanceAfter, user_id).run();

      // Logger la transaction
      await c.env.DB.prepare(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, credits_amount, balance_before, balance_after,
          job_offer_id, description
        ) VALUES (?, 'deduction', ?, ?, ?, ?, ?)
      `).bind(
        user_id,
        -1,
        balanceBefore,
        balanceAfter,
        id,
        `Republication de l'annonce: ${job.title}`
      ).run();
    }

    return c.json({ 
      success: true, 
      message: 'Annonce republiée avec succès',
      expires_at: newExpiresAt.toISOString()
    });
  } catch (error) {
    console.error('Erreur republication emploi:', error);
    return c.json({ error: 'Erreur lors de la republication' }, 500);
  }
});

// Modifier une offre d'emploi (employeur) - SÉCURISÉ JWT
jobs.put('/:id', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const user_id = currentUser.userId;
    const id = c.req.param('id');

    // Vérifier que l'offre appartient à l'employeur
    const job = await c.env.DB.prepare(`
      SELECT * FROM job_offers WHERE id = ? AND employer_id = ?
    `).bind(id, user_id).first();

    if (!job) {
      return c.json({ error: 'Offre non trouvée ou accès refusé' }, 404);
    }

    const data: CreateJobOfferRequest = await c.req.json();

    // Mise à jour de l'offre
    await c.env.DB.prepare(`
      UPDATE job_offers
      SET title = ?,
          description = ?,
          position_type = ?,
          employment_type = ?,
          salary_min = ?,
          salary_max = ?,
          salary_type = ?,
          location = ?,
          city = ?,
          province = ?,
          requirements = ?,
          benefits = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.title,
      data.description,
      data.position_type,
      data.employment_type,
      data.salary_min,
      data.salary_max,
      data.salary_type,
      data.location,
      data.city,
      data.province,
      data.requirements,
      data.benefits,
      id
    ).run();

    return c.json({ 
      success: true, 
      message: 'Offre modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur modification emploi:', error);
    return c.json({ error: 'Erreur lors de la modification de l\'offre' }, 500);
  }
});

export default jobs;
