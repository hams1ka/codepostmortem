import { getCommits, getCommitDetails } from "../services/githubClient.js";

// Churn = how frequently files are modified
// High churn = unstable codebase = worse score
export async function runComplexityAnalyzer(owner, repo) {
  console.log("  Running complexity analyzer...");

  const commits = await getCommits(owner, repo);

  // Map to track how many times each file has been changed
  const fileChurnMap = {};
  // Track commits per week for the timeline chart
  const commitsByWeek = {};

  // We only check details for the last 30 commits to avoid API rate limits
  const recentCommits = commits.slice(0, 30);

  for (const commit of recentCommits) {
    const files = await getCommitDetails(owner, repo, commit.sha);

    for (const file of files) {
      fileChurnMap[file.filename] = (fileChurnMap[file.filename] || 0) + 1;
    }

    // Group commits by ISO week (e.g. "2024-W12")
    const date = new Date(commit.commit.author.date);
    const week = getWeekKey(date);
    commitsByWeek[week] = (commitsByWeek[week] || 0) + 1;
  }

  // Find the hottest (most-changed) files
  const sortedFiles = Object.entries(fileChurnMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // top 10 most-churned files

  const hotspots = sortedFiles.map(([filename, changeCount]) => ({
    filename,
    changeCount,
    risk: changeCount > 10 ? "high" : changeCount > 5 ? "medium" : "low",
  }));

  // Calculate churn score: higher churn = lower (worse) score
  const maxChurn = sortedFiles[0]?.[1] || 1;
  // Score from 0–100, where 100 = very stable codebase
  const churnScore = Math.max(0, 100 - (maxChurn / 30) * 100);

  // Format timeline data for Recharts
  const timeline = Object.entries(commitsByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, commits: count }));

  return {
    churnScore: Math.round(churnScore),
    hotspots,
    totalCommitsAnalyzed: recentCommits.length,
    timeline,
  };
}

// Helper: convert a Date into "YYYY-WNN" format
function getWeekKey(date) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNumber = Math.ceil(
    ((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}
