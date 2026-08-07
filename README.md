# REGNViking OS v1

Alexander's personal AI Empire core: an offline-first multi-agent swarm that
runs R&D cycles for biomimicry drones and the PanicSafe/PanicGuard mental-health
device concept, drafts patents, scaffolds sellable MVPs, and tracks ROI on a
single dashboard.

This repo also still contains the original `index.html` - the "Pusterom"
calm-breathing mini-app. It's a real, working, standalone artifact (no build
step, just open it in a browser) and it's thematically the same idea as the
PanicSafe module below (paced breathing as a stress-response tool), just
implemented earlier as a static app. It's left as-is.

## Honesty first

REGNViking OS generates **concepts, first-order engineering estimates, and
document drafts** - not certified hardware, not filed patents, not a clinical
device. Specifically:

- **Simulations** (drone aero/endurance, cold-weather derating, valve
  physics) are first-order engineering heuristics for concept screening.
  They need real CFD/wind-tunnel/icing-tunnel/bench testing before you build
  hardware.
- **Patent drafts** are a starting point for a patent attorney, with a
  keyword-based novelty heuristic against a small local corpus - not a real
  Patentstyret/EPO/USPTO prior-art search. Every draft is flagged
  `attorney_review_required`.
- **PanicSafe / PanicGuard** is a product-and-protocol *concept* generator.
  It is explicitly not a certified medical device; the exported protocol
  says so and points at the real regulatory path (Norway: DMP / EU MDR).
- **MVP Factory** scaffolds real, runnable code (FastAPI + static frontend +
  Dockerfile) with a Stripe Checkout integration that only goes live if you
  supply your own `STRIPE_SECRET_KEY`. With no key it runs in stub mode.
- The **Gonzo-Critique** agent exists specifically to keep the rest of the
  swarm honest: every invention/patent/device output gets hype-word-checked
  and scored before it's presented as more certain than it is.

## Architecture

```
backend/   FastAPI + SQLite swarm kernel, 8 agents, REST API
frontend/  Next.js 15 minimal ROI/Empire dashboard
docker-compose.yml   redis + backend + frontend (+ optional local ollama)
```

### The 8 agents (`backend/app/agents/`)

| Agent | Job |
|---|---|
| `drone_rd` | Kolibri folding-wing / 6DOF hybrid concept + first-order aero/endurance estimate + OpenSCAD CAD export |
| `biomimicry` | Shark-skin riblet anti-icing surface + solar film sizing |
| `arctic_ops` | Applies Svalbard / Ukraine cold-weather + contested-environment constraints |
| `panicsafe` | Breathing-valve orifice physics + patient/PTSD scenario simulation + ADHD/biohacking layer |
| `patent` | Claim drafting (NO + EN) + local prior-art heuristic scan |
| `mvp_factory` | Scaffolds a deployable FastAPI+Stripe product from a validated idea |
| `roi_tracker` | Cost/revenue ledger, per-agent and empire-wide net |
| `gonzo_critique` | Hype-checks every artifact against evidence before it ships |

The **swarm kernel** (`backend/app/orchestrator.py`) is the master
orchestrator: a persistent SQLite task queue, a bounded thread pool (resource
budget), automatic retry with backoff and per-agent failure isolation
(self-healing), a kill switch, and a background tick loop that keeps the
swarm alive 24/7. `backend/app/services.py` chains agents into the two
end-to-end workflows the acceptance criteria describe (drone design cycle,
PanicSafe patient-simulation cycle).

Nothing in the default path makes a network call. `backend/app/llm.py` will
use a local Ollama model if `docker compose --profile ollama up` is running
one; every agent still produces full structured output via deterministic
logic/templates if it isn't.

## Quick start

```bash
./start.sh
# Dashboard: http://localhost:3000
# API:       http://localhost:8000/api/health
```

That's `docker compose up --build -d` under the hood. First build pulls
base images and installs deps, so budget a few minutes on a clean machine
depending on your connection; subsequent starts are seconds.

### Run the two full R&D cycles

```bash
curl -X POST localhost:8000/api/inventions/design-cycle \
  -H 'Content-Type: application/json' -d '{"theater":"svalbard","min_temp_c":-30}'

curl -X POST localhost:8000/api/panicsafe/simulate \
  -H 'Content-Type: application/json' -d '{"scenario_id":"sudden_noise"}'
```

Or without Docker, straight from `backend/` (after `pip install -r
requirements.txt`):

```bash
python scripts/run_design_cycle.py svalbard
python scripts/run_panicsafe_cycle.py sudden_noise
python scripts/backup.py
pytest tests/ -v
```

## API surface

- `GET /api/dashboard` - everything the frontend renders in one call
- `GET/POST /api/swarm/*` - status, submit a raw agent task, kill/resume
- `POST /api/inventions/design-cycle`, `GET /api/inventions`
- `POST /api/panicsafe/simulate`, `GET /api/panicsafe/sessions`
- `GET /api/patents`
- `POST /api/mvp/scaffold`, `GET /api/mvp`
- `GET /api/roi/summary`, `POST /api/roi/record`

## Hardening

- **Kill switch**: `POST /api/swarm/kill` (dashboard has a button too) stops
  the background loop and blocks new task execution; `POST
  /api/swarm/resume` restarts it.
- **Audit log**: every agent dispatch and kernel decision is appended to
  `data/audit.log` (JSON lines); `GET /api/swarm/audit` tails it.
- **Auto-backup**: the running server copies `data/` (the SQLite DB) and
  `products/` (generated MVPs) into a timestamped folder under `backups/`
  every hour; `python scripts/backup.py` runs one on demand.
- **Offline core**: no external API key or network reachability is required
  for any of the 8 agents or the two end-to-end cycles above.

## What's not done / known limits

- Docker builds were validated via `docker compose config`; the actual image
  builds could not be exercised in this sandbox (no Docker daemon available
  here), so verify `./start.sh` on your machine before relying on it.
- Prior-art scanning is a local heuristic, not a live patent-office search -
  wiring in a real search API (Patentstyret/EPO/Google Patents) is the
  natural next step if you want tighter novelty signal.
- Redis is provisioned in `docker-compose.yml` for future queue/cache use
  but the current task queue lives in SQLite, which is sufficient for a
  single-node solopreneur deployment.
