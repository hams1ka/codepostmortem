import express from "express";
import { parseRepoUrl, getRepoInfo } from "../services/githubClient.js";
import { runComplexityAnalyzer } from "../analyzers/complexityAnalyzer.js";
import { runTechDebtScanner } from "../analyzers/techDebtScanner.js";
import { runAiSummarizer } from "../analyzers/aiSummarizer.js";
import { calculateGrade } from "../services/scoreAggregator.js";
import { saveAnalysis, getRecentAnalysis } from "../db/queries.js";

const router = express.Router();

// POST /api/analyze
// Body: { repoUrl: "https://github.com/facebook/react" }
router.post("/", async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
  }

  try {
    // Step 1: Parse the URL to get owner and repo name
    const { owner, repo } = parseRepoUrl(repoUrl);
    console.log(`\nAnalyzing ${owner}/${repo}...`);

    // Step 2: Check if we already analyzed this recently (within 1 hour)
    // This avoids hammering the GitHub API for the same repo
    const cached = await getRecentAnalysis(owner, repo).catch(() => null);
    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      if (age < ONE_HOUR) {
        console.log("Returning cached result");
        return res.json({ ...cached, cached: true });
      }
    }

    // Step 3: Fetch repo metadata from GitHub
    const repoInfo = await getRepoInfo(owner, repo);

    // Step 4: Run all three analyzers in parallel (faster than sequential)
    console.log("Running analyzers...");
    const [complexityResult, debtResult] = await Promise.all([
      runComplexityAnalyzer(owner, repo),
      runTechDebtScanner(owner, repo),
    ]);

    // Step 5: Calculate the overall grade
    const { overallScore, grade } = calculateGrade(complexityResult, debtResult);
    console.log(`Grade: ${grade} (${overallScore}/100)`);

    // Step 6: Generate AI postmortem via Claude
    const aiSummary = `This repo scored ${overallScore}/100 (Grade ${grade}). Churn score: ${complexityResult.churnScore}/100. Tech debt score: ${debtResult.techDebtScore}/100. Top hotspot: ${complexityResult.hotspots[0]?.filename || 'none'} (changed ${complexityResult.hotspots[0]?.changeCount || 0} times).`;

    // Step 7: Bundle everything together
    const result = {
      repoUrl,
      owner,
      repoName: repo,
      grade,
      overallScore,
      complexityScore: complexityResult.churnScore,
      techDebtScore: debtResult.techDebtScore,
      churnScore: complexityResult.churnScore,
      aiSummary,
      rawMetrics: {
        repoInfo: {
          description: repoInfo.description,
          language: repoInfo.language,
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          openIssues: repoInfo.open_issues_count,
          createdAt: repoInfo.created_at,
        },
        complexity: complexityResult,
        techDebt: debtResult,
      },
    };

    // Step 8: Save to database (fire and forget — don't block the response)
    saveAnalysis(result).catch((err) =>
      console.error("Failed to save analysis:", err.message)
    );

    res.json(result);
  } catch (err) {
    console.error("Analysis failed:", err.message);

    // Give helpful error messages based on what went wrong
    if (err.message.includes("Invalid GitHub URL")) {
      return res.status(400).json({ error: "Please enter a valid GitHub URL (e.g. https://github.com/facebook/react)" });
    }
    if (err.status === 404) {
      return res.status(404).json({ error: "Repository not found. Make sure it's public and the URL is correct." });
    }
    if (err.status === 403) {
      return res.status(403).json({ error: "GitHub API rate limit reached. Please add a GITHUB_TOKEN to your .env file." });
    }

    res.status(500).json({ error: "Analysis failed. Check the server logs for details." });
  }
});

export default router;
