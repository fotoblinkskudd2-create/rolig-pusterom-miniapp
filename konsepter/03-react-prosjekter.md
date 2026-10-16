# 3. FEM BANEBRYTENDE VIBE-CODING-PROSJEKTER I REACT

> Regel nummer én: hvis ideen finnes som 400 apper i App Store, er den død. Todo-apper, «AI-dagbok», «ChatGPT for X» — kastet i fjorden.
> Regel nummer to: hver app må ha en **kjerne som ikke er en prompt**. Noe deterministisk, noe målbart, noe som gjør at en konkurrent ikke kan kopiere den på en ettermiddag.

| # | App | Kjerne som ikke er en prompt | Vanskelighetsgrad |
|---|---|---|---|
| 3.1 | **Brevknuseren** | Fristkalkulator + gebyrsjekk mot regelverk | Middels |
| 3.2 | **Pulsspeil** | Puls fra kamera (rPPG) i nettleseren + resonanspust | Middels–høy — **prototype bygget** |
| 3.3 | **Selvforsøket** | Randomisert, blindet N-of-1-design + Bayesiansk analyse | Middels |
| 3.4 | **Tidsvinduet** | Gjenfotografering: justere historiske foto mot kameraet ditt | Høy |
| 3.5 | **Impulsbremsen** | Karantenesløyfe for kjøp + «konsensuskjøp» for systemer med flere deler | Lav–middels |

Felles stabel (anbefalt): **Vite + React + TypeScript**, Tailwind eller vanilla CSS-tokens, Zustand for tilstand, IndexedDB (via `idb`) for lokal-first lagring, PWA. AI-kall via en tynn serverløs proxy (Cloudflare Workers / Vercel Functions) slik at API-nøkler aldri ligger i klienten.

---

## 3.1 BREVKNUSEREN
### Ta bilde av et brev fra staten eller inkasso. Få vite hva det betyr, hva fristen er, og hva du kan gjøre — på 30 sekunder.

**Brukerproblem**
Folk under økonomisk og psykisk press åpner ikke brev. **[A]** Det er ikke latskap — det er unngåelse fordi brevene er uforståelige og truende. Konsekvensen er tapte frister, økte gebyrer og tapte rettigheter.

**Løsning**
Fotografer brevet → appen leser det → viser fire ting, i denne rekkefølgen:
1. **Hvor farlig er dette?** (Grønt / gult / rødt — med begrunnelse)
2. **Hva vil de?** (Én setning)
3. **Når må du gjøre noe?** (Nedtelling i dager, legg i kalender)
4. **Hva kan du gjøre?** (2–3 konkrete valg, med ferdig utkast til svar)

Pluss den deterministiske kjernen: **Gebyrsjekken** — sammenligner salær/gebyrer i inkassobrev med gjeldende maksimalsatser i inkassoforskriften, og flagger mulig foreldelse.

**Hvorfor dette ikke bare er «ChatGPT med kamera»:**
- Regelverk og satser ligger som *versjonerte data* (`satser/2026.json`), ikke som modellkunnskap.
- Fristberegning skjer i kode med testede regler (forkynnelsestidspunkt, helg/helligdag-forskyvning der det gjelder).
- Svarutkastene bygger på maler som er gjennomgått av jurist.
- Det er inngangsporten til KONTRADIKSJON (kap. 1).

**Målgruppe**
Primær: voksne med gjeld, NAV-saker, eller psykisk belastning (Norge: hundretusener **[A]**). Sekundær: pårørende som hjelper, gjeldsrådgivere i kommuner/NAV, frivillige organisasjoner (Kirkens Bymisjon, Frelsesarmeen).

**Brukeropplevelse**
- Første skjerm: én stor knapp — «Ta bilde av brevet». Ingen konto.
- Beroligende design (lån fra Pusterom: myke farger, ingen røde alarmer uten forklaring).
- «Jeg orker ikke lese»-modus: appen leser opp oppsummeringen med rolig stemme.
- Alle brev lagres lokalt i en «brevmappe» med tidslinje.

**Viktigste funksjoner**
1. Kamera + flerside-skanning (perspektivkorrigering)
2. Klassifisering av avsender og brevtype (inkassovarsel, betalingsoppfordring, vedtak, forhåndsvarsel, utleggsvarsel)
3. Ekstraksjon: beløp, datoer, saksnummer, kreditor, hovedstol vs. renter vs. gebyrer
4. Fristkalkulator + kalendereksport (.ics)
5. Gebyrsjekk (inkasso) + foreldelsessjekk (veiledende)
6. Svarutkast: be om nedbetalingsavtale, innsigelse, klage, be om innsyn
7. «Ring-skript»: hva du skal si når du ringer inkassobyrået
8. Eksport av saksmappe til rådgiver (PDF)

