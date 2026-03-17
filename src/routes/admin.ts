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

    if (action === 'approve') {
      // Récupérer l'offre et l'employeur
      const jobOffer = await c.env.DB.prepare(`
        SELECT jo.*, c.user_id
        FROM job_offers jo
        JOIN companies c ON jo.company_id = c.id
        WHERE jo.id = ?
      `).bind(id).first<any>();

      if (!jobOffer) {
        return c.json({ error: 'Offre non trouvée' }, 404);
      }

      // Vérifier les crédits de l'employeur
      const credits = await c.env.DB.prepare(`
        SELECT credits_remaining, unlimited_until
        FROM employer_credits
        WHERE user_id = ?
      `).bind(jobOffer.user_id).first<any>();

      const hasUnlimited = credits?.unlimited_until && new Date(credits.unlimited_until) > new Date();
      const hasCredits = credits?.credits_remaining && credits.credits_remaining > 0;

      if (!hasUnlimited && !hasCredits) {
        return c.json({ 
          error: 'L\'employeur n\'a pas de crédits disponibles',
          credits_remaining: credits?.credits_remaining || 0,
          unlimited_until: credits?.unlimited_until
        }, 400);
      }

      // Calculer la date d'expiration (30 jours)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Activer l'offre
      await c.env.DB.prepare(`
        UPDATE job_offers 
        SET status = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind('active', expiresAt.toISOString(), id).run();

      // Déduire un crédit si pas illimité
      if (!hasUnlimited) {
        const balanceBefore = credits?.credits_remaining || 0;
        const balanceAfter = balanceBefore - 1;

        await c.env.DB.prepare(`
          UPDATE employer_credits 
          SET credits_remaining = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).bind(balanceAfter, jobOffer.user_id).run();

        // Logger la transaction
        await c.env.DB.prepare(`
          INSERT INTO credit_transactions (
            user_id,
            transaction_type,
            credits_amount,
            balance_before,
            balance_after,
            job_offer_id,
            description
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          jobOffer.user_id,
          'deduction',
          -1,
          balanceBefore,
          balanceAfter,
          id,
          `Publication de l'offre: ${jobOffer.title}`
        ).run();
      }

      // Créer les notifications d'expiration (7 jours avant et jour d'expiration)
      const warning7Days = new Date(expiresAt);
      warning7Days.setDate(warning7Days.getDate() - 7);

      const warning3Days = new Date(expiresAt);
      warning3Days.setDate(warning3Days.getDate() - 3);

      // TODO: Planifier les emails de notification
      await c.env.DB.prepare(`
        INSERT INTO expiration_notifications (user_id, job_offer_id, notification_type, email_status)
        VALUES (?, ?, ?, ?)
      `).bind(jobOffer.user_id, id, 'warning_7days', 'pending').run();

      await c.env.DB.prepare(`
        INSERT INTO expiration_notifications (user_id, job_offer_id, notification_type, email_status)
        VALUES (?, ?, ?, ?)
      `).bind(jobOffer.user_id, id, 'warning_3days', 'pending').run();

      await c.env.DB.prepare(`
        INSERT INTO expiration_notifications (user_id, job_offer_id, notification_type, email_status)
        VALUES (?, ?, ?, ?)
      `).bind(jobOffer.user_id, id, 'expired', 'pending').run();

      return c.json({
        success: true,
        message: 'Offre approuvée et activée',
        expires_at: expiresAt.toISOString(),
        credits_deducted: hasUnlimited ? 0 : 1,
        credits_remaining: hasUnlimited ? 'unlimited' : (credits?.credits_remaining || 0) - 1
      });
    } else {
      // Rejeter l'offre
      await c.env.DB.prepare(`
        UPDATE job_offers 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind('rejected', id).run();

      return c.json({
        success: true,
        message: 'Offre rejetée'
      });
    }
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

// Récupérer un utilisateur spécifique
admin.get('/users/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, phone, created_at
      FROM users
      WHERE id = ?
    `).bind(id).first();

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return c.json({ error: 'Erreur lors de la récupération de l\'utilisateur' }, 500);
  }
});

