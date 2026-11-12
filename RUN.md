# RUN

## Åpne

1. Last ned `index.html`, `isolation-mirror.html` og mappen `audio/` til samme sted.
2. Åpne `index.html` i Safari eller Chrome.
3. På iPhone: Del → Legg til på Hjem-skjerm (valgfritt).

Ingen server. Ingen konto.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» merket i dag |

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.

## Korte øyeblikk (lyd)

Pusterom har 5 sett × 10 korte mindfulness-setninger og en metal-riff. Lydfilene er vanlige mp3-er i `audio/`. Appen spiller dem lokalt og snakker aldri med noen server.

Tekstene ligger i `audio/mindfulness.json`. Lyden lages én gang med ElevenLabs:

```
npm install
ELEVENLABS_API_KEY=... npm run generate:audio        # bare det som mangler
ELEVENLABS_API_KEY=... npm run generate:audio -- --force   # alt på nytt
```

Endret bare tekst? `npm run generate:manifest` oppdaterer `audio/clips.js` uten å lage lyd.
