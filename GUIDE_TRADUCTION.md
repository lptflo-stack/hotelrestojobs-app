# Guide d'utilisation de la traduction automatique

## 🎯 Objectif
Permettre aux employeurs de créer des offres d'emploi bilingues FR/EN sans avoir à réécrire le contenu deux fois.

## 📝 Comment utiliser la traduction automatique

### Étape 1 : Créer une offre bilingue
1. Connectez-vous au **Portail Employeur**
2. Allez dans l'onglet **"Offres d'emploi"**
3. Cliquez sur **"+ Nouvelle Offre"**

### Étape 2 : Sélectionner l'option bilingue
1. Dans la section **"Langue de l'offre"**, sélectionnez **"🇨🇦 🇨🇦 Bilingue FR/EN"**
2. Vous verrez apparaître deux onglets : **"Français 🇨🇦"** et **"English 🇨🇦"**
3. **IMPORTANT** : Vous verrez également apparaître deux boutons bleus :
   - **FR → EN** (pour traduire du français vers l'anglais)
   - **EN → FR** (pour traduire de l'anglais vers le français)

### Étape 3 : Remplir l'offre en français
1. Restez sur l'onglet **"Français 🇨🇦"**
2. Remplissez les champs suivants :
   - **Titre du poste (FR)** : ex. "Cuisinier de Ligne"
   - **Description du poste (FR)** : décrivez les responsabilités
   - **Exigences du poste (FR)** (optionnel) : expérience, compétences
   - **Avantages offerts (FR)** (optionnel) : salaire, bénéfices

### Étape 4 : Traduire automatiquement vers l'anglais
1. **Cliquez sur le bouton bleu "FR → EN"** (en haut à droite)
2. Vous verrez un message : **"Traduction en cours..."**
3. Attendez quelques secondes
4. Le système va :
   - Traduire automatiquement tous les champs remplis
   - Basculer vers l'onglet **"English 🇨🇦"**
   - Afficher le message **"Traduction terminée !"**

### Étape 5 : Vérifier et ajuster la traduction
1. Vous êtes maintenant sur l'onglet **"English 🇨🇦"**
2. Vérifiez les champs traduits :
   - **Job Title (EN)**
   - **Job Description (EN)**
   - **Job Requirements (EN)**
   - **Job Benefits (EN)**
3. **Ajustez si nécessaire** : vous pouvez modifier les traductions manuellement

### Étape 6 : Compléter et publier
1. Remplissez les autres informations (non-bilingues) :
   - Type de poste
   - Lieu de travail
   - Salaire
   - etc.
2. Cliquez sur **"Publier l'offre"**

---

## 🔄 Traduction dans l'autre sens (EN → FR)

Si vous préférez écrire en anglais et traduire vers le français :

1. Sélectionnez **"🇨🇦 🇨🇦 Bilingue FR/EN"**
2. Cliquez sur l'onglet **"English 🇨🇦"**
3. Remplissez les champs en anglais
4. Cliquez sur le bouton **"EN → FR"**
5. Le système traduit et bascule vers l'onglet français

---

## ⚠️ Points importants

### Vérification d'écrasement
Si les champs cibles contiennent déjà du texte, le système vous demandera confirmation :
> "Les champs en anglais contiennent déjà du texte. Voulez-vous les remplacer par la traduction automatique ?"

Cliquez **OK** pour remplacer, **Annuler** pour garder le texte existant.

### Limites de l'API de traduction
- L'API gratuite MyMemory est utilisée
- **Limite** : 500 caractères par champ
- **Si un texte est plus long** : il sera automatiquement découpé en phrases et traduit en plusieurs parties
- **Quota quotidien** : ~1000 requêtes par jour (largement suffisant pour un usage normal)

### Qualité de la traduction
- La traduction est **automatique** et peut nécessiter des ajustements
- **Recommandé** : Relire et ajuster les traductions pour un résultat optimal
- Les termes techniques ou spécifiques peuvent nécessiter une correction manuelle

---

## 🐛 Dépannage

### Les boutons de traduction ne s'affichent pas
**Vérifiez** :
1. Avez-vous sélectionné l'option **"Bilingue FR/EN"** ?
2. Les boutons **FR → EN** et **EN → FR** apparaissent à droite des onglets de langue

### La traduction ne fonctionne pas
**Étapes de diagnostic** :
1. Ouvrez la **console du navigateur** (F12)
2. Allez dans l'onglet **"Console"**
3. Cliquez sur le bouton de traduction
4. Regardez les messages :
   - `🔄 Début de la traduction...` : la traduction commence
   - `✓ Traduction réussie` : chaque champ traduit avec succès
   - `❌ Erreur de traduction` : une erreur s'est produite

**Erreurs communes** :
- `"Les champs français ne sont pas trouvés"` : vous n'avez pas sélectionné l'option bilingue
- `"Veuillez d'abord remplir les champs"` : les champs source sont vides
- `"Translation failed"` : problème avec l'API (réessayez dans quelques secondes)

### Texte partiellement traduit
Si certains champs ne sont pas traduits :
1. **Vérifiez** que vous avez bien rempli les champs français
2. **Ouvrez la console** (F12) pour voir les logs détaillés
3. **Réessayez** : cliquez à nouveau sur le bouton de traduction
4. Si le problème persiste, contactez l'administrateur

---

## 📊 Logs de débogage (pour les développeurs)

Si vous rencontrez des problèmes, ouvrez la console (F12) et partagez ces informations :

```
🔄 Début de la traduction...
Source fields: {title: "...", description: "...", ...}
Target fields: {title: "job-form-title-en", ...}
Traduction: "..." (fr → en)
Réponse API: {responseStatus: 200, ...}
✓ Traduction réussie: "..."
✓ Titre traduit: ...
✓ Description traduite: ...
```

---

## 📞 Support

Si vous continuez à avoir des problèmes avec la traduction automatique :
1. **Prenez une capture d'écran** de la page (incluant les boutons de traduction)
2. **Ouvrez la console** (F12) et copiez les messages d'erreur
3. Contactez l'administrateur avec ces informations

---

## 🎉 Avantages de la traduction automatique

✅ **Gain de temps** : Plus besoin de réécrire l'offre en deux langues  
✅ **Cohérence** : Le contenu traduit reste fidèle à l'original  
✅ **Flexibilité** : Vous pouvez toujours ajuster les traductions manuellement  
✅ **Accessibilité** : Touchez un public plus large (francophone et anglophone)  

---

**Version** : 1.0  
**Dernière mise à jour** : 2026-06-05
