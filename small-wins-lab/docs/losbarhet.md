# Løsbarhet — alle 30 oppgaver

Generert 2026-10-09T16:58:11.830Z av `node tests/rapport.js`. Uavhengig kryssjekk: `tests/logic.test.js`.

| ID | Tittel | Søkerom | Gyldige | Løsninger (motorens fulle opptelling) |
|---|---|---|---|---|
| SIG-01 | Snu signalet | 2 bryterkombinasjoner | 1 | A = AV |
| SIG-02 | Begge må være med | 4 bryterkombinasjoner | 1 | A = PÅ, B = PÅ |
| SIG-03 | Én er nok | 4 bryterkombinasjoner | 2 | A = PÅ, B = AV<br>A = AV, B = PÅ |
| SIG-04 | Bare én av dem | 4 bryterkombinasjoner | 2 | A = PÅ, B = AV<br>A = AV, B = PÅ |
| SIG-05 | Ja til A, nei til B | 4 bryterkombinasjoner | 1 | A = PÅ, B = AV |
| SIG-06 | Tre brytere | 8 bryterkombinasjoner | 2 | A = PÅ, B = AV, C = PÅ<br>A = AV, B = PÅ, C = PÅ |
| REK-01 | Trekanten til slutt | 6 rekkefølger | 2 | ●  ■  ▲   (blå sirkel, rød firkant, gul trekant)<br>■  ●  ▲   (rød firkant, blå sirkel, gul trekant) |
| REK-02 | Stjernen leder | 24 rekkefølger | 2 | ★  ●  ■  ▲   (grønn stjerne, blå sirkel, rød firkant, gul trekant)<br>★  ▲  ●  ■   (grønn stjerne, gul trekant, blå sirkel, rød firkant) |
| REK-03 | Naboer | 24 rekkefølger | 2 | ●  ▲  ★  ■   (blå sirkel, gul trekant, grønn stjerne, rød firkant)<br>▲  ●  ★  ■   (gul trekant, blå sirkel, grønn stjerne, rød firkant) |
| REK-04 | Følget | 120 rekkefølger | 2 | ●  ■  ▲  ◆  ★   (blå sirkel, rød firkant, gul trekant, lilla rute, grønn stjerne)<br>■  ●  ▲  ◆  ★   (rød firkant, blå sirkel, gul trekant, lilla rute, grønn stjerne) |
| REK-05 | Ikke ved siden av | 120 rekkefølger | 2 | ●  ★  ◆  ■  ▲   (blå sirkel, grønn stjerne, lilla rute, rød firkant, gul trekant)<br>●  ◆  ★  ■  ▲   (blå sirkel, lilla rute, grønn stjerne, rød firkant, gul trekant) |
| REK-06 | Seks i rekke | 720 rekkefølger | 3 | ●  ★  ■  ♥  ◆  ▲   (blå sirkel, grønn stjerne, rød firkant, oransje hjerte, lilla rute, gul trekant)<br>●  ★  ◆  ♥  ■  ▲   (blå sirkel, grønn stjerne, lilla rute, oransje hjerte, rød firkant, gul trekant)<br>◆  ♥  ●  ★  ■  ▲   (lilla rute, oransje hjerte, blå sirkel, grønn stjerne, rød firkant, gul trekant) |
| MON-01 | Annenhver | 3 brikkekombinasjoner | 1 | ●  ▲  ●  ▲  ●  ▲ |
| MON-02 | Tre i ring | 9 brikkekombinasjoner | 1 | ■  ●  ▲  ■  ●  ▲  ■ |
| MON-03 | Par for par | 9 brikkekombinasjoner | 1 | ●  ●  ▲  ▲  ■  ■  ●  ●  ▲  ▲  ■  ■ |
| MON-04 | Tallhjulet | 49 brikkekombinasjoner | 1 | 1  3  5  7  1  3  5  7 |
| MON-05 | To regler samtidig | 16 brikkekombinasjoner | 1 | ●  ▲  ○  ▲  ●  △  ●  ▲  ○ |
| MON-06 | Form og antall | 36 brikkekombinasjoner | 1 | ●  ●●  ●●●  ▲  ▲▲  ▲▲▲  ●  ●●  ●●● |
| RUT-01 | Første tur | bredde-først-søk over (felt, besøkte kontrollpunkter) | korteste 6 steg | ↓ ↓ ↓ → → →  (6 steg) |
| RUT-02 | Korteste vei | bredde-først-søk over (felt, besøkte kontrollpunkter) | korteste 6 steg | → → ↓ ↓ ↓ →  (6 steg) |
| RUT-03 | Svingete | bredde-først-søk over (felt, besøkte kontrollpunkter) | korteste 8 steg | ↓ → ↓ → → ↓ ↓ →  (8 steg) |
| RUT-04 | Innom flagget | bredde-først-søk over (felt, besøkte kontrollpunkter) | korteste 10 steg | → → ↓ ↓ → → ↑ ↓ ↓ ↓  (10 steg) |
| RUT-05 | Omvei som må til | bredde-først-søk over (felt, besøkte kontrollpunkter) | korteste 12 steg | ↓ ↓ ↓ ↓ ↑ ↑ → → → ↑ ↑ →  (12 steg) |
| RUT-06 | To flagg | bredde-først-søk over (felt, besøkte kontrollpunkter) | korteste 16 steg | ↓ ↓ ↓ → → ↑ → → ↑ ↑ → ↓ ↓ ↓ ↓ ↓  (16 steg) |
| FEI-01 | Nesten riktig | 21 enkeltbytter | 2 | 2 → [× 3] → 6 → [× 2] → 12 → [− 1] → 11<br>2 → [+ 3] → 5 → [× 2] → 10 → [+ 1] → 11 |
| FEI-02 | For lite | 21 enkeltbytter | 2 | 5 → [− 1] → 4 → [× 2] → 8 → [+ 1] → 9<br>5 → [− 2] → 3 → [× 2] → 6 → [+ 3] → 9 |
| FEI-03 | Dobbelt så mye | 28 enkeltbytter | 1 | 1 → [+ 2] → 3 → [× 3] → 9 → [− 2] → 7 → [× 2] → 14 |
| FEI-04 | Under null | 28 enkeltbytter | 2 | 4 → [− 1] → 3 → [− 3] → 0 → [+ 3] → 3 → [× 2] → 6<br>4 → [− 2] → 2 → [− 2] → 0 → [+ 3] → 3 → [× 2] → 6 |
| FEI-05 | Taket | 35 enkeltbytter | 1 | 3 → [+ 1] → 4 → [+ 2] → 6 → [× 3] → 18 → [− 1] → 17 → [+ 2] → 19 |
| FEI-06 | Kontrollampen | 35 enkeltbytter | 2 | 2 → [+ 1] → 3 → [× 2] → 6 → [+ 1] → 7 → [× 2] → 14 → [− 2] → 12<br>2 → [+ 2] → 4 → [+ 2] → 6 → [+ 1] → 7 → [× 2] → 14 → [− 2] → 12 |
