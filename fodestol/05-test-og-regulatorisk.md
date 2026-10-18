# 05 — Testing, feilsøking, risiko og regulatoriske krav

## 5.1 Regulatorisk ramme (EU/EØS og Norge)

| Område | Krav / standard | Kommentar for LIVA |
|---|---|---|
| Forordning | **MDR (EU) 2017/745**, gjennomført i norsk rett via forskrift om medisinsk utstyr | Tilsyn i Norge: **Direktoratet for medisinske produkter (DMP)** |
| Klassifisering | Vedlegg VIII: Regel 1 (ikke-invasiv) + Regel 13 (aktivt utstyr) → **klasse I** for plattformen | **Avgjørende risiko:** QBL-funksjonen. Måling → **klasse Im** (teknisk kontrollorgan for metrologi-delen). Hvis programvaren tolker data for kliniske beslutninger (PPH-alarm) → mulig **Regel 11 → klasse IIa**. Strategi: v1 viser *målt volum + brukerdefinerte terskler*, ingen diagnostisk tolkning. **Avklares tidlig med teknisk kontrollorgan og DMP.** |
| Kvalitetssystem | EN ISO 13485:2016 | Må etableres før P2 |
| Risikostyring | EN ISO 14971:2019 | FMEA under er startpunkt |
| Elektrisk sikkerhet | IEC 60601-1 (3. utg. + A1/A2) | Type B anvendt del (pasientkontakt), batteri, lekkasjestrøm |
| EMC | IEC 60601-1-2 | Fødestuer har CTG, telemetri, infusjonspumper |
| Medisinske senger | **IEC 60601-2-52** | Skrevet for senger til voksne. Gyldighet for fødesenger må avklares, men bruk kravene (klemsoner, stabilitet, SWL-test, sidegrinder) uansett — de er god praksis |
| Brukbarhet | IEC 62366-1 + IEC 60601-1-6 | Formative + summative tester med jordmødre, leger, kvinner, rengjøring |
| Programvare | IEC 62304 | Perineum-lås og QBL |
| Alarmer (hvis QBL-terskler) | IEC 60601-1-8 | |
| Biokompatibilitet | ISO 10993-1, -5, -10, -23 | Hudkontakt, også slimhinne-nær kontakt i perinealsonen; intakt hud < 24 t |
| Hjemmebruk/transport | — | Ikke relevant v1 |
| Rengjøring | Validert prosedyre med klor 1 000 ppm, alkohol 70 %, peroksid-baserte midler; Spaulding «ikke-kritisk» | Materialtest 500 sykluser |
| Klinisk evaluering | MDR art. 61, vedlegg XIV | Litteratur (stillinger, krakk, QBL) + egen klinisk utprøving pga nye påstander |
| Etter marked | PMS-plan, PMCF, Eudamed/UDI | |
| Anskaffelse | Sykehusinnkjøp HF / nasjonale rammeavtaler, LOA/FOA | Krev MTU-dokumentasjon, servicemanual, reservedelsliste, opplæring |

## 5.2 FMEA — feilmodus og effektanalyse (utdrag, topp 15)

S = alvorlighet, O = sannsynlighet, D = (manglende) deteksjon, 1–10. RPN = S×O×D. Mål etter tiltak: ingen S ≥ 9 med O > 2.

| # | Funksjon | Feilmodus | Effekt | S | O | D | RPN | Tiltak | RPN etter |
|---|---|---|---|---|---|---|---|---|---|
| F1 | Løft | Søyle-asynkron → utilsiktet tilt | Kvinne sklir, fall | 9 | 3 | 3 | 81 | Hall-sensorer, maks 15 mm differanse → stopp; mekanisk tiltgrense ±12° | 27 |
| F2 | Løft | Klemming av fot/hånd under sete ved senking | Klemskade, kan ramme barn/partner | 8 | 4 | 4 | 128 | Klemlister + strømovervåking, 25 mm sikkerhetsavstand (60601-2-52), langsom siste 100 mm | 32 |
| F3 | AKUTT FLAT | Gassfjær svikter, rygg faller ukontrollert | Nakke-/hodestøt | 9 | 2 | 4 | 72 | Dempet gassfjær + aktuator-clutch med friksjonsbrems, årlig test i servicemanual | 18 |
| F4 | AKUTT FLAT | Fotbrett/benholdere står i veien | Forsinket HLR | 9 | 3 | 3 | 81 | Fotbrett feller automatisk opp ved AKUTT (fjær), benholdere svinger fritt | 27 |
| F5 | Stabilitet | Velting ved knestående helt på ytterkant med 250 kg | Fall | 10 | 2 | 3 | 60 | Tyngdepunkt i base (stål), 5. hjul, stabilitetstest 10° skråplan + 1,5 × SWL ytterkant | 20 |
| F6 | Delt sete | Klemming mellom setehalvdeler ved lukking | Klemskade i perineum/lår | 8 | 3 | 3 | 72 | Manuell lukking kun med to-hånds utløser, myk 15 mm kantprofil, lukker ikke under last > 20 kg | 24 |
| F7 | Fotbrett | Låsen glipper under push | Kvinnen mister fotfeste | 7 | 3 | 3 | 63 | Formlåst (hakk) + friksjonslås, testes 2 × 150 kg statisk + 50 000 sykluser | 21 |
| F8 | QBL | Urin, fostervann, skyllevann blandes i måling | Over- eller underestimert blodtap | 7 | 6 | 6 | **252** | Prosedyre: TARE etter barnet; display viser «total væske» og «etter tare»; opplæring; validering mot gravimetrisk standard. **Største restrisiko** | 84 |
| F9 | QBL | Lastcelle-drift/temperatur | Feil volum | 6 | 3 | 5 | 90 | Selvtest ved oppstart, kalibreringsvekt i service, temperaturkompensasjon | 36 |
| F10 | QBL | Bruker stoler blindt på tall | Forsinket klinisk vurdering | 8 | 3 | 6 | 144 | Tekst «supplerer klinisk vurdering», ingen grønn «OK»-farge, opplæring | 72 |
| F11 | Elektrisk | Væskeinntrengning i kontrollboks | Svikt, kortslutning | 7 | 3 | 3 | 63 | IPX6 på alle komponenter under seteplan, drypp-skjerm, kabler i drypp-sløyfe | 21 |
| F12 | Strømbrudd | Ingen bevegelse | Kan ikke endre stilling | 6 | 2 | 2 | 24 | Batteri + mekanisk AKUTT | 12 |
| F13 | Hygiene | Væske inn i lineærføringer | Smitte, korrosjon | 6 | 5 | 5 | 150 | Forseglede føringer, avtakbar skjørt-del, testet rengjøringsprosedyre | 45 |
| F14 | Bruk | Feil modus valgt under stress | Forsinkelse | 6 | 4 | 3 | 72 | 6 symboler + rød separat, haptisk feedback, summativ brukbarhetstest | 24 |
| F15 | U-bøyle | Brudd/løs ved heng | Fall | 9 | 2 | 3 | 54 | Dimensjoner 150 kg × SF 4, positiv låsing med synlig indikator | 18 |

