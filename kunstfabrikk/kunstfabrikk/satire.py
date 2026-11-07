"""Oppgave 2: Daglig nyhets-satire.

Input: 3–5 nyheter (filer, tekst, stdin eller RSS). Output per nyhet:
2 lange Midjourney-prompts i stencil/gatekunst-stil + 3 korte, rå captions. JSON + Markdown.
"""
from __future__ import annotations

import json
import random
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date
from html import unescape
from pathlib import Path

from . import antislop, llm, mj
from .tekstverktoy import nokkelord, overskrift

STANDARD_RSS = "https://www.nrk.no/toppsaker.rss"

SYSTEM = f"""Du er en satirisk gatekunstner og gonzo-skribent. Du får én norsk nyhet og lager kunst som stikker hull på makt,
hykleri og byråkrati. Mål: institusjoner, systemer og maktbruk, aldri privatpersoner eller sårbare grupper.

{antislop.REGLER_PROMPT}

{antislop.REGLER_TEKST}

Midjourney-prompts: engelsk, 40–80 ord, stencil/spray på konkret overflate, én visuell metafor, avslutt med parametre
"--ar 4:5 --v 7 --style raw --stylize 150". Ingen navn på identifiserbare privatpersoner.
Captions: norsk, førsteperson, maks 2 setninger hver, ingen hashtags, ingen emojis, ingen polering."""

OPPGAVE = """Nyhet:
\"\"\"{nyhet}\"\"\"

Returner JSON:
{{"kjerne": "én setning: hva er hykleriet/konflikten",
  "mj_prompts": ["prompt 1", "prompt 2"],
  "captions": ["caption 1", "caption 2", "caption 3"]}}"""

PROMPT_MALER = [
    "black and white spray stencil on wet concrete wall: a tiny official in a suit stamping the word '{K1}' onto a citizen "
    "made of paperwork, red accent paint dripping from the stamp, municipal grey paint half covering the edges, "
    "rough cut stencil lines, overspray halo --ar 4:5 --v 7 --style raw --stylize 150",
    "street stencil on a bus shelter panel: a queue of identical faceless people waiting at a door labeled '{K2}', "
    "the door is painted on the wall and leads nowhere, one figure in red holding a crumpled form about {k1}, "
    "torn posters and rain streaks --ar 4:5 --v 7 --style raw --stylize 150",
    "stencil on a cardboard box under a bridge: a parliament building drawn as a vending machine, coins labeled "
    "'{K1}' going in, nothing coming out, single red accent on the coin slot, drips and tape marks "
    "--ar 4:5 --v 7 --style raw --stylize 150",
]
CAPTION_MALER = [
    "{C1}. Jeg leste det to ganger for å være sikker. Det ble ikke bedre.",
    "Saken heter {k1}. Jeg kaller det maling på en vegg de må vaske i morgen.",
    "Noen tjener på {k1}. Det er ikke deg, og det er definitivt ikke meg.",
    "{C1}: nok en sak der skjemaet er viktigere enn mennesket som fyller det ut.",
    "Jeg sprayet {k1} på betongen. Den varer lenger enn pressemeldingen.",
]


def hent_rss(url: str = STANDARD_RSS, antall: int = 5, timeout: int = 15) -> list[str]:
    """Henter toppsaker fra RSS. Returnerer 'tittel. ingress' per sak."""
    forsporsel = urllib.request.Request(url, headers={"User-Agent": "kunstfabrikk/1.0"})
    with urllib.request.urlopen(forsporsel, timeout=timeout) as svar:
        rot = ET.fromstring(svar.read())
    saker = []
    for item in rot.iter("item"):
        tittel = (item.findtext("title") or "").strip()
        ingress = re.sub(r"<[^>]+>", "", unescape(item.findtext("description") or "")).strip()
        if tittel:
            saker.append(f"{tittel}. {ingress}".strip())
        if len(saker) >= antall:
            break
    return saker


def del_nyheter(tekst: str) -> list[str]:
    """Flere nyheter i én fil skilles med en linje som kun inneholder '---'."""
    return [d.strip() for d in re.split(r"^\s*---\s*$", tekst, flags=re.M) if d.strip()]


def satire_offline(nyhet: str) -> dict:
    ord_ = nokkelord(nyhet, 4) or ["systemet", "skjemaet"]
    k1, k2 = ord_[0], (ord_[1] if len(ord_) > 1 else ord_[0])
    fyll = {"k1": k1, "k2": k2, "K1": k1.upper(), "K2": k2.upper(), "C1": k1.capitalize(), "C2": k2.capitalize()}
    rng = random.Random(mj.seed_fra(nyhet))
    return {
        "kjerne": f"Nyheten handler om {k1} og {k2}. (Malmodus: kjernen er ikke analysert, kun nøkkelord.)",
        "mj_prompts": [p.format(**fyll) for p in rng.sample(PROMPT_MALER, 2)],
        "captions": [c.format(**fyll) for c in rng.sample(CAPTION_MALER, 3)],
        "modus": "offline-maler",
    }


def satire_llm(nyhet: str) -> dict:
    data = llm.json_svar(SYSTEM, OPPGAVE.format(nyhet=nyhet.strip()))
    prompts = [antislop.rens_prompt(str(p)) for p in data.get("mj_prompts", [])][:2]
    captions = [antislop.rens_tekst(str(c)) for c in data.get("captions", [])][:3]
    if len(prompts) < 2 or len(captions) < 3:
        raise llm.LLMFeil("Modellen leverte ikke 2 prompts og 3 captions.")
    return {"kjerne": str(data.get("kjerne", "")), "mj_prompts": prompts, "captions": captions,
            "modus": f"claude:{llm.MODELL}"}


def kjor(nyheter: list[str], ut: Path, offline: bool = False) -> dict:
    if not nyheter:
        raise SystemExit("Ingen nyheter å jobbe med.")
    bruk_llm = not offline and llm.tilgjengelig()
    resultat = []
    for n in nyheter[:5]:
        r = satire_llm(n) if bruk_llm else satire_offline(n)
        r["nyhet"] = overskrift(n, 14)
        r["slop_treff"] = sorted(
            {t for p in r["mj_prompts"] for t in antislop.treff(p, prompt=True)}
            | {t for c in r["captions"] for t in antislop.treff(c)}
        )
        resultat.append(r)

    ut.mkdir(parents=True, exist_ok=True)
    stamme = ut / f"satire-{date.today().isoformat()}"
    data = {"dato": date.today().isoformat(), "antall": len(resultat), "saker": resultat}
    stamme.with_suffix(".json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    stamme.with_suffix(".md").write_text(_markdown(data), encoding="utf-8")
    return {"json": str(stamme.with_suffix(".json")), "md": str(stamme.with_suffix(".md")), **data}


def _markdown(data: dict) -> str:
    linjer = [f"# Satire {data['dato']}", ""]
    for i, s in enumerate(data["saker"], 1):
        linjer += [f"## {i}. {s['nyhet']}", "", f"_Kjerne:_ {s['kjerne']}", "", "**Midjourney**", ""]
        linjer += [f"```\n{p}\n```" for p in s["mj_prompts"]]
        linjer += ["", "**Captions**", ""] + [f"- {c}" for c in s["captions"]] + [""]
    return "\n".join(linjer)
