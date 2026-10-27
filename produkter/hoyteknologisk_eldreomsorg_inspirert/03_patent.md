# 03 Patent – kjent teknikk, nyhet, kravutkast og FTO

> **Ikke juridisk rådgivning.** Dette er en teknisk førstevurdering basert på nettsøk 2026-10-27 (Google Patents, USPTO,
> EPO publiseringsserver, produktsider). Status for patentene er **ikke verifisert** i registrene (Patentstyret, EPO Register,
> USPTO PAIR). Før innlevering eller lansering må en patentfullmektig gjøre et ordentlig nyhets- og FTO-søk (≈ 40–80 kkr).

## Hva beskyttes?
Systemet «Stille vakt» har tre lag. Bare det første er klart patenterbart materiale:
1. **Kantmodul SV-1 + strimmel** (fysisk hjelpemiddel): batteri, klemfeste på sengeramme, rav gulvlys, lokal hendelsesdeteksjon.
2. **Tilsynslogikk** (programvare): behovsstyrt tilsyn med fail-safe tilbake til fast runde.
3. **Arbeidsmåte** (mimamori-team, MOBID-2 hver måned, kontakttid i turnus). Dette er ikke patenterbart. Det beskyttes med kompetanse, merkevare og avtaler.

## Kjent teknikk

