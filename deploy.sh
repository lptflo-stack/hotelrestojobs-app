#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# Script de Déploiement Automatisé - HotelRestoJobs
# ═══════════════════════════════════════════════════════════════════════
#
# Ce script déploie automatiquement votre application sur Cloudflare Pages
# avec toutes les ressources nécessaires (D1, R2, secrets).
#
# Prérequis:
#   • Node.js et npm installés
#   • Compte Cloudflare
#   • Connexion internet
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# ═══════════════════════════════════════════════════════════════════════

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Variables
PROJECT_NAME="hotelrestojobs"
DB_NAME="webapp-production"
BUCKET_NAME="hotelrestojobs-resumes"

# ═══════════════════════════════════════════════════════════════════════
# Fonctions utilitaires
# ═══════════════════════════════════════════════════════════════════════

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${BLUE}   $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 n'est pas installé"
        return 1
    fi
    return 0
}

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 0: Vérifications préliminaires
# ═══════════════════════════════════════════════════════════════════════

print_header "🚀 Déploiement HotelRestoJobs sur Cloudflare Pages"

print_step "Vérification des prérequis..."

# Vérifier Node.js et npm
if ! check_command "node"; then
    print_error "Node.js n'est pas installé. Téléchargez-le depuis https://nodejs.org"
    exit 1
fi

if ! check_command "npm"; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "Node.js $(node -v) et npm $(npm -v) installés"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -f "wrangler.jsonc" ]; then
    print_error "Ce script doit être exécuté depuis le répertoire du projet"
    print_info "Assurez-vous d'être dans le dossier home/user/webapp/"
    exit 1
fi

print_success "Répertoire du projet détecté"

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 1: Installation des dépendances
# ═══════════════════════════════════════════════════════════════════════

print_header "📦 Installation des dépendances"

print_step "Installation des packages npm..."
npm install --silent
print_success "Dépendances installées"

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 2: Authentification Cloudflare
# ═══════════════════════════════════════════════════════════════════════

print_header "🔑 Authentification Cloudflare"

print_step "Vérification de l'authentification..."

if npx wrangler whoami &> /dev/null; then
    print_success "Déjà authentifié sur Cloudflare"
    npx wrangler whoami
else
    print_warning "Non authentifié"
    print_step "Ouverture du navigateur pour l'authentification..."
    npx wrangler login
    
    if npx wrangler whoami &> /dev/null; then
        print_success "Authentification réussie"
    else
        print_error "Échec de l'authentification"
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 3: Création de la base de données D1
# ═══════════════════════════════════════════════════════════════════════

print_header "🗄️ Configuration de la base de données D1"

print_step "Vérification de l'existence de la base de données..."

if npx wrangler d1 list 2>&1 | grep -q "$DB_NAME"; then
    print_success "Base de données '$DB_NAME' existe déjà"
    DB_EXISTS=true
else
    print_step "Création de la base de données D1..."
    DB_OUTPUT=$(npx wrangler d1 create "$DB_NAME" 2>&1)
    
    # Extraire le database_id
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || echo "")
    
    if [ -n "$DB_ID" ]; then
        print_success "Base de données créée avec ID: $DB_ID"
        
        # Mise à jour automatique de wrangler.jsonc
        print_step "Mise à jour de wrangler.jsonc..."
        
        # Backup
        cp wrangler.jsonc wrangler.jsonc.backup
        print_info "Backup créé: wrangler.jsonc.backup"
        
        # Remplacement du database_id
        sed -i.bak "s/\"database_id\": \"local-only-for-development\"/\"database_id\": \"$DB_ID\"/" wrangler.jsonc
        print_success "wrangler.jsonc mis à jour avec le database_id"
        
        DB_EXISTS=false
    else
        print_error "Impossible d'extraire le database_id"
        print_warning "Vous devrez le configurer manuellement dans wrangler.jsonc"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 4: Création du bucket R2
# ═══════════════════════════════════════════════════════════════════════

print_header "🪣 Configuration du bucket R2"

print_step "Vérification de l'existence du bucket..."

if npx wrangler r2 bucket list 2>&1 | grep -q "$BUCKET_NAME"; then
    print_success "Bucket R2 '$BUCKET_NAME' existe déjà"
