import type { Migration } from '../core/db.js';

// Sletting: en oppgave kan bare slettes permanent etter arkivering.
// Tilhørende fokusøkter slettes da også (ON DELETE CASCADE).
export const migrations: Migration[] = [
  {
    id: 'focusdump_001_oppgaver_og_okter',
    sql: `
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 200),
        position INTEGER NOT NULL,
        estimate_minutes INTEGER NOT NULL CHECK (estimate_minutes BETWEEN 1 AND 120),
        state TEXT NOT NULL CHECK (state IN ('inbox','ready','active','paused','done')),
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1
      );
      CREATE INDEX tasks_owner_state ON tasks(owner_id, state, position);

      CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        duration_s INTEGER NOT NULL CHECK (duration_s BETWEEN 60 AND 7200),
        started_at TEXT NOT NULL,
        paused_at TEXT,
        paused_ms INTEGER NOT NULL DEFAULT 0 CHECK (paused_ms >= 0),
        finished_at TEXT,
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1
      );
      CREATE INDEX sessions_task ON focus_sessions(task_id);
      CREATE INDEX sessions_owner_started ON focus_sessions(owner_id, started_at);
    `
  }
];
