# KIMI 100 — selvstendige byggeoppdrag for Kimi K3.1 Pro

100 selvstendige byggeoppdrag, basert på prosjektene. Hver boks kan kopieres separat.

Kimi for iPhone og iPad. Kimi bekrefter utrulling av K3.1 Pro i mobilappen og tilgang til 3D Make. Tilgang og kvoter på din konto: sjekk hva appen viser.

Mobilversjon med kopier-knapp per boks: `kimi-100.html` (genereres fra denne filen med `python3 build.py`).

## 01 · VERK — fra rå tanke til dokumentert resultat

```
Bygg VERK som en fungerende mobiltilpasset nettprototype i én HTML-fil.
Den skal ta imot en rå idé og gjøre den til et oppdrag med konkret leveranse,
akseptansekriterium, neste handling og vedlagt resultat.
Bruk statusene OPPDRAG SKREVET, KODE STARTET, RESULTAT LEVERT og VERIFISERT.
VERIFISERT skal kreve registrert kontroll og bevis. Lag lokal lagring,
søk og JSON-eksport. Legg inn fem tydelig merkede eksempelprosjekter.
Kontroller at en oppgave uten bevis ikke kan bli VERIFISERT.
Lever komplett kode og faktisk kontrollstatus, ikke bare skjermbilder.
```

## 02 · FocusDump — tøm hodet og start

```
Bygg FocusDump: en mørk, mobiltilpasset app som tar imot en kaotisk tankedump
og hjelper meg velge én konkret handling jeg kan begynne på nå.
Lag innboks, manuell sortering, ett stort nå-kort og femminutters timer.
Timeren skal beregnes fra klokkeslett, slik at bakgrunnsfaner ikke ødelegger den.
Resten av oppgavene skal kunne skjules under arbeidsøkten.
Bruk HTML, CSS og JavaScript med lokal lagring og JSON-eksport.
Test tom input, svært lang tekst, avbrutt økt og gjenåpning.
Lever en brukbar prototype med eksempeldata.
```

## 03 · STRAFF/LØNN — gjennomføring uten selvbedrag

```
Bygg en nettprototype for selvvalgte arbeidsavtaler og belønninger.
Jeg skal kunne definere en arbeidsøkt, en målbar leveranse og en belønning.
Uferdig arbeid skal utløse ny planlegging eller tap av valgfrie poeng,
aldri økonomiske trekk, ydmykelse eller helseskadelige konsekvenser.
Lag 25-, 60- og 90-minutters økter, pauser, avbrudd og resultathistorikk.
Skill mellom tid brukt og faktisk leveranse. Vis begge separat.
Lever én mobiltilpasset HTML-fil med lokal lagring.
Kontroller at belønning krever dokumentert resultat, og at avbrudd kan registreres ærlig.
```

## 04 · Kapasitetsstyrt arbeidsdag

```
Bygg en dagsplanlegger der tilgjengelig kapasitet styrer arbeidsmengden.
Brukeren velger selv energi, konsentrasjon og tilgjengelige minutter.
Ingen helseverdier skal tolkes eller brukes til medisinske anbefalinger.
Hver oppgave får varighet, mental belastning, fysisk belastning og minste leveranse.
Vis en gjennomførbar dagsplan med synlig ledig margin.
La brukeren redusere kapasiteten midt på dagen og beregne planen på nytt.
Lever mobiltilpasset HTML med lokal lagring og eksempeldata.
Test at summen aldri overstiger tidsbudsjettet, og at kritiske oppgaver vises ved overbelastning.
```

## 05 · Inputmotor for tale, tekst og bilder

```
Bygg en lokal inputmotor for oppfinnerarbeid.
Ta imot tekst, bildefiler og lydfiler som separate innslag.
Behold originalfilen og la brukeren legge til egen transkripsjon eller beskrivelse.
Ikke påstå at lyd eller bilder er analysert dersom den funksjonen ikke finnes.
Hvert innslag skal kunne kobles til prosjekt, spørsmål, beslutning og neste handling.
Lag søk, duplikatvarsling og eksport med vedlegg.
Bruk en mobiltilpasset nettprototype med IndexedDB.
Test gjenåpning, store vedlegg og sletting av et prosjekt uten tap av andre prosjekter.
```

## 06 · Kontinuitetskort ved oppstart

```
Bygg et verktøy som gjør det mulig å fortsette et prosjekt uten å lese hele historikken.
Hvert prosjekt skal ha et kontinuitetskort med mål, siste dokumenterte resultat,
åpne problemer, neste konkrete handling og lenker til relevante filer.
Lag redigering, versjonshistorikk og eksport som Markdown og JSON.
Vis tydelig når kortet sist ble oppdatert, og hvilke opplysninger som mangler.
Bruk syntetiske eksempler fra appbygging og produktutvikling.
Lever komplett mobiltilpasset nettprototype.
Test at en eldre versjon kan gjenopprettes uten å slette den nyeste.
```

## 07 · Beslutningslogg med motbevis

```
Bygg en beslutningslogg for tekniske og kommersielle prosjekter.
Hver beslutning skal inneholde alternativer, begrunnelse, antakelser,
dokumentasjon, kostnad ved feil og hva som kan få meg til å endre mening.
Lag egne felt for observasjon, beregning og hypotese.
Legg til vurderingsdato og varsling inne i appen når en beslutning bør revurderes.
Ingen eksterne meldinger skal sendes.
Lever én HTML-fil med lokal lagring og eksport.
Test at en beslutning kan markeres som forkastet uten at historikken forsvinner.
```

## 08 · Prosjektparkering som faktisk virker

```
Bygg en parkeringsplass for prosjekter jeg ikke skal arbeide med nå.
Hvert prosjekt får en kort begrunnelse, gjenopptakelseskriterium,
siste tilstand, neste handling og nødvendig materiale.
Lag tre valg: FORTSETT, PARKER og AVSLUTT.
Vis en grense for samtidige aktive prosjekter som brukeren selv bestemmer.
Et parkert prosjekt skal ikke ligge i dagens oppgaveliste.
Lever en mobiltilpasset prototype med ti eksempelprosjekter og JSON-eksport.
Kontroller at flytting mellom statusene bevarer alle notater og vedleggshenvisninger.
```

## 09 · Arbeidsgraf for prosjektene mine

```
Bygg en interaktiv arbeidsgraf som viser hvordan prosjekter deler komponenter.
Bruk noder for prosjekter, kode, CAD-deler, datakilder, beslutninger og ferdige leveranser.
Brukeren skal kunne opprette forbindelser og se hva som påvirkes av en endring.
Lag både grafvisning og en enkel listevisning for mobil.
Marker foreldreløse komponenter og oppgaver med manglende avhengigheter.
Bruk tydelig merkede eksempeldata.
Lever fungerende nettprototype med import og eksport av JSON.
Test sletting av en node og vis konsekvensene før endringen gjennomføres.
```

## 10 · Mac-rydding med forhåndsvisning

```
Bygg et Python-verktøy for trygg kartlegging av en valgt mappe på Mac.
Det skal finne store filer, identiske filer via filhash og mulige prosjektkopier.
Standardmodus skal være skrivebeskyttet og produsere en lokal HTML-rapport.
Lag en separat handlingsplan med kilde, mål og begrunnelse for hver foreslått flytting.
Ingen filer skal slettes automatisk. Eventuell flytting skal kunne reverseres.
Test verktøyet på en midlertidig testmappe med duplikater og navnekollisjoner.
Lever kode, testdata, oppstartskommando og dokumentert resultat.
```

## 11 · Agentfabrikk — kjørbar oppdragsmotor

```
Bygg en liten agentmotor i Python med SQLite.
Et oppdrag skal ha input, forventet leveranse, tidsbudsjett, avhengigheter og kontroll.
Bruk deterministiske eksempelarbeidere slik at systemet kan kjøres uten API-nøkler.
Implementer kø, statusoverganger, feiling, nytt forsøk og resultatlagring.
Skill mellom planlagt arbeid og faktisk gjennomført arbeid.
Lag et mobiltilpasset kontrollpanel.
Test at et feilet oppdrag ikke godkjennes, og at samme oppdrag ikke kjøres dobbelt.
Lever komplett prosjekt og faktisk kjørerapport.
```

