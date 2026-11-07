"""Felles tekstverktøy: setningsdeling, nøkkelord, slug. Ingen eksterne avhengigheter."""
from __future__ import annotations

import re
import unicodedata
from collections import Counter

STOPPORD = set("""
og i jeg det at en et den til er som på de med han av ikke der så var meg seg men ett har om vi min mitt ha hadde
hun nå over da ved fra du ut sin dem oss opp man kan hans hvor eller hva skal selv sjøl her alle vil bli ble blitt
kunne inn når være kom noen noe ville dere deg som deres kun ja etter ned skulle denne for hvis dette mot få fikk
også bare sa sier ifølge mer mange år nye ny nytt første siste andre to tre fire fem seks skal må mens både blir
var hos uten under enn hele helt like litt mye veldig alt allerede jo vel igjen the a an of to in and is for on that with
""".split())

# Ord som nesten alltid står i norske nyheter, men sjelden er kjernen i saken.
GENERISK = set("""
kommunen kommune regjeringen staten norge norsk norske bergen oslo trondheim stavanger sentrum byrådet
prosent kroner millioner milliarder samtidig ifølge melder sier mener kaller viser økt øker økning kutter kuttes
fjerner fjernes stenger stengt bruker brukes ansatt ansatte januar februar mars april juni juli august september
oktober november desember nyttår uke uken dager måneder snitt fra årets
""".split())

SETNING = re.compile(r"(?<=[.!?…])[\"»”)]?\s+(?=[\"«“(]?[A-ZÆØÅ0-9])|\n{2,}")


def setninger(tekst: str) -> list[str]:
    deler = []
    for blokk in re.split(r"\n\s*\n", tekst):
        blokk = " ".join(blokk.split())
        if not blokk:
            continue
        deler.extend(s.strip() for s in SETNING.split(blokk) if s and s.strip())
    return deler


def ord_i(tekst: str) -> list[str]:
    return re.findall(r"[A-Za-zÆØÅæøåÉéÜü][A-Za-zÆØÅæøåÉéÜü\-]+", tekst)


def nokkelord(tekst: str, n: int = 6) -> list[str]:
    """Enkle nøkkelord: innholdsord vektet etter frekvens, forekomst i tittel og lengde.

    Generiske nyhetsord (kommunen, prosent, øker ...) filtreres bort, slik at kjernen i saken løftes fram.
    """
    teller: Counter[str] = Counter()
    tittel = {o.lower() for o in ord_i(overskrift(tekst, 20))}
    for s in setninger(tekst):
        for o in ord_i(s):
            lav = o.lower()
            if lav in STOPPORD or lav in GENERISK or len(lav) < 4:
                continue
            teller[lav] += 1.0
    for o in teller:
        if o in tittel:
            teller[o] += 1.5
        if len(o) >= 8:
            teller[o] += 0.5
    rangert = sorted(teller.items(), key=lambda kv: (-kv[1], kv[0]))
    return [o for o, _ in rangert[:n]]


def slug(tekst: str, maks: int = 40) -> str:
    s = unicodedata.normalize("NFKD", tekst.lower())
    s = s.replace("æ", "ae").replace("ø", "o").replace("å", "a")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return (s[:maks].rstrip("-")) or "uten-tittel"


def overskrift(tekst: str, maks_ord: int = 14) -> str:
    """Første ikke-tomme linje, kuttet til maks_ord."""
    for linje in tekst.splitlines():
        linje = linje.strip()
        if linje:
            o = linje.split()
            return " ".join(o[:maks_ord]) + ("…" if len(o) > maks_ord else "")
    return ""
