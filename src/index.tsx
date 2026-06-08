import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Bindings } from './types';

// Importer les routes API
import auth from './routes/auth';
import jobs from './routes/jobs';
import applications from './routes/applications';
import admin from './routes/admin';
import featured from './routes/featured';
import pricing from './routes/pricing';
import payments from './routes/payments';
import candidate from './routes/candidate';
import resume from './routes/resume';
import blog from './routes/blog';
import newsletter from './routes/newsletter';
import categories from './routes/categories';
import employerNewsletter from './routes/employer-newsletter';
import companyLogo from './routes/company-logo';
import aiAnalysis from './routes/ai-analysis';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS pour les API
app.use('/api/*', cors());

// Servir les fichiers statiques
app.use('/static/*', serveStatic({ root: './public' }));
app.use('/portails/*', serveStatic({ root: './public' }));

// Routes API
app.route('/api/auth', auth);
app.route('/api/jobs', jobs);
app.route('/api/applications', applications);
app.route('/api/admin', admin);
app.route('/api/featured', featured);
app.route('/api/pricing', pricing);
app.route('/api/payments', payments);
app.route('/api/candidate', candidate);
app.route('/api/resume', resume);
app.route('/api/blog', blog);
app.route('/api/newsletter', newsletter);
app.route('/api/categories', categories);
app.route('/api/employer-newsletter', employerNewsletter);
app.route('/api/company-logo', companyLogo);
app.route('/api/ai-analysis', aiAnalysis);

