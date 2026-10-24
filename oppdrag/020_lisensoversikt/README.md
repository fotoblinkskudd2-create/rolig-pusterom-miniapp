# 20 · Lisensoversikt for kundeleveranser

Python + SQLite + registerapp (nettleser) + importskript.

## Start

```bash
python3 app.py --demo                         # fiktiv leveranse «kundeportal» i to revisjoner → http://127.0.0.1:8020/
python3 importer.py lisens.db kundeportal v1.2.0 eksempel/rev2/package-lock.json --las   # import fra låsefil
python3 kontroll.py                           # 13 kontroller
node e2e.mjs                                  # 5 nettlesersjekker
```

## Modell

- **Oversikt** = leveranse + revisjon (commit/tag), unik. En låst oversikt kan ikke endres, så historiske oversikter bevares.
- **Komponent** = (type `egen`/`tredjepart`, navn, versjon). To versjoner av samme pakke blir to rader (rev 2 har både `datoverktoy` 3.0.0 og en nestet 2.1.0).
- Lisens lagres **slik den er oppgitt**, med kilde (`package-lock.json`, `PKG-INFO`, `manuelt` …).
- **Import:** `package-lock.json` (v2/v3, inkludert nestede `node_modules`) og `requirements.txt` (`navn==versjon`, der lisensen er ukjent til den registreres med kilde).
- **Arbeidskø:** ukjent lisens, og manglende attribusjonstekst når oppgitt lisens står på listen `KREVER_ATTRIBUSJON` (MIT, BSD, Apache-2.0, ISC). Listen er en registrert regel, ikke en juridisk vurdering.
- **Attribusjonsfil** per revisjon (`resultat/TREDJEPART_v1.0.0.txt`). Ukjent lisens og manglende attribusjon står tydelig i filen.

## Eksempel (rev 1)

Fire tredjepartsavhengigheter: datoverktoy (MIT), tabellmotor (Apache-2.0, mangler attribusjon), rapportgen (BSD-3-Clause, registrert manuelt med kilde) og **hjelpefunk (ukjent lisens)**. Alle pakkenavnene er fiktive.

## Forbehold

Oversikten viser dokumentert metadata. Den gir ingen automatisk garanti for juridisk kompatibilitet.
Avvik: UI-et er ren JavaScript uten React.
