"""REGNViking OS settings. Offline-first: every default works with zero external services."""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = Path(os.getenv("REGNVIKING_DATA_DIR", BASE_DIR / "data"))
BACKUP_DIR = Path(os.getenv("REGNVIKING_BACKUP_DIR", BASE_DIR / "backups"))
PRODUCTS_DIR = Path(os.getenv("REGNVIKING_PRODUCTS_DIR", BASE_DIR / "products"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "regnviking.db"
AUDIT_LOG_PATH = DATA_DIR / "audit.log"

# Offline-first: no cloud calls unless explicitly enabled and a key/endpoint is present.
OFFLINE_MODE = os.getenv("REGNVIKING_OFFLINE", "1") != "0"
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")
CLOUD_API_KEY = os.getenv("REGNVIKING_CLOUD_API_KEY", "")  # optional, never required

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")  # test-mode key, optional

# Resource budget: caps how much wall-clock/agent-step work the kernel does per tick,
# so the swarm degrades gracefully on small/offline hardware instead of falling over.
MAX_PARALLEL_AGENTS = int(os.getenv("REGNVIKING_MAX_PARALLEL_AGENTS", "4"))
TICK_INTERVAL_SECONDS = float(os.getenv("REGNVIKING_TICK_SECONDS", "5"))
MAX_TASK_RETRIES = int(os.getenv("REGNVIKING_MAX_RETRIES", "3"))
BACKUP_INTERVAL_SECONDS = float(os.getenv("REGNVIKING_BACKUP_SECONDS", "3600"))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
