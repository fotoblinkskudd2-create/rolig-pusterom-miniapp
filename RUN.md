# RUN

## Åpne

1. Last ned hele mappen (minst `index.html` og `isolation-mirror.html`).
2. Åpne `index.html` i Safari eller Chrome. Det virker rett fra fil.
3. På iPhone: Del → Legg til på Hjem-skjerm. Da får du ikon og fullskjerm.

Ingen server. Ingen konto.

### Offline / app-modus

Serveres mappen over http(s) (f.eks. GitHub Pages eller `npx serve .`), registreres `sw.js`
og appen virker uten nett etter første besøk. Fra `file://` hoppes dette over – appen virker likevel.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `breathSessions` | tid, mønster, antall runder (lagres når du stopper etter minst én runde) |
| `doneActions` | hvilke «små grep» merket per dag (bare siste 14 dager beholdes) |

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp.

Historikk → «Slett all historikk» (trykk to ganger) fjerner alt over.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk-ÅÅÅÅ-MM-DD.txt`.
Med alle sjekk-inn (også eldre enn de 20 som vises) og pusteøkter.

## Isolation Mirror → Grok-bot

Historikk → «Isolation Mirror →». Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.

## Når det er tungt

Små grep har hjelpetelefoner nederst: 116 123 (Mental Helse), 22 40 00 40 (Kirkens SOS), 113.
