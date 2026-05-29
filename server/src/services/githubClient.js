import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

// Octokit is the official GitHub API library
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Parse "https://github.com/facebook/react" → { owner: "facebook", repo: "react" }
export function parseRepoUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""), // remove .git if present
  };
}

// Get basic info about the repo (stars, language, description etc.)
export async function getRepoInfo(owner, repo) {
  const { data } = await octokit.repos.get({ owner, repo });
  return data;
}

// Get the last 100 commits with their dates and files changed
export async function getCommits(owner, repo) {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: 100, // GitHub API max per page
  });
  return data;
}

// For each commit, get which files were changed
// This is how we calculate "churn" (how often files change)
export async function getCommitDetails(owner, repo, sha) {
  const { data } = await octokit.repos.getCommit({ owner, repo, ref: sha });
  return data.files || [];
}

// Get all open and closed issues
export async function getIssues(owner, repo) {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 100,
  });
  // Filter out pull requests (GitHub's API returns PRs as issues too)
  return data.filter((issue) => !issue.pull_request);
}

// Get the file tree of the repo (list of all files)
export async function getFileTree(owner, repo) {
  try {
    // First get the default branch
    const repoInfo = await getRepoInfo(owner, repo);
    const branch = repoInfo.default_branch;

    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true", // get all nested files
    });
    return data.tree.filter((item) => item.type === "blob"); // only files, not folders
  } catch {
    return [];
  }
}

// Get file content (to scan for TODO/FIXME comments)
export async function getFileContent(owner, repo, path) {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return data.content;
  } catch {
    return ""; // file might be binary or too large
  }
}

// Get package.json to check for outdated dependency patterns
export async function getPackageJson(owner, repo) {
  try {
    const content = await getFileContent(owner, repo, "package.json");
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}
