# Hygieneprodukter: 5 prototyper – byggepakke for designteam og ingeniører

Versjon 0.1 · 3. november 2026 · Status: utkast til bygging, ikke ferdig validert

> *Jeg sitter på kjøkkenkrakken klokken 03:12. Kaffen er kald, regnskapet er åpent i en fane jeg ikke tør å lukke, og det fuktige lakenet under meg klistrer seg til lårene som en bekjennelse jeg ikke ville ha. Kjøkkenviften bråker. Telefonen lyser: «Bekreftet: bestilling levert». Jeg har ikke bestilt noe. Systemet har. Vi bygger fem ting som gjør at man slipper å sitte her. Ingen mirakler. Bare ting som virker, testet, med tall.*

---

## Del 0 – Handlingsplan (oppsummering)

### 0.1 Oversikt

| # | Produkt (arbeidsnavn) | Områdets kjerne | Prototype 1 (minimal) | Prototype 2 (forbedret) | Pilot | Prototype-budsjett (ekskl. lønn, lab) | Hovedrisiko |
|---|---|---|---|---|---|---|---|
| D | **RenSåpe** – fast såpe + flytende konsentrat + refill-dispenser | Såpe / renhet | Uke 3–10 | Uke 13–20 | Uke 21–30 | NOK 25 000–35 000 | Hudirritasjon, preserveringskrav |
| B | **SvalPad** – svettepad med luktkontroll og valgfri PCM-kjøling | Svette | Uke 3–10 | Uke 13–20 | Uke 21–30 | NOK 25 000–40 000 | Testmetodikk for svette og lukt |
| A | **TørrNatt** – avtagbar sengekjerne med passiv barriere og aktiv fukt-/luftstyring | Søvn / nattlig hygiene | Uke 5–14 | Uke 15–26 | Uke 27–40 | NOK 50 000–75 000 | Elektrisitet i seng, personvern, medisinsk-produkt-grenser |
| E | **Renspyl** (toalett-retrofit, vannsparing) + **Myk Skog** (toalettpapir, bærekraftig fiber) | Toalett / papir | Uke 9–18 | Uke 19–32 | Uke 33–44 | NOK 60 000–90 000 | Laboratorietilgang, rørleggerstandarder |
| C | **RenTann** – byttbart tannbørstehode med UV-C-desinfeksjonsdokk | Tannkost | Uke 13–22 | Uke 23–36 | Uke 37–52 | NOK 80 000–110 000 | Elektrisk sikkerhet, UV-C, etikk/forskning på mennesker |

**Totalbudsjett prototyper (R1 + R2, inkl. materialer, enkel lab og 3D-print): ca. NOK 240 000–350 000.** Pilotkostnader kommer i tillegg (anslått NOK 150 000–400 000 per produkt avhengig av antall enheter og om vi må gjøre klinisk test). Lønn og prosjektledelse er ikke regnet inn. Alle tall er estimater og skal verifiseres med leverandørtilbud.

### 0.2 Prioritering (risiko/effekt)

1. **D – RenSåpe** først: lav regulatorisk risiko, rask iterasjon, lærer teamet kjemi-/produksjonsrutiner.
2. **B – SvalPad** deretter: tekstil, rask test, tydelig målbart mål (gram svette, lukt).
3. **A – TørrNatt**: størst menneskelig effekt, men krever mer sikkerhetsarbeid og personvern-design. Starter parallelt med D/B.
4. **E – Renspyl/Myk Skog**: stor miljøeffekt. Krever laboratorie og rigg. Papirlaboratorietester kan starte tidlig.
5. **C – RenTann**: mest regulatorisk arbeid (elektrikk, UV-C, forskning på mennesker). Start etiske søknader tidlig (uke 6), men bygg sist.

### 0.3 Tidslinje (overordnet)

| Uke | Aktivitet |
|---|---|
| 1–2 | Felles oppstart: roller, IP-søk, regulatorisk kartlegging, bestille prøvemateriell, laboratoriebooking |
| 3–10 | Prototype 1 for D og B. Papirlab-oppsett for E. Prototype 1 for A starter uke 5 |
| 6 | Søknad om etisk vurdering for C (tannbørste-test) sendes inn |
| 9–18 | Renspyl-rigg bygges og testes. Myk Skog rundt av fiber-iterasjoner |
| 11–14 | Gate: vurdere R1 for D, B (go/no-go til R2) |
| 13–22 | Prototype 1 for C |
| 15–26 | Prototype 2 for A |
| 13–20 | Prototype 2 for D og B |
| 21–30 | Pilot D og B (50–100 brukere eller enheter) |
| 27–40 | Pilot A (30–50 sett, 2 uker bruk hver) |
| 33–44 | Pilot E (rigg-testing i 10–20 hjem + papirpilot) |
| 37–52 | Pilot C (etter etisk godkjenning) |

**Total tid til siste pilot: ca. 12 måneder.** Alle prototyper i tabellen har 8–12 ukers varighet, slik malen ber om.

### 0.4 Gate-kriterier (beslutningspunkter)

- **Gate 1 (uke 11):** D og B har oppfylt minst 80 % av akseptgrensene i R1. Ellers redesign før R2.
- **Gate 2 (uke 20):** Fire av fem produkter har IP-status klar, og regulatorisk vurdering er gjort. Hvis ikke: stopp videre investering i det produktet.
- **Gate 3 (uke 40):** Pilotdata for A og E er samlet. Beslutning om produksjonsoppstart.

---

## Del 1 – Felles krav for alle fem produkter

### 1.1 Felles prinsipper

- **Ingen helsepåstander uten klinisk dokumentasjon.** Produktene markedsføres som hygiene- og komfortprodukter. Der et produkt kan kreve medisinsk godkjenning (f.eks. inkontinens, sterk svette som sykdom), skal vi henvise til lege og avklare regulatorisk status før markedsføring (se 1.6).
- **Bærekraft i rekkefølge:** 1) unngå, 2) reduser, 3) bytt til biobasert/resirkulert, 4) design for demontering og resirkulering, 5) kompostérbarhet kun der det gir mening (kompostering i Norge er ofte ikke tilgjengelig for hushold).
- **Giftfrihet:** ingen PFAS i tekstil og emballasje (bruk PFAS-restriksjoner i EU som ramme), ingen bisfenoler, ingen ftalater, ingen nanosølv. Sjekk alle stoffer mot REACH SVHC-liste og kandidatlisten.
- **Personvern:** ingen kamera, mikrofon eller skybasert lagring i noen av produktene. Sensordata lagres lokalt eller ikke i det hele tatt, med mindre brukeren eksplisitt velger noe annet.

### 1.2 Målgruppe-oversikt

| Produkt | Primær bruker | Sekundær bruker |
|---|---|---|
| D – RenSåpe | Voksne 18–70 med sensitiv eller tørr hud, miljøbevisste husholdninger | Barnefamilier, friluftsfolk, hjemmesykepleie |
| B – SvalPad | Voksne 20–60 med kraftig lokal svette, arbeidsfolk i varme eller tunge jobber | Idrettsutøvere, eldre med menopause-relatert svette (ikke behandling) |
| A – TørrNatt | Voksne 55–85 med nattlig urinlekkasje eller nattsvette, og deres pårørende | Barnefamilier (barn med nattbløtlegging), gjester, hjemmesykepleie |
| E – Renspyl/Myk Skog | Huseiere som renoverer eller vil kutte vannforbruk; miljøbevisste forbrukere | Hytter og campingfolk; kommuner og boligselskaper |
| C – RenTann | Voksne 25–55 som vil ha bedre rekkevidde til bakre tenner og mindre plastavfall | Eldre med redusert motorikk (større håndtak); barn 8+ (egen variant senere) |

### 1.3 Designmål (felles måltabell)

| Kategori | Måling | Krav i alle prototyper |
|---|---|---|
| Miljø | Materialinnhold biobasert/resirkulert | Mål: ≥ 50 % for D og E; ≥ 30 % for øvrige (der tekniske krav tillater) |
| Miljø | Plast i emballasje | 0 g engangsplast i pilot; papir- eller monomaterial-emballasje |
| Brukervennlighet | Tid for vanlig bruk/bytte | Mål per produkt i del 2–6 |
| Produksjon | Enhetskostnad | Mål per produkt (ved 1 000 stk.) i del 2–6 |
| Sikkerhet | Ingen kritiske feil i testene | 0 kritiske feil. Alle avvik dokumenteres |

### 1.4 Kravliste (felles)

**Funksjonelle:** oppfyller akseptgrensene i sin produktdel; enkel betjening uten manual (QR-kode til kortvideo er ok); demonterbart for rengjøring; bruksanvisning på norsk og engelsk.

**Ikke-funksjonelle:**
- Vaskbarhet: tåler vask ved 40 °C og 60 °C der det gjelder tekstil, eller oppvask/desinfeksjon der det gjelder plast (ikke kokevann).
- Vanntetthet: elektronikk i minst IP54 der den utsettes for fukt; IP67 for komponenter som kan havne i vann.
- Allergi: lateks-fri, nikkelfri (metall i kontakt med hud), parfymefri som standard. Parfyme kun som valgfri variant med full allergenliste.
- Størrelse og vekt: mål per produkt i del 2–6.
- Merking: EU-tekstilmerking (fiberinnhold) etter forordning (EU) nr. 1007/2011 for tekstil; EU-kosmetikk-merking (INCI) for såpe; WEEE-symbol (søppelkasse med kryss) for elektronikk; resirkuleringsmerking på alt plast.
- CE-merking der produktet faller under RED, LVD eller EMC; GPSR (forordning (EU) 2023/988) gjelder uansett for forbrukerprodukter.

### 1.5 IP-sjekk

**Søkeverktøy (gratis):**
- **Espacenet** (EPO): espacenet.com. Søk på CPC-klasser og nøkkelord på engelsk.
- **Google Patents**: patents.google.com. Gode treffsøk på setninger i beskrivelsen.
- **Patentstyret** (Norge) for norske søknader: patentstyret.no.
- **EUIPO eSearch** for varemerker i EU: euipo.europa.eu.
- **Norske varemerker**: Patentstyret har eget søk.

**Søkeord per produkt (engelsk):**
- A: `"bed wetting" pad fan humidity sensor`, `incontinence underpad airflow`, `mattress protector ventilation moisture sensor`
- B: `underarm sweat pad activated carbon odor`, `axillary sweat absorbent liner phase change`
- C: `toothbrush replaceable head UV disinfection dock`, `toothbrush angled head molar reach`
- D: `solid soap dispenser refill concentrate`, `syndet bar pH skin`
- E: `dual flush retrofit toilet low volume`, `toilet paper sugarcane pulp tissue tensile`

**Regel:** Kjør søk før R1 starter. Dokumenter hva som ble funnet i en felles fil (`ip/`-mappen). Hvis en nær patent-familie finnes: rådfør deg med patentingeniør før bygging.

### 1.6 Regulatorisk oversikt (kort)

