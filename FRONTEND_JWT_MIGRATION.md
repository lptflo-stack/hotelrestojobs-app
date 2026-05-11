# 🔄 Guide de Migration Frontend vers JWT

## ✅ Fichier Créé

**`public/static/auth-jwt.js`** - Module d'authentification JWT complet
- Intercepteurs Axios automatiques
- Gestion du token JWT
- Fonctions helpers (login, register, logout, getCurrentUser)
- Gestion des erreurs 401 (token expiré)

## 📝 Changements Requis par Portail

### 1. Ajouter le Script JWT (TOUS LES PORTAILS)

**Dans `employeur.html`, `candidat.html`, `admin.html`:**

```html
<!-- AVANT (ligne ~628) -->
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<script>

<!-- APRÈS -->
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<script src="/static/auth-jwt.js"></script>
<script>
```

### 2. Remplacer les Appels API

#### Routes à Mettre à Jour

| ❌ Ancienne Route | ✅ Nouvelle Route | Portail |
|------------------|------------------|---------|
| `/api/auth/profile/${currentUser.id}` | `/api/auth/profile` | Tous |
| `/api/jobs/employer/${currentUser.id}` | `/api/jobs/employer/me` | Employeur |
| `/api/applications/candidate/${currentUser.id}` | `/api/applications/candidate/me` | Candidat |
| `/api/pricing/credits/${currentUser.id}` | `/api/pricing/credits/me` | Employeur |
| `/api/pricing/transactions/${currentUser.id}` | `/api/pricing/transactions/me` | Employeur |
| `/api/payments/transactions/${currentUser.id}` | `/api/payments/transactions/me` | Employeur |
| `/api/applications/job/${jobId}?user_id=${currentUser.id}` | `/api/applications/job/${jobId}` | Employeur |
| `/api/jobs/${jobId}?user_id=${currentUser.id}` | `/api/jobs/${jobId}` | Employeur |
| `/api/admin/stats?user_id=${currentUser.id}` | `/api/admin/stats` | Admin |

#### Supprimer les Paramètres `user_id`

Rechercher et supprimer TOUS les:
- `?user_id=${currentUser.id}`
- `&user_id=${currentUser.id}`
- `user_id: currentUser.id,` dans les body JSON

### 3. Mettre à Jour les Fonctions d'Authentification

#### A. Fonction Login (TOUS LES PORTAILS)

**Employeur (employeur.html, ligne ~646):**
```javascript
// ❌ REMPLACER CETTE FONCTION
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await axios.post('/api/auth/login', {
            email,
            password
        });

        if (response.data.success) {
            if (response.data.user.role !== 'employer') {
                errorDiv.textContent = 'Accès réservé aux employeurs uniquement';
                errorDiv.classList.remove('hidden');
                return;
            }

            currentUser = response.data.user;
            localStorage.setItem('employer', JSON.stringify(currentUser));
            showDashboard();
        }
    } catch (error) {
        errorDiv.textContent = error.response?.data?.error || 'Erreur de connexion';
        errorDiv.classList.remove('hidden');
    }
}

// ✅ PAR CETTE VERSION JWT
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const result = await loginUser(email, password, 'employer');
    
    if (result.success) {
        currentUser = result.user;
        showDashboard();
    } else {
        errorDiv.textContent = result.error;
        errorDiv.classList.remove('hidden');
    }
}
```

**Candidat (candidat.html):** Même chose avec `'candidate'`
**Admin (admin.html):** Même chose avec `'admin'`

#### B. Fonction Register (Employeur & Candidat)

```javascript
// ❌ REMPLACER
async function register(event) {
    event.preventDefault();
    // ... validation ...
    
    try {
        const response = await axios.post('/api/auth/register', {
            email, password, first_name, last_name, role: 'employer', phone
        });
        
        if (response.data.success) {
            alert('Compte créé avec succès !');
            showLogin();
            document.getElementById('login-email').value = email;
        }
    } catch (error) {
        // ...
    }
}

// ✅ PAR
async function register(event) {
    event.preventDefault();
    const firstname = document.getElementById('register-firstname').value;
    const lastname = document.getElementById('register-lastname').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');

    const result = await registerUser({
        email,
        password,
        first_name: firstname,
        last_name: lastname,
        role: 'employer', // ou 'candidate'
        phone
    });

    if (result.success) {
        alert(result.message);
        showLogin();
        document.getElementById('login-email').value = email;
    } else {
        errorDiv.textContent = result.error;
        errorDiv.classList.remove('hidden');
    }
}
```

