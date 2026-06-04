/**
 * Helper pour la gestion des formulaires bilingues d'offres d'emploi
 * Phase 2 - Système multilingue
 */

// Fonction pour créer les onglets de langue dans un formulaire
function createLanguageTabs(containerIdPrefix) {
  return `
    <div class="bilingual-tabs mb-4">
      <div class="flex border-b">
        <button 
          type="button"
          class="tab-btn-fr px-6 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold"
          onclick="switchLanguageTab('${containerIdPrefix}', 'fr')">
          Français 🇨🇦
        </button>
        <button 
          type="button"
          class="tab-btn-en px-6 py-2 text-gray-600 hover:text-gray-800"
          onclick="switchLanguageTab('${containerIdPrefix}', 'en')">
          English 🇨🇦
        </button>
      </div>
    </div>
  `;
}

// Fonction pour basculer entre les onglets de langue
function switchLanguageTab(containerIdPrefix, lang) {
  // Mettre à jour les boutons d'onglet
  const tabs = document.querySelectorAll(`[onclick^="switchLanguageTab('${containerIdPrefix}"]`);
  tabs.forEach(tab => {
    if (tab.classList.contains(`tab-btn-${lang}`)) {
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'font-semibold');
      tab.classList.remove('text-gray-600');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'font-semibold');
      tab.classList.add('text-gray-600');
    }
  });
  
  // Afficher/masquer les contenus
  const frContent = document.getElementById(`${containerIdPrefix}-fr`);
  const enContent = document.getElementById(`${containerIdPrefix}-en`);
  
  if (lang === 'fr') {
    frContent?.classList.remove('hidden');
    enContent?.classList.add('hidden');
  } else {
    frContent?.classList.add('hidden');
    enContent?.classList.remove('hidden');
  }
}

// Fonction pour récupérer les données bilingues d'un formulaire
function getBilingualFormData(formPrefix) {
  const jobLanguage = document.querySelector('input[name="job-language"]:checked')?.value || 'fr';
  
  const data = {
    job_language: jobLanguage
  };
  
  // Récupérer les champs FR
  const titleFr = document.getElementById(`${formPrefix}-title-fr`)?.value;
  const descriptionFr = document.getElementById(`${formPrefix}-description-fr`)?.value;
  const requirementsFr = document.getElementById(`${formPrefix}-requirements-fr`)?.value;
  const benefitsFr = document.getElementById(`${formPrefix}-benefits-fr`)?.value;
  
  // Récupérer les champs EN
  const titleEn = document.getElementById(`${formPrefix}-title-en`)?.value;
  const descriptionEn = document.getElementById(`${formPrefix}-description-en`)?.value;
  const requirementsEn = document.getElementById(`${formPrefix}-requirements-en`)?.value;
  const benefitsEn = document.getElementById(`${formPrefix}-benefits-en`)?.value;
  
  // Ajouter les champs selon la langue de l'offre
  if (jobLanguage === 'fr' || jobLanguage === 'bilingual') {
    if (titleFr) data.title_fr = titleFr;
    if (descriptionFr) data.description_fr = descriptionFr;
    if (requirementsFr) data.requirements_fr = requirementsFr;
    if (benefitsFr) data.benefits_fr = benefitsFr;
  }
  
  if (jobLanguage === 'en' || jobLanguage === 'bilingual') {
    if (titleEn) data.title_en = titleEn;
    if (descriptionEn) data.description_en = descriptionEn;
    if (requirementsEn) data.requirements_en = requirementsEn;
    if (benefitsEn) data.benefits_en = benefitsEn;
  }
  
  return data;
}

