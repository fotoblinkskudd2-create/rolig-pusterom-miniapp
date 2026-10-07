"""Grok-kjernen: ett sted for kall, retry, JSON-validering og logging.

xAI-APIet er OpenAI-kompatibelt, så vi bruker openai-SDK med egen base_url.
SDK-ens egen retry er skrudd av (max_retries=0) — vi eier backoff selv, så
loggen viser sannheten om hvor mange forsøk som gikk med.
"""
from __future__ import annotations

import asyncio
import json
import random
import re
import time
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, TypeVar

import openai
from pydantic import BaseModel, ValidationError

from . import logg
from .config import Innstillinger

T = TypeVar("T", bound=BaseModel)

MAKS_FORSØK = 3
BACKOFF_BASIS_S = 1.0


class GrokFeil(RuntimeError):
    """Kallet feilet etter alle forsøk."""


class UgyldigJSON(GrokFeil):
    """Modellen leverte ikke gyldig JSON mot skjemaet etter alle forsøk."""


@dataclass
class Svar:
    tekst: str
    tokens_inn: int
    tokens_ut: int
    latens_ms: int
    kostnad_usd: float
    forsøk: int


def _kan_prøve_igjen(feil: Exception) -> bool:
    if isinstance(feil, (openai.RateLimitError, openai.APITimeoutError, openai.APIConnectionError)):
        return True
    if isinstance(feil, openai.APIStatusError):
        return feil.status_code == 429 or feil.status_code >= 500
    return False


def _ventetid(forsøk_nr: int) -> float:
    """Eksponentiell backoff med litt jitter: ~1s, ~2s, ~4s."""
    return BACKOFF_BASIS_S * (2 ** (forsøk_nr - 1)) + random.uniform(0, 0.25)


def _rens_json(tekst: str) -> str:
    """Fjern ```json-gjerder hvis modellen pakker inn svaret."""
    m = re.search(r"```(?:json)?\s*(.*?)```", tekst, re.DOTALL)
    return (m.group(1) if m else tekst).strip()


def _meldinger(prompt: str | list[dict[str, Any]], system: str | None) -> list[dict[str, Any]]:
    if isinstance(prompt, str):
        msgs: list[dict[str, Any]] = [{"role": "user", "content": prompt}]
    else:
        msgs = list(prompt)
    if system:
        msgs.insert(0, {"role": "system", "content": system})
    return msgs


def _json_system(schema: type[BaseModel], system: str | None) -> str:
    skjema = json.dumps(schema.model_json_schema(), ensure_ascii=False)
    krav = (
        "Svar KUN med ett JSON-objekt som validerer mot dette JSON-skjemaet. "
        f"Ingen tekst før eller etter.\nSKJEMA: {skjema}"
    )
    return f"{system}\n\n{krav}" if system else krav


