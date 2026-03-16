-- Table des tarifs pour les annonces et crédits
CREATE TABLE IF NOT EXISTS pricing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('single', 'credits', 'unlimited')),
  credits INTEGER,
  price REAL NOT NULL,
  duration_days INTEGER,
  description TEXT,
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les tarifs par défaut
INSERT INTO pricing_plans (name, type, credits, price, duration_days, description) VALUES 
  ('Annonce simple', 'single', 1, 50.00, NULL, '1 annonce d''emploi'),
  ('Forfait 5 crédits', 'credits', 5, 200.00, NULL, '5 annonces d''emploi'),
  ('Forfait 10 crédits', 'credits', 10, 400.00, NULL, '10 annonces d''emploi'),
  ('Forfait illimité', 'unlimited', NULL, 1250.00, 365, 'Annonces illimitées pendant 1 an');

-- Table pour suivre les crédits des employeurs
CREATE TABLE IF NOT EXISTS employer_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  credits_remaining INTEGER DEFAULT 0,
  unlimited_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_pricing_plans_type ON pricing_plans(type);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_employer_credits_user_id ON employer_credits(user_id);
