-- Migration pour rendre les offres d'emploi bilingues (Phase 2)
-- Date: 2024-06-04

-- 1. Ajouter la colonne 'job_language' pour indiquer la langue de l'offre
-- Valeurs possibles: 'fr', 'en', 'bilingual'
ALTER TABLE job_offers ADD COLUMN job_language TEXT DEFAULT 'fr' CHECK(job_language IN ('fr', 'en', 'bilingual'));

-- 2. Ajouter les colonnes bilingues pour le titre
ALTER TABLE job_offers ADD COLUMN title_fr TEXT;
ALTER TABLE job_offers ADD COLUMN title_en TEXT;

-- 3. Ajouter les colonnes bilingues pour la description
ALTER TABLE job_offers ADD COLUMN description_fr TEXT;
ALTER TABLE job_offers ADD COLUMN description_en TEXT;

-- 4. Ajouter les colonnes bilingues pour les exigences
ALTER TABLE job_offers ADD COLUMN requirements_fr TEXT;
ALTER TABLE job_offers ADD COLUMN requirements_en TEXT;

-- 5. Ajouter les colonnes bilingues pour les avantages
ALTER TABLE job_offers ADD COLUMN benefits_fr TEXT;
ALTER TABLE job_offers ADD COLUMN benefits_en TEXT;

-- 6. Migrer les données existantes
-- Copier les valeurs actuelles dans les colonnes _fr (on suppose que les données existantes sont en français)
UPDATE job_offers 
SET 
  title_fr = title,
  description_fr = description,
  requirements_fr = requirements,
  benefits_fr = benefits,
  job_language = 'fr'
WHERE title_fr IS NULL;

-- 7. Index pour optimiser les recherches par langue
CREATE INDEX IF NOT EXISTS idx_job_offers_language ON job_offers(job_language);

-- 8. Ajouter un champ employer_id pour faciliter les requêtes
-- (pour éviter les JOIN avec companies à chaque fois)
ALTER TABLE job_offers ADD COLUMN employer_id INTEGER;

-- 9. Remplir employer_id avec user_id correspondant
UPDATE job_offers 
SET employer_id = (
  SELECT c.user_id 
  FROM companies c 
  WHERE c.id = job_offers.company_id
)
WHERE employer_id IS NULL;

-- 10. Créer un index sur employer_id
CREATE INDEX IF NOT EXISTS idx_job_offers_employer_id ON job_offers(employer_id);

-- 11. Ajouter expires_at si pas déjà présent (pour gérer l'expiration des offres)
-- Note: Vérifier d'abord si la colonne existe déjà dans une migration précédente
-- ALTER TABLE job_offers ADD COLUMN expires_at DATETIME;

-- 12. Commentaires pour les développeurs
-- Les anciennes colonnes (title, description, requirements, benefits) sont conservées
-- pour compatibilité rétroactive, mais ne doivent plus être utilisées.
-- Utiliser title_fr/title_en, description_fr/description_en, etc.
