import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "../hooks/useAnalysis";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const navigate = useNavigate();
  const { analyzeRepo, loading, error } = useAnalysis();

  async function handleSubmit(e) {
    e.preventDefault(); // prevent page reload on form submit
    const result = await analyzeRepo(repoUrl);
    if (result) {
      // Pass data to Report page via navigation state
      navigate("/report", { state: { result } });
    }
  }

  // Example repos users can click to pre-fill the input
  const examples = [
    "https://github.com/expressjs/express",
    "https://github.com/axios/axios",
    "https://github.com/lodash/lodash",
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="container" style={{ textAlign: "center", padding: "60px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.5px" }}>
            Code<span style={{ color: "#58a6ff" }}>Postmortem</span>
          </h1>
          <p style={{ fontSize: 18, color: "#8b949e", maxWidth: 500, margin: "0 auto" }}>
            Give your GitHub repo a doctor's checkup. Get a health grade, trend charts, and an AI postmortem.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              required
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px 18px",
                fontSize: 15,
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: 10,
                color: "#e6edf3",
                outline: "none",
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={loading || !repoUrl}
              style={{
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 600,
                background: loading ? "#21262d" : "#238636",
                border: "1px solid #2ea043",
                borderRadius: 10,
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Analyzing..." : "Analyze repo →"}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "#3d1212",
              border: "1px solid #6e1a1a",
              borderRadius: 8,
              color: "#f97474",
              fontSize: 14,
              textAlign: "left",
            }}>
              {error}
            </div>
          )}
        </form>

        {/* Loading state */}
        {loading && (
          <div style={{ color: "#8b949e", fontSize: 14 }}>
            <p>Fetching commits, scanning for tech debt, and generating AI report...</p>
            <p style={{ marginTop: 4 }}>This takes about 30–60 seconds for a large repo.</p>
          </div>
        )}

        {/* Example repos */}
        {!loading && (
          <div>
            <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 12 }}>
              Try an example:
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {examples.map((url) => (
                <button
                  key={url}
                  onClick={() => setRepoUrl(url)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 13,
                    background: "transparent",
                    border: "1px solid #30363d",
                    borderRadius: 6,
                    color: "#58a6ff",
                    cursor: "pointer",
                  }}
                >
                  {url.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
