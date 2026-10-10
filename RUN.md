# RUN

## Åpne

**Enklest:** last ned mappen, åpne `index.html` i Safari eller Chrome. Alt virker unntatt offline-modus og hjemskjerm-ikon.

**Som app på telefonen:** legg mappen ut på en hvilken som helst statisk host (GitHub Pages, Netlify) eller kjør lokalt:

```
npx http-server .
```

Åpne adressen på telefonen → Del → Legg til på Hjem-skjerm. Da får du ikon, fullskjerm, og appen virker uten nett.

Ingen server-logikk. Ingen konto.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» merket per dag (`YYYY-MM-DD`), 60 dager |
| `breaths` | tid og antall runder for pusteøkter |

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp og lagres ikke.

## Ta med / flytte

Historikk → «Ta historikken med deg»:

- **Last ned som tekst** → `pusterom-historikk.txt`. For å lese, skrive ut, vise noen.
- **Sikkerhetskopi** → `pusterom-ÅÅÅÅ-MM-DD.json`. Hent inn igjen på ny telefon eller etter at nettleserdata er slettet. Slår sammen, dupliserer ikke.
- **Slett alt** → to trykk. Da er det borte.

## Direkte lenker

`index.html#pusterom`, `#grep`, `#historikk`.

## Isolation Mirror → Grok-bot

Forsiden → 🪞 Isolation Mirror → skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.
