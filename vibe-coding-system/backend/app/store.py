"""Lagringslag.

`InMemoryStore` speiler transaksjonsmønsteret i Postgres-implementasjonen (db/schema.sql):
alt i én `transaction()` skrives sammen eller ingenting skrives. I Postgres blir dette
`BEGIN; SET LOCAL app.actor = ...; ... COMMIT;` med radnivå-sikkerhet (RLS) per terapeut.
"""
from __future__ import annotations

import copy
import json
import threading
from contextlib import contextmanager
from pathlib import Path
from uuid import UUID

from .models import AuditEvent, Contact, Observation, VibeCode

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "vibe_codes.json"


class InMemoryStore:
    def __init__(self):
        self._lock = threading.RLock()
        # Versjonshistorikk: kode-id -> liste av versjoner. Siste er gjeldende.
        self.vibe_codes: dict[str, list[VibeCode]] = {}
        self.contacts: dict[UUID, Contact] = {}
        self.observations: dict[UUID, list[Observation]] = {}
        self.audit: list[AuditEvent] = []
        self.vectors: dict[UUID, list[float]] = {}

    @contextmanager
    def transaction(self):
        with self._lock:
            snapshot = copy.deepcopy((self.vibe_codes, self.contacts, self.observations, self.vectors))
            try:
                yield self
            except Exception:
                self.vibe_codes, self.contacts, self.observations, self.vectors = snapshot
                raise

    def seed(self, path: Path = DATA_FILE):
        raw = json.loads(path.read_text(encoding="utf-8"))
        with self.transaction():
            for c in raw["codes"]:
                self.vibe_codes[c["id"]] = [VibeCode(**c)]

    def current_codes(self) -> list[VibeCode]:
        return [versions[-1] for versions in self.vibe_codes.values()]

    def code(self, code_id: str, version: int | None = None) -> VibeCode | None:
        versions = self.vibe_codes.get(code_id)
        if not versions:
            return None
        if version is None:
            return versions[-1]
        return next((v for v in versions if v.version == version), None)

    def append_audit(self, event: AuditEvent):
        # Audit skrives utenfor forretningstransaksjonen: også avviste forsøk skal logges.
        with self._lock:
            self.audit.append(event)
