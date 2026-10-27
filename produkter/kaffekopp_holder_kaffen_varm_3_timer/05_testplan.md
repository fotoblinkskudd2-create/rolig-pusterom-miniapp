# 05 Testplan – kaffekopp «Tretimer» P1

Alt i rapporten er **modellert, ikke testet**. Denne planen avgjør om løftene holder.
Standard testoppsett (S): rom/klimaskap 20 ± 1 °C, 50 ± 10 % RF, stille luft (< 0,2 m/s). Vann som
erstatning for kaffe (cp avviker < 1 %). Temperatur måles med termoelement type K (± 0,5 °C, kalibrert mot
referanse) midt i væsken, 20 mm over bunnen. Logger med 10 s intervall.

**Prototyper:** P1-A: 6 stk fra OEM-prøveserie (med PCM). P1-B: 3 stk uten PCM (samme kropp, for å isolere PCM-effekten).
Referanse: 3 stk YETI Rambler 14 oz Mug.

| # | Krav (fra brief) | Modell sier | Testmetode | Utstyr | Utvalg | **Bestått** | Kost (NOK) | Tid |
|---|---|---|---|---|---|---|---|---|
| T1 | **K1**: siste slurk etter 3 t, bruk, uten forvarming | 62,7 °C (pess. +30 %: 57,4) | S + kopp på 20 °C, 300 ml vann 85 ± 0,5 °C. Sprøytepumpe/pipette tar 15 ml hvert 15. min, lokket av 8 s (robot eller stoppeklokke) | Klimaskap, datalogger, 4× TC, vannkoker med termostat, pipette | 6 P1-A × 3 gjentak | **≥ 55,0 °C på alle 18**. Snitt ≥ 58 °C | 10 000 | 1 uke |
| T1b | **K1b**: som T1, men forvarmet (skyll 60 s med 85 °C vann, tøm) | 63,8 °C (pess.: 62,9) | Som T1 | Som T1 | 6 × 3 | **≥ 60,0 °C på alle 18** | (i T1) | 3 dager |
| T2 | **K2**: lukket 3 t | 63,0 °C (pess.: 60,8) | S, lokket lukket, ingen uttak | Som T1 | 6 × 2 | **≥ 60,0 °C**, snitt ≥ 61 °C | (i T1) | 2 dager |
| T3 | **K3**: drikkeklar ≤ 20 min | 17 min til ≤ 66 °C | Fra T1-loggene: tid fra helling til T ≤ 66 °C | – | 18 | **≤ 20 min** på alle | 0 | – |
| T4 | Modellkalibrering: varmetap per vei | Hals ≈ 67 %, lokk 14 %, stråling 13 % | (a) Kjøle-kurve P1-B uten PCM, lukket → total UA. (b) Samme med lokket byttet mot 50 mm EPS-lokk → UA uten lokk. (c) IR-kamera på hals og lokk etter 30 min | IR-kamera (FLIR E8 eller lån), EPS | 3 P1-B | UA_total ≤ 0,040 W/K ved 64 °C. Avvik fra modell ≤ ± 25 % | 5 000 (leie IR) | 3 dager |
| T5 | PCM: smeltepunkt og latent varme | 64 °C, 170 kJ/kg | DSC av PCM-batch (0,5 K/min) hos lab. Fyllvekt ved veiing før/etter fylling | DSC (SINTEF/universitet), vekt 0,1 g | 3 batcher, 10 kopper | Smeltetopp 63–65 °C, ΔH ≥ 160 kJ/kg, fyll 73 ± 3 g | 12 000 | 2 uker |
| T6 | **K4/K5/K6**: volum, høyde, vekt | 330 ml, 115 mm, 417 g | Veiing tom og full til kant, skyvelære | Vekt, skyvelære | 6 | ≥ 330 ml, ≤ 125 mm, ≤ 450 g | 0 | 1 dag |
| T7 | **K9**: oppvaskmaskin | – | EN 12875-1, 500 sykluser, deretter T2 på nytt | Oppvaskmaskin, lab | 3 | Belegg intakt (visuelt + tape-test), T2 innen 1 °C av før-verdi | 25 000 (ekstern lab) | 6 uker |
| T8 | **K10**: fall | – | 1 m fall på betong, 6 orienteringer (bunn, kant, lokk, hank, 2× side), så T2 og heliumlekktest | Betonggulv, He-lekkdetektor (OEM) | 3 | Ingen vakuumtap (T2 ≥ 60 °C), ingen PCM-lekkasje, lokk fortsatt tett | 3 000 | 2 dager |
| T9 | **K11**: søl ved velt | – | Full kopp, lokk lukket, velt 90° på bord, samle søl 10 s | Vekt | 6 × 3 | ≤ 2 ml | 0 | 1 dag |
| T10 | **K8**: matkontakt | – | Migrasjonstest PP-lokk (EU 10/2011, simulant B og D2, 70 °C/2 t), silikon (BfR XV), keramisk belegg og stål (CoE-metallveileder) | Akkreditert lab (Eurofins o.l.) | 1 sett per materiale | Under alle spesifikke og totale migrasjonsgrenser | 40 000 | 4–6 uker |
| T11 | PCM-kappe tett over levetid | – | Termisk sykling 20 ↔ 90 °C, 1 000 sykluser, så heliumlekktest og T2 | Varmebad 2 stk, OEM He-test | 3 | Lekkrate < 1·10⁻⁹ mbar·l/s, T2 innen 1 °C | 15 000 | 4 uker |
| T12 | Overflatetemperatur (berøring) | Ikke modellert | 95 °C vann, lukket, IR/TC på ytre kant og hank etter 5 min | IR, TC | 3 | Ytre vegg og hank ≤ 45 °C. Lokkskjørt ≤ 50 °C | 0 | 1 dag |
| T13 | Brukertest (myke ønsker) | – | 12 hjemmekontor-brukere i 1 uke. Logger antall varme slurker, spørreskjema (1–7) | P1-A 12 stk | 12 | ≥ 70 % gir ≥ 6/7 på «kaffen var god å drikke hele tiden». ≥ 8/12 vil kjøpe for 599 NOK | 8 000 (gaver) | 2 uker |
| T14 | **K12**: kost | 141 NOK | Bindende tilbud fra ≥ 3 OEM for 5 000 og 20 000 stk | – | 3 tilbud | ≤ 150 NOK landet ved 5 000 stk | 0 (tid) | 4 uker |