- **Kosmetikk (D):** EU-kosmetikkforordning (EF) nr. 1223/2009. Krever ansvarlig person i EU, produktinformasjonsfil, sikkerhetsvurdering (CPSR) og varsling i CPNP.
- **Biocid (C, D, eventuelt B):** Påstander om å «drepe bakterier» eller «desinfisere» kan gjøre produktet til biocid eller behandlet vare under forordning (EU) nr. 528/2012 (BPR). Unngå slike påstander uten juridisk avklaring.
- **Medisinsk utstyr (A, B):** Hvis produktet markedsføres mot inkontinens eller hyperhidrose som sykdom, kan det bli medisinsk utstyr under MDR (EU) 2017/745. Vi designer uten medisinske påstander, og avklarer med myndighetene (Statens legemiddelverk) før eventuell markedsføring.
- **Elektrisk (A, C, E):** LVD (2014/35/EU) gjelder spenning over 50 V AC / 75 V DC. Under dette gjelder GPSR. Bruk EN/IEC 60335 for husholdningsapparater der det er relevant. Lavspenning (5 V) er foretrukket.
- **Radio (A, C):** RED 2014/53/EU hvis Bluetooth eller Wi-Fi brukes. Bruk ferdigsertifiserte moduler (f.eks. ESP32-C3-modul med FCC/CE-sertifikat) for å spare tid.
- **GDPR:** Brukerdata fra sensorer kan være helseopplysninger. Default er ingen lagring og ingen kobling til person.
- **Sanitær (E):** WC-skål og tankutstyr må være i tråd med relevante NS-EN-standarder (f.eks. EN 997 for WC-skåler, EN 12056 for avløp). Verifiser nøyaktige standarder med leverandør og Standard Norge.
- **Tannbørste (C):** Elektriske tannbørster og tannpleieprodukter er ikke medisinsk utstyr i seg selv. Påstander om plakkfjerning krever dokumentasjon. Forskning på mennesker krever etisk godkjenning (REK for helseforskning, eller NSD for personopplysninger).

### 1.7 Prototypebudsjett og tidslinje (standard)

- **Varighet per prototype:** 8–12 uker (R1 ~ 6–8 uker, R2 ~ 8–10 uker, pilot ~ 10–12 uker).
- **Budsjett per prototype:** 25 000–110 000 NOK avhengig av produkt (se Del 0).
- **Lab-tid:** budsjetter NOK 800–1 500 per time for avansert utstyr (ekstern lab). Bruk kommersielle akkrediterte labber for sammenlignbare tall.

### 1.8 Fremstillingsverktøy og leverandører (felles)

| Verktøy | Bruk | Leverandør/kilde |
|---|---|---|
| CAD: Fusion 360 (personlig/hobbylisens) eller SolidWorks | Hus, mekanikk, tekniske tegninger | Autodesk, Dassault |
| 3D-printer FDM (PLA, PETG, ASA, TPU) | R1-hus og fester | Lokalt makerspace eller bestilling (Protolabs, Xometry) |
| Lasercutter | Ark til fixturer og prototypemal | Lokalt makerspace |
| Syteknikk | Tekstil (A, B) | Lokale sy-verksteder, tekstilhus |
| Silikonstøping | Mykplastdeler (f.eks. tannbørstegrep) | Smooth-On (Ecoflex, Dragon Skin), Hobby-leverandører |
| Elektronikk | PCB, moduler, sensorer | Mouser, DigiKey, Farnell, Kjell & Company, Elfa |
| Tekstilmaterialer | Nonwoven, laminat, garn | Panduro (hobby), tekstilgrossister i Norge og EU |
| Såpe-råvarer | Oljer, lut, konsentrat | Spesialleverandører for såpe og kosmetikk (be om COA og SDS) |
| Papirmasse/fiber | Toalettpapir | Papirgrossister, Sveaskog (FSC-skog i Norden, verifiser), nordiske massefabrikker |

### 1.9 Testplan – generelt

- **Testlogg:** all testing i en felles arkfil med dato, operatør, batch-nummer, rådata og bilder.
- **Kalibrering:** vekter (±0,01 g), termometre, fuktighetsmåler og pH-meter kalibreres før hver testserie.
- **Statistikk:** minimum n = 5 for lab, n = 10–20 for brukertest. Rapporter snitt og standardavvik.
- **Iterasjonskriterium:** en prototype går til neste runde kun hvis alle «må»-kriterier er oppfylt. «Bør»-kriterier kan ha avvik med begrunnelse.

---

# Del 2 – A. TørrNatt (sengesystem for natt)

> *Det er tre på natten og laken er varmt som en brødovn. Jeg slår opp, kjenner den kalde klamheten kryper under ryggen, og en stemme i hodet sier «bare vask det i morgen». Morgen. Morgen er et løfte fra en som aldri har våknet i en fuktig seng klokken tre. Vi lager noe som gjør at man slipper å ligge der og gjøre seg selv til et problem.*

### 2.1 Navn og pitch
**TørrNatt** – avtagbar, vaskbar sengekjerne som holder deg og madrassen tørr, uten å skifte hele sengetøyet.

### 2.2 Problem og målgruppe
- **Primær:** 55–85 år med nattlig urinlekkasje eller nattsvette; pårørende og hjemmesykepleie som må skifte sengetøy midt på natten.
- **Sekundær:** barnefamilier (barn med nattbløtlegging), overgangsalder-nattsvette, personer med lavt eller variabelt fuktbehov.
- **Smertepunkter:** hele sengetøyet må skiftes; madrassen blir fuktig og lukter; sårbar hud får fukt og friksjon; vask og tørking tar 1–2 dager; mugg- og mikrobevekst i madrass.
- **Viktig:** produktet er ikke et medisinsk hjelpemiddel og gjør ingen behandlingspåstander.

### 2.3 Konseptbeskrivelse
TørrNatt er en **lagdelt sengekjerne** som legges under laken, over madrassen. Den har to deler:
1. **Passiv del:** tre lag med væskeledende topp, absorberende kjerne og pustende vanntett barriere. Kjernen kan demonteres og vaskes separat.
2. **Aktiv del:** en liten sensor-og-vifte-pod i kanten av kjernen. Den måler fuktighet og temperatur, tørker kjernen med lav luftstrøm, og gir lys-signal om tilstanden.

**Hva som er nytt:** kombinasjonen av en avtagbar, vaskbar kjerne og aktiv tørking, med full dataprivacy (ingen sky, ingen kamera). Eksisterende løsninger er enten engangs-underlegg eller passive vanntette trekk uten tørking.

### 2.4 Hovedfunksjoner og teknisk forklaring
- **Væskeledning:** topplag i lyocell (Tencel) eller viskose trekker væsken bort fra huden og ned i kjernen. Dette gir lavere fuktighet mot huden.
- **Kjerne:** airlaid-cellulose (300 g/m²). Holder væske i fibermatrisen. Mål: absorpsjonskapasitet ≥ 500 ml i midtsonen (70 × 100 cm).
- **Barriere:** PU-laminert, pustende vanntett tekstil (PFAS-fri). Stopper væske fra madrassen, slipper ut vanndamp.
- **Luftkanaler:** 3D-printet eller stanset spacer-nett under kjernen, med 6 mm kanaler. Gir luftsirkulasjon mot madrassen.
- **Aktiv pod:** sensor måler RH og temperatur. Vifte (40 mm, 5 V) blåser ned i kjernen ved fukt. RGB-LED viser grønn/gul/rød.
- **Dataflyt:** lokal ringbuffer (24 timer). Ingen nettverkstilkobling i R1. I R2 valgfri Bluetooth Low Energy for lokal statusvisning, kryptert, uten sky.

**Logikk-oversikt (pseudo-kode, firmware for ESP32-C3):**

```text
setup():
  init SHT40 (I2C), LED-driver, FAN_PWM=0, buzzer=off
  baseline_rh = snitt av RH i 60 s med tørr seng (ved oppstart)

loop hver 10 s:
  (t, rh) = les_sht40()
  hvis sensorfeil: LED=blå; fortsett

  hvis rh > 75 % eller (rh - baseline_rh) > 15 %: state = VÅT
  ellers hvis rh > 65 %:                          state = FUKTIG
  ellers:                                          state = TØRR

  VÅT:     LED=rød;  FAN=100 %;  start_våt_timer hvis ikke startet
           hvis våt_timer > 15 min: buzzer 2 pip (varsel)
  FUKTIG:  LED=gul;  FAN=40 % i 5 min
  TØRR:    LED=grønn; FAN=0 %; nullstill våt_timer

  etter våt-hendelse: FAN=30 % i 45 min (tørkesyklus)
  logg (t, rh, state) i ringbuffer (24 t, lokalt)
```

### 2.5 Materialvalg og begrunnelse
| Del | Prototype (R1/R2) | Produksjon | Begrunnelse |
|---|---|---|---|
| Topp | Lyocell-nonwoven 40 g/m² | Lyocell eller PLA-spunbond (kompostérbar, mer varme-sensitiv) | Myk, pustende, gode fuktegenskaper |
| Kjerne | Airlaid-cellulose 300 g/m²; SAP (superabsorberende polymer) i R1 for å bevise kapasitet | Ren cellulose, SAP fjernes eller byttes til biobasert SAP hvis tilgjengelig | SAP er ikke biologisk nedbrytbar. Bruk kun der nødvendig |
| Barriere | PU-laminat på nonwoven, PFAS-fri | TPU-film eller PLA-film (mindre pust) | Vanntett og pustende |
| Trekk / vask | Økologisk bomull (GOTS) | Samme | Vaskbar 60 °C |
| Hus (pod) | PLA (3D-print) i R1, ASA i R2 | PP eller rPP-injeksjon | PLA er enkel å printe; ASA tåler mer varme og UV |
| Spacer | TPU-nett (3D-print) | Stanset PP-nett | Fleksibelt, luftig |
| Vifte | 40 mm 5 V DC-vifte, lavstøy | Samme (kjøpt) | Ferdigkjøpt, lav støy |

**Forbudt:** ingen silikon-belagte stoffer uten vurdering av mikroplast og gjenvinning; ingen antibakterielle tilsetninger med krav om biocidregistrering.

### 2.6 Dimensjoner og fysisk skissebeskrivelse
| Element | Mål | Toleranse |
|---|---|---|
| Kjerne midtsone | 700 × 1000 mm, tykkelse 8 mm | ±5 mm lengde, ±1 mm tykkelse |
| Full kjerne | 900 × 2000 mm (standardseng 90 × 200) | ±5 mm |
| Luftkanaler (spacer) | 6 mm bredde, 40 mm senteravstand | ±0,5 mm |
| Pod-hus | 60 × 40 × 14 mm | ±0,3 mm |
| Vifte-utløp | Ø 40 mm | ±0,2 mm |
| Sensor-plassering | 20 mm inn fra kanten, under kjernen | ±5 mm |

**CAD/STL-filer som skal lages:**
1. `TorrNatt_kjerne_midt.step` – lagdeling, sømsoner, lommer (for tekstil-mønster også som PDF 1:1).
2. `TorrNatt_pod_hus.step` – hus for ESP32, sensor, vifte, LED og knapp. Eksporter også `TorrNatt_pod_hus_R1.stl` (PLA) og `TorrNatt_pod_hus_R2.stl` (ASA).
3. `TorrNatt_spacer_nett.stl` – luftkanal-spacer (TPU).
4. KiCad/Eagle-fil: `TorrNatt_pcb_v1.kicad_pcb` (liten kontrollkort-PCB med sensor, MOSFET, LED-kontakt).

### 2.7 Komponentliste (BOM) – prototype (én kjerne + pod)
| Del | Antall | Est. pris (NOK) | Leverandør |
|---|---|---|---|
| Lyocell-nonwoven 40 g/m², 1 m² | 1 | 150 | Tekstilgrossist (verifiser) |
| Airlaid cellulose 300 g/m², 1 m² | 1 | 250 | Tekstilgrossist, be om prøver |
| SAP (superabsorberende) 100 g (R1) | 1 pk | 150 | Kjemikaliegrossist |
| PU-laminert vanntett tekstil 1 m² | 1 | 200 | Panduro, tekstilgrossist |
| Økologisk bomull (GOTS) trekk, 1 m | 1 | 150 | Tekstilgrossist |
| SHT40 temperatur/fukt-sensor | 1 | 120 | Mouser, DigiKey, Kjell |
| ESP32-C3 utviklingsbord | 1 | 150 | Kjell, Mouser |
| 40 mm 5 V DC-vifte | 1 | 80 | Kjell, Mouser |
| MOSFET logikk (f.eks. AO3400), motstander, diode | 1 sett | 60 | Kjell, Mouser |
| WS2812B RGB-LED, 1 stk | 1 | 20 | Kjell |
| Piezo-buzzer 5 V | 1 | 30 | Kjell |
| USB-C 5 V 2 A adapter (utenfor sengen) | 1 | 150 | Kjell |
| PLA 200 g (3D-print R1) | 1 | 150 | Makerspace |
| Glidelås og lommer | 2 | 100 | Tekstilgrossist |