// Mettre à jour un utilisateur
admin.put('/users/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<{
      user_id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      password?: string;
      is_active?: boolean;
    }>();

    const { first_name, last_name, email, phone, password, is_active } = body;

    // Construire la requête de mise à jour
    const updates: string[] = [];
    const bindings: any[] = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      bindings.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      bindings.push(last_name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      bindings.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      bindings.push(phone);
    }
    if (password) {
      // Simple hash pour la démo - en production utiliser bcrypt
      const passwordHash = `$2a$10$${password}`;
      updates.push('password_hash = ?');
      bindings.push(passwordHash);
    }

    bindings.push(id);

    if (updates.length > 0) {
      await c.env.DB.prepare(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();
    }

    return c.json({
      success: true,
      message: 'Utilisateur mis à jour'
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' }, 500);
  }
});

// Lister les utilisateurs d'une entreprise
admin.get('/companies/:companyId/users', requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId');

    const { results } = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at
      FROM users u
      JOIN companies c ON u.id = c.user_id OR u.id IN (
        SELECT user_id FROM users WHERE role = 'employer'
      )
      WHERE c.id = ? AND u.role = 'employer'
      ORDER BY u.created_at DESC
    `).bind(companyId).all();

    return c.json({ users: results });
  } catch (error) {
    console.error('Erreur liste utilisateurs entreprise:', error);
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
  }
});

// Créer un utilisateur pour une entreprise
admin.post('/companies/:companyId/users', requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId');
    const body = await c.req.json<{
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      password: string;
      role: string;
      company_id: string;
    }>();

    const { first_name, last_name, email, phone, password, role } = body;

    if (!first_name || !last_name || !email || !password) {
      return c.json({ error: 'Champs requis manquants' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, 400);
    }

    // Vérifier si l'email existe déjà
    const existing = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();

    if (existing) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 400);
    }

    // Simple hash pour la démo - en production utiliser bcrypt
    const passwordHash = `$2a$10$${password}`;

    // Créer l'utilisateur
    await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(email, passwordHash, first_name, last_name, phone || null, role || 'employer').run();

    return c.json({
      success: true,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return c.json({ error: 'Erreur lors de la création de l\'utilisateur' }, 500);
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

// ===== EMPLOYERS MANAGEMENT =====

// Lister tous les employeurs avec détails
admin.get('/employers', requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.created_at,
        c.id as company_id,
        c.name as company_name,
        c.city as company_city,
        c.province as company_province,
        ec.credits_remaining,
        ec.unlimited_until,
        (SELECT COUNT(*) FROM job_offers jo WHERE jo.company_id = c.id) as total_jobs
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      LEFT JOIN employer_credits ec ON u.id = ec.user_id
      WHERE u.role = 'employer'
      ORDER BY u.created_at DESC
    `).all();

    return c.json({ employers: results });
  } catch (error) {
    console.error('Erreur liste employeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des employeurs' }, 500);
  }
});

