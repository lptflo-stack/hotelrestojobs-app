# 🧪 Guide de Tests Frontend Manuels - Système Bilingue

**URL de Test:** https://3000-ievn0noon97t3dtjl6lnj-3844e1b6.sandbox.novita.ai

## 📋 Checklist des Tests

### ✅ Test 1: Page d'Accueil - Changement de Langue

**Étapes:**
1. Ouvrir https://3000-ievn0noon97t3dtjl6lnj-3844e1b6.sandbox.novita.ai
2. **Vérifier langue par défaut FR:**
   - [ ] Interface en français
   - [ ] Sélecteur montre 🇨🇦 **FR** actif (fond blanc/30)
   - [ ] Titre "Trouvez votre emploi de rêve dans l'hôtellerie-restauration"
   - [ ] Bouton "Rechercher"

3. **Vérifier offres affichées en FR:**
   - [ ] Voir 6 offres (ou plus si anciennes offres présentes)
   - [ ] Offre "Chef de Cuisine - Cuisine Française" visible
   - [ ] Offre "Serveur/Serveuse - Restaurant Bilingue" visible
   - [ ] Offre "Restaurant Manager - High-End Dining" **PAS VISIBLE**

4. **Changer langue → EN:**
   - [ ] Cliquer sur bouton **EN** (🇨🇦 EN)
   - [ ] Sélecteur montre **EN** actif (fond blanc/30)
   - [ ] Interface se traduit instantanément
   - [ ] Titre devient "Find your dream job in hospitality"
   - [ ] Bouton devient "Search"

5. **Vérifier offres affichées en EN:**
   - [ ] Console affiche "Langue changée à: en"
   - [ ] Voir 2 offres minimum
   - [ ] Offre "Restaurant Manager - High-End Dining" visible
   - [ ] Offre "Waiter/Waitress - Bilingual Restaurant" visible
   - [ ] Offres FR uniquement **PAS VISIBLES**

6. **Revenir sur FR:**
   - [ ] Cliquer sur bouton **FR**
   - [ ] Interface revient en français
   - [ ] Offres FR réapparaissent
   - [ ] Console affiche "Langue changée à: fr"

---

### ✅ Test 2: Page Détail - Offre FR Uniquement

**Étapes:**
1. Sur page d'accueil, cliquer sur "Chef de Cuisine - Cuisine Française" (ID 5)
2. **Vérifier affichage en FR:**
   - [ ] URL: `/emploi/5`
   - [ ] Sélecteur de langue présent dans header
   - [ ] Titre: "Chef de Cuisine - Cuisine Française"
   - [ ] Description en français
   - [ ] Section "Description du poste"
   - [ ] Section "Exigences"
   - [ ] Section "Avantages"
   - [ ] Bouton "Postuler maintenant"
   - [ ] Label "vues" et "candidatures"

3. **Changer langue → EN:**
   - [ ] Cliquer sur **EN**
   - [ ] Interface se traduit (header, boutons)
   - [ ] Sections deviennent "Job Description", "Requirements", "Benefits"
   - [ ] Bouton devient "Apply Now"
   - [ ] Labels "views" et "applications"
   - [ ] **CONTENU reste en français** (fallback car pas de version EN)
   - [ ] Titre reste "Chef de Cuisine - Cuisine Française"

---

### ✅ Test 3: Page Détail - Offre EN Uniquement

**Étapes:**
1. Mettre langue sur EN (🇨🇦 EN)
2. Retour page d'accueil (cliquer logo ou "Back to Jobs")
3. Cliquer sur "Restaurant Manager - High-End Dining" (ID 6)
4. **Vérifier affichage en EN:**
   - [ ] URL: `/emploi/6`
   - [ ] Titre: "Restaurant Manager - High-End Dining"
   - [ ] Description en anglais
   - [ ] Sections "Job Description", "Requirements", "Benefits"

5. **Changer langue → FR:**
   - [ ] Cliquer sur **FR**
   - [ ] Interface se traduit en français
   - [ ] **CONTENU reste en anglais** (fallback car pas de version FR)
   - [ ] Titre reste "Restaurant Manager - High-End Dining"

---

