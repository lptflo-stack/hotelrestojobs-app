# 🚀 Guide de Configuration Cloudflare Pages

## ✅ Ce qui est Déjà Configuré

- ✅ Repository GitHub connecté : `lptflo-stack/hotelrestojobs-app`
- ✅ Build command : `npm run build`
- ✅ Deploy command : `npx wrangler deploy`
- ✅ Production branch : `main`
- ✅ Code poussé sur GitHub (dernier commit : `375432d`)
- ✅ Déploiement automatique déclenché

---

## ⚠️ Configuration Requise (5-10 minutes)

### 1️⃣ Variables d'Environnement (OBLIGATOIRE)

Dans votre interface Cloudflare Pages :

**Variables et secrets** → Cliquer sur le "**+**" → Ajouter ces 3 variables :

```
┌─────────────────────┬───────────────────────────────────────────────────────────────┬──────────────┐
│ Nom                 │ Valeur                                                        │ Environnement│
├─────────────────────┼───────────────────────────────────────────────────────────────┼──────────────┤
│ JWT_SECRET          │ hotelrestojobs_secret_production_2024_minimum_32_chars_long   │ Production ✓ │
├─────────────────────┼───────────────────────────────────────────────────────────────┼──────────────┤
│ OPENAI_API_KEY      │ [Votre clé OpenAI réelle]                                     │ Production ✓ │
├─────────────────────┼───────────────────────────────────────────────────────────────┼──────────────┤
│ OPENAI_BASE_URL     │ https://www.genspark.ai/api/llm_proxy/v1                      │ Production ✓ │
└─────────────────────┴───────────────────────────────────────────────────────────────┴──────────────┘
```

**Important** : Cocher "Production" pour chaque variable !

---

### 2️⃣ Base de Données D1 (OBLIGATOIRE)

#### A. Créer la Base D1

**Option 1 : Via Dashboard Cloudflare** (Recommandé)
1. Aller sur https://dash.cloudflare.com
2. Menu gauche → **D1**
3. Cliquer **Create database**
4. Nom : `hotelrestojobsv1-production`
5. Cliquer **Create**

**Option 2 : Via CLI** (depuis votre machine locale)
```bash
npx wrangler d1 create hotelrestojobsv1-production
```

#### B. Lier la Base au Projet Pages

Dans votre interface Cloudflare Pages :
1. Aller dans **Settings** → **Functions**
2. Section **D1 database bindings**
3. Cliquer **Add binding**
4. Remplir :
   - **Variable name** : `DB`
   - **D1 database** : Sélectionner `hotelrestojobsv1-production`
5. Cliquer **Save**

#### C. Appliquer les Migrations

Une fois la base liée, appliquer les migrations (depuis votre machine locale) :

```bash
# Appliquer toutes les migrations en production
npx wrangler d1 migrations apply hotelrestojobsv1-production

# Vérifier que les tables sont créées
npx wrangler d1 execute hotelrestojobsv1-production \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

### 3️⃣ Bucket R2 pour les CVs (OPTIONNEL - mais recommandé)

#### A. Créer le Bucket R2

**Via CLI** (depuis votre machine locale) :
```bash
npx wrangler r2 bucket create hotelrestojobsv1-resumes
```

**Via Dashboard** :
1. Aller sur https://dash.cloudflare.com
2. Menu gauche → **R2**
3. Cliquer **Create bucket**
4. Nom : `hotelrestojobsv1-resumes`
5. Cliquer **Create bucket**

#### B. Lier le Bucket au Projet Pages

Dans votre interface Cloudflare Pages :
1. Aller dans **Settings** → **Functions**
2. Section **R2 bucket bindings**
3. Cliquer **Add binding**
4. Remplir :
   - **Variable name** : `RESUMES`
   - **R2 bucket** : Sélectionner `hotelrestojobsv1-resumes`
5. Cliquer **Save**

---

### 4️⃣ Redéploiement (OBLIGATOIRE après configuration)

Après avoir configuré les variables et les bindings :

**Dans l'interface Cloudflare Pages** :
1. Aller dans l'onglet **Deployments**
2. Trouver le dernier déploiement
3. Cliquer sur les **3 points** (⋮) à droite
4. Cliquer **Retry deployment**

Ou simplement **attendre le prochain push sur GitHub** (déploiement automatique).

---

## 🧪 Vérification du Déploiement

Une fois le déploiement terminé, votre site sera accessible à une URL comme :

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
curl https://hotelrestojobsv1.pages.dev/metiers/serveur

# 5. Pages villes (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/villes/montreal
curl https://hotelrestojobsv1.pages.dev/villes/quebec

# 6. API test
curl https://hotelrestojobsv1.pages.dev/api/jobs
```

---

## 📊 Checklist de Configuration

