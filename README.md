# Reconnect — a game for two

A playful, mobile-first web app that helps couples reconnect through
structured, gamified conversation: answer thoughtful prompts together, earn
points and badges, and walk away with a short, editable action plan.

Built as an installable PWA (works offline after first load, iOS Safari
compatible) with a React frontend and a small Express + SQLite backend.

## Architecture

```
┌─────────────────────┐        HTTP (JSON)        ┌──────────────────────┐
│   React frontend     │ ───────────────────────▶ │  Express API server   │
│   (Vite, port 5173)  │ ◀─────────────────────── │   (port 4000)         │
└─────────────────────┘                            └──────────┬───────────┘
                                                                │
                                                                ▼
                                                        ┌───────────────┐
                                                        │ SQLite (file)  │
                                                        │ better-sqlite3 │
                                                        └───────────────┘
```

**Data flow:** each browser stores its own `roomId` + `userId` in
`localStorage` (no accounts). Two partners share a 5-character join code.
Answering a question is turn-based per round: both partners submit an
answer to the current question; once both are in, the round is "revealed"
to both devices (polling every 2.5s) and the session advances. When the
last question is answered, the server deterministically generates a
3-step action plan by tallying the categories of the session's questions
and pulling from a curated per-category template list — no external AI
calls.

**Component hierarchy (frontend):**

```
main.jsx
└─ CoupleProvider (roomId/userId in localStorage, partner lookup)
   └─ App (screen state machine: home | session | plan | history)
      ├─ Onboarding        — create room / join by code
      ├─ Home              — join code, partner status, badge, start/resume session
      ├─ Session           — QuestionCard, ProgressDots, RevealCard, polling
      ├─ PlanScreen        — editable 3-step plan, save
      └─ History           — past sessions + their plans
      NavBar               — Home / History tabs
```

**Backend routes:**

- `POST /api/rooms` — create a room + first user, returns a join code
- `GET /api/rooms/by-code/:code`, `POST /api/rooms/by-code/:code/join`
- `GET /api/rooms/:roomId` / `/points` / `/active-session` / `/history`
- `POST /api/sessions` (starts, or resumes an already-active session)
- `GET /api/sessions/:id`, `POST /api/sessions/:id/answers`
- `GET/PUT /api/plans/:id`
- `GET /api/questions`

Data model (SQLite): `rooms`, `users`, `questions`, `sessions`, `answers`,
`plans`. See `server/db.js` for the schema.

## Features

- **Onboarding & couple linking** — one partner creates a room and gets a
  5-character join code; the other joins with it. No passwords.
- **Question bank** — 30 curated, non-accusatory, open-ended,
  recovery-focused questions across 6 categories (communication,
  appreciation, quality time, trust repair, emotional safety, future
  vision). See `server/data/questions.js`.
- **Gamified interaction** — a 5-question session per round; each answer
  earns points, finishing a session earns a bonus, and points unlock badge
  tiers and playful date-night ideas.
- **Idea & plan generator** — after each session, a rule-based 3-step
  action plan is generated from the categories you both touched on. Fully
  editable (rewrite steps, add/remove, check off) and saved to the room.
- **Session history** — every session and its plan is stored and
  revisitable from the History tab.
- **PWA / offline shell** — installable on iOS via "Add to Home Screen";
  a service worker caches the app shell so it loads offline (live data
  still needs a connection).

## Running locally

Requires Node 18+.

```bash
npm install
npm run seed     # one-time: seeds the 30 questions into server/data/relationship.db
npm run server   # starts the API on http://localhost:4000
npm start        # in a second terminal: starts the frontend on http://localhost:5173
```

Open `http://localhost:5173` on two devices (or two browser
profiles/tabs) on the same network — or just two tabs — to play as both
partners. The Vite dev server proxies `/api/*` to the backend, so no
extra config is needed.

The question bank also auto-seeds the first time `npm run server` runs
against an empty database, so `npm run seed` is optional but handy if you
want to reset/reseed explicitly.

Other scripts:

```bash
npm run dev       # runs frontend + backend together (via concurrently)
npm run build     # production frontend build (dist/)
npm run preview   # preview the production build
```

## Notes on constraints

- No authentication beyond the join code; no external APIs are called —
  the plan generator and reward ideas are all local, rule-based content.
- SQLite is a single file at `server/data/relationship.db` (git-ignored).
  Nothing drops tables or deletes rooms/answers/plans automatically.
