# 8 · Kundeoppstart med dokumentkontroll

FastAPI + SQLite + nettleser-UI. **Lokal demo:** ingen innlogging, ingen tilgangsstyring og ingen flerbrukersikkerhet. Dette står i UI-et og i manifestet i hver pakke.

## Start

```bash
python3 app.py --demo      # syntetisk sak med 6 krav, 2 obligatoriske mangler → http://127.0.0.1:8008/
python3 kontroll.py        # 23 kontroller
node e2e.mjs               # 6 nettlesersjekker
```

## Regler

- Hvert krav har navn, obligatorisk/valgfri, tillatte filtyper, maks størrelse, ansvarlig og frist.
- Filer lagres innholdsadressert (`lager/<sha256>`) og versjoneres per krav.
- **Mottatt ≠ godkjent.** Versjonsstatus går fra `mottatt` til `godkjent` eller `avvist` (avvisning krever grunn). Ved ny opplasting blir forrige versjon `erstattet`, og kravet må kontrolleres på nytt. Bare siste versjon kan behandles.
- Feil filtype, for stor fil og tom fil avvises og logges.
- **Ferdigstilling** krever at siste versjon av alle obligatoriske krav er godkjent. Ellers blokkeres den med liste over hva som mangler, og blokkeringen logges. En ferdigstilt sak tar ikke imot nye filer.
- **Overleveringspakke (ZIP):** siste godkjente versjon per krav, `manifest.json` med sha256 per fil og `versjonslogg.json`.

## Resultat

`resultat/overlevering_KS-2026-014.zip` (generert av kontrollen: 5 dokumenter + manifest + logg), `resultat/versjonslogg.json`, `resultat/kontroll.txt`, `resultat/e2e.txt`.

## Avvik

UI-et er ren JavaScript uten React. Opplasting skjer som base64 i JSON (ingen multipart-avhengighet).
