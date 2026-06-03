# Sprint 2 - Nouvelles Fonctionnalités

## ✅ Sprint 2.1 - Upload CV (COMPLÉTÉ)

### Fonctionnalités implémentées
- **Upload de CV en PDF** (max 5MB) avec Cloudflare R2 Storage
- **Visualisation du CV** pour les candidats et employeurs autorisés
- **Suppression du CV** par le candidat propriétaire
- **Remplacement du CV** existant par un nouveau
- **Contrôle d'accès** : Les employeurs ne peuvent voir que les CVs des candidats qui ont postulé à leurs offres

### Backend (API Routes)
- `POST /api/resume/upload` - Upload d'un CV (candidat uniquement)
- `GET /api/resume/download/:fileName` - Téléchargement d'un CV (avec contrôle d'accès)
- `DELETE /api/resume/delete` - Suppression du CV (candidat uniquement)

### Frontend (Portail Candidat)
- Section "Mon CV" dans l'onglet Profil
- Interface drag-and-drop pour l'upload
- Affichage du CV uploadé avec options Voir/Supprimer
- États de chargement et messages d'erreur

### Configuration
- Binding R2 ajouté dans `wrangler.jsonc`
- Type `RESUMES: R2Bucket` ajouté dans `types.ts`
- Commande PM2 mise à jour pour inclure `--r2=RESUMES`

### Sécurité
- Validation du type de fichier (PDF uniquement)
- Validation de la taille (max 5MB)
- Nom de fichier unique: `cv-{userId}-{timestamp}.pdf`
- Permissions strictes : candidat peut uploader/supprimer son propre CV, employeurs peuvent télécharger les CVs des candidatures

### Notes de déploiement
**IMPORTANT** : En production, vous devez créer le bucket R2 via le dashboard Cloudflare :
1. Aller dans Cloudflare Dashboard > R2
2. Créer un nouveau bucket nommé `hotelrestojobs-resumes`
3. Le bucket sera automatiquement lié via `wrangler.jsonc`

---

## 🔄 Sprint 2.2 - Paiements Stripe (EN COURS)

### Objectif
Intégrer Stripe pour les paiements de forfaits de crédits employeurs.

### Approche
Pour Cloudflare Workers, nous utilisons l'API REST Stripe (pas le SDK Node.js complet) :
- **Stripe API Key** stockée comme variable d'environnement sécurisée
- **Checkout Sessions** pour les paiements
- **Webhooks** pour la confirmation de paiement
- **Mode Test** pour le développement

### À implémenter
- [ ] Configuration Stripe (clé API)
- [ ] Création de Checkout Sessions
- [ ] Gestion des webhooks Stripe
- [ ] Mise à jour des crédits après paiement
- [ ] Historique des transactions
- [ ] Interface de paiement dans portail employeur

---

## ⏳ Sprint 2.3 - Notifications Email (À VENIR)

### Objectif
Système de notifications par email pour :
- Confirmation de candidature (candidat)
- Nouvelle candidature reçue (employeur)
- Changement de statut de candidature
- Expiration d'offre d'emploi

### Services possibles
- SendGrid API
- Resend API
- Mailgun API

---

## ⏳ Sprint 2.4 - Filtres Avancés (À VENIR)

### Objectif
Améliorer la recherche d'emplois avec filtres avancés :
- Fourchette de salaire
- Type d'emploi (temps plein, partiel, contrat)
- Ville/Province
- Type de poste
- Ordre de tri (date, salaire, pertinence)

---

## ⏳ Sprint 2.5 - Statistiques Employeurs (À VENIR)

### Objectif
Tableaux de bord avec statistiques détaillées pour employeurs :
- Nombre de vues par offre
- Taux de clics
- Nombre de candidatures
- Taux de conversion
- Graphiques de tendances
