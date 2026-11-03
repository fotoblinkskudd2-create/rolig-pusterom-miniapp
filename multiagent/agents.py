"""Spesialiserte agenter. Hver agent vurderer én idé ut fra sin ekspertise.

Agentene er regelbaserte og gjennomsiktige: hver skåre kan spores til en regel.
De kan byttes ut med LLM-baserte agenter senere uten å endre orkestreringen,
så lenge de returnerer en Assessment.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from .model import Idea


def clamp(x: float, lo: float = 0.0, hi: float = 10.0) -> float:
    return max(lo, min(hi, x))


@dataclass
class Assessment:
    agent: str
    score: float                      # 0-10
    objections: list[str] = field(default_factory=list)
    fix: Optional[str] = None         # nøkkel i revision.FIXES, eller None


class Agent:
    name = "agent"
    dimension = "ukjent"

    def assess(self, idea: Idea) -> Assessment:  # pragma: no cover - abstrakt
        raise NotImplementedError


class Ideegenerator(Agent):
    """Kreativ idéutvikling: hvor mye skiller idéen seg fra kategorien?"""
    name = "Ideegenerator"
    dimension = "kreativitet"

    def assess(self, idea: Idea) -> Assessment:
        unique = len(set(idea.differentiators))
        score = clamp(3 + 1.5 * unique - 0.3 * idea.competitors)
        objections = []
        fix = None
        if unique < 3:
            objections.append("Færre enn tre særtrekk. Lite skiller idéen fra kategorien.")
        if idea.competitors >= 8:
            objections.append("Kategorien er mettet. Særtrekkene må bære hele tyngden.")
        if score < 5:
            fix = "differensier"
        return Assessment(self.name, score, objections, fix)


class Industridesigner(Agent):
    """Form, enkelhet og ro. Et objekt for stillhet skal ikke ha unødvendig teknikk."""
    name = "Industridesigner"
    dimension = "kreativitet"

    def assess(self, idea: Idea) -> Assessment:
        n = len(idea.components)
        score = 9 - 0.8 * max(0, n - 4)
        objections = []
        fix = None
        has_screen = any("skjerm" in c.name for c in idea.components)
        if idea.form == "lampe" and has_screen:
            score -= 1.5
            objections.append("Skjerm i en lampe bryter ideen om stillhet.")
        if n > 4:
            objections.append("For mange komponenter for et enkelt objekt.")
            fix = "forenkle"
        return Assessment(self.name, clamp(score), objections, fix)


class Tekniker(Agent):
    """Teknisk gjennomførbarhet: utviklingstid og komponenttilgang."""
    name = "Tekniker"
    dimension = "gjennomforbarhet"

    def assess(self, idea: Idea) -> Assessment:
        lav = sum(c.availability == "lav" for c in idea.components)
        middels = sum(c.availability == "middels" for c in idea.components)
        score = 10 - max(0, idea.dev_months - 6) - 1.5 * lav - 0.5 * middels
        objections = []
        fix = None
        if idea.dev_months > 6:
            objections.append("Over 6 måneder til første leveranse. Risiko for at ideen dør i utviklingen.")
            fix = "kutt_scope"
        if lav:
            objections.append(f"{lav} komponent(er) har lav tilgjengelighet.")
            fix = fix or "bytt_komponent"
        return Assessment(self.name, clamp(score), objections, fix)


class Produktleder(Agent):
    """Tid til første test med ekte brukere. Lære før man bygger mer."""
    name = "Produktleder"
    dimension = "gjennomforbarhet"

    def assess(self, idea: Idea) -> Assessment:
        d = idea.dev_months
        if d <= 3:
            score = 10
        elif d <= 6:
            score = 8
        elif d <= 9:
            score = 6
        else:
            score = 3
        objections = []
        fix = None
        if d > 6:
            objections.append(f"Første test med brukere først etter ca. {d:g} måneder.")
            fix = "kutt_scope"
        return Assessment(self.name, score, objections, fix)


class Markedsanalytiker(Agent):
    """Markedspotensial, basert på hypoteser om segment og konkurranse."""
    name = "Markedsanalytiker"
    dimension = "marked"

    def assess(self, idea: Idea) -> Assessment:
        score = clamp(0.5 * idea.segment_score + 5 - 0.25 * idea.competitors)
        objections = []
        fix = None
        if idea.segment_score < 6:
            objections.append("Segmentet er uklart eller smalt. Må verifiseres med kilder og intervjuer.")
        if idea.competitors >= 8:
            objections.append("Mange konkurrenter. Trenger en tydelig nisje.")
            fix = "nisjeskifte"
        return Assessment(self.name, score, objections, fix)


class Forretningsstrateg(Agent):
    """Kommersiell verdi: bruttomargin, gjentakende inntekt og skalering."""
    name = "Forretningsstrateg"
    dimension = "kommersiell"

    def assess(self, idea: Idea) -> Assessment:
        margin = (idea.price - idea.unit_cost) / idea.price
        score = clamp(12 * margin + (1 if idea.recurring else 0) + (1 if idea.scalable else 0))
        objections = []
        fix = None
        if margin < 0.5:
            objections.append(f"Bruttomargin {margin:.0%}. Under 50 %, prisen er sannsynligvis for lav.")
            fix = "prisjustering"
        if not idea.recurring and not idea.scalable:
            objections.append("Ingen gjentakende inntekt og ingen skalering.")
        return Assessment(self.name, score, objections, fix)


class Rodtlag(Agent):
    """Kritiker: juridisk og etisk risiko. Har ikke lov til å være vennlig."""
    name = "Rødt lag"
    dimension = "risiko"

    def assess(self, idea: Idea) -> Assessment:
        score = clamp(10 - 3.5 * idea.reg_risk)
        objections = []
        fix = None
        if idea.reg_risk >= 1:
            objections.append("Velværeløfter kan tolkes som helsepåstander. Krever juridisk vurdering.")
        if idea.reg_risk >= 2:
            objections.append("Helsedata eller medisinsk rammeverk i spill (personvern art. 9, medisinsk utstyr).")
            fix = "fjern_helseløfte"
        return Assessment(self.name, score, objections, fix)


def default_agents() -> list[Agent]:
    return [
        Ideegenerator(),
        Industridesigner(),
        Tekniker(),
        Produktleder(),
        Markedsanalytiker(),
        Forretningsstrateg(),
        Rodtlag(),
    ]
