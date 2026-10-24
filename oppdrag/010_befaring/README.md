# 10 · Befaring til arbeidsordre uten nett

Installerbar PWA (manifest, service worker, ikoner) med IndexedDB. Kjernelogikk i TypeScript (`src/befaring.ts`).
Egen avhengighetsfri PDF-skriver (med JPEG og rotasjon) og ZIP-skriver ligger i `../felles/web/`.

## Start

```bash
tsc -p .
python3 ../felles/serve.py 8010     # http://127.0.0.1:8010/010_befaring/ → «Last demobefaring»
node kontroll.mjs                   # 19 kontroller (desimaler, EXIF, ferdigstilling, ZIP, PDF)
node e2e.mjs                        # 8 nettlesersjekker, blant annet uten nett og ved gjenåpning
```

Installering: åpne siden i Chrome/Edge eller Safari og velg «Installer app» / «Legg til på Hjem-skjerm». En service worker må serveres over `localhost` eller https.

## Funksjoner

- Rom, mål, bilder (kamera/fil), observasjoner (funn) og arbeidsordreoppgaver.
- **Markering:** dra på bildet. Markeringen lagres normalisert (0–1) i visningsretning etter EXIF.
- **Kobling:** funn → bilde og funn → oppgave. Koblingene bevares gjennom lagring og gjenåpning, og brutte koblinger blokkerer ferdigstilling.
- **Autolagring** til IndexedDB 250 ms etter hver endring. Originalbilder lagres byte for byte uendret.
- **Desimaler:** `2,45` og `2.45` godtas. `2.450,5` avvises som tvetydig. Tolket verdi vises under feltet.
- **Kontroll før ferdigstilling:** alle mål må ha gyldig verdi og være avkrysset som kontrollert. Et endret mål må kontrolleres på nytt. Hver oppgave må ha minst ett funn.
- **Eksport:** én ZIP med `befaring.json`, `arbeidsordre.pdf` (bilder med markering, riktig rotert), `bilder/original/*` og `manifest.json` med sha256.

## Faktisk kontrollert

- EXIF-orientering 6 leses, og bildet vises stående både i nettleseren og i PDF (visuelt kontrollert: `resultat/arbeidsordre_side-1.png`).
- Originalbilder i ZIP er byte-identiske (sha256). ZIP-en er validert med Pythons `zipfile.testzip`.
- Nettbortfall: Playwright setter konteksten offline, retter et mål, lukker fanen, åpner appen på nytt fra service worker og fullfører ferdigstilling og eksport.

Filer: `resultat/befaring_BEF-2026-031.zip`, `resultat/arbeidsordre.pdf`, `resultat/kontroll.txt`, `resultat/e2e.txt`.

## Avvik

Oppdraget nevner React-PWA. Dette er en PWA i ren JavaScript uten React.
Speilede EXIF-orienteringer (2, 4, 5, 7) avvises med beskjed om å ta bildet på nytt.
