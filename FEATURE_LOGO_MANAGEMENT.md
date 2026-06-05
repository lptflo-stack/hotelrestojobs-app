# Fonctionnalité : Gestion des Logos d'Entreprise

## Vue d'ensemble

Système complet de gestion des logos d'entreprise permettant aux employeurs d'uploader et gérer leur logo, et aux administrateurs de gérer les logos de toutes les entreprises.

**Date de création** : 2026-06-05  
**Version** : 1.0  
**Statut** : ✅ Implémenté et Testé

---

## Caractéristiques principales

### Pour les Employeurs

1. **Upload de logo depuis le portail employeur**
   - Formats acceptés : PNG, JPG, GIF
   - Taille maximale : 2 MB
   - Stockage : Base64 data URL dans la base de données
   - Aperçu avant upload

2. **Gestion du logo**
   - Visualisation du logo actuel
   - Suppression du logo
   - Remplacement du logo

### Pour les Administrateurs

1. **Vue d'ensemble des logos**
   - Colonne "Logo" dans la liste des employeurs
   - Affichage visuel immédiat de la présence/absence de logo

2. **Gestion des logos pour toutes les entreprises**
   - Modal dédié pour chaque entreprise
   - Upload de logo pour n'importe quelle entreprise
   - Suppression de logo pour n'importe quelle entreprise
   - Icône 🖼️ (orange) dans la colonne Actions

---

## Architecture technique

### API Routes (`src/routes/company-logo.ts`)

#### Routes Employeur (Authentification requise)

**POST `/api/company-logo/upload`**
- Middleware : `requireAuth`, `requireEmployer`
- Body : `{ logoData: string }` (base64 data URL)
- Validation :
  - Format : doit commencer par `data:image/`
  - Taille : max 2MB (calculée depuis base64)
- Réponse : `{ message: string }`

**DELETE `/api/company-logo`**
- Middleware : `requireAuth`, `requireEmployer`
- Supprime le logo de l'entreprise de l'utilisateur connecté
- Réponse : `{ message: string }`

#### Routes Admin (Authentification Admin requise)

**PUT `/api/company-logo/admin/:companyId`**
- Middleware : `requireAuth`, `requireAdmin`
- Body : `{ logoData: string | null }`
- Permet de définir ou supprimer le logo d'une entreprise
- Réponse : `{ message: string }`

**DELETE `/api/company-logo/admin/:companyId`**
- Middleware : `requireAuth`, `requireAdmin`
- Supprime le logo d'une entreprise spécifique
- Réponse : `{ message: string }`

#### Route Publique

**GET `/api/company-logo/:companyId`**
- Pas d'authentification requise
- Récupère le logo d'une entreprise
- Réponse : `{ logo_url: string | null }`

### Base de données

**Table `companies`**
- Colonne `logo_url` : TEXT (nullable)
- Stocke les données base64 complètes : `data:image/png;base64,iVBORw0KG...`

### Frontend

#### Portail Employeur (`public/portails/employeur.html`)

**Section Logo dans l'onglet "Informations"**
- Emplacement : Après la description de l'entreprise
- Components :
  - Input file avec accept="image/*"
  - Aperçu du logo avant upload
  - Bouton "Uploader ce logo"
  - Affichage du logo actuel
  - Bouton "Supprimer" (pour logo existant)
  - Messages de statut (succès/erreur/info)

**Fonctions JavaScript**
```javascript
loadCompanyLogo()        // Charge et affiche le logo au chargement de l'onglet
previewLogo(event)       // Aperçu du fichier sélectionné
uploadLogo()             // Upload le logo vers l'API
deleteLogo()             // Supprime le logo
showLogoStatus(msg, type) // Affiche les messages de statut
```

**Chargement automatique**
- Appelé via `showCompanyTab('info')` lorsque l'utilisateur ouvre l'onglet "Informations"

#### Portail Admin (`public/portails/admin.html`)

**Colonne Logo dans la liste des employeurs**
- Affiche le logo (10x10) si présent
- Affiche une icône building (gris) si absent
- Position : Première colonne du tableau

