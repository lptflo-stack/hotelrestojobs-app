import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireEmployer, requireAdmin, getCurrentUser } from '../middleware/auth';

const companyLogo = new Hono<{ Bindings: Bindings }>();

/**
 * Upload/Update Company Logo (Employeur)
 * POST /api/company-logo/upload
 * Body: { logoData: string } - Base64 data URL (ex: data:image/png;base64,...)
 */
companyLogo.post('/upload', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const { company_id } = currentUser;

    if (!company_id) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    const body = await c.req.json<{ logoData: string }>();
    const { logoData } = body;

    if (!logoData) {
      return c.json({ error: 'Données logo manquantes' }, 400);
    }

    // Valider que c'est bien un data URL
    if (!logoData.startsWith('data:image/')) {
      return c.json({ error: 'Format de logo invalide. Utilisez un data URL (data:image/...)' }, 400);
    }

    // Vérifier la taille (max 2MB en base64)
    const sizeInBytes = (logoData.length * 3) / 4;
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

    if (sizeInBytes > maxSizeInBytes) {
      return c.json({ 
        error: 'Logo trop volumineux. Taille maximale: 2MB',
        currentSize: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
      }, 400);
    }

    // Mettre à jour le logo de l'entreprise
    await c.env.DB.prepare(`
      UPDATE companies
      SET logo_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(logoData, company_id).run();

    return c.json({
      success: true,
      message: 'Logo mis à jour avec succès',
      logo_url: logoData
    });
  } catch (error) {
    console.error('Erreur upload logo:', error);
    return c.json({ error: 'Erreur lors de l\'upload du logo' }, 500);
  }
});

/**
 * Get Company Logo (Public)
 * GET /api/company-logo/:companyId
 */
companyLogo.get('/:companyId', async (c) => {
  try {
    const companyId = c.req.param('companyId');

    const company = await c.env.DB.prepare(`
      SELECT logo_url
      FROM companies
      WHERE id = ?
    `).bind(companyId).first<{ logo_url: string | null }>();

    if (!company) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    return c.json({
      logo_url: company.logo_url
    });
  } catch (error) {
    console.error('Erreur récupération logo:', error);
    return c.json({ error: 'Erreur lors de la récupération du logo' }, 500);
  }
});

/**
 * Delete Company Logo (Employeur)
 * DELETE /api/company-logo
 */
companyLogo.delete('/', requireAuth, requireEmployer, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const { company_id } = currentUser;

    if (!company_id) {
      return c.json({ error: 'Entreprise non trouvée' }, 404);
    }

    // Supprimer le logo
    await c.env.DB.prepare(`
      UPDATE companies
      SET logo_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(company_id).run();

    return c.json({
      success: true,
      message: 'Logo supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression logo:', error);
    return c.json({ error: 'Erreur lors de la suppression du logo' }, 500);
  }
});

/**
 * Admin: Update Any Company Logo
 * PUT /api/company-logo/admin/:companyId
 */
companyLogo.put('/admin/:companyId', requireAuth, requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId');
    const body = await c.req.json<{ logoData: string | null }>();
    const { logoData } = body;

    if (logoData && !logoData.startsWith('data:image/')) {
      return c.json({ error: 'Format de logo invalide' }, 400);
    }

    // Vérifier taille si logo fourni
    if (logoData) {
      const sizeInBytes = (logoData.length * 3) / 4;
      const maxSizeInBytes = 2 * 1024 * 1024;

      if (sizeInBytes > maxSizeInBytes) {
        return c.json({ 
          error: 'Logo trop volumineux. Taille maximale: 2MB'
        }, 400);
      }
    }

    // Mettre à jour ou supprimer le logo
    await c.env.DB.prepare(`
      UPDATE companies
      SET logo_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(logoData || null, companyId).run();

    return c.json({
      success: true,
      message: logoData ? 'Logo mis à jour avec succès' : 'Logo supprimé avec succès',
      logo_url: logoData
    });
  } catch (error) {
    console.error('Erreur admin logo:', error);
    return c.json({ error: 'Erreur lors de la modification du logo' }, 500);
  }
});

/**
 * Admin: Delete Any Company Logo
 * DELETE /api/company-logo/admin/:companyId
 */
companyLogo.delete('/admin/:companyId', requireAuth, requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId');

    await c.env.DB.prepare(`
      UPDATE companies
      SET logo_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(companyId).run();

    return c.json({
      success: true,
      message: 'Logo supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur admin suppression logo:', error);
    return c.json({ error: 'Erreur lors de la suppression du logo' }, 500);
  }
});

export default companyLogo;
