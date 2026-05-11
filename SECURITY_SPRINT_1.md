# 🔒 SPRINT 1 - SÉCURISATION

## ✅ Ce qui a été fait (Part 1)

### 1. **Hash sécurisé des mots de passe - TERMINÉ** ✅

- ✅ Installation de `bcryptjs` et `@types/bcryptjs`
- ✅ Remplacement du faux hash `$2a$10$${password}` par `bcrypt.hash()` avec salt de 10
- ✅ Remplacement de la vérification par `bcrypt.compare()`
- ✅ **Fichier modifié** : `src/routes/auth.ts`

**Avant** :
```typescript
function hashPassword(password: string): string {
  return `$2a$10$${password}`; // DANGEREUX
}
```

**Après** :
```typescript
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt); // SÉCURISÉ
}
```

### 2. **Authentification JWT - TERMINÉ** ✅

- ✅ Création du fichier `src/middleware/auth.ts` (4860 caractères)
- ✅ Fonction `generateToken()` : Génère un token JWT valable 24h
- ✅ Middleware `requireAuth()` : Vérifie le token et extrait l'utilisateur
- ✅ Vérification de l'utilisateur actif dans la BDD
- ✅ Token retourné à la connexion dans `POST /api/auth/login`

**Structure du token JWT** :
```typescript
{
  userId: number,
  email: string,
  role: string,
  company_id?: number,
  exp: number // 24 heures
}
```

### 3. **Middlewares de rôle - TERMINÉ** ✅

Créé dans `src/middleware/auth.ts` :

- ✅ `requireAuth` : Vérifie le JWT et charge l'utilisateur
- ✅ `requireAdmin` : Réservé aux admins
- ✅ `requireEmployer` : Réservé aux employeurs
- ✅ `requireCandidate` : Réservé aux candidats
- ✅ `requireEmployerOrAdmin` : Employeurs ou admins
- ✅ `requireCandidateOrAdmin` : Candidats ou admins
- ✅ `getCurrentUser(c)` : Utilitaire pour récupérer l'utilisateur du context

### 4. **Sécurisation de la route profile - TERMINÉ** ✅

- ✅ Ancienne route `GET /api/auth/profile/:userId` marquée comme dépréciée (erreur 410)
- ✅ Nouvelle route `GET /api/auth/profile` protégée par `requireAuth`
- ✅ Plus besoin de passer `user_id` en paramètre
- ✅ L'utilisateur est récupéré depuis le token JWT

---

## 🚧 Ce qui reste à faire (Part 2)

### 5. **Suppression des `user_id` en query params** ⏳

**Fichiers à modifier** (9 occurrences trouvées) :

1. **`src/routes/admin.ts`** (ligne 8)
   - Middleware `requireAdmin` existant à remplacer par le nouveau
   
2. **`src/routes/applications.ts`** (lignes 96, 186)
   - `POST /api/applications` : Utiliser `getCurrentUser(c).userId`
   - `PUT /api/applications/:id/status` : Utiliser `getCurrentUser(c).userId`
   
3. **`src/routes/candidate.ts`** (ligne 9)
   - `PUT /api/candidate/profile` : Utiliser `getCurrentUser(c).userId`
   
4. **`src/routes/jobs.ts`** (lignes 98, 281)
   - `POST /api/jobs` : Utiliser `getCurrentUser(c).userId`
   - `POST /api/jobs/:id/republish` : Utiliser `getCurrentUser(c).userId`
   
5. **`src/routes/pricing.ts`** (lignes 43, 94, 170)
   - `POST /api/pricing` : Protéger avec `requireAdmin`
   - `PUT /api/pricing/:id` : Protéger avec `requireAdmin`
   - `DELETE /api/pricing/:id` : Protéger avec `requireAdmin`

### 6. **Protection de toutes les routes** ⏳

