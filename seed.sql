-- Données de test

-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, phone) VALUES 
  (1, 'admin@hotelrestojobs.com', '$2a$10$abcdefghijklmnopqrstuv', 'Admin', 'System', 'admin', '514-555-0001');

-- Employeurs
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, phone) VALUES 
  (2, 'rh@restaurantluxe.com', '$2a$10$abcdefghijklmnopqrstuv', 'Marie', 'Dubois', 'employer', '514-555-0100'),
  (3, 'recrutement@hotelmontreal.com', '$2a$10$abcdefghijklmnopqrstuv', 'Jean', 'Tremblay', 'employer', '514-555-0200'),
  (4, 'jobs@bistromoderne.com', '$2a$10$abcdefghijklmnopqrstuv', 'Sophie', 'Gagnon', 'employer', '438-555-0300');

-- Candidats
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, phone) VALUES 
  (5, 'julien.chef@email.com', '$2a$10$abcdefghijklmnopqrstuv', 'Julien', 'Lefebvre', 'candidate', '514-555-1001'),
  (6, 'marie.serveur@email.com', '$2a$10$abcdefghijklmnopqrstuv', 'Marie', 'Lavoie', 'candidate', '514-555-1002'),
  (7, 'pierre.cuisinier@email.com', '$2a$10$abcdefghijklmnopqrstuv', 'Pierre', 'Martin', 'candidate', '438-555-1003');

-- Entreprises
INSERT OR IGNORE INTO companies (id, user_id, name, description, address, city, province, postal_code, website) VALUES 
  (1, 2, 'Restaurant Le Luxe', 'Restaurant gastronomique français au cœur du Vieux-Montréal', '123 Rue Saint-Paul', 'Montréal', 'QC', 'H2Y 1H5', 'https://restaurantluxe.com'),
  (2, 3, 'Hôtel Montréal Centre', 'Hôtel 4 étoiles avec restaurant et spa', '456 Boulevard René-Lévesque', 'Montréal', 'QC', 'H3B 1A7', 'https://hotelmontreal.com'),
  (3, 4, 'Bistro Moderne', 'Bistro contemporain avec terrasse', '789 Avenue Mont-Royal', 'Montréal', 'QC', 'H2J 1W8', 'https://bistromoderne.com');

-- Profils candidats
INSERT OR IGNORE INTO candidate_profiles (user_id, bio, experience_years, availability, desired_position, desired_salary_min, desired_salary_max) VALUES 
  (5, 'Chef cuisinier avec 10 ans d''expérience en cuisine gastronomique française', 10, 'Immédiate', 'Chef de cuisine', 55000, 75000),
  (6, 'Serveuse professionnelle passionnée par le service client', 3, 'Dans 2 semaines', 'Serveur/Serveuse', 30000, 40000),
  (7, 'Cuisinier polyvalent avec expérience en cuisine italienne et française', 5, 'Immédiate', 'Cuisinier', 40000, 50000);

