# 🚀 Guide de Déploiement - HotelRestoJobs

## 📦 Package de Déploiement

**Backup complet disponible:** https://www.genspark.ai/api/files/s/Cyd1puV0

Ce package contient:
- ✅ Code source complet (backend + frontend)
- ✅ Migrations base de données D1
- ✅ Configuration Cloudflare (wrangler.jsonc)
- ✅ Fonctionnalité d'analyse IA opérationnelle
- ✅ Toutes les dépendances (package.json)

---

## 🎯 Méthode 1: Déploiement via Dashboard Cloudflare (Recommandé)

### Prérequis
- Compte Cloudflare avec Pages activé
- Accès à Cloudflare Dashboard

### Étapes

#### 1. Télécharger et extraire le projet
```bash
# Télécharger le backup
wget https://www.genspark.ai/api/files/s/Cyd1puV0 -O hotelrestojobs.tar.gz

# Extraire
tar -xzf hotelrestojobs.tar.gz
cd home/user/webapp
```

#### 2. Créer la base de données D1

**Via Dashboard:**
1. Aller sur https://dash.cloudflare.com
2. Sélectionner votre compte
3. Workers & Pages → D1 SQL Database
4. Cliquer "Create database"
5. Nom: `webapp-production`
6. Copier le Database ID généré

**Via CLI (alternative):**
```bash
npx wrangler d1 create webapp-production
```

#### 3. Créer le bucket R2

**Via Dashboard:**
1. R2 Object Storage → Create bucket
2. Nom: `hotelrestojobs-resumes`

**Via CLI (alternative):**
```bash
npx wrangler r2 bucket create hotelrestojobs-resumes
```

#### 4. Mettre à jour wrangler.jsonc

Remplacer `database_id` avec l'ID réel:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hotelrestojobs",
  "compatibility_date": "2026-02-05",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "VOTRE-DATABASE-ID-ICI"  // ← Remplacer
    }
  ],
  "r2_buckets": [
    {
      "binding": "RESUMES",
      "bucket_name": "hotelrestojobs-resumes"
    }
  ]
}
```

#### 5. Appliquer les migrations D1

```bash
# Migration initiale (toutes les tables)
npx wrangler d1 migrations apply webapp-production

# Vérifier que toutes les migrations sont appliquées
npx wrangler d1 execute webapp-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

**Migrations incluses:**
- `0001_init.sql` - Tables de base (users, companies, jobs)
- `0002_applications.sql` - Système de candidatures
- `0003_featured_jobs.sql` - Offres vedettes
- `0004_candidate_profiles.sql` - Profils candidats
- `0010_ai_analysis.sql` - **Analyse IA** (ai_score, ai_analysis, ai_analyzed_at)

#### 6. Configurer les secrets (Variables d'environnement)

**OpenAI API (pour analyse IA):**
```bash
# Clé API OpenAI (GenSpark LLM Proxy)
npx wrangler pages secret put OPENAI_API_KEY

# Base URL pour OpenAI
npx wrangler pages secret put OPENAI_BASE_URL
# Valeur: https://www.genspark.ai/api/llm_proxy/v1
```

**JWT Secret (pour authentification):**
```bash
npx wrangler pages secret put JWT_SECRET
# Générer une clé forte, ex: openssl rand -base64 32
```

#### 7. Build et déploiement

```bash
# Installer les dépendances
npm install

# Build du projet
npm run build

# Déployer sur Cloudflare Pages
npx wrangler pages deploy dist --project-name=hotelrestojobs
```

#### 8. Configuration du projet Pages

**Via Dashboard:**
1. Workers & Pages → hotelrestojobs
2. Settings → Functions
3. Compatibilité: Ajouter `nodejs_compat`
4. Bindings:
   - D1 Database: `DB` → `webapp-production`
   - R2 Bucket: `RESUMES` → `hotelrestojobs-resumes`
5. Environment Variables:
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `JWT_SECRET`

#### 9. Vérification

Après déploiement, tester:
- ✅ Page d'accueil: `https://hotelrestojobs.pages.dev`
- ✅ API jobs: `https://hotelrestojobs.pages.dev/api/jobs`
- ✅ Portail employeur: `https://hotelrestojobs.pages.dev/portails/employeur.html`
- ✅ Portail candidat: `https://hotelrestojobs.pages.dev/portails/candidat.html`

---

## 🎯 Méthode 2: Déploiement depuis GitHub

### Prérequis
- Repository GitHub avec le code
- Cloudflare Pages connecté à GitHub

### Étapes

#### 1. Pousser le code sur GitHub

```bash
# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit - HotelRestoJobs with AI analysis"

# Ajouter remote GitHub
git remote add origin https://github.com/VOTRE-USERNAME/hotelrestojobs.git
git branch -M main
git push -u origin main
```

#### 2. Créer le projet Cloudflare Pages

**Via Dashboard:**
1. Workers & Pages → Create application
2. Pages → Connect to Git
3. Sélectionner le repository GitHub
4. Configuration:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

#### 3. Variables d'environnement

Ajouter dans Settings → Environment variables:
- `OPENAI_API_KEY` (secret)
- `OPENAI_BASE_URL` = `https://www.genspark.ai/api/llm_proxy/v1`
- `JWT_SECRET` (secret)

#### 4. Bindings

Settings → Functions:
- **D1 Database:**
  - Variable name: `DB`
  - D1 database: `webapp-production`
  
- **R2 Bucket:**
  - Variable name: `RESUMES`
  - R2 bucket: `hotelrestojobs-resumes`

#### 5. Déployer

- Chaque push sur `main` déclenchera un déploiement automatique
- Voir les logs dans Cloudflare Dashboard

