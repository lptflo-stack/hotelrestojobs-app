-- Migration 0008: Anti-abus système de crédits gratuits
-- Date: 2026-06-05

-- Table de tracking des inscriptions pour anti-abus
CREATE TABLE IF NOT EXISTS employer_registrations_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  company_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour recherche rapide par IP
CREATE INDEX IF NOT EXISTS idx_registrations_ip ON employer_registrations_audit(ip_address);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_registrations_email ON employer_registrations_audit(email);

-- Index pour recherche par date
CREATE INDEX IF NOT EXISTS idx_registrations_date ON employer_registrations_audit(created_at);

-- Modifier la table employer_credits pour ajouter le flag "first_free_credit_used"
ALTER TABLE employer_credits ADD COLUMN first_free_credit_used INTEGER DEFAULT 0;

-- Ajouter commentaire sur le système
-- Ce système permet de:
-- 1. Donner 1 crédit gratuit à l'inscription
-- 2. Tracker les inscriptions par IP pour détecter abus
-- 3. Empêcher création multiple de comptes depuis même IP (max 3 par IP par 24h)
-- 4. Empêcher noms d'entreprise trop similaires

-- Mettre à jour les crédits existants comme ayant déjà utilisé le crédit gratuit
UPDATE employer_credits SET first_free_credit_used = 1 WHERE credits_remaining > 0;
