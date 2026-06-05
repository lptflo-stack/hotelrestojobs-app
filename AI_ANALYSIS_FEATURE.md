# 🤖 Fonctionnalité d'analyse IA des candidatures

## Vue d'ensemble

Système d'analyse automatique des candidatures utilisant l'intelligence artificielle (OpenAI GPT-5-mini) pour évaluer la correspondance entre un CV de candidat et une offre d'emploi.

### 🎯 Objectif

Permettre aux employeurs de :
- Obtenir un **score de correspondance** (0-100%) pour chaque candidature
- Identifier rapidement les **candidats les plus pertinents**
- Gagner du temps dans le tri initial des candidatures
- Obtenir une **analyse détaillée** des points forts et points à vérifier

---

## 📊 Architecture

### Base de données

**Table `applications` - Nouveaux champs** :
```sql
ai_score INTEGER DEFAULT NULL           -- Score 0-100
ai_analysis TEXT DEFAULT NULL           -- JSON avec analyse détaillée
ai_analyzed_at DATETIME DEFAULT NULL    -- Date de l'analyse
```

**Index** :
```sql
CREATE INDEX idx_applications_ai_score ON applications(ai_score DESC);
```

### Backend

#### 1. Utilit

aire AI (`src/utils/ai-analysis.ts`)

**Fonction principale** :
```typescript
analyzeApplication(candidateData, jobOfferData): Promise<AIAnalysisResult>
```

**Structure AIAnalysisResult** :
```typescript
{
  score: number;           // 0-100
  strengths: string[];     // Points forts
  concerns: string[];      // Points à vérifier
  recommendation: string;  // Recommandation globale
  details: string;         // Analyse détaillée
}
```

**Critères d'évaluation** (5 critères) :
1. **Expérience pertinente** (30 points) : Correspondance avec le type de poste
2. **Compétences** (30 points) : Compétences mentionnées vs exigences
3. **Formation** (20 points) : Formation et certifications
4. **Motivation** (10 points) : Lettre de motivation et intérêt
5. **Disponibilité/Salaire** (10 points) : Compatibilité pratique

#### 2. Routes API (`src/routes/ai-analysis.ts`)

**POST `/api/ai-analysis/application/:id`** (requireEmployer)
- Analyse une candidature unique
- Retourne le score et l'analyse complète
- Cache de 24h pour éviter les re-analyses

**POST `/api/ai-analysis/job/:jobId/analyze-all`** (requireEmployer)
- Analyse toutes les candidatures non-analysées pour une offre
- Traitement séquentiel avec délai de 500ms entre chaque
- Retourne le nombre de réussites/échecs

#### 3. Liste des candidatures modifiée

**GET `/api/applications/job/:jobId`**
- Maintenant inclut `ai_score` et `ai_analyzed_at`
- **Tri automatique** : Score IA DESC → Date création DESC
- Les candidatures avec meilleur score apparaissent en premier

---

## 🎨 Intégration Frontend (À faire)

### 1. Liste des candidatures

**Ajout colonne "Correspondance IA (%)"** :

```html
<th class="px-6 py-3">Correspondance IA</th>
```

**Affichage du score avec badge coloré** :

```javascript
function getScoreBadge(score) {
  if (!score) {
    return '<button class="analyze-btn">🤖 Analyser</button>';
  }
  
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  const icon = score >= 80 ? '⭐' : score >= 60 ? '✅' : '⚠️';
  
  return `
    <div class="score-badge ${color}" onclick="showAnalysis(${appId})">
      ${icon} ${score}%
    </div>
  `;
}
```

**Bouton "Analyser tout"** :
```html
<button onclick="analyzeAllApplications(jobId)" class="btn-primary">
  <i class="fas fa-robot mr-2"></i>Analyser toutes les candidatures
</button>
```

### 2. Modal d'analyse détaillée

**Structure du modal** :

```html
<div id="ai-analysis-modal" class="modal">
  <div class="modal-content">
    <h3>Analyse IA - [Nom Candidat]</h3>
    
    <!-- Score principal -->
    <div class="score-main">
      <span class="score-value">85%</span>
      <span class="score-label">Correspondance</span>
    </div>
    
    <!-- Recommandation -->
    <div class="recommendation">
      <i class="fas fa-lightbulb"></i>
      <p>[Texte de recommandation]</p>
    </div>
    
    <!-- Points forts -->
    <div class="strengths">
      <h4><i class="fas fa-check-circle text-green-600"></i> Points forts</h4>
      <ul>
        <li>Compétence 1</li>
        <li>Compétence 2</li>
      </ul>
    </div>
    
    <!-- Points à vérifier -->
    <div class="concerns">
      <h4><i class="fas fa-exclamation-triangle text-yellow-600"></i> Points à vérifier</h4>
      <ul>
        <li>Point 1</li>
        <li>Point 2</li>
      </ul>
    </div>
    
    <!-- Analyse détaillée -->
    <div class="details">
      <h4>Analyse détaillée</h4>
      <p>[Texte complet de l'analyse]</p>
    </div>
    
    <button onclick="closeAnalysisModal()">Fermer</button>
  </div>
</div>
```

