# Zip — Fra konsept til markedsklart produkt

**Prosjekt:** Zip (kodenavn) — lanseres under produktnavnet **Pusterom**
**Kategori:** Digital mental helse / micro-wellness
**Status:** Fungerende HTML/CSS/JS-prototype (4 sider, lokal lagring)
**Dokumenteier:** Produkt- og markedsstrategi
**Sist oppdatert:** 2026-08-13

---

## Sammendrag

Zip er en ultralett, norsk, personvern-først mini-app som hjelper folk å roe
seg ned på under ett minutt: sjekke inn på humøret, puste med en styrt
sirkel, og gjøre ett lite, konkret grep. Ingen konto, ingen skyserver, ingen
avhengighet av internett etter første lasting. Denne rapporten tar
prosjektet gjennom fem faser: fundament, teknisk utvikling, markedsanalyse,
markedsføring og innholdsproduksjon.

---

## 1. Konseptuell fundamentering

### 1.1 Visjon
> *Det enkleste pusterommet i lomma di — null friksjon, null skam, null
> datainnsamling.*

Zip skal være det man åpner i det akutte øyeblikket — 30 sekunder før et
møte, midt i en vanskelig kveld, i skolegården — ikke en app man må
"engasjere seg i" over tid som Calm eller Headspace krever.

### 1.2 Misjon
Gjøre den første, minste selvhjelpshandlingen (pust, sjekk-inn, ett lite
grep) tilgjengelig for enhver nordmann på under 10 sekunders lastetid, uten
registrering og uten at data forlater enheten.

### 1.3 Kjernefunksjoner (dagens MVP)
| Side | Funksjon | Status |
|---|---|---|
| Hjem | Humør-sjekk-inn (5-punkts skala) + valgfri notat | ✅ Ferdig |
| Pusterom | Styrt pusteøvelse (4-2-6 sekunder, animert sirkel) | ✅ Ferdig |
| Små grep | 7 konkrete mikro-handlinger man kan hake av | ✅ Ferdig |
| Historikk | Liste over sjekk-inn + ukentlig oppsummering | ✅ Ferdig |

### 1.4 Kjernefunksjoner (roadmap, ikke bygget ennå)
- **Flere pustemønstre** (box breathing 4-4-4-4, 4-7-8 for søvn)
- **Varsler/påminnelser** (opt-in, lokale, ingen push-server nødvendig via `Notification`-API eller PWA)
- **Strekk/streak-visualisering** uten prestasjonspress ("du var her X dager" — ikke gamification av skam)
- **Eksport av egne data** (JSON/CSV) — personvern betyr også *retten til å ta med seg dataene sine*
- **Flerspråklig** (nynorsk, engelsk, evt. samisk for offentlig sektor-bruk)
- **Offline-first PWA** med "legg til på hjemskjerm"

### 1.5 Målgruppe / personas
1. **"Emma, 22"** — student, høy prestasjonsangst, bruker TikTok/Instagram, vil ikke lage konto i noe som helst mental helse-relatert av frykt for stigma.
2. **"Kristian, 34"** — kontoransatt, stressa i perioder, ønsker noe raskt mellom Teams-møter, ikke en 20-minutters meditasjon.
3. **"Bedriftshelsetjeneste/HR"** — B2B-kjøper som vil tilby ansatte et lavterskel verktøy uten GDPR-hodepine (fordi data aldri forlater enheten).

### 1.6 Teknisk rammeverk

**Nåværende stack:** Statisk HTML/CSS/vanilla JS, `localStorage`. Ingen backend, ingen avhengigheter, ingen bygg-steg.

**Fordeler å bevare:** Ingen serverkostnad, ingen datainnsamling å forsvare juridisk, kan hostes gratis (GitHub Pages/Netlify/Vercel), lastetid < 1 sekund.

**Anbefalt teknisk evolusjon for markedsklart produkt:**
- **Fase 0 (nå → uke 4):** Behold vanilla stack, men modularisér til separate filer (`app.js`, `style.css`) + legg til `manifest.json` og en enkel service worker → gjør den installerbar som **PWA**.
- **Fase 1 (måned 2–3):** Vurder lettvekts rammeverk kun hvis kompleksiteten krever det (f.eks. Preact/Alpine.js) — **ikke** React med mindre teamet vokser og trenger komponentgjenbruk på tvers av flere flater (nettside + app).
- **Fase 2 (måned 4+, kun ved B2B-behov):** Valgfri, *opt-in* synk-backend (f.eks. Supabase) for brukere som eksplisitt vil ha data på tvers av enheter — holdes strengt atskilt fra kjerneopplevelsen som skal fungere 100 % offline/lokalt.

