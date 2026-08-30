"""Atomic, corruption-tolerant JSON persistence for Pusterom CLI state."""
from __future__ import annotations

import json
import logging
import os
import tempfile
from datetime import datetime
from pathlib import Path

from .models import State

logger = logging.getLogger("pusterom.storage")

DEFAULT_DATA_FILE = Path("pusterom_data.json")


def load(path: Path = DEFAULT_DATA_FILE) -> State:
    """Load state from disk, recovering gracefully from a missing or corrupt file."""
    if not path.exists():
        logger.info("Ingen datafil funnet på %s, starter med tomt state.", path)
        return State()
    try:
        raw = path.read_text(encoding="utf-8")
        data = json.loads(raw)
        return State.from_dict(data)
    except (json.JSONDecodeError, OSError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Datafil %s er skadet (%s). Sikkerhetskopierer og starter på nytt.", path, exc)
        _quarantine_corrupt_file(path)
        return State()


def _quarantine_corrupt_file(path: Path) -> None:
    if not path.exists():
        return
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = path.with_suffix(path.suffix + f".corrupt-{stamp}")
    try:
        path.rename(backup)
        logger.warning("Skadet fil flyttet til %s", backup)
    except OSError as exc:
        logger.error("Klarte ikke å sikkerhetskopiere skadet fil: %s", exc)


def save(state: State, path: Path = DEFAULT_DATA_FILE) -> None:
    """Write state to disk atomically (write to a temp file, then rename)."""
    parent = path.parent if str(path.parent) else Path(".")
    parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(state.to_dict(), ensure_ascii=False, indent=2)
    fd, tmp_name = tempfile.mkstemp(prefix=".pusterom-", suffix=".tmp", dir=str(parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(payload)
        os.replace(tmp_name, path)
    except OSError as exc:
        logger.error("Klarte ikke å lagre til %s: %s", path, exc)
        if os.path.exists(tmp_name):
            os.remove(tmp_name)
        raise
