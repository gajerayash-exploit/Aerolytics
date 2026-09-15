# Aerolytics frontend

Next.js 16 (App Router) + React 19 + Three.js command center for the Aerolytics Drone Intelligence Engine.
Every screen comes from the Claude Design canvas in `design/landing-page`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Command-center routes need the demo sign-in: go to `/login` and press **Authenticate**.

To run real inference, start the backend first (from the repo root):

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Then open `/missions/new`, drop images, and press **Run inference**. If the backend is not reachable, the run is simulated and labelled as such.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend (`POST /api/v1/infer/{pillar}`) |

Copy `.env.example` to `.env.local` to change it.

## How it is built

```
design/landing-page/        Claude Design artboards (source of truth for every screen)
scripts/convert-designs.mjs  artboard → React view (JSX + scoped CSS)
scripts/design-patches.mjs   behaviour wiring: API calls, downloads, persistence, route params
scripts/gen-routes.mjs       one App Router page per route
src/views/                   generated views (+ _base.jsx shared logic, css/)
src/lib/gl/engine.js         Three.js renderer used by all 3D scenes
src/lib/api.js               FastAPI client
src/lib/store.js             localStorage / cookie persistence
src/lib/session.js           turns inference results into twin / report / frame data
src/components/chrome.jsx    rail, top bar, settings menu, marketing nav and footer
src/components/ViewHost.jsx  client-side view loader
src/proxy.ts                 protects command-center routes (demo sign-in cookie)
src/app/api/requests         stores contact / access / reset requests in .data/requests.json
```

After changing a design or a patch, regenerate:

```bash
node scripts/convert-designs.mjs
node scripts/gen-routes.mjs
```

## Routes

Public: `/`, `/platform`, `/solutions/[energy|agri|rescue]`, `/about`, `/contact`, `/demo`, `/login`, `/request-access`, `/forgot-password`, `/status`.

Command center (sign-in required): `/dashboard`, `/missions`, `/missions/new`, `/missions/[id]`, `/missions/[id]/detections/[detectionId]`, `/missions/[id]/report`, `/missions/[id]/frames`, `/live`, `/analytics`, `/sites`, `/sites/[id]`, `/fleet`, `/fleet/[id]`, `/mission-planner`, `/reports`, `/settings/profile`, `/settings/organization`, `/settings/team`, `/settings/api-keys`, `/settings/models`, `/audit-log`.

Errors: unknown routes render the 404 "Signal lost" screen; runtime errors render the 500 variant.

## What is real and what is sample data

- **Real:** inference through the FastAPI backend, uploaded-mission twin/report/frames, JSON exports, print-to-PDF reports, planner manifest export (same shape as `backend/telemetry.py`), backend health on `/status`, model metrics on `/settings/models` and `/solutions/*` (from `models/training`), form submissions (stored locally by the Next.js API route), settings persistence.
- **Sample (labelled on screen):** the golden-demo missions, sites, fleet, team, audit events, analytics trends, live feed telemetry. Bracketed values such as `[AIRFRAME MODEL]` are placeholders to fill in.