### 1.7 Ressursbehov
| Ressurs | Behov MVP → lansering | Estimat |
|---|---|---|
| Utvikling (frontend/PWA) | 1 utvikler, deltid | 3–4 uker |
| Design (UI/UX-polish, ikoner, app-store-assets) | 1 designer, kontrakt | 1–2 uker |
| Innhold/tekst (norsk, evt. engelsk) | Produkteier + tekstforfatter | Løpende |
| Juridisk (personvernerklæring, vilkår — enkelt pga. ingen serverlagring) | Ekstern jurist-review, 2–4 timer | Lav kostnad |
| Markedsføring (fase 1, organisk) | 0 kr i annonsebudsjett mulig | Tid, ikke kapital |
| Hosting | GitHub Pages/Netlify (gratis) → evt. domene ~200 kr/år | Minimal |

**Totalt estimert kapitalbehov for lansering: lavt (< 20 000 kr)** — dette er nettopp styrken ved konseptet: det kan bygges og lanseres nesten uten kapital, noe som er en del av selve verdiforslaget (se 3.3).

---

## 2. Teknisk utvikling og prototyping

### 2.1 Status på dagens prototype
Koden er allerede en fungerende MVP. Under gjennomgang ble ett reelt
sikkerhetsproblem funnet og rettet i denne økten:

- **🔒 Rettet: Lagret XSS via notatfeltet.** Historikksiden satte
  brukerens frie tekstnotat direkte inn med `innerHTML`, uten escaping. En
  bruker som skrev `<img src=x onerror=alert(1)>` i notatfeltet ville fått
  det kjørt som kode neste gang historikken ble vist. Siden dette er
  ren klientside-lagring er angrepsflaten begrenset (ingen andre brukere
  rammes), men det er fortsatt en reell sårbarhet for brukeren selv (f.eks.
  ved deling av skjerm/enhet, eller fremtidig synk-funksjon). Rettet ved å
  bruke `textContent` i stedet for `innerHTML`-interpolasjon.

### 2.2 Kritiske feilscenarier å teste/håndtere før lansering

| Scenario | Risiko | Tiltak |
|---|---|---|
| `localStorage` utilgjengelig (privat nettlesing i Safari iOS, eller full lagring) | App krasjer stille, data forsvinner uten varsel | Wrap alle `localStorage`-kall i try/catch, vis en tydelig "dataene lagres ikke i denne økten"-melding |
| Bruker bytter side midt i pustesyklus | `setTimeout`-kjeder kan stable seg opp / minnelekkasje ved gjentatt start/stopp | Sørg for at `toggleBreath` alltid nullstiller `breathInterval` og `phase` fullstendig; legg til `visibilitychange`-lytter som pauser når fanen er skjult |
| `event.currentTarget` i `switchPage` brukes uten at `event` er sendt inn eksplisitt (avhenger av globalt `window.event`) | Feiler i strict mode / fremtidige nettlesere, fungerer ikke ved programmatisk kall til `switchPage()` | Refaktorer til `switchPage(name, btnEl)` og send inn elementet eksplisitt i stedet for å stole på globalt event-objekt |
| Dato/tidssone-bugs i "denne uken"-telling (`toDateString`, `new Date(e.date)`) | Feil ukentlig oppsummering rundt midnatt/tidssoneskift | Bruk konsistent UTC-basert dato-nøkkel for "i dag"/"denne uken"-logikk |
| Flere faner åpne samtidig | `localStorage` overskrives race-condition-messig | Lav prioritet for v1 (enkeltbruker-app), men lytt på `storage`-event for å synke UI mellom faner i v2 |
| Data slettes ved "tøm nettleserdata" | Total datalapse uten varsel — spesielt kritisk for en app om mental helse-historikk | Bygg eksportfunksjon (JSON-nedlasting) tidlig, og vurder en enkel "sikkerhetskopi til fil"-knapp før synk-backend er klar |
| Skjermlesere/tilgjengelighet | Emoji-only knapper uten `aria-label`, manglende fokushåndtering ved sidebytte | Legg til `aria-label` på alle interaktive elementer, test med VoiceOver/TalkBack, sørg for fokus flyttes til `<h1>` ved sidebytte |
| Rask dobbelttrykk på "Start" pust | Kan trigge overlappende `setTimeout`-kjeder | Debounce/lås knappen under transisjon |

### 2.3 Trinnvis plan mot funksjonell, markedsklar MVP

