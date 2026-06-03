# 📚 Guide Utilisateur - Module Blog & Infolettre Employeurs

## 🎯 Vue d'ensemble

Le module Blog & Infolettre Employeurs de HotelRestoJobs vous permet de:
- **Créer et publier des articles** de blog avec SEO optimisé
- **Organiser les articles** par catégories thématiques
- **Envoyer des infolettres** personnalisées aux employeurs
- **Gérer les abonnements** et suivre les statistiques d'engagement

---

## 📋 Table des matières

1. [Gestion des Catégories](#1-gestion-des-catégories)
2. [Gestion du Blog](#2-gestion-du-blog)
3. [Infolettres Employeurs](#3-infolettres-employeurs)
4. [SEO et Référencement](#4-seo-et-référencement)
5. [Bonnes Pratiques](#5-bonnes-pratiques)

---

## 1. Gestion des Catégories

### Accéder aux catégories
1. Connectez-vous au portail admin
2. Cliquez sur l'onglet **"Catégories"**

### Catégories par défaut
Le système inclut 8 catégories prédéfinies:
- 🔵 **Recrutement** - Conseils et stratégies de recrutement
- 🟣 **Hôtellerie** - Actualités du secteur hôtelier
- 🟠 **Restauration** - Best practices en restauration
- 🟢 **Ressources Humaines** - Gestion RH
- 🔴 **Gestion du Personnel** - Outils de gestion d'équipe
- 🔵 **Tendances du Marché** - Analyses et statistiques
- 🟣 **Conseils Employeurs** - Guides pratiques
- 🟢 **Formations** - Opportunités de développement

### Créer une catégorie

1. Cliquez sur **"Nouvelle catégorie"**
2. Remplissez le formulaire:
   - **Nom*** : Ex: "Recrutement"
   - **Slug*** : Ex: "recrutement" (lettres minuscules, tirets uniquement)
   - **Description** : Brève explication
   - **Couleur** : Choisissez une couleur (hex)
   - **Icône** : Code Font Awesome (ex: `fa-utensils`)
   - **Ordre d'affichage** : Numéro pour le tri (0 = premier)
3. Cliquez **"Enregistrer"**

### Modifier une catégorie

1. Cliquez sur **"Modifier"** sur la catégorie
2. Modifiez les champs souhaités
3. Cliquez **"Enregistrer"**

### Supprimer une catégorie

1. Cliquez sur **"Supprimer"** sur la catégorie
2. Confirmez la suppression
3. ⚠️ **Note**: Les articles associés ne seront PAS supprimés

---

## 2. Gestion du Blog

### Accéder au blog
1. Connectez-vous au portail admin
2. Cliquez sur l'onglet **"Blog"**

### Créer un article

1. Cliquez sur **"Nouvel article"**
2. Remplissez les informations de base:

#### Informations de base
- **Titre*** : Titre de l'article (max 60 caractères pour SEO)
- **Slug** : URL de l'article (auto-généré si vide)
  - Ex: "10-conseils-recrutement"
- **Extrait** : Résumé court (2-3 lignes)
- **Contenu*** : Texte complet de l'article
- **Image vedette** : URL de l'image principale

#### Catégories
- Cochez **une ou plusieurs catégories**
- Les catégories apparaîtront avec leur couleur sur l'article

#### Référencement SEO
Remplissez les champs SEO pour améliorer le référencement:

**Meta Tags:**
- **Meta Title** : Titre pour Google (max 60 car.)
  - Par défaut: utilise le titre de l'article
- **Meta Description** : Description pour Google (max 160 car.)
  - Par défaut: utilise l'extrait

**Open Graph (Réseaux sociaux):**
- **OG Title** : Titre pour Facebook/LinkedIn
- **OG Description** : Description pour partage
- **OG Image** : Image pour aperçu (1200x630px recommandé)

**Autres:**
- **Mots-clés** : Séparés par virgules
  - Ex: "recrutement, hôtellerie, emploi, RH"
- **URL Canonique** : URL officielle de l'article

#### Statut
- **Brouillon** : Non visible publiquement
- **Publié** : Visible sur le blog public
- **Archivé** : Masqué mais conservé

3. Cliquez **"Enregistrer"**

### Modifier un article

1. Cliquez sur **"Modifier"** sur l'article
2. Modifiez les champs souhaités
3. Cliquez **"Enregistrer"**

### Publier un article

**Passage de Brouillon à Publié:**
1. Modifiez l'article
2. Changez le statut en **"Publié"**
3. Enregistrez
4. ✅ L'article est maintenant visible publiquement avec une date de publication

### Supprimer un article

1. Cliquez sur **"Supprimer"** sur l'article
2. Confirmez la suppression
3. ⚠️ **Attention**: Action irréversible

### Filtrer les articles

- **Par statut** : Brouillon / Publié / Archivé
- **Par recherche** : Tapez dans le champ de recherche

---

## 3. Infolettres Employeurs

### Accéder aux infolettres
1. Connectez-vous au portail admin
2. Cliquez sur l'onglet **"Infolettre Employeurs"**

### Vue d'ensemble
- **Compteur d'abonnés** : Nombre d'employeurs abonnés
- **Liste des infolettres** : Historique complet

### Créer une infolettre

1. Cliquez sur **"Nouvelle infolettre"**
2. Remplissez le formulaire:

#### Informations principales
- **Titre (interne)*** : Ex: "Infolettre Juin 2026"
  - Utilisé uniquement dans l'admin
- **Sujet de l'email*** : Ex: "Nouveaux articles et conseils"
  - Visible dans la boîte de réception
- **Texte de prévisualisation** : Texte court affiché dans l'aperçu email
  - Ex: "Découvrez nos 5 nouveaux articles"

#### Type de contenu
Choisissez parmi:
- **Articles de blog + Offres récentes** (Recommandé)
  - Combine articles sélectionnés + 5 dernières offres actives
- **Articles de blog uniquement**
  - Seulement les articles sélectionnés
- **Offres d'emploi uniquement**
  - Seulement les offres récentes

#### Sélection des articles
- Cochez les **articles à inclure** dans la liste
- Seuls les articles **publiés** sont affichés
- Les articles apparaîtront dans l'ordre de sélection

3. Cliquez **"Enregistrer"**

### Prévisualiser une infolettre

1. Cliquez sur **"Prévisualiser"** sur l'infolettre
2. Une nouvelle fenêtre s'ouvre avec le rendu HTML
3. Vérifiez:
   - ✅ Apparence générale
   - ✅ Images et liens
   - ✅ Articles et offres affichés
   - ✅ Design responsive

### Envoyer une infolettre

⚠️ **Important**: Vous ne pouvez envoyer que des infolettres en **statut Brouillon**

1. Cliquez sur **"Envoyer"** sur l'infolettre
2. **Confirmez** l'envoi
3. 📧 L'infolettre est envoyée à **tous les employeurs abonnés**
4. Le statut passe à **"Envoyée"**
5. Les statistiques sont mises à jour:
   - **Envois** : Nombre de destinataires
   - **Ouvertures** : Nombre d'emails ouverts
   - **Clics** : Nombre de clics sur les liens

### Modifier une infolettre

- ⚠️ **Seules les infolettres en Brouillon** peuvent être modifiées
- Les infolettres envoyées sont **en lecture seule**

### Statuts des infolettres

- **Brouillon** : En cours de création
- **Programmée** : Envoi planifié (à venir)
- **Envoyée** : Déjà envoyée aux abonnés
- **Annulée** : Annulée avant l'envoi

---

## 4. SEO et Référencement

### Pourquoi le SEO est important ?

Le référencement naturel (SEO) permet à vos articles d'être trouvés sur Google et autres moteurs de recherche. Un bon SEO = plus de visiteurs = plus d'employeurs intéressés.

### Les 3 piliers du SEO

#### 1. Meta Title & Description
**Meta Title** (60 caractères max)
- Apparaît en bleu dans les résultats Google
- Doit contenir le mot-clé principal
- Exemple: "10 Conseils pour Recruter en Hôtellerie | HotelRestoJobs"

**Meta Description** (160 caractères max)
- Texte sous le titre dans Google
- Doit donner envie de cliquer
- Exemple: "Découvrez nos 10 meilleurs conseils pour réussir vos recrutements dans le secteur hôtelier. Stratégies éprouvées par des professionnels."

#### 2. Mots-clés
- 5-10 mots-clés pertinents
- Séparés par des virgules
- Doivent être présents dans le contenu
- Exemple: "recrutement, hôtellerie, ressources humaines, embauche, candidats"

#### 3. Open Graph (Partage social)
Lorsqu'on partage l'article sur Facebook/LinkedIn:
- **OG Title** : Titre accrocheur (peut différer du titre SEO)
- **OG Description** : Description engageante
- **OG Image** : Image 1200x630px (format optimal)

### Checklist SEO par article

- [ ] Titre clair et contenant le mot-clé principal
- [ ] Meta Title personnalisé (si différent du titre)
- [ ] Meta Description rédigée (2 phrases max)
- [ ] 5-10 mots-clés pertinents ajoutés
- [ ] Open Graph Title défini
- [ ] Open Graph Description rédigée
- [ ] Open Graph Image ajoutée (1200x630px)
- [ ] URL Canonique définie si nécessaire
- [ ] Au moins 1 catégorie sélectionnée
- [ ] Image vedette ajoutée

### Outils recommandés

**Pour vérifier le SEO:**
- [Google Search Console](https://search.google.com/search-console)
- [Yoast SEO WordPress Plugin](https://yoast.com/) (référence)

**Pour créer des images Open Graph:**
- [Canva](https://www.canva.com/) - Templates gratuits
- [Remove.bg](https://www.remove.bg/) - Retirer fond images

**Pour trouver des mots-clés:**
- [Google Trends](https://trends.google.com/)
- [AnswerThePublic](https://answerthepublic.com/)

---

## 5. Bonnes Pratiques

### Rédaction d'articles

**Structure recommandée:**
1. **Introduction** (1-2 paragraphes)
   - Présenter le sujet
   - Expliquer pourquoi c'est important

2. **Corps de l'article** (3-5 sections)
   - Utiliser des sous-titres H2/H3
   - Paragraphes courts (3-4 lignes)
   - Listes à puces pour faciliter la lecture

3. **Conclusion** (1 paragraphe)
   - Résumer les points clés
   - Appel à l'action (CTA)

**Conseils:**
- ✅ Phrases courtes et claires
- ✅ Un seul sujet par article
- ✅ 800-1500 mots (optimal pour SEO)
- ✅ Images tous les 300-400 mots
- ✅ Liens internes vers d'autres articles
- ❌ Éviter le jargon technique
- ❌ Pas de fautes d'orthographe
- ❌ Ne pas copier-coller d'autres sites

### Choix des catégories

**Une seule catégorie:**
- Pour les articles très ciblés
- Exemple: Un article 100% recrutement

**Plusieurs catégories:**
- Pour les articles transversaux
- Exemple: "Recruter en restauration" → Recrutement + Restauration

**Maximum recommandé:** 3 catégories par article

### Fréquence de publication

**Recommandations:**
- **Minimum** : 1 article par mois
- **Optimal** : 1 article par semaine
- **Idéal** : 2-3 articles par semaine

**Calendrier éditorial suggéré:**
- Lundi : Conseils employeurs
- Mercredi : Tendances du marché
- Vendredi : Success stories / Cas pratiques

### Infolettres efficaces

**Timing d'envoi:**
- **Jour** : Mardi ou Mercredi (meilleur taux d'ouverture)
- **Heure** : 9h-10h ou 14h-15h
- **Fréquence** : Toutes les 2 semaines maximum

**Contenu:**
- 3-5 articles maximum par infolettre
- Varier les catégories
- Toujours inclure un CTA clair
- Personnaliser le texte de prévisualisation

**Sujet d'email accrocheur:**
✅ "5 nouvelles stratégies de recrutement à tester"
✅ "Comment réduire le turnover en restauration ?"
❌ "Newsletter juin 2026"
❌ "Nouveaux articles"

### Gestion des abonnements

**Les employeurs sont automatiquement abonnés** sauf s'ils se désabonnent.

**Pour voir les statistiques:**
- Nombre d'abonnés : Affiché en haut de l'onglet
- Taux d'ouverture : Sur chaque infolettre envoyée
- Taux de clics : Sur chaque infolettre envoyée

---

## 📊 Statistiques et Suivi

### Métriques disponibles

**Par article:**
- Nombre de vues
- Nombre de partages (à venir)
- Temps de lecture moyen (à venir)

**Par infolettre:**
- Nombre d'envois
- Taux d'ouverture
- Taux de clics

**Par catégorie:**
- Nombre d'articles
- Total des vues (à venir)

### Interpréter les statistiques

**Taux d'ouverture (infolettre):**
- < 15% : Faible (améliorer le sujet)
- 15-25% : Moyen
- \> 25% : Excellent

**Taux de clics (infolettre):**
- < 2% : Faible (améliorer le contenu)
- 2-5% : Moyen
- \> 5% : Excellent

---

## 🆘 Dépannage

### Problème: L'article ne s'affiche pas publiquement

**Solution:**
1. Vérifiez que le statut est **"Publié"** (pas Brouillon)
2. Vérifiez qu'au moins **1 catégorie** est sélectionnée
3. Actualisez la page du blog

### Problème: Les catégories n'apparaissent pas dans le formulaire

**Solution:**
1. Créez d'abord des catégories dans l'onglet "Catégories"
2. Rouvrez le formulaire article
3. Les catégories devraient maintenant apparaître

### Problème: L'infolettre ne peut pas être envoyée

**Causes possibles:**
1. Statut ≠ "Brouillon" → Seules les brouillons peuvent être envoyés
2. Aucun article sélectionné → Sélectionnez au moins 1 article
3. Aucun employeur abonné → Vérifiez le compteur d'abonnés

### Problème: Les images ne s'affichent pas

**Solution:**
1. Vérifiez que l'URL commence par `https://`
2. Testez l'URL dans un nouvel onglet
3. Utilisez un hébergement d'images fiable (Cloudinary, Imgur, etc.)

---

## 📞 Support

Pour toute question ou problème technique:
- Email: support@hotelrestojobs.com
- Documentation technique: `/NEWSLETTER_SYSTEM.md`
- Tests: `/NEWSLETTER_TESTING_GUIDE.md`

---

**Version**: 2.0.0  
**Date**: 2026-06-03  
**Auteur**: HotelRestoJobs

✅ **Votre système est prêt à l'emploi !**
