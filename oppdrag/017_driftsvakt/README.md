# 17 · Driftsvakt for småapper

Python + SQLite + statusgrensesnitt. Kontrollerer **bare** endepunktene som står i `konfig.json`.

## Start

```bash
python3 testserver.py 8917 &     # lokal testserver: /helse, bytt tilstand med /modus/frisk|treg|feilende|nede
python3 app.py                   # http://127.0.0.1:8017/ – måler hvert 10. sekund + «Mål nå»
python3 kontroll.py              # 16 kontroller mot testserveren → resultat/feilforlop.md
node e2e.mjs                     # 4 nettlesersjekker
```

## Regler

- **Mål:** bare URL-er i konfigurasjonen. Omdirigeringer følges ikke. Et kall mot en annen URL gir `PermissionError`. Konfigurasjonen godtar bare http/https.
- **Utfall:** `ok`, `treg` (svar over `treg_ms`, men innen timeout), `http_feil` (svar med feil statuskode), `timeout` (ingen svar innen `timeout_sek`) og `tilkoblingsfeil`. Timeout og HTTP-feil holdes adskilt.
- **Hendelser:** når terskelen nås (2 påfølgende feil) åpnes **én** hendelse. Videre feil knyttes til den. Alle råmålinger beholdes og peker på hendelsen. Første ok/treg lukker den.
- **Vedlikehold:** målinger i et vindu merkes `vedlikehold`, åpner ikke hendelser, teller ikke mot terskelen og holdes utenfor tilgjengelighetsprosenten.
- Ingen ekstern varsling. Alt vises bare i det lokale grensesnittet.

## Dokumentert feilforløp

`resultat/feilforlop.md` er en faktisk kjøring: frisk → 503 → 503 (hendelse #1) → timeout → frakoblet → frisk (lukket) → treg 736 ms → to feil i vedlikeholdsvindu (ingen hendelse) → én feil etter vinduet (ingen hendelse) → frisk. Tilgjengelighet utenfor vedlikehold: 4 av 9 = 44,44 %.
