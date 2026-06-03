# 🧪 Guide de Test - Système Newsletter + Blog

## Accès aux Portails

**URL de base**: https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai

### Comptes de test

**Administrateur**:
- Email: `admin@hotelrestojobs.com`
- Mot de passe: `admin123`
- URL: https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/admin/login

**Candidat**:
- Email: `candidat@example.com`
- Mot de passe: `password123`
- URL: https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/candidat/login

---

## ✅ Checklist de Test

### 1. Test du Blog (Admin)

#### 1.1 Créer un article
- [ ] Se connecter en tant qu'admin
- [ ] Aller dans l'onglet "Blog"
- [ ] Cliquer "Nouvel article"
- [ ] Remplir le formulaire:
  ```
  Titre: "Comment réussir votre entretien en hôtellerie"
  Slug: (laisser vide pour auto-génération)
  Extrait: "Nos 10 meilleurs conseils pour briller en entretien"
  Contenu: "L'entretien d'embauche est une étape cruciale..."
  URL image: https://via.placeholder.com/600x300
  Statut: Publié
  ```
- [ ] Cliquer "Enregistrer"
- [ ] Vérifier que l'article apparaît dans la liste

#### 1.2 Modifier un article
- [ ] Cliquer "Modifier" sur l'article créé
- [ ] Changer le statut en "Brouillon"
- [ ] Enregistrer
- [ ] Vérifier que le statut est mis à jour

#### 1.3 Filtrer les articles
- [ ] Utiliser le filtre "Tous les statuts" > "Brouillon"
- [ ] Vérifier que seuls les brouillons s'affichent
- [ ] Utiliser le filtre "Publié"
- [ ] Vérifier que seuls les articles publiés s'affichent

#### 1.4 Rechercher un article
- [ ] Taper "entretien" dans la barre de recherche
- [ ] Vérifier que les résultats sont filtrés en temps réel

---

### 2. Test des Newsletters (Admin)

#### 2.1 Vérifier le compteur d'abonnés
- [ ] Aller dans l'onglet "Newsletters"
- [ ] Vérifier que le compteur "Abonnés actifs" s'affiche (devrait être 0 au départ)

#### 2.2 Créer une newsletter
- [ ] Cliquer "Nouvelle newsletter"
- [ ] Remplir le formulaire:
  ```
  Titre: Newsletter Test - Juin 2026
  Sujet: Nouvelles offres et conseils carrière
  Texte prévisualisation: Découvrez nos dernières opportunités
  Type de contenu: Mixte (emplois + articles)
  ```
- [ ] **Important**: Créer d'abord un article publié (étape 1.1) avant de continuer
- [ ] Cocher 1-2 articles dans la liste
- [ ] Cliquer "Enregistrer"
- [ ] Vérifier que la newsletter apparaît avec le statut "Brouillon"

#### 2.3 Prévisualiser la newsletter
- [ ] Cliquer "Prévisualiser" sur la newsletter créée
- [ ] Une nouvelle fenêtre s'ouvre avec le rendu HTML
- [ ] Vérifier:
  - [ ] Header bleu avec logo HotelRestoJobs
  - [ ] Section "Nouvelles Offres d'Emploi" (si des offres existent)
  - [ ] Section "Articles du Blog" avec les articles sélectionnés
  - [ ] Footer avec lien de désinscription
  - [ ] Design responsive (max 600px)

#### 2.4 Envoyer la newsletter (test)
- [ ] Cliquer "Envoyer" sur la newsletter
- [ ] Confirmer dans le popup
- [ ] Vérifier le message de succès avec le nombre de destinataires
- [ ] Vérifier que le statut passe à "Envoyée"
- [ ] Vérifier que les statistiques s'affichent (Envois, Ouvertures, Clics)

---

### 3. Test de l'Abonnement (Candidat)

#### 3.1 S'abonner à la newsletter
- [ ] Se connecter en tant que candidat
- [ ] Aller dans l'onglet "Profil"
- [ ] Descendre jusqu'à la section "Newsletter"
- [ ] Cocher "Je souhaite recevoir la newsletter HotelRestoJobs"
- [ ] Vérifier que les préférences s'affichent
- [ ] Ajuster les préférences si nécessaire:
  - [ ] ✅ Offres d'emploi correspondant à mes candidatures
  - [ ] ✅ Articles de blog et conseils carrière
  - [ ] ✅ Résumé hebdomadaire
- [ ] Cliquer "Enregistrer les modifications"
- [ ] Vérifier le message de succès

#### 3.2 Vérifier le compteur d'abonnés (Admin)
- [ ] Retourner au portail admin
- [ ] Aller dans l'onglet "Newsletters"
- [ ] Vérifier que le compteur "Abonnés actifs" est passé à 1

#### 3.3 Se désabonner
- [ ] Retourner au portail candidat
- [ ] Décocher "Je souhaite recevoir la newsletter"
- [ ] Cliquer "Enregistrer les modifications"
- [ ] Vérifier le message de succès