**Totalt:** ≈ 120 000 NOK eksterne kostnader + prototyper (≈ 60–100 kNOK OEM-prøveserie), ca. 8–10 uker
(T7, T10 og T11 går parallelt).

## Stopp-kriterier
- T1 snitt < 55 °C **eller** T4 viser UA > 0,05 W/K → konseptet holder ikke. Vurder alternativ C (smal reisekopp) eller lavere løfte.
- T8/T11 viser PCM-lekkasje → ikke lanser PCM-varianten. Lanser alternativ B (uten PCM) med lavere løfte.

## Hvordan målingene skal inn i `score()` for neste versjon
1. **T4 (a, b)** gir målt `UA_total` og `UA_lokk` → kalibrer `ua_hals` direkte. Erstatt den effektive halslengden
   `0.3 * min(h_inn - h_fyll, 0.025) + hals_mm` med en målt konstant G_hals per mm halslengde. Erstatt `LOKK["vakuumlokk"][0]` med målt U.
2. **T5** → sett `LATENT_PCM` og `pcm_smelt_c`-bredden (±1,5 K) til målt DSC-kurve.
3. **T1/T2-kurvene** → kjør minste kvadraters tilpasning av `PESSIMISME`-faktoren (én skalar) mot alle 18 kurver.
   Hvis faktoren er > 1,15, endre markedsløftet. Lagre kurvene i `produkter/kaffekopp_holder_kaffen_varm_3_timer/maalinger/`.
4. **T12** → legg til delpoeng «berøring» (kanttemperatur) i `bruk`.
5. **T13** → bytt vektene i `FOKUS` og drikkevinduet (55–66 °C) med brukernes faktiske foretrukne temperatur.
6. Kjør `python3 -m maskin` og `maskin.robusthet` på nytt og oppdater RAPPORT.md med `[målt]`-merker.
