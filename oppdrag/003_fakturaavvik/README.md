# 3 · Fakturaavvik med sporbar avstemming

Python + pandas. Leser `ordre.csv` og `faktura.csv`, normaliserer, matcher og klassifiserer hver fakturalinje.
Resultatet er en filtrerbar HTML-kontrollvisning og en CSV, begge med kildefil og radnummer.

## Start

```bash
python3 generer_data.py                                   # syntetiske data + fasit (seed 3)
python3 avstem.py data/ordre.csv data/faktura.csv --ut resultat
open resultat/avviksrapport.html                          # kontrollgrensesnitt (statisk, ingen server)
python3 kontroll.py                                       # sammenligning mot fasit → resultat/kontroll.txt
```

## Regler

1. **Normalisering:** dato `ÅÅÅÅ-MM-DD` og `DD.MM.ÅÅÅÅ`; beløp med komma/punktum og mellomrom som tusenskille; ordreref `PO-1001`, `po1001`, `1001` → `1001`; valuta til store bokstaver.
2. **Sikker match:** leverandørens org.nr + ordreref + linjenr.
3. **Tilnærmet match** (bare uten ordreref): samme leverandør, beløp ±1 %, fakturadato 0–30 dager etter ordredato, og *nøyaktig én* kandidat.
4. **Klasser:**
   - `bekreftet_avvik`: sikker match med avvik i pris, antall, valuta eller linjesum; eller eksakt duplikat (samme leverandør + fakturanr + linje).
   - `mulig_avvik`: ordrelinje fakturert på nytt med annet fakturanr; eller avvik på en *tilnærmet* match (aldri bekreftet).
   - `uavklart`: ingen eller flere kandidater, eller ukjent ordreref.
   - `ok` / `ok_tilnaermet`.
5. Duplikatkontroll skjer bare innen samme leverandør. Like beløp hos ulike leverandører blir aldri duplikater (testet med tre leverandører på 1 000,00).

## Resultat mot fasit

40 linjer: 32 ok, 1 ok_tilnaermet, 4 bekreftet avvik (pris, antall, eksakt duplikat, valuta), 1 mulig avvik (dobbel fakturering av ordrelinje), 2 uavklart (to like kandidater; datoen utenfor vinduet).
Alle 40 samsvarer med `data/fasit.json`. Se `resultat/kontroll.txt`.

## Avgrensning

Ingen automatisk endring i regnskapet. Verktøyet skriver bare til `resultat/`.
