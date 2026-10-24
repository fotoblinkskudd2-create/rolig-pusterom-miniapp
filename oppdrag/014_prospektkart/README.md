# 14 · Prospektkart med kildekontroll

Python + SQLite + listegrensesnitt for manuelt, målrettet salg av KI-kartlegging.

## Start

```bash
python3 generer_data.py     # 20 syntetiske bedrifter (CSV + Enhetsregister-format)
python3 app.py --demo       # http://127.0.0.1:8014/
python3 kontroll.py         # 21 kontroller
node e2e.mjs                # 5 nettlesersjekker
```

## Kilder

- **CSV** (`data/manuell_liste.csv`), med felt `orgnr,navn,nace,nace_tekst,kommune,postnr,ansatte,nettside`.
- **Offentlig kilde som adapter:** `adaptere/enhetsregisteret.py` mapper Enhetsregisterets JSON-format (endepunkt, felt og lisens er dokumentert i filen). Adapteren leser en lagret respons. `hent_fra_api()` er deaktivert til vilkår og rate-grenser er kontrollert.

## Regler

- Identitet = organisasjonsnummer med mod11-kontroll. `100 000 075` = `100000075`. Ugyldige rader avvises og logges.
- **Sammenslåing:** hver kildes verdier lagres separat. Visningsverdien per felt kommer fra nyeste kilde som har verdien, og det vises hvilken kilde og dato feltet stammer fra. Ulike verdier (for eksempel navnebytte) vises som konflikt. Forskjeller i store og små bokstaver regnes ikke som konflikt.
- **Manglende størrelse** = `NULL`/«ukjent», aldri 0. Størrelsesfilteret utelater ukjent med mindre brukeren ber om dem.
- **Kvalifisering:** status, grunn, neste interne handling og frist. «Aktuell» krever grunn og neste handling.
- CSV-eksport med kilder, oppdateringsdato og kvalifisering.

## Avgrensning

Ingen e-postadresser gjettes (kontrollert: ingen `@` i data eller eksport). Ingen henting bak innlogging. Ingen automatisk kontakt.
De syntetiske organisasjonsnumrene starter på 1 og kan derfor ikke kollidere med virkelige enheter (Brønnøysund bruker 8xx/9xx).
