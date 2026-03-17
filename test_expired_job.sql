-- Créer une annonce expirée pour tester
INSERT INTO job_offers (
  company_id, title, description, position_type, employment_type,
  location, city, province, status, expires_at, created_at, updated_at
) VALUES (
  1,
  'Chef de Cuisine - Test Expiré',
  'Poste de test pour la fonction de republication',
  'Chef',
  'full-time',
  '123 Rue Test',
  'Montréal',
  'QC',
  'expired',
  '2026-02-01 00:00:00',
  '2026-01-01 00:00:00',
  '2026-01-01 00:00:00'
);
