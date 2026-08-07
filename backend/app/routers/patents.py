from __future__ import annotations

from fastapi import APIRouter

from app.db import get_conn, loads

router = APIRouter(prefix="/api/patents", tags=["patents"])


@router.get("")
def list_patents():
    rows = get_conn().execute("SELECT * FROM patents ORDER BY id DESC").fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["claims_json"] = loads(d["claims_json"])
        d["prior_art_json"] = loads(d["prior_art_json"])
        out.append(d)
    return {"patents": out}
