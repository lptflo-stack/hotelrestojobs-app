# 🔐 Comptes de Test - HotelRestoJobs

## 📋 Informations Générales

Tous les comptes ci-dessous utilisent des mots de passe hashés avec **bcrypt (10 rounds)** et l'authentification se fait via **JWT (JSON Web Tokens)** avec une durée de validité de 7 jours.

## 👥 Comptes Disponibles

### 1. 👨‍💼 Administrateur
- **Email**: `admin@hotelrestojobs.com`
- **Mot de passe**: `admin123`
- **Rôle**: `admin`
- **Accès**: Toutes les fonctionnalités d'administration
- **Portail**: https://[URL]/portails/admin.html

**Permissions**:
- ✅ Gestion des utilisateurs (tous rôles)
- ✅ Gestion des entreprises
- ✅ Gestion des offres d'emploi (modération)
- ✅ Statistiques globales
- ✅ Gestion des transactions et forfaits

---

### 2. 🏨 Employeur
- **Email**: `employer@hotel.com`
- **Mot de passe**: `employer123`
- **Rôle**: `employer`
- **Entreprise**: Hotel Grand Luxe (ID: 5)
- **Crédits**: 10 crédits d'annonces
- **Portail**: https://[URL]/portails/employeur.html

**Permissions**:
- ✅ Créer/modifier/supprimer ses offres d'emploi
- ✅ Voir les candidatures à ses offres
- ✅ Gérer les utilisateurs de son entreprise
- ✅ Acheter des forfaits de crédits
- ✅ Gérer le profil de son entreprise

**Détails de l'entreprise**:
- **Nom**: Hotel Grand Luxe
- **Description**: Un hôtel 5 étoiles au cœur de Montréal
- **Adresse**: 1234 Rue Principale, Montréal, QC H1A 1A1
- **Site web**: https://www.grandluxe.com

---

### 3. 👨‍🍳 Candidat
- **Email**: `candidate@email.com`
- **Mot de passe**: `candidate123`
- **Rôle**: `candidate`
- **Nom**: John Doe
- **Portail**: https://[URL]/portails/candidat.html

**Permissions**:
- ✅ Rechercher et consulter les offres d'emploi
- ✅ Postuler aux offres
- ✅ Gérer son profil candidat
- ✅ Voir l'historique de ses candidatures
- ✅ Créer et modifier son CV

---

## 🔄 Réinitialisation de la Base de Données

Pour recréer les utilisateurs de test après une réinitialisation de la base de données :

```bash
# Option 1 : Reset complet (supprime toutes les données)
npm run db:reset

# Option 2 : Créer uniquement les utilisateurs de test
npm run db:seed:test
```

## 🧪 Tests API avec JWT

### Exemple de connexion (Admin)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelrestojobs.com","password":"admin123"}'
```

### Réponse
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 7,
    "email": "admin@hotelrestojobs.com",
    "firstName": "Admin",
    "lastName": "System",
    "role": "admin",
    "companyId": null
  }
}
```

### Utiliser le token pour accéder aux routes protégées
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Notes Importantes

1. **Sécurité**: Ces comptes sont **uniquement pour le développement et les tests**. Ne jamais utiliser ces mots de passe en production.

2. **JWT**: Les tokens JWT ont une durée de vie de **7 jours**. Après expiration, l'utilisateur doit se reconnecter.

3. **Bcrypt**: Les mots de passe sont hashés avec **bcrypt** (10 rounds de salt) pour une sécurité renforcée.

4. **Base de données locale**: Ces utilisateurs sont créés dans la base de données D1 locale (`.wrangler/state/v3/d1`). Pour la production, vous devrez recréer ces comptes ou utiliser d'autres identifiants.

5. **Company_id**: Seul l'employeur a un `company_id` associé (ID: 5). Les candidats et admins n'ont pas d'entreprise associée.

## 🚀 Parcours de Test Recommandé

### Parcours Employeur
1. Se connecter avec `employer@hotel.com`
2. Consulter ses crédits (10 disponibles)
3. Créer une nouvelle offre d'emploi
4. Voir les candidatures reçues
5. Gérer les utilisateurs de l'entreprise

### Parcours Candidat
1. Se connecter avec `candidate@email.com`
2. Rechercher des offres d'emploi
3. Consulter le détail d'une offre
4. Postuler à une offre
5. Voir l'historique de ses candidatures

### Parcours Admin
1. Se connecter avec `admin@hotelrestojobs.com`
2. Consulter les statistiques globales
3. Modérer les offres d'emploi
4. Gérer les utilisateurs et entreprises
5. Consulter les transactions

---

**Dernière mise à jour**: 2026-06-03
**Version**: 1.0.0