// Page d'accueil
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HotelRestoJobs - Emplois en Hôtellerie-Restauration</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="/static/i18n.js"></script>
        <script src="/static/language-selector.js"></script>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-utensils text-3xl"></i>
                        <h1 class="text-2xl font-bold">HotelRestoJobs</h1>
                    </div>
                    <nav class="hidden md:flex items-center space-x-6">
                        <div id="language-selector-container"></div>
                        <a href="/" class="hover:text-blue-200" data-i18n="nav.jobs">Emplois</a>
                        <a href="/candidat/login" class="hover:text-blue-200" data-i18n="nav.candidate">Espace Candidat</a>
                        <a href="/employeur/login" class="hover:text-blue-200" data-i18n="nav.employer">Espace Employeur</a>
                        <a href="/admin/login" class="hover:text-blue-200" data-i18n="nav.admin">Admin</a>
                        <a href="/employeur/login" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors">
                            <i class="fas fa-plus-circle mr-2"></i><span data-i18n="nav.post_job">Publier une offre</span>
                        </a>
                    </nav>
                    <div class="md:hidden">
                        <button id="mobile-menu-btn" class="text-white">
                            <i class="fas fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden bg-blue-500 text-white md:hidden">
            <div class="container mx-auto px-4 py-4 space-y-2">
                <a href="/" class="block hover:bg-blue-600 px-4 py-2 rounded">Emplois</a>
                <a href="/candidat/login" class="block hover:bg-blue-600 px-4 py-2 rounded">Espace Candidat</a>
                <a href="/employeur/login" class="block hover:bg-blue-600 px-4 py-2 rounded">Espace Employeur</a>
                <a href="/admin/login" class="block hover:bg-blue-600 px-4 py-2 rounded">Admin</a>
                <a href="/employeur/login" class="block bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded font-semibold">
                    <i class="fas fa-plus-circle mr-2"></i>Publier une offre
                </a>
            </div>
        </div>

        <!-- Hero Section -->
        <section class="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-4xl md:text-5xl font-bold mb-4" data-i18n="hero.title">
                    Trouvez votre emploi de rêve dans l'hôtellerie-restauration
                </h2>
                <p class="text-xl mb-8" data-i18n="hero.subtitle">
                    La plateforme #1 pour les professionnels de l'hôtellerie et de la restauration
                </p>
                
                <!-- CTA Button for Employers -->
                <div class="mb-8">
                    <a href="/employeur/login" class="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105">
                        <i class="fas fa-briefcase mr-2"></i><span data-i18n="hero.cta_employer">Vous recrutez ? Publiez une offre gratuitement !</span>
                    </a>
                </div>
                
                <!-- Search Bar -->
                <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-4">
                    <div class="flex flex-col md:flex-row gap-3">
                        <input type="text" id="search-keywords" data-i18n-placeholder="hero.search_keywords" placeholder="Mots-clés (ex: Chef, Serveur...)" 
                               class="flex-1 px-4 py-3 rounded border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                               onkeypress="if(event.key === 'Enter') searchJobs()">
                        <input type="text" id="search-city" data-i18n-placeholder="hero.search_city" placeholder="Ville" 
                               class="flex-1 px-4 py-3 rounded border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                               onkeypress="if(event.key === 'Enter') searchJobs()">
                        <button onclick="searchJobs()" class="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i><span data-i18n="hero.search_button">Rechercher</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Free Job Posting Banner -->
        <section class="bg-blue-600 py-6">
            <div class="container mx-auto px-4 flex justify-center">
                <a href="/employeur/login" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg transform hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-900" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 8.14c.164.007.33.01.496.01.166 0 .332-.003.496-.01A24.12 24.12 0 0018 11.67V15a2 2 0 01-2 2H4a2 2 0 01-2-2v-3.33a24.12 24.12 0 008.5 1.47z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-lg md:text-xl" data-i18n="banner.free_posting">Vous recrutez ? Publiez une offre gratuitement !</span>
                </a>
            </div>
        </section>

        <!-- Featured Jobs Section - Enhanced Visibility -->
        <section class="bg-gradient-to-b from-yellow-50 to-white py-16">
            <div class="container mx-auto px-4">
                <div class="text-center mb-12">
                    <div class="inline-block bg-yellow-500 text-white px-6 py-2 rounded-full font-bold text-lg mb-4">
                        <i class="fas fa-star mr-2"></i>
                        <span data-i18n="jobs.featured">EMPLOIS VEDETTES</span>
                    </div>
                    <h3 class="text-4xl font-bold text-gray-800 mb-3">
                        Les meilleures opportunités du moment
                    </h3>
                    <p class="text-xl text-gray-600">
                        Offres premium avec visibilité maximale
                    </p>
                </div>
                <div id="featured-jobs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Les emplois vedettes seront chargés ici -->
                </div>
                <div class="text-center mt-10">
                    <a href="/employeur/login" class="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105">
                        <i class="fas fa-rocket mr-2"></i>Mettre mon offre en vedette
                    </a>
                </div>
            </div>
        </section>

        <!-- All Jobs Section -->
        <section class="container mx-auto px-4 py-12">
            <h3 class="text-3xl font-bold text-gray-800 mb-8" data-i18n="jobs.latest">Dernières offres d'emploi</h3>
            <div id="all-jobs" class="space-y-4">
                <!-- Les emplois seront chargés ici -->
            </div>
            <div class="text-center mt-8">
                <button onclick="loadMoreJobs()" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                    <span data-i18n="jobs.see_more">Voir plus d'offres</span>
                </button>
            </div>
        </section>

        <!-- Stats Section -->
        <section class="bg-blue-600 text-white py-16">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div class="text-4xl font-bold mb-2">500+</div>
                        <div class="text-blue-200" data-i18n="stats.total_jobs">Offres d'emploi</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">1000+</div>
                        <div class="text-blue-200" data-i18n="stats.total_candidates">Candidats</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">200+</div>
                        <div class="text-blue-200" data-i18n="stats.total_employers">Employeurs</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">95%</div>
                        <div class="text-blue-200" data-i18n="stats.satisfaction">Satisfaction</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h4 class="text-xl font-bold mb-4">HotelRestoJobs</h4>
                        <p class="text-gray-400" data-i18n="footer.tagline">La plateforme de recrutement spécialisée en hôtellerie-restauration au Québec.</p>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4" data-i18n="footer.quick_links">Liens rapides</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="/" class="hover:text-white" data-i18n="footer.search_job">Rechercher un emploi</a></li>
                            <li><a href="/candidat/login" class="hover:text-white" data-i18n="footer.candidate_space">Espace Candidat</a></li>
                            <li><a href="/employeur/login" class="hover:text-white" data-i18n="footer.post_job">Publier une offre</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4" data-i18n="footer.contact">Contact</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><i class="fas fa-envelope mr-2"></i>contact@hotelrestojobs.com</li>
                            <li><i class="fas fa-phone mr-2"></i>514-555-0000</li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 HotelRestoJobs. <span data-i18n="footer.rights">Tous droits réservés.</span></p>
                </div>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Mobile menu toggle
            document.getElementById('mobile-menu-btn').addEventListener('click', () => {
                document.getElementById('mobile-menu').classList.toggle('hidden');
            });

            // Charger les emplois vedettes
            async function loadFeaturedJobs() {
                try {
                    const lang = window.i18n ? window.i18n.getLanguage() : 'fr';
                    const response = await axios.get('/api/jobs?featured=true&language=' + lang);
                    const jobs = response.data.jobs;
                    
                    const container = document.getElementById('featured-jobs');
                    container.innerHTML = jobs.map(job => createFeaturedJobCard(job)).join('');
                } catch (error) {
                    console.error('Erreur chargement emplois vedettes:', error);
                }
            }

            // Charger tous les emplois
            async function loadAllJobs() {
                try {
                    const lang = window.i18n ? window.i18n.getLanguage() : 'fr';
                    const response = await axios.get('/api/jobs?language=' + lang);
                    const jobs = response.data.jobs.filter(j => !j.is_featured);
                    
                    const container = document.getElementById('all-jobs');
                    container.innerHTML = jobs.map(job => createJobCard(job)).join('');
                } catch (error) {
                    console.error('Erreur chargement emplois:', error);
                }
            }

            // Créer une carte d'emploi vedette (enhanced)
            function createFeaturedJobCard(job) {
                // Logo HTML (si disponible)
                const logoHtml = job.company_logo_url 
                    ? \`<img src="\${job.company_logo_url}" alt="\${job.company_name}" class="w-20 h-20 object-contain rounded-lg bg-white p-2 border-2 border-yellow-300 shadow-md">\`
                    : \`<div class="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg border-2 border-yellow-300 shadow-md">
                         <i class="fas fa-building text-yellow-600 text-3xl"></i>
                       </div>\`;
                
                return \`
                    <div class="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-2 border-yellow-400 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                        <!-- Decorative corner badge -->
                        <div class="absolute top-0 right-0 w-24 h-24 bg-yellow-400 opacity-10 rounded-bl-full"></div>
                        
                        <div class="flex items-start justify-between mb-4 relative z-10">
                            <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md animate-pulse">
                                <i class="fas fa-star mr-1"></i><span data-i18n="jobs.featured_badge">VEDETTE</span>
                            </div>
                            <span class="text-gray-500 text-sm bg-white px-3 py-1 rounded-full">\${formatDate(job.created_at)}</span>
                        </div>
                        
                        <!-- Logo et titre -->
                        <div class="flex items-start gap-4 mb-4">
                            \${logoHtml}
                            <div class="flex-1">
                                <h4 class="text-xl font-bold text-gray-800 mb-2 leading-tight">\${job.title}</h4>
                                <p class="text-gray-600 font-semibold">
                                    <i class="fas fa-building mr-2 text-yellow-600"></i>\${job.company_name}
                                </p>
                            </div>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-map-marker-alt mr-2 text-yellow-600 w-5"></i>
                                <span>\${job.city}, \${job.province}</span>
                            </div>
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-briefcase mr-2 text-yellow-600 w-5"></i>
                                <span>\${job.employment_type}</span>
                            </div>
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-eye mr-2 text-yellow-600 w-5"></i>
                                <span>\${job.views_count} <span data-i18n="jobs.views">vues</span></span>
                            </div>
                        </div>
                        
                        <a href="/emploi/\${job.id}" class="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                            <i class="fas fa-arrow-right mr-2"></i><span data-i18n="jobs.view_details">Voir les détails</span>
                        </a>
                    </div>
                \`;
            }

            // Créer une carte d'emploi normale
            function createJobCard(job) {
                // Logo HTML (si disponible)
                const logoHtml = job.company_logo_url 
                    ? \`<img src="\${job.company_logo_url}" alt="\${job.company_name}" class="w-20 h-20 object-contain rounded-lg bg-white p-2 border border-gray-200">\`
                    : \`<div class="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                         <i class="fas fa-building text-gray-400 text-3xl"></i>
                       </div>\`;
                
                // Featured badge if applicable
                const featuredBadge = job.is_featured ? \`
                    <div class="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        <i class="fas fa-star mr-1"></i>VEDETTE
                    </div>
                \` : '';
                
                return \`
                    <div class="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow relative \${job.is_featured ? 'border-l-4 border-yellow-500' : ''}">
                        \${featuredBadge}
                        <div class="flex items-start justify-between gap-4">
                            <!-- Logo -->
                            <div class="flex-shrink-0">
                                \${logoHtml}
                            </div>
                            
                            <!-- Contenu -->
                            <div class="flex-1 min-w-0">
                                <h4 class="text-xl font-bold text-gray-800 mb-2">\${job.title}</h4>
                                <p class="text-gray-600 mb-2">
                                    <i class="fas fa-building mr-2"></i>\${job.company_name}
                                </p>
                                <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.city}, \${job.province}</span>
                                    <span><i class="fas fa-briefcase mr-1"></i>\${job.employment_type}</span>
                                    <span><i class="fas fa-eye mr-1"></i>\${job.views_count} <span data-i18n="jobs.views">vues</span></span>
                                </div>
                                <p class="text-gray-700 line-clamp-2">\${job.description.substring(0, 150)}...</p>
                            </div>
                            
                            <!-- Bouton -->
                            <div class="flex-shrink-0">
                                <a href="/emploi/\${job.id}" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap">
                                    <span data-i18n="jobs.view_details">Voir détails</span>
                                </a>
                            </div>
                        </div>
                    </div>
                \`;
            }

            // Recherche d'emplois
            async function searchJobs() {
                const keywords = document.getElementById('search-keywords').value;
                const city = document.getElementById('search-city').value;
                const lang = window.i18n ? window.i18n.getLanguage() : 'fr';
                
                // Si aucun critère, recharger tous les emplois
                if (!keywords && !city) {
                    loadAllJobs();
                    return;
                }
                
                let url = '/api/jobs?language=' + lang + '&';
                if (keywords) url += \`search=\${encodeURIComponent(keywords)}&\`;
                if (city) url += \`city=\${encodeURIComponent(city)}\`;
                
                try {
                    const response = await axios.get(url);
                    const container = document.getElementById('all-jobs');
                    
                    if (response.data.jobs.length === 0) {
                        // Aucun résultat trouvé
                        container.innerHTML = \`
                            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                                <div class="flex items-center mb-3">
                                    <i class="fas fa-search text-yellow-600 text-2xl mr-3"></i>
                                    <h3 class="text-lg font-semibold text-gray-800">Aucun emploi trouvé</h3>
                                </div>
                                <p class="text-gray-700 mb-4">
                                    Aucune offre ne correspond à vos critères de recherche : 
                                    \${keywords ? '<strong>"' + keywords + '"</strong>' : ''}
                                    \${city ? ' à <strong>' + city + '</strong>' : ''}
                                </p>
                                <button onclick="resetSearch()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                                    <i class="fas fa-redo mr-2"></i>Voir toutes les offres
                                </button>
                            </div>
                        \`;
                    } else {
                        // Afficher les résultats avec compteur
                        const resultCount = \`
                            <div class="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                                    <strong>\${response.data.jobs.length}</strong> offre(s) trouvée(s)
                                    \${keywords ? ' pour "<strong>' + keywords + '</strong>"' : ''}
                                    \${city ? ' à <strong>' + city + '</strong>' : ''}
                                </div>
                                <button onclick="resetSearch()" class="text-blue-600 hover:text-blue-800 font-semibold">
                                    <i class="fas fa-times-circle mr-1"></i>Réinitialiser
                                </button>
                            </div>
                        \`;
                        container.innerHTML = resultCount + response.data.jobs.map(job => createJobCard(job)).join('');
                    }
                } catch (error) {
                    console.error('Erreur recherche:', error);
                    const container = document.getElementById('all-jobs');
                    container.innerHTML = \`
                        <div class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-circle text-red-600 text-2xl mr-3"></i>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">Erreur de recherche</h3>
                                    <p class="text-gray-700">Une erreur s'est produite. Veuillez réessayer.</p>
                                </div>
                            </div>
                        </div>
                    \`;
                }
            }
            
            // Réinitialiser la recherche
            function resetSearch() {
                document.getElementById('search-keywords').value = '';
                document.getElementById('search-city').value = '';
                loadAllJobs();
            }

            // Formater la date
            function formatDate(dateStr) {
                const date = new Date(dateStr);
                const now = new Date();
                const diff = now - date;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                
                if (days === 0) return 'Aujourd\\'hui';
                if (days === 1) return 'Hier';
                if (days < 7) return \`Il y a \${days} jours\`;
                return date.toLocaleDateString('fr-CA');
            }

            // Charger au démarrage
            loadFeaturedJobs();
            loadAllJobs();
            
            // Recharger les emplois quand la langue change
            window.addEventListener('languageChanged', (event) => {
                console.log('Langue changée à:', event.detail.language);
                loadFeaturedJobs();
                loadAllJobs();
            });
        </script>
    </body>
    </html>
  `);
});

