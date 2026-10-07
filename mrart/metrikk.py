"""Aggregering: per dag og per motor, over et vindu på N dager."""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Any

from .data import Datasett, dag, tid


@dataclass
class Rad:
    dag: date
    motor: str
    kall: int = 0
    feil: int = 0
    kostnad_usd: float = 0.0
    tid_ms: int = 0
    tokens: int = 0
    leveranser: set[str] = field(default_factory=set)
    inngrep: int = 0
    scorer: list[int] = field(default_factory=list)

    @property
    def inngrep_per_leveranse(self) -> float | None:
        return self.inngrep / len(self.leveranser) if self.leveranser else None

    @property
    def snittscore(self) -> float | None:
        return sum(self.scorer) / len(self.scorer) if self.scorer else None


@dataclass
class Sum:
    dager: int
    kall: int = 0
    feil: int = 0
    kostnad_usd: float = 0.0
    tid_ms: int = 0
    leveranser: int = 0
    inngrep: int = 0
    scorer: list[int] = field(default_factory=list)
    motorer: set[str] = field(default_factory=set)

    @property
    def inngrep_per_leveranse(self) -> float | None:
        return self.inngrep / self.leveranser if self.leveranser else None

    @property
    def snittscore(self) -> float | None:
        return sum(self.scorer) / len(self.scorer) if self.scorer else None

    @property
    def kostnad_per_leveranse(self) -> float | None:
        return self.kostnad_usd / self.leveranser if self.leveranser else None

    @property
    def feilrate(self) -> float | None:
        return self.feil / self.kall if self.kall else None


def _i_vindu(ts: str, nå: datetime, dager: int) -> bool:
    return nå - timedelta(days=dager) <= tid(ts) <= nå


def per_dag_motor(d: Datasett, nå: datetime, dager: int) -> list[Rad]:
    rader: dict[tuple[date, str], Rad] = {}

    def rad(dg: date, motor: str) -> Rad:
        return rader.setdefault((dg, motor), Rad(dg, motor))

    for k in d.kall:
        if not _i_vindu(k["ts"], nå, dager):
            continue
        r = rad(dag(k["ts"]), k.get("motor") or "ukjent")
        r.kall += 1
        r.feil += 0 if k.get("ok", True) else 1
        r.kostnad_usd += float(k.get("kostnad_usd") or 0)
        r.tid_ms += int(k.get("latens_ms") or 0)
        r.tokens += int(k.get("tokens_inn") or 0) + int(k.get("tokens_ut") or 0)
        if k.get("run_id"):
            r.leveranser.add(k["run_id"])

    runs = d.run_motor()
    for i in d.inngrep:
        # Inngrep knyttet til en kjøring hører til kjøringens dag og motor, ikke rettedagen.
        run_motor, run_ts = runs.get(i.get("run_id") or "", ("ukjent", i["ts"]))
        if not _i_vindu(run_ts, nå, dager):
            continue
        rad(dag(run_ts), i.get("motor") or run_motor).inngrep += 1

    # Siste score per run vinner — du kan ombestemme deg.
    siste: dict[str, dict[str, Any]] = {}
    for s in sorted(d.scorer, key=lambda s: s["ts"]):
        siste[s["run_id"]] = s
    for rid, s in siste.items():
        motor, run_ts = runs.get(rid, ("ukjent", s["ts"]))
        if _i_vindu(run_ts, nå, dager):
            rad(dag(run_ts), motor).scorer.append(int(s["score"]))

    return sorted(rader.values(), key=lambda r: (r.dag, r.motor))


def summer(rader: list[Rad], dager: int) -> Sum:
    s = Sum(dager)
    lev: set[str] = set()
    for r in rader:
        s.kall += r.kall
        s.feil += r.feil
        s.kostnad_usd += r.kostnad_usd
        s.tid_ms += r.tid_ms
        s.inngrep += r.inngrep
        s.scorer += r.scorer
        lev |= r.leveranser
        if r.kall:
            s.motorer.add(r.motor)
    s.leveranser = len(lev)
    return s


def per_dag(rader: list[Rad], nå: datetime, dager: int) -> list[tuple[date, Sum]]:
    """Én Sum per kalenderdag i vinduet, også tomme dager (nullene skal synes)."""
    start = nå.astimezone().date() - timedelta(days=dager - 1)
    ut = []
    for i in range(dager):
        dg = start + timedelta(days=i)
        ut.append((dg, summer([r for r in rader if r.dag == dg], 1)))
    return ut