#### C. Vérification au Chargement

**REMPLACER (ligne ~632-638):**
```javascript
// ❌ ANCIEN CODE
window.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('employer');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            showDashboard();
        } catch (e) {
            console.error('Erreur parsing user data');
        }
    }
});

// ✅ NOUVEAU CODE
window.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        currentUser = getCurrentUser();
        showDashboard();
    }
});
```

#### D. Fonction Logout

**REMPLACER:**
```javascript
// ❌ ANCIEN
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('employer');
        currentUser = null;
        window.location.reload();
    }
}

// ✅ NOUVEAU (fonction déjà dans auth-jwt.js)
// Rien à faire, la fonction logout() est déjà disponible globalement
```

### 4. Mettre à Jour les Fonctions Spécifiques

#### Portail Employeur

**A. loadJobs() - ligne ~995:**
```javascript
// ❌ AVANT
const response = await axios.get(`/api/jobs/employer/${currentUser.id}`);

// ✅ APRÈS
const response = await axios.get('/api/jobs/employer/me');
```

**B. createJobOffer() - ligne ~1230:**
```javascript
// ❌ AVANT
const response = await axios.post(`/api/jobs?user_id=${currentUser.id}`, jobData);

// ✅ APRÈS
const response = await axios.post('/api/jobs', jobData);
```

**C. deleteJob() - ligne ~1283:**
```javascript
// ❌ AVANT
await axios.delete(`/api/jobs/${jobId}?user_id=${currentUser.id}`);

// ✅ APRÈS
await axios.delete(`/api/jobs/${jobId}`);
```

**D. loadApplicationsByJob() - ligne ~1321:**
```javascript
// ❌ AVANT
const response = await axios.get(`/api/applications/job/${jobId}?user_id=${currentUser.id}`);

// ✅ APRÈS
const response = await axios.get(`/api/applications/job/${jobId}`);
```

**E. updateApplicationStatus() - ligne ~1412:**
```javascript
// ❌ AVANT
await axios.put(`/api/applications/${appId}/status`, {
    user_id: currentUser.id,
    status: newStatus,
    employer_notes: notes
});

// ✅ APRÈS
await axios.put(`/api/applications/${appId}/status`, {
    status: newStatus,
    employer_notes: notes
});
```

**F. loadCredits() - ligne ~1086:**
```javascript
// ❌ AVANT
const response = await axios.get(`/api/pricing/credits/${currentUser.id}`);

// ✅ APRÈS
const response = await axios.get('/api/pricing/credits/me');
```

**G. loadInvoices() - ligne ~1819:**
```javascript
// ❌ AVANT
const response = await axios.get(`/api/payments/transactions/${currentUser.id}`);

// ✅ APRÈS
const response = await axios.get('/api/payments/transactions/me');
```

**H. orderFeaturedJob() - ligne ~1486:**
```javascript
// ❌ AVANT
await axios.post('/api/featured/order', {
    user_id: currentUser.id,
    job_offer_id: jobId,
    duration_days: duration
});

// ✅ APRÈS
await axios.post('/api/featured/order', {
    job_offer_id: jobId,
    duration_days: duration
});
```

**I. republishJob() - ligne ~1750:**
```javascript
// ❌ AVANT
await axios.post(`/api/jobs/${jobId}/republish`, {
    user_id: currentUser.id
});

// ✅ APRÈS
await axios.post(`/api/jobs/${jobId}/republish`, {});
```

**J. loadCompanyUsers() - ligne ~783:**
```javascript
// ❌ AVANT
const response = await axios.get(`/api/admin/companies/${currentUser.company_id}/users?user_id=${currentUser.id}`);

// ✅ APRÈS  
const response = await axios.get(`/api/admin/companies/${currentUser.company_id}/users`);
```

**K. createCompanyUser() - ligne ~909:**
```javascript
// ❌ AVANT
await axios.post(`/api/admin/companies/${currentUser.company_id}/users?user_id=${currentUser.id}`, data);

// ✅ APRÈS
await axios.post(`/api/admin/companies/${currentUser.company_id}/users`, data);
```

#### Portail Candidat

