-- Utilisateurs de test avec bcrypt hashes
-- Ces utilisateurs peuvent se connecter avec les mots de passe en clair

-- Supprimer les utilisateurs existants s'ils existent
DELETE FROM users WHERE email IN ('admin@hotelrestojobs.com', 'employer@hotel.com', 'candidate@email.com');

-- ADMIN: admin@hotelrestojobs.com / admin123
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES ('admin@hotelrestojobs.com', '$2b$10$ykVjtLeEM7Wbj2ElWBTXLOYlibjIfKM6fq8.T24L8FcyihPyY3OO.', 'Admin', 'System', 'admin', 1);

-- EMPLOYER: employer@hotel.com / employer123
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES ('employer@hotel.com', '$2b$10$D/wIHOhzqSqJIgaBsULgCOGOk/4.Zx1y5CgTvlmjxInB4.MeXtVbW', 'Hotel', 'Manager', 'employer', 1);

-- CANDIDATE: candidate@email.com / candidate123
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES ('candidate@email.com', '$2b$10$MvwPlXPsuKcaUFfw/UNtPO5tR2p7lwM.EKtmzcSPCN9IMeGj3sKDO', 'John', 'Doe', 'candidate', 1);

-- Note: Pour créer l'entreprise de l'employeur, il faut d'abord insérer l'utilisateur
-- puis l'entreprise sera créée avec user_id
-- On va créer l'entreprise après avoir l'ID de l'utilisateur

-- Créer l'entreprise pour l'employeur
INSERT OR IGNORE INTO companies (user_id, name, description, address, city, province, postal_code, website)
SELECT id, 'Hotel Grand Luxe', 'Un hôtel 5 étoiles au cœur de Montréal', '1234 Rue Principale', 'Montréal', 'QC', 'H1A 1A1', 'https://www.grandluxe.com'
FROM users WHERE email = 'employer@hotel.com';

-- Associer l'employeur à son entreprise
UPDATE users SET company_id = (SELECT id FROM companies WHERE user_id = users.id LIMIT 1) 
WHERE email = 'employer@hotel.com';

-- Donner des crédits à l'employeur
INSERT OR IGNORE INTO employer_credits (user_id, credits_remaining, unlimited_until)
SELECT id, 10, NULL FROM users WHERE email = 'employer@hotel.com';
