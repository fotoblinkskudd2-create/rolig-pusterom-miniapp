# 15 · Demoverksted for tre kundetyper

Lokal demokonsoll (PWA) med versjonerte JSON-scenarioer. Hvert scenario viser **input → faktisk behandling → output**.

## Start

```bash
(cd ../004_arbeidskort && tsc -p .)    # arbeidskortmotoren gjenbrukes fra oppdrag 4
python3 ../felles/serve.py 8015        # http://127.0.0.1:8015/015_demoverksted/
node kontroll.mjs                      # 15 kontroller
node e2e.mjs                           # 9 nettlesersjekker, blant annet uten nett
```

## Scenarioer (`scenarier/v1/*.json`, versjon 1.0.0)

| Scenario | Fiktiv kunde | Implementert behandling | Simulert |
|---|---|---|---|
| Henvendelse → arbeidskort | Nordkapp Rør & Varme | Uttrekk og sitatfilter: **samme kode som oppdrag 4** (`../004_arbeidskort/dist/uttrekk.js`) | E-postmottak |
| Dokumentkontroll | Lofoten Ladepark | Filtype, størrelse og blokkering (`src/dokumentkontroll.js`, regler som i oppdrag 8) | Filopplasting (filene er metadata) |
| Prosjektmargin | Senja Webstudio | DB, kr/t, refusjon holdt utenfor (`src/margin.js`, definisjoner som i oppdrag 6) | Timeimport |

Hver funksjon er merket **implementert** eller **simulert** i grensesnittet, med kodested eller forklaring.

## Isolasjon og nullstilling

- Hvert scenario lagrer endringer under egen nøkkel `demoverksted.v1.<scenario>@<versjon>`. Bytte av fane tegner bare det aktive scenarioets data.
- Kontrollert: ingen kundenavn eller filnavn deles mellom scenariofilene, og nettlesertesten bekrefter at ingen fremmede navn eller filer vises etter bytte.
- «Nullstill til original» sletter bare det aktive scenarioets endringer.

## Uten nett

Service workeren cacher konsollen, scenariofilene og motorene. Testen setter nettleseren offline, åpner en ny fane og kjører arbeidskortscenarioet.

Resultater: `resultat/kontroll.txt`, `resultat/e2e.txt`, `resultat/skjermbilde.png`.

## Avvik

Oppdraget nevner React. Konsollen er skrevet i ren JavaScript uten React.
