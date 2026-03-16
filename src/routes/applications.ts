import { Hono } from 'hono';
import type { Bindings, Application, CreateApplicationRequest } from '../types';

const applications = new Hono<{ Bindings: Bindings }>();

// Créer une candidature
applications.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateApplicationRequest & { user_id: number }>();
    const { job_offer_id, user_id, cover_letter } = body;

    // Vérifier que l'utilisateur est un candidat
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(user_id).first<{ role: string }>();

    if (!user || user.role !== 'candidate') {
      return c.json({ error: 'Non autorisé - vous devez être candidat' }, 403);
    }

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

// Récupérer les candidatures d'un candidat
applications.get('/candidate/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

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

// Récupérer les candidatures pour une offre (employeur)
applications.get('/job/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const userId = c.req.query('user_id');

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const job = await c.env.DB.prepare(`
      SELECT jo.*, c.user_id
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      WHERE jo.id = ?
    `).bind(jobId).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée' }, 404);
    }

    if (job.user_id !== Number(userId)) {
      return c.json({ error: 'Non autorisé' }, 403);
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
        cp.desired_salary_max
      FROM applications a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE a.job_offer_id = ?
      ORDER BY a.created_at DESC
    `).bind(jobId).all();

    return c.json({ applications: results });
  } catch (error) {
    console.error('Erreur candidatures emploi:', error);
    return c.json({ error: 'Erreur lors de la récupération des candidatures' }, 500);
  }
});

// Mettre à jour le statut d'une candidature (employeur)
applications.put('/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<{ user_id: number; status: string; employer_notes?: string }>();
    const { user_id, status, employer_notes } = body;

    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Statut invalide' }, 400);
    }

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const application = await c.env.DB.prepare(`
      SELECT a.*, jo.id as job_id, c.user_id
      FROM applications a
      JOIN job_offers jo ON a.job_offer_id = jo.id
      JOIN companies c ON jo.company_id = c.id
      WHERE a.id = ?
    `).bind(id).first<any>();

    if (!application) {
      return c.json({ error: 'Candidature non trouvée' }, 404);
    }

    if (application.user_id !== user_id) {
      return c.json({ error: 'Non autorisé' }, 403);
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

// Retirer une candidature (candidat)
applications.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user_id = c.req.query('user_id');

    // Vérifier que l'utilisateur est propriétaire de la candidature
    const application = await c.env.DB.prepare(`
      SELECT user_id, job_offer_id FROM applications WHERE id = ?
    `).bind(id).first<{ user_id: number; job_offer_id: number }>();

    if (!application) {
      return c.json({ error: 'Candidature non trouvée' }, 404);
    }

    if (application.user_id !== Number(user_id)) {
      return c.json({ error: 'Non autorisé' }, 403);
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
