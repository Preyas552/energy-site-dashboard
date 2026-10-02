# 🌞 Energy Site Selector

> Solar energy site selection using real NASA data and fuzzy TOPSIS analysis

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)

## What it does

Helps you find good locations for solar panel installations by:

1. 🗺️ **Interactive selection** — click grid cells on a map to pick candidate sites
2. 🛰️ **Real data** — fetches 5 years of solar data from the NASA POWER API
3. 🤖 **Analysis** — ranks sites with a fuzzy TOPSIS algorithm
4. 📊 **Visual results** — ranked sites, colour-coded on the map

## Features

- Interactive grid-based site selection on Mapbox
- Real solar irradiance data from the NASA POWER API
- Fuzzy number generation from historical patterns
- Multi-criteria decision analysis using fuzzy TOPSIS
- Automatic merging of adjacent selected cells
- Crisp (deterministic) TOPSIS alongside the fuzzy method, for comparison

## Quick start

```bash
npm install
cp .env.example .env     # then add your Mapbox token
cd topsis-service && ./setup.sh && cd ..
./start-local.sh         # Windows: start-local.bat
```

Open http://localhost:3000.

Full instructions, environment variables, and deployment notes are in
[docs/getting-started.md](docs/getting-started.md).

## Usage

1. Click grid cells on the map to select sites
2. Adjacent cells merge automatically (shown in green)
3. Click **Analyze Sites**
4. The app fetches NASA data and runs the analysis (30–60 seconds)
5. Review the ranked results:
   - 🟢 Green — excellent (80–100)
   - 🟡 Yellow — good (60–79)
   - 🟠 Orange — fair (40–59)
   - 🔴 Red — poor (0–39)

## Architecture

```
┌─────────────────────────────────────┐
│  Next.js frontend (port 3000)       │
│  - Interactive map (Mapbox)         │
│  - Grid selection (Deck.gl)         │
│  - Results visualization            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  API routes (Next.js)               │
│  - NASA POWER proxy                 │
│  - Data processing                  │
│  - Fuzzy number generation          │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Python TOPSIS service (port 5001)  │
│  - Fuzzy TOPSIS algorithm           │
│  - Multi-criteria analysis          │
│  - Site ranking                     │
└─────────────────────────────────────┘
```

### Project structure

```
energy-site-dashboard/
├── app/                # Next.js app router
│   ├── api/            # API routes (NASA POWER proxy, TOPSIS proxy, health)
│   ├── page.tsx        # Main application page
│   └── layout.tsx      # Root layout
├── components/         # React components
├── lib/                # Types and utility functions
├── topsis-service/     # Python Flask TOPSIS analysis engine
├── docs/               # Documentation and specs
└── .kiro/specs/        # Feature specs
```

## Technology stack

**Frontend** — Next.js 16 (App Router), TypeScript, Mapbox GL JS, Deck.gl, Tailwind CSS, Recharts

**Backend** — Next.js API routes, Python Flask, fuzzy TOPSIS, NASA POWER API

**Deployment** — Vercel (frontend) plus a Python host for the TOPSIS service

## Documentation

- [Getting started](docs/getting-started.md) — setup, local development, deployment
- [Scoring system](docs/scoring.md) — how scores are computed, and why fuzzy logic
- [Site explanations](docs/site-explanations.md) — interpreting per-site results
- [Grid alignment](docs/grid-alignment.md) — how the selection grid is built
- [Map rotation lock](docs/map-rotation-lock.md) — map interaction constraints
- [Specs](docs/specs/) — requirements, design, and implementation plan

## Acknowledgments

- **NASA POWER API** — free solar irradiance data
- **Mapbox** — interactive mapping platform
- **Deck.gl** — WebGL-based visualizations
- **Next.js** — React framework
