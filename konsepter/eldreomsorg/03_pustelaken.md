# 3. Pustelakenet

**Tagline:** Et laken som snur deg forsiktig, så pleieren kan holde deg i hånden i stedet.
**Rolle:** langsiktig innovasjon · høyteknologisk (myk robotikk)

## 2. Målgruppe og kontekst
- Sengeliggende beboere på sykehjem og hjemmeboende som får hjelpemidler gjennom NAV.
- Pleiere og nattevakter.

## 3. Problemstilling
- **Trykksår** gir smerte, infeksjoner og lange liggetider. Det er en av de hyppigste uønskede hendelsene i sykehjem `[kilde: pasientsikkerhetsprogrammet]`.
- **Snuing hver 2.–4. time** krever ofte to pleiere, vekker beboeren og tar tid.
- **Forflytning** fra seng til stol er en vanlig årsak til muskel- og skjelettplager hos helsepersonell `[kilde: Arbeidstilsynet]`.
- **Smertepunkt:** Sara snur fire beboere hver natt. Det koster henne ryggen og koster beboerne søvn.

## 4. Konsept og brukerreise
Et tynt laken (2–3 cm) med luftkamre legges oppå en vanlig madrass. En matte av tekstilsensorer under lakenet kartlegger trykket mot huden kontinuerlig. En lydløs styringsenhet blåser opp og slipper luft ut av kamrene. Det gjør tre ting:

1. **Mikrovending:** Hvert 20.–40. minutt vippes kroppen 10–15° til den ene siden og så til den andre, så langsomt at beboeren ikke våkner. Algoritmen avlaster der trykket har vart lengst, for eksempel på hælen eller korsbeinet.
2. **Hjelp til forflytning:** Lakenet løfter seg og danner en luftpute. Da kan én pleier skyve beboeren sidelengs til stolen eller en annen seng, med samme prinsipp som luftputeløftere.
3. **Varsel:** Hvis et område har hatt høyt trykk over grensen for lenge, får pleieren beskjed på telefonen: «Arne: hæl høyre, 2 t 10 min».

**Brukerreise:** Sara legger lakenet på og velger «Natt». Hun går inn klokken 02 for å sjekke og holde Arne i hånden i stedet for å snu ham. Om morgenen skal Arne opp i stolen. Sara velger «Flytt», lakenet løfter seg, og hun skyver ham over alene med sklimatte.

## 5. Nøkkelfunksjoner og fordeler
- **Trykkavlastning ut fra målinger,** ikke etter klokken.
- **Færre manuelle snuinger om natten,** så beboeren får sove.
- **Én pleier kan forflytte i stedet for to,** med mindre belastning på ryggen.
- **Trykkkart i sanntid** og logg over tid, til trykksårforebygging og journal.
- **Kan kobles til «Stille vakt»,** så nattilsynet ser både uro og trykk.

## 6. Teknologi og komponenter
- **Kamre:** TPU-belagt nylon uten PFAS, 6 kamre på langs og 4 på tvers, som tåler sveising med høyfrekvens.
- **Sensorer:** kapasitiv trykkmatte i tekstil (16 × 32 punkter) og temperaturmåling.
- **Pumpe og ventiler:** stille membranpumpe (under 30 dB) og magnetventiler. Utslippet dempes.
- **Styring:** ARM-mikrokontroller. Algoritmen bruker trykk ganget med tid per område (dose-terskelkurver fra forskning på vevsskade).
- **Kommunikasjon:** BLE og Wi-Fi mot sykesignalanlegget. Det har reservebatteri.
- **Hvorfor disse valgene:** Myk robotikk er trygt mot kroppen, lett og stille. Det gir roboten *i* sengen, ikke ved siden av.

## 7. TRL og gjennomførbarhet
- **TRL:** 4–5. Komponentene finnes og er modne: vekseltrykksmadrasser (TRL 9), vendesystemer og luftputeløftere. **Det nye er kombinasjonen.** Gjennomførbarheten er moderat.
- **Barrierer:**
  - kamre som tåler mange år
  - støy
  - rengjøring og smittevern
  - CE-merking som medisinsk utstyr (MDR, sannsynligvis klasse I eller IIa)
  - klinisk dokumentasjon

## 8. Prototype (MVP)
- **Bygg:** Bruk pumpen fra en vanlig vekseltrykksmadrass, en 3D-printet ventilblokk, sveisede kamre og en kommersiell matte for trykkmåling.
- **Test 1:** 5 friske frivillige. Mål trykkfordeling, komfort, støy og om de våkner.
- **Test 2:** 10 beboere med lav risiko og etisk godkjenning. Mål om de tåler det og hvordan pleierne opplever forflytning.

