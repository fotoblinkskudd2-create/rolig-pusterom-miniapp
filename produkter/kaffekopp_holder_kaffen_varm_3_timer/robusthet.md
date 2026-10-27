# Robusthetsanalyse – kaffekopper

Fokus: **varme**

## 1. Frø-stabilitet

5 søk med ulike startpunkt: poeng 0.751–0.753 (spredning 0.002). 1 ulike konsept.

| Frø | Poeng | Konsept |
|---|---|---|
| 1 | 0.753 | belegg=kobber, lokk=vakuumlokk, hank=True, innside=keramikkbelegg |
| 2 | 0.751 | belegg=kobber, lokk=vakuumlokk, hank=True, innside=keramikkbelegg |
| 3 | 0.752 | belegg=kobber, lokk=vakuumlokk, hank=True, innside=keramikkbelegg |
| 4 | 0.753 | belegg=kobber, lokk=vakuumlokk, hank=True, innside=keramikkbelegg |
| 5 | 0.752 | belegg=kobber, lokk=vakuumlokk, hank=True, innside=keramikkbelegg |

**Vurdering:** stabilt.

## 2. Følsomhet (±10 % av spennet)

Grunnpoeng: 0.753. Største utslag først – disse parametrene må måles og styres nøyest i produksjon.

| Parameter | Verdi | −10 % | +10 % |
|---|---|---|---|
| diameter_mm | 70.3 | -0.236 | -0.023 |
| pcm_smelt_c | 64.2 | -0.037 | -0.051 |
| vegg_mm | 0.35 | +0.000 | -0.050 |
| kapasitet_ml | 330 | +0.000 | -0.037 |
| pcm_g | 73.4 | -0.023 | -0.022 |
| hals_mm | 20 | -0.011 | +0.000 |

## 3. Alternativer for valg

| Parameter | Valgt | Alternativer (endring i poeng) |
|---|---|---|
| belegg | kobber | blank_staal: -0.073 |
| kantskjort | True | False: -0.116 |
| lokk | vakuumlokk | ingen: -0.514, skyvelokk: -0.358, klikklokk_pakning: -0.181 |
| hank | True | False: -0.013 |
| innside | keramikkbelegg | staal: -0.004 |

## 4. Pessimistisk kjøring og scenarier (lagt til manuelt)

Kravet (≥ 60 °C ved siste slurk etter 3 t) avhenger av én usikker antakelse: **hvor mye varme som
lekker gjennom halsen** (der indre og ytre stålvegg møtes). Halsen står for ≈ 67 % av varmetapet i
valgt design ved 64 °C `[modell]` (stråling 13 %, lokk 14 %, restgass 6 %). Effektiv lengde på
ledningsveien og varmeovergangen på ytterveggen er `[antakelse]`. Derfor er alle varmetap skrudd
20–40 % opp og ned (`KAFFE_PESSIMISME`).

| Scenario | Valgt design (P1): siste slurk etter 3 t | lukket 3 t | YETI-ref: siste slurk | lukket 3 t |
|---|---|---|---|---|
| nominell | 62.7 °C | 63.0 °C | 38.6 °C | 47.2 °C |
| varmetap +30 % | **57.4 °C** | 60.8 °C | 33.2 °C | 41.5 °C |
| varmetap +40 % | **55.9 °C** | 59.8 °C | 31.8 °C | 39.9 °C |
| varmetap −20 % | 63.3 °C | 63.6 °C | 43.4 °C | 51.9 °C |
| forvarmet kopp (60 °C) | 63.8 °C | 64.3 °C | 39.0 °C | 47.9 °C |
| forvarmet + varmetap +30 % | **62.9 °C** | 63.4 °C | 33.5 °C | 42.0 °C |
| kaffe 80 °C i stedet for 85 °C | 57.0 °C | 60.1 °C | 37.2 °C | 45.2 °C |
| kaffe 90 °C | 63.5 °C | 64.0 °C | 39.9 °C | 49.2 °C |
| kaldt rom 15 °C | 59.6 °C | 62.1 °C | 35.2 °C | 44.4 °C |
| lokket av 20 s per slurk | 61.2 °C | 63.0 °C | 38.0 °C | 47.2 °C |

Re-optimering med varmetap +30 %: beste design i hele rommet når **59,7 °C** (samme konsept,
PCM 80 g / 61 °C). Det finnes altså **ingen** kopp-formet variant uten strøm som garantert holder
≥ 60 °C ved siste slurk uten forvarming, hvis tapene er 30 % høyere enn modellen.

**Konklusjon:**
- «≥ 60 °C etter 3 t» holder bare med nominell eller optimistisk modell → **ikke lov å love** før test.
- **«≥ 55 °C etter 3 t i bruk»** holder i alle scenarier ned til +40 % tap → trygt produktløfte.
- **«≥ 60 °C etter 3 t når koppen er forvarmet»** (skyll med varmt vann i 30 s) holder også ved +30 %.
- Kaffe som er kaldere enn 85 °C ved helling, slår hardt ut, fordi PCM-et da ikke smelter helt.
  Det må stå i bruksanvisningen.

**Kalibreringssjekk:** Modellen gir Stanley Trigger-Action 350 ml (forvarmet, 95 °C, lukket) 3,6–4,0 t
til 60 °C. Stanley oppgir «varm i 5 t» `[kilde: Cotswold Outdoor]`, men uten definisjon av «varm».
Modellen er altså enten rimelig eller noe pessimistisk. Den skal ikke ha vært for optimistisk.

**Følsomhet:** Utslaget på `diameter_mm` (−0,24) kommer av høydegrensen (125 mm). En smalere kopp med
300 ml blir for høy. Designet ligger altså helt inntil to grenser: høyde 125 mm og plate 0,35 mm.
Halslengden står på øvre grense (20 mm), så en lengre hals ville hjulpet ytterligere.
