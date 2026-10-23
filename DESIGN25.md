# DESIGN25 — idéjakt, 23.10.2026

Klokka er ti over halv elleve en torsdag i oktober, og jeg sitter i en repo med fire HTML-filer og en README som påstår ting som ikke er sant. (HULL.md sier `alert()` er fjernet i 1.1. Den står der fortsatt, linje 280 i `index.html`. Nav-fiksen, lokal-first-linja og eksporten finnes heller ikke i fila. Commit-meldinga lyver. Første funn, gratis.)

Boklista for januar 2026 hadde to norske romaner blant de femti mest solgte — resten var helse, livsstil og folk som vil fortelle deg hvordan du skal puste. VG-lista har vært norsk-pop-okkupert siden Tobias Sten tok førsteplassen med «Hånd i hånd» i februar. Og et sted der ute sitter noen med Klarna-appen åpen kl. 02:14 og trykker «Del opp» på noe de ikke vil huske at de kjøpte.

Det er markedet. Her er 6 × 25 måter å gå inn i det på.

**Merking** (fra Notion-reglene dine): **DOK** = dokumentert med kilde · **BER** = beregnet · **HYP** = hypotese, ikke sjekket · **UAV** = uavklart. Ingenting her er publisert eller sendt.

---

## 0. Overraskelsen — allerede bygget

**Kjøpsbrems** (`kjopsbrems.html`, lenket fra Historikk). Skriv inn ting, pris, antall avdrag, gebyr. Ti minutter nedtelling før «Kjøp likevel» blir trykkbar. «Slipp det» er alltid åpen. Teller hvor mye du har sluppet. Eksport til `.txt`. Ingen sky, ingen konto. Spørsmålet midt i ventetida: *«Hvem i deg vil ha dette, og hva trenger den egentlig nå?»*

Testet i Chromium: 1299 kr × 4 avdrag × 39 kr gebyr → «Totalt 1 455 kr … (156 kr i gebyr)». **BER.**

---

## 1. Design25 — VibeCode-produkter (iOS / web / React) som løser menneskelige problemer

Felles DNA: lokal-first, ingen konto, én skjerm som gjør én ting, åpner på under ett sekund. Det som skiller dem fra de 400 andre mental-helse-appene: de er bygget for kaos, ikke for folk som allerede har morgenrutine.

