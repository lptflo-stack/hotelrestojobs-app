/**
 * Système de traduction multilingue FR/EN
 * HotelRestoJobs - Phase 1 MVP
 */

// Dictionnaires de traductions
const translations = {
  fr: {
    // Navigation & Header
    'nav.jobs': 'Emplois',
    'nav.candidate': 'Espace Candidat',
    'nav.employer': 'Espace Employeur',
    'nav.admin': 'Admin',
    'nav.post_job': 'Publier une offre',
    'nav.blog': 'Blog',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Trouvez votre emploi de rêve dans l\'hôtellerie-restauration',
    'hero.subtitle': 'La plateforme #1 pour les professionnels de l\'hôtellerie et de la restauration',
    'hero.cta_employer': 'Vous recrutez ? Publiez une offre gratuitement !',
    'hero.search_keywords': 'Mots-clés (ex: Chef, Serveur...)',
    'hero.search_city': 'Ville',
    'hero.search_button': 'Rechercher',
    
    // Job Listings
    'jobs.featured': 'Emplois Vedettes',
    'jobs.latest': 'Dernières offres d\'emploi',
    'jobs.view_details': 'Voir les détails',
    'jobs.see_more': 'Voir plus d\'offres',
    'jobs.featured_badge': 'VEDETTE',
    'jobs.views': 'vues',
    'jobs.applications': 'candidatures',
    'jobs.posted': 'Publié',
    'jobs.expires': 'Expire',
    'jobs.apply_now': 'Postuler maintenant',
    'jobs.view_job': 'Voir l\'annonce',
    
    // Job Detail Page
    'job.back': 'Retour aux offres',
    'job.description': 'Description du poste',
    'job.requirements': 'Exigences',
    'job.benefits': 'Avantages',
    'job.company': 'Entreprise',
    'job.location': 'Lieu',
    'job.type': 'Type d\'emploi',
    'job.salary': 'Salaire',
    'job.salary_negotiable': 'Salaire négociable',
    
    // Auth Forms
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.email': 'Adresse courriel',
    'auth.password': 'Mot de passe',
    'auth.confirm_password': 'Confirmer le mot de passe',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom',
    'auth.phone': 'Téléphone',
    'auth.company_name': 'Nom de l\'entreprise',
    'auth.optional': 'Optionnel',
    'auth.required': 'Requis',
    'auth.login_button': 'Se connecter',
    'auth.register_button': 'S\'inscrire',
    'auth.logout': 'Déconnexion',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.no_account': 'Pas encore de compte ?',
    'auth.have_account': 'Déjà un compte ?',
    'auth.create_account': 'Créer un compte',
    
    // Employer Portal
    'employer.dashboard': 'Tableau de bord',
    'employer.my_jobs': 'Mes offres',
    'employer.create_job': 'Créer une offre',
    'employer.applications': 'Candidatures',
    'employer.featured': 'Emplois vedettes',
    'employer.credits': 'Crédits',
    'employer.newsletter': 'Infolettre',
    'employer.profile': 'Mon profil',
    'employer.company': 'Mon entreprise',
    'employer.statistics': 'Statistiques',
    'employer.job_title': 'Titre du poste',
    'employer.job_description': 'Description',
    'employer.position_type': 'Type de poste',
    'employer.employment_type': 'Type d\'emploi',
    'employer.salary_range': 'Échelle salariale',
    'employer.location': 'Lieu de travail',
    'employer.city': 'Ville',
    'employer.province': 'Province',
    'employer.requirements': 'Exigences du poste',
    'employer.benefits': 'Avantages offerts',
    'employer.publish': 'Publier l\'offre',
    'employer.save_draft': 'Sauvegarder le brouillon',
    'employer.edit': 'Modifier',
    'employer.duplicate': 'Dupliquer',
    'employer.delete': 'Supprimer',
    'employer.status': 'Statut',
    'employer.active': 'Active',
    'employer.draft': 'Brouillon',
    'employer.expired': 'Expirée',
    'employer.days_remaining': 'Jours restants',
    'employer.subscribe_newsletter': 'S\'abonner à l\'infolettre',
    'employer.unsubscribe_newsletter': 'Se désabonner',
    
    // Candidate Portal
    'candidate.dashboard': 'Tableau de bord',
    'candidate.search_jobs': 'Rechercher des emplois',
    'candidate.my_applications': 'Mes candidatures',
    'candidate.saved_jobs': 'Emplois sauvegardés',
    'candidate.my_resume': 'Mon CV',
    'candidate.profile': 'Mon profil',
    'candidate.alerts': 'Alertes emploi',
    'candidate.apply': 'Postuler',
    'candidate.save_job': 'Sauvegarder',
    'candidate.cover_letter': 'Lettre de présentation',
    'candidate.upload_resume': 'Téléverser mon CV',
    'candidate.application_status': 'Statut de candidature',
    'candidate.pending': 'En attente',
    'candidate.reviewed': 'Examinée',
    'candidate.interview': 'Entrevue',
    'candidate.rejected': 'Refusée',
    'candidate.accepted': 'Acceptée',
    
    // Admin Portal
    'admin.dashboard': 'Tableau de bord',
    'admin.users': 'Utilisateurs',
    'admin.jobs': 'Offres d\'emploi',
    'admin.applications': 'Candidatures',
    'admin.blog': 'Blog',
    'admin.categories': 'Catégories',
    'admin.newsletters': 'Infolettres',
    'admin.statistics': 'Statistiques',
    'admin.settings': 'Paramètres',
    'admin.approve': 'Approuver',
    'admin.reject': 'Rejeter',
    'admin.moderate': 'Modérer',
    
    // Forms & Actions
    'form.save': 'Enregistrer',
    'form.cancel': 'Annuler',
    'form.submit': 'Soumettre',
    'form.update': 'Mettre à jour',
    'form.delete': 'Supprimer',
    'form.search': 'Rechercher',
    'form.filter': 'Filtrer',
    'form.reset': 'Réinitialiser',
    'form.upload': 'Téléverser',
    'form.download': 'Télécharger',
    'form.edit': 'Modifier',
    'form.view': 'Voir',
    'form.close': 'Fermer',
    
    // Messages & Notifications
    'msg.success': 'Succès !',
    'msg.error': 'Erreur',
    'msg.warning': 'Attention',
    'msg.loading': 'Chargement...',
    'msg.no_results': 'Aucun résultat trouvé',
    'msg.confirm_delete': 'Êtes-vous sûr de vouloir supprimer ?',
    'msg.confirm_logout': 'Êtes-vous sûr de vouloir vous déconnecter ?',
    'msg.saved': 'Enregistré avec succès',
    'msg.updated': 'Mis à jour avec succès',
    'msg.deleted': 'Supprimé avec succès',
    
    // Stats & Numbers
    'stats.total_jobs': 'Offres d\'emploi',
    'stats.total_candidates': 'Candidats',
    'stats.total_employers': 'Employeurs',
    'stats.satisfaction': 'Satisfaction',
    'stats.total_views': 'Vues totales',
    'stats.total_applications': 'Candidatures totales',
    
    // Footer
    'footer.tagline': 'La plateforme de recrutement spécialisée en hôtellerie-restauration au Québec.',
    'footer.quick_links': 'Liens rapides',
    'footer.search_job': 'Rechercher un emploi',
    'footer.candidate_space': 'Espace Candidat',
    'footer.post_job': 'Publier une offre',
    'footer.contact': 'Contact',
    'footer.rights': 'Tous droits réservés.',
    
    // Employment Types
    'employment.full_time': 'Temps plein',
    'employment.part_time': 'Temps partiel',
    'employment.contract': 'Contrat',
    'employment.temporary': 'Temporaire',
    'employment.internship': 'Stage',
    
    // Position Types
    'position.chef': 'Chef',
    'position.cook': 'Cuisinier',
    'position.server': 'Serveur',
    'position.bartender': 'Barman',
    'position.host': 'Hôte',
    'position.manager': 'Gérant',
    'position.dishwasher': 'Plongeur',
    'position.other': 'Autre',
    
    // Provinces
    'province.qc': 'Québec',
    'province.on': 'Ontario',
    'province.bc': 'Colombie-Britannique',
    'province.ab': 'Alberta',
    'province.mb': 'Manitoba',
    'province.sk': 'Saskatchewan',
    'province.ns': 'Nouvelle-Écosse',
    'province.nb': 'Nouveau-Brunswick',
    'province.nl': 'Terre-Neuve-et-Labrador',
    'province.pe': 'Île-du-Prince-Édouard',
    
    // Time
    'time.today': 'Aujourd\'hui',
    'time.yesterday': 'Hier',
    'time.days_ago': 'Il y a {count} jours',
    'time.weeks_ago': 'Il y a {count} semaines',
    'time.months_ago': 'Il y a {count} mois',
  },
  
  en: {
    // Navigation & Header
    'nav.jobs': 'Jobs',
    'nav.candidate': 'Candidate Portal',
    'nav.employer': 'Employer Portal',
    'nav.admin': 'Admin',
    'nav.post_job': 'Post a Job',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Find your dream job in hospitality',
    'hero.subtitle': 'The #1 platform for hospitality and restaurant professionals',
    'hero.cta_employer': 'Are you hiring? Post a job for free!',
    'hero.search_keywords': 'Keywords (e.g., Chef, Server...)',
    'hero.search_city': 'City',
    'hero.search_button': 'Search',
    
    // Job Listings
    'jobs.featured': 'Featured Jobs',
    'jobs.latest': 'Latest Job Postings',
    'jobs.view_details': 'View Details',
    'jobs.see_more': 'See More Jobs',
    'jobs.featured_badge': 'FEATURED',
    'jobs.views': 'views',
    'jobs.applications': 'applications',
    'jobs.posted': 'Posted',
    'jobs.expires': 'Expires',
    'jobs.apply_now': 'Apply Now',
    'jobs.view_job': 'View Job',
    
    // Job Detail Page
    'job.back': 'Back to Jobs',
    'job.description': 'Job Description',
    'job.requirements': 'Requirements',
    'job.benefits': 'Benefits',
    'job.company': 'Company',
    'job.location': 'Location',
    'job.type': 'Employment Type',
    'job.salary': 'Salary',
    'job.salary_negotiable': 'Negotiable Salary',
    
    // Auth Forms
    'auth.login': 'Login',
    'auth.register': 'Sign Up',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.phone': 'Phone',
    'auth.company_name': 'Company Name',
    'auth.optional': 'Optional',
    'auth.required': 'Required',
    'auth.login_button': 'Sign In',
    'auth.register_button': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.forgot_password': 'Forgot password?',
    'auth.no_account': 'Don\'t have an account?',
    'auth.have_account': 'Already have an account?',
    'auth.create_account': 'Create Account',
    
    // Employer Portal
    'employer.dashboard': 'Dashboard',
    'employer.my_jobs': 'My Jobs',
    'employer.create_job': 'Create Job',
    'employer.applications': 'Applications',
    'employer.featured': 'Featured Jobs',
    'employer.credits': 'Credits',
    'employer.newsletter': 'Newsletter',
    'employer.profile': 'My Profile',
    'employer.company': 'My Company',
    'employer.statistics': 'Statistics',
    'employer.job_title': 'Job Title',
    'employer.job_description': 'Description',
    'employer.position_type': 'Position Type',
    'employer.employment_type': 'Employment Type',
    'employer.salary_range': 'Salary Range',
    'employer.location': 'Work Location',
    'employer.city': 'City',
    'employer.province': 'Province',
    'employer.requirements': 'Job Requirements',
    'employer.benefits': 'Benefits Offered',
    'employer.publish': 'Publish Job',
    'employer.save_draft': 'Save Draft',
    'employer.edit': 'Edit',
    'employer.duplicate': 'Duplicate',
    'employer.delete': 'Delete',
    'employer.status': 'Status',
    'employer.active': 'Active',
    'employer.draft': 'Draft',
    'employer.expired': 'Expired',
    'employer.days_remaining': 'Days Remaining',
    'employer.subscribe_newsletter': 'Subscribe to Newsletter',
    'employer.unsubscribe_newsletter': 'Unsubscribe',
    
    // Candidate Portal
    'candidate.dashboard': 'Dashboard',
    'candidate.search_jobs': 'Search Jobs',
    'candidate.my_applications': 'My Applications',
    'candidate.saved_jobs': 'Saved Jobs',
    'candidate.my_resume': 'My Resume',
    'candidate.profile': 'My Profile',
    'candidate.alerts': 'Job Alerts',
    'candidate.apply': 'Apply',
    'candidate.save_job': 'Save Job',
    'candidate.cover_letter': 'Cover Letter',
    'candidate.upload_resume': 'Upload Resume',
    'candidate.application_status': 'Application Status',
    'candidate.pending': 'Pending',
    'candidate.reviewed': 'Reviewed',
    'candidate.interview': 'Interview',
    'candidate.rejected': 'Rejected',
    'candidate.accepted': 'Accepted',
    
    // Admin Portal
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.jobs': 'Job Postings',
    'admin.applications': 'Applications',
    'admin.blog': 'Blog',
    'admin.categories': 'Categories',
    'admin.newsletters': 'Newsletters',
    'admin.statistics': 'Statistics',
    'admin.settings': 'Settings',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.moderate': 'Moderate',
    
    // Forms & Actions
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.submit': 'Submit',
    'form.update': 'Update',
    'form.delete': 'Delete',
    'form.search': 'Search',
    'form.filter': 'Filter',
    'form.reset': 'Reset',
    'form.upload': 'Upload',
    'form.download': 'Download',
    'form.edit': 'Edit',
    'form.view': 'View',
    'form.close': 'Close',
    
    // Messages & Notifications
    'msg.success': 'Success!',
    'msg.error': 'Error',
    'msg.warning': 'Warning',
    'msg.loading': 'Loading...',
    'msg.no_results': 'No results found',
    'msg.confirm_delete': 'Are you sure you want to delete?',
    'msg.confirm_logout': 'Are you sure you want to log out?',
    'msg.saved': 'Saved successfully',
    'msg.updated': 'Updated successfully',
    'msg.deleted': 'Deleted successfully',
    
    // Stats & Numbers
    'stats.total_jobs': 'Job Postings',
    'stats.total_candidates': 'Candidates',
    'stats.total_employers': 'Employers',
    'stats.satisfaction': 'Satisfaction',
    'stats.total_views': 'Total Views',
    'stats.total_applications': 'Total Applications',
    
    // Footer
    'footer.tagline': 'The specialized recruitment platform for hospitality in Quebec.',
    'footer.quick_links': 'Quick Links',
    'footer.search_job': 'Search Jobs',
    'footer.candidate_space': 'Candidate Portal',
    'footer.post_job': 'Post a Job',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    
    // Employment Types
    'employment.full_time': 'Full-time',
    'employment.part_time': 'Part-time',
    'employment.contract': 'Contract',
    'employment.temporary': 'Temporary',
    'employment.internship': 'Internship',
    
    // Position Types
    'position.chef': 'Chef',
    'position.cook': 'Cook',
    'position.server': 'Server',
    'position.bartender': 'Bartender',
    'position.host': 'Host',
    'position.manager': 'Manager',
    'position.dishwasher': 'Dishwasher',
    'position.other': 'Other',
    
    // Provinces
    'province.qc': 'Quebec',
    'province.on': 'Ontario',
    'province.bc': 'British Columbia',
    'province.ab': 'Alberta',
    'province.mb': 'Manitoba',
    'province.sk': 'Saskatchewan',
    'province.ns': 'Nova Scotia',
    'province.nb': 'New Brunswick',
    'province.nl': 'Newfoundland and Labrador',
    'province.pe': 'Prince Edward Island',
    
    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.days_ago': '{count} days ago',
    'time.weeks_ago': '{count} weeks ago',
    'time.months_ago': '{count} months ago',
  }
};

