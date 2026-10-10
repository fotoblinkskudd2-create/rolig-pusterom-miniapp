# 25 konsepter

> Generert fra `src/concepts.json` med `npm run docs`. Ikke rediger for hånd.

Research og metode: [RESEARCH.md](RESEARCH.md). Designprompts: [PROMPTS.md](PROMPTS.md).

| # | App | Kategori | Kort | Modell |
|---|-----|----------|------|--------|
| 1 | 🔨 **Gjeldsknuser** | Penger | Se renten tikke. Knus den. | Engangskjøp 49 kr. En gjeldsapp med abonnement er en vits. |
| 2 | 🧩 **Delene** | Hode | Systemlogg for flere i ett hode. | Gratis, med donasjon. Data forlater aldri enheten. |
| 3 | 🧊 **Impulsbrems** | Penger | Kjølerom for kjøp. | Gratis med engangsopplåsing på 29 kr for ubegrensede ønsker. |
| 4 | 🌗 **Skiftsøvn** | Kropp | Søvnplan for turnus, ikke for 9–17. | Engangskjøp 59 kr. |
| 5 | 🎧 **Tinnitusro** | Kropp | Finn pipet ditt. Mask det. | Engangskjøp 49 kr. |
| 6 | 🍞 **Surdeigsvakt** | Håndverk | Hold starteren i live. | Engangskjøp 39 kr. |
| 7 | 🫙 **Gjæringslogg** | Håndverk | Øl, mjød, kombucha, kimchi. | Engangskjøp 39 kr. |
| 8 | 💿 **Vinylhylla** | Håndverk | Katalog, gradering, glemte plater. | Gratis opp til 50 plater, deretter engangskjøp 49 kr. |
| 9 | 🌈 **Dagstripe** | Hode | Dagen som én fargestripe. | Gratis kjerne, 99 kr engangs for maler og statistikk. |
| 10 | 🛖 **Hyttebygger** | Hode | Fokuser én planke om gangen. | Gratis. Hyttestiler kan kjøpes for 19 kr. |
| 11 | 🧗 **Klatrelogg** | Kropp | Buldre, ruter, pyramide. | Engangskjøp 59 kr. |
| 12 | 🦵 **Korsbånd** | Kropp | ACL-rehab, dag for dag. | Engangskjøp 79 kr. |
| 13 | 🌸 **Bekkenbunn** | Kropp | Knip. Slipp. Diskré. | Engangskjøp 49 kr. |
| 14 | 🏡 **Samvær** | Familie | To hjem. Én oversikt. | Engangskjøp 69 kr per forelder. |
| 15 | 🌡️ **Feberlogg** | Familie | Klokka tre om natta, med svar. | Gratis. Tips. |
| 16 | 🌦️ **Humørvær** | Hode | Mer enn 1 til 5. | Gratis, med eksport til terapeut for 49 kr engangs. |
| 17 | 🪤 **Tankefelle** | Hode | Fang tanken. Sjekk den. | Engangskjøp 49 kr. |
| 18 | 🌅 **Edru** | Hode | Dager, kroner, bølger. | Gratis. Alltid. |
| 19 | 📞 **Ringerunde** | Familie | Ikke la folk gli bort. | Engangskjøp 39 kr. |
| 20 | 🪚 **Snekkerkalk** | Verktøy | Kappliste og trapp, uten svinn. | Engangskjøp 49 kr. |
| 21 | 🏠 **Boligkalk** | Penger | Boliglån, norske regler. | Gratis, uten innsamling av data. |
| 22 | 🧾 **Frilanskalk** | Penger | Hva må du ta i timen? | Engangskjøp 59 kr. |
| 23 | ⚖️ **Besluttet** | Verktøy | Vekt det. Kast mynt. Kjenn etter. | Engangskjøp 29 kr. |
| 24 | 🎒 **Sekkevekt** | Kropp | Hvert gram teller på fjellet. | Engangskjøp 39 kr. |
| 25 | 🗣️ **Snakkebrett** | Verktøy | Trykk, og telefonen snakker. | Gratis. |

## Penger

### 🔨 Gjeldsknuser – Se renten tikke. Knus den.

> *«Renten tikker mens jeg sover. Nå ser jeg den tikke, og jeg tikker tilbake.»*

**Problem.** BNPL, kredittkort, forbrukslån og inkasso ligger spredt i fem apper og en skuff. Ingen av dem viser hva gjelden koster per døgn, eller hvilken dato du er gjeldfri.

