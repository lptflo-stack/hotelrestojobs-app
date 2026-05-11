import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireCandidate, getCurrentUser } from '../middleware/auth';

const candidate = new Hono<{ Bindings: Bindings }>();

// Mettre à jour le profil candidat - SÉCURISÉ JWT
candidate.put('/profile', requireAuth, requireCandidate, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const user_id = currentUser.userId;

    const body = await c.req.json<{
      bio?: string;
      experience_years?: number;
      availability?: string;
      desired_position?: string;
      desired_salary_min?: number;
      desired_salary_max?: number;
    }>();

    const {
      bio,
      experience_years,
      availability,
      desired_position,
      desired_salary_min,
      desired_salary_max
    } = body;

    // Vérifier si un profil existe
    const existingProfile = await c.env.DB.prepare(`
      SELECT id FROM candidate_profiles WHERE user_id = ?
    `).bind(user_id).first<{ id: number }>();

    if (!existingProfile) {
      // Créer un nouveau profil
      await c.env.DB.prepare(`
        INSERT INTO candidate_profiles (
          user_id, bio, experience_years, availability,
          desired_position, desired_salary_min, desired_salary_max
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user_id,
        bio || null,
        experience_years || null,
        availability || null,
        desired_position || null,
        desired_salary_min || null,
        desired_salary_max || null
      ).run();
    } else {
      // Mettre à jour le profil existant
      const updates: string[] = [];
      const bindings: any[] = [];

      if (bio !== undefined) {
        updates.push('bio = ?');
        bindings.push(bio);
      }
      if (experience_years !== undefined) {
        updates.push('experience_years = ?');
        bindings.push(experience_years);
      }
      if (availability !== undefined) {
        updates.push('availability = ?');
        bindings.push(availability);
      }
      if (desired_position !== undefined) {
        updates.push('desired_position = ?');
        bindings.push(desired_position);
      }
      if (desired_salary_min !== undefined) {
        updates.push('desired_salary_min = ?');
        bindings.push(desired_salary_min);
      }
      if (desired_salary_max !== undefined) {
        updates.push('desired_salary_max = ?');
        bindings.push(desired_salary_max);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      bindings.push(user_id);

      if (updates.length > 1) { // > 1 car updated_at est toujours présent
        await c.env.DB.prepare(`
          UPDATE candidate_profiles
          SET ${updates.join(', ')}
          WHERE user_id = ?
        `).bind(...bindings).run();
      }
    }

    return c.json({ success: true, message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du profil' }, 500);
  }
});

export default candidate;
