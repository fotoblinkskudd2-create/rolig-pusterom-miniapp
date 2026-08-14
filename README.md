# rolig-pusterom-miniapp

Rolig mini-app for å dempe stress og nedstemthet. Pure HTML/CSS/JS med lokal lagring, installerbar som PWA.

## Sider
- **Hjem** – sjekk inn humør, se aktiv streak
- **Pusterom** – styrt pusteøvelse med valg mellom tre pustemønstre (Rolig, Boks-pust, 4-7-8)
- **Små grep** – enkle tiltak du kan krysse av, med løpende totalteller
- **Historikk** – sjekk-ins med notat, 7-dagers humøroversikt og ukessammendrag

## Funksjoner
- Mørk/lys modus følger systeminnstilling automatisk
- Fungerer offline og kan installeres på hjemskjerm (manifest.json + service worker)
- All data lagres kun lokalt i nettleseren (localStorage) – ingenting sendes til en server

## Kjøre lokalt
Åpne `index.html` direkte, eller server mappen (kreves for at service worker skal fungere):

```
python3 -m http.server 8000
```

Gå til `http://localhost:8000`.
