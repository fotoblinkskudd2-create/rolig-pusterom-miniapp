"""Oppgave 5: Rå tekst -> kapitler, de 10 hardeste setningene og en kort synopsis.

Kjører LOKALT som standard (ingen tekst forlater maskinen). --llm sender teksten til Claude
for bedre kapitteltitler og synopsis. Bruk --llm bare på tekst du er komfortabel med å sende.
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

from . import llm
from .tekstverktoy import nokkelord, ord_i, setninger

# Ord som bærer tyngde i tekst om familie, svik, rettssystem og makt. Utvid fritt.
TUNGE_ORD = {
    "svik": 3, "sveket": 3, "forrådt": 3, "løgn": 3, "løy": 3, "løgner": 3, "hat": 3, "hatet": 3, "død": 3,
    "døde": 3, "drept": 3, "blod": 3, "knust": 3, "skam": 3, "skammen": 3, "makt": 2, "fengsel": 3,
    "barnevern": 3, "barnevernet": 3, "rettssak": 3, "dom": 2, "dommen": 2, "dommer": 2, "tvang": 3,
    "tvangen": 3, "overgrep": 3, "raseri": 3, "redsel": 2, "frykt": 2, "taus": 2, "stille": 1, "aldri": 2,
    "alltid": 1, "ingen": 1, "ingenting": 2, "tok": 1, "mistet": 2, "stjal": 3, "slo": 3, "skrek": 2,
    "gråt": 2, "begravelse": 3, "advokat": 2, "politiet": 2, "staten": 2, "systemet": 2, "nav": 2,
    "mor": 1, "far": 1, "mamma": 1, "pappa": 1, "bror": 1, "søster": 1, "barna": 2, "barnet": 2,
    "gjeld": 2, "inkasso": 2, "tvangssalg": 3, "utkastelse": 3, "papirer": 1, "vedtak": 2, "klage": 1,
}
ABSOLUTT = {"aldri", "alltid", "ingen", "ingenting", "alle", "hver"}


def score_setning(s: str) -> tuple[float, list[str]]:
    ord_ = [o.lower() for o in ord_i(s)]
    n = len(ord_)
    if n < 4:
        return 0.0, []
    grunner = []
    tyngde = sum(TUNGE_ORD.get(o, 0) for o in ord_)
    if tyngde:
        grunner.append(f"tyngde {tyngde}")
    poeng = float(tyngde)
    if 4 <= n <= 22:  # korte setninger slår hardere
        poeng += 2
        grunner.append("kort")
    elif n > 35:
        poeng -= 2
    if "jeg" in ord_ or "meg" in ord_:
        poeng += 1.5
        grunner.append("førsteperson")
    if any(o in ABSOLUTT for o in ord_):
        poeng += 1
        grunner.append("absolutt")
    if re.search(r"\d", s):
        poeng += 1
        grunner.append("konkret tall")
    if s.rstrip().endswith("!"):
        poeng += 0.5
    if s.rstrip().endswith("?"):
        poeng -= 0.5
    return round(poeng, 2), grunner


def finn_kapitler(tekst: str, maal_antall: int = 0) -> list[dict]:
    """Bruker eksplisitte overskrifter hvis de finnes, ellers deler på avsnitt i omtrent like store biter."""
    linjer = tekst.splitlines()
    overskrift_re = re.compile(r"^\s*(#{1,3}\s+.+|kapittel\s+\S+.*|[A-ZÆØÅ0-9 ,.!?\-]{6,60})\s*$", re.I)
    treff = [i for i, l in enumerate(linjer) if l.strip() and overskrift_re.match(l) and len(l.split()) <= 10
             and (l.lstrip().startswith("#") or l.lower().lstrip().startswith("kapittel") or l.strip().isupper())]
    if len(treff) >= 2:
        kapitler = []
        for j, start in enumerate(treff):
            slutt = treff[j + 1] if j + 1 < len(treff) else len(linjer)
            kropp = "\n".join(linjer[start + 1 : slutt]).strip()
            if kropp:
                kapitler.append({"tittel": linjer[start].strip().lstrip("#").strip(), "tekst": kropp, "kilde": "overskrift"})
        if kapitler:
            return kapitler

    avsnitt = [a.strip() for a in re.split(r"\n\s*\n", tekst) if a.strip()]
    if not avsnitt:
        return []
    totalt = sum(len(a.split()) for a in avsnitt)
    antall = maal_antall or max(1, min(12, round(totalt / 900)))
    maal_ord = totalt / antall
    kapitler, buffer, ordtall = [], [], 0
    for a in avsnitt:
        buffer.append(a)
        ordtall += len(a.split())
        if ordtall >= maal_ord and len(kapitler) < antall - 1:
            kapitler.append("\n\n".join(buffer))
            buffer, ordtall = [], 0
    if buffer:
        kapitler.append("\n\n".join(buffer))
    return [{"tittel": "Kapittel " + str(i) + ": " + " / ".join(nokkelord(k, 3)), "tekst": k, "kilde": "lengde"}
            for i, k in enumerate(kapitler, 1)]


def hardeste(tekst: str, antall: int = 10) -> list[dict]:
    sett, ut = set(), []
    scoret = sorted(((score_setning(s), s) for s in setninger(tekst)), key=lambda x: -x[0][0])
    for (poeng, grunner), s in scoret:
        noekkel = s.lower()[:80]
        if poeng <= 0 or noekkel in sett:
            continue
        sett.add(noekkel)
        ut.append({"setning": s, "score": poeng, "hvorfor": grunner})
        if len(ut) == antall:
            break
    return ut


def synopsis_lokal(kapitler: list[dict]) -> str:
    """Ekstraktiv synopsis: den tyngste setningen fra hvert kapittel (maks 5)."""
    valgt = []
    for k in kapitler:
        beste = hardeste(k["tekst"], 1)
        if beste:
            valgt.append(beste[0]["setning"])
    return " ".join(valgt[:5])


SYSTEM = """Du er redaktør for en rå, sann bok om familie, svik og møtet med systemet. Du pynter ikke, du strukturerer.
Behold forfatterens ord. Ikke finn på hendelser. Ikke legg til moral. Navn på privatpersoner skal ikke gjentas i titler."""


def kjor(tekst: str, ut: Path, bruk_llm: bool = False, kapitler_antall: int = 0, antall: int = 10) -> dict:
    if not tekst.strip():
        raise SystemExit("Teksten er tom.")
    kapitler = finn_kapitler(tekst, kapitler_antall)
    harde = hardeste(tekst, antall)
    synopsis = synopsis_lokal(kapitler)
    modus = "lokal"

    if bruk_llm:
        if not llm.tilgjengelig():
            raise SystemExit("--llm krever ANTHROPIC_API_KEY. Kjør uten --llm for lokal behandling.")
        oversikt = [{"nr": i, "tittel": k["tittel"], "start": k["tekst"][:600]} for i, k in enumerate(kapitler, 1)]
        svar = llm.json_svar(SYSTEM, "Kapitler (start av hvert):\n" + json.dumps(oversikt, ensure_ascii=False, indent=2) +
                             "\n\nHardeste setninger:\n" + json.dumps([h["setning"] for h in harde], ensure_ascii=False) +
                             "\n\nReturner JSON {\"titler\": [én kort, hard tittel per kapittel i samme rekkefølge], "
                             "\"synopsis\": \"3–5 setninger, førsteperson, uten pynt\"}")
        titler = svar.get("titler", [])
        for k, t in zip(kapitler, titler):
            if t:
                k["tittel"] = str(t)
        synopsis = str(svar.get("synopsis") or synopsis)
        modus = f"claude:{llm.MODELL}"

    data = {
        "modus": modus,
        "ord_totalt": len(tekst.split()),
        "kapitler": [{"nr": i, "tittel": k["tittel"], "ord": len(k["tekst"].split()), "kilde": k["kilde"],
                      "start": " ".join(k["tekst"].split()[:25])} for i, k in enumerate(kapitler, 1)],
        "hardeste": harde,
        "synopsis": synopsis,
    }
    ut.mkdir(parents=True, exist_ok=True)
    stamme = ut / f"struktur-{datetime.now():%Y%m%d-%H%M%S}"
    stamme.with_suffix(".json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    kap_dir = stamme.parent / (stamme.name + "-kapitler")
    kap_dir.mkdir(exist_ok=True)
    for i, k in enumerate(kapitler, 1):
        (kap_dir / f"{i:02d}.md").write_text(f"# {k['tittel']}\n\n{k['tekst']}\n", encoding="utf-8")
    stamme.with_suffix(".md").write_text(_markdown(data), encoding="utf-8")
    return {"md": str(stamme.with_suffix(".md")), "kapittelmappe": str(kap_dir), **data}


def _markdown(d: dict) -> str:
    linjer = ["# Struktur", "", f"{d['ord_totalt']} ord · modus: {d['modus']}", "", "## Synopsis", "", d["synopsis"], "",
              "## Kapitler", ""]
    linjer += [f"{k['nr']}. **{k['tittel']}** ({k['ord']} ord) – {k['start']}…" for k in d["kapitler"]]
    linjer += ["", "## De hardeste setningene", ""]
    linjer += [f"{i}. {h['setning']}" for i, h in enumerate(d["hardeste"], 1)]
    return "\n".join(linjer) + "\n"
