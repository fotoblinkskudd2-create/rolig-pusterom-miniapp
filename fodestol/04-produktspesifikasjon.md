# 04 — Produktspesifikasjon og prototyping: LIVA Plattform

Versjon 0.3 (konsept, LOD 300). Alle mål i mm, vekter i kg. Koordinater: X = lengde (hodeende 0), Y = bredde, Z = høyde over gulv.

## 4.1 Arkitektur i ett bilde

```
                 ┌──── ryggstøtte (0–85°) ───┐
                 │                           │   U-bøyle (teleskop)
                 │                           │        ║
   ══════════════╧═══ SETE (hestesko, delt) ═╧════════╝═══ benseksjon (uttrekk) ══
                       │  QBL-skuff  │           ▼ fotbrett (0–350 under sete)
           ┌───────────┴─────────────┴───────────┐
           │  TVILLING løftesøyler (Z-akse 1)    │  ← jordmor-aksen (fotpedal)
           │  differensial = Trendelenburg ±12°  │
           └──[hjul]─────[5. hjul]───────[hjul]──┘
```

**To akser:**
1. *Jordmor-aksen* — plattformhøyde (tvillingsøyler, synkronisert). Fotpedal på begge sider + håndkontroll.
2. *Kvinne-aksen* — stillingsgeometri (rygg, benseksjon, fotbrett, setesplitt, sving). Modusvelger.

**Perineum-lås:** Når «lås» er aktiv og stilling endres, kompenserer søylene slik at perineum-referansepunktet (senter hesteskoåpning) holder Z ± 20 mm.

## 4.2 Hovedmål

| Parameter | Verdi | Begrunnelse |
|---|---|---|
| Lengde, sengemodus | 2 050 | Plass for 99-persentil kvinne liggende flatt (HLR) |
| Lengde, krakk-/plattformmodus | 1 450 | Frigjør gulvplass (S13) |
| Bredde over sideskinner | 900 | Passerer 1 200 mm sykehusdør og heis med personell |
| Setehøyde (sete-overflate) | 420–1 000 | 420: føtter i gulvet som klassisk krakk. 1 000: stående arbeidshøyde for lege ved instrumentell |
| Setebredde | 600 (utvidbar 750) | Plass for høy BMI; split skaper åpen sone |
| Setedybde | 450 | |
| Hesteskoåpning | 260 B × 220 D, radius 90 | Tilsvarer dokumenterte fødekrakk-geometrier; gir hånd-tilgang fra front |
| Fotbrett under sete | 0–350 (trinnløst, gassfjær + lås) | Holder krakk-biomekanikk (knær ≥ hofter) når plattform er hevet |
| Ryggstøtte | 600 × 750, 0–85° | 85° = front-lenestøtte for knestående |
| Benseksjon (uttrekk) | 600 × 580 | Flatt underlag i sengemodus |
| Trendelenburg / anti-T | ±12° | Differensialstyring av søylene, ingen ekstra motor |
| Sving (rokk) | ±5° om Y-aksen, frigjørbar | Bekkenbevegelse (idé 20) |
| U-bøyle | 600–1 100 over sete | Hengestilling/trekk |
| Egenvekt (mål) | ≤ 165 | Lettere enn typiske 180–250 kg fødesenger |
| SWL | 250 (pasient 215 + tilbehør 35) | Bariatrisk kompatibel |
| Tauankre / U-bøyle last | 150 statisk per punkt, sikkerhetsfaktor 4 | |
| Hjul | 4 × Ø150 + 5. hjul, sentralbrems | |

## 4.3 Moduser (modusvelger)

