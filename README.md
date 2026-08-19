# rolig-pusterom-miniapp
Rolig mini-app for å dempe stress og nedstemthet. Ren HTML/CSS/JS, ingen avhengigheter, ingen server — alt lagres lokalt i nettleseren (`localStorage`). Installerbar som PWA (manifest + service worker).

## Sider

- **Hjem** — daglig sjekk-inn: humør (1–5) og et valgfritt notat.
- **Pusterom** — styrt pusteøvelse (4-2-6 sekunder) med en pustende sirkel og en valgfri myk, genererende lyd (Web Audio) som følger inn-/utpust.
- **Speil** — skriv noen ord, få en privat grounding-protokoll (vises aldri lagret), et stykke generativ kunst (seedet flow-field, farget etter humør) og en delbar «vibe-kode» + mikro-dikt du kan kopiere.
- **Små grep** — enkle, konkrete ting å gjøre akkurat nå, med daglig avkrysning.
- **Innsikt** — enkel, helt lokal mønstergjenkjenning fra egen historikk: streak, sparkline over siste 14 sjekk-inn, ukedagsmønster og trend.
- **Historikk** — full logg over sjekk-inn og en enkel ukesoppsummering.

## Personvern

Ingen backend, ingen analytics, ingen nettverkskall. All data (sjekk-inn, notater, fullførte grep) lever kun i `localStorage` på enheten. Speil-protokollen genereres og vises, men lagres aldri.

## Idéer til videre utvikling

Se [`IDEAS.md`](./IDEAS.md) for brainstorm rundt fysiske oppfinnelser og kunstkonsepter i samme univers.
