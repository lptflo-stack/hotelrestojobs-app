# 🚀 Guide de Déploiement - HotelRestoJobs

## 📦 Préparation du code

✅ Le code est prêt et committé sur la branche `main`
✅ Le build a été testé et fonctionne
✅ Tous les tests sont passés avec succès

## 🌐 Déploiement sur Cloudflare Pages

### Option 1 : Via le Dashboard Cloudflare (RECOMMANDÉ)

#### Étape 1 : Connexion à GitHub

1. Allez sur https://dash.cloudflare.com/
2. Sélectionnez votre compte
3. Naviguez vers **Workers & Pages**
4. Cliquez sur **Create application** > **Pages** > **Connect to Git**

#### Étape 2 : Configurer le projet

Lors de la configuration du projet, utilisez ces paramètres :

**Configuration du build :**
```
Project name: hotelrestojobs
Production branch: main
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
```

**Variables d'environnement :**
Aucune variable d'environnement n'est requise pour le moment.

#### Étape 3 : Créer la base de données D1

Après le premier déploiement :

1. Dans le Dashboard Cloudflare, allez sur **Workers & Pages**
2. Cliquez sur **D1** dans le menu latéral
3. Cliquez sur **Create database**
4. Nom : `hotelrestojobs-db`
5. Cliquez sur **Create**

#### Étape 4 : Lier D1 au projet Pages

1. Retournez sur votre projet **hotelrestojobs** dans Pages
2. Allez dans **Settings** > **Functions**
3. Sous **D1 database bindings**, cliquez sur **Add binding**
4. Variable name : `DB`
5. D1 database : Sélectionnez `hotelrestojobs-db`
6. Cliquez sur **Save**

#### Étape 5 : Appliquer les migrations

Via le terminal local avec wrangler :

```bash
# Mettre à jour wrangler.jsonc avec le database_id
# Récupérer le database_id depuis le Dashboard > D1 > hotelrestojobs-db

# Ensuite appliquer les migrations
npx wrangler d1 migrations apply hotelrestojobs-db --remote

# Ou via la console D1 dans le dashboard, exécuter manuellement :
# - 0001_initial_schema.sql
# - 0002_pricing_system.sql
# - 0003_credits_transactions_system.sql
# - 0004_add_company_id_and_is_active.sql
```

#### Étape 6 : Seed les données de test (optionnel)

Si vous voulez les données de test en production :

```bash
npx wrangler d1 execute hotelrestojobs-db --remote --file=./seed.sql
```

### Option 2 : Via wrangler CLI

Si votre token API a les bonnes permissions :

```bash
# 1. Créer le projet Pages
npx wrangler pages project create hotelrestojobs --production-branch main

# 2. Créer la base de données D1
npx wrangler d1 create hotelrestojobs-db

# 3. Mettre à jour wrangler.jsonc avec le database_id

# 4. Déployer
npm run build
npx wrangler pages deploy dist --project-name hotelrestojobs

# 5. Appliquer les migrations
npx wrangler d1 migrations apply hotelrestojobs-db --remote
```

## 🔧 Configuration post-déploiement

### Mise à jour du wrangler.jsonc

Après avoir créé la base de données, mettez à jour `wrangler.jsonc` :

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hotelrestojobs",
  "compatibility_date": "2026-02-05",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "hotelrestojobs-db",
      "database_id": "VOTRE_DATABASE_ID_ICI"
    }
  ]
}
```

### Redéploiement après mise à jour

Chaque fois que vous modifiez le code :

```bash
# 1. Commit vos changements
git add .
git commit -m "Description des changements"
git push origin main

# 2. Le déploiement se fait automatiquement si connecté à Git
# OU manuellement :
npm run build
npx wrangler pages deploy dist --project-name hotelrestojobs
```

## 📊 Migrations de base de données

### Ordre des migrations

1. `0001_initial_schema.sql` - Structure de base
2. `0002_pricing_system.sql` - Système de tarification
3. `0003_credits_transactions_system.sql` - Système de crédits
4. `0004_add_company_id_and_is_active.sql` - Multi-utilisateurs

### Appliquer une nouvelle migration

```bash
# En local (pour tester)
npx wrangler d1 migrations apply hotelrestojobs-db --local

