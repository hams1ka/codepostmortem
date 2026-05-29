-- Run this file once to set up your database
-- Command: psql -U postgres -d codepostmortem -f schema.sql

CREATE TABLE IF NOT EXISTS analyses (
  id SERIAL PRIMARY KEY,
  repo_url TEXT NOT NULL,
  owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  grade TEXT NOT NULL,                  -- A, B, C, D, or F
  complexity_score NUMERIC(5,2),        -- 0 to 100
  tech_debt_score NUMERIC(5,2),         -- 0 to 100
  churn_score NUMERIC(5,2),             -- 0 to 100
  overall_score NUMERIC(5,2),           -- weighted average
  ai_summary TEXT,                      -- Claude's plain-English postmortem
  raw_metrics JSONB,                    -- full data blob for charts
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index so we can quickly look up past analyses by repo
CREATE INDEX IF NOT EXISTS idx_analyses_repo ON analyses(owner, repo_name);