**Sprint 1 (uke 1) — Herding av eksisterende kode**
- Fiks feilscenariene i 2.2 (prioritert etter risiko: localStorage-feil og pustesyklus-bugs først)
- Del opp `index.html` i `index.html` / `style.css` / `app.js`
- Legg til `try/catch` rundt all lagring + brukervendt feilmelding

**Sprint 2 (uke 2) — PWA-klar**
- `manifest.json` + app-ikoner (192px/512px) + `theme_color`
- Minimal service worker for offline-cache av statiske filer
- Test "Legg til på hjemskjerm" på iOS Safari og Android Chrome

**Sprint 3 (uke 3) — Tilgjengelighet og polish**
- `aria-label`, fokushåndtering, kontrastsjekk (WCAG AA)
- Legg til dataeksport (JSON-nedlasting av `checkins`)
- Enkel personvernerklæring-side (lett å skrive: "vi lagrer ingenting på server")

**Sprint 4 (uke 4) — Lanseringsklargjøring**
- App-store-assets hvis pakket som TWA/Capacitor for Play Store (valgfritt — kan lanseres rent som web-app/PWA først)
- Analytics **uten** persondata (f.eks. enkel, anonym, aggregert telling via privacy-first verktøy som Plausible — helt valgfritt og eksplisitt opt-in)
- Ekstern QA-runde på ekte enheter (iOS/Android, ulike skjermstørrelser)

---

## 3. Markedsanalyse

### 3.1 Konkurrenter

**Globale mental helse-/mindfulness-apper:**
- **Calm** og **Headspace** — store, abonnementstunge (kr 500–900/år), bred funksjonalitet (søvn, meditasjon, musikk). Tunge onboarding-flows med kontokrav.
- **Wysa** / **Woebot** — AI-chatbot-basert samtaleterapi-lite, mer "behandlings"-posisjonert.
- **Reflectly** — dagbok/humørsporing med AI, abonnementsmodell, krever konto.
- **MindDoc/Moodpath** — klinisk anerkjent humørsporing, mer alvorstynget/diagnostisk i tone.
- **Balloon** — norsk/skandinavisk app for terapeut-tilgang + øvelser, mer B2B/helseforsikring-rettet.

**Norske/nordiske aktører:**
- **Mental Helse Ungdom**, **Rådet for psykisk helse** — informasjonsressurser, ikke interaktive apper.
- **Helsenorge**-økosystemet — offentlig, tungt, ikke bygget for akutt mikro-bruk.
- **Nord Health**, **Better Days** m.fl. — ofte B2B/bedriftshelse-fokusert, krever avtale/lisens.

### 3.2 Trender i markedet (2025–2026)
- **Micro-wellness**: Kortere, mer frekvente intervensjoner (60 sekunder – 5 minutter) vinner terreng over lange meditasjonsøkter, drevet av synkende oppmerksomhetsspenn og "snackable" appvaner.
- **Personvern som differensiator**: Etter flere skandaler med helse-/velværeapper som selger eller lekker data (bl.a. oppslag om terapiapper og datalekkasjer), er "ingen konto, ingen sky" et voksende salgsargument, ikke en mangel.
- **Avmedikalisering av selvhjelp**: Yngre brukere (Gen Z) foretrekker uformelt, ikke-klinisk språk fremfor "diagnose"-tunge apper.
- **Bedriftshelse-budsjetter vokser**: Norske bedrifter investerer mer i lavterskel psykisk helse-tiltak for ansatte, som del av HMS/IA-avtaler.
- **EU-regulering (EHDS, GDPR-skjerpelser)**: Gjør lokal, serverfri lagring til et konkurransefortrinn i anbudsprosesser mot skole/kommune/bedrift.
- **AI-fatigue**: En motbevegelse mot "alt skal ha en AI-chatbot" — en enkel, forutsigbar, ikke-AI-drevet app kan faktisk skille seg positivt ut.

### 3.3 Zip sitt unike verdiforslag (USP)

1. **Null friksjon**: Ingen konto, ingen e-post, ingen app-store-krav for å prøve — kan brukes direkte i nettleseren på under 10 sekunder.
2. **Personvern som arkitektur, ikke løfte**: Data forlater aldri enheten (med mindre bruker eksplisitt eksporterer). Dette er teknisk sant, ikke bare juridisk formulert — sterkt i GDPR-følsomt norsk marked.
3. **100 % norsk språk og tone**: Varm, ikke-klinisk, ikke-amerikansk-positiv ("Du er trygg her" fremfor "Unlock your best self").
4. **Gratis kjernefunksjon, evig**: Ingen abonnementsvegg for de mest kritiske funksjonene (sjekk-inn, pust, små grep) — i sterk kontrast til Calm/Headspace sine betalingsmurer.
5. **Lav teknisk fotavtrykk**: Fungerer på gamle telefoner, trege nett, uten oppdateringstvang — relevant for skole- og eldre-segmentet.