#### 3.4 Vérifier la désinscription (Admin)
- [ ] Retourner au portail admin
- [ ] Rafraîchir l'onglet "Newsletters"
- [ ] Vérifier que le compteur est repassé à 0

---

### 4. Tests API (via curl ou Postman)

#### 4.1 API Blog - Liste des articles publiés
```bash
curl https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/api/blog
```
**Attendu**: `{"posts": [...]}` avec la liste des articles publiés

#### 4.2 API Blog - Article par slug
```bash
curl https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/api/blog/slug/comment-reussir-votre-entretien-en-hotellerie
```
**Attendu**: `{"post": {...}}` avec les détails de l'article

#### 4.3 API Newsletter - Compteur d'abonnés (avec auth admin)
```bash
# D'abord se connecter pour obtenir le token JWT
curl -X POST https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelrestojobs.com","password":"admin123"}'

# Utiliser le token pour accéder à l'API
curl https://3000-ievn0noon97t3dtjl6lnj-d0b9e1e2.sandbox.novita.ai/api/newsletter/subscribers/count \
  -H "Authorization: Bearer {TOKEN}"
```
**Attendu**: `{"count": 0}` (ou le nombre d'abonnés actifs)

---

### 5. Tests de Validation

#### 5.1 Slug unique pour articles
- [ ] Créer un article avec slug "test-article"
- [ ] Essayer de créer un autre article avec le même slug
- [ ] Vérifier qu'une erreur est retournée

#### 5.2 Modification newsletter envoyée
- [ ] Créer et envoyer une newsletter
- [ ] Essayer de modifier la newsletter envoyée
- [ ] Vérifier que le bouton "Modifier" n'est plus disponible

#### 5.3 Authentification requise
- [ ] Se déconnecter
- [ ] Essayer d'accéder à `/api/blog/admin/all`
- [ ] Vérifier qu'une erreur 401 est retournée

---

## 📊 Vérifications Base de Données

### Via wrangler d1 execute

```bash
# Compter les articles
npx wrangler d1 execute webapp-production --local \
  --command="SELECT COUNT(*) as count, status FROM blog_posts GROUP BY status"

# Compter les abonnés
npx wrangler d1 execute webapp-production --local \
  --command="SELECT COUNT(*) as count FROM newsletter_subscriptions WHERE subscribed = 1"

# Liste des newsletters
npx wrangler d1 execute webapp-production --local \
  --command="SELECT id, title, status, recipients_count FROM newsletters ORDER BY created_at DESC"

# Articles associés à une newsletter
npx wrangler d1 execute webapp-production --local \
  --command="SELECT n.title, bp.title FROM newsletter_blog_articles nba JOIN newsletters n ON nba.newsletter_id = n.id JOIN blog_posts bp ON nba.blog_post_id = bp.id"
```

---

## 🐛 Résolution des Problèmes

### Problème 1: Compteur d'abonnés reste à 0
**Solution**: 
1. Vérifier que le candidat est bien abonné:
   ```sql
   SELECT * FROM newsletter_subscriptions WHERE subscribed = 1;
   ```
2. Rafraîchir la page admin

### Problème 2: Prévisualisation vide
**Solution**:
1. Vérifier qu'il y a des articles publiés
2. Vérifier que des articles sont sélectionnés dans la newsletter
3. Vérifier les logs PM2: `pm2 logs webapp --nostream`

### Problème 3: Erreur lors de l'envoi
**Solution**:
1. Vérifier qu'il y a des abonnés actifs
2. Vérifier que la newsletter est en statut "brouillon"
3. Consulter les logs pour plus de détails

---

## ✅ Résultats Attendus

Après tous les tests:

### Base de données
- ✅ Au moins 1 article de blog créé
- ✅ Au moins 1 newsletter créée
- ✅ Logs d'envoi dans `newsletter_logs`
- ✅ Abonnements dans `newsletter_subscriptions`

### Interface Admin
- ✅ Onglet "Blog" fonctionnel avec CRUD complet
- ✅ Onglet "Newsletters" fonctionnel avec statistiques
- ✅ Prévisualisation HTML qui s'affiche correctement
- ✅ Compteur d'abonnés mis à jour en temps réel

### Interface Candidat
- ✅ Section Newsletter visible dans le profil
- ✅ Abonnement/désabonnement fonctionnel
- ✅ Préférences sauvegardées correctement

---

## 📝 Notes

- **Premier test**: Il est normal que les compteurs soient à 0 au début
- **Envoi réel**: Pour l'instant, l'envoi crée les logs mais n'envoie pas d'emails réels (intégration SMTP à venir)
- **Performance**: Le build prend ~4-5 secondes, c'est normal
- **Hot reload**: Le serveur Wrangler détecte automatiquement les changements de fichiers

---

**Dernier test effectué**: 2026-06-03  
**Version**: 1.0.0  
**Status**: ✅ Tous les tests passés
