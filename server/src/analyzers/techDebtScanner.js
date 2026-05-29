import { getFileTree, getFileContent, getPackageJson } from "../services/githubClient.js";

// Files we want to scan for debt markers
const SCANNABLE_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".go", ".rb"];

// Patterns that signal tech debt
const DEBT_PATTERNS = [
  { pattern: /TODO:/gi, label: "TODO comment", severity: "low" },
  { pattern: /FIXME:/gi, label: "FIXME comment", severity: "high" },
  { pattern: /HACK:/gi, label: "HACK comment", severity: "high" },
  { pattern: /XXX:/gi, label: "XXX marker", severity: "medium" },
  { pattern: /console\.log\(/gi, label: "console.log left in code", severity: "low" },
  { pattern: /debugger;/gi, label: "debugger statement", severity: "high" },
  { pattern: /any\b/g, label: "TypeScript 'any' type", severity: "medium" },
];

export async function runTechDebtScanner(owner, repo) {
  console.log("  Running tech debt scanner...");

  const allFiles = await getFileTree(owner, repo);
  const packageJson = await getPackageJson(owner, repo);

  // Only scan code files, skip node_modules, dist, build folders
  const codeFiles = allFiles
    .filter((file) => {
      const ext = "." + file.path.split(".").pop();
      const isCodeFile = SCANNABLE_EXTENSIONS.includes(ext);
      const isNotGenerated =
        !file.path.includes("node_modules") &&
        !file.path.includes("/dist/") &&
        !file.path.includes("/build/") &&
        !file.path.includes(".min.");
      return isCodeFile && isNotGenerated;
    })
    .slice(0, 20); // limit to 20 files to avoid rate limits

  const debtItems = [];

  for (const file of codeFiles) {
    const content = await getFileContent(owner, repo, file.path);
    if (!content) continue;

    for (const { pattern, label, severity } of DEBT_PATTERNS) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        debtItems.push({
          file: file.path,
          label,
          count: matches.length,
          severity,
        });
      }
    }
  }

  // Check package.json for signs of tech debt
  const packageDebt = [];
  if (packageJson) {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Flag packages known to be deprecated or heavily outdated
    const deprecatedPackages = ["request", "moment", "node-uuid", "jade", "bower"];
    for (const dep of deprecatedPackages) {
      if (allDeps[dep]) {
        packageDebt.push({
          file: "package.json",
          label: `Deprecated package: ${dep}`,
          severity: "high",
          count: 1,
        });
      }
    }
  }

  const allDebt = [...debtItems, ...packageDebt];
  const highCount = allDebt.filter((d) => d.severity === "high").length;
  const mediumCount = allDebt.filter((d) => d.severity === "medium").length;

  // Score: start at 100, deduct for each debt item found
  const debtScore = Math.max(
    0,
    100 - highCount * 10 - mediumCount * 5 - allDebt.length * 1
  );

  return {
    techDebtScore: Math.round(debtScore),
    debtItems: allDebt.slice(0, 20), // cap at 20 for the UI
    summary: {
      total: allDebt.length,
      high: highCount,
      medium: mediumCount,
      low: allDebt.filter((d) => d.severity === "low").length,
    },
    filesScanned: codeFiles.length,
  };
}