// Page de détail d'un emploi
app.get('/emploi/:id', async (c) => {
  const jobId = c.req.param('id');
  
  // Fetch job data for SEO metadata and structured data
  let jobData = null;
  try {
    const job = await c.env.DB.prepare(`
      SELECT jo.*, c.name as company_name, c.logo_url as company_logo_url
      FROM job_offers jo
      JOIN companies c ON jo.company_id = c.id
      WHERE jo.id = ? AND jo.status = 'active'
    `).bind(jobId).first();
    jobData = job;
  } catch (error) {
    console.error('Error fetching job for SEO:', error);
  }
  
  // Generate JSON-LD structured data for SEO
  let structuredData = '';
  if (jobData) {
    const jobPosting = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": jobData.title,
      "description": jobData.description,
      "identifier": {
        "@type": "PropertyValue",
        "name": "HotelRestoJobs",
        "value": jobData.id
      },
      "datePosted": jobData.created_at,
      "validThrough": jobData.featured_until || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": jobData.employment_type.toUpperCase().replace('-', '_'),
      "hiringOrganization": {
        "@type": "Organization",
        "name": jobData.company_name,
        "sameAs": c.req.url.replace(/\/emploi\/\d+$/, ''),
        "logo": jobData.company_logo_url || ""
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": jobData.location,
          "addressLocality": jobData.city,
          "addressRegion": jobData.province,
          "addressCountry": "CA"
        }
      },
      "baseSalary": jobData.salary_min ? {
        "@type": "MonetaryAmount",
        "currency": "CAD",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": jobData.salary_min,
          "maxValue": jobData.salary_max || jobData.salary_min,
          "unitText": jobData.salary_type === 'hourly' ? 'HOUR' : 'YEAR'
        }
      } : undefined,
      "jobBenefits": jobData.benefits || undefined,
      "qualifications": jobData.requirements || undefined,
      "industry": "Hospitality and Food Service",
      "occupationalCategory": jobData.position_type
    };
    
    structuredData = `<script type="application/ld+json">${JSON.stringify(jobPosting)}</script>`;
  }
  
  const pageTitle = jobData ? `${jobData.title} - ${jobData.company_name} - HotelRestoJobs` : 'Détail de l\'emploi - HotelRestoJobs';
  const metaDescription = jobData ? `${jobData.title} chez ${jobData.company_name} à ${jobData.city}, ${jobData.province}. ${jobData.description.substring(0, 150)}...` : 'Offre d\'emploi en hôtellerie-restauration au Québec';
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageTitle}</title>
        <meta name="description" content="${metaDescription}">
        ${structuredData}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="/static/i18n.js"></script>
        <script src="/static/language-selector.js"></script>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-utensils text-3xl"></i>
                        <h1 class="text-2xl font-bold">HotelRestoJobs</h1>
                    </a>
                    <div class="flex items-center space-x-4">
                        <div id="language-selector-container"></div>
                        <a href="/" class="text-white hover:text-blue-200">
                            <i class="fas fa-arrow-left mr-2"></i><span data-i18n="job_detail.back_to_offers">Retour aux offres</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Floating Action Button for employers -->
        <a href="/employeur/login" class="fixed bottom-8 right-8 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-4 rounded-full font-bold shadow-2xl transition-all transform hover:scale-110 z-50">
            <i class="fas fa-plus-circle mr-2"></i><span data-i18n="job_detail.post_offer">Publier une offre</span>
        </a>

        <div class="container mx-auto px-4 py-8">
            <div id="job-detail" class="max-w-4xl mx-auto">
                <!-- Le détail sera chargé ici -->
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const jobId = ${jobId};
            
            async function loadJobDetail() {
                try {
                    const lang = window.i18n ? window.i18n.getLanguage() : 'fr';
                    const response = await axios.get('/api/jobs/' + jobId + '?language=' + lang);
                    const job = response.data.job;
                    
                    const container = document.getElementById('job-detail');
                    
                    // Traduire les textes dynamiques
                    const featuredLabel = window.i18n ? window.i18n.t('jobs.featured_badge') : 'EMPLOI VEDETTE';
                    const descriptionTitle = window.i18n ? window.i18n.t('job_detail.description_title') : 'Description du poste';
                    const requirementsTitle = window.i18n ? window.i18n.t('job_detail.requirements_title') : 'Exigences';
                    const benefitsTitle = window.i18n ? window.i18n.t('job_detail.benefits_title') : 'Avantages';
                    const applyButton = window.i18n ? window.i18n.t('job_detail.apply_button') : 'Postuler maintenant';
                    const viewsLabel = window.i18n ? window.i18n.t('jobs.views') : 'vues';
                    const applicationsLabel = window.i18n ? window.i18n.t('job_detail.applications') : 'candidatures';
                    
                    // Logo HTML
                    const logoHtml = job.company_logo_url 
                        ? \`<img src="\${job.company_logo_url}" alt="\${job.company_name}" class="w-24 h-24 object-contain rounded-lg bg-white border border-gray-200 p-2">\`
                        : \`<div class="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                             <i class="fas fa-building text-gray-400 text-4xl"></i>
                           </div>\`;
                    
                    container.innerHTML = \`
                        <div class="bg-white rounded-lg shadow-lg p-8">
                            \${job.is_featured ? '<div class="bg-yellow-500 text-white px-4 py-2 rounded-full inline-block mb-4"><i class="fas fa-star mr-2"></i>' + featuredLabel + '</div>' : ''}
                            
                            <!-- Logo et titre -->
                            <div class="flex items-start gap-6 mb-6">
                                \${logoHtml}
                                <div class="flex-1">
                                    <h1 class="text-3xl font-bold text-gray-800 mb-2">\${job.title}</h1>
                                    <div class="flex flex-wrap gap-6 text-gray-600">
                                        <div><i class="fas fa-building mr-2"></i><strong>\${job.company_name}</strong></div>
                                        <div><i class="fas fa-map-marker-alt mr-2"></i>\${job.location}</div>
                                        <div><i class="fas fa-briefcase mr-2"></i>\${job.employment_type}</div>
                                        \${job.salary_min ? \`<div><i class="fas fa-dollar-sign mr-2"></i>\${formatSalary(job)}</div>\` : ''}
                                    </div>
                                </div>
                            </div>

                            <div class="prose max-w-none mb-8">
                                <h2 class="text-2xl font-bold text-gray-800 mb-3">\${descriptionTitle}</h2>
                                <p class="text-gray-700 whitespace-pre-line">\${job.description}</p>
                            </div>

                            \${job.requirements ? \`
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-gray-800 mb-3">\${requirementsTitle}</h2>
                                    <p class="text-gray-700 whitespace-pre-line">\${job.requirements}</p>
                                </div>
                            \` : ''}

                            \${job.benefits ? \`
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-gray-800 mb-3">\${benefitsTitle}</h2>
                                    <p class="text-gray-700 whitespace-pre-line">\${job.benefits}</p>
                                </div>
                            \` : ''}

                            <div class="border-t pt-6 mt-6">
                                <button onclick="applyToJob()" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 text-lg">
                                    <i class="fas fa-paper-plane mr-2"></i>\${applyButton}
                                </button>
                                <p class="text-gray-500 mt-4 text-sm">
                                    <i class="fas fa-eye mr-2"></i>\${job.views_count} \${viewsLabel} • 
                                    <i class="fas fa-users mr-2"></i>\${job.applications_count} \${applicationsLabel}
                                </p>
                            </div>
                        </div>
                    \`;
                } catch (error) {
                    console.error('Erreur chargement détail:', error);
                    document.getElementById('job-detail').innerHTML = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Emploi non trouvé</div>';
                }
            }

            function formatSalary(job) {
                if (job.salary_type === 'negotiable') return 'Salaire négociable';
                const unit = job.salary_type === 'hourly' ? '/h' : '/an';
                if (job.salary_min && job.salary_max) {
                    return \`\${job.salary_min}\$ - \${job.salary_max}\$\${unit}\`;
                }
                return \`À partir de \${job.salary_min}\$\${unit}\`;
            }

            function applyToJob() {
                alert('Pour postuler, veuillez vous connecter à votre espace candidat.');
                window.location.href = '/candidat/login';
            }

            // Initialiser le sélecteur de langue
            document.getElementById('language-selector-container').innerHTML = createLanguageSelector();
            
            // Charger le détail au démarrage
            loadJobDetail();
            
            // Recharger quand la langue change
            window.addEventListener('languageChanged', (event) => {
                console.log('Langue changée à:', event.detail.language);
                loadJobDetail();
            });
        </script>
    </body>
    </html>
  `);
});