**Sum prototype-sett (R1): ca. NOK 1 800–2 200.** Pluss verktøy og rigg for test.

### 2.8 Produksjonsmetode for prototype (trinnvis)
**Verktøy:** saks/kutteskive, syemaskin (lock-stitch), varmlaminator (eller tekstilklebestoff), loddejern, 3D-printer, multimeter, vekt (±0,01 g), fuktighetsmåler, termometer.

1. **Mønster:** lag 1:1 papirmønster for midtsonen (700 × 1000 mm) og full kjerne (900 × 2000 mm). Merk midt- og kantlinjer.
2. **Kutt:** kutt topplag, kjerne og barriere i samme størrelse.
3. **Barrieresøm:** sy lommen for kjernen med PU-siden inn mot barrieren. Tettheten: 3 mm søm, ikke tett nok til å sprekke laminatet.
4. **Lagdeling:** legg topplag, kjerne og barriere i rekkefølge. Fest med stingsøm rundt kanten og over midt-linjen.
5. **Hus:** print pod-huset i PLA (R1). Monter vifte, sensor, ESP32, LED og buzzer. Lodd med nummererte ledninger.
6. **Pod-feste:** sy en liten lomme i kjernekanten. Sett pod-huset inn med en knapp på utsiden for av/på.
7. **Test på seng:** legg kjernen på en madrass, dekk med laken, og kjør lab-tester fra del 2.10.
8. **Dokumentér:** ta bilder av hvert trinn og lagre i `docs/prototype-logg/A/`.

**Tidsestimat R1:** 2–3 uker bygging, 2 uker test.

### 2.9 Elektronikk og firmware

**Komponenter:**
- ESP32-C3 (mikrokontroller, 3,3 V logikk)
- SHT40 (I²C, adresse 0x44)
- MOSFET (logisk nivå) for viftestyring, PWM ~25 kHz
- WS2812B RGB-LED (1 datapin)
- Piezo-buzzer (aktiv)
- 5 V USB-C-forsyning (utenfor sengen)

**Koblingsskjema (kort):**
```text
ESP32-C3                 Komponent
GPIO6  (SDA)  ──────────  SHT40 SDA (4,7 kΩ pull-up til 3V3)
GPIO7  (SCL)  ──────────  SHT40 SCL (4,7 kΩ pull-up til 3V3)
GPIO3  (PWM)  ── 100Ω ─── MOSFET gate (pull-down 100kΩ)
MOSFET drain ──────────── vifte −   (diode 1N5819 over vifte)
5V   ─────────────────── vifte +, WS2812 5V
GPIO4  ── 330Ω ────────── WS2812 DIN
GPIO5  ──────────────────  buzzer (via MOSFET eller direkte for lav strøm)
GND ─────────────────────  felles jord
```

**Sikkerhet:** ingen netttilkobling i sengen. Strøm kommer fra 5 V-adapter utenfor seng. Ingen LiPo i R1. Hvis batteri senere: bruk beskyttet celle med overlading og underspenningsbeskyttelse.

### 2.10 Testplan og suksessmål

**Labtester (akseptgrenser):**
| Variabel | Metode | Akseptgrense |
|---|---|---|
| Absorpsjonskapasitet midtsone | Gravimetrisk, syntetisk urin (eller 0,9 % NaCl), dosering 50 ml/min | ≥ 500 ml før gjennomslag |
| Rewet (tilbakeføring) | Lagt belastning 2 kPa i 5 min etter absorpsjon | ≤ 1 g |
| Tørketid (med vifte) | Vekt hvert 10. minutt, fra 100 % til <50 % av fuktighet | ≤ 90 min |
| Sensorrespons | RH-steg 40 → 85 % | ≤ 60 s til grønn → rød |
| Vaskbarhet | 50 vask ved 60 °C | Absorpsjon ≥ 90 % av start, ingen delaminering |
| Strømforbruk | Effektmåler | ≤ 1 W midlere (med vifte på 30 %) |

**Brukertest (10 deltakere, 2 uker):**
- **Uke 1 (baseline):** bruk eksisterende sengetøy. Logg byttehendelser og hvor fuktig det føles (1–7 Likert).
- **Uke 2 (TørrNatt):** samme deltakere bruker kjernen. Logg bytter, støy, komfort (1–7).
- **Spørsmål:** «Hvor lang tid tar det å bytte?», «Hørte du støy fra viften?», «Var sengen tørr på morgenen?», «Hva ville du endret?»
- **Akseptgrense:** ≥ 80 % rapporterer raskere bytte (≤ 5 min), ≥ 80 % rapporterer lavere støy enn 40 dB i soverom, 0 hudreaksjoner som krever lege.

### 2.11 Risikovurdering og sikkerhetskrav
| Risiko | Vurdering | Tiltak |
|---|---|---|
| Hudirritasjon | Medium | Dermatologisk patch-test (20 pers., 48 t) før pilot; OEKO-TEX-lignende kontroll av kjemikalier |
| Mugg og mikrober | Medium | Tørking aktiv, vaskbart trekk, ingen organiske rester igjen. Ingen antibakterielle påstander |
| Elektrisk (sengen) | Lav (5 V) | Lavspenning, ingen 230 V i sengen, forseglet pod, kabel-avlastning |
| Brann | Lav | Ingen batteri i R1–R2. Hvis batteri senere: UL/IEC 62133 |
| Personvern | Medium | Ingen sky, ingen kamera/mikrofon, lokal ringbuffer, GDPR-DPIA før pilot |
| Medisinsk status | Høy hvis markedsført feil | Ingen medisinske påstander. Juridisk vurdering før markedsføring mot inkontinens |

### 2.12 Produksjonsskaleringsnotater
| Volum | Enhetskost passiv (uten pod) | Enhetskost aktiv (med pod) | Metode |
|---|---|---|---|
| 1 000 | ca. NOK 220–280 | ca. NOK 550–700 | Manuell/semi-automatisk sying og laminering, 3D-print til hus |
| 10 000 | ca. NOK 160–200 | ca. NOK 380–460 | Automatisk laminering, stanset kjerne, injeksjonsstøpt hus (verktøy ca. NOK 80 000–150 000) |
| 100 000 | ca. NOK 110–140 | ca. NOK 260–320 | Kontraktsproduksjon i EU (Portugal, Italia eller Polen), PCB med SMT |

**Anbefalt produksjonsmetode:** kontraktsproduksjon av tekstil, og en separat elektronikk-leverandør for pod. Lokal sammensetning i Norge for pilot.

### 2.13 Iterasjonsplan
- **R1 (uke 5–14, minimal):** passiv kjerne uten pod. Sensor-logger brukes midlertidig i test (utenfor produkt). Mål: absorpsjon og rewet.
- **R2 (uke 15–26, forbedret):** aktiv pod med vifte og LED, ASA-hus, ny spacer. Mål: sensorrespons, støy, tørketid.
- **Forventede forbedringer etter R1:** topplag kan bli for varmt; SAP-volum kan reduseres for kompostérbarhet; kanter kan lekke. Tiltak: tynnere topp, cellulose-kjerne med større volum, dobbel søm i kant.
- **Forventede forbedringer etter R2:** viftestøy, pod-festet, LED-synlighet om natten. Tiltak: LED-dimming, 25 mm-vifte eller lavere PWM, magnetisk pod-feste.

### 2.14 Patenter, merkeposisjon og neste steg
- **Patent:** vurder søknad på kombinasjonen «avtagbar væskebarriere + aktiv luftstrøm styrt av fukt». Søk først i Espacenet og Google Patents (se 1.5).
- **Varemerke:** «TørrNatt» – søk i EUIPO og Patentstyret før navnet tas i bruk.
- **Neste steg:** (1) rådgivning med dermatolog, (2) pilot med 30–50 sett i 2 uker, (3) juridisk vurdering av medisinsk status.

---

# Del 3 – B. SvalPad (svetteprodukt)

> *Under armene mine er det en flod. Skjorta er mørk og klissete som en dårlig avgjørelse, og folk rundt meg later som de ikke ser det. Jeg bruker halve dagen på å tørke meg med papir fra toalettet og tenke at kroppen min har bestilt en tjeneste jeg ikke ønsket. Så vi lager en lapp som tar imot, lukter nøytralt og tørker før jeg rekker å bli flau.*

### 3.1 Navn og pitch
**SvalPad** – tynn, luktnøytral svettepad som tar 5 g svette, tørker på under 30 minutter og har valgfri PCM-kjøling for pannesvette og rygg.

### 3.2 Problem og målgruppe
- **Primær:** voksne 20–60 med kraftig lokal svette (aksillær, panne, rygg), arbeidsfolk i varme eller fysiske jobber.
- **Sekundær:** idrettsutøvere, eldre med menopause-relatert svette.
- **Smertepunkter:** synlige flekker, lukt etter noen timer, klissete klær, behov for å vaske klær ofte, eksisterende engangspads som lager søppel.
- **Viktig:** produktet er ikke behandling av hyperhidrose. Personer med diagnostisert sykelig svette henvises til lege.

### 3.3 Konseptbeskrivelse
Et tynt, **flatt padsystem** som settes inn i en vaskbar hylse (undertøy eller ermeløs topp). Lagdelingen tar væske raskt bort fra huden, binder den i kjernen, nøytraliserer lukt og slipper ut fuktighet mot luften.

**Nyhet:** kombinasjonen av lukt-binding uten tilsatt parfyme (cyklodekstrin + aktivt kull i eget lag), og valgfri **PCM-stripe** (faseskifte-materiale) for kjøling i varme situasjoner, uten elektronikk.

### 3.4 Hovedfunksjoner og teknisk forklaring
- **Topplag (væskeledning):** hydrofil nonwoven (lyocell/Tencel) tar væsken raskt bort fra huden.
- **Kjerne (absorpsjon):** mikrofiber og cellulose-blanding. Kapasitet ≥ 5 g på 5 minutter. Ingen SAP (ikke nødvendig for denne mengden og enklere å resirkulere).
- **Luktlag:** cyklodekstrin-pulver og aktivt kull fra kokos-skall. Binder flyktige syrer (f.eks. isovalerinsyre) fysisk, ikke maskerer.
- **Barriere (pustende):** PU- eller TPU-film på baksiden, slipper vanndamp ut.
- **PCM-lomme (valgfri, R2):** bio-basert faseskifte-materiale (fettsyre-basert, smeltepunkt ca. 28 °C). Lomme i pad, aktiverer kjøling ved kroppsvarme. Ikke elektronisk.
- **Hylse:** bomull eller bomull/elastan-blanding med sydd lomme. Vaskbar 40 °C.

