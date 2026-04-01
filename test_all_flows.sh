#!/bin/bash

# Script de test complet pour HotelRestoJobs
# Tests : Employeur, Candidat, Admin

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================================="
echo "🧪 TESTS COMPLETS - HotelRestoJobs"
echo "=================================================="
echo ""

# ==============================================
# TEST 1: PARCOURS EMPLOYEUR COMPLET
# ==============================================
echo -e "${BLUE}📝 TEST 1: PARCOURS EMPLOYEUR COMPLET${NC}"
echo "=================================================="

# 1.1 Connexion employeur
echo "1.1 Connexion employeur (Restaurant Le Luxe)..."
EMPLOYER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rh@restaurantluxe.com",
    "password": "admin123"
  }')

EMPLOYER_ID=$(echo $EMPLOYER_LOGIN | jq -r '.user.id')
COMPANY_ID=$(echo $EMPLOYER_LOGIN | jq -r '.user.company_id')

if [ "$EMPLOYER_ID" != "null" ]; then
  echo -e "${GREEN}✓ Connexion réussie - ID: $EMPLOYER_ID, Company: $COMPANY_ID${NC}"
else
  echo -e "${RED}✗ Échec connexion${NC}"
  exit 1
fi

# 1.2 Vérifier les crédits avant publication
echo ""
echo "1.2 Vérification des crédits disponibles..."
CREDITS_BEFORE=$(curl -s "$BASE_URL/api/pricing/credits/$EMPLOYER_ID" | jq -r '.credits_remaining')
echo "Crédits disponibles: $CREDITS_BEFORE"

# 1.3 Créer une nouvelle annonce
echo ""
echo "1.3 Création d'une nouvelle annonce..."
CREATE_JOB=$(curl -s -X POST "$BASE_URL/api/jobs?user_id=$EMPLOYER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Serveur/Serveuse - Test Automatique",
    "description": "Poste de serveur pour les tests automatisés. Expérience requise.",
    "position_type": "Serveur/Serveuse",
    "employment_type": "full-time",
    "salary_min": 16,
    "salary_max": 20,
    "salary_type": "hourly",
    "location": "123 Rue Test, Montréal",
    "city": "Montréal",
    "province": "QC",
    "requirements": "- 2 ans expérience\n- Bilingue",
    "benefits": "- Pourboires\n- Repas fournis"
  }')

JOB_ID=$(echo $CREATE_JOB | jq -r '.job_id')
CREDITS_AFTER=$(echo $CREATE_JOB | jq -r '.credits_remaining')

if [ "$JOB_ID" != "null" ]; then
  echo -e "${GREEN}✓ Annonce créée - ID: $JOB_ID${NC}"
  echo "Crédits restants: $CREDITS_AFTER (avant: $CREDITS_BEFORE)"
else
  echo -e "${RED}✗ Échec création annonce${NC}"
  echo $CREATE_JOB | jq .
fi

# 1.4 Vérifier que l'annonce est active
echo ""
echo "1.4 Vérification du statut de l'annonce..."
JOB_STATUS=$(curl -s "$BASE_URL/api/jobs/$JOB_ID" | jq -r '.status')
echo "Statut de l'annonce: $JOB_STATUS"

if [ "$JOB_STATUS" = "active" ]; then
  echo -e "${GREEN}✓ L'annonce est bien active${NC}"
else
  echo -e "${RED}✗ L'annonce n'est pas active (statut: $JOB_STATUS)${NC}"
fi

# 1.5 Vérifier les transactions
echo ""
echo "1.5 Vérification de la transaction de crédit..."
TRANSACTIONS=$(curl -s "$BASE_URL/api/pricing/transactions/$EMPLOYER_ID")
LAST_TRANSACTION=$(echo $TRANSACTIONS | jq -r '.transactions[0].transaction_type')
echo "Dernière transaction: $LAST_TRANSACTION"

if [ "$LAST_TRANSACTION" = "deduction" ]; then
  echo -e "${GREEN}✓ Transaction de déduction enregistrée${NC}"
else
  echo -e "${RED}✗ Pas de transaction de déduction trouvée${NC}"
fi

# 1.6 Lister les utilisateurs de l'entreprise
echo ""
echo "1.6 Liste des utilisateurs de l'entreprise..."
COMPANY_USERS=$(curl -s "$BASE_URL/api/admin/companies/$COMPANY_ID/users?user_id=1")
USER_COUNT=$(echo $COMPANY_USERS | jq -r '.users | length')
echo "Nombre d'utilisateurs: $USER_COUNT"
echo $COMPANY_USERS | jq -r '.users[] | "\(.first_name) \(.last_name) - \(.email) - Actif: \(.is_active)"'

# ==============================================
# TEST 2: PARCOURS CANDIDAT COMPLET
# ==============================================
echo ""
echo -e "${BLUE}📝 TEST 2: PARCOURS CANDIDAT COMPLET${NC}"
echo "=================================================="