| Symbol | Modus | Sete Z | Rygg | Benseksjon | Fotbrett | Typisk bruk |
|---|---|---|---|---|---|---|
| ▬ | **Seng** | 600 | 0–30° | ute | inne | Hvile, undersøkelse, HLR |
| ◢ | **Halvsittende** | 700 | 45–60° | ute, 15° ned | inne | Norsk standard utdriving med perinealstøtte |
| ⊓ | **Krakk** | 420–780 | 75° (ryggstøtte for partner/hvile) | inne | 0–350 under sete | Oppreist sittende utdriving. Jordmor på sadelstol |
| ⋀ | **Kne / forover** | 600–850 | 85° (front-lenestøtte) | inne | inne | Knestående, alle fire mot ryggtoppen; setesplitt åpen |
| ◖ | **Side** | 650 | 20° | ute | inne | Sideleie med lårstøtte (epidural) |
| ⌓ | **Gyn** | 950 | 30° | inne | benholdere | Instrumentell, sutur |
| 🔴 | **AKUTT FLAT** | uendret → så 700 | 0° | ute | inne | HLR, skulderdystoci-forberedelse |
| 🟠 | **McRoberts** | 750 | 0–10° | inne | benholdere hyperflektert | Skulderdystoci |

## 4.4 Mekaniske funksjoner

### a) Løft — tvillingsøyler
- To 3-trinns teleskopsøyler (industristandard medisinsk, 24 V, IPX6, f.eks. klasse Linak/Ergomotion/TiMOTION — leverandørvalg i P1), slaglengde 580, 4 000 N hver.
- Synkronisering via kontrollboks (hall-sensorer), differanse gir Trendelenburg.
- **Hvorfor to søyler, ikke saks-løft:** saks gir klemfare og hulrom (hygiene). Én søyle gir torsjon ved knestående på ytterkant. To søyler = stabil, lukket, enkel å vaske.

### b) Ryggstøtte
- Lineær aktuator 6 000 N + gassfjær parallelt for mekanisk HLR-utløsning.
- Topprulle Ø120 integralskum = lenestøtte i knestående.

### c) Benseksjon
- Teleskopisk på kulelagerskinner under setet; lineær aktuator 2 000 N.
- I AKUTT FLAT frigjøres aktuatorens mutter (clutch) og en forspent gassfjær skyver seksjonen ut på < 4 s.

### d) Fotbrett
- Svinger ned fra setefront, 4-ledd parallellogram (holder fotbrettet horisontalt), gassfjær-assistert, låses med fotbetjent utløser. Anti-skli TPE-overflate. 600 × 300.

### e) Delt sete
- I sengemodus lukkes hesteskoåpningen med en innleggspute (integralskum, magnetlås) som lagres i benseksjonen.
- To halvdeler på lineærføringer, manuell utløser med 5 hakk (0 / 30 / 60 / 75 mm per side). Manuell = billigere, enklere, ingen klemfare under strøm. Kant-radius 15 mm i alle åpne kanter.

### f) AKUTT FLAT — mekanisk
- Rød spak på begge sider (hodeende) + rød knapp på håndkontroll.
- Spak trekker bowdenkabler som: (1) løser ryggaktuatorens clutch → gassfjær-dempet nedføring til 0° på ≤ 6 s, (2) løser benseksjonens clutch → ut, (3) låser setesplitt i 0.
- Fotbrett feller automatisk opp (fjær) og benholdere frigjøres til fri sving, slik at ingenting står i veien.
- Fungerer uten strøm. Mål total tid < 10 s.

### g) QBL-modul (kvantitativt blodtap)
- Trakt i PP/silikon festet under hesteskoåpning, engangspose 3 L med fikseringsring.
- Lastcelle (single-point, 5 kg, IP67, kl. C3) + 24-bit ADC; oppløsning 1 g, nøyaktighet ±5 g i 0–3 kg.
- Arbeidsflyt: Pose på → «TARE» → barnet født → «FOSTERVANN FERDIG» (ny tare-referanse) → display viser ml blod (ρ ≈ 1,06 g/ml), trend.
- I hevet krakkmodus står trakten under kvinnen; i seng/halvsittende brukes en flat oppsamlingsduk med samme veieceller via skuff ved setefront.
- Display 4,3" på fotende-sideskinne + valgfri utgang (Bluetooth LE / FHIR) til journalsystem.
- *Begrensning*: måler masse, ikke blodkonsentrasjon. Kluter/tamponger må fortsatt veies separat. Se FMEA.

