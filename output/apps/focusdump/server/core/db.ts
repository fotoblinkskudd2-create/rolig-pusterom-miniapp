// FELLES KJERNE – lik i alle apper. Endre bare via felles mal.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Db = DatabaseSync;
export type SqlValue = string | number | bigint | null | Uint8Array;
export type Row = Record<string, SqlValue>;

export interface Migration {
  id: string;
  sql: string;
}

const CORE_MIGRATIONS: Migration[] = [
  {
    id: 'core_001_konto_og_okter',
    sql: `
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
      CREATE INDEX sessions_user ON sessions(user_id);
      CREATE TABLE op_log (
        owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        op_id TEXT NOT NULL,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        status INTEGER NOT NULL,
        response TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (owner_id, op_id)
      );
    `
  }
];

export function openDb(file: string, appMigrations: Migration[]): Db {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const applied = new Set(
    (db.prepare('SELECT id FROM schema_migrations').all() as Row[]).map((r) => String(r.id))
  );
  for (const m of [...CORE_MIGRATIONS, ...appMigrations]) {
    if (applied.has(m.id)) continue;
    tx(db, () => {
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)').run(m.id, now());
    });
  }
  return db;
}

/** Kjører fn i én skrivetransaksjon. Alt eller ingenting. */
export function tx<T>(db: Db, fn: () => T): T {
  if (db.isTransaction) return fn();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function now(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
}
