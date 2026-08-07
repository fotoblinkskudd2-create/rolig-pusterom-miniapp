"""SQLite persistence layer. Single file DB, zero external services required."""
from __future__ import annotations

import json
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator

from app.config import DB_PATH

_local = threading.local()

SCHEMA = """
CREATE TABLE IF NOT EXISTS agents (
    name TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'idle',
    last_tick TEXT,
    failure_count INTEGER NOT NULL DEFAULT 0,
    revenue_nok REAL NOT NULL DEFAULT 0,
    cost_nok REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS memory (
    agent TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (agent, key)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent TEXT NOT NULL,
    kind TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    result TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    summary TEXT NOT NULL,
    spec_json TEXT NOT NULL,
    simulation_json TEXT,
    cad_export_path TEXT,
    status TEXT NOT NULL DEFAULT 'concept',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invention_id INTEGER,
    title TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    claims_json TEXT NOT NULL,
    prior_art_json TEXT NOT NULL,
    novelty_risk TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    FOREIGN KEY (invention_id) REFERENCES inventions (id)
);

CREATE TABLE IF NOT EXISTS panicsafe_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario TEXT NOT NULL,
    valve_params_json TEXT NOT NULL,
    patient_profile_json TEXT NOT NULL,
    outcome_json TEXT NOT NULL,
    protocol_md TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    scaffold_path TEXT NOT NULL,
    stripe_ready INTEGER NOT NULL DEFAULT 0,
    deployed_url TEXT,
    status TEXT NOT NULL DEFAULT 'scaffolded',
    created_at TEXT NOT NULL,
    deadline_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roi_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    agent TEXT NOT NULL,
    kind TEXT NOT NULL,
    amount_nok REAL NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kill_switch (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    engaged INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    updated_at TEXT
);
"""


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_conn() -> sqlite3.Connection:
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        _local.conn = conn
    return conn


def init_db() -> None:
    conn = get_conn()
    conn.executescript(SCHEMA)
    conn.execute(
        "INSERT OR IGNORE INTO kill_switch (id, engaged, reason, updated_at) VALUES (1, 0, NULL, ?)",
        (now(),),
    )
    conn.commit()


@contextmanager
def tx() -> Iterator[sqlite3.Connection]:
    conn = get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row is not None else None


def dumps(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, default=str)


def loads(text: str | None) -> Any:
    if not text:
        return None
    return json.loads(text)
