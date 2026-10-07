"""Innstillinger fra miljøet. Leser .env selv, så vi slipper python-dotenv."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


class KonfigFeil(RuntimeError):
    pass


def les_dotenv(sti: str | Path = ".env") -> None:
    """Fyll os.environ fra .env uten å overskrive det som allerede er satt."""
    p = Path(sti)
    if not p.is_file():
        return
    for linje in p.read_text(encoding="utf-8").splitlines():
        linje = linje.strip()
        if not linje or linje.startswith("#") or "=" not in linje:
            continue
        nøkkel, verdi = linje.split("=", 1)
        verdi = verdi.strip().strip('"').strip("'")
        if verdi:
            os.environ.setdefault(nøkkel.strip(), verdi)


def _flyt(navn: str, standard: float) -> float:
    rå = os.environ.get(navn, "").strip()
    return float(rå) if rå else standard


@dataclass(frozen=True)
class Innstillinger:
    api_key: str
    modell: str
    base_url: str = "https://api.x.ai/v1"
    timeout_s: float = 60.0
    pris_inn_per_m: float = 0.0
    pris_ut_per_m: float = 0.0
    loggsti: Path = Path("logs/kall.jsonl")

    @classmethod
    def fra_miljo(cls, dotenv: str | Path | None = ".env") -> "Innstillinger":
        if dotenv:
            les_dotenv(dotenv)
        api_key = os.environ.get("XAI_API_KEY", "").strip()
        modell = os.environ.get("XAI_MODEL", "").strip()
        if not api_key:
            raise KonfigFeil("XAI_API_KEY mangler. Se .env.example.")
        if not modell:
            raise KonfigFeil("XAI_MODEL mangler. Sjekk gjeldende navn på docs.x.ai og sett det i .env.")
        return cls(
            api_key=api_key,
            modell=modell,
            base_url=os.environ.get("XAI_BASE_URL", "").strip() or "https://api.x.ai/v1",
            timeout_s=_flyt("XAI_TIMEOUT_S", 60.0),
            pris_inn_per_m=_flyt("XAI_PRIS_INN_PER_M", 0.0),
            pris_ut_per_m=_flyt("XAI_PRIS_UT_PER_M", 0.0),
            loggsti=Path(os.environ.get("GROKKJERNE_LOGG", "").strip() or "logs/kall.jsonl"),
        )

    def kostnad(self, tokens_inn: int, tokens_ut: int) -> float:
        return (tokens_inn * self.pris_inn_per_m + tokens_ut * self.pris_ut_per_m) / 1_000_000
