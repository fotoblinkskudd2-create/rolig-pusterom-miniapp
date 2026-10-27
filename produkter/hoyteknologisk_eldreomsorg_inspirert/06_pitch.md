# 06 Pitch og stresstest – «Stille vakt»

Merking: `[kilde]` · `[modell]` · `[antakelse]`. Ingenting er testet. Alle effekttall er modell og må merkes slik i markedsføring.

## Enlinjer (≤ 15 ord)
**«La dem sove. Vær der når de våkner.»**
Lang variant: *Sensoren holder vakt om natten, så pleierne kan bruke tiden på mennesker.* (13 ord)

## 30-sekunders pitch
Hver natt vekkes beboere på norske sykehjem av en lommelykt hver andre time, mens smerte hos personer med demens går uoppdaget om dagen.
«Stille vakt» er en japansk-inspirert arbeidsmåte med et lite hjelpemiddel. En batterimodul på sengen og en strimmel under madrassen
viser hvem som sover rolig, og tenner et svakt rav gulvlys når noen setter seg opp. Det finnes ikke kamera eller mikrofon. Pleierne slipper
rutinerundene og får i modellen tilbake rundt 30 timer per beboer per år. Vi hjelper kommunen å legge den tiden inn i turnus som fast kontakttid og
smertekartlegging. Modellen vår gir ≈ 4 gode leveår per 100 beboere per år til omtrent null netto kostnad. Nå vil vi teste det
i en pilot med én kommune.

## Tre sterkeste argumenter (PEEL)

### 1. Søvn i stedet for lommelykt (pathos + logos)
- **Poeng:** Den største lidelsen vi kan fjerne billigst, er at beboere vekkes uten grunn.
- **Evidens:** Snuing hver 2. time ga ikke færre trykksår enn hver 4. time hos beboere med god madrass `[kilde: TURN-studien, ≈ 1 000 beboere]`.
  SINTEF fant mindre uro og medisinbruk etter digitalt tilsyn på Økernhjemmet `[kilde: SINTEF]`. I vår modell står søvn for ≈ 29 % av livskvalitetsgevinsten `[modell]`.
- **Forklaring:** Når sensoren viser «i seng, rolig», trenger ingen å åpne døren. Runden blir et besøk når beboeren faktisk trenger det.
- **Link:** For pårørende betyr det at mor får sove. For virksomhetslederen betyr det færre urolige morgener og mindre beroligende medisin.

### 2. Tiden går til mennesker, ikke til kutt (logos + ethos)
- **Poeng:** Vi selger ikke en sensor. Vi selger en dokumentert måte å flytte tid fra runder til kontakt og smertekartlegging.
- **Evidens:** Strukturert smertebehandling ga 17 % mindre agitasjon hos personer med demens i en norsk RCT `[kilde: Husebø mfl., BMJ 2011, 352 beboere]`.
  44 % av beboerne har klinisk smerte `[kilde: COSMOS]`. Modellen gir ≈ 34 frigjorte timer per beboer-år og ≈ 3,4 min kontakt per beboer per døgn `[modell, mid]`.
- **Forklaring:** Mimamori-teamet (fra Japans lokalbaserte omsorg) går gjennom sensorlogg og MOBID-2 hver uke og planlegger «mitt kvarter» i turnus.
- **Link:** Kommunen bestemmer selv hvor mye av gevinsten som går til kontakt og hvor mye som går til budsjettet. Vi viser konsekvensen av hvert valg.

### 3. Personvern er bygget inn, ikke lagt til (ethos + logos)
- **Poeng:** Ingen kamera, ingen mikrofon, og bare hendelser lagres lokalt. Det gir den enkleste DPIA-en og det sterkeste verdighetsargumentet.
- **Evidens:** Pbrl. § 4-6a krever vedtak for varslingsteknologi hos personer uten samtykkekompetanse, og at tiltaket stoppes ved motstand `[kilde: Helsedirektoratet]`.
  Vi leverer DPIA-mal og vedtaksmal. Den japanske robotpakken med kamera ga lavest poeng i modellen (0,38 mot 0,81) `[modell]`.
- **Forklaring:** Hver beboer har én modul på sengen og ingenting på kroppen eller i taket. Batterimodulen tåler desinfeksjon, og beboeren kan ikke åpne den.
- **Link:** Personvernombudet og pårørende kan si ja raskt. Det forkorter innføringen med måneder.

## Stresstest

