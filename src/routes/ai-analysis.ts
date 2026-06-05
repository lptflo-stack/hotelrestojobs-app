import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, requireEmployer } from '../middleware/auth';
import { analyzeApplication, type AIAnalysisResult } from '../utils/ai-analysis';

const aiAnalysis = new Hono<{ Bindings: Bindings }>();

/**
 * Analyze a single application using AI
 * POST /api/ai-analysis/application/:id
 */
aiAnalysis.post('/application/:id', requireEmployer, async (c) => {
  try {
    const applicationId = c.req.param('id');
    const user = c.get('user');

    // Get application with candidate and job offer data
    const application = await c.env.DB.prepare(`
      SELECT 
        a.*,
        jo.title as job_title,
        jo.description as job_description,
        jo.requirements as job_requirements,
        jo.benefits as job_benefits,
        jo.employment_type,
        jo.position_type,
        jo.salary_min,
        jo.salary_max,
        jo.company_id,
        cp.bio as candidate_bio,
        cp.experience as candidate_experience,
        cp.availability as candidate_availability,
        cp.desired_salary as candidate_desired_salary,
        u.name as candidate_name,
        u.email as candidate_email
      FROM applications a
      JOIN job_offers jo ON a.job_offer_id = jo.id
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
      WHERE a.id = ?
    `).bind(applicationId).first();

    if (!application) {
      return c.json({ error: 'Candidature non trouvée' }, 404);
    }

    // Verify employer owns this job offer
    if (application.company_id !== user.company_id) {
      return c.json({ error: 'Accès non autorisé' }, 403);
    }

    // Check if already analyzed recently (cache for 24h)
    if (application.ai_analyzed_at) {
      const analyzedDate = new Date(application.ai_analyzed_at);
      const now = new Date();
      const hoursSinceAnalysis = (now.getTime() - analyzedDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceAnalysis < 24 && application.ai_analysis) {
        console.log('📦 Using cached AI analysis (< 24h old)');
        return c.json({
          score: application.ai_score,
          analysis: JSON.parse(application.ai_analysis),
          cached: true
        });
      }
    }

    console.log(`🤖 Starting AI analysis for application ${applicationId}...`);

    // Perform AI analysis
    const analysisResult: AIAnalysisResult = await analyzeApplication(
      {
        name: application.candidate_name,
        email: application.candidate_email,
        cv_text: application.cv_text,
        cover_letter: application.cover_letter,
        bio: application.candidate_bio,
        experience: application.candidate_experience,
        desired_salary: application.candidate_desired_salary,
      },
      {
        title: application.job_title,
        description: application.job_description,
        requirements: application.job_requirements,
        benefits: application.job_benefits,
        employment_type: application.employment_type,
        position_type: application.position_type,
        salary_min: application.salary_min,
        salary_max: application.salary_max,
      }
    );

    // Store analysis in database
    await c.env.DB.prepare(`
      UPDATE applications 
      SET 
        ai_score = ?,
        ai_analysis = ?,
        ai_analyzed_at = datetime('now')
      WHERE id = ?
    `).bind(
      analysisResult.score,
      JSON.stringify(analysisResult),
      applicationId
    ).run();

    console.log(`✅ AI analysis saved for application ${applicationId}`);

    return c.json({
      score: analysisResult.score,
      analysis: analysisResult,
      cached: false
    });

  } catch (error) {
    console.error('Erreur analyse IA:', error);
    return c.json({ 
      error: 'Erreur lors de l\'analyse IA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Analyze all applications for a job offer
 * POST /api/ai-analysis/job/:jobId/analyze-all
 */
aiAnalysis.post('/job/:jobId/analyze-all', requireEmployer, async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const user = c.get('user');

    // Verify job offer belongs to employer
    const jobOffer = await c.env.DB.prepare(`
      SELECT id, company_id FROM job_offers WHERE id = ?
    `).bind(jobId).first();

    if (!jobOffer) {
      return c.json({ error: 'Offre d\'emploi non trouvée' }, 404);
    }

    if (jobOffer.company_id !== user.company_id) {
      return c.json({ error: 'Accès non autorisé' }, 403);
    }

    // Get all unanalyzed applications
    const applications = await c.env.DB.prepare(`
      SELECT id 
      FROM applications 
      WHERE job_offer_id = ? 
      AND (ai_analyzed_at IS NULL OR ai_score IS NULL)
    `).bind(jobId).all();

    console.log(`🔄 Analyzing ${applications.results.length} applications for job ${jobId}...`);

    // Analyze each application (sequential to avoid rate limits)
    const results = [];
    for (const app of applications.results) {
      try {
        // Reuse the single application analysis endpoint logic
        const analysisRequest = new Request(`http://localhost/api/ai-analysis/application/${app.id}`, {
          method: 'POST',
          headers: c.req.raw.headers
        });
        
        // Call internal analysis
        const response = await aiAnalysis.fetch(analysisRequest, c.env, c.executionCtx);
        const data = await response.json() as any;
        
        results.push({
          applicationId: app.id,
          score: data.score,
          success: true
        });
        
        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to analyze application ${app.id}:`, error);
        results.push({
          applicationId: app.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return c.json({
      totalAnalyzed: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results
    });

  } catch (error) {
    console.error('Erreur analyse batch:', error);
    return c.json({ error: 'Erreur lors de l\'analyse batch' }, 500);
  }
});

export default aiAnalysis;