**Signal.** Finansverktøy for markeder utenfor USA vokser, og amerikanske gjeldsapper kjenner ikke norsk BNPL og inkasso (AppOpportunity 2026). Personvern-først-verktøy er grønt lys for indier (dev.to, indie-prognose for Q3 2026).

**For hvem.** Alle med tre eller flere kreditorer, Klarna-brukere og folk med inkassobrev de ikke har åpnet.

**Modell.** Engangskjøp 49 kr. En gjeldsapp med abonnement er en vits.

**Funksjoner (bygget):**

- Rente-taksameter som teller kroner i sekundet, døgnet og året
- Snøball- eller skredplan med gjeldfri-dato
- Betalingslogg per kreditor
- Eksport til .txt

Kode: [`src/apps/`](src/apps/) · åpnes med `#/gjeldsknuser`

### 🧊 Impulsbrems – Kjølerom for kjøp.

> *«Robotstøvsugeren koster 31 arbeidstimer. Den kan vente tre døgn i fryseren. Det kan ikke jeg, men nå må jeg.»*

**Problem.** Klarna har gjort «kjøp nå» til ett trykk, og ingen motvekt er like rask. Prisen i kroner føles abstrakt. Prisen i arbeidstimer gjør ikke det.

**Signal.** Personvern-først-verktøy er grønt lys for indier (dev.to 2026). BNPL vokser. Ingen norsk app regner prisen om til arbeidstimer etter skatt.

**For hvem.** Impulskjøpere, folk med ADHD og alle som har fått en pakke de ikke husker å ha bestilt.

**Modell.** Gratis med engangsopplåsing på 29 kr for ubegrensede ønsker.

**Funksjoner (bygget):**

- Legg inn ønsket ting, så kjøles den i 24 timer, 72 timer eller én uke
- Prisen omregnet til arbeidstimer etter skatt
- Når tiden er ute, velger du kjøp eller dropp
- Teller for spart beløp

Kode: [`src/apps/`](src/apps/) · åpnes med `#/impulsbrems`

### 🏠 Boligkalk – Boliglån, norske regler.

> *«Banken sier ja til 3,4 millioner. Stresstesten sier at jeg spiser knekkebrød til 2051. Kalkulatoren sier det samme, men uten å ville ha e-posten min.»*

**Problem.** Amerikanske lånekalkulatorer kjenner ikke utlånsforskriften, dokumentavgiften eller forskjellen på serielån og annuitetslån. Bankenes kalkulatorer vil ha e-posten din.

**Signal.** Finansverktøy tilpasset lokale markeder vokser, og eiendomskalkulatorer nevnes som spesialistverktøy som fortsatt fungerer (AppOpportunity 2026).

**For hvem.** Førstegangskjøpere og folk som refinansierer.

**Modell.** Gratis, uten innsamling av data.

**Funksjoner (bygget):**

- Annuitet mot serielån: månedsbeløp og totalrente
- Sjekk mot utlånsforskriften: egenkapital, fem ganger inntekt og stresstest
- Dokumentavgift og total kjøpesum
- Alle satser kan endres

Kode: [`src/apps/`](src/apps/) · åpnes med `#/boligkalk`

### 🧾 Frilanskalk – Hva må du ta i timen?

> *«Jeg fakturerte 600 i timen i et år. Så kom restskatten, 84 000 kr, i en brun konvolutt. Det riktige tallet var 1 140.»*

**Problem.** Nye frilansere tar 600 kr timen fordi det høres mye ut. Så kommer ferie, sykdom, ikke-fakturerbar tid, trygdeavgift og restskatt.

**Signal.** Frilansfakturering og skattekalkulatorer for frilansere er eksempler på voksende nisjer (AppOpportunity 2026). Norske regler for enkeltpersonforetak mangler i internasjonale apper.

**For hvem.** Frilansere og nye enkeltpersonforetak.

**Modell.** Engangskjøp 59 kr.

**Funksjoner (bygget):**

- Fra ønsket nettolønn til nødvendig timepris
- Tar med ferie, sykdom, fakturerbar andel, utgifter og pensjon
- Hvor mye du bør sette av per faktura
- Moms av og på

Kode: [`src/apps/`](src/apps/) · åpnes med `#/frilanskalk`

## Hode

### 🧩 Delene – Systemlogg for flere i ett hode.

