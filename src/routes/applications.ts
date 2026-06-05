import { Hono } from 'hono';
import type { Bindings, Application, CreateApplicationRequest } from '../types';
import { requireAuth, requireCandidate, requireEmployer, getCurrentUser } from '../middleware/auth';

const applications = new Hono<{ Bindings: Bindings }>();

// Créer une candidature - SÉCURISÉ JWT
applications.post('/', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const user_id = currentUser.userId;
    const body = await c.req.json<CreateApplicationRequest>();
    const { job_offer_id, cover_letter } = body;

    // Vérifier que l'offre existe et est active
    const job = await c.env.DB.prepare(`
      SELECT id FROM job_offers WHERE id = ? AND status = 'active'
    `).bind(job_offer_id).first();

    if (!job) {
      return c.json({ error: 'Offre d\'emploi non trouvée ou inactive' }, 404);
    }

    // Vérifier que le candidat n'a pas déjà postulé
    const existing = await c.env.DB.prepare(`
      SELECT id FROM applications WHERE job_offer_id = ? AND user_id = ?
    `).bind(job_offer_id, user_id).first();

    if (existing) {
      return c.json({ error: 'Vous avez déjà postulé à cette offre' }, 409);
    }

    // Récupérer le CV du profil candidat
    const profile = await c.env.DB.prepare(`
      SELECT resume_url FROM candidate_profiles WHERE user_id = ?
    `).bind(user_id).first<{ resume_url?: string }>();

    // Créer la candidature
    const result = await c.env.DB.prepare(`
      INSERT INTO applications (job_offer_id, user_id, cover_letter, resume_url, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).bind(job_offer_id, user_id, cover_letter || null, profile?.resume_url || null).run();

    // Incrémenter le compteur de candidatures
    await c.env.DB.prepare(`
      UPDATE job_offers SET applications_count = applications_count + 1 WHERE id = ?
    `).bind(job_offer_id).run();

    return c.json({
      success: true,
      application_id: result.meta.last_row_id,
      message: 'Candidature envoyée avec succès'
    }, 201);
  } catch (error) {
    console.error('Erreur création candidature:', error);
    return c.json({ error: 'Erreur lors de l\'envoi de la candidature' }, 500);
  }
});

// Récupérer les candidatures d'un candidat - SÉCURISÉ JWT
applications.get('/candidate/me', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const userId = currentUser.userId;

    const { results } = await c.env.DB.prepare(`
      SELECT 
        a.*,
        jo.title as job_title,
        jo.city as job_city,
        jo.employment_type,
        c.name as company_name
      FROM applications a
      JOIN job_offers jo ON a.job_offer_id = jo.id
      JOIN companies c ON jo.company_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `).bind(userId).all();

    return c.json({ applications: results });
  } catch (error) {
    console.error('Erreur candidatures candidat:', error);
    return c.json({ error: 'Erreur lors de la récupération des candidatures' }, 500);
  }
});

// Récupérer les candidatures pour une offre (employeur) - SÉCURISÉ JWT
applications.get('/job/:jobId', requireAuth, requireEmployer, async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const currentUser = getCurrentUser(c);

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const job = await c.env.DB.prepare(`
      SELECT jo.*
      FROM job_offers jo
      WHERE jo.id = ? AND jo.company_id = ?
    `).bind(jobId, currentUser.company_id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée ou non autorisée' }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        cp.bio,
        cp.experience_years,
        cp.desired_salary_min,
        cp.desired_salary_max,
        a.ai_score,
        a.ai_analyzed_at
      FROM applications a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE a.job_offer_id = ?
      ORDER BY 
        CASE WHEN a.ai_score IS NOT NULL THEN a.ai_score ELSE -1 END DESC,
        a.created_at DESC
    `).bind(jobId).all();

    return c.json({ applications: results });
  } catch (error) {
    console.error('Erreur candidatures emploi:', error);
    return c.json({ error: 'Erreur lors de la récupération des candidatures' }, 500);
  }
});

// Mettre à jour le statut d'une candidature (employeur) - SÉCURISÉ JWT
applications.put('/:id/status', requireAuth, requireEmployer, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getCurrentUser(c);
    const body = await c.req.json<{ status: string; employer_notes?: string }>();
    const { status, employer_notes } = body;

    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Statut invalide' }, 400);
    }

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const application = await c.env.DB.prepare(`
      SELECT a.*, jo.id as job_id
      FROM applications a
      JOIN job_offers jo ON a.job_offer_id = jo.id
      WHERE a.id = ? AND jo.company_id = ?
    `).bind(id, currentUser.company_id).first<any>();

    if (!application) {
      return c.json({ error: 'Candidature non trouvée ou non autorisée' }, 404);
    }

    await c.env.DB.prepare(`
      UPDATE applications 
      SET status = ?, employer_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, employer_notes || null, id).run();

    return c.json({ success: true, message: 'Statut mis à jour' });
  } catch (error) {
    console.error('Erreur mise à jour candidature:', error);
    return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
  }
});

// Retirer une candidature (candidat) - SÉCURISÉ JWT
applications.delete('/:id', requireAuth, requireCandidate, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getCurrentUser(c);

    // Vérifier que l'utilisateur est propriétaire de la candidature
    const application = await c.env.DB.prepare(`
      SELECT user_id, job_offer_id FROM applications WHERE id = ? AND user_id = ?
    `).bind(id, currentUser.userId).first<{ user_id: number; job_offer_id: number }>();

    if (!application) {
      return c.json({ error: 'Candidature non trouvée ou non autorisée' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM applications WHERE id = ?').bind(id).run();

    // Décrémenter le compteur
    await c.env.DB.prepare(`
      UPDATE job_offers SET applications_count = applications_count - 1 WHERE id = ?
    `).bind(application.job_offer_id).run();

    return c.json({ success: true, message: 'Candidature retirée' });
  } catch (error) {
    console.error('Erreur suppression candidature:', error);
    return c.json({ error: 'Erreur lors de la suppression' }, 500);
  }
});

export default applications;
