"""Hybrid klassifisering: regler (regex + negasjon) + semantisk likhet mot kodeprototyper.

Sikkerhetsprinsipp: P0-koder (krise) avgjøres av regler alene. ML kan løfte en kode,
men aldri senke eller skjule en P0-treff.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from .embeddings import Embedder, Vector, cosine
from .models import VibeCode

NEGATION = re.compile(r"\b(ikke|aldri|ingen|ikkje)\s+(\w+\s+){0,2}$", re.IGNORECASE)
RULE_WEIGHT = 0.6
SEMANTIC_WEIGHT = 0.4
SUGGEST_THRESHOLD = 0.45
# Hashing-embedderen gir lavere cosinus enn ekte modeller. Kalibreres per modell.
SEM_FLOOR, SEM_CEIL = 0.15, 0.65


@dataclass
class CodeHit:
    code_id: str
    code_version: int
    score: float
    rule_score: float
    semantic_score: float
    matched_signals: list[str] = field(default_factory=list)
    negated_signals: list[str] = field(default_factory=list)
    escalate: bool = False


class HybridClassifier:
    def __init__(self, embedder: Embedder):
        self.embedder = embedder
        self._compiled: dict[tuple[str, int], list[re.Pattern]] = {}
        self._prototypes: dict[tuple[str, int], list[Vector]] = {}

    def _prepare(self, code: VibeCode):
        key = (code.id, code.version)
        if key not in self._compiled:
            self._compiled[key] = [re.compile(p, re.IGNORECASE) for p in code.trigger_signals.patterns]
            examples = code.trigger_signals.semantic_examples or [code.definition]
            self._prototypes[key] = self.embedder.embed(examples)
        return self._compiled[key], self._prototypes[key]

    def prototype_vectors(self, code: VibeCode) -> list[Vector]:
        return self._prepare(code)[1]

    def _rule_score(self, code: VibeCode, text: str, patterns: list[re.Pattern]):
        matched, negated = [], []
        for pat in patterns:
            for m in pat.finditer(text):
                prefix = text[max(0, m.start() - 30) : m.start()]
                if code.priority != "P0" and NEGATION.search(prefix):
                    negated.append(m.group(0))
                else:
                    matched.append(m.group(0))
        if not matched:
            return 0.0, matched, negated
        return min(1.0, 0.6 + 0.2 * (len(matched) - 1)), matched, negated

    def classify(self, text: str, codes: list[VibeCode], text_vec: Vector | None = None) -> list[CodeHit]:
        text_vec = text_vec or self.embedder.embed([text])[0]
        hits: list[CodeHit] = []
        for code in codes:
            if code.status != "active":
                continue
            patterns, protos = self._prepare(code)
            rule, matched, negated = self._rule_score(code, text, patterns)
            raw_sem = max((cosine(text_vec, p) for p in protos), default=0.0)
            sem = min(1.0, max(0.0, (raw_sem - SEM_FLOOR) / (SEM_CEIL - SEM_FLOOR)))

            if code.priority == "P0" and matched:
                hits.append(CodeHit(code.id, code.version, 1.0, rule, sem, matched, negated, escalate=True))
                continue

            score = RULE_WEIGHT * rule + SEMANTIC_WEIGHT * sem
            if negated and not matched:
                score *= 0.3
            if score >= SUGGEST_THRESHOLD:
                hits.append(CodeHit(code.id, code.version, round(score, 3), rule, round(sem, 3), matched, negated))
        priority_rank = {c.id: c.priority for c in codes}
        hits.sort(key=lambda h: (priority_rank.get(h.code_id) != "P0", -h.score))
        return hits