### ✅ Test 4: Page Détail - Offre Bilingue

**Étapes:**
1. Mettre langue sur FR
2. Retour page d'accueil
3. Cliquer sur "Serveur/Serveuse - Restaurant Bilingue" (ID 7)
4. **Vérifier affichage en FR:**
   - [ ] URL: `/emploi/7`
   - [ ] Titre: "Serveur/Serveuse - Restaurant Bilingue"
   - [ ] Description: "Nous recherchons un serveur ou une serveuse dynamique..."
   - [ ] Exigences: "Bilinguisme français-anglais (obligatoire)"
   - [ ] Avantages: "Pourboires généreux"

5. **Changer langue → EN:**
   - [ ] Cliquer sur **EN**
   - [ ] Console affiche "Langue changée à: en"
   - [ ] Titre devient: "Waiter/Waitress - Bilingual Restaurant"
   - [ ] Description devient: "We are looking for a dynamic and bilingual..."
   - [ ] Exigences: "Bilingualism French-English (required)"
   - [ ] Avantages: "Generous tips"

6. **Revenir sur FR:**
   - [ ] Cliquer sur **FR**
   - [ ] Titre redevient français
   - [ ] Contenu redevient français

---

### ✅ Test 5: Recherche Multilingue

**Étapes:**
1. Page d'accueil en **FR**
2. **Recherche par mot-clé français:**
   - [ ] Taper "Chef" dans champ recherche
   - [ ] Cliquer "Rechercher"
   - [ ] Résultats affichent offres avec "Chef"
   - [ ] Offre "Chef de Cuisine" visible

3. **Changer langue → EN:**
   - [ ] Cliquer sur **EN**
   - [ ] Recherche se relance automatiquement
   - [ ] Résultats s'adaptent (offres EN + bilingues)

4. **Recherche par mot-clé anglais:**
   - [ ] Taper "Manager" dans champ recherche
   - [ ] Cliquer "Search"
   - [ ] Résultats affichent offres avec "Manager"
   - [ ] Offre "Restaurant Manager" visible

5. **Recherche par ville:**
   - [ ] Taper "Montréal" dans champ ville
   - [ ] Cliquer "Search"
   - [ ] Résultats affichent offres à Montréal
   - [ ] Respecte le filtre de langue actif

---

### ✅ Test 6: Portail Employeur - Créer Offre Bilingue

**Étapes:**
1. Ouvrir https://3000-ievn0noon97t3dtjl6lnj-3844e1b6.sandbox.novita.ai/portails/employeur.html
2. **Se connecter:**
   - Email: (utiliser un compte existant)
   - Mot de passe: (selon compte)

3. **Créer nouvelle offre:**
   - [ ] Cliquer "Créer une offre"
   - [ ] **Sélection langue:**
     - [ ] Voir 3 options radio: "Français uniquement", "English only", "Bilingue FR/EN"
   
