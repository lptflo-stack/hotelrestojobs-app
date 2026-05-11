#!/usr/bin/env python3
"""
Script de migration automatique du frontend vers JWT
"""
import re
import sys

def migrate_portal(filepath, portal_type):
    """
    Migre un portail vers JWT
    portal_type: 'employer', 'candidate', ou 'admin'
    """
    print(f"\n🔄 Migration de {filepath} ({portal_type})...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = 0
    
    # 1. Ajouter le script auth-jwt.js
    if '/static/auth-jwt.js' not in content:
        content = content.replace(
            '<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>\n    <script>',
            '<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>\n    <script src="/static/auth-jwt.js"></script>\n    <script>'
        )
        changes += 1
        print("  ✅ Script auth-jwt.js ajouté")
    
    # 2. Remplacer les routes API
    routes = [
        (r'/api/auth/profile/\$\{currentUser\.id\}', '/api/auth/profile'),
        (r'/api/jobs/employer/\$\{currentUser\.id\}', '/api/jobs/employer/me'),
        (r'/api/applications/candidate/\$\{currentUser\.id\}', '/api/applications/candidate/me'),
        (r'/api/pricing/credits/\$\{currentUser\.id\}', '/api/pricing/credits/me'),
        (r'/api/pricing/transactions/\$\{currentUser\.id\}', '/api/pricing/transactions/me'),
        (r'/api/payments/transactions/\$\{currentUser\.id\}', '/api/payments/transactions/me'),
    ]
    
    for old, new in routes:
        before = content
        content = re.sub(old, new, content)
        if content != before:
            changes += 1
            print(f"  ✅ Route mise à jour: {new}")
    
    # 3. Supprimer les paramètres user_id
    patterns = [
        r'\?user_id=\$\{currentUser\.id\}',
        r'&user_id=\$\{currentUser\.id\}',
        r'user_id: currentUser\.id,\s*',
        r',\s*user_id: currentUser\.id',
    ]
    
    for pattern in patterns:
        before = content
        content = re.sub(pattern, '', content)
        if content != before:
            changes += 1
    
    print(f"  ✅ Paramètres user_id supprimés")
    
    # 4. Remplacer la vérification localStorage
    old_check = "localStorage.getItem('" + portal_type + "')"
    if old_check in content:
        content = content.replace(
            f"const userData = {old_check};",
            "// Migration JWT: utilise getCurrentUser() au lieu de localStorage"
        )
        content = content.replace(
            "if (userData) {\n                try {\n                    currentUser = JSON.parse(userData);",
            "if (isAuthenticated()) {\n                // Migration JWT\n                currentUser = getCurrentUser();"
        )
        changes += 1
        print(f"  ✅ Vérification localStorage remplacée")
    
    # 5. Mettre à jour la fonction login
    login_pattern = r'async function login\(event\) \{[^}]+axios\.post\(\'/api/auth/login\''
    if re.search(login_pattern, content, re.DOTALL):
        # Remplacer toute la fonction login
        new_login = f'''async function login(event) {{
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            const result = await loginUser(email, password, '{portal_type}');
            
            if (result.success) {{
                currentUser = result.user;
                showDashboard();
            }} else {{
                errorDiv.textContent = result.error;
                errorDiv.classList.remove('hidden');
            }}
        }}'''
        
        # Trouver et remplacer la fonction login complète
        content = re.sub(
            r'async function login\(event\) \{.*?^\s*\}',
            new_login,
            content,
            flags=re.MULTILINE | re.DOTALL,
            count=1
        )
        changes += 1
        print(f"  ✅ Fonction login() mise à jour avec JWT")
    
    # 6. Sauvegarder si des changements ont été faits
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ {changes} changements appliqués à {filepath}")
        return True
    else:
        print(f"\n⚠️  Aucun changement nécessaire pour {filepath}")
        return False

def main():
    portals = [
        ('public/portails/employeur.html', 'employer'),
        ('public/portails/candidat.html', 'candidate'),
        ('public/portails/admin.html', 'admin'),
    ]
    
    print("🔐 Migration Frontend vers JWT")
    print("=" * 50)
    
    total_migrated = 0
    for filepath, portal_type in portals:
        if migrate_portal(filepath, portal_type):
            total_migrated += 1
    
    print("\n" + "=" * 50)
    print(f"✅ {total_migrated}/{len(portals)} portails migrés avec succès!")
    print("\n📋 Prochaines étapes:")
    print("  1. Tester chaque portail manuellement")
    print("  2. Vérifier les logs de la console JavaScript")
    print("  3. Tester les parcours complets (login → actions → logout)")
    print("\n🧪 Pour tester:")
    print("  - Employeur: http://localhost:3000/portails/employeur")
    print("  - Candidat: http://localhost:3000/portails/candidat")
    print("  - Admin: http://localhost:3000/portails/admin")

if __name__ == '__main__':
    main()
