-- Migration : Système Newsletter + Blog
-- Créer les tables pour gérer newsletters, blog, et abonnements

-- Table : blog_posts (articles de blog)
CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
    published_at DATETIME,
    views_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Table : newsletters (campagnes newsletter)
CREATE TABLE IF NOT EXISTS newsletters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    template_type TEXT DEFAULT 'mixed' CHECK(template_type IN ('jobs_only', 'blog_only', 'mixed')),
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

CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled_at ON newsletters(scheduled_at);

-- Table : newsletter_blog_articles (liaison newsletter <-> articles blog)
CREATE TABLE IF NOT EXISTS newsletter_blog_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsletter_id INTEGER NOT NULL,
    blog_post_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    UNIQUE(newsletter_id, blog_post_id)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_articles_newsletter ON newsletter_blog_articles(newsletter_id);

-- Table : newsletter_subscriptions (abonnements candidats)
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    subscribed BOOLEAN DEFAULT 1,
    preferences TEXT, -- JSON : {"job_alerts": true, "blog_updates": true, "weekly_digest": true}
    unsubscribe_token TEXT UNIQUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON newsletter_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscribed ON newsletter_subscriptions(subscribed);

-- Table : newsletter_logs (historique des envois)
CREATE TABLE IF NOT EXISTS newsletter_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsletter_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed', 'opened', 'clicked')),
    opened_at DATETIME,
    clicked_at DATETIME,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newsletter_logs_newsletter ON newsletter_logs(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_user ON newsletter_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_status ON newsletter_logs(status);

-- Ajouter une colonne pour les préférences newsletter dans candidate_profiles
ALTER TABLE candidate_profiles ADD COLUMN newsletter_subscribed BOOLEAN DEFAULT 1;