// Gérer les crédits d'un employeur
admin.post('/employers/:userId/credits', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json<{
      user_id: string;
      action: 'add' | 'remove' | 'set';
      amount: number;
      note?: string;
    }>();

    const { action, amount, note } = body;

    if (!['add', 'remove', 'set'].includes(action)) {
      return c.json({ error: 'Action invalide' }, 400);
    }

    if (amount < 0) {
      return c.json({ error: 'Le montant doit être positif' }, 400);
    }

    // Vérifier si l'employeur existe
    const user = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(userId).first<{ role: string }>();

    if (!user || user.role !== 'employer') {
      return c.json({ error: 'Employeur non trouvé' }, 404);
    }

    // Vérifier si l'enregistrement de crédits existe
    const existingCredits = await c.env.DB.prepare(`
      SELECT credits_remaining FROM employer_credits WHERE user_id = ?
    `).bind(userId).first<{ credits_remaining: number }>();

    if (!existingCredits) {
      // Créer l'enregistrement s'il n'existe pas
      await c.env.DB.prepare(`
        INSERT INTO employer_credits (user_id, credits_remaining, updated_at)
        VALUES (?, 0, CURRENT_TIMESTAMP)
      `).bind(userId).run();
    }

    // Calculer le nouveau montant de crédits
    let newAmount = 0;
    const currentAmount = existingCredits?.credits_remaining || 0;

    if (action === 'add') {
      newAmount = currentAmount + amount;
    } else if (action === 'remove') {
      newAmount = Math.max(0, currentAmount - amount);
    } else if (action === 'set') {
      newAmount = amount;
    }

    // Mettre à jour les crédits
    await c.env.DB.prepare(`
      UPDATE employer_credits 
      SET credits_remaining = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(newAmount, userId).run();

    return c.json({
      success: true,
      message: 'Crédits mis à jour',
      old_amount: currentAmount,
      new_amount: newAmount
    });
  } catch (error) {
    console.error('Erreur gestion crédits:', error);
    return c.json({ error: 'Erreur lors de la mise à jour des crédits' }, 500);
  }
});

// Récupérer les informations d'une entreprise
admin.get('/employers/:userId/company', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');

    const company = await c.env.DB.prepare(`
      SELECT * FROM companies WHERE user_id = ?
    `).bind(userId).first();

    if (!company) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    return c.json({ company });
  } catch (error) {
    console.error('Erreur récupération entreprise:', error);
    return c.json({ error: 'Erreur lors de la récupération de l\'entreprise' }, 500);
  }
});

// Mettre à jour les informations d'une entreprise
admin.put('/employers/:userId/company', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json<{
      user_id: string;
      name: string;
      description?: string;
      city?: string;
      province?: string;
      phone?: string;
      website?: string;
    }>();

    const { name, description, city, province, phone, website } = body;

    if (!name) {
      return c.json({ error: 'Le nom de l\'entreprise est requis' }, 400);
    }

    // Vérifier si l'entreprise existe
    const existingCompany = await c.env.DB.prepare(`
      SELECT id FROM companies WHERE user_id = ?
    `).bind(userId).first();

    if (!existingCompany) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    // Mettre à jour l'entreprise
    await c.env.DB.prepare(`
      UPDATE companies 
      SET 
        name = ?,
        description = ?,
        city = ?,
        province = ?,
        phone = ?,
        website = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(name, description, city, province, phone, website, userId).run();

    return c.json({
      success: true,
      message: 'Entreprise mise à jour'
    });
  } catch (error) {
    console.error('Erreur mise à jour entreprise:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de l\'entreprise' }, 500);
  }
});

// Récupérer les détails complets d'un employeur
admin.get('/employers/:userId/details', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');

    // Informations employeur
    const employer = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, phone, created_at
      FROM users
      WHERE id = ? AND role = 'employer'
    `).bind(userId).first();

    if (!employer) {
      return c.json({ error: 'Employeur non trouvé' }, 404);
    }

    // Informations entreprise
    const company = await c.env.DB.prepare(`
      SELECT * FROM companies WHERE user_id = ?
    `).bind(userId).first();

    // Crédits
    const credits = await c.env.DB.prepare(`
      SELECT credits_remaining, unlimited_until
      FROM employer_credits
      WHERE user_id = ?
    `).bind(userId).first();

    // Statistiques
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT jo.id) as total_jobs,
        COUNT(DISTINCT CASE WHEN jo.status = 'active' THEN jo.id END) as active_jobs,
        COUNT(DISTINCT CASE WHEN jo.is_featured = 1 THEN jo.id END) as featured_jobs,
        COUNT(DISTINCT a.id) as total_applications
      FROM job_offers jo
      LEFT JOIN applications a ON jo.id = a.job_offer_id
      WHERE jo.company_id = (SELECT id FROM companies WHERE user_id = ?)
    `).bind(userId).first();

    return c.json({
      employer,
      company,
      credits: credits || { credits_remaining: 0, unlimited_until: null },
      stats: stats || { total_jobs: 0, active_jobs: 0, featured_jobs: 0, total_applications: 0 }
    });
  } catch (error) {
    console.error('Erreur détails employeur:', error);
    return c.json({ error: 'Erreur lors de la récupération des détails' }, 500);
  }
});

export default admin;