### 3.5 Materialvalg og begrunnelse
| Lag | Prototype | Produksjon | Begrunnelse |
|---|---|---|---|
| Topp | Lyocell-nonwoven 30 g/m² | Samme eller PLA-spunbond | Rask væskeledning, myk |
| Kjerne | Mikrofiber 40 g/m² + cellulose 120 g/m² | Samme (ren fiber) | Høy kapillar kapasitet, lett |
| Luktlag | Cyklodekstrin 5 g/m² + aktivt kull 10 g/m², dekket av nonwoven | Samme (kull av kokos) | Fysisk binding, ingen parfyme |
| Barriere | TPU-film 15 µm | PLA-film (mer sprø) | Pust og vanntett |
| PCM | Bio-basert faseskifte-materiale 100 g | Samme i kontraktsproduksjon | Kjøling uten strøm |
| Hylse | Bomull/elastan (GOTS hvis mulig) | Samme | Lukt- og hudvennlig |
| Lim | Varmesmelte-lim uten løsemidler | Samme | Lav VOC |

**Forbudt:** sølv-nanopartikler, PFAS, parfyme i padden, syntetiske antimikrobielle midler uten BPR-vurdering.

### 3.6 Dimensjoner og fysisk skissebeskrivelse
| Element | Mål | Toleranse |
|---|---|---|
| Pad (aksillær) | 120 × 80 mm, tykkelse 2,5 mm | ±2 mm lengde, ±0,3 mm tykkelse |
| Kjerne | 100 × 70 mm | ±1 mm |
| Luktlag | 90 × 60 mm, ±0,5 g/m² pulver | ±10 % vektfordeling |
| PCM-stripe | 80 × 20 × 4 mm | ±0,5 mm |
| Hylse-lomme | 125 × 85 mm | ±2 mm |
| Pannepad (R2 variant) | 80 × 40 mm | ±1 mm |

**CAD/fil-liste:**
1. `SvalPad_pad_die.dxf` – stansingsform for alle lag (laser- og stansdata).
2. `SvalPad_hylse_monster.pdf` (+ `.dxf`) – sy-mønster for hylse 1:1.
3. `SvalPad_PCM_holder.step` + `SvalPad_PCM_holder_R1.stl` – 3D-printet holder for å teste PCM-plassering i prototype (PLA/PETG).

### 3.7 Komponentliste (BOM) – prototype (10 pads + 5 hylser)
| Del | Antall | Est. pris (NOK) | Leverandør |
|---|---|---|---|
| Lyocell-nonwoven 30 g/m², 0,5 m² | 1 | 100 | Tekstilgrossist |
| Mikrofiber-nonwoven 40 g/m², 0,5 m² | 1 | 100 | Tekstilgrossist |
| Cellulose-airlaid 120 g/m², 0,5 m² | 1 | 90 | Tekstilgrossist |
| Cyklodekstrin 100 g | 1 | 150 | Kjemikaliegrossist (kosmetikkvalitet) |
| Aktivt kull (kokos) 100 g | 1 | 80 | Kjemikaliegrossist |
| TPU-film 15 µm 0,3 m² | 1 | 60 | Tekstilgrossist |
| Bio-PCM 100 g | 1 | 300 | Spesialleverandør PCM (be om datablad) |
| Bomull/elastan 0,5 m | 1 | 100 | Panduro, tekstilgrossist |
| Varmesmelte-lim 50 g | 1 | 50 | Hobby/industri |
| Tråd, knapper | 1 sett | 30 | Panduro |

**Sum prototype (10 pads): ca. NOK 1 000–1 400.** Testrigg (vekter, kammer, prøvetakere) kommer i tillegg.

### 3.8 Produksjonsmetode for prototype (trinnvis)
**Verktøy:** kutteskive eller stansform, varmepress (100–130 °C), limpistol (lav-VOC), syemaskin, vekt (±0,001 g), fryser (for PCM-testing).

1. **Stans** alle lag fra `SvalPad_pad_die.dxf` (eller hånd-kutt med mal).
2. **Luktlag:** fordel cyklodekstrin og kull jevnt på kjernen, dekk med nonwoven og press lett i varmepresse (80 °C, 5 s).
3. **Lagdeling:** topplag → kjerne → luktlag → barriere. Fest med varme-smelte-lim i 4 punkter.
4. **Kantforsegling:** varmeforsegl kanten ved 120 °C (for TPU/nonwoven-kombinasjon).
5. **PCM-lomme (R2):** varmeforsegl en lomme langs pad-baksiden; sett inn PCM-stripen.
6. **Hylse:** sy lomme i undertøy-stoff; sett pad inn.
7. **Merk** hver batch med dato og lot-nummer.

**Tidsestimat R1:** 1 uke bygging, 4–6 uker testing.

### 3.9 Elektronikk og firmware
**Ingen elektronikk i R1 og R2.** Valgfri R3-variant: tynn NTC-termistor og LED i hylse for å varsle «bytt pad» basert på fuktighet (én sensor, batteri CR2032). Dette er ikke en del av hovedleveransen.

Pseudo-kode R3 (kun hvis aktivert):
```text
hver 30 s: les RH fra fuktighetssensor
hvis RH > 85 % i 10 min: blink grønn LED 1 gang (pad fullt)
hvis RH > 85 % i 30 min: blink rød LED 3 ganger (bytt)
```

### 3.10 Testplan og suksessmål
**Labtester:**
| Variabel | Metode | Akseptgrense |
|---|---|---|
| Svette-absorpsjon | Gravimetrisk: 5 ml væske (syntetisk svette, ISO 3797-lignende formel – verifiser) dosert på pad | ≥ 5 g absorbert på 5 min |
| Tørketid | Vekt hver 5 min, 23 °C, 50 % RH | ≤ 30 min til ≤ 5 % av opprinnelig fukt |
| Rewet | 2 kPa 5 min etter absorpsjon | ≤ 0,2 g |
| Lukt | Sensorisk panel (10 pers.) + GC-MS-analyse av isovalerinsyre og kjente svetteforbindelser | ≥ 50 % reduksjon etter 4 t |
| Hudkompatibilitet | Patch-test, 20 pers., 48 t | 0 alvorlige reaksjoner |
| Vaskbarhet | 20 vask 40 °C (ISO 6330-prosedyre) | Absorpsjon ≥ 85 % av start, ingen løsning av lim |
| PCM-kjøling | Termoelement på hud-simulator, 35 °C | ≥ 2 °C lavere temp. i 20 min |

**Brukertest (15 pers., 1 uke):**
- Bruk i jobb eller trening. Logg flekker (foto), komfort (1–7), antall bytter.
- Akseptgrense: ≥ 80 % rapporterer ingen synlige flekker etter 4 timer, ≥ 70 % vil bruke igjen.

### 3.11 Risikovurdering og sikkerhetskrav
| Risiko | Vurdering | Tiltak |
|---|---|---|
| Hudirritasjon (lim, PCM, cyklodekstrin) | Medium | Patch-test, lim-type og PCM-datablad, ingen parfyme |
| Støv fra aktivt kull under produksjon | Medium | Maske FFP2, avsug, innkapslet blanding |
| PCM-lekkasje | Lav–medium | Tett lomme, varmeforsegl, lekkasjetest 40 °C i 24 t |
| Allergener (lateks, nikkel i knapper) | Medium | Lateks-fri elastan, nikkelfri knapper; allergen-merking |
| Mikrobiologisk vekst | Medium | Vask hylse etter bruk, pad kan skiftes; ikke påstå antibakteriell effekt |
| Merking | Lav | Fiberinnhold (EU 1007/2011); bruksanvisning |

### 3.12 Produksjonsskaleringsnotater
| Volum | Enhetskost (ett pad, uten PCM) | Enhetskost (med PCM-stripe) | Metode |
|---|---|---|---|
| 1 000 | NOK 35–50 | NOK 60–85 | Manuell laminering og stans |
| 10 000 | NOK 20–30 | NOK 35–50 | Stanset og ultralyd-forseglet, i EU |
| 100 000 | NOK 10–15 | NOK 18–25 | Kontraktsproduksjon, rullelinje |

### 3.13 Iterasjonsplan
- **R1 (uke 3–10):** pad uten PCM, testing av absorpsjon, rewet og lukt. Mål: 5 g på 5 min, lukt ≥ 50 % reduksjon.
- **R2 (uke 13–20):** PCM-variant, forbedret kant, hylse-test i vask. Mål: kjøling ≥ 2 °C, vaskbarhet.
- **Forventede forbedringer etter R1:** kanten kan bli stiv eller lekke væske; kullet kan merkes som grus. Tiltak: tynnere kull (5 g/m²), ekstra nonwoven over kullet.
- **Forventede forbedringer etter R2:** PCM kan lekke ved høy temperatur. Tiltak: dobbel forsegling, PCM med høyere smeltepunkt for varme dager.

### 3.14 Patenter, merkeposisjon og neste steg
- **Patent:** kombinasjonen av fysisk luktbinding + faseskifte i tynn pad kan være patenterbar. Søk: «sweat pad cyclodextrin activated carbon phase change».
- **Varemerke:** «SvalPad» – EUIPO og Patentstyret.
- **Neste steg:** (1) patch-test, (2) 15-pers. brukertest, (3) avtale med kontraktsprodusent i EU.

---

# Del 4 – C. RenTann (tannbørstesystem)

> *Jeg står foran speilet kl. 23:40 og prøver å nå bakerste molar med en børste som er designet for en person med lengre armer og mindre skam. Bakerst i munnen er det mørkt og lite. Jeg ser plastbiten jeg har kastet hver tredje måned de siste ti årene, og det er som å se en tilståelse. Vi lager en børste som kommer dit, kan skiftes uten å kaste hele greia, og ikke gjør meg til en avfallsproduksjon med tannkjøtt.*

### 4.1 Navn og pitch
**RenTann** – elektrisk tannbørste med vinklet hode for bakre tenner, byttbart hode-modul (3 måneder), og UV-C-desinfeksjonsdokk med lukkesensor.

### 4.2 Problem og målgruppe
- **Primær:** voksne 25–55 med vanskelig rekkevidde til bakre tenner, miljøbevisste, som kaster hele børster for ofte.
- **Sekundær:** eldre med redusert motorikk (større håndtak), familier med små barn (egen variant senere).
- **Smertepunkter:** hode-slitasje etter 3 måneder, børstehodet blir fuktig og bakterie-vennlig, plast-avfall, trang til å skifte hele børsten.
- **Viktig:** produktet påstår ikke å behandle tannsykdom. Påstand om «plakkfjerning» krever klinisk dokumentasjon og gjøres først etter studie.

### 4.3 Konseptbeskrivelse
RenTann har tre hovedideer:
1. **Vinklet, smalt hode** (15° tilt) som kommer til bakerste molar.
2. **Byttbart hode-modul** (pod) med klikk-lås, bytteintervall 3 måneder. Håndtaket varer 3–5 år.
3. **UV-C-dokk** med lukkesensor. Desinfiserer børstehodet mellom bruk. Ingen kjemikalier.

**Nyhet:** kombinasjonen av vinklet hode, byttbar modul og UV-C-dokk i et system med redusert plastbruk. Det finnes vinklede hoder og byttbare hoder, men ikke i én integrert løsning med dokk-lukkesensor og monomaterial-håndtak.

### 4.4 Hovedfunksjoner og teknisk forklaring
- **Motor:** kjerneløs DC-motor (ca. 15 000 rpm), drives via H-bro. Eksentrisk akse gir ~250 Hz børste-oscillasjon (sonisk-lignende, verifiser mot ISO-metoder).
- **Trykksensor:** tynn FSR (kraftsensor) i halsen. Varsler med LED hvis trykk > 2,0 N (grenseverdi må valideres).
- **Timer:** 2 minutter, med 30-sekunders kvadrantveiledning via LED-ring.
- **Batteri:** 1S Li-ion 220 mAh med beskyttelseskrets (DW01 + FS8205 eller ekvivalent). Lading via USB-C og TP4056-lignende lader, eller ferdig lademodul.
- **UV-C-dokk:** 275 nm UV-C LED (2 stk, plassert i lukket hylster). Syklus: 60 sekunder. Lokk-sensor (magnet/reed) stopper lampen hvis lokket åpnes. Ingen UV-utslipp utenfor dokken.
- **Pod-lås:** snap-fit med magnetisk kontakt og IP-fast kant. Byttbar uten verktøy.

