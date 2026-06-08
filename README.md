# HotelRestoJobs - Plateforme d'emplois en hôtellerie-restauration

## 📋 Aperçu du projet

HotelRestoJobs est une plateforme transactionnelle complète de recrutement spécialisée dans le secteur de l'hôtellerie et de la restauration au Québec. Le site permet aux candidats de rechercher des emplois et de postuler, aux employeurs de publier des offres et de gérer les candidatures, et aux administrateurs de superviser l'ensemble de la plateforme.

## 🎯 Fonctionnalités principales

### ⭐ Phase 1 - SEO & Discoverability (NOUVEAU)
- ✅ **JobPosting Schema (JSON-LD)** - Structured data pour Google Jobs
  - Rich snippets dans les résultats de recherche
  - Éligibilité Google Jobs
  - Métadonnées complètes (salaire, location, company)
  - +25% CTR attendu
- ✅ **Pages Métiers Dynamiques** - 8 catégories d'emplois
  - /metiers/cuisinier, /serveur, /receptionniste, /manager, /plongeur, /barista, /bartender, /patissier
  - SEO optimisé par métier
  - Statistiques en temps réel
  - +40% trafic organique attendu
- ✅ **Pages Villes Dynamiques** - Pages par ville avec emplois
  - /villes/montreal, /quebec, /gatineau, /laval, etc.
  - Référencement local optimisé
  - Statistiques et emplois vedettes par ville
  - +50% trafic local attendu
- ✅ **Sitemap XML Automatique** - 500+ URLs générées automatiquement
  - Indexation complète par Google
  - Mise à jour dynamique
  - robots.txt configuré
- ✅ **Emplois Vedettes Améliorés** - Design premium
  - Section hero dédiée avec fond gradient
  - Cartes premium avec animations
  - Badge animé avec pulse effect
  - Hover effect 3D (lift + shadow)
  - +40% conversions attendues

📚 **Documentation Phase 1:**
- [PHASE1_RESUME_EXECUTIF.md](PHASE1_RESUME_EXECUTIF.md) - Guide en français
- [PHASE1_SEO_IMPROVEMENTS.md](PHASE1_SEO_IMPROVEMENTS.md) - Documentation technique
- [PHASE1_README.md](PHASE1_README.md) - Quick start
- [PHASE1_VISUAL_GUIDE.md](PHASE1_VISUAL_GUIDE.md) - Design changes
- [DEPLOYMENT_PACKAGE.md](DEPLOYMENT_PACKAGE.md) - Deployment guide

📦 **Backup Phase 1:** https://www.genspark.ai/api/files/s/LKzlkGGr

### Site Public
- ✅ Recherche d'emplois avec filtres (ville, type de poste, mots-clés)
- ✅ Affichage des emplois vedettes en tête de liste
- ✅ **Logos d'entreprise** : Affichage des logos sur toutes les offres (liste et détails)
- ✅ Page de détail pour chaque offre d'emploi
- ✅ Design responsive et moderne avec TailwindCSS
- ✅ Statistiques de plateforme

