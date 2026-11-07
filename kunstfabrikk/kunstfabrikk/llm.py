"""Tynt lag over Claude API.

Alle kommandoer fungerer uten nøkkel (malmodus). Med nøkkel brukes Claude.
Legitimasjon løses av SDK-en selv: ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN
eller en `ant auth login`-profil.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

MODELL = os.environ.get("KUNSTFABRIKK_MODELL", "claude-opus-5-5")
EFFORT = os.environ.get("KUNSTFABRIKK_EFFORT", "medium")


class LLMFeil(RuntimeError):
    pass


def tilgjengelig() -> bool:
    """True hvis SDK finnes og det ser ut til å finnes legitimasjon."""
    try:
        import anthropic  # noqa: F401
    except ImportError:
        return False
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return True
    if os.environ.get("ANTHROPIC_PROFILE"):
        return True
    return (Path.home() / ".config" / "anthropic").exists()


def _klient():
    import anthropic
    return anthropic.Anthropic()


def tekst(system: str, bruker: str, max_tokens: int = 8000) -> str:
    """Ett kall, returnerer ren tekst. Kaster LLMFeil ved avslag eller API-feil."""
    import anthropic

    try:
        svar = _klient().beta.messages.create(
            model=MODELL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": bruker}],
            output_config={"effort": EFFORT},
            # Ved avslag fra sikkerhetsklassifiserer: la API-et prøve anbefalt reservemodell.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except anthropic.AuthenticationError as e:
        raise LLMFeil("Ugyldig eller manglende API-nøkkel. Bruk --offline eller sett ANTHROPIC_API_KEY.") from e
    except anthropic.RateLimitError as e:
        raise LLMFeil("Rate limit. Vent litt og prøv igjen.") from e
    except anthropic.APIStatusError as e:
        raise LLMFeil(f"API-feil {e.status_code}: {e.message}") from e
    except anthropic.APIConnectionError as e:
        raise LLMFeil("Fikk ikke kontakt med API-et (nettverk).") from e

    if svar.stop_reason == "refusal":
        kat = getattr(svar.stop_details, "category", None) if svar.stop_details else None
        raise LLMFeil(f"Modellen avslo forespørselen (kategori: {kat}). Omformuler input.")
    deler = [b.text for b in svar.content if b.type == "text"]
    if not deler:
        raise LLMFeil("Tomt svar fra modellen.")
    if svar.stop_reason == "max_tokens":
        raise LLMFeil("Svaret ble kuttet (max_tokens). Kort ned input.")
    return "\n".join(deler)


def json_svar(system: str, bruker: str, max_tokens: int = 8000) -> dict:
    """Ber om ett JSON-objekt og parser det. Én ny runde hvis parsing feiler."""
    instruks = "\n\nSvar KUN med ett gyldig JSON-objekt. Ingen tekst før eller etter, ingen kodeblokk."
    raatt = tekst(system, bruker + instruks, max_tokens)
    try:
        return trekk_ut_json(raatt)
    except ValueError:
        raatt = tekst(system, bruker + instruks + "\nForrige svar var ikke gyldig JSON. Prøv igjen.", max_tokens)
        return trekk_ut_json(raatt)


def trekk_ut_json(raatt: str) -> dict:
    s = raatt.strip()
    s = re.sub(r"^```(?:json)?\s*|\s*```$", "", s)
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        start, slutt = s.find("{"), s.rfind("}")
        if start == -1 or slutt <= start:
            raise ValueError("Fant ikke JSON i svaret")
        try:
            return json.loads(s[start : slutt + 1])
        except json.JSONDecodeError as e:
            raise ValueError(f"Ugyldig JSON: {e}") from e
