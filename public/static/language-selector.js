/**
 * Composant de sélecteur de langue
 * HotelRestoJobs - Phase 1 MVP
 */

// Fonction pour créer le HTML du sélecteur de langue (version header bleu)
function createLanguageSelector() {
  return `
    <div id="language-selector" class="flex items-center space-x-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
      <button 
        data-lang="fr" 
        onclick="window.i18n.setLanguage('fr')"
        class="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 hover:bg-white/20"
        title="Français (Canada)">
        <svg class="w-5 h-5" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EEE" d="M4 5h28v26H4z"/>
          <path fill="#D52B1E" d="M0 5h12v26H0z"/>
          <path fill="#D52B1E" d="M24 5h12v26H24z"/>
          <path fill="#D52B1E" d="M16 8l-1 3-2-1v2l-2-1 1 3-2 1 3 1-1 2 2-1v2l2-1 1 3h2l1-3 2 1v-2l2 1-1-2 3-1-2-1 1-3-2 1v-2l-2 1-1-3z"/>
        </svg>
        <span class="font-medium text-white">FR</span>
      </button>
      <button 
        data-lang="en" 
        onclick="window.i18n.setLanguage('en')"
        class="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 hover:bg-white/20"
        title="English (Canada)">
        <svg class="w-5 h-5" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EEE" d="M4 5h28v26H4z"/>
          <path fill="#D52B1E" d="M0 5h12v26H0z"/>
          <path fill="#D52B1E" d="M24 5h12v26H24z"/>
          <path fill="#D52B1E" d="M16 8l-1 3-2-1v2l-2-1 1 3-2 1 3 1-1 2 2-1v2l2-1 1 3h2l1-3 2 1v-2l2 1-1-2 3-1-2-1 1-3-2 1v-2l-2 1-1-3z"/>
        </svg>
        <span class="font-medium text-white">EN</span>
      </button>
    </div>
  `;
}

// Fonction pour créer le sélecteur (version portails avec fond vert/bleu)
function createLanguageSelectorPortal() {
  return `
    <div id="language-selector" class="flex items-center space-x-1 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
      <button 
        data-lang="fr" 
        onclick="window.i18n.setLanguage('fr')"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-200 hover:bg-white/30"
        title="Français (Canada)">
        <svg class="w-4 h-4" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EEE" d="M4 5h28v26H4z"/>
          <path fill="#D52B1E" d="M0 5h12v26H0z"/>
          <path fill="#D52B1E" d="M24 5h12v26H24z"/>
          <path fill="#D52B1E" d="M16 8l-1 3-2-1v2l-2-1 1 3-2 1 3 1-1 2 2-1v2l2-1 1 3h2l1-3 2 1v-2l2 1-1-2 3-1-2-1 1-3-2 1v-2l-2 1-1-3z"/>
        </svg>
        <span class="text-sm font-medium text-white">FR</span>
      </button>
      <button 
        data-lang="en" 
        onclick="window.i18n.setLanguage('en')"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-200 hover:bg-white/30"
        title="English (Canada)">
        <svg class="w-4 h-4" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EEE" d="M4 5h28v26H4z"/>
          <path fill="#D52B1E" d="M0 5h12v26H0z"/>
          <path fill="#D52B1E" d="M24 5h12v26H24z"/>
          <path fill="#D52B1E" d="M16 8l-1 3-2-1v2l-2-1 1 3-2 1 3 1-1 2 2-1v2l2-1 1 3h2l1-3 2 1v-2l2 1-1-2 3-1-2-1 1-3-2 1v-2l-2 1-1-3z"/>
        </svg>
        <span class="text-sm font-medium text-white">EN</span>
      </button>
    </div>
  `;
}

// Fonction pour injecter le sélecteur dans un élément
function injectLanguageSelector(targetElementId, usePortalStyle = false) {
  const target = document.getElementById(targetElementId);
  if (target) {
    target.innerHTML = usePortalStyle ? createLanguageSelectorPortal() : createLanguageSelector();
    
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
    // Détecter si on est dans un portail (header vert/bleu) ou page publique (header bleu)
    const isPortal = document.querySelector('header.bg-green-600, header.bg-blue-500');
    container.innerHTML = isPortal ? createLanguageSelectorPortal() : createLanguageSelector();
    
    // Mettre à jour l'état actif
    if (window.i18n) {
      window.i18n.updateLanguageSelector();
    }
  }
});

// Export pour utilisation manuelle
if (typeof window !== 'undefined') {
  window.createLanguageSelector = createLanguageSelector;
  window.createLanguageSelectorPortal = createLanguageSelectorPortal;
  window.injectLanguageSelector = injectLanguageSelector;
}
