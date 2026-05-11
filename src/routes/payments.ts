import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireEmployer, getCurrentUser } from '../middleware/auth';

const payments = new Hono<{ Bindings: Bindings }>();

// Créer une session de paiement Stripe - SÉCURISÉ JWT
payments.post('/create-checkout-session', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const user_id = currentUser.userId;
    const body = await c.req.json<{
      pricing_plan_id: number;
      success_url: string;
      cancel_url: string;
    }>();

    const { pricing_plan_id, success_url, cancel_url } = body;

    // Récupérer le plan de tarification
    const plan = await c.env.DB.prepare(`
      SELECT * FROM pricing_plans WHERE id = ? AND is_active = 1
    `).bind(pricing_plan_id).first<any>();

    if (!plan) {
      return c.json({ error: 'Plan de tarification non trouvé' }, 404);
    }

    // Récupérer les informations de l'utilisateur
    const user = await c.env.DB.prepare(`
      SELECT u.*, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      WHERE u.id = ?
    `).bind(user_id).first<any>();

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // En production, utiliser l'API Stripe réelle
    // Pour le développement, simulons la création de session
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Stocker la commande en attente
    const invoiceNumber = `INV-${Date.now()}-${user_id}`;
    
    await c.env.DB.prepare(`
      INSERT INTO plan_purchases (
        user_id, 
        pricing_plan_id, 
        stripe_payment_intent_id, 
        amount, 
        currency, 
        credits_purchased, 
        unlimited_until,
        status,
        invoice_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user_id,
      pricing_plan_id,
      sessionId,
      plan.price,
      'CAD',
      plan.credits || null,
      plan.duration_days ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString() : null,
      'pending',
      invoiceNumber
    ).run();

    // Retourner l'URL de paiement simulée
    return c.json({
      sessionId,
      checkoutUrl: `/api/payments/checkout/${sessionId}`,
      message: 'Session de paiement créée (mode développement)'
    });

  } catch (error) {
    console.error('Erreur création session:', error);
    return c.json({ error: 'Erreur lors de la création de la session de paiement' }, 500);
  }
});

// Simuler une page de paiement (développement uniquement)
payments.get('/checkout/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // Récupérer la commande
  const purchase = await c.env.DB.prepare(`
    SELECT pp.*, p.name as plan_name, p.description as plan_description, u.email, u.first_name, u.last_name
    FROM plan_purchases pp
    JOIN pricing_plans p ON pp.pricing_plan_id = p.id
    JOIN users u ON pp.user_id = u.id
    WHERE pp.stripe_payment_intent_id = ?
  `).bind(sessionId).first<any>();

  if (!purchase) {
    return c.html('<h1>Session de paiement introuvable</h1>');
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Paiement - ${purchase.plan_name}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-8">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Simulateur de paiement</h1>
        
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 class="font-bold text-lg mb-2">${purchase.plan_name}</h2>
          <p class="text-gray-600 mb-2">${purchase.plan_description}</p>
          <p class="text-3xl font-bold text-blue-600">${purchase.amount.toFixed(2)} $</p>
        </div>

        <div class="mb-6">
          <p class="text-sm text-gray-600 mb-2"><strong>Client:</strong> ${purchase.first_name} ${purchase.last_name}</p>
          <p class="text-sm text-gray-600"><strong>Email:</strong> ${purchase.email}</p>
        </div>

        <div class="space-y-3">
          <button onclick="completePurchase('succeeded')" 
                  class="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
            ✓ Simuler paiement réussi
          </button>
          <button onclick="completePurchase('failed')" 
                  class="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
            ✗ Simuler paiement échoué
          </button>
        </div>

        <p class="text-xs text-gray-500 mt-6 text-center">Mode développement - En production, Stripe gérera le paiement</p>
      </div>

      <script>
        async function completePurchase(status) {
          try {
            const response = await fetch('/api/payments/complete/${sessionId}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            if (data.success) {
              alert('Paiement ' + (status === 'succeeded' ? 'réussi' : 'échoué') + ' !');
              window.location.href = '/employeur/login';
            } else {
              alert('Erreur: ' + data.error);
            }
          } catch (error) {
            alert('Erreur: ' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Compléter un paiement (webhook Stripe simulé)
payments.post('/complete/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const body = await c.req.json<{ status: 'succeeded' | 'failed' }>();
    const { status } = body;

    // Récupérer la commande
    const purchase = await c.env.DB.prepare(`
      SELECT * FROM plan_purchases WHERE stripe_payment_intent_id = ?
    `).bind(sessionId).first<any>();

    if (!purchase) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    if (status === 'succeeded') {
      // Mettre à jour le statut de la commande
      await c.env.DB.prepare(`
        UPDATE plan_purchases 
        SET status = 'succeeded', 
            stripe_charge_id = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(`ch_${Date.now()}`, purchase.id).run();

      // Récupérer les crédits actuels
      const currentCredits = await c.env.DB.prepare(`
        SELECT credits_remaining, unlimited_until FROM employer_credits WHERE user_id = ?
      `).bind(purchase.user_id).first<any>();

      const balanceBefore = currentCredits?.credits_remaining || 0;

      if (purchase.credits_purchased) {
        // Ajouter les crédits
        const balanceAfter = balanceBefore + purchase.credits_purchased;

        if (currentCredits) {
          await c.env.DB.prepare(`
            UPDATE employer_credits 
            SET credits_remaining = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).bind(balanceAfter, purchase.user_id).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO employer_credits (user_id, credits_remaining, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `).bind(purchase.user_id, balanceAfter).run();
        }

        // Logger la transaction
        await c.env.DB.prepare(`
          INSERT INTO credit_transactions (
            user_id, 
            transaction_type, 
            credits_amount, 
            balance_before, 
            balance_after,
            pricing_plan_id,
            stripe_payment_intent_id,
            stripe_charge_id,
            amount_paid,
            currency,
            description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          purchase.user_id,
          'purchase',
          purchase.credits_purchased,
          balanceBefore,
          balanceAfter,
          purchase.pricing_plan_id,
          purchase.stripe_payment_intent_id,
          `ch_${Date.now()}`,
          purchase.amount,
          purchase.currency,
          `Achat de forfait: ${purchase.credits_purchased} crédits`
        ).run();
      }

      if (purchase.unlimited_until) {
        // Activer le forfait illimité
        if (currentCredits) {
          await c.env.DB.prepare(`
            UPDATE employer_credits 
            SET unlimited_until = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).bind(purchase.unlimited_until, purchase.user_id).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO employer_credits (user_id, unlimited_until, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `).bind(purchase.user_id, purchase.unlimited_until).run();
        }

        // Logger la transaction
        await c.env.DB.prepare(`
          INSERT INTO credit_transactions (
            user_id, 
            transaction_type, 
            credits_amount, 
            balance_before, 
            balance_after,
            pricing_plan_id,
            stripe_payment_intent_id,
            stripe_charge_id,
            amount_paid,
            currency,
            description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          purchase.user_id,
          'purchase',
          0,
          balanceBefore,
          balanceBefore,
          purchase.pricing_plan_id,
          purchase.stripe_payment_intent_id,
          `ch_${Date.now()}`,
          purchase.amount,
          purchase.currency,
          `Activation forfait illimité jusqu'au ${new Date(purchase.unlimited_until).toLocaleDateString('fr-CA')}`
        ).run();
      }

      // TODO: Envoyer l'email de confirmation avec facture
      // sendInvoiceEmail(purchase);

      return c.json({
        success: true,
        message: 'Paiement complété avec succès',
        credits_added: purchase.credits_purchased,
        unlimited_until: purchase.unlimited_until
      });
    } else {
      // Marquer comme échoué
      await c.env.DB.prepare(`
        UPDATE plan_purchases 
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(purchase.id).run();

      return c.json({
        success: false,
        message: 'Paiement échoué'
      });
    }
  } catch (error) {
    console.error('Erreur completion paiement:', error);
    return c.json({ error: 'Erreur lors de la completion du paiement' }, 500);
  }
});

// Récupérer l'historique des transactions d'un utilisateur
payments.get('/transactions/me', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const userId = currentUser.userId;

    const { results } = await c.env.DB.prepare(`
      SELECT 
        ct.*,
        p.name as plan_name,
        jo.title as job_title
      FROM credit_transactions ct
      LEFT JOIN pricing_plans p ON ct.pricing_plan_id = p.id
      LEFT JOIN job_offers jo ON ct.job_offer_id = jo.id
      WHERE ct.user_id = ?
      ORDER BY ct.created_at DESC
      LIMIT 50
    `).bind(userId).all();

    return c.json({ transactions: results });
  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    return c.json({ error: 'Erreur lors de la récupération des transactions' }, 500);
  }
});

export default payments;