# En production
npx wrangler d1 migrations apply hotelrestojobs-db --remote
```

## 🔐 Sécurité

### Changements recommandés avant production

1. **Mots de passe** : Changer tous les mots de passe de test
   - Admin : `admin@hotelrestojobs.com`
   - Employeurs : `rh@restaurantluxe.com`, etc.

2. **Hash des mots de passe** : Implémenter bcrypt
   ```typescript
   // Remplacer dans auth.ts
   import bcrypt from 'bcryptjs';
   const hash = await bcrypt.hash(password, 10);
   ```

3. **JWT Tokens** : Implémenter pour l'authentification
   ```typescript
   import { sign, verify } from 'hono/jwt';
   ```

4. **Variables d'environnement** : Ajouter dans Pages Settings
   - `JWT_SECRET` : Pour signer les tokens
   - `STRIPE_SECRET_KEY` : Pour les paiements (quand implémenté)

## 🎯 URLs après déploiement

Votre projet sera accessible à :

- **URL de production** : `https://hotelrestojobs.pages.dev`
- **URL custom** (si configuré) : `https://votre-domaine.com`

### Pages du site

- Page d'accueil : `https://hotelrestojobs.pages.dev/`
- Portail Candidat : `https://hotelrestojobs.pages.dev/candidat/login`
- Portail Employeur : `https://hotelrestojobs.pages.dev/employeur/login`
- Portail Admin : `https://hotelrestojobs.pages.dev/admin/login`

## 📈 Monitoring

### Dashboard Cloudflare

Surveillez dans le Dashboard :

1. **Analytics** : Trafic, requêtes, erreurs
2. **Logs** : Logs en temps réel des requêtes
3. **D1 Database** : Utilisation, requêtes SQL
4. **Pages** : Déploiements, builds

### Logs en temps réel

```bash
# Suivre les logs du worker
npx wrangler pages deployment tail --project-name hotelrestojobs
```

## ⚡ Optimisations recommandées

### 1. Custom Domain

Dans Dashboard > Pages > hotelrestojobs > Custom domains :
- Ajouter votre domaine
- Configurer DNS automatiquement

### 2. Cache Headers

Déjà configuré dans le code pour les fichiers statiques.

### 3. Compression

Cloudflare gère automatiquement la compression Brotli/Gzip.

## 🐛 Troubleshooting

### Erreur "Project not found"

Le projet n'existe pas encore. Créez-le via le Dashboard ou wrangler.

### Erreur "Database not found"

La liaison D1 n'est pas configurée. Vérifiez Settings > Functions > D1 bindings.

### Erreur "Authentication error"

Le token API n'a pas les bonnes permissions. Utilisez le Dashboard.

### Migrations échouent

Vérifiez que :
- Le `database_id` est correct dans `wrangler.jsonc`
- Vous utilisez `--remote` pour la production
- Les migrations sont dans l'ordre

## 📝 Checklist de déploiement

- [ ] Code committé et poussé sur GitHub
- [ ] Build testé localement (`npm run build`)
- [ ] Projet Pages créé sur Cloudflare
- [ ] Base de données D1 créée
- [ ] Liaison D1 configurée (binding `DB`)
- [ ] Migrations appliquées en production
- [ ] Données de test insérées (optionnel)
- [ ] Tests effectués sur l'URL de production
- [ ] Mots de passe changés
- [ ] Custom domain configuré (optionnel)
- [ ] Monitoring activé

## 🎉 Félicitations !

Votre application HotelRestoJobs est maintenant déployée sur Cloudflare Pages !

### Prochaines étapes

1. **Intégration Stripe** : Pour les vrais paiements
2. **Emails automatiques** : Notifications et confirmations
3. **Upload de CV** : Stockage dans Cloudflare R2
4. **Amélioration SEO** : Meta tags, sitemap
5. **Tests de charge** : Vérifier la scalabilité

---

**Support** : Pour toute question, consultez la [documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
