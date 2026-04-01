import { Hono } from 'hono';
import type { Bindings } from '../types';

const pricing = new Hono<{ Bindings: Bindings }>();

// Récupérer tous les tarifs
pricing.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM pricing_plans WHERE is_active = 1 ORDER BY price ASC
    `).all();

    return c.json({ plans: results });
  } catch (error) {
    console.error('Erreur récupération tarifs:', error);
    return c.json({ error: 'Erreur lors de la récupération des tarifs' }, 500);
  }
});

// Récupérer un tarif par ID (admin)
pricing.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const plan = await c.env.DB.prepare(`
      SELECT * FROM pricing_plans WHERE id = ?
    `).bind(id).first();

    if (!plan) {
      return c.json({ error: 'Tarif non trouvé' }, 404);
    }

    return c.json(plan);
  } catch (error) {
    console.error('Erreur récupération tarif:', error);
    return c.json({ error: 'Erreur lors de la récupération du tarif' }, 500);
  }
});

// Créer un nouveau tarif (admin)
pricing.post('/', async (c) => {
  try {
    const user_id = c.req.query('user_id');
    
    // Vérifier que c'est un admin
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(user_id).first<{ role: string }>();

    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Non autorisé - accès admin requis' }, 403);
    }

    const body = await c.req.json<{
      name: string;
      type: string;
      credits?: number;
      price: number;
      duration_days?: number;
      description?: string;
    }>();

    const { name, type, credits, price, duration_days, description } = body;

    // Validation
    if (!name || !type || !price) {
      return c.json({ error: 'Champs requis manquants' }, 400);
    }

    if (!['single', 'credits', 'unlimited'].includes(type)) {
      return c.json({ error: 'Type invalide' }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO pricing_plans (name, type, credits, price, duration_days, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, type, credits || null, price, duration_days || null, description || null).run();

    return c.json({
      success: true,
      plan_id: result.meta.last_row_id,
      message: 'Tarif créé avec succès'
    }, 201);
  } catch (error) {
    console.error('Erreur création tarif:', error);
    return c.json({ error: 'Erreur lors de la création du tarif' }, 500);
  }
});

// Mettre à jour un tarif (admin)
pricing.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user_id = c.req.query('user_id');
    
    // Vérifier que c'est un admin
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(user_id).first<{ role: string }>();

    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Non autorisé - accès admin requis' }, 403);
    }

    const body = await c.req.json<{
      name?: string;
      type?: string;
      credits?: number;
      price?: number;
      duration_days?: number;
      description?: string;
      is_active?: number;
    }>();

    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.type !== undefined) {
      updates.push('type = ?');
      values.push(body.type);
    }
    if (body.credits !== undefined) {
      updates.push('credits = ?');
      values.push(body.credits);
    }
    if (body.price !== undefined) {
      updates.push('price = ?');
      values.push(body.price);
    }
    if (body.duration_days !== undefined) {
      updates.push('duration_days = ?');
      values.push(body.duration_days);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active);
    }

    if (updates.length === 0) {
      return c.json({ error: 'Aucune donnée à mettre à jour' }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await c.env.DB.prepare(`
      UPDATE pricing_plans SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    return c.json({ success: true, message: 'Tarif mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour tarif:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du tarif' }, 500);
  }
});

// Supprimer un tarif (admin)
pricing.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user_id = c.req.query('user_id');
    
    // Vérifier que c'est un admin
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(user_id).first<{ role: string }>();

    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Non autorisé - accès admin requis' }, 403);
    }

    // Plutôt que de supprimer, on désactive
    await c.env.DB.prepare(`
      UPDATE pricing_plans SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return c.json({ success: true, message: 'Tarif désactivé avec succès' });
  } catch (error) {
    console.error('Erreur suppression tarif:', error);
    return c.json({ error: 'Erreur lors de la suppression du tarif' }, 500);
  }
});

// Récupérer les crédits d'un employeur
pricing.get('/credits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const credits = await c.env.DB.prepare(`
      SELECT * FROM employer_credits WHERE user_id = ?
    `).bind(userId).first();

    if (!credits) {
      // Créer une entrée par défaut
      await c.env.DB.prepare(`
        INSERT INTO employer_credits (user_id, credits_remaining) VALUES (?, 0)
      `).bind(userId).run();
      
      return c.json({ credits_remaining: 0, unlimited_until: null });
    }

    return c.json(credits);
  } catch (error) {
    console.error('Erreur récupération crédits:', error);
    return c.json({ error: 'Erreur lors de la récupération des crédits' }, 500);
  }
});

// Récupérer les transactions d'un employeur
pricing.get('/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        ct.*,
        jo.title as job_title,
        pp.name as plan_name
      FROM credit_transactions ct
      LEFT JOIN job_offers jo ON ct.job_offer_id = jo.id
      LEFT JOIN pricing_plans pp ON ct.pricing_plan_id = pp.id
      WHERE ct.user_id = ?
      ORDER BY ct.created_at DESC
    `).bind(userId).all();

    return c.json({ transactions: results });
  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    return c.json({ error: 'Erreur lors de la récupération des transactions' }, 500);
  }
});

export default pricing;
