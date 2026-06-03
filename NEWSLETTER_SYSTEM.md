# 📧 Système Newsletter + Blog - HotelRestoJobs

## Vue d'ensemble

Le système Newsletter + Blog permet à HotelRestoJobs de créer et envoyer des newsletters personnalisées aux candidats, contenant des offres d'emploi pertinentes et des articles de blog.

## 🎯 Fonctionnalités

### Pour les Administrateurs

#### 1. Gestion du Blog
- **Créer des articles** avec titre, contenu, image vedette
- **Brouillons** pour travailler progressivement
- **Publication** avec URL slug automatique ou personnalisé
- **Archivage** des anciens articles
- **Statistiques** de vues par article
- **Recherche** et filtres par statut

#### 2. Gestion des Newsletters
- **Créer des campagnes** avec titre, sujet, texte de prévisualisation
- **Sélectionner des articles** de blog à inclure
- **3 types de templates**:
  - Mixte (emplois + articles)
  - Emplois uniquement
  - Articles de blog uniquement
- **Prévisualiser** le rendu HTML avant envoi
- **Envoyer** à tous les abonnés actifs
- **Statistiques** d'envoi, ouvertures, clics

### Pour les Candidats

#### 1. Abonnement Newsletter
- **S'abonner/se désabonner** en un clic
- **Préférences personnalisées**:
  - Offres d'emploi correspondant à mes candidatures
  - Articles de blog et conseils carrière
  - Résumé hebdomadaire des opportunités

## 📊 Base de données

### Tables créées (migration 0005)

#### `blog_posts`
```sql
- id (PRIMARY KEY)
- title (TEXT)
- slug (TEXT UNIQUE) -- URL-friendly
- excerpt (TEXT) -- Résumé court
- content (TEXT) -- Contenu complet
- featured_image_url (TEXT)
- author_id (FK vers users)
- status (draft/published/archived)
- published_at (DATETIME)
- views_count (INTEGER)
- created_at, updated_at
```

#### `newsletters`
```sql
- id (PRIMARY KEY)
- title (TEXT) -- Titre interne
- subject (TEXT) -- Sujet de l'email
- preview_text (TEXT) -- Texte de prévisualisation
- status (draft/scheduled/sent/cancelled)
- template_type (mixed/jobs_only/blog_only)
- created_by (FK vers users)
- scheduled_at, sent_at (DATETIME)
- recipients_count, opened_count, clicked_count (INTEGER)
- created_at, updated_at
```

#### `newsletter_blog_articles`
```sql
- id (PRIMARY KEY)
- newsletter_id (FK vers newsletters)
- blog_post_id (FK vers blog_posts)
- display_order (INTEGER)
```

#### `newsletter_subscriptions`
```sql
- id (PRIMARY KEY)
- user_id (FK vers users)
- subscribed (BOOLEAN)
- preferences (JSON)
- unsubscribe_token (TEXT UNIQUE)
- subscribed_at, unsubscribed_at (DATETIME)
- created_at, updated_at
```

#### `newsletter_logs`
```sql
- id (PRIMARY KEY)
- newsletter_id (FK vers newsletters)
- user_id (FK vers users)
- sent_at (DATETIME)
- opened_at (DATETIME)
- clicked_at (DATETIME)
```

## 🔌 API Endpoints

### Blog API (`/api/blog`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | Public | Liste des articles publiés (avec search) |
| GET | `/slug/:slug` | Public | Article par slug (incrémente vues) |
| GET | `/admin/all` | Admin | Tous les articles (tous statuts) |
| POST | `/` | Admin | Créer un article |
| PUT | `/:id` | Admin | Modifier un article |
| DELETE | `/:id` | Admin | Supprimer un article |

