"""Datamodell for idéer i Stille Verksted-simuleringen.

Alle tall i en Idea er hypoteser (estimater), ikke målte data.
Verdiene skal erstattes av kilder, prisintervjuer og prototypetester.
"""
from __future__ import annotations

import copy
from dataclasses import dataclass, field

AVAILABILITY = ("høy", "middels", "lav")


@dataclass
class Component:
    name: str
    availability: str  # "høy" | "middels" | "lav"

    def __post_init__(self) -> None:
        if self.availability not in AVAILABILITY:
            raise ValueError(f"ukjent tilgjengelighet: {self.availability!r}")


@dataclass
class Idea:
    name: str
    pitch: str
    form: str                      # fysisk form, f.eks. "lampe", "kort", "kabinett"
    differentiators: list[str]     # særtrekk som skiller idéen fra kategorien
    components: list[Component]
    unit_cost: float               # NOK per enhet (estimat)
    price: float                   # NOK (hypotese om betalingsvilje)
    competitors: int               # antall direkte konkurrenter (hypotese)
    segment_score: float           # 0-10: hypotese om segmentets størrelse og kjøpskraft
    dev_months: float              # måneder til første test med ekte brukere
    reg_risk: int                  # 0-3: juridisk/etisk risiko (helsepåstander, personvern)
    recurring: bool = False        # gjentakende inntekt?
    scalable: bool = False         # skalerer uten lineær kostnad?
    history: list[str] = field(default_factory=list)

    def clone(self) -> "Idea":
        return copy.deepcopy(self)