> *«En del tok over klokka 14 og kjøpte Lego. Nå står det i loggen med navn. Ingen flere spøkelser i bankappen.»*

**Problem.** Folk med DID/OSDD mister tid, minner og sammenheng mellom deler. Notatene ligger spredt, det finnes ingen felles oppslagstavle, og nesten alle apper er bygget for én «deg».

**Signal.** Brukere av mental helse-apper forventer mer nyanse enn en skala fra 1 til 5 (AppOpportunity 2026). Ingen lokal-først-aktør dominerer verktøy for flersystemer, og sensitive data krever at ingenting forlater enheten.

**For hvem.** Personer med dissosiative lidelser, deres behandlere og andre som lever som flersystem.

**Modell.** Gratis, med donasjon. Data forlater aldri enheten.

**Funksjoner (bygget):**

- Front-logg: hvem er fremme, co-front, tidsstempel
- Deleregister med rolle, alder, farge, trøst og triggere
- Felles oppslagstavle mellom deler
- «Tapt tid»-logg: hva skjedde, hva ble kjøpt
- Eksport for behandler

Kode: [`src/apps/`](src/apps/) · åpnes med `#/delene`

### 🌈 Dagstripe – Dagen som én fargestripe.

> *«Klokka var 11. Så var den 16. Jeg vet ikke hvor fem timer ble av. Nå er de en oransje stripe, og den krymper mens jeg ser på.»*

**Problem.** Med ADHD er tid usynlig. En gjøremålsliste sier hva du skal gjøre, men ikke når, hvor lenge eller hvor mye tid som er igjen.

**Signal.** Tiimo, en visuell planlegger for nevrodivergente, ble iPhone App of the Year 2025. Super Productivity (timeboksing) har over 22 000 stjerner under GitHub-emnet local-first.

**For hvem.** Folk med ADHD eller autisme, og alle som mister tiden.

**Modell.** Gratis kjerne, 99 kr engangs for maler og statistikk.

**Funksjoner (bygget):**

- Dagen som vertikal stripe med fargede blokker og en nå-linje
- Nedtellingsring for blokken du er i
- Maler for morgen og kveld
- Avkryssing og «hva nå?»-knapp

Kode: [`src/apps/`](src/apps/) · åpnes med `#/dagstripe`

### 🛖 Hyttebygger – Fokuser én planke om gangen.

> *«Jeg åpnet Instagram i økt fire. En planke knakk. Jeg hørte den knekke. Hytta har ikke tak, og det er min feil.»*

**Problem.** Fokustimere er kjedelige, og å kaste bort en økt koster ingenting. Det mangler en liten, stille konsekvens og noe som vokser over tid.

**Signal.** Focus Friend (Hank Green) vant Cultural Impact ved App Store Awards 2025: fokus kombinert med omsorg for en figur fungerer. Vi gjør det norsk med ei hytte.

**For hvem.** Studenter, folk med ADHD og hjemmekontorfolk.

**Modell.** Gratis. Hyttestiler kan kjøpes for 19 kr.

**Funksjoner (bygget):**

- Fokusøkter på 15, 25 eller 50 minutter
- Hver fullførte økt gir én planke
- Forlater du appen, knekker planken
- Hytta vokser gjennom 12 trinn
- Statistikk

Kode: [`src/apps/`](src/apps/) · åpnes med `#/hyttebygger`

### 🌦️ Humørvær – Mer enn 1 til 5.

> *«Jeg er ikke «3». Jeg er høy energi og helt jævlig på samme tid, rastløs og rasende. Nå har det et punkt på et kart.»*

**Problem.** «Hvordan har du det, 1 til 5?» Svaret er «3» hver dag, og det betyr ingenting. Følelser har både energi og retning.

**Signal.** Brukere forventer mer nyanse enn en skala fra 1 til 5, og rapporter til terapeut vokser (AppOpportunity 2026). Dette er neste steg for Pusterom-appen i dette repoet.

**For hvem.** Folk i terapi og alle som vil skjønne mønstrene sine.

**Modell.** Gratis, med eksport til terapeut for 49 kr engangs.

**Funksjoner (bygget):**

- Todimensjonalt humørkart (energi × behag) som gir følelsesord
- Tagger: søvn, folk, jobb, kropp
- Ukeplott
- Terapeutrapport som .txt

Kode: [`src/apps/`](src/apps/) · åpnes med `#/humorvaer`

