import { Hono } from 'hono';
import type { Bindings } from '../types';

const admin = new Hono<{ Bindings: Bindings }>();

// Middleware pour vérifier que l'utilisateur est admin
const requireAdmin = async (c: any, next: any) => {
  const userId = c.req.query('user_id');
  
  if (!userId) {
    return c.json({ error: 'Non autorisé' }, 401);
  }

  const user = await c.env.DB.prepare(`
    SELECT role FROM users WHERE id = ?
  `).bind(userId).first<{ role: string }>();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Non autorisé - accès admin requis' }, 403);
  }

  await next();
};

// Statistiques globales
admin.get('/stats', requireAdmin, async (c) => {
  try {
    // Total utilisateurs
    const totalUsers = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first<{ count: number }>();

    // Utilisateurs par rôle
    const usersByRole = await c.env.DB.prepare(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `).all();

    // Total offres d'emploi
    const totalJobs = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM job_offers
    `).first<{ count: number }>();

    // Offres par statut
    const jobsByStatus = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count FROM job_offers GROUP BY status
    `).all();

    // Total candidatures
    const totalApplications = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM applications
    `).first<{ count: number }>();

    // Candidatures par statut
    const applicationsByStatus = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count FROM applications GROUP BY status
    `).all();

    // Emplois vedettes actifs
    const featuredJobs = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM job_offers 
      WHERE is_featured = 1 AND featured_until > datetime('now')
    `).first<{ count: number }>();

    // Revenus des emplois vedettes
    const revenue = await c.env.DB.prepare(`
      SELECT SUM(amount) as total
      FROM featured_orders
      WHERE status = 'completed'
    `).first<{ total: number }>();

    return c.json({
      users: {
        total: totalUsers?.count || 0,
        by_role: usersByRole.results
      },
      jobs: {
        total: totalJobs?.count || 0,
        by_status: jobsByStatus.results,
        featured_active: featuredJobs?.count || 0
      },
      applications: {
        total: totalApplications?.count || 0,
        by_status: applicationsByStatus.results
      },
      revenue: {
        total: revenue?.total || 0
      }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500);
  }
});

// Lister toutes les offres en attente de validation
admin.get('/jobs/pending', requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        jo.*,
        c.name as company_name,
        u.email as employer_email
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE jo.status = 'pending'
      ORDER BY jo.created_at DESC
    `).all();

    return c.json({ jobs: results });
  } catch (error) {
    console.error('Erreur emplois en attente:', error);
    return c.json({ error: 'Erreur lors de la récupération des emplois' }, 500);
  }
});

// Valider ou rejeter une offre d'emploi
admin.post('/jobs/:id/validate', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<{ action: 'approve' | 'reject'; reason?: string }>();
    const { action, reason } = body;

    if (!['approve', 'reject'].includes(action)) {
      return c.json({ error: 'Action invalide' }, 400);
    }

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    await c.env.DB.prepare(`
      UPDATE job_offers 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newStatus, id).run();

    return c.json({
      success: true,
      message: action === 'approve' ? 'Offre approuvée' : 'Offre rejetée'
    });
  } catch (error) {
    console.error('Erreur validation emploi:', error);
    return c.json({ error: 'Erreur lors de la validation' }, 500);
  }
});

// Lister tous les utilisateurs
admin.get('/users', requireAdmin, async (c) => {
  try {
    const role = c.req.query('role');
    let query = 'SELECT id, email, first_name, last_name, role, phone, created_at FROM users';
    const bindings: any[] = [];

    if (role) {
      query += ' WHERE role = ?';
      bindings.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = c.env.DB.prepare(query);
    const { results } = await stmt.bind(...bindings).all();

    return c.json({ users: results });
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
  }
});

// Supprimer un utilisateur
admin.delete('/users/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    // Ne pas permettre la suppression d'un admin
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(id).first<{ role: string }>();

    if (user?.role === 'admin') {
      return c.json({ error: 'Impossible de supprimer un administrateur' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    return c.json({ error: 'Erreur lors de la suppression' }, 500);
  }
});

// Lister toutes les commandes d'emplois vedettes
admin.get('/featured-orders', requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        fo.*,
        jo.title as job_title,
        c.name as company_name,
        u.email as employer_email
      FROM featured_orders fo
      JOIN job_offers jo ON fo.job_offer_id = jo.id
      JOIN companies c ON jo.company_id = c.id
      JOIN users u ON fo.user_id = u.id
      ORDER BY fo.created_at DESC
      LIMIT 100
    `).all();

    return c.json({ orders: results });
  } catch (error) {
    console.error('Erreur commandes vedettes:', error);
    return c.json({ error: 'Erreur lors de la récupération des commandes' }, 500);
  }
});

export default admin;
