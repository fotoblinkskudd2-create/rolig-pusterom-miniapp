"""grokkjerne — tynn adapter mot Grok (xAI).

Dette er en STAND-IN for Oppgave 0. Den ekte grokkjernen fantes ikke i repoet
da kontroll/ og slusen/ ble bygget. Alt som snakker med Grok går gjennom
`spor()`, så den ekte kjernen kan byttes inn her uten å røre motorene.

Miljø:
  XAI_API_KEY   nøkkel. Uten den: GrokUtilgjengelig, og motorene faller tilbake
                til deterministisk/offline oppførsel.
  GROK_MODELL   modellnavn (standard: grok-4)
  GROK_URL      endepunkt (standard: https://api.x.ai/v1/chat/completions)
"""
from __future__ import annotations

import json
import os
import re
import urllib.request

STANDARD_URL = "https://api.x.ai/v1/chat/completions"
STANDARD_MODELL = "grok-4"


class GrokUtilgjengelig(RuntimeError):
    """Ingen nøkkel, ingen nett, eller Grok svarte søppel."""


def tilgjengelig() -> bool:
    return bool(os.environ.get("XAI_API_KEY"))


def spor(prompt: str, system: str | None = None, *, json_svar: bool = False,
         temperatur: float = 0.2, timeout: float = 60) -> str | dict:
    """Send én prompt til Grok. Returnerer tekst, eller dict hvis json_svar=True."""
    nokkel = os.environ.get("XAI_API_KEY")
    if not nokkel:
        raise GrokUtilgjengelig("XAI_API_KEY mangler")

    meldinger = []
    if system:
        meldinger.append({"role": "system", "content": system})
    meldinger.append({"role": "user", "content": prompt})
    kropp = {
        "model": os.environ.get("GROK_MODELL", STANDARD_MODELL),
        "messages": meldinger,
        "temperature": temperatur,
    }
    if json_svar:
        kropp["response_format"] = {"type": "json_object"}

    forespørsel = urllib.request.Request(
        os.environ.get("GROK_URL", STANDARD_URL),
        data=json.dumps(kropp).encode(),
        headers={"Authorization": f"Bearer {nokkel}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(forespørsel, timeout=timeout) as svar:
            data = json.load(svar)
        tekst = data["choices"][0]["message"]["content"]
    except Exception as feil:  # nett, HTTP, format
        raise GrokUtilgjengelig(f"Grok-kall feilet: {feil}") from feil

    return les_json(tekst) if json_svar else tekst


def les_json(tekst: str) -> dict:
    """Plukk ut første JSON-objekt fra et modellsvar (tåler ```json-gjerder)."""
    tekst = tekst.strip()
    gjerde = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", tekst, re.S)
    if gjerde:
        tekst = gjerde.group(1)
    start, slutt = tekst.find("{"), tekst.rfind("}")
    if start == -1 or slutt == -1:
        raise GrokUtilgjengelig(f"Ingen JSON i svar: {tekst[:120]!r}")
    try:
        return json.loads(tekst[start:slutt + 1])
    except json.JSONDecodeError as feil:
        raise GrokUtilgjengelig(f"Ugyldig JSON: {feil}") from feil