**Teknisk arkitektur**
```
[React PWA]
  ├─ Kamera (getUserMedia) → bildeforbedring (canvas, OpenCV.js valgfritt)
  ├─ Lokal lagring (IndexedDB): brev, ekstraksjoner, frister
  ├─ Regelmotor (TS, i klient): frister, gebyrsjekk, foreldelse
  └─ API-proxy (serverløs) ──▶ Vision-LLM (OCR + strukturert ekstraksjon, JSON-schema)
                               (bilde slettes hos proxy etter kall, ingen logging av innhold)
```

**API-er**
- Vision-kapabel LLM (strukturert output med JSON-schema)
- Ingen offentlige API-er nødvendig i MVP. Senere: Gjeldsregisteret (krever samtykkeflyt via godkjent aktør **[A]**), helligdagskalender.

**Datamodell**
```ts
interface Brev {
  id: string; mottatt: string; bilder: Blob[];
  avsender: { navn: string; type: 'inkasso'|'nav'|'skatt'|'lanekassen'|'namsmann'|'annet' };
  brevtype: 'inkassovarsel'|'betalingsoppfordring'|'vedtak'|'forhandsvarsel'|'utleggsvarsel'|'annet';
  belop?: { hovedstol?: number; renter?: number; gebyrer?: { navn: string; belop: number }[]; total?: number };
  frister: Frist[]; saksnummer?: string;
  flagg: Flagg[];           // fra regelmotoren
  oppsummering: string;     // fra LLM, kort
  risiko: 'gronn'|'gul'|'rod';
}
interface Frist { dato: string; type: string; kilde: 'ekstrahert'|'beregnet'; regel?: string }
interface Flagg { kode: 'GEBYR_OVER_MAKS'|'MULIG_FORELDET'|'MANGLER_SPESIFIKASJON'|'KORT_FRIST';
                  forklaring: string; hjemmel?: string; alvor: 1|2|3 }
```

**Prototype (komponenttre)**
```
<App>
  <BrevListe/>                // tidslinje over brev, sortert etter nærmeste frist
  <SkannFlyt>
    <Kamera/> → <Beskjæring/> → <Analyserer/> (rolig animasjon, ikke spinner)
  </SkannFlyt>
  <BrevVisning>
    <Risikokort/> <HvaVilDe/> <Nedtelling/> <Valg/> <SvarUtkast/> <Gebyrsjekk/>
  </BrevVisning>
</App>
```

**Utviklingsplan (6 uker, én utvikler + AI)**
| Uke | Leveranse |
|---|---|
| 1 | Kamera, lokal lagring, ekstraksjon via LLM med JSON-schema, 20 testbrev (syntetiske) |
| 2 | Regelmotor: frister + gebyrsjekk + 100 enhetstester. Satsfil versjonert. |
| 3 | UI: risikokort, nedtelling, kalender-eksport |
| 4 | Svarutkast-maler (få gjennomgått av jurist/gjeldsrådgiver) |
| 5 | Brukertest med 5–8 personer via frivillig organisasjon. Opplesning. |
| 6 | PWA, personvernerklæring, DPIA-light, lansering i lukket beta |

**Forretningsmodell:** Gratis for privatpersoner (alltid). Betalt rådgiverversjon (kommuner, organisasjoner). Mulig finansiering: Stiftelsen Dam, Sparebankstiftelsen, Innovasjon Norge. **[A]**

**Risiko:** Feil i satser → feil råd. Tiltak: satsfil med kilde og dato, tydelig «veiledende», og «Få hjelp av et menneske»-knapp (lenke til NAVs økonomirådgivning 55 55 33 39 **[F: verifiser nummeret før lansering]**).

---

## 3.2 PULSSPEIL
### Pust i takt med ditt eget hjerte — målt med kameraet du allerede har.

> **En fungerende prototype ligger i [`../prototyper/pulsspeil.html`](../prototyper/pulsspeil.html)**, med signalbehandlingen i `pulsspeil-dsp.js` og en syntetisk test i `pulsspeil-dsp.test.js`.

