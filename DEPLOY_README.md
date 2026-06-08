# 🚀 Script de Déploiement Automatisé

## Vue d'ensemble

Le fichier `deploy.sh` est un script bash complet qui automatise **100%** du processus de déploiement sur Cloudflare Pages.

## ✨ Ce que fait le script

### 11 Étapes Automatiques

1. **✓ Vérifications** - Node.js, npm, répertoire correct
2. **✓ Installation** - Toutes les dépendances npm
3. **✓ Authentification** - Login Cloudflare automatique
4. **✓ Base de données D1** - Création et configuration automatique du database_id
5. **✓ Bucket R2** - Création du stockage pour les CV
6. **✓ Migrations** - Application de toutes les migrations SQL (incluant analyse IA)
7. **✓ Build** - Compilation du projet
8. **✓ Projet Pages** - Création du projet Cloudflare
9. **✓ Déploiement** - Upload sur Cloudflare Pages
10. **✓ Secrets** - Configuration interactive des variables d'environnement
11. **✓ Vérification** - Test de l'URL de production

## 📋 Prérequis

- ✅ Node.js installé (v16+)
- ✅ npm installé
- ✅ Compte Cloudflare (gratuit OK)
- ✅ Connexion internet

## 🎯 Usage

### Étape 1: Télécharger le projet

```bash
# Téléchargez le backup
wget https://www.genspark.ai/api/files/s/Cyd1puV0 -O hotelrestojobs.tar.gz

# Extrayez
tar -xzf hotelrestojobs.tar.gz

# Allez dans le dossier
cd home/user/webapp
```

### Étape 2: Rendre le script exécutable

```bash
chmod +x deploy.sh
```

### Étape 3: Exécuter le script

```bash
./deploy.sh
```

C'est tout! Le script s'occupe de tout le reste.

## 🎨 Interface du Script

Le script utilise des couleurs pour une lecture facile:

- 🔵 **Bleu** - Titres de sections
- 🟢 **Vert** - Succès
- 🟡 **Jaune** - Avertissements
- 🔴 **Rouge** - Erreurs
- 🟣 **Violet** - Informations
- 🔷 **Cyan** - Étapes en cours

## ⚙️ Configuration Interactive

Lors de l'étape 9, le script vous demandera:

```
Voulez-vous configurer les secrets maintenant? [o/N]:
```

**Si vous répondez "o" (oui):**
- Le script vous demandera votre clé API OpenAI
- Configurera automatiquement OPENAI_BASE_URL
- Générera et configurera JWT_SECRET

**Si vous répondez "N" (non):**
- Le script affichera les commandes à exécuter plus tard
- Vous pourrez configurer les secrets manuellement

## 🔐 Secrets Requis

Le script configure 3 secrets:

| Secret | Description | Valeur |
|--------|-------------|---------|
| `OPENAI_API_KEY` | Clé API OpenAI/GenSpark | Votre clé personnelle |
| `OPENAI_BASE_URL` | URL du proxy LLM | `https://www.genspark.ai/api/llm_proxy/v1` |
| `JWT_SECRET` | Secret pour JWT | Généré automatiquement (32 bytes) |

## 📊 Ce qui est créé

### Ressources Cloudflare

1. **Base de données D1** - `webapp-production`
   - Toutes les tables (users, jobs, applications, etc.)
   - Migration 0010_ai_analysis.sql ⭐ (analyse IA)

2. **Bucket R2** - `hotelrestojobs-resumes`
   - Stockage des CV uploadés

3. **Projet Pages** - `hotelrestojobs`
   - Worker déployé
   - URL: `https://hotelrestojobs.pages.dev` (ou similaire)

### Fichiers Modifiés

- `wrangler.jsonc` - Database ID mis à jour automatiquement
- `wrangler.jsonc.backup` - Backup de l'original

## ✅ Résultat Final

Après exécution réussie, vous obtenez:

```
🌐 URL de production: https://hotelrestojobs-xyz.pages.dev

📍 URLs importantes:
  → Page d'accueil: https://hotelrestojobs-xyz.pages.dev
  → API Jobs: https://hotelrestojobs-xyz.pages.dev/api/jobs
  → Portail Employeur: https://hotelrestojobs-xyz.pages.dev/portails/employeur.html
  → Portail Candidat: https://hotelrestojobs-xyz.pages.dev/portails/candidat.html
```

## 🔍 Vérification Post-Déploiement

Le script vérifie automatiquement:
- ✓ Site accessible
- ✓ Temps de réponse
- ✓ Disponibilité

Mais vous devriez aussi tester manuellement:
1. Créer un compte employeur
2. Poster une offre d'emploi
3. Tester l'analyse IA
4. Uploader un CV