### 3. Fonctions JavaScript

**Analyser une candidature** :
```javascript
async function analyzeApplication(applicationId) {
  try {
    showLoading('Analyse en cours...');
    
    const response = await axios.post(
      `/api/ai-analysis/application/${applicationId}`,
      {},
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    
    const { score, analysis } = response.data;
    
    // Mettre à jour l'affichage
    updateScoreBadge(applicationId, score);
    
    // Afficher le modal
    showAnalysisModal(applicationId, score, analysis);
    
  } catch (error) {
    console.error('Erreur analyse:', error);
    alert('Erreur lors de l\'analyse IA');
  }
}
```

**Analyser toutes les candidatures** :
```javascript
async function analyzeAllApplications(jobId) {
  if (!confirm('Analyser toutes les candidatures non-analysées ?')) return;
  
  try {
    showLoading('Analyse en cours... Cela peut prendre quelques minutes.');
    
    const response = await axios.post(
      `/api/ai-analysis/job/${jobId}/analyze-all`,
      {},
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );
    
    const { totalAnalyzed, totalFailed } = response.data;
    
    alert(`✅ ${totalAnalyzed} candidatures analysées\\n❌ ${totalFailed} échecs`);
    
    // Recharger la liste
    loadApplications(jobId);
    
  } catch (error) {
    console.error('Erreur analyse batch:', error);
    alert('Erreur lors de l\'analyse batch');
  }
}
```

**Afficher l'analyse détaillée** :
```javascript
async function showAnalysisModal(applicationId, score, analysis) {
  const modal = document.getElementById('ai-analysis-modal');
  
  // Remplir le modal avec les données
  document.getElementById('modal-score').textContent = score + '%';
  document.getElementById('modal-recommendation').textContent = analysis.recommendation;
  
  // Points forts
  const strengthsList = document.getElementById('strengths-list');
  strengthsList.innerHTML = analysis.strengths.map(s => `<li>${s}</li>`).join('');
  
  // Points à vérifier
  const concernsList = document.getElementById('concerns-list');
  concernsList.innerHTML = analysis.concerns.map(c => `<li>${c}</li>`).join('');
  
  // Détails
  document.getElementById('analysis-details').textContent = analysis.details;
  
  // Afficher le modal
  modal.classList.remove('hidden');
}
```

---

## 💰 Coûts et optimisations

### Estimation des coûts

**Modèle utilisé** : `gpt-5-mini` (le moins cher)

**Par analyse** :
- ~1000-1500 tokens par requête
- Coût estimé : ~$0.001 - $0.002 par analyse

**Exemple** : 
- 100 candidatures/mois = ~$0.10 - $0.20/mois
- 1000 candidatures/mois = ~$1 - $2/mois

### Optimisations mises en place

1. **Cache de 24h** : Une analyse n'est refaite que si >24h se sont écoulées
2. **Modèle mini** : Utilisation de gpt-5-mini (rapide et économique)
3. **Température 0.3** : Réponses cohérentes et prévisibles
4. **Limite tokens** : max_tokens=1500 pour limiter les coûts
5. **Analyse batch avec délai** : 500ms entre chaque pour éviter rate limits

---

## 🧪 Tests

### Test 1 : Analyse d'une candidature

**Requête** :
```bash
curl -X POST http://localhost:3000/api/ai-analysis/application/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Réponse attendue** :
```json
{
  "score": 85,
  "analysis": {
    "score": 85,
    "strengths": [
      "10 ans d'expérience en tant que chef",
      "Compétences en gestion d'équipe",
      "Formation en hôtellerie"
    ],
    "concerns": [
      "Salaire souhaité légèrement au-dessus de la fourchette",
      "Disponibilité à confirmer"
    ],
    "recommendation": "Candidat très qualifié, recommandé pour un entretien",
    "details": "Le candidat présente un profil solide avec une expérience significative..."
  },
  "cached": false
}
```

### Test 2 : Analyse batch

**Requête** :
```bash
curl -X POST http://localhost:3000/api/ai-analysis/job/5/analyze-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue** :
```json
{
  "totalAnalyzed": 8,
  "totalFailed": 0,
  "results": [
    { "applicationId": 1, "score": 92, "success": true },
    { "applicationId": 2, "score": 78, "success": true },
    ...
  ]
}
```

