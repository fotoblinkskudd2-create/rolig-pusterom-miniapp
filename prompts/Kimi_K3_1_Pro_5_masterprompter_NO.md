# Kimi K3.1 Pro — 5 masterprompter (NO)

Kimi K3.1 Pro er riktig navn. Moonshot fremhever særlig prosjektkoding, parametrisk 3D/CAD, økonomimodellering og lange oppgaver med verktøy. Promptene under er valgt ut fra disse styrkene og prosjektene.

**Bruk:** én prompt per ny økt i Kimi Code, med K3.1 Pro valgt og Thinking på.

1. [AI-briller: CAD-prototype og produktbilder](#1--ai-briller-bygg-cad-prototype-og-produktbilder)
2. [NaturFlyr: interaktiv 3D-flygelab](#2--naturflyr-bygg-en-interaktiv-3d-flygelab)
3. [Superkalkulatorer: fem beregningsmotorer](#3--superkalkulatorer-bygg-fem-beregningsmotorer)
4. [Small Wins Lab: spillbart 3D-produkt](#4--small-wins-lab-bygg-et-spillbart-3d-produkt)
5. [Agentfabrikk: faktisk gjennomføring med bevis](#5--agentfabrikk-bygg-faktisk-gjennomføring-med-bevis)

---

## 1 — AI-briller: bygg CAD-prototype og produktbilder

```text
Du skal bygge én konkret mekanisk prototype: KLYPE-01, en ny konseptvariant av en avtakbar kragemodul for AI-briller. Målet er å undersøke hvordan elektronikk og batterimasse kan plasseres utenfor brillestengene.

BAKGRUNN
Jeg utvikler produkter og er opptatt av AI-briller, varme ved tinningen, vekt, batteri og rimelig prototyping. Jeg vil ha redigerbar geometri, faktiske filer og bilder fra flere vinkler.

ARBEIDSKONTRAKT
Undersøk tilgjengelige verktøy og eventuelle vedlagte filer. Vedlegg går foran standardverdiene nedenfor. Mangler vedlegg, bygg med tydelig merkede antakelser. Gjennomfør modellering, eksport, kontroll og revisjon i samme oppdrag. Bruk samme kildegeometri til konstruksjon og visualisering.

AVGRENSNING
Bygg ett demonterbart kabinett med krageklips, utskiftbart mykt kontaktinnlegg, kabelavlastning, lokk og monteringspunkter. Vis elektronikk og batteri som dimensjonerte attrapper. Leveransen er en mekanisk prototype.

STARTVERDIER — FORSLAG
Ytre kabinett: 60 × 30 × 18 mm.
Elektronikkattrapp: 50 × 20 × 6 mm.
Batteriattrapp: 45 × 20 × 5 mm.
Nominell veggtykkelse: 2 mm.
Monteringsklaring: 0,3 mm per side.
Klipsen skal kunne tilpasses tekstiltykkelse 1–4 mm.
Mål for mekaniske deler: under 15 g. Vis eventuell overskridelse.

BYGG
1. Lag en parametrisk modell i CadQuery med parametere samlet i én JSON-fil. Kontroller at hulrom, lokk, attrapper og innfestinger passer sammen.
2. Eksporter separate deler og komplett sammenstilling som STEP og STL. Bruk meningsfulle delnavn.
3. Lag et Blender-Python-skript som importerer samme geometri, konverterer millimeter til meter korrekt og bygger materialer, lys og kameraer.
4. Generer seks separate bilder: front, bakside, side, ovenfra, eksplodert visning og montert på en enkel kragemodell.
5. Beregn volum og anslå mekanisk masse fra dokumentert materialtetthet. Hold mekanisk masse og antatt elektronikkmasse adskilt.
6. Lag en enkel materialliste og estimer prototypekostnad i NOK. Merk prisanslag som antakelser.

AKSEPTANSE
Alle eksporterte deler skal kunne åpnes igjen. Kontroller lukkede legemer, dimensjoner, veggtykkelse og utilsiktede kollisjoner. Endring av kabinettlengde i parameterfilen skal regenerere modellen uten manuell reparasjon.

Skill mellom geometrisk kontroll og fysisk verifisering. Klipskraft, hudtemperatur, styrke og komfort skal stå som uavklart dersom de ikke er målt eller beregnet.

LEVER
Komplett kildekode, parameterfil, eksporterte modeller, Blender-scene, seks bilder og kort monteringsbeskrivelse. Oppgi kjørekommandoer og kontrollresultater som BESTÅTT, FEILET eller IKKE KJØRT.

Merk konklusjoner OBSERVERT, BEREGNET eller HYPOTESE. Mangler et nødvendig program, lever komplett genereringsskript og merk tilhørende eksport IKKE GENERERT.

Begynn med å bygge.
```

---

## 2 — NaturFlyr: bygg en interaktiv 3D-flygelab

```text
Bygg NATURFLYR LAB: en lokal nettapplikasjon som lar meg undersøke hvordan masse, vingeflate, tyngdepunkt og vind påvirker en liten biomimetisk glideflymodell. Lever en fungerende simulator med synlig modell og inspiserbare beregninger.

BAKGRUNN
Jeg arbeider med NaturFlyr, biomimetikk, lette droner og 6DOF-simulering. Jeg trenger et utviklingsverktøy som avdekker svake antakelser før fysisk prototyping.

TEKNISK RAMME
Bruk TypeScript, React, Vite og Three.js. Hold fysikkmotoren uavhengig av grensesnittet. Bruk Web Worker dersom simuleringen blokkerer grensesnittet. Kjør lokalt uten betalte tjenester. Kontroller bibliotekenes dokumentasjon før du velger API-er.

FØRSTE MODELL
Bruk et stivt legeme med seks frihetsgrader, quaternion-orientering og dokumentert koordinatsystem. Start med en symmetrisk vinge og hale.

Foreslåtte forsøksverdier:
Masse: 180 g.
Vingespenn: 650 mm.
Vingeflate: 0,065 m².

Aerodynamiske koeffisienter, treghetsmoment og demping skal være synlige, redigerbare antakelser. Bruk en enkel løft- og motstandsmodell med oppgitt gyldighetsområde. Merk resultatene som forenklet simulering.

FUNKSJONER
* Roter og zoom i 3D.
* Vis tyngdepunkt, hastighetsvektor, løft, motstand, bane og skala.
* Endre masse, geometri, tyngdepunkt, startfart, vind og modellkoeffisienter.
* Start, pause, enkeltsteg, tilbakestill og lagre forsøk.
* Vis fart, høyde, angrepsvinkel, orientering og energi over tid.
* Sammenlign to konfigurasjoner under samme startbetingelser.
* Eksporter konfigurasjon som JSON og tidsserier som CSV.

NUMERISK KVALITET
Bruk fast simuleringstidssteg uavhengig av bildefrekvens, med begrenset antall opphentingssteg. Dokumenter integratoren.

Implementer separate referansemoduser:
1. Kraftfri bevegelse.
2. Fritt fall uten luft.
3. Symmetrisk rettlinjet tilfelle.

Kontroller quaternion-normalisering, enheter, NaN, ugyldige parametere og energidrift. Sammenlign resultater med halvert tidssteg og rapporter avvik. Bruk fast seed der tilfeldighet inngår.

ARBEIDSMÅTE
Fullfør først parameterendring → simulering → 3D-visning → CSV. Legg deretter til sammenligning og lagring. Kjør referansekontrollene før visuell polering. Bruk mørke flater og tydelige ingeniørdata.

AKSEPTANSE
Samme konfigurasjon og seed skal gi samme simuleringsdata innen oppgitt toleranse. Endret bildefrekvens skal ikke endre fysikkresultatet. Null lufttetthet skal fjerne aerodynamiske krefter. Ugyldige inndata skal håndteres uten krasj. Et eksportert forsøk skal kunne importeres og gjenskapes.

LEVER
Komplett prosjekt, låste avhengigheter, oppstartskommandoer, tre eksempelkonfigurasjoner, referansedatasett og faktisk kontrollresultat.

Skill mellom IMPLEMENTERT, KJØRT og FYSISK VALIDERT. Mangler kjøremiljø, lever komplette kildefiler og merk kjøring IKKE KJØRT.

Start implementeringen nå og fullfør den gjennomgående flyten.
```

---

## 3 — Superkalkulatorer: bygg fem beregningsmotorer

```text
Bygg MR ART ENGINEERING CALC: én lokal React/TypeScript-app med fem praktiske kalkulatorer. Jeg skal kunne sette inn egne tall, endre forutsetninger, sammenligne løsninger og eksportere beregninger. Alle numeriske resultater skal komme fra deterministisk kode.

BAKGRUNN
Jeg utvikler fysiske produkter, elektronikk, droner og småbedriftstjenester. Jeg har bedt om fem superkalkulatorer. Første leveranse skal gi etterprøvbare resultater og fungere uten eksterne tjenester.

BYGG DISSE FEM
1. BATTERI
   Beregn Wh fra nominell spenning og Ah, tilgjengelig energi, driftstid ved konstant effekt, reserveandel og virkningsgrad. Vis forenklingene bak nominell spenning og konstant effekt.
2. VARME
   Implementer én termisk RC-modell med effekttap, omgivelsestemperatur, termisk motstand og varmekapasitet. Vis temperatur over tid og stasjonær temperatur. Valider modellparametrene.
3. MEKANIKK
   Beregn arealtreghetsmoment, maksimal bøyespenning og nedbøyning for en rektangulær utkraget bjelke med punktlast i fri ende. Vis lastretning, enheter og forutsetninger. Materialdata skal ha kilde eller merkes som brukerdata.
4. ROTOR
   Beregn ideell indusert effekt ved statisk svev fra skyvekraft, lufttetthet og effektivt skiveareal. Vis ideell effekt og anslått elektrisk effekt separat. Definer behandlingen av flere ikke-overlappende rotorer og modellens begrensninger.
5. PRODUKTØKONOMI
   Beregn materialkostnad, arbeid, svinn, emballasje, frakt, faste kostnader, dekningsbidrag og nullpunkt. Skill margin fra påslag. Bruk NOK. Hold merverdiavgift som eksplisitt brukerparameter.

ARKITEKTUR
Bruk React, TypeScript og Vite. Lag separate, rene beregningsfunksjoner med SI-enheter internt. Konverter enheter ved inn- og utdata. Valider alle inndata. Bruk en kontrollert formelimplementasjon uten eval.

HVER KALKULATOR SKAL HA
* Redigerbare parametere.
* Formler med variabeldefinisjoner og kilder.
* Oppgitt gyldighetsområde.
* Resultatkort og relevant graf.
* To sammenlignbare scenarioer.
* Lokal lagring.
* JSON/CSV-eksport.
* Minst ett uavhengig håndberegnet referanseeksempel.

VALGFRI SPRÅKFUNKSJON
Lag en separat adapter som oversetter en vanlig setning til strukturerte inndata. Vis tolkningen før beregning. Beregningsmotoren skal produsere alle tall i resultatvisningen. Grunnappen skal virke uten API-nøkkel. Betalte kall krever uttrykkelig autorisasjon.

AKSEPTANSE
Et ideelt 10 Wh-batteri med 2 W last, uten reserve eller tap, skal gi 5 timer.

Varmeberegningen skal nærme seg omgivelsestemperatur pluss effekt ganger termisk motstand.

Doblet bjelkelast skal doble spenning og nedbøyning innen modellens antakelser.

Økonomimodulen skal håndtere negativt dekningsbidrag og nullpunkt uten misvisende divisjon.

Samme lagrede scenario skal gi samme resultat etter gjenåpning. Kontroller enhetskonverteringer, grenseverdier og feilhåndtering.

LEVER
Komplett app, beregningsmotorer, relevante kontroller, eksempeldatasett og oppstartskommandoer. Oppgi kilder til formlene, faktiske kontrollresultater og uløste antakelser.

Kan du ikke kjøre koden, merk dette IKKE KJØRT og lever komplette filer. Start implementeringen nå.
```

---

## 4 — Small Wins Lab: bygg et spillbart 3D-produkt

```text
Bygg SMALL WINS LAB som et ferdig spillbart 3D-prototypespill i Godot. Undersøk én konkret idé fra læringsprosjektet mitt: små romlige oppgaver med rask, synlig mestring og få distraksjoner.

BAKGRUNN
Jeg utvikler Small Wins Lab, et modulært læringskonsept for barn med behov for oversiktlige oppgaver. Leveransen er en spillprototype. Eventuell læringseffekt må undersøkes senere.

SPILLMEKANIKK
Spilleren bygger en liten bro ved å flytte og rotere geometriske moduler inn i riktige posisjoner. Vis én oppgave om gangen. Bruk tre former i starten og utvid gradvis.

Korrekt plassert modul festes tydelig. Når broen er komplett, går en liten figur over den. Neste oppgave åpnes med ett trykk.

OMFANG
* Tolv korte nivåer med kontrollert progresjon.
* Første nivå lærer én handling gjennom selve spillet.
* Dra og slipp med mus eller berøring.
* Alternativ betjening med velg-og-plasser.
* Roter, angre siste handling, prøv igjen og be om visuelt hint.
* Standardmodus uten tidspress.
* Lyd og animasjon kan slås av.
* Lokal lagring av fullførte nivåer og innstillinger.
* Enkel voksenvisning med fullførte oppgaver og antall forsøk.

TEKNISK UTFØRELSE
Bruk en tilgjengelig stabil Godot 4-versjon og GDScript. Dokumenter eksakt versjon. Generer moduler, materialer, figur og scener programmatisk eller fra egne enkle kildefiler.

Bruk lokale ressurser uten betalte eiendeler eller eksterne kontoer. Hold nivådata adskilt fra spillogikken. Lever project.godot, scener, skript og alle nødvendige ressurser.

NIVÅKVALITET
Lag nivåene fra eksplisitte løsningsdata, slik at hvert nivå kan fullføres. Valider at nødvendige brikker finnes, at målposisjonene er gyldige, og at rotasjonssymmetri behandles riktig.

Ferdigmelding skal utløses av faktisk brikkeplassering. Gjentatt input under feiringen skal ikke ødelegge spilltilstanden.

DESIGN
Bruk tydelig kontrast, store treffområder, rolig kameraføring og et taktilt, fysisk uttrykk. Riktig og feil skal kunne forstås med form eller symbol i tillegg til farge.

Bruk korte norske etiketter. La visuelle effekter støtte handlingen. Hold menyer små og oppgaven synlig.

AKSEPTANSE
Hele kjeden skal fungere:
Oppstart → første oppgave → plassering og rotasjon → fullført bro → neste nivå → lagring → gjenåpning.

Kontroller ugyldig slipp, angre, omstart og alle tolv løsninger. Prøv mus og berøring der miljøet støtter det. Oppgi faktisk testet plattform.

LEVER
Komplett Godot-prosjekt, kjørbar eksport for tilgjengelig målplattform, nivådata, faktisk skjermbilde og kort kontrollogg.

Mangler eksportverktøy, merk EKSPORT IKKE KJØRT og lever et komplett kildeprosjekt.

Fullfør én gjennomførbar spillopplevelse før ekstra funksjoner. Begynn nå.
```

---

## 5 — Agentfabrikk: bygg faktisk gjennomføring med bevis

```text
Bygg AGENTFABRIKK CORE: et lokalt system som tar imot et avgrenset oppdrag, utfører en arbeidsflyt, lagrer faktiske artefakter og viser hva som er kontrollert.

Skill eksplisitt mellom oppdrag skrevet, kode laget, kode kjørt og resultat godkjent.

BAKGRUNN
Jeg bygger VERK og Agentfabrikk for en soloprenør og norske småbedrifter. Jeg trenger kontinuitet, målbar fremdrift, kontrollerbare kostnader og tydelig overlevering. Hver agentrolle skal ha en implementert funksjon.

FØRSTE ARBEIDSFLYT
Input er en lokal CSV med oppdiktede produktlinjer og feltene produkt, antall, enhetskostnad og salgspris.

Systemet skal:
1. Validere innholdet.
2. Finne manglende eller ugyldige rader.
3. Beregne omsetning og dekningsbidrag for gyldige rader.
4. Produsere lokal HTML-visning, JSON-resultat og avviksfil.

Grunnløpet skal fungere uten modelltilgang og merkes som deterministisk referanseflyt.

ARKITEKTUR
Bruk Python, FastAPI og SQLite med et lite React/TypeScript-grensesnitt. Lag vedvarende oppdrag, trinn, hendelser og artefaktmetadata. Start med én worker.

Bruk tilstandene QUEUED, RUNNING, WAITING_INPUT, SUCCEEDED, FAILED og CANCELLED.

Hvert oppdrag skal ha mål, inngangsfiler, akseptansekriterier, tidsgrense og kostnadsgrense.

MODELLINTEGRASJON
Implementer én faktisk adapter til dokumentert Kimi-API med nøkkel fra miljøvariabel. Verifiser endepunkt, modell-ID og responsformat i aktuell offisiell dokumentasjon. Kontroller forskjellen mellom Kimi Code-abonnementets API og plattform-API.

Bruk strukturerte svar med skjemavalidering. La modellen velge mellom implementerte, navngitte verktøy innenfor oppdragets grenser. Verktøyutførelsen skal være kontrollert; returnert shellkode skal ikke kjøres vilkårlig.

Modellflyten skal være eksplisitt aktivert. Uten nøkkel vises IKKE KONFIGURERT. En mock skal hete MOCK.

GJENNOMFØRINGSKRAV
* Hvert trinn får inputreferanse, outputreferanse, start/slutt og feilstatus.
* Artefakter lagres i oppdragets mappe med hash og kobling til trinnet som laget dem.
* SUCCEEDED krever kontrollerte akseptansekriterier.
* Omstart skal finne avbrutte oppdrag og gjenoppta fra sikkert kontrollpunkt uten dobbel levering.
* Avbryt, tidsgrense og begrenset retry skal fungere.
* Kostnad vises som kjent, estimert eller ukjent.
* Betalte modellkall skal stoppes dersom gyldig kostnadsgrense ikke kan håndheves.
* Første versjon arbeider lokalt uten eksterne meldinger eller publisering.

KONTROLL OG MOTPRØVER
Kjør referanseflyten med et kjent datasett.

Prøv feil filformat, negativt antall, manglende felt, worker-stans, dobbelt innsendt oppdrag og kansellering.

Kontroller at en generert HTML-fil ikke blir godkjent hvis JSON-resultatet eller avviksfilen mangler.

Verifiser modelladapteren med HTTP-mock. Rapporter separat om et faktisk modellkall er gjennomført.

LEVER
Komplett kjørbart prosjekt, databaseoppsett, eksempeldata, oppstartskommandoer og én ferdig referansekjøring med artefakter og kontrollresultater.

Vis oppdragsstatus, trinn, avvik og nedlastbare filer i grensesnittet. Lever en kort tilstandsfil som neste arbeidsøkt kan bruke.

Oppgi separat hva som er DEMO, IMPLEMENTERT, KJØRT og BESTÅTT. Mangler kjøremiljø, lever full kode og marker kjøringen IKKE KJØRT.

Start med én fungerende vertikal flyt og fullfør den.
```