-- Offres d'emploi (certaines vedettes)
INSERT OR IGNORE INTO job_offers (id, company_id, title, description, position_type, employment_type, salary_min, salary_max, salary_type, location, city, province, requirements, benefits, status, is_featured, featured_until, views_count) VALUES 
  (1, 1, 'Chef de Cuisine - Restaurant Gastronomique', 'Nous recherchons un chef de cuisine expérimenté pour rejoindre notre équipe. Vous serez responsable de la création des menus, de la gestion de l''équipe de cuisine et de maintenir nos standards d''excellence.', 'Chef de cuisine', 'full-time', 60000, 80000, 'annual', '123 Rue Saint-Paul, Montréal', 'Montréal', 'QC', '- 5+ ans d''expérience en cuisine gastronomique\n- Formation en cuisine professionnelle\n- Leadership et gestion d''équipe\n- Créativité et passion pour la cuisine', '- Salaire compétitif\n- Assurances collectives\n- 3 semaines de vacances\n- Repas fournis', 'active', 1, datetime('now', '+30 days'), 156),
  
  (2, 2, 'Serveur/Serveuse - Restaurant Hôtel 4 Étoiles', 'Rejoignez notre équipe dynamique ! Nous recherchons des serveurs expérimentés pour notre restaurant d''hôtel. Service de qualité et expérience client sont nos priorités.', 'Serveur/Serveuse', 'full-time', 16, 20, 'hourly', '456 Boulevard René-Lévesque, Montréal', 'Montréal', 'QC', '- Minimum 2 ans d''expérience\n- Excellentes compétences en service client\n- Bilingue (français/anglais)\n- Disponibilité soirs et week-ends', '- Pourboires généreux\n- Repas fournis\n- Horaire flexible\n- Environnement professionnel', 'active', 1, datetime('now', '+15 days'), 203),
  
  (3, 3, 'Cuisinier(ière) - Bistro Contemporain', 'Nous cherchons un cuisinier passionné pour rejoindre notre équipe de cuisine. Ambiance de travail agréable et menu créatif.', 'Cuisinier', 'full-time', 42000, 50000, 'annual', '789 Avenue Mont-Royal, Montréal', 'Montréal', 'QC', '- 3+ ans d''expérience\n- Connaissance cuisine contemporaine\n- Travail d''équipe\n- Propreté et organisation', '- Salaire compétitif\n- Assurances après 3 mois\n- 2 semaines de vacances\n- Repas fournis', 'active', 0, NULL, 87),
  
  (4, 1, 'Plongeur/Aide-Cuisinier', 'Poste de plongeur avec possibilité d''évolution vers aide-cuisinier. Parfait pour débuter dans le milieu de la restauration.', 'Plongeur', 'full-time', 15, 17, 'hourly', '123 Rue Saint-Paul, Montréal', 'Montréal', 'QC', '- Aucune expérience requise\n- Ponctualité et fiabilité\n- Esprit d''équipe', '- Formation sur place\n- Repas fournis\n- Pourboires partagés\n- Horaire stable', 'active', 0, NULL, 45),
  
  (5, 2, 'Réceptionniste d''Hôtel - Nuit', 'Nous recherchons un réceptionniste pour le quart de nuit. Excellente opportunité pour ceux qui préfèrent travailler la nuit.', 'Réceptionniste', 'full-time', 18, 22, 'hourly', '456 Boulevard René-Lévesque, Montréal', 'Montréal', 'QC', '- Expérience en hôtellerie (atout)\n- Bilingue (français/anglais)\n- Compétences informatiques\n- Disponibilité de nuit', '- Prime de nuit\n- Environnement calme\n- Assurances\n- Stationnement gratuit', 'active', 0, NULL, 67);

-- Candidatures
INSERT OR IGNORE INTO applications (job_offer_id, user_id, cover_letter, status) VALUES 
  (1, 5, 'Je suis très intéressé par le poste de Chef de Cuisine. Mon expérience de 10 ans en cuisine gastronomique française correspond parfaitement à vos besoins. Je serais ravi de contribuer à l''excellence de votre restaurant.', 'reviewed'),
  (2, 6, 'Passionnée par le service client, je souhaite rejoindre votre équipe. Mon expérience et mon bilinguisme seront des atouts pour votre restaurant.', 'pending'),
  (3, 7, 'Cuisinier polyvalent avec 5 ans d''expérience, je suis enthousiaste à l''idée de travailler dans votre bistro contemporain.', 'shortlisted');

-- Commandes d'emplois vedettes
INSERT OR IGNORE INTO featured_orders (job_offer_id, user_id, amount, duration_days, status, payment_intent_id) VALUES 
  (1, 2, 99.99, 30, 'completed', 'pi_test_001'),
  (2, 3, 49.99, 15, 'completed', 'pi_test_002');
