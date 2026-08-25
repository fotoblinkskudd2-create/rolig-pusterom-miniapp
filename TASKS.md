# Oppgavebacklog – Rolig Pusterom Miniapp

> Tilpasset fra en generisk multi-agent maler for fysisk produktutvikling (CAD/prototyp/produksjon).
> Dette repoet er en ren HTML/CSS/JS velvære-miniapp uten fysisk produkt og uten vedlagte bilder å analysere,
> så agentgruppene under er tilpasset faktisk programvarearbeid: UX, kode, tilgjengelighet, personvern,
> testing, ytelse, innhold og distribusjon. Prioritering reflekterer reell nytte for brukere av appen.

## Agentoversikt

| # | Primæragent | Subagenter |
|---|---|---|
| 1 | Produkt & UX-innsikt | Brukerreise-analyse · Følelsesmessig tone |
| 2 | UI/Visuelt design | Komponentsystem · Mikrointeraksjon |
| 3 | Frontend-arkitektur | Kodestruktur · State/lagring |
| 4 | Pusterom-funksjonalitet | Pustemønstre · Lyd/haptikk |
| 5 | Innhold & tekst | Norsk språkkvalitet · Øvelsesbibliotek |
| 6 | Tilgjengelighet (a11y) | Skjermleser · Motorisk/kognitiv tilgang |
| 7 | Personvern & data | Lokal lagring · Dataeksport/sletting |
| 8 | Testing & QA | Manuell testing · Regresjonssjekk |
| 9 | Ytelse & PWA/offline | Offline-støtte · Installérbarhet |
| 10 | Distribusjon & vedlikehold | Hosting/CI · Dokumentasjon |

---

## GRUPPE 1: Produkt & UX-innsikt

### TASK 1.1: Kartlegg brukerreisen gjennom appens fire sider

**Agent**: Produkt & UX-innsikt
**Subagent(er)**: Brukerreise-analyse
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 3 timer

#### Subtasks:
1. **Gå gjennom Hjem → Pusterom → Små grep → Historikk som ny bruker** - Deliverable: notat med friksjonspunkter
2. **Identifiser hvor bruker kan "falle av" (f.eks. ingen call-to-action fra Pusterom videre)** - Deliverable: liste over hull i flyten
3. **Foreslå én naturlig neste-steg-kobling per side** - Deliverable: forslag til navigasjonsforbedring

#### Spesifikasjoner:
- Ingen kodeendring i denne oppgaven, kun dokumentasjon
- Output som markdown-notat i repoet

#### Success Criteria:
- [ ] Alle 4 sider gjennomgått og dokumentert
- [ ] Minst 3 friksjonspunkter identifisert
- [ ] Konkrete forslag til forbedret flyt

---

### TASK 1.2: Vurder "Isolation Mirror" som separat feature

**Agent**: Produkt & UX-innsikt
**Subagent(er)**: Brukerreise-analyse · Følelsesmessig tone
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Avklar om `isolation-mirror.html` skal inn i hovednavigasjonen eller forbli frittstående** - Deliverable: anbefaling med begrunnelse
2. **Vurder tonen ("Bergen-regn", "black metal atmosphere") mot resten av appens rolige språk** - Deliverable: tonalitetsnotat
3. **Bestem om siden skal beholdes, integreres eller fjernes** - Deliverable: beslutning dokumentert i notat

#### Spesifikasjoner:
- Siden inneholder AI-bildepromptgenerering (Flux/Midjourney) som avviker sterkt fra appens øvrige lokale, enkle preg
- Vurder personvernimplikasjon av bildeopplasting

#### Success Criteria:
- [ ] Klar anbefaling: behold/integrer/fjern
- [ ] Tonalitet vurdert mot resten av appen
- [ ] Personvernrisiko ved bildeopplasting vurdert

---

### TASK 1.3: Definer suksessmetrikker uten ekstern sporing

**Agent**: Produkt & UX-innsikt
**Subagent(er)**: Følelsesmessig tone
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Identifiser hvilke lokale signaler (antall sjekk-ins, fullførte pusteøvelser) som indikerer verdi** - Deliverable: metrikkliste
2. **Foreslå en enkel "denne uken"-oppsummering utover dagens tekst** - Deliverable: tekstforslag
3. **Vurder om metrikker skal vises tilbake til bruker eller kun brukes internt** - Deliverable: anbefaling

#### Spesifikasjoner:
- Ingen ekstern analytics — alt skal forbli i `localStorage`
- Metrikker må ikke virke prestasjonspressende for en sårbar brukergruppe

#### Success Criteria:
- [ ] Minst 3 lokale signaler identifisert
- [ ] Ingen forslag krever ekstern datainnsamling
- [ ] Tonen forblir omsorgsfull, ikke prestasjonsorientert

---

### TASK 1.4: Undersøk behov for påminnelser/rutine

**Agent**: Produkt & UX-innsikt
**Subagent(er)**: Brukerreise-analyse
**Prioritet**: LAV
**Estimert Verdi**: Medium
**Timeline**: 3 timer

#### Subtasks:
1. **Vurder om en daglig påminnelse (uten push-varsler, kun in-app) gir verdi** - Deliverable: anbefaling
2. **Skisser hvordan en "streak" kunne vises uten å skape prestasjonsangst** - Deliverable: designnotat
3. **Undersøk Web Notification API som ikke-kritisk tillegg** - Deliverable: teknisk gjennomførbarhetsnotat

#### Spesifikasjoner:
- Må respektere at bruker aldri skal føle skyld for å "miste streak"

#### Success Criteria:
- [ ] Klar anbefaling om påminnelser gir nytte
- [ ] Streak-konsept unngår negativ forsterkning
- [ ] Teknisk løsning skissert

---

### TASK 1.5: Konkurrentanalyse av lignende norske velværeapper

**Agent**: Produkt & UX-innsikt
**Subagent(er)**: Følelsesmessig tone
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2 timer

#### Subtasks:
1. **List opp 3-5 sammenlignbare apper (norsk språk, mental helse-fokus)** - Deliverable: kort oversikt
2. **Identifiser hva som gjør denne appen unik (enkelhet, ingen konto, ingen sporing)** - Deliverable: posisjoneringsnotat
3. **Noter ett forbedringspotensial fra hver konkurrent** - Deliverable: idéliste

