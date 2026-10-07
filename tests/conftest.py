"""Mocket xAI-API. Ingen nettverk, ingen nøkkel."""
from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import openai
import pytest

from grokkjerne import Innstillinger, Kjerne


def api_feil(cls: type, status: int, melding: str = "feil") -> Exception:
    """Lag openai-feil uten å være avhengig av SDK-ens httpx-versjon."""
    e = cls.__new__(cls)
    Exception.__init__(e, melding)
    e.status_code = status
    e.message = melding
    return e


def respons(tekst: str, inn: int = 10, ut: int = 5) -> Any:
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=tekst))],
        usage=SimpleNamespace(prompt_tokens=inn, completion_tokens=ut),
    )


class FalskKlient:
    """Spiller av en kø med svar/feil. Husker alle kall."""

    def __init__(self, kø: list[Any]):
        self.kø = list(kø)
        self.kall: list[dict[str, Any]] = []
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

    def _neste(self, **params: Any) -> Any:
        self.kall.append(params)
        neste = self.kø.pop(0)
        if isinstance(neste, Exception):
            raise neste
        return respons(neste) if isinstance(neste, str) else neste

    def _create(self, **params: Any) -> Any:
        return self._neste(**params)


class FalskAsyncKlient(FalskKlient):
    async def _create(self, **params: Any) -> Any:  # type: ignore[override]
        return self._neste(**params)


@pytest.fixture
def innst(tmp_path: Path) -> Innstillinger:
    return Innstillinger(api_key="test", modell="test-modell", pris_inn_per_m=2.0,
                         pris_ut_per_m=10.0, loggsti=tmp_path / "logs" / "kall.jsonl")


@pytest.fixture
def lag_kjerne(innst: Innstillinger):
    def _lag(kø: list[Any], asynk: bool = False) -> tuple[Kjerne, FalskKlient, list[float]]:
        sovet: list[float] = []
        falsk = FalskAsyncKlient(kø) if asynk else FalskKlient(kø)

        async def async_sov(s: float) -> None:
            sovet.append(s)

        k = Kjerne(innst, klient=None if asynk else falsk, async_klient=falsk if asynk else None,
                   sov=sovet.append, async_sov=async_sov)
        return k, falsk, sovet
    return _lag


def les_logg(innst: Innstillinger) -> list[dict[str, Any]]:
    return [json.loads(l) for l in innst.loggsti.read_text(encoding="utf-8").splitlines()]


__all__ = ["api_feil", "respons", "les_logg", "openai"]
