# Robusthetsanalyse – eldreomsorgssystemer (per 100 beboere per år)

Fokus: **livskvalitet_per_krone**

## 1. Frø-stabilitet

5 søk med ulike startpunkt: poeng 0.763–0.824 (spredning 0.061). 2 ulike konsept.

| Frø | Poeng | Konsept |
|---|---|---|
| 1 | 0.763 | sensor=ingen, nattrunde=fast_3t, smerte=mobid2_fast, toalett=vasketork_utvalgte, selskap=kosedyr, arbeidsmaate=vanlig |
| 2 | 0.763 | sensor=ingen, nattrunde=fast_3t, smerte=mobid2_fast, toalett=vasketork_utvalgte, selskap=kosedyr, arbeidsmaate=vanlig |
| 3 | 0.824 | sensor=matte, nattrunde=behovsstyrt, smerte=mobid2_fast, toalett=vasketork_utvalgte, selskap=kosedyr, arbeidsmaate=vanlig |
| 4 | 0.824 | sensor=matte, nattrunde=behovsstyrt, smerte=mobid2_fast, toalett=vasketork_utvalgte, selskap=kosedyr, arbeidsmaate=vanlig |
| 5 | 0.824 | sensor=matte, nattrunde=behovsstyrt, smerte=mobid2_fast, toalett=vasketork_utvalgte, selskap=kosedyr, arbeidsmaate=vanlig |

**Vurdering:** USTABILT – søk lenger eller forenkle modellen.

## 2. Følsomhet (±10 % av spennet)

Grunnpoeng: 0.824. Største utslag først – disse parametrene må måles og styres nøyest i produksjon.

| Parameter | Verdi | −10 % | +10 % |
|---|---|---|---|
| kontaktandel | 0.606 | -0.007 | -0.028 |
| terskel | 2.5 | -0.020 | +0.000 |
| dekning | 1 | -0.006 | +0.000 |
| lys_lux | 10.2 | -0.001 | -0.000 |
| maaleintervall_s | 1.47 | +0.000 | +0.000 |
| batterier | 4 | +0.000 | +0.000 |

## 3. Alternativer for valg

| Parameter | Valgt | Alternativer (endring i poeng) |
|---|---|---|
| sensor | matte | ingen: -0.071, armband: -0.163, radar: -0.048, kombi: -0.033, kamera_samtykke: -0.176 |
| data | hendelser_lokalt | dognaggregat: -0.004, radata_sky: -0.040 |
| strom | batteri | nett: -0.009 |
| nattrunde | behovsstyrt | fast_2t: -0.316, fast_3t: -0.171 |
| smerte | mobid2_fast | ingen: -0.024, mobid2_sensorutlost: +0.000 |
| arbeidsmaate | mimamori_team | vanlig: -0.002 |
| hoftebeskytter | False | True: -0.006 |
| lav_seng_matte | False | True: -0.010 |
| toalett | vasketork_utvalgte | ingen: -0.051, vasketork_alle: -0.092, dfree: -0.094, vasketork_utvalgte_dfree: -0.043 |
| drikke | smartkopp | ingen: -0.002, drikkerunde: -0.110 |
| selskap | kosedyr | ingen: -0.005, paro: -0.026, lovot: -0.040 |
| forflytning | resyone | takheis: -0.009, hug: -0.009 |
| hal | False | True: -0.094 |
