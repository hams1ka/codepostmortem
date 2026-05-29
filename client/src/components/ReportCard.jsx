import React from "react";

// Converts a 0-100 score into a colour
function scoreColor(score) {
  if (score >= 85) return "#3fb950";
  if (score >= 70) return "#a8f2b5";
  if (score >= 55) return "#f5a623";
  if (score >= 40) return "#f97316";
  return "#f97474";
}

// One metric row inside the report card
function MetricRow({ label, score }) {
  const color = scoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid #21262d" }}>
      <span style={{ flex: 1, fontSize: 14, color: "#8b949e" }}>{label}</span>
      {/* Progress bar */}
      <div style={{ flex: 2, background: "#21262d", borderRadius: 4, height: 6 }}>
        <div style={{ width: `${score}%`, background: color, height: 6, borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color, minWidth: 36, textAlign: "right" }}>
        {score}
      </span>
    </div>
  );
}

export default function ReportCard({ result }) {
  const gradeColors = { A: "#3fb950", B: "#a8f2b5", C: "#f5a623", D: "#f97316", F: "#f97474" };
  const gradeColor = gradeColors[result.grade] || "#8b949e";

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
        {/* Big grade letter */}
        <div style={{
          width: 80, height: 80,
          borderRadius: 16,
          background: `${gradeColor}22`, // colour with low opacity
          border: `2px solid ${gradeColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, fontWeight: 700, color: gradeColor,
          flexShrink: 0,
        }}>
          {result.grade}
        </div>

        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            {result.owner}/{result.repoName}
          </h2>
          <p style={{ fontSize: 14, color: "#8b949e" }}>
            Overall score: {result.overallScore}/100 —{" "}
            {result.grade === "A" && "Excellent health"}
            {result.grade === "B" && "Good shape, minor issues"}
            {result.grade === "C" && "Needs attention"}
            {result.grade === "D" && "Significant concerns"}
            {result.grade === "F" && "Critical issues found"}
          </p>
          {result.rawMetrics?.repoInfo && (
            <p style={{ fontSize: 13, color: "#8b949e", marginTop: 4 }}>
              {result.rawMetrics.repoInfo.language} · {result.rawMetrics.repoInfo.stars?.toLocaleString()} stars · {result.rawMetrics.repoInfo.openIssues} open issues
            </p>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      <MetricRow label="Churn / stability" score={result.churnScore} />
      <MetricRow label="Tech debt" score={result.techDebtScore} />
      <MetricRow label="Overall health" score={result.overallScore} />
    </div>
  );
}
