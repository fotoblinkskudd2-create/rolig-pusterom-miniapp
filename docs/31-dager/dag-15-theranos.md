# Dag 15 — Theranos Edison: én bloddråpe, null sannhet

> Svart turtleneck. Dyp stemme. «Hundrevis av tester fra én dråpe blod.» Walgreens solgte det. Generaler satt i styret. Verdsatt til ni milliarder dollar. Pasienter fikk feil svar på kalium, på blodfortynning, på graviditet. Og under det hele: et lager av patenter som fikk det til å se ekte ut. Papir som løy med stempel fra staten.

## Hva det er
«Edison» – en kompakt blodanalysemaskin som skulle utføre hundrevis av laboratorietester fra et fingerstikk.

## Sporet
| Felt | Verdi |
|---|---|
| Patent (eksempel) | **US 8,088,593** «Modular point-of-care devices and uses thereof» – innlevert 2. okt. 2008, utstedt 3. jan. 2012. Oppfinnere bl.a. Elizabeth A. Holmes, Ian Gibbons, Tammy Burd |
| Lenke | https://patents.google.com/patent/US8088593 |
| Portefølje | Holmes var oppført på et stort antall patenter (rapportert 18 US + 66 utenlandske i 2014) |
| Utfall | Holmes dømt for bedrageri (jan. 2022), 11 år og 3 mnd. fengsel. Selskapet oppløst 2018. |
| Kilde | John Carreyrou, *Bad Blood* (2018); Wall Street Journal-avsløringene fra okt. 2015 |

## Hvorfor det er dårlig
1. **Kapillærblod fra fingerstikk er en dårligere prøve** – vevsvæske blander seg inn, celler kan sprekke (hemolyse → falskt høyt kalium).
2. **For lite volum** for mange tester samtidig, med de metodene som fantes.
3. **Patentene beskrev ambisjoner, ikke validerte resultater.** Et patent krever ikke at oppfinnelsen virker i praksis på det nivået som markedsføres.
4. **Pasienter tok medisinske beslutninger på feil svar.**

## Rotårsaken
Et genuint ønske (mindre stikk, billigere tester, tilgang) kombinert med fravær av åpen validering. Hemmelighold ble solgt som innovasjon.

## Tre nye løsninger
1. **Smalt testpanel, ærlig presisjon** – noen få tester som faktisk fungerer godt fra kapillærblod (f.eks. HbA1c, CRP, hemoglobin) med publisert usikkerhet.
2. **Åpen valideringsdata** – hver test publiserer sammenligning mot referanselab (Bland-Altman-plott) på emballasjen/QR.
3. **Hjemmeprøvetaking til ekte lab** – tørr bloddråpe (DBS) eller små venøse prøver sendt i posten.

## Konsept: **ÆRLIG** – pasientnær test med åpen nøyaktighet
| Spesifikasjon | Verdi |
|---|---|
| Panel | Maks 5 analytter, valgt fordi de er validert for kapillærblod |
| Volum | 20–40 µL per test |
| Skjerm | Viser alltid resultat **med usikkerhetsintervall** («CRP 12 mg/L ± 2») |
| Kvalitetskontroll | Daglig kontrollprøve låser maskinen hvis avvik |
| Åpenhet | QR på hver kassett → offentlig valideringsrapport + lot-data |
| Varsling | Kritiske verdier → «ta ny venøs prøve før beslutning» |
| Regulering | CE-IVDR klasse etter test, ingen markedsføring før uavhengig studie |

## Konseptbilde-prompt
```
Medical device design concept, compact point-of-care blood analyzer with a clear display showing a result with a visible uncertainty interval, single-use cartridge with QR code, printed validation chart beside it, clinical clean white and calm blue, honest and transparent visual language, no glamour, product render on lab bench
```

## Dagens oppgave
- [ ] Les krav 1 i US 8,088,593. Hva *påstår* det, og hva *beviser* det?
- [ ] Les om hemolyse og kapillærblod (Norsk Elektronisk Legehåndbok eller lab-veileder fra et norsk sykehus).
- [ ] Design skjermbildet til ÆRLIG: hvordan viser du usikkerhet så en vanlig person forstår det?

**Grav videre:** Stanford CIS: «Theranos: How a broken patent system sustained its decade-long deception».
