# 📋 Guide de Tests Manuels - HotelRestoJobs

Ce guide vous permet de tester manuellement tous les portails dans le navigateur.

**URL de base**: https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai

---

## 👨‍🍳 TEST 1 : PORTAIL CANDIDAT

### URL
👉 https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/portails/candidat.html

### Credentials
- **Email**: `candidate@email.com`
- **Mot de passe**: `candidate123`

### Checklist de Test

#### ✅ 1.1 - Connexion
- [ ] Ouvrir le portail candidat
- [ ] Entrer les credentials
- [ ] Cliquer sur "Se connecter"
- [ ] ✓ **Résultat attendu**: Dashboard s'affiche, pas de rechargement infini
- [ ] ✓ **Vérifier**: Nom "John Doe" apparaît en haut à droite

#### ✅ 1.2 - Onglet Profil
- [ ] Cliquer sur "Profil"
- [ ] ✓ **Vérifier**: Formulaire pré-rempli avec les infos
- [ ] Modifier la bio : "Chef expérimenté - Test manuel"
- [ ] Modifier années d'expérience : 15
- [ ] Modifier disponibilité : "Immédiate"
- [ ] Cliquer "Enregistrer les modifications"
- [ ] ✓ **Résultat attendu**: Message de succès
- [ ] Rafraîchir la page et se reconnecter
- [ ] ✓ **Vérifier**: Les modifications sont sauvegardées

#### ✅ 1.3 - Upload CV
- [ ] Dans l'onglet "Profil", scroll vers "Mon CV"
- [ ] ✓ **Vérifier**: Section "Mon CV" visible avec zone drag-and-drop
- [ ] Préparer un fichier PDF de test (< 5MB)
- [ ] Cliquer sur la zone d'upload ou drag-and-drop le PDF
- [ ] ✓ **Résultat attendu**: 
  - Message "Téléchargement en cours..."
  - Puis "CV téléchargé avec succès !"
  - Le CV apparaît avec boutons "Voir" et "Supprimer"
- [ ] Cliquer sur "Voir" 
- [ ] ✓ **Vérifier**: Le PDF s'ouvre dans un nouvel onglet
- [ ] Cliquer sur "Supprimer"
- [ ] ✓ **Vérifier**: Confirmation puis retour à la zone d'upload

