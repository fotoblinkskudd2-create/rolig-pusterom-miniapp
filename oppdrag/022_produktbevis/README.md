# 22 · Produktfeil med før–etter-bevis

Lokalt verksted for én produktforbedring om gangen. TypeScript-kjerne (`src/bevis.ts`), nettleser-UI og filer lagret i IndexedDB.

## Start

```bash
tsc -p . && python3 ../felles/serve.py 8022   # http://127.0.0.1:8022/022_produktbevis/ → «Last fiktiv kjøkkenholder»
node kontroll.mjs                              # 10 kontroller
node e2e.mjs                                   # 7 nettlesersjekker
```

## Modell

Sak med originalfoto og kilde, observert problem og brukssituasjon, revisjoner (én grunnlinje), målemetoder (enhet, retning og terskel), hypoteser (antatt årsak, foreslått endring, revisjon og metode), tester (verdier og **koblede filer**) og filregister med sha256.

## Regel for status

En hypotese blir **«støttet av prøving»** bare når det finnes en grunnlinjetest på opprinnelig revisjon *og* en test på ny revisjon med samme metode, begge med minst én koblet fil, og endringen i median oppfyller terskelen. Ellers er statusen `hypotese` (med grunn) eller `ikke støttet av prøving`. Ordene «bekreftet» og «bevist» brukes aldri.

## Fiktiv kjøkkenrullholder (syntetiske data)

| Hypotese | Tester | Status |
|---|---|---|
| H1 bredere fot (vippevinkel) | T1 rev A 12° (median), T2 rev B 21° | støttet av prøving (+9 ≥ 5) |
| H2 gummiknotter (trekkraft) | bare T3 rev B 3,0 N | hypotese: mangler grunnlinjetest |

I nettlesertesten legges en grunnlinjetest for trekkraft til. Først når CSV-filen er koblet, blir H2 «støttet av prøving».

## Eksport

`testpakke_<sak>.zip` inneholder `sak.json`, `vurdering.json`, `manifest.json` (fil-id → sti → sha256) og alle filer. Kontrollen verifiserer med Python at alle sjekksummer stemmer, og at alle bevislenker peker på filer i pakken. Eksporten stoppes hvis en fil er endret etter registrering.

## Uavklart

Patentnyhet og markedsetterspørsel står som *uavklart* til en egen undersøkelse er gjort.
Avvik: UI-et er ren JavaScript uten React.
