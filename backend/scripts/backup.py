#!/usr/bin/env python3
"""Manual on-demand IP backup (the running server also does this hourly)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import init_db  # noqa: E402
from app.backup import run_backup  # noqa: E402

if __name__ == "__main__":
    init_db()
    path = run_backup()
    print(f"Backup written to: {path}")
