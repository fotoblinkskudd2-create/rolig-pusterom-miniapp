#!/usr/bin/env python3
"""Merkevakt: finner umerkede påstander og svada i Markdown/tekst.

Bruk: python3 tools/merkevakt.py fil1.md [fil2.md ...] [--json]
Exit 0 = rent, 1 = funn. Et avsnitt regnes som merket hvis det inneholder
DOKUMENTERT, BEREGNET, HYPOTESE, UAVKLART eller EPLE.
"""
import json, re, sys

MERKER = re.compile(r"\b(DOKUMENTERT|BEREGNET|HYPOTESE|UAVKLART|EPLE|ANTAGELSE)\b")
PASTAND = re.compile(
    r"(\d[\d\s.,]*\s?(kr|NOK|USD|\$|€|%|prosent|mill|mrd|kunder|brukere|timer spart|t/uke)(?![A-Za-zæøåÆØÅ]))"
    r"|\b(inntekt|omsetning|patentert|patenterbar|klinisk (bevist|effekt)|garantert|beviser at)\b",
    re.IGNORECASE)
SVADA = [
    "i dagens raskt skiftende", "revolusjonerende", "banebrytende", "sømløs", "game changer",
    "ta det til neste nivå", "i en verden der", "unik mulighet", "spennende reise",
    "håper dette hjelper", "ikke nøl med å", "kraftfull løsning", "skreddersydd for deg",
]

def _enheter(tekst: str):
    """Deler i vurderingsenheter: avsnitt, men tabellrader og listepunkter hver for seg.
    Kodeblokker (```) hoppes over."""
    enhet, start, i_kode = [], 1, False
    for nr, l in enumerate(tekst.split("\n"), 1):
        if l.lstrip().startswith("```"):
            i_kode = not i_kode
            if enhet: yield start, "\n".join(enhet); enhet = []
            continue
        if i_kode:
            continue
        s = l.lstrip()
        frittstaende = s.startswith("|") or re.match(r"^([-*]|\d+\.)\s", s)
        if not s or frittstaende:
            if enhet: yield start, "\n".join(enhet); enhet = []
            if frittstaende: yield nr, l
            continue
        if not enhet: start = nr
        enhet.append(l)
    if enhet: yield start, "\n".join(enhet)

def sjekk(tekst: str):
    funn = []
    for linje, a in _enheter(tekst):
        if PASTAND.search(a) and not MERKER.search(a):
            funn.append({"linje": linje, "type": "umerket påstand", "utdrag": a.strip()[:120]})
        lav = a.lower()
        for s in SVADA:
            if s in lav:
                funn.append({"linje": linje, "type": "svada", "utdrag": s})
    return funn

def main(argv):
    som_json = "--json" in argv
    filer = [a for a in argv if not a.startswith("--")]
    if not filer:
        print(__doc__); return 2
    alle = {}
    for f in filer:
        with open(f, encoding="utf-8") as h:
            alle[f] = sjekk(h.read())
    total = sum(len(v) for v in alle.values())
    if som_json:
        print(json.dumps(alle, ensure_ascii=False, indent=2))
    else:
        for f, fu in alle.items():
            for x in fu:
                print(f"{f}:{x['linje']}: {x['type']}: {x['utdrag']}")
        print(f"MERKEVAKT: {total} funn i {len(filer)} fil(er)")
    return 1 if total else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