## 12 · Oppdragskø med avhengigheter

```
Bygg en oppdragskø der arbeid bare starter når nødvendige forgjengere er ferdige.
Bruk et lokalt Python-bibliotek og et enkelt nettgrensesnitt.
Lag avhengighetsgraf, prioritet, maksimal samtidighet og stopp av nye starter.
Oppdag sirkulære avhengigheter før kjøring.
Et ferdig oppdrag skal lagre resultat og kontroll, ikke bare et ferdigmerke.
Lag ti syntetiske oppdrag, inkludert en sirkel, en feil og en blokkert gren.
Lever kode og kjør en kontroll som viser korrekt startrekkefølge.
```

## 13 · Godkjenningsbord for agenthandlinger

```
Bygg et godkjenningsbord for handlinger som publisering, utsending og filendring.
Bruk bare simulerte handlinger i prototypen.
Hver forespørsel skal vise hva som endres, mottaker eller mål,
forventet kostnad, datagrunnlag og utløpstid.
Godkjenning skal være bundet til den konkrete handlingen.
Endres handlingen, skal gammel godkjenning bli ugyldig.
Lag mobilvisning med GODKJENN, AVVIS og BE OM ENDRING.
Test utløpt godkjenning, dobbeltklikk og endret innhold.
Lever kode og dokumenterte kontrollresultater.
```

## 14 · Bevisregister for agentresultater

```
Bygg et bevisregister som kobler hvert resultat til kilden og kontrollen bak det.
Støtt typer som fil, beregning, testkjøring, kildeutdrag og skjermbildehenvisning.
Hvert bevis får tidspunkt, opphav, filhash når tilgjengelig og hva det faktisk dokumenterer.
Et bevis skal ikke automatisk bevise mer enn det er registrert for.
Lag filtrering på prosjekt og manglende dokumentasjon.
Lever en lokal nettprototype med eksempeldata og eksport.
Test at endret filinnhold oppdages når filen kontrolleres på nytt.
```

## 15 · Budsjettvakt for lange kjøringer

```
Bygg en budsjettvakt for agentoppdrag.
Brukeren oppgir maksimalt tidsforbruk, maksimalt antall kall og maksimalt kronebudsjett.
Alle priser skal være brukerdefinerte antakelser, ikke hardkodede påstander om leverandører.
Lag en simulert kjøring med løpende kostnad, gjenstående ramme og stoppårsak.
Reserver estimert kostnad før et steg starter, og avstem etterpå.
Vis forskjellen mellom estimert og registrert forbruk.
Lever kode og mobiltilpasset kontrollpanel.
Test grenseoverskridelse, manglende pris og et steg som blir dyrere enn estimert.
```

## 16 · Gjenopptakelse etter avbrudd

```
Bygg et checkpointsystem for langvarige Python-oppdrag.
Hvert fullført steg skal lagre inputhash, resultat, status og nødvendig tilstand.
En avbrutt kjøring skal kunne fortsette fra siste gyldige checkpoint.
Oppdag at input eller kodeversjon har endret seg.
Da skal brukeren få velge mellom ny kjøring og eksplisitt gjenbruk.
Bruk en eksempeljobb som bearbeider en lokal datasamling.
Avbryt demonstrasjonen midtveis og gjenoppta den.
Lever kode, logg og bevis for at ferdige steg ikke ble kjørt på nytt.
```

## 17 · Overleveringspakke mellom verktøy

```
Bygg en generator for prosjektpakker som kan brukes i ulike kodeverktøy.
Pakken skal inneholde oppdrag, prosjektstatus, filoversikt, avhengigheter,
kjente feil, siste kontroll og én konkret neste handling.
Lag eksport som ZIP med Markdown og JSON.
Bevar skillet mellom opplysninger som er observert, utledet og antatt.
Ikke krev at mottakeren kjenner tidligere samtaler.
Lever en fungerende lokal prototype og en eksempelpakke.
Kontroller at pakken inneholder alt som trengs for å gjenoppta et lite demonstrasjonsprosjekt.
```

## 18 · Motprøvemotor

```
Bygg en motprøvemotor for digitale prototyper.
Brukeren registrerer en påstand som «importen tåler duplikater»
og knytter den til en konkret kontroll.
Lag kategorier for tom input, feil format, svært store verdier,
manglende felt, avbrudd og motstridende data.
Systemet skal lagre forventet og observert resultat separat.
Lever mobiltilpasset nettgrensesnitt og en Python-eksempelkobling.
Demonstrer fem kontroller mot en enkel CSV-importør.
En kontroll uten faktisk kjøring skal merkes IKKE KJØRT.
```

## 19 · Integrasjonsadapter uten falsk forbindelse

```
Bygg en adapterarkitektur for kalender, e-post og oppgaver.
Implementer først lokale demonstrasjonsadaptere med samme grensesnitt som fremtidige integrasjoner.
Ingen ekte kontoer skal kobles til.
Hver adapter skal oppgi hvilke operasjoner den støtter, siste vellykkede lesing
og om data er demonstrasjonsdata eller hentet fra en reell forbindelse.
Lag tydelige feil ved manglende tilgang.
Lever Python-kode, mobiltilpasset oversikt og tre eksempeladaptere.
Test at en simulert e-post aldri fremstilles som en faktisk sendt melding.
```

## 20 · Agentfabrikkens mobilkonsoll

```
Bygg en mobilkonsoll for å følge kode- og researchoppdrag.
Vis status, siste dokumenterte resultat, ventende spørsmål,
budsjett og hvor lenge dataene har vært uendret.
Bruk et lokalt demonstrasjonsdatasett og en avgrenset API-kontrakt.
Lag store knapper for pause, fortsett og avvis forespørsel.
Vis alltid om en kommando bare er simulert.
Lever komplett nettprototype med mørkt grensesnitt.
Test utdatert status, mistet forbindelse og gjentatt trykk på samme kommando.
```

## 21 · Parametrisk oppfinnerbenk

```
Bygg en oppfinnerbenk der jeg kan endre et produkts mål og se geometrien oppdateres.
Bruk et nytt, enkelt bordprodukt som eksempel: en modulær holder for småverktøy.
Lag parametere for bredde, høyde, antall rom, veggtykkelse og festetype.
Lever redigerbar CAD-kode, måltegning og en roterbar forhåndsvisning.
Bruk millimeter konsekvent.
Kontroller ugyldige mål og overlappende rom.
Eksporter en faktisk 3D-fil hvis verktøyene støtter det.
Oppgi hvilke geometritester som er kjørt.
```

## 22 · Telefonholder for seng og sofa

```
Utvikle en parametrisk telefonholder for bruk ved seng eller sofa.
Prioriter justerbar synsvinkel, enkel betjening og utskiftbar telefoninnsats.
Bruk fiktive telefonmål som synlige, redigerbare parametere.
Lag tre mekaniske konsepter og bygg det enkleste som CAD-modell.
Vis normalstilling, justert stilling og eksplodert sammenstilling.
Skill mellom geometrisk modell og dokumentert bæreevne.
Lever CAD-kode, deleliste og 3D-forhåndsvisning.
Lag en benkprøve for stabilitet med dødlast, uten å påstå at prototypen er godkjent.
```

## 23 · Åpner med lav håndkraft

```
Bygg et mekanisk konsept for å åpne vanlige skrulokk med redusert håndkraft.
Velg én lokkdiameter som demonstrasjon og gjør den parametrisk.
Sammenlign en lang arm, et båndgrep og en kamløsning.
Modeller den mest lovende varianten i CAD.
Lag en beregningsvisning for moment, arm og nødvendig kraft med tydelige antakelser.
Lever CAD-kode, roterbar modell og testplan med måleutstyr.
Kontroller enheter og geometri.
Ikke oppgi redusert kraft som målt før en fysisk prøve finnes.
```

## 24 · Utskiftbare produktmoduler

```
Utvikle et modulært kabinett for små elektronikkprototyper.
Lag separate moduler for strøm, sensor, bryter og tomt utviklingsrom.
Modulene skal kunne erstattes uten å redesigne hele kabinettet.
Bygg parametrisk CAD med festepunkter, kabelpassasje og tydelige grensesnittmål.
Vis sammenstilling og eksplodert visning.
Bruk eksempelkomponenter med eksplisitt antatte mål.
Lever CAD-kode, grensesnittabell og 3D-forhåndsvisning.
Kontroller kollisjoner mellom moduler i de konfigurasjonene du faktisk genererer.
```