## 🐛 Dépannage

### Erreur: "Node.js n'est pas installé"
**Solution:** Installez Node.js depuis https://nodejs.org

### Erreur: "Échec de l'authentification"
**Solution:** Exécutez `npx wrangler login` manuellement

### Erreur: "Impossible d'extraire le database_id"
**Solution:** Le script continue quand même. Copiez manuellement le database_id dans `wrangler.jsonc`

### Erreur lors des migrations
**Solution:** Appliquez-les manuellement via le Dashboard Cloudflare:
```bash
npx wrangler d1 migrations apply webapp-production --remote
```

### Site pas accessible après déploiement
**Solution:** Attendez 2-3 minutes. Cloudflare propage le déploiement.

## 🔄 Redéploiement

Pour mettre à jour l'application après des modifications:

```bash
# Rebuild
npm run build

# Redéployez
npx wrangler pages deploy dist --project-name hotelrestojobs
```

Ou relancez simplement `./deploy.sh` - le script détecte les ressources existantes et les réutilise.

## 📝 Configuration Manuelle des Secrets

Si vous avez sauté l'étape interactive:

```bash
PROJECT_NAME="hotelrestojobs"

# OPENAI_API_KEY
echo 'VOTRE_CLE_ICI' | npx wrangler pages secret put OPENAI_API_KEY --project-name $PROJECT_NAME

# OPENAI_BASE_URL
echo 'https://www.genspark.ai/api/llm_proxy/v1' | npx wrangler pages secret put OPENAI_BASE_URL --project-name $PROJECT_NAME

# JWT_SECRET (génération aléatoire)
echo $(openssl rand -base64 32) | npx wrangler pages secret put JWT_SECRET --project-name $PROJECT_NAME
```

## 🌐 Domaine Personnalisé

Pour utiliser votre propre domaine:

```bash
# Configurer le domaine
npx wrangler pages domain add votre-domaine.com --project-name hotelrestojobs

# Vérifier le statut
npx wrangler pages domain list --project-name hotelrestojobs
```

**Prérequis:** Votre domaine doit pointer vers les serveurs DNS de Cloudflare.

## 📚 Documentation Complémentaire

- **DEPLOYMENT_GUIDE.md** - Guide détaillé manuel
- **AI_ANALYSIS_FEATURE.md** - Documentation de l'analyse IA
- **AI_ANALYSIS_COMPLETE.md** - Checklist de l'analyse IA
- **README.md** - Vue d'ensemble du projet

## 💡 Conseils

### Premier Déploiement
- Prenez le temps de lire les messages du script
- Notez l'URL de production
- Configurez les secrets immédiatement
- Testez l'application

### Déploiements Suivants
- Le script est plus rapide (réutilise les ressources)
- Pas besoin de reconfigurer les secrets
- Build + déploiement en ~2 minutes

### Développement Local
- Utilisez `npm run dev` pour tester localement
- Le build final est dans le dossier `dist/`
- Les migrations locales sont dans `.wrangler/`

## 🎉 Fonctionnalités Déployées

Après exécution du script, votre application complète est en ligne avec:

- ✅ Système de jobs bilingue (FR/EN)
- ✅ Recherche avancée (ville, mots-clés)
- ✅ Candidatures avec upload CV
- ✅ Authentification JWT (candidat/employeur/admin)
- ✅ Traduction automatique
- ✅ Offres vedettes avec logos
- ✅ **Analyse IA des candidatures** ⭐
  - Score 0-100%
  - Badges colorés (vert/jaune/rouge)
  - Analyse détaillée
  - Analyse groupée

## 📞 Support

En cas de problème:

1. **Logs du script** - Lisez les messages d'erreur
2. **Dashboard Cloudflare** - Vérifiez https://dash.cloudflare.com
3. **Logs Wrangler** - Consultez `.wrangler/logs/`
4. **Documentation** - Consultez DEPLOYMENT_GUIDE.md

## ⏱️ Temps d'Exécution

- **Premier déploiement:** ~10-15 minutes
- **Redéploiements:** ~3-5 minutes
- **Build seul:** ~30 secondes
- **Migrations:** ~30 secondes

## 🏆 Avantages du Script

✅ **Zéro configuration manuelle** - Tout est automatisé  
✅ **Idempotent** - Peut être exécuté plusieurs fois sans problème  
✅ **Résistant aux erreurs** - Vérifie chaque étape  
✅ **Informatif** - Messages clairs à chaque étape  
✅ **Interactif** - Demande confirmation pour les actions importantes  
✅ **Reversible** - Crée des backups automatiques  

## 📄 License

MIT - Libre d'utilisation et modification

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2026-06-07  
**Testé avec:** Node.js v18+, wrangler 4.63.0+
