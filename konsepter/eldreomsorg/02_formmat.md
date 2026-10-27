# 2. Formmat

**Tagline:** Purémat som ser ut som middag og smaker som hjemme.
**Rolle:** rask gevinst · lavteknologisk, matfag (med en målemodul som tillegg)

## 2. Målgruppe og kontekst
- Beboere på sykehjem og hjemmeboende med **svelgevansker (dysfagi)**, for eksempel etter hjerneslag, ved demens eller Parkinson.
- Kjøkken og sentralkjøkken.
- Pleiere som hjelper til ved måltidet.

## 3. Problemstilling
- **Underernæring er vanlig på sykehjem.** En stor andel beboere er i ernæringsmessig risiko `[kilde: norske kartlegginger, Hdir]`, og svelgevansker forsterker dette.
- **Most mat (IDDSI nivå 4–5) serveres ofte som grå klatter.** Det gir dårlig matlyst, mindre spist og tap av verdighet: «Hva er dette?»
- **Smertepunkter for kjøkkenet:** Det tar tid å lage pen most mat, og det finnes ingen enkel standard.
- **Smertepunkter for pleierne:** Det er vanskelig å vite hvor mye beboeren faktisk har spist.

## 4. Konsept og brukerreise
To trinn, inspirert av japansk mat for folk med tygge- og svelgevansker (*kaigo-shoku*, *Universal Design Food*). Japan har vist at mat kan være trygg å svelge *og* se ut som ekte mat.

**Trinn A, rask gevinst:** silikonformer av matkvalitet formet som kjent norsk mat: fiskekake, kjøttkake, potet, gulrot, brokkolibukett, laksefilet og en lefserull. Til det hører oppskrifter som støper most mat til riktig konsistens (IDDSI 4–6) med lite gelering (agar, xantan). Formene kommer med kurs og testprotokoll for kjøkkenet.

**Trinn B, langsiktig:** Enzymmyk «ekte» mat. Grønnsaker og kjøtt mykgjøres med naturlige enzymer under vakuum (*frys-tin-enzyminfusjon*, utviklet i Hiroshima). Maten beholder formen, men kan moses med tungen.

**Tillegg: Spisebrettet.** Et brett med innebygd vekt registrerer hvor mye av maten som er spist. Pleieren slipper å anslå.

**Brukerreise:**
1. Kjøkkenet lager purert laks og gulrot om morgenen og støper i formene. De stivner i kjøleskap på 2 timer.
2. Maten varmes i kombidamper, og formene holder i 70 °C.
3. Den anrettes på en blå, kontrastfarget tallerken med menykort: «Laks, gulrot og potet med smørsaus».
4. Arne kjenner igjen maten og sier: «Det var da laks.» Han spiser mer, og brettet registrerer 85 %.

## 5. Nøkkelfunksjoner og fordeler
- **Gjenkjennelig mat** gir matlyst og verdighet.
- **Standardisert konsistens etter IDDSI** med testprotokoll per parti: gaffeltrykk og skjevelt-test.
- **Formene kan brukes om igjen** og tåler oppvaskmaskin. Ingen nye maskiner trengs i trinn A.
- **Spisebrettet** gir målt inntak i stedet for anslag og varsler når beboeren har spist under 50 % tre dager på rad.
- **Felles norsk «formbibliotek»,** som kommuner kan dele.

## 6. Teknologi og komponenter
- **Former:** platinaherdet silikon godkjent for matkontakt, tåler −40 til +230 °C.
- **Gelering:** agar, gellan og xantan, som er stabile ved oppvarming.
- **Trinn B:** vakuumpakkemaskin, matenzymer (pektinase og cellulase til grønnsaker, protease til kjøtt) og kontrollert frysing og tining.
- **Spisebrettet:** fire lastceller (vektsensorer), BLE (Bluetooth), oppladbart og vaskbart (IP67).
- **Hvorfor disse valgene:** Matfag og enkle materialer gir størst effekt per krone. Teknologien måler, den lager ikke maten.

## 7. TRL og gjennomførbarhet
- **TRL:** Formene ligger på 9, enzymmetoden på 6–7 (i kommersiell bruk i Japan) og spisebrettet på 5. **Gjennomførbarheten er høy.**
- **Barriere: sikkerhet ved konsistens.** Feil konsistens kan føre til at mat havner i luftveiene. Krav: test hvert parti, og logopeden godkjenner oppskriftene.
- **Barriere: kjøkkentid og opplæring.**

## 8. Prototype (MVP)
- **Lag** 6 former (3D-printet modell og støpt silikon) og 10 oppskrifter.
- **Test** i ett sykehjemskjøkken i 6 uker. Mål:
  - hvor mye beboerne spiser (bildeanalyse av tallerkenrester før og etter)
  - kjøkkentid per porsjon
  - om konsistensen holder IDDSI-kravet
  - hva beboerne mener (smilefjesskala)

