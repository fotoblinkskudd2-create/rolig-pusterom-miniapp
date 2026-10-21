# Dag 28 — Pulsoksymeteret: målt på hvit hud, brukt på alle

> Den lille klypa på fingeren. Rødt lys. Et tall. 94 %. Greit, sier legen, du kan gå hjem. Men hvis huden din er mørk, kan det tallet lyve. Under covid, da milliarder av beslutninger ble tatt på det tallet, viste en studie i NEJM at svarte pasienter nesten tre ganger så ofte hadde skjult oksygenmangel som apparatet ikke så. Teknologien var «nøytral». Den var kalibrert på de hvite.

## Hva det er
Pulsoksymeter – måler oksygenmetning (SpO₂) ved å sende rødt og infrarødt lys gjennom vev.

## Sporet
| Felt | Verdi |
|---|---|
| Studie | Sjoding MW, Dickson RP, Iwashyna TJ, Gay SE, Valley TS. *Racial bias in pulse oximetry measurement.* N Engl J Med 2020;383:2477–2478 |
| Funn | Skjult hypoksemi (arteriell SaO₂ < 88 % mens SpO₂ viste 92–96 %) hos ca. 11,7 % av svarte pasienter vs. 3,6 % av hvite |
| Myndighet | FDA safety communication (2021) og ny utkast til veiledning om testing på pasienter med variert hudpigmentering (2025) *(verifiser datoer)* |
| Fysikk | Melanin absorberer lys i de bølgelengdene som brukes; kalibreringsstudier hadde historisk få deltakere med mørk hud |

## Hvorfor det er dårlig
1. **Systematisk overestimering** hos personer med mørk hud.
2. **Behandlingsbeslutninger** (oksygen, innleggelse) tas på feil grunnlag.
3. **Dårlig representative kalibreringsdata.**

## Rotårsaken
Testpopulasjonen definerte «normalen». Ingen krav om hudtone-mangfold i godkjenningen.

## Tre nye løsninger
1. **Krav om mangfoldig kalibrering** – objektivt målt hudtone (f.eks. Monk-skala/spektrofotometer), ikke selvrapportert etnisitet.
2. **Flere bølgelengder** og algoritme som kompenserer for pigment.
3. **Usikkerhet vist** – apparatet viser usikkerhetsintervall og flagger når signalet er dårlig.

## Konsept: **ALLE** – pigment-kompenserende oksymeter
| Spesifikasjon | Verdi |
|---|---|
| Lys | 5+ bølgelengder (f.eks. 530, 590, 660, 805, 940 nm) |
| Hudtonemåling | Innebygd refleksjonsmåling av hud før hver måling |
| Kalibrering | Validert mot arteriell blodgass i populasjon med ≥ 25 % mørkest hudtonegruppe |
| Skjerm | SpO₂ + usikkerhetsintervall + signalkvalitetsindikator |
| Varsling | «Usikker måling – vurder blodgass» når intervallet krysser terskel |
| Åpenhet | Valideringsdata publisert per hudtonegruppe |

## Konseptbilde-prompt
```
Medical device design concept, fingertip pulse oximeter with display showing SpO2 value with a visible uncertainty band and signal quality bar, multiple LED wavelengths illustrated in a cutaway, hands of diverse skin tones each using the device in a grid, clinical clean white with deep teal, equity-focused medical design
```

## Dagens oppgave
- [ ] Les Sjoding et al. 2020 (kort, 2 sider).
- [ ] Finn FDAs siste veiledning om pulsoksymetre. Hva krever den nå?
- [ ] Spør: Hva bruker norske sykehus? Er det noen norsk studie på dette?

**Grav videre:** Søk «pulse oximeter skin pigmentation compensation» på Google Patents – hvem er i gang?