**Posisjoneringssetning:**
> *"Zip (Pusterom) er det eneste pusterommet du kan åpne uten å logge inn, uten at noen ser hva du skrev, og uten å betale for det."*

---

## 4. Markedsføringsstrategi

### 4.1 Kanaler, rangert etter forventet effekt/kostnad

| Kanal | Hvorfor | Prioritet |
|---|---|---|
| **TikTok/Instagram Reels (organisk)** | Målgruppen (spesielt Emma-persona) oppdager velvære-verktøy her; "no-login mental health app" er et virkende hook-konsept | Høy — start uke 1 |
| **Skole-/studentpartnerskap** (elevråd, studentsamskipnader, SiO, SiT) | Direkte tilgang til kjernebrukergruppe, lav CAC, kan gi organisk spredning | Høy |
| **App Store/Play Store ASO** | Gratis, evigvarende inngang hvis app pakkes som PWA/TWA med gode søkeord ("pusteøvelse", "angst", "stress", "rolig") | Høy, lav innsats |
| **Bedriftshelsetjeneste/HR-partnerskap (B2B2C)** | Monetiseringsvei uten å legge betalingsmur på sluttbruker — bedriften betaler for lisens/branding | Middels, lengre salgssyklus |
| **PR/presse** (VG, NRK, Dagens Medisin, spesialiserte helseblogger) | "Norsk gratis mental helse-app uten datainnsamling" er en god vinkel for medieoppslag | Middels |
| **Betalt annonsering (Meta/TikTok Ads)** | Skalerbar, men bør vente til organisk traksjon og konvertering er validert | Lav i fase 1, øk i fase 2 |
| **Influencersamarbeid** (mikro-influencere innen mental helse/studentliv) | Troverdighet, men krev nøye utvelgelse (ikke medikalisert budskap) | Middels |

### 4.2 Posisjonering
- **Kategori:** Ikke "meditasjonsapp" (for assosiert med Calm/Headspace-abonnement), men **"akutt pusterom" / mikro-selvhjelp**.
- **Tone:** Varm, jordnær, norsk — aldri "fiks deg selv"-språk, alltid "du er ok som du er, her er ett lite steg".
- **Visuell identitet:** Behold dagens rolige, dempede fargepalett (grønn/beige/blå) — signaliserer ro fremfor "app-aktig" energi.

### 4.3 Vekstplan

**Fase 1 — Validering (måned 1–2):** Gratis PWA-lansering, organisk sosial + 1–2 skolepartnerskap. Mål: 1 000 unike brukere, målt kun via anonym aggregert telling.

**Fase 2 — Skalering (måned 3–6):** Presseoppslag, ASO-optimalisert app-store-tilstedeværelse, første B2B-pilot med én bedriftshelsetjeneste. Mål: 10 000 brukere, 1 betalende B2B-kunde.

**Fase 3 — Monetisering (måned 6+):** B2B-lisensmodell (bedrifter/skoler betaler for merket versjon + evt. adminpanel for aggregert, anonym trivselsstatistikk — **aldri** individdata). Sluttbrukerkjerne forblir gratis for å beholde USP.

---

## 5. Innholdsproduksjon

### 5.1 Produktbeskrivelse (App Store / nettside)

**Kort (under tittel):**
> Pusterommet du kan åpne uten å logge inn.

**Lang beskrivelse:**
> Zip — Pusterom er den enkleste veien til ro midt i en travel dag. Ingen
> konto. Ingen datainnsamling. Ingen abonnement for det du trenger mest.
>
> Sjekk inn på humøret ditt på 10 sekunder. Følg en rolig pusteøvelse.
> Velg ett lite, konkret grep du kan gjøre akkurat nå. Se hvordan du har
> tatt vare på deg selv over tid — helt privat, kun lagret på din egen
> telefon.
>
> Laget for de øyeblikkene mellom møter, før en eksamen, eller midt i en
> tung kveld — når du ikke har tid eller overskudd til en 20-minutters
> meditasjonsøkt.
>
> **Ingen registrering. Ingen skjulte kostnader for kjernefunksjonene. Data
> forlater aldri enheten din.**

### 5.2 Slagord (kandidater)
1. *"Pusterommet du kan åpne uten å logge inn."*
2. *"Ro på 30 sekunder. Ingen konto nødvendig."*
3. *"Ditt pusterom. Dine data. Ingen andre."*
4. *"Du er trygg her."* (allerede i produktet — sterk kandidat som primær tagline)
5. *"Ett lite grep. Akkurat nå."*