#### Spesifikasjoner:
- Kun offentlig tilgjengelig informasjon, ingen skraping av kontobeskyttet innhold

#### Success Criteria:
- [ ] 3+ apper kort beskrevet
- [ ] Unik posisjon for denne appen artikulert
- [ ] Idéliste med minst 3 punkter

---

## GRUPPE 2: UI/Visuelt design

### TASK 2.1: Etabler et konsistent designtoken-system

**Agent**: UI/Visuelt design
**Subagent(er)**: Komponentsystem
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Trekk ut alle fargeverdier, radius- og spacing-verdier som CSS custom properties** - Deliverable: utvidet `:root`-blokk
2. **Fjern hardkodede fargeverdier i enkeltklasser (f.eks. `#e5ebe6`, `#2a3a2f`)** - Deliverable: refaktorert CSS
3. **Dokumenter tokens kort i README eller egen designnote** - Deliverable: dokumentasjonsavsnitt

#### Spesifikasjoner:
- Behold eksisterende visuelle uttrykk 1:1 — kun refaktorering, ingen visuell endring
- Alle farger skal komme fra `:root`-variabler

#### Success Criteria:
- [ ] Ingen hardkodede hex-farger utenfor `:root`
- [ ] Visuell regresjonstest viser 0 endring
- [ ] Tokens dokumentert

---

### TASK 2.2: Design mørk modus (dark mode)

**Agent**: UI/Visuelt design
**Subagent(er)**: Komponentsystem
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 3 timer

#### Subtasks:
1. **Definer mørk fargepalett basert på eksisterende rolige toner** - Deliverable: mørk token-sett
2. **Implementer `prefers-color-scheme: dark` media query** - Deliverable: CSS-tillegg i `index.html`
3. **Test kontrast (WCAG AA) for tekst mot bakgrunn i begge moduser** - Deliverable: kontrastrapport

#### Spesifikasjoner:
- Bruk samme mønster som allerede finnes i `isolation-mirror.html` (mørk base) som inspirasjon
- Minimum kontrastforhold 4.5:1 for brødtekst

#### Success Criteria:
- [ ] Mørk modus aktiveres automatisk via systeminnstilling
- [ ] Alle tekstelementer består WCAG AA-kontrast
- [ ] Ingen visuell "flash" ved sideinnlasting

---

### TASK 2.3: Forbedre pustesirkelens visuelle presisjon

**Agent**: UI/Visuelt design
**Subagent(er)**: Mikrointeraksjon
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Juster CSS-transition slik at "Hold"-fasen også har en subtil visuell tilstand (i dag ingen endring i 2s)** - Deliverable: oppdatert `.circle` CSS-klasse
2. **Legg til myk skyggeanimasjon synkronisert med pustefasen** - Deliverable: CSS-animasjon
3. **Test animasjonen på lavytelses mobilenhet for jank** - Deliverable: ytelsesnotat

#### Spesifikasjoner:
- "Hold"-fase (2000ms) må ha egen visuell tilstand, ikke bare tekstendring
- Animasjon skal respektere `prefers-reduced-motion`

#### Success Criteria:
- [ ] Alle tre pustefaser (inn/hold/ut) har distinkt visuell tilstand
- [ ] `prefers-reduced-motion: reduce` deaktiverer skalering
- [ ] Ingen synlig hakking på testet mobilenhet

---

### TASK 2.4: Design empty state for "Små grep"-siden

**Agent**: UI/Visuelt design
**Subagent(er)**: Komponentsystem
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 1 time

#### Subtasks:
1. **Design visuell tilstand for når alle handlinger er fullført for dagen** - Deliverable: CSS/markup-tillegg
2. **Skriv oppmuntrende avsluttende tekst** - Deliverable: tekststreng
3. **Implementer betinget visning i `renderActions()`** - Deliverable: JS-endring

#### Spesifikasjoner:
- Vises kun når alle 7 handlinger er markert gjort for dagen

#### Success Criteria:
- [ ] Empty state vises korrekt når alt er fullført
- [ ] Tilbakestilles automatisk neste dag
- [ ] Visuelt konsistent med resten av appen

---

### TASK 2.5: Ikonrevisjon — erstatt emoji med konsistent ikonsett (valgfritt)

**Agent**: UI/Visuelt design
**Subagent(er)**: Komponentsystem · Mikrointeraksjon
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2 timer

#### Subtasks:
1. **Vurder fordeler/ulemper ved å beholde emoji vs. innebygd SVG-ikonsett** - Deliverable: anbefaling
2. **Hvis SVG velges: lag inline SVG for de 4 nav-ikonene** - Deliverable: SVG-markup
3. **Test på tvers av OS (emoji-rendering varierer mellom Android/iOS/desktop)** - Deliverable: skjermdump-sammenligning**

#### Spesifikasjoner:
- Ingen eksterne ikonbiblioteker (ingen CDN-avhengighet) — kun inline SVG hvis valgt
- Emoji er sannsynligvis "godt nok" gitt appens uformelle, varme tone

#### Success Criteria:
- [ ] Beslutning dokumentert med begrunnelse
- [ ] Hvis endret: ikoner ser konsistente ut på tvers av plattformer
- [ ] Ingen nye eksterne avhengigheter introdusert

---

## GRUPPE 3: Frontend-arkitektur

### TASK 3.1: Del opp `index.html` i separate CSS/JS-filer

**Agent**: Frontend-arkitektur
**Subagent(er)**: Kodestruktur
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Flytt `<style>`-innhold til `styles.css`** - Deliverable: ny CSS-fil
2. **Flytt `<script>`-innhold til `app.js`** - Deliverable: ny JS-fil
3. **Oppdater `index.html` med `<link>`/`<script src>`-referanser** - Deliverable: oppdatert HTML

#### Spesifikasjoner:
- Ingen byggeprosess skal introduseres — fortsatt "pure HTML/CSS/JS" per README
- Filstier relative, fungerer via `file://` og enkel statisk hosting

#### Success Criteria:
- [ ] Appen fungerer identisk etter splitting
- [ ] Ingen konsollfeil ved lasting
- [ ] README fortsatt akkurat om arkitektur (evt. oppdatert)

---

### TASK 3.2: Konsolider `localStorage`-tilgang i et lite datalag

**Agent**: Frontend-arkitektur
**Subagent(er)**: State/lagring
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 3 timer

