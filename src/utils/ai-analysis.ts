/**
 * OpenAI Integration for AI-powered job application analysis
 * Uses GenSpark's LLM proxy to analyze candidate CVs against job offers
 */

import OpenAI from 'openai';

// Initialize OpenAI client with environment variables
// These are automatically set by GenSpark sandbox
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1',
});

export interface AIAnalysisResult {
  score: number; // 0-100
  strengths: string[]; // Points forts
  concerns: string[]; // Points à vérifier
  recommendation: string; // Recommandation globale
  details: string; // Analyse détaillée complète
}

/**
 * Analyze a job application using AI
 * Compares candidate's CV/profile against job offer requirements
 * 
 * @param candidateData Candidate's CV and profile information
 * @param jobOfferData Job offer requirements and description
 * @returns AIAnalysisResult with score and detailed analysis
 */
export async function analyzeApplication(
  candidateData: {
    name: string;
    email: string;
    cv_text?: string;
    cover_letter?: string;
    bio?: string;
    experience?: string;
    desired_salary?: string;
  },
  jobOfferData: {
    title: string;
    description: string;
    requirements?: string;
    benefits?: string;
    employment_type: string;
    position_type: string;
    salary_min?: number;
    salary_max?: number;
  }
): Promise<AIAnalysisResult> {
  
  // Build comprehensive prompt for analysis
  const prompt = `Tu es un expert RH spécialisé dans l'analyse de candidatures pour le secteur de l'hôtellerie-restauration au Québec.

Analyse la correspondance entre ce candidat et cette offre d'emploi.

=== OFFRE D'EMPLOI ===
Titre: ${jobOfferData.title}
Type de poste: ${jobOfferData.position_type}
Type d'emploi: ${jobOfferData.employment_type}

Description:
${jobOfferData.description}

${jobOfferData.requirements ? `Exigences:\n${jobOfferData.requirements}` : ''}

${jobOfferData.benefits ? `Avantages:\n${jobOfferData.benefits}` : ''}

${jobOfferData.salary_min ? `Salaire: ${jobOfferData.salary_min}$ - ${jobOfferData.salary_max || jobOfferData.salary_min}$` : ''}

=== PROFIL DU CANDIDAT ===
Nom: ${candidateData.name}
${candidateData.bio ? `Biographie:\n${candidateData.bio}` : ''}

${candidateData.cv_text ? `CV:\n${candidateData.cv_text}` : ''}

${candidateData.experience ? `Expérience:\n${candidateData.experience}` : ''}

${candidateData.cover_letter ? `Lettre de motivation:\n${candidateData.cover_letter}` : ''}

${candidateData.desired_salary ? `Salaire souhaité: ${candidateData.desired_salary}` : ''}

=== ANALYSE DEMANDÉE ===
Fournis une analyse structurée en JSON avec exactement ce format:

{
  "score": <nombre entre 0 et 100>,
  "strengths": [
    "Point fort 1",
    "Point fort 2",
    "Point fort 3"
  ],
  "concerns": [
    "Point à vérifier 1",
    "Point à vérifier 2"
  ],
  "recommendation": "Une phrase de recommandation claire",
  "details": "Analyse détaillée en 2-3 paragraphes expliquant le score et les raisons"
}

Critères d'évaluation:
1. **Expérience pertinente** (30 points): Correspondance avec le type de poste
2. **Compétences** (30 points): Compétences mentionnées vs exigences
3. **Formation** (20 points): Formation et certifications pertinentes
4. **Motivation** (10 points): Lettre de motivation et intérêt démontré
5. **Disponibilité/Salaire** (10 points): Compatibilité pratique

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

  try {
    console.log('🤖 Appel API OpenAI pour analyse candidature...');
    
    const completion = await client.chat.completions.create({
      model: 'gpt-5-mini', // Faster and cheaper for this use case
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert RH spécialisé dans le recrutement en hôtellerie-restauration. Tu analyses les candidatures de manière objective et professionnelle.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for consistent analysis
      max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content || '';
    console.log('✅ Réponse OpenAI reçue, parsing JSON...');
    
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const analysis: AIAnalysisResult = JSON.parse(jsonText);
    
    // Validation
    if (typeof analysis.score !== 'number' || analysis.score < 0 || analysis.score > 100) {
      throw new Error('Invalid score value');
    }
    
    if (!Array.isArray(analysis.strengths) || !Array.isArray(analysis.concerns)) {
      throw new Error('Invalid analysis structure');
    }
    
    console.log(`✅ Analyse complétée: Score ${analysis.score}%`);
    return analysis;
    
  } catch (error) {
    console.error('❌ Erreur analyse IA:', error);
    
    // Fallback analysis in case of error
    return {
      score: 50,
      strengths: ['Profil à examiner manuellement'],
      concerns: ['Analyse IA temporairement indisponible'],
      recommendation: 'Analyse manuelle recommandée - l\'IA n\'a pas pu traiter cette candidature.',
      details: 'Une erreur technique a empêché l\'analyse automatique. Veuillez examiner cette candidature manuellement.'
    };
  }
}

/**
 * Get color class based on AI score
 * @param score AI analysis score (0-100)
 * @returns Tailwind color classes
 */
export function getScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300'
    };
  } else if (score >= 60) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300'
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300'
    };
  }
}

/**
 * Get recommendation icon based on score
 * @param score AI analysis score (0-100)
 * @returns Font Awesome icon class
 */
export function getScoreIcon(score: number): string {
  if (score >= 80) return 'fa-star';
  if (score >= 60) return 'fa-check-circle';
  return 'fa-exclamation-circle';
}