class Kjerne:
    def __init__(
        self,
        innstillinger: Innstillinger | None = None,
        *,
        klient: Any = None,
        async_klient: Any = None,
        sov: Callable[[float], None] = time.sleep,
        async_sov: Callable[[float], Awaitable[None]] = asyncio.sleep,
    ) -> None:
        self.inn = innstillinger or Innstillinger.fra_miljo()
        self._klient = klient
        self._async_klient = async_klient
        self._sov = sov
        self._async_sov = async_sov

    # -- klienter (lages lat, så tester slipper nettverk) --------------------
    @property
    def klient(self) -> Any:
        if self._klient is None:
            self._klient = openai.OpenAI(
                api_key=self.inn.api_key, base_url=self.inn.base_url,
                timeout=self.inn.timeout_s, max_retries=0,
            )
        return self._klient

    @property
    def async_klient(self) -> Any:
        if self._async_klient is None:
            self._async_klient = openai.AsyncOpenAI(
                api_key=self.inn.api_key, base_url=self.inn.base_url,
                timeout=self.inn.timeout_s, max_retries=0,
            )
        return self._async_klient

    # -- felles ------------------------------------------------------------
    def _parametre(self, msgs: list[dict[str, Any]], json_modus: bool, ekstra: dict[str, Any]) -> dict[str, Any]:
        p: dict[str, Any] = {"model": self.inn.modell, "messages": msgs, **ekstra}
        if json_modus:
            p["response_format"] = {"type": "json_object"}
        return p

    def _logg(self, *, motor: str, rolle: str, run_id: str | None, msgs: list[dict[str, Any]],
              start: float, forsøk: int, respons: Any = None, feil: Exception | None = None) -> Svar | None:
        latens_ms = int((time.perf_counter() - start) * 1000)
        bruk = getattr(respons, "usage", None)
        t_inn = int(getattr(bruk, "prompt_tokens", 0) or 0)
        t_ut = int(getattr(bruk, "completion_tokens", 0) or 0)
        kost = self.inn.kostnad(t_inn, t_ut)
        logg.skriv(self.inn.loggsti, {
            "ts": logg.nå_iso(), "motor": motor, "rolle": rolle, "run_id": run_id,
            "modell": self.inn.modell, "tokens_inn": t_inn, "tokens_ut": t_ut,
            "latens_ms": latens_ms, "kostnad_usd": round(kost, 6),
            "prompt_hash": logg.prompt_hash(msgs), "forsok": forsøk,
            "ok": feil is None, "feil": None if feil is None else f"{type(feil).__name__}: {feil}"[:300],
        })
        if respons is None:
            return None
        tekst = respons.choices[0].message.content or ""
        return Svar(tekst, t_inn, t_ut, latens_ms, kost, forsøk)

    # -- sync --------------------------------------------------------------
    def chat_svar(self, prompt: str | list[dict[str, Any]], *, system: str | None = None,
                  motor: str = "ukjent", rolle: str = "ukjent", run_id: str | None = None,
                  json_modus: bool = False, **ekstra: Any) -> Svar:
        msgs = _meldinger(prompt, system)
        params = self._parametre(msgs, json_modus, ekstra)
        start = time.perf_counter()
        for nr in range(1, MAKS_FORSØK + 1):
            try:
                resp = self.klient.chat.completions.create(**params)
            except Exception as e:  # noqa: BLE001 — sorteres under
                if _kan_prøve_igjen(e) and nr < MAKS_FORSØK:
                    self._sov(_ventetid(nr))
                    continue
                self._logg(motor=motor, rolle=rolle, run_id=run_id, msgs=msgs, start=start, forsøk=nr, feil=e)
                raise GrokFeil(f"Grok-kall feilet etter {nr} forsøk: {e}") from e
            return self._logg(motor=motor, rolle=rolle, run_id=run_id, msgs=msgs, start=start, forsøk=nr, respons=resp)  # type: ignore[return-value]
        raise AssertionError("utilgjengelig")

    def chat(self, prompt: str | list[dict[str, Any]], **kw: Any) -> str:
        return self.chat_svar(prompt, **kw).tekst

    def chat_json(self, prompt: str | list[dict[str, Any]], schema: type[T], *,
                  system: str | None = None, **kw: Any) -> T:
        msgs = _meldinger(prompt, _json_system(schema, system))
        siste_feil: Exception | None = None
        for _ in range(MAKS_FORSØK):
            tekst = self.chat(msgs, json_modus=True, **kw)
            try:
                return schema.model_validate_json(_rens_json(tekst))
            except (ValidationError, ValueError) as e:
                siste_feil = e
                msgs = msgs + [
                    {"role": "assistant", "content": tekst},
                    {"role": "user", "content": f"Ugyldig mot skjemaet: {str(e)[:800]}\nSvar på nytt med KUN gyldig JSON."},
                ]
        raise UgyldigJSON(f"Ingen gyldig JSON etter {MAKS_FORSØK} forsøk: {siste_feil}")

    # -- async (for parallelle agenter med asyncio.gather) -------------------
    async def async_chat_svar(self, prompt: str | list[dict[str, Any]], *, system: str | None = None,
                              motor: str = "ukjent", rolle: str = "ukjent", run_id: str | None = None,
                              json_modus: bool = False, **ekstra: Any) -> Svar:
        msgs = _meldinger(prompt, system)
        params = self._parametre(msgs, json_modus, ekstra)
        start = time.perf_counter()
        for nr in range(1, MAKS_FORSØK + 1):
            try:
                resp = await self.async_klient.chat.completions.create(**params)
            except Exception as e:  # noqa: BLE001
                if _kan_prøve_igjen(e) and nr < MAKS_FORSØK:
                    await self._async_sov(_ventetid(nr))
                    continue
                self._logg(motor=motor, rolle=rolle, run_id=run_id, msgs=msgs, start=start, forsøk=nr, feil=e)
                raise GrokFeil(f"Grok-kall feilet etter {nr} forsøk: {e}") from e
            return self._logg(motor=motor, rolle=rolle, run_id=run_id, msgs=msgs, start=start, forsøk=nr, respons=resp)  # type: ignore[return-value]
        raise AssertionError("utilgjengelig")

    async def async_chat(self, prompt: str | list[dict[str, Any]], **kw: Any) -> str:
        return (await self.async_chat_svar(prompt, **kw)).tekst

    async def async_chat_json(self, prompt: str | list[dict[str, Any]], schema: type[T], *,
                              system: str | None = None, **kw: Any) -> T:
        msgs = _meldinger(prompt, _json_system(schema, system))
        siste_feil: Exception | None = None
        for _ in range(MAKS_FORSØK):
            tekst = await self.async_chat(msgs, json_modus=True, **kw)
            try:
                return schema.model_validate_json(_rens_json(tekst))
            except (ValidationError, ValueError) as e:
                siste_feil = e
                msgs = msgs + [
                    {"role": "assistant", "content": tekst},
                    {"role": "user", "content": f"Ugyldig mot skjemaet: {str(e)[:800]}\nSvar på nytt med KUN gyldig JSON."},
                ]
        raise UgyldigJSON(f"Ingen gyldig JSON etter {MAKS_FORSØK} forsøk: {siste_feil}")


# -- modulnivå-snarveier: grokkjerne.chat(...) osv. ------------------------------
_standard: Kjerne | None = None


def standard() -> Kjerne:
    global _standard
    if _standard is None:
        _standard = Kjerne()
    return _standard


def chat(prompt: str | list[dict[str, Any]], **kw: Any) -> str:
    return standard().chat(prompt, **kw)


def chat_json(prompt: str | list[dict[str, Any]], schema: type[T], **kw: Any) -> T:
    return standard().chat_json(prompt, schema, **kw)


async def async_chat(prompt: str | list[dict[str, Any]], **kw: Any) -> str:
    return await standard().async_chat(prompt, **kw)


async def async_chat_json(prompt: str | list[dict[str, Any]], schema: type[T], **kw: Any) -> T:
    return await standard().async_chat_json(prompt, schema, **kw)