## 25 · Snap-fit prøvebibliotek

```
Lag et parametrisk bibliotek med fem små snap-fit prøvestykker.
Varier armtykkelse, krokhøyde, inngrepsdybde og klaring.
Dette skal være testkuponger for materialprøver, ikke ferdige produktfester.
Merk hver prøve med lesbar ID i geometrien.
Lag en oversikt som kobler ID til parametere og plass for fysisk målt resultat.
Bruk CAD-kode som enkelt kan endres.
Lever modellene, oversikt og en 3D-forhåndsvisning.
Kontroller at merkingen ikke skjærer gjennom prøvestykkene.
```

## 26 · Toleransebenk for 3D-print

```
Bygg et sett toleranseprøver for 3D-printing.
Inkluder hull og tapper, skyvepassning, hengsel og lokk med flere klaringer.
Alle mål og klaringer skal være parametere.
Lag et mobiltilpasset registreringsskjema der brukeren senere kan skrive inn
printer, materiale, innstillinger og faktisk passform.
Ingen klaring skal presenteres som universelt riktig.
Lever CAD-kode, forhåndsvisning og skjema.
Test at prøve-ID-er og parameterverdier samsvarer mellom modell og registrering.
```

## 27 · Kabelsystem for arbeidsplassen

```
Utvikle et modulært kabelsystem for et lite verkstedbord.
Lag bordklips, kabelkam, etikettfeste og en avtakbar holder for ladekabel.
Bruk justerbare mål for bordtykkelse og kabeldiameter.
Bygg delene som parametriske CAD-modeller med avrundede kontaktflater.
Vis hvordan delene monteres og hvordan kabel kan tas ut.
Lag en material- og printorienteringshypotese.
Lever CAD-kode og separate 3D-modeller.
Kontroller geometriske kollisjoner og oppgi hvilke fysiske egenskaper som ikke er prøvd.
```

## 28 · Mekanismevelger med animasjon

```
Bygg et interaktivt mekanismebibliotek for produktutvikling.
Animer fire mekanismer: hengsel, kam, tannstang og fireleddet lenke.
La brukeren endre sentrale dimensjoner og se bevegelsen.
Vis bevegelsesområde, mulige kollisjoner og hva mekanismen kan brukes til.
Bruk geometriske beregninger, og merk forenklinger tydelig.
Ikke presenter animasjonen som en styrkeberegning.
Lever en mobiltilpasset nettprototype med redigerbare parametere.
Test ytterstillinger og ugyldige dimensjonskombinasjoner.
```

## 29 · Produkt i eksplodert visning

```
Bygg en interaktiv 3D-viser for et nytt demonstrasjonsprodukt:
en liten sensorboks med lokk, pakning, kort, batteriholder og skruer.
Lag en skyveknapp som flytter delene fra sammenstilt til eksplodert visning.
Trykk på en del skal vise navn, antatt materiale og funksjon.
Legg til isolering av enkeltdeler og tilbakestilling.
Lever geometrikilde og nettvisning.
Kontroller at alle deler har stabil ID, og at tilbakestilling gir korrekt opprinnelig plassering.
```

## 30 · Ergonomibenken

```
Bygg en visuell ergonomibenk for håndholdte produktkonsepter.
Lag en forenklet, parametrisk håndmodell og tre grep rundt et demonstrasjonsprodukt.
Alle kroppsmål skal være synlige antakelser som kan endres.
La brukeren sammenligne rekkevidde til knapper, grepstykkelse og plass til fingre.
Vis mulige geometriske klemsoner.
Ikke trekk kliniske eller generelle komfortkonklusjoner fra modellen.
Lever en interaktiv 3D-prototype og parameteroversikt.
Test små og store parameterverdier og dokumenter geometriske begrensninger.
```

## 31 · Superkalkulator for batteri og driftstid

```
Bygg en batterikalkulator for små elektronikkprodukter.
Ta inn spenning, kapasitet, brukbar andel, virkningsgrad og effekt per driftsmodus.
Beregn energibudsjett og driftstid for en brukerdefinert døgnprofil.
Vis alle formler, enheter og antakelser.
Lag følsomhetsanalyse for skjerm, radio, kamera og hvileforbruk.
Skill beregnet resultat fra fysisk målt driftstid.
Lever én mobiltilpasset HTML-fil med eksport.
Test mot håndregnede eksempler og avvis umulige prosenter, negative verdier og null effekt.
```

## 32 · Superkalkulator for varme

```
Bygg en termisk RC-kalkulator for et lite elektronikkabinett.
Bruk omgivelsestemperatur, effekttap, termisk motstand og varmekapasitet.
Vis temperaturutvikling over tid og stabil temperatur i den forenklede modellen.
La brukeren sammenligne to kabinettkonsepter og se effekten av redusert effekttap.
Oppgi modellens forutsetninger tydelig.
Ingen temperatur skal merkes som trygg for hudkontakt uten relevant dokumentasjon.
Lever en interaktiv HTML-fil med kurver.
Kontroller startverdi, langtidsgrense og grensetilfeller med null effekt.
```

## 33 · Superkalkulator for bjelker

```
Bygg en bjelkekalkulator for ett tydelig avgrenset tilfelle:
en konsollbjelke med punktlast i fri ende og lineært elastisk materiale.
Støtt rektangulært og sirkulært tverrsnitt.
Beregn andre arealmoment, maksimal bøyespenning og endenedbøyning.
Vis formler og enheter, og skill input fra beregnede størrelser.
Lever mobiltilpasset HTML med en enkel deformasjonstegning.
Kontroller resultatene mot to håndregnede tilfeller.
Marker at beregningen ikke dekker skjøter, utmatting eller full konstruksjonsgodkjenning.
```

## 34 · Superkalkulator for motor og gir

```
Bygg en kalkulator for motor, girutveksling og mekanisk last.
La brukeren oppgi turtall, moment, virkningsgrad, ønsket utgangshastighet og last.
Vis sammenhengen mellom effekt, turtall og moment.
Lag sammenligning av tre girutvekslinger og en graf for antatte belastningspunkter.
Eventuelle motorkurver skal være brukerdata eller tydelig syntetiske eksempler.
Lever én HTML-fil med CSV-import og eksport.
Test enhetskonvertering mellom rpm og radianer per sekund, samt null og negative input.
```

## 35 · Superkalkulator for luft og rotorer

```
Bygg en pedagogisk kalkulator for statisk rotorløft med ideal aktuatordiskmodell.
Ta inn lufttetthet, samlet rotorareal og ønsket løft.
Beregn ideal indusert effekt og vis brukerdefinerte tapsantakelser separat.
La brukeren sammenligne rotordiameter og antall rotorer.
Vis at modellen ikke erstatter målt propell- og motordata.
Hold demonstrasjonen til sivile måle- og naturprosjekter.
Lever interaktiv HTML med enhetskontroll.
Test dimensjonal konsistens og at større rotorareal reduserer ideal effekt ved samme løft.
```

## 36 · Vektbudsjett for AI-briller

```
Bygg en vekt- og plassbudsjettapp for et brillekonsept.
Registrer komponenter med masse, volum, plassering og antatt effektforbruk.
Vis total masse, venstre/høyre ubalanse og estimert tyngdepunkt.
Lag en enkel 3D-modell der komponentplassering kan endres.
Bruk syntetiske komponentverdier som er tydelig merket.
La brukeren importere egne leverandørdata senere.
Lever nettprototype med eksport av komponentliste og beregninger.
Test at endringer i masse og plassering oppdaterer alle summer konsekvent.
```

## 37 · Varme og batteri i brillestangen

```
Bygg en interaktiv systemmodell for én brillestang.
Del den i batteri, prosessor, radio, kamera og passiv struktur.
La brukeren endre plassering, driftsprofil og antatt termisk kobling.
Vis effektbudsjett, energibudsjett og en forenklet temperaturmodell.
Skill tydelig mellom geometrisk plass, beregnet oppvarming og faktisk måling.
Ikke oppgi brukstid eller komfort som dokumentert.
Lever en mobiltilpasset prototype med roterbar modell og grafer.
Kontroller energisummer og demonstrer en situasjon der varme begrenser driften før batteriet.
```