### Newsletter API (`/api/newsletter`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | Admin | Liste toutes les newsletters |
| GET | `/:id` | Admin | Détails d'une newsletter |
| GET | `/:id/preview` | Admin | Prévisualiser le HTML |
| POST | `/` | Admin | Créer une newsletter |
| PUT | `/:id` | Admin | Modifier une newsletter |
| POST | `/:id/send` | Admin | Envoyer la newsletter |
| GET | `/subscribers/count` | Admin | Nombre d'abonnés actifs |
| POST | `/subscribe` | Candidat | S'abonner avec préférences |
| POST | `/unsubscribe` | Candidat | Se désabonner |
| GET | `/subscription/status` | Candidat | Statut d'abonnement |

## 🎨 Interface Utilisateur

### Portail Admin

#### Onglet "Blog"
1. **Liste des articles** avec statut (brouillon/publié/archivé)
2. **Bouton "Nouvel article"** ouvre un modal avec:
   - Titre
   - Slug (génération automatique si vide)
   - Extrait
   - Contenu (textarea)
   - URL image vedette
   - Statut
3. **Actions par article**:
   - Modifier
   - Voir (si publié)
   - Supprimer
4. **Filtres**: recherche par texte, filtre par statut

#### Onglet "Newsletters"
1. **Compteur d'abonnés actifs** en haut
2. **Liste des newsletters** avec statut (brouillon/envoyée)
3. **Statistiques** pour newsletters envoyées:
   - Nombre d'envois
   - Taux d'ouverture
   - Taux de clics
4. **Bouton "Nouvelle newsletter"** ouvre un modal avec:
   - Titre (usage interne)
   - Sujet de l'email
   - Texte de prévisualisation
   - Type de template
   - Sélection d'articles de blog (checkboxes)
5. **Actions par newsletter**:
   - Modifier (si brouillon)
   - Prévisualiser (dans nouvelle fenêtre)
   - Envoyer (si brouillon, avec confirmation)

### Portail Candidat

#### Section Newsletter (dans Profil)
1. **Checkbox principale** "Je souhaite recevoir la newsletter"
2. **Préférences détaillées** (apparaissent si abonné):
   - ✅ Offres d'emploi correspondant à mes candidatures
   - ✅ Articles de blog et conseils carrière
   - ✅ Résumé hebdomadaire des nouvelles opportunités
3. **Sauvegarde automatique** lors de la mise à jour du profil

## 📧 Template Email HTML

### Structure
```html
<html>
  <head>
    <style>
      /* Inline CSS pour compatibilité email */
      .container { max-width: 600px; margin: 0 auto; }
      .header { background: #2563eb; color: white; padding: 30px; }
      .job-card { border: 1px solid #e5e7eb; padding: 15px; }
      .article-card { border-left: 4px solid #2563eb; padding: 15px; }
      .button { background: #2563eb; color: white; padding: 12px 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        🍽️ HotelRestoJobs
        <p>{newsletter.subject}</p>
      </div>
      
      <div class="content">
        <!-- Section Offres d'emploi -->
        <h2>📋 Nouvelles Offres d'Emploi</h2>
        {jobs.map(job => <div class="job-card">...)}
        
        <!-- Section Articles de blog -->
        <h2>📰 Articles du Blog</h2>
        {articles.map(article => <div class="article-card">...)}
      </div>
      
      <div class="footer">
        <p>Vous recevez cet email car vous êtes abonné(e) à HotelRestoJobs</p>
        <a href="{unsubscribe_url}">Se désabonner</a>
      </div>
    </div>
  </body>
</html>
```

### Responsive Design
- **Max-width: 600px** pour compatibilité clients email
- **Inline CSS** pour éviter les blocages
- **Polices système** (Arial, sans-serif)
- **Couleurs accessibles** (contraste suffisant)

## 🚀 Utilisation

### 1. Créer un article de blog

```bash
# Via l'interface admin
1. Aller dans l'onglet "Blog"
2. Cliquer "Nouvel article"
3. Remplir le formulaire:
   - Titre: "10 conseils pour réussir en hôtellerie"
   - Slug: (laissez vide pour auto-génération)
   - Extrait: "Découvrez nos meilleurs conseils..."
   - Contenu: [Texte complet]
   - Statut: "Publié"
4. Enregistrer
```