**Brukerproblem**
Pusteøvelser virker best når de tilpasses kroppen. Hjertefrekvensvariabilitet (HRV)-biofeedback og «resonanspust» rundt 6 pust/min har solid forskningsbase for stressreduksjon **[F: Lehrer & Gevirtz m.fl.]**. Men det krever en brystsele eller smartklokke. De fleste har ikke det — og de som trenger det mest, har det minst.

**Løsning**
Nettleseren bruker frontkameraet til å måle små fargeendringer i huden som følger hjerteslagene (**remote photoplethysmography, rPPG [F]**: etablert forskningsfelt, f.eks. POS-algoritmen, Wang mfl. 2017). Appen viser pulsen i sanntid og lar en pustesirkel guide deg. Når du puster rundt din resonansfrekvens, begynner pulsen å svinge synlig opp og ned i takt med pusten (respiratorisk sinusarytmi). **Det er det du ser i speilet: hjertet ditt som svarer.**

**Hvorfor dette er nytt [A]:** rPPG finnes i forskning og noen kommersielle SDK-er, og pusteapper finnes i tusenvis. Kombinasjonen — *helt lokal, uten app-installasjon, uten wearable, gratis, med visuell RSA-tilbakemelding* — er sjelden. Må verifiseres med marked/prior art-søk.

**Målgruppe:** Brukerne av Pusterom. Folk med stress, angst, søvnvansker. Skoler (pust før prøve). Terapeuter som vil vise klienter biofeedback uten utstyr.

**UX**
1. «Hold ansiktet i ovalen. Sitt stille. Lys forfra.»
2. Signalkvalitetsmåler (rød → gul → grønn) i 5–10 sekunder.
3. Pustesirkel (5,5 pust/min som standard, justerbar 4,5–7).
4. Pulskurve under sirkelen. Når kurven bølger med pusten, glir bakgrunnen mot varmere farge.
5. Etter økt: «Pulsbølgen din var X slag/min høy» (RSA-amplitude) — lagres i Pusterom-historikken.

**Ærlige begrensninger [F/A]**
- rPPG påvirkes av bevegelse, lys og hudtone. Nøyaktigheten er dokumentert lavere for mørkere hudtoner i flere studier **[F]** — må testes og kommuniseres.
- HRV-mål fra rPPG er mindre presise enn fra EKG. Prototypen viser derfor *puls* og *pulsbølge*, ikke kliniske HRV-tall.
- **Ikke medisinsk utstyr.** Ingen diagnose.

**Funksjoner**
- Puls (FFT-topp i 0,7–3 Hz-båndet)
- Signalkvalitet (SNR rundt topp)
- Pustepacer med justerbar frekvens
- Pulsbølge-graf og RSA-estimat
- Alt lokalt — ingen bilder forlater enheten

**Arkitektur**
```
<video> (getUserMedia, 640×480) → <canvas> → ROI-gjennomsnitt (R,G,B) per frame
   → ringbuffer med tidsstempler (~30 Hz)
   → resampling til jevn 30 Hz
   → POS-algoritme (glidende vindu 1,6 s, overlap-add)
   → båndpass (FFT-maskering 0,7–3,0 Hz)
   → topp → BPM  |  SNR → kvalitet  |  BPM-tidsserie → RSA
```
**API-er:** Kun nettleser (MediaDevices, Canvas, requestAnimationFrame). Ingen server.

**Datamodell**
```ts
interface Okt { start: string; varighetSek: number; pustPerMin: number;
  bpmSerie: { t: number; bpm: number; kvalitet: number }[];
  rsaAmplitude?: number; snittBpm: number }
```

**Utviklingsplan**
| Fase | Innhold |
|---|---|
| Dag 1–2 | Prototype (ferdig i dette repoet): kamera, POS, FFT, pacer |
| Uke 1–2 | Ansiktsdeteksjon (MediaPipe Face Landmarker) for stabil ROI på panne + kinn; bevegelsesavvisning |
| Uke 3 | Validering: sammenlign med pulsoksymeter/brystsele på 10–20 personer med ulik hudtone. Publiser resultatene åpent. |
| Uke 4 | React-port, integrasjon i Pusterom-historikk, PWA |
| Senere | Personlig resonansfrekvens-test (prøv 4,5 / 5 / 5,5 / 6 / 6,5 pust/min, velg den med størst RSA — kjent protokoll fra HRV-biofeedback **[F]**) |

---

## 3.3 SELVFORSØKET
### Finn ut om kaffen faktisk ødelegger søvnen *din*. Med ekte vitenskapelig metode. På deg selv.