#### Subtasks:
1. **Lag et enkelt objekt `Store` med metoder `getCheckins()`, `saveCheckin()`, `getDoneActions()`, `toggleAction()`** - Deliverable: `store.js`-modul
2. **Erstatt direkte `localStorage.getItem/setItem`-kall i eksisterende funksjoner med `Store`-kall** - Deliverable: refaktorert `app.js`
3. **Legg til try/catch rundt `JSON.parse` for å tåle korrupt lagret data** - Deliverable: feilhåndtering i `Store`

#### Spesifikasjoner:
- Ingen endring i lagringsformat/nøkler (bakoverkompatibelt med eksisterende brukerdata)
- Korrupt data skal falle tilbake til tom liste, ikke krasje appen

#### Success Criteria:
- [ ] All `localStorage`-tilgang går via `Store`
- [ ] Korrupt JSON i `localStorage` krasjer ikke appen
- [ ] Eksisterende brukerdata leses fortsatt korrekt

---

### TASK 3.3: Fjern avhengighet av globalt `event`-objekt i `switchPage`

**Agent**: Frontend-arkitektur
**Subagent(er)**: Kodestruktur
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Identifiser bruk av implisitt global `event` i `switchPage(name)`** - Deliverable: kodeanalyse
2. **Endre `onclick`-attributter til å sende `event` eksplisitt, f.eks. `switchPage('pusterom', event)`** - Deliverable: oppdatert markup
3. **Oppdater funksjonssignatur til `switchPage(name, evt)`** - Deliverable: oppdatert JS**

#### Spesifikasjoner:
- Globalt `event` er deprecated/ikke-standard i strict mode og enkelte nettlesere
- Ingen endring i synlig oppførsel

#### Success Criteria:
- [ ] Ingen bruk av implisitt globalt `event`
- [ ] Navigasjon fungerer identisk i alle 4 faner
- [ ] Fungerer også i strict-mode-kontekst

---

### TASK 3.4: Erstatt inline `onclick`-attributter med `addEventListener`

**Agent**: Frontend-arkitektur
**Subagent(er)**: Kodestruktur
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2 timer

#### Subtasks:
1. **Kartlegg alle `onclick`-forekomster i markup** - Deliverable: liste
2. **Erstatt med `data-*`-attributter + delegert `addEventListener`** - Deliverable: refaktorert JS/HTML
3. **Verifiser at dynamisk genererte elementer (actions, history) fortsatt fungerer** - Deliverable: manuell test**

#### Spesifikasjoner:
- Forbedrer separasjon av markup og adferd, letter fremtidig CSP-innstramming

#### Success Criteria:
- [ ] Ingen `onclick=`-attributter i HTML
- [ ] All interaktivitet fungerer som før
- [ ] Dynamisk genererte knapper (action-cards) fungerer via delegering

---

### TASK 3.5: Legg til enkel client-side routing via URL hash

**Agent**: Frontend-arkitektur
**Subagent(er)**: State/lagring
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Synkroniser `switchPage()` med `location.hash` (f.eks. `#pusterom`)** - Deliverable: oppdatert navigasjonslogikk
2. **Les hash ved sideinnlasting for å åpne riktig side direkte (deling av lenke til Pusterom)** - Deliverable: init-kode
3. **Håndter `hashchange`-event for nettleser fram/tilbake-knapper** - Deliverable: event listener**

#### Spesifikasjoner:
- Muliggjør direkte lenking, f.eks. til pusteøvelsen fra en annen kanal
- Må ikke bryte eksisterende navigasjon uten hash

#### Success Criteria:
- [ ] URL oppdateres ved sidebytte
- [ ] Direktelenke til `#pusterom` åpner riktig side
- [ ] Nettleserens tilbake-knapp fungerer mellom sider

---

## GRUPPE 4: Pusterom-funksjonalitet

### TASK 4.1: Legg til valg mellom flere pustemønstre

**Agent**: Pusterom-funksjonalitet
**Subagent(er)**: Pustemønstre
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 3 timer

#### Subtasks:
1. **Definer 2-3 alternative mønstre (f.eks. 4-7-8, boks-pust 4-4-4-4, dagens 4-2-6)** - Deliverable: datastruktur med mønstre
2. **Bygg enkel velger-UI (radiogruppe eller knapper) på Pusterom-siden** - Deliverable: UI-tillegg
3. **Koble valgt mønster til `runBreathCycle()`-logikken** - Deliverable: parametrisert pustefunksjon

#### Spesifikasjoner:
- Dagens 4-2-6-mønster forblir standardvalg
- Valgt mønster huskes i `localStorage` til neste besøk

#### Success Criteria:
- [ ] Minst 2 alternative mønstre tilgjengelig
- [ ] Sirkelanimasjon matcher valgt mønsters faselengder
- [ ] Valg persisterer mellom økter

---

### TASK 4.2: Legg til antall runder / tidsbegrenset økt

**Agent**: Pusterom-funksjonalitet
**Subagent(er)**: Pustemønstre
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Legg til valgfri innstilling for antall runder (f.eks. 3, 5, 10, "fri")** - Deliverable: UI-kontroll
2. **Tell runder og avslutt automatisk med rolig avslutningstekst** - Deliverable: logikk i `runBreathCycle()`
3. **Vis fremdrift (f.eks. "Runde 2 av 5") diskret under sirkelen** - Deliverable: UI-tillegg**

#### Spesifikasjoner:
- "Fri" (uendelig) forblir tilgjengelig som i dag
- Avslutning skal føles rolig, ikke som en prestasjonsmarkering

#### Success Criteria:
- [ ] Økt avslutter automatisk ved valgt rundeantall
- [ ] Fremdriftsindikator er lesbar men ikke påtrengende
- [ ] "Fri"-modus fungerer som dagens oppførsel

---

### TASK 4.3: Legg til lydsignal (valgfritt, av som standard)

**Agent**: Pusterom-funksjonalitet
**Subagent(er)**: Lyd/haptikk
**Prioritet**: LAV
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Lag korte, myke toner for inn/hold/ut-overganger med Web Audio API (ingen eksterne lydfiler)** - Deliverable: lydgenereringsfunksjon
2. **Legg til av/på-bryter for lyd, av som standard** - Deliverable: UI-toggle
3. **Persister lydvalg i `localStorage`** - Deliverable: lagringslogikk**