**Pseudo-kode (firmware, ESP32-C3 eller ATtiny for R1):**
```text
setup(): init motor PWM, FSR, LED-ring, UV-LED=off, lokk_sensor

brush_loop():
  hvis knapp trykkes og batteri > 10 %:
     start_motor(frekvens=250 Hz, styrke=medium)
     timer = 0
  hver 10 ms: les FSR; hvis kraft > 2,0 N: LED=rød; ellers LED=grønn
  hver 30 s: vis neste kvadrant (LED-ring)
  hvis timer >= 120 s: stop_motor; buzzer 2 pip; vis "ferdig"

dock_loop():
  hvis pod_in_dock og lokk_lukket:
     hvis knapp "sterilisering" trykkes: start_UV(60 s), LED=blå
  hvis lokk_åpnet: UV_OFF umiddelbart, LED=rød, logg hendelse
  etter 60 s: UV_OFF, LED=grønn
```

### 4.5 Materialvalg og begrunnelse
| Del | Prototype | Produksjon | Begrunnelse |
|---|---|---|---|
| Håndtak | PETG eller ASA (3D-print) | rPP (resirkulert polypropylen, 30 % resirkulert) eller bio-PE | Monomaterial for gjenvinning |
| Halsen | TPE (3D-print eller silikonstøping) | TPE, samme materiale | Myk grep, lav friksjon |
| Børstehode | PLA (print) + børstetufter fra leverandør | PBT-børster (ikke nylon for bedre slitasje), hode i rPP | PBT er mindre slitasje-sensitiv |
| Pod-lås | Stål-magnet + PETG-hus | Samme, men monomaterial hvis mulig | Magnet for kontakt |
| Dokk | ASA (print) | PP (injeksjon), UV-stabil | Tåler UV bedre enn PLA |
| Emballasje | Papp uten plast-blister | FSC-papp, resirkulerbar | Null plast |

**UV-C-konsekvens:** UV-C bryter ned enkelte plasttyper over tid. Test ASA/PP i 500 timer UV-eksponering før pilot.

### 4.6 Dimensjoner og fysisk skissebeskrivelse
| Element | Mål | Toleranse |
|---|---|---|
| Håndtak | 180 × 20 × 15 mm (lengde × bredde × tykkelse) | ±0,5 mm |
| Hals/vinkel | 15° tilt, 25 mm lengde | ±1° |
| Pod (børstehode) | 25 × 10 × 8 mm | ±0,2 mm (for lås) |
| Børste-tuft-område | 9,5 × 3 mm per tuft (mellomstor) | ±0,1 mm |
| Dokk (innvendig) | 40 × 30 × 60 mm | ±0,5 mm |
| UV-kammer | Ø 20 mm, lukket | ±0,3 mm |

**CAD/fil-liste:**
1. `RenTann_handtak.step` + `RenTann_handtak_R1.stl` (PETG).
2. `RenTann_pod_hode.step` + `RenTann_pod_hode_R1.stl` (PLA) + `RenTann_pod_lås.step` (snap-fit).
3. `RenTann_UV_dokk.step` + `RenTann_UV_dokk_R2.stl` (ASA).
4. KiCad: `RenTann_pcb_v1.kicad_pcb` (motordriver, FSR, LED-ring, UV-driver, lokk-sensor).

### 4.7 Komponentliste (BOM) – prototype (1 håndtak + 2 pods + dokk)
| Del | Antall | Est. pris (NOK) | Leverandør |
|---|---|---|---|
| Kjerneløs DC-motor 3–5 V | 1 | 80 | Mouser, DigiKey |
| H-bro (DRV8833 eller TB6612FNG) | 1 | 50 | Mouser, DigiKey |
| ESP32-C3 mini | 1 | 100 | Kjell, Mouser |
| FSR (kraftsensor) | 1 | 60 | Mouser, Adafruit |
| 1S Li-ion 220 mAh + beskyttelseskrets | 1 | 80 | Kjell, Mouser |
| USB-C lader-modul (TP4056-type, med beskyttelse) | 1 | 40 | Kjell |
| WS2812B LED-ring 12 stk | 1 | 70 | Kjell |
| UV-C LED 275 nm, 2 stk + driver | 1 sett | 350 | Mouser, DigiKey (verifiser UV-type) |
| Reed-bryter / hall-sensor | 1 | 30 | Mouser |
| Magneter (neodym) 4 mm | 4 | 40 | Kjell |
| PETG/ASA/PLA filament 500 g | 1 | 250 | Makerspace |
| Børstetufter (PBT, mellom) | 1 pk | 100 | Børstespesialist |
| Papp-emballasje (FSC) | 1 | 40 | Emballasjeleverandør |

**Sum prototype-sett: ca. NOK 1 300–1 600.**

### 4.8 Produksjonsmetode for prototype (trinnvis)
**Verktøy:** 3D-printer (FDM, 0,4 mm dyse), loddestasjon, multimeter, skrutrekker, lim (UV-herdende eller cyanakrylat for TPE-hals), festeskruer M2.

1. **Print håndtak** i PETG (R1). Test passform for pod.
2. **Monter elektronikk:** motor i hode-hus, FSR i hals, LED-ring i topp, batteri i håndtak. Lodd med nummererte ledninger, bruk krympeslange.
3. **Pod-lås:** print pod og lås i PLA. Sett magneter i. Test klikk-kraft (mål 10–15 N avtrekk).
4. **Børstetufter:** lim eller press tuft i hodet (følg leverandørens prosess).
5. **Sett inn batteri** med beskyttelseskrets. Test lading (kun med USB-C-lader og lader-ledning med fuse).
6. **Dokk-prototype:** print ASA dokk. Monter UV-LED i lukket hylster, lokk-sensor og driver.
7. **Sikkerhetstest:** lokk åpnet under UV-syklus må stoppe UV innen 100 ms.
8. **Montering i hus:** skru sammen, sjekk for løse deler.

**Tidsestimat R1:** 4–5 uker bygging, 3 uker test.

### 4.9 Elektronikk og firmware
**Komponenter:** ESP32-C3 eller ATtiny (R1), DRV8833 H-bro, FSR, WS2812B-ring, UV-C LED med driver, reed/hall-sensor, Li-ion med beskyttelse, USB-C-lader.

**Koblingsskjema (kort):**
```text
ESP32-C3
GPIO0  ── PWM ──► DRV8833 IN1  (motor)
GPIO1  ── PWM ──► DRV8833 IN2
GPIO2  ◄── ADC ── FSR (spenningsdeler med 10 kΩ)
GPIO4  ──────────► WS2812B DIN (via 330 Ω)
GPIO5  ──────────► UV-driver ENABLE (kun aktiv med lokk lukket)
GPIO6  ◄── input ─ reed-bryter (lokk, pull-up)
GPIO7  ◄── input ─ knapp (start/UV)
3V3/5V ── lading via USB-C (TP4056-type, beskyttet celle)
```

**Sikkerhet:**
- UV-driver er låst av lokk-sensor og en hardware-interlock (reed-bryter direkte på enable-pinne, ikke kun i firmware).
- Batteri med beskyttelse: overspenning, underspenning, kortslutning og temperatur.
- Ingen UV-LED aktiv uten lukket dokk. UV-C-hus i ugjennomsiktig plast.

### 4.10 Testplan og suksessmål
**Labtester:**
| Variabel | Metode | Akseptgrense |
|---|---|---|
| Rekkevidde bakre molar | 3D-skann av modell-tenner, dekning av overflate ved bakre molar | ≥ 85 % av overflate treffes innen 2 min |
| Trykk | FSR-kalibrering mot kjent vekt | Avvik ≤ 0,3 N |
| Batteri | 14 bruk à 2 min per lading | ≥ 14 bruk |
| Pod-lås | Avtrekkskraft og slitasje (500 avtrekk) | 10–15 N, ingen brudd |
| UV-dose | Radiometer mot dokk-volum | Dose iht. dokumenterte mål (verifiser mot kilde) |
| UV-lekkasje | Fotobiologisk test (IEC 62471-metode) | Ingen UV utenfor dokk |
| Bakterie-reduksjon på børstehode | Lab, standardisert mikrobe-prøve | Dokumenteres som «reduksjon» (ikke sterilitet), og påstand avklares juridisk |

**Brukertest (20 pers., 2 uker, etter etisk godkjenning):**
- Kvartal-timer og trykk-LED, ønsket av brukere? (1–7)
- Logg bytte-hendelser, rekkevidde (selvrapport), komfort.
- Akseptgrense: ≥ 80 % sier at bakre tenner føles lettere å børste, ≥ 80 % opplever at pod-bytte er enkelt (≤ 30 sek).

**Etisk vurdering:** human-tester krever søknad til REK (helseforskning) eller NSD (personopplysninger). Start søknad i uke 6.

### 4.11 Risikovurdering og sikkerhetskrav
| Risiko | Vurdering | Tiltak |
|---|---|---|
| Elektrisk (batteri) | Medium | Beskyttelseskrets, UL/IEC 62133 for celle, lader fra godkjent leverandør |
| UV-C eksponering | Høy hvis feil | Lukket dokk, lokk-interlock i hardware, IEC 62471-test |
| Mikrobiologi i pod | Medium | Pod-bytte hver 3. måned, tørk-syklus, ingen vann i dokk |
| Små deler (pod, magnet) | Medium | Ikke til barn under 3 år; magnet-advarsel og GPSR-merking |
| Nikkel/allergi | Lav | Nikkelfri magnet (nikkel-belegg-kontroll) |
| Medisinsk påstand | Høy hvis markedsføringen går for langt | Ingen påstand om behandling; påstander kun etter klinisk studie |

### 4.12 Produksjonsskaleringsnotater
| Volum | Enhetskost (håndtak + pod + dokk) | Metode |
|---|---|---|
| 1 000 | NOK 900–1 100 | Montering av ferdige moduler, injeksjon av håndtak (verktøy NOK 150 000–250 000) |
| 10 000 | NOK 450–600 | Automatisk montering, PCB SMT, rPP |
| 100 000 | NOK 220–320 | Kontraktsproduksjon i Asia eller EU; EU-montasje for sluttkontroll |

**Anbefaling:** tidlig kontakt med EU-basert produsent for UV-dokk (krever spesifikk erfaring). Vurdér om dokken kan være separat produkt for å redusere pris på børstehodet.

### 4.13 Iterasjonsplan
- **R1 (uke 13–22):** håndtak i PETG, pod i PLA, dokk uten UV (kun mekanisk test). Mål: rekkevidde, trykk, pod-lås.
- **R2 (uke 23–36):** ASA-dokk med UV-driver og interlock, PBT-børstetufter, rPP-håndtak. Mål: UV-sikkerhet, batteri, brukertest.
- **Forventede forbedringer etter R1:** håndtak kan bli for tungt; pod kan løsne. Tiltak: tynnere vegg (2 mm), magnet-styrke justeres.
- **Forventede forbedringer etter R2:** UV-LED-varme, dokk-størrelse. Tiltak: kjøl-finner, større dokk-volum, lavere effekt.

### 4.14 Patenter, merkeposisjon og neste steg
- **Patent:** kombinasjonen av vinklet pod med klikk-lås og UV-interlock. Søk: «toothbrush replaceable head UV disinfection interlock angled».
- **Varemerke:** «RenTann» – EUIPO og Patentstyret.
- **Neste steg:** (1) ferdig etisk søknad, (2) UV-sikkerhetsvurdering med sertifisert lab, (3) produksjonspartner for dokk.

