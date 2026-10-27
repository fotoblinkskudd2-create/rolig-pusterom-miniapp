# Dronepropell P1 – spesifikasjon, rev A

**Krav:** Minst 17 % mer effektiv enn en vanlig 10×4,5-propell. Det vil si minst 17 % mer skyvkraft per watt, eller like mye mindre strøm for samme løft.
**Bruk:** Quadcopter på 1,6 kg (3,92 N per propell i sveving), motorer for 10″-propeller.
**Status:** Designet og beregnet med en modell (BEMT), men ikke testet på testbenk.

## Resultat

| Variant | Diameter | Gevinst i sveving (modell) | Hvis profilet er 25 % dårligere enn antatt | Holder kravet? |
|---|---|---|---|---|
| **P1** | 254 mm (10″) | **19,1 %** | 15,2 % | Bare hvis profilet er så godt som modellen antar |
| **P1-10,5″** | 267 mm | **25,1 %** | 21,0 % | **Ja, med god margin** |

Gevinsten holder over hele driftsområdet. For P1 er den 21 % ved 0,6× svevelast og 17 % ved 2× svevelast. Se `propell_P1_ytelse.png`.

**Anbefaling:** Lag begge versjonene. Bruk P1-10,5″ hvis rammen har plass til 6,5 mm mer per propellspiss. Det er den eneste varianten der kravet holder også når modellen tar feil.

## Hvor kommer gevinsten fra? (Ærlig svar)

1. **Profilet** står for nesten hele gevinsten. Et tynt, krummet profil (≈ NACA 4405, 5 % tykt) har mye mindre motstand enn det tykke, flatbunnede profilet vanlige propeller har, når luften strømmer så sakte som her (Reynolds-tall 30 000–80 000). Med den nye bladformen men gammelt profil blir gevinsten −0,8 %.
2. **Vridning og bredde** er tilpasset det nye profilet. Bladet er bredt innerst (32 mm), smalt ytterst (5 mm), og vinkelen går fra 27° til 6°. Pitch/D er 0,25 innerst og 0,35 ytterst.
3. **Lavere tippfart:** 81 m/s mot 76 m/s er omtrent likt, så støyen blir også omtrent som før.
4. **10,5″-varianten:** Større diameter gir mindre indusert effekt, omtrent proporsjonalt med 1/D. Det er ren fysikk (momentteori) og den sikreste gevinsten.

## Geometri

Full tabell for hver variant står i `geometri_P1.csv` og `geometri_P1-10_5in.csv`.

| r/R | Korde (bredde) | Bladvinkel |
|---|---|---|
| 0,15 | 32 mm | 27° |
| 0,45 | 25 mm | 12° |
| 0,70 | 16 mm | 9° |
| 0,95 | 6 mm | 6,5° |

- **Antall blader:** 2. Tre blader gir 0,7 % mer, men 76 % mer bladareal, som gir en tregere propell og dårligere styring.
- **Profil:** ≈ NACA 4405. Ved roten blir det tykkere, minst 3 mm, for styrke.
- **Nav:** Ø18 × 8 mm, akselhull Ø5 mm. Tilpass dette til motoren.
- **Materiale:** Karbonfiber, presset eller sprøytestøpt CF-nylon. Et så tynt profil i ren nylon bøyer seg og flagrer.
- **Retning:** CCW og CW. Begge STL-filene ligger her.

## Filer

| Fil | Hva |
|---|---|
| `propell_P1_CCW.stl`, `propell_P1_CW.stl` | 3D-modell for 10″, til 3D-print av prototype eller støpeform |
| `propell_P1-10_5in_CCW.stl`, `_CW.stl` | 3D-modell for 10,5″ |
| `propell_P1_planform.png/.svg` | Bladform med tabell over bredde og vinkel |
| `propell_P1_ytelse.png/.svg` | Effekt mot skyvkraft, ny og gammel |
| `bemt.py` | Fysikkmodellen (bladelement-momentteori med tipptap) |
| `problem.py` | Parametre og poeng for oppfinnelsesmaskinen |
| `lag_propell.py` | Analyse, STL og tegninger |

## Testplan (det som avgjør om kravet faktisk holder)

1. **3D-print** begge variantene i SLA-resin eller CF-nylon og balanser dem (< 0,05 g ubalanse).
2. **Testbenk** med lastcelle og strøm- og spenningsmåling, for eksempel RCbenchmark/Tyto 1585. Kjør fra 2 til 8 N.
3. **Mål gram per watt** for P1, P1-10,5″ og 3 vanlige 10×4,5-propeller som referanse.
4. **Bestått:** P1 skal ha minst 17 % høyere g/W enn snittet av referansene ved 3,9 N.
5. Legg målingene inn i `bemt.PROFILER` (`cd0`, `k`) og kjør maskinen på nytt for P2.
6. **Flytest:** flytid i sveving med samme batteri, og respons og vibrasjoner.

**Kjente begrensninger i modellen:** Den regner bare på sveving og ser bort fra virvlingen i luftstrømmen bak propellen (svært liten effekt i sveving). Profildataene er tilnærmet og ikke målt. Bladet bøyer seg ikke i modellen. Fremoverflyging er ikke vurdert.
