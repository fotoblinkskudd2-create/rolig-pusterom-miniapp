"""Kall-logg i jsonl. Én linje per API-kall. Dette er råstoffet MR ART spiser."""
from __future__ import annotations

import hashlib
import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_lås = threading.Lock()


def prompt_hash(meldinger: list[dict[str, Any]]) -> str:
    rå = json.dumps(meldinger, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return hashlib.sha256(rå).hexdigest()[:16]


def nå_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def skriv(sti: Path, post: dict[str, Any]) -> None:
    sti.parent.mkdir(parents=True, exist_ok=True)
    linje = json.dumps(post, ensure_ascii=False) + "\n"
    with _lås, sti.open("a", encoding="utf-8") as f:
        f.write(linje)