### Test 3 : Liste avec scores

**Requête** :
```bash
curl http://localhost:3000/api/applications/job/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue** :
```json
{
  "applications": [
    {
      "id": 1,
      "user_id": 10,
      "first_name": "Jean",
      "last_name": "Tremblay",
      "ai_score": 92,
      "ai_analyzed_at": "2026-06-05T14:30:00Z",
      ...
    },
    {
      "id": 2,
      "ai_score": 78,
      ...
    },
    {
      "id": 3,
      "ai_score": null,  // Pas encore analysé
      ...
    }
  ]
}
```

---

## 🎯 Cas d'usage

### Scénario 1 : Employeur reçoit de nombreuses candidatures

1. Employeur consulte ses candidatures
2. Clic sur **"Analyser toutes les candidatures"**
3. Système analyse automatiquement chaque candidature (1-2 min)
4. Candidatures triées par score descendant
5. Employeur voit immédiatement les meilleurs profils en haut

### Scénario 2 : Analyse individuelle

1. Employeur voit une candidature sans score
2. Clic sur **"🤖 Analyser"**
3. Score affiché en ~5 secondes
4. Clic sur le score pour voir l'analyse détaillée

### Scénario 3 : Consultation détaillée

1. Clic sur un score (ex: 85%)
2. Modal s'ouvre avec analyse complète
3. Employeur lit points forts et concerns
4. Décision éclairée pour entretien

---

## 🚨 Gestion des erreurs

### Erreur API OpenAI

**Si l'API échoue** :
```json
{
  "score": 50,
  "strengths": ["Profil à examiner manuellement"],
  "concerns": ["Analyse IA temporairement indisponible"],
  "recommendation": "Analyse manuelle recommandée",
  "details": "Une erreur technique a empêché l'analyse automatique..."
}
```

### Erreur d'authentification

**401 Unauthorized** : Token invalide ou expiré
```json
{ "error": "Non autorisé" }
```

### Erreur de permissions

**403 Forbidden** : L'employeur ne possède pas cette offre
```json
{ "error": "Accès non autorisé" }
```

---

## 📈 Métriques et KPIs

### Métriques à suivre

1. **Taux d'utilisation** : % de candidatures analysées
2. **Temps moyen d'analyse** : Durée par analyse
3. **Coûts API** : Dépenses mensuelles OpenAI
4. **Taux de cache hit** : % d'analyses en cache vs nouvelles
5. **Corrélation score/embauche** : Les scores >80% sont-ils embauchés ?

### Dashboard admin (futur)

```
┌─────────────────────────────────────┐
│ Analyse IA - Statistiques           │
├─────────────────────────────────────┤
│ Candidatures analysées : 1,234      │
│ Score moyen : 68%                   │
│ Coûts ce mois : $2.45               │
│ Cache hit rate : 85%                │
└─────────────────────────────────────┘
```

---

## 🔐 Sécurité et confidentialité

### Protection des données

1. **Données transmises** : Uniquement informations professionnelles (CV, lettre)
2. **Pas de stockage chez OpenAI** : Politique zero-retention
3. **Authentification** : Middleware requireEmployer obligatoire
4. **Autorisation** : Vérification company_id avant analyse

### Conformité RGPD/CCPA

- ✅ Données anonymisées (pas d'info personnelle inutile)
- ✅ Finalité claire (aide au recrutement)
- ✅ Transparence (employeur sait que c'est de l'IA)
- ✅ Droit d'accès (candidat peut voir son profil)

---

## 🛠️ Configuration

### Variables d'environnement

```bash
OPENAI_API_KEY=gsk-xxxxx
OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
```

Ces variables sont **automatiquement configurées** dans le sandbox GenSpark.

### wrangler.toml

```toml
compatibility_flags = ["nodejs_compat"]
```

---

## 📝 TODO Frontend

- [ ] Ajouter colonne "Correspondance IA" dans la liste
- [ ] Badge coloré selon score (vert/jaune/rouge)
- [ ] Bouton "Analyser" pour candidatures non-analysées
- [ ] Bouton "Analyser toutes les candidatures"
- [ ] Modal d'analyse détaillée
- [ ] Loader/spinner pendant l'analyse
- [ ] Messages de succès/erreur
- [ ] Tooltip explicatif sur les scores
- [ ] Export CSV avec scores IA

---

**Version** : 1.0 Backend  
**Date** : 2026-06-05  
**Statut** : Backend ✅ | Frontend ⏳  
**Prochaine étape** : Intégration frontend dans `public/portails/employeur.html`