// Fonction pour pré-remplir un formulaire avec des données bilingues
function fillBilingualForm(formPrefix, jobData) {
  // Définir la langue de l'offre
  const jobLanguage = jobData.job_language || 'fr';
  const radioInput = document.querySelector(`input[name="job-language"][value="${jobLanguage}"]`);
  if (radioInput) {
    radioInput.checked = true;
  }
  
  // Pré-remplir les champs FR
  const titleFr = document.getElementById(`${formPrefix}-title-fr`);
  const descriptionFr = document.getElementById(`${formPrefix}-description-fr`);
  const requirementsFr = document.getElementById(`${formPrefix}-requirements-fr`);
  const benefitsFr = document.getElementById(`${formPrefix}-benefits-fr`);
  
  if (titleFr) titleFr.value = jobData.title_fr || jobData.title || '';
  if (descriptionFr) descriptionFr.value = jobData.description_fr || jobData.description || '';
  if (requirementsFr) requirementsFr.value = jobData.requirements_fr || jobData.requirements || '';
  if (benefitsFr) benefitsFr.value = jobData.benefits_fr || jobData.benefits || '';
  
  // Pré-remplir les champs EN
  const titleEn = document.getElementById(`${formPrefix}-title-en`);
  const descriptionEn = document.getElementById(`${formPrefix}-description-en`);
  const requirementsEn = document.getElementById(`${formPrefix}-requirements-en`);
  const benefitsEn = document.getElementById(`${formPrefix}-benefits-en`);
  
  if (titleEn) titleEn.value = jobData.title_en || '';
  if (descriptionEn) descriptionEn.value = jobData.description_en || '';
  if (requirementsEn) requirementsEn.value = jobData.requirements_en || '';
  if (benefitsEn) benefitsEn.value = jobData.benefits_en || '';
}

// Fonction pour valider les champs requis selon la langue
function validateBilingualForm(formPrefix) {
  const jobLanguage = document.querySelector('input[name="job-language"]:checked')?.value || 'fr';
  const errors = [];
  
  if (jobLanguage === 'fr' || jobLanguage === 'bilingual') {
    const titleFr = document.getElementById(`${formPrefix}-title-fr`)?.value;
    const descriptionFr = document.getElementById(`${formPrefix}-description-fr`)?.value;
    
    if (!titleFr) errors.push('Le titre en français est requis');
    if (!descriptionFr) errors.push('La description en français est requise');
  }
  
  if (jobLanguage === 'en' || jobLanguage === 'bilingual') {
    const titleEn = document.getElementById(`${formPrefix}-title-en`)?.value;
    const descriptionEn = document.getElementById(`${formPrefix}-description-en`)?.value;
    
    if (!titleEn) errors.push('The English title is required');
    if (!descriptionEn) errors.push('The English description is required');
  }
  
  return errors;
}

// Fonction pour afficher/masquer les champs selon la langue sélectionnée
function updateFieldsVisibility(formPrefix) {
  const jobLanguage = document.querySelector('input[name="job-language"]:checked')?.value || 'fr';
  
  const frContainer = document.getElementById(`${formPrefix}-fr`);
  const enContainer = document.getElementById(`${formPrefix}-en`);
  const tabsContainer = document.querySelector(`[onclick^="switchLanguageTab('${formPrefix}"]`)?.closest('.bilingual-tabs');
  
  if (jobLanguage === 'bilingual') {
    // Afficher les deux avec des onglets
    if (tabsContainer) tabsContainer.style.display = 'block';
    if (frContainer) frContainer.classList.remove('hidden');
    if (enContainer) enContainer.classList.add('hidden');
    switchLanguageTab(formPrefix, 'fr'); // Démarrer sur FR
  } else if (jobLanguage === 'fr') {
    // Afficher uniquement FR
    if (tabsContainer) tabsContainer.style.display = 'none';
    if (frContainer) frContainer.classList.remove('hidden');
    if (enContainer) enContainer.classList.add('hidden');
  } else {
    // Afficher uniquement EN
    if (tabsContainer) tabsContainer.style.display = 'none';
    if (frContainer) frContainer.classList.add('hidden');
    if (enContainer) enContainer.classList.remove('hidden');
  }
}

// Rendre disponible globalement
if (typeof window !== 'undefined') {
  window.createLanguageTabs = createLanguageTabs;
  window.switchLanguageTab = switchLanguageTab;
  window.getBilingualFormData = getBilingualFormData;
  window.fillBilingualForm = fillBilingualForm;
  window.validateBilingualForm = validateBilingualForm;
  window.updateFieldsVisibility = updateFieldsVisibility;
}
