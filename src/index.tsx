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
                        <a href="/" class="hover:text-blue-200">Emplois</a>
                        <a href="/candidat/login" class="hover:text-blue-200">Espace Candidat</a>
                        <a href="/employeur/login" class="hover:text-blue-200">Espace Employeur</a>
                        <a href="/admin/login" class="hover:text-blue-200">Admin</a>
                        <a href="/employeur/login" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors">
                            <i class="fas fa-plus-circle mr-2"></i>Publier une offre
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
                <h2 class="text-4xl md:text-5xl font-bold mb-4">
                    Trouvez votre emploi de rêve dans l'hôtellerie-restauration
                </h2>
                <p class="text-xl mb-8">
                    La plateforme #1 pour les professionnels de l'hôtellerie et de la restauration
                </p>
                
                <!-- CTA Button for Employers -->
                <div class="mb-8">
                    <a href="/employeur/login" class="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105">
                        <i class="fas fa-briefcase mr-2"></i>Vous recrutez ? Publiez une offre gratuitement !
                    </a>
                </div>
                
                <!-- Search Bar -->
                <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-4">
                    <div class="flex flex-col md:flex-row gap-3">
                        <input type="text" id="search-keywords" placeholder="Mots-clés (ex: Chef, Serveur...)" 
                               class="flex-1 px-4 py-3 rounded border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <input type="text" id="search-city" placeholder="Ville" 
                               class="flex-1 px-4 py-3 rounded border text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button onclick="searchJobs()" class="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i>Rechercher
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Jobs Section -->
        <section class="container mx-auto px-4 py-12">
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>
                    Emplois Vedettes
                </h3>
            </div>
            <div id="featured-jobs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Les emplois vedettes seront chargés ici -->
            </div>
        </section>

        <!-- All Jobs Section -->
        <section class="container mx-auto px-4 py-12">
            <h3 class="text-3xl font-bold text-gray-800 mb-8">Dernières offres d'emploi</h3>
            <div id="all-jobs" class="space-y-4">
                <!-- Les emplois seront chargés ici -->
            </div>
            <div class="text-center mt-8">
                <button onclick="loadMoreJobs()" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                    Voir plus d'offres
                </button>
            </div>
        </section>

        <!-- Stats Section -->
        <section class="bg-blue-600 text-white py-16">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div class="text-4xl font-bold mb-2">500+</div>
                        <div class="text-blue-200">Offres d'emploi</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">1000+</div>
                        <div class="text-blue-200">Candidats</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">200+</div>
                        <div class="text-blue-200">Employeurs</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">95%</div>
                        <div class="text-blue-200">Satisfaction</div>
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
                        <p class="text-gray-400">La plateforme de recrutement spécialisée en hôtellerie-restauration au Québec.</p>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4">Liens rapides</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="/" class="hover:text-white">Rechercher un emploi</a></li>
                            <li><a href="/candidat/login" class="hover:text-white">Espace Candidat</a></li>
                            <li><a href="/employeur/login" class="hover:text-white">Publier une offre</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4">Contact</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><i class="fas fa-envelope mr-2"></i>contact@hotelrestojobs.com</li>
                            <li><i class="fas fa-phone mr-2"></i>514-555-0000</li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 HotelRestoJobs. Tous droits réservés.</p>
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
                    const response = await axios.get('/api/jobs?featured=true');
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
                    const response = await axios.get('/api/jobs');
                    const jobs = response.data.jobs.filter(j => !j.is_featured);
                    
                    const container = document.getElementById('all-jobs');
                    container.innerHTML = jobs.map(job => createJobCard(job)).join('');
                } catch (error) {
                    console.error('Erreur chargement emplois:', error);
                }
            }

            // Créer une carte d'emploi vedette
            function createFeaturedJobCard(job) {
                return \`
                    <div class="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div class="flex items-start justify-between mb-3">
                            <div class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                <i class="fas fa-star mr-1"></i>VEDETTE
                            </div>
                            <span class="text-gray-500 text-sm">\${formatDate(job.created_at)}</span>
                        </div>
                        <h4 class="text-xl font-bold text-gray-800 mb-2">\${job.title}</h4>
                        <p class="text-gray-600 mb-3">
                            <i class="fas fa-building mr-2"></i>\${job.company_name}
                        </p>
                        <div class="flex items-center text-gray-600 mb-3">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span>\${job.city}, \${job.province}</span>
                        </div>
                        <div class="flex items-center text-gray-600 mb-4">
                            <i class="fas fa-briefcase mr-2"></i>
                            <span>\${job.employment_type}</span>
                        </div>
                        <a href="/emploi/\${job.id}" class="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700">
                            Voir les détails
                        </a>
                    </div>
                \`;
            }

            // Créer une carte d'emploi normale
            function createJobCard(job) {
                return \`
                    <div class="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h4 class="text-xl font-bold text-gray-800 mb-2">\${job.title}</h4>
                                <p class="text-gray-600 mb-2">
                                    <i class="fas fa-building mr-2"></i>\${job.company_name}
                                </p>
                                <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>\${job.city}, \${job.province}</span>
                                    <span><i class="fas fa-briefcase mr-1"></i>\${job.employment_type}</span>
                                    <span><i class="fas fa-eye mr-1"></i>\${job.views_count} vues</span>
                                </div>
                                <p class="text-gray-700 line-clamp-2">\${job.description.substring(0, 150)}...</p>
                            </div>
                            <div class="ml-4">
                                <a href="/emploi/\${job.id}" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap">
                                    Voir détails
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
                
                let url = '/api/jobs?';
                if (keywords) url += \`search=\${encodeURIComponent(keywords)}&\`;
                if (city) url += \`city=\${encodeURIComponent(city)}\`;
                
                try {
                    const response = await axios.get(url);
                    const container = document.getElementById('all-jobs');
                    container.innerHTML = response.data.jobs.map(job => createJobCard(job)).join('');
                } catch (error) {
                    console.error('Erreur recherche:', error);
                }
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
        </script>
    </body>
    </html>
  `);
});

