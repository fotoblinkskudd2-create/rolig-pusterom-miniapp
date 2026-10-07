"""KONTROLLMOTOR — portvakt foran alt.

All output fra alle motorer passerer `vurder()` (eller `@kontrollert`) før den
lagres eller vises.

  Lag 1: deterministiske sjekker fra regler.yaml (regex, nøkkelord, Merke-felt,
         strukturerte handlinger).
  Lag 2: Grok-dommer, kun hvis lag 1 slapp. Strukturert JSON
         {status: SLIPP|STOPP|RETT, grunn, linje}.

STOPP → kontroll/avvist.jsonl.  RETT → Dom.fiks har foreslått rettet output.
"""
from __future__ import annotations

import datetime as _dt
import functools
import hashlib
import json
import os
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Callable

import yaml

import grokkjerne

MAPPE = Path(__file__).resolve().parent
REGLER_STI = MAPPE / "regler.yaml"
STATUSER = ("SLIPP", "STOPP", "RETT")
_KILDE = re.compile(r"https?://|\bkilde\s*:", re.I)


# ── Datatyper ──────────────────────────────────────────────────────────

@dataclass
class Dom:
    status: str                    # SLIPP | STOPP | RETT
    grunn: str = ""
    linje: int | None = None
    regel: str | None = None
    lag: str = "deterministisk"    # deterministisk | dommer | ingen
    fiks: Any = None
    treff: list[dict] = field(default_factory=list)

    @property
    def slipp(self) -> bool:
        return self.status == "SLIPP"

    def til_dict(self) -> dict:
        return asdict(self)


class KontrollStopp(Exception):
    def __init__(self, dom: Dom):
        self.dom = dom
        super().__init__(f"STOPP [{dom.regel or dom.lag}] linje {dom.linje}: {dom.grunn}")


class KontrollRett(Exception):
    def __init__(self, dom: Dom):
        self.dom = dom
        self.fiks = dom.fiks
        super().__init__(f"RETT [{dom.regel or dom.lag}] linje {dom.linje}: {dom.grunn}")


# ── Regelsett ──────────────────────────────────────────────────────────

@functools.lru_cache(maxsize=4)
def last_regler(sti: str | None = None) -> dict:
    with open(sti or REGLER_STI, encoding="utf-8") as f:
        regler = yaml.safe_load(f)
    for regel in regler.get("regler", []):
        regel["_kompilert"] = [re.compile(m, re.I | re.M) for m in regel.get("monstre", [])]
    regler["_kontekster"] = {
        navn: re.compile(m, re.I) for navn, m in (regler.get("kontekster") or {}).items()
    }
    return regler


def _som_tekst(output: Any) -> str:
    if isinstance(output, str):
        return output
    return json.dumps(output, ensure_ascii=False, indent=2, default=str)


def _aktive_spor(spor: str, tekst: str, regler: dict) -> set[str]:
    aktive = {spor, "alle"}
    for navn, monster in regler["_kontekster"].items():
        if monster.search(tekst):
            aktive.add(navn)
    return aktive


def _gjelder(regel: dict, aktive: set[str]) -> bool:
    gjelder = regel.get("gjelder", "alle")
    gjelder = [gjelder] if isinstance(gjelder, str) else gjelder
    return bool(set(gjelder) & aktive)


# ── Lag 1: deterministisk ──────────────────────────────────────────────

def _sjekk_merke(output: Any, tekst: str, spor: str, regler: dict) -> dict | None:
    cfg = regler.get("merke") or {}
    aktive = {spor}
    krevd_av = [s for s in cfg.get("paakrevd_for", []) if s in aktive]
    if not krevd_av:
        return None
    felt = cfg.get("felt", "Merke")
    standard = cfg.get("standard", "UTKAST")
    maa = {s: ord_ for s, ord_ in (cfg.get("maa_inneholde") or {}).items() if s in aktive}

    if isinstance(output, dict):
        verdi = output.get(felt.lower(), output.get(felt))
    else:
        m = re.search(rf"^\W*{re.escape(felt)}\W*:\s*(.+)$", tekst, re.I | re.M)
        verdi = m.group(1).strip() if m else None

    mangler = [ord_ for ord_ in maa.values() if not verdi or ord_.lower() not in str(verdi).lower()]
    if verdi and not mangler:
        return None

    ny_verdi = " · ".join([*mangler, str(verdi or standard)]) if mangler else standard
    if isinstance(output, dict):
        fiks = {**output, felt.lower(): ny_verdi}
    elif verdi:
        fiks = re.sub(rf"^(\W*{re.escape(felt)}\W*:\s*).+$",
                      lambda m: m.group(1) + ny_verdi, tekst, count=1, flags=re.I | re.M)
    else:
        fiks = f"{felt}: {ny_verdi}\n{tekst}"

    grunn = (f"Merke-feltet mangler (påkrevd for spor: {', '.join(krevd_av)})." if not verdi
             else f"Merke-feltet må inneholde {', '.join(mangler)}.")
    return {"regel": "merke", "utfall": "RETT", "grunn": grunn, "linje": 1, "fiks": fiks}