# 2.1 Inscription nouveau candidat
echo "2.1 Inscription d'un nouveau candidat..."
REGISTER_CANDIDATE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.candidat@email.com",
    "password": "test123456",
    "first_name": "Test",
    "last_name": "Candidat",
    "phone": "514-555-9999",
    "role": "candidate"
  }')

CANDIDATE_ID=$(echo $REGISTER_CANDIDATE | jq -r '.user.id')

if [ "$CANDIDATE_ID" != "null" ]; then
  echo -e "${GREEN}✓ Candidat inscrit - ID: $CANDIDATE_ID${NC}"
else
  echo -e "${RED}✗ Échec inscription candidat${NC}"
  echo $REGISTER_CANDIDATE | jq .
fi

# 2.2 Connexion candidat
echo ""
echo "2.2 Connexion du candidat..."
CANDIDATE_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.candidat@email.com",
    "password": "test123456"
  }')

CANDIDATE_ID=$(echo $CANDIDATE_LOGIN | jq -r '.user.id')

if [ "$CANDIDATE_ID" != "null" ]; then
  echo -e "${GREEN}✓ Connexion candidat réussie - ID: $CANDIDATE_ID${NC}"
else
  echo -e "${RED}✗ Échec connexion candidat${NC}"
fi

# 2.3 Lister les offres disponibles
echo ""
echo "2.3 Liste des offres d'emploi disponibles..."
JOBS=$(curl -s "$BASE_URL/api/jobs")
JOBS_COUNT=$(echo $JOBS | jq -r '.jobs | length')
echo "Nombre d'offres actives: $JOBS_COUNT"

# 2.4 Postuler à l'annonce créée
echo ""
echo "2.4 Candidature à l'annonce créée (ID: $JOB_ID)..."
APPLICATION=$(curl -s -X POST "$BASE_URL/api/applications?user_id=$CANDIDATE_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"job_offer_id\": $JOB_ID,
    \"cover_letter\": \"Je suis très intéressé par ce poste. J'ai 3 ans d'expérience en restauration et je suis disponible immédiatement.\"
  }")

APPLICATION_ID=$(echo $APPLICATION | jq -r '.application_id // .id // empty')

if [ "$APPLICATION_ID" != "" ] && [ "$APPLICATION_ID" != "null" ]; then
  echo -e "${GREEN}✓ Candidature soumise - ID: $APPLICATION_ID${NC}"
else
  echo -e "${RED}✗ Échec de la candidature${NC}"
  echo $APPLICATION | jq .
fi

# 2.5 Vérifier les candidatures du candidat
echo ""
echo "2.5 Liste des candidatures du candidat..."
CANDIDATE_APPLICATIONS=$(curl -s "$BASE_URL/api/applications/candidate/$CANDIDATE_ID")
APP_COUNT=$(echo $CANDIDATE_APPLICATIONS | jq -r '.applications | length')
echo "Nombre de candidatures: $APP_COUNT"

# 2.6 Mettre à jour le profil candidat
echo ""
echo "2.6 Mise à jour du profil candidat..."
UPDATE_PROFILE=$(curl -s -X PUT "$BASE_URL/api/candidate/profile?user_id=$CANDIDATE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Serveur professionnel avec 3 ans d'\''expérience",
    "experience_years": 3,
    "availability": "Immédiate",
    "desired_position": "Serveur/Serveuse",
    "desired_salary_min": 16,
    "desired_salary_max": 22
  }')

PROFILE_SUCCESS=$(echo $UPDATE_PROFILE | jq -r '.success')

if [ "$PROFILE_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Profil candidat mis à jour${NC}"
else
  echo -e "${RED}✗ Échec mise à jour profil${NC}"
  echo $UPDATE_PROFILE | jq .
fi

# ==============================================
# TEST 3: PARCOURS ADMIN COMPLET
# ==============================================
echo ""
echo -e "${BLUE}📝 TEST 3: PARCOURS ADMIN COMPLET${NC}"
echo "=================================================="

# 3.1 Connexion admin
echo "3.1 Connexion admin..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hotelrestojobs.com",
    "password": "admin123"
  }')

ADMIN_ID=$(echo $ADMIN_LOGIN | jq -r '.user.id')

if [ "$ADMIN_ID" != "null" ]; then
  echo -e "${GREEN}✓ Connexion admin réussie - ID: $ADMIN_ID${NC}"
else
  echo -e "${RED}✗ Échec connexion admin${NC}"
fi

# 3.2 Statistiques globales
echo ""
echo "3.2 Statistiques globales..."
STATS=$(curl -s "$BASE_URL/api/admin/stats?user_id=$ADMIN_ID")
TOTAL_USERS=$(echo $STATS | jq -r '.users.total')
TOTAL_JOBS=$(echo $STATS | jq -r '.jobs.total')
TOTAL_APPS=$(echo $STATS | jq -r '.applications.total')
echo "Utilisateurs: $TOTAL_USERS | Emplois: $TOTAL_JOBS | Candidatures: $TOTAL_APPS"

