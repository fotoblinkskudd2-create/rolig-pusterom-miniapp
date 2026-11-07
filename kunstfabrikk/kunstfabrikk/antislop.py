"""Anti-slop: regler som sendes til modellen, og en sjekk som kjøres på output.

Målet er rå, konkret tekst og prompts uten generisk AI-fyll.
"""
from __future__ import annotations

import re

# Tekst-slop: generiske fraser som avslører maskinskrevet fyll.
TEKST_FORBUDT = [
    "i en verden der", "i en verden hvor", "la oss dykke", "dykke ned i", "det er viktig å",
    "det er verdt å merke seg", "kort sagt", "alt i alt", "til syvende og sist", "i dagens samfunn",
    "banebrytende", "sømløs", "spennende reise", "game changer", "gamechanger",
    "unleash", "delve", "tapestry", "testament to", "vibrant", "in today's world",
    "navigere i", "landskapet av", "et vitnesbyrd om",
    "fascinerende", "uforglemmelig", "magisk", "episk reise",
]

# Prompt-slop for bildemodeller: kvalitetsord som gir plastisk, generisk estetikk.
PROMPT_FORBUDT = [
    "8k", "4k", "masterpiece", "trending on artstation", "octane render", "unreal engine",
    "ultra detailed", "ultra-detailed", "hyperrealistic", "hyper-realistic", "award-winning",
    "award winning", "best quality", "highly detailed", "stunning", "breathtaking", "epic",
    "cinematic lighting", "beautiful", "intricate details",
]

EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F2FF]")
HASHTAG = re.compile(r"(?<!\w)#\w+")

REGLER_TEKST = """ANTI-SLOP-REGLER (absolutte):
- Konkret over generelt: navn, tall, steder, ting man kan ta på. Ingen abstrakte festtaler.
- Ingen innledning, ingen oppsummering, ingen moral til slutt.
- Ingen emojis, ingen hashtags, ingen "i en verden der", "la oss dykke", "det er viktig å", "banebrytende", "sømløs", "reise".
- Korte setninger slår lange. Ett bilde per setning.
- Ikke forklar vitsen. Ikke pynt. Første utkast, ikke markedsføring.
- Ikke finn på fakta, sitater eller tall. Bruk bare det som står i input."""

REGLER_PROMPT = """ANTI-SLOP-REGLER FOR BILDEPROMPTS (absolutte):
- Beskriv motiv, materiale, lys og komposisjon konkret (sprayet stencil på betong, ikke "beautiful art").
- Forbudt: 8k, 4k, masterpiece, trending on artstation, octane render, unreal engine, hyperrealistic, highly detailed, stunning, epic, cinematic lighting, award-winning.
- Ingen navn på ekte, identifiserbare privatpersoner. Offentlige institusjoner og symboler er ok.
- Én tydelig visuell idé per prompt. Satiren skal ligge i motivet, ikke i adjektivene."""


def treff(tekst: str, prompt: bool = False) -> list[str]:
    """Returnerer liste over slop-funn i teksten (tom liste = ren)."""
    lav = tekst.lower()
    funn = [f for f in (PROMPT_FORBUDT if prompt else TEKST_FORBUDT) if _ord_treff(lav, f)]
    if EMOJI.search(tekst):
        funn.append("emoji")
    if not prompt and HASHTAG.search(tekst):
        funn.append("hashtag")
    return funn


def _ord_treff(lav: str, frase: str) -> bool:
    return re.search(r"(?<![\w-])" + re.escape(frase) + r"(?![\w-])", lav) is not None


def rens_prompt(prompt: str) -> str:
    """Fjerner forbudte kvalitetsord fra en bildeprompt (brukes i malmodus og som siste vern)."""
    ut = prompt
    for f in PROMPT_FORBUDT:
        ut = re.sub(r"(?i)(?<![\w-])" + re.escape(f) + r"(?![\w-])\s*,?\s*", "", ut)
    ut = EMOJI.sub("", ut)
    ut = re.sub(r"\s+,", ",", ut)
    ut = re.sub(r",\s*,+", ",", ut)
    return re.sub(r"\s{2,}", " ", ut).strip(" ,")


def rens_tekst(tekst: str) -> str:
    ut = EMOJI.sub("", tekst)
    ut = HASHTAG.sub("", ut)
    return re.sub(r"[ \t]{2,}", " ", ut).strip()
