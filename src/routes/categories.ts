import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireAdmin } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

// ===== CATEGORIES ROUTES =====

// Liste toutes les catégories (public)
app.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT bpc.blog_post_id) as posts_count
      FROM blog_categories c
      LEFT JOIN blog_post_categories bpc ON c.id = bpc.category_id
      LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id AND bp.status = 'published'
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();
    
    return c.json({ categories: results });
  } catch (error) {
    console.error('Erreur liste catégories:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer une catégorie par ID (public)
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const category = await c.env.DB.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT bpc.blog_post_id) as posts_count
      FROM blog_categories c
      LEFT JOIN blog_post_categories bpc ON c.id = bpc.category_id
      LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id AND bp.status = 'published'
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(id).first();
    
    if (!category) {
      return c.json({ error: 'Catégorie non trouvée' }, 404);
    }
    
    return c.json({ category });
  } catch (error) {
    console.error('Erreur récupération catégorie:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer une catégorie par slug (public)
app.get('/slug/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    const category = await c.env.DB.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT bpc.blog_post_id) as posts_count
      FROM blog_categories c
      LEFT JOIN blog_post_categories bpc ON c.id = bpc.category_id
      LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id AND bp.status = 'published'
      WHERE c.slug = ?
      GROUP BY c.id
    `).bind(slug).first();
    
    if (!category) {
      return c.json({ error: 'Catégorie non trouvée' }, 404);
    }
    
    return c.json({ category });
  } catch (error) {
    console.error('Erreur récupération catégorie par slug:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Créer une catégorie (admin)
app.post('/', requireAuth, requireAdmin, async (c) => {
  try {
    const { name, slug, description, color, icon, display_order } = await c.req.json();
    
    if (!name || !slug) {
      return c.json({ error: 'Nom et slug requis' }, 400);
    }
    
    // Vérifier slug unique
    const existing = await c.env.DB.prepare(`
      SELECT id FROM blog_categories WHERE slug = ?
    `).bind(slug).first();
    
    if (existing) {
      return c.json({ error: 'Ce slug existe déjà' }, 400);
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO blog_categories (name, slug, description, color, icon, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      slug,
      description || null,
      color || '#2563eb',
      icon || null,
      display_order || 0
    ).run();
    
    return c.json({
      success: true,
      category_id: result.meta.last_row_id,
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Modifier une catégorie (admin)
app.put('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const { name, slug, description, color, icon, display_order } = await c.req.json();
    
    // Vérifier que la catégorie existe
    const category = await c.env.DB.prepare(`
      SELECT id FROM blog_categories WHERE id = ?
    `).bind(id).first();
    
    if (!category) {
      return c.json({ error: 'Catégorie non trouvée' }, 404);
    }
    
    // Vérifier slug unique (si modifié)
    if (slug) {
      const existing = await c.env.DB.prepare(`
        SELECT id FROM blog_categories WHERE slug = ? AND id != ?
      `).bind(slug, id).first();
      
      if (existing) {
        return c.json({ error: 'Ce slug existe déjà' }, 400);
      }
    }
    
    await c.env.DB.prepare(`
      UPDATE blog_categories
      SET 
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon),
        display_order = COALESCE(?, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name || null,
      slug || null,
      description || null,
      color || null,
      icon || null,
      display_order !== undefined ? display_order : null,
      id
    ).run();
    
    return c.json({
      success: true,
      message: 'Catégorie modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur modification catégorie:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Supprimer une catégorie (admin)
app.delete('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Vérifier que la catégorie existe
    const category = await c.env.DB.prepare(`
      SELECT id FROM blog_categories WHERE id = ?
    `).bind(id).first();
    
    if (!category) {
      return c.json({ error: 'Catégorie non trouvée' }, 404);
    }
    
    // La suppression en cascade supprimera automatiquement les associations
    await c.env.DB.prepare(`
      DELETE FROM blog_categories WHERE id = ?
    `).bind(id).run();
    
    return c.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default app;
