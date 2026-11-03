"""Startidéer for Stille Verksted.

Tallene er hypoteser som skal testes. De er ikke markedsdata.
"""
from __future__ import annotations

from .model import Component as C
from .model import Idea


def seed_ideas() -> list[Idea]:
    return [
        Idea(
            name="Pust-lampen",
            pitch="En lampe som puster i ditt tempo. Ingen skjerm, ingen konto, ingen sky.",
            form="lampe",
            # Ingen sensor: skiller seg fra Ohm Resonance Lamp, som måler hjerterytme.
            differentiators=["ingen skjerm", "lokal-først", "fysisk objekt", "ingen biometri"],
            components=[
                C("LED-ring", "høy"),
                C("mikrokontroller", "høy"),
                C("batteri", "høy"),
                C("kabinett i tre", "middels"),
                C("berøringsknapp", "høy"),
            ],
            unit_cost=380,
            price=990,
            # Oppdatert etter markedssøk: Ohm Resonance Lamp, sub-20 USD pustlamper
            # og Rainlax Breathing Owl. Hypotese, ikke telling.
            competitors=9,
            segment_score=6,
            dev_months=8,
            reg_risk=1,
            recurring=False,
            scalable=True,
        ),
        Idea(
            name="Små grep-kortstokken",
            pitch="40 små handlinger på kort som passer i lomma. Trekk ett, gjør det, legg det tilbake.",
            form="kort",
            differentiators=["fysisk", "lokal-først"],
            components=[
                C("korttrykk", "høy"),
                C("eske", "høy"),
            ],
            unit_cost=45,
            price=199,
            competitors=15,
            segment_score=7,
            dev_months=2,
            reg_risk=0,
            recurring=False,
            scalable=True,
        ),
        Idea(
            name="Lokal sjekk-inn-enhet (klinikk)",
            pitch="En skjermløs enhet der pasienten sjekker inn i stillhet. Data blir på klinikkens egen maskin.",
            form="kabinett",
            differentiators=["ingen sky", "lokal-først", "skjermløs for pasient", "eksport"],
            components=[
                C("skjerm", "middels"),
                C("sensor", "lav"),
                C("mikrokontroller", "høy"),
                C("batteri", "høy"),
                C("kabinett i metall", "middels"),
                C("sikkerhetsmodul", "lav"),
            ],
            unit_cost=900,
            price=3500,
            competitors=4,
            segment_score=8,
            dev_months=14,
            reg_risk=3,
            recurring=True,
            scalable=False,
        ),
        Idea(
            name="Pausekontor-kit",
            pitch="Et bord-objekt for arbeidsplasser: ett trykk gir en minute med rolig lys og pust. Ingen persondata.",
            form="kabinett",
            differentiators=["fysisk", "ingen persondata"],
            components=[
                C("skjerm", "middels"),
                C("LED-ring", "høy"),
                C("mikrokontroller", "høy"),
                C("kabinett i tre", "middels"),
            ],
            unit_cost=700,
            price=2200,
            competitors=12,
            segment_score=6,
            dev_months=9,
            reg_risk=0,
            recurring=True,
            scalable=True,
        ),
    ]