| # | Navn | Problem | Hva den gjør | Merk |
|---|------|---------|--------------|------|
| 1 | **Kjøpsbrems** | Impulskjøp på avbetaling | Ferdig — se over. Neste: iOS-snarvei som åpner den når Klarna/Vipps åpnes (Snarveier → Automatisering → App). | HYP at snarveien virker for alle apper |
| 2 | **Vaktbok for deler** | Hukommelseshull ved dissosiasjon/DID — våkne opp til pakker og ingen minne | Delt notatbok på enheten: hver del kan legge igjen en lapp til neste. Tidslinje + «hvem var her?»-knapp. Ingen diagnose, bare kontinuitet. | HYP — test med terapeut før lansering |
| 3 | **Inkasso-oversetter** | Inkassobrev er skrevet for å skremme | Fotografer brevet → OCR lokalt → «Hva de krever, hvem, frist, hva du kan bestride, hva skjer hvis du ignorerer». | HYP — inkassolovens varselregler må kildesjekkes før lansering |
| 4 | **Rente-røntgen** | Folk ser månedsbeløp, ikke total | Lim inn lån/kreditt → viser hva det koster i timer arbeid og i år. | BER |
| 5 | **Ventelista** | Ventetid i spesialisthelsetjenesten uten oversikt | Logg henvisning, frist, purringer, fristbrudd-rett. Genererer klage-tekst. | Kobles til Kodak-saken. UAV — fristbrudd-regler må kildesjekkes |
| 6 | **Søvnløs-modus** | 02–05 er der beslutninger dør | Mørk app som bare tillater: pust, skriv, ring noen. Blokkerer ingenting — speiler. | HYP |
| 7 | **Én sann setning** | Journal-apper er for krevende | Én setning per dag, ingen tom side. Etter 30 dager: din måned i 30 linjer. | HYP |
| 8 | **Kasseradar** | Matpris-stress | Fotografer kvittering → kategori → «samme handel hos annen kjede ≈». | UAV om prisdata er tilgjengelig |
| 9 | **Isolasjonsbryter** | Ensomhet | Ukentlig «send én melding»-oppgave med ferdige åpningslinjer til en ekte kontakt. | HYP |
| 10 | **NAV-tolk** | Vedtak ingen forstår | Lim inn vedtak → klarspråk + klagefrist + klagemal. | UAV — klagefrist må sjekkes per ytelse |
| 11 | **Krisekort** | Panikk i offentligheten | Én skjerm til å vise andre: «Jeg har et panikkanfall, jeg trenger 5 min, ikke ring 113.» | HYP |
| 12 | **Gjeldskart** | Gjeld fragmentert over 9 apper | Manuell liste → snøball/skred-plan → hvilken betales først. | BER |
| 13 | **Barnefri-pause** | Foreldre som koker over | 90-sekunders nedregulering med barnevennlig «mamma/pappa puster»-skjerm. | HYP |
| 14 | **Feil-loggen** | Skam etter tilbakefall | Logg uten dom: hva skjedde, hva før, hva hjalp. Mønstre etter 10 rader. | HYP |
| 15 | **Pusterom for to** | Krangel som eskalerer | Begge telefoner, samme pust i 60 sek før samtalen fortsetter. | HYP |
| 16 | **Avtale-anker** | Glemte timer → gebyr | Timer fra SMS → tre varsler + «hvordan komme seg dit». | UAV |
| 17 | **Abonnement-jeger** | Glemte trekk | Kontoutskrift-CSV lokalt → finner gjentakende trekk. | BER |
| 18 | **Tilbake-til-jobb-bro** | Lang sykemelding | Mikrosteg + logg du kan vise fastlegen. | HYP |
| 19 | **Sorgklokka** | Sorg har ingen app som tåler stillhet | Merkedager, «ingenting-skjerm», brev til den døde som aldri sendes. | HYP |
| 20 | **Nabo-hjelp på lapp** | Folk ber ikke om hjelp | Genererer en printbar lapp med QR til trappeoppgangen. | HYP |
| 21 | **Lyd-skjold** | Sensorisk overload | Én knapp: brun støy + pustepuls i ørene. | HYP |
| 22 | **Medisin-ekko** | Glemt tatt medisin? | Ett trykk = foto av tom pillekopp med tidsstempel. | HYP |
| 23 | **Brev-til-meg-om-ett-år** | Ingen kontinuitet i livet | Låses i 365 dager, lokalt. | HYP |
| 24 | **Hjelp-kartet** | Vet ikke hvor man skal ringe | Kommunebasert: legevakt, gjeldsrådgivning, Mental Helse. | UAV — krever oppdatert liste |
| 25 | **Rolig 2.0 PWA** | Dagens app er ikke installerbar | Manifest + service worker + ikon + dark mode. Allerede på HULL-lista. | DOK (HULL.md) |

**Bygg først:** #1 (ferdig), #25 (1 kveld), #3 eller #10 (det mest betalbare — folk betaler for å forstå brev som truer dem).

---

## 2. Design25 — patent-/oppfinnelsesvinkler

Ærlig: patent i Norge koster titusener og krever *ny, oppfinnelseshøyde, industriell anvendelse*. Programvare alene er vanskelig. Disse er vinkler der en fysisk eller teknisk mekanisme finnes. **Alle er HYP** til en nyhetsgransking (Patentstyret, Espacenet) er gjort.

