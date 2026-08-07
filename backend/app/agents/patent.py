"""Patent agent: claim drafting + heuristic prior-art scan + structured IP storage.

The "prior-art scan" here is a local heuristic keyword differentiator, not a
substitute for a real EPO/Patentstyret/USPTO search. Every draft is explicitly
marked as attorney-review-required before filing.
"""
from __future__ import annotations

from app.agents.base import BaseAgent
from app.db import dumps, now, tx

# Small local prior-art keyword corpus for offline novelty heuristics. A real
# deployment should replace/augment this with live Patentstyret/EPO/USPTO/Google
# Patents queries (network + API keys required, hence optional here).
_PRIOR_ART_CORPUS = [
    {"term": "folding wing drone", "source": "generic UAV prior art (broad)"},
    {"term": "riblet drag reduction surface", "source": "aerospace/marine coatings prior art"},
    {"term": "adjustable exhale resistance valve", "source": "respiratory training device prior art"},
    {"term": "solar film UAV skin", "source": "solar-augmented UAV prior art"},
    {"term": "6DOF hybrid rotor drone", "source": "hybrid VTOL prior art"},
    {"term": "paced breathing biofeedback device", "source": "HRV biofeedback prior art"},
]


class PatentAgent(BaseAgent):
    name = "patent"
    description = "Patent claim generator + prior-art heuristic scanner + IP database writer"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "draft_patent":
            return self._draft(payload)
        raise ValueError(f"unknown task kind for patent: {kind}")

    def _scan_prior_art(self, keywords: list[str]) -> tuple[list[dict], str]:
        hits = []
        for kw in keywords:
            kw_l = kw.lower()
            for entry in _PRIOR_ART_CORPUS:
                if any(tok in entry["term"] for tok in kw_l.split()):
                    hits.append({"matched_keyword": kw, **entry})
        if len(hits) >= 3:
            risk = "medium (multiple adjacent prior-art terms found -- narrow claims to specific combination)"
        elif len(hits) >= 1:
            risk = "low-medium (some adjacent art -- differentiate on the specific combination of features)"
        else:
            risk = "low (no local corpus hits -- still requires a real search before filing)"
        return hits, risk

    def _draft(self, payload: dict) -> dict:
        title = payload["title"]
        domain = payload.get("domain", "mechanical")
        features: list[str] = payload.get("features", [])
        invention_id = payload.get("invention_id")

        independent_claim = (
            f"1. A {domain} apparatus comprising: " + "; ".join(features) + "."
        )
        dependent_claims = [
            f"{i+2}. The apparatus of claim 1, wherein {feat} is configured for the "
            f"specific operating range disclosed herein."
            for i, feat in enumerate(features)
        ]
        claims_en = [independent_claim, *dependent_claims]

        claims_no = [
            f"1. En {domain}-innretning som omfatter: " + "; ".join(features) + "."
        ] + [
            f"{i+2}. Innretningen ifolge krav 1, hvor {feat} er konfigurert for det "
            f"spesifikke driftsomradet beskrevet her."
            for i, feat in enumerate(features)
        ]

        prior_art_hits, risk = self._scan_prior_art(features + [title])

        with tx() as conn:
            cur = conn.execute(
                """INSERT INTO patents (invention_id, title, jurisdiction, claims_json,
                   prior_art_json, novelty_risk, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)""",
                (
                    invention_id,
                    title,
                    "NO+PCT",
                    dumps({"en": claims_en, "no": claims_no}),
                    dumps(prior_art_hits),
                    risk,
                    now(),
                ),
            )
            patent_id = cur.lastrowid

        return {
            "patent_id": patent_id,
            "title": title,
            "claims": {"en": claims_en, "no": claims_no},
            "prior_art_hits": prior_art_hits,
            "novelty_risk": risk,
            "attorney_review_required": True,
        }
