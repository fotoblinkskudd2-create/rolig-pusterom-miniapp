from __future__ import annotations

from fastapi import APIRouter

from app.db import get_conn
from app.orchestrator import get_kernel

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def dashboard():
    kernel = get_kernel()
    conn = get_conn()

    inventions = conn.execute(
        "SELECT id, title, domain, status, created_at FROM inventions ORDER BY id DESC LIMIT 20"
    ).fetchall()
    patents = conn.execute(
        "SELECT id, title, jurisdiction, novelty_risk, status, created_at FROM patents ORDER BY id DESC LIMIT 20"
    ).fetchall()
    mvps = conn.execute(
        "SELECT id, idea, slug, status, deadline_at, created_at FROM mvps ORDER BY id DESC LIMIT 20"
    ).fetchall()
    panicsafe = conn.execute(
        "SELECT id, scenario, created_at FROM panicsafe_sessions ORDER BY id DESC LIMIT 20"
    ).fetchall()

    roi = kernel.run_sync("roi_tracker", "summary", {})["result"]

    return {
        "killed": kernel.is_killed(),
        "agents": kernel.agent_status(),
        "roi": roi,
        "inventions": [dict(r) for r in inventions],
        "patents": [dict(r) for r in patents],
        "mvps": [dict(r) for r in mvps],
        "panicsafe_sessions": [dict(r) for r in panicsafe],
    }
