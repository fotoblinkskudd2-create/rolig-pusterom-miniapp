# Byggesystem

Utvikling av rolig-pusterom-miniapp skjer i nummererte bygg: **Bygg 1, Bygg 2, Bygg 3, og så videre.**

Hvert bygg er en avgrenset, ferdigstilt forbedring — ikke en samling småfikser. Et bygg regnes som
ferdig når funksjonen er implementert, testet manuelt og virker i appen, ikke bare påbegynt.

## Konvensjon

- Hvert bygg får et eget avsnitt her, med dato, hva som ble bygget og hvorfor.
- Commit-meldingen for et bygg starter med `Bygg N:`.
- Bygg legges til fortløpende — aldri om-nummerert i ettertid.

## Byggelogg

### Bygg 1 — Innsikt i Historikk (2026-08-09)

**Problem:** Historikk-siden samlet inn god data (humør, notater, tidspunkt, gjennomførte små grep)
via localStorage, men viste nesten ingenting igjen til brukeren — bare en rå liste over
sjekk-inn og teksten "0 ganger denne uken". For en app som skal hjelpe noen se at det går bedre
over tid, var dette det klareste eksempelet på uutnyttet potensial i appen.

**Løsning:**
- Ny statistikk-rad: antall dager på rad med sjekk-inn (streak), totalt antall sjekk-inn, og
  totalt antall gjennomførte "små grep".
- Ny humørkurve (ren SVG, ingen biblioteker) som viser gjennomsnittlig humør de siste 14 dagene,
  med hull der data mangler i stedet for å late som det finnes data.
- Nytt innsikts-kort som sammenligner denne uken med forrige uke og gir en varsom,
  ikke-dømmende tilbakemelding — aldri diagnostiserende, alltid støttende.
- Tomme tilstander (ingen data ennå) håndteres eksplisitt med vennlig tekst i stedet for å vise
  "0" overalt.

Alt kjører fortsatt helt lokalt (localStorage), ingen nye avhengigheter.
