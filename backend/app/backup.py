"""Auto-backup of all IP: SQLite DB (inventions, patents, panicsafe, ROI) + generated
CAD/product artifacts. Runs on a timer and is also callable on demand / from the CLI."""
from __future__ import annotations

import shutil
import threading
from datetime import datetime, timezone

from app.audit import log
from app.config import BACKUP_DIR, BACKUP_INTERVAL_SECONDS, BASE_DIR, DATA_DIR, PRODUCTS_DIR

_stop = threading.Event()
_thread: threading.Thread | None = None


def run_backup() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = BACKUP_DIR / stamp
    target.mkdir(parents=True, exist_ok=True)

    if DATA_DIR.exists():
        shutil.copytree(DATA_DIR, target / "data", dirs_exist_ok=True)
    if PRODUCTS_DIR.exists():
        shutil.copytree(PRODUCTS_DIR, target / "products", dirs_exist_ok=True)

    try:
        rel = str(target.relative_to(BASE_DIR))
    except ValueError:
        rel = str(target)
    log("kernel", "backup.completed", {"path": rel})
    return rel


def start_backup_loop() -> None:
    global _thread
    if _thread and _thread.is_alive():
        return

    def _loop() -> None:
        while not _stop.is_set():
            try:
                run_backup()
            except Exception as exc:  # noqa: BLE001 -- backup loop must never crash the kernel
                log("kernel", "backup.error", {"error": str(exc)})
            _stop.wait(BACKUP_INTERVAL_SECONDS)

    _thread = threading.Thread(target=_loop, daemon=True, name="backup-loop")
    _thread.start()


def stop_backup_loop() -> None:
    _stop.set()
