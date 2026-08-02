# rolig-pusterom-miniapp

Rolig mini-app for å dempe stress og nedstemthet. 4 sider: Innsjekk, Pusterom, Små grep, Historikk. Ren HTML/CSS/JS med lokal lagring — ingen backend, ingen avhengigheter.

## Funksjoner

- **Hjem** – rask humørsjekk (1–5) med valgfritt notat, og lenke til krisehjelp-ressurser (Mental Helse, Kirkens SOS, 113).
- **Pusterom** – styrt pusteøvelse (4-2-6 sekunder) med animert sirkel.
- **Små grep** – enkle, konkrete ting man kan gjøre der og da, med daglig avkrysning.
- **Historikk** – oversikt over tidligere sjekk-ins, ukentlig oppsummering, samt mulighet til å laste ned egne data (JSON) eller slette alt lagret innhold.

All data lagres kun lokalt i nettleseren (`localStorage`) — ingenting sendes til noen server.

## Kjøre lokalt

Appen er statiske filer, så et enkelt HTTP-oppsett holder:

```bash
python3 -m http.server 8000
```

Åpne deretter `http://localhost:8000/index.html` i nettleseren.

## Installere som app (PWA)

Appen har en `manifest.json` og en enkel service worker (`sw.js`) for offline-bruk, slik at den kan legges til på hjemskjermen på mobil via "Legg til på Hjem-skjerm" i nettleseren.

## Deploy

Kan hostes hvor som helst som statiske filer, f.eks. GitHub Pages: aktiver Pages på `main`-branchen (rot-mappe) i repo-innstillingene.

## Personvern

Ingen konto, ingen sporing, ingen server. All informasjon (sjekk-ins og notater) blir liggende i nettleseren til brukeren sletter den selv (via "Slett alle mine data" på Historikk-siden) eller tømmer nettleserdata.
