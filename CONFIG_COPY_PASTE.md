# ⚙️ Configuration Dashboard Cloudflare - À COPIER/COLLER

## 🎯 CONFIGURATION BUILD (Workers & Pages → hotelrestojobsv1 → Settings → Build & deployments)

### Paramètres à Configurer

```
Build command:
npm run build

Build output directory:
dist

Deploy command:
(LAISSER VIDE - ne rien écrire)

Root directory:
/

Production branch:
main
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT (Settings → Environment variables)

### Cliquer sur "Add variable" et ajouter ces 3 variables

**Variable 1:**
```
Name: JWT_SECRET
Value: hotelrestojobs_secret_production_2024_minimum_32_chars_long
Environment: ☑ Production
```

**Variable 2:**
```
Name: OPENAI_API_KEY
Value: [VOTRE CLÉ OPENAI ICI]
Environment: ☑ Production
```

**Variable 3:**
```
Name: OPENAI_BASE_URL
Value: https://www.genspark.ai/api/llm_proxy/v1
Environment: ☑ Production
```

---

## 💾 LIAISON BASE D1 (Settings → Functions → D1 database bindings)

### Cliquer sur "Add binding"

```
Variable name: DB
D1 database: hotelrestojobsv1-production
```

*(Si la base n'existe pas encore, créez-la d'abord dans D1 → Create database)*

---

## 📦 LIAISON BUCKET R2 (Settings → Functions → R2 bucket bindings)

### Cliquer sur "Add binding"

```
Variable name: RESUMES
R2 bucket: hotelrestojobsv1-resumes
```

*(Si le bucket n'existe pas encore, créez-le d'abord dans R2 → Create bucket)*

---

## ✅ APRÈS CONFIGURATION

### Redéployer le projet

1. Aller dans **Deployments**
2. Trouver le dernier déploiement
3. Cliquer sur **⋮** → **Retry deployment**

### URL du site

```
https://hotelrestojobsv1.pages.dev
```

---

## 🧪 TESTS RAPIDES

```bash
# Test page d'accueil
curl https://hotelrestojobsv1.pages.dev/

# Test sitemap
curl https://hotelrestojobsv1.pages.dev/sitemap.xml

# Test page métiers
curl https://hotelrestojobsv1.pages.dev/metiers/cuisinier
```

---

**C'est tout ! Votre site sera déployé automatiquement après cette configuration. 🚀**