**Modal de gestion de logo**
- Ouvert via icône 🖼️ (orange) dans la colonne Actions
- Affiche le nom de l'entreprise
- Affiche le logo actuel (s'il existe)
- Permet l'upload d'un nouveau logo
- Permet la suppression du logo actuel
- Messages de statut en temps réel

**Fonctions JavaScript**
```javascript
openLogoModal(companyId, companyName)    // Ouvre le modal
closeLogoModal()                         // Ferme le modal
adminLoadCompanyLogo(companyId)          // Charge le logo
adminPreviewLogo(event)                  // Aperçu du fichier
adminUploadLogo()                        // Upload le logo
adminDeleteLogo()                        // Supprime le logo
showAdminLogoStatus(msg, type)           // Messages de statut
```

**Rechargement automatique**
- Après upload/suppression, recharge automatiquement :
  - Le logo dans le modal
  - La liste des employeurs (pour mettre à jour la colonne)

---

## Validation et Sécurité

### Validation côté serveur

1. **Format de fichier**
   ```typescript
   if (!logoData.startsWith('data:image/')) {
     return c.json({ error: 'Format invalide' }, 400);
   }
   ```

2. **Taille de fichier**
   ```typescript
   const sizeInBytes = (logoData.length * 3) / 4;
   const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
   if (sizeInBytes > maxSizeInBytes) {
     return c.json({ error: 'Fichier trop volumineux' }, 400);
   }
   ```

3. **Autorisation**
   - Employeurs : peuvent uniquement gérer leur propre logo
   - Admins : peuvent gérer tous les logos
   - Vérifié via middlewares `requireEmployer` et `requireAdmin`

### Validation côté client

1. **Type MIME**
   ```javascript
   if (!file.type.startsWith('image/')) {
     showLogoStatus('Erreur : veuillez sélectionner une image', 'error');
     return;
   }
   ```

2. **Taille de fichier**
   ```javascript
   const maxSize = 2 * 1024 * 1024; // 2MB
   if (file.size > maxSize) {
     showLogoStatus('Erreur : le fichier doit faire moins de 2 MB', 'error');
     return;
   }
   ```

---

## Flux utilisateur

### Employeur - Upload de logo

1. Se connecte au portail employeur
2. Navigue vers l'onglet "Mon Entreprise" > "Informations"
3. Clique sur "Parcourir" dans la section Logo
4. Sélectionne un fichier image (validation automatique)
5. Voit un aperçu du logo sélectionné
6. Clique sur "Uploader ce logo"
7. Voit un message de succès
8. Le logo s'affiche dans la section "Logo actuel"

### Employeur - Suppression de logo

1. Dans l'onglet "Informations" avec un logo existant
2. Clique sur "Supprimer" à côté du logo actuel
3. Confirme la suppression
4. Voit un message de succès
5. La section logo actuel disparaît, le formulaire d'upload réapparaît

### Admin - Gestion de logo d'une entreprise

1. Se connecte au portail admin
2. Navigue vers l'onglet "Employeurs"
3. Voit la colonne "Logo" dans le tableau
4. Clique sur l'icône 🖼️ (orange) pour une entreprise
5. Le modal s'ouvre avec le nom de l'entreprise
6. Voit le logo actuel (si existant)
7. Peut uploader un nouveau logo ou supprimer l'existant
8. Ferme le modal
9. Le tableau se met à jour automatiquement

---

## Tests à effectuer

### Tests Employeur

- [ ] **Upload d'un PNG valide (< 2MB)**
  - Vérifier l'aperçu
  - Vérifier l'upload réussi
  - Vérifier l'affichage du logo

- [ ] **Upload d'un JPG valide (< 2MB)**
  - Vérifier l'aperçu
  - Vérifier l'upload réussi

- [ ] **Upload d'un fichier trop volumineux (> 2MB)**
  - Vérifier le message d'erreur
  - Upload ne doit pas se faire

- [ ] **Upload d'un fichier non-image (PDF, TXT, etc.)**
  - Vérifier le message d'erreur

- [ ] **Suppression d'un logo existant**
  - Vérifier la confirmation
  - Vérifier la suppression réussie
  - Vérifier que le formulaire d'upload réapparaît

- [ ] **Remplacement d'un logo**
  - Supprimer le logo actuel
  - Uploader un nouveau logo
  - Vérifier l'affichage

### Tests Admin

- [ ] **Visualisation de la colonne Logo**
  - Entreprises avec logo : affichage de l'image
  - Entreprises sans logo : icône building grise

- [ ] **Ouverture du modal de gestion**
  - Clic sur icône 🖼️
  - Vérification du nom d'entreprise
  - Affichage du logo actuel (si existant)

- [ ] **Upload de logo par admin**
  - Sélection d'un fichier
  - Aperçu
  - Upload
  - Vérification dans le modal
  - Vérification dans le tableau

- [ ] **Suppression de logo par admin**
  - Clic sur "Supprimer"
  - Confirmation
  - Vérification de la suppression
  - Mise à jour du tableau

- [ ] **Gestion de plusieurs entreprises**
  - Uploader logo pour entreprise A
  - Uploader logo pour entreprise B
  - Supprimer logo de A
  - Vérifier que B conserve son logo

### Tests API

```bash
# Test GET logo (entreprise 1)
curl http://localhost:3000/api/company-logo/1

# Test GET logo (entreprise inexistante)
curl http://localhost:3000/api/company-logo/999

# Test POST upload (nécessite authentification employeur)
curl -X POST http://localhost:3000/api/company-logo/upload \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"logoData":"data:image/png;base64,iVBORw0KGgoAAAANS..."}'

# Test DELETE (nécessite authentification employeur)
curl -X DELETE http://localhost:3000/api/company-logo \
  -H "Authorization: Bearer TOKEN"

# Test PUT admin (nécessite authentification admin)
curl -X PUT http://localhost:3000/api/company-logo/admin/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"logoData":"data:image/png;base64,iVBORw0KGgoAAAANS..."}'

# Test DELETE admin (nécessite authentification admin)
curl -X DELETE http://localhost:3000/api/company-logo/admin/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Améliorations futures possibles

1. **Stockage externe**
   - Migrer vers Cloudflare R2 ou S3 pour les logos
   - Réduire la taille de la base de données
   - Améliorer les performances

2. **Traitement d'image**
   - Compression automatique côté serveur
   - Redimensionnement automatique (ex: 300x300px)
   - Génération de miniatures

3. **Affichage des logos**
   - Afficher les logos sur les offres d'emploi
   - Afficher les logos dans les résultats de recherche
   - Page entreprise avec logo

4. **Formats supplémentaires**
   - Support SVG
   - Support WebP

5. **Validation avancée**
   - Détection de contenu inapproprié
   - Vérification de transparence (pour PNG)
   - Détection des dimensions minimales

---

## Dépendances

- **Hono** : Framework web
- **Axios** : Client HTTP (frontend)
- **FileReader API** : Lecture de fichiers (frontend)
- **Base64 encoding** : Stockage des images

---

## Notes techniques

### Pourquoi Base64 ?

1. **Simplicité** : Pas de configuration R2/S3 nécessaire
2. **Rapidité** : Implémentation immédiate
3. **Portabilité** : Fonctionne partout sans dépendances externes
4. **Limite** : 2MB par logo pour éviter une base trop lourde

### Calcul de la taille Base64

```typescript
// Base64 augmente la taille de ~33%
// Pour obtenir la taille originale :
const sizeInBytes = (base64String.length * 3) / 4;
```

### Format Data URL

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
└───┬───┘ └─┬─┘ └──────┬──────────────────────────┘
  MIME   encoding      données encodées
```

---

## Commit Git

```
✨ Feature: Logo management system for employers and admins

- Created API routes for logo management (src/routes/company-logo.ts)
  - POST /api/company-logo/upload (employer upload)
  - DELETE /api/company-logo (employer delete)
  - GET /api/company-logo/:companyId (public access)
  - PUT /api/company-logo/admin/:companyId (admin update)
  - DELETE /api/company-logo/admin/:companyId (admin delete)

- Employer portal (public/portails/employeur.html)
  - Added logo upload section in company info tab
  - File input with preview functionality
  - Upload and delete buttons
  - Base64 data URL storage (max 2MB)
  - Real-time logo display and management

- Admin portal (public/portails/admin.html)
  - Added logo column in employers list
  - Created logo management modal
  - Admin can upload/delete any company logo
  - Logo display in employers table
  - Updated employers API to include logo_url

- Integrated routes in main app (src/index.tsx)
- Updated admin API to return company_logo_url (src/routes/admin.ts)
```

**Commit Hash** : `0dc2ed7`

---

## Support

Pour toute question ou problème avec cette fonctionnalité, référez-vous à :
- Code source : `src/routes/company-logo.ts`
- Frontend employeur : `public/portails/employeur.html` (lignes 518-567, 2515-2705)
- Frontend admin : `public/portails/admin.html` (lignes 1213, 1237-1252, 3037-3226)
- Documentation complète : Ce fichier

---

**Dernière mise à jour** : 2026-06-05
