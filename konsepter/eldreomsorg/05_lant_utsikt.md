# 5. Lånt utsikt

**Tagline:** Et vindu hjem, med morgenlys og kveldslys som følger døgnet.
**Rolle:** langsiktig og radikal · AI, lys og innhold

## 2. Målgruppe og kontekst
- Beboere på sykehjem med demens og kveldsuro, og sengeliggende beboere.
- Sengeliggende hjemmeboende.
- Fellesstuer på skjermede enheter.

## 3. Problemstilling
- **Kveldsuro** («sundowning»): Uro og angst om ettermiddagen og kvelden er vanlig ved demens. Det fører ofte til beroligende medisin ved behov.
- **Lite dagslys og forstyrret døgnrytme** inne gir dårlig søvn.
- **Hjemlengsel og at man ikke vet hvor man er:** «Jeg må hjem.»
- **Smertepunkt:** Ettermiddagen er den tyngste tiden for beboerne. For pleierne er den dårligst bemannet.

## 4. Konsept og brukerreise
Et stort «vindu» står på rommet eller i fellesstua. Det består av en skjerm eller projeksjon i en ekte vindusramme og et LED-panel bak som gir riktig dagslys. Det viser:

1. **Hjemstedet ditt.** Det kan være et direktebilde fra et webkamera på stedet (for eksempel Henningsvær havn) eller en 3D-scene som AI har bygget fra familiens gamle bilder.
2. **Riktig tid og vær.** Utsikten følger klokke, årstid og vær (fra yr/MET). Lyset er sterkt og kjølig om morgenen, som hjelper døgnrytmen, og varmt og svakt om kvelden.
3. **Lydbilde** med lav lyd: måker, bølger og kirkeklokker søndag klokken 11.
4. **Besøk gjennom vinduet:** Datteren ringer på video og står «utenfor vinduet». Arne trenger ikke å bruke noen app.
5. **Samtalestøtte for pleiere:** forslag som «Spør Arne om båten *Kvitbjørn*» fra familiens minnenotater.

**Brukerreise:** Klokken 15.30 begynner Arne å bli urolig. Sara setter seg ved vinduet med ham. Det er ettermiddag i Henningsvær, og en sjark er på vei inn. Arne begynner å fortelle. Lyset i rommet blir gradvis varmere. Klokken 21 sover han uten ekstra medisin.

## 5. Nøkkelfunksjoner og fordeler
- **Lys som styrer døgnrytmen,** uten ekstra arbeid for pleierne.
- **Personlig hjemsted** som utgangspunkt for minnesamtaler og trygghet.
- **Video gjennom vinduet:** naturlig for personer som ikke kan bruke nettbrett.
- **Felles modus for stua:** «sakte-TV»-utsikter, for eksempel fra Hurtigruten.
- **Dempes automatisk** når ingen er i rommet, så det sparer strøm.

## 6. Teknologi og komponenter
- **Skjerm** på 55–65 tommer med matt overflate, eller en projektor med kort kast.
- **LED-panel** med justerbar fargetemperatur (2700–6500 K) og høy fargegjengivelse (CRI over 90).
- **Liten PC** som spiller av lokalt, slik at det virker uten nett.
- **Innhold:**
  - direktebilder fra webkamera (med lisens)
  - NRKs sakte-TV og Nasjonalbibliotekets arkiv `[antakelse: lisensavtale]`
  - 3D-scener laget av AI fra bilder (Gaussian splatting og generativ utfylling)
- **Værdata** fra MET Norway (yr), som er åpent tilgjengelig.
- **Tilstedeværelse:** radarsensor, ikke kamera.
- **Hvorfor disse valgene:** Behandling uten medisiner, som virker passivt og bygger på teknologi som allerede finnes.

## 7. TRL og gjennomførbarhet
- **TRL:** Komponentene ligger på 7–9 og systemet på 4–5. **Gjennomførbarheten er moderat.**
- **Barrierer:**
  - det koster å lage personlig innhold
  - virkningen er ikke dokumentert
  - blending og plassering i rommet
  - etikk rundt «falske» vinduer

## 8. Prototype (MVP)
- **Bygg:** én fellesstue med en 65-tommers TV i en vindusramme, et justerbart LED-panel og en PC. PC-en spiller av et døgn med opptak fra et lokalt havnekamera eller film tatt av en frivillig, synkronisert med klokken.
- **Test:** 8 uker på to skjermede enheter.
- **Mål:**
  - uro om kvelden (registrering hver 30. minutt fra klokken 15 til 21)
  - medisin gitt ved behov
  - hva pleierne opplever
- **Fase 2:** personlige vinduer til 10 beboere.