### 🪤 Tankefelle – Fang tanken. Sjekk den.

> *««Alle hater meg.» 95 prosent sikker. Bevis: én sur melding. Etter skjemaet: 30 prosent. Fella var tankelesing. Den var det i forrige uke også.»*

**Problem.** Kognitiv terapi virker best med hjemmelekser, men tankeskjemaet på papir blir liggende. Ingen ser hvilke tankefeller som går igjen.

**Signal.** CBT-dagbok og rapporter til terapeut er etterspurt (AppOpportunity 2026). Data skal ligge lokalt.

**For hvem.** Folk i eller etter kognitiv terapi, og selvhjelpere.

**Modell.** Engangskjøp 49 kr.

**Funksjoner (bygget):**

- Tankeskjema i sju steg
- Ti vanlige tankefeller å velge fra
- Hvor mye du tror på tanken, før og etter
- Statistikk over hyppigste tankefeller

Kode: [`src/apps/`](src/apps/) · åpnes med `#/tankefelle`

### 🌅 Edru – Dager, kroner, bølger.

> *«Dag 47. Det er fredag og alle andre har vin. Jeg trykket på bølgen. Ti minutter. Den toppet seg på minutt fire og la seg. Jeg også.»*

**Problem.** Telleappene for rusfrihet nullstilles ved et tilbakefall, og skammen gjør resten. Ingen hjelper deg gjennom de ti minuttene trangen varer.

**Signal.** AppOpportunity 2026 bruker en vanetracker for folk i recovery som eksempel på spesifisitet som selger.

**For hvem.** Folk i recovery fra alkohol, rus, spill eller annet.

**Modell.** Gratis. Alltid.

**Funksjoner (bygget):**

- Live teller for tid rusfri og penger spart
- Trangsurfing: timinutters bølgetimer
- Triggerlogg
- Milepæler
- Ny start uten skam, der tidligere rekker blir bevart

Kode: [`src/apps/`](src/apps/) · åpnes med `#/edru`

## Kropp

### 🌗 Skiftsøvn – Søvnplan for turnus, ikke for 9–17.

> *«Klokka er 07:40, jeg har nettopp kommet hjem fra natt, sola skjærer meg i øynene, og verden vil at jeg skal spise frokost.»*

**Problem.** Sykepleiere, vektere, offshorearbeidere og bussjåfører får søvnråd skrevet for folk som jobber 9–17. Ingen app sier når du skal sove, slutte med kaffe eller unngå lys før og etter en nattevakt.

**Signal.** AppOpportunity 2026 nevner meditasjon for skiftarbeidere som eksempel på spesifisitet som vinner, og generelle søvnapper er mettet.

**For hvem.** Turnusarbeidere i helse, industri, transport og vakt.

**Modell.** Engangskjøp 59 kr.

**Funksjoner (bygget):**

- Legg inn vakter som dag, kveld, natt eller fri
- Beregnet søvnvindu, kaffestopp og lysvindu per døgn
- Ukeoversikt
- Sjekkliste før nattevakt

Kode: [`src/apps/`](src/apps/) · åpnes med `#/skiftsovn`

### 🎧 Tinnitusro – Finn pipet ditt. Mask det.

> *«Det piper på 6 kHz. Det har pipet i fire år. Nå piper jeg tilbake med brun støy og et hull akkurat der det gjør vondt.»*

**Problem.** Hvitstøy-apper spiller generisk regnvær. Ingen hjelper deg å finne tinnitusfrekvensen din, eller å lage støy med et hakk (notch) akkurat der det piper.

**Signal.** AppOpportunity 2026 bruker meditasjon for folk med tinnitus som eksempel på nisjer som selger. Web Audio API gjør dette mulig uten server.

**For hvem.** Folk med tinnitus og alle som sover dårlig av piping.

**Modell.** Engangskjøp 49 kr.

**Funksjoner (bygget):**

- Frekvensmatcher med tonegenerator
- Hvit, rosa og brun støy
- Hakkfilter sentrert på din frekvens
- Sovetimer som tones ut

Kode: [`src/apps/`](src/apps/) · åpnes med `#/tinnitusro`

### 🧗 Klatrelogg – Buldre, ruter, pyramide.

> *«Fjorten forsøk på en lilla 6B. Fingertuppene blør. På forsøk femten tok jeg toppen og skrek så hele hallen snudde seg. Loggen husker det for meg.»*

