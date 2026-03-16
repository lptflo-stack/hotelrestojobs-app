// Types pour les entités de la base de données

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'employer' | 'admin';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  resume_url?: string;
  bio?: string;
  experience_years?: number;
  availability?: string;
  desired_position?: string;
  desired_salary_min?: number;
  desired_salary_max?: number;
  created_at: string;
  updated_at: string;
}

export interface JobOffer {
  id: number;
  company_id: number;
  title: string;
  description: string;
  position_type: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary_min?: number;
  salary_max?: number;
  salary_type?: 'hourly' | 'annual' | 'negotiable';
  location: string;
  city: string;
  province: string;
  requirements?: string;
  benefits?: string;
  status: 'pending' | 'active' | 'rejected' | 'expired' | 'closed';
  is_featured: number;
  featured_until?: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  job_offer_id: number;
  user_id: number;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  employer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeaturedOrder {
  id: number;
  job_offer_id: number;
  user_id: number;
  amount: number;
  duration_days: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les requêtes API
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'candidate' | 'employer';
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateJobOfferRequest {
  title: string;
  description: string;
  position_type: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary_min?: number;
  salary_max?: number;
  salary_type?: 'hourly' | 'annual' | 'negotiable';
  location: string;
  city: string;
  province: string;
  requirements?: string;
  benefits?: string;
}

export interface CreateApplicationRequest {
  job_offer_id: number;
  cover_letter?: string;
}

export interface FeaturedOrderRequest {
  job_offer_id: number;
  duration_days: number;
}

// Type pour les bindings Cloudflare
export type Bindings = {
  DB: D1Database;
};
