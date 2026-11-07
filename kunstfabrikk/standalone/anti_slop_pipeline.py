#!/usr/bin/env python3
"""anti_slop_pipeline.py – base-prompt + nyhet -> 4 simulerte bilder -> beste -> 6 sref-varianter + captions.

Kun standardbibliotek. Ingen API-kall. Output er klar til å limes inn i Midjourney.

Bruk:
  python anti_slop_pipeline.py "black and white spray stencil on wet Bergen concrete" "Kommunen stenger varmestua ..."
  python anti_slop_pipeline.py "<base>" @nyhet.txt --seed 1234 --ut output.json

Skriver output.json ({"base", "variants", "captions", "suno_line", ...}) og captions.txt (klar til posting).
Etter at du har kjørt /imagine i Midjourney: bytt [SREF_URL] med URL-en til beste bilde.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import re
import sys
from collections import Counter
from pathlib import Path

# Endre her hvis Midjourney-versjonen eller stilen din er en annen.
MJ_VERSJON = "8.2"
MJ_PARAMS = f"--ar 4:5 --raw --stylize 150 --v {MJ_VERSJON}"
SREF_PLASSHOLDER = "[SREF_URL]"
SREF_VEKT = 300

SLOP_PROMPT = ["8k", "4k", "masterpiece", "trending on artstation", "octane render", "unreal engine",
               "hyperrealistic", "hyper-realistic", "highly detailed", "ultra detailed", "award-winning",
               "stunning", "breathtaking", "epic", "cinematic lighting", "beautiful", "best quality"]

STOPPORD = set("""og i jeg det at en et den til er som på de med han av ikke der så var meg seg men har om vi
hun nå over da ved fra du ut sin dem oss opp man kan hvor eller hva skal vil bli ble kunne inn når være noen noe
for mot få fikk også bare sier ifølge mer mange år nye første siste etter denne dette under enn igjen samtidig
kommunen kommune regjeringen staten norge bergen oslo sentrum prosent kroner millioner milliarder melder øker
økt kutter fjerner stenger bruker ansatt januar desember nyttår uke dager""".split())

SCENER_START = [
    "close-up of the figure, overspray halo, drips running from the edges",
    "wide shot on a rain-soaked bus shelter, torn municipal poster beside it",
    "night, single sodium streetlight, half covered by grey cover-up paint",
    "on a steep Bergen staircase seen from below, fog over the mountain",
]
SCENER_SERIE = [
    "same stencil figure, tight crop, the word '{K1}' cut into the stencil, red paint dripping",
    "the motif repeated three times on concrete, each print fainter, like a stamp running dry",
    "the figure turned away, holding a cardboard sign that reads '{K1}'",
    "the stencil on a fish market crate at Bryggen, {k2} written in marker underneath",
    "the same figure sprayed on a closed shop shutter, a city worker scrubbing at the corner",
    "dawn, wet asphalt, the stencil reflected in a puddle, {k1} in small stencil letters",
]
CAPTIONS = [
    "Jeg leste om {k1} og hadde boksen i hånda før kaffen ble kald. Nå står det på veggen.",
    "{C1}. {C2}. Ingen forklaring. Bare maling og regn.",
    "Saken heter {k1}. Jeg kaller det betong de må vaske i morgen.",
    "Noen tjener på {k1}. Det er ikke deg.",
    "Veggen var grå i går. {C1} har gitt den farge. Ikke takk meg.",
]
SUNO = [
    "[norsk punk spoken word, skitten gitar, 92 bpm, hes vokal] {k1} på veggen, {k2} i regnet, ingen tar telefonen",
    "[lo-fi industrial, tung bass, 78 bpm, hvisket norsk vokal] de malte over {k1} men {k2} siver gjennom",
]


def les_input(verdi: str) -> str:
    """'@fil.txt' leser fra fil, '-' leser fra stdin, ellers brukes teksten direkte."""
    if verdi == "-":
        return sys.stdin.read()
    if verdi.startswith("@"):
        return Path(verdi[1:]).read_text(encoding="utf-8")
    return verdi


def nokkelord(tekst: str, n: int = 2) -> list[str]:
    ord_ = [o.lower() for o in re.findall(r"[A-Za-zÆØÅæøå][A-Za-zÆØÅæøå\-]+", tekst)]
    tittel = set(ord_[:12])
    teller = Counter(o for o in ord_ if o not in STOPPORD and len(o) >= 4)
    for o in teller:
        teller[o] += (1.5 if o in tittel else 0) + (0.5 if len(o) >= 8 else 0)
    rangert = [o for o, _ in sorted(teller.items(), key=lambda kv: (-kv[1], -len(kv[0]), kv[0]))]
    return (rangert + ["systemet", "stillheten"])[:n]


def rens(prompt: str) -> str:
    for s in SLOP_PROMPT:
        prompt = re.sub(r"(?i)(?<![\w-])" + re.escape(s) + r"(?![\w-])\s*,?\s*", "", prompt)
    return re.sub(r"\s{2,}", " ", re.sub(r",\s*,+", ",", prompt)).strip(" ,")


def lag_pakke(base: str, nyhet: str, seed: int | None = None) -> dict:
    seed = seed if seed is not None else int(hashlib.sha256((base + nyhet).encode()).hexdigest()[:8], 16)
    random.seed(seed)
    k1, k2 = nokkelord(nyhet)
    f = {"k1": k1, "k2": k2, "K1": k1.upper(), "C1": k1.capitalize(), "C2": k2.capitalize()}
    utvidet = rens(f"{base}, raw satirical street stencil about {k1} and {k2}, rough cut edges, one red accent, "
                   f"no polish")

    bilder = []
    for i, scene in enumerate(SCENER_START, 1):
        s = random.randint(0, 4294967295)
        prompt = f"{utvidet}, {scene} {MJ_PARAMS} --seed {s}"
        score = round(len(prompt) / 400 + random.random(), 3)  # lengde + tilfeldig faktor
        bilder.append({"nr": i, "seed": s, "prompt": prompt, "score": score})
    beste = max(bilder, key=lambda b: b["score"])

    variants = [f"{rens(base)}, {s.format(**f)} {MJ_PARAMS} --sref {SREF_PLASSHOLDER} --sw {SREF_VEKT} --seed {beste['seed']}"
                for s in SCENER_SERIE]
    captions = [c.format(**f) for c in random.sample(CAPTIONS, 3)]
    return {
        "base": base,
        "nyhet": nyhet.strip().splitlines()[0][:120] if nyhet.strip() else "",
        "seed": seed,
        "utvidet_prompt": utvidet,
        "bilder": bilder,
        "valgt": beste,
        "variants": variants,
        "captions": captions,
        "suno_line": random.choice(SUNO).format(**f),
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("base_prompt", help="base-prompt (tekst, @fil eller -)")
    ap.add_argument("nyhet", help="nyhetstekst (tekst, @fil eller -)")
    ap.add_argument("--seed", type=int, help="master-seed (standard: avledet fra input)")
    ap.add_argument("--ut", default="output.json", help="JSON-fil (standard: output.json)")
    a = ap.parse_args(argv)

    pakke = lag_pakke(les_input(a.base_prompt).strip(), les_input(a.nyhet), a.seed)
    ut = Path(a.ut)
    ut.write_text(json.dumps(pakke, ensure_ascii=False, indent=2), encoding="utf-8")
    txt = ut.with_name("captions.txt")
    txt.write_text("\n\n".join(pakke["captions"]) + "\n\n" + pakke["suno_line"] + "\n", encoding="utf-8")

    print(f"Beste bilde: nr {pakke['valgt']['nr']} (seed {pakke['valgt']['seed']}, score {pakke['valgt']['score']})\n")
    print("/imagine (start):\n" + pakke["valgt"]["prompt"] + "\n")
    print(f"6 varianter (bytt {SREF_PLASSHOLDER} med URL til beste bilde):")
    for i, v in enumerate(pakke["variants"], 1):
        print(f"{i}. {v}")
    print(f"\n-> {ut}  ·  {txt}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
