# 🚀 Configuration Cloudflare Pages - Guide Rapide

## ⚙️ ÉTAPE 1 : Configuration du Dashboard Cloudflare

### Dans Cloudflare : Workers & Pages → hotelrestojobsv1 → Settings → Build & deployments

**Build Configuration:**

| Paramètre | Valeur à Configurer |
|-----------|---------------------|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Deploy command** | **(LAISSER VIDE)** |
| **Production branch** | `main` |

### ⚠️ IMPORTANT - Deploy Command

**❌ N'UTILISEZ PAS** : `npx wrangler deploy` (c'est pour Workers, pas Pages)

**✅ RECOMMANDÉ** : Laisser le champ **Deploy command VIDE**
- Cloudflare Pages déploie automatiquement le contenu de `dist/` après le build
- C'est la méthode la plus simple et fiable

**✅ ALTERNATIVE** (si vous devez spécifier une commande) :
```
npx wrangler pages deploy dist --project-name=hotelrestojobsv1
```

---

## 🔐 ÉTAPE 2 : Variables d'Environnement

### Dans Cloudflare : Settings → Environment variables → Production → Add variable

**Ajouter ces 3 variables (cocher "Production")** :

```
Nom: JWT_SECRET
Valeur: hotelrestojobs_secret_production_2024_minimum_32_chars_long
Environnement: ✓ Production

Nom: OPENAI_API_KEY
Valeur: [Votre clé OpenAI réelle]
Environnement: ✓ Production

Nom: OPENAI_BASE_URL
Valeur: https://www.genspark.ai/api/llm_proxy/v1
Environnement: ✓ Production
```

---

## 💾 ÉTAPE 3 : Base de Données D1

### A. Créer la Base D1

**Via Dashboard Cloudflare** :
1. Menu gauche → **D1**
2. Cliquer **Create database**
3. Nom : `hotelrestojobsv1-production`
4. Cliquer **Create**

**OU via CLI** (depuis votre machine) :
```bash
npx wrangler d1 create hotelrestojobsv1-production
```

### B. Lier la Base au Projet Pages

**Dans Cloudflare : Settings → Functions → D1 database bindings → Add binding**

```
Variable name: DB
D1 database: hotelrestojobsv1-production
```

Cliquer **Save**

### C. Appliquer les Migrations

**Depuis votre machine locale** (avec wrangler installé) :

```bash
# Appliquer toutes les migrations
npx wrangler d1 migrations apply hotelrestojobsv1-production

# Vérifier que les tables sont créées
npx wrangler d1 execute hotelrestojobsv1-production \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 📦 ÉTAPE 4 : Bucket R2 (Optionnel - pour CVs)

### A. Créer le Bucket

**Via CLI** (depuis votre machine) :
```bash
npx wrangler r2 bucket create hotelrestojobsv1-resumes
```

### B. Lier le Bucket au Projet

**Dans Cloudflare : Settings → Functions → R2 bucket bindings → Add binding**

```
Variable name: RESUMES
R2 bucket: hotelrestojobsv1-resumes
```

Cliquer **Save**

---

## 🔄 ÉTAPE 5 : Redéployer

Après avoir configuré les variables et bindings :

### Via Dashboard Cloudflare

1. Aller dans **Deployments**
2. Trouver le dernier déploiement
3. Cliquer sur **⋮** (trois points) → **Retry deployment**

### OU via GitHub

Faire un push sur GitHub (déploiement automatique) :

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## ✅ ÉTAPE 6 : Vérification

Votre site sera accessible à :

```
https://hotelrestojobsv1.pages.dev
```

### Tests à Effectuer

```bash
# 1. Page d'accueil
curl https://hotelrestojobsv1.pages.dev/

# 2. Sitemap (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/sitemap.xml

# 3. Robots.txt (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/robots.txt

# 4. Pages métiers (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/metiers/cuisinier

# 5. Pages villes (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/villes/montreal

# 6. API test
curl https://hotelrestojobsv1.pages.dev/api/jobs
```

---

## 📊 Checklist de Configuration

### Configuration Dashboard ⏳
- [ ] Build command : `npm run build` ✓
- [ ] Build output directory : `dist` ✓
- [ ] Deploy command : **(VIDE)** ✓
- [ ] Production branch : `main` ✓
- [ ] Variables d'environnement (3) ajoutées
- [ ] Base D1 créée et liée (binding `DB`)
- [ ] Bucket R2 créé et lié (binding `RESUMES`)
- [ ] Redéploiement effectué

### Post-Déploiement ⏳
- [ ] Site accessible à `.pages.dev`
- [ ] Page d'accueil fonctionne
- [ ] `/sitemap.xml` accessible
- [ ] `/metiers/*` fonctionnent
- [ ] `/villes/*` fonctionnent
- [ ] API `/api/jobs` fonctionne

### SEO Post-Déploiement ⏳
- [ ] Sitemap soumis à Google Search Console
- [ ] Structured data validée (Rich Results Test)
- [ ] Mobile-friendly vérifié
- [ ] PageSpeed Insights testé

---

## 🐛 Troubleshooting Rapide

### "500 Internal Server Error"
→ Variables d'environnement manquantes ou base D1 non liée
→ Vérifier Settings → Environment variables et Settings → Functions

### "Database not found"
→ Base D1 non créée ou non liée
→ Créer la base et ajouter le binding `DB`

### "Table does not exist"
→ Migrations non appliquées
→ Exécuter `npx wrangler d1 migrations apply hotelrestojobsv1-production`

### Build échoue dans Cloudflare
→ Vérifier les logs dans Deployments
→ Tester localement : `npm install && npm run build`

---

## 📚 Documentation Complète

Pour plus de détails, voir :
- `CLOUDFLARE_DEPLOY_CONFIG.md` - Configuration détaillée du déploiement
- `CLOUDFLARE_SETUP_GUIDE.md` - Guide complet de configuration

---

## 🎯 Résumé Ultra-Rapide

**3 étapes essentielles** :

1. **Configuration build** (dans Dashboard) :
   - Build: `npm run build`
   - Output: `dist`
   - Deploy: **(vide)**

2. **Variables** : Ajouter JWT_SECRET, OPENAI_API_KEY, OPENAI_BASE_URL

3. **Base D1** : Créer, lier, appliquer migrations

**Temps estimé** : 5-10 minutes

**URL finale** : `https://hotelrestojobsv1.pages.dev`

---

**Bon déploiement ! 🚀**