1. **Fysisk kjøpsbrems-kort** — betalingskort med innebygd tidslås du selv setter (kort aktiveres X min etter knappetrykk).
2. **Pustesynkron vibrasjonsring** som justerer rytme etter målt HRV.
3. **Dissosiasjons-tidsstempel** — wearable som logger «hvem var aktiv» via valgt tapp-mønster.
4. **Inkassobrev-konvolutt-sensor** — postkasseskanner som varsler og tolker uten at du åpner.
5. **Panikk-hanske** med kald-punkt (temperaturstimulering) i håndflaten.
6. **Sorgboks** — fysisk boks som spiller av lyd/stemme kun når den åpnes på merkedag.
7. **Søvn-lås for laders** — lader som ikke lader telefonen mellom 01–06 med mindre du puster 60 sek mot den.
8. **Felles pust-lampe** for par/familier, to lamper som pulserer synkront over avstand.
9. **Avbetalings-kvittering med total** — standard for visning av totalkostnad på skjerm (mer regulatorisk forslag enn patent).
10. **Glemsel-kjøleskap-sensor** — varsler når mat ikke er rørt i 3 dager (ensomhet-proxy for eldre).
11. **Medisinkopp med vektsensor** og tidsstempel.
12. **Støy-hette** med passiv akustisk demping, ikke elektronikk.
13. **Tunge-vekt-teppe** med justerbar vekt via væske.
14. **Krise-QR på armbånd** med lokalt lagret instruks.
15. **Klesknapp som tar notat** (stemme, lokal lagring).
16. **Lys-alarm som simulerer fjord-soloppgang** (spektrum, ikke bare lysstyrke).
17. **Barnevogn-pust** — vibrasjon i håndtaket som roer forelder.
18. **Bil-tenning med stress-sjekk** (pust før start).
19. **Dørhåndtak-påminnelse** (nøkler/medisin/lommebok) med NFC.
20. **Arbeidsbord-skillevegg** som lukkes automatisk ved høy lyd.
21. **Kollektiv-sete-sensor** for å finne roligste vogn.
22. **Skjerm-filter som gråner** kjøpsknapper etter kl. 23.
23. **Pengepung med fysisk «sperret»-rom** for budsjett-kategorier.
24. **Hund-sele med angst-varsling** for eier (hundens puls).
25. **Pust-spill for barn** via blåse-sensor i mikrofon.

**Neste steg:** velg 3, gjør Espacenet-søk, skisser før du snakker med noen. Ikke del offentlig før søknad — offentliggjøring dreper nyheten.

---

## 3. Design25 — bokideer for topplista

**Hva lista sier (DOK):** 2025-toppen var *Grunnboka* (Eyvind Hellstrøm), *Ufred* (Åsne Seierstad), *Landet som ble for rikt* (Martin Bech Holte), Stoltenberg og Nesbø. Januar 2026: helse- og livsstil dominerer, to norske romaner i topp 50. September 2026: Nesbø på topp, Boktober løfter *Verity* og BookTok-titler. 2025 var beste salgsår siden 2021 (~8 mill. bøker).

**Mønsteret:** (a) praktisk helse/mat, (b) samfunnskritikk med tall, (c) krim, (d) BookTok-thriller/romantasy, (e) ekte livshistorie med skam og overlevelse.

| # | Tittel (arbeids) | Sjanger | Vinkel |
|---|------------------|---------|--------|
| 1 | **Del opp** | Sakprosa/gonzo | Én mann, 250 000 i gjeld, ett år med alle kjøpsknapper logget. Klarna-Norge innenfra. |
| 2 | **Vi som ikke var der** | Memoar | Å leve med DID i et system som krever én signatur. |
| 3 | **Ventetid** | Dokumentar | Kodak-saken som bok: hvem dør i køen, og hvem teller dem. *Krever DOK på hver påstand.* |
| 4 | **Landet som ble for dyrt** | Samfunn | Svar på Bech Holte — sett fra gjeldsregisteret, ikke oljefondet. |
| 5 | **Pust** | Helse | 30 pusteteknikker, én per dag, med kilder. Lav terskel, høy salgsflate. |
| 6 | **Kjøleskapet ditt lyver** | Mat/helse | Billig, ærlig mat for folk med 400 kr igjen. |
| 7 | **Inkasso** | Krim | Etterforsker som jobber for et inkassobyrå finner et lik i porteføljen. |
| 8 | **Fjorden fryser** | Nordic noir | Batsverk-aktig bygd, vind 25 m/s, alle skylder alle. |
| 9 | **Den andre i meg** | Psykologisk thriller | Fortelleren mistenker at en av hans egne deler er morderen. (Verity-sjiktet.) |
| 10 | **3,1 milliarder** | Sakprosa | Pengestrømmen i norsk visuell kunst. *Tallet må kildesjekkes før bruk.* |
| 11 | **Bacon på Tjuvholmen** | Satire | Kunstmarkedet som pyramidespill. |
| 12 | **Morfar sin hånd** | Roman | Kort, stille sorgroman. Bokhandel-anbefaling, juleflate. |
| 13 | **Lego på kreditt** | Essay | Barnet i voksen kropp som kjøper trøst. |
| 14 | **Systemet vil deg vel** | Sakprosa | Historiske overgrep fra staten, kronologisk, kildetung. |
| 15 | **Nattskift i hodet** | Selvhjelp for de som hater selvhjelp | Søvnløshet uten hvite rom. |
| 16 | **Bonden og bonden** | Samfunn | Klimakrav, import og norsk landbruk — begge sider faktisk sjekket. |
| 17 | **Hjemmekontoret** | Romantasy-parodi | BookTok-markedet, norsk humor. |
| 18 | **Taushetsplikt** | Krim | Terapeut drept, journalene er eneste vitne. |
| 19 | **Kvittering** | Fotobok + tekst | 365 kvitteringer = ett liv. |
| 20 | **Barnevernsbarn** | Antologi | Voksne som var der forteller. |
| 21 | **Hvor ble det av meg?** | Ungdom | Dissosiasjon for 15-åringer, uten skrekkfilm. |
| 22 | **Fattig i verdens rikeste land** | Sakprosa | Tall + 12 portretter. |
| 23 | **Rolig** | Gavebok | Små grep fra appen, pen innbinding. |
| 24 | **Gonzo i Nord** | Reportasje | Ett år med å kaste seg inn i alt — Thompson på Finnmarksvidda. |
| 25 | **Siste melding** | Thriller | AI-assistent er eneste som vet hva som skjedde. |

