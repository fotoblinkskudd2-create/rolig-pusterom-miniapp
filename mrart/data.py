"""Leser og skriver MR ARTs råstoff. Alt er append-only jsonl."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

STANDARD_LOGGMAPPE = Path("logs")


def _les_jsonl(sti: Path) -> list[dict[str, Any]]:
    if not sti.is_file():
        return []
    ut = []
    for nr, linje in enumerate(sti.read_text(encoding="utf-8").splitlines(), 1):
        if not linje.strip():
            continue
        try:
            ut.append(json.loads(linje))
        except json.JSONDecodeError:
            # En ødelagt linje skal ikke drepe målingen. Den telles ikke, men vi sier fra.
            print(f"[mrart] hopper over ødelagt linje {nr} i {sti}")
    return ut


def _skriv_jsonl(sti: Path, post: dict[str, Any]) -> None:
    sti.parent.mkdir(parents=True, exist_ok=True)
    with sti.open("a", encoding="utf-8") as f:
        f.write(json.dumps(post, ensure_ascii=False) + "\n")


def tid(ts: str) -> datetime:
    t = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    return t if t.tzinfo else t.replace(tzinfo=timezone.utc)


def dag(ts: str) -> date:
    """Lokal kalenderdag — det er den jeg lever i, ikke UTC."""
    return tid(ts).astimezone().date()


def nå_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


@dataclass
class Datasett:
    kall: list[dict[str, Any]] = field(default_factory=list)
    inngrep: list[dict[str, Any]] = field(default_factory=list)
    scorer: list[dict[str, Any]] = field(default_factory=list)

    @classmethod
    def les(cls, mappe: Path = STANDARD_LOGGMAPPE) -> "Datasett":
        return cls(
            kall=_les_jsonl(mappe / "kall.jsonl"),
            inngrep=_les_jsonl(mappe / "inngrep.jsonl"),
            scorer=_les_jsonl(mappe / "score.jsonl"),
        )

    def run_motor(self) -> dict[str, tuple[str, str]]:
        """run_id → (motor, første ts). Brukes for å plassere scorer og inngrep."""
        ut: dict[str, tuple[str, str]] = {}
        for k in sorted(self.kall, key=lambda k: k.get("ts", "")):
            rid = k.get("run_id")
            if rid and rid not in ut:
                ut[rid] = (k.get("motor") or "ukjent", k["ts"])
        return ut


def registrer_inngrep(tekst: str, *, motor: str | None = None, run_id: str | None = None,
                      mappe: Path = STANDARD_LOGGMAPPE) -> dict[str, Any]:
    if not tekst.strip():
        raise ValueError("Et inngrep uten beskrivelse er ikke målbart. Skriv hva du rettet.")
    post = {"ts": nå_iso(), "tekst": tekst.strip(), "motor": motor, "run_id": run_id}
    _skriv_jsonl(mappe / "inngrep.jsonl", post)
    return post


def registrer_score(run_id: str, score: int, *, mappe: Path = STANDARD_LOGGMAPPE) -> dict[str, Any]:
    if not 1 <= score <= 5:
        raise ValueError("Score må være 1–5.")
    post = {"ts": nå_iso(), "run_id": run_id, "score": score}
    _skriv_jsonl(mappe / "score.jsonl", post)
    return post
