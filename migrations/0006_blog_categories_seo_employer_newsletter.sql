-- Migration 0006: Blog Categories, SEO, and Employer Newsletter
-- Crée les tables pour catégories, améliore blog avec SEO, et ajoute infolettre employeurs

-- ===== BLOG CATEGORIES =====

-- Table des catégories de blog
CREATE TABLE IF NOT EXISTS blog_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#2563eb', -- Couleur pour l'affichage (hex)
    icon TEXT, -- Icône Font Awesome (ex: "fa-utensils")
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison article-catégorie (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_post_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE,
    UNIQUE(blog_post_id, category_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_post ON blog_post_categories(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category ON blog_post_categories(category_id);

-- ===== SEO ENHANCEMENTS FOR BLOG =====

-- Ajouter colonnes SEO à blog_posts
ALTER TABLE blog_posts ADD COLUMN meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN og_title TEXT; -- Open Graph title
ALTER TABLE blog_posts ADD COLUMN og_description TEXT; -- Open Graph description
ALTER TABLE blog_posts ADD COLUMN og_image TEXT; -- Open Graph image URL
ALTER TABLE blog_posts ADD COLUMN keywords TEXT; -- Mots-clés SEO (séparés par virgules)
ALTER TABLE blog_posts ADD COLUMN canonical_url TEXT; -- URL canonique
ALTER TABLE blog_posts ADD COLUMN reading_time INTEGER DEFAULT 0; -- Temps de lecture en minutes

-- Index pour recherche par mots-clés
CREATE INDEX IF NOT EXISTS idx_blog_posts_keywords ON blog_posts(keywords);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- ===== EMPLOYER NEWSLETTER =====

-- Table des infolettres employeurs (séparée de celle des candidats)
CREATE TABLE IF NOT EXISTS employer_newsletters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    content_html TEXT, -- Contenu HTML complet (peut être généré ou personnalisé)
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    template_type TEXT DEFAULT 'mixed' CHECK(template_type IN ('blog_only', 'jobs_only', 'mixed', 'custom')),
    created_by INTEGER NOT NULL,
    scheduled_at DATETIME,
    sent_at DATETIME,
    recipients_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Articles associés aux infolettres employeurs
CREATE TABLE IF NOT EXISTS employer_newsletter_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsletter_id INTEGER NOT NULL,
    blog_post_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (newsletter_id) REFERENCES employer_newsletters(id) ON DELETE CASCADE,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    UNIQUE(newsletter_id, blog_post_id)
);

-- Logs d'envoi pour employeurs
CREATE TABLE IF NOT EXISTS employer_newsletter_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsletter_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- Employeur destinataire
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    opened_at DATETIME,
    clicked_at DATETIME,
    unsubscribe_token TEXT UNIQUE,
    FOREIGN KEY (newsletter_id) REFERENCES employer_newsletters(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(newsletter_id, user_id)
);

-- Abonnements infolettre employeurs
CREATE TABLE IF NOT EXISTS employer_newsletter_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    subscribed BOOLEAN DEFAULT 1,
    preferences TEXT, -- JSON: {job_alerts: true, blog_updates: true, weekly_digest: true}
    unsubscribe_token TEXT UNIQUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_employer_newsletters_status ON employer_newsletters(status);
CREATE INDEX IF NOT EXISTS idx_employer_newsletters_sent_at ON employer_newsletters(sent_at);
CREATE INDEX IF NOT EXISTS idx_employer_newsletter_logs_newsletter ON employer_newsletter_logs(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_employer_newsletter_logs_user ON employer_newsletter_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_newsletter_subscriptions_user ON employer_newsletter_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_newsletter_subscriptions_subscribed ON employer_newsletter_subscriptions(subscribed);

-- ===== AUTOMATION SETTINGS =====

-- Table de configuration pour automatisation
CREATE TABLE IF NOT EXISTS newsletter_automation_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_audience TEXT NOT NULL CHECK(target_audience IN ('candidates', 'employers')),
    enabled BOOLEAN DEFAULT 0,
    frequency TEXT DEFAULT 'weekly' CHECK(frequency IN ('daily', 'weekly', 'monthly')),
    day_of_week INTEGER, -- 0=dimanche, 1=lundi, etc. (pour weekly)
    day_of_month INTEGER, -- 1-31 (pour monthly)
    time_of_day TEXT DEFAULT '09:00', -- Format HH:MM
    last_sent_at DATETIME,
    next_scheduled_at DATETIME,
    template_type TEXT DEFAULT 'mixed',
    min_articles_required INTEGER DEFAULT 1, -- Nombre minimum d'articles nécessaires
    include_featured_jobs BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(target_audience)
);

-- Insérer configuration par défaut
INSERT OR IGNORE INTO newsletter_automation_settings (target_audience, enabled, frequency, day_of_week, time_of_day)
VALUES 
    ('candidates', 0, 'weekly', 1, '09:00'), -- Lundi 9h
    ('employers', 0, 'weekly', 1, '09:00'); -- Lundi 9h

-- ===== SEED DATA: CATEGORIES =====

-- Catégories par défaut pour le blog
INSERT OR IGNORE INTO blog_categories (name, slug, description, color, icon, display_order) VALUES
    ('Recrutement', 'recrutement', 'Conseils et stratégies de recrutement', '#3b82f6', 'fa-user-plus', 1),
    ('Hôtellerie', 'hotellerie', 'Actualités et tendances du secteur hôtelier', '#8b5cf6', 'fa-hotel', 2),
    ('Restauration', 'restauration', 'Nouveautés et best practices en restauration', '#f59e0b', 'fa-utensils', 3),
    ('Ressources Humaines', 'ressources-humaines', 'Gestion RH et relations employés', '#10b981', 'fa-users', 4),
    ('Gestion du Personnel', 'gestion-personnel', 'Outils et méthodes de gestion d''équipe', '#ef4444', 'fa-users-cog', 5),
    ('Tendances du Marché', 'tendances-marche', 'Analyses et statistiques du marché de l''emploi', '#6366f1', 'fa-chart-line', 6),
    ('Conseils Employeurs', 'conseils-employeurs', 'Guides pratiques pour employeurs', '#ec4899', 'fa-lightbulb', 7),
    ('Formations', 'formations', 'Opportunités de formation et développement', '#14b8a6', 'fa-graduation-cap', 8);
