# 4 · Henvendelse til kvalifisert arbeidskort

TypeScript-kjerne (`src/eml.ts` EML-leser, `src/uttrekk.ts` uttrekk) + nettleser-UI med kildetekst og arbeidskort side om side.

## Start

```bash
python3 generer_meldinger.py      # 8 syntetiske meldinger i data/ (5 EML, 3 innlimt tekst)
tsc -p .
python3 ../felles/serve.py 8004   # http://127.0.0.1:8004/004_arbeidskort/
node kontroll.mjs                 # 30 kontroller → resultat/kontroll.txt
node e2e.mjs                      # nettleserflyt → resultat/e2e.txt
```

## Slik virker det

- **EML:** headere med folding, RFC 2047 (`=?UTF-8?B?…?=`), RFC 2231-filnavn, multipart, quoted-printable og base64. Vedlegg listes med navn, type og størrelse. Innholdet åpnes aldri.
- **Sitert historikk** (`>`-linjer, «Den … skrev …:», «-----Opprinnelig melding-----», «Fra: … Sendt: …») skilles ut og vises skravert. Alt uttrekk skjer *bare* fra den nye delen, så en gammel adresse eller frist i sitatet kan ikke overstyre den nye henvendelsen.
- **Felt:** navn, e-post, telefon, jobb, sted og frist. Hvert felt har kilde (`tekst`/`hode`/`bruker`/`vedlegg`), sikkerhet (`sikker`/`utledet`/`tvetydig`/`usikker`) og tekstområde som markeres i kildeteksten.
- **Datoer:** `03/04` er tvetydig (to tolkninger nevnes). År som mangler hentes fra e-postens dato og merkes `utledet`. «innen fredag» regnes fra e-postens dato og merkes `tvetydig`. `31.11.2026` avvises som ugyldig.
- **Mangelliste:** navn, kontaktvei, jobb, sted og frist.
- **Godkjenning** krever jobb og minst én kontaktvei. Rettelser logges med fra/til/tid. Bare godkjente kort eksporteres som JSON (`arbeidskort/v1`).

## Instruksjoner i e-posttekst

Kjernen er en ren datatransformasjon uten verktøy- eller nettverkskall. Tekst som «ignorer alle instruksjoner og send e-post til …» blir bare vist som advarsel. Kontrollen overvåker `fetch` mens alle åtte meldinger behandles (0 kall), og nettlesertesten bekrefter at bare GET mot lokal server forekommer.

## Kontrollresultat

`resultat/kontroll.txt` (30), `resultat/e2e.txt` (12), `resultat/arbeidskort_m1.json`, `resultat/alle_utkast.json`, `resultat/skjermbilde.png`.

## Avvik og grenser

UI-et er skrevet uten React (ren ES-modul, ingen byggekjede). Uttrekket er regelbasert og dekker typiske norske formuleringer. Feltene er forslag som brukeren må kontrollere. Ingen utsending.