## 38 · Strømforsyning og spenningsfall

```
Bygg en kalkulator for strømfordeling i et lavspenningsprodukt.
Ta inn forsyning, laststrøm, ledningslengde, ledertverrsnitt og resistivitet.
Beregn spenningsfall og effekttap med synlige enheter.
Lag flere lastgrener og vis samlet strøm samt tap per gren.
Alle materialverdier skal kunne redigeres og ha kilde eller antakelsesmerking.
Avgrens verktøyet til lavspenningsprototyper.
Lever HTML med diagram og CSV-eksport.
Test at doblet ledningslengde gir doblet motstand ved ellers like forhold.
```

## 39 · Sensorforsinkelse og datatap

```
Bygg en simulator for en sensorkjede fra måling til visning.
La brukeren angi samplingsfrekvens, bufferstørrelse, nettverksforsinkelse og pakketap.
Vis faktisk dataalder, oppdateringsrate og hvor mange målinger som mangler.
Bruk deterministisk tilfeldig frø, slik at samme scenario kan gjentas.
Skill interpolerte verdier fra mottatte målinger.
Lag en tydelig indikator for utdatert informasjon.
Lever mobiltilpasset HTML med avspilling og eksport.
Test null pakketap, total forbindelse bortfalt og svært langsom mottaker.
```

## 40 · Usikkerhetskalkulator for oppfinnelser

```
Bygg et verktøy som viser hvordan usikre input påvirker et teknisk resultat.
Bruk batteridriftstid som første eksempel og la brukeren velge intervaller
for kapasitet, effekt og virkningsgrad.
Implementer Monte Carlo-simulering med fast tilfeldig frø.
Vis fordeling, median, valgte percentiler og hvilke input som påvirker mest.
Ikke gjør antatte fordelinger om til målte sannsynligheter.
Lever interaktiv HTML med eksport av scenario og resultater.
Kontroller mot et tilfelle der alle input er faste og resultatet derfor har null spredning.
```

## 41 · NaturFlyr — biomimetisk formbibliotek

```
Bygg et parametrisk 3D-bibliotek med fem naturinspirerte vingeformer.
Bruk abstrakte trekk fra blad, fuglevinge, insektvinge, frø og finne.
Lag formene som geometriske konsepter for sivile måleprosjekter.
La brukeren endre spenn, areal, avsmalning og vridning.
Vis målbare geometriske egenskaper.
Ikke ranger aerodynamisk ytelse uten beregning eller måling.
Lever CAD- eller mesh-genereringskode og en sammenlignbar 3D-visning.
Kontroller areal, symmetri der det er valgt, og ugyldige parameterkombinasjoner.
```

## 42 · Flaksevinge som mekanisk demonstrator

```
Bygg en animert flaksevingemekanisme for undervisning og produktutforskning.
Modeller motoraksel, veiv, lenker og vingeledd.
La brukeren endre veivradius, lenkelengde og frekvens.
Vis vingevinkel over tid og mekanismens ytterstillinger.
Marker geometriske kollisjoner og singulariteter.
Ikke påstå at mekanismen kan fly eller har dokumentert løft.
Lever redigerbar geometri og en interaktiv animasjon.
Test én gyldig og to ugyldige lenkekombinasjoner og vis hvorfor de feiler.
```

## 43 · Ti rotorformer i samme prøveoppsett

```
Lag ti parametriske rotorformkonsepter som kan sammenlignes geometrisk.
Hold diameter og materialvolum omtrent sammenlignbart, og varier ett tydelig formtrekk om gangen.
Avgrens til geometrisk forskning for sivile småplattformer.
Vis bladantall, avsmalning, vridningsprofil og beregnet geometrisk volum.
Merk alle ytelsesantakelser som hypoteser.
Ikke lever påstander om bedre effektivitet uten relevante data.
Lever separate modeller, genereringskode og en felles 3D-gallerioversikt.
Kontroller konsistente mål og dokumenter forskjellene mellom variantene.
```

## 44 · Virtuell vindtunnel med ærlig datagrunnlag

```
Bygg en visualisering for sammenligning av luftstrømsdata rundt to former.
Støtt import av CSV med posisjon, hastighet og trykk.
Legg inn et tydelig syntetisk demonstrasjonsdatasett.
Vis strømningspiler, fargeskala og valgte snitt.
Bruk samme skala for begge former.
Ikke kall visualiseringen CFD med mindre en faktisk solver er kjørt og dokumentert.
Lever en interaktiv nettprototype.
Test manglende datapunkter, ulik oppløsning og ugyldige enheter.
```

## 45 · 6DOF-laboratorium

```
Bygg en pedagogisk simulator for en stiv kropp med seks frihetsgrader.
Implementer tyngdekraft, brukerdefinerte krefter og momenter,
orientering og tidsintegrasjon med dokumenterte konvensjoner.
Lag 3D-visning og grafer for posisjon, hastighet og orientering.
Bruk et generisk sivilt målelegeme, uten autonom navigasjon eller våpenfunksjoner.
Vis tidssteg og numeriske begrensninger.
Lever kode og demonstrasjon.
Kontroller fri bevegelse uten krefter, fritt fall og rotasjon med kjent enkeltmoment.
```

## 46 · Parametersøk for lettvektsplattform

```
Bygg et verktøy som søker gjennom minst 10 000 kombinasjoner av en enkel plattform.
Varier strukturmasse, batterimasse, sensorlast og antatt effektforbruk.
La brukeren sette en total massegrense, eksempelvis 200 gram.
Vis gyldige kombinasjoner og Paretofront for antatt driftstid, masse og nyttelast.
Alle komponentdata skal være syntetiske eller kildebelagte.
Resultatet skal være et beregningsverktøy, ikke en flygodkjenning.
Lever kjørbar kode, nettvisning og CSV-eksport.
Test at ingen ugyldige kombinasjoner slipper gjennom filtreringen.
```

## 47 · Sensorbenk for NaturFlyr

```
Bygg en lokal analysebenk for sensordata fra et sivilt naturmåleprosjekt.
Importer CSV med tidspunkt, temperatur, trykk og valgfri posisjon.
Oppdag manglende intervaller, duplikater, klokkehopp og verdier utenfor brukerdefinerte grenser.
Vis originaldata og flagg, uten å overskrive målingene.
La brukeren eksportere både urørt datasett og dokumentert renset kopi.
Bruk syntetiske eksempeldata med innlagte feil.
Lever kode og mobiltilpasset rapport.
Kontroller at alle kjente feil blir funnet, og tell eventuelle falske flagg.
```

## 48 · Vibrasjonsbenk for små mekanismer

```
Bygg et analyseverktøy for akselerometerdata fra en mekanisk benkprøve.
Importer tidsserie og samplingsfrekvens.
Vis tidsdomene, frekvensspektrum og markerte frekvenstopper.
Dokumenter vindusfunksjon, frekvensoppløsning og begrensninger.
Lag et syntetisk signal med to kjente frekvenser og støy.
Ikke diagnostiser konkrete mekaniske feil uten dokumentasjon.
Lever kode og interaktiv rapport.
Kontroller at de kjente frekvensene gjenfinnes innenfor den beregnede oppløsningen.
```

## 49 · Dekningsplan for sivile inspeksjoner

```
Bygg en planleggingsdemo for fotografering av et avgrenset, fiktivt område.
Brukeren tegner et polygon og velger ønsket bildeoverlapp og kamerafotavtrykk.
Beregn en geometrisk rute og vis antatt dekning.
Dette skal være en skrivebordsmodell, uten tilkobling til flyutstyr.
Vis hinderområder som brukeren legger inn manuelt.
Skill geometrisk dekning fra faktisk bildekvalitet og tillatelser.
Lever mobiltilpasset kartlignende nettvisning.
Test konkave områder, hull og ruter som berører sperrede soner.
```

## 50 · Vedlikeholdslogg for prototyper

