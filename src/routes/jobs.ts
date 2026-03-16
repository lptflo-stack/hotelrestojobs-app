import { Hono } from 'hono';
import type { Bindings, JobOffer, CreateJobOfferRequest } from '../types';

const jobs = new Hono<{ Bindings: Bindings }>();

// Lister les emplois (avec filtres)
jobs.get('/', async (c) => {
  try {
    const city = c.req.query('city');
    const position_type = c.req.query('position_type');
    const employment_type = c.req.query('employment_type');
    const featured_only = c.req.query('featured');
    const search = c.req.query('search');

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
      query += ' AND jo.city = ?';
      bindings.push(city);
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

    if (search) {
      query += ' AND (jo.title LIKE ? OR jo.description LIKE ?)';
      bindings.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY jo.is_featured DESC, jo.created_at DESC LIMIT 50';

    const stmt = c.env.DB.prepare(query);
    const { results } = await stmt.bind(...bindings).all();

    return c.json({ jobs: results });
  } catch (error) {
    console.error('Erreur liste emplois:', error);
    return c.json({ error: 'Erreur lors de la récupération des emplois' }, 500);
  }
});

// Récupérer un emploi par ID
jobs.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

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

    return c.json(job);
  } catch (error) {
    console.error('Erreur détail emploi:', error);
    return c.json({ error: 'Erreur lors de la récupération de l\'emploi' }, 500);
  }
});

// Créer une offre d'emploi (employeur)
jobs.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateJobOfferRequest & { user_id: number }>();
    const {
      user_id,
      title,
      description,
      position_type,
      employment_type,
      salary_min,
      salary_max,
      salary_type,
      location,
      city,
      province,
      requirements,
      benefits
    } = body;

    // Vérifier que l'utilisateur est un employeur
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(user_id).first<{ role: string }>();

    if (!user || user.role !== 'employer') {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Récupérer l'ID de l'entreprise
    const company = await c.env.DB.prepare(`
      SELECT id FROM companies WHERE user_id = ?
    `).bind(user_id).first<{ id: number }>();

    if (!company) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    // Créer l'offre d'emploi
    const result = await c.env.DB.prepare(`
      INSERT INTO job_offers (
        company_id, title, description, position_type, employment_type,
        salary_min, salary_max, salary_type, location, city, province,
        requirements, benefits, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      company.id,
      title,
      description,
      position_type,
      employment_type,
      salary_min || null,
      salary_max || null,
      salary_type || null,
      location,
      city,
      province,
      requirements || null,
      benefits || null
    ).run();

    return c.json({
      success: true,
      job_id: result.meta.last_row_id,
      message: 'Offre créée et en attente de validation'
    }, 201);
  } catch (error) {
    console.error('Erreur création emploi:', error);
    return c.json({ error: 'Erreur lors de la création de l\'offre' }, 500);
  }
});

// Mettre à jour une offre d'emploi
jobs.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<CreateJobOfferRequest> & { user_id: number }>();
    const { user_id, ...updates } = body;

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const job = await c.env.DB.prepare(`
      SELECT jo.*, c.user_id
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      WHERE jo.id = ?
    `).bind(id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée' }, 404);
    }

    if (job.user_id !== user_id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Construire la requête de mise à jour
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await c.env.DB.prepare(`
      UPDATE job_offers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(...values, id).run();

    return c.json({ success: true, message: 'Offre mise à jour' });
  } catch (error) {
    console.error('Erreur mise à jour emploi:', error);
    return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
  }
});

// Supprimer une offre d'emploi
jobs.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user_id = c.req.query('user_id');

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const job = await c.env.DB.prepare(`
      SELECT jo.*, c.user_id
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      WHERE jo.id = ?
    `).bind(id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre non trouvée' }, 404);
    }

    if (job.user_id !== Number(user_id)) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM job_offers WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Offre supprimée' });
  } catch (error) {
    console.error('Erreur suppression emploi:', error);
    return c.json({ error: 'Erreur lors de la suppression' }, 500);
  }
});

// Récupérer les emplois d'un employeur
jobs.get('/employer/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { results } = await c.env.DB.prepare(`
      SELECT jo.*
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      WHERE c.user_id = ?
      ORDER BY jo.created_at DESC
    `).bind(userId).all();

    return c.json({ jobs: results });
  } catch (error) {
    console.error('Erreur emplois employeur:', error);
    return c.json({ error: 'Erreur lors de la récupération des emplois' }, 500);
  }
});

export default jobs;