// Configuration
const DEFAULT_LANGUAGE = 'fr';
const STORAGE_KEY = 'hotelrestojobs_language';

// Gestion de la langue
class I18n {
  constructor() {
    this.currentLanguage = this.getStoredLanguage();
  }
  
  // Récupérer la langue stockée
  getStoredLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'fr' || stored === 'en')) {
      return stored;
    }
    
    // Détection automatique du navigateur
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      return 'en';
    }
    
    return DEFAULT_LANGUAGE;
  }
  
  // Changer la langue
  setLanguage(lang) {
    if (lang !== 'fr' && lang !== 'en') {
      console.error('Langue non supportée:', lang);
      return;
    }
    
    this.currentLanguage = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Mettre à jour la page
    this.translatePage();
    this.updateLanguageSelector();
    
    // Émettre un événement personnalisé
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }
  
  // Obtenir la langue actuelle
  getLanguage() {
    return this.currentLanguage;
  }
  
  // Traduire une clé
  t(key, params = {}) {
    const translation = translations[this.currentLanguage][key] || key;
    
    // Remplacer les paramètres {count}, {name}, etc.
    return translation.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  // Traduire toute la page
  translatePage() {
    // Traduire les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });
    
    // Traduire les placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });
    
    // Traduire les titres (title attribute)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
    
    // Traduire les valeurs d'attributs
    document.querySelectorAll('[data-i18n-value]').forEach(element => {
      const key = element.getAttribute('data-i18n-value');
      element.value = this.t(key);
    });
  }
  
  // Mettre à jour le sélecteur de langue
  updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
      const buttons = selector.querySelectorAll('button');
      buttons.forEach(button => {
        const lang = button.getAttribute('data-lang');
        if (lang === this.currentLanguage) {
          // Style actif - fond blanc semi-transparent
          button.classList.add('bg-white/30', 'shadow-md');
          button.classList.remove('hover:bg-white/20');
        } else {
          // Style inactif
          button.classList.remove('bg-white/30', 'shadow-md');
          button.classList.add('hover:bg-white/20');
        }
      });
    }
  }
}

// Instance globale
const i18n = new I18n();

// Initialiser au chargement de la page
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  
  // Traduire la page au chargement
  document.addEventListener('DOMContentLoaded', () => {
    i18n.translatePage();
    i18n.updateLanguageSelector();
  });
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { i18n, translations };
}
