# 🚀 Guide de Déploiement Cloudflare Pages

## ⚠️ Problème Détecté

Le token API Cloudflare actuel **n'a pas les permissions nécessaires** pour créer/déployer des projets Pages.

**Erreur rencontrée:** `Authentication error [code: 10000]`

---

## ✅ Solution: 3 Options de Déploiement

### Option 1: Via Dashboard Cloudflare (⭐ RECOMMANDÉ - Plus Simple)

C'est la méthode la plus simple et rapide !

#### Étapes:

1. **Télécharger le backup du projet:**
   ```bash
   wget https://www.genspark.ai/api/files/s/LKzlkGGr -O phase1.tar.gz
   tar -xzf phase1.tar.gz
   cd home/user/webapp
   ```

2. **Aller sur Cloudflare Dashboard:**
   - URL: https://dash.cloudflare.com
   - Se connecter avec votre compte

3. **Créer un nouveau projet Pages:**
   - Cliquer sur "Workers & Pages" dans le menu gauche
   - Cliquer sur "Create Application"
   - Sélectionner "Pages"
   - Cliquer sur "Upload assets"

4. **Uploader le dossier `dist/`:**
   - Sélectionner le dossier `dist/` depuis votre ordinateur
   - Nom du projet: `hotelrestojobs`
   - Cliquer sur "Save and Deploy"

5. **Configurer les variables d'environnement:**
   - Une fois déployé, aller dans Settings → Environment Variables
   - Ajouter:
     ```
     JWT_SECRET=your_jwt_secret_here_minimum_32_characters
     OPENAI_API_KEY=your_openai_api_key_here
     OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
     ```
   - Sauvegarder

6. **Lier la base de données D1:**
   - Dans Settings → Functions → D1 database bindings
   - Ajouter:
     - Variable name: `DB`
     - D1 database: Créer ou sélectionner `webapp-production`

7. **Tester le déploiement:**
   - URL fournie: `https://hotelrestojobs.pages.dev` (ou similaire)
   - Tester: `https://votre-url.pages.dev/sitemap.xml`
   - Tester: `https://votre-url.pages.dev/metiers/cuisinier`

---

### Option 2: Créer un Nouveau Token API avec Bonnes Permissions

Si vous préférez déployer via CLI (ligne de commande).

#### Étapes:

1. **Aller sur Cloudflare Dashboard:**
   - https://dash.cloudflare.com/profile/api-tokens

2. **Créer un nouveau token:**
   - Cliquer sur "Create Token"
   - Utiliser le template "Edit Cloudflare Pages"
   - OU créer un Custom Token avec ces permissions:
     ```
     Account - Cloudflare Pages: Edit
     Account - Account Settings: Read
     ```

3. **Copier le token généré**

4. **Dans le projet GenSpark:**
   - Aller dans l'onglet "Deploy"
   - Coller le nouveau token dans "Cloudflare API Token"
   - Sauvegarder

5. **Réessayer le déploiement:**
   ```bash
   cd /home/user/webapp
   npx wrangler pages deploy dist --project-name hotelrestojobs
   ```

---

### Option 3: Via GitHub Actions (Pour CI/CD automatique)

Pour des déploiements automatisés à chaque push.

#### Étapes:

1. **Créer un token Cloudflare API** (comme Option 2)

2. **Configurer GitHub Repository:**
   - Aller dans Settings → Secrets and variables → Actions
   - Ajouter les secrets:
     ```
     CLOUDFLARE_API_TOKEN=votre_token_ici
     CLOUDFLARE_ACCOUNT_ID=8714756c129db7c24aa7ce493489eb81
     ```

3. **Créer `.github/workflows/deploy.yml`:**
   ```yaml
   name: Deploy to Cloudflare Pages

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm install
           
         - name: Build
           run: npm run build
           
         - name: Deploy to Cloudflare Pages
           uses: cloudflare/pages-action@v1
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             projectName: hotelrestojobs
             directory: dist
             gitHubToken: ${{ secrets.GITHUB_TOKEN }}
   ```

4. **Push vers GitHub:**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

5. **Le déploiement se fera automatiquement!**

---

## 🗂️ Contenu du Build (dist/)

Le dossier `dist/` contient tout ce qui doit être déployé:

```
dist/
├── _worker.js           # 354 KB - Backend Cloudflare Worker
├── _routes.json         # Routes configuration
├── portails/
│   ├── admin.html
│   ├── candidat.html
│   └── employeur.html
└── (autres fichiers statiques)
```

---

## 🔐 Variables d'Environnement Requises

Une fois déployé, configurer ces variables dans Cloudflare Dashboard:

### Production (Obligatoire)
```
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
```

### Base de Données (Obligatoire)
```
Binding name: DB
D1 Database: webapp-production
```

