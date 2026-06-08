# ⚠️ CONFIGURATION CLOUDFLARE PAGES - CORRECTION CRITIQUE

## 🎯 À CONFIGURER DANS LE DASHBOARD CLOUDFLARE

**Chemin** : Workers & Pages → **hotelrestojobsv1** → **Settings** → **Build & deployments**

---

## ✅ CONFIGURATION EXACTE À APPLIQUER

### 📝 Paramètres de Build

```
Configuration de build
├─ Commande de build
│  npm run build
│
├─ Déployer la commande
│  npx wrangler pages deploy dist --project-name hotelrestojobsv1
│
├─ Commande de version
│  (LAISSER VIDE - ne rien écrire)
│
└─ Répertoire racine
   /
```

---

## ⚠️ CORRECTION CRITIQUE

### ❌ ENLEVER COMPLÈTEMENT (Actuellement dans votre config)

```diff
- Déployer la commande: npx wrangler deploy
- Commande de version: npx wrangler versions upload
```

**Ces commandes sont pour Workers, PAS pour Pages !**

### ✅ REMPLACER PAR

```diff
+ Déployer la commande: npx wrangler pages deploy dist --project-name hotelrestojobsv1
+ Commande de version: (VIDE)
```

---

## 📋 COPIER-COLLER EXACT

### Commande de build
```
npm run build
```

### Déployer la commande
```
npx wrangler pages deploy dist --project-name hotelrestojobsv1
```

### Commande de version
```
(ne rien écrire - laisser le champ vide)
```

### Répertoire racine
```
/
```

---

## 🔧 ÉTAPES DE CONFIGURATION

### 1. Ouvrir la Configuration

1. Aller sur https://dash.cloudflare.com
2. Menu gauche → **Workers & Pages**
3. Cliquer sur **hotelrestojobsv1**
4. Onglet **Settings**
5. Section **Build & deployments**
6. Cliquer sur le bouton **✏️ Edit** (à droite)

### 2. Modifier les Commandes

**Dans le formulaire qui s'ouvre** :

**Champ "Commande de build"** :
- Effacer tout
- Écrire : `npm run build`

**Champ "Déployer la commande"** :
- ⚠️ **SUPPRIMER** : `npx wrangler deploy`
- ✅ **ÉCRIRE** : `npx wrangler pages deploy dist --project-name hotelrestojobsv1`

**Champ "Commande de version"** :
- ⚠️ **SUPPRIMER** : `npx wrangler versions upload`
- ✅ **LAISSER VIDE** (ne rien écrire)

**Champ "Répertoire racine"** :
- Laisser : `/`

### 3. Sauvegarder

Cliquer sur **Save** en bas du formulaire

---

## 🚀 APRÈS MODIFICATION

### Déclencher un Nouveau Déploiement

1. Rester dans le dashboard Cloudflare
2. Aller dans l'onglet **Deployments**
3. Trouver le dernier déploiement dans la liste
4. Cliquer sur les **3 points verticaux** (⋮) à droite
5. Cliquer sur **Retry deployment**

### Attendre le Build

Le déploiement devrait :
- ✅ Commencer à builder (statut "Building")
- ✅ Utiliser la bonne commande `wrangler pages deploy`
- ✅ Se terminer avec succès (statut "Active")

### Vérifier le Site

Une fois "Active", votre site sera accessible à :
```
https://hotelrestojobsv1.pages.dev
```

---

## ✅ CONFIGURATION COMPLÈTE

Une fois les commandes corrigées, complétez aussi :

### Variables d'Environnement (OBLIGATOIRE)

**Settings → Environment variables → Production → Add variable**

```
Variable 1:
Name: JWT_SECRET
Value: hotelrestojobs_secret_production_2024_minimum_32_chars_long
Environment: ☑ Production

Variable 2:
Name: OPENAI_API_KEY
Value: [VOTRE CLÉ OPENAI]
Environment: ☑ Production

Variable 3:
Name: OPENAI_BASE_URL
Value: https://www.genspark.ai/api/llm_proxy/v1
Environment: ☑ Production
```

### Base de Données D1 (OBLIGATOIRE)

**1. Créer la base** :
- Menu gauche → **D1**
- Cliquer **Create database**
- Name : `hotelrestojobsv1-production`
- Cliquer **Create**

