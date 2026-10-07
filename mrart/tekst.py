"""Formatering for terminalen. Kort status først, tabell etterpå."""
from __future__ import annotations

from .benker import Benkresultat
from .metrikk import Rad, Sum


def tall(v: float | None, fmt: str = "{:.2f}") -> str:
    return "–" if v is None else fmt.format(v)


def kort_status(uke: Sum, benker: list[Benkresultat]) -> list[str]:
    linje1 = (f"MR ART · {uke.dager}d: {uke.kall} kall · ${uke.kostnad_usd:.2f} · "
              f"{uke.tid_ms / 60000:.1f} min Grok-tid · {uke.leveranser} leveranser")
    linje2 = (f"Inngrep: {uke.inngrep} ({tall(uke.inngrep_per_leveranse, '{:.1f}')} per leveranse) · "
              f"snittscore {tall(uke.snittscore, '{:.1f}')} · motorer: {', '.join(sorted(uke.motorer)) or 'ingen'}")
    linje3 = " · ".join(f"{b.navn}: {b.status} — {b.linje}" for b in benker) or "Ingen benker registrert."
    return [linje1, linje2, linje3]


KOLONNER = ["dag", "motor", "kall", "feil", "kostnad $", "tid s", "lev", "inngrep", "inngr/lev", "score"]


def tabellrader(rader: list[Rad]) -> list[list[str]]:
    return [[r.dag.isoformat(), r.motor, str(r.kall), str(r.feil), f"{r.kostnad_usd:.4f}",
             f"{r.tid_ms / 1000:.1f}", str(len(r.leveranser)), str(r.inngrep),
             tall(r.inngrep_per_leveranse, "{:.1f}"), tall(r.snittscore, "{:.1f}")] for r in rader]


def tabell(rader: list[Rad]) -> str:
    data = [KOLONNER] + tabellrader(rader)
    if len(data) == 1:
        return "(ingen data i vinduet — kjør en motor, så har benken noe å se på)"
    bredder = [max(len(rad[i]) for rad in data) for i in range(len(KOLONNER))]
    linjer = ["  ".join(c.ljust(b) for c, b in zip(rad, bredder)).rstrip() for rad in data]
    linjer.insert(1, "  ".join("-" * b for b in bredder))
    return "\n".join(linjer)