// Sitemap XML dynamique pour SEO
app.get('/sitemap.xml', async (c) => {
  const baseUrl = 'https://hotelrestojobs.pages.dev'; // Update with your production URL
  
  let urls: string[] = [];
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/candidat/login', priority: '0.8', changefreq: 'weekly' },
    { url: '/employeur/login', priority: '0.8', changefreq: 'weekly' },
  ];
  
  urls.push(...staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>
  `));
  
  // Dynamic job pages
  try {
    const jobs = await c.env.DB.prepare(`
      SELECT id, updated_at 
      FROM job_offers 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 500
    `).all();
    
    urls.push(...jobs.results.map((job: any) => `
      <url>
        <loc>${baseUrl}/emploi/${job.id}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
        <lastmod>${job.updated_at.split('T')[0]}</lastmod>
      </url>
    `));
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
  }
  
  // Category pages
  const categories = ['cuisinier', 'serveur', 'receptionniste', 'manager', 'plongeur', 'barista', 'bartender', 'patissier'];
  urls.push(...categories.map(cat => `
    <url>
      <loc>${baseUrl}/metiers/${cat}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>
  `));
  
  // City pages
  try {
    const cities = await c.env.DB.prepare(`
      SELECT DISTINCT city 
      FROM job_offers 
      WHERE status = 'active' AND city IS NOT NULL
      LIMIT 50
    `).all();
    
    urls.push(...cities.results.map((cityRow: any) => {
      const citySlug = cityRow.city.toLowerCase().replace(/\s+/g, '-');
      return `
        <url>
          <loc>${baseUrl}/villes/${citySlug}</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
          <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        </url>
      `;
    }));
  } catch (error) {
    console.error('Error fetching cities for sitemap:', error);
  }
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`;
  
  c.header('Content-Type', 'application/xml');
  return c.text(sitemap);
});