#### Spesifikasjoner:
- Ingen eksterne lydfiler — generer toner programmatisk for å unngå avhengigheter og lisensspørsmål
- Skal fungere selv om nettleser blokkerer autoplay (kun spilles etter brukerinteraksjon)

#### Success Criteria:
- [ ] Lyd er av som standard
- [ ] Ingen lyd spilles uten eksplisitt brukervalg
- [ ] Fungerer uten eksterne filer/CDN

---

### TASK 4.4: Legg til haptisk tilbakemelding på mobil (Vibration API)

**Agent**: Pusterom-funksjonalitet
**Subagent(er)**: Lyd/haptikk
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 1 time

#### Subtasks:
1. **Legg til kort, myk vibrasjon ved fase-overganger via `navigator.vibrate()`** - Deliverable: kodeendring
2. **Koble til samme av/på-innstilling som lyd, eller egen bryter** - Deliverable: UI/logikk
3. **Grascefully degrade der Vibration API ikke støttes (iOS Safari)** - Deliverable: feature-detection**

#### Spesifikasjoner:
- Må ikke feile eller logge feil på plattformer uten støtte (feature-detect før bruk)

#### Success Criteria:
- [ ] Ingen konsollfeil på iOS Safari (uten støtte)
- [ ] Vibrasjon er subtil og kort (<100ms)
- [ ] Av som standard, respekterer brukervalg

---

### TASK 4.5: Legg til "avslutt rolig"-overgang etter pusteøkt

**Agent**: Pusterom-funksjonalitet
**Subagent(er)**: Pustemønstre
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Vis en kort, varm avslutningstekst når økten stoppes (manuelt eller automatisk)** - Deliverable: tekst + visningslogikk
2. **Foreslå naturlig neste steg (f.eks. lenke til "Små grep")** - Deliverable: CTA-knapp
3. **Unngå at avslutning føles brå (nåværende "Stopp" nullstiller umiddelbart)** - Deliverable: myk overgangsanimasjon**

#### Spesifikasjoner:
- Kobler direkte til friksjonspunktet identifisert i TASK 1.1

#### Success Criteria:
- [ ] Avslutningstekst vises ved både manuell og automatisk stopp
- [ ] CTA til "Små grep" er synlig men ikke påtvunget
- [ ] Overgang føles rolig, ikke brå

---

## GRUPPE 5: Innhold & tekst

### TASK 5.1: Korrekturles all norsk brukertekst

**Agent**: Innhold & tekst
**Subagent(er)**: Norsk språkkvalitet
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Gjennomgå alle UI-strenger i `index.html` og `isolation-mirror.html` for skrivefeil/tegnsetting** - Deliverable: rettelsesliste
2. **Sjekk konsistent tiltaleform (du-form) og tone gjennom hele appen** - Deliverable: tonalitetssjekk
3. **Rett eventuelle funn direkte i koden** - Deliverable: oppdatert tekst i filene**

#### Spesifikasjoner:
- Bokmål, uformell men respektfull tone, konsistent med eksisterende "Du er trygg her."

#### Success Criteria:
- [ ] Ingen skrivefeil funnet ved gjennomlesning
- [ ] Konsistent tiltaleform i alle 4 sider
- [ ] Endringer committet

---

### TASK 5.2: Utvid biblioteket av "Små grep"-handlinger

**Agent**: Innhold & tekst
**Subagent(er)**: Øvelsesbibliotek
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Research 8-10 nye evidensbaserte mikro-handlinger (grounding, sansefokus, bevegelse)** - Deliverable: forslagsliste
2. **Skriv dem i samme korte, konkrete stil som eksisterende 7** - Deliverable: ferdig tekstet liste
3. **Legg til i `actions`-arrayet i JS** - Deliverable: kodeoppdatering**

#### Spesifikasjoner:
- Hver handling skal være gjennomførbar på under 5 minutter uten hjelpemidler
- Unngå medisinske råd eller påstander

#### Success Criteria:
- [ ] Minst 8 nye handlinger lagt til
- [ ] Stil og lengde konsistent med eksisterende
- [ ] Ingen medisinske påstander

---

### TASK 5.3: Roter "Små grep"-listen daglig i stedet for statisk rekkefølge

**Agent**: Innhold & tekst
**Subagent(er)**: Øvelsesbibliotek
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 1 time

#### Subtasks:
1. **Bruk dato som seed for å vise et utvalg/rekkefølge av handlinger per dag** - Deliverable: rotasjonslogikk
2. **Sikre at "gjort i dag"-status fortsatt matcher riktig handling etter rotasjon** - Deliverable: indekshåndtering
3. **Test at rotasjon er deterministisk (samme dag = samme sett)** - Deliverable: manuell test**

#### Spesifikasjoner:
- Forutsetter TASK 5.2 er gjennomført (større utvalg å rotere blant)
- Skal bruke stabil ID per handling, ikke array-indeks, for "gjort"-sporing

#### Success Criteria:
- [ ] Utvalget endrer seg fra dag til dag
- [ ] "Gjort"-status forblir korrekt etter rotasjon
- [ ] Deterministisk per kalenderdag

---

### TASK 5.4: Skriv mikrotekst for tomme/første-gangs-tilstander

**Agent**: Innhold & tekst
**Subagent(er)**: Norsk språkkvalitet
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 1 time

#### Subtasks:
1. **Skriv velkomsttekst for aller første besøk (ingen historikk ennå)** - Deliverable: tekststreng
2. **Forbedre eksisterende "Ingen sjekk-ins ennå"-tekst med varmere tone** - Deliverable: oppdatert streng
3. **Implementer betinget visning basert på om `localStorage` er tom** - Deliverable: JS-logikk**

#### Spesifikasjoner:
- Bygger videre på appens eksisterende varme, ikke-dømmende tone

#### Success Criteria:
- [ ] Førstegangsbruker møtes med relevant tekst
- [ ] Tonen er konsistent med resten av appen
- [ ] Ingen visuell "hakking" ved tilstandsbytte

---

### TASK 5.5: Vurder og dokumenter kilder/faglig forankring for øvelser

**Agent**: Innhold & tekst
**Subagent(er)**: Øvelsesbibliotek
**Prioritet**: LAV
**Estimert Verdi**: Medium
**Timeline**: 2 timer

