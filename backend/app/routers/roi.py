from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.orchestrator import get_kernel

router = APIRouter(prefix="/api/roi", tags=["roi"])


class RecordRequest(BaseModel):
    source: str
    agent: str = "unassigned"
    kind: str = "cost"  # cost | revenue
    amount_nok: float
    note: str = ""


@router.get("/summary")
def summary():
    return get_kernel().run_sync("roi_tracker", "summary", {})["result"]


@router.post("/record")
def record(req: RecordRequest):
    return get_kernel().run_sync("roi_tracker", "record", req.model_dump())["result"]