### h) Lys
- LED-list i plattformfront, 4 000 K, CRI ≥ 90, 0–2 000 lux på 400 mm, dimbar, rettet mot perinealsonen. Varmegenerering < 2 W/cm² — ingen varmepåvirkning på hud.

### i) Tilbehør som bor i rammen
- 2 benholdere (Goepel-type, standard 25 × 10 mm skinneklemme) i sidelommer.
- Lårstøtte (svingbar, 3 akser, låsbar) — sideskinne.
- U-bøyle — sokler i sideskinner ved setet.
- Sadelstol for jordmor (separat, hjul, 500–750, gassløft) kan dokkes i fotenden.

## 4.5 Materialer og konstruksjon

| Del | Materiale | Begrunnelse |
|---|---|---|
| Chassis / base | Sveiset stålrør S355, pulverlakk (polyester, klorresistent), lukkede profiler | Vekt i bunn = stabilitet. Lukket = hygiene |
| Platformrammer (sete, rygg, ben) | Aluminium 6082-T6 ekstrudert + bøyd plate | Lav vekt der masse løftes |
| Puter (sete, rygg, topprulle, ben) | PU integralskum (RIM), hard hud 60–70 Shore A over mykt kjerne, antimikrobiell additiv valgfri, testet ISO 10993-5/-10 | Sømløs, ingen trekk (S7). Kan vaskes på plass |
| Fotbrett-overflate | TPE (anti-skli) over aluminium | Våt-grep |
| Deksel/skjørt | ABS/PC eller vakuumformet PETG, avrundede kanter | Skjuler mekanikk (S12), enkel vask |
| Trakt (QBL) | PP (engang) / platinaherdet silikon (gjenbruk, autoklaverbar) | |
| Glideskinner | Rustfritt stål kulelager, forseglet | |
| Fester | A4 rustfritt | Desinfeksjon |

**Farger:** Chassis varm grå (RAL 7044), puter i tre valgfrie toner (havre, salvie, skifer) — ikke «sykehusblå».

## 4.6 Elektronikk og programvare

- 24 V DC, medisinsk kontrollboks (IEC 60601-1 godkjent komponent), LiFePO4 batteri (≥ 40 fulle løftesykluser), lading via nettstrøm 100–240 V.
- 4 aktuatorkanaler: søyle V, søyle H, rygg, benseksjon.
- Håndkontroll jordmor (modusvelger 6 + høyde ↑↓ + lås + rød AKUTT), pendant for kvinnen (kun ↑↓ rygg og lys — bevisst få knapper), fotpedal × 2.
- Programvare: perineum-lås, moduser, QBL. Utvikles etter IEC 62304 (programvareklasse A/B avhengig av endelig risikoanalyse). Ingen skytjeneste kreves.
- Kollisjonsvern: strømmåling i aktuator + klembeskyttelse (lister) under sete.

## 4.7 Stykkliste (BOM) og kostnad — estimat ved 500 enheter/år

| Gruppe | EUR/stk |
|---|---|
| Chassis (stål, sveis, pulverlakk) | 650 |
| Tvillingsøyler + synkronisering | 900 |
| Rygg- og benaktuator m/clutch | 300 |
| Kontrollboks med batteri | 350 |
| Håndkontroll, pendant, 2 fotpedaler | 280 |
| Hjul (4 + 5.) med sentralbrems | 380 |
| Plattformrammer (alu) | 450 |
| PU integralskum-puter (inkl. amortisert verktøy) | 520 |
| Mekanisk AKUTT-system (gassfjær, kabler, clutch) | 180 |
| QBL-modul (lastcelle, ADC, display, trakt) | 260 |
| LED-arbeidslys | 60 |
| U-bøyle, lårstøtte, 2 benholdere | 420 |
| Kabler, fester, merking | 150 |
| Montasje og sluttest (6 t) | 330 |
| Emballasje/logistikk | 120 |
| **Sum tilvirkningskost** | **≈ 5 350** |

