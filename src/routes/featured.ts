import { Hono } from 'hono';
import type { Bindings, FeaturedOrderRequest } from '../types';

const featured = new Hono<{ Bindings: Bindings }>();

// Prix pour les emplois vedettes
const FEATURED_PRICES = {
  7: 29.99,   // 7 jours
  15: 49.99,  // 15 jours
  30: 99.99   // 30 jours
};

// Créer une commande d'emploi vedette
featured.post('/order', async (c) => {
  try {
    const body = await c.req.json<FeaturedOrderRequest & { user_id: number }>();
    const { job_offer_id, user_id, duration_days } = body;

    // Vérifier que la durée est valide
    if (![7, 15, 30].includes(duration_days)) {
      return c.json({ error: 'Durée invalide. Choisissez 7, 15 ou 30 jours.' }, 400);
    }

    // Vérifier que l'utilisateur est propriétaire de l'offre
    const job = await c.env.DB.prepare(`
      SELECT jo.*, c.user_id
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      WHERE jo.id = ?
    `).bind(job_offer_id).first<any>();

    if (!job) {
      return c.json({ error: 'Offre d\'emploi non trouvée' }, 404);
    }

    if (job.user_id !== user_id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    if (job.status !== 'active') {
      return c.json({ error: 'L\'offre doit être active pour être mise en vedette' }, 400);
    }

    const amount = FEATURED_PRICES[duration_days as keyof typeof FEATURED_PRICES];

    // Créer la commande
    const result = await c.env.DB.prepare(`
      INSERT INTO featured_orders (job_offer_id, user_id, amount, duration_days, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).bind(job_offer_id, user_id, amount, duration_days).run();

    return c.json({
      success: true,
      order_id: result.meta.last_row_id,
      amount,
      duration_days,
      message: 'Commande créée. Procédez au paiement.'
    }, 201);
  } catch (error) {
    console.error('Erreur création commande vedette:', error);
    return c.json({ error: 'Erreur lors de la création de la commande' }, 500);
  }
});

// Simuler le paiement (en production, utiliser Stripe)
featured.post('/payment/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const body = await c.req.json<{ user_id: number }>();
    const { user_id } = body;

    // Récupérer la commande
    const order = await c.env.DB.prepare(`
      SELECT fo.*, jo.id as job_id, c.user_id
      FROM featured_orders fo
      JOIN job_offers jo ON fo.job_offer_id = jo.id
      JOIN companies c ON jo.company_id = c.id
      WHERE fo.id = ?
    `).bind(orderId).first<any>();

    if (!order) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    if (order.user_id !== user_id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    if (order.status !== 'pending') {
      return c.json({ error: 'Cette commande a déjà été traitée' }, 400);
    }

    // Simuler le paiement réussi
    const paymentIntentId = `pi_demo_${Date.now()}`;
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + order.duration_days);

    // Mettre à jour la commande
    await c.env.DB.prepare(`
      UPDATE featured_orders 
      SET status = 'completed', payment_intent_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(paymentIntentId, orderId).run();

    // Mettre à jour l'offre d'emploi
    await c.env.DB.prepare(`
      UPDATE job_offers 
      SET is_featured = 1, featured_until = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(featuredUntil.toISOString(), order.job_id).run();

    return c.json({
      success: true,
      message: 'Paiement réussi ! Votre offre est maintenant en vedette.',
      featured_until: featuredUntil.toISOString()
    });
  } catch (error) {
    console.error('Erreur paiement:', error);
    return c.json({ error: 'Erreur lors du traitement du paiement' }, 500);
  }
});

// Récupérer les prix
featured.get('/prices', (c) => {
  return c.json({
    prices: [
      { duration_days: 7, price: FEATURED_PRICES[7], label: '7 jours' },
      { duration_days: 15, price: FEATURED_PRICES[15], label: '15 jours' },
      { duration_days: 30, price: FEATURED_PRICES[30], label: '30 jours' }
    ]
  });
});

// Récupérer les commandes d'un employeur
featured.get('/orders/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { results } = await c.env.DB.prepare(`
      SELECT 
        fo.*,
        jo.title as job_title,
        jo.is_featured,
        jo.featured_until
      FROM featured_orders fo
      JOIN job_offers jo ON fo.job_offer_id = jo.id
      JOIN companies c ON jo.company_id = c.id
      WHERE c.user_id = ?
      ORDER BY fo.created_at DESC
    `).bind(userId).all();

    return c.json({ orders: results });
  } catch (error) {
    console.error('Erreur commandes utilisateur:', error);
    return c.json({ error: 'Erreur lors de la récupération des commandes' }, 500);
  }
});

export default featured;
