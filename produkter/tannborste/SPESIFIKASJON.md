# Tannbørste P1 «Ren» – spesifikasjon, rev A

**Mål:** Fjerne mest mulig plakk, uten å skade tannkjøttet.
**Status:** Dette er en prototype for testing. Den er ikke godkjent som medisinsk utstyr eller CE-merket.
**Filer:** `prototype.scad` (parametrisk 3D-modell), `p1_hode.stl` og `p1_skaft.stl` (for 3D-print), `prototype_tegning.svg` (teknisk tegning).

## 1. Hovedmål

| Del | Mål |
|---|---|
| Lengde totalt | ≈ 214 mm |
| Skaft | 130 mm lang, Ø26 mm, midje Ø23 mm 60 mm fra bunnen |
| Nakke | 60 mm, Ø9 → Ø6,5 mm, knekk på 12° ved 45 mm |
| Hode | 20 × 9,5 × 5 mm, avlangt |
| Vekt (mål) | ≈ 115 g med hode |

## 2. Buster (42 tuster)

| Sone | Antall | Plassering | Bust | Høyde |
|---|---|---|---|---|
| Roterende skive Ø9 | 24 (1 + 8 + 15) | Fremst | PBT Ø0,144 mm, endene avrundet | 10 mm |
| Tanntråd-tuster | 4 | Tverrgående rad 10 mm fra bakkant | PBT Ø0,12 mm, spisse og avrundede | 12 mm |
| Faste tuster | 14 (2 × 7) | Bakerst, X-mønster | PBT Ø0,144 mm | 9 mm |

- Bustene er avrundet i endene (minst 80 % avrunding etter ISO 20126), slik at de ikke river opp tannkjøttet.
- Bustene på de faste tustene vinkles mot tannkjøttkanten (Bass-teknikk). Test vinkler fra 16° til 45°.

## 3. Drift og elektronikk

| Funksjon | Spesifikasjon |
|---|---|
| Bevegelse | Roterende-oscillerende skive, ±20°, 8 000 bevegelser/min |
| Motor | Mikromotor med kam (eksentrisk) som driver skiva via drivaksel gjennom nakken |
| Trykksensor | Hall-sensor eller strekklapp. LED-ringen lyser rødt og motoren går saktere over 2,0 N |
| Timer | 2:00, kort pulsering hvert 30. sek (fire soner i munnen) |
| Batteri | Li-ion 18350, ≈ 1000 mAh, ≈ 3 uker ved pussing 2 × 2 min per dag |
| Lading | Induktiv (Qi-lignende) i bunnen, så det ikke finnes åpne kontakter |
| Tetthet | IPX7: tåler å være under vann i 30 min på 1 m dybde |

## 4. Materialer

| Del | Materiale |
|---|---|
| Skaftskall | Bambusfiber-kompositt med matt, sklisikker lakk |
| Indre hus | PP eller ABS, ultralydsveiset og tett |
| Hode og nakke | PP, tannfarget |
| Tungerenser | TPE med 6 ribber på baksiden av hodet |
| Buster | PBT (DuPont Tynex eller tilsvarende) |

## 5. Bytte av hode

- Hodet klikkes på drivakselen med en bajonett.
- Hodet byttes hver 3. måned. Indikatorbuster bleknes for å vise når det er på tide.
- Bare hodet kastes (≈ 4 g), ikke hele børsten.

## 6. Test før neste versjon

1. **Plakkfjerning:** 20+ testpersoner. Mål plakkindeks (Turesky-modifisert Quigley-Hein) før og etter pussing. Sammenlign med en Oral-B-børste og en manuell børste. Én ting endres om gangen.
2. **Skånsomhet:** Mål gingivalindeks (Löe-Silness) etter 4 uker, og målt abrasjon på dentin eller akryl.
3. **Rekkevidde:** Observer hvor godt den når bakre jeksler i en modell av munnen eller med plakkfarging.
4. **Holdbarhet:** 2 år med simulert pussing. Mål hvor mye bustene sprer seg ut og hvor lenge motoren holder.
5. Legg målingene inn i `score()` i `oppfinn.py`, kjør optimaliseringen på nytt og lag P2.

## 7. Usikkert i P1

- Optimaliseringen ville ha et 14 mm tynt skaft. Motor og batteri krever ≈ 26 mm, så skaftet er gjort tykkere.
- Det er ikke testet om de lange tanntråd-tustene kommer i veien for den roterende skiva.
- Vinkelen på X-tustene er et anslag og må testes.
