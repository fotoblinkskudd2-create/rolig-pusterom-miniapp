"""Per-agent persistent key/value memory backed by SQLite. Survives restarts."""
from __future__ import annotations

from typing import Any

from app.db import dumps, get_conn, loads, now, tx


def remember(agent: str, key: str, value: Any) -> None:
    with tx() as conn:
        conn.execute(
            """INSERT INTO memory (agent, key, value, updated_at) VALUES (?, ?, ?, ?)
               ON CONFLICT(agent, key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at""",
            (agent, key, dumps(value), now()),
        )


def recall(agent: str, key: str, default: Any = None) -> Any:
    row = get_conn().execute(
        "SELECT value FROM memory WHERE agent = ? AND key = ?", (agent, key)
    ).fetchone()
    return loads(row["value"]) if row else default


def recall_all(agent: str) -> dict[str, Any]:
    rows = get_conn().execute("SELECT key, value FROM memory WHERE agent = ?", (agent,)).fetchall()
    return {r["key"]: loads(r["value"]) for r in rows}