// Page de détail d'un emploi
app.get('/emploi/:id', (c) => {
  const jobId = c.req.param('id');
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Détail de l'emploi - HotelRestoJobs</title>
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
                    <a href="/" class="text-white hover:text-blue-200">
                        <i class="fas fa-arrow-left mr-2"></i>Retour aux offres
                    </a>
                </div>
            </div>
        </header>

        <!-- Floating Action Button for employers -->
        <a href="/employeur/login" class="fixed bottom-8 right-8 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-4 rounded-full font-bold shadow-2xl transition-all transform hover:scale-110 z-50">
            <i class="fas fa-plus-circle mr-2"></i>Publier une offre
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
                    const response = await axios.get(\`/api/jobs/\${jobId}\`);
                    const job = response.data;
                    
                    const container = document.getElementById('job-detail');
                    container.innerHTML = \`
                        <div class="bg-white rounded-lg shadow-lg p-8">
                            \${job.is_featured ? '<div class="bg-yellow-500 text-white px-4 py-2 rounded-full inline-block mb-4"><i class="fas fa-star mr-2"></i>EMPLOI VEDETTE</div>' : ''}
                            
                            <h1 class="text-3xl font-bold text-gray-800 mb-4">\${job.title}</h1>
                            
                            <div class="flex flex-wrap gap-6 mb-6 text-gray-600">
                                <div><i class="fas fa-building mr-2"></i><strong>\${job.company_name}</strong></div>
                                <div><i class="fas fa-map-marker-alt mr-2"></i>\${job.location}</div>
                                <div><i class="fas fa-briefcase mr-2"></i>\${job.employment_type}</div>
                                \${job.salary_min ? \`<div><i class="fas fa-dollar-sign mr-2"></i>\${formatSalary(job)}</div>\` : ''}
                            </div>

                            <div class="prose max-w-none mb-8">
                                <h2 class="text-2xl font-bold text-gray-800 mb-3">Description du poste</h2>
                                <p class="text-gray-700 whitespace-pre-line">\${job.description}</p>
                            </div>

                            \${job.requirements ? \`
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-gray-800 mb-3">Exigences</h2>
                                    <p class="text-gray-700 whitespace-pre-line">\${job.requirements}</p>
                                </div>
                            \` : ''}

                            \${job.benefits ? \`
                                <div class="mb-8">
                                    <h2 class="text-2xl font-bold text-gray-800 mb-3">Avantages</h2>
                                    <p class="text-gray-700 whitespace-pre-line">\${job.benefits}</p>
                                </div>
                            \` : ''}

                            <div class="border-t pt-6 mt-6">
                                <button onclick="applyToJob()" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 text-lg">
                                    <i class="fas fa-paper-plane mr-2"></i>Postuler maintenant
                                </button>
                                <p class="text-gray-500 mt-4 text-sm">
                                    <i class="fas fa-eye mr-2"></i>\${job.views_count} vues • 
                                    <i class="fas fa-users mr-2"></i>\${job.applications_count} candidatures
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

            loadJobDetail();
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