#### Subtasks:
1. **Identifiser faglig grunnlag for pustemønstre og grounding-teknikker som brukes** - Deliverable: kildeliste (interne notater)
2. **Vurder om appen bør vise en kort "ikke medisinsk rådgivning"-ansvarsfraskrivelse** - Deliverable: anbefaling
3. **Legg til enkel, diskret tekst om appens begrensning hvis relevant** - Deliverable: tekst i app (f.eks. footer)**

#### Spesifikasjoner:
- Viktig for en app rettet mot stress/nedstemthet — bør ikke fremstå som behandling

#### Success Criteria:
- [ ] Faglig grunnlag kort dokumentert internt
- [ ] Beslutning om ansvarsfraskrivelse tatt og begrunnet
- [ ] Eventuell tekst er diskret, ikke skremmende

---

## GRUPPE 6: Tilgjengelighet (a11y)

### TASK 6.1: Legg til ARIA-roller og labels på interaktive elementer

**Agent**: Tilgjengelighet (a11y)
**Subagent(er)**: Skjermleser
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Legg til `aria-label` på mood-knapper (i dag kun emoji uten tekstalternativ)** - Deliverable: oppdatert markup
2. **Legg til `aria-pressed`/`aria-selected` for valgt humør og aktiv nav-fane** - Deliverable: dynamisk ARIA-state
3. **Legg til `aria-live="polite"` på `breathText` og `saveMsg` for skjermleseroppdateringer** - Deliverable: markup-tillegg**

#### Spesifikasjoner:
- Test med minst én skjermleser (VoiceOver eller NVDA)
- Følg WCAG 2.1 AA der relevant

#### Success Criteria:
- [ ] Alle interaktive elementer har tilgjengelig navn
- [ ] Aktiv tilstand annonseres til skjermleser
- [ ] Pustetekst-endringer leses opp uten å avbryte brukeren unødig

---

### TASK 6.2: Sikre tastaturnavigasjon gjennom hele appen

**Agent**: Tilgjengelighet (a11y)
**Subagent(er)**: Motorisk/kognitiv tilgang
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Verifiser tab-rekkefølge gjennom alle 4 sider** - Deliverable: testrapport
2. **Legg til synlig fokusindikator som matcher designspråket (i dag ingen egendefinert `:focus`-stil)** - Deliverable: CSS-tillegg
3. **Sikre at `switchPage` kan trigges med Enter/Space når fokusert via tastatur** - Deliverable: verifisert/rettet oppførsel**

#### Spesifikasjoner:
- Fokusring skal være synlig mot appens lyse bakgrunn og ikke fjernes med `outline: none` uten erstatning

#### Success Criteria:
- [ ] All funksjonalitet nåbar uten mus
- [ ] Fokusindikator synlig på alle interaktive elementer
- [ ] Ingen tastaturfeller

---

### TASK 6.3: Respekter `prefers-reduced-motion` konsekvent

**Agent**: Tilgjengelighet (a11y)
**Subagent(er)**: Motorisk/kognitiv tilgang
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Kartlegg alle CSS-transitions/animasjoner (pustesirkel, mood-btn scale, message)** - Deliverable: liste
2. **Legg til media query som reduserer/fjerner bevegelse ved `prefers-reduced-motion: reduce`** - Deliverable: CSS-tillegg
3. **Behold funksjonell fasevisning (tekst) selv om visuell animasjon reduseres** - Deliverable: verifisert oppførsel**

#### Spesifikasjoner:
- Pustesirkelens skalering er kjernefunksjonalitet — reduser amplitude/hastighet, ikke fjern helt, med mindre bruker eksplisitt ønsker det

#### Success Criteria:
- [ ] `prefers-reduced-motion` respekteres på alle animerte elementer
- [ ] Pusteveiledning forblir forståelig uten full animasjon
- [ ] Ingen brutte layout ved reduksjon

---

### TASK 6.4: Kontrastsjekk av all tekst mot bakgrunn