---

# Del 5 – D. RenSåpe (såpe og renhet)

> *Jeg står i badet med en plastflaske med tre dager gammel såpe, og den er tom igjen. Hånden min er tørr og sprukket. I skapet står fire flasker med samme fargeløse, parfymerte skam fra fire ulike merker. Og jeg tenker: hvorfor skal alt være plast som dør i en grøft? Vi lager en fast stykke såpe som varer, en flytende konsentrat som kommer i en pose, og en pumpe som ikke ender på gulvet.*

### 5.1 Navn og pitch
**RenSåpe** – fast såpe (kald-prosess), flytende konsentrat med 1:10 refill og dispenser. Én formel-familie, to formater.

### 5.2 Problem og målgruppe
- **Primær:** voksne 18–70 med sensitiv eller tørr hud, miljøbevisste husstander.
- **Sekundær:** barnefamilier, friluftsfolk, hjemmesykepleie (desinfeksjon via vask, ikke biocid).
- **Smertepunkter:** tørr hud av sterk såpe, plast i flasker, parfyme-allergi, dispensere som lekker eller bruker for mye.
- **Viktig:** såpe er kosmetikk. Påstand om «antibakteriell» krever biocid-vurdering og fjernes.

### 5.3 Konseptbeskrivelse
RenSåpe består av:
1. **Fast såpe (kald-prosess, pH 9–10 og syndet-variant pH 6–7):** tradisjonell formel med olje, shea og kokos. Mild for de fleste.
2. **Flytende konsentrat (pH 5,5–6,2):** syndet-baser (ikke ren såpe), dermed hudvennlig pH.
3. **Refill-dispenser:** 1:10 fortynning. Konsentrat i kompostérbar/resirkulerbar pose, pumpe i glass- eller PP-flaske.

**Nyhet:** én formulering-familie med tre bruksformer og en dispenser som lar brukeren fylle opp med små mengder konsentrat, uten plast-flasker per refill.

### 5.4 Hovedfunksjoner og teknisk forklaring
- **Fast såpe:** saponifisering av olje med natriumhydroksid (NaOH). Hele reaksjonen tar 4–6 uker herding.
- **Flytende:** kombinasjon av syndet-surfaktant (SCI), betain og alkylglukosid, justert til pH 5,8–6,2 med sitronsyre.
- **Konservering:** fenoksyetanol ≤ 1 % (EU-grense i kosmetikk, Annex V). Naturlige konserveringsmidler gir ofte for svak effekt, så de må testes i challenge-test.
- **Dispenser:** pumpe med 1,5 ml per trykk, konsentrat trekkes fra pose og blandes med vann i flaske. Forhold 1:10 kontrolleres med refraktometer (Brix) eller vekt.

### 5.5 Materialvalg og begrunnelse
| Del | Prototype | Produksjon | Begrunnelse |
|---|---|---|---|
| Fast såpe | Olivenolje, kokosolje, sheasmør | Samme, eventuelt økologiske råvarer | Mild, kjent formel |
| Flytende | SCI, betain, decyl-glukosid, glycerin | Samme | Plantebasert, mild |
| Konservering | Fenoksyetanol 0,8 % | Samme, eller alternativ godkjent | EU-godkjent, testet |
| Konsentrat-pose | PLA/cellulose-laminat (kompostérbar eller resirkulerbar) | Monomaterial PE eller papir-PE | Lite plast, enkel kutting |
| Flaske | Glass (R1) | Resirkulert PET eller rPP | Gjenbruk |
| Pumpe | Standard 28 mm pumpe | Samme, men PP-variant | Enkelt |
| Emballasje fast såpe | Papir/cellulose-omslag | Samme | Null plast |

**Forbudt:** mikroplast-skrubbere, parfyme uten allergenliste, PEG-baserte emulgatorer med usikker opprinnelse.

### 5.6 Dimensjoner og fysisk skissebeskrivelse
| Element | Mål | Toleranse |
|---|---|---|
| Fast såpe | 100 × 65 × 35 mm, ca. 100 g | ±2 mm, ±3 g |
| Flytende flaske | 250 ml (R1), 500 ml (R2) | ±2 ml |
| Pumpe | 28 mm kork, 1,5 ml per trykk | ±0,1 ml |
| Konsentrat-pose | 120 × 80 mm, 100 ml | ±2 mm |
| Dispenser-hode | Ø 28 mm | ±0,1 mm |

**CAD/fil-liste:**
1. `RenSåpe_bar_form.step` + `RenSåpe_bar_form_R1.stl` (3D-print PLA for støpeform med silikon-støp).
2. `RenSåpe_pumpe_adapter.step` + `RenSåpe_pumpe_adapter_R1.stl` (PETG).
3. `RenSåpe_pose_skisse.dxf` (kuttemal for konsentrat-pose).

### 5.7 Komponentliste (BOM) – prototype (1 fast + 1 flytende + dispenser)
| Del | Mengde | Est. pris (NOK) | Leverandør |
|---|---|---|---|
| Olivenolje 600 g | 1 | 80 | Matvarekjede/grossist (kosmetikkvalitet) |
| Kokosolje 200 g | 1 | 40 | Kosmetikkleverandør |
| Sheasmør 200 g | 1 | 40 | Kosmetikkleverandør |
| Natriumhydroksid (NaOH) 200 g | 1 | 60 | Kjemikaliegrossist |
| Destillert vann 2 L | 1 | 30 | Apotek/grossist |
| SCI (sodium cocoyl isethionate) 50 g | 1 | 80 | Kosmetikkleverandør |
| Cocamidopropylbetain 40 g | 1 | 40 | Kosmetikkleverandør |
| Decylglukosid 30 g | 1 | 40 | Kosmetikkleverandør |
| Glycerin 30 g | 1 | 20 | Kosmetikkleverandør |
| Sitronsyre 10 g | 1 | 20 | Kjemikaliegrossist |
| Fenoksyetanol 5 g | 1 | 60 | Kosmetikkleverandør |
| pH-stripe og pH-måler | 1 | 300 | Lab-leverandør |
| Refraktometer (Brix) | 1 | 800 | Lab-leverandør |
| Pumpe 28 mm, 1,5 ml/trykk | 2 | 120 | Dispenser-leverandør |
| Glassflaske 250 ml | 2 | 80 | Glassleverandør |
| Papir-omslag og cellulose-pose | 10 | 100 | Emballasjeleverandør |
| Vernebriller, hansker, maske | 1 sett | 200 | Lab-leverandør |

**Sum prototype: ca. NOK 2 000–2 500** (uten lab-utstyr som brukes flere ganger).

### 5.8 Produksjonsmetode for prototype (trinnvis)
**Fast såpe (kald-prosess):**

**Oppskrift (1 kg olje, 5 % superfett):**
| Ingrediens | Mengde | Merknad |
|---|---|---|
| Olivenolje | 600 g | SAP ≈ 0,134 (NaOH per g olje) → 80,4 g NaOH |
| Kokosolje | 200 g | SAP ≈ 0,178 → 35,6 g NaOH |
| Sheasmør | 200 g | SAP ≈ 0,128 → 25,6 g NaOH |
| **Totalt NaOH (100 %)** | | **141,6 g** |
| NaOH etter 5 % superfett | | **134,4 g** (141,6 × 0,95) |
| Destillert vann | 350 g | Ca. 35 % av oljevekt, justerbar til 33–38 % |
| Lut-konsentrasjon | | ca. 27,7 % (134,4 / (350+134,4)) |

**Verifiser SAP-verdier mot leverandørens datablad før bruk.** Bruk alltid en såpe-kalkulator og dobbeltsjekk. Verdier er tilnærmet.

**Prosess:**
1. **Verneutstyr:** briller, hansker, langermet tøy. Lut tilsettes alltid vann (aldri omvendt). Arbeid i godt ventilert rom.
2. **Lut:** vei NaOH, løs i vann i glass (ikke metall). Lut blir varm (ca. 80–90 °C). Avkjøl til 35–40 °C.
3. **Olje:** smelt sheasmør og kokosolje ved 40 °C. Tilsett olivenolje. Temperatur 35–40 °C.
4. **Blanding:** tilsett lut til olje. Bruk stavmikser i korte puls. Stopp ved «trace» (blandingen blir som tynn pudding).
5. **Støp:** hell i silikon-form eller `RenSåpe_bar_form_R1.stl`-form.
6. **Isolasjon:** dekk med håndkle 24 timer.
7. **Kutt og herd:** kutt etter 24–48 timer. Herd 4–6 uker i tørt rom.
8. **Kontroll:** pH-test etter herding (8–10 forventet for kald-prosess). Test med pH-stripe på oppløst bit.

**Flytende (100 g batch):**
| Ingrediens | % | Merknad |
|---|---|---|
| SCI | 15 | Syndet-surfaktant |
| Cocamidopropylbetain | 8 | Mild co-surfaktant |
| Decylglukosid | 5 | Plantebasert |
| Glycerin | 3 | Fuktighet |
| Fenoksyetanol | 0,8 | Konservering (EU-grense 1 %) |
| Sitronsyre | etter behov | Justeres til pH 5,8–6,2 |
| Parfyme | 0 (R1) / 0,3 (valgfri) | Allergenliste hvis brukt |
| Destillert vann | til 100 | |

**Prosess flytende:**
1. Varm vann til 40 °C. Tilsett SCI og løs opp.
2. Tilsett betain, decylglukosid og glycerin.
3. Tilsett fenoksyetanol.
4. Justér pH med sitronsyre-løsning (10 %) til 5,8–6,2.
5. Fyll på flaske. Test pumpe.

**Dispenser-konsentrat:** lag konsentrat som over, men dobbel styrke, og fortynn 1:10 med vann i dispenser-flaske ved bruk.

**Tidsestimat R1:** 1 uke for fast såpe, 2 dager for flytende. Herding og test tar resten.

### 5.9 Elektronikk og firmware
**Ingen elektronikk.** Valgfri R3: enkel flow-teller (hall-sensor på pumpe-stempel) som viser gjenværende konsentrat. Dette er ikke en del av hovedleveransen.

### 5.10 Testplan og suksessmål
**Labtester:**
| Variabel | Metode | Akseptgrense |
|---|---|---|
| pH fast såpe (etter herding) | pH-meter, 10 % løsning | 8–10 |
| pH flytende | pH-meter, 10 % løsning | 5,8–6,2 (±0,1) |
| Viskositet flytende | Brookfield eller enkel rotasjonstest | 300–800 mPa·s |
| Skum | Ross-Miles-test eller enkel skum-høyde | ≥ 80 mm etter 30 s |
| Fortynning 1:10 | Refraktometer (Brix) eller vekt | ±5 % |
| Pumpe-dose | 10 trykk, vei | 1,5 ml ± 0,1 ml per trykk |
| Stabilitet (akselerert) | 40 °C, 12 uker | Ingen faseseparasjon, pH-drift ≤ 0,3 |
| Konservering (challenge-test) | ISO 11930 (bakteriell utfordring) | Bestått etter 28 dager |
| Biologisk nedbrytbarhet | OECD 301B (CO₂-avgivelse, 28 dager) | ≥ 60 % (ready biodegradable) |
| Hudkompatibilitet | Patch-test 24–48 t, 20 pers. | 0 alvorlige reaksjoner |

**Brukertest (20 pers., 2 uker):**
- To grupper: fast såpe vs. flytende i dispenser.
- Logg: tørr hud (1–7), skum (1–7), lukt, pumpe-bruk.
- Akseptgrense: ≥ 80 % rapporterer mindre tørr hud etter 2 uker, ≥ 75 % vil bytte til RenSåpe.