**Brukerproblem**
Alle prøver ting: magnesium, kaffekutt, skjermfri kveld, kreatin, kald dusj, meditasjon. Ingen vet om det virker *for dem*, fordi de tester det ukontrollert, med forventningseffekt, og husker selektivt.

**Løsning**
En app som designer et **N-of-1-forsøk** — en etablert metode i klinisk forskning **[F]**: randomisert, blokkdesignet (A/B i tilfeldig rekkefølge innen blokker), helst blindet, med forhåndsregistrert utfallsmål og en Bayesiansk analyse til slutt som sier: *«Med 87 % sannsynlighet sover du minst 15 minutter lenger uten kaffe etter kl. 14.»*

**Hvorfor nytt [A]:** Akademiske N-of-1-plattformer finnes (f.eks. StudyU **[A: verifiser]**), og selvsporingsapper finnes. Men en *forbrukerapp* som gjør hele den vitenskapelige designjobben, inkludert blinding der det er mulig (kapsler i like bokser, en venn som pakker), forhåndsregistrering og ærlig analyse, er sjelden. Den sosiale vinklingen: **del resultatet ditt anonymt** → aggregert «hva virker for folk som ligner deg».

**Målgruppe:** Selvoptimerere, folk med kroniske plager (migrene, IBS, søvn), helseinteresserte 25–55. Senere: klinikere som vil kjøre N-of-1 med pasienter.

**UX**
1. «Hva vil du teste?» → velg fra bibliotek (kaffe etter kl. 14, magnesium, skjerm etter 22, alkohol, trening om kvelden) eller lag eget.
2. «Hva vil du måle?» → søvnkvalitet 1–10, søvntimer (eller import fra Apple Health/Google Fit), energi, smerte, humør.
3. Appen lager plan: f.eks. 6 blokker à 2 uker, randomisert A/B per uke innen blokk, med utvaskingsdager.
4. Daglig: én påminnelse, 10 sekunders logging.
5. Slutt: Resultatkort med fordelingskurve, sannsynlighet for meningsfull effekt, og ærlige forbehold.

**Kjernealgoritmer (deterministisk)**
```ts
// Randomisert blokkdesign: hver blokk inneholder én A- og én B-periode i tilfeldig rekkefølge
function lagPlan(antallBlokker: number, dagerPerPeriode: number, seed: number) {
  const rng = mulberry32(seed); const plan: ('A'|'B')[] = [];
  for (let b = 0; b < antallBlokker; b++) {
    const rekkefølge = rng() < 0.5 ? ['A','B'] : ['B','A'];
    for (const arm of rekkefølge) for (let d = 0; d < dagerPerPeriode; d++) plan.push(arm as 'A'|'B');
  }
  return plan;
}
// Analyse: Bayesiansk estimat av differanse (B − A) per blokk,
// normal-likelihood med ukjent varians → posterior for gjennomsnittlig effekt (t-fordeling).
// Rapporter P(effekt > minste meningsfulle forskjell), ikke bare p-verdi.
```
Utvaskingsdager ekskluderes fra analysen. Autokorrelasjon håndteres ved å analysere *periodegjennomsnitt* per blokk, ikke enkeltdager.

**Arkitektur:** React PWA, IndexedDB, ingen server nødvendig. Valgfri anonym aggregering (opt-in) via enkel backend (Supabase). Valgfri LLM: hjelpe brukeren å formulere et testbart spørsmål og velge riktig utfallsmål.

**Datamodell**
```ts
interface Forsok { id: string; spørsmål: string; armA: string; armB: string;
  utfall: { navn: string; skala: [number, number]; retning: 'høyere_bedre'|'lavere_bedre' };
  minsteMeningsfulleForskjell: number; plan: ('A'|'B')[]; utvaskingDager: number;
  forhandsregistrert: string; /* ISO-tid, låst */ blindet: boolean; seed: number }
interface Logg { forsokId: string; dato: string; verdi: number; etterlevelse: boolean; notat?: string }
```

**Utviklingsplan (5 uker):** Uke 1 plan-generator + logging; uke 2 analysemotor med tester mot simulerte data (kjent sann effekt → gjenfinnes?); uke 3 resultatkort + visualisering (fordelingskurve); uke 4 testbibliotek med 15 forhåndsdesignede forsøk; uke 5 beta.

**Kommersielt:** Freemium (avanserte design, eksport til lege). B2B til klinikker. Viral mekanikk: delbare resultatkort («Jeg testet kaffe i 12 uker. Her er sannheten.»).

