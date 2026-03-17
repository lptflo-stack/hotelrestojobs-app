-- Créer une autre annonce expirée
INSERT INTO job_offers (
  company_id, title, description, position_type, employment_type,
  location, city, province, status, expires_at, created_at, updated_at
) VALUES (
  1,
  'Serveur/Serveuse - Test Expiré 2',
  'Second test pour republication',
  'Serveur',
  'part-time',
  '456 Rue Test',
  'Montréal',
  'QC',
  'expired',
  '2026-01-15 00:00:00',
  '2025-12-15 00:00:00',
  '2025-12-15 00:00:00'
);
