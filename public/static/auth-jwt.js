/**
 * Système d'authentification JWT pour HotelRestoJobs
 * Utilisé par les 3 portails : employeur, candidat, admin
 */

// Configuration Axios avec intercepteurs JWT
(function() {
    // Intercepteur pour ajouter le token JWT automatiquement
    axios.interceptors.request.use(
        config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    // Intercepteur pour gérer les erreurs d'authentification
    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                // Token expiré ou invalide
                console.log('Token expiré ou invalide - déconnexion');
                clearAuth();
                window.location.reload();
            }
            return Promise.reject(error);
        }
    );
})();

/**
 * Récupère le token JWT stocké
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Récupère l'utilisateur courant depuis localStorage
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Stocke le token et l'utilisateur après connexion réussie
 */
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Efface toutes les données d'authentification
 */
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function isAuthenticated() {
    return !!getToken() && !!getCurrentUser();
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

/**
 * Déconnexion
 */
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        clearAuth();
        window.location.reload();
    }
}

/**
 * Login universel (utilisé par tous les portails)
 */
async function loginUser(email, password, expectedRole) {
    try {
        const response = await axios.post('/api/auth/login', {
            email,
            password
        });

        if (response.data.success) {
            const { token, user } = response.data;

            // Vérifier que le rôle correspond
            if (expectedRole && user.role !== expectedRole) {
                return {
                    success: false,
                    error: `Accès réservé aux ${expectedRole === 'employer' ? 'employeurs' : expectedRole === 'candidate' ? 'candidats' : 'administrateurs'}`
                };
            }

            // Vérifier que le compte est actif
            if (!user.is_active) {
                return {
                    success: false,
                    error: 'Votre compte est désactivé. Contactez l\'administrateur.'
                };
            }

            // Sauvegarder l'authentification
            saveAuth(token, user);

            return {
                success: true,
                user
            };
        }

        return {
            success: false,
            error: 'Email ou mot de passe incorrect'
        };

    } catch (error) {
        console.error('Erreur login:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Erreur lors de la connexion'
        };
    }
}

/**
 * Inscription universelle
 */
async function registerUser(userData) {
    try {
        const response = await axios.post('/api/auth/register', userData);

        if (response.data.success) {
            return {
                success: true,
                message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
            };
        }

        return {
            success: false,
            error: 'Erreur lors de la création du compte'
        };

    } catch (error) {
        console.error('Erreur inscription:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Erreur lors de l\'inscription'
        };
    }
}

/**
 * Récupère le profil utilisateur complet
 */
async function getUserProfile() {
    try {
        const response = await axios.get('/api/auth/profile');
        return response.data;
    } catch (error) {
        console.error('Erreur récupération profil:', error);
        throw error;
    }
}

/**
 * Helper pour formater les dates
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Helper pour formater les dates avec heure
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Log pour debugging
console.log('🔐 Module auth-jwt.js chargé');
console.log('Token présent:', !!getToken());
console.log('Utilisateur:', getCurrentUser());
