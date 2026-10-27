# Robusthetsanalyse – barnekniver

Fokus: **trygghet**

## 1. Frø-stabilitet

5 søk med ulike startpunkt: poeng 0.917–0.920 (spredning 0.004). 1 ulike konsept.

| Frø | Poeng | Konsept |
|---|---|---|
| 1 | 0.917 | spiss=rund_r8, slip=scandi, skaft_materiale=tpe_gummi, slire=klikk_med_knapp |
| 2 | 0.919 | spiss=rund_r8, slip=scandi, skaft_materiale=tpe_gummi, slire=klikk_med_knapp |
| 3 | 0.920 | spiss=rund_r8, slip=scandi, skaft_materiale=tpe_gummi, slire=klikk_med_knapp |
| 4 | 0.920 | spiss=rund_r8, slip=scandi, skaft_materiale=tpe_gummi, slire=klikk_med_knapp |
| 5 | 0.919 | spiss=rund_r8, slip=scandi, skaft_materiale=tpe_gummi, slire=klikk_med_knapp |

**Vurdering:** stabilt.

## 2. Følsomhet (±10 % av spennet)

Grunnpoeng: 0.920. Største utslag først – disse parametrene må måles og styres nøyest i produksjon.

| Parameter | Verdi | −10 % | +10 % |
|---|---|---|---|
| eggvinkel_grader | 22.8 | -0.020 | -0.019 |
| blad_fall_grader | 7 | -0.007 | -0.007 |
| usleipet_mm | 12 | -0.006 | -0.003 |
| skaft_lengde_mm | 95 | -0.006 | -0.006 |
| rygg_mm | 2.69 | -0.003 | +0.000 |
| blad_lengde_mm | 67 | -0.003 | -0.003 |
| skaft_tykkelse_mm | 22 | -0.002 | -0.002 |
| blad_hoyde_mm | 18 | -0.001 | -0.001 |
| fingervern_mm | 7.63 | +0.000 | +0.000 |

## 3. Alternativer for valg

| Parameter | Valgt | Alternativer (endring i poeng) |
|---|---|---|
| spiss | rund_r8 | spiss: -0.112, avrundet_r4: -0.024, but: -0.001 |
| slip | scandi | flat: -0.046, hul: -0.076, konveks: -0.103 |
| tommelrampe | True | False: -0.051 |
| skaft_materiale | tpe_gummi | tre: -0.006, plast: -0.009 |
| slire | klikk_med_knapp | friksjon: -0.029, klikk: -0.007 |
| signalfarge | True | False: -0.023 |