4. **Test: Sélectionner "Français uniquement":**
   - [ ] Seuls champs FR visibles
   - [ ] Pas d'onglets FR/EN
   - [ ] Remplir titre FR, description FR
   - [ ] Publier
   - [ ] Vérifier: offre visible en mode FR, pas en mode EN (page d'accueil)

5. **Test: Sélectionner "English only":**
   - [ ] Seuls champs EN visibles
   - [ ] Remplir titre EN, description EN
   - [ ] Publier
   - [ ] Vérifier: offre visible en mode EN, pas en mode FR

6. **Test: Sélectionner "Bilingue FR/EN":**
   - [ ] Voir onglets "🇫🇷 Français" et "🇬🇧 English"
   - [ ] **Onglet FR:**
     - [ ] Remplir "Titre en français"
     - [ ] Remplir "Description en français"
     - [ ] Remplir "Exigences en français"
     - [ ] Remplir "Avantages en français"
   - [ ] **Onglet EN:**
     - [ ] Cliquer onglet "🇬🇧 English"
     - [ ] Remplir "English title"
     - [ ] Remplir "English description"
     - [ ] Remplir "English requirements"
     - [ ] Remplir "English benefits"
   - [ ] **Champs communs:**
     - [ ] Position type
     - [ ] Employment type
     - [ ] Salary
     - [ ] Location
   - [ ] Publier
   - [ ] **Validation:**
     - [ ] Si champ FR manquant → erreur
     - [ ] Si champ EN manquant → erreur
     - [ ] Si tout OK → confirmation avec "🌐 Langue: Bilingue FR/EN"

7. **Vérifier sur page publique:**
   - [ ] Page d'accueil en FR → offre visible avec titre FR
   - [ ] Changer EN → offre visible avec titre EN
   - [ ] Cliquer détail en FR → contenu FR
   - [ ] Changer EN → contenu EN

---

### ✅ Test 7: Portail Employeur - Éditer Offre Bilingue

**Étapes:**
1. Portail employeur, section "Mes offres"
2. **Trouver offre bilingue:**
   - [ ] Voir badge "🌐 Bilingue" sur l'offre

3. **Cliquer "Modifier":**
   - [ ] Radio "Bilingue FR/EN" pré-sélectionné
   - [ ] Onglets FR/EN visibles
   - [ ] **Vérifier pré-remplissage FR:**
     - [ ] Titre FR affiché
     - [ ] Description FR affichée
     - [ ] Exigences FR affichées
     - [ ] Avantages FR affichés
   - [ ] **Vérifier pré-remplissage EN:**
     - [ ] Titre EN affiché
     - [ ] Description EN affichée
     - [ ] Exigences EN affichées
     - [ ] Avantages EN affichés

4. **Modifier contenu:**
   - [ ] Modifier titre FR
   - [ ] Modifier description EN
   - [ ] Sauvegarder

5. **Vérifier modifications:**
   - [ ] Page d'accueil FR → nouveau titre FR
   - [ ] Page détail EN → nouvelle description EN
   - [ ] Autres champs non modifiés inchangés

---

## 📊 Résumé de la Checklist

| Test | Scénarios | Items | Statut |
|------|-----------|-------|--------|
| 1. Page d'accueil | 6 | 18 | ⏳ À tester |
| 2. Détail FR | 3 | 13 | ⏳ À tester |
| 3. Détail EN | 5 | 9 | ⏳ À tester |
| 4. Détail Bilingue | 6 | 11 | ⏳ À tester |
| 5. Recherche | 5 | 12 | ⏳ À tester |
| 6. Créer Offre | 7 | 21 | ⏳ À tester |
| 7. Éditer Offre | 5 | 13 | ⏳ À tester |

**Total:** 37 scénarios, 97 items à vérifier

---

## 🐛 Bugs Potentiels à Surveiller

### Issues Connus à Tester
1. **Langue sélecteur:**
   - [ ] Sélecteur reste synchronisé entre pages
   - [ ] LocalStorage persiste la langue

2. **Rechargement offres:**
   - [ ] Pas de double chargement lors changement langue
   - [ ] Pas d'erreurs console

3. **Formulaire bilingue:**
   - [ ] Onglets restent visibles après sélection bilingue
   - [ ] Validation empêche publication si champs manquants
   - [ ] Pré-remplissage édition fonctionne

4. **Fallback:**
   - [ ] Offre FR consultée en EN reste accessible
   - [ ] Message indiquant langue disponible (optionnel)

---

## 📝 Instructions pour Tester

1. **Ouvrir la console navigateur** (F12) pour voir les logs
2. **Cocher chaque item** au fur et à mesure des tests
3. **Noter tout bug** dans section "🐛 Bugs Trouvés" ci-dessous
4. **Prendre captures d'écran** si problème

---

## 🐛 Bugs Trouvés
*(À remplir pendant les tests)*

### Bug #1:
- **Description:**
- **Étapes pour reproduire:**
- **Comportement attendu:**
- **Comportement observé:**

### Bug #2:
- **Description:**
- **Étapes pour reproduire:**
- **Comportement attendu:**
- **Comportement observé:**

---

## ✅ Validation Finale

Une fois tous les tests passés:
- [ ] Tous les scénarios testés
- [ ] Aucun bug bloquant
- [ ] Système bilingue fonctionnel
- [ ] Prêt pour déploiement production

**Signature:** ________________  
**Date:** ________________