## 9. Kostnadsoverslag: lav
| Post | Anslag | Antakelse |
|---|---|---|
| Utvikling | 0,8–1,5 MNOK | Formdesign, oppskrifter, testing og kurs |
| Former | 150–400 kr per stk | 40–60 former per sykehjem |
| Merkostnad per porsjon | 5–12 kr | Gelering og 2–4 min ekstra arbeid |
| Trinn B (enzymutstyr) | 30–80 kNOK per sentralkjøkken | Vakuummaskin og fryser finnes ofte |
| Spisebrett | 1 500–2 500 kr per stk | Ved 1 000 stk |

## 10. Implementeringsplan
| Fase | Måneder |
|---|---|
| Konsept og oppskrifter (med logoped og klinisk ernæringsfysiolog) | 2 |
| Prototype (former og kjøkkentest) | 1 |
| Pilot | 3–6 |
| Utrulling (formbibliotek og kurs) | 6 |
| Trinn B, enzymer | +12 |

## 11. Pilot og suksesskriterier
- **Utvalg:** to sykehjem og om lag 30 beboere med IDDSI 4–6-kost.
- **Design:** krysning (crossover) med 6 uker vanlig most mat og 6 uker Formmat.

| KPI | Mål |
|---|---|
| Andel av servert mat som spises | +20 % (relativt) |
| Energi og protein per døgn | +15 % |
| Vekt og MNA-SF (kort ernæringsskjema) etter 12 uker | Stabil eller økende |
| Måltidsglede (smilefjesskala 1–5) | +1 |
| Hendelser med mat i luftveiene | Ingen økning (sikkerhetskrav) |
| Kjøkkentid | < 3 min ekstra per porsjon |

## 12. Etikk, personvern og regelverk
- **Matlovgivning:** Mattilsynet, internkontroll (HACCP) og krav til materialer i kontakt med mat. Enzymer som brukes i produksjonen følger EU-forordning 1332/2008.
- **Ikke medisinsk utstyr.** Spisebrettet måler mat, ikke helse, men inntaksdata som legges i journalen er helseopplysninger (GDPR art. 9). Det lagres lokalt eller i EPJ.
- **Dilemma:** Mat som «lurer» øyet. Mottiltak: Menykortet sier alltid hva det er, og beboeren velger selv.

## 13. Barrierer og risikoer
| Risiko | Mottiltak |
|---|---|
| Feil konsistens og kvelning | IDDSI-test per parti, logoped godkjenner, opplæring |
| Kjøkkenet har ikke tid | Stordrift i sentralkjøkkenet med frosne, ferdigformede porsjoner |
| Det blir et engangsprosjekt | Inn i menyplan og internkontroll, med en kokk som eier det |

## 14. Forretningsmodell og skalering
- **Betalere:** kommunale kjøkken og sentralkjøkken.
- **Produkt:** «Formmat-sett» med former, oppskrifter, kurs og årlig fornyelse, samt lisens for formbiblioteket.
- **Partnere:**
  - Nofima (matforskning)
  - logopeder
  - kliniske ernæringsfysiologer
  - matprodusenter (ferdig formet mat)
- **Beskyttelse:** designregistrering av formene. Enzymmetoden er kjent fra Japan, så oppskriftene beskyttes som kompetanse.

## 15. Bærekraft og materialer
- Silikon holder i over 10 år.
- Mindre mat kastes, fordi mer blir spist.
- Lokale råvarer og ingen engangsplast.

## 16. Samarbeidspartnere og kompetanse
Kokk med institusjonserfaring, logoped, klinisk ernæringsfysiolog, sykepleier, produktdesigner for formene og mattrygghetsrådgiver.

## 17. UI/UX og fysisk design
- **Formene** er trygge å bruke: plate med 6 hulrom, merket med symbol og IDDSI-nivå i relieff.
- **Tallerken:** dypblå med høy kant, slik at maten synes og er lett å få på skjeen.
- **Menykort:** stor skrift og bilde av den «ekte» retten.
- **Spisebrettet:** ingen skjerm. En liten LED lyser grønt når det er veid. Data går rett til avdelingens nettbrett: «Arne: 85 % middag.»

## 18. Hvorfor uventet
Svaret på underernæring er ikke en ny næringsdrikk, men å gi most mat tilbake ansiktet sitt. Det er japansk *kaigo-shoku*, der verdighet ligger i hvordan maten ser ut.

## Scenario: Arne, 81
Etter hjerneslaget har Arne skjøvet bort den grå moste maten. På den tredje dagen med Formmat får han «laks, gulrot og potet» på en blå tallerken. Han ser lenge på det og sier: «Det var da laks.»

Spisebrettet viser at han spiser 85 %. Etter seks uker har vekten stabilisert seg, og pleierne slipper å mase.
