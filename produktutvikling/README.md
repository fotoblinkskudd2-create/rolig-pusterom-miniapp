# VÅR – produktportefølje (konseptfase)

Fem nye intimprodukter for kvinner: GLØD, AVTRYKK, SAMKLANG, LENE og KJERNE.

| Fil | Innhold |
|---|---|
| `VAR_Produktportefolje_v1.docx` | Hoveddokument (46 s): marked, kravspek, 5 konsepter, økonomi, testplan, IP/regulatorikk, anbefaling |
| `VAR_Sammendrag_1side.docx` | Ensidig sammendrag og anbefaling |
| `tegninger/VAR_Tegningssett_A3.pdf` | 6 konsepttegninger A3 (vektor, ISO-stil) |
| `grafer/` | Gantt per produkt og scenariograf |
| `src/` | Parametrisk modell og generatorer |

Bygg på nytt (Python 3 + matplotlib, Node + docx):

```
cd src && python3 modell.py && python3 tegninger.py && python3 grafer.py && node bygg.js
```