```
Bygg en vedlikeholdslogg for små sivile måleplattformer og benkprototyper.
Registrer deler, serienummer, driftstid, reparasjoner og versjoner.
La hver fysisk enhet ha sin egen historikk.
Vis hvilke resultater som ble samlet inn før og etter en komponentendring.
Lag påminnelser basert på brukerdefinerte intervaller.
Ikke hardkod udokumenterte servicegrenser.
Lever mobiltilpasset nettprototype med lokal lagring og eksport.
Test delbytte, tilbakestilt driftsteller og import av overlappende logger.
```

## 51 · Omsorgsbamse — interaktiv produktmodell

```
Bygg en interaktiv produktmodell av en 58 cm omsorgsbamse.
Vis utskiftbare moduler for høyttaler, bryter, strøm og valgfri sensor.
Lag en 3D-visning med avtakbart tekstiltrekk og separate elektronikkrom.
Bygg også en demonstrasjon av grensesnittet for påminnelser og bekreftelser.
Bruk kun syntetiske hendelser.
Skill tydelig mellom produktidé, fungerende elektronikk og klinisk dokumentasjon.
Lever 3D-kilde, moduloversikt og mobiltilpasset demonstrasjon.
Kontroller tilkomst til modulene uten å demontere hele produktet.
```

## 52 · Medisinoverlevering uten doseberegning

```
Bygg en lokal prototype for dokumentasjon av medisinoverleveringer.
Bruk manuelt registrerte, fiktive planer med tidspunkt og ansvarlig.
Ingen dosering, preparatvalg eller endring av behandling skal beregnes.
Skill PLANLAGT, BEKREFTET, IKKE BEKREFTET og UKJENT.
En påminnelse skal aldri telle som bekreftet inntak.
Lag korrigering med bevart historikk og eksport til en lesbar oversikt.
Lever mobiltilpasset HTML med syntetiske eksempeldata.
Test dobbeltregistrering, glemt bekreftelse, feil tidspunkt og retting av en tidligere registrering.
```

## 53 · STILLHET LAB — test falske alarmer

```
Bygg en simulator for et omsorgskonsept som reagerer på uvanlig stillhet.
Bruk syntetiske bevegelses- og strømhendelser fra en fiktiv bolig.
La brukeren justere tidsvinduer og avviksterskler.
Vis hvilke hendelser som utløser varsel, og hvorfor.
Sammenlign varsler med en separat fasit for demonstrasjonen.
Beregn falske positive, falske negative og forsinkelse.
Lever en interaktiv nettprototype og datasett.
Ikke presenter stillhet som bevis for fall eller sykdom.
Vis tydelig hva systemet ikke kan avgjøre.
```

## 54 · Hverdagsstøtte med selvvalgte mål

```
Bygg en enkel hverdagsstøtteapp med påminnelser for drikke, måltid og sosial kontakt.
Alle mål og tidspunkt skal bestemmes av brukeren.
Appen skal ikke beregne medisinske behov eller anbefalt væskemengde.
Lag store betjeningsflater, utsett, bekreft og retting.
Vis hva som er registrert, og hva som bare er planlagt.
Lagre lokalt og tilby enkel eksport.
Lever en mobiltilpasset prototype.
Test at ubesvarte påminnelser står som ubekreftet, og at registrering kan angres.
```

## 55 · Omsorgsoverlevering mellom personer

```
Bygg en prototype for overlevering mellom to omsorgspersoner.
Bruk en fiktiv person og syntetiske opplysninger.
Vis siste bekreftede hendelser, åpne spørsmål og hvem som har ansvar videre.
Mottaker skal bekrefte at overleveringen er lest.
En endring etter bekreftelse skal markeres som ny informasjon.
Ingen meldinger eller personopplysninger skal sendes eksternt i demonstrasjonen.
Lever mobiltilpasset nettprototype med to simulerte roller.
Test at lest-status ikke arves når innholdet endres.
```

## 56 · Family Memory — kildebasert familiearkiv

```
Bygg et familiearkiv med bilder, lydhenvisninger, tekst og personrelasjoner.
Bruk kun en oppdiktet familie i demonstrasjonen.
Hver opplysning skal vise hvilken kilde den kommer fra og hvem som registrerte den.
Lag tidslinje, søk og kobling mellom personer og hendelser.
Skill kildeopplysning, tolkning og ukjent dato.
Gi kontroll over sletting og eksport.
Lever mobiltilpasset nettprototype med lokalt datasett.
Test motstridende datoer og to personer med samme navn uten automatisk sammenslåing.
```

## 57 · Etterliv — minner uten oppdiktet fasit

```
Bygg et minneverktøy for sorg og familiehistorie.
La brukeren samle faktiske sitater, bilder, brev og egne refleksjoner.
Materiale skal vises med opphav og dato når det finnes.
Lag en rolig visning som utforsker forbindelser mellom minner.
Eventuelle foreslåtte forbindelser skal merkes som tolkninger.
Ikke simuler at en avdød person snakker eller har nye meninger.
Bruk oppdiktede demonstrasjonsdata.
Lever en fungerende nettprototype med eksport og sletting.
Test at kilde og tolkning aldri blandes i samme umerkede felt.
```

## 58 · Small Wins Lab — fysisk modulsett

```
Utvikle et fysisk modulsett for små, tydelig avgrensede mestringsoppgaver.
Lag store geometriske deler som kan sorteres, kobles og bygges i stigende vanskelighet.
Bruk tre konkrete oppgaver med synlig ferdigtilstand.
Modeller delene parametrisk i CAD og lag en digital demonstrasjon.
Ikke påstå behandlingsvirkning eller egnethet for en bestemt alder uten vurdering.
Lag en liste over nødvendige material- og produktsikkerhetsavklaringer.
Lever CAD-kode, 3D-visning og en benkprøve som kan gjennomføres uten barn.
```

## 59 · Small Wins — observerbar fremgang

```
Bygg en registreringsapp for utprøving av fysiske læringsoppgaver.
Registrer oppgave, antall forsøk, nødvendig hjelp, fullføring og egenvurdering.
Bruk syntetiske deltakere i demonstrasjonen.
Vis endringer over tid uten å gjøre dem om til diagnose eller behandlingspåstand.
La brukeren se forskjellen mellom raskere utførelse og mindre behov for hjelp.
Lag eksport med pseudonyme ID-er.
Lever mobiltilpasset nettprototype.
Test manglende økter og endret oppgavevanskelighet, slik at fremgang ikke fremstilles misvisende.
```

## 60 · Fødestol — mekanisk forskningsmodell

```
Bygg en parametrisk konseptmodell av en justerbar fødestol for mekanisk forskning.
Vis sete, rygg, benstøtter, håndtak og tilgjengelig plass for personell.
Lag tre stillinger og en eksplodert visning.
Bruk tydelig antatte mål og en forenklet kroppssilhuett.
Skill bevegelsesgeometri fra lastkapasitet, klinisk nytte og produktsikkerhet.
Lag en benkprøve med dødlast og liste over videre faglige avklaringer.
Lever redigerbar CAD-kode, 3D-visning og måloversikt.
Ingen bruk på mennesker inngår i leveransen.
```

## 61 · Kvinnehelse — evidensverksted

```
Bygg et evidensverksted for forskning på kvinnehelse.
Hver studie skal ha spørsmål, studiedesign, utvalg, resultatmål,
effektanslag, usikkerhet, begrensninger og direkte kilde.
Start med et tydelig syntetisk datasett dersom ekte artikler ikke er tilgjengelige.
Ikke fyll inn oppdiktede referanser.
Lag filtrering og sammenligning av studier som faktisk måler samme utfall.
Lever en mobiltilpasset nettprototype med CSV-import og eksport.
Test at ulike utfall og oppfølgingstider ikke slås sammen til én umerket effekt.
```

## 62 · Symptomlogg med eksport

```
Bygg en lokal symptomlogg for egenregistrering over tid.
Brukeren velger selv symptomer, intensitetsskala og valgfrie kontekstfelt.
Appen skal ikke stille diagnose eller foreslå behandling.
Vis tidslinje, manglende registreringer og brukerens egne notater.
Lag eksport til CSV og en utskriftsvennlig oppsummering.
Bruk fiktive data i demonstrasjonen.
Lever komplett mobiltilpasset prototype.
Test at manglende data ikke tolkes som symptomfrihet,
og at endret skala ikke blandes med den gamle uten merking.
```

