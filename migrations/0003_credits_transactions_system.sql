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

-- Table pour les achats de forfaits (factures)
CREATE TABLE IF NOT EXISTS plan_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pricing_plan_id INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'CAD',
  credits_purchased INTEGER,
  unlimited_until DATETIME,
  status TEXT NOT NULL CHECK(status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  invoice_number TEXT UNIQUE,
  invoice_url TEXT,
  receipt_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id) ON DELETE RESTRICT
);

-- Table pour les notifications d'expiration
CREATE TABLE IF NOT EXISTS expiration_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  job_offer_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL CHECK(notification_type IN ('warning_7days', 'warning_3days', 'expired')),
  sent_at DATETIME,
  email_status TEXT CHECK(email_status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE
);

-- Ajouter la colonne expires_at aux offres d'emploi
ALTER TABLE job_offers ADD COLUMN expires_at DATETIME;

-- Mettre à jour les offres existantes pour avoir une date d'expiration (created_at + 30 jours)
UPDATE job_offers 
SET expires_at = datetime(created_at, '+30 days')
WHERE expires_at IS NULL;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_user_id ON plan_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_status ON plan_purchases(status);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_stripe_payment_intent ON plan_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_expiration_notifications_job_offer_id ON expiration_notifications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_expiration_notifications_sent_at ON expiration_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_job_offers_expires_at ON job_offers(expires_at);

-- Vue pour les statistiques de crédits par employeur
CREATE VIEW IF NOT EXISTS employer_credit_stats AS
SELECT 
  u.id as user_id,
  u.email,
  u.first_name,
  u.last_name,
  ec.credits_remaining,
  ec.unlimited_until,
  (SELECT COUNT(*) FROM credit_transactions ct WHERE ct.user_id = u.id AND ct.transaction_type = 'purchase') as total_purchases,
  (SELECT COUNT(*) FROM credit_transactions ct WHERE ct.user_id = u.id AND ct.transaction_type = 'deduction') as total_used,
  (SELECT COUNT(*) FROM job_offers jo JOIN companies c ON jo.company_id = c.id WHERE c.user_id = u.id AND jo.status = 'active') as active_jobs,
  (SELECT COUNT(*) FROM job_offers jo JOIN companies c ON jo.company_id = c.id WHERE c.user_id = u.id AND jo.expires_at < datetime('now')) as expired_jobs
FROM users u
LEFT JOIN employer_credits ec ON u.id = ec.user_id
WHERE u.role = 'employer';
