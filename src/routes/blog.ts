import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireAdmin, getCurrentUser } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

// Helper function: Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function: Calculate reading time (200 words per minute)
function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Helper function: Get categories for a post
async function getPostCategories(DB: D1Database, postId: number): Promise<any[]> {
  const { results } = await DB.prepare(`
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.color,
      c.icon
    FROM blog_categories c
    INNER JOIN blog_post_categories bpc ON c.id = bpc.category_id
    WHERE bpc.blog_post_id = ?
    ORDER BY c.display_order
  `).bind(postId).all();
  
  return results || [];
}

// Helper function: Set categories for a post
async function setPostCategories(DB: D1Database, postId: number, categoryIds: number[]): Promise<void> {
  // Delete existing associations
  await DB.prepare(`
    DELETE FROM blog_post_categories WHERE blog_post_id = ?
  `).bind(postId).run();
  
  // Insert new associations
  if (categoryIds && categoryIds.length > 0) {
    for (const categoryId of categoryIds) {
      await DB.prepare(`
        INSERT INTO blog_post_categories (blog_post_id, category_id)
        VALUES (?, ?)
      `).bind(postId, categoryId).run();
    }
  }
}

// ===== PUBLIC BLOG ROUTES =====

// Liste tous les articles publiés avec filtres avancés
app.get('/', async (c) => {
  try {
    const {
      search,
      category,
      keywords,
      limit = '10',
      offset = '0',
      sort = 'date'
    } = c.req.query();
    
    let query = `
      SELECT DISTINCT
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories c ON bpc.category_id = c.id
      WHERE bp.status = 'published'
    `;
    
    const params: any[] = [];
    
    // Filtre par recherche texte
    if (search) {
      query += ` AND (bp.title LIKE ? OR bp.content LIKE ? OR bp.excerpt LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Filtre par catégorie (slug)
    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    
    // Filtre par mots-clés SEO
    if (keywords) {
      query += ` AND bp.keywords LIKE ?`;
      params.push(`%${keywords}%`);
    }
    
    // Tri
    if (sort === 'views') {
      query += ` ORDER BY bp.views_count DESC`;
    } else if (sort === 'title') {
      query += ` ORDER BY bp.title ASC`;
    } else {
      query += ` ORDER BY bp.published_at DESC`;
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Enrichir avec catégories
    for (const post of results) {
      (post as any).categories = await getPostCategories(c.env.DB, post.id as number);
    }
    
    return c.json({ posts: results });
  } catch (error) {
    console.error('Erreur liste articles:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Récupérer un article par slug (public) avec SEO
app.get('/slug/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    const post = await c.env.DB.prepare(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = ? AND bp.status = 'published'
    `).bind(slug).first();
    
    if (!post) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }
    
    // Récupérer les catégories
    (post as any).categories = await getPostCategories(c.env.DB, post.id as number);
    
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

// Articles par catégorie (public)
app.get('/category/:slug', async (c) => {
  try {
    const categorySlug = c.req.param('slug');
    const { limit = '10', offset = '0' } = c.req.query();
    
    // Vérifier que la catégorie existe
    const category = await c.env.DB.prepare(`
      SELECT * FROM blog_categories WHERE slug = ?
    `).bind(categorySlug).first();
    
    if (!category) {
      return c.json({ error: 'Catégorie non trouvée' }, 404);
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      INNER JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      INNER JOIN blog_categories c ON bpc.category_id = c.id
      WHERE c.slug = ? AND bp.status = 'published'
      ORDER BY bp.published_at DESC
      LIMIT ? OFFSET ?
    `).bind(categorySlug, parseInt(limit), parseInt(offset)).all();
    
    // Enrichir avec catégories
    for (const post of results) {
      (post as any).categories = await getPostCategories(c.env.DB, post.id as number);
    }
    
    return c.json({ 
      category,
      posts: results 
    });
  } catch (error) {
    console.error('Erreur articles par catégorie:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ===== ADMIN BLOG ROUTES =====

// Lister tous les articles (admin - tous statuts)
app.get('/admin/all', requireAuth, requireAdmin, async (c) => {
  try {
    const { status, category } = c.req.query();
    
    let query = `
      SELECT DISTINCT
        bp.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
      LEFT JOIN blog_categories c ON bpc.category_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ` AND bp.status = ?`;
      params.push(status);
    }
    
    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY bp.created_at DESC`;
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Enrichir avec catégories
    for (const post of results) {
      (post as any).categories = await getPostCategories(c.env.DB, post.id as number);
    }
    
    return c.json({ posts: results });
  } catch (error) {
    console.error('Erreur liste admin articles:', error);
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
    
    // Récupérer les catégories
    (post as any).categories = await getPostCategories(c.env.DB, post.id as number);
    
    return c.json({ post });
  } catch (error) {
    console.error('Erreur récupération article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Créer un article (admin)
app.post('/', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    if (!currentUser) {
      return c.json({ error: 'Non authentifié' }, 401);
    }
    
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      status,
      category_ids,
      // SEO fields
      meta_title,
      meta_description,
      og_title,
      og_description,
      og_image,
      keywords,
      canonical_url
    } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: 'Titre et contenu requis' }, 400);
    }
    
    // Générer slug si non fourni
    const finalSlug = slug || generateSlug(title);
    
    // Vérifier slug unique
    const existingPost = await c.env.DB.prepare(`
      SELECT id FROM blog_posts WHERE slug = ?
    `).bind(finalSlug).first();
    
    if (existingPost) {
      return c.json({ error: 'Ce slug existe déjà' }, 400);
    }
    
    // Calculer temps de lecture
    const readingTime = calculateReadingTime(content);
    
    // Insérer l'article
    const published_at = status === 'published' ? new Date().toISOString() : null;
    
    const result = await c.env.DB.prepare(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image_url,
        author_id, status, published_at, reading_time,
        meta_title, meta_description, og_title, og_description, og_image,
        keywords, canonical_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      finalSlug,
      excerpt || null,
      content,
      featured_image_url || null,
      currentUser.userId,
      status || 'draft',
      published_at,
      readingTime,
      meta_title || title,
      meta_description || excerpt || null,
      og_title || title,
      og_description || excerpt || null,
      og_image || featured_image_url || null,
      keywords || null,
      canonical_url || null
    ).run();
    
    const postId = result.meta.last_row_id as number;
    
    // Associer les catégories
    if (category_ids && Array.isArray(category_ids)) {
      await setPostCategories(c.env.DB, postId, category_ids);
    }
    
    return c.json({
      success: true,
      post_id: postId,
      slug: finalSlug,
      message: 'Article créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Modifier un article (admin)
app.put('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      status,
      category_ids,
      // SEO fields
      meta_title,
      meta_description,
      og_title,
      og_description,
      og_image,
      keywords,
      canonical_url
    } = await c.req.json();
    
    // Vérifier que l'article existe
    const existingPost = await c.env.DB.prepare(`
      SELECT * FROM blog_posts WHERE id = ?
    `).bind(id).first();
    
    if (!existingPost) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }
    
    // Vérifier slug unique (si modifié)
    if (slug && slug !== existingPost.slug) {
      const slugExists = await c.env.DB.prepare(`
        SELECT id FROM blog_posts WHERE slug = ? AND id != ?
      `).bind(slug, id).first();
      
      if (slugExists) {
        return c.json({ error: 'Ce slug existe déjà' }, 400);
      }
    }
    
    // Calculer temps de lecture si contenu modifié
    const readingTime = content ? calculateReadingTime(content) : existingPost.reading_time;
    
    // Si passage de draft à published, définir published_at
    let published_at = existingPost.published_at;
    if (status === 'published' && existingPost.status !== 'published' && !published_at) {
      published_at = new Date().toISOString();
    }
    
    await c.env.DB.prepare(`
      UPDATE blog_posts
      SET 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        excerpt = COALESCE(?, excerpt),
        content = COALESCE(?, content),
        featured_image_url = COALESCE(?, featured_image_url),
        status = COALESCE(?, status),
        published_at = COALESCE(?, published_at),
        reading_time = COALESCE(?, reading_time),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        og_title = COALESCE(?, og_title),
        og_description = COALESCE(?, og_description),
        og_image = COALESCE(?, og_image),
        keywords = COALESCE(?, keywords),
        canonical_url = COALESCE(?, canonical_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title || null,
      slug || null,
      excerpt || null,
      content || null,
      featured_image_url || null,
      status || null,
      published_at || null,
      readingTime || null,
      meta_title || null,
      meta_description || null,
      og_title || null,
      og_description || null,
      og_image || null,
      keywords || null,
      canonical_url || null,
      id
    ).run();
    
    // Mettre à jour les catégories si fournies
    if (category_ids && Array.isArray(category_ids)) {
      await setPostCategories(c.env.DB, parseInt(id), category_ids);
    }
    
    return c.json({
      success: true,
      message: 'Article modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur modification article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Supprimer un article (admin)
app.delete('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Vérifier que l'article existe
    const post = await c.env.DB.prepare(`
      SELECT id FROM blog_posts WHERE id = ?
    `).bind(id).first();
    
    if (!post) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }
    
    // Supprimer (cascade supprimera les associations catégories)
    await c.env.DB.prepare(`
      DELETE FROM blog_posts WHERE id = ?
    `).bind(id).run();
    
    return c.json({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression article:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default app;
