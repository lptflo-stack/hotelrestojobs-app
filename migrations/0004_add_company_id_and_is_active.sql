-- Ajouter company_id et is_active à la table users
ALTER TABLE users ADD COLUMN company_id INTEGER;
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;

-- Créer l'index pour company_id
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Mettre à jour les utilisateurs existants avec leur company_id
-- Basé sur le lien existant dans la table companies
UPDATE users 
SET company_id = (
  SELECT id 
  FROM companies 
  WHERE companies.user_id = users.id
)
WHERE role = 'employer';