### R2 Storage (Si utilisé pour CVs)
```
Binding name: R2
R2 Bucket: webapp-bucket
```

---

## 📊 Post-Déploiement

### 1. Tester les Nouvelles Routes Phase 1

```bash
# Sitemap
curl https://hotelrestojobs.pages.dev/sitemap.xml

# Robots.txt
curl https://hotelrestojobs.pages.dev/robots.txt

# Pages métiers
curl https://hotelrestojobs.pages.dev/metiers/cuisinier
curl https://hotelrestojobs.pages.dev/metiers/serveur

# Pages villes
curl https://hotelrestojobs.pages.dev/villes/montreal
curl https://hotelrestojobs.pages.dev/villes/quebec

# Job detail avec Schema
curl https://hotelrestojobs.pages.dev/emploi/1
```

### 2. Soumettre le Sitemap à Google

1. Aller sur: https://search.google.com/search-console
2. Ajouter votre propriété: `https://hotelrestojobs.pages.dev`
3. Soumettre le sitemap: `https://hotelrestojobs.pages.dev/sitemap.xml`

### 3. Valider Structured Data

1. Google Rich Results Test:
   - https://search.google.com/test/rich-results
   - Tester: `https://hotelrestojobs.pages.dev/emploi/1`
   - Vérifier que "JobPosting" est détecté

2. Schema.org Validator:
   - https://validator.schema.org/
   - Copier le JSON-LD depuis le source HTML
   - Vérifier qu'il n'y a pas d'erreurs

### 4. Configurer la Base de Données D1

Si ce n'est pas déjà fait:

```bash
# Créer la base de données D1
npx wrangler d1 create webapp-production

# Appliquer les migrations
npx wrangler d1 migrations apply webapp-production

# Insérer des données de test (optionnel)
npx wrangler d1 execute webapp-production --file=./seed.sql
```

---

## 🎯 Checklist de Validation

### Fonctionnel
- [ ] Site accessible à l'URL .pages.dev
- [ ] Page d'accueil charge correctement
- [ ] Section emplois vedettes visible avec nouveau design
- [ ] `/sitemap.xml` retourne XML valide
- [ ] `/robots.txt` accessible
- [ ] `/metiers/cuisinier` affiche les emplois
- [ ] `/villes/montreal` affiche les emplois
- [ ] Page emploi affiche structured data

### SEO
- [ ] Sitemap soumis à Google Search Console
- [ ] Structured data validée (Rich Results Test)
- [ ] Meta tags corrects sur toutes les pages
- [ ] Mobile responsive vérifié
- [ ] Core Web Vitals au vert (PageSpeed Insights)

### Configuration
- [ ] Variables d'environnement configurées
- [ ] Base de données D1 liée
- [ ] Migrations appliquées
- [ ] Custom domain configuré (optionnel)

---

## 🐛 Troubleshooting

### Erreur "Worker exceeded CPU time limit"
**Solution:** Optimiser les requêtes DB, ajouter des indexes

### Pages métiers retournent 0 emplois
**Solution:** Vérifier que la DB a des données avec `position_type` correspondant

### Sitemap vide
**Solution:** Vérifier que des emplois existent avec `status='active'`

### Structured data non validée
**Solution:** Vérifier que les emplois ont tous les champs requis (title, description, company_name, city, etc.)

---

## 📞 Support

### Documentation Phase 1
- **PHASE1_RESUME_EXECUTIF.md** - Guide complet en français
- **DEPLOYMENT_PACKAGE.md** - Guide de déploiement détaillé
- **START_HERE.md** - Guide de démarrage rapide

### Logs Cloudflare
Pour voir les logs en temps réel:
```bash
npx wrangler pages deployment tail
```

### Dashboard Cloudflare
- **Pages Projects:** https://dash.cloudflare.com/?to=/:account/pages
- **D1 Database:** https://dash.cloudflare.com/?to=/:account/d1
- **API Tokens:** https://dash.cloudflare.com/profile/api-tokens

---

## ✅ Résumé

### Méthode Recommandée: Dashboard Upload
1. Télécharger backup
2. Extraire et builder localement
3. Upload `dist/` via Cloudflare Dashboard
4. Configurer variables d'environnement
5. Tester et valider

### Temps Estimé
- **Dashboard:** 10 minutes
- **CLI avec nouveau token:** 5 minutes
- **GitHub Actions:** 15 minutes (setup initial)

### URLs Finales
- **Production:** `https://hotelrestojobs.pages.dev`
- **Sitemap:** `https://hotelrestojobs.pages.dev/sitemap.xml`
- **Dashboard:** `https://dash.cloudflare.com`

---

**Status:** ✅ Build réussi (354 KB)  
**Prêt pour:** Upload manuel via Dashboard  
**Backup:** https://www.genspark.ai/api/files/s/LKzlkGGr

**Bon déploiement! 🚀**
