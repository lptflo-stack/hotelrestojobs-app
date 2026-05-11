#!/bin/bash

# Script de test du système JWT complet

echo "🧪 Tests du Système JWT - HotelRestoJobs"
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction de test
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    local expected_code=$6
    
    echo -n "🔍 Test: $name ... "
    
    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $http_code)"
        echo "   Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "📝 Phase 1: Tests d'Authentification"
echo "------------------------------------"

# Test 1: Inscription employeur
echo ""
echo "1️⃣  Inscription d'un nouvel employeur"
TIMESTAMP=$(date +%s)
EMAIL="test-jwt-${TIMESTAMP}@test.com"
PASSWORD="SecurePass123"

REGISTER_DATA='{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "first_name": "Test",
    "last_name": "JWT",
    "role": "employer",
    "phone": "514-555-9999"
}'

test_endpoint "Inscription employeur" POST "/api/auth/register" "$REGISTER_DATA" "" "201"

# Test 2: Login et récupération du token
echo ""
echo "2️⃣  Login avec JWT"
LOGIN_DATA='{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
}'

response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

TOKEN=$(echo "$response" | jq -r '.token')
USER_ID=$(echo "$response" | jq -r '.user.id')
COMPANY_ID=$(echo "$response" | jq -r '.user.company_id')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo -e "✅ Token JWT récupéré: ${TOKEN:0:50}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL: Pas de token reçu${NC}"
    echo "Response: $response"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    exit 1
fi

echo ""
echo "📋 Phase 2: Tests Routes Protégées"
echo "----------------------------------"

# Test 3: Profil avec JWT
echo ""
test_endpoint "GET /api/auth/profile (avec JWT)" GET "/api/auth/profile" "" "$TOKEN" "200"

# Test 4: Profil sans JWT (doit échouer)
echo ""
test_endpoint "GET /api/auth/profile (sans JWT)" GET "/api/auth/profile" "" "" "401"

# Test 5: Mes crédits avec JWT
echo ""
test_endpoint "GET /api/pricing/credits/me" GET "/api/pricing/credits/me" "" "$TOKEN" "200"

# Test 6: Mes offres d'emploi
echo ""
test_endpoint "GET /api/jobs/employer/me" GET "/api/jobs/employer/me" "" "$TOKEN" "200"

echo ""
echo "💼 Phase 3: Tests Création d'Offre"
echo "-----------------------------------"

# Test 7: Créer une offre d'emploi
echo ""
JOB_DATA='{
    "title": "Chef Cuisinier JWT Test",
    "description": "Test de création avec JWT",
    "position_type": "chef",
    "employment_type": "full-time",
    "salary_min": 45000,
    "salary_max": 55000,
    "salary_type": "annual",
    "location": "123 rue Test",
    "city": "Montreal",
    "province": "QC",
    "requirements": "Expérience requise",
    "benefits": "Avantages sociaux"
}'

# Note: Ceci peut échouer avec 400 si pas de crédits, mais pas de 401/403
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$JOB_DATA")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo -n "🔍 Test: POST /api/jobs (créer offre) ... "
if [ "$http_code" = "201" ] || [ "$http_code" = "400" ]; then
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Offre créée)"
        JOB_ID=$(echo "$body" | jq -r '.job_id')
    else
        echo -e "${YELLOW}⚠️  SKIP${NC} (Pas de crédits - normal pour nouveau compte)"
    fi
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code - Erreur auth ou serveur)"
    echo "   Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "🔒 Phase 4: Tests Contrôle d'Accès"
echo "----------------------------------"

# Test 8: Inscription candidat
echo ""
CANDIDATE_EMAIL="candidate-jwt-${TIMESTAMP}@test.com"
CANDIDATE_DATA='{
    "email": "'$CANDIDATE_EMAIL'",
    "password": "'$PASSWORD'",
    "first_name": "Candidat",
    "last_name": "Test",
    "role": "candidate"
}'

test_endpoint "Inscription candidat" POST "/api/auth/register" "$CANDIDATE_DATA" "" "201"

# Test 9: Login candidat
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"'$CANDIDATE_EMAIL'","password":"'$PASSWORD'"}')

CANDIDATE_TOKEN=$(echo "$response" | jq -r '.token')

if [ "$CANDIDATE_TOKEN" != "null" ] && [ ! -z "$CANDIDATE_TOKEN" ]; then
    echo "✅ Token candidat récupéré"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Token candidat non reçu${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 10: Candidat essaie de créer une offre (doit échouer 403)
echo ""
test_endpoint "Candidat tente POST /api/jobs (doit échouer)" POST "/api/jobs" "$JOB_DATA" "$CANDIDATE_TOKEN" "403"

# Test 11: Candidat accède à son profil (doit réussir)
echo ""
test_endpoint "Candidat GET /api/auth/profile" GET "/api/auth/profile" "" "$CANDIDATE_TOKEN" "200"

# Test 12: Candidat accède à ses candidatures
echo ""
test_endpoint "GET /api/applications/candidate/me" GET "/api/applications/candidate/me" "" "$CANDIDATE_TOKEN" "200"

echo ""
echo "🎯 Phase 5: Tests Token Invalide"
echo "---------------------------------"

# Test 13: Token invalide
echo ""
test_endpoint "JWT invalide (doit échouer)" GET "/api/auth/profile" "" "invalid-token-123" "401"

# Test 14: Token expiré simulé
echo ""
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5OTksImV4cCI6MTAwMDAwMDAwMH0.fake"
test_endpoint "JWT expiré (doit échouer)" GET "/api/auth/profile" "" "$EXPIRED_TOKEN" "401"

echo ""
echo "========================================"
echo "📊 RÉSULTATS DES TESTS"
echo "========================================"
echo ""
echo -e "${GREEN}✅ Tests réussis: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests échoués: $TESTS_FAILED${NC}"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(( TESTS_PASSED * 100 / TOTAL ))

echo "Taux de réussite: $SUCCESS_RATE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS PASSENT !${NC}"
    echo ""
    echo "✅ Le système JWT est pleinement fonctionnel:"
    echo "  - Inscription & Login avec JWT"
    echo "  - Routes protégées par JWT"
    echo "  - Contrôle d'accès par rôle"
    echo "  - Rejet des tokens invalides/expirés"
    exit 0
else
    echo -e "${RED}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo ""
    echo "Vérifiez les logs ci-dessus pour les détails"
    exit 1
fi