**Sterkest kommersielt (HYP):** #1, #9, #5. #1 har krok, sjanger-hull og deg som eneste kilde. Gi forlag 30 sider + kapitteloversikt, ikke ferdig bok.

---

## 4. Design25 — musikk: høy energi, mye følelse, rå tekst

**Hva lista sier (DOK):** Tobias Sten mest strømmede norske artist 2025, #1 på VG-lista feb 2026 med «Hånd i hånd». Ari Bajgora beste norske i 2025-årslista. Astrid S topp 5. **HYP:** norsk språk selger; låtene som vinner har kor på 25 sek, refreng du kan skrike i bilen, dialekt er et pluss.

Alle tekstlinjer under er nyskrevne for dette dokumentet.

| # | Tittel | Energi / sjanger | Hook (skisse) |
|---|--------|------------------|---------------|
| 1 | **Del opp** | Elektropop, 128 BPM | «Del opp, del opp, del meg i fire / ingen merker det før fakturaen ringer» |
| 2 | **Fjorden fryser** | Arena-ballade som eksploderer | «Si at du blir til fjorden fryser / så har vi i hvert fall vinteren» |
| 3 | **Ikke ring 113** | Punkpop | «Ikke ring 113, bare sitt her til det går over» |
| 4 | **Vi var mange** | Sakte → full kor | «Jeg var aldri alene, vi var mange i meg» |
| 5 | **Kl. 02:14** | Mørk R&B | Kjøp, angre, kjøp — refreng i tidsstempler |
| 6 | **Morfar** | Akustisk, bygger | «Jeg holdt hånda di da ordene gikk tom» |
| 7 | **Rente på rente** | Rap, hardt | Tallene som rim, vers som regneark |
| 8 | **53 knop** | Festival-EDM | Vind som drop |
| 9 | **Tom pose** | Indie-rock | Småbrødpose som symbol |
| 10 | **Inkassobrev** | Country-pop på norsk | Humor + smerte |
| 11 | **Hånd i hånd 2** | Svar-låt | Det motsatte perspektivet — hånda som slipper |
| 12 | **Pust** | Minimal pop | Refrenget er en pusteøvelse: 4 inn, 6 ut |
| 13 | **Alle andre har det bra** | Dansbar sorg | Instagram-ironi |
| 14 | **Batsverk** | Stedsanthem | Bygd-patriotisme med blåmerker |
| 15 | **Ingen hører** | Rock-ballade | Parentesene som skriker |
| 16 | **Lego** | Lekende synth | Barnet i deg |
| 17 | **Systemfeil** | Industrial pop | Stat som maskin |
| 18 | **Vi drikker til det blir sant** | Russelåt-energi | Fest + undertone |
| 19 | **Brev til deg om ett år** | Ballade | Tidskapsel |
| 20 | **Slipp det** | Oppløftende | Kjøpsbrems som låt — «slipp det, slipp det, du trenger det ikke» |
| 21 | **Nordlys på kreditt** | Pop | Romantikk du ikke har råd til |
| 22 | **Feil del våknet** | Alt-pop | Humor i dissosiasjon |
| 23 | **Ti minutter** | Duett | To mennesker venter ti minutter før de sier noe dumt |
| 24 | **Mor** | Ballade | Universell, julelista |
| 25 | **Overlevd** | Stadion-hymne | «Jeg er gal nok til å overleve dette» |