#### ✅ 1.4 - Recherche d'Emplois
- [ ] Cliquer sur "Rechercher"
- [ ] Entrer "chef" dans mots-clés
- [ ] Entrer "Montréal" dans ville
- [ ] Cliquer "Rechercher"
- [ ] ✓ **Résultat attendu**: Liste d'offres d'emploi s'affiche
- [ ] ✓ **Vérifier**: Au moins 1 offre visible (créée par l'employeur)

#### ✅ 1.5 - Postuler à une Offre
- [ ] Depuis les résultats de recherche, cliquer "Postuler" sur une offre
- [ ] ✓ **Vérifier**: Modal ou formulaire de candidature s'affiche
- [ ] Remplir la lettre de motivation
- [ ] Cliquer "Envoyer ma candidature"
- [ ] ✓ **Résultat attendu**: Message de confirmation

#### ✅ 1.6 - Mes Candidatures
- [ ] Cliquer sur "Mes Candidatures"
- [ ] ✓ **Vérifier**: Liste des candidatures avec statut (pending, reviewed, etc.)
- [ ] ✓ **Vérifier**: Détails de chaque candidature visibles

#### ✅ 1.7 - Déconnexion
- [ ] Cliquer sur "Déconnexion"
- [ ] ✓ **Résultat attendu**: Retour à l'écran de connexion
- [ ] ✓ **Vérifier**: Pas d'accès au dashboard après déconnexion

---

## 🏨 TEST 2 : PORTAIL EMPLOYEUR

### URL
👉 https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/portails/employeur.html

### Credentials
- **Email**: `employer@hotel.com`
- **Mot de passe**: `employer123`

### Checklist de Test

#### ✅ 2.1 - Connexion
- [ ] Ouvrir le portail employeur
- [ ] Entrer les credentials
- [ ] Cliquer sur "Se connecter"
- [ ] ✓ **Résultat attendu**: Dashboard s'affiche, **PAS de rechargement infini** ✨
- [ ] ✓ **Vérifier**: Nom "Hotel Manager" apparaît en haut à droite

#### ✅ 2.2 - Onglet Mes Crédits
- [ ] Par défaut, l'onglet "Mes Crédits" devrait être actif
- [ ] ✓ **Vérifier**: Nombre de crédits restants affiché (devrait être ≤ 10)
- [ ] ✓ **Vérifier**: Grand bouton "Publier une offre d'emploi maintenant !" visible
- [ ] ✓ **Vérifier**: Section "Comment fonctionnent les crédits?" visible
- [ ] ✓ **Vérifier**: Forfaits disponibles affichés

#### ✅ 2.3 - Créer une Nouvelle Offre
- [ ] Cliquer sur le bouton jaune "✨ Publier une Offre" (ou bouton dans Mes Crédits)
- [ ] ✓ **Vérifier**: Formulaire de création d'offre s'affiche
- [ ] Remplir le formulaire :
  - **Titre** : "Serveur/Serveuse - Test"
  - **Description** : "Restaurant recherche serveur dynamique"
  - **Type de poste** : "Serveur"
  - **Type d'emploi** : "Temps plein"
  - **Salaire min** : 30000
  - **Salaire max** : 40000
  - **Type salaire** : "Annuel"
  - **Ville** : "Montréal"
  - **Province** : "QC"
- [ ] Cliquer "Publier l'annonce"
- [ ] ✓ **Résultat attendu**: 
  - Message "Annonce publiée avec succès !"
  - Crédits diminuent de 1
  - Redirection vers "Mes Offres"

#### ✅ 2.4 - Mes Offres
- [ ] Cliquer sur "Mes Offres"
- [ ] ✓ **Vérifier**: Liste des offres publiées visible
- [ ] ✓ **Vérifier**: Au moins 1 offre (celle créée à l'instant)
- [ ] ✓ **Vérifier**: Statut "Actif" visible
- [ ] ✓ **Vérifier**: Boutons "Modifier", "Voir candidatures", etc.

#### ✅ 2.5 - Voir les Candidatures Reçues
- [ ] Dans "Mes Offres", cliquer "Voir candidatures" sur une offre
- [ ] ✓ **Résultat attendu**: 
  - Si candidature du Test 1.5 : Au moins 1 candidature visible
  - Nom du candidat : "John Doe"
  - Lettre de motivation visible
  - Statut : "pending"
- [ ] Cliquer sur "Changer le statut" ou bouton similaire
- [ ] Changer le statut à "Reviewed" (Examiné)
- [ ] Ajouter une note employeur : "Profil intéressant"
- [ ] ✓ **Vérifier**: Statut mis à jour

#### ✅ 2.6 - Mon Entreprise
- [ ] Cliquer sur "Mon Entreprise"
- [ ] ✓ **Vérifier**: Informations de l'entreprise pré-remplies
  - Nom : "Hotel Grand Luxe"
  - Ville : "Montréal"
- [ ] Modifier la description
- [ ] Cliquer "Enregistrer"
- [ ] ✓ **Résultat attendu**: Message de confirmation

#### ✅ 2.7 - Utilisateurs
- [ ] Cliquer sur "Utilisateurs"
- [ ] ✓ **Vérifier**: Liste des utilisateurs de l'entreprise
- [ ] ✓ **Vérifier**: Boutons "Ajouter utilisateur", "Modifier", "Désactiver"

#### ✅ 2.8 - Déconnexion
- [ ] Cliquer sur "Déconnexion"
- [ ] ✓ **Résultat attendu**: Retour à l'écran de connexion
- [ ] ✓ **Vérifier**: Token JWT supprimé, pas d'accès au dashboard

---

## 👨‍💼 TEST 3 : PORTAIL ADMIN

### URL
👉 https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/portails/admin.html

### Credentials
- **Email**: `admin@hotelrestojobs.com`
- **Mot de passe**: `admin123`

### Checklist de Test

#### ✅ 3.1 - Connexion
- [ ] Ouvrir le portail admin
- [ ] Entrer les credentials
- [ ] Cliquer sur "Se connecter"
- [ ] ✓ **Résultat attendu**: Dashboard s'affiche, **PAS de rechargement infini** ✨
- [ ] ✓ **Vérifier**: Nom "Admin System" apparaît en haut à droite

#### ✅ 3.2 - Statistiques Globales
- [ ] Par défaut, l'onglet "Statistiques" devrait être actif
- [ ] ✓ **Vérifier**: Cartes de statistiques affichées :
  - Total utilisateurs (≥ 9)
  - Total offres d'emploi (≥ 2)
  - Total candidatures (≥ 0)
  - Revenus totaux
- [ ] ✓ **Vérifier**: Répartition par rôle visible
  - Admin : 1
  - Employeurs : ≥ 1
  - Candidats : ≥ 1

#### ✅ 3.3 - Gestion des Utilisateurs
- [ ] Cliquer sur "Utilisateurs"
- [ ] ✓ **Vérifier**: Liste de tous les utilisateurs visible
- [ ] ✓ **Vérifier**: Colonnes : ID, Email, Rôle, Statut
- [ ] ✓ **Vérifier**: Filtres par rôle disponibles
- [ ] Cliquer sur "Ajouter utilisateur"
- [ ] ✓ **Vérifier**: Modal/formulaire s'affiche
- [ ] Fermer sans créer

#### ✅ 3.4 - Gestion des Employeurs
- [ ] Cliquer sur "Employeurs"
- [ ] ✓ **Vérifier**: Liste des entreprises/employeurs
- [ ] ✓ **Vérifier**: Informations : Nom entreprise, Email, Crédits
- [ ] Cliquer sur un employeur pour voir les détails
- [ ] ✓ **Vérifier**: Historique des offres publiées

#### ✅ 3.5 - Modération des Offres
- [ ] Cliquer sur "Offres d'emploi"
- [ ] ✓ **Vérifier**: Liste de toutes les offres (tous employeurs)
- [ ] ✓ **Vérifier**: Filtres par statut (actif, expiré, etc.)
- [ ] ✓ **Vérifier**: Boutons d'action (approuver, rejeter, supprimer)

#### ✅ 3.6 - Déconnexion
- [ ] Cliquer sur "Déconnexion"
- [ ] ✓ **Résultat attendu**: Retour à l'écran de connexion

---

## 🔒 TEST 4 : SÉCURITÉ

### ✅ 4.1 - Accès Non Autorisé
- [ ] Se déconnecter de tous les portails
- [ ] Essayer d'accéder directement à : `/portails/employeur.html`
- [ ] ✓ **Résultat attendu**: Formulaire de connexion visible (pas de dashboard)

### ✅ 4.2 - Séparation des Rôles
- [ ] Se connecter comme **Candidat**
- [ ] Essayer d'accéder à `/portails/employeur.html`
- [ ] ✓ **Résultat attendu**: Accès refusé ou redirection

### ✅ 4.3 - Expiration de Session
- [ ] Se connecter à un portail
- [ ] Attendre 10 minutes (ou supprimer le token du localStorage via DevTools)
- [ ] Essayer d'effectuer une action
- [ ] ✓ **Résultat attendu**: Redirection vers login avec message "Session expirée"

---

## 🌐 TEST 5 : PAGE D'ACCUEIL PUBLIQUE

### URL
👉 https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/

### Checklist de Test

#### ✅ 5.1 - Navigation
- [ ] ✓ **Vérifier**: Header avec navigation (Emplois, Espace Candidat, Espace Employeur, Admin)
- [ ] ✓ **Vérifier**: Bouton jaune "Publier une offre" dans le header
- [ ] ✓ **Vérifier**: Section hero avec barre de recherche

#### ✅ 5.2 - Bouton CTA "Publier une offre"
- [ ] ✓ **Vérifier**: Bouton jaune vif "Vous recrutez ? Publiez une offre gratuitement !"
- [ ] ✓ **Vérifier**: Bouton flottant en bas à droite "Publier une offre"
- [ ] Cliquer sur un de ces boutons
- [ ] ✓ **Résultat attendu**: Redirection vers `/portails/employeur.html`

#### ✅ 5.3 - Recherche d'Offres
- [ ] Entrer "chef" dans la barre de recherche
- [ ] Entrer "Montréal" dans ville
- [ ] Cliquer "Rechercher"
- [ ] ✓ **Résultat attendu**: Liste d'offres filtrées s'affiche
- [ ] Cliquer sur une offre
- [ ] ✓ **Vérifier**: Page de détail s'affiche avec :
  - Titre, description, salaire
  - Bouton "Postuler maintenant"
  - Bouton flottant "Publier une offre" toujours visible

#### ✅ 5.4 - Offres Vedettes
- [ ] Scroll vers "Emplois Vedettes"
- [ ] ✓ **Vérifier**: Section avec badge "VEDETTE" jaune
- [ ] ✓ **Vérifier**: Design différent des offres normales

---

## 📊 RÉSUMÉ DES TESTS MANUELS

**Après avoir complété tous les tests, cochez ci-dessous** :

- [ ] ✅ **Portail Candidat** : Tous les tests passent
- [ ] ✅ **Portail Employeur** : Pas de rechargement infini, fonctionnel
- [ ] ✅ **Portail Admin** : Pas de rechargement infini, fonctionnel
- [ ] ✅ **Sécurité** : JWT, RBAC opérationnel
- [ ] ✅ **Page d'accueil** : Boutons CTA visibles et fonctionnels
- [ ] ✅ **Upload CV** : Upload, téléchargement, suppression OK

---

## 🐛 Rapport de Bugs

Si vous trouvez des bugs, notez-les ici :

| # | Portail | Description | Sévérité |
|---|---------|-------------|----------|
| 1 |         |             | 🔴🟡🟢 |
| 2 |         |             | 🔴🟡🟢 |

---

**Bon testing ! 🧪✨**
