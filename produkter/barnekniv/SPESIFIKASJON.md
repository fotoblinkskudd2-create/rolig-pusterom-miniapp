# Barnekniv K1 «Spikkevenn» – spesifikasjon, rev A

**Mål:** En ekte spikkekniv for barn i alderen 6–12 år. Det skal være mye vanskeligere å kutte seg med den, men den skal spikke godt nok til at barnet lærer riktig teknikk og blir trygg.
**Status:** Prototype. Ikke testet, ikke sertifisert.

## Hovedfunnet: vinkelen skal være skarp, ikke sløv

Det føles naturlig å gi en barnekniv en sløv egg, men det gjør den farligere:

| Eggvinkel | Sannsynlighet for at kniven sklir (modell) | Total risiko | Spikkeevne |
|---|---|---|---|
| 20° | 0,20 | 0,14 | 0,79 (skjør egg) |
| **23° (K1)** | **0,26** | **0,16** | **0,93** |
| 34° | 0,50 | 0,22 | 0,61 |
| 45° (sløv) | 0,64 | 0,25 | 0,59 |

En sløv egg biter ikke i treet. Barnet presser hardere, eggen sklir av, og all kraften går inn i hånden eller låret. **Sikkerheten kommer fra fem andre vinkler og former:**

1. **Eggvinkel 23°, scandi-slip:** biter forutsigbart med lite kraft. Den flate fasetten er lett å kjenne mot treet og lett å slipe.
2. **Bladet peker 7° ned i forhold til skaftet:** håndleddet holdes rett når barnet spikker bort fra kroppen. Det gir bedre kontroll og fører eggen bort fra knærne. Modellen gir 18 % lavere risiko enn et rett blad.
3. **Rund spiss, R8:** kan ikke stikke. Det gjelder også ved fall, og når kniven settes i sliren.
4. **Fingervern som stikker 7,6 mm ut:** hånden kan ikke gli fram på eggen.
5. **Usleipet sone på 12 mm ved vernet:** også om fingrene kommer forbi vernet, møter de stål uten egg.

Til sammen anslår modellen at risikoen for kutt er **81 % lavere enn med en vanlig tollekniv**, og spikkeevnen er 93 % av en voksenkniv. Tallene er beregnet, ikke målt. Se testplanen.

## Mål

| Del | Spesifikasjon |
|---|---|
| Blad | 67 × 18 mm, rygg 2,7 mm, Sandvik 12C27 rustfritt stål, 56–57 HRC |
| Egg | Scandi, 23° inkludert vinkel, fasett 6,6 mm høy, ingen mikrofas |
| Spiss | Rund, R8 |
| Usleipet sone | 12 mm fra vernet, eggen avrundet til R0,5 |
| Bladfall | 7° ned, bøyd varmt ved vernet før herding |
| Tommelrampe | 6 riller i ryggen, 1 mm brede med 2,2 mm mellomrom |
| Skaft | 95 mm langt, 22 × 19 mm ovalt, TPE-gummi over PP-kjerne, signaloransje |
| Fingervern | 5 mm tykt i lengderetningen, stikker 7,6 mm ut under og 1 mm over skaftet |
| Snorhull | Ø4 mm bakerst, for å feste kniven i beltet |
| Total lengde | ≈ 162 mm |
| Vekt | ≈ 70 g |
| Slire | PP med klikklås og utløserknapp. Kniven faller ikke ut, og barnet må bruke begge hender for å ta den ut. Beltehempe. |

## Filer

| Fil | Hva |
|---|---|
| `kniv.scad` | Parametrisk 3D-modell i OpenSCAD. Alle mål står øverst i fila. |
| `kniv_K1_blad.stl`, `kniv_K1_skaft.stl` | Skaftet kan 3D-printes direkte. Bladet er laget for å vurdere formen. |
| `kniv_K1_tegning.png/.svg` | Teknisk tegning med mål og snitt |
| `kniv_K1_3d.png` | 3D-bilde |
| `problem.py` | Risikomodell og poeng for oppfinnelsesmaskinen |

## Testplan

1. **Skliing:** La en testrigg spikke furu og bjørk med fast kraft (20–60 N) i ulike vinkler. Tell hvor ofte eggen sklir, for 23°, 30° og 40°.
2. **Glid fram på eggen:** Bruk en hånddukke av silikon med gelfingre og skyv den fram langs skaftet med 50 N. Mål hvor mange millimeter av eggen som blir kontaktet, med og uten vern og usleipet sone.
3. **Stikk:** Slipp kniven med spissen ned fra 1 m mot ballistisk gel (10 %), og mål hvor dypt den går inn. Sammenlign spiss og R8.
4. **Barn, 6–12 år**, med en voksen instruktør: La 20+ barn spikke en pinne og en smørkniv. Registrer nesten-uhell på video, spør hvor trygge de føler seg (skala 1–5), og vurder hvordan det ble.
5. **Grep:** Test med våte hender og hansker.
6. Legg målingene inn i `score()` og kjør maskinen på nytt for K2.

## Regelverk og ansvar

- I Norge er det ikke ulovlig at barn har en kniv **i friluft under tilsyn**, men produktet må markedsføres riktig. Det skal stå «under tilsyn av voksen».
- Leketøysdirektivet (EN 71) gjelder ikke, fordi en kniv ikke er leketøy. Den alminnelige produktsikkerhetsforordningen (GPSR, EU 2023/988) gjelder. Lag en risikovurdering og bruksanvisning med spikkeregler: spikk bort fra kroppen, hold «blodsirkelen» fri (en armlengde rundt deg uten andre folk), og sett kniven i sliren når du går.
- **Patentsøk:** Det finnes flere barnekniver med rund spiss og fingervern. Kombinasjonen av 7° bladfall og usleipet sone må sjekkes.