else
    print_step "Création du bucket R2..."
    
    if npx wrangler r2 bucket create "$BUCKET_NAME" 2>&1; then
        print_success "Bucket R2 créé"
    else
        print_warning "Le bucket existe peut-être déjà ou erreur de création"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 5: Application des migrations D1
# ═══════════════════════════════════════════════════════════════════════

print_header "🔄 Application des migrations D1"

print_step "Vérification des migrations..."

# Compter le nombre de migrations
MIGRATION_COUNT=$(ls -1 migrations/*.sql 2>/dev/null | wc -l)
print_info "$MIGRATION_COUNT migration(s) détectée(s)"

if [ "$MIGRATION_COUNT" -gt 0 ]; then
    print_step "Application des migrations..."
    
    if npx wrangler d1 migrations apply "$DB_NAME" --remote; then
        print_success "Migrations appliquées avec succès"
        
        # Liste des migrations importantes
        print_info "Migrations incluses:"
        echo "  • 0001_init.sql - Tables de base"
        echo "  • 0002_applications.sql - Système de candidatures"
        echo "  • 0003_featured_jobs.sql - Offres vedettes"
        echo "  • 0004_candidate_profiles.sql - Profils candidats"
        echo "  • 0010_ai_analysis.sql - Analyse IA ⭐"
    else
        print_warning "Erreur lors de l'application des migrations"
        print_info "Vous pouvez les appliquer manuellement via le Dashboard Cloudflare"
    fi
else
    print_warning "Aucune migration trouvée dans le dossier migrations/"
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 6: Build du projet
# ═══════════════════════════════════════════════════════════════════════

print_header "🔨 Build du projet"

print_step "Compilation du projet..."

if npm run build; then
    print_success "Build terminé avec succès"
    
    # Vérifier que le dossier dist existe
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        print_info "Taille du build: $DIST_SIZE"
    fi
else
    print_error "Échec du build"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 7: Création du projet Pages (première fois seulement)
# ═══════════════════════════════════════════════════════════════════════

print_header "📄 Configuration du projet Cloudflare Pages"

print_step "Vérification de l'existence du projet..."

if npx wrangler pages project list 2>&1 | grep -q "$PROJECT_NAME"; then
    print_success "Projet Pages '$PROJECT_NAME' existe déjà"
else
    print_step "Création du projet Pages..."
    
    if npx wrangler pages project create "$PROJECT_NAME" \
        --production-branch main \
        --compatibility-date 2026-02-05; then
        print_success "Projet Pages créé"
    else
        print_warning "Le projet existe peut-être déjà"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 8: Déploiement sur Cloudflare Pages
# ═══════════════════════════════════════════════════════════════════════

print_header "🚀 Déploiement sur Cloudflare Pages"

print_step "Déploiement en cours..."

DEPLOY_OUTPUT=$(npx wrangler pages deploy dist --project-name "$PROJECT_NAME" 2>&1)

# Extraire l'URL de déploiement
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[^ ]+\.pages\.dev' | head -1 || echo "")

if [ -n "$DEPLOY_URL" ]; then
    print_success "Déploiement réussi!"
    echo ""
    echo -e "${GREEN}${BOLD}🌐 URL de production: $DEPLOY_URL${NC}"
    echo ""
else
    print_warning "Déploiement effectué mais URL non détectée"
    print_info "Vérifiez le Dashboard: https://dash.cloudflare.com"
    echo ""
    # Afficher la sortie complète pour debug
    echo "$DEPLOY_OUTPUT"
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 9: Configuration des secrets (interactif)
# ═══════════════════════════════════════════════════════════════════════

print_header "🔐 Configuration des secrets"

print_info "Les secrets (variables d'environnement) doivent être configurés manuellement"
echo ""

read -p "$(echo -e ${CYAN}Voulez-vous configurer les secrets maintenant? [o/N]: ${NC})" -n 1 -r
echo ""

if [[ $REPLY =~ ^[OoYy]$ ]]; then
    echo ""
    print_step "Configuration de OPENAI_API_KEY..."
    read -p "Entrez votre clé API OpenAI (ou laissez vide pour ignorer): " OPENAI_KEY
    
    if [ -n "$OPENAI_KEY" ]; then
        echo "$OPENAI_KEY" | npx wrangler pages secret put OPENAI_API_KEY --project-name "$PROJECT_NAME"
        print_success "OPENAI_API_KEY configuré"
    fi
    
    echo ""
    print_step "Configuration de OPENAI_BASE_URL..."
    OPENAI_URL="https://www.genspark.ai/api/llm_proxy/v1"
    echo "$OPENAI_URL" | npx wrangler pages secret put OPENAI_BASE_URL --project-name "$PROJECT_NAME"
    print_success "OPENAI_BASE_URL configuré"
    
    echo ""
    print_step "Génération et configuration de JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "$JWT_SECRET" | npx wrangler pages secret put JWT_SECRET --project-name "$PROJECT_NAME"
    print_success "JWT_SECRET configuré"
    
else
    echo ""
    print_warning "Secrets non configurés - vous devrez les ajouter manuellement"
    echo ""
    print_info "Pour configurer les secrets plus tard, exécutez:"
    echo ""
    echo -e "${YELLOW}# OPENAI_API_KEY${NC}"
    echo "echo 'VOTRE_CLE' | npx wrangler pages secret put OPENAI_API_KEY --project-name $PROJECT_NAME"
    echo ""
    echo -e "${YELLOW}# OPENAI_BASE_URL${NC}"
    echo "echo 'https://www.genspark.ai/api/llm_proxy/v1' | npx wrangler pages secret put OPENAI_BASE_URL --project-name $PROJECT_NAME"
    echo ""
    echo -e "${YELLOW}# JWT_SECRET${NC}"
    echo "echo \$(openssl rand -base64 32) | npx wrangler pages secret put JWT_SECRET --project-name $PROJECT_NAME"
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 10: Vérification du déploiement
# ═══════════════════════════════════════════════════════════════════════

if [ -n "$DEPLOY_URL" ]; then
    print_header "🔍 Vérification du déploiement"
    
    print_step "Attente de la disponibilité du site (10 secondes)..."
    sleep 10
    
    print_step "Test de connectivité..."
    
    if curl -s "$DEPLOY_URL" > /dev/null; then
        print_success "Site accessible!"
    else
        print_warning "Site pas encore accessible (peut prendre quelques minutes)"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 11: Résumé final
# ═══════════════════════════════════════════════════════════════════════

print_header "✅ DÉPLOIEMENT TERMINÉ"

if [ -n "$DEPLOY_URL" ]; then
    echo -e "${GREEN}${BOLD}🎉 Votre application est maintenant en ligne!${NC}"
    echo ""
    echo -e "${CYAN}📍 URLs importantes:${NC}"
    echo ""
    echo -e "  ${BOLD}Page d'accueil:${NC}"
    echo -e "  → $DEPLOY_URL"
    echo ""
    echo -e "  ${BOLD}API Jobs:${NC}"
    echo -e "  → $DEPLOY_URL/api/jobs"
    echo ""
    echo -e "  ${BOLD}Portail Employeur:${NC}"
    echo -e "  → $DEPLOY_URL/portails/employeur.html"
    echo ""
    echo -e "  ${BOLD}Portail Candidat:${NC}"
    echo -e "  → $DEPLOY_URL/portails/candidat.html"
    echo ""
    echo -e "${CYAN}🎛️  Dashboard Cloudflare:${NC}"
    echo -e "  → https://dash.cloudflare.com"
    echo ""
fi

print_info "Fonctionnalités déployées:"
echo "  ✓ Système de jobs bilingue (FR/EN)"
echo "  ✓ Recherche avancée"
echo "  ✓ Candidatures avec upload CV"
echo "  ✓ Authentification JWT"
echo "  ✓ Traduction automatique"
echo "  ✓ Offres vedettes avec logos"
echo "  ✓ Analyse IA des candidatures ⭐"
echo ""

print_warning "Prochaines étapes recommandées:"
echo "  1. Vérifier que les secrets sont configurés (si non fait)"
echo "  2. Tester l'application via les URLs ci-dessus"
echo "  3. Configurer un domaine personnalisé (optionnel)"
echo "  4. Ajouter des données de test"
echo ""

print_info "Pour configurer un domaine personnalisé:"
echo "  npx wrangler pages domain add votre-domaine.com --project-name $PROJECT_NAME"
echo ""

print_header "🎊 Félicitations! Votre application est déployée!"

