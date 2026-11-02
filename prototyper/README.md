# Prototyper: fem situasjoner

Selskap: **Pusterom Lab** (fiktivt prototyp-selskap, ikke knyttet til noen eksisterende virksomhet).

Hver situasjon har egen mappe med:

- `README.md`: problem, hypotese, prototype, testplan, markedsanalyse, markedsføring, feilsøking
- CAD (OpenSCAD `.scad`), firmware (`.ino`), simulering (`.py`) eller verktøy der det gir mening
- `design.svg`: teknisk skisse med mål

| # | Situasjon | Prototype | Filer |
|---|-----------|-----------|-------|
| 1 | Is på vindturbinblader | Tuberkel-forkant med væske-smurt overflate og lokal varme som backup | `1-vindturbin-is/` |
| 2 | Panikkanfall om natten | Pusteklokke: lampe med pustrytme, rav-farget lys, ingen skjerm | `2-nattlampe-pust/` |
| 3 | Fugler som flyr i glass | UV-mønster for glass: synlig for fugl, usynlig for mennesker | `3-fugle-glass/` |
| 4 | Droner i kulde | Batterihylse med isolasjon, forvarming fra nett og flytidsmodell | `4-drone-batteri-kulde/` |
| 5 | Eldre som ikke drikker nok | Drikkeunderlag med vektcelle og påminnelse, ingen app | `5-krus-hydrering/` |

## Hva dette er og ikke er

- **Prototyp, ikke produkt.** Alt er på konsept- og laboratorienivå. Ingen sertifisering, ingen medisinsk eller elektrisk godkjenning.
- **Kilder ikke sjekket.** Problembeskrivelsene kommer fra brukerens liste. Vitenskapelige påstander i README-filene er hypoteser som skal testes, ikke fakta.
- **Tall er antakelser** hvis de står med `[verifiser]`.
- **Ingen 3D-printede produkter som løsning.** CAD-filene er for dimensjonering og kommunikasjon. Produksjonsmetode er beskrevet per prototype.

## Kjøre modellene

```bash
# CAD (krever OpenSCAD)
openscad -o 1-vindturbin-is/cad/forkant.stl 1-vindturbin-is/cad/forkant_manchett.scad

# Mønstergenerator (Python 3, ingen eksterne pakker)
python3 3-fugle-glass/tools/make_pattern.py --width 1000 --height 1000 --out 3-fugle-glass/design.svg

# Flytidsmodell
python3 4-drone-batteri-kulde/sim/flight_model.py

# Firmware: Arduino IDE. Bibliotek: HX711 (bogde) for prototype 5.
```

## Neste steg

1. Velg hvilken prototype som skal gå videre til kildesjekk.
2. Kildesjekk (Kildesjekker) og kjent-teknikk-søk (31 søk) på valgt nummer, når kvoten er tilbake.
3. Oppdater `[verifiser]`-tallene i den valgte mappen før noe sendes til investor eller kunde.
