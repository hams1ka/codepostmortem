# CodePostmortem

> Give your GitHub repo a doctor's checkup. Paste a URL → get a health grade, trend charts, and an AI-generated postmortem.

![CodePostmortem demo](https://via.placeholder.com/900x500/0d1117/58a6ff?text=Add+a+screenshot+here)

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

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/codepostmortem.git
cd codepostmortem
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in:

- `GITHUB_TOKEN` — create one at https://github.com/settings/tokens (select `public_repo`)
- `ANTHROPIC_API_KEY` — get one at https://console.anthropic.com/
- `DATABASE_URL` — your PostgreSQL connection string

### 3. Set up the database

```bash
# Create the database
createdb codepostmortem

# Run the schema
psql -U postgres -d codepostmortem -f server/src/db/schema.sql
```

### 4. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 5. Run the app

Open two terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm start
```

Visit http://localhost:3000 and paste any public GitHub repo URL.

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