**Problem.** Klatrere logger i notatappen, og vanlige treningsapper forstår verken grader, forsøk eller prosjekter.

**Signal.** Hypernisje-trening er grønt lys for indier, og klatrere nevnes eksplisitt både i dev.to-prognosen og hos AppOpportunity 2026.

**For hvem.** Buldrere og sportsklatrere.

**Modell.** Engangskjøp 59 kr.

**Funksjoner (bygget):**

- Logg buldre eller ruter med grad, forsøk og send eller prosjekt
- Gradepyramide
- Økthistorikk
- Fontainebleau, V-skala og fransk

Kode: [`src/apps/`](src/apps/) · åpnes med `#/klatrelogg`

### 🦵 Korsbånd – ACL-rehab, dag for dag.

> *«Dag 9. Kneet bøyer 72 grader og jeg gråter på badegulvet. Dag 30: 118. Grafen er det eneste beviset på at jeg ikke står stille.»*

**Problem.** Etter en korsbåndoperasjon får du et ark fra fysioterapeuten og ni måneder alene. Ingen ser hvor mye du bøyer kneet, eller om fremgangen har stoppet.

**Signal.** AppOpportunity 2026 nevner rehab etter korsbåndskade som et voksende spesifikt helseområde. Generelle treningsapper er mettet.

**For hvem.** Pasienter etter korsbåndrekonstruksjon, vanligvis aktive folk mellom 15 og 40 år.

**Modell.** Engangskjøp 79 kr.

**Funksjoner (bygget):**

- Faseplan fra operasjonsdato
- Daglige øvelser per fase med avkryssing
- Logg for bøy og strekk i grader, med graf
- Smerteskala fra 0 til 10

Kode: [`src/apps/`](src/apps/) · åpnes med `#/korsband`

### 🌸 Bekkenbunn – Knip. Slipp. Diskré.

> *«Jeg knep på bussen. Ingen så det. Sirkelen pulset i lomma og jeg vant en liten krig ingen vet om.»*

**Problem.** Bekkenbunnstrening anbefales etter fødsel, ved lekkasje og for prostata, men nesten ingen gjør den jevnt. Det finnes ingen rytme og ingen påminnelse, og appene er ofte flaue å ha på hjemskjermen.

**Signal.** AppOpportunity 2026 nevner bekkenbunnstrening eksplisitt som en voksende, spesifikk helsenisje.

**For hvem.** Kvinner etter fødsel, folk med lekkasje og menn etter prostatabehandling.

**Modell.** Engangskjøp 49 kr.

**Funksjoner (bygget):**

- Guidet knip og slipp med pulserende sirkel og vibrasjon
- Programmer for nybegynnere, utholdenhet og hurtigknip
- Streak-kalender
- Diskré navn og ikon

Kode: [`src/apps/`](src/apps/) · åpnes med `#/bekkenbunn`

### 🎒 Sekkevekt – Hvert gram teller på fjellet.

> *«Sekken veide 14,2 kilo. Jeg byttet teltet og kuttet tannbørsten i to som en idiot. 9,8. Jeg flyr over Hardangervidda.»*

**Problem.** Ultralette turgåere holder utstyret i Excel. Spørsmålet før turen er alltid det samme: hva veier sekken, og hva er det tyngste jeg kan bytte ut?

**Signal.** Spesialiserte friluftsapper gjør det godt mens generelle apper er mettet (AppOpportunity 2026). Norsk turkultur og DNT-hytter gir et eget hjemmemarked.

**For hvem.** Fjellfolk, ultralett-entusiaster og alle som går hytte til hytte.

**Modell.** Engangskjøp 39 kr.

**Funksjoner (bygget):**

- Utstyrslager med vekt i gram
- Turlister satt sammen fra lageret
- Fordeling på basevekt, forbruk og på kroppen
- Kategoriandeler og de fem tyngste

Kode: [`src/apps/`](src/apps/) · åpnes med `#/sekkevekt`

## Håndverk

### 🍞 Surdeigsvakt – Hold starteren i live.

> *«Starteren min heter Kjell. Kjell har overlevd to samboere og et samlivsbrudd. Kjell skal ikke dø på min vakt.»*

**Problem.** Surdeigsbakere husker ikke når starteren sist ble matet, regner bakerprosent på servietter og glemmer hevingen i ovnslyset.