## 5.3 Kjente svakheter ved prototypen (ærlig liste) og løsninger

| Svakhet | Hvorfor | Løsning / test |
|---|---|---|
| Hesteskoåpning i sengemodus | Hullet må dekkes for å ligge flatt | Innleggspute (integralskum, magnetlås) lagret i benseksjonen; vurder heller motorisert lukke-flik i v2 |
| Vekt ≤ 165 kg er ambisiøst med to søyler + stålbase | Stabilitet krever masse lavt | FEM-optimalisering i P1; aksepter 180 kg hvis stabilitet krever det |
| Perineum-lås forutsetter kjent referansepunkt | Kvinner sitter forskjellig | Låsen holder *sete-referansepunktet*, ikke anatomisk perineum. Brukes som «hold høyde», ikke som presisjonsfunksjon |
| Jordmors sadelstol er et ekstra objekt | Bryter «ingenting løst» | Dokkes i fotende. Alternativt bruker avdelingen eksisterende sadelstoler |
| QBL i sengemodus er mindre presis enn i krakkmodus | Væske fanges av duk, ikke trakt | Egen oppsamlingsduk med kanal mot skuff; valideres separat |
| Kvinnen ser ikke barnet bli født i krakkmodus | Hun sitter over | Speil-/kamerafri løsning: jordmor guider. Lav prioritet — samme som dagens krakk |
| To søyler og elektronikk = høyere servicekost enn krakk | | Modulbytte < 30 min, standard industrikomponenter |

## 5.4 Testplan

### Verifikasjon (lab)
| Test | Metode | Akseptkriterium |
|---|---|---|
| Statisk last | 2 × SWL (500 kg) fordelt, 1 t | Ingen permanent deformasjon > 2 mm |
| Holdbarhet | 30 000 heve/senke-sykluser m/ 250 kg; 10 000 rygg; 50 000 fotbrett | Ingen funksjonsfeil |
| Stabilitet | 60601-2-52 metode, inkl. ytterkant-last i knestående og 10° skråplan | Ingen velting |
| AKUTT | Fra alle 6 moduser, med 120 kg simulert pasient, uten strøm | ≤ 10 s til flat, 30/30 forsøk |
| Klemsoner | Testfingre/-kropp iht. 60601-2-52 | Ingen klemsone < krav |
| Elektrisk sikkerhet / EMC | Akkreditert lab | Bestått |
| Væsketetthet | IPX6 spylings-test på montert enhet | Ingen inntrengning |
| QBL nøyaktighet | Gravimetrisk referanse, 0–3 000 g, 20 °C og 30 °C | ±5 g eller ±1 %, største |
| Rengjøring | 500 sykluser med klor/alkohol/peroksid | Ingen sprekker, misfarging akseptabel |
| Biokompatibilitet | ISO 10993 cytotoksisitet, sensibilisering, irritasjon | Bestått |

### Validering (brukere)
| Test | Deltakere | Mål |
|---|---|---|
| Formativ brukbarhet P0/P1 | 10 + 20 jordmødre, 5 leger | Oppgavesuksess, feil, SUS ≥ 75 |
| Ergonomi | 20 jordmødre, simulert krakkfødsel: gulvkrakk vs LIVA | RULA/REBA-skår, trunk-fleksjon (IMU-sensorer), Borg-skala |
| Akutt-drill | 10 team, skulderdystoci-scenario med simulator | Tid til McRoberts/flatt, sammenlignet med dagens seng+krakk |
| Summativ (60601-1-6) | ≥ 15 per brukergruppe | Ingen kritiske brukfeil |

## 5.5 Feilsøkingsprosedyre (for prototype og service)

1. **Symptom** loggføres (kontrollboksen lagrer feilkoder + tidsstempel).
2. **Isoler aksen**: plattform / rygg / ben / QBL / elektronikk.
3. **Sjekk sikkerhetslag først**: AKUTT mekanisk fungerer alltid? Hvis ikke → ta ut av drift.
4. **Feilkodetabell** i servicemanual: E10–E19 søyler, E20–E29 aktuatorer, E30–E39 batteri, E40–E49 QBL.
5. **Rotårsak** dokumenteres i CAPA-system (ISO 13485 §8.5), trend-analyse månedlig i pilot.