**Risiko:** Folk bruker det til å teste ting de *ikke burde* (seponere medisiner). Tiltak: blokker forsøk som involverer reseptbelagte legemidler uten legekobling; tydelig advarsel.

---

## 3.4 TIDSVINDUET
### Hold mobilen opp mot en gate. Se den samme gata i 1912 — perfekt justert over virkeligheten.

**Brukerproblem**
Historie er abstrakt. Folk går forbi steder hver dag uten å ane at huset der var et sykehus for spanskesyke, eller at torget var en havn.

**Løsning**
Appen finner historiske fotografier tatt nær der du står (Digitalt Museum, Nasjonalbiblioteket, lokale arkiv), og hjelper deg å **gjenfotografere** dem: den viser det gamle bildet som en halvgjennomsiktig hinne og guider deg («gå 3 meter til venstre», «senk mobilen») til perspektivet matcher. Så kan du dra en glidebryter mellom da og nå. Til slutt: en kort, kildebasert fortelling om hva som skjedde der det året — hentet fra avisene fra samme år.

**Det tekniske triks [A]:** Bildejustering med nøkkelpunktmatching (ORB/SIFT i OpenCV.js) eller moderne lærte matchere mellom kamerabilde og historisk foto, homografi-estimat, og veiledning basert på estimert kameraforskyvning. Bygninger er robuste ankerpunkter; trær og biler er støy.

**Prior art [A]:** Rephotography-apper og «then and now»-tjenester finnes (f.eks. Timera-lignende tjenester, museumsapper), men kombinasjonen *automatisk perspektivveiledning + åpne norske arkiver + samtidig avisfortelling* er sjelden. Må undersøkes.

**Målgruppe:** Turister, lokalhistorikere, skoler (ekskursjon), eldre (minnearbeid), kommuner/museer (B2B).

**Funksjoner**
1. Kart med historiske bilder rundt deg (klynger per tiår)
2. AR-overlegg + perspektivguide
3. Da/nå-glidebryter, eksport som video (viral)
4. «Hva skjedde her i 1912?» — kort fortelling basert på samtidige aviser (NB), med kildelenker
5. Brukerbidrag: last opp dine egne gamle familiebilder til stedet (moderert)

**API-er og data**
- Digitalt Museum / KulturNav API (åpent API **[F]**), med lisens per bilde (mange CC BY / offentlig eiendom, men **ikke alle** — vis lisens og filtrer).
- Nasjonalbiblioteket API (søk i bilder og aviser **[F]**).
- Kartverket (bakgrunnskart, stedsnavn).
- Norge i bilder har historiske ortofoto **[F]** — bruksvilkår må sjekkes for app-bruk.
- LLM for å oppsummere aviskilder → *alltid med lenke til originalen*.

**Datamodell**
```ts
interface HistoriskFoto { id: string; kilde: 'dimu'|'nb'|'bruker'; url: string;
  lisens: string; år?: number; årUsikkerhet?: number;
  posisjon?: { lat: number; lon: number; presisjonM: number };
  retning?: number; beskrivelse?: string }
interface Gjenfoto { fotoId: string; tatt: string; homografi: number[]; brukerBilde: Blob }
```

**Utviklingsplan (8 uker):** uke 1–2 kart + datauthenting + lisensfilter; uke 3–5 justeringsmotor (start manuelt: brukeren justerer opasitet/skala, deretter automatisk); uke 6 fortellingsmodul med kildekrav; uke 7 video-eksport; uke 8 pilot med et lokalhistorielag.

**Kommersielt:** Gratis app; lisens til kommuner/museer for kuraterte «tidsvandringer»; skolepakker.

**Største hindring:** Mange historiske bilder mangler presis geolokasjon. **Løsning:** Crowdsourcing — første bruker som gjenfotograferer et bilde, *geolokaliserer* det for alle andre. Det er en verdifull datagave tilbake til arkivene.

---

## 3.5 IMPULSBREMSEN
### En karantenestasjon for kjøp. Og en demokratisk forsamling for hoder med flere stemmer.

**Brukerproblem**
Kjøp nå, betal senere-tjenester og ett-klikks-kjøp gjør impulskjøp nesten friksjonsløse. For mennesker med ADHD, dissosiative lidelser, bipolar lidelse, avhengighet eller ekstrem stress er dette ikke en livsstilsfeil — det er en felle. **[A]** I tillegg finnes en gruppe som nesten ingen designer for: mennesker med dissosiativ identitetslidelse (DID/OSDD), der en del kan gjøre et kjøp som en annen del ikke husker. Pakker på døra, ingen minne, bare beviset i bankappen.