**2. Lier au projet** :
- Retour dans **Workers & Pages** → **hotelrestojobsv1**
- **Settings** → **Functions**
- Section **D1 database bindings** → **Add binding**
- Variable name : `DB`
- D1 database : `hotelrestojobsv1-production`
- Cliquer **Save**

**3. Appliquer les migrations** (depuis votre machine locale) :
```bash
npx wrangler d1 migrations apply hotelrestojobsv1-production
```

### Bucket R2 (OPTIONNEL)

**1. Créer le bucket** (depuis votre machine locale) :
```bash
npx wrangler r2 bucket create hotelrestojobsv1-resumes
```

**2. Lier au projet** :
- **Settings** → **Functions**
- Section **R2 bucket bindings** → **Add binding**
- Variable name : `RESUMES`
- R2 bucket : `hotelrestojobsv1-resumes`
- Cliquer **Save**

---

## 🧪 TESTS APRÈS DÉPLOIEMENT

```bash
# Test 1 : Page d'accueil
curl https://hotelrestojobsv1.pages.dev/

# Test 2 : Sitemap (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/sitemap.xml

# Test 3 : Robots.txt (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/robots.txt

# Test 4 : Page métiers (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/metiers/cuisinier

# Test 5 : Page villes (Phase 1 SEO)
curl https://hotelrestojobsv1.pages.dev/villes/montreal

# Test 6 : API
curl https://hotelrestojobsv1.pages.dev/api/jobs
```

---

## 📊 CHECKLIST DE DÉPLOIEMENT

### Configuration Build (CRITIQUE) ⚠️
- [ ] ✏️ Éditer la configuration Build & deployments
- [ ] ❌ Supprimer `npx wrangler deploy`
- [ ] ✅ Mettre `npx wrangler pages deploy dist --project-name hotelrestojobsv1`
- [ ] ❌ Supprimer `npx wrangler versions upload`
- [ ] ✅ Laisser "Commande de version" VIDE
- [ ] 💾 Sauvegarder la configuration

### Variables d'Environnement
- [ ] JWT_SECRET configuré
- [ ] OPENAI_API_KEY configuré
- [ ] OPENAI_BASE_URL configuré

### Base de Données D1
- [ ] Base créée (`hotelrestojobsv1-production`)
- [ ] Binding configuré (`DB`)
- [ ] Migrations appliquées

### Bucket R2 (Optionnel)
- [ ] Bucket créé (`hotelrestojobsv1-resumes`)
- [ ] Binding configuré (`RESUMES`)

### Déploiement
- [ ] Configuration sauvegardée
- [ ] Retry deployment lancé
- [ ] Build terminé avec succès
- [ ] Site accessible

### Vérification
- [ ] Page d'accueil fonctionne
- [ ] Sitemap accessible
- [ ] Pages métiers fonctionnent
- [ ] Pages villes fonctionnent
- [ ] API fonctionne

---

## 🎯 RÉCAPITULATIF ULTRA-SIMPLE

**3 actions critiques** :

1. **Corriger les commandes** dans Build & deployments :
   ```
   Déployer : npx wrangler pages deploy dist --project-name hotelrestojobsv1
   Version  : (VIDE)
   ```

2. **Ajouter 3 variables** d'environnement

3. **Créer et lier** la base D1

**Temps estimé** : 5-10 minutes

**Résultat** : Site déployé à `https://hotelrestojobsv1.pages.dev`

---

## 🆘 EN CAS DE PROBLÈME

### Le déploiement échoue après correction

**Vérifier les logs** :
- Dashboard → Deployments → Cliquer sur le déploiement échoué
- Lire les logs pour identifier l'erreur

**Erreurs courantes** :
- Variables manquantes → Ajouter les 3 variables
- Base D1 non trouvée → Créer et lier la base
- Migrations non appliquées → `wrangler d1 migrations apply`

### "Project not found"

Si vous voyez cette erreur, c'est que le projet n'existe pas encore côté Cloudflare Pages.

**Solution** : Le premier déploiement va le créer automatiquement avec la commande correcte.

### "500 Internal Server Error" sur le site déployé

**Cause** : Variables d'environnement ou base D1 manquante

**Solution** :
1. Vérifier que les 3 variables sont configurées
2. Vérifier que la base D1 est liée
3. Redéployer (Retry deployment)

---

**C'est la configuration exacte à appliquer ! Une fois corrigée, le déploiement fonctionnera. 🚀**
