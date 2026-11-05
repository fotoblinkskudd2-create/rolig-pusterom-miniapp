"""Steg 4: hullfinneren. Utløpt gull (bøtte A) mot fronten (bøtte B)."""
from __future__ import annotations

from common import DISSECTED, GAPS_MD, RAW, claude, load_json

SYSTEM = (
    "Du finner hull i AI-patentfeltet. Skriv på norsk, korte setninger, tall foran adjektiver. "
    "Merk hver påstand DOKUMENTERT, BEREGNET, HYPOTESE eller UAVKLART. Ikke gi juridisk råd."
)

PROMPT = """Under er A: utløpt gull (G06N, innlevert 1995–2006) og B: fronten (innvilget siste 24 mnd).

A — UTLØPT GULL:
{a}

B — FRONTEN:
{b}

Finn inntil 10 hull. Tre typer:
  GJENOPPLIVING — utløpt mekanisme ingen i fronten bruker, men som løser et problem fronten sliter med.
  KRYSNING — to utløpte patenter som kombinert gir noe ingen av dem kunne alene.
  NEDSKALERING — patent laget for serverhaller som nå kan kjøre på en mikrokontroller under 100 kr.

Sorter etter GJENNOMFØRBARHET for én person med verksted og laptop, høyest først.
Bruk akkurat dette formatet for hvert hull:

### H<nr> · <TYPE> · GJENNOMFØRBARHET <1–10>
- **Hva:** ...
- **Hvorfor nå:** ... (merk påstanden)
- **Kilder:** <patentnumre>
- **Første steg:** ...

Ingen tekst utenfor disse blokkene.
"""


def main() -> dict:
    gull = load_json(RAW / "gullgruva.json")
    front = load_json(RAW / "fronten.json")

    a_lines = []
    for p in gull:
        path = DISSECTED / f"{p['nummer']}.md"
        summary = path.read_text(encoding="utf-8")[:900] if path.exists() else (p.get("sammendrag") or "")[:600]
        a_lines.append(f"- {p['nummer']} | {p.get('tittel')} | siteringer {p.get('siteringer')}\n{summary}")

    b_lines = [
        f"- {p['nummer']} | {p.get('tittel')} | {(p.get('sammendrag') or '')[:300]}"
        for p in front
    ]

    body = claude(
        PROMPT.format(a="\n".join(a_lines)[:24000], b="\n".join(b_lines)[:12000]),
        max_tokens=3500,
        system=SYSTEM,
    )
    GAPS_MD.parent.mkdir(parents=True, exist_ok=True)
    GAPS_MD.write_text(
        "# Hull\n\nDette er hypoteser fra modellen, ikke verifiert. Ikke juridisk råd.\n\n" + body.strip() + "\n",
        encoding="utf-8",
    )
    return {"hull": body.count("### H")}


if __name__ == "__main__":
    print(main())