### Skeptisk investor
| Angrep | Ærlig svar |
|---|---|
| «Vitalthings har allerede ≈ 150 kommuner på Hepro-avtalen. Hvorfor skal noen bytte?» | **Riktig, og det er den største markedsrisikoen.** Vi tar ikke radarkundene først, men de ≈ 50 % av sykehjemmene som ikke har digitalt tilsyn `[antakelse]`. Arbeidsmåtepakken kan også selges *oppå* eksisterende radar. Det reduserer avhengigheten av maskinvare. |
| «Maskinvare til 6 900 kr i et anbudsmarked, hvor er vollgraven?» | Det er en tynn vollgrav (se 03_patent: svak patentposisjon). Vollgraven er pilotdata, integrasjoner med pasientvarsling og en arbeidsmåte som er dokumentert i norske kommuner. Den er ikke bevist før piloten. |
| «Verst-scenariet gir tap.» | Riktig: ≈ 800 senger per år dekker ikke ≈ 8 MNOK i faste kostnader `[antakelse]`. Mottiltak: start som tjenesteselskap som bruker innkjøpt sensor (lav kapitalbinding), og bygg egen kantmodul først når piloten viser effekt. |

### Kunde (kommune / virksomhetsleder)
| Angrep | Ærlig svar |
|---|---|
| «Sengealarmer virker ikke, det viste REFINE.» | **Enig.** Vi lover ikke færre fall fra alarmen. Modellen gir bare ≈ 7 % sjanse for å komme før beboeren står. Fallgevinsten (≈ −19 % `[modell]`) kommer fra færre vekkinger, gulvlys og fallplan, og den er ikke testet. |
| «Vi har ikke folk til kurs og mimamori-team.» | Kurs er 2 dager. Teamet bruker ≈ 45 min per avdeling per uke `[antakelse]`. Det finansieres av de første nettene uten runder. Hvis avdelingen ikke kan frigjøre den tiden, anbefaler vi å vente. |
| «Hva om sensoren svikter og en beboer ligger på gulvet?» | Fail-safe: uten signal går beboeren automatisk tilbake til 3 t-runde. Gulvdeteksjon («ute av seng > X min») gir varsel. Stoppregel i piloten ved én liggetid > 60 min forårsaket av systemet. |

### Fagekspert / myndighet (Datatilsynet, Statsforvalteren, geriater)
| Angrep | Ærlig svar |
|---|---|
| «Dette er overvåking av personer som ikke kan samtykke.» | Det er varslingsteknologi etter pbrl. § 4-6a og krever individuelt vedtak, vurdering av samtykkekompetanse for dette tiltaket og stopp ved motstand. Dataminimering: ingen bilde, ingen lyd, bare hendelser. DPIA før start. Hvis en beboer protesterer, fjernes modulen. |
| «QALY-tallene deres er gjetning.» | **Delvis riktig.** Vektene for søvn, kontakt og smerte er antakelser forankret i studier og står for 75 % av gevinsten. Derfor er piloten bygget for å måle akkurat dem (QUALID, EQ-5D-proxy, MOBID-2). Pessimistisk scenario gir 3,0 QALY og ICER ≈ 109 000 kr, fortsatt under laveste betalingsvilje. |
| «Er dette medisinsk utstyr (MDR)?» | Ikke så lenge formålet er varsling og tilsyn og ikke diagnose `[antakelse, må bekreftes av DMP]`. Vi markedsfører ikke «oppdager smerte» eller «forutsier fall». Det ville trolig gitt klasse IIa (regel 11). |

Feilslutninger vi unngår: Vi svarer ikke «Japan gjør det, så det virker» (autoritetsargument uten evidens). PARO-RCT-en viste faktisk ingen effekt mot kosedyr.
Vi setter heller ikke opp en falsk dikotomi mellom «robot» og «menneske». Systemet er laget for å gi *mer* menneskelig tid. Hvis en motpart sier «teknologi i omsorg er alltid
umenneskelig», er det en stråmann. Ingen foreslår å erstatte pleiere, og vi svarer med tallet for kontakttid.

## Påstander vi IKKE kan bruke ennå
| Påstand | Hvorfor ikke | Hva som trengs |
|---|---|---|
| «Reduserer fall med 19 %» / «færre hoftebrudd» | Bare modell. REFINE viser at sengealarmer ikke reduserer fall | Pilot P2 + multisenterstudie |
| «Gir 4 gode leveår per 100 beboere» | Modell med antatte QALY-vekter | Pilot P5/P6 |
| «Sparer kommunen penger» | Avhenger av turnusendring og kontaktandel | Pilot P3/P8 |
| «260 dager batteritid» | Energibudsjett, ikke målt | T1 |
| «Oppdager smerte» / «forutsier fall» | Ville gjort produktet til MDR-utstyr og er ikke testet | Ikke bruk |
| «Bedre søvn» | Ikke målt | P5 (aktigrafi) |
| «Godkjent av Datatilsynet» | Datatilsynet godkjenner ikke produkter | Ikke bruk. Si «DPIA-mal følger med» |

**Lov å bruke nå:** «ingen kamera og ingen mikrofon», «bare hendelser lagres, lokalt», «batteri, ingen kabel på gulvet», «rav gulvlys som tennes når
beboeren setter seg opp», «faller tilbake til fast runde hvis sensoren svikter», «bygger på norsk forskning om smertekartlegging (MOBID-2)»,
«inspirert av japansk mimamori-praksis», og alle `[kilde]`-tall med kilde oppgitt. Modelltall kan bare brukes merket som «modellberegning, ikke testet».
