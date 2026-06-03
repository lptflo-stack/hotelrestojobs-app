#!/bin/bash

# Script de test complet des 3 portails HotelRestoJobs
# Teste : Candidat, Employeur, Admin

echo "================================================"
echo "🧪 TESTS COMPLETS DES PORTAILS - HotelRestoJobs"
echo "================================================"
echo ""

BASE_URL="http://localhost:3000"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un test
test_start() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Test $TOTAL_TESTS: $1 ... "
}

# Fonction pour marquer un test réussi
test_pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✓ PASS${NC}"
}

# Fonction pour marquer un test échoué
test_fail() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}✗ FAIL${NC}"
    if [ ! -z "$1" ]; then
        echo "   Erreur: $1"
    fi
}

# Variables pour stocker les tokens
CANDIDATE_TOKEN=""
EMPLOYER_TOKEN=""
ADMIN_TOKEN=""
JOB_ID=""
APPLICATION_ID=""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PHASE 1 : TESTS D'AUTHENTIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Login Candidat
test_start "Login Candidat (candidate@email.com)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"candidate@email.com","password":"candidate123"}')

CANDIDATE_TOKEN=$(echo $RESPONSE | jq -r '.token')
if [ ! -z "$CANDIDATE_TOKEN" ] && [ "$CANDIDATE_TOKEN" != "null" ]; then
    test_pass
else
    test_fail "Token non reçu"
fi

# Test 2: Login Employeur
test_start "Login Employeur (employer@hotel.com)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"employer@hotel.com","password":"employer123"}')

EMPLOYER_TOKEN=$(echo $RESPONSE | jq -r '.token')
if [ ! -z "$EMPLOYER_TOKEN" ] && [ "$EMPLOYER_TOKEN" != "null" ]; then
    test_pass
else
    test_fail "Token non reçu"
fi

# Test 3: Login Admin
test_start "Login Admin (admin@hotelrestojobs.com)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelrestojobs.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.token')
if [ ! -z "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    test_pass
else
    test_fail "Token non reçu"
fi

# Test 4: Login échoué (mauvais mot de passe)
test_start "Login échoué (mauvais mot de passe)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"candidate@email.com","password":"wrongpassword"}')

ERROR=$(echo $RESPONSE | jq -r '.error')
if [ "$ERROR" != "null" ]; then
    test_pass
else
    test_fail "Devrait retourner une erreur"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👨‍💼 PHASE 2 : TESTS PORTAIL EMPLOYEUR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: Récupérer profil employeur
test_start "Récupérer profil employeur"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN")

EMAIL=$(echo $RESPONSE | jq -r '.email')
if [ "$EMAIL" = "employer@hotel.com" ]; then
    test_pass
else
    test_fail "Email incorrect: $EMAIL"
fi

# Test 6: Récupérer crédits employeur
test_start "Récupérer crédits employeur"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/pricing/credits/me" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN")

CREDITS=$(echo $RESPONSE | jq -r '.credits_remaining')
if [ "$CREDITS" != "null" ] && [ "$CREDITS" -ge 0 ]; then
    test_pass
    echo "   → Crédits restants: $CREDITS"
else
    test_fail "Crédits non récupérés"
fi

# Test 7: Créer une offre d'emploi
test_start "Créer une offre d'emploi (Chef de Cuisine)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chef de Cuisine - Test Auto",
    "description": "Offre créée par test automatisé",
    "position_type": "Chef",
    "employment_type": "full-time",
    "salary_min": 50000,
    "salary_max": 70000,
    "salary_type": "annual",
    "location": "123 Rue Test, Montréal, QC",
    "city": "Montréal",
    "province": "QC",
    "requirements": "5 ans expérience minimum",
    "benefits": "Assurances, vacances"
  }')

JOB_ID=$(echo $RESPONSE | jq -r '.id')
if [ ! -z "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    test_pass
    echo "   → Job ID: $JOB_ID"
else
    test_fail "Job non créé"
fi

# Test 8: Lister les offres de l'employeur
test_start "Lister les offres de l'employeur"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/jobs/employer/me" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN")

COUNT=$(echo $RESPONSE | jq -r '.jobs | length')
if [ "$COUNT" -gt 0 ]; then
    test_pass
    echo "   → Nombre d'offres: $COUNT"
else
    test_fail "Aucune offre trouvée"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👨‍🍳 PHASE 3 : TESTS PORTAIL CANDIDAT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 9: Récupérer profil candidat
test_start "Récupérer profil candidat"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN")

EMAIL=$(echo $RESPONSE | jq -r '.email')
if [ "$EMAIL" = "candidate@email.com" ]; then
    test_pass
else
    test_fail "Email incorrect: $EMAIL"
fi

# Test 10: Mettre à jour profil candidat
test_start "Mettre à jour profil candidat"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/candidate/profile" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Chef avec 10 ans expérience - Test Auto",
    "experience_years": 10,
    "availability": "Immédiate",
    "desired_position": "Chef de Cuisine",
    "desired_salary_min": 45000,
    "desired_salary_max": 65000
  }')