## 9. Kostnadsoverslag: moderat til høy
| Post | Anslag | Antakelse |
|---|---|---|
| Utvikling | 4–8 MNOK | Maskinvaredesign, innholdsplattform, AI-produksjon av scener, studie |
| Produksjonskost per vindu | 20–35 kNOK | Skjerm, LED-panel, ramme og PC |
| Innhold per person | 1 000–3 000 kr | Frivillige samler bilder, AI og menneske kontrollerer |
| Drift | 1 000–2 000 kr/år | Lisenser, service og strøm (ca. 150 W de timene det er på) |

## 10. Implementeringsplan
| Fase | Måneder |
|---|---|
| Konsept, etikk og lisenser | 3 |
| Prototype (fellesvindu) | 6 |
| Pilot (fellesvindu og personlige vinduer) | 9 |
| Utrulling | 12 |
| **Totalt** | **≈ 30** |

## 11. Pilot og suksesskriterier
- **Utvalg:** 4 skjermede enheter og om lag 40 beboere med demens. To enheter får vinduet først, de to andre etter 3 måneder (trinnvis innføring).

| KPI | Mål |
|---|---|
| Uro (CMAI, skjema for urolig atferd) | −20 % |
| Psykiske symptomer ved demens (NPI-NH) | −15 % |
| Beroligende medisin ved behov, klokken 15–23 | −25 % |
| Søvn (natt, radar eller observasjon) | +30 min |
| Livskvalitet ved demens (QUALIDEM) | Bedre |
| Pleietid brukt på uro om kvelden | −20 % |

## 12. Etikk, personvern og regelverk
- **Er et «falskt vindu» bedrag?** Vinduet beskrives åpent som et bilde («la oss se på Henningsvær»), aldri som virkeligheten. Det vurderes for hver beboer, og bruken stoppes hos dem som blir urolige av det.
- **AI-innhold:** Det lages aldri falske personer eller stemmer av avdøde. Bare steder og landskap genereres. EUs AI-forordning krever åpenhet, så det merkes «laget fra bilder».
- **Personvern:** Familiebilder er personopplysninger. De brukes bare med samtykke og lagres lokalt. Videosamtaler er kryptert og blir aldri tatt opp.
- **Lys:** Det må vurderes for blending og epilepsi. Det skal ikke være blinkende innhold.

## 13. Barrierer og risikoer
| Risiko | Mottiltak |
|---|---|
| Svak dokumentasjon av virkning | Pilot med kontrollgruppe, og bare kjøp ved påvist effekt |
| Innholdet blir for dyrt | Felles utsikter i stua først, deretter personlige |
| Pleierne bruker det som «barnevakt» | Brukes sammen med samtale. Opplæring i minnearbeid |
| Lisenser for direktebilder | Avtaler med kommuner, havner og NRK. Frivillige filmer |

## 14. Forretningsmodell og skalering
- **Betalere:** kommunen (sykehjem), som investering eller leie. Familier kan betale for personlig innhold.
- **Partnere:**
  - lysprodusent (for eksempel Glamox)
  - NRK og Nasjonalbiblioteket (innhold)
  - demensforskere
  - frivillige fotografer
- **Patent:** Kombinasjonen av døgnrytmelys og personlig, værsynkronisert utsikt kan vurderes for patent. Ellers designregistrering og plattform.

## 15. Bærekraft og materialer
- Rammen er laget av gjenbrukt treverk fra gamle vinduer.
- Skjermen kan skiftes, og levetiden er 8 år. Det slås av når ingen er der.

## 16. Samarbeidspartnere og kompetanse
Lysdesigner, sykepleier og psykolog med demenskompetanse, AI- og 3D-utvikler, jurist (opphavsrett og personvern), etiker og innholdsprodusent.

## 17. UI/UX og fysisk design
- **Fysisk:** en ekte vindusramme i tre med sprosser og vinduskarm, der det kan stå en plante. Ingen knapper for beboeren.
- **For pleiere:** en liten fjernkontroll eller nettbrett med tre valg: Hjemsted, Felles utsikt og Besøk. Et døgnprogram går automatisk.

```
 ┌────┬────┐
 │ ~~ │ ⛵ │  Henningsvær kl. 15.30
 ├────┼────┤  lys: varm 3000 K
 │ ▁▁ │ ▁▁ │
 └────┴────┘
 [ karm med plante ]
```

## 18. Hvorfor uventet
Japanske hager bruker *shakkei*, lånt landskap, og trekker fjellet i det fjerne inn i hagen. Her låner vi beboerens eget hjemsted inn i rommet og lar lyset følge døgnet.

## Scenario: Arne, 81
Arne er blitt urolig hver ettermiddag og vil «ned til båten». Pleierne har gitt beroligende medisin tre kvelder i uka.

Med Lånt utsikt sitter han ved vinduet og ser Henningsvær i ettermiddagslys. Han peker ut sjarkene og navngir dem. Etter to måneder får han beroligende medisin én kveld i uka, og datteren hans «besøker» ham gjennom vinduet hver søndag.