// robots.txt pour SEO
app.get('/robots.txt', (c) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /portails/

Sitemap: https://hotelrestojobs.pages.dev/sitemap.xml
`;
  
  c.header('Content-Type', 'text/plain');
  return c.text(robotsTxt);
});

// Page villes dynamique
app.get('/villes/:city', async (c) => {
  const city = c.req.param('city');
  const cityName = decodeURIComponent(city).replace(/-/g, ' ');
  
  // Fetch jobs count for this city
  let jobsCount = 0;
  let featuredJobsCount = 0;
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as count,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_count
      FROM job_offers 
      WHERE LOWER(city) LIKE LOWER(?) AND status = 'active'
    `).bind(`%${cityName}%`).first();
    jobsCount = result?.count || 0;
    featuredJobsCount = result?.featured_count || 0;
  } catch (error) {
    console.error('Error counting jobs:', error);
  }
  
  // Get unique position types in this city
  let positionTypes: string[] = [];
  try {
    const results = await c.env.DB.prepare(`
      SELECT DISTINCT position_type 
      FROM job_offers 
      WHERE LOWER(city) LIKE LOWER(?) AND status = 'active'
      LIMIT 10
    `).bind(`%${cityName}%`).all();
    positionTypes = results.results.map(r => r.position_type as string);
  } catch (error) {
    console.error('Error fetching position types:', error);
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emplois en Hôtellerie-Restauration à ${cityName} | HotelRestoJobs</title>
        <meta name="description" content="Découvrez ${jobsCount} offres d'emploi en hôtellerie et restauration à ${cityName}, Québec. Trouvez votre prochain emploi dans les meilleurs restaurants et hôtels.">
        <meta name="keywords" content="emploi ${cityName}, hôtellerie ${cityName}, restauration ${cityName}, serveur ${cityName}, cuisinier ${cityName}">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-utensils text-3xl"></i>
                        <h1 class="text-2xl font-bold">HotelRestoJobs</h1>
                    </a>
                    <nav class="hidden md:flex items-center space-x-6">
                        <a href="/" class="hover:text-blue-200">Emplois</a>
                        <a href="/candidat/login" class="hover:text-blue-200">Espace Candidat</a>
                        <a href="/employeur/login" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold">
                            <i class="fas fa-plus-circle mr-2"></i>Publier une offre
                        </a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Breadcrumb -->
        <div class="bg-white border-b">
            <div class="container mx-auto px-4 py-3">
                <div class="flex items-center text-sm text-gray-600">
                    <a href="/" class="hover:text-blue-600">Accueil</a>
                    <i class="fas fa-chevron-right mx-2 text-xs"></i>
                    <a href="/villes" class="hover:text-blue-600">Villes</a>
                    <i class="fas fa-chevron-right mx-2 text-xs"></i>
                    <span class="text-gray-900 font-semibold">${cityName}</span>
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <section class="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-12">
            <div class="container mx-auto px-4">
                <h1 class="text-4xl font-bold mb-4">
                    <i class="fas fa-map-marker-alt mr-3"></i>Emplois à ${cityName}
                </h1>
                <p class="text-xl mb-6">
                    Trouvez votre emploi idéal en hôtellerie-restauration à ${cityName}, Québec
                </p>
                <div class="flex gap-6 flex-wrap">
                    <div class="bg-white bg-opacity-20 rounded-lg px-6 py-4">
                        <span class="text-3xl font-bold">${jobsCount}</span>
                        <span class="ml-2 text-lg">offres disponibles</span>
                    </div>
                    ${featuredJobsCount > 0 ? `
                        <div class="bg-yellow-500 bg-opacity-30 rounded-lg px-6 py-4">
                            <i class="fas fa-star mr-2"></i>
                            <span class="text-2xl font-bold">${featuredJobsCount}</span>
                            <span class="ml-2 text-lg">offres vedettes</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>

        <!-- Featured Jobs -->
        ${featuredJobsCount > 0 ? `
        <section class="container mx-auto px-4 py-12">
            <h2 class="text-3xl font-bold mb-6">
                <i class="fas fa-star text-yellow-500 mr-2"></i>Emplois Vedettes à ${cityName}
            </h2>
            <div id="featured-jobs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <!-- Featured jobs will be loaded here -->
            </div>
        </section>
        ` : ''}

        <!-- All Jobs -->
        <section class="container mx-auto px-4 py-12">
            <h2 class="text-3xl font-bold mb-6">Toutes les offres à ${cityName}</h2>
            <div id="jobs-list" class="space-y-4">
                <!-- Jobs will be loaded here -->
            </div>
        </section>

        <!-- Available Position Types -->
        ${positionTypes.length > 0 ? `
        <section class="bg-gray-100 py-12">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold mb-8 text-center">Métiers disponibles à ${cityName}</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${positionTypes.map(type => `
                        <a href="/metiers/${type.toLowerCase()}" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                            <i class="fas fa-briefcase text-3xl text-blue-600 mb-3"></i>
                            <h3 class="font-semibold text-gray-800 capitalize">${type}</h3>
                        </a>
                    `).join('')}
                </div>
            </div>
        </section>
        ` : ''}

        <!-- Popular Cities -->
        <section class="container mx-auto px-4 py-12">
            <h2 class="text-3xl font-bold mb-8 text-center">Autres villes populaires</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/villes/montreal" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Montréal</h3>
                </a>
                <a href="/villes/quebec" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Québec</h3>
                </a>
                <a href="/villes/gatineau" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Gatineau</h3>
                </a>
                <a href="/villes/laval" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Laval</h3>
                </a>
                <a href="/villes/sherbrooke" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Sherbrooke</h3>
                </a>
                <a href="/villes/trois-rivieres" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Trois-Rivières</h3>
                </a>
                <a href="/villes/drummondville" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Drummondville</h3>
                </a>
                <a href="/villes/saguenay" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <i class="fas fa-city text-3xl text-blue-600 mb-3"></i>
                    <h3 class="font-semibold text-gray-800">Saguenay</h3>
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8">
            <div class="container mx-auto px-4 text-center">
                <p>&copy; 2024 HotelRestoJobs. Tous droits réservés.</p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const cityName = '${cityName}';
            
            async function loadCityJobs() {
                try {
                    const response = await axios.get(\`/api/jobs?city=\${encodeURIComponent(cityName)}\`);
                    const jobs = response.data.jobs;
                    
                    // Load featured jobs
                    const featuredJobs = jobs.filter(j => j.is_featured);
                    const featuredContainer = document.getElementById('featured-jobs');
                    if (featuredContainer && featuredJobs.length > 0) {
                        featuredContainer.innerHTML = featuredJobs.map(job => \`
                            <div class="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 rounded-lg p-6 shadow-lg">
                                <div class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                                    <i class="fas fa-star mr-1"></i>VEDETTE
                                </div>
                                <h3 class="text-xl font-bold text-gray-800 mb-2">\${job.title}</h3>
                                <p class="text-gray-600 mb-2"><i class="fas fa-building mr-2"></i>\${job.company_name}</p>
                                <p class="text-gray-600 mb-4"><i class="fas fa-briefcase mr-2"></i>\${job.employment_type}</p>
                                <a href="/emploi/\${job.id}" class="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700">
                                    Voir les détails
                                </a>
                            </div>
                        \`).join('');
                    }
                    
                    // Load all jobs
                    const regularJobs = jobs.filter(j => !j.is_featured);
                    const container = document.getElementById('jobs-list');
                    if (regularJobs.length === 0) {
                        container.innerHTML = '<div class="text-center py-12 text-gray-600">Aucune offre disponible pour le moment.</div>';
                        return;
                    }
                    
                    container.innerHTML = regularJobs.map(job => \`
                        <div class="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex-1">
                                    <h3 class="text-xl font-bold text-gray-800 mb-2">\${job.title}</h3>
                                    <p class="text-gray-600 mb-2">
                                        <i class="fas fa-building mr-2"></i>\${job.company_name}
                                    </p>
                                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.city}, \${job.province}</span>
                                        <span><i class="fas fa-briefcase mr-1"></i>\${job.employment_type}</span>
                                        <span><i class="fas fa-eye mr-1"></i>\${job.views_count} vues</span>
                                    </div>
                                </div>
                                <a href="/emploi/\${job.id}" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap">
                                    Voir détails
                                </a>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading jobs:', error);
                }
            }
            
            loadCityJobs();
        </script>
    </body>
    </html>
  `);
});

// Page métiers dynamique
app.get('/metiers/:category', async (c) => {
  const category = c.req.param('category');
  
  // Mapping des catégories avec métadonnées SEO
  const categoryMeta: Record<string, {title: string, description: string, keywords: string[]}> = {
    'cuisinier': {
      title: 'Emplois de Cuisinier',
      description: 'Trouvez des emplois de cuisinier, chef cuisinier, sous-chef dans les meilleurs restaurants et hôtels au Québec.',
      keywords: ['cuisinier', 'chef', 'sous-chef', 'cuisine', 'gastronomie']
    },
    'serveur': {
      title: 'Emplois de Serveur',
      description: 'Opportunités d\'emploi pour serveurs, serveuses, maîtres d\'hôtel dans la restauration au Québec.',
      keywords: ['serveur', 'serveuse', 'maître d\'hôtel', 'service', 'restauration']
    },
    'receptionniste': {
      title: 'Emplois de Réceptionniste',
      description: 'Postes de réceptionniste dans les hôtels, auberges et établissements d\'hébergement au Québec.',
      keywords: ['réceptionniste', 'hôtel', 'hébergement', 'accueil']
    },
    'manager': {
      title: 'Emplois de Manager',
      description: 'Postes de direction, gérant de restaurant, directeur d\'hôtel, superviseur en hôtellerie-restauration.',
      keywords: ['manager', 'gérant', 'directeur', 'superviseur', 'gestion']
    },
    'plongeur': {
      title: 'Emplois de Plongeur',
      description: 'Opportunités d\'emploi pour plongeurs dans les restaurants et hôtels au Québec.',
      keywords: ['plongeur', 'aide-cuisine', 'entretien']
    },
    'barista': {
      title: 'Emplois de Barista',
      description: 'Postes de barista, préparateur de café dans les cafés et restaurants au Québec.',
      keywords: ['barista', 'café', 'espresso', 'café-restaurant']
    },
    'bartender': {
      title: 'Emplois de Bartender',
      description: 'Emplois de barman, mixologue dans les bars, restaurants et hôtels au Québec.',
      keywords: ['bartender', 'barman', 'mixologue', 'bar', 'cocktails']
    },
    'patissier': {
      title: 'Emplois de Pâtissier',
      description: 'Opportunités pour pâtissiers, boulangers dans les pâtisseries, boulangeries et hôtels.',
      keywords: ['pâtissier', 'boulanger', 'pâtisserie', 'boulangerie']
    }
  };
  
  const meta = categoryMeta[category] || {
    title: `Emplois ${category}`,
    description: `Trouvez des emplois de ${category} en hôtellerie-restauration au Québec.`,
    keywords: [category, 'emploi', 'hôtellerie', 'restauration']
  };
  
  // Fetch jobs for this category
  let jobsCount = 0;
  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM job_offers 
      WHERE position_type LIKE ? AND status = 'active'
    `).bind(`%${category}%`).first();
    jobsCount = result?.count || 0;
  } catch (error) {
    console.error('Error counting jobs:', error);
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${meta.title} au Québec | HotelRestoJobs</title>
        <meta name="description" content="${meta.description}">
        <meta name="keywords" content="${meta.keywords.join(', ')}, emploi Québec, hôtellerie, restauration">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-utensils text-3xl"></i>
                        <h1 class="text-2xl font-bold">HotelRestoJobs</h1>
                    </a>
                    <nav class="hidden md:flex items-center space-x-6">
                        <a href="/" class="hover:text-blue-200">Emplois</a>
                        <a href="/candidat/login" class="hover:text-blue-200">Espace Candidat</a>
                        <a href="/employeur/login" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold">
                            <i class="fas fa-plus-circle mr-2"></i>Publier une offre
                        </a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Breadcrumb -->
        <div class="bg-white border-b">
            <div class="container mx-auto px-4 py-3">
                <div class="flex items-center text-sm text-gray-600">
                    <a href="/" class="hover:text-blue-600">Accueil</a>
                    <i class="fas fa-chevron-right mx-2 text-xs"></i>
                    <a href="/metiers" class="hover:text-blue-600">Métiers</a>
                    <i class="fas fa-chevron-right mx-2 text-xs"></i>
                    <span class="text-gray-900 font-semibold">${meta.title}</span>
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <section class="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-12">
            <div class="container mx-auto px-4">
                <h1 class="text-4xl font-bold mb-4">
                    <i class="fas fa-briefcase mr-3"></i>${meta.title}
                </h1>
                <p class="text-xl mb-6">${meta.description}</p>
                <div class="bg-white bg-opacity-20 rounded-lg px-6 py-4 inline-block">
                    <span class="text-2xl font-bold">${jobsCount}</span>
                    <span class="ml-2">offres disponibles</span>
                </div>
            </div>
        </section>

        <!-- Jobs List -->
        <section class="container mx-auto px-4 py-12">
            <div id="jobs-list" class="space-y-4">
                <!-- Jobs will be loaded here -->
            </div>
            <div class="text-center mt-8">
                <a href="/?search=${encodeURIComponent(category)}" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                    <i class="fas fa-search mr-2"></i>Voir toutes les offres
                </a>
            </div>
        </section>

        <!-- Popular Categories -->
        <section class="bg-gray-100 py-12">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold mb-8 text-center">Autres métiers populaires</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${Object.keys(categoryMeta).filter(cat => cat !== category).map(cat => `
                        <a href="/metiers/${cat}" class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                            <i class="fas fa-utensils text-3xl text-blue-600 mb-3"></i>
                            <h3 class="font-semibold text-gray-800">${categoryMeta[cat].title}</h3>
                        </a>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8">
            <div class="container mx-auto px-4 text-center">
                <p>&copy; 2024 HotelRestoJobs. Tous droits réservés.</p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const category = '${category}';
            
            async function loadCategoryJobs() {
                try {
                    const response = await axios.get(\`/api/jobs?search=\${encodeURIComponent(category)}\`);
                    const jobs = response.data.jobs;
                    
                    const container = document.getElementById('jobs-list');
                    if (jobs.length === 0) {
                        container.innerHTML = '<div class="text-center py-12 text-gray-600">Aucune offre disponible pour le moment.</div>';
                        return;
                    }
                    
                    container.innerHTML = jobs.slice(0, 10).map(job => \`
                        <div class="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex-1">
                                    <h3 class="text-xl font-bold text-gray-800 mb-2">\${job.title}</h3>
                                    <p class="text-gray-600 mb-2">
                                        <i class="fas fa-building mr-2"></i>\${job.company_name}
                                    </p>
                                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.city}, \${job.province}</span>
                                        <span><i class="fas fa-briefcase mr-1"></i>\${job.employment_type}</span>
                                    </div>
                                </div>
                                <a href="/emploi/\${job.id}" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap">
                                    Voir détails
                                </a>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading jobs:', error);
                }
            }
            
            loadCategoryJobs();
        </script>
    </body>
    </html>
  `);
});

// Redirect pages portails (à développer)
app.get('/candidat/login', (c) => c.redirect('/portails/candidat.html'));
app.get('/employeur/login', (c) => c.redirect('/portails/employeur.html'));
app.get('/admin/login', (c) => c.redirect('/portails/admin.html'));

export default app;
