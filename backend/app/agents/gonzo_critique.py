"""Gonzo-Critique agent: brutally honest hype-check on every invention/patent/MVP.

Every other agent in this swarm is a generator. This one's job is to be the
skeptic -- flag unverified claims, missing validation, and confidence
mismatches before they get sold to Alexander (or a customer) as more certain
than they are.
"""
from __future__ import annotations

from app.agents.base import BaseAgent

_HYPE_WORDS = [
    "revolutionary", "guaranteed", "proven", "certified", "clinically validated",
    "world-first", "unbeatable", "risk-free", "instant",
]


class GonzoCritiqueAgent(BaseAgent):
    name = "gonzo_critique"
    description = "Hype-checker: scores evidence vs claims on every swarm output"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "critique":
            return self._critique(payload)
        raise ValueError(f"unknown task kind for gonzo_critique: {kind}")

    def _critique(self, payload: dict) -> dict:
        text = payload.get("text", "")
        artifact_type = payload.get("artifact_type", "unknown")
        low_text = text.lower()

        flags = [w for w in _HYPE_WORDS if w in low_text]
        has_confidence_note = any(
            token in low_text for token in ["confidence", "needs", "requires", "not a substitute", "heuristic"]
        )

        score = 100
        score -= 15 * len(flags)
        if not has_confidence_note:
            score -= 20
        score = max(0, min(100, score))

        verdict = "credible with caveats" if score >= 70 else "needs evidence before claiming this externally"
        if score < 40:
            verdict = "reject as-is: overclaimed relative to evidence -- rewrite before it reaches a customer/investor"

        result = {
            "artifact_type": artifact_type,
            "credibility_score": score,
            "hype_flags": flags,
            "has_validation_caveat": has_confidence_note,
            "verdict": verdict,
            "recommendation": (
                "Attach real test/validation data before external use."
                if score < 70
                else "Ship internally; still get a domain expert sign-off before external claims."
            ),
        }
        self.remember("last_critique", result)
        return result
