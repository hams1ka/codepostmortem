import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

// This creates a "pool" - a group of database connections
// that are reused instead of opening a new one every time
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Save a completed analysis to the database
export async function saveAnalysis(data) {
  const query = `
    INSERT INTO analyses 
      (repo_url, owner, repo_name, grade, complexity_score, tech_debt_score, churn_score, overall_score, ai_summary, raw_metrics)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [
    data.repoUrl,
    data.owner,
    data.repoName,
    data.grade,
    data.complexityScore,
    data.techDebtScore,
    data.churnScore,
    data.overallScore,
    data.aiSummary,
    JSON.stringify(data.rawMetrics),
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Get the most recent analysis for a repo (so we don't re-analyze too often)
export async function getRecentAnalysis(owner, repoName) {
  const query = `
    SELECT * FROM analyses
    WHERE owner = $1 AND repo_name = $2
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [owner, repoName]);
  return result.rows[0] || null;
}