**Agent**: Tilgjengelighet (a11y)
**Subagent(er)**: Skjermleser
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Mål kontrastforhold for `--muted` (#7a8a7f) mot `--bg` (#f5f7f4)** - Deliverable: målerapport
2. **Juster fargeverdier som ikke består WCAG AA (4.5:1 normal tekst, 3:1 stor tekst)** - Deliverable: justerte tokens
3. **Re-test etter justering** - Deliverable: bekreftet rapport**

#### Spesifikasjoner:
- Bruk automatisert verktøy (f.eks. axe eller manuell kontrastkalkulator)

#### Success Criteria:
- [ ] Alle tekst/bakgrunn-kombinasjoner består WCAG AA
- [ ] Visuell endring er minimal/umerkbar der justering var nødvendig
- [ ] Rapport dokumentert

---

### TASK 6.5: Legg til `lang`, `viewport`-tilgjengelighet og skalerbar tekst

**Agent**: Tilgjengelighet (a11y)
**Subagent(er)**: Motorisk/kognitiv tilgang
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 30 minutter

#### Subtasks:
1. **Fjern `user-scalable=no` fra viewport-meta (hindrer zoom for svaksynte)** - Deliverable: oppdatert meta-tag
2. **Verifiser at `lang="no"` er korrekt satt (allerede til stede — bekreft konsistens)** - Deliverable: verifisering
3. **Test at layout tåler 200% zoom uten å bryte** - Deliverable: testrapport**

#### Spesifikasjoner:
- `user-scalable=no` er et kjent a11y-antimønster og bør fjernes uten unntak

#### Success Criteria:
- [ ] Bruker kan zoome appen på mobil
- [ ] Layout forblir brukbar ved 200% zoom
- [ ] `lang`-attributt korrekt på alle sider

---

## GRUPPE 7: Personvern & data

### TASK 7.1: Skriv en kort, synlig personvernerklæring i appen

**Agent**: Personvern & data
**Subagent(er)**: Lokal lagring
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 1 time

#### Subtasks:
1. **Forklar i klartekst at all data forblir lokalt i nettleseren (ingen server, ingen konto)** - Deliverable: tekstavsnitt
2. **Legg til lenke/seksjon tilgjengelig fra Historikk-siden** - Deliverable: UI-tillegg
3. **Nevn eksplisitt at nettleserdata (cache/localStorage-tømming) sletter historikken** - Deliverable: informasjonstekst**

#### Spesifikasjoner:
- Kort og lesbart — ikke en juridisk vegg av tekst, i tråd med appens enkle preg

#### Success Criteria:
- [ ] Personvernforklaring tilgjengelig fra appen
- [ ] Forklarer lokal lagring i klart språk
- [ ] Ingen skjulte datainnsamlingsmekanismer motsier teksten

---

### TASK 7.2: Legg til mulighet for å slette all lagret data

**Agent**: Personvern & data
**Subagent(er)**: Dataeksport/sletting
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 1 time

#### Subtasks:
1. **Legg til "Slett all min data"-knapp på Historikk-siden** - Deliverable: UI-knapp
2. **Implementer bekreftelsesdialog før sletting (unngå utilsiktet tap)** - Deliverable: `confirm()`-flyt eller egen modal
3. **Fjern alle relevante `localStorage`-nøkler ved bekreftelse** - Deliverable: sletting-funksjon**

#### Spesifikasjoner:
- Må slette `checkins` og `doneActions`, samt eventuelle nye nøkler introdusert i andre oppgaver
- Bekreftelse skal tydelig si at handlingen ikke kan angres

#### Success Criteria:
- [ ] All lokal data slettes ved bekreftet handling
- [ ] Bruker advares tydelig før sletting
- [ ] UI oppdateres umiddelbart til tom tilstand etter sletting

---

### TASK 7.3: Legg til dataeksport (last ned egen historikk)

**Agent**: Personvern & data
**Subagent(er)**: Dataeksport/sletting
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Legg til "Last ned min historikk"-knapp på Historikk-siden** - Deliverable: UI-knapp
2. **Generer JSON- eller tekstfil av `checkins`-data via Blob/`download`-attributt** - Deliverable: eksportfunksjon
3. **Test nedlasting på mobil og desktop-nettlesere** - Deliverable: testrapport**

#### Spesifikasjoner:
- Gir bruker eierskap og portabilitet over egen data, styrker tillit

#### Success Criteria:
- [ ] Eksportert fil inneholder korrekt, lesbar historikk
- [ ] Fungerer i minst 2 store nettlesere
- [ ] Ingen data sendes til noen server under eksport

---

### TASK 7.4: Fjern/isoler personvernrisiko i "Isolation Mirror" bildeopplasting

**Agent**: Personvern & data
**Subagent(er)**: Lokal lagring
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Verifiser at opplastet bilde (`#photo`) faktisk ikke sendes noe sted (kun lest lokalt om i det hele tatt)** - Deliverable: kodegjennomgang
2. **Legg til eksplisitt tekst om at bildet forblir i nettleseren og ikke lastes opp noe sted** - Deliverable: UI-tekst**
3. **Vurder å fjerne bildeopplasting helt hvis den ikke brukes til noe funksjonelt i dag (feltet leses aldri i `generate()`)** - Deliverable: anbefaling/kodeendring**

#### Spesifikasjoner:
- Kritisk: dagens `generate()`-funksjon leser aldri `#photo`-feltet, så opplasting er i praksis meningsløs og villedende for brukeren

#### Success Criteria:
- [ ] Ingen villedende UI som antyder bildet brukes uten at det stemmer
- [ ] Personvernpåstander i UI stemmer overens med faktisk kode
- [ ] Beslutning (fjern/behold/forklar) implementert

---

### TASK 7.5: Legg til Content-Security-Policy meta-tag

**Agent**: Personvern & data
**Subagent(er)**: Lokal lagring
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Definer en streng CSP (`default-src 'self'`, ingen eksterne skript/CDN i dag)** - Deliverable: CSP-policy
2. **Legg til som `<meta http-equiv="Content-Security-Policy">` i begge HTML-filer** - Deliverable: markup-tillegg
3. **Test at appen fortsatt fungerer fullt ut med policyen aktiv** - Deliverable: testrapport**

#### Spesifikasjoner:
- Forutsetter TASK 3.4 (fjerning av inline `onclick`) for å unngå å måtte tillate `unsafe-inline`

#### Success Criteria:
- [ ] CSP aktiv uten å bryte funksjonalitet
- [ ] Ingen `unsafe-inline`/`unsafe-eval` nødvendig etter refaktorering
- [ ] Ingen konsollvarsler om blokkert innhold

---

## GRUPPE 8: Testing & QA

### TASK 8.1: Skriv en manuell testsjekkliste for kjernefunksjonalitet

**Agent**: Testing & QA
**Subagent(er)**: Manuell testing
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 1 time

#### Subtasks:
1. **List opp alle brukerflyter (sjekk-inn, pust, handling, historikk) som testbare steg** - Deliverable: sjekklistedokument
2. **Definer forventet resultat for hvert steg** - Deliverable: forventningsverdier
3. **Lagre sjekklisten i repoet (f.eks. `TESTING.md`)** - Deliverable: dokumentfil**

#### Spesifikasjoner:
- Skal kunne kjøres av hvem som helst uten teknisk bakgrunn på 10 minutter

#### Success Criteria:
- [ ] Sjekkliste dekker alle 4 sider
- [ ] Hvert steg har klart forventet resultat
- [ ] Dokument committet til repo

---

### TASK 8.2: Test på flere nettlesere og enheter

**Agent**: Testing & QA
**Subagent(er)**: Manuell testing
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Kjør sjekkliste fra TASK 8.1 på Chrome, Safari og Firefox** - Deliverable: testresultater
2. **Test på ekte mobilenhet (iOS Safari og Android Chrome minimum)** - Deliverable: testresultater
3. **Dokumenter avvik og lag oppfølgingsoppgaver ved funn** - Deliverable: feilliste**

#### Spesifikasjoner:
- Spesielt viktig: `setTimeout`-basert pustesyklus og `localStorage`-oppførsel i privat/inkognitomodus

#### Success Criteria:
- [ ] Testet på minst 3 nettlesere
- [ ] Testet på minst 1 iOS og 1 Android-enhet
- [ ] Alle funn dokumentert med reproduksjonssteg

---

### TASK 8.3: Test appens oppførsel i privat/inkognitomodus

**Agent**: Testing & QA
**Subagent(er)**: Regresjonssjekk
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Verifiser at appen ikke krasjer når `localStorage` er begrenset/utilgjengelig** - Deliverable: testresultat
2. **Legg til graceful fallback hvis `localStorage`-tilgang feiler (try/catch)** - Deliverable: kodeendring hvis nødvendig
3. **Test på Safari privat modus spesielt (kjent for strengere begrensninger)** - Deliverable: testresultat**

#### Spesifikasjoner:
- Appen skal fortsatt være brukbar (om enn uten historikk) selv uten lagring

#### Success Criteria:
- [ ] Ingen ukjørte feil i privat modus
- [ ] Appen degraderer gracefully uten lagring
- [ ] Testet spesifikt på Safari privat modus

---

### TASK 8.4: Sett opp en enkel regresjonssjekkliste for hver endring

**Agent**: Testing & QA
**Subagent(er)**: Regresjonssjekk
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Definer et minimum "smoke test"-sett (5-8 steg) som kjøres etter hver endring** - Deliverable: kort sjekkliste
2. **Inkluder verifisering av at `localStorage`-data fra tidligere versjon fortsatt leses korrekt** - Deliverable: migrasjonssjekk
3. **Legg sjekklisten i `TESTING.md` sammen med TASK 8.1** - Deliverable: dokumentoppdatering**

#### Spesifikasjoner:
- Skal ta under 5 minutter å kjøre manuelt

#### Success Criteria:
- [ ] Smoke test-liste eksisterer og er kort
- [ ] Dekker datamigrasjonsrisiko
- [ ] Brukt konsekvent ved fremtidige endringer

---

### TASK 8.5: Valider HTML/CSS mot standarder

**Agent**: Testing & QA
**Subagent(er)**: Manuell testing
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 30 minutter

#### Subtasks:
1. **Kjør `index.html` og `isolation-mirror.html` gjennom W3C HTML-validator** - Deliverable: valideringsrapport
2. **Rett eventuelle strukturelle feil (manglende alt-tekst, feil nesting)** - Deliverable: rettet markup
3. **Verifiser gyldig CSS uten ubrukte/duplikate regler** - Deliverable: opprydding hvis funnet**

#### Spesifikasjoner:
- Ren validering, ingen funksjonell endring forventet

#### Success Criteria:
- [ ] 0 kritiske valideringsfeil
- [ ] Ingen visuell endring fra rettelser
- [ ] Rapport vedlagt i PR/commit

---

## GRUPPE 9: Ytelse & PWA/offline

### TASK 9.1: Gjør appen installérbar som PWA

**Agent**: Ytelse & PWA/offline
**Subagent(er)**: Installérbarhet
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 2 timer

#### Subtasks:
1. **Lag `manifest.json` med navn, farger, ikoner og `display: standalone`** - Deliverable: ny manifest-fil
2. **Design/generer app-ikon i nødvendige størrelser (192x192, 512x512)** - Deliverable: ikonfiler
3. **Koble manifest til `index.html` via `<link rel="manifest">`** - Deliverable: markup-tillegg**

#### Spesifikasjoner:
- Ikon skal reflektere appens rolige, grønne/blå palett
- `theme-color` skal matche `--bg`

#### Success Criteria:
- [ ] Appen viser "Legg til på hjemskjerm"-prompt på mobil
- [ ] Installert app åpnes uten nettleser-UI (standalone)
- [ ] Ikon vises korrekt på hjemskjerm

---

### TASK 9.2: Implementer service worker for offline-bruk

**Agent**: Ytelse & PWA/offline
**Subagent(er)**: Offline-støtte
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 3 timer

#### Subtasks:
1. **Skriv enkel service worker som cacher `index.html` og assets ved første besøk** - Deliverable: `sw.js`
2. **Registrer service worker i `index.html`** - Deliverable: registreringskode
3. **Test at appen laster og fungerer fullt uten nettverk etter første besøk** - Deliverable: offline-testrapport**

#### Spesifikasjoler:
- Cache-strategi: cache-first for statiske assets, siden appen ikke har noe backend uansett
- Må håndtere oppdatering av cache ved ny versjon (versjonert cache-navn)

#### Success Criteria:
- [ ] Appen fungerer fullstendig i flymodus etter første besøk
- [ ] Ny versjon av appen oppdaterer cache korrekt
- [ ] Ingen stale data vises feilaktig

---

### TASK 9.3: Minimer og optimaliser assets

**Agent**: Ytelse & PWA/offline
**Subagent(er)**: Offline-støtte
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 1 time

#### Subtasks:
1. **Mål nåværende filstørrelse på `index.html`** - Deliverable: målingsrapport
2. **Vurder om minifisering er verdt kompleksiteten gitt appens allerede lille størrelse** - Deliverable: anbefaling
3. **Komprimer eventuelle nye ikon/bildefiler fra TASK 9.1** - Deliverable: optimaliserte filer**

#### Spesifikasjoner:
- Appen er allerede svært lett (~11KB) — prioriter enkelhet over prematur optimalisering

#### Success Criteria:
- [ ] Filstørrelser dokumentert før/etter
- [ ] Ingen unødvendig kompleksitet introdusert
- [ ] Nye assets er komprimert

---

### TASK 9.4: Legg til `theme-color` og statuslinje-styling for mobil

**Agent**: Ytelse & PWA/offline
**Subagent(er)**: Installérbarhet
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 30 minutter

#### Subtasks:
1. **Legg til `<meta name="theme-color">` matchende `--bg`** - Deliverable: meta-tag
2. **Legg til `apple-mobile-web-app-capable` og relaterte iOS-spesifikke meta-tags** - Deliverable: meta-tags
3. **Test statuslinjefarge på iOS og Android hjemskjerm-app** - Deliverable: skjermdump-verifisering**

#### Spesifikasjoner:
- Skal fungere sammen med eventuell dark mode fra TASK 2.2 (to `theme-color`-verdier via media query)

#### Success Criteria:
- [ ] Statuslinje matcher appens fargepalett på mobil
- [ ] Fungerer korrekt i både lys og mørk modus
- [ ] Ingen visuell "hopp" ved oppstart

---

### TASK 9.5: Mål og dokumenter grunnleggende ytelse (Lighthouse)

**Agent**: Ytelse & PWA/offline
**Subagent(er)**: Offline-støtte · Installérbarhet
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Kjør Lighthouse-audit (Performance, Accessibility, Best Practices, PWA, SEO)** - Deliverable: rapport
2. **Dokumenter score før og etter gruppe 6/9-oppgavene er gjennomført** - Deliverable: sammenligning
3. **Lag oppfølgingsoppgaver for eventuelle gjenværende funn under 90 poeng** - Deliverable: ny backlog-oppføring hvis nødvendig**

#### Spesifikasjoner:
- Kjør i inkognitomodus for å unngå påvirkning fra extensions

#### Success Criteria:
- [ ] Alle 5 Lighthouse-kategorier målt
- [ ] Rapport dokumentert i repo
- [ ] PWA-score forbedret etter TASK 9.1/9.2

---

## GRUPPE 10: Distribusjon & vedlikehold

### TASK 10.1: Sett opp enkel statisk hosting med automatisk deploy

**Agent**: Distribusjon & vedlikehold
**Subagent(er)**: Hosting/CI
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 1 time

#### Subtasks:
1. **Velg hostingløsning (GitHub Pages er naturlig gitt at det er et GitHub-repo)** - Deliverable: valgt løsning
2. **Sett opp GitHub Actions-workflow eller Pages-konfigurasjon for automatisk publisering ved push til main** - Deliverable: `.github/workflows/deploy.yml` eller Pages-innstilling
3. **Verifiser at appen laster korrekt på den publiserte URL-en** - Deliverable: bekreftet live-lenke**

#### Spesifikasjoner:
- Ingen byggeprosess nødvendig — ren statisk publisering av HTML/CSS/JS

#### Success Criteria:
- [ ] Appen er tilgjengelig på en offentlig URL
- [ ] Ny push til main oppdaterer live-versjonen automatisk
- [ ] Service worker (TASK 9.2) fungerer korrekt på live-URL

---

### TASK 10.2: Utvid README med utviklings- og bidragsinstruksjoner

**Agent**: Distribusjon & vedlikehold
**Subagent(er)**: Dokumentasjon
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 time

#### Subtasks:
1. **Legg til seksjon om hvordan kjøre appen lokalt (kun åpne `index.html`, evt. enkel lokal server)** - Deliverable: README-seksjon
2. **Dokumenter filstruktur etter TASK 3.1-splitting** - Deliverable: README-seksjon
3. **Legg til lenke til `TASKS.md` og `TESTING.md`** - Deliverable: README-oppdatering**

#### Spesifikasjoner:
- Hold README kort og praktisk, i tråd med prosjektets enkelhet

#### Success Criteria:
- [ ] Ny bidragsyter kan komme i gang uten å spørre noen
- [ ] Filstruktur er korrekt dokumentert
- [ ] Alle relevante dokumenter lenket

---

### TASK 10.3: Legg til `.gitignore` og grunnleggende repo-hygiene

**Agent**: Distribusjon & vedlikehold
**Subagent(er)**: Hosting/CI
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 15 minutter

#### Subtasks:
1. **Legg til `.gitignore` for vanlige OS/editor-genererte filer (`.DS_Store`, `.vscode/`, etc.)** - Deliverable: ny fil
2. **Verifiser at ingen slike filer allerede er committet** - Deliverable: repo-sjekk
3. **Rydd bort eventuelle funn** - Deliverable: opprydding hvis nødvendig**

#### Spesifikasjoner:
- Standard, minimal `.gitignore` — ingen byggeverktøy å ekskludere ennå

#### Success Criteria:
- [ ] `.gitignore` til stede
- [ ] Ingen støyfiler i repoet
- [ ] Fremtidige commits forblir rene

---

### TASK 10.4: Definer versjonering og endringslogg

**Agent**: Distribusjon & vedlikehold
**Subagent(er)**: Dokumentasjon
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 30 minutter

#### Subtasks:
1. **Opprett `CHANGELOG.md` med enkel struktur (dato, endringer)** - Deliverable: ny fil
2. **Logg alle endringer gjort fra denne backloggen etter hvert som de fullføres** - Deliverable: løpende oppdatering
3. **Vurder enkel semantisk versjonstagging i git ved større milepæler** - Deliverable: anbefaling**

#### Spesifikasjoner:
- Holdes enkelt — ingen automatisert release-pipeline nødvendig for et prosjekt i denne skalaen

#### Success Criteria:
- [ ] `CHANGELOG.md` opprettet
- [ ] Klar struktur for fremtidige oppføringer
- [ ] Praktisk, ikke over-engineert

---

### TASK 10.5: Etabler en enkel prosess for å prioritere denne backloggen videre

**Agent**: Distribusjon & vedlikehold
**Subagent(er)**: Hosting/CI · Dokumentasjon
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 30 minutter

#### Subtasks:
1. **Marker i `TASKS.md` hvilke oppgaver som er fullført etter hvert (checkbox eller status)** - Deliverable: oppdatert statuskolonne
2. **Definer en enkel regel for rekkefølge: KRITISK/HØY først, avhengigheter respektert (f.eks. 3.4 før 7.5)** - Deliverable: kort prioriteringsnotat
3. **Identifiser de 5 oppgavene med høyest verdi/lavest innsats som neste sprint** - Deliverable: "Neste opp"-liste**

#### Spesifikasjoner:
- Ingen ekstern prosjektstyringsverktøy nødvendig — hold det i `TASKS.md`

#### Success Criteria:
- [ ] Statussporing etablert
- [ ] Avhengigheter mellom oppgaver eksplisitt notert
- [ ] Klar "neste opp"-liste for videre arbeid

---

## Anbefalt rekkefølge for neste sprint (høyest verdi, lavest friksjon)

1. **TASK 7.4** – Fjern villedende bildeopplasting i Isolation Mirror (tillit/personvern)
2. **TASK 6.5** – Fjern `user-scalable=no` (rask a11y-fix)
3. **TASK 3.2** – Konsolider `localStorage`-tilgang (muliggjør 7.2, 7.3, 5.3 trygt)
4. **TASK 7.2** – Slett-all-data-knapp (personvernstillit)
5. **TASK 2.3** – Forbedre pustesirkelens visuelle presisjon (kjerneopplevelse)
6. **TASK 9.1 + 9.2** – Gjør appen installérbar og offline-kapabel
7. **TASK 4.1** – Flere pustemønstre (differensierende kjernefunksjon)
8. **TASK 6.1 + 6.2** – ARIA og tastaturnavigasjon (tilgjengelighet for sårbar brukergruppe)
9. **TASK 10.1** – Automatisk deploy (gjør appen faktisk tilgjengelig for brukere)
10. **TASK 1.2** – Avklar Isolation Mirror sin fremtid i appen
