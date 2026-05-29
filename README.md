# CodePostmortem

 
## Features

- **Health grade (A–F)** based on churn rate and tech debt analysis
- **Commit timeline chart** showing activity trends across the repo's history
- **AI postmortem** written by Claude — specific, honest, actionable
- **Churn hotspots** — the files that change most often and are most at risk
- **Tech debt scanner** — finds TODOs, FIXMEs, deprecated packages, and debug statements
- Works on any public GitHub repo instantly

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React, React Router, Recharts |
| Backend | Node.js, Express |
| GitHub data | Octokit (official GitHub API client) |
| AI analysis | Anthropic Claude API |
| Database | PostgreSQL |

 
## How it works

1. You paste a GitHub repo URL
2. The backend fetches the last 100 commits via the GitHub API
3. Three analyzers run in parallel:
   - **Complexity analyzer** — calculates file churn rate and identifies hotspot files
   - **Tech debt scanner** — scans up to 20 files for TODOs, FIXMEs, deprecated packages
   - **AI summarizer** — sends all metrics to Claude for a plain-English postmortem
4. Scores are weighted into an overall grade (A–F)
5. Results are cached for 1 hour per repo to stay within API limits

## Metrics explained

| Metric | What it measures | Weight |
|---|---|---|
| Churn score | Stability of files over time — low churn = high score | 70% |
| Tech debt score | TODOs, FIXMEs, deprecated packages, debug code | 30% |

## Roadmap

- [ ] GitHub OAuth for private repos
- [ ] Compare two repos side by side
- [ ] PR review time analysis
- [ ] GitHub Actions badge integration
- [ ] Email digest of weekly health trends

## License

MIT