- **Målpris** (liste): €16 500–19 500 → bruttomargin ~65–70 % (normalt for medisinsk utstyr med service/garanti/salgsapparat).
- **Engangskostnad verktøy**: RIM-former €120–200k, sveisejigger €40k, deksel-former €60–90k, testutstyr €50k.
- **Forbruk**: QBL-poser ca. €2–4/fødsel → gjentakende inntekt (se `07`).
- Usikkerhet: ±25 %. Søyler og kontrollboks er største kostnadsdriver — få tilbud fra 3 leverandører i P1.

## 4.8 Produksjonsmetoder

| Del | Metode | Volum-vurdering |
|---|---|---|
| Chassis | Laserkutt rør + robotsveis, pulverlakk | Norsk/nordisk underleverandør mulig (f.eks. Vestlandet/Raufoss-miljøet) |
| Alu-rammer | Ekstrudering + CNC | Standardprofiler i P1, egne i serie |
| Puter | RIM integralskum | Spesialist (DE/IT/PL/SE) |
| Deksler | P1: 3D-print/vakuumform; serie: vakuumform eller sprøytestøp ved > 1 000/år | |
| Elektronikk | Innkjøpte medisinske moduler + egen QBL-kretskort (EMS-partner) | |
| Montasje | Egen montasje i Norge (lav volum, høy kvalitet, ISO 13485) | |

## 4.9 Prototype- og testplan

| Fase | Innhold | Tid | Budsjett (NOK) | Go/kill-kriterium |
|---|---|---|---|---|
| **P0 Lo-fi rigg** | Alu-profiler + manuell jekk, skum-puter, hesteskosete, fotbrett. Måling av arbeidshøyde, rekkevidde, sikt i simuleringsrom med 8–10 jordmødre og fødesimulator | 6 uker | 120 000 | ≥ 70 % av jordmødre vurderer løftet krakk som klart bedre enn gulvkrakk (SUS + RULA). **Ellers drep kjernen.** |
| **P0b Retrofit-QBL** | QBL-skuff på eksisterende seng/krakk, benk-test med simulert blod | parallelt, 8 uker | 150 000 | ±5 g nøyaktighet, < 30 s ekstra arbeid per fødsel |
| **P1 Alfa** | Funksjonell prototype, innkjøpte aktuatorer, CNC-deler, støpte skumputer. Første AKUTT-test, perineum-lås | 5–6 mnd | 1,5–1,8 mill. | AKUTT < 10 s; stabilitet ved 250 kg ytterkant; jordmor-test med 20 deltakere |
| **P2 Beta (×5)** | DFM-konstruksjon, nær-serie-materialer. Formell verifikasjon (IEC 60601-1, -1-2, -2-52-relevante krav) hos akkreditert lab | 9 mnd | 6–8 mill. | Bestått verifikasjon, ingen åpne høyrisiko i FMEA |
| **P3 Klinisk utprøving** | 3 sykehus (forslag: én kvinneklinikk, én mellomstor, én liten), sammenligning mot eksisterende utstyr — se `06` | 12 mnd | 4–6 mill. | Ikke-underlegen sikkerhet; definerte endepunkter |
| **P4 CE + 0-serie** | Teknisk dokumentasjon, samsvarserklæring, PMS/PMCF-plan, 20 enheter | 6 mnd | 6–10 mill. inkl. verktøy | |
| **Totalt** | | **≈ 3–3,5 år** | **≈ 18–26 mill. NOK** | |

Finansieringskandidater: Innovasjon Norge (innovasjonskontrakt med sykehus som partner), Forskningsrådet IPN, SkatteFUNN, helseforetakenes innovasjonsmidler, InnoMed/Nasjonal kompetansetjeneste for innovasjon, EIC Accelerator (P2–P4).