## 63 · Sammenlign fødeutstyr med kilder

```
Bygg et sammenligningsverktøy for fødesenger og fødestoler.
Støtt import av produsentdata og manuell registrering av kilde, dato og måleenhet.
Vis justeringsområder, plassbehov, rengjøringstilgang og tilbehør.
Ukjente spesifikasjoner skal forbli ukjente.
Ikke utled klinisk kvalitet fra antall funksjoner.
Bruk syntetiske produkter dersom faktiske dokumenter ikke er tilgjengelige.
Lever mobiltilpasset prototype med sammenligning side ved side.
Test ulike enheter og motstridende spesifikasjoner fra to kilder.
```

## 64 · Syklus og hverdag uten spådommer

```
Bygg en lokal logg som lar brukeren sammenholde selvregistrert syklus,
energi, smerte, søvn og daglige aktiviteter.
Vis observasjoner og datoer uten å beregne fertilitet eller gi medisinske råd.
Lag valgfri registrering og synlige hull i datagrunnlaget.
Vis gjentakelser som utforskbare mønstre, ikke som dokumentert årsak.
Bruk syntetiske eksempeldata.
Lever mobiltilpasset HTML med eksport og full sletting.
Test uregelmessige intervaller og at enkeltobservasjoner ikke blir fremstilt som et stabilt mønster.
```

## 65 · Konsultasjonsforbereder

```
Bygg et verktøy som hjelper en bruker samle spørsmål og dokumentasjon før en konsultasjon.
Lag felt for viktigste problem, tidslinje, egne observasjoner,
spørsmål, vedleggshenvisninger og hva brukeren ønsker avklart.
Verktøyet skal organisere input, ikke diagnostisere eller endre medisiner.
Lag en kort utskriftsvennlig side med tydelig skille mellom fakta og spørsmål.
Bruk bare oppdiktede opplysninger i demonstrasjonen.
Lever mobiltilpasset nettprototype.
Test at originaltekst bevares, og at tomme felt ikke fylles med oppdiktede opplysninger.
```

## 66 · Rengjørbarhet som geometrisk test

```
Bygg en CAD-basert demonstrator for rengjøringstilgang i et produktkabinett.
Lag to varianter av samme enkle hus med ulike skjøter, hjørner og avtakbare deler.
Vis områder som er vanskelige å nå med en brukerdefinert rengjøringsgeometri.
Dette skal være en geometrisk sammenligning, ikke en hygienegodkjenning.
Lag sporbare antakelser og forslag til fysisk benkprøve.
Bruk ikke udokumenterte standardkrav.
Lever CAD-kode, 3D-visning og sammenligningsskjema.
Dokumenter hva kontrollen faktisk undersøker.
```

## 67 · Helseadministrativ hendelseslogg

```
Bygg en hendelseslogg for å organisere kontakt med helsetjenester.
Registrer dato, kanal, kontaktperson, hva som ble meldt,
hva som ble bekreftet og tilhørende dokumenthenvisning.
Lag en tidslinje og en eksport som skiller brukerens erindring fra dokumentert innhold.
Ingen journaltilgang eller eksterne meldinger skal simuleres som ekte.
Bruk syntetiske hendelser.
Lever mobiltilpasset nettprototype.
Test motstridende datoer, manglende svar og retting av en hendelse med bevart historikk.
```

## 68 · Forskningsfunn uten falsk presisjon

```
Bygg en visuell kalkulator for å forstå forskningsresultater.
La brukeren legge inn absolutte tall, andeler og oppfølgingstid fra en studie.
Vis forskjellen mellom absolutt og relativ endring når beregningen er relevant.
Hver figur skal vise nevner, datakilde og brukerregistrerte begrensninger.
Ikke tolke resultatet som personlig behandlingsråd.
Bruk håndregnede, syntetiske eksempler.
Lever interaktiv HTML.
Test små utvalg, null hendelser og manglende kontrollgruppe.
Avvis beregninger som krever opplysninger brukeren ikke har gitt.
```

## 69 · Samtykke og deling av familieopplysninger

```
Bygg en demonstrasjon av tilgangsstyring for et privat familiearkiv.
Lag syntetiske personer, dokumenter og roller med ulike delingsvalg.
Vis hvem som kan lese, laste ned, endre og dele videre.
Implementer opphør av tilgang i demonstrasjonsmotoren.
Vis at en allerede nedlastet fil ikke kan hentes tilbake av appen.
Ikke kall prototypen produksjonssikker.
Lever kjørbar kode og et mobiltilpasset grensesnitt.
Test at en bruker uten rettighet faktisk blir nektet i tilgangslogikken.
```

## 70 · Lydminner med sporbar transkripsjon

```
Bygg en lokal visning for lydminner og tilhørende transkripsjoner.
Bruk en syntetisk transkripsjon og en demonstrasjonslydfil.
Koble tekstsegmenter til tidsstempler slik at brukeren kan hoppe til riktig sted.
La rettinger lagres som en egen versjon.
Skill mellom automatisk transkripsjon, menneskelig retting og usikkert ord.
Ikke påstå at lyd er transkribert dersom bare eksempeltekst er brukt.
Lever nettprototype med eksport.
Test tidsstempler utenfor lydens lengde og overlappende segmenter.
```

## 71 · SMB-produktvelger for tjenestepakker

```
Bygg en konfigurator for tre konkrete tjenester til småbedrifter:
dokumentflyt, kundesaksortering og intern kunnskapssøk.
Hver pakke skal vise kundens input, leveranse, avgrensning,
implementeringstid, løpende kostnad og hvordan resultatet skal måles.
Bruk redigerbare prisantakelser og syntetiske eksempler.
La brukeren velge pakke etter problem og tilgjengelige data.
Lever mobiltilpasset nettprototype med eksport av en konkret leveransebeskrivelse.
Kontroller at valg av tilleggsfunksjoner oppdaterer kostnad og omfang.
```

## 72 · Verdikalkulator som tåler motregning

```
Bygg en verdikalkulator for automatisering i en liten bedrift.
Ta inn oppgavevolum, tidsbruk før og etter, kontrolltid,
implementeringskostnad, driftskostnad og brukerdefinert timeverdi.
Vis netto spart tid, kostnad og enkel tilbakebetalingstid.
Skill kapasitet frigjort fra faktiske kontantbesparelser.
Vis et pessimistisk, forventet og optimistisk scenario uten å presentere dem som prognoser.
Lever mobiltilpasset HTML med synlige formler.
Test et tilfelle der automatiseringen samlet sett koster mer enn den sparer.
```

## 73 · Kravmatcher for tilbud

```
Bygg en lokal kravmatcher for tilbudsarbeid.
Importer et kravsett og et utkast til svar som tekst eller CSV.
La brukeren koble hvert krav til et konkret svar, vedlegg eller manglende punkt.
Vis obligatoriske krav, usikker dekning og dokumentasjon som mangler.
Ingen tilbud skal sendes inn.
Bruk syntetiske krav i demonstrasjonen.
Lever mobiltilpasset nettprototype og en eksport med krav-ID og kildehenvisning.
Test at et krav uten koblet bevis ikke blir merket som dokumentert oppfylt.
```

## 74 · Tilbudsgrense som hindrer gratisarbeid

```
Bygg et verktøy for å avgrense et kundeoppdrag før tilbudet godtas.
Registrer leveranser, antakelser, kundens ansvar, revisjonsrunder og akseptanse.
Vis hvilke tillegg som endrer pris eller tidsbruk.
Lag en endringslogg og en sammenligning mellom opprinnelig og nytt omfang.
Bruk generiske formuleringer, ikke påstå juridisk gyldighet.
Ingen avtaler skal sendes eller signeres.
Lever mobiltilpasset prototype med eksport.
Test at nye krav etter godkjenning ikke legges inn som om de var avtalt fra starten.
```

## 75 · Prototypekostnad fra del til ferdig enhet

