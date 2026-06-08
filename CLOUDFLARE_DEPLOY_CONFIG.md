# ⚙️ Configuration Cloudflare Pages - Déploiement Automatique

## 🎯 Configuration Correcte pour le Dashboard Cloudflare

### Dans Cloudflare Dashboard

**Aller dans** : Workers & Pages → `hotelrestojobsv1` → **Settings** → **Build & deployments**

---

## 📝 Configuration Recommandée (Méthode Simple)

### ✅ Option 1 : Déploiement Automatique (Recommandé)

**Build command:**
```
npm run build
```

**Build output directory:**
```
dist
```

**Deploy command:**
```
(laisser VIDE)
```

**Pourquoi laisser vide ?** Cloudflare Pages déploie automatiquement le contenu du dossier `dist` après le build. C'est la méthode la plus simple et la plus fiable.

---

## 🔧 Option 2 : Deploy Command Personnalisé (Si nécessaire)

Si vous devez absolument spécifier une commande de déploiement :

**Build command:**
```
npm run build
```

**Build output directory:**
```
dist
```

**Deploy command:**
```
npx wrangler pages deploy dist --project-name=hotelrestojobsv1
```

**⚠️ Important** : Utilisez `wrangler pages deploy` et **PAS** `wrangler deploy` (qui est pour les Workers, pas Pages).

---

## 📋 Configuration Complète Step-by-Step

### 1. Build Configuration

| Paramètre | Valeur | Explication |
|-----------|--------|-------------|
| **Framework preset** | None (ou Vite) | Détection automatique |
| **Build command** | `npm run build` | Compile le projet avec Vite |
| **Build output directory** | `dist` | Dossier contenant les fichiers buildés |
| **Root directory** | `/` | Racine du repository |

### 2. Branch Configuration

| Paramètre | Valeur |
|-----------|--------|
| **Production branch** | `main` |
| **Preview deployments** | Activé (branches hors production) |

### 3. Environment Variables

**Ajouter dans** : Settings → Environment variables → Production

```
JWT_SECRET = hotelrestojobs_secret_production_2024_minimum_32_chars_long
OPENAI_API_KEY = [Votre clé OpenAI]
OPENAI_BASE_URL = https://www.genspark.ai/api/llm_proxy/v1
```

### 4. Functions Configuration

**Ajouter dans** : Settings → Functions

**D1 Database Bindings:**
- Variable name: `DB`
- D1 database: `hotelrestojobsv1-production`

**R2 Bucket Bindings:**
- Variable name: `RESUMES`
- R2 bucket: `hotelrestojobsv1-resumes`

---

## 🔍 Vérification de la Configuration

### Fichier wrangler.jsonc

Votre fichier `wrangler.jsonc` doit contenir :

```jsonc
{
  "name": "hotelrestojobsv1",
  "pages_build_output_dir": "./dist",  // ← Important pour Pages
  "compatibility_date": "2026-02-05",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "hotelrestojobsv1-production",
      "database_id": "votre-database-id-ici"
    }
  ],
  "r2_buckets": [
    {
      "binding": "RESUMES",
      "bucket_name": "hotelrestojobsv1-resumes"
    }
  ]
}
```

**Note** : La présence de `pages_build_output_dir` indique à Cloudflare que c'est un projet **Pages**, pas un Worker.

### Scripts package.json

Vos scripts doivent utiliser `wrangler pages` :

```json
{
  "scripts": {
    "build": "vite build && npm run copy-static",
    "deploy": "npm run build && wrangler pages deploy dist",
    "deploy:prod": "npm run build && wrangler pages deploy dist --project-name hotelrestojobsv1"
  }
}
```