**Anbefaling:** Bruk *"Du er trygg her."* som emosjonell hovedtagline (gjenkjennelig fra appen selv), og *"Pusterommet du kan åpne uten å logge inn."* som funksjonell undertagline i markedsføring/app-store.

### 5.3 Annonsetekster

**Meta/Instagram (feed-annonse):**
> Midt i en tung dag? Zip er pusterommet du kan åpne på 10 sekunder — uten
> å lage konto, uten at noen ser hva du skriver. Bare du, en rolig
> pusteøvelse, og ett lite grep. Gratis. Alltid.
> 👉 Prøv Pusterom nå.

**TikTok (hook-variant, til reel/video-manus):**
> [Tekst på skjerm]: "Apper som ber deg lage konto for å puste rolig??"
> [Cut] "Zip krever ingenting. Åpne. Pust. Ferdig."
> [CTA]: Lenke i bio — helt gratis, ingen innlogging.

**Google Search-annonse (kort format):**
> Zip — Pusterom | Gratis, uten konto
> Rolig pusteøvelse på 10 sek. Ingen registrering. Dine data blir på din
> telefon. Prøv nå →

**LinkedIn (B2B/bedriftshelse-vinkling):**
> Gi de ansatte et lavterskel verktøy for stressmestring — uten
> personvernrisiko. Zip lagrer aldri data på server, krever ingen
> integrasjon, og er klar for bruk på minutter. Book en demo for din
> bedriftshelsetjeneste.

### 5.4 Lanseringsplan for sosiale medier (første 4 uker)

**Uke 1 — Myk lansering / kunngjøring**
- Dag 1: Instagram/TikTok-post: "Vi lanserer Zip — Pusterom" med skjermopptak av appen i bruk
- Dag 3: Behind-the-scenes-post: hvorfor "ingen konto, ingen sky" var et bevisst designvalg
- Dag 5: Story-serie: gå gjennom de 4 sidene (Hjem, Pusterom, Små grep, Historikk)

**Uke 2 — Utdanning/verdi**
- Dag 8: Reel: "3 apper som selger dataene dine vs. Zip" (personvern-vinkling, faktabasert og ikke navngi konkurrenter negativt uten belegg)
- Dag 10: Karusell-post: "7 små grep du kan gjøre akkurat nå" (hentet fra appens egen liste)
- Dag 12: Samarbeid/reposte fra første skolepartner hvis på plass

**Uke 3 — Sosialt bevis / community**
- Dag 15: Brukerhistorie/testimonial (anonymisert, med samtykke)
- Dag 17: Live pusteøvelse-video ("pust med oss i 60 sekunder")
- Dag 19: Q&A i Stories om personvern og hvordan appen fungerer teknisk

**Uke 4 — Konvertering / press**
- Dag 22: Presseoppslag-push (send til lokal- og fagpresse)
- Dag 24: "Vi passerte X brukere"-milepælpost hvis relevant
- Dag 26: CTA-fokusert post: direkte lenke, "legg til på hjemskjerm på 5 sekunder"
- Dag 28: Oppsummeringspost + tease på neste funksjon (f.eks. flere pustemønstre)

**Innholdsprinsipper gjennom hele planen:**
- Aldri medikaliser eller diagnostiser i copy ("angst", "depresjon" brukes varsomt og aldri som løfte om behandling)
- Alltid inkluder kriselinjer/hjelpetelefon (f.eks. Mental Helses hjelpetelefon 116 123) i bio/beskrivelse — ansvarlig praksis for enhver mental helse-relatert app
- Konsistent visuell stil: samme dempede fargepalett som i appen (grønn/beige/blå), ingen "hypey" energi

---

## Oppsummering og neste steg

| Steg | Eier | Frist (forslag) |
|---|---|---|
| Herde kode (feilscenarier i 2.2) | Utvikling | Uke 1 |
| PWA-pakking + app-store-assets | Utvikling/design | Uke 2–4 |
| Personvernerklæring + krisehenvisning i app | Produkt/jurist | Uke 2 |
| Skolepartnerskap-utsendelse | Marked | Uke 1 (parallelt) |
| Sosiale medier-kalender iverksettes | Marked | Uke 1 |
| B2B-pitch til første bedriftshelsetjeneste | Salg/produkt | Måned 2 |

Zip sin styrke er at MVP-en allerede eksisterer og fungerer — resten av
arbeidet handler om herding, tillitsbygging (personvern, tilgjengelighet)
og en markedsføringsstrategi som spiller på nettopp det konseptet allerede
gjør bra: å være det minst kompliserte pusterommet på markedet.
