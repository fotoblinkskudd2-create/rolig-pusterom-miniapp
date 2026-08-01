# rolig-pusterom-miniapp
Rolig mini-app for å dempe stress og nedstemthet. 4 sider: Innsjekk, Pusterom, Små grep, Historikk. Pure HTML/CSS/JS med lokal lagring.

## Funksjoner
- **Innsjekk**: humørregistrering (1–5) med valgfritt notat, lagret lokalt.
- **Pusterom**: tre pustemønstre (Rolig 4-2-6, Boks 4-4-4-4, 4-7-8) med animert sirkel og rundeteller.
- **Små grep**: daglige mikrohandlinger du kan huke av.
- **Historikk**: streak (dager på rad), ukentlig/total statistikk, sparkline over humør, eksport av data (JSON) og nullstilling.
- **Installerbar PWA**: manifest + service worker gir offline-støtte og "Legg til på hjemskjerm".
- Støtter mørk modus automatisk (`prefers-color-scheme`) og er tilgjengelighetsforbedret (aria-live, aria-pressed).

## Kjøre lokalt
Appen er statiske filer — server dem for at service worker og manifest skal fungere:

```bash
python3 -m http.server 8000
```

Åpne så `http://localhost:8000`.

