# RUN

## Åpne

1. Last ned `index.html` og `isolation-mirror.html` i samme mappe.
2. Åpne `index.html` i Safari eller Chrome.
3. På iPhone: Del → Legg til på Hjem-skjerm (valgfritt).

Ingen server. Ingen konto.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» merket i dag |
| `gate` | én per dag: søvn (t), øvelser ja/nei, stress 0–10, nivå grønn/gul/rød |

## Dagens port

Hjem → fyll inn søvn, øvelser, stress → «Sjekk porten».
0 bom = grønn (én bygg + én kreativ) · 1 bom = gul (én ting, 45 min) · 2+ bom, søvn < 4,5 eller stress ≥ 8 = rød (ingen bygging).
3 røde på 7 dager = stopp all bygging i 7 dager og snakk med fastlege/behandler. Tersklene står i `gateLevel()`.

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.