**Signal.** AppOpportunity 2026 nevner surdeig-starter som håndverksnisje og anslår 10–50 000 dollar i måneden for en solo-utvikler.

**For hvem.** Hjemmebakere som baker surdeig.

**Modell.** Engangskjøp 39 kr.

**Funksjoner (bygget):**

- Fôringslogg og tid siden sist matet
- Fôringsratio-kalkulator (1:1:1, 1:2:2, 1:5:5)
- Bakerprosent-kalkulator
- Hevetimer

Kode: [`src/apps/`](src/apps/) · åpnes med `#/surdeigsvakt`

### 🫙 Gjæringslogg – Øl, mjød, kombucha, kimchi.

> *«Mjøden på hylla er 41 dager gammel og lukter som en vikinggrav. Perfekt. Dag 42 tapper jeg.»*

**Problem.** Hjemmebryggere har ti glass på gang og husker ikke hvilken dag de startet, hva OG var, eller når de skal tappe.

**Signal.** Gjæringslogg for hjemmebrygg er nevnt som håndverksnisje (AppOpportunity 2026). Dagens bryggeapper er tunge og bygget for øl alene.

**For hvem.** Hjemmebryggere og de som fermenterer grønnsaker eller kombucha.

**Modell.** Engangskjøp 39 kr.

**Funksjoner (bygget):**

- Batcher med type, startdato og dagteller
- ABV fra OG og FG
- Måldag med varsling i listen
- Smaksnotater

Kode: [`src/apps/`](src/apps/) · åpnes med `#/gjaering`

### 💿 Vinylhylla – Katalog, gradering, glemte plater.

> *«Jeg har 312 plater og har spilt Rumours 80 ganger. Appen nekter meg. Den gir meg en polsk jazzplate fra 1971. Den har rett.»*

**Problem.** Samlere har 400 plater og spiller de samme 20. Graderingen ligger i hodet, og katalogverktøyene er laget for kjøp og salg, ikke for lytting.

**Signal.** AppOpportunity 2026 nevner vinylkatalogisering som en lønnsom håndverksnisje.

**For hvem.** Vinylsamlere.

**Modell.** Gratis opp til 50 plater, deretter engangskjøp 49 kr.

**Funksjoner (bygget):**

- Katalog med artist, album, år og pressing
- Goldmine-gradering (M til P)
- Spilleteller
- «Hva spiller jeg?» som vekter glemte plater

Kode: [`src/apps/`](src/apps/) · åpnes med `#/vinylhylla`

## Familie

### 🏡 Samvær – To hjem. Én oversikt.

> *«Hun sier jeg skylder 1 340 for fotballsko. Jeg sier hun skylder for tannlegen. Nå sier appen et tall, og ingen roper lenger.»*

**Problem.** Skilte foreldre koordinerer samvær i Messenger, utgifter i Vipps-historikken og overleveringer i hodet, og hver misforståelse blir en konflikt.

**Signal.** AppOpportunity 2026 beskriver verktøy for samværsforeldre som et fragmentert marked uten en dominerende aktør.

**For hvem.** Samværsforeldre med 7/7, 2-2-3 eller annenhver helg.

**Modell.** Engangskjøp 69 kr per forelder.

**Funksjoner (bygget):**

- Samværskalender fra mønster og startdato
- Utgiftsdeling med saldo for hvem som skylder hvem
- Overleveringsnotater
- Eksport

Kode: [`src/apps/`](src/apps/) · åpnes med `#/samvaer`

### 🌡️ Feberlogg – Klokka tre om natta, med svar.

> *«03:12. Hun er glovarm. Jeg står i gangen med sprøyta og en hjerne som har sluttet å virke. Appen sier: tidligst 04:00. Jeg puster.»*

**Problem.** Klokka er 03:12 og barnet har 39,4. Fikk hun Paracet klokka 23 eller 01? Ingen husker, og ingen tør å gi ny dose.

**Signal.** Foreldre- og familieapper vokser (AppOpportunity 2026). Babytrackere handler om søvn og mat, ikke om sykdomsnatta.

**For hvem.** Foreldre til barn mellom 0 og 12 år.

**Modell.** Gratis. Tips.

**Funksjoner (bygget):**

- Temperaturlogg med graf
- Medisinlogg med nedtelling til tidligste neste dose
- Veiledende dose etter vekt
- Flere barn

Kode: [`src/apps/`](src/apps/) · åpnes med `#/feberlogg`

