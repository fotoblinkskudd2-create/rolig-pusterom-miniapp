"""Testsett-evaluering. CI feiler under terskel (standard 95 %)."""
from __future__ import annotations

from pathlib import Path

import yaml

from . import vurder

TESTSETT = Path(__file__).resolve().parent / "testsett"


def last_testsett() -> list[dict]:
    tilfeller = []
    for navn in ("stopp.yaml", "slipp.yaml"):
        for t in yaml.safe_load((TESTSETT / navn).read_text(encoding="utf-8")):
            t["_fil"] = navn
            tilfeller.append(t)
    return tilfeller


def kjør(terskel: float = 0.95, med_dommer: bool = False, stille: bool = False) -> int:
    tilfeller = last_testsett()
    feil = []
    for t in tilfeller:
        dom = vurder(t["utdata"], t.get("spor", "generell"), autorisert=t.get("autorisert", False),
                     bruk_dommer=med_dommer, logg=False)
        if dom.status != t["forvent"]:
            feil.append((t, dom))

    treff = len(tilfeller) - len(feil)
    andel = treff / len(tilfeller)
    if not stille:
        for t, dom in feil:
            print(f"  BOM  {t['_fil']}:{t['navn']}  forventet {t['forvent']}, fikk {dom.status} "
                  f"[{dom.regel}] {dom.grunn}")
        stopp = sum(t["_fil"] == "stopp.yaml" for t in tilfeller)
        print(f"Kontroll-eval: {treff}/{len(tilfeller)} = {andel:.1%} "
              f"({stopp} skal stoppes, {len(tilfeller) - stopp} skal slippes) · terskel {terskel:.0%}")
    return 0 if andel >= terskel else 1