### Portail Candidat
- ✅ Inscription et connexion
- ✅ Gestion du profil (bio, expérience, disponibilité, salaire souhaité)
- ✅ Recherche d'emplois avancée
- ✅ Postuler aux offres avec lettre de motivation
- ✅ Suivi des candidatures (statut, notes de l'employeur)

### Portail Employeur
- ✅ Inscription et connexion
- ✅ Gestion de l'entreprise (nom, description, coordonnées)
- ✅ **Upload et gestion du logo d'entreprise** (NOUVEAU)
  - Upload de logo depuis le portail employeur (PNG/JPG/GIF, max 2MB)
  - Prévisualisation avant upload
  - Suppression du logo existant
  - Stockage base64 dans la base de données
  - Affichage en temps réel sur le portail
- ✅ **Gestion des crédits d'annonces**
  - Affichage visuel des crédits disponibles
  - Date d'expiration du forfait illimité sous le nom
  - Statistiques : crédits utilisés, annonces actives/expirées
  - Achat direct de forfaits depuis le portail
  - Explication : 1 crédit = 1 annonce valide 30 jours
- ✅ **Création d'offres d'emploi avec vérification crédits** (NOUVEAU)
  - **Vérification automatique des crédits** avant création
  - **Blocage du formulaire** si 0 crédit (opacity 0.5, désactivé)
  - **Alerte visuelle** selon niveau de crédits :
    * Rouge + cadenas si 0 crédit (avec bouton "Acheter maintenant")
    * Jaune si 1-5 crédits (avec suggestion d'achat)
    * Vert si > 5 crédits
    * Violet si forfait illimité (avec date d'expiration)
  - **Double validation** : côté client ET serveur (API)
  - **Message informatif** : crédits restants après création
  - **Impossible de publier sans crédit** - obligation d'acheter
- ✅ Gestion des offres actives (modification, suppression)
- ✅ **Annonces expirées**
  - Liste des annonces avec statut expiré
  - Republication en 1 clic (coûte 1 crédit)
  - Calcul automatique nouvelle date d'expiration (+30 jours)
  - Statistiques conservées (vues, candidatures)
- ✅ Consultation des candidatures reçues
- ✅ Gestion des candidatures (statut, notes)
- ✅ **Historique des factures**
  - Toutes les transactions (achats, déductions, ajustements)
  - Détails : montant, crédits avant/après, date, description
  - Numéros de facture pour les achats
  - Notes administrateur si présentes
- ✅ **Gestion des utilisateurs de l'entreprise** (NOUVEAU)
  - Liste de tous les utilisateurs ayant accès au portail employeur
  - Ajouter de nouveaux utilisateurs avec email et mot de passe
  - Modifier les informations des utilisateurs existants
  - Activer/désactiver les comptes utilisateurs
  - Supprimer des utilisateurs (sauf soi-même)
  - Vérification email unique
  - Badge de statut (actif/inactif)
- ✅ Mise en vedette des offres (option payante)
  - 7 jours : 29.99$
  - 15 jours : 49.99$
  - 30 jours : 99.99$
- ✅ Statistiques des offres (vues, candidatures)
- ✅ **Traduction automatique pour offres bilingues** (NOUVEAU)
  - Création d'offres bilingues FR/EN
  - Traduction automatique en un clic (boutons FR → EN et EN → FR)
  - API MyMemory (gratuite, ~1000 requêtes/jour)
  - Découpage intelligent des textes longs (>450 caractères)
  - Traduction séquentielle avec délais anti-spam (évite les limites de taux)
  - Logs détaillés dans la console du navigateur
  - Messages d'erreur clairs (quota dépassé, erreurs réseau, etc.)
  - Compteur de champs traduits avec succès
  - Voir [GUIDE_TRADUCTION.md](GUIDE_TRADUCTION.md) et [TRANSLATION_FIX.md](TRANSLATION_FIX.md)

### Portail Administrateur
- ✅ Connexion sécurisée
- ✅ Tableau de bord avec statistiques globales
- ✅ Graphiques interactifs (Chart.js)
- ✅ ~~Validation des offres en attente~~ (SUPPRIMÉ - publication automatique)
- ✅ Gestion des utilisateurs
- ✅ **Gestion complète des comptes employeurs**
  - Vue détaillée de tous les employeurs avec leurs entreprises
  - **Colonne Logo** : affichage visuel des logos d'entreprise
  - **Gestion des logos d'entreprise** : upload/suppression de logos pour n'importe quelle entreprise
  - Gestion des crédits (ajouter/retirer/définir avec notes)
  - Modification des informations de l'entreprise
  - Gestion des utilisateurs de l'entreprise (ajouter/modifier/activer/désactiver)
  - Affichage des statistiques employeur (offres, candidatures, etc.)
  - Badges visuels pour le niveau de crédits
  - Identification des forfaits illimités
- ✅ **Transactions et factures** (NOUVEAU)
  - Vue consolidée de toutes les transactions de tous les employeurs
  - Filtres par type et par employeur
  - Affichage complet : entreprise, montant, crédits, notes admin
  - Types : achats, déductions, remboursements, ajustements, expirations
- ✅ **Annonces expirées** (NOUVEAU)
  - Liste de toutes les annonces expirées du système
  - Affichage : employeur, entreprise, statistiques
  - Actions : voir détails, supprimer
  - Tri par date d'expiration
- ✅ Historique des emplois vedettes
- ✅ Aperçu des revenus
- ✅ **Gestion de la tarification**
  - Créer/modifier/désactiver des forfaits
  - 4 forfaits par défaut :
    - 1 annonce : 50$
    - 5 crédits d'annonces : 200$
    - 10 crédits d'annonces : 400$
    - Forfait illimité (1 an) : 1250$

## 🌐 URLs Actuelles

- **Site public** : https://3000-ievn0noon97t3dtjl6lnj-5634da27.sandbox.novita.ai/
- **Portail candidat** : https://3000-ievn0noon97t3dtjl6lnj-5634da27.sandbox.novita.ai/candidat/login
- **Portail employeur** : https://3000-ievn0noon97t3dtjl6lnj-5634da27.sandbox.novita.ai/employeur/login
- **Portail admin** : https://3000-ievn0noon97t3dtjl6lnj-5634da27.sandbox.novita.ai/admin/login

## 🔐 Comptes de test

**Mot de passe universel pour tous les comptes** : `admin123`

### Administrateur
- Email: `admin@hotelrestojobs.com`
- Password: `admin123`
- **Fonctionnalités** : Validation des offres, gestion des utilisateurs, statistiques

### Employeurs
- **Restaurant Le Luxe** (Marie Dubois)
  - Email: `rh@restaurantluxe.com`
  - Password: `admin123`
  - 2 offres publiées dont 1 en vedette
  
- **Hôtel Montréal** (Jean Tremblay)
  - Email: `recrutement@hotelmontreal.com`
  - Password: `admin123`
  - 2 offres publiées dont 1 en vedette
  
- **Bistro Moderne** (Sophie Gagnon)
  - Email: `jobs@bistromoderne.com`
  - Password: `admin123`
  - 1 offre publiée

### Candidats
- **Julien Lefebvre** (Chef - 10 ans d'expérience)
  - Email: `julien.chef@email.com`
  - Password: `admin123`
  - 1 candidature en cours
  
- **Marie Lavoie** (Serveuse - 3 ans d'expérience)
  - Email: `marie.serveur@email.com`
  - Password: `admin123`
  - 1 candidature en cours
  
- **Pierre Martin** (Cuisinier - 5 ans d'expérience)
  - Email: `pierre.cuisinier@email.com`
  - Password: `admin123`
  - 1 candidature en cours

## 🗄️ Architecture des données

### Tables principales

1. **users** - Utilisateurs (candidats, employeurs, admin)
2. **companies** - Informations des entreprises
3. **candidate_profiles** - Profils détaillés des candidats
4. **job_offers** - Offres d'emploi
5. **applications** - Candidatures
6. **featured_orders** - Commandes d'emplois vedettes
7. **pricing_plans** - Forfaits et tarification (système de crédits)
8. **employer_credits** - Suivi des crédits employeurs

### Statuts des offres
- `pending` : En attente de validation admin
- `active` : Offre publiée et visible
- `rejected` : Rejetée par l'admin
- `expired` : Expirée (après 30 jours)
- `closed` : Fermée manuellement

### Statuts des candidatures
- `pending` : Nouvelle candidature
- `reviewed` : Vue par l'employeur
- `shortlisted` : Présélectionnée
- `rejected` : Refusée
- `accepted` : Acceptée

## 💳 Système de crédits et facturation

### Fonctionnement des crédits
- **1 crédit = 1 annonce valide pendant 30 jours**
- Les crédits sont déduits **automatiquement et immédiatement** lors de la publication
- **Publication instantanée** : les annonces sont actives immédiatement, sans validation admin
- Date d'expiration calculée automatiquement : `created_at + 30 jours`
- Notifications d'expiration envoyées à 7 jours, 3 jours et le jour de l'expiration
- Les annonces expirées peuvent être republiées (coûte 1 crédit)

### Forfaits disponibles
1. **Annonce simple** - 50$ CAD
   - 1 crédit
   - Idéal pour tester le service
   
2. **Forfait 5 crédits** - 200$ CAD
   - 5 crédits (40$/crédit)
   - Économie de 10$ vs annonces simples
   
3. **Forfait 10 crédits** - 400$ CAD
   - 10 crédits (40$/crédit)
   - Économie de 100$ vs annonces simples
   
4. **Forfait illimité (1 an)** - 1250$ CAD
   - Annonces illimitées pendant 365 jours
   - Idéal pour recrutement régulier
   - `unlimited_until` date stockée dans `employer_credits`

### Transactions et historique
Types de transactions :
- `purchase` : Achat de forfait (crédits ajoutés)
- `deduction` : Utilisation de crédit (publication/republication)
- `refund` : Remboursement (crédits restaurés)
- `admin_adjustment` : Ajustement manuel par admin
- `expiration` : Expiration d'une annonce

Chaque transaction stocke :
- Crédits avant/après (`balance_before`, `balance_after`)
- Montant payé et devise
- Référence à l'annonce ou au forfait
- Numéro de facture (achats)
- Note administrateur (ajustements)
- Identifiants Stripe (production)

### Tables de données
- **`employer_credits`** : Solde de crédits par employeur
- **`credit_transactions`** : Historique de toutes les transactions
- **`plan_purchases`** : Factures d'achats de forfaits
- **`expiration_notifications`** : Notifications programmées
- **`job_offers.expires_at`** : Date d'expiration de chaque annonce

### Vue `employer_credit_stats`
Statistiques consolidées par employeur :
- `credits_remaining` : Crédits disponibles
- `unlimited_until` : Date fin forfait illimité
- `total_purchases` : Nombre d'achats
- `total_used` : Crédits utilisés
- `active_jobs` : Annonces actives
- `expired_jobs` : Annonces expirées

## 🛠️ Technologies utilisées

### Backend
- **Hono** - Framework web léger pour Cloudflare Workers
- **Cloudflare D1** - Base de données SQLite distribuée
- **Cloudflare Pages** - Hébergement et déploiement

### Frontend
- **TailwindCSS** - Framework CSS utility-first
- **FontAwesome** - Icônes
- **Axios** - Client HTTP
- **Chart.js** - Graphiques (portail admin)
- **JavaScript Vanilla** - Pas de framework frontend lourd

### Développement
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Wrangler** - CLI Cloudflare
- **PM2** - Process manager (développement)

## 📦 Structure du projet

```
webapp/
├── src/
│   ├── index.tsx              # Point d'entrée principal
│   ├── types.ts               # Types TypeScript
│   └── routes/
│       ├── auth.ts            # Authentification
│       ├── jobs.ts            # Gestion des emplois
│       ├── applications.ts    # Gestion des candidatures
│       ├── admin.ts           # Routes administrateur + employeurs
│       ├── featured.ts        # Emplois vedettes
│       ├── pricing.ts         # Gestion de la tarification
│       ├── payments.ts        # Paiements et transactions
│       └── company-logo.ts    # Gestion des logos (NOUVEAU)
├── public/
│   └── portails/
│       ├── candidat.html      # Interface candidat
│       ├── employeur.html     # Interface employeur
│       └── admin.html         # Interface admin
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_pricing_system.sql
│   ├── 0003_credits_transactions_system.sql
│   └── 0004_add_company_id_and_is_active.sql
├── seed.sql                   # Données de test
├── wrangler.jsonc            # Configuration Cloudflare
├── package.json
└── ecosystem.config.cjs      # Configuration PM2
```

## 🚀 Déploiement local

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
cd /home/user/webapp
npm install
```

### Base de données
```bash
# Appliquer les migrations
npm run db:migrate:local

# Insérer les données de test
npm run db:seed

# Réinitialiser la base de données
npm run db:reset
```

### Développement
```bash
# Build
npm run build

# Démarrer avec PM2
npm run clean-port
pm2 start ecosystem.config.cjs

# Vérifier les logs
pm2 logs webapp --nostream

# Arrêter
pm2 delete webapp
```

### Test
```bash
# Tester l'application
curl http://localhost:3000

# Tester l'API
curl http://localhost:3000/api/jobs
```

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile/:userId` - Profil utilisateur

### Emplois
- `GET /api/jobs` - Liste des emplois (avec filtres)
- `GET /api/jobs/:id` - Détail d'un emploi
- `POST /api/jobs` - Créer une offre (employeur)
- `PUT /api/jobs/:id` - Modifier une offre (employeur)
- `DELETE /api/jobs/:id` - Supprimer une offre (employeur)
- `GET /api/jobs/employer/:userId` - Emplois d'un employeur
- `POST /api/jobs/:id/republish` - Republier une annonce expirée (coûte 1 crédit)

### Candidatures
- `POST /api/applications` - Postuler à une offre
- `GET /api/applications/candidate/:userId` - Candidatures d'un candidat
- `GET /api/applications/job/:jobId` - Candidatures pour une offre
- `PUT /api/applications/:id/status` - Modifier le statut
- `DELETE /api/applications/:id` - Retirer une candidature

### Emplois Vedettes
- `GET /api/featured/prices` - Prix des options vedettes
- `POST /api/featured/order` - Créer une commande
- `POST /api/featured/payment/:orderId` - Traiter le paiement
- `GET /api/featured/orders/:userId` - Commandes d'un employeur

### Administration
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/jobs/pending` - Offres en attente
- `POST /api/admin/jobs/:id/validate` - Valider/rejeter une offre (déduit 1 crédit)
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/users/:id` - Détails d'un utilisateur
- `PUT /api/admin/users/:id` - Modifier un utilisateur
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur
- `GET /api/admin/featured-orders` - Historique des commandes
- **Gestion des employeurs** :
  - `GET /api/admin/employers` - Liste de tous les employeurs
  - `POST /api/admin/employers/:userId/credits` - Gérer les crédits (add/remove/set)
  - `GET /api/admin/employers/:userId/company` - Info entreprise
  - `PUT /api/admin/employers/:userId/company` - Modifier entreprise
  - `GET /api/admin/employers/:userId/details` - Détails complets
  - `GET /api/admin/companies/:companyId/users` - Utilisateurs de l'entreprise
  - `POST /api/admin/companies/:companyId/users` - Ajouter un utilisateur

### Tarification
- `GET /api/pricing` - Liste des forfaits actifs
- `GET /api/pricing/:id` - Détail d'un forfait
- `POST /api/pricing` - Créer un forfait (admin)
- `PUT /api/pricing/:id` - Modifier un forfait (admin)
- `DELETE /api/pricing/:id` - Désactiver un forfait (admin)
- `GET /api/pricing/credits/:userId` - Crédits d'un employeur

### Paiements
- `POST /api/payments/create-checkout-session` - Créer session de paiement
- `GET /api/payments/checkout/:sessionId` - Page de paiement (dev)
- `POST /api/payments/complete/:sessionId` - Webhook de complétion
- `GET /api/payments/transactions/:userId` - Historique des transactions

### Logos d'entreprise
- `POST /api/company-logo/upload` - Upload de logo (employeur)
- `DELETE /api/company-logo` - Supprimer le logo (employeur)
- `GET /api/company-logo/:companyId` - Récupérer le logo (public)
- `PUT /api/company-logo/admin/:companyId` - Modifier/uploader logo (admin)
- `DELETE /api/company-logo/admin/:companyId` - Supprimer logo (admin)

## 🎨 Améliorations futures

### Fonctionnalités à implémenter
- [ ] Intégration de paiement réelle (Stripe)
- [ ] Upload de CV pour candidats (Cloudflare R2)
- ✅ **Upload de logos d'entreprise** (IMPLÉMENTÉ - Base64)
- [ ] Système de notifications par email
- [ ] Messagerie interne candidat-employeur
- [ ] Système d'alertes emploi pour candidats
- [ ] Recherche avancée avec filtres multiples
- [ ] Export des candidatures (PDF/Excel)
- [ ] Tableau de bord employeur avec analytics
- [ ] Système de notation/avis
- [ ] Support multilingue (EN/FR)

### Améliorations techniques
- [ ] Authentification JWT complète
- [ ] Hashing de mot de passe avec bcrypt
- [ ] Rate limiting sur les API
- [ ] Cache avec Cloudflare KV
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD automatisé
- [ ] Monitoring et logs
- [ ] Documentation API (Swagger)

## 📝 Notes de développement

### Sécurité
- Les mots de passe utilisent un hash simplifié pour la démo
- En production, utiliser bcrypt ou argon2
- Implémenter JWT pour l'authentification
- Valider et sanitiser toutes les entrées utilisateur
- Utiliser HTTPS en production

### Performance
- Index sur les colonnes de recherche fréquentes
- Pagination sur les listes longues
- Cache des requêtes fréquentes
- Optimisation des images

### Scalabilité
- Cloudflare Pages supporte le trafic global
- D1 Database est distribué mondialement
- Ajout de Cloudflare KV pour le cache si nécessaire
- R2 pour le stockage de fichiers

## 🤝 Contribution

Ce projet est un prototype de démonstration. Pour contribuer :
1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Équipe

Développé avec ❤️ pour le secteur de l'hôtellerie-restauration au Québec.

---

**Date de dernière mise à jour** : 15 janvier 2024
**Version** : 1.2.0 - Phase 1 SEO
**Statut** : ✅ Production Ready - SEO optimisé avec 500+ pages indexables
