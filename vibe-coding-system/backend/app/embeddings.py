"""Embedding-lag.

`HashingEmbedder` er deterministisk og avhengighetsfri, og brukes i dev, test og CI.
I produksjon byttes den ut med en selvhostet flerspråklig modell (f.eks. BGE-M3 eller
multilingual-e5-large) bak samme `Embedder`-protokoll. Se docs/06-ml-pipeline.md.
"""
from __future__ import annotations

import hashlib
import math
import re
from typing import Protocol, Sequence

Vector = list[float]


class Embedder(Protocol):
    model_id: str
    dim: int

    def embed(self, texts: Sequence[str]) -> list[Vector]: ...


_WORD = re.compile(r"[\wæøåÆØÅ]+", re.UNICODE)


class HashingEmbedder:
    """Signert feature-hashing av tegn-n-gram (3–5) per ord. L2-normalisert."""

    def __init__(self, dim: int = 512):
        self.dim = dim
        self.model_id = f"hashing-char345-{dim}"

    def _features(self, text: str):
        for word in _WORD.findall(text.lower()):
            padded = f"<{word}>"
            yield "w:" + word
            for n in (3, 4, 5):
                for i in range(len(padded) - n + 1):
                    yield padded[i : i + n]

    def embed(self, texts: Sequence[str]) -> list[Vector]:
        out: list[Vector] = []
        for text in texts:
            vec = [0.0] * self.dim
            for feat in self._features(text):
                h = int.from_bytes(hashlib.md5(feat.encode()).digest()[:8], "little")
                vec[h % self.dim] += 1.0 if (h >> 63) & 1 else -1.0
            norm = math.sqrt(sum(v * v for v in vec)) or 1.0
            out.append([v / norm for v in vec])
        return out


def cosine(a: Vector, b: Vector) -> float:
    # Vektorene er normaliserte, så prikkproduktet er cosinus.
    return sum(x * y for x, y in zip(a, b))
