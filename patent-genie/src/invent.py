"""Steg 5: oppfinnelsesmotoren. Tar de beste hullene fra gaps.md og skriver briefer.

Regler i kode:
- Navn som står i leveranselogg hoppes over (CLAUDE.md regel 4).
- Prototype over 1500 kr avvises.
- Navn må være ett ord med store bokstaver.
"""
from __future__ import annotations

import re

from common import (GAPS_MD, INVENTIONS, ConfigError, append_log, claude,
                    parse_json, read_log_names, read_status)

SYSTEM = (
    "Du lager oppfinnelsesbriefer i AI-tech. Skriv på norsk, korte setninger, tall foran adjektiver. "
    "Merk påstander DOKUMENTERT, BEREGNET, HYPOTESE eller UAVKLART. "
    "Prototype skal være byggbar på én helg og maks 1500 kr. Ikke gi juridisk råd."
)

PROMPT = """Her er hullene (hypoteser):

{gaps}

Velg de {n} beste hullene. Lag én oppfinnelse per hull.
Disse NAVNENE finnes allerede i loggen og må IKKE brukes: {known}

Svar kun med en JSON-liste. Ingen tekst utenfor.
Hvert element har disse feltene:
{{
  "navn": "ETT NORSK ORD I STORE BOKSTAVER",
  "hull_nr": 1,
  "en_setning": "...",
  "kildepatenter": [{{"nr": "7012345"}}],
  "nytt": "Hva som er ditt bidrag, det som gjør det patenterbart",
  "prototype": [{{"del": "...", "pris_kr": 0}}],
  "kjoper": "Hvem betaler, hvor mye, hvorfor nå",
  "forste_test": "Ett målbart eksperiment med ja/nei-svar",
  "skatteFunn": "Én setning: hva er FoU-usikkerheten?"
}}
"""


def brief_md(b: dict, kilder: list[str], total: int) -> str:
    kildelinjer = "\n".join(f"- {nr} — status: {read_status(nr)}" for nr in kilder) or "- ingen"
    deler = "\n".join(
        f"- {d.get('del')}: {d.get('pris_kr', 0)} kr" for d in b.get("prototype", [])
    )
    return (
        f"# {b['navn']}\n\n"
        f"**ÉN SETNING:** {b['en_setning']}\n\n"
        f"**KILDEPATENTER:**\n{kildelinjer}\n\n"
        f"**NYTT:** {b['nytt']}\n\n"
        f"**PROTOTYPE (sum {total} kr, maks 1500):**\n{deler}\n\n"
        f"**KJØPER:** {b['kjoper']}\n\n"
        f"**FØRSTE TEST:** {b['forste_test']}\n\n"
        f"**SKATTEFUNN:** {b['skatteFunn']}\n\n"
        "**Dom:** UAVKLART (ikke red-teamet ennå)\n\n"
        f"_Hull nr {b.get('hull_nr')} fra gaps.md. Ikke juridisk råd._\n"
    )


def main(n: int = 3) -> dict:
    if not GAPS_MD.exists():
        raise ConfigError("Mangler data/gaps.md. Kjør steg 4 først.")
    known = read_log_names()
    raw = claude(
        PROMPT.format(gaps=GAPS_MD.read_text(encoding="utf-8")[:12000], n=n,
                      known=", ".join(sorted(known)) or "ingen"),
        max_tokens=4000,
        system=SYSTEM,
    )
    briefs = parse_json(raw, "[")
    INVENTIONS.mkdir(parents=True, exist_ok=True)

    written, skipped = [], []
    for b in briefs[:n]:
        navn = str(b.get("navn", "")).strip().upper()
        if not re.fullmatch(r"[A-ZÆØÅ]+", navn):
            skipped.append((navn or "?", "navn er ikke ett ord"))
            continue
        if navn in known or (INVENTIONS / f"{navn}.md").exists() or (DEAD / f"{navn}.md").exists():
            skipped.append((navn, "finnes allerede i logg eller mappen"))
            continue
        total = sum(int(d.get("pris_kr", 0)) for d in b.get("prototype", []))
        if total > 1500:
            skipped.append((navn, f"prototype {total} kr er over 1500"))
            continue
        kilder = [str(k.get("nr")) for k in b.get("kildepatenter", []) if k.get("nr")]
        (INVENTIONS / f"{navn}.md").write_text(brief_md(b, kilder, total), encoding="utf-8")
        append_log(navn, "oppfinnelse", f"gaps H{b.get('hull_nr')}", "ny, ikke red-teamet")
        written.append(navn)
    return {"nye": written, "hoppet": skipped}


if __name__ == "__main__":
    print(main())