def _sjekk_handlinger(output: Any, regel: dict) -> dict | None:
    if not isinstance(output, dict):
        return None
    typer = {t.lower() for t in regel.get("handlingstyper", [])}
    for handling in output.get("handlinger") or []:
        t = str(handling.get("type", "") if isinstance(handling, dict) else handling).lower()
        if t in typer:
            return {"regel": regel["id"], "utfall": regel["utfall"], "linje": None,
                    "grunn": f"{regel['grunn']} (handling: {t})"}
    return None


def lag1(output: Any, spor: str = "generell", *, autorisert: bool = False,
         regler: dict | None = None) -> list[dict]:
    """Alle treff fra de deterministiske sjekkene, i regelrekkefølge."""
    regler = regler or last_regler()
    tekst = _som_tekst(output)
    aktive = _aktive_spor(spor, tekst, regler)
    linjer = tekst.splitlines() or [""]
    treff: list[dict] = []

    for regel in regler.get("regler", []):
        if not _gjelder(regel, aktive):
            continue
        if autorisert and regel.get("autorisert_overstyrer"):
            continue
        strukturert = _sjekk_handlinger(output, regel)
        if strukturert:
            treff.append(strukturert)
            continue
        for nr, linje in enumerate(linjer, 1):
            if regel.get("unntak") == "kilde_i_linje" and _KILDE.search(linje):
                continue
            m = next((m for m in (p.search(linje) for p in regel["_kompilert"]) if m), None)
            if m:
                treff.append({"regel": regel["id"], "utfall": regel["utfall"], "linje": nr,
                              "grunn": regel["grunn"], "utdrag": m.group(0)})
                break

    merke = _sjekk_merke(output, tekst, spor, regler)
    if merke:
        treff.append(merke)
    return treff


# ── Lag 2: Grok-dommer ─────────────────────────────────────────────────

def _dommer_prompt(output: Any, spor: str, regler: dict) -> tuple[str, str]:
    regeltekst = "\n".join(
        f"- [{r['id']}] gjelder={r.get('gjelder', 'alle')} utfall={r['utfall']}: {r['grunn']}"
        for r in regler.get("regler", [])
    )
    system = regler["dommer"]["instruks"] + "\nREGLER:\n" + regeltekst
    nummerert = "\n".join(f"{i:>4}| {l}" for i, l in enumerate(_som_tekst(output).splitlines(), 1))
    return system, f"SPOR: {spor}\nOUTPUT (linjenummerert):\n{nummerert}"


def tolk_dommersvar(svar: Any) -> Dom:
    """Gjør Grok-svaret om til en Dom. Alt som ikke er gyldig → STOPP (fail closed)."""
    if not isinstance(svar, dict):
        return Dom("STOPP", "Dommeren svarte ikke med et JSON-objekt.", lag="dommer")
    status = str(svar.get("status", "")).strip().upper()
    if status not in STATUSER:
        return Dom("STOPP", f"Dommeren ga ugyldig status {status!r}.", lag="dommer")
    linje = svar.get("linje")
    try:
        linje = int(linje) if linje not in (None, "", "null") else None
    except (TypeError, ValueError):
        linje = None
    return Dom(status, str(svar.get("grunn") or ""), linje, regel="dommer", lag="dommer",
               fiks=svar.get("fiks") if status == "RETT" else None)


def lag2(output: Any, spor: str, regler: dict,
         dommer: Callable[[str, str], Any] | None = None) -> Dom | None:
    """None betyr at dommeren ikke kjørte (av, eller ingen nøkkel)."""
    cfg = regler.get("dommer") or {}
    if not cfg.get("aktiv", True) or os.environ.get("KONTROLL_DOMMER", "").lower() == "av":
        return None
    if dommer is None:
        if not grokkjerne.tilgjengelig():
            return None
        dommer = lambda s, p: grokkjerne.spor(p, s, json_svar=True, temperatur=0)  # noqa: E731
    system, prompt = _dommer_prompt(output, spor, regler)
    try:
        return tolk_dommersvar(dommer(system, prompt))
    except Exception as feil:
        return Dom(cfg.get("ved_feil", "STOPP"), f"Dommeren feilet: {feil}", lag="dommer")