**Strategi (HYP):** Slipp #20 «Slipp det» og #1 «Del opp» som par — samme univers som Kjøpsbrems-appen og bok #1. Én historie, tre formater. TikTok-klippet: skjermopptak av Kjøpsbrems-nedtellingen mens refrenget går.

---

## 5. Design25 — AI-systemer og bedriftssystemer

| # | System | Kunde | Kjerne |
|---|--------|-------|--------|
| 1 | **Kildevakt** | Journalister, frilansere | Hver påstand får DOK/BER/HYP/MOTBEVIST/UAV-merke automatisk, med lenke. (Din egen arbeidsmetode som produkt.) |
| 2 | **Brevtolk B2B** | Gjeldsrådgivere i kommunene | Batch-tolkning av inkasso/NAV-brev, klar til saksbehandler. |
| 3 | **Fristbrudd-radar** | Pasientorganisasjoner | Sporer ventetider mot rett, varsler. |
| 4 | **Klarspråk-sjekk** | Offentlige etater | Leser vedtak før utsending, flagger uforståelig tekst. |
| 5 | **Tilbudsbygger for håndverkere** | Små firma | Foto + tale → ferdig tilbud på 3 min. |
| 6 | **Anbudsjeger** | SMB | Doffin-overvåking + utkast til svar. |
| 7 | **Møte-til-handling** | Alle | Opptak → oppgaver i Notion, eier og frist. |
| 8 | **Kundeservice med skam-sensor** | Inkasso/bank | Gjenkjenner når kunde er i krise, ruter til menneske. |
| 9 | **HMS-logg via tale** | Bygg | Avvik registreres på 20 sek. |
| 10 | **Kunstarkiv-AI** | Kunstnere | Katalog, priser, utstillingshistorikk, salgsoppgaver. |
| 11 | **Søknadsmaskin** | Kunstnere/frivillige | Kulturrådet/stiftelser, utkast fra prosjektnotat. |
| 12 | **Forfatter-agent** | Forlag | Leser manus, sammenligner med boklista, gir posisjonering. |
| 13 | **Hook-lab** | Låtskrivere | Tester refreng-varianter mot lyttere før innspilling. |
| 14 | **Frivillig-koordinator** | Lag og foreninger | Dugnad, vakter, påminnelser. |
| 15 | **Leietaker-assistent** | Leietakere | Husleielov i klarspråk, depositum-tvister. |
| 16 | **Gårdsregnskap-AI** | Bønder | Bilag fra foto, tilskuddsfrister. |
| 17 | **Turnus-fikser** | Helse/omsorg | Bytte vakter uten 40 SMS. |
| 18 | **Lokalavis-robot** | Lokalaviser | Kommunestyre-referat → nyhetsutkast med kilder. |
| 19 | **Klage-generator** | Forbrukere | Forbrukerkjøpsloven-klager, ferdig formulert. |
| 20 | **Onboarding-kamerat** | Nyansatte | Spør hva du vil, finner svar i interne dokumenter. |
| 21 | **Prisvakt for kafeer** | Serveringssted | Råvarepris → menyjustering. |
| 22 | **Kontrakt-røntgen** | Frilansere | Flagger felle-klausuler. |
| 23 | **Eldre-innsjekk** | Pårørende | Daglig samtale-robot, varsler ved avvik. |
| 24 | **Terapeut-forberedelse** | Pasienter | Strukturerer ukens logg før time. (Kobles til Rolig.) |
| 25 | **Design25-motor** | Deg | Dette dokumentet, automatisert hver uke med ferske lister. |

**Sterkest (HYP):** #1 Kildevakt — du bruker allerede metoden. #2 Brevtolk B2B — kommunen betaler, ikke den som er blakk.

---

## 6. Design25 — verdijakt (penger som ligger på bakken)

