#!/usr/bin/env python3
"""Genererer .claude/skills/<slug>/SKILL.md og OPPGAVER.md fra tools/oppgaver_data.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from oppgaver_data import O, K

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def skill(o):
    kilder = "\n".join(f"- [{K[k][0]}]({K[k][1]})" for k in o["kilder"]) or "- Operatørens fil (se argument). Ingen Notion-side funnet for denne."
    steg = "\n".join(f"{i}. {s}" for i, s in enumerate(o["steg"], 1))
    lev = "\n".join(f"- {x}" for x in o["leveranse"])
    ferdig = "\n".join(f"- [ ] {x}" for x in o["ferdig"])
    stopp = "\n".join(f"- {x}" for x in o["stopp"] + ["Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp)."])
    desc = f"Oppgave {o['nr']:02d}/50 ({o['kat']}): {o['tittel']}."
    hint = f'argument-hint: "{o["hint"]}"\n' if o["hint"] else ""
    return f"""---
name: {o['slug']}
description: "{desc}"
disable-model-invocation: true
effort: {o['effort']}
{hint}metadata:
  nr: {o['nr']}
  kategori: "{o['kat']}"
---
# {o['nr']:02d} · {o['tittel']}

**Kategori:** {o['kat']}

## Hvorfor høy verdi
{o['verdi']}

## Kilder i systemet ditt
{kilder}

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O{o['nr']:02d} "{o['tittel']}"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
{steg}

## Leveranse
{lev}

## Ferdigkrav
{ferdig}
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
{stopp}

## Kjør med mål
```
/goal {o['goal']}
```
"""

def main():
    base = os.path.join(ROOT, ".claude", "skills")
    for o in O:
        d = os.path.join(base, o["slug"])
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "SKILL.md"), "w", encoding="utf-8") as f:
            f.write(skill(o))
    # oversikt
    kats = []
    for o in O:
        if o["kat"] not in kats:
            kats.append(o["kat"])
    ut = ["# 50 Claude Code-oppgaver for MR ART", "",
          "Rangert etter verdi for deg: 01 er viktigst. Hver oppgave er en ferdig skill — skriv `/<kommando>` i Claude Code.", "",
          "## Start her (uke 1)", "",
          "1. `/oppstart` — installer og bevis at sperrene virker.",
          "2. `/ja-nei-ko` — tøm KLAR-køen (Lageranalysens sperre).",
          "3. `/ukesagent-demo` eller `/cowboy-salgsside` — lukk én verdiløkke (P0).",
          "4. `/doseark-karantene` — lås ned den medisinske risikoen.",
          "5. `/diktat-fra-senga` — gjør stemmen din til input uten PC.", ""]
    for k in kats:
        ut += [f"## {k}", "", "| Nr | Kommando | Oppgave | Hvorfor |", "|---|---|---|---|"]
        for o in O:
            if o["kat"] == k:
                v = o["verdi"].split(". ")[0].rstrip(".") + "."
                ut.append(f"| {o['nr']:02d} | `/{o['slug']}` | {o['tittel']} | {v} |")
        ut.append("")
    with open(os.path.join(ROOT, "OPPGAVER.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(ut))
    print(f"{len(O)} skills skrevet")

if __name__ == "__main__":
    main()
