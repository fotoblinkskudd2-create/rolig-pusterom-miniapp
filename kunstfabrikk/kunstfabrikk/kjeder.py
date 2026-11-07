"""Oppgave 3: Skill-fabrikken. Kjører eller eksporterer prompt-kjeder definert i skills/*.json.

Kjedeformat (JSON):
{
  "navn": "...", "beskrivelse": "...", "rolle": "systemprompt-rolle",
  "input": {"felt": "beskrivelse", ...},
  "regler": ["...", ...],                      # legges til felles anti-slop-regler
  "steg": [
    {"id": "a", "instruks": "... {input.felt} ...", "output": {"nokkel": "beskrivelse", ...}},
    {"id": "b", "instruks": "... {steg.a} ...",     "output": {...}}
  ]
}
Plassholdere: {input.<felt>} og {steg.<id>} (hele JSON-outputen fra et tidligere steg) eller {steg.<id>.<nøkkel>}.
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

from . import antislop, llm

SKILL_MAPPE = Path(__file__).parent / "skills"
PLASS = re.compile(r"\{(input|steg)\.([\w-]+)(?:\.([\w-]+))?\}")


def liste() -> list[dict]:
    return [{"navn": d["navn"], "beskrivelse": d["beskrivelse"], "input": d["input"]} for d in map(last, _filer())]


def _filer() -> list[Path]:
    return sorted(SKILL_MAPPE.glob("*.json"))


def last(navn_eller_sti) -> dict:
    sti = Path(navn_eller_sti)
    if not sti.exists():
        sti = SKILL_MAPPE / f"{navn_eller_sti}.json"
    if not sti.exists():
        tilgjengelige = ", ".join(p.stem for p in _filer())
        raise SystemExit(f"Fant ikke skill '{navn_eller_sti}'. Tilgjengelige: {tilgjengelige}")
    kjede = json.loads(sti.read_text(encoding="utf-8"))
    valider(kjede)
    return kjede


def valider(kjede: dict) -> None:
    for felt in ("navn", "beskrivelse", "rolle", "input", "steg"):
        if felt not in kjede:
            raise ValueError(f"Kjede mangler felt '{felt}'")
    sett: set[str] = set()
    for steg in kjede["steg"]:
        for felt in ("id", "instruks", "output"):
            if felt not in steg:
                raise ValueError(f"Steg mangler felt '{felt}': {steg}")
        for kilde, navn, _ in PLASS.findall(steg["instruks"]):
            if kilde == "input" and navn not in kjede["input"]:
                raise ValueError(f"Steg '{steg['id']}' bruker ukjent input '{navn}'")
            if kilde == "steg" and navn not in sett:
                raise ValueError(f"Steg '{steg['id']}' refererer til steg '{navn}' som ikke er kjørt ennå")
        sett.add(steg["id"])


def _system(kjede: dict) -> str:
    regler = "\n".join(f"- {r}" for r in kjede.get("regler", []))
    return f"{kjede['rolle']}\n\n{antislop.REGLER_TEKST}\n\nSpesifikke regler for denne skillen:\n{regler}"


def _fyll(instruks: str, inn: dict, resultater: dict) -> str:
    def bytt(m: re.Match) -> str:
        kilde, navn, nokkel = m.group(1), m.group(2), m.group(3)
        if kilde == "input":
            return str(inn.get(navn, ""))
        verdi = resultater[navn] if nokkel is None else resultater[navn].get(nokkel, "")
        return verdi if isinstance(verdi, str) else json.dumps(verdi, ensure_ascii=False, indent=2)
    return PLASS.sub(bytt, instruks)


def _output_krav(steg: dict) -> str:
    felt = ",\n".join(f'  "{k}": {v}' for k, v in steg["output"].items())
    return f"\n\nReturner JSON med nøyaktig disse nøklene:\n{{\n{felt}\n}}"


def kjor(navn: str, inn: dict, ut: Path, offline: bool = False) -> dict:
    kjede = last(navn)
    mangler = [f for f in kjede["input"] if not inn.get(f)]
    if mangler:
        raise SystemExit(f"Mangler input: {', '.join(mangler)}. Bruk --inn felt=verdi.")
    if offline or not llm.tilgjengelig():
        raise SystemExit(
            "Kjøring av kjeder krever Claude (sett ANTHROPIC_API_KEY). "
            "Uten nøkkel: bruk --eksporter for å få kjeden som copy-paste-prompts til Claude eller Grok."
        )
    system = _system(kjede)
    resultater: dict[str, dict] = {}
    logg = []
    for steg in kjede["steg"]:
        prompt = _fyll(steg["instruks"], inn, resultater) + _output_krav(steg)
        svar = llm.json_svar(system, prompt)
        mangler_nokler = [k for k in steg["output"] if k not in svar]
        if mangler_nokler:
            svar = llm.json_svar(system, prompt + f"\n\nForrige svar manglet nøklene {mangler_nokler}. Ta dem med.")
        resultater[steg["id"]] = svar
        slop = antislop.treff(json.dumps(svar, ensure_ascii=False))
        logg.append({"steg": steg["id"], "slop_treff": slop})
    ut.mkdir(parents=True, exist_ok=True)
    fil = ut / f"{kjede['navn']}-{datetime.now():%Y%m%d-%H%M%S}.json"
    data = {"skill": kjede["navn"], "input": inn, "resultater": resultater, "logg": logg,
            "sluttresultat": resultater[kjede["steg"][-1]["id"]]}
    fil.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"fil": str(fil), **data}


def eksporter(navn: str, inn: dict | None = None) -> str:
    """Lager en copy-paste-kjede for Claude/Grok: én systemprompt + ett innlegg per steg."""
    kjede = last(navn)
    inn = inn or {}
    linjer = [f"# Skill: {kjede['navn']}", "", kjede["beskrivelse"], "",
              "Kjør i én samtale. Lim inn SYSTEM først (eller som første melding), deretter stegene i rekkefølge.", "",
              "## SYSTEM", "", "```", _system(kjede), "```", ""]
    for i, steg in enumerate(kjede["steg"], 1):
        def bytt(m: re.Match) -> str:
            kilde, navn_, nokkel = m.group(1), m.group(2), m.group(3)
            if kilde == "input":
                return str(inn.get(navn_) or f"[{navn_.upper()}: {kjede['input'][navn_]}]")
            return f"[svaret fra steg '{navn_}'{'.' + nokkel if nokkel else ''} over]"
        tekst = PLASS.sub(bytt, steg["instruks"]) + _output_krav(steg)
        linjer += [f"## Steg {i}: {steg['id']}", "", "```", tekst.strip(), "```", ""]
    return "\n".join(linjer)
