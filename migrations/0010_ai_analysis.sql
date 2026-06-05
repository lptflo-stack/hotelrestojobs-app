-- Migration: Add AI analysis fields to applications table
-- Date: 2026-06-05

-- Add AI analysis columns to applications table
ALTER TABLE applications ADD COLUMN ai_score INTEGER DEFAULT NULL;
ALTER TABLE applications ADD COLUMN ai_analysis TEXT DEFAULT NULL;
ALTER TABLE applications ADD COLUMN ai_analyzed_at DATETIME DEFAULT NULL;

-- Index for sorting by AI score
CREATE INDEX IF NOT EXISTS idx_applications_ai_score ON applications(ai_score DESC);