**Routes publiques** (pas de middleware) :
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/jobs` (liste publique)
- `GET /api/jobs/:id` (détail public)
- `GET /api/pricing` (prix publics)

**Routes protégées à sécuriser** :

#### `src/routes/jobs.ts`
- `POST /` → `requireAuth + requireEmployer`
- `PUT /:id` → `requireAuth + requireEmployerOrAdmin`
- `DELETE /:id` → `requireAuth + requireEmployerOrAdmin`
- `GET /employer/:userId` → `requireAuth + requireEmployer` (supprimer param userId)
- `POST /:id/republish` → `requireAuth + requireEmployer`

#### `src/routes/applications.ts`
- `POST /` → `requireAuth + requireCandidate`
- `GET /candidate/:userId` → `requireAuth + requireCandidate` (supprimer param userId)
- `GET /job/:jobId` → `requireAuth + requireEmployerOrAdmin`
- `PUT /:id/status` → `requireAuth + requireEmployerOrAdmin`
- `DELETE /:id` → `requireAuth + (requireCandidate OU requireAdmin)`

#### `src/routes/candidate.ts`
- `PUT /profile` → `requireAuth + requireCandidate` ✅ (déjà fait)

#### `src/routes/admin.ts`
- Toutes les routes → `requireAuth + requireAdmin`

#### `src/routes/featured.ts`
- `GET /prices` → Public
- `POST /order` → `requireAuth + requireEmployer`
- `POST /payment/:orderId` → `requireAuth + requireEmployer`
- `GET /orders/:userId` → `requireAuth + requireEmployer` (supprimer param userId)

#### `src/routes/pricing.ts`
- `GET /` → Public
- `GET /:id` → Public
- `POST /` → `requireAuth + requireAdmin`
- `PUT /:id` → `requireAuth + requireAdmin`
- `DELETE /:id` → `requireAuth + requireAdmin`
- `GET /credits/:userId` → `requireAuth + (supprimer param userId)`
- `GET /transactions/:userId` → `requireAuth + (supprimer param userId)`

#### `src/routes/payments.ts`
- Toutes les routes → `requireAuth + requireEmployer`

### 7. **Mise à jour du frontend** ⏳

**Stockage du token** :
```javascript
// À la connexion, stocker le token
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));

// Pour les requêtes API
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Fichiers frontend à modifier** :
- `public/portails/employeur.html`
- `public/portails/candidat.html`
- `public/portails/admin.html`

**Modifications nécessaires** :
1. Stocker le token à la connexion
2. Ajouter le header `Authorization: Bearer <token>` à toutes les requêtes
3. Supprimer tous les `?user_id=...` des URLs
4. Gérer le rafraîchissement du token (optionnel)
5. Gérer l'expiration du token (déconnexion automatique)

### 8. **Gestion des anciennes données** ⏳

**Mots de passe existants** :
Les mots de passe hashés avec l'ancien système (`$2a$10$admin123`) ne fonctionneront plus.

**Solutions** :
1. **Migration forcée** : Réinitialiser tous les mots de passe
2. **Migration douce** : Détecter l'ancien format et migrer à la connexion

**Script de réinitialisation** :
```bash
# Hasher le nouveau mot de passe "admin123"
# bcrypt.hashSync('admin123', 10) = $2a$10$hash_réel_très_long

UPDATE users SET password_hash = 'nouveau_hash_bcrypt' WHERE id = 1;
```

### 9. **Tests de sécurité** ⏳

**À tester** :
- ✅ Connexion avec bcrypt
- ⏳ Token JWT généré et valide
- ⏳ Routes protégées rejettent les requêtes sans token
- ⏳ Routes protégées rejettent les tokens expirés
- ⏳ Routes protégées rejettent les mauvais rôles
- ⏳ Compte désactivé refuse la connexion
- ⏳ Frontend fonctionne avec les tokens

---

## 📋 Plan d'action Part 2

### Étape 1 : Sécuriser les routes critiques (30 min)
```bash
# Priorité absolue
1. src/routes/jobs.ts → requireEmployer
2. src/routes/applications.ts → requireCandidate/Employer
3. src/routes/admin.ts → requireAdmin
```

### Étape 2 : Mettre à jour le seed.sql (10 min)
```sql
-- Hasher correctement les mots de passe de test
-- Utiliser bcrypt.hashSync('admin123', 10) pour chaque compte
```

### Étape 3 : Mettre à jour le frontend (1h)
```javascript
// Modifier les 3 portails pour :
// - Stocker le token
// - Ajouter Authorization header
// - Supprimer user_id des URLs
```

### Étape 4 : Tests complets (30 min)
```bash
# Tester tous les parcours :
# - Employeur
# - Candidat
# - Admin
```

---

## ⚠️ IMPORTANT

### Avant de déployer en production :

1. **Changer JWT_SECRET** :
   ```typescript
   // Dans middleware/auth.ts
   const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
   ```
   
2. **Ajouter dans Cloudflare Pages Settings** :
   ```
   JWT_SECRET=votre-secret-ultra-securise-aleatoire-long
   ```

3. **Régénérer tous les mots de passe de test** avec bcrypt

4. **Tester l'expiration des tokens** (24h actuellement)

5. **Implémenter refresh token** (optionnel mais recommandé)

---

## 🎯 Objectif Final

- ❌ Plus de `user_id` en query params
- ✅ Tous les mots de passe hashés avec bcrypt
- ✅ Toutes les requêtes authentifiées avec JWT
- ✅ Tous les rôles vérifiés par middleware
- ✅ Comptes désactivés bloqués
- ✅ Tokens expirés rejetés

**Sécurité = Priorité Absolue** 🔒
