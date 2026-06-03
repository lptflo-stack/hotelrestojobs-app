import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireAdmin, requireCandidate, getCurrentUser } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

// ===== NEWSLETTER ROUTES (Admin) =====

// Lister toutes les newsletters (admin)
app.get('/', requireAuth, requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        n.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM newsletters n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `).all();
    
    return c.json({ newsletters: results });
  } catch (error) {
    console.error('Erreur liste newsletters:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer une newsletter (admin)
app.get('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Récupérer la newsletter
    const newsletter = await c.env.DB.prepare(`
      SELECT 
        n.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM newsletters n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = ?
    `).bind(id).first();
    
    if (!newsletter) {
      return c.json({ error: 'Newsletter non trouvée' }, 404);
    }
    
    // Récupérer les articles associés
    const { results: articles } = await c.env.DB.prepare(`
      SELECT 
        nba.display_order,
        bp.*
      FROM newsletter_blog_articles nba
      JOIN blog_posts bp ON nba.blog_post_id = bp.id
      WHERE nba.newsletter_id = ?
      ORDER BY nba.display_order ASC
    `).bind(id).all();
    
    return c.json({ 
      newsletter,
      articles 
    });
  } catch (error) {
    console.error('Erreur récupération newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Créer une newsletter (admin)
app.post('/', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const { title, subject, preview_text, template_type, article_ids } = await c.req.json();
    
    // Validation
    if (!title || !subject) {
      return c.json({ error: 'Titre et sujet requis' }, 400);
    }
    
    // Créer la newsletter
    const result = await c.env.DB.prepare(`
      INSERT INTO newsletters 
      (title, subject, preview_text, template_type, created_by, status)
      VALUES (?, ?, ?, ?, ?, 'draft')
    `).bind(
      title,
      subject,
      preview_text || null,
      template_type || 'mixed',
      currentUser.userId
    ).run();
    
    const newsletterId = result.meta.last_row_id;
    
    // Associer les articles si fournis
    if (article_ids && Array.isArray(article_ids) && article_ids.length > 0) {
      for (let i = 0; i < article_ids.length; i++) {
        await c.env.DB.prepare(`
          INSERT INTO newsletter_blog_articles (newsletter_id, blog_post_id, display_order)
          VALUES (?, ?, ?)
        `).bind(newsletterId, article_ids[i], i).run();
      }
    }
    
    return c.json({
      success: true,
      newsletter_id: newsletterId,
      message: 'Newsletter créée'
    });
  } catch (error) {
    console.error('Erreur création newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Mettre à jour une newsletter (admin)
app.put('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const { title, subject, preview_text, template_type, status, article_ids } = await c.req.json();
    
    // Vérifier que la newsletter existe
    const existing = await c.env.DB.prepare(
      'SELECT id, status FROM newsletters WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Newsletter non trouvée' }, 404);
    }
    
    // Ne pas permettre modification si déjà envoyée
    if (existing.status === 'sent') {
      return c.json({ error: 'Impossible de modifier une newsletter déjà envoyée' }, 400);
    }
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (subject !== undefined) {
      updates.push('subject = ?');
      params.push(subject);
    }
    if (preview_text !== undefined) {
      updates.push('preview_text = ?');
      params.push(preview_text);
    }
    if (template_type !== undefined) {
      updates.push('template_type = ?');
      params.push(template_type);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await c.env.DB.prepare(`
      UPDATE newsletters SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();
    
    // Mettre à jour les articles associés si fournis
    if (article_ids !== undefined) {
      // Supprimer les anciennes associations
      await c.env.DB.prepare(
        'DELETE FROM newsletter_blog_articles WHERE newsletter_id = ?'
      ).bind(id).run();
      
      // Ajouter les nouvelles
      if (Array.isArray(article_ids) && article_ids.length > 0) {
        for (let i = 0; i < article_ids.length; i++) {
          await c.env.DB.prepare(`
            INSERT INTO newsletter_blog_articles (newsletter_id, blog_post_id, display_order)
            VALUES (?, ?, ?)
          `).bind(id, article_ids[i], i).run();
        }
      }
    }
    
    return c.json({
      success: true,
      message: 'Newsletter mise à jour'
    });
  } catch (error) {
    console.error('Erreur mise à jour newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Prévisualiser une newsletter (admin)
app.get('/:id/preview', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getCurrentUser(c);
    
    // Récupérer la newsletter et ses articles
    const newsletter = await c.env.DB.prepare(`
      SELECT * FROM newsletters WHERE id = ?
    `).bind(id).first();
    
    if (!newsletter) {
      return c.json({ error: 'Newsletter non trouvée' }, 404);
    }
    
    const { results: articles } = await c.env.DB.prepare(`
      SELECT 
        bp.id, bp.title, bp.excerpt, bp.slug, bp.featured_image_url
      FROM newsletter_blog_articles nba
      JOIN blog_posts bp ON nba.blog_post_id = bp.id
      WHERE nba.newsletter_id = ?
      ORDER BY nba.display_order ASC
    `).bind(id).all();
    
    // Récupérer les offres récentes pour cet utilisateur (simule un candidat)
    const { results: recentJobs } = await c.env.DB.prepare(`
      SELECT 
        j.id, j.title, j.city, j.province, j.employment_type, j.salary_min, j.salary_max,
        c.name as company_name
      FROM job_offers j
      JOIN companies c ON j.company_id = c.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
      LIMIT 5
    `).all();
    
    // Générer le HTML de prévisualisation
    const previewHTML = generateNewsletterHTML(newsletter, articles, recentJobs);
    
    return c.html(previewHTML);
  } catch (error) {
    console.error('Erreur prévisualisation newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Envoyer une newsletter (admin) - Version simplifiée
app.post('/:id/send', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Vérifier la newsletter
    const newsletter = await c.env.DB.prepare(
      'SELECT * FROM newsletters WHERE id = ?'
    ).bind(id).first();
    
    if (!newsletter) {
      return c.json({ error: 'Newsletter non trouvée' }, 404);
    }
    
    if (newsletter.status === 'sent') {
      return c.json({ error: 'Newsletter déjà envoyée' }, 400);
    }
    
    // Récupérer tous les candidats abonnés
    const { results: subscribers } = await c.env.DB.prepare(`
      SELECT DISTINCT u.id, u.email, u.first_name, u.last_name
      FROM users u
      LEFT JOIN newsletter_subscriptions ns ON u.id = ns.user_id
      WHERE u.role = 'candidate' 
        AND u.is_active = 1
        AND (ns.subscribed IS NULL OR ns.subscribed = 1)
    `).all();
    
    // Marquer comme envoyée
    await c.env.DB.prepare(`
      UPDATE newsletters 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP, recipients_count = ?
      WHERE id = ?
    `).bind(subscribers.length, id).run();
    
    // Créer des logs pour chaque destinataire
    for (const sub of subscribers) {
      await c.env.DB.prepare(`
        INSERT INTO newsletter_logs 
        (newsletter_id, user_id, email, status, sent_at)
        VALUES (?, ?, ?, 'sent', CURRENT_TIMESTAMP)
      `).bind(id, sub.id, sub.email).run();
    }
    
    return c.json({
      success: true,
      message: `Newsletter envoyée à ${subscribers.length} destinataire(s)`,
      recipients_count: subscribers.length
    });
  } catch (error) {
    console.error('Erreur envoi newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Supprimer une newsletter (admin)
app.delete('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Vérifier statut
    const newsletter = await c.env.DB.prepare(
      'SELECT status FROM newsletters WHERE id = ?'
    ).bind(id).first();
    
    if (newsletter && newsletter.status === 'sent') {
      return c.json({ error: 'Impossible de supprimer une newsletter envoyée' }, 400);
    }
    
    await c.env.DB.prepare('DELETE FROM newsletters WHERE id = ?').bind(id).run();
    
    return c.json({
      success: true,
      message: 'Newsletter supprimée'
    });
  } catch (error) {
    console.error('Erreur suppression newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ===== SUBSCRIPTION ROUTES (Candidats) =====

// S'abonner à la newsletter (candidat)
app.post('/subscribe', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const { preferences } = await c.req.json();
    
    // Générer un token de désabonnement unique
    const unsubscribe_token = crypto.randomUUID();
    
    // Insérer ou mettre à jour l'abonnement
    await c.env.DB.prepare(`
      INSERT INTO newsletter_subscriptions 
      (user_id, email, subscribed, preferences, unsubscribe_token)
      VALUES (?, ?, 1, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        subscribed = 1,
        preferences = excluded.preferences,
        subscribed_at = CURRENT_TIMESTAMP,
        unsubscribed_at = NULL
    `).bind(
      currentUser.userId,
      currentUser.email,
      JSON.stringify(preferences || {}),
      unsubscribe_token
    ).run();
    
    return c.json({
      success: true,
      message: 'Abonnement enregistré'
    });
  } catch (error) {
    console.error('Erreur abonnement newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Se désabonner (candidat)
app.post('/unsubscribe', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    
    await c.env.DB.prepare(`
      UPDATE newsletter_subscriptions 
      SET subscribed = 0, unsubscribed_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(currentUser.userId).run();
    
    return c.json({
      success: true,
      message: 'Désabonnement enregistré'
    });
  } catch (error) {
    console.error('Erreur désabonnement newsletter:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer statut abonnement (candidat)
app.get('/subscription/status', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    
    const subscription = await c.env.DB.prepare(`
      SELECT subscribed, preferences
      FROM newsletter_subscriptions
      WHERE user_id = ?
    `).bind(currentUser.userId).first();
    
    return c.json({
      subscribed: subscription ? Boolean(subscription.subscribed) : true, // Par défaut abonné
      preferences: subscription?.preferences ? JSON.parse(subscription.preferences) : {}
    });
  } catch (error) {
    console.error('Erreur statut abonnement:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Fonction helper pour générer le HTML de newsletter
function generateNewsletterHTML(newsletter: any, articles: any[], jobs: any[]): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #2563eb; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .job-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
    .article-card { border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 20px; background: #f9fafb; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ HotelRestoJobs</h1>
      <p>${newsletter.subject}</p>
    </div>
    
    <div class="content">
      ${jobs.length > 0 ? `
        <h2 style="color: #1f2937;">📋 Nouvelles Offres d'Emploi</h2>
        ${jobs.map(job => `
          <div class="job-card">
            <h3 style="margin: 0 0 10px 0; color: #2563eb;">${job.title}</h3>
            <p style="margin: 0; color: #6b7280;">
              <strong>${job.company_name}</strong> • ${job.city}, ${job.province}<br>
              ${job.employment_type} • ${job.salary_min ? `${job.salary_min}$ - ${job.salary_max}$` : 'Salaire à discuter'}
            </p>
            <a href="https://hotelrestojobs.com/emploi/${job.id}" class="button">Voir l'offre</a>
          </div>
        `).join('')}
      ` : ''}
      
      ${articles.length > 0 ? `
        <h2 style="color: #1f2937; margin-top: 30px;">📰 Articles du Blog</h2>
        ${articles.map(article => `
          <div class="article-card">
            ${article.featured_image_url ? `<img src="${article.featured_image_url}" alt="${article.title}" style="width: 100%; border-radius: 4px; margin-bottom: 10px;">` : ''}
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${article.title}</h3>
            <p style="color: #6b7280;">${article.excerpt || ''}</p>
            <a href="https://hotelrestojobs.com/blog/${article.slug}" class="button">Lire l'article</a>
          </div>
        `).join('')}
      ` : ''}
    </div>
    
    <div class="footer">
      <p>© 2024 HotelRestoJobs - Tous droits réservés</p>
      <p><a href="#" style="color: #60a5fa;">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

// Compter les abonnés actifs (admin)
app.get('/subscribers/count', requireAuth, requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM newsletter_subscriptions
      WHERE subscribed = 1
    `).first();
    
    return c.json({ count: result?.count || 0 });
  } catch (error) {
    console.error('Erreur comptage abonnés:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default app;