### 5.11 Risikovurdering og sikkerhetskrav
| Risiko | Vurdering | Tiltak |
|---|---|---|
| Lut-forbrenning (NaOH) under produksjon | Høy | Verneutstyr, ventilasjon, arbeidsrutiner, førstehjelp (rikelig vann) |
| Hudirritasjon | Medium | Patch-test, pH-kontroll, merking med allergener |
| Mikrobiologisk vekst | Medium | Konservering, challenge-test, pH-kontroll |
| Parfyme-allergi | Medium | Parfymefri standard, allergenliste |
| Sikkerhetsdatablad (SDS) | Krav | SDS for NaOH-råvare og konsentrat (REACH-artikkel 31 hvis farlig), ikke for ferdig kosmetikk |
| CPSR og CPNP | Krav | Kosmetikk-sikkerhetsrapport og registrering før salg (EU 1223/2009) |

**SDS-punkter (for konsentrat, dersom merket farlig):** 1) identifisering, 2) fare-identifisering og GHS-piktogrammer, 3) sammensetning, 4) førstehjelp, 5) brannfare, 6) utslipp, 7) håndtering og lagring, 8) eksponeringskontroll og verneutstyr, 9) fysisk-kjemiske egenskaper, 10) stabilitet, 11) toksikologi, 12) miljøinformasjon, 13) avfall, 14) transport, 15) regelverk, 16) andre opplysninger.

**Merk:** SDS for ferdig kosmetikk kreves normalt ikke. Vurder med regulatorisk ansvarlig.

### 5.12 Produksjonsskaleringsnotater
| Volum | Fast såpe (100 g) | Flytende (500 ml) | Metode |
|---|---|---|---|
| 1 000 | NOK 35–50 | NOK 25–35 | Småskala-produksjon, kald-prosess i kjøkken-lik lab |
| 10 000 | NOK 20–30 | NOK 15–22 | Kontraktsproduksjon, støpeform i aluminium |
| 100 000 | NOK 10–15 | NOK 8–12 | Industriell såpe-linje, store batcher, automatisk påfylling |

### 5.13 Iterasjonsplan
- **R1 (uke 3–10):** fast såpe (to varianter) + flytende (én) + dispenser-prototyp med glass. Mål: pH, skum, challenge-test.
- **R2 (uke 13–20):** justert flytende formel, PLA-pose, pumpe i PP. Mål: stabilitet, hudtest, nedbrytbarhet.
- **Forventede forbedringer etter R1:** såpe kan bli for hard eller sprø. Tiltak: justere olje-forhold (mer shea). Flytende kan få skum-problemer. Tiltak: justere SCI/betain-forhold.
- **Forventede forbedringer etter R2:** pumpen kan lekke. Tiltak: bytt til ventil med større tetning. Konsentrat-pose kan bli stiv. Tiltak: tynnere laminat.

### 5.14 Patenter, merkeposisjon og neste steg
- **Patent:** trolig ikke patenterbart (såpe er godt kjent). Mer relevant: konsentrat-refill-system med dispenser. Søk: «soap concentrate refill pouch pump dispenser dilution».
- **Varemerke:** «RenSåpe» – EUIPO og Patentstyret.
- **Neste steg:** (1) challenge-test og stabilitet, (2) hudtest, (3) CPSR-rapport og CPNP-registrering før pilot.

---

# Del 6 – E. Renspyl (toalett) og Myk Skog (toalettpapir)

> *Klokken 06:52 står jeg på en brun flis-gulv i hytta med en vannslange i hånden og tenker på hvor mye vann som trengs for å skylle én gang. Seks liter. Hver gang. Papiret i hånden er tynt som en løgn og river seg i to midt i handlingen. Vi trenger en spyl som bruker mindre og et papir som er mykt, sterkt nok og kan forsvinne ned i røret uten å lage en propp som ender i en kommunal regning.*

### 6.1 Navn og pitch
- **Renspyl:** retrofit-spylesystem for eksisterende toalett, to spylevolum (2,0 L og 3,5 L), uten strøm.
- **Myk Skog:** toalettpapir av sukkerrørfiber, FSC-fiber og gran, med kontrollert oppløselighet og styrke.

### 6.2 Problem og målgruppe
- **Primær:** huseiere som renoverer eller vil kutte vannforbruk; boligselskap og kommuner.
- **Sekundær:** hytter og campingfolk (med tilpasset rigg), miljøbevisste forbrukere.
- **Smertepunkter:** store vannvolum, papir som er enten tynt og svakt eller tykt og ikke oppløselig, propper i avløp.
- **Viktig:** toalett-retrofit må tilfredsstille norske krav til sanitæranlegg og standarder. Rørlegger må godkjenne installasjonen.

### 6.3 Konseptbeskrivelse
**Renspyl:** et dual-flush-spylesystem som bytter inn i en eksisterende cisterne. Lite spyl (2,0 L) for væske, stort spyl (3,5 L) for fast avføring. Ventilen er mekanisk, med en dyse som gir vortex-effekt for bedre spylekraft ved lavere volum.

**Myk Skog:** papir med lavere bruk av kjemikalier. Fibre er sukkerrør (bagasse), FSC-eukalyptus og gran for styrke. Tørr-styrke gis av kationisk stivelse, ikke våtstyrke-harpiks (som hindrer oppløsing).

**Nyhet:** et system der både spylevolum og papiroppløselighet er designet sammen, slik at mindre vann kan spyle samme papir uten propp.

### 6.4 Hovedfunksjoner og teknisk forklaring
**Renspyl:**
- **Ventil:** gummi-flapper (EPDM) med to stigehøyder. Liten knapp åpner flapper kort (2,0 L). Stor knapp åpner lengre (3,5 L).
- **Vortex-dyse:** ringformet dyse med vinklede spor som gir rotasjon i vannet. Øker spylekraft ved lavere volum.
- **Cistern-fyll:** standard flottørventil, justert til riktig volum.
- **Ingen strøm.** Alt er mekanisk.

**Myk Skog:**
- **Fiberblanding:** 55 % bagasse, 30 % FSC-eukalyptus, 15 % gran.
- **Styrke:** kationisk stivelse 0,5 % (tørr-styrke). Ingen våtstyrke-harpiks.
- **Mykhet:** lav raffinering (lite kraftig tuing), eukalyptus gir mykhet.
- **Oppløselighet:** lav fiberlengde og ingen våtstyrke.

### 6.5 Materialvalg og begrunnelse
**Renspyl:**
| Del | Prototype | Produksjon | Begrunnelse |
|---|---|---|---|
| Ventil-hus | ASA (3D-print) | PP (injeksjon) | Kjemisk resistent, billig i serie |
| Flapper | EPDM-plate 3 mm (klippet) | EPDM-støpt | Holdbar mot vann og kalk |
| Dyse | PETG (3D-print) | PP | Presisjon |
| Knapper | PP (3D-print) | PP | Enkel |
| Fjær | Rustfri stål-fjær | Samme | Korrosjonsfri |
| Kjemikalie | Ingen rengjøringskjemi i systemet | — | — |

**Myk Skog:**
| Del | Prototype | Produksjon | Begrunnelse |
|---|---|---|---|
| Bagasse (sukkerrør) | 55 % | 55 % | Lav CO₂-belastning, avfallsfiber |
| Eukalyptus FSC | 30 % | 30 % | Mykhet |
| Gran (langfiber) | 15 % | 15 % | Styrke |
| Kationisk stivelse | 0,5 % tørr | samme | Tørr-styrke uten våtstyrke |
| Pakning | Papir-omslag | Samme | Null plast |

**Forbudt:** våtstyrke-harpiks (f.eks. PAE-baserte) som hindrer oppløsing. Parfyme. Hvit-blekemidler med klor.

### 6.6 Dimensjoner og fysisk skissebeskrivelse
**Renspyl:**
| Element | Mål | Toleranse |
|---|---|---|
| Ventil-hus | Ø 60 mm, høyde 80 mm | ±0,5 mm |
| Flapper | Ø 58 mm, 3 mm tykkelse | ±0,2 mm |
| Vortex-dyse | 6 spor, 35° vinkel | ±2° |
| Knapp-stempel | Ø 25 mm, 30 mm slaglengde | ±0,3 mm |
| Flottørventil | Standard 1/2" | Standard |

**Myk Skog:**
| Element | Mål | Toleranse |
|---|---|---|
| Ark | 100 × 100 mm, 2-lags | ±1 mm |
| Grammatur | 17 g/m² per lag, 34 g/m² totalt | ±2 g/m² |
| Rull | Ø 110 mm, 200 ark | ±5 mm |

**CAD/fil-liste:**
1. `Renspyl_ventil_hus.step` + `Renspyl_ventil_hus_R1.stl` (ASA).
2. `Renspyl_dyse_vortex.step` + `Renspyl_dyse_R1.stl` (PETG).
3. `Renspyl_flapper.dxf` (EPDM-kutt).
4. `MykSkog_arkoppsett.pdf` (ark-størrelse og perforering).

### 6.7 Komponentliste (BOM)
**Renspyl – test-rigg og ett system (R1):**
| Del | Antall | Est. pris (NOK) | Leverandør |
|---|---|---|---|
| Dual-flush-kit (mekanisk) | 1 | 400 | Sanitærgrossist (eller tilpasset) |
| 3D-print ASA/PETG 500 g | 1 | 200 | Makerspace |
| EPDM-plate 3 mm (A4) | 1 | 100 | Gummileverandør |
| Knapp-sett (to knapper) | 1 | 150 | Sanitærgrossist |
| Testcistern (plast, 10 L) | 1 | 300 | Byggevarehus |
| Vannpumpe 12 V + bøtte (testrigg) | 1 | 800 | Mouser, Clas Ohlson |
| Vannmåler (flow-meter, pulser) | 1 | 500 | Mouser, Farnell |

**Myk Skog – laboratorieprøver (R1):**
| Del | Antall | Est. pris (NOK) | Leverandør |
|---|---|---|---|
| Bagasse-massa 5 kg | 1 | 400 | Papirgrossist/ massa-leverandør |
| FSC-eukalyptus-massa 5 kg | 1 | 500 | Massa-leverandør |
| Gran-massa 2 kg | 1 | 200 | Massa-leverandør |
| Kationisk stivelse 200 g | 1 | 150 | Papir-kjemikalieleverandør |
| Lab-ark-maskin (hånd-ark-former, ca. Rapid-Köthen-type) | lån/leie | 1 500 | Papir-labb (leie) |
| Strekkstyrke-tester (eller leie) | — | 1 000 (leie) | Akkreditert lab |

**Sum R1:** ca. NOK 2 500 (Renspyl-rigg) + NOK 3 000–4 000 (papirlab) + lab-leie.

### 6.8 Produksjonsmetode for prototype (trinnvis)
**Renspyl (test-cistern):**
1. Demonter eksisterende cistern (eller bruk testcistern).
2. Monter flottørventil og ventil-hus. Sett inn flapper.
3. Sett inn vortex-dyse i utløpet.
4. Monter knapper og fjær. Juster slaglengde.
5. Sett volum: fyll cistern og mål.
6. Kjør flush-test (se 6.10).

