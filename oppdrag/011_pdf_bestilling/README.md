# 11 · Bestillingsgrunnlag fra PDF

Python (pdfplumber, valgfri Tesseract-OCR) + lokalt kontrollgrensesnitt med originalside og redigerbart uttrekk side om side.

## Start

```bash
pip install pdfplumber pypdf reportlab pillow   # avhengigheter
sudo apt-get install poppler-utils tesseract-ocr  # pdftoppm (sidebilder) og valgfri OCR
python3 generer_testdokumenter.py               # 3 tekst-PDF-er + 1 skannet side + fasit.json
python3 app.py                                  # http://127.0.0.1:8011/
python3 kontroll.py                             # 26 kontroller
node e2e.mjs                                    # 5 nettlesersjekker
```

## Slik virker uttrekket

- **Kolonner etter posisjon:** x-posisjonen til overskriftene Produkt/Antall/Enhet/Enhetspris bestemmer kolonnene, og ord grupperes i rader på y. `B2_kolonneblanding.pdf` er skrevet med pris før produkt i innholdsstrømmen. Naiv tekstutlesning (pypdf) gir derfor blandet rekkefølge, mens parseren treffer fasit.
- **Sporbarhet:** hvert felt har side og tekstområde (bbox) som vises som overlegg på sidebildet. Feltet i fokus markeres rødt.
- **Sum:** `sum stemmer`, `sum avviker` (B2: oppgitt 12 999,00 mot beregnet 11 846,00) eller `sum mangler` (B3). En manglende sum fylles aldri inn.
- **Skannet side:** egen status `krever OCR`. OCR kjøres bare når brukeren trykker «Kjør OCR». Alle OCR-felt får `kilde=ocr`, er merket usikre og viser konfidens.
- **Bekreftelse:** alt starter som `uttrukket`. Bare `bekreftet` eksporteres (JSON/CSV), med brukerens rettelser markert. En rettelse etter bekreftelse krever ny bekreftelse. Linjer med tomme felt kan ikke bekreftes.

## Faktisk resultat

Alle tre tekst-PDF-ene samsvarer felt for felt med fasit. OCR av den skannede testsiden (200 dpi, 0,4° skjev) gir også alle felt riktig med Tesseract 5.3.4 i dette miljøet. Det er likevel *ikke* en garanti for ekte skann.
Se `resultat/kontroll.txt`, `resultat/e2e.txt`, `resultat/eksport_B1.{csv,json}` og `resultat/skjermbilde.png`.

## Avgrensning

Ingen bestilling sendes. Testdokumentene er egne og syntetiske.
