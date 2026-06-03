import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireAdmin, requireEmployer, getCurrentUser } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

// Helper function: Generate newsletter HTML
function generateEmployerNewsletterHTML(newsletter: any, articles: any[], jobs: any[]): string {
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
    .article-card { border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 25px; background: #f9fafb; border-radius: 8px; }
    .article-image { width: 100%; max-width: 550px; height: auto; border-radius: 8px; margin-bottom: 15px; }
    .article-title { margin: 0 0 10px 0; color: #1f2937; font-size: 22px; font-weight: bold; }
    .article-excerpt { color: #6b7280; line-height: 1.6; margin-bottom: 15px; }
    .article-meta { color: #9ca3af; font-size: 14px; margin-bottom: 15px; }
    .category-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-right: 8px; color: white; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .button:hover { background-color: #1d4ed8; }
    .job-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: white; }
    .job-title { margin: 0 0 10px 0; color: #2563eb; font-size: 18px; font-weight: bold; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 12px; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0 0 10px 0; font-size: 32px;">🍽️ HotelRestoJobs</h1>
      <p style="margin: 0; font-size: 18px; opacity: 0.9;">${newsletter.subject}</p>
    </div>
    
    <div class="content">
      ${newsletter.preview_text ? `
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          ${newsletter.preview_text}
        </p>
      ` : ''}
      
      ${articles.length > 0 ? `
        <h2 style="color: #1f2937; font-size: 26px; margin-bottom: 25px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          📰 Derniers Articles du Blog
        </h2>
        ${articles.map(article => `
          <div class="article-card">
            ${article.featured_image_url ? `
              <img src="${article.featured_image_url}" alt="${article.title}" class="article-image">
            ` : ''}
            
            ${article.categories && article.categories.length > 0 ? `
              <div style="margin-bottom: 12px;">
                ${article.categories.map((cat: any) => `
                  <span class="category-badge" style="background-color: ${cat.color};">
                    ${cat.icon ? `<i class="${cat.icon}"></i> ` : ''}${cat.name}
                  </span>
                `).join('')}
              </div>
            ` : ''}
            
            <h3 class="article-title">${article.title}</h3>
            
            <div class="article-meta">
              📅 ${new Date(article.published_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              ${article.reading_time ? ` • ⏱️ ${article.reading_time} min de lecture` : ''}
            </div>
            
            ${article.excerpt ? `
              <p class="article-excerpt">${article.excerpt}</p>
            ` : ''}
            
            <a href="https://hotelrestojobs.com/blog/${article.slug}" class="button">
              Lire l'article complet →
            </a>
          </div>
        `).join('')}
      ` : ''}
      
      ${jobs.length > 0 ? `
        <h2 style="color: #1f2937; font-size: 26px; margin: 40px 0 25px 0; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          💼 Offres d'Emploi Récentes
        </h2>
        ${jobs.map(job => `
          <div class="job-card">
            <h3 class="job-title">${job.title}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>🏢 ${job.company_name}</strong><br>
              📍 ${job.city}, ${job.province}<br>
              💼 ${job.employment_type}
              ${job.salary_min ? ` • 💰 ${job.salary_min}$ - ${job.salary_max}$` : ''}
            </p>
            <a href="https://hotelrestojobs.com/emploi/${job.id}" class="button" style="margin-top: 15px;">
              Voir les détails
            </a>
          </div>
        `).join('')}
      ` : ''}
      
      ${newsletter.template_type === 'custom' && newsletter.content_html ? `
        <div style="margin-top: 30px;">
          ${newsletter.content_html}
        </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 15px 0;">
        <strong>HotelRestoJobs</strong> - Votre partenaire recrutement en hôtellerie-restauration
      </p>
      <p style="margin: 0 0 15px 0;">
        📧 contact@hotelrestojobs.com | 📞 514-555-0000
      </p>
      <p style="margin: 0; opacity: 0.8;">
        Vous recevez cet email car vous êtes inscrit(e) sur HotelRestoJobs en tant qu'employeur.<br>
        <a href="#">Gérer mes préférences</a> | <a href="#">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ===== ADMIN ROUTES =====

// Lister toutes les infolettres employeurs (admin)
app.get('/', requireAuth, requireAdmin, async (c) => {
  try {
    const { status } = c.req.query();
    
    let query = `
      SELECT 
        en.*,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM employer_newsletters en
      LEFT JOIN users u ON en.created_by = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ` AND en.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY en.created_at DESC`;
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({ newsletters: results });
  } catch (error) {
    console.error('Erreur liste newsletters employeurs:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Créer une infolettre (admin)
app.post('/', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    if (!currentUser) {
      return c.json({ error: 'Non authentifié' }, 401);
    }
    
    const {
      title,
      subject,
      preview_text,
      template_type,
      article_ids,
      content_html
    } = await c.req.json();
    
    if (!title || !subject) {
      return c.json({ error: 'Titre et sujet requis' }, 400);
    }
    
    // Créer la newsletter
    const result = await c.env.DB.prepare(`
      INSERT INTO employer_newsletters (
        title, subject, preview_text, template_type, content_html, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      subject,
      preview_text || null,
      template_type || 'mixed',
      content_html || null,
      currentUser.userId
    ).run();
    
    const newsletterId = result.meta.last_row_id as number;
    
    // Associer les articles si fournis
    if (article_ids && Array.isArray(article_ids) && article_ids.length > 0) {
      for (let i = 0; i < article_ids.length; i++) {
        await c.env.DB.prepare(`
          INSERT INTO employer_newsletter_articles (newsletter_id, blog_post_id, display_order)
          VALUES (?, ?, ?)
        `).bind(newsletterId, article_ids[i], i).run();
      }
    }
    
    return c.json({
      success: true,
      newsletter_id: newsletterId,
      message: 'Infolettre créée avec succès'
    });
  } catch (error) {
    console.error('Erreur création infolettre:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Modifier une infolettre (admin)
app.put('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    const {
      title,
      subject,
      preview_text,
      template_type,
      article_ids,
      content_html,
      status
    } = await c.req.json();
    
    // Vérifier que la newsletter existe
    const newsletter = await c.env.DB.prepare(`
      SELECT * FROM employer_newsletters WHERE id = ?
    `).bind(id).first();
    
    if (!newsletter) {
      return c.json({ error: 'Infolettre non trouvée' }, 404);
    }
    
    // Ne pas permettre modification si déjà envoyée
    if (newsletter.status === 'sent') {
      return c.json({ error: 'Impossible de modifier une infolettre déjà envoyée' }, 400);
    }
    
    // Mettre à jour la newsletter
    await c.env.DB.prepare(`
      UPDATE employer_newsletters
      SET 
        title = COALESCE(?, title),
        subject = COALESCE(?, subject),
        preview_text = COALESCE(?, preview_text),
        template_type = COALESCE(?, template_type),
        content_html = COALESCE(?, content_html),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title || null,
      subject || null,
      preview_text || null,
      template_type || null,
      content_html || null,
      status || null,
      id
    ).run();
    
    // Mettre à jour les articles si fournis
    if (article_ids && Array.isArray(article_ids)) {
      // Supprimer les associations existantes
      await c.env.DB.prepare(`
        DELETE FROM employer_newsletter_articles WHERE newsletter_id = ?
      `).bind(id).run();
      
      // Ajouter les nouvelles
      for (let i = 0; i < article_ids.length; i++) {
        await c.env.DB.prepare(`
          INSERT INTO employer_newsletter_articles (newsletter_id, blog_post_id, display_order)
          VALUES (?, ?, ?)
        `).bind(id, article_ids[i], i).run();
      }
    }
    
    return c.json({
      success: true,
      message: 'Infolettre modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur modification infolettre:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Prévisualiser une infolettre (admin)
app.get('/:id/preview', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Récupérer la newsletter
    const newsletter = await c.env.DB.prepare(`
      SELECT * FROM employer_newsletters WHERE id = ?
    `).bind(id).first();
    
    if (!newsletter) {
      return c.json({ error: 'Infolettre non trouvée' }, 404);
    }
    
    // Récupérer les articles associés avec catégories
    const { results: articles } = await c.env.DB.prepare(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      INNER JOIN employer_newsletter_articles ena ON bp.id = ena.blog_post_id
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE ena.newsletter_id = ?
      ORDER BY ena.display_order
    `).bind(id).all();
    
    // Enrichir avec catégories
    for (const article of articles) {
      const { results: cats } = await c.env.DB.prepare(`
        SELECT c.* FROM blog_categories c
        INNER JOIN blog_post_categories bpc ON c.id = bpc.category_id
        WHERE bpc.blog_post_id = ?
      `).bind(article.id).all();
      (article as any).categories = cats;
    }
    
    // Récupérer les offres d'emploi récentes (si template_type inclut jobs)
    let jobs: any[] = [];
    if (newsletter.template_type === 'mixed' || newsletter.template_type === 'jobs_only') {
      const { results } = await c.env.DB.prepare(`
        SELECT * FROM jobs
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT 5
      `).all();
      jobs = results || [];
    }
    
    // Générer le HTML
    const html = generateEmployerNewsletterHTML(newsletter, articles, jobs);
    
    return c.html(html);
  } catch (error) {
    console.error('Erreur prévisualisation infolettre:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Envoyer une infolettre (admin)
app.post('/:id/send', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Récupérer la newsletter
    const newsletter = await c.env.DB.prepare(`
      SELECT * FROM employer_newsletters WHERE id = ?
    `).bind(id).first();
    
    if (!newsletter) {
      return c.json({ error: 'Infolettre non trouvée' }, 404);
    }
    
    if (newsletter.status !== 'draft') {
      return c.json({ error: 'Seules les infolettres en brouillon peuvent être envoyées' }, 400);
    }
    
    // Récupérer tous les employeurs abonnés
    const { results: subscribers } = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name
      FROM users u
      LEFT JOIN employer_newsletter_subscriptions ens ON u.id = ens.user_id
      WHERE u.role = 'employer' 
        AND (ens.subscribed IS NULL OR ens.subscribed = 1)
    `).all();
    
    // Créer les logs d'envoi
    for (const subscriber of subscribers) {
      const unsubscribeToken = crypto.randomUUID();
      
      await c.env.DB.prepare(`
        INSERT INTO employer_newsletter_logs (newsletter_id, user_id, unsubscribe_token)
        VALUES (?, ?, ?)
      `).bind(id, subscriber.id, unsubscribeToken).run();
    }
    
    // Mettre à jour la newsletter
    await c.env.DB.prepare(`
      UPDATE employer_newsletters
      SET 
        status = 'sent',
        sent_at = CURRENT_TIMESTAMP,
        recipients_count = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(subscribers.length, id).run();
    
    return c.json({
      success: true,
      message: `Infolettre envoyée à ${subscribers.length} employeurs`,
      recipients_count: subscribers.length
    });
  } catch (error) {
    console.error('Erreur envoi infolettre:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Compter les abonnés (admin)
app.get('/subscribers/count', requireAuth, requireAdmin, async (c) => {
  try {
    // Tous les employeurs sont considérés comme abonnés par défaut
    // sauf s'ils se sont explicitement désabonnés
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN employer_newsletter_subscriptions ens ON u.id = ens.user_id
      WHERE u.role = 'employer'
        AND (ens.subscribed IS NULL OR ens.subscribed = 1)
    `).first();
    
    return c.json({ count: result?.count || 0 });
  } catch (error) {
    console.error('Erreur comptage abonnés:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ===== EMPLOYER ROUTES =====

// S'abonner à l'infolettre (employeur)
app.post('/subscribe', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    if (!currentUser) {
      return c.json({ error: 'Non authentifié' }, 401);
    }
    
    const { preferences } = await c.req.json();
    const unsubscribeToken = crypto.randomUUID();
    
    // UPSERT
    await c.env.DB.prepare(`
      INSERT INTO employer_newsletter_subscriptions (user_id, subscribed, preferences, unsubscribe_token)
      VALUES (?, 1, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        subscribed = 1,
        preferences = ?,
        subscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      currentUser.userId,
      JSON.stringify(preferences || {}),
      unsubscribeToken,
      JSON.stringify(preferences || {})
    ).run();
    
    return c.json({
      success: true,
      message: 'Abonnement confirmé'
    });
  } catch (error) {
    console.error('Erreur abonnement:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Se désabonner (employeur)
app.post('/unsubscribe', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    if (!currentUser) {
      return c.json({ error: 'Non authentifié' }, 401);
    }
    
    await c.env.DB.prepare(`
      INSERT INTO employer_newsletter_subscriptions (user_id, subscribed, unsubscribed_at)
      VALUES (?, 0, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        subscribed = 0,
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `).bind(currentUser.userId).run();
    
    return c.json({
      success: true,
      message: 'Désabonnement confirmé'
    });
  } catch (error) {
    console.error('Erreur désabonnement:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Statut d'abonnement (employeur)
app.get('/subscription/status', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    if (!currentUser) {
      return c.json({ error: 'Non authentifié' }, 401);
    }
    
    const subscription = await c.env.DB.prepare(`
      SELECT subscribed, preferences
      FROM employer_newsletter_subscriptions
      WHERE user_id = ?
    `).bind(currentUser.userId).first();
    
    // Par défaut, les employeurs sont abonnés
    const subscribed = subscription ? subscription.subscribed === 1 : true;
    const preferences = subscription && subscription.preferences 
      ? JSON.parse(subscription.preferences as string)
      : { job_alerts: true, blog_updates: true, weekly_digest: true };
    
    return c.json({ subscribed, preferences });
  } catch (error) {
    console.error('Erreur statut abonnement:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default app;