### Pré-Configuration ✅
- [x] Repository GitHub connecté
- [x] Build configuré
- [x] Code à jour sur GitHub
- [x] Déploiement automatique déclenché

### Configuration Cloudflare ⏳
- [ ] **Variables d'environnement** configurées (3)
- [ ] **Base D1** créée (`hotelrestojobsv1-production`)
- [ ] **Base D1** liée au projet (binding `DB`)
- [ ] **Migrations D1** appliquées
- [ ] **Bucket R2** créé (`hotelrestojobsv1-resumes`)
- [ ] **Bucket R2** lié au projet (binding `RESUMES`)
- [ ] **Redéploiement** effectué

### Post-Déploiement ⏳
- [ ] Site accessible (URL .pages.dev)
- [ ] Page d'accueil fonctionne
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] Pages métiers fonctionnent (/metiers/*)
- [ ] Pages villes fonctionnent (/villes/*)
- [ ] API fonctionne (/api/jobs)

---

## 🐛 Troubleshooting

### "500 Internal Server Error"
**Cause** : Variables d'environnement manquantes ou base D1 non liée

**Solution** :
1. Vérifier que les 3 variables sont configurées
2. Vérifier que la liaison D1 est active (Settings → Functions)
3. Redéployer

### "Database not found"
**Cause** : Base D1 non créée ou non liée

**Solution** :
1. Créer la base : `npx wrangler d1 create hotelrestojobsv1-production`
2. Lier la base dans Settings → Functions → D1 database bindings
3. Redéployer

### "Table does not exist"
**Cause** : Migrations non appliquées

**Solution** :
```bash
npx wrangler d1 migrations apply hotelrestojobsv1-production
```

### "R2 bucket not found"
**Cause** : Fonctionnalité de CV activée mais bucket R2 non créé

**Solution** :
```bash
npx wrangler r2 bucket create hotelrestojobsv1-resumes
```
Puis lier dans Settings → Functions → R2 bucket bindings

---

## 📚 Ressources

| Ressource | URL |
|-----------|-----|
| **Dashboard Cloudflare** | https://dash.cloudflare.com |
| **Repository GitHub** | https://github.com/lptflo-stack/hotelrestojobs-app |
| **Documentation D1** | https://developers.cloudflare.com/d1/ |
| **Documentation Pages** | https://developers.cloudflare.com/pages/ |
| **Documentation R2** | https://developers.cloudflare.com/r2/ |

---

## 🎯 Résumé des Commandes CLI

Si vous préférez tout faire en CLI depuis votre machine locale :

```bash
# 1. Créer la base D1
npx wrangler d1 create hotelrestojobsv1-production

# 2. Appliquer les migrations
npx wrangler d1 migrations apply hotelrestojobsv1-production

# 3. Créer le bucket R2
npx wrangler r2 bucket create hotelrestojobsv1-resumes

# 4. Lister les projets Pages
npx wrangler pages project list

# 5. Voir les détails du projet
npx wrangler pages project get hotelrestojobsv1

# 6. Configurer une variable (interactif)
npx wrangler pages secret put JWT_SECRET --project-name hotelrestojobsv1
```

**Note** : Les bindings D1 et R2 doivent toujours être configurés via le dashboard Cloudflare Pages (Settings → Functions).

---

## ✅ Prochaines Étapes Après Déploiement

Une fois le site déployé et fonctionnel :

### 1. Soumettre le Sitemap à Google
1. Aller sur https://search.google.com/search-console
2. Ajouter la propriété : `https://hotelrestojobsv1.pages.dev`
3. Vérifier la propriété
4. Soumettre le sitemap : `https://hotelrestojobsv1.pages.dev/sitemap.xml`

### 2. Valider les Données Structurées
1. **Google Rich Results Test** :
   - https://search.google.com/test/rich-results
   - Tester : `https://hotelrestojobsv1.pages.dev/emploi/1`
   - Vérifier que "JobPosting" est détecté ✅

2. **Schema.org Validator** :
   - https://validator.schema.org/
   - Tester les pages d'emplois

### 3. Vérifier Mobile & Performance
1. **Mobile-Friendly Test** :
   - https://search.google.com/test/mobile-friendly

2. **PageSpeed Insights** :
   - https://pagespeed.web.dev/
   - Objectif : Score 90+ sur mobile

---

## 🎉 Statut Actuel

✅ **Code prêt** : Phase 1 SEO complète (5 features)  
✅ **GitHub** : Repository à jour  
✅ **Cloudflare Pages** : Projet connecté  
⏳ **Configuration** : À compléter (variables + D1 + R2)  
⏳ **Déploiement** : En attente de configuration  

**Temps estimé pour compléter** : 5-10 minutes

**Prochaine action** : Configurer les variables d'environnement et la base D1 dans le dashboard Cloudflare Pages

---

**Bon déploiement ! 🚀**