### 2. Créer et envoyer une newsletter

```bash
# Via l'interface admin
1. Aller dans l'onglet "Newsletters"
2. Cliquer "Nouvelle newsletter"
3. Remplir le formulaire:
   - Titre: "Newsletter Mai 2026"
   - Sujet: "Nouvelles offres et conseils carrière"
   - Texte prévisualisation: "Découvrez 15 nouvelles offres..."
   - Type: "Mixte"
   - Sélectionner 2-3 articles récents
4. Enregistrer comme brouillon
5. Cliquer "Prévisualiser" pour vérifier le rendu
6. Cliquer "Envoyer" et confirmer
```

### 3. S'abonner à la newsletter (candidat)

```bash
# Via le portail candidat
1. Aller dans l'onglet "Profil"
2. Cocher "Je souhaite recevoir la newsletter"
3. Ajuster les préférences si nécessaire
4. Cliquer "Enregistrer les modifications"
```

## ⚙️ Configuration Technique

### Variables d'environnement
Aucune configuration supplémentaire requise. Le système utilise:
- **D1 Database** pour le stockage
- **Hono** pour les API routes
- **JWT** pour l'authentification

### Limites
- **Taille email**: ~100KB recommandé (limite soft)
- **Nombre d'articles**: max 5 par newsletter recommandé
- **Fréquence d'envoi**: aucune limite technique (attention au spam)

## 🔒 Sécurité

### Authentification
- **Admin**: Seuls les admins peuvent créer/modifier/envoyer
- **Candidat**: Authentification JWT requise pour s'abonner
- **Token désabonnement**: Unique par utilisateur (crypto.randomUUID)

### Validation
- **Slug unique**: Vérification lors de la création d'article
- **Status newsletter**: Impossibilité de modifier une newsletter envoyée
- **Préférences JSON**: Validation côté serveur

## 📈 Métriques

### Tracking implémenté
- ✅ **Envois**: Comptage dans `recipients_count`
- ✅ **Ouvertures**: Via pixel de tracking (à implémenter)
- ✅ **Clics**: Via liens trackés (à implémenter)

### Statistiques disponibles
- Nombre d'abonnés actifs
- Taux d'ouverture par newsletter
- Taux de clics par newsletter
- Vues par article de blog

## 🎯 Prochaines améliorations

### Phase 2 (court terme)
- [ ] **Job matching**: Sélection automatique des offres pertinentes par candidat
- [ ] **Planification**: Programmer l'envoi à une date/heure précise
- [ ] **Templates personnalisables**: Plusieurs designs au choix
- [ ] **A/B testing**: Tester différents sujets d'email

### Phase 3 (moyen terme)
- [ ] **Segmentation avancée**: Cibler par secteur, ville, expérience
- [ ] **Statistiques détaillées**: Dashboard avec graphiques
- [ ] **Désinscription granulaire**: Se désabonner de certains types d'emails
- [ ] **Export des données**: CSV des abonnés, statistiques

## 🐛 Débogage

### Vérifier les abonnés
```sql
SELECT COUNT(*) as count
FROM newsletter_subscriptions
WHERE subscribed = 1;
```

### Voir les newsletters envoyées
```sql
SELECT 
  n.title,
  n.sent_at,
  n.recipients_count,
  n.opened_count,
  n.clicked_count
FROM newsletters n
WHERE n.status = 'sent'
ORDER BY n.sent_at DESC;
```

### Vérifier les articles publiés
```sql
SELECT title, slug, views_count, published_at
FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC;
```

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs PM2: `pm2 logs webapp --nostream`
2. Vérifier la base de données D1 locale
3. Consulter la documentation API ci-dessus

---

**Version**: 1.0.0  
**Date**: 2026-06-03  
**Auteur**: AI Developer