**A. loadApplications():**
```javascript
// ❌ AVANT
const response = await axios.get(`/api/applications/candidate/${currentUser.id}`);

// ✅ APRÈS
const response = await axios.get('/api/applications/candidate/me');
```

**B. applyToJob():**
```javascript
// ❌ AVANT
await axios.post('/api/applications', {
    user_id: currentUser.id,
    job_offer_id: jobId,
    cover_letter: coverLetter
});

// ✅ APRÈS
await axios.post('/api/applications', {
    job_offer_id: jobId,
    cover_letter: coverLetter
});
```

**C. updateProfile():**
```javascript
// ❌ AVANT
await axios.put(`/api/candidate/profile?user_id=${currentUser.id}`, profileData);

// ✅ APRÈS
await axios.put('/api/candidate/profile', profileData);
```

**D. withdrawApplication():**
```javascript
// ❌ AVANT
await axios.delete(`/api/applications/${appId}?user_id=${currentUser.id}`);

// ✅ APRÈS
await axios.delete(`/api/applications/${appId}`);
```

#### Portail Admin

**A. Toutes les routes admin:**
```javascript
// ❌ AVANT
await axios.get(`/api/admin/stats?user_id=${currentUser.id}`);
await axios.get(`/api/admin/users?user_id=${currentUser.id}`);
// etc.

// ✅ APRÈS (supprimer ?user_id=${currentUser.id} partout)
await axios.get('/api/admin/stats');
await axios.get('/api/admin/users');
// etc.
```

## 🧪 Tests après Migration

### Test 1: Login
1. Ouvrir `/portails/employeur`
2. Se connecter avec `test@test.com` / `test123`
3. Vérifier que:
   - Token stocké: `localStorage.getItem('token')`
   - User stocké: `localStorage.getItem('user')`
   - Dashboard s'affiche

### Test 2: Appels API
1. Ouvrir DevTools → Network
2. Naviguer dans le portail
3. Vérifier que chaque requête contient:
   ```
   Authorization: Bearer eyJhbGc...
   ```

### Test 3: Token Expiré
1. Modifier le token dans localStorage avec une valeur invalide
2. Faire une action (créer offre, etc.)
3. Vérifier que l'utilisateur est déconnecté automatiquement

### Test 4: Routes Protégées
1. Employeur essaie d'accéder `/portails/admin` → Erreur 403
2. Candidat essaie de créer une offre → Erreur 403
3. Non-connecté essaie `/api/jobs/employer/me` → Erreur 401

## 🔧 Commandes Utiles

```bash
# Chercher toutes les occurrences de user_id dans les portails
cd /home/user/webapp/public/portails
grep -n "user_id" *.html

# Chercher toutes les routes API avec :userId
grep -n "/:\w*Id" *.html

# Vérifier que auth-jwt.js est inclus
grep -n "auth-jwt.js" *.html
```

## 📊 Statistique de Migration

### Employeur (employeur.html)
- Lignes totales: 1930
- Fonctions à modifier: ~15
- Routes API à mettre à jour: ~20
- Références user_id: ~30

### Candidat (candidat.html)
- Fonctions à modifier: ~8
- Routes API: ~10
- Références user_id: ~15

### Admin (admin.html)
- Fonctions à modifier: ~5
- Routes API: ~25
- Références user_id: ~40

## ✅ Checklist Finale

- [ ] Script `auth-jwt.js` ajouté dans les 3 portails
- [ ] Fonction `login()` mise à jour (3 portails)
- [ ] Fonction `register()` mise à jour (2 portails)
- [ ] Vérification DOMContentLoaded mise à jour (3 portails)
- [ ] Tous les paramètres `user_id` supprimés
- [ ] Toutes les routes `/:userId` remplacées par `/me`
- [ ] Tests manuels effectués pour chaque portail
- [ ] Aucune erreur 401/403 inattendue

## 🚀 Prochaines Étapes

1. ✅ Migration portail employeur
2. ✅ Migration portail candidat  
3. ✅ Migration portail admin
4. ✅ Tests end-to-end complets
5. ✅ Documentation mise à jour
6. ✅ Commit & déploiement

---

**Note**: Le fichier `auth-jwt.js` gère automatiquement:
- Ajout du token à chaque requête
- Déconnexion sur 401
- Formatage des dates
- Helpers login/register/logout

Il suffit d'appeler les fonctions exposées!
