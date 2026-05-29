import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runAiSummarizer(repoInfo, complexityResult, debtResult, grade) {
  console.log("  Running AI summarizer (calling Claude)...");

  // Build a detailed prompt with all the metrics
  const prompt = `
You are a senior software engineer doing a code health postmortem for a GitHub repository.

Repository: ${repoInfo.full_name}
Description: ${repoInfo.description || "No description"}
Language: ${repoInfo.language || "Unknown"}
Stars: ${repoInfo.stargazers_count}
Open Issues: ${repoInfo.open_issues_count}
Overall Health Grade: ${grade}

COMPLEXITY ANALYSIS:
- Churn Score: ${complexityResult.churnScore}/100 (higher = more stable)
- Total commits analyzed: ${complexityResult.totalCommitsAnalyzed}
- Top 3 most-changed files (hotspots):
${complexityResult.hotspots
  .slice(0, 3)
  .map((h) => `  • ${h.filename} (changed ${h.changeCount} times, ${h.risk} risk)`)
  .join("\n")}

TECH DEBT ANALYSIS:
- Tech Debt Score: ${debtResult.techDebtScore}/100 (higher = less debt)
- Files scanned: ${debtResult.filesScanned}
- Debt items found: ${debtResult.summary.total} total (${debtResult.summary.high} high, ${debtResult.summary.medium} medium, ${debtResult.summary.low} low)
${debtResult.debtItems
  .slice(0, 5)
  .map((d) => `  • [${d.severity.toUpperCase()}] ${d.label} in ${d.file}`)
  .join("\n")}

Write a concise postmortem report in 3 short paragraphs:
1. Overall health assessment (2-3 sentences, mention the grade)
2. Key risks and what's causing them (be specific, mention actual filenames)
3. Top 2-3 actionable recommendations for the team

Keep it direct, honest, and useful. Write like a senior engineer giving candid feedback to their team. No bullet points — use flowing paragraphs.
`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text;
}
