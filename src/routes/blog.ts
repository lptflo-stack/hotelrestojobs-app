import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireAdmin, getCurrentUser } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

// ===== BLOG ROUTES =====

// Lister tous les articles (public - seulement publiés)
app.get('/', async (c) => {
  try {
    const { search, limit = '10', offset = '0' } = c.req.query();
    
    let query = `
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.status = 'published'
    `;
    
    const params: any[] = [];
    
    if (search) {
      query += ` AND (bp.title LIKE ? OR bp.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({ posts: results });
  } catch (error) {
    console.error('Erreur liste articles:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer un article par slug (public)
app.get('/slug/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    const post = await c.env.DB.prepare(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = ? AND bp.status = 'published'
    `).bind(slug).first();
    
    if (!post) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }
    
    // Incrémenter le compteur de vues
    await c.env.DB.prepare(`
      UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?
    `).bind(post.id).run();
    
    return c.json({ post });
  } catch (error) {
    console.error('Erreur récupération article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer un article par ID (admin)
app.get('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    const post = await c.env.DB.prepare(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.id = ?
    `).bind(id).first();
    
    if (!post) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }
    
    return c.json({ post });
  } catch (error) {
    console.error('Erreur récupération article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Créer un article (admin uniquement)
app.post('/', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const { title, slug, excerpt, content, featured_image_url, status } = await c.req.json();
    
    // Validation
    if (!title || !content) {
      return c.json({ error: 'Titre et contenu requis' }, 400);
    }
    
    // Générer un slug automatique si non fourni
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Vérifier que le slug n'existe pas déjà
    const existing = await c.env.DB.prepare(
      'SELECT id FROM blog_posts WHERE slug = ?'
    ).bind(finalSlug).first();
    
    if (existing) {
      return c.json({ error: 'Un article avec ce slug existe déjà' }, 400);
    }
    
    // Insérer l'article
    const published_at = status === 'published' ? new Date().toISOString() : null;
    
    const result = await c.env.DB.prepare(`
      INSERT INTO blog_posts 
      (title, slug, excerpt, content, featured_image_url, author_id, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      finalSlug,
      excerpt || null,
      content,
      featured_image_url || null,
      currentUser.userId,
      status || 'draft',
      published_at
    ).run();
    
    return c.json({
      success: true,
      post_id: result.meta.last_row_id,
      slug: finalSlug,
      message: 'Article créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Mettre à jour un article (admin uniquement)
app.put('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const { title, slug, excerpt, content, featured_image_url, status } = await c.req.json();
    
    // Vérifier que l'article existe
    const existing = await c.env.DB.prepare(
      'SELECT id, status FROM blog_posts WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }
    
    // Si on passe de draft à published, définir published_at
    let published_at = null;
    if (status === 'published' && existing.status !== 'published') {
      published_at = new Date().toISOString();
    }
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      params.push(slug);
    }
    if (excerpt !== undefined) {
      updates.push('excerpt = ?');
      params.push(excerpt);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (featured_image_url !== undefined) {
      updates.push('featured_image_url = ?');
      params.push(featured_image_url);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (published_at) {
      updates.push('published_at = ?');
      params.push(published_at);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await c.env.DB.prepare(`
      UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();
    
    return c.json({
      success: true,
      message: 'Article mis à jour'
    });
  } catch (error) {
    console.error('Erreur mise à jour article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Supprimer un article (admin uniquement)
app.delete('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    await c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run();
    
    return c.json({
      success: true,
      message: 'Article supprimé'
    });
  } catch (error) {
    console.error('Erreur suppression article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Lister tous les articles (admin - tous statuts)
app.get('/admin/all', requireAuth, requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      ORDER BY bp.created_at DESC
    `).all();
    
    return c.json({ posts: results });
  } catch (error) {
    console.error('Erreur liste admin articles:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default app;