# ── Hovedinngang ───────────────────────────────────────────────────────

def avvist_sti() -> Path:
    return Path(os.environ.get("KONTROLL_AVVIST", MAPPE / "avvist.jsonl"))


def _logg_avvist(output: Any, spor: str, dom: Dom, kilde: str | None) -> None:
    tekst = _som_tekst(output)
    linjer = tekst.splitlines()
    rad = {
        "tid": _dt.datetime.now().isoformat(timespec="seconds"),
        "spor": spor,
        "kilde": kilde,
        "regel": dom.regel,
        "lag": dom.lag,
        "grunn": dom.grunn,
        "linje": dom.linje,
        "linjetekst": linjer[dom.linje - 1][:300] if dom.linje and dom.linje <= len(linjer) else None,
        "sha256": hashlib.sha256(tekst.encode()).hexdigest()[:16],
        "utdrag": tekst[:500],
    }
    sti = avvist_sti()
    sti.parent.mkdir(parents=True, exist_ok=True)
    with open(sti, "a", encoding="utf-8") as f:
        f.write(json.dumps(rad, ensure_ascii=False) + "\n")


def vurder(output: Any, spor: str = "generell", *, autorisert: bool = False,
           dommer: Callable[[str, str], Any] | None = None, bruk_dommer: bool = True,
           logg: bool = True, kilde: str | None = None) -> Dom:
    """Kjør output gjennom begge lag. Returnerer alltid en Dom; kaster aldri."""
    regler = last_regler()
    treff = lag1(output, spor, autorisert=autorisert, regler=regler)

    stopp = [t for t in treff if t["utfall"] == "STOPP"]
    rett = [t for t in treff if t["utfall"] == "RETT"]
    if stopp or rett:
        første = (stopp or rett)[0]
        dom = Dom("STOPP" if stopp else "RETT", første["grunn"], første.get("linje"),
                  regel=første["regel"], fiks=None if stopp else første.get("fiks"), treff=treff)
    else:
        dom = lag2(output, spor, regler, dommer) if bruk_dommer else None
        if dom is None:
            dom = Dom("SLIPP", "Lag 1 slapp. Dommer ikke kjørt (av eller ingen XAI_API_KEY).")
        dom.treff = treff

    if dom.status == "STOPP" and logg:
        _logg_avvist(output, spor, dom, kilde)
    return dom


def _autorisert_fra_miljø() -> bool:
    return os.environ.get("KONTROLL_AUTORISERT") == "1" or "--autorisert" in sys.argv


def kontrollert(_fn: Callable | None = None, *, spor: str = "generell",
                autorisert: bool | None = None, ved_rett: str = "hev"):
    """Dekorator: output fra funksjonen må gjennom portvakten.

        @kontrollert
        @kontrollert(spor="satire")
        @kontrollert(spor="slusen", ved_rett="fiks")

    SLIPP → returnerer output.  STOPP → KontrollStopp.
    RETT  → KontrollRett (med .fiks), eller returnerer fiksen hvis ved_rett="fiks".
    Autorisering: argumentet, ellers KONTROLL_AUTORISERT=1, ellers --autorisert i argv.
    """
    if ved_rett not in ("hev", "fiks"):
        raise ValueError("ved_rett må være 'hev' eller 'fiks'")

    def dekorer(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def omslag(*args, **kwargs):
            output = fn(*args, **kwargs)
            aut = _autorisert_fra_miljø() if autorisert is None else autorisert
            dom = vurder(output, spor, autorisert=aut, kilde=f"{fn.__module__}.{fn.__qualname__}")
            if dom.status == "SLIPP":
                return output
            if dom.status == "RETT" and ved_rett == "fiks" and dom.fiks is not None:
                return dom.fiks
            raise (KontrollStopp if dom.status == "STOPP" else KontrollRett)(dom)

        omslag.kontrollspor = spor
        return omslag

    return dekorer(_fn) if _fn is not None else dekorer


__all__ = ["Dom", "KontrollRett", "KontrollStopp", "kontrollert", "last_regler", "lag1",
           "lag2", "tolk_dommersvar", "vurder"]
