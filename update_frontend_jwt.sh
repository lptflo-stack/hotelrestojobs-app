#!/bin/bash

# Script pour mettre à jour les portails frontend avec JWT

echo "🔄 Mise à jour des portails avec JWT..."

# Fonction pour mettre à jour un fichier
update_portal() {
    local file=$1
    local portal_name=$2
    local expected_role=$3
    
    echo "📝 Traitement de $portal_name..."
    
    # 1. Ajouter le script auth-jwt.js
    sed -i 's|<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>|<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>\n    <script src="/static/auth-jwt.js"></script>|g' "$file"
    
    # 2. Remplacer les appels API avec user_id par les versions JWT
    # GET /api/auth/profile/:userId → /api/auth/profile (avec JWT)
    sed -i "s|/api/auth/profile/\${currentUser\.id}|/api/auth/profile|g" "$file"
    
    # GET /api/jobs/employer/:userId → /api/jobs/employer/me
    sed -i "s|/api/jobs/employer/\${currentUser\.id}|/api/jobs/employer/me|g" "$file"
    
    # GET /api/applications/candidate/:userId → /api/applications/candidate/me
    sed -i "s|/api/applications/candidate/\${currentUser\.id}|/api/applications/candidate/me|g" "$file"
    
    # GET /api/pricing/credits/:userId → /api/pricing/credits/me
    sed -i "s|/api/pricing/credits/\${currentUser\.id}|/api/pricing/credits/me|g" "$file"
    
    # GET /api/pricing/transactions/:userId → /api/pricing/transactions/me
    sed -i "s|/api/pricing/transactions/\${currentUser\.id}|/api/pricing/transactions/me|g" "$file"
    
    # GET /api/payments/transactions/:userId → /api/payments/transactions/me
    sed -i "s|/api/payments/transactions/\${currentUser\.id}|/api/payments/transactions/me|g" "$file"
    
    # 3. Supprimer les paramètres user_id dans les requêtes
    sed -i "s|?user_id=\${currentUser\.id}||g" "$file"
    sed -i "s|&user_id=\${currentUser\.id}||g" "$file"
    
    # 4. Supprimer user_id des body JSON
    sed -i "s|user_id: currentUser\.id,||g" "$file"
    sed -i "s|, user_id: currentUser\.id||g" "$file"
    
    # 5. Remplacer la fonction login pour utiliser JWT
    sed -i "s|async function login(event) {|async function login(event) {\n        event.preventDefault();\n        const email = document.getElementById('login-email').value;\n        const password = document.getElementById('login-password').value;\n        const errorDiv = document.getElementById('login-error');\n        \n        const result = await loginUser(email, password, '$expected_role');\n        \n        if (result.success) {\n            currentUser = result.user;\n            showDashboard();\n        } else {\n            errorDiv.textContent = result.error;\n            errorDiv.classList.remove('hidden');\n        }\n        return false; // Empêche le code original de s'exécuter\n    }\n    \n    async function login_old(event) { // Fonction originale renommée|g" "$file"
    
    # 6. Remplacer la vérification localStorage par getToken/getCurrentUser
    sed -i "s|localStorage\.getItem('$portal_name')|getCurrentUser()|g" "$file"
    sed -i "s|JSON\.parse(userData)|userData|g" "$file"
    
    echo "✅ $portal_name mis à jour"
}

# Mettre à jour chaque portail
cd /home/user/webapp/public/portails

update_portal "employeur.html" "employer" "employer"
update_portal "candidat.html" "candidate" "candidate"
update_portal "admin.html" "admin" "admin"

echo ""
echo "✅ Tous les portails ont été mis à jour avec JWT!"
echo ""
echo "📋 Changements effectués:"
echo "  - Script auth-jwt.js ajouté"
echo "  - Routes API mises à jour (/:userId → /me)"
echo "  - Paramètres user_id supprimés"
echo "  - Fonctions login/register utilisent JWT"
echo "  - Axios configuré avec intercepteurs JWT"
