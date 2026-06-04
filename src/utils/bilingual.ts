/**
 * Helpers pour la gestion des contenus bilingues des offres d'emploi
 * Phase 2 - Système multilingue
 */

import type { JobOffer } from '../types';

/**
 * Récupère le contenu de l'offre dans la langue demandée
 * @param job L'offre d'emploi complète de la DB
 * @param lang La langue souhaitée ('fr' ou 'en')
 * @returns L'offre avec le contenu dans la bonne langue
 */
export function getJobInLanguage(job: any, lang: 'fr' | 'en'): any {
  const jobLanguage = job.job_language || 'fr';
  
  // Si l'offre n'est disponible qu'en une seule langue
  if (jobLanguage !== 'bilingual') {
    // Si on demande une langue différente de celle de l'offre, retourner null ou l'offre originale
    if (lang !== jobLanguage && !job[`title_${lang}`]) {
      // Retourner dans la langue disponible
      return {
        ...job,
        title: job[`title_${jobLanguage}`] || job.title,
        description: job[`description_${jobLanguage}`] || job.description,
        requirements: job[`requirements_${jobLanguage}`] || job.requirements,
        benefits: job[`benefits_${jobLanguage}`] || job.benefits,
        _available_language: jobLanguage
      };
    }
  }
  
  // Retourner le contenu dans la langue demandée
  return {
    ...job,
    title: job[`title_${lang}`] || job.title,
    description: job[`description_${lang}`] || job.description,
    requirements: job[`requirements_${lang}`] || job.requirements,
    benefits: job[`benefits_${lang}`] || job.benefits,
    _selected_language: lang
  };
}

/**
 * Prépare les données pour l'insertion/mise à jour en DB
 * @param data Les données du formulaire
 * @returns Un objet avec toutes les colonnes à jour
 */
export function prepareBilingualJobData(data: any): {
  job_language: 'fr' | 'en' | 'bilingual';
  title_fr?: string;
  title_en?: string;
  description_fr?: string;
  description_en?: string;
  requirements_fr?: string;
  requirements_en?: string;
  benefits_fr?: string;
  benefits_en?: string;
  // Anciennes colonnes pour compatibilité
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
} {
  const jobLanguage = data.job_language || 'fr';
  
  // Déterminer le contenu principal (anciennes colonnes)
  let mainTitle = data.title_fr || data.title_en || data.title || '';
  let mainDescription = data.description_fr || data.description_en || data.description || '';
  let mainRequirements = data.requirements_fr || data.requirements_en || data.requirements;
  let mainBenefits = data.benefits_fr || data.benefits_en || data.benefits;
  
  return {
    job_language: jobLanguage,
    title_fr: data.title_fr || null,
    title_en: data.title_en || null,
    description_fr: data.description_fr || null,
    description_en: data.description_en || null,
    requirements_fr: data.requirements_fr || null,
    requirements_en: data.requirements_en || null,
    benefits_fr: data.benefits_fr || null,
    benefits_en: data.benefits_en || null,
    // Compatibilité rétroactive
    title: mainTitle,
    description: mainDescription,
    requirements: mainRequirements,
    benefits: mainBenefits
  };
}

/**
 * Vérifie si une offre est disponible dans une langue donnée
 * @param job L'offre d'emploi
 * @param lang La langue à vérifier
 * @returns true si l'offre est disponible dans cette langue
 */
export function isJobAvailableInLanguage(job: any, lang: 'fr' | 'en'): boolean {
  const jobLanguage = job.job_language || 'fr';
  
  if (jobLanguage === 'bilingual') {
    return true;
  }
  
  return jobLanguage === lang;
}

/**
 * Obtient la langue du navigateur à partir du header Accept-Language
 * @param acceptLanguage Header Accept-Language
 * @returns 'fr' ou 'en'
 */
export function getPreferredLanguage(acceptLanguage?: string): 'fr' | 'en' {
  if (!acceptLanguage) {
    return 'fr';
  }
  
  // Extraire la première langue préférée
  const firstLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
  
  if (firstLang === 'en') {
    return 'en';
  }
  
  return 'fr';
}
