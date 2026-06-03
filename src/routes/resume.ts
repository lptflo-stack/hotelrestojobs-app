import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireCandidate, getCurrentUser } from '../middleware/auth';

const app = new Hono<{ Bindings: Bindings }>();

// Upload CV (candidat uniquement)
app.post('/upload', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    
    // Récupérer le fichier depuis FormData
    const formData = await c.req.formData();
    const file = formData.get('cv') as File;
    
    if (!file) {
      return c.json({ error: 'Aucun fichier fourni' }, 400);
    }

    // Vérifier le type de fichier (PDF uniquement)
    if (file.type !== 'application/pdf') {
      return c.json({ error: 'Seuls les fichiers PDF sont acceptés' }, 400);
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Le fichier ne doit pas dépasser 5 MB' }, 400);
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `cv-${currentUser.userId}-${timestamp}.pdf`;
    const key = `resumes/${fileName}`;

    // Uploader vers R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.RESUMES.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
      customMetadata: {
        userId: currentUser.userId.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    // Mettre à jour le profil candidat avec l'URL du CV
    const resumeUrl = `/api/resume/download/${fileName}`;
    
    // Vérifier si le profil existe
    const existingProfile = await c.env.DB.prepare(
      'SELECT id FROM candidate_profiles WHERE user_id = ?'
    ).bind(currentUser.userId).first();

    if (existingProfile) {
      // Mettre à jour le profil existant
      await c.env.DB.prepare(
        'UPDATE candidate_profiles SET resume_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      ).bind(resumeUrl, currentUser.userId).run();
    } else {
      // Créer un nouveau profil
      await c.env.DB.prepare(
        'INSERT INTO candidate_profiles (user_id, resume_url) VALUES (?, ?)'
      ).bind(currentUser.userId, resumeUrl).run();
    }

    return c.json({
      success: true,
      message: 'CV uploadé avec succès',
      resume_url: resumeUrl,
      file_name: fileName,
      file_size: file.size,
    });
  } catch (error) {
    console.error('Erreur upload CV:', error);
    return c.json({ error: 'Erreur lors de l\'upload du CV' }, 500);
  }
});

// Télécharger CV (accessible par employeurs et le candidat propriétaire)
app.get('/download/:fileName', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const fileName = c.req.param('fileName');
    const key = `resumes/${fileName}`;

    // Extraire l'userId du nom de fichier (format: cv-{userId}-{timestamp}.pdf)
    const match = fileName.match(/^cv-(\d+)-\d+\.pdf$/);
    if (!match) {
      return c.json({ error: 'Nom de fichier invalide' }, 400);
    }

    const fileUserId = parseInt(match[1]);

    // Vérifier les permissions:
    // - Le candidat peut télécharger son propre CV
    // - Les employeurs peuvent télécharger les CVs des candidatures
    // - Les admins peuvent télécharger tous les CVs
    if (currentUser.role === 'candidate' && currentUser.userId !== fileUserId) {
      return c.json({ error: 'Accès non autorisé' }, 403);
    }

    // Si c'est un employeur, vérifier qu'il a bien une candidature de ce candidat
    if (currentUser.role === 'employer') {
      const application = await c.env.DB.prepare(`
        SELECT a.id 
        FROM applications a
        JOIN job_offers j ON a.job_offer_id = j.id
        WHERE a.user_id = ? AND j.company_id = ?
      `).bind(fileUserId, currentUser.companyId).first();

      if (!application) {
        return c.json({ error: 'Accès non autorisé' }, 403);
      }
    }

    // Récupérer le fichier depuis R2
    const object = await c.env.RESUMES.get(key);
    
    if (!object) {
      return c.json({ error: 'CV non trouvé' }, 404);
    }

    // Retourner le fichier
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erreur téléchargement CV:', error);
    return c.json({ error: 'Erreur lors du téléchargement du CV' }, 500);
  }
});

// Supprimer CV (candidat uniquement - son propre CV)
app.delete('/delete', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);

    // Récupérer le resume_url actuel
    const profile = await c.env.DB.prepare(
      'SELECT resume_url FROM candidate_profiles WHERE user_id = ?'
    ).bind(currentUser.userId).first<{ resume_url: string | null }>();

    if (!profile || !profile.resume_url) {
      return c.json({ error: 'Aucun CV à supprimer' }, 404);
    }

    // Extraire le fileName de l'URL
    const fileName = profile.resume_url.split('/').pop();
    if (!fileName) {
      return c.json({ error: 'URL de CV invalide' }, 400);
    }

    const key = `resumes/${fileName}`;

    // Supprimer de R2
    await c.env.RESUMES.delete(key);

    // Mettre à jour la base de données
    await c.env.DB.prepare(
      'UPDATE candidate_profiles SET resume_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).bind(currentUser.userId).run();

    return c.json({
      success: true,
      message: 'CV supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression CV:', error);
    return c.json({ error: 'Erreur lors de la suppression du CV' }, 500);
  }
});

export default app;
