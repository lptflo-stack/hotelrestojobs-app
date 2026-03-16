# HotelRestoJobs - Plateforme d'emplois en hôtellerie-restauration

## 📋 Aperçu du projet

HotelRestoJobs est une plateforme transactionnelle complète de recrutement spécialisée dans le secteur de l'hôtellerie et de la restauration au Québec. Le site permet aux candidats de rechercher des emplois et de postuler, aux employeurs de publier des offres et de gérer les candidatures, et aux administrateurs de superviser l'ensemble de la plateforme.

## 🎯 Fonctionnalités principales

### Site Public
- ✅ Recherche d'emplois avec filtres (ville, type de poste, mots-clés)
- ✅ Affichage des emplois vedettes en tête de liste
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
- ✅ Création d'offres d'emploi détaillées
- ✅ Gestion des offres (modification, suppression)
- ✅ Consultation des candidatures reçues
- ✅ Gestion des candidatures (statut, notes)
- ✅ Mise en vedette des offres (option payante)
  - 7 jours : 29.99$
  - 15 jours : 49.99$
  - 30 jours : 99.99$
- ✅ Statistiques des offres (vues, candidatures)

### Portail Administrateur
- ✅ Connexion sécurisée
- ✅ Tableau de bord avec statistiques globales
- ✅ Graphiques interactifs (Chart.js)
- ✅ Validation des offres en attente
- ✅ Gestion des utilisateurs
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
7. **pricing_plans** - Forfaits et tarification
8. **employer_credits** - Suivi des crédits employeurs
5. **applications** - Candidatures
6. **featured_orders** - Commandes d'emplois vedettes

### Statuts des offres
- `pending` : En attente de validation admin
- `active` : Offre publiée et visible
- `rejected` : Rejetée par l'admin
- `expired` : Expirée
- `closed` : Fermée manuellement

### Statuts des candidatures
- `pending` : Nouvelle candidature
- `reviewed` : Vue par l'employeur
- `shortlisted` : Présélectionnée
- `rejected` : Refusée
- `accepted` : Acceptée

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
│       ├── admin.ts           # Routes administrateur
│       └── featured.ts        # Emplois vedettes
├── public/
│   └── portails/
│       ├── candidat.html      # Interface candidat
│       ├── employeur.html     # Interface employeur
│       └── admin.html         # Interface admin
├── migrations/
│   └── 0001_initial_schema.sql
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
- `POST /api/admin/jobs/:id/validate` - Valider/rejeter une offre
- `GET /api/admin/users` - Liste des utilisateurs
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur
- `GET /api/admin/featured-orders` - Historique des commandes

### Tarification
- `GET /api/pricing` - Liste des forfaits actifs
- `GET /api/pricing/:id` - Détail d'un forfait
- `POST /api/pricing` - Créer un forfait (admin)
- `PUT /api/pricing/:id` - Modifier un forfait (admin)
- `DELETE /api/pricing/:id` - Désactiver un forfait (admin)
- `GET /api/pricing/credits/:userId` - Crédits d'un employeur

## 🎨 Améliorations futures

### Fonctionnalités à implémenter
- [ ] Intégration de paiement réelle (Stripe)
- [ ] Upload de CV et logos d'entreprise (Cloudflare R2)
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

**Date de dernière mise à jour** : 16 mars 2026
**Version** : 1.0.0
**Statut** : ✅ Prototype fonctionnel - Prêt pour démonstration
