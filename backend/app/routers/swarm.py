from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.audit import tail
from app.orchestrator import get_kernel

router = APIRouter(prefix="/api/swarm", tags=["swarm"])


class TaskRequest(BaseModel):
    agent: str
    kind: str
    payload: dict = {}


class KillRequest(BaseModel):
    reason: str = "manual kill switch"


@router.get("/status")
def status():
    kernel = get_kernel()
    return {
        "killed": kernel.is_killed(),
        "agents": kernel.agent_status(),
    }


@router.get("/audit")
def audit(n: int = 100):
    return {"entries": tail(n)}


@router.post("/tasks")
def submit_task(req: TaskRequest):
    kernel = get_kernel()
    if req.agent not in kernel.agents:
        raise HTTPException(status_code=404, detail=f"unknown agent: {req.agent}")
    task_id = kernel.submit(req.agent, req.kind, req.payload)
    return {"task_id": task_id}


@router.get("/tasks/{task_id}")
def get_task(task_id: int):
    kernel = get_kernel()
    task = kernel.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return task


@router.post("/kill")
def kill(req: KillRequest):
    get_kernel().engage_kill_switch(req.reason)
    return {"killed": True, "reason": req.reason}


@router.post("/resume")
def resume():
    kernel = get_kernel()
    kernel.disengage_kill_switch()
    kernel.start_background_loop()
    return {"killed": False}
