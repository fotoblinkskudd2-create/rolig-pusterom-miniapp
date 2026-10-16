# Signal — MVP-spec (#2: én-signal bipolar-flagg)

## Gapet
Mood-apper for bipolar: svak evidens, dårlig personvern, passive data som ikke valideres, journaler ingen orker. Signal gjør det motsatte: tre aktive punkter, egen baseline, ett flagg, en plan du skrev selv.

## Kjerne
- **Logg (20 sek/dag):** søvn i timer, aktivitet 1–5, irritabilitet 1–5. Én rad per dag, siste lagring vinner.
- **Baseline:** median av de 28 dagene før siste 3. Minst 7 dager før noe flagges.
- **Avvik per dag:** søvn ±1,5 t, aktivitet ±1,5, irritabilitet +1,5 fra *din* median.
- **Flagg:** minst 2 av siste 3 dager med ≥ 2 avvik i samme retning (opp = mindre søvn/mer fart; ned = mer søvn/mindre energi). Irritabilitet teller i begge retninger, men aldri alene.
- **Hard regel:** < 4 t søvn to netter på rad = flagg, også uten baseline.
- **Eskalering:** egen plan (hvem ringer jeg, neste 24 t, mine tegn) + 116 117 / 116 123 / 113 som `tel:`-lenker.
- **Ingen passiv overvåking.** Ingen sky. Export til `.txt`. Slett alt.

Alle terskler ligger i `RULES` i `signal-core.js`.

## Måles i test
- Falske flagg: én dårlig dag skal **ikke** flagge.
- Personlig baseline: en som alltid sover 5,5 t skal ikke flagges for 5,5 t.
- Tid til flagg: dag 2 av et vedvarende avvik.

`node signal-core.test.js` → 8 tester.

## Ikke i denne versjonen
Påminnelse/varsling (krever PWA + service worker), deling av flagg med pårørende, justerbare terskler i UI, validering mot faktiske episoder. Ikke medisinsk utstyr — prototype.