1. Ubrukte hobbyting → selg på Finn før neste kjøp (Kjøpsbrems-loggen viser hvilke).
2. Abonnement-rydding (#17 over) — typisk flere hundre kr/mnd. **HYP**
3. Søk gjeldsrådgivning i kommunen — gratis. **UAV** — NAV-kontor tilbyr økonomisk rådgivning; sjekk lokalt.
4. Sjekk om forbrukslån kan refinansieres.
5. Kunst du eier: få verdsettelse før du selger.
6. Pant/gjenbruk-rutine.
7. Selg eksisterende HTML-maler (Rolig-appen som mal) på Gumroad.
8. Selg prompt-pakker (Labben/Grok-bot) til andre byggere.
9. Fotobank: bilder fra fjorden, vind, vinter → stock-salg.
10. Skriv betalt nyhetsbrev (Substack) i gonzo-stil — én tekst per uke.
11. Lydbok av egne tekster.
12. Freelance VibeCode: små apper for lokale bedrifter.
13. Workshop: «Bygg din egen app på en kveld».
14. Søk Kulturrådet/Fritt Ord på bok #3. **UAV** — sjekk Fritt Ords gjeldende ordninger.
15. Innovasjon Norge oppstartstilskudd for #1/#3 i del 1. **UAV**
16. Skattefradrag — sjekk alle du har krav på.
17. Strømavtale-bytte.
18. Bruk biblioteket for alt du ellers kjøper.
19. Lisensier låtene til TikTok-skapere.
20. Sync-lisens: send #2 og #6 til TV-produsenter.
21. Gjør Kodak-saken til betalt longread.
22. Konsulentoppdrag i kildesjekk (din metode).
23. Merch fra låtuniverset.
24. Crowdfunding for bok #1 med forhåndssalg.
25. Selg «Design25»-formatet som tjeneste: 25 ideer på 24 timer.

---

## 7. Design25 — overraskelser nå

1. **Kjøpsbrems er live i repoet.** Åpne `kjopsbrems.html`.
2. **README/HULL lyver om 1.1** — `alert()`, nav-fiks og eksport mangler i `index.html`. Enten gikk endringene tapt, eller ble aldri committet. Neste patch bør gjøre dem på ordentlig.
3. **Ett univers, tre formater:** app «Kjøpsbrems» + låt «Slipp det» + bok «Del opp». Samme historie, samme publikum, tre inntektsstrømmer.
4. **Din kildemerkings-metode (DOK/BER/HYP/MOTBEVIST/UAV) er et produkt.** Ingen norske verktøy gjør det. **HYP.**
5. **Patent-regel:** ikke vis noen av idéene i del 2 offentlig før søk og eventuell søknad.

Sist: vinden uler fortsatt, renten tikker fortsatt, og det eneste som faktisk er bygget i dag er en knapp som sier *vent*. Kanskje det er hele poenget. Kanskje ikke.

---

## Kilder

- VG: [Spotify Wrapped 2025 — mest strømmede norske](https://www.vg.no/rampelys/i/XMlxqm/spotify-wrapped-2025-dette-er-aarets-mest-stroemmede-norske-artister-og-laater)
- VG: [2025-topplistene](https://www.vg.no/rampelys/i/d4O6zw/her-er-aarets-mest-populaere-musikk-i-norge)
- Nettavisen: [Spotify Wrapped 2025](https://www.nettavisen.no/kjendis/spotify-wrapped-2025-dette-horte-nordmenn-pa/s/5-95-2760729)
- Wikipedia: [Tobias Sten](https://en.wikipedia.org/wiki/Tobias_Sten) · [VG-lista](https://en.wikipedia.org/wiki/VG-lista)
- Samtiden: [Boklista januar 2026](https://www.samtiden.no/bok/hvor-blir-det-av-de-norske-romanforfatterne/1396595) · [Bestselgere september 2026](https://www.samtiden.no/bok/manedens-bestselgere-romaner-helse-og-influenserboker/1462090) · [April 2026](https://www.samtiden.no/bok/hun-har-trolig-utgitt-en-av-arets-virkelig-store-bestselgere/1421999)
- OsloMet Journalen: [Boksalget økte i 2025](https://journalen.oslomet.no/nb/innenriks/2026/01/boksalget-okte-i-2025)

Ikke funnet: offisiell VG-liste for oktober 2026 og fullstendig Bokhandlerforeningen-liste for 2026. Sjekk vg.no/vg-lista og bokhandlerforeningen.no direkte.