---

## 🎯 Méthode 3: Déploiement Local avec Wrangler

### Prérequis
- Node.js installé localement
- Wrangler CLI configuré

### Étapes

```bash
# 1. Extraire le backup
tar -xzf hotelrestojobs.tar.gz
cd home/user/webapp

# 2. Installer dépendances
npm install

# 3. Login Cloudflare
npx wrangler login

# 4. Créer ressources
npx wrangler d1 create webapp-production
npx wrangler r2 bucket create hotelrestojobs-resumes

# 5. Mettre à jour wrangler.jsonc avec database_id

# 6. Appliquer migrations
npx wrangler d1 migrations apply webapp-production

# 7. Build
npm run build

# 8. Déployer
npx wrangler pages deploy dist --project-name=hotelrestojobs

# 9. Ajouter secrets
npx wrangler pages secret put OPENAI_API_KEY --project-name=hotelrestojobs
npx wrangler pages secret put OPENAI_BASE_URL --project-name=hotelrestojobs
npx wrangler pages secret put JWT_SECRET --project-name=hotelrestojobs
```

---

## 🔧 Configuration Post-Déploiement

### 1. Vérifier les migrations D1

```bash
# Lister les tables
npx wrangler d1 execute webapp-production \
  --command="SELECT name FROM sqlite_master WHERE type='table'"

# Vérifier colonne ai_score existe
npx wrangler d1 execute webapp-production \
  --command="PRAGMA table_info(applications)"
```

### 2. Test de l'API

```bash
# Health check
curl https://hotelrestojobs.pages.dev/api/jobs

# Test authentification
curl -X POST https://hotelrestojobs.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Monitorer les logs

```bash
# Logs en temps réel
npx wrangler pages deployment tail --project-name=hotelrestojobs
```

---

## ⚠️ Problèmes Courants

### 1. Erreur "Missing credentials" OpenAI

**Solution:** Vérifier que les secrets sont bien configurés:
```bash
npx wrangler pages secret list --project-name=hotelrestojobs
```

Si manquants, les ajouter:
```bash
npx wrangler pages secret put OPENAI_API_KEY --project-name=hotelrestojobs
npx wrangler pages secret put OPENAI_BASE_URL --project-name=hotelrestojobs
```

### 2. Erreur "Database not found"

**Solution:** Vérifier le binding dans wrangler.jsonc et Dashboard

### 3. Erreur 502 lors de création R2

**Causes possibles:**
- Bucket existe déjà avec ce nom
- Permissions insuffisantes sur le compte
- Limite de quota R2 atteinte

**Solution:** Créer via Dashboard avec un nom différent

### 4. Migration D1 échoue

**Solution:** Appliquer manuellement via Dashboard:
1. D1 → webapp-production → Console
2. Copier-coller le contenu de chaque migration SQL
3. Exécuter dans l'ordre

---

## 📊 Structure des Migrations

### Migration 0010_ai_analysis.sql (Analyse IA)

```sql
-- Ajout des colonnes d'analyse IA
ALTER TABLE applications ADD COLUMN ai_score INTEGER DEFAULT NULL;
ALTER TABLE applications ADD COLUMN ai_analysis TEXT DEFAULT NULL;
ALTER TABLE applications ADD COLUMN ai_analyzed_at DATETIME DEFAULT NULL;

-- Index pour performance (tri par score)
CREATE INDEX IF NOT EXISTS idx_applications_ai_score 
  ON applications(ai_score DESC);
```

Cette migration est **critique** pour la fonctionnalité d'analyse IA.

---

## ✅ Checklist de Déploiement

- [ ] Télécharger et extraire le backup
- [ ] Installer les dépendances (`npm install`)
- [ ] Créer base de données D1 `webapp-production`
- [ ] Créer bucket R2 `hotelrestojobs-resumes`
- [ ] Mettre à jour `wrangler.jsonc` avec database_id réel
- [ ] Appliquer toutes les migrations D1
- [ ] Configurer secrets (OPENAI_API_KEY, OPENAI_BASE_URL, JWT_SECRET)
- [ ] Build du projet (`npm run build`)
- [ ] Déployer sur Cloudflare Pages
- [ ] Configurer bindings (D1 + R2) via Dashboard
- [ ] Tester l'application
- [ ] Vérifier logs pour erreurs

---

## 🎉 Fonctionnalités Déployées

### ✅ Système de Jobs
- Offres d'emploi bilingues (FR/EN)
- Recherche avancée (ville, mots-clés)
- Offres vedettes
- Logos d'entreprise

### ✅ Système de Candidatures
- Dépôt de candidature
- Upload CV (R2)
- Profils candidats
- Statuts de candidature

### ✅ **Analyse IA (Nouvelle fonctionnalité)**
- Score 0-100% par candidature
- Badges colorés (vert/jaune/rouge)
- Analyse détaillée (points forts + points à vérifier)
- Analyse groupée (batch)
- Cache 24h

### ✅ Authentification
- JWT tokens
- Rôles (candidat/employeur/admin)
- Sessions sécurisées

### ✅ Traduction Automatique
- Français ↔ Anglais
- Offres d'emploi bilingues
- Rate limiting

---

## 📞 Support

En cas de problème:
1. Vérifier les logs: `npx wrangler pages deployment tail`
2. Consulter AI_ANALYSIS_FEATURE.md pour détails techniques
3. Vérifier que toutes les migrations sont appliquées
4. Confirmer que les bindings D1/R2 sont corrects

---

**Dernière mise à jour:** 2026-06-07  
**Version:** 1.0.0 (Production Ready)  
**Fonctionnalité IA:** ✅ Opérationnelle
