/**
 * Composant de sélecteur de langue
 * HotelRestoJobs - Phase 1 MVP
 */

// Fonction pour créer le HTML du sélecteur de langue
function createLanguageSelector() {
  return `
    <div id="language-selector" class="flex items-center space-x-2 text-sm">
      <button 
        data-lang="fr" 
        onclick="window.i18n.setLanguage('fr')"
        class="px-3 py-1 rounded hover:bg-blue-100 transition-colors"
        title="Français">
        🇨🇦 FR
      </button>
      <span class="text-gray-400">|</span>
      <button 
        data-lang="en" 
        onclick="window.i18n.setLanguage('en')"
        class="px-3 py-1 rounded hover:bg-blue-100 transition-colors"
        title="English">
        🇨🇦 EN
      </button>
    </div>
  `;
}

// Fonction pour injecter le sélecteur dans un élément
function injectLanguageSelector(targetElementId) {
  const target = document.getElementById(targetElementId);
  if (target) {
    target.innerHTML = createLanguageSelector();
    
    // Mettre à jour l'état actif
    if (window.i18n) {
      window.i18n.updateLanguageSelector();
    }
  } else {
    console.warn(`Element #${targetElementId} not found for language selector`);
  }
}

// Auto-initialisation si un élément avec id="language-selector-container" existe
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('language-selector-container');
  if (container) {
    container.innerHTML = createLanguageSelector();
    
    // Mettre à jour l'état actif
    if (window.i18n) {
      window.i18n.updateLanguageSelector();
    }
  }
});

// Export pour utilisation manuelle
if (typeof window !== 'undefined') {
  window.createLanguageSelector = createLanguageSelector;
  window.injectLanguageSelector = injectLanguageSelector;
}
