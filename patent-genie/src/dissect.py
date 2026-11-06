"""Steg 2: dissekering med Claude. Batch på 10. Eksisterende filer hoppes over."""
from __future__ import annotations

import re
import sys

from common import DISSECTED, RAW, claude, gullgrad, load_json

SYSTEM = (
    "Du er patentanalytiker. Skriv på norsk, korte setninger, tall foran adjektiver. "
    "Merk hver påstand med én av: DOKUMENTERT, BEREGNET, HYPOTESE, UAVKLART. "
    "DOKUMENTERT krever at kilden står i teksten du fikk. Ellers HYPOTESE eller UAVKLART. "
    "Ikke gi juridisk råd. Ikke oppgi priser som fakta uten kilde: merk dem BEREGNET eller HYPOTESE."
)

PROMPT = """Patent {nr}: {tittel}
Innlevert: {innlevert}. Innehaver: {innehaver}. CPC: {cpc}. Siteringer: {sit}

SAMMENDRAG:
{sammendrag}

FØRSTE KRAV:
{krav}

Skriv nøyaktig disse seksjonene med overskrifter, og ingen tekst før eller etter:

## KLAVEN
Hva låser krav 1 faktisk? Ett avsnitt i vanlig norsk.

## LOKKET
Hva lover patentet? Hvilket problem påstår det å løse?

## MEKANISMEN
Hvordan virker det, steg for steg? Maks 6 steg.

## SANNHETEN
Hva var umulig eller dyrt i innleveringsåret ({aar}) som er billig i dag?
(regnekraft, sensorer, LLM-er, mikrokontrollere, edge-AI). Konkrete prisforskjeller, merket BEREGNET eller HYPOTESE.

GULLGRAD 1–10: <tall> — <begrunnelse i én setning>
"""


def build_md(p: dict, body: str) -> str:
    return (
        f"# Patent {p['nummer']}\n\n"
        f"**Tittel:** {p.get('tittel')}\n"
        f"**Innlevert:** {p.get('innlevert')} · **Innehaver:** {p.get('innehaver')} · "
        f"**CPC:** {', '.join(p.get('cpc') or []) or 'ukjent'}\n"
        f"**Siteringer:** {p.get('siteringer')}\n\n"
        "**Juridisk status:** UAVKLART — ikke verifisert ennå (steg 3).\n\n"
        f"{body.strip()}\n"
    )


def main(limit: int | None = None) -> dict:
    gull = load_json(RAW / "gullgruva.json")
    DISSECTED.mkdir(parents=True, exist_ok=True)
    todo = [p for p in gull if not (DISSECTED / f"{p['nummer']}.md").exists()]
    skipped = len(gull) - len(todo)
    if limit is not None:
        todo = todo[:limit]

    done = errors = 0
    for i in range(0, len(todo), 10):
        batch = todo[i : i + 10]
        print(f"batch {i // 10 + 1}: {len(batch)} patenter")
        for p in batch:
            nr = p["nummer"]
            try:
                prompt = PROMPT.format(
                    nr=nr,
                    tittel=p.get("tittel"),
                    innlevert=p.get("innlevert"),
                    innehaver=p.get("innehaver"),
                    cpc=", ".join(p.get("cpc") or []),
                    sit=p.get("siteringer"),
                    sammendrag=(p.get("sammendrag") or "")[:3000],
                    krav=(p.get("forste_krav") or "ukjent")[:4000],
                    aar=(p.get("innlevert") or "????")[:4],
                )
                body = claude(prompt, max_tokens=1500, system=SYSTEM)
                if gullgrad(body) is None:
                    raise ValueError("svaret mangler GULLGRAD-linje")
                (DISSECTED / f"{nr}.md").write_text(build_md(p, body), encoding="utf-8")
                done += 1
            except Exception as exc:
                errors += 1
                print(f"  FEIL {nr}: {exc}", file=sys.stderr)
    return {"dissekert": done, "feil": errors, "hoppet_over": skipped}


if __name__ == "__main__":
    print(main())
