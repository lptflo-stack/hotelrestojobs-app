-- ========================================
-- MIGRATIONS COMPLÈTES - HotelRestoJobs
-- ========================================
-- À exécuter dans l'ordre via la console D1 du Dashboard Cloudflare
-- ou via wrangler d1 migrations apply

-- ========================================
-- MIGRATION 0001: Schema Initial
-- ========================================

-- Table des utilisateurs (candidats, employeurs, admin)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('candidate', 'employer', 'admin')),
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des entreprises
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  website TEXT,
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des profils candidats
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  resume_url TEXT,
  bio TEXT,
  experience_years INTEGER,
  availability TEXT,
  desired_position TEXT,
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des offres d'emploi
CREATE TABLE IF NOT EXISTS job_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position_type TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_type TEXT,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'rejected', 'expired', 'closed')),
  is_featured INTEGER DEFAULT 0,
  featured_until DATETIME,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Table des candidatures
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_offer_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des commandes d'emplois vedettes
CREATE TABLE IF NOT EXISTS featured_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_offer_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  duration_days INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
  payment_intent_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON job_offers(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON job_offers(is_featured, featured_until);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_featured_job ON featured_orders(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_featured_user ON featured_orders(user_id);

-- ========================================
-- MIGRATION 0002: Système de tarification
-- ========================================

-- Table des forfaits de tarification
CREATE TABLE IF NOT EXISTS pricing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('single', 'credits', 'unlimited')),
  credits INTEGER,
  price REAL NOT NULL,
  duration_days INTEGER,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour la tarification
CREATE INDEX IF NOT EXISTS idx_pricing_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_type ON pricing_plans(type);

-- ========================================
-- MIGRATION 0003: Système de crédits et transactions
-- ========================================

-- Table pour les crédits des employeurs
CREATE TABLE IF NOT EXISTS employer_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  credits_remaining INTEGER DEFAULT 0,
  unlimited_until DATETIME,
  last_purchase_date DATETIME,
  last_purchase_plan_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (last_purchase_plan_id) REFERENCES pricing_plans(id)
);

-- Table pour l'historique des transactions de crédits
CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('purchase', 'deduction', 'refund', 'admin_adjustment', 'expiration')),
  credits_amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  job_offer_id INTEGER,
  pricing_plan_id INTEGER,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  amount_paid REAL,
  currency TEXT DEFAULT 'CAD',
  description TEXT,
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE SET NULL,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL
);

-- Table pour les achats de forfaits
CREATE TABLE IF NOT EXISTS plan_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pricing_plan_id INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'CAD',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  invoice_number TEXT,
  invoice_url TEXT,
  receipt_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id)
);

-- Table pour les notifications d'expiration
CREATE TABLE IF NOT EXISTS expiration_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_offer_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL CHECK(notification_type IN ('7_days', '3_days', 'expired')),
  sent_at DATETIME,
  scheduled_for DATETIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ajouter la colonne expires_at aux offres d'emploi
ALTER TABLE job_offers ADD COLUMN expires_at DATETIME;

-- Index pour les crédits et transactions
CREATE INDEX IF NOT EXISTS idx_employer_credits_user ON employer_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_date ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_user ON plan_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_status ON plan_purchases(status);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_stripe ON plan_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_expiration_notifications_job ON expiration_notifications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_expiration_notifications_status ON expiration_notifications(status);
CREATE INDEX IF NOT EXISTS idx_expiration_notifications_scheduled ON expiration_notifications(scheduled_for);

-- Vue pour les statistiques de crédits des employeurs
CREATE VIEW IF NOT EXISTS employer_credit_stats AS
SELECT 
  ec.user_id,
  u.email,
  u.first_name,
  u.last_name,
  c.name as company_name,
  ec.credits_remaining,
  ec.unlimited_until,
  ec.last_purchase_date,
  pp.name as last_purchase_plan,
  (SELECT COUNT(*) FROM credit_transactions WHERE user_id = ec.user_id AND transaction_type = 'purchase') as total_purchases,
  (SELECT SUM(ABS(credits_amount)) FROM credit_transactions WHERE user_id = ec.user_id AND transaction_type = 'deduction') as total_used,
  (SELECT COUNT(*) FROM job_offers jo WHERE jo.company_id = c.id AND jo.status = 'active') as active_jobs,
  (SELECT COUNT(*) FROM job_offers jo WHERE jo.company_id = c.id AND jo.status = 'expired') as expired_jobs
FROM employer_credits ec
JOIN users u ON ec.user_id = u.id
LEFT JOIN companies c ON u.id = c.user_id
LEFT JOIN pricing_plans pp ON ec.last_purchase_plan_id = pp.id
WHERE u.role = 'employer';

-- ========================================
-- MIGRATION 0004: Multi-utilisateurs et comptes actifs
-- ========================================

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

-- ========================================
-- FIN DES MIGRATIONS
-- ========================================
