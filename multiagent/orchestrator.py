"""Orkestrering: vurdering, kryss-kritikk og iterativ forbedring.

Prosessen er en hill-climb med kritikk:
  1. Alle agenter vurderer idéen uavhengig av hverandre.
  2. Hver agent kan foreslå én endring (fix).
  3. Endringene prøves i rekkefølge, svakeste agent først.
  4. En endring beholdes bare hvis den gir målbar forbedring (min_gain).
  5. Stopp når ingen endring gir nok, eller etter max_rounds.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from statistics import mean
from typing import Optional

from .agents import Agent, Assessment
from .model import Idea

DIM_WEIGHTS = {
    "kreativitet": 0.20,
    "gjennomforbarhet": 0.25,
    "marked": 0.25,
    "kommersiell": 0.20,
    "risiko": 0.10,
}


@dataclass
class Evaluation:
    total: float
    dims: dict[str, float]
    results: list[Assessment]

    def objections(self) -> list[tuple[str, str]]:
        return [(r.agent, o) for r in self.results for o in r.objections]


@dataclass
class Outcome:
    idea: Idea
    start: Evaluation
    final: Evaluation
    log: list[str] = field(default_factory=list)


def evaluate(idea: Idea, agents: list[Agent]) -> Evaluation:
    results = [a.assess(idea) for a in agents]
    dims: dict[str, float] = {}
    for dim in DIM_WEIGHTS:
        scores = [r.score for r, a in zip(results, agents) if a.dimension == dim]
        dims[dim] = mean(scores) if scores else 0.0
    total = sum(DIM_WEIGHTS[d] * dims[d] for d in DIM_WEIGHTS)
    return Evaluation(total=total, dims=dims, results=results)


def improve(
    idea: Idea,
    agents: list[Agent],
    max_rounds: int = 5,
    min_gain: float = 0.05,
) -> Outcome:
    from .revision import apply_fix

    current = idea.clone()
    start = evaluate(current, agents)
    ev = start
    log: list[str] = []

    for rnd in range(1, max_rounds + 1):
        proposals = sorted(
            (r for r in ev.results if r.fix),
            key=lambda r: r.score,
        )
        accepted = False
        for r in proposals:
            trial, changed = apply_fix(current, r.fix)
            if not changed:
                continue
            tev = evaluate(trial, agents)
            gain = tev.total - ev.total
            if gain >= min_gain:
                log.append(
                    f"Runde {rnd}: {r.agent} foreslo «{r.fix}». "
                    f"Totalskåre {ev.total:.2f} → {tev.total:.2f}. {trial.history[-1]}"
                )
                current, ev = trial, tev
                accepted = True
                break
            log.append(f"Runde {rnd}: «{r.fix}» fra {r.agent} avvist (gevinst {gain:+.2f}).")
        if not accepted:
            log.append(f"Runde {rnd}: ingen endring ga minst {min_gain:.2f}. Stopp.")
            break

    return Outcome(idea=current, start=start, final=ev, log=log)


def tournament(ideas: list[Idea], agents: list[Agent], **kwargs) -> list[Outcome]:
    outcomes = [improve(i, agents, **kwargs) for i in ideas]
    return sorted(outcomes, key=lambda o: o.final.total, reverse=True)