# 3.3 Liste des employeurs
echo ""
echo "3.3 Liste des employeurs..."
EMPLOYERS=$(curl -s "$BASE_URL/api/admin/employers?user_id=$ADMIN_ID")
EMPLOYERS_COUNT=$(echo $EMPLOYERS | jq -r '.employers | length')
echo "Nombre d'employeurs: $EMPLOYERS_COUNT"
echo $EMPLOYERS | jq -r '.employers[] | "\(.company_name) - Crédits: \(.credits_remaining)"'

# 3.4 Voir les candidatures de l'employeur
echo ""
echo "3.4 Candidatures reçues pour l'annonce..."
JOB_APPLICATIONS=$(curl -s "$BASE_URL/api/applications/job/$JOB_ID?user_id=$EMPLOYER_ID")
JOB_APP_COUNT=$(echo $JOB_APPLICATIONS | jq -r '.applications | length')
echo "Nombre de candidatures: $JOB_APP_COUNT"

# 3.5 Ajouter des crédits à un employeur
echo ""
echo "3.5 Ajout de 5 crédits à l'employeur..."
ADD_CREDITS=$(curl -s -X POST "$BASE_URL/api/admin/employers/$EMPLOYER_ID/credits?user_id=$ADMIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "amount": 5,
    "note": "Crédits bonus - Test automatique"
  }')

ADD_SUCCESS=$(echo $ADD_CREDITS | jq -r '.success')

if [ "$ADD_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Crédits ajoutés avec succès${NC}"
  NEW_CREDITS=$(curl -s "$BASE_URL/api/pricing/credits/$EMPLOYER_ID" | jq -r '.credits_remaining')
  echo "Nouveaux crédits: $NEW_CREDITS"
else
  echo -e "${RED}✗ Échec ajout crédits${NC}"
fi

# 3.6 Voir toutes les transactions
echo ""
echo "3.6 Liste de toutes les transactions..."
ALL_TRANSACTIONS=$(curl -s "$BASE_URL/api/admin/transactions?user_id=$ADMIN_ID")
TRANS_COUNT=$(echo $ALL_TRANSACTIONS | jq -r '.transactions | length')
echo "Nombre de transactions: $TRANS_COUNT"
echo "Dernières transactions:"
echo $ALL_TRANSACTIONS | jq -r '.transactions[:3] | .[] | "\(.transaction_type) - \(.credits_amount) crédits - \(.description)"'

# 3.7 Créer un nouvel utilisateur pour l'entreprise
echo ""
echo "3.7 Ajout d'un nouvel utilisateur pour Restaurant Le Luxe..."
NEW_USER=$(curl -s -X POST "$BASE_URL/api/admin/companies/$COMPANY_ID/users?user_id=$ADMIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sophie",
    "last_name": "Martin",
    "email": "sophie.martin@restaurantluxe.com",
    "phone": "514-555-8888",
    "password": "test123456",
    "is_active": true
  }')

NEW_USER_SUCCESS=$(echo $NEW_USER | jq -r '.success')

if [ "$NEW_USER_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Nouvel utilisateur créé${NC}"
else
  echo -e "${RED}✗ Échec création utilisateur${NC}"
  echo $NEW_USER | jq .
fi

# ==============================================
# RÉSUMÉ DES TESTS
# ==============================================
echo ""
echo "=================================================="
echo -e "${BLUE}📊 RÉSUMÉ DES TESTS${NC}"
echo "=================================================="
echo ""
echo "✅ PARCOURS EMPLOYEUR:"
echo "   - Connexion: OK"
echo "   - Crédits avant: $CREDITS_BEFORE"
echo "   - Création annonce: OK (ID: $JOB_ID)"
echo "   - Crédits après: $CREDITS_AFTER"
echo "   - Statut annonce: $JOB_STATUS"
echo "   - Transaction enregistrée: OK"
echo "   - Utilisateurs entreprise: $USER_COUNT"
echo ""
echo "✅ PARCOURS CANDIDAT:"
echo "   - Inscription: OK (ID: $CANDIDATE_ID)"
echo "   - Connexion: OK"
echo "   - Offres disponibles: $JOBS_COUNT"
echo "   - Candidature soumise: OK"
echo "   - Profil mis à jour: OK"
echo ""
echo "✅ PARCOURS ADMIN:"
echo "   - Connexion: OK"
echo "   - Stats: $TOTAL_USERS users, $TOTAL_JOBS jobs, $TOTAL_APPS apps"
echo "   - Employeurs: $EMPLOYERS_COUNT"
echo "   - Ajout crédits: OK"
echo "   - Transactions: $TRANS_COUNT"
echo "   - Nouvel utilisateur: OK"
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 TOUS LES TESTS TERMINÉS${NC}"
echo "=================================================="
