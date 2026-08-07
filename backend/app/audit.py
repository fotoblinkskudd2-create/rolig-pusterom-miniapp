"""Append-only audit log. Every agent action and kernel decision is written here."""
from __future__ import annotations

import json
import threading

from app.config import AUDIT_LOG_PATH
from app.db import now

_lock = threading.Lock()


def log(actor: str, action: str, detail: dict | None = None) -> None:
    entry = {"ts": now(), "actor": actor, "action": action, "detail": detail or {}}
    line = json.dumps(entry, ensure_ascii=False, default=str)
    with _lock:
        with open(AUDIT_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line + "\n")


def tail(n: int = 100) -> list[dict]:
    if not AUDIT_LOG_PATH.exists():
        return []
    with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()[-n:]
    return [json.loads(line) for line in lines if line.strip()]
