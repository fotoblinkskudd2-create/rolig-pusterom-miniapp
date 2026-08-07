"""REGNViking OS API entrypoint. `uvicorn app.main:app` starts the swarm and stays alive."""
from __future__ import annotations

import os
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.audit import log
from app.backup import start_backup_loop
from app.config import OFFLINE_MODE
from app.db import init_db
from app.llm import ollama_available
from app.orchestrator import get_kernel
from app.routers import dashboard, inventions, mvp, panicsafe, patents, roi, swarm


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    kernel = get_kernel()
    kernel.start_background_loop()
    start_backup_loop()
    log("kernel", "startup", {"offline_mode": OFFLINE_MODE, "ollama_available": ollama_available()})
    yield
    kernel.stop_background_loop()
    log("kernel", "shutdown", {})


app = FastAPI(title="REGNViking OS", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("REGNVIKING_CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(swarm.router)
app.include_router(inventions.router)
app.include_router(panicsafe.router)
app.include_router(patents.router)
app.include_router(mvp.router)
app.include_router(roi.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "offline_mode": OFFLINE_MODE, "threads": threading.active_count()}
