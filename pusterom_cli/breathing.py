"""Guided breathing sessions with a pattern chosen from recent mood history.

Design decision (the "genialt" bit): the pattern is not picked from the
single latest mood score, but from an exponentially time-weighted average
of recent check-ins (today counts most, older days fade out on a
half-life). That means one bad-mood entry right after a string of good
days won't yank you into the most intense calming pattern, and a slow
multi-day slide toward stress *will* be picked up even if no single day
looked alarming on its own. The score then maps to a pattern whose
inhale:exhale ratio matches the physiology: more relative exhale time
favours the parasympathetic ("rest and digest") response, so the longest
exhale is reserved for when measured stress is actually elevated.
"""
from __future__ import annotations

import sys
import time
from dataclasses import dataclass
from datetime import datetime

DEFAULT_HALF_LIFE_DAYS = 2.0


@dataclass(frozen=True)
class Pattern:
    key: str
    label: str
    phases: tuple  # tuple of (phase_name, seconds)


PATTERNS = {
    "478": Pattern("478", "4-7-8 (roe ned)", (("Inn", 4), ("Hold", 7), ("Ut", 8))),
    "box": Pattern("box", "Boks-pust (jevn)", (("Inn", 4), ("Hold", 4), ("Ut", 4), ("Hold", 4))),
    "coherent": Pattern("coherent", "Jevn pust (vedlikehold)", (("Inn", 5), ("Ut", 5))),
}


def ewma_mood(checkins, now=None, half_life_days: float = DEFAULT_HALF_LIFE_DAYS):
    """Exponentially time-weighted average mood across `checkins`; None if empty."""
    now = now or datetime.now()
    weight_sum = 0.0
    value_sum = 0.0
    decay = 0.5 ** (1.0 / half_life_days)
    for c in checkins:
        age_days = max(0.0, (now - c.when).total_seconds() / 86400.0)
        w = decay ** age_days
        weight_sum += w
        value_sum += w * c.mood
    if weight_sum == 0:
        return None
    return value_sum / weight_sum


def choose_pattern(checkins, now=None) -> Pattern:
    score = ewma_mood(checkins, now=now)
    if score is None or score <= 2.5:
        return PATTERNS["478"]
    if score <= 3.75:
        return PATTERNS["box"]
    return PATTERNS["coherent"]


def _bar(step: int, total: int, growing: bool, width: int = 20) -> str:
    filled = round((step / total) * width) if total else width
    if not growing:
        filled = width - filled
    filled = max(0, min(width, filled))
    return "█" * filled + "·" * (width - filled)


def run_session(pattern: Pattern, minutes: float, seconds_per_tick: float = 1.0, sleep_fn=time.sleep, out=sys.stdout) -> int:
    """Run a guided breathing session. Returns the number of full cycles completed."""
    total_seconds = max(1, int(minutes * 60))
    elapsed = 0
    cycles = 0
    out.write(f"\n{pattern.label} — {minutes:g} min. Avbryt når som helst med Ctrl+C.\n\n")
    try:
        while elapsed < total_seconds:
            for name, seconds in pattern.phases:
                growing = name.lower() == "inn"
                shrinking = name.lower() == "ut"
                for step in range(1, seconds + 1):
                    if elapsed >= total_seconds:
                        break
                    if growing or shrinking:
                        bar = _bar(step, seconds, growing=growing)
                    else:
                        bar = _bar(seconds, seconds, growing=True)
                    out.write(f"\r{name:<6} [{bar}] {step}/{seconds}s   ")
                    out.flush()
                    sleep_fn(seconds_per_tick)
                    elapsed += 1
            cycles += 1
        out.write("\n\nFerdig. Bra jobbet.\n")
    except KeyboardInterrupt:
        out.write("\n\nAvbrutt. Det du fikk gjort teller.\n")
    return cycles