```
Bygg en kostnadskalkulator for fysiske prototyper.
Ta inn deler, antall, svinn, monteringstid, verktøy,
frakt og brukerdefinerte avgifter som separate poster.
Vis stykkpris ved 1, 10, 100 og 1000 enheter med tydelige antakelser.
Ikke anta at alle kostnader skalerer lineært.
Lag følsomhetsvisning for de tre største kostnadsdriverne.
Lever HTML med CSV-import og eksport.
Test faste kostnader, minstekjøp og feil der samme fraktpost ellers ville blitt telt to ganger.
```

## 76 · Flaskehalskart for en liten bedrift

```
Bygg et interaktivt kart over én arbeidsflyt i en liten bedrift.
La brukeren registrere steg, behandlingstid, ventetid, kapasitet og feilandel.
Vis hvor køen vokser og hvilke forbedringer som bare flytter flaskehalsen.
Bruk en syntetisk kundesaksflyt som eksempel.
Implementer en enkel, dokumentert køsimulering med fast tilfeldig frø.
Skill simulerte resultater fra målte bedriftsdata.
Lever nettprototype med scenariesammenligning.
Kontroller at økt kapasitet i et ikke-begrensende steg ikke automatisk gir større total kapasitet.
```

## 77 · 12 måneder til ARR-mål — regnemotor

```
Bygg en scenariomotor for et abonnementsbasert selskap.
Ta inn startkunder, nye kunder, frafall, pris,
variable kostnader og faste kostnader per måned.
Vis MRR, ARR, inntekter, kostnader og likviditet separat.
La brukeren teste hva som matematisk kreves for et ARR-mål på én million dollar.
Valutakurs skal være brukerinput eller datert kilde.
Lever interaktiv HTML med synlige formler.
Test at ARR ikke forveksles med årets innbetalte omsetning, og at frafall beregnes konsekvent.
```

## 78 · Handelsagent som kun handler på papir

```
Bygg en papirsimulator for en handelsagent med forhåndsdefinerte regler.
Bruk historiske data brukeren laster opp eller tydelig syntetiske kurser.
Ingen meglerkobling eller ekte ordre skal finnes.
Implementer posisjonsgrenser, kostnader, glidning, stopprekriterium og beslutningslogg.
Skill signal, ordre, fylling og resultat.
Vis både gevinster og tap.
Lever kode og interaktiv rapport.
Test at fremtidige priser ikke brukes i signalene,
og at resultat uten kostnader ikke presenteres som nettoresultat.
```

## 79 · Polymarket-lignende sannsynlighetsbenk

```
Bygg en papirsimulator for binære prediksjonsmarkeder.
Bruk syntetiske markeder med pris, egen sannsynlighetsvurdering,
likviditet, gebyr og eksplisitte oppgjørsregler.
Vis forventningsverdi, maksimal innsats og brukerdefinert samlet risikogrense.
En eventuell Kelly-beregning skal være transparent og kunne nedskaleres.
Ingen konto, betaling eller ekte ordre skal kobles til.
Lever mobiltilpasset HTML.
Test uklart oppgjør, korrelerte markeder og situasjoner der foreslått innsats må bli null.
```

## 80 · Byggesak — tidslinje og beviskart

```
Bygg et lokalt verktøy for å organisere en langvarig byggesak.
Registrer vedtak, brev, møter, bilder, frister og påstander med dokumenthenvisninger.
Bruk en fullstendig oppdiktet sak som demonstrasjon.
Skill dokumentert hendelse, partens påstand og ubesvart spørsmål.
Lag tidslinje, personsøk og oversikt over mulige mangler i dokumentasjonen.
Ikke beregn juridiske frister uten kontrollert regelgrunnlag.
Lever mobiltilpasset prototype med eksport.
Test motstridende dokumentdatoer og korrigering av feilregistrerte hendelser.
```

## 81 · Feilkatalog for 40 produkter

```
Bygg en produktfeilkatalog for oppfinnerarbeid.
Hvert produkt skal ha observert problem, brukergruppe,
årsaksantakelse, eksisterende løsning og mulig forbedringsmekanisme.
Lag plass til foto, skisse, kilde og fysisk måling.
Skill dokumenterte feil fra egne hypoteser.
Start med ti tydelig syntetiske eksempler og støtte for minst 40 produkter.
Lever mobiltilpasset nettprototype med søk og eksport.
Test at en hypotese ikke blir til en dokumentert feil bare fordi den får høy prioritet.
```

## 82 · Patentkrav som visuelt kart

```
Bygg et verktøy som gjør patentkrav lettere å analysere.
La brukeren lime inn et faktisk krav og manuelt dele det i tekniske elementer.
Vis avhengige krav, element-ID-er og tilhørende dokumentutdrag.
Bevar original ordlyd og dokumentnummer.
Ikke konkluder med patenterbarhet eller frihet til å operere.
Bruk et tydelig oppdiktet krav hvis et ekte dokument ikke er tilgjengelig.
Lever interaktiv nettprototype med eksport.
Test at redigert tolkning ikke overskriver originalkravet.
```

## 83 · Prior-art sammenligner

```
Bygg en sammenligner for et produktkonsept og inntil fem tidligere løsninger.
Hver rad skal være et teknisk trekk med kildeutdrag, dokumentnummer og dato.
Brukeren markerer likhet, forskjell og uavklart.
Lag en visning som viser hvilke påståtte forskjeller som faktisk er dokumentert.
Ikke gjør forskjell til automatisk nyhet eller patentmulighet.
Bruk syntetiske dokumenter som standard.
Lever mobiltilpasset prototype.
Test at en tom kilde ikke kan stå som dokumentert støtte for en forskjell.
```

## 84 · Deleliste med kildespor

```
Bygg en delelistegenerator for oppfinnerprototyper.
Hver komponent skal ha funksjon, antall, mål, pris,
leverandørhenvisning, dato og status som antatt eller kontrollert.
La samme komponent gjenbrukes i flere produktvarianter.
Vis ukjente priser separat fra null kroner.
Lag eksport til CSV og en enkel innkjøpsoversikt uten bestilling.
Lever en nettprototype med eksempeldata.
Test valutaer, alternative deler og komponenter som ikke lenger har gyldig kilde.
```

## 85 · Ett produkt om gangen — forsøksmotor

```
Bygg en forsøksmotor for sekvensiell produktutvikling.
Hvert produkt skal gå gjennom problem, hypotese, prototype,
benkprøve, resultat og beslutning.
Neste produkt skal ikke aktiveres før nåværende produkt er videreført,
parkert eller avsluttet med begrunnelse.
Lag konkrete stoppkriterier og et felt for hva forsøket faktisk avklarte.
Lever mobiltilpasset nettprototype med tre eksempelprodukter.
Test at et mislykket forsøk kan avsluttes som nyttig læring uten å bli merket som vellykket produkt.
```

## 86 · Morfologisk oppfinnermotor

```
Bygg en morfologisk matrise for produktkonsepter.
La brukeren definere funksjoner som grep, feste, strøm,
betjening og rengjøring, med flere mekaniske alternativer for hver.
Generer kombinasjoner og filtrer bort eksplisitte konflikter.
Vis hvilke valg som gir hver variant, og hvorfor den ble beholdt eller forkastet.
Ikke kall kombinasjonene nye oppfinnelser uten undersøkelser.
Lever en interaktiv nettprototype med eksport.
Test at samme kombinasjon ikke telles flere ganger og at konfliktregler håndheves.
```

## 87 · Brukbarhetsbenk for redusert rekkevidde

```
Bygg en evalueringsbenk for grensesnitt med begrenset rekkevidde og presisjon.
Lag tre varianter av samme kontrollpanel med ulike knappestørrelser,
avstander og antall nødvendige handlinger.
Registrer oppgavetid, feiltrykk og fullføring i en lokal demonstrasjon.
Bruk syntetiske resultater hvis ingen faktisk utprøving er gjort.
Ikke utled helseeffekt eller generell tilgjengelighet fra demonstrasjonen.
Lever prototype og sammenligningsvisning.
Test at hver variant får samme oppgave og at avbrutte forsøk ikke forsvinner fra rapporten.
```

## 88 · Monteringskonfigurator

