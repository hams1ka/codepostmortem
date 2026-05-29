// Combines all three analyzer scores into one weighted overall score
// and converts it to an A-F letter grade

// Weights must add up to 1.0
const WEIGHTS = {
  churn: 0.35,       // how stable the codebase is
  techDebt: 0.30,    // how much debt has accumulated
  complexity: 0.35,  // placeholder for future complexity metrics
};

export function calculateGrade(complexityResult, debtResult) {
  // Use churn score for complexity for now
  const complexityScore = complexityResult.churnScore;
  const techDebtScore = debtResult.techDebtScore;

  // Weighted average (we use churnScore for both churn and complexity weight)
  const overallScore = Math.round(
    complexityScore * (WEIGHTS.churn + WEIGHTS.complexity) +
    techDebtScore * WEIGHTS.techDebt
  );

  // Convert numeric score to letter grade
  let grade;
  if (overallScore >= 85) grade = "A";
  else if (overallScore >= 70) grade = "B";
  else if (overallScore >= 55) grade = "C";
  else if (overallScore >= 40) grade = "D";
  else grade = "F";

  return { overallScore, grade };
}

// Map grade to a colour the frontend can use
export function gradeToColor(grade) {
  const colors = {
    A: "#22c55e",  // green
    B: "#84cc16",  // lime
    C: "#f59e0b",  // amber
    D: "#f97316",  // orange
    F: "#ef4444",  // red
  };
  return colors[grade] || "#6b7280";
}
