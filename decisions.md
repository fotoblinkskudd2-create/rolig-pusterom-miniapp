# decisions.md: revisjon av beslutningslaget

Dato: 2026-10-07. Repo: `rolig-pusterom-miniapp`.

## Funn: modellkall før denne endringen

| Sted | Ber modellen om | Kostnad/kall | Latens/kall |
|------|-----------------|--------------|-------------|
| – | – | – | – |

**Null.** Ingen `fetch`, ingen API-nøkkel, ingen modell. `isolation-mirror.html` setter sammen en prompt lokalt. Brukeren kopierer den selv, og appen sender ingenting.

## Alle beslutningspunkter i appen

| # | Beslutning | Lukket spørsmål | Alternativer | Tas av | Kostnad |
|---|-----------|-----------------|--------------|--------|---------|
| D1 | Hvilket grep foreslås nå | «Hvilket grep skal foreslås nå?» | indekser i `actions` som ikke er gjort i dag (bygges på nytt hver gang) | `decision/router.js` lokal regel | 0 |
| D2 | Kan sjekk-inn lagres | «Er humør valgt?» | ja / nei | `saveCheckin()` | 0 |
| D3 | Pustefase | «Hvilken fase nå?» | inn / hold / ut | `runBreathCycle()` timer | 0 |
| D4 | Tredje steg i Isolation Mirror | «Har brukeren valgt bilde?» | ja / nei | `generate()` | 0 |
| D5 | Ukeoppsummering | (telling, ikke beslutning) | – | `renderHistory()` | 0 |

D2–D5 er ren logikk. Modellen ville gjort dem dårligere og dyrere, så de blir der de er.

D1 er den eneste som er en vurdering, altså «hva passer nå». Den har nå et beslutningslag:

- **Tilstand (fakta):** `mood` fra siste sjekk-inn, `hour`, `doneToday`. Ingen konklusjoner som «brukeren er stresset».
- **Lokal regel:** humør ≤ 2 gir jording (føttene i gulvet), og hvis den er gjort, pust. Etter kl. 21 foreslås ikke «gå ut». Ellers blir det første grepet som ikke er gjort.
- **Jev (valgfri):** `decision/jev-transport.js`. Den er kun for Node og er av som standard. Nøkkelen ligger i `.env`. Appen i nettleseren bruker den aldri.
- **Terskel 0,85.** Hvis confidence er lavere, etiketten ikke finnes blant alternativene eller transporten feiler, brukes den lokale regelen med `escalated: true` og en `reason`. Ingenting går videre i stillhet.
- **Verifisering:** et utfall logges først når `toggleAction` har lest tilbake fra `localStorage` at grepet faktisk er lagret.
- **Logg + Brier:** `localStorage.decisions` (maks 200), med Brier-score i `decisions.html`.

## Før/etter

| | Før | Etter |
|--|-----|-------|
| Modellkall per oppgave | 0 | 0 (lokalt), 1 hvis Jev slås på i Node |
| Kostnad per oppgave | 0 | 0 |
| Latens D1 | – (ingen forslag) | 0–1 ms (målt i Chromium) |
| Generative kall fjernet | 0 | 0, fordi det ikke fantes noen |
| Eskaleringsrate | – | 0 % (lokal regel har confidence 1) |
| Nettverksforespørsler | 0 | 0 (verifisert med Playwright) |

## Tester

`npm test` (14 tester). Testene ble skrevet og kjørt røde før `router.js` fantes.

## WHICH DECISION IS STILL PAYING THE GENERATION TAX?

- **Betaler noen gren for et modellkall?** Nei. 0 kall.
- **Får noen beslutning en konklusjon i stedet for fakta?** Nei. D1 får humør, klokkeslett og gjort-liste.
- **Eskalerer hver lav-confidence-etikett?** Ja. Det er testet for lav confidence, ugyldig etikett og transportfeil.
- **Er hvert «gjort» verifisert av kode?** Ja, `toggleAction` leser tilbake før utfallet logges.

**Åpent:** `jev-transport.js` sitt format for forespørsel og svar er **uverifisert** mot Jevs egen dokumentasjon. Dokumentasjonssiden var blokkert fra dette miljøet. Den skal ikke slås på før `toRequest`/`fromResponse` er sjekket.

**Kjent feil, ikke rettet her:** `switchPage()` bruker `event.currentTarget`. `HULL.md` sier at dette ble fikset i 1.1, men koden i `index.html` har den fortsatt. «Pust med meg»-knappen bytter side mens navigasjonen blir stående på Hjem. Det samme gjelder `alert()` og historikk-eksport, som heller ikke finnes i `index.html`.
