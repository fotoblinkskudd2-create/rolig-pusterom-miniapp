# 21 · Parametrisk hengsel

CadQuery (geometri, STEP/STL, kollisjoner) + Blender/bpy (Cycles-renderinger). Alle mål ligger i `parametre.json`.

## Start

```bash
pip install cadquery bpy trimesh pillow
python3 generer.py              # aksling 3, 4 og 5 mm → resultat/aksel_<d>mm/ (bilder bare for 4 mm)
python3 kontroll.py             # 37 kontroller
```

## Konstruksjon (`hengsel.py`)

- **Blad A** (fast) med knoke 1, 3 og 5 og **mekanisk stopp** på de ytterste knokene. **Blad B** med knoke 2 og 4. Hvert blad har frirom (R + klaring) rundt motpartens knoker.
- **Utskiftbar aksling** med hode, egen del. Hullene er d/2 + klaring.
- **Vinkel θ** mellom bladene: 0 = lukket, 180 = flatt. Gyldig område 0–`stoppvinkel` (120°).
- **Stoppen** = ring rundt aksen ∩ halvrommet bak B-bladets underside i stoppstilling ∩ over A-bladets underside, pluss en krage innenfor Bs frirom som fester klossen til knoken.
- Knokeradius R = d/2 + klaring + veggtykkelse, så hele geometrien regenereres når akseldiameteren endres.

## Parametre (forsøksmål)

`bladlengde 40`, `bladbredde 25`, `bladtykkelse 2,5`, **`akseldiameter 4`**, `klaring 0,3`, `veggtykkelse_knoke 1,6`, `antall_knoker 5`, `knokegap 0,4`, `stoppvinkel 120`.

## Kontrollert (faktiske resultater for 3, 4 og 5 mm)

- Hver del er ett gyldig, lukket BRep-legeme. STL er vanntett (trimesh). STEP åpnes igjen med samme volum.
- Ingen kollisjon (skjæringsvolum 0) mellom A og B eller mellom aksling og B for θ = 0…120° i 5°-steg.
- Når θ passerer stoppvinkelen, griper stoppet: kollisjon ved 121° og 125° (2,0 mm³ ved 120,5° og 20 mm³ ved 125° for 4 mm).
- Akslingen kolliderer ikke med A.

## Leveranser per diameter

`blad_a.step/.stl`, `blad_b_flat.step/.stl`, `aksling.step/.stl`, `sammenstilling_90grader.step`, `rapport.json`.
For 4 mm også `eksplodert.png`, `bevegelse_000…120.png` og `bevegelse.gif`.

## Uverifisert

Styrke, slitasje og levetid er **ikke** vurdert eller prøvd. Bladlengde og akseldiameter er forsøksmål. Kollisjonskontrollen er geometrisk og tar ikke hensyn til produksjonstoleranser utover den valgte klaringen.
