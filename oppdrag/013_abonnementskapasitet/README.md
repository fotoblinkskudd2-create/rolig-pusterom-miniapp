# 13 · Kapasitet til abonnementsinntekt

Separat TypeScript-beregningsmodell (`src/modell.ts`) og nettleser-UI med pakkesammenligning, sensitivitet og scenariolagring.

## Start

```bash
tsc -p . && python3 ../felles/serve.py 8013   # http://127.0.0.1:8013/013_abonnementskapasitet/
node kontroll.mjs                              # 17 kontroller
node e2e.mjs                                   # 5 nettlesersjekker
```

## Modell (per måned, forventningsverdier)

1. Frafall: aktive ved månedsstart × frafallsandel.
2. Support: gjenværende aktive × supporttimer per kunde.
3. Oppstart av nye kunder (salgsmål + kø) innenfor *gjenværende* timer i **samme timebudsjett**. Det som ikke får plass, venter i kø.
4. Nye kunder blir aktive (betalende) fra måneden etter oppstart.

- **MRR** = aktive × abonnementspris. **ARR** = MRR × 12. Oppstartsinntekt er engangsinntekt og holdes **utenfor** ARR.
- **Overskridelse:** måneden behovet (support + all ønsket oppstart) først overstiger kapasiteten, vises per pakke.
- Tre prispakker (Basis/Standard/Premium) beregnes med samme kapasitetsgrunnlag.
- Sensitivitetstabell: ARR ved slutt for frafall ×½/×1/×2 og pris ×0,8/×1/×1,2.

## Referansetall (kontrollert)

- Forsiktig/Basis: aₙ = (aₙ₋₁ + 2) × 0,98, a₁ = 0 ⇒ a₁₂ = 2 × 0,98 × (1 − 0,98¹¹)/0,02. ARR = a₁₂ × 1 500 × 12 ≈ **351 510 kr**. Oppstart 12 × 2 × 5 000 = 120 000 kr (ikke i ARR).
- Vekst/Premium: overskrider fra måned 2. Startet i mnd 2 = (100 − (4 × 0,97 + 3) × 0,97 × 4)/20 = 3,665.
- Null kunder gir 0 i abonnement, ARR og oppstart for alle pakker.

Se `resultat/referansetall.json`, `resultat/kontroll.txt` og `resultat/e2e.txt`.

## Antakelser

Salgsmål, frafall og betalingsvilje står som antakelser i hvert scenario og i grensesnittet. Ingen av tallene er målte.
Avvik: UI-et er ren JavaScript uten React. Modellen er TypeScript som bestilt.