| # | Patent / produkt | Nummer / lenke | Status (antatt) | Hva det dekker |
|---|---|---|---|---|
| KT1 | Paramount Bed: utgangsprediksjon med lastceller | [US8381336B2](https://patents.google.com/patent/US8381336) | Aktiv, US. ≈ 2028–30 | Tyngdepunkt fra lastceller i sengeben → varsel før utgang |
| KT2 | Utgangssensor, sittestilling fra trykksensor | [US9795321](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9795321) | Trolig aktiv, US | Trykksensor i seng finner sittestilling og varsler før utgang. **Nærmest vår deteksjon** |
| KT3 | Utgangsrisiko fra bevegelsesmønster, ML | [US11800993](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11800993) | Aktiv, US | Lastceller + modell for utgangsrisiko |
| KT4 | Select Comfort / SleepIQ | [US9931085](https://patents.google.com/patent/US9931085) | Aktiv, US | Tilstedeværelse, posisjon og bevegelse i madrass, prediksjon av utgang |
| KT5 | Sensor under madrass + basestasjon | [US2011/0156915](https://patents.justia.com/patent/20110156915) | Søknad, status ukjent | Matte under madrass, algoritme, varsel til pleier |
| KT6 | Hoana Medical | [US7656299B2](https://patents.google.com/patent/US7656299) | Trolig utløpt | I seng, ute av seng, forsøker å gå ut |
| KT7 | Hill-Rom, utgangsdeteksjon | [US6067019A](https://patents.google.com/patent/US6067019) | Utløpt | Lastceller i seng |
| KT8 | Paramount Bed, pasientdeteksjon (prioritet JP 2011) | [US12310905B2](https://patentsgazette.uspto.gov/week21/OG/html/1534-4/US12310905-20250527.html) | Aktiv, US. Mulig familie i EP/JP | Seng og metode for pasientdeteksjon |
| KT9 | Radar, personvernvennlig fallovervåking | [US11875659B2](https://patents.google.com/patent/US11875659) · [US11741813B2](https://patents.google.com/patent/US11741813) | Aktiv, US | Falldeteksjon med radar/punktsky. Relevant bare for SV-1R |
| KT10 | Hill-Rom pasientseng: bed-exit-modus «patient sits up», nattlys som lyser sterkere ved utgangshjelp | f.eks. [US10470955](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10470955) | Aktiv, US | Sitte-opp-modus i sengens egen elektronikk. Nattlys styres av knapp, ikke av sensor |
| KT11 | **Curbell Safe Mobility Light** (produkt) | [shop.cardinalhealth.ca](https://shop.cardinalhealth.ca/chc/safe-mobility-light) | På markedet | **Sensorpute under madrass tenner LED-lys under sengen** når pasienten går ut av sengen. Separat trådløs alarm. **Nærmeste kjente teknikk for lyset** |
| KT12 | «Mistake-proof monitoring method of bedridden care system» | [US2011/0037586](https://patents.justia.com/patent/20110037586) | Søknad, trolig bortfalt | Feilmelding til pleier hvis sensoren ikke rapporterer innen en tidsgrense |
| KT13 | System for overvåking av sengepasient | [US6078261A](https://patents.google.com/patent/US6078261) | Utløpt | Pute varsler pleierstasjon, fortsetter å alarmere til pasienten er tilbake |
| KT14 | Paramount Bed Nemuri SCAN (produkt) | [paramount.co.jp](https://www.paramount.co.jp/english/product/10/detail/80) | På markedet (JP) | BCG-strimmel under madrass: søvn, våken, sitter opp, ute av seng |
| KT15 | Acconeer radom-veiledning | [docs.acconeer.com](https://docs.acconeer.com/en/latest/hw_integration/a121/radome_and_mechanical_design.html) | Publisert | λ/2-vindu i plast for 60 GHz radar |

## Nyhetsanalyse (førsteprinsipper)

| Trekk | Beskrivelse | Kjent fra | Nytt? |
|---|---|---|---|
| F1 | Trykk-/BCG-strimmel under madrassen som finner «i seng, rolig / uro / sitter opp / ute» | KT2, KT4, KT5, KT14 | Nei |
| F2 | Batteridrevet modul med klemfeste på sengerammen, uten kabel på gulvet, med deteksjon i modulen og bare hendelser sendt | Trådløse sengealarmer finnes. Lokal prosessering er vanlig | Nei hver for seg |
| F3 | Gulvlys som tennes ved **sitte-opp** (før beboeren står), ikke ved utgang, med **rav ≤ 2200 K og 5–15 lux** | KT11 tenner ved utgang og nevner ikke spektrum. KT10 lyser opp ved knappetrykk | **Delvis nytt.** Kombinasjonen tidlig utløser + lav CCT + lav lux er ikke funnet. Kan vurderes som nærliggende (fagmann kombinerer KT11 + KT2) |
| F4 | Lyset og radioen drives fra samme batterimodul på rammen, og lysvinkelen er rettet mot gulvet ved sengekanten | KT11 har lyslister under sengen med egen strøm | Konstruktiv detalj, svak alene |
| F5 | **Fail-safe:** manglende heartbeat eller strimmelsignal flytter beboeren **automatisk** fra behovsstyrt tilsyn til en fast tilsynsliste (3 t) til feilen er rettet | KT12 gir bare feilmelding. KT13 alarmerer | **Nytt i kombinasjon**. Teknisk effekt: tilsynsfrekvensen blir aldri lavere enn ved fast runde selv om sensoren svikter. Risiko: kan bli sett som forretningsmetode i EPO (art. 52) hvis den ikke knyttes til teknisk utstyr |
| F6 | Radar i samme modul bak λ/2-vindu (SV-1R) | KT9, KT15 | Nei |

**Kombinasjon med teknisk effekt:** F1 + F2 + F3 + F5. Én batterimodul på rammen bruker samme sitte-opp-hendelse både til (a) å tenne svakt rav gulvlys
*før* beboeren står og (b) å avgjøre om tilsyn trengs. Den faller automatisk tilbake til fast tilsyn ved signaltap. Effekten er at rutinerunder kan
fjernes uten at noen beboer får lavere tilsyn enn før, og uten kabel eller kamera. Ingen enkelt kilde viser dette. Oppfinnelseshøyden er likevel **svak**.
Hvert trekk er kjent eller nærliggende, og en granskende fagperson vil sannsynligvis kombinere KT11 og KT2 og se F5 som administrativ.

## Utkast til krav

**Krav 1 (selvstendig).** System for nattlig tilsyn av en person i en seng, omfattende en sensorstrimmel anordnet under en madrass og en batteridrevet
kantmodul anordnet for å festes til sengens ramme, der kantmodulen omfatter en prosessor, en radio og en lyskilde rettet mot gulvet ved sengekanten,
**karakterisert ved at** prosessoren er innrettet til (i) å klassifisere signal fra sensorstrimmelen til minst tilstandene «i seng i ro» og «sitter opp»,
(ii) ved tilstanden «sitter opp» å tenne lyskilden med en korrelert fargetemperatur på høyst 2200 K før personen har forlatt sengen, og (iii) å sende
periodiske livstegnsmeldinger, slik at et mottakende system ved manglende livstegnsmelding innen en forhåndsbestemt tid overfører personen fra
behovsstyrt tilsyn til tilsyn med fast intervall.

**Uselvstendige krav**
2. System ifølge krav 1, der lyskilden gir 5–15 lux på en flate på minst 0,4 m² utenfor sengekanten og tennes og slukkes med en rampe på 1–2 s.
3. System ifølge krav 1 eller 2, der kantmodulen sender bare hendelser og ikke rå sensordata, og ikke omfatter kamera eller mikrofon.
4. System ifølge et av kravene 1–3, der kantmodulen omfatter en batteriluke i undersiden som bare kan åpnes med verktøy, og et klemfeste for rammer med 15–30 mm tykkelse.
5. System ifølge et av kravene 1–4, der terskelen for «sitter opp» settes slik at forventet antall falske varsler er høyst 0,14 per natt ut fra målt bakgrunnsrate av bevegelser.
6. System ifølge et av kravene 1–5, der kantmodulen i tillegg omfatter en 60 GHz radar bak et vindu av polymer med tykkelse λ₀/(2√εr) ± 10 %, og tilstanden «sitter opp» bestemmes av en fusjon av radar- og strimmelsignal.

**Sjekk mot kjent teknikk:**
| Rad | Treffer krav 1? |
|---|---|
| KT1, KT3, KT7 | Nei: lastceller, ingen lyskilde, ingen livstegn → fast runde |
| KT2, KT4, KT5, KT6 | Nei: sitte-opp/utgang fra matte er kjent, men ikke lys ≤ 2200 K ved sitte-opp og ikke fail-safe til fast intervall |
| KT8 | Nei (krav ikke lest i fulltekst, **må sjekkes**) |
| KT9, KT15 | Nei: bare relevant for krav 6 |
| KT10 | Nei: lyset styres av knapp, ikke av sitte-opp. Ingen fail-safe |
| KT11 | **Nærmest.** Lyset tennes ved utgang (ikke sitte-opp), uten CCT-grense og uten fail-safe. Treffer ikke krav 1 slik det står, men gjør trekk (ii) nærliggende |
| KT12, KT13 | Nei: varsler ved signaltap, men flytter ikke personen til fast tilsyn. Ingen lys |
| KT14 | Nei: Nemuri SCAN har ingen lyskilde i modulen (ikke funnet) |

## FTO-risiko (frihet til å operere)

| Patent | Kan treffe | Sannsynlighet | Mottiltak |
|---|---|---|---|
| US9795321 (KT2) | Sitte-opp fra trykksensor i seng → varsel | **Middels i USA, lav i Norge** (ingen EP-familie funnet, må sjekkes) | Sjekk familie i Espacenet. Norge/Norden først. Design rundt med «uro + vektforskyvning mot kant» i stedet for «sittestilling» hvis kravene er snevre |
| US12310905 / Paramount Bed-familien (KT8) | Pasientdeteksjon i seng | Lav–middels, ukjent EP-dekning | Les kravene. Paramount Bed er også mulig partner/lisensgiver |
| US9931085 (KT4) | Bevegelse og posisjon i madrass | Lav (forbrukerseng, luftkammer) | Vår strimmel bruker ikke luftkammer |
| Curbell (KT11), mulige patenter | Lys utløst av sengesensor | Ukjent | Søk Curbell som søker. Vårt lys utløses ved sitte-opp og har annet spektrum |
| US11875659 / US11741813 (KT9) | Radar-falldeteksjon (bare SV-1R) | Lav, US | SV-1R lanseres ikke før FTO er gjort. Vi detekterer ikke fall med radar, bare uro |

**Samlet FTO-risiko: lav i Norden, middels i USA.** USA er utenfor planen de første 3 årene.

## Anbefaling

| Valg | Kost | Tid | Vurdering |
|---|---|---|---|
| **Patentsøknad (NO prioritet → PCT)** på krav 1 | 80–150 kkr til PCT, 0,5–1 MNOK til nasjonale faser | 3–5 år | Svak oppfinnelseshøyde (KT11 + KT2). **Anbefales ikke nå** |
| Bruksmodell | – | – | **Finnes ikke i Norge.** Mulig i DE, FI og DK, men lite verdt for dette |
| **Designregistrering** av kantmodulen (NO + EU RCD) | ≈ 5–10 kkr | 1–3 mnd | Billig, hindrer kopier av utseendet. **Anbefales** |
| **Forretningshemmelighet:** terskel- og fusjonsalgoritme, kalibreringsdata, pilotdata | ≈ 0 kr (avtaler og tilgangsstyring) | – | **Anbefales.** Verdien ligger i data og arbeidsmåte |
| **Defensiv publisering** av fail-safe-logikken (F5) og arbeidsmåten | ≈ 5 kkr (artikkel eller ip.com) | 1 mnd | **Anbefales.** Hindrer at en konkurrent patenterer det vi trenger. Passer offentlig innkjøp, der kommunene liker åpne løsninger |
| Merkevare «Stille vakt» (ord og figur, NO/EU) | ≈ 10–20 kkr | 6–12 mnd | **Anbefales** |

**Anbefaling:** Designregistrering + varemerke + forretningshemmelighet for algoritme og data + defensiv publisering av fail-safe og arbeidsmåte.
Vurder ny patentsøknad først hvis piloten viser en ny, ikke-åpenbar teknisk effekt (f.eks. en tidlig uro-signatur som varsler minutter før utgang).
**Konfidens 70 %.** Det som trekker ned: patentstatus er ikke verifisert, kravene i KT2 og KT8 er ikke lest i fulltekst, og Curbell-patenter er ikke søkt.