**✅ Correct** : `wrangler pages deploy`  
**❌ Incorrect** : `wrangler deploy` (c'est pour Workers)

---

## 🚫 Erreurs Courantes à Éviter

### ❌ Erreur 1 : Utiliser `wrangler deploy`

```bash
# ❌ MAUVAIS - Pour Workers uniquement
npx wrangler deploy

# ✅ CORRECT - Pour Pages
npx wrangler pages deploy dist --project-name=hotelrestojobsv1
```

### ❌ Erreur 2 : Oublier `pages_build_output_dir`

Si `wrangler.jsonc` contient `main = "src/index.ts"` sans `pages_build_output_dir`, Cloudflare pense que c'est un Worker.

**Solution** : Ajouter `"pages_build_output_dir": "./dist"`

### ❌ Erreur 3 : Mauvais Build Output Directory

```
# ❌ MAUVAIS
build

# ✅ CORRECT
dist
```

Le dossier doit correspondre à celui configuré dans `vite.config.ts` (`outDir: 'dist'`).

### ❌ Erreur 4 : Deploy Command avec mauvais nom de projet

```bash
# ❌ MAUVAIS - Nom incorrect
npx wrangler pages deploy dist --project-name=hotelrestojobs

# ✅ CORRECT - Nom exact
npx wrangler pages deploy dist --project-name=hotelrestojobsv1
```

---

## 🔄 Workflow de Déploiement

### Déploiement Automatique (GitHub)

1. **Push sur GitHub** :
   ```bash
   git add .
   git commit -m "Update"
   git push origin main
   ```

2. **Cloudflare détecte automatiquement** le push sur la branche `main`

3. **Build automatique** :
   - Exécute : `npm install`
   - Exécute : `npm run build`
   - Produit : `dist/`

4. **Déploiement automatique** :
   - Cloudflare déploie le contenu de `dist/`
   - URL disponible : `https://hotelrestojobsv1.pages.dev`

### Déploiement Manuel (CLI)

```bash
# 1. Build local
npm run build

# 2. Deploy vers Cloudflare
npx wrangler pages deploy dist --project-name=hotelrestojobsv1
```

---

## 🎯 Commandes de Vérification

### Vérifier la configuration locale

```bash
# Vérifier que wrangler.jsonc est valide
cat wrangler.jsonc | grep pages_build_output_dir

# Vérifier que le build produit dist/
npm run build && ls -la dist/

# Vérifier que dist/ contient _worker.js
ls -lh dist/_worker.js
```

### Vérifier le déploiement

```bash
# Lister les projets Pages
npx wrangler pages project list

# Voir les détails du projet
npx wrangler pages project get hotelrestojobsv1

# Voir les déploiements récents
npx wrangler pages deployment list --project-name=hotelrestojobsv1
```

---

## 📊 Comparaison Workers vs Pages

| Caractéristique | Workers | Pages |
|----------------|---------|-------|
| **Commande déploiement** | `wrangler deploy` | `wrangler pages deploy dist` |
| **Configuration** | `main = "src/index.ts"` | `pages_build_output_dir = "./dist"` |
| **Build output** | Un seul fichier bundlé | Dossier avec assets + worker |
| **Assets statiques** | Non supportés directement | Supportés nativement |
| **URL pattern** | `*.workers.dev` | `*.pages.dev` |
| **Cas d'usage** | API pure, backend | Site web, SPA, SSR |

**Notre projet** : Pages (car site web avec assets statiques + API)

---

## ✅ Checklist de Configuration

### Configuration Cloudflare Dashboard
- [ ] Build command : `npm run build`
- [ ] Build output directory : `dist`
- [ ] Deploy command : **(laisser vide)**
- [ ] Production branch : `main`
- [ ] Variables d'environnement ajoutées (3)
- [ ] D1 database liée (binding `DB`)
- [ ] R2 bucket lié (binding `RESUMES`)

### Fichiers Locaux
- [ ] `wrangler.jsonc` contient `pages_build_output_dir`
- [ ] Scripts `package.json` utilisent `wrangler pages`
- [ ] `vite.config.ts` génère dans `dist/`
- [ ] `.gitignore` ignore `dist/` et `.wrangler/`

### Post-Configuration
- [ ] Push sur GitHub pour déclencher auto-deploy
- [ ] Vérifier le build dans Cloudflare Dashboard
- [ ] Tester l'URL : `https://hotelrestojobsv1.pages.dev`
- [ ] Vérifier les logs de déploiement

---

## 🐛 Troubleshooting

### Le déploiement échoue avec "Not a Pages project"

**Cause** : `wrangler.jsonc` manque `pages_build_output_dir`

**Solution** :
```jsonc
{
  "pages_build_output_dir": "./dist"
}
```

### "Project not found"

**Cause** : Le nom du projet ne correspond pas

**Solution** : Vérifier avec `npx wrangler pages project list` et utiliser le nom exact.

### "Build command failed"

**Cause** : Dépendances manquantes ou erreur de build

**Solution** :
1. Vérifier les logs dans Cloudflare Dashboard
2. Tester localement : `npm install && npm run build`
3. Vérifier que `dist/` contient `_worker.js`

### "500 Internal Server Error" après déploiement

**Cause** : Variables d'environnement ou bindings manquants

**Solution** :
1. Ajouter les 3 variables d'environnement
2. Lier la base D1
3. Redéployer

---

## 📚 Ressources Officielles

- **Cloudflare Pages Docs** : https://developers.cloudflare.com/pages/
- **Wrangler Pages Commands** : https://developers.cloudflare.com/workers/wrangler/commands/#pages
- **D1 Database** : https://developers.cloudflare.com/d1/
- **R2 Storage** : https://developers.cloudflare.com/r2/

---

## 🎉 Résumé

**Configuration correcte pour Cloudflare Pages** :

```
Build command:           npm run build
Build output directory:  dist
Deploy command:          (vide)
Production branch:       main
```

**Fichier wrangler.jsonc doit avoir** :
```jsonc
{
  "pages_build_output_dir": "./dist"
}
```

**Scripts package.json doivent utiliser** :
```bash
wrangler pages deploy dist
```

**PAS** `wrangler deploy` (Workers uniquement).

---

**Bon déploiement ! 🚀**