**Løsning**
1. **Karantenesløyfa:** Del en lenke til appen (fra nettbutikk, via mobilens «del»-meny) i stedet for å kjøpe. Varen havner i karantene i 72 timer (justerbart). Appen viser:
   - Prisen omregnet til **timer av ditt arbeid** (eller dager av stønaden din)
   - Hva det faktisk koster med BNPL-gebyr eller kredittrente hvis du ikke betaler i tide
   - Hvor mange av dine tidligere karantenevarer du endte opp med å *ikke* kjøpe (det gir mestring)
2. **Konsensuskjøp (for systemer med flere deler):** Et valgfritt modus der kjøp over en grense krever at «en annen» bekrefter — en del som har en egen PIN, eller en tillitsperson. Interne meldinger mellom deler («Jeg vet du ville ha Lego. Vi kan kjøpe det på fredag når husleia er betalt.»). Skrevet *med* plurale personer, ikke *om* dem.
3. **Etter-kjøp uten skam:** Hvis noe *ble* kjøpt: angrerett-assistent (angrerettloven: 14 dager for fjernsalg **[F]**), med ferdig angreskjema og frist-nedtelling.

**Prior art [F/A]:** Simply Plural finnes som app for systemer (frontlogging, chat). Budsjettapper finnes. Nettleserutvidelser som utsetter kjøp finnes i små varianter. **Kombinasjonen** karantene + angrerettassistent + plural konsensusmodus er etter alt å dømme ny **[A]**.

**Målgruppe:** Personer med impulsutfordringer (ADHD-diagnoser har økt kraftig i Norge **[F: Reseptregisteret viser sterk økning i ADHD-medisinbruk]**), plural-fellesskapet (lite men svært lojalt og digitalt aktivt), gjeldsrådgivere som kan anbefale verktøyet.

**UX-prinsipper**
- Null moralisering. Null skam. Ingen røde tall. Appen er en *alliert*, ikke en forelder.
- Karantene er ikke forbud: du kan alltid kjøpe. Men du må vente, og du ser hva det koster.
- Plural-modus: hver del kan ha eget navn, farge, aldersindikator (valgfritt); «hvem er her nå»-knapp.

**Funksjoner (MVP)**
1. Del-til-app-mottak (PWA Web Share Target) + manuell inntasting
2. Karanteneliste med nedtelling
3. Timer-av-livet-kalkulator (netto timelønn eller månedlig stønad / timer)
4. BNPL-kostnadssimulator (gebyrer ved for sen betaling, rente ved delbetaling)
5. Angrerettassistent med fristnedtelling og skjema
6. Plural-modus: deler, PIN per del, interne meldinger, konsensuskrav
7. Statistikk: «Penger du ikke brukte»

**Arkitektur:** React PWA, IndexedDB, **ingen server og ingen bank-integrasjon i MVP** (bankdata via PSD2 krever konsesjon eller partner **[F]**). Senere: nettleserutvidelse som avbryter kassen i populære nettbutikker og sender varen til karantene.

**Datamodell**
```ts
interface Vare { id: string; url?: string; navn: string; pris: number; butikk?: string;
  lagtTil: string; karanteneTil: string; status: 'karantene'|'droppet'|'kjøpt'|'angret';
  lagtTilAvDel?: string; godkjentAvDel?: string[]; betaling?: 'kort'|'bnpl'|'kreditt' }
interface Del { id: string; navn: string; farge: string; pinHash?: string; notat?: string }
interface Melding { fraDel: string; tilDel?: string; tekst: string; tid: string }
```

**Utviklingsplan (4 uker):** uke 1 karantene + kalkulator; uke 2 angrerettassistent; uke 3 plural-modus utviklet **sammen med** 3–5 plurale testbrukere (betalt for tiden sin); uke 4 PWA + Web Share Target + beta.

**Kommersielt:** Gratis grunnversjon. «Penger spart»-fortellingen er sterkt viralt materiale. Mulig partnerskap med banker som ønsker å vise samfunnsansvar (men pass på at banken ikke får data).

---

## Fellesnevner: Pusterom-økosystemet
Pulsspeil, Impulsbremsen og Brevknuseren kan alle leve som moduler i Pusterom-appen i dette repoet: **pust → forstå brevet → ikke kjøp den robotstøvsugeren.** Samme design, samme lokal-first-løfte, samme historikk.
