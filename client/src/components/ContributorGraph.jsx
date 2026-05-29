import React from "react";

// This component shows the tech debt items found by the scanner
// (hotspots + debt items in one view)
export default function ContributorGraph({ rawMetrics }) {
  const { complexity, techDebt } = rawMetrics || {};

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>

      {/* Hotspot files (most-changed) */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Churn hotspots</h3>
        <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>Most frequently changed files</p>

        {complexity?.hotspots?.length > 0 ? (
          complexity.hotspots.slice(0, 6).map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 0",
              borderBottom: i < 5 ? "1px solid #21262d" : "none",
            }}>
              <span style={{ fontSize: 13, color: "#8b949e", minWidth: 16 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 12, color: "#c9d1d9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {h.filename.split("/").pop()} {/* just the filename, not full path */}
              </span>
              <span className={`badge badge-${h.risk}`}>{h.changeCount}×</span>
            </div>
          ))
        ) : (
          <p style={{ color: "#8b949e", fontSize: 13 }}>No hotspots detected.</p>
        )}
      </div>

      {/* Tech debt items */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Debt items found</h3>
        <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 16 }}>
          {techDebt?.filesScanned} files scanned · {techDebt?.summary?.total} issues
        </p>

        {techDebt?.debtItems?.length > 0 ? (
          techDebt.debtItems.slice(0, 6).map((d, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "8px 0",
              borderBottom: i < 5 ? "1px solid #21262d" : "none",
            }}>
              <span className={`badge badge-${d.severity}`} style={{ marginTop: 1, flexShrink: 0 }}>
                {d.severity}
              </span>
              <div>
                <p style={{ fontSize: 12, color: "#c9d1d9" }}>{d.label}</p>
                <p style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>
                  {d.file.split("/").slice(-2).join("/")} · {d.count} occurrence{d.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#3fb950", fontSize: 13 }}>No debt items detected.</p>
        )}
      </div>
    </div>
  );
}
