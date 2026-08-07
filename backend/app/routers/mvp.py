from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.db import get_conn
from app.orchestrator import get_kernel

router = APIRouter(prefix="/api/mvp", tags=["mvp"])


class ScaffoldRequest(BaseModel):
    idea: str
    title: str | None = None
    price_nok: int = 199


@router.get("")
def list_mvps():
    rows = get_conn().execute("SELECT * FROM mvps ORDER BY id DESC").fetchall()
    return {"mvps": [dict(r) for r in rows]}


@router.post("/scaffold")
def scaffold(req: ScaffoldRequest):
    kernel = get_kernel()
    task = kernel.run_sync(
        "mvp_factory", "scaffold",
        {"idea": req.idea, "title": req.title or req.idea[:60], "price_nok": req.price_nok},
    )
    result = task["result"]
    kernel.run_sync(
        "roi_tracker", "record",
        {
            "source": f"mvp:{result['slug']}",
            "agent": "mvp_factory",
            "kind": "cost",
            "amount_nok": 0,
            "note": "scaffold generated, no spend yet",
        },
    )
    return result
