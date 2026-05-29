import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReportCard from "../components/ReportCard";
import MetricTimeline from "../components/MetricTimeline";
import InsightPanel from "../components/InsightPanel";
import ContributorGraph from "../components/ContributorGraph";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();

  // The analysis result was passed via navigation state from Home.jsx
  const result = location.state?.result;

  // If someone visits /report directly with no data, send them back home
  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "#8b949e", marginBottom: 16 }}>No analysis data found.</p>
        <button onClick={() => navigate("/")} style={{
          padding: "10px 20px", background: "#238636", border: "none",
          borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 14,
        }}>
          Go back home
        </button>
      </div>
    );
  }

  const timeline = result.rawMetrics?.complexity?.timeline || [];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>

      {/* Top nav bar */}
      <div style={{
        borderBottom: "1px solid #21262d",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent", border: "1px solid #30363d",
            borderRadius: 6, color: "#8b949e", cursor: "pointer",
            fontSize: 13, padding: "5px 12px",
          }}
        >
          ← New analysis
        </button>
        <span style={{ fontSize: 14, fontWeight: 600 }}>CodePostmortem</span>
        {result.cached && (
          <span style={{ fontSize: 12, color: "#8b949e", marginLeft: "auto" }}>
            Cached result · run again in 1h
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="container" style={{ paddingTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* 1. Grade card */}
        <ReportCard result={result} />

        {/* 2. AI postmortem */}
        <InsightPanel aiSummary={result.aiSummary} />

        {/* 3. Commit timeline chart */}
        <MetricTimeline timeline={timeline} />

        {/* 4. Hotspots + debt items */}
        <ContributorGraph rawMetrics={result.rawMetrics} />

        {/* Footer note */}
        <p style={{ fontSize: 12, color: "#8b949e", textAlign: "center", marginTop: 8 }}>
          Analysis based on the last 100 commits · GitHub API + Claude AI
        </p>
      </div>
    </div>
  );
}