SUCCESS=$(echo $RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    test_pass
else
    test_fail "Profil non mis à jour"
fi

# Test 11: Rechercher des offres d'emploi
test_start "Rechercher des offres d'emploi"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/jobs?search=chef&city=Montréal")

COUNT=$(echo $RESPONSE | jq -r '.jobs | length')
if [ "$COUNT" -gt 0 ]; then
    test_pass
    echo "   → Offres trouvées: $COUNT"
else
    test_fail "Aucune offre trouvée"
fi

# Test 12: Postuler à une offre
if [ ! -z "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    test_start "Postuler à l'offre ID: $JOB_ID"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/applications" \
      -H "Authorization: Bearer $CANDIDATE_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"job_offer_id\": $JOB_ID,
        \"cover_letter\": \"Je suis très intéressé par ce poste - Test Auto\"
      }")
    
    APPLICATION_ID=$(echo $RESPONSE | jq -r '.id')
    if [ ! -z "$APPLICATION_ID" ] && [ "$APPLICATION_ID" != "null" ]; then
        test_pass
        echo "   → Application ID: $APPLICATION_ID"
    else
        test_fail "Candidature non créée"
    fi
fi

# Test 13: Lister les candidatures du candidat
test_start "Lister les candidatures du candidat"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/applications/candidate/me" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN")

COUNT=$(echo $RESPONSE | jq -r '.applications | length')
if [ "$COUNT" -gt 0 ]; then
    test_pass
    echo "   → Nombre de candidatures: $COUNT"
else
    test_fail "Aucune candidature trouvée"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👨‍💼 PHASE 4 : TESTS PORTAIL EMPLOYEUR (CANDIDATURES)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 14: Lister les candidatures reçues
if [ ! -z "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    test_start "Lister les candidatures pour job ID: $JOB_ID"
    RESPONSE=$(curl -s -X GET "$BASE_URL/api/applications/job/$JOB_ID" \
      -H "Authorization: Bearer $EMPLOYER_TOKEN")
    
    COUNT=$(echo $RESPONSE | jq -r '.applications | length')
    if [ "$COUNT" -gt 0 ]; then
        test_pass
        echo "   → Candidatures reçues: $COUNT"
    else
        test_fail "Aucune candidature trouvée"
    fi
fi

# Test 15: Changer le statut d'une candidature
if [ ! -z "$APPLICATION_ID" ] && [ "$APPLICATION_ID" != "null" ]; then
    test_start "Changer statut candidature (reviewed)"
    RESPONSE=$(curl -s -X PUT "$BASE_URL/api/applications/$APPLICATION_ID/status" \
      -H "Authorization: Bearer $EMPLOYER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status": "reviewed", "employer_notes": "Profil intéressant - Test Auto"}')
    
    SUCCESS=$(echo $RESPONSE | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        test_pass
    else
        test_fail "Statut non changé"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 PHASE 5 : TESTS PORTAIL ADMIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 16: Récupérer statistiques globales
test_start "Récupérer statistiques globales"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TOTAL_USERS=$(echo $RESPONSE | jq -r '.total_users')
if [ "$TOTAL_USERS" -gt 0 ]; then
    test_pass
    echo "   → Total utilisateurs: $TOTAL_USERS"
else
    test_fail "Stats non récupérées"
fi

# Test 17: Lister tous les utilisateurs
test_start "Lister tous les utilisateurs"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

COUNT=$(echo $RESPONSE | jq -r '.users | length')
if [ "$COUNT" -gt 0 ]; then
    test_pass
    echo "   → Utilisateurs: $COUNT"
else
    test_fail "Aucun utilisateur trouvé"
fi

# Test 18: Lister toutes les entreprises
test_start "Lister toutes les entreprises"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/companies" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

COUNT=$(echo $RESPONSE | jq -r '.companies | length')
if [ "$COUNT" -ge 0 ]; then
    test_pass
    echo "   → Entreprises: $COUNT"
else
    test_fail "Erreur récupération entreprises"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 PHASE 6 : TESTS DE SÉCURITÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 19: Accès non autorisé (sans token)
test_start "Accès route protégée sans token"
RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/jobs/employer/me")

HTTP_CODE=$(echo $RESPONSE | tail -c 4)
if [ "$HTTP_CODE" = "401" ]; then
    test_pass
else
    test_fail "Devrait retourner 401, reçu: $HTTP_CODE"
fi

# Test 20: Candidat essaie d'accéder à route employeur
test_start "Candidat accède route employeur (403)"
RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/jobs/employer/me" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN")

HTTP_CODE=$(echo $RESPONSE | tail -c 4)
if [ "$HTTP_CODE" = "403" ]; then
    test_pass
else
    test_fail "Devrait retourner 403, reçu: $HTTP_CODE"
fi

# Test 21: Token invalide
test_start "Token JWT invalide"
RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer invalid_token_xyz123")

HTTP_CODE=$(echo $RESPONSE | tail -c 4)
if [ "$HTTP_CODE" = "401" ]; then
    test_pass
else
    test_fail "Devrait retourner 401, reçu: $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ DES TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total de tests    : $TOTAL_TESTS"
echo -e "${GREEN}Tests réussis     : $PASSED_TESTS${NC}"
echo -e "${RED}Tests échoués     : $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓✓✓ TOUS LES TESTS SONT PASSÉS ! ✓✓✓${NC}"
    echo ""
    exit 0
else
    PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${YELLOW}⚠ Taux de réussite: $PERCENTAGE%${NC}"
    echo ""
    exit 1
fi