### 📞 Ringerunde – Ikke la folk gli bort.

> *«Morfar ringte i 2024. Jeg ringte aldri tilbake. Nå er det for sent. Denne appen finnes så ikke neste navn på lista blir et gravsted.»*

**Problem.** Ensomhet kommer sakte. Du mener å ringe bestemor og kompisen fra studietiden, så går det åtte måneder. Sosiale medier gir følelsen av kontakt uten å gi kontakt.

**Signal.** Sosiale nettverk er rødt lys for indier fordi de trenger nettverkseffekter (dev.to 2026). Et verktøy for én person og ekte relasjoner trenger ingen. Henger sammen med Isolation Mirror i dette repoet.

**For hvem.** Voksne med travle liv, folk som har flyttet og folk som kjenner på isolasjon.

**Modell.** Engangskjøp 39 kr.

**Funksjoner (bygget):**

- Personer med ønsket kontaktfrekvens
- Liste over hvem det er på tide å kontakte, sortert etter hvor lenge siden
- Logg samtale, melding eller treff
- Notater om hva dere snakket om

Kode: [`src/apps/`](src/apps/) · åpnes med `#/ringerunde`

## Verktøy

### 🪚 Snekkerkalk – Kappliste og trapp, uten svinn.

> *«Jeg kjøpte ti lengder. Jeg trengte sju. Tre plank ligger i garasjen som et monument over hoderegning.»*

**Problem.** Du står på Byggmax og skal kjøpe nok 48×98. Hvor mange 4,8-meters lengder trenger du til 23 kapp, når sagsnittet tar 3 mm hver gang?

**Signal.** Spesialistverktøy fungerer fortsatt der enkle verktøy dør, med snekkerkalkulator som eksempel (AppOpportunity 2026).

**For hvem.** Hobbysnekkere, håndverkere og folk som pusser opp.

**Modell.** Engangskjøp 49 kr.

**Funksjoner (bygget):**

- Kappliste-optimalisering (first-fit decreasing) med sagsnitt
- Visuell kappeplan per lengde
- Trappekalkulator for opptrinn, inntrinn og stigning
- Svinnprosent

Kode: [`src/apps/`](src/apps/) · åpnes med `#/snekkerkalk`

### ⚖️ Besluttet – Vekt det. Kast mynt. Kjenn etter.

> *«Matrisen sa Bergen 7,4 mot Oslo 7,1. Så kastet jeg mynt og fikk Oslo, og kjente at jeg ble skuffet. Da visste jeg det.»*

**Problem.** Store valg kverner i hodet i flere uker: flytte, slutte, kjøpe. Fordel- og ulempelister vekter ikke noe, og magefølelsen får aldri ordet.

**Signal.** Beslutningsverktøy står på listen over personvern-først-verktøy der indier vinner (dev.to 2026).

**For hvem.** Overtenkere.

**Modell.** Engangskjøp 29 kr.

**Funksjoner (bygget):**

- Vektet beslutningsmatrise med kriterier og alternativer
- Myntkast for magefølelsen: hva håpet du på?
- Lagrede beslutninger
- Oppfølging av utfallet senere

Kode: [`src/apps/`](src/apps/) · åpnes med `#/besluttet`

### 🗣️ Snakkebrett – Trykk, og telefonen snakker.

> *«Etter operasjonen kunne jeg ikke snakke på ti dager. Jeg pekte. Jeg grynta. Så trykket jeg på «Jeg har vondt» og telefonen sa det for meg, høyt.»*

**Problem.** Etter slag, ved afasi, ALS, autisme eller tap av stemme koster ASK-apper ofte tusenlapper og er tunge å sette opp. Mange trenger bare tjue setninger, store knapper og norsk tale.

**Signal.** Be My Eyes vant Cultural Impact ved App Store Awards 2025, og tilgjengelighet blir belønnet. Nettleserens innebygde talesyntese gjør tale mulig uten server.

**For hvem.** Personer med afasi, autisme, ALS, midlertidig tap av stemme (for eksempel etter operasjon) og pårørende.

**Modell.** Gratis.

**Funksjoner (bygget):**

- Store fraseknapper i kategorier som leses opp med norsk tale
- Skriv og snakk
- Egne fraser
- Store ja- og nei-knapper
- Fullskjermtekst du kan vise til andre

Kode: [`src/apps/`](src/apps/) · åpnes med `#/snakkebrett`
