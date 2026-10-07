"""Adapter-mappe for benker. En benk er én fil her med en klasse som oppfyller `Benk`.

Ny benk:
    1. Lag mrart/benker/minbenk.py med en klasse som har `navn` og `vurder(d, nå)`.
    2. Legg den i BENKER under.
Det er alt. status og rapport plukker den opp selv.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Protocol

from ..data import Datasett


@dataclass
class Benkresultat:
    navn: str
    status: str               # kort, STORE BOKSTAVER: LÅST / GLIR / FOR LITE DATA ...
    linje: str                # én setning, uten status-ordet foran
    detaljer: dict[str, Any] = field(default_factory=dict)


class Benk(Protocol):
    navn: str

    def vurder(self, d: Datasett, nå: datetime) -> Benkresultat: ...


from .vibelaas import VibeLaas  # noqa: E402

BENKER: list[Benk] = [VibeLaas()]


def kjør_alle(d: Datasett, nå: datetime) -> list[Benkresultat]:
    return [b.vurder(d, nå) for b in BENKER]
