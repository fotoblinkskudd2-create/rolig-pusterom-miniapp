#!/usr/bin/env python3
"""news_satire_agent.py – norsk nyhet inn, bare JSON ut: 2 lange Midjourney-prompts + 3 gonzo-captions.

Kun standardbibliotek. Ingen API-kall.

Bruk:
  python news_satire_agent.py nyhet.txt
  python news_satire_agent.py --tekst "Kommunen stenger varmestua ..."
  cat nyhet.txt | python news_satire_agent.py -
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

MJ_VERSJON = "8.2"
MJ_PARAMS = f"--ar 4:5 --raw --stylize 150 --v {MJ_VERSJON}"

STOPPORD = set("""og i jeg det at en et den til er som på de med han av ikke der så var meg seg men har om vi
hun nå over da ved fra du ut sin dem oss opp man kan hvor eller hva skal vil bli ble kunne inn når være noen noe
for mot få fikk også bare sier ifølge mer mange år nye første siste etter denne dette under enn igjen samtidig
kommunen kommune regjeringen staten norge bergen oslo sentrum prosent kroner millioner milliarder melder øker
økt kutter fjerner stenger bruker ansatt januar desember nyttår uke dager""".split())

PROMPTS = [
    "black and white spray stencil on a wet concrete wall: a tiny official in a grey suit stamping the word '{K1}' "
    "onto a citizen made entirely of folded paperwork, red accent paint dripping from the rubber stamp, municipal "
    "grey cover-up paint creeping in from the edges, rough hand-cut stencil lines, overspray halo, rain streaks "
    "running through the figures, raw street satire",
    "street stencil on a bus shelter panel at night: a queue of identical faceless people waiting at a door labeled "
    "'{K2}', the door is only painted on the wall and leads nowhere, one figure in red holding a crumpled form about "
    "{k1}, torn posters, chewing gum, a single sodium streetlight, drips and tape marks, raw street satire",
    "stencil sprayed on a cardboard box under a bridge: a parliament building drawn as a vending machine, coins "
    "labeled '{K1}' going in, nothing coming out, a child-sized figure pressing the empty return button, single red "
    "accent on the coin slot, wet cardboard texture, uneven overspray, raw street satire",
    "black stencil on a closed shop shutter: a giant hand turning down a thermostat labeled '{K2}' while a small "
    "crowd in coats huddles under it, frost painted in white spray, one red glowing digit, rough cut edges, "
    "a city worker scrubbing at the corner of the piece, raw street satire",
]
CAPTIONS = [
    "{C1}. Jeg leste det to ganger. Det ble ikke bedre.",
    "Saken heter {k1}. Jeg kaller det maling de må vaske bort i morgen.",
    "Noen tjener på {k1}. Det er ikke deg, og det er faen ikke meg.",
    "{C1}: nok en sak der skjemaet er viktigere enn mennesket.",
    "Jeg sprayet {k1} på betongen. Den varer lenger enn pressemeldingen.",
]


def les_fil(sti: str) -> str:
    """Leser nyhetstekst fra fil ('-' = stdin)."""
    if sti == "-":
        return sys.stdin.read()
    return Path(sti).read_text(encoding="utf-8")


def nokkelord(tekst: str, n: int = 2) -> list[str]:
    ord_ = [o.lower() for o in re.findall(r"[A-Za-zÆØÅæøå][A-Za-zÆØÅæøå\-]+", tekst)]
    tittel = set(ord_[:12])
    teller = Counter(o for o in ord_ if o not in STOPPORD and len(o) >= 4)
    for o in teller:
        teller[o] += (1.5 if o in tittel else 0) + (0.5 if len(o) >= 8 else 0)
    rangert = [o for o, _ in sorted(teller.items(), key=lambda kv: (-kv[1], -len(kv[0]), kv[0]))]
    return (rangert + ["systemet", "skjemaet"])[:n]


def satire(nyhet: str) -> dict:
    if not nyhet.strip():
        raise ValueError("tom nyhetstekst")
    rng = random.Random(int(hashlib.sha256(nyhet.encode()).hexdigest()[:8], 16))
    k1, k2 = nokkelord(nyhet)
    f = {"k1": k1, "k2": k2, "K1": k1.upper(), "K2": k2.upper(), "C1": k1.capitalize(), "C2": k2.capitalize()}
    return {
        "prompts": [p.format(**f) + " " + MJ_PARAMS for p in rng.sample(PROMPTS, 2)],
        "captions": [c.format(**f) for c in rng.sample(CAPTIONS, 3)],
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("fil", nargs="?", help="fil med nyhetstekst ('-' = stdin)")
    ap.add_argument("--tekst", help="nyhetstekst direkte")
    a = ap.parse_args(argv)
    if not (a.fil or a.tekst):
        ap.error("gi en fil eller --tekst")
    print(json.dumps(satire(a.tekst if a.tekst else les_fil(a.fil)), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