```
Bygg en konfigurator for et modulært bordprodukt.
Velg mellom tre baser, to høyder og tre tilbehørsmoduler.
Vis bare kombinasjoner som passer etter eksplisitte geometriske regler.
Oppdater 3D-modell, deleliste og monteringsrekkefølge når valgene endres.
Vis hvorfor en kombinasjon ikke er mulig.
Bruk nye demonstrasjonsdeler, ikke påstå tilgang til tidligere prosjektfiler.
Lever modellkilde og nettprototype.
Test alle kombinasjoner og rapporter antall gyldige, ugyldige og ikke kontrollerte.
```

## 89 · CAD-versjoner med målbar forskjell

```
Bygg et verktøy som sammenligner to versjoner av et enkelt parametrisk produkt.
Vis endrede parametere, antatt volum og forskjeller i grensesnittmål.
Lag en visuell overlagring med ulike farger.
Bruk to modeller du selv genererer fra samme kilde.
Hvis mesh-sammenligning kjøres, dokumenter metoden.
Hvis bare parameterforskjeller sammenlignes, skal det stå tydelig.
Lever kjørbar kode og interaktiv visning.
Test en ren fargeendring, en målendring og en endring som bryter kompatibilitet.
```

## 90 · Kunnskapsgraf for én oppfinnelse

```
Bygg en kunnskapsgraf som samler problem, brukerbehov, mekanisme,
CAD-del, beregning, kilde, forsøk og resultat for én oppfinnelse.
La brukeren følge en påstand tilbake til dokumentasjon.
Vis ubekreftede forbindelser annerledes enn dokumenterte forbindelser.
Lag listevisning for mobil og eksport som JSON.
Bruk et nytt, syntetisk produkt som eksempel.
Lever komplett nettprototype.
Kontroller at sletting av en kilde gjør tilknyttede påstander synlig udokumenterte fremfor å beholde gammel godkjenning.
```

## 91 · Stencilverksted i nettleseren

```
Bygg et kodebasert stencilverksted for egne grafiske komposisjoner.
La brukeren kombinere enkle silhuetter, symboler, negativt rom og grov tekstur.
Lag justerbar kontrast og en kontroll som viser løse øyer i en utskjæringsmal.
Bruk originale geometriske demonstrasjonsmotiver.
Eksporter redigerbar SVG og separat PNG for hvert motiv.
Ikke lag én collage når flere motiver velges.
Lever fungerende nettprototype med fem demonstrasjonsmotiver.
Kontroller eksportmål og at hvert motiv får en egen fil.
```

## 92 · Poesiplakatmotor

```
Bygg et verktøy for mørke poesiplakater til sosiale medier.
Brukeren skal lime inn egen tekst og velge mellom fem stramme typografiske oppsett.
Bakgrunn, marger, linjebrudd og tekststørrelse skal kunne justeres.
Lag forhåndsvisning i kvadratisk og stående format.
Vis varsel ved tekst som ikke får plass.
Eksporter hver plakat som separat SVG og PNG uten vannmerke.
Lever en mobiltilpasset nettprototype med korte demonstrasjonstekster.
Test æ, ø, å, lange ord og ti separate eksporter.
```

## 93 · Satirekompositor med kildefelt

```
Bygg en kompositor for satiriske grafikker.
Lag felt for dokumentert hendelse, kilde, satirisk vri og visuell metafor.
Hold faktagrunnlaget atskilt fra den kreative kommentaren.
La brukeren bygge motivet med originale SVG-figurer, symboler og tekst.
Bruk oppdiktede demonstrasjonshendelser som er tydelig merket.
Ingen nyhet eller sitat skal oppfinnes og fremstilles som ekte.
Lever mobiltilpasset prototype med separate bildeeksporter.
Kontroller at kildefeltet følger med i prosjektdataene selv når det skjules i selve motivet.
```

## 94 · Gonzo-verksted som redigeringsverktøy

```
Bygg et redigeringsverktøy for gonzo og kortprosa.
La brukeren lime inn egen tekst og markere observasjon,
påstand, metafor, gjentakelse og tom formulering med ulike farger.
Vis ordtelling, setningslengde og hvor teksten mangler konkret scene.
Reglene skal være redigerbare og ikke utgi seg for objektiv kvalitetsmåling.
Bevar originaltekst og alle redigeringsversjoner.
Lever en lokal nettprototype.
Test at en tekst kan bearbeides og deretter gjenopprettes nøyaktig.
```

## 95 · Musikalsk idébygger

```
Bygg en liten musikkidébygger med Web Audio.
Lag trommesekvenser, enkel bass, akkordvalg, tempo og avspilling.
Bruk syntetiserte lyder, ikke eksterne opptak eller beskyttede samples.
La brukeren lagre mønstre og sammenligne tre arrangementer.
Start lyd først etter en tydelig brukerhandling.
Eksporter prosjektet som JSON og MIDI hvis du implementerer et gyldig MIDI-format.
Lever en mobiltilpasset prototype.
Kontroller timing, stoppknapp og at gjentatt start ikke lager flere samtidige avspillinger.
```

## 96 · Etterliv — romlig minnegalleri

```
Bygg et rolig, interaktivt 3D-galleri for minner.
Bruk oppdiktede bilder representert med originale grafiske flater og korte kildetekster.
Hvert minne skal være et objekt som kan åpnes og knyttes til andre.
Lag navigasjon med berøring og en fullverdig listevisning som alternativ.
Ingen video eller automatisk kameraflyging skal kreves.
Vis tydelig hva som er demonstrasjonsmateriale.
Lever kildekode og fungerende forhåndsvisning.
Test at alle minner kan nås uten presise tredimensjonale bevegelser.
```

## 97 · Produktportefølje med ekte status

```
Bygg en produktportefølje for en oppfinner.
Vis idé, prototype, kontrollert funksjon og ferdig leveranse som separate nivåer.
Hvert produkt skal ha siste bevis, neste spørsmål, beregnet kostnad og 3D-henvisning.
Lag filtrering på verdi, usikkerhet og gjenbrukbare komponenter.
Bruk syntetiske produkter og tydelige prisantakelser.
Ikke fremstille renderinger som ferdigproduserte gjenstander.
Lever mobiltilpasset nettprototype.
Test at et produkt uten dokumentert funksjonsprøve ikke kan merkes som funksjonsverifisert.
```

## 98 · Dark luxury — garderobekonfigurator

```
Bygg en garderobekonfigurator med svart, minimalistisk uttrykk.
Registrer plagg jeg eier, passform, bruksområde og hvilke kombinasjoner som fungerer.
Bruk generiske demonstrasjonsplagg uten kjøpslenker eller oppdiktede merkepriser.
Lag kapsler for hverdag, møte og anledning.
Vis hvilke kombinasjoner som kan bygges av eksisterende plagg,
og hvilke foreslåtte kjøp som faktisk tilfører nye kombinasjoner.
Lever mobiltilpasset prototype med lokale bilder og eksport.
Test at samme plagg kan brukes i flere kapsler uten å telles som flere plagg.
```

## 99 · Ti separate bilder — eksportmaskin

```
Bygg en eksportmaskin for en serie på ti grafiske arbeider.
Hvert arbeid skal ha egen komposisjon, tekst, bakgrunn og filnavn.
Vis ti separate forhåndsvisninger, ikke én samlet bildeflate.
Støtt individuell nedlasting og samlet ZIP med ti filer.
Bruk kodegenerert SVG eller Canvas-grafikk og egne demonstrasjonsmotiver.
Bevar æ, ø og å og bruk konsekvente dimensjoner.
Lever fungerende nettprototype.
Kontroller at ZIP-filen faktisk inneholder ti ulike bilder med riktige mål,
og at ingen eksport ved et uhell blir en collage.
```

## 100 · MR ART — prototypearena

```
Bygg en prototypearena som hjelper meg velge hva jeg faktisk skal bygge videre.
Hvert prosjekt skal vurderes på konkret nytte, testbarhet, kostnad,
gjenbruk, usikkerhet og tid til første dokumenterte resultat.
Lag plass til fungerende demo, CAD, beregning og testbevis.
Vis vurderingsgrunnlaget, ikke bare en totalscore.
Bruk ti syntetiske prosjekter fra programvare, omsorg, mekanikk og kreativt arbeid.
Lever en mobiltilpasset nettprototype med lokal lagring og eksport.
Test at et visuelt pent prosjekt uten bevis ikke automatisk rangeres over et enklere prosjekt med dokumentert nytte.
```