**Myk Skog (hånd-ark-prosess):**
1. **Massa-forberedelse:** vei fiber (bagasse 55 %, eukalyptus 30 %, gran 15 %), bløtlegg i vann 12 timer.
2. **Oppløsing:** bruk desintegrator i 10 min, vann-konsentrasjon 1–2 %.
3. **Raffinering:** lett raffinering (ingen høy kraft) i Valley-raffinør eller hånd-blender (kort).
4. **Tilsetting:** tilsett kationisk stivelse 0,5 % tørr. Rør 5 min.
5. **Ark-formning:** hånd-arkformer (Rapid-Köthen eller tilsvarende), 17 g/m² per lag.
6. **Pressing og tørking:** press ved 0,4 MPa, tørk ved 90–100 °C til ~ 5 % fuktighet.
7. **To lag:** lag to ark med samme prosess og lim sammen (kun varme-pressing).
8. **Kutting:** kutt i 100 × 100 mm ark.

**Tidsestimat R1:** 2 uker papirlab, 2 uker rigg-test.

### 6.9 Elektronikk og firmware
**Renspyl:** ingen elektronikk i R1. Valgfri R2: flow-meter på vannledning (pulser) for å måle volum og logge gjennomsnittlig bruk. Dette er ikke påkrevd for å validere mekanikken, men nyttig for pilot.

Pseudo-kode (R2 flow-logger, ESP32-C3):
```text
hver puls fra flow-meter: teller++
ved spylehendelse (knapp): lagre start-teller og slutt-teller, beregn volum
logg volum per dag i ringbuffer (lokal, ingen sky)
```

### 6.10 Testplan og suksessmål
**Renspyl (rigg og toalett):**
| Variabel | Metode | Akseptgrense |
|---|---|---|
| Volum liten spyl | Vannmåler / bøtte | 2,0 L ± 0,1 L |
| Volum stor spyl | Vannmåler / bøtte | 3,5 L ± 0,1 L |
| Spylekraft / fjerning | Testlast (standard test-soil, se norsk standard for WC-skål – verifiser EN 997 metode) | ≥ 95 % fjerning ved liten spyl på test-last (verifiser) |
| Lekkasje | Tett i 24 t, vannstand | 0 mm drop over 24 t |
| Holdbarhet | 10 000 spyler (ventil) | Ingen brudd, ingen lekkasje |
| Støy | Lydmåler, 1 m | ≤ 45 dB(A) |

**Myk Skog (papir):**
| Variabel | Metode | Akseptgrense |
|---|---|---|
| Strekkstyrke MD (maskinretning) | ISO 12625-4 (tissue paper tensile) | ≥ 250 N/m (verifiser mot referanse-produkt) |
| Strekkstyrke CD (tverretning) | ISO 12625-4 | ≥ 120 N/m |
| Mykhet | Panel (n = 20, 1–10) + stivhets-test (bøyelengde, ISO 9073-serien) | Panel ≥ 6/10 og bøyelengde ≤ referanse |
| Oppløselighet | Rysteprøve i 2 L vann, 10 rotasjoner/min | 90 % av ark i biter ≤ 15 mm på ≤ 60 s (egenutviklet metode, kalibrert mot INDA/EDANA GD4-retningslinjer – verifiser) |
| Vannabsorpsjon | Standardisert mengde vann på ark | ≥ referanse (verifiser ISO 12625-serien) |
| Rør-test | Standard flush-test med 4 ark, 10 min | Ingen propp, full oppløsning |

**Brukertest (20 pers., 2 uker):**
- Renspyl: loggfør bruk, spylesatisfaction (1–7), tilfeller av feil spyl.
- Myk Skog: panel med blindtest mot to referanse-produkter, mykhet og opplevd styrke (1–7).
- **Akseptgrense:** Renspyl ≥ 85 % fornøyde; Myk Skog ≥ 70 % foretrekker over referansen i blindtest.

**Rørlegger-kontroll:** installasjon av Renspyl bør godkjennes av rørlegger før pilot.

### 6.11 Risikovurdering og sikkerhetskrav
| Risiko | Vurdering | Tiltak |
|---|---|---|
| Lekkasje | Medium | Tettingstest, EPDM-kvalitet, rørlegger-kontroll |
| Propp i avløp | Høy hvis papir feil | Oppløselighetstest, rør-test i testrigg |
| Vann/fukt-skade | Lav | Materialvalg (ASA, EPDM) |
| Kjemikalier i papir | Lav | Ingen klor, ingen parfyme, ingen våtstyrke |
| Mikroplast | Lav | Ingen syntetiske bindemidler |
| Sanitær-standard | Høy | Verifiser NS-EN-standarder før pilot |

### 6.12 Produksjonsskaleringsnotater
**Renspyl:**
| Volum | Enhetskost (retrofit-kit) | Metode |
|---|---|---|
| 1 000 | NOK 350–450 | Montering i Europa, injeksjon av deler (verktøy NOK 100 000–150 000) |
| 10 000 | NOK 180–250 | Automatisert montering, EPDM-støp |
| 100 000 | NOK 90–130 | Kontraktsproduksjon, PP-injeksjon |

**Myk Skog:**
| Volum | Enhetskost (rull, 200 ark, 2-lags) | Metode |
|---|---|---|
| 1 000 ruller | NOK 35–50 | Papirmaskin i EU (liten skala, kontraktsproduksjon) |
| 10 000 ruller | NOK 20–30 | Industriell linje, lav-kjemikalier |
| 100 000 ruller | NOK 10–15 | Kontraktsproduksjon med stor papirmaskin |

### 6.13 Iterasjonsplan
- **R1 (uke 9–18):** Renspyl-rigg (mekanisk test), Myk Skog hånd-ark (3 varianter). Mål: volum, lekkasje, strekkstyrke.
- **R2 (uke 19–32):** Renspyl i reell cistern med flow-logger, Myk Skog maskinlig prøve (eller lab-maskin). Mål: oppløselighet, mykhet, rør-test.
- **Forventede forbedringer etter R1:** lav spylekraft på liten spyl. Tiltak: mer vortex, større dyse-åpning. Papir kan bli for hardt. Tiltak: mindre stivelse, mer eukalyptus.
- **Forventede forbedringer etter R2:** papir som ikke oppløses nok. Tiltak: kortere fiber, lavere raffinering.

### 6.14 Patenter, merkeposisjon og neste steg
- **Patent:** kombinasjonen av vortex-dyse og dual-flush i retrofit. Søk: «dual flush retrofit vortex nozzle toilet cistern». Papir: «tissue sugarcane bagasse cationic starch dry strength».
- **Varemerke:** «Renspyl» og «Myk Skog» – EUIPO og Patentstyret.
- **Neste steg:** (1) rørlegger-vurdering og norsk standard-gjennomgang, (2) akkreditert oppløselighetstest, (3) kontraktsprodusent for papir.

---

# Del 7 – Videre plan, filer og prioritering

### 7.1 Filer som skal lages (samlet)

| Produkt | CAD/STEP | STL (print) | PCB / KiCad | Annet |
|---|---|---|---|---|
| D RenSåpe | Bar-form, pumpe-adapter | Bar-form R1, pumpe-adapter R1 | – | Pose-skisse (DXF), SDS-mal, formel-ark (xlsx) |
| B SvalPad | Pad-die, PCM-holder | PCM-holder R1 | – | Hylse-mønster (PDF/DXF) |
| A TørrNatt | Kjerne-midt, pod-hus | Pod-hus R1 og R2, spacer | pcb_v1 (sensor, vifte, LED) | Tekstil-mønster (PDF 1:1), firmware |
| E Renspyl/Myk Skog | Ventil-hus, dyse, flapper | Ventil-hus R1, dyse R1 | Flow-logger (R2, valgfri) | Ark-oppsett (PDF), lab-protokoll |
| C RenTann | Håndtak, pod-hode, pod-lås, UV-dokk | Håndtak R1, pod R1, dokk R2 | pcb_v1 (motor, FSR, UV, lokk) | Firmware, UV-protokoll |

### 7.2 Verktøy-oversikt
- **CAD:** Fusion 360 (hobby/startup-lisens) eller SolidWorks.
- **PCB:** KiCad (gratis).
- **Firmware:** PlatformIO med ESP32-C3-kort, eller Arduino IDE.
- **Lab-logg:** Google Sheets eller Excel. Bilder i felles mappe.
- **Prosjektstyring:** Trello eller Notion (kanban per produkt).
- **Statistikk:** R eller Python (pandas) for brukertest-data.

### 7.3 Prioritert liste: hva bygges først og hvorfor (risk/impact)

| Rang | Produkt | Effekt | Risiko | Hvorfor først/sist |
|---|---|---|---|---|
| 1 | **D – RenSåpe** | Medium-høy | Lav | Lav regulatorisk risiko, rask iterasjon, bygger kjemi-kompetanse |
| 2 | **B – SvalPad** | Medium | Lav-medium | Tekstil, rask test, tydelige mål |
| 3 | **A – TørrNatt** | Høy | Medium-høy | Størst menneskelig effekt, men krever personvern og medisinsk avklaring |
| 4 | **E – Renspyl/Myk Skog** | Høy (miljø) | Medium | Lab-tilgang kreves, rørlegger-godkjenning |
| 5 | **C – RenTann** | Medium | Høy | Elektrisk, UV-C, etisk godkjenning. Bygges sist, men søknad sendes tidlig |

### 7.4 Første ukes arbeidsplan (uke 1)

| Dag | Oppgave | Ansvarlig (forslag) | Leveranse |
|---|---|---|---|
| Mandag | Kick-off: roller (produkt-ledere for D, B, A, E, C), mål, budsjett-godkjenning | Prosjektleder | Kick-off-notat, roller-liste |
| Tirsdag | IP-søk (Espacenet/Google Patents) for alle fem produkter | IP-ansvarlig | Søkelogg per produkt |
| Tirsdag | Regulatorisk kartlegging (kosmetikk, biocid, MDR, LVD, GPSR) | Regulatorisk ansvarlig | Notat med grenser |
| Onsdag | Bestille prøvematerialer: SAP/cellulose (A), tekstil (B), bagasse/eukalyptus-massa (E), oljer og lut (D), UV-LED og motor (C) | Innkjøp | Ordrebekreftelser |
| Onsdag | Bestille lab-tid: papirlab, kosmetikk-challenge-test, dermatolog | Lab-ansvarlig | Booking-bekreftelser |
| Torsdag | Start CAD: TørrNatt pod-hus og RenTann håndtak | Designer/ingeniør | Første CAD-utkast |
| Torsdag | Start etisk søknad (C) til REK/NSD-mal | Prosjektleder | Utkast til søknad |
| Fredag | Første såpe-batch (D) i lab, pH-kontroll | Kjemiker/maker | Logg, pH-måling |
| Fredag | Go/no-go-møte: bekrefte rekkefølge og budsjett | Hele teamet | Beslutningslogg |

### 7.5 Neste steg i prioritert rekkefølge
1. Godkjenn budsjett og roller (uke 1).
2. Gjennomfør IP- og regulatorisk søk (uke 1–2).
3. Start D og B i parallell (uke 3).
4. Start A og E-papirtest (uke 5 og 9).
5. Send etisk søknad for C (uke 6).
6. Gate 1 (uke 11): vurdere R1 for D og B.

---

## Forbehold

- **Standarder:** ISO-, EN- og EU-referanser er gitt for å peke på riktig område. Eksakte nummer og krav skal verifiseres mot offisielle kilder (Standard Norge, EU-tidende) før testing.
- **Priser:** alle NOK-tall er grove estimater pr. medio 2026 og må bekreftes med leverandørtilbud.
- **Juridisk:** dette er ikke juridisk rådgivning. Regulatorisk status for medisinske påstander, biocid og kosmetikk må avklares med jurist før markedsføring.
- **Prototyper:** dette dokumentet er en byggepakke. Fysiske prototyper er ikke bygget ennå. Målene i dette dokumentet er forslag som skal valideres i første testrunde.
- **Ingen helsepåstander:** ingen av produktene skal markedsføres med helbredende effekt uten klinisk dokumentasjon.
