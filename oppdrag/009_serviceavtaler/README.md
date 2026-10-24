# 9 · Serviceavtaler og fornyelser

Python + SQLite + nettleser-UI (tidslinje, arbeidskø, historikk og ICS-eksport).

## Start

```bash
python3 app.py --demo --idag 2026-10-24     # http://127.0.0.1:8009/
python3 kontroll.py                          # 23 kontroller (datoregler, kø, historikk, ICS)
node e2e.mjs                                 # 7 nettlesersjekker
```

## Datoregel

Siste oppsigelsesdag = sluttdato − oppgitt varslingsfrist.
- **Måneder:** kalendermåned tilbake; finnes ikke dagen, brukes siste dag i måneden. 31.03.2027 − 1 mnd = 28.02.2027, og 31.03.2028 − 1 mnd = **29.02.2028** (skuddår).
- **Dager:** kalenderdager. 01.03.2028 − 1 d = 29.02.2028.
- **Manglende frist** gir status «frist ukjent» og havner øverst i arbeidskøen. Det gjettes aldri en dato.

## Arbeidskø

Statuser: `frist ukjent` → `handling nå` (≤ 30 d) → `frist passert` → `planlegg` (≤ 90 d) → `utløpt` (aktiv avtale med passert sluttdato). `ok` og `avsluttet` vises bare i oversikten.

## Kilde og historikk

Hver avtale peker på originaldokumentet. Brukeren bekrefter vilkårene mot kilden (hvem og når). Endring av sluttdato, frist eller pris logger gammel og ny verdi og nullstiller bekreftelsen.

## Kalenderfil

`/api/kalender.ics?ider=…` lager heldagshendelser for siste oppsigelsesdag og sluttdato (RFC 5545, CRLF, stabile UID-er). Ubekreftede vilkår merkes i beskrivelsen. Avsluttede avtaler eksporteres ikke.
Eksempler: `resultat/avtalefrister.ics` og `resultat/alle_aktive.ics`.

## Avgrensning

Ingen automatisk oppsigelse, fornyelse eller utsending. Kalenderfilen importeres manuelt.
Avvik: oppdraget nevner React/TypeScript; her er UI-et ren JavaScript og datologikken i Python, med SQLite som bestilt.