## 9. Kostnadsoverslag: høy
| Post | Anslag | Antakelse |
|---|---|---|
| Utvikling, inkludert MDR og klinisk studie | 15–30 MNOK | 3 år, partner med produksjonserfaring |
| Produksjonskost per enhet | 12–20 kNOK | Ved 500 enheter i året |
| Pris | 35–50 kNOK, eller leie 1 200 kr/mnd | Via kommunen eller NAV hjelpemiddelsentral |
| Drift | ca. 1 500 kr/år | Service, nye trekk og batteri |

## 10. Implementeringsplan
| Fase | Måneder |
|---|---|
| Konsept, kravspesifikasjon og risikoanalyse (ISO 14971) | 4 |
| Prototype, laboratorie- og frivillig-test | 10 |
| Klinisk pilot | 12 |
| MDR-merking og utrulling | 18 |
| **Totalt** | **≈ 44** |

## 11. Pilot og suksesskriterier
- **Utvalg:** 40 beboere med høy risiko for trykksår (Braden-skår 12 eller lavere) på 4 sykehjem.
- **Design:** innføring trinnvis (stepped-wedge) over 12 måneder.

| KPI | Mål |
|---|---|
| Nye trykksår (kategori 2 eller høyere) per 1000 sengedøgn | −40 % |
| Manuelle snuinger om natten | −60 % |
| Pleietid per natt | −45 min per avdeling |
| Søvn (antall oppvåkninger, observert eller målt) | −30 % |
| Belastning på pleiernes rygg (REBA og selvrapport) | Mindre ved forflytning |
| Komfort (NRS 0–10) | Minst like god som før |

## 12. Etikk, personvern og regelverk
- **Medisinsk utstyr (MDR):** risikostyring, klinisk evaluering og overvåking etter at produktet er i markedet.
- **Data:** Trykkart er helseopplysninger (GDPR art. 9). De behandles lokalt, og bare sammendrag går til journalen.
- **Dilemma: kan bevegelse uten samtykke være tvang?** For beboere uten samtykkekompetanse skal bruken inngå i tiltaksplanen og vurderes etter pasient- og brukerrettighetsloven kap. 4A ved motstand. Lakenet har aldri noen fastholdende funksjon og kan alltid stoppes med en stor knapp.
- **Sikkerhet:** Lakenet tømmes for luft ved strømbrudd. Hjertestarter og HLR kan brukes uten å fjerne det.

## 13. Barrierer og risikoer
| Risiko | Mottiltak |
|---|---|
| Lekkasje eller slitasje i kamrene | Kammermoduler som kan skiftes på 5 min |
| Støy om natten | Krav om under 30 dB og langsom luftstrøm |
| «Teknologien tar over omsorgen» | Tiden som frigjøres, legges inn i turnus som tid med beboerne |
| Lang vei til MDR-merking | Partner med etablert produsent av madrasser eller seng |

## 14. Forretningsmodell og skalering
- **Betalere:** kommunen for sykehjem, og NAV hjelpemiddelsentral for hjemmeboende. Kan også leies.
- **Partnere:**
  - norsk eller nordisk sengeprodusent
  - SINTEF eller NTNU (myk robotikk)
  - sårsykepleiere
- **Patent:** Kombinasjonen av trykkstyrt mikrovending og forflytning kan være patenterbar. Søk etter kjent teknikk hos Arjo, Hillrom og Vendlet først.

## 15. Bærekraft og materialer
- Modulære kamre som kan skiftes og 8–10 års levetid.
- Belegg uten PFAS. Produktet kan settes i stand og brukes igjen via hjelpemiddelsentralen.

## 16. Samarbeidspartnere og kompetanse
Ingeniør i myk robotikk, mekatroniker, sårsykepleier, ergoterapeut, fagperson på MDR og regulatorisk arbeid, smittevern, sykehjemspleiere og NAV hjelpemiddelsentral.

## 17. UI/UX og fysisk design
- **Ved fotenden:** én stor dreieknapp med tre valg (Hvile, Natt, Flytt) og en stor rød STOPP-knapp.
- **Nettbrett eller telefon for pleier:** kroppskart med farger fra blått (lavt trykk over tid) til oransje (nær grensen). Ingen rød alarm før det haster.
- **For beboeren:** ingenting å gjøre. Lakenet kjennes som en tykk, myk dyne.

```
   hode            fot
  [=][=][=][=][=][=]   ← 6 langskamre
  [---- trykkmatte ----]
  [   vanlig madrass   ]   ◄ styringsenhet
```

## 18. Hvorfor uventet
Japan bygde RIBA, en robot som løfter som en bjørn. Pustelakenet løfter som et åndedrag. Myk robotikk flyttes *inn* i sengen og blir usynlig.

## Scenario: Sara, 46, og Arne, 81
Klokken 02.15 får Sara ingen påminnelse om å snu Arne, fordi Pustelakenet har avlastet hælen hans seks ganger i natt. I stedet setter hun seg hos Bjørg, som ikke får sove, og holder henne i hånden.

Om morgenen flytter Sara Arne til stolen alene, uten å kjenne ryggen. Etter tre måneder er trykksåret på hælen grodd.
