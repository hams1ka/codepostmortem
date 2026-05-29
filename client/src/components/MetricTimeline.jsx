import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function MetricTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", color: "#8b949e", padding: 40 }}>
        Not enough commit history to build a timeline.
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Commit activity timeline</h3>
      <p style={{ fontSize: 13, color: "#8b949e", marginBottom: 20 }}>
        Number of commits per week over the last 100 commits
      </p>

      {/* ResponsiveContainer makes the chart fill its parent's width */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="week"
            tick={{ fill: "#8b949e", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#30363d" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#8b949e", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 8,
              color: "#e6edf3",
            }}
          />
          <Line
            type="monotone"
            dataKey="commits"
            stroke="#58a6ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#58a6ff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
