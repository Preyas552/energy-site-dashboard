# Getting Started

## Prerequisites

- **Node.js** 20 or newer
- **Python** 3.11 (for the TOPSIS scoring service)
- A **Mapbox access token** — free at https://account.mapbox.com/

## Setup

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Configure your Mapbox token:

   ```bash
   cp .env.example .env
   # then edit .env and paste in your token
   ```

3. Install the Python service's dependencies:

   ```bash
   cd topsis-service
   ./setup.sh        # Windows: setup.bat
   cd ..
   ```

## Running locally

The `start-local.sh` script starts both the Python TOPSIS service (port 5001)
and the Next.js dev server (port 3000):

```bash
./start-local.sh      # Windows: start-local.bat
```

Then open http://localhost:3000.

To run the two processes by hand instead:

```bash
# terminal 1 — scoring service
cd topsis-service && python app.py

# terminal 2 — frontend
npm run dev
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | yes | Mapbox GL basemap tiles |
| `PYTHON_TOPSIS_URL` | no | TOPSIS service base URL. Defaults to `http://localhost:5001`. |

## Deploying

The Next.js frontend deploys to **Vercel**: import the repository, set
`NEXT_PUBLIC_MAPBOX_TOKEN` and `PYTHON_TOPSIS_URL` as environment variables,
and deploy. The repo root is the project root — no subdirectory setting needed.

The Python service in `topsis-service/` is a Flask app and needs a host that
can run a long-lived process (Vercel's Node runtime cannot). It ships a
`Procfile` (`web: python app.py`) and `runtime.txt`, so any Python PaaS that
reads those will run it. Point `PYTHON_TOPSIS_URL` at the resulting URL.
