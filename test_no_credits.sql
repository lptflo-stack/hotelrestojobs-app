-- Créer un employeur sans crédits pour tester
-- Utilisateur
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, created_at)
VALUES ('nocredit@test.com', 'admin123', 'Test', 'NoCredit', '514-555-9999', 'employer', 1, CURRENT_TIMESTAMP);

-- Entreprise
INSERT INTO companies (user_id, name, description, city, province, created_at)
SELECT id, 'Test Sans Crédits', 'Entreprise de test sans crédits', 'Montréal', 'QC', CURRENT_TIMESTAMP
FROM users WHERE email = 'nocredit@test.com';

-- Crédits à zéro
INSERT INTO employer_credits (user_id, credits_remaining, created_at)
SELECT id, 0, CURRENT_TIMESTAMP
FROM users WHERE email = 'nocredit@test.com';
