# Multi-Agent Task Generation — Rolig / Pusterom Mini-App

Generert med et 10-primæragent / 10-subagent rammeverk for å ta appen fra
dagens tilstand (statisk HTML/CSS/JS, 4 sider, `localStorage`) til et
produksjonsklart, forsvarlig produkt.

**Grunnlag for ekstraksjon:** Ingen bilder var vedlagt i forespørselen. Fase 1
("scan alle inputbilder") er derfor erstattet med en gjennomgang av
kildekoden: `index.html` (Innsjekk/humør, Pusterom-pust 4-2-6s, Små grep,
Historikk/ukesoppsummering, alt i `localStorage`) og `isolation-mirror.html`
("Rolig 2.0"-konsept: notat/bilde → privat protokoll + valgfri "Mirror Art"
med Flux/Midjourney-prompt, fjord/Bergen-estetikk). "CAD & Teknisk Tegning"
er tilpasset fra mekanisk CAD til flytdiagrammer, komponent-blueprints og
UI-spesifikasjoner, siden produktet er software.

## Agenter

**Primæragenter**
1. Innovasjon & Ideutvikling (ID)
2. UX/UI Design (UX)
3. Teknisk Arkitektur (ARK)
4. CAD & Teknisk Tegning → Flytdiagram/Blueprint (CAD)
5. Prototyputvikling (PROTO)
6. Visuelle Eiendeler & Produksjon (VIS)
7. Markedsanalyse & Research (MARK)
8. Spesifikasjonsdokumentasjon (SPEC)
9. Testing & Quality Assurance (QA)
10. Implementering & Deployment (DEPLOY)

**Subagenter**
- 1a Trendspaning · 1b Konseptvalidering & Etikk
- 2a Wireframing & Flyt · 2b Mikrointeraksjon & Tilgjengelighet
- 3a Datamodell & Lagring · 3b Systemintegrasjon/PWA
- 4a Flytdiagrammer · 4b Komponentspesifikasjon
- 5a Interaktiv kodeprototype · 5b Brukertestrigg
- 6a Ikon & Illustrasjon · 6b Lyd & Haptikk
- 7a Konkurrentanalyse · 7b Målgruppeinnsikt
- 8a Kravdokumentasjon · 8b Debugging-protokoll
- 9a Funksjonstesting · 9b Ytelse & Tilgjengelighetstesting
- 10a Hosting/PWA-pakking · 10b Analytics & Monitoring

## Prioritetsoversikt (1 = høyest verdi)

| # | Task | Agent | Prioritet |
|---|------|-------|-----------|
| 1 | PWA-konvertering | ARK/DEPLOY | KRITISK |
| 2 | Krisevarsling & hjelpelinjer | SPEC/ID | KRITISK |
| 3 | Tilgjengelighetsaudit (WCAG) | QA/UX | KRITISK |
| 4 | Robust datalagring (IndexedDB-migrering) | ARK | KRITISK |
| 5 | Personvernerklæring & anonymitetsgaranti | SPEC | KRITISK |
| 6 | Isolation Mirror 2.0 — konsept- og etikkvalidering | ID/SPEC | KRITISK |
| 7 | Tilpassbare pustemønstre | PROTO/UX | KRITISK |
| 8 | Humørhistorikk-graf | UX/PROTO | HØY |
| 9 | App-ikon & branding | VIS | HØY |
| 10 | Lighthouse/ytelsesaudit | QA | HØY |
| 11 | Konkurrentanalyse | MARK | HØY |
| 12 | Full navigasjonsflyt (blueprint) | CAD | HØY |
| 13 | Design-system spec (tokens) | UX/CAD | HØY |
| 14 | Mikrointeraksjoner & haptikk | VIS/PROTO | HØY |
| 15 | Valgfritt ambient lydlandskap | VIS | HØY |
| 16 | Skjermleser-testing | QA | HØY |
| 17 | Dark mode | UX/PROTO | HØY |
| 18 | Hjemskjerm-snarvei for rask pust-økt | PROTO/ARK | HØY |
| 19 | Lokale påminnelser | PROTO/ARK | HØY |
| 20 | Dataeksport (GDPR-portabilitet) | SPEC/ARK | HØY |
| 21 | Engelsk lokalisering | SPEC/PROTO | HØY |
| 22 | Målgruppeinnsikt/brukerintervjuer | MARK | HØY |
| 23 | Prisstrategi | MARK | HØY |
| 24 | Go-to-market-plan | MARK/ID | HØY |
| 25 | Isolation Mirror — personvern-first arkitektur | ARK/SPEC | HØY |
| 26 | Isolation Mirror — UI-prototype | UX/PROTO | HØY |
| 27 | Kunstgenerering opt-in-pipeline | PROTO/VIS | HØY |
| 28 | Automatisert testsuite | QA | HØY |
| 29 | CI/CD for statisk app | DEPLOY | HØY |
| 30 | Sikkerhetsgjennomgang (XSS/input) | QA | HØY |
| 31 | Ukentlig sammendrag (opt-in) | PROTO | MEDIUM |
| 32 | Myk gamification (streaks uten press) | ID/UX | MEDIUM |
| 33 | Anonymisert delingsfunksjon | PROTO | MEDIUM |
| 34 | Hjelpelinje-katalog per land | SPEC/MARK | MEDIUM |
| 35 | Utvidet "Små grep"-bibliotek | ID/VIS | MEDIUM |
| 36 | Personalisert forslagsmotor | PROTO/ARK | MEDIUM |
| 37 | Offline-first synk (fremtidig backend) | ARK | MEDIUM |
| 38 | Bruksmønsteranalyse (personvern-vennlig) | ARK/MARK | MEDIUM |
| 39 | Merkevareguide | VIS/SPEC | MEDIUM |
| 40 | Frittstående landingsside | VIS/DEPLOY | MEDIUM |
| 41 | App store-forberedelse (TWA/wrapper) | DEPLOY/VIS | MEDIUM |
| 42 | Brukertesting runde 1 | QA/MARK | MEDIUM |
| 43 | Iterasjon etter brukertesting | PROTO | MEDIUM |
| 44 | Skalerbarhetsplan for backend | ARK/SPEC | MEDIUM |
| 45 | Kvalitetssjekk norsk språk/tone | SPEC/UX | MEDIUM |
| 46 | Fellesskapsfunksjon — risikovurdering | ID/SPEC | LAV |
| 47 | Wearable-integrasjon (pulsstyrt pust) | ARK/PROTO | LAV |
| 48 | AI-samtalestøtte — etisk forhåndsvurdering | ID/SPEC | LAV |
| 49 | Fysisk merchandise (pusterom-kort) | CAD/VIS | LAV |
| 50 | Internasjonal ekspansjonsstrategi | MARK | LAV |

---

## TASK 1.1: PWA-konvertering

**Agent**: Implementering & Deployment
**Subagent(er)**: Systemintegrasjon/PWA, Hosting/PWA-pakking
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 2 dager

### Subtasks:
1. **Skriv manifest.json** (navn, ikoner, theme_color, standalone display) - Deliverable: `manifest.json`
2. **Implementer service worker** for offline-caching av de 3 HTML-filene - Deliverable: `sw.js` med cache-first-strategi
3. **Koble manifest + service worker til `index.html`** - Deliverable: oppdatert `<head>` med lenker og registrering
4. **Test installer-prompt på Android/iOS** - Deliverable: skjermbilder av "Legg til på hjemskjerm"-flyt

### Spesifikasjoner:
- Manifest må inkludere 192px og 512px ikoner
- Service worker skal cache app-shell, ikke `localStorage`-data
- Må fungere uten nettverk etter første last

### Success Criteria:
- [ ] Lighthouse PWA-score ≥ 90
- [ ] App åpnes offline etter installasjon
- [ ] Installerbar på Chrome (Android) og Safari (iOS, "Add to Home Screen")

---

## TASK 2.1: Krisevarsling & hjelpelinjer

**Agent**: Spesifikasjonsdokumentasjon
**Subagent(er)**: Kravdokumentasjon, Innovasjon & Ideutvikling
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 1 dag

### Subtasks:
1. **Definer terskel** for når laveste humør-nivå (😔, gjentatt) skal vise støtteinfo - Deliverable: regelspesifikasjon
2. **Samle offisielle norske hjelpelinjer** (Mental Helse 116 123, Kirkens SOS) - Deliverable: verifisert lenke-/telefonliste
3. **Design ikke-påtrengende varselboks** som vises på Innsjekk-siden - Deliverable: HTML/CSS-komponent
4. **Skriv varsom, ikke-diagnostiserende tekst** - Deliverable: godkjent tekstinnhold

### Spesifikasjoner:
- Appen skal aldri fremstå som medisinsk behandling eller diagnose
- Hjelpeinfo skal være synlig, men ikke skambelagt eller alarmerende
- Ingen automatisk deling av data til tredjepart ved lavt humør

### Success Criteria:
- [ ] Hjelpelinje vises ved 2+ påfølgende laveste humør-registreringer
- [ ] Tekst gjennomgått for varsomt språk
- [ ] Ingen falske medisinske påstander i UI

---

## TASK 3.1: Tilgjengelighetsaudit (WCAG)

**Agent**: Testing & Quality Assurance
**Subagent(er)**: Ytelse & Tilgjengelighetstesting, UX/UI Design
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 1-2 dager

### Subtasks:
1. **Kjør automatisert scan** (axe-core/Lighthouse) mot alle 4 sider - Deliverable: funn-rapport
2. **Fiks kontrastforhold** (`--muted` mot `--bg` er i dag under 4.5:1) - Deliverable: oppdaterte CSS-variabler
3. **Legg til `aria-label`** på nav-knapper og humør-knapper - Deliverable: oppdatert `index.html`
4. **Fjern avhengighet av global `event`** i `switchPage()` (bruker implisitt `event.currentTarget`, bryter med tastaturnavigasjon i strict mode) - Deliverable: refaktorert funksjon med eksplisitt argument

### Spesifikasjoner:
- Skal bestå WCAG 2.1 AA for kontrast og fokusindikatorer
- Alle interaktive elementer navigerbare med Tab/Enter
- Skjermleser skal kunne lese humør-status og pust-fase

### Success Criteria:
- [ ] Lighthouse Accessibility-score ≥ 95
- [ ] Ingen kritiske axe-core-funn
- [ ] Full tastaturnavigasjon verifisert manuelt

---

## TASK 4.1: Robust datalagring (IndexedDB-migrering)

**Agent**: Teknisk Arkitektur
**Subagent(er)**: Datamodell & Lagring
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 2 dager

### Subtasks:
1. **Design skjema** for checkins/doneActions i IndexedDB - Deliverable: skjemadokument
2. **Skriv migreringsscript** fra eksisterende `localStorage`-nøkler (`checkins`, `doneActions`) - Deliverable: `migrate.js`
3. **Implementer fallback** til `localStorage` for eldre nettlesere - Deliverable: abstraksjonslag (`storage.js`)
4. **Verifiser dataintegritet** etter migrering med testdata - Deliverable: testlogg

### Spesifikasjoner:
- Ingen datatap for eksisterende brukere ved oppgradering
- Kvoteforvaltning (varsle bruker før lagringsgrense nås)
- Async API, ingen blokkering av UI

### Success Criteria:
- [ ] 100 % av testet `localStorage`-data migrert korrekt
- [ ] App fungerer identisk i nettlesere uten IndexedDB
- [ ] Ingen regresson i Historikk-siden

---

## TASK 5.1: Personvernerklæring & anonymitetsgaranti

**Agent**: Spesifikasjonsdokumentasjon
**Subagent(er)**: Kravdokumentasjon
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 1 dag

### Subtasks:
1. **Kartlegg all datalagring** (mood, notater, bilder i Isolation Mirror) - Deliverable: dataflytoversikt
2. **Skriv personvernerklæring på norsk** (klarspråk, ingen juridisk sjargong) - Deliverable: `personvern.html`
3. **Bekreft: ingen data sendes til server** i dagens arkitektur - Deliverable: verifisert arkitekturnotat
4. **Legg til lenke** i alle 4 sider (footer/nav) - Deliverable: oppdatert navigasjon

### Spesifikasjoner:
- Må eksplisitt si at data kun lagres lokalt på enheten
- Må beskrive hva som skjer ved sletting av nettleserdata
- Klart språk, lesbart av personer i krise (ikke lang juratekst)

### Success Criteria:
- [ ] Personvernerklæring tilgjengelig fra alle sider
- [ ] Ingen skjulte datainnsamlinger avdekket i kodegjennomgang
- [ ] Lesbarhetsnivå egnet for allmennheten

---

## TASK 6.1: Isolation Mirror 2.0 — konsept- og etikkvalidering

**Agent**: Innovasjon & Ideutvikling
**Subagent(er)**: Konseptvalidering & Etikk, Spesifikasjonsdokumentasjon
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 2 dager

### Subtasks:
1. **Vurder sårbarhet i målgruppen** (isolasjon, nedstemthet + bildeopplasting) - Deliverable: risikovurderingsnotat
2. **Definer hva "Mirror Art" faktisk skal generere** og hvor (lokalt vs. eksternt API) - Deliverable: teknisk beslutningsnotat
3. **Fjern/erstatt tilfeldig genererte, ubegrunnede tekstpåstander** (dagens `generate()` skriver diktet tekst uavhengig av input) - Deliverable: revidert logikkspesifikasjon
4. **Bestem opt-in-flyt for eventuell bildedeling** til Flux/Midjourney-type tjenester - Deliverable: samtykke-UI-spec

### Spesifikasjoner:
- Ingen bilde eller notat skal forlate enheten uten eksplisitt, informert samtykke
- Funksjonen skal ikke erstatte eller etterligne profesjonell hjelp
- Må ha en "dette er ikke terapi"-disclaimer

### Success Criteria:
- [ ] Skriftlig etisk vurdering godkjent før videre utvikling
- [ ] Klar arkitekturbeslutning: lokal vs. ekstern bildegenerering
- [ ] Samtykkeflyt spesifisert i detalj

---

## TASK 7.1: Tilpassbare pustemønstre

**Agent**: Prototyputvikling
**Subagent(er)**: Interaktiv kodeprototype, UX/UI Design
**Prioritet**: KRITISK
**Estimert Verdi**: Høy
**Timeline**: 1 dag

### Subtasks:
1. **Legg til 4-7-8 og box breathing (4-4-4-4)** som alternativ til dagens 4-2-6 - Deliverable: utvidet `runBreathCycle()`
2. **Bygg mønster-velger UI** på Pusterom-siden - Deliverable: knapperad/dropdown
3. **Lagre foretrukket mønster** i lagring - Deliverable: persistens-logikk
4. **Juster sirkelanimasjon-timing dynamisk** per mønster - Deliverable: CSS-transition-oppdatering

### Spesifikasjoner:
- Minimum 3 pustemønstre tilgjengelig
- Overgang mellom faser skal være mykt animert (ingen hakking)
- Valg huskes til neste økt

### Success Criteria:
- [ ] Bruker kan bytte mønster uten sideomlasting
- [ ] Riktig timing per fase verifisert med stoppeklokke
- [ ] Valgt mønster persisterer mellom økter

---

## TASK 8.1: Humørhistorikk-graf

**Agent**: UX/UI Design
**Subagent(er)**: Wireframing & Flyt, Interaktiv kodeprototype
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 1-2 dager

### Subtasks:
1. **Design enkel linje-/punktgraf** for humør over 7/30 dager - Deliverable: wireframe
2. **Implementer graf med SVG** (ingen tunge chart-biblioteker) - Deliverable: `renderMoodChart()`
3. **Koble til eksisterende `checkins`-data** - Deliverable: integrasjon i Historikk-siden
4. **Legg til periode-veksling** (uke/måned) - Deliverable: toggle-komponent

### Spesifikasjoner:
- Ingen eksterne avhengigheter (ren SVG/Canvas)
- Skal fungere med 0, 1 eller mange datapunkter uten feil
- Tilgjengelig med `aria-label`-beskrivelse av trend

### Success Criteria:
- [ ] Graf rendrer korrekt med tomt datasett
- [ ] Graf oppdateres umiddelbart etter ny innsjekk
- [ ] Lesbar på 375px skjermbredde

---

## TASK 9.1: App-ikon & branding

**Agent**: Visuelle Eiendeler & Produksjon
**Subagent(er)**: Ikon & Illustrasjon
**Prioritet**: HØY
**Estimert Verdi**: Høy
**Timeline**: 1 dag

### Subtasks:
1. **Design app-ikon** i eksisterende fargepalett (soft-green/soft-blue) - Deliverable: SVG-kildefil
2. **Eksporter ikonsett** (192/512/apple-touch-icon) - Deliverable: PNG-filer
3. **Design favicon** - Deliverable: `favicon.ico`
4. **Lag enkel splash screen** for PWA-oppstart - Deliverable: splash-bilde per skjermstørrelse

### Spesifikasjoner:
- Skal reflektere "rolig"-følelsen: myke former, ingen skarpe kanter
- Konsistent med eksisterende CSS-fargevariabler
- Format: SVG-kilde + rasteriserte PNG i påkrevde størrelser

### Success Criteria:
- [ ] Ikon leselig i 48px størrelse
- [ ] Alle nødvendige PWA-ikonstørrelser levert
- [ ] Godkjent visuell konsistens med appens design

---

## TASK 10.1: Lighthouse/ytelsesaudit

**Agent**: Testing & Quality Assurance
**Subagent(er)**: Ytelse & Tilgjengelighetstesting
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 0.5 dag

### Subtasks:
1. **Kjør Lighthouse** på alle sider (mobil + desktop) - Deliverable: rapport
2. **Identifiser render-blocking ressurser** (inline CSS/JS er i dag én fil - sjekk størrelse) - Deliverable: funnliste
3. **Minifiser/optimaliser** ved behov - Deliverable: oppdaterte filer
4. **Sett opp terskler** for fremtidig regresjon - Deliverable: `lighthouserc.json`

### Spesifikasjoner:
- Mål: Performance ≥ 90 på mobil, 3G-simulert
- Total sidevekt bør holdes under 100KB per side
- Ingen blokkerende eksterne script

### Success Criteria:
- [ ] Performance-score ≥ 90
- [ ] First Contentful Paint < 1.5s på simulert 3G
- [ ] Terskeldokument commitet til repo

---

## TASK 11.1: Konkurrentanalyse

**Agent**: Markedsanalyse & Research
**Subagent(er)**: Konkurrentanalyse
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Kartlegg direkte konkurrenter** (Calm, Headspace, Nettly, Assistert Selvhjelp) - Deliverable: sammenligningstabell
2. **Identifiser norske/nordiske nisjeaktører** - Deliverable: markedskart
3. **Analyser prismodeller** hos konkurrenter - Deliverable: prisoversikt
4. **Identifiser differensieringsmuligheter** (norsk språk, personvern-first, gratis) - Deliverable: posisjoneringsnotat

### Spesifikasjoner:
- Minimum 8 konkurrenter analysert
- Inkluder både globale og norske/nordiske aktører
- Vurder personvernpraksis som differensieringsakse

### Success Criteria:
- [ ] Sammenligningstabell dekker funksjoner, pris og personvern
- [ ] Minst 3 konkrete differensieringspunkter identifisert
- [ ] Rapport delt med produktteam

---

## TASK 12.1: Full navigasjonsflyt (blueprint)

**Agent**: CAD & Teknisk Tegning
**Subagent(er)**: Flytdiagrammer
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Tegn flytdiagram** for alle 4 sider + fremtidige sider (personvern, innstillinger) - Deliverable: diagram (Mermaid/SVG)
2. **Dokumenter tilstander** per side (tom, delvis utfylt, feilende) - Deliverable: tilstandstabell
3. **Marker datainnhenting/-lagringspunkter** i flyten - Deliverable: annotert diagram
4. **Valider mot faktisk `switchPage()`-logikk** i koden - Deliverable: avviksliste

### Spesifikasjoner:
- Diagram skal være i tekstbasert format (Mermaid) for versjonskontroll
- Skal dekke feiltilstander (f.eks. ingen humør valgt)
- Skal inkludere fremtidige planlagte sider

### Success Criteria:
- [ ] Diagram dekker 100 % av eksisterende sider og overganger
- [ ] Ingen avvik mellom diagram og faktisk kode
- [ ] Diagram lagret som versjonert `.mmd`-fil i repo

---

## TASK 13.1: Design-system spec (tokens)

**Agent**: UX/UI Design
**Subagent(er)**: Wireframing & Flyt, Komponentspesifikasjon
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Ekstraher eksisterende CSS-variabler** til et formelt token-dokument - Deliverable: `design-tokens.md`
2. **Definer typografiskala** (i dag ad-hoc rem-verdier) - Deliverable: typografitabell
3. **Definer spacing-skala** (4/8/12/16/20/24px-rytme) - Deliverable: spacing-tabell
4. **Dokumenter komponentvarianter** (btn, btn-secondary, action-card, history-item) - Deliverable: komponentkatalog

### Spesifikasjoner:
- Skal være kilde til sannhet for fremtidig UI-arbeid
- Ingen nye farger uten at de legges til i tokens først
- Format: Markdown + CSS custom properties

### Success Criteria:
- [ ] Alle eksisterende farger/typografi/spacing dokumentert
- [ ] Ingen hardkodede verdier igjen utenfor `:root`
- [ ] Dokument brukt som referanse i minst én senere task

---

## TASK 14.1: Mikrointeraksjoner & haptikk

**Agent**: Visuelle Eiendeler & Produksjon
**Subagent(er)**: Lyd & Haptikk, Interaktiv kodeprototype
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Legg til `navigator.vibrate()`-puls** ved fase-skifte i Pusterom (der støttet) - Deliverable: haptikk-hook
2. **Animer mood-btn-valg** med myk "bounce" - Deliverable: CSS keyframes
3. **Legg til subtil konfetti/bekreftelse** ved fullført "Små grep"-handling - Deliverable: mikroanimasjon
4. **Test på ekte mobilenhet** - Deliverable: testlogg

### Spesifikasjoner:
- Haptikk skal være valgfri/av som standard på iOS (ikke støttet uansett)
- Animasjoner skal respektere `prefers-reduced-motion`
- Ingen interaksjon skal føles påtrengende for en stresset bruker

### Success Criteria:
- [ ] `prefers-reduced-motion` respekteres fullt ut
- [ ] Haptikk verifisert på minst én Android-enhet
- [ ] Ingen animasjon lengre enn 400ms

---

## TASK 15.1: Valgfritt ambient lydlandskap

**Agent**: Visuelle Eiendeler & Produksjon
**Subagent(er)**: Lyd & Haptikk
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1-2 dager

### Subtasks:
1. **Velg/produser 2-3 lydspor** (regn, skog, stillhet) lisensfritt - Deliverable: komprimerte lydfiler (< 500KB hver)
2. **Bygg av/på-bryter** på Pusterom-siden - Deliverable: UI-toggle
3. **Loop lyd synkronisert** med pustesyklus (valgfritt) - Deliverable: audio-hook
4. **Test batteri-/dataforbruk** - Deliverable: målingsrapport

### Spesifikasjoner:
- Lyd skal være av som standard (ingen autoplay ved sidelast)
- Total lydfilstørrelse < 1.5MB samlet
- Skal kunne caches av service worker for offline bruk

### Success Criteria:
- [ ] Lyd starter kun ved eksplisitt brukervalg
- [ ] Loop uten hørbare hakk
- [ ] Fungerer offline etter første nedlasting

---

## TASK 16.1: Skjermleser-testing

**Agent**: Testing & Quality Assurance
**Subagent(er)**: Ytelse & Tilgjengelighetstesting
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Test alle 4 sider med VoiceOver** (iOS/macOS) - Deliverable: testlogg med funn
2. **Test med TalkBack** (Android) - Deliverable: testlogg med funn
3. **Fiks manglende `aria-live`** for `saveMsg`-bekreftelse og pustetekst - Deliverable: kodeoppdatering
4. **Dokumenter kjente begrensninger** - Deliverable: tilgjengelighetsnotat

### Spesifikasjoner:
- Pustefasetekst (`Pust inn…/Hold…/Pust ut…`) må annonseres til skjermleser
- Bekreftelsesmelding etter lagret innsjekk må annonseres
- Ingen "dødt" interaktivt element uten tilgjengelig navn

### Success Criteria:
- [ ] Alle kritiske flyter fullførbare kun med skjermleser
- [ ] `aria-live="polite"` lagt til der relevant
- [ ] Funnliste med 0 gjenværende kritiske avvik

---

## TASK 17.1: Dark mode

**Agent**: UX/UI Design
**Subagent(er)**: Interaktiv kodeprototype
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Definer mørk fargepalett** basert på `isolation-mirror.html`s eksisterende mørke tema - Deliverable: nye CSS-variabler
2. **Implementer `prefers-color-scheme`-deteksjon** - Deliverable: media query
3. **Bygg manuell av/på-bryter** i innstillinger - Deliverable: toggle + lagret preferanse
4. **Verifiser kontrast i mørk modus** - Deliverable: kontrastrapport

### Spesifikasjoner:
- Skal bruke CSS custom properties, ingen dupliserte stilark
- Standard: følg systeminnstilling, med manuelt overstyr
- Kontrast skal fortsatt møte WCAG AA i mørk modus

### Success Criteria:
- [ ] Mørk modus dekker alle 4 sider konsistent
- [ ] Preferanse persisterer mellom økter
- [ ] Kontrastrapport bestått for begge temaer

---

## TASK 18.1: Hjemskjerm-snarvei for rask pust-økt

**Agent**: Prototyputvikling
**Subagent(er)**: Interaktiv kodeprototype, Systemintegrasjon/PWA
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Legg til `shortcuts`-felt** i `manifest.json` som peker til Pusterom-siden direkte - Deliverable: manifest-oppdatering
2. **Håndter URL-parameter** (`?page=pusterom`) ved oppstart - Deliverable: init-logikk i script
3. **Test snarvei** via langtrykk på app-ikon (Android) - Deliverable: testlogg

### Spesifikasjoner:
- Snarvei skal åpne direkte på Pusterom, ikke Hjem
- Skal fungere selv om appen ikke er installert (ren URL)

### Success Criteria:
- [ ] Snarvei synlig ved langtrykk på installert ikon
- [ ] Direktenavigasjon til Pusterom bekreftet
- [ ] Ingen regresjon på vanlig oppstartsflyt

---

## TASK 19.1: Lokale påminnelser

**Agent**: Prototyputvikling
**Subagent(er)**: Systemintegrasjon/PWA, Datamodell & Lagring
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Undersøk Notification/Periodic Sync API-støtte** på tvers av nettlesere - Deliverable: teknisk vurderingsnotat
2. **Bygg samtykkeflyt** for varsler - Deliverable: opt-in UI
3. **Implementer daglig påminnelse-tidspunkt-velger** - Deliverable: innstillingskomponent
4. **Test faktisk varselutløsning** - Deliverable: testlogg per plattform

### Spesifikasjoner:
- Aldri send varsel uten eksplisitt samtykke
- Bruker skal kunne skru av når som helst uten friksjon
- Maks én daglig påminnelse som standard

### Success Criteria:
- [ ] Varsel utløses kun etter samtykke
- [ ] Av/på-bryter fungerer umiddelbart
- [ ] Fungerer på minst Android Chrome (iOS-begrensninger dokumentert)

---

## TASK 20.1: Dataeksport (GDPR-portabilitet)

**Agent**: Spesifikasjonsdokumentasjon
**Subagent(er)**: Kravdokumentasjon, Datamodell & Lagring
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Bygg "Eksporter mine data"-knapp** på Historikk-siden - Deliverable: UI-knapp
2. **Generer JSON-nedlasting** av `checkins` + `doneActions` - Deliverable: eksportfunksjon
3. **Bygg "Slett all min data"-funksjon** med bekreftelsesdialog - Deliverable: sletterutine
4. **Dokumenter rettighetene** i personvernerklæringen - Deliverable: tekstoppdatering

### Spesifikasjoner:
- Eksport i lesbart JSON-format
- Sletting skal være ugjenkallelig og tydelig kommunisert
- Ingen data forlater enheten ved eksport (kun lokal nedlasting)

### Success Criteria:
- [ ] Eksportert fil inneholder all brukerdata korrekt
- [ ] Sletting fjerner 100 % av lagret data
- [ ] Bekreftelsesdialog hindrer utilsiktet sletting

---

## TASK 21.1: Engelsk lokalisering

**Agent**: Spesifikasjonsdokumentasjon
**Subagent(er)**: Kravdokumentasjon, Interaktiv kodeprototype
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Ekstraher all UI-tekst** til nøkkelbasert oversettelsesfil - Deliverable: `strings.no.json`, `strings.en.json`
2. **Bygg enkel i18n-loader** (uten rammeverk) - Deliverable: `i18n.js`
3. **Oversett innhold** til engelsk (inkl. hjelpelinjer lokalisert til relevant land) - Deliverable: fullstendig engelsk tekstsett
4. **Legg til språkvelger** - Deliverable: UI-komponent

### Spesifikasjoner:
- Norsk forblir standardspråk
- Hjelpelinjer må tilpasses valgt språk/region, ikke bare oversettes
- Ingen hardkodet tekst igjen i HTML utenfor nøkkelsystemet

### Success Criteria:
- [ ] 100 % av UI-strenger tilgjengelig på begge språk
- [ ] Hjelpelinjer korrekte for engelsk visning
- [ ] Språkvalg persisterer

---

## TASK 22.1: Målgruppeinnsikt/brukerintervjuer

**Agent**: Markedsanalyse & Research
**Subagent(er)**: Målgruppeinnsikt
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 3-5 dager

### Subtasks:
1. **Rekrutter 6-10 respondenter** i målgruppen (unge voksne med stress/nedstemthet) - Deliverable: rekrutteringsliste
2. **Utform intervjuguide** - Deliverable: spørsmålssett
3. **Gjennomfør intervjuer** - Deliverable: transkripsjoner/notater
4. **Syntetiser funn** til personas og behovskart - Deliverable: innsiktsrapport

### Spesifikasjoner:
- Følg forsvarlig praksis ved rekruttering av sårbare grupper (frivillighet, anonymitet)
- Minimum 6 gjennomførte intervjuer
- Funn skal kobles direkte til konkrete produktbeslutninger

### Success Criteria:
- [ ] Minst 2 personas definert med data-støtte
- [ ] 5+ konkrete produktimplikasjoner identifisert
- [ ] Rapport delt med hele teamet

---

## TASK 23.1: Prisstrategi

**Agent**: Markedsanalyse & Research
**Subagent(er)**: Konkurrentanalyse
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Vurder gratis-vs-freemium-vs-donasjon-modeller** for et mental helse-nisjeprodukt - Deliverable: modellsammenligning
2. **Vurder etiske implikasjoner** av betalingsmur for stresshjelp - Deliverable: etikknotat
3. **Anbefal modell** med begrunnelse - Deliverable: beslutningsdokument

### Spesifikasjoner:
- Kjernefunksjoner (pusterom, innsjekk, krisehjelp) skal aldri stå bak betalingsmur
- Vurder donasjonsbasert modell som alternativ til abonnement

### Success Criteria:
- [ ] Klar anbefaling levert med begrunnelse
- [ ] Etisk vurdering dokumentert
- [ ] Kjernefunksjoner bekreftet gratis i anbefalt modell

---

## TASK 24.1: Go-to-market-plan

**Agent**: Markedsanalyse & Research
**Subagent(er)**: Konkurrentanalyse, Innovasjon & Ideutvikling
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Definer lanseringskanaler** (PWA-lenke, sosiale medier, helseforum) - Deliverable: kanaloversikt
2. **Lag lanseringstidslinje** - Deliverable: Gantt/tidslinje
3. **Utform budskap/posisjonering** - Deliverable: meldingsdokument
4. **Identifiser partnerskapsmuligheter** (studenthelsetjenester, NAV, skolehelsetjeneste) - Deliverable: partnerliste

### Spesifikasjoner:
- Skal reflektere personvern-first og norsk-språk-differensiering fra Task 11
- Ingen aggressiv vekst-hacking rettet mot sårbare brukere

### Success Criteria:
- [ ] Lanseringstidslinje med konkrete datoer
- [ ] Minst 3 potensielle partnere identifisert
- [ ] Budskap godkjent internt

---

## TASK 25.1: Isolation Mirror — personvern-first arkitektur

**Agent**: Teknisk Arkitektur
**Subagent(er)**: Systemintegrasjon/PWA, Datamodell & Lagring
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Design lokal bildebehandlingsflyt** (Canvas API, ingen opplasting som standard) - Deliverable: arkitekturdiagram
2. **Spesifiser eksplisitt opt-in** for ekstern bildegenerering (Flux/Midjourney) - Deliverable: samtykke-spec
3. **Fjern lagring av bilder** utover økten med mindre bruker eksplisitt lagrer - Deliverable: minnehåndteringslogikk
4. **Dokumenter dataflyt** i personvernerklæringen (Task 5) - Deliverable: tekstoppdatering

### Spesifikasjoner:
- Standard: alt skjer lokalt i nettleseren
- Ingen bilde/tekst sendes eksternt uten synlig, eksplisitt handling per gang
- Bygger på etikkvalideringen fra Task 6

### Success Criteria:
- [ ] Nettverkstrafikk-inspeksjon bekrefter ingen automatisk opplasting
- [ ] Samtykke kreves per generering, ikke én gang globalt
- [ ] Arkitektur dokumentert og gjennomgått

---

## TASK 26.1: Isolation Mirror — UI-prototype

**Agent**: UX/UI Design
**Subagent(er)**: Wireframing & Flyt, Interaktiv kodeprototype
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Wireframe oppdatert flyt** (notat → protokoll → valgfri kunst) - Deliverable: wireframe-sett
2. **Erstatt dagens tilfeldig-genererte "Mirror Art"-tekst** med noe som faktisk reflekterer brukerens notat - Deliverable: revidert `generate()`-logikk
3. **Bygg UI for opt-in-steget** (fra Task 25) - Deliverable: samtykke-modal
4. **Integrer med hovedapp-navigasjon** (i dag frittstående fil) - Deliverable: samlet nav

### Spesifikasjoner:
- Skal dele designsystem med hovedappen (Task 13)
- Skal ikke love mer enn det leverer (unngå overdrevne følelsesmessige påstander i genert tekst)

### Success Criteria:
- [ ] Prototype navigerbar fra hovedappens nav
- [ ] Generert tekst faktisk relatert til brukerens input, ikke ren mal
- [ ] Samtykkesteg verifisert i brukertest

---

## TASK 27.1: Kunstgenerering opt-in-pipeline

**Agent**: Prototyputvikling
**Subagent(er)**: Interaktiv kodeprototype, Lyd & Haptikk
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 3 dager

### Subtasks:
1. **Bygg prompt-byggerfunksjon** basert på brukerens notat (ikke hardkodet Bergen/fjord-tekst) - Deliverable: `buildPrompt()`
2. **Definer API-kontrakt** for ekstern bildegenereringstjeneste - Deliverable: API-spec
3. **Vis tydelig lastestatus/feilhåndtering** - Deliverable: UI-tilstander
4. **Test end-to-end med reell tjeneste** (sandkasse-nøkkel) - Deliverable: testlogg

### Spesifikasjoner:
- Krever fullført opt-in fra Task 25/26 før kall gjøres
- Skal håndtere avslag/feil fra ekstern tjeneste gracefully
- Ingen lagring av API-nøkler i klientkode

### Success Criteria:
- [ ] Prompt reflekterer faktisk brukerinput
- [ ] Feilhåndtering testet (nettverksfeil, avvist forespørsel)
- [ ] Ingen hemmeligheter eksponert i frontend-kildekode

---

## TASK 28.1: Automatisert testsuite

**Agent**: Testing & Quality Assurance
**Subagent(er)**: Funksjonstesting
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Sett opp testrammeverk** (Playwright for e2e siden appen er ren HTML/JS) - Deliverable: `tests/`-mappe
2. **Skriv tester for kjerneflyter**: innsjekk, pust-toggle, småtiltak-toggle, historikk-rendring - Deliverable: 4+ testfiler
3. **Test `localStorage`-persistens** mellom sideoppdateringer - Deliverable: persistens-tester
4. **Koble til CI** (fra Task 29) - Deliverable: kjørbar test-kommando

### Spesifikasjoner:
- Skal dekke alle 4 hovedsider
- Skal kjøre i minst Chromium (Playwright standard)
- Ingen avhengighet av live nettverk i testene

### Success Criteria:
- [ ] Alle kjernefunksjoner dekket av minst én test
- [ ] Testsuite kjører grønt lokalt
- [ ] Testsuite kjørbar i CI

---

## TASK 29.1: CI/CD for statisk app

**Agent**: Implementering & Deployment
**Subagent(er)**: Hosting/PWA-pakking
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Sett opp GitHub Actions-workflow** som kjører testsuite ved push - Deliverable: `.github/workflows/ci.yml`
2. **Sett opp automatisk deploy til GitHub Pages** ved merge til main - Deliverable: deploy-workflow
3. **Legg til Lighthouse CI-sjekk** (fra Task 10) i pipeline - Deliverable: pipeline-steg
4. **Dokumenter deploy-prosess** - Deliverable: `DEPLOY.md`

### Spesifikasjoner:
- Ingen manuell deploy-prosess etter oppsett
- Deploy skal feile bygg dersom tester feiler
- Skal støtte forhåndsvisning på feature-branches (valgfritt)

### Success Criteria:
- [ ] Push til main trigger automatisk deploy
- [ ] Feilende tester blokkerer deploy
- [ ] Deploy-URL verifisert fungerende etter push

---

## TASK 30.1: Sikkerhetsgjennomgang (XSS/input)

**Agent**: Testing & Quality Assurance
**Subagent(er)**: Funksjonstesting
**Prioritet**: HØY
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Gjennomgå `innerHTML`-bruk** i `renderHistory()`/`renderActions()` for XSS-risiko fra brukerens fritekstnotat - Deliverable: sårbarhetsrapport
2. **Erstatt med sikker DOM-konstruksjon** (`textContent`/`createElement`) der notat settes inn - Deliverable: patchet kode
3. **Test med ondsinnet input** (`<script>`, HTML-injeksjon i notatfelt) - Deliverable: testlogg
4. **Dokumenter funn og fiks** - Deliverable: sikkerhetsnotat

### Spesifikasjoner:
- Brukerens fritekst skal aldri tolkes som HTML
- Gjelder både `index.html`-notater og `isolation-mirror.html`-notater

### Success Criteria:
- [ ] Ingen script kjører fra injisert notatinnhold
- [ ] Alle `innerHTML`-kall med brukerdata fjernet eller sanert
- [ ] Regresjonstest lagt til testsuiten (Task 28)

---

## TASK 31.1: Ukentlig sammendrag (opt-in)

**Agent**: Prototyputvikling
**Subagent(er)**: Datamodell & Lagring
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1 dag

### Subtasks:
1. **Generer ukentlig tekstsammendrag** basert på `checkins` (i dag kun ett tall i `weekSummary`) - Deliverable: utvidet sammendragslogikk
2. **Vis trend** (bedre/verre/stabilt) - Deliverable: trendindikator
3. **Vurder valgfritt lokalt varsel** ved uke-slutt (kobles til Task 19) - Deliverable: varselintegrasjon

### Spesifikasjoner:
- Kun basert på lokalt lagret data, ingen serverberegning
- Skal unngå domme­nde språk ("du gjorde det dårlig")

### Success Criteria:
- [ ] Sammendrag viser trend, ikke bare antall
- [ ] Språk gjennomgått for varsom tone
- [ ] Fungerer med delvis ukedata (nye brukere)

---

## TASK 32.1: Myk gamification (streaks uten press)

**Agent**: Innovasjon & Ideutvikling
**Subagent(er)**: Trendspaning, UX/UI Design
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1-2 dager

### Subtasks:
1. **Design "myk streak"-konsept** som ikke straffer avbrutte streaks (i motsetning til typiske apper) - Deliverable: konseptnotat
2. **Implementer tellelogikk** basert på `checkins`/`doneActions` - Deliverable: `computeStreak()`
3. **Design ikke-skambasert visning** ("Du har vært innom X av siste 7 dager") - Deliverable: UI-komponent
4. **Brukertest konseptet** for utilsiktet prestasjonspress - Deliverable: tilbakemeldingsnotat

### Spesifikasjoner:
- Skal aldri vise "streak brutt" som negativ hendelse
- Fokus på selvomsorg, ikke prestasjon

### Success Criteria:
- [ ] Ingen negativ/skambasert fremstilling i UI-tekst
- [ ] Brukertestere rapporterer ingen økt stress fra funksjonen
- [ ] Fungerer korrekt over måneds-/ukegrenser

---

## TASK 33.1: Anonymisert delingsfunksjon

**Agent**: Prototyputvikling
**Subagent(er)**: Interaktiv kodeprototype
**Prioritet**: MEDIUM
**Estimert Verdi**: Lav
**Timeline**: 1 dag

### Subtasks:
1. **Design delbart bilde/kort** ("Jeg har pustet rolig i dag") uten personlige data - Deliverable: canvas-generert delingsbilde
2. **Bruk Web Share API** med fallback til nedlasting - Deliverable: delingsfunksjon
3. **Verifiser at ingen notater/humørdetaljer** inkluderes i delt innhold - Deliverable: personvernsjekk

### Spesifikasjoner:
- Kun aggregert/anonym informasjon kan deles
- Aldri inkluder fritekstnotater i delt innhold

### Success Criteria:
- [ ] Delt innhold verifisert fritt for personlige detaljer
- [ ] Fungerer på støttede mobilnettlesere
- [ ] Fallback fungerer på desktop

---

## TASK 34.1: Hjelpelinje-katalog per land

**Agent**: Spesifikasjonsdokumentasjon
**Subagent(er)**: Kravdokumentasjon, Målgruppeinnsikt
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Bygg strukturert datafil** med hjelpelinjer per land/region - Deliverable: `helplines.json`
2. **Koble til nettlesers/enhetens språk/region** som standardvalg - Deliverable: deteksjonslogikk
3. **Legg til manuelt landvalg** som fallback - Deliverable: UI-velger
4. **Verifiser alle numre/lenker** er korrekte og oppdaterte - Deliverable: verifiseringslogg

### Spesifikasjoner:
- Utvider Task 2 utover kun Norge
- Data skal kunne oppdateres uten kodeendring (egen JSON-fil)

### Success Criteria:
- [ ] Minst 5 land/regioner dekket
- [ ] Alle lenker/numre verifisert manuelt
- [ ] Riktig region vises som standard for testbrukere

---

## TASK 35.1: Utvidet "Små grep"-bibliotek

**Agent**: Innovasjon & Ideutvikling
**Subagent(er)**: Trendspaning, Ikon & Illustrasjon
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Research evidensbaserte mikro-intervensjoner** (grounding, kognitiv defusing) - Deliverable: kildeliste
2. **Utvid `actions`-array** fra 7 til 20+ kategoriserte tiltak - Deliverable: oppdatert datastruktur
3. **Legg til kategori-filter** (fysisk/mentalt/sosialt) - Deliverable: filter-UI
4. **Design ikoner per kategori** - Deliverable: ikonsett (kobles til Task 9)

### Spesifikasjoner:
- Alle tiltak skal ha kilde/begrunnelse tilgjengelig ved behov
- Kategorisering skal være intuitiv, ikke klinisk

### Success Criteria:
- [ ] Minst 20 tiltak fordelt på 3+ kategorier
- [ ] Alle tiltak sporbare til en kilde
- [ ] Filter fungerer korrekt i UI

---

## TASK 36.1: Personalisert forslagsmotor

**Agent**: Prototyputvikling
**Subagent(er)**: Datamodell & Lagring
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Analyser korrelasjon** mellom humør og fullførte "Små grep" lokalt - Deliverable: enkel analyselogikk
2. **Foreslå relevant tiltak** basert på valgt humør på Hjem-siden - Deliverable: anbefalingslogikk
3. **Test at anbefalinger faktisk oppleves relevante** - Deliverable: brukbarhetstest

### Spesifikasjoner:
- All beregning skjer lokalt i nettleseren, ingen ekstern profilering
- Skal degradere gracefully til tilfeldig forslag ved lite data

### Success Criteria:
- [ ] Forslag vises basert på valgt humør
- [ ] Fungerer for nye brukere uten historikk (fallback)
- [ ] Ingen data sendes ut av enheten for denne funksjonen

---

## TASK 37.1: Offline-first synk (fremtidig backend)

**Agent**: Teknisk Arkitektur
**Subagent(er)**: Datamodell & Lagring, Systemintegrasjon/PWA
**Prioritet**: MEDIUM
**Estimert Verdi**: Lav
**Timeline**: 2 dager

### Subtasks:
1. **Design synk-arkitektur** (kun dersom bruker eksplisitt vil ha konto på tvers av enheter) - Deliverable: arkitekturdiagram
2. **Definer konfliktløsningsstrategi** for samtidige endringer - Deliverable: strategidokument
3. **Spesifiser opt-in-punkt** for kontobasert synk - Deliverable: samtykke-spec

### Spesifikasjoner:
- Skal forbli 100 % valgfritt; lokal-only skal alltid være tilgjengelig
- Ingen backend bygges i denne oppgaven — kun arkitekturplan

### Success Criteria:
- [ ] Arkitektur dokumentert og gjennomgått
- [ ] Konfliktløsning dekker minst 2 konkrete scenarier
- [ ] Ingen påvirkning på eksisterende lokal-only-brukere

---

## TASK 38.1: Bruksmønsteranalyse (personvern-vennlig)

**Agent**: Teknisk Arkitektur
**Subagent(er)**: Systemintegrasjon/PWA, Konkurrentanalyse
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 1-2 dager

### Subtasks:
1. **Velg personvernvennlig analytics** (selvhostet, ingen cookies/fingerprinting) - Deliverable: verktøyvalg-notat
2. **Definer minimalt hendelsessett** (sidevisning, fullført pust-økt) - Deliverable: hendelsesspec
3. **Implementer og verifiser ingen PII sendes** - Deliverable: nettverksinspeksjonslogg
4. **Oppdater personvernerklæring** med analytics-informasjon - Deliverable: tekstoppdatering

### Spesifikasjoner:
- Ingen individsporing på tvers av økter uten samtykke
- Aggregerte tall kun, ingen fritekst/notater samles inn

### Success Criteria:
- [ ] Analytics verifisert fri for PII
- [ ] Personvernerklæring oppdatert og konsistent
- [ ] Data brukbar for produktbeslutninger (f.eks. mest brukte side)

---

## TASK 39.1: Merkevareguide

**Agent**: Visuelle Eiendeler & Produksjon
**Subagent(er)**: Ikon & Illustrasjon, Kravdokumentasjon
**Prioritet**: MEDIUM
**Estimert Verdi**: Lav
**Timeline**: 1 dag

### Subtasks:
1. **Dokumenter tone-of-voice** (varm, ikke-dømmende, kort) basert på eksisterende tekster - Deliverable: tone-guide
2. **Formaliser fargepalett og logo-bruk** - Deliverable: merkevaredokument
3. **Lag eksempel-do's-and-don'ts** for fremtidig tekstforfatting - Deliverable: eksempelseksjon

### Spesifikasjoner:
- Skal bygge videre på Task 13 (design tokens)
- Tone skal reflektere eksisterende UI-tekst ("Du er trygg her", "Det er greit")

### Success Criteria:
- [ ] Guide dekker farge, typografi, ikonografi og tone
- [ ] Brukt som referanse ved minst én senere tekstendring
- [ ] Godkjent av produktansvarlig

---

## TASK 40.1: Frittstående landingsside

**Agent**: Visuelle Eiendeler & Produksjon
**Subagent(er)**: Ikon & Illustrasjon, Hosting/PWA-pakking
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2 dager

### Subtasks:
1. **Design enkel markedsføringsside** separat fra selve appen - Deliverable: `landing.html`
2. **Inkluder verdiforslag og skjermbilder** av appen - Deliverable: innhold + bilder
3. **Legg til direkte "Åpne app"-CTA** - Deliverable: lenke til `index.html`
4. **Optimaliser for SEO** (meta-tags, beskrivelse) - Deliverable: meta-data

### Spesifikasjoner:
- Skal ikke kreve build-verktøy, ren HTML/CSS som resten av prosjektet
- Skal lastes raskt (< 2s på 3G)

### Success Criteria:
- [ ] Landingsside publisert og lenket fra README
- [ ] SEO-meta til stede og korrekt
- [ ] CTA fører direkte til fungerende app

---

## TASK 41.1: App store-forberedelse (TWA/wrapper)

**Agent**: Implementering & Deployment
**Subagent(er)**: Hosting/PWA-pakking, Ikon & Illustrasjon
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 2-3 dager

### Subtasks:
1. **Evaluer Trusted Web Activity** (Android) for Play Store-distribusjon - Deliverable: teknisk vurdering
2. **Generer nødvendige skjermbilder** i påkrevde størrelser - Deliverable: skjermbildesett
3. **Skriv butikkbeskrivelse** (kort + lang) - Deliverable: tekstinnhold
4. **Forbered personvern-lenke og aldersgrense-vurdering** for butikkoppføring - Deliverable: metadata-dokument

### Spesifikasjoner:
- Avhenger av fullført PWA (Task 1) og ikonsett (Task 9)
- iOS krever egen vurdering (App Store har strengere PWA-krav)

### Success Criteria:
- [ ] TWA-pakke bygger og installerer korrekt på Android
- [ ] Alle butikk-metadata felt fylt ut
- [ ] Personvern- og aldersgrense-informasjon konsistent med faktisk app

---

## TASK 42.1: Brukertesting runde 1

**Agent**: Testing & Quality Assurance
**Subagent(er)**: Funksjonstesting, Målgruppeinnsikt
**Prioritet**: MEDIUM
**Estimert Verdi**: Høy
**Timeline**: 3 dager

### Subtasks:
1. **Rekrutter 5-8 testbrukere** fra målgruppen (kan overlappe med Task 22) - Deliverable: testplan
2. **Gjennomfør moderert brukertesting** av alle 4 kjernesider - Deliverable: observasjonsnotater
3. **Kategoriser funn** (kritisk/høy/lav) - Deliverable: funnliste
4. **Prioriter fikser** inn i backlog - Deliverable: oppdatert prioritetsliste

### Spesifikasjoner:
- Test skal dekke førstegangsbruk uten instruksjon
- Skal spesifikt teste pusterom-flyten og innsjekk-flyten

### Success Criteria:
- [ ] Minst 5 fullførte testøkter
- [ ] Alle funn kategorisert og loggført
- [ ] Minst 3 konkrete forbedringer identifisert for Task 43

---

## TASK 43.1: Iterasjon etter brukertesting

**Agent**: Prototyputvikling
**Subagent(er)**: Interaktiv kodeprototype
**Prioritet**: MEDIUM
**Estimert Verdi**: Høy
**Timeline**: 2 dager

### Subtasks:
1. **Implementer topp 3-5 funn** fra Task 42 - Deliverable: kodeendringer
2. **Regresjonstest** mot eksisterende testsuite (Task 28) - Deliverable: testresultat
3. **Kjør oppfølgingstest** med 2-3 av de samme brukerne - Deliverable: valideringsnotat

### Spesifikasjoner:
- Kun endringer direkte støttet av brukertestfunn
- Ingen scope-utvidelse utover identifiserte problemer

### Success Criteria:
- [ ] Alle valgte funn adressert
- [ ] Ingen ny regresjon introdusert
- [ ] Oppfølgingstest bekrefter forbedring

---

## TASK 44.1: Skalerbarhetsplan for backend

**Agent**: Teknisk Arkitektur
**Subagent(er)**: Systemintegrasjon/PWA, Kravdokumentasjon
**Prioritet**: MEDIUM
**Estimert Verdi**: Lav
**Timeline**: 1 dag

### Subtasks:
1. **Skisser når en backend faktisk blir nødvendig** (kontosynk, delt fellesskap) - Deliverable: beslutningskriterier
2. **Vurder lettvekts-alternativer** (Cloudflare Workers, edge-funksjoner) fremfor tung serverarkitektur - Deliverable: teknologivurdering
3. **Dokumenter migreringssti** fra dagens rene klient-app - Deliverable: migreringsplan

### Spesifikasjoner:
- Rent planleggingsdokument, ingen implementasjon i denne oppgaven
- Skal eksplisitt vurdere kostnad/personvern-avveining ved å innføre en server

### Success Criteria:
- [ ] Klare kriterier for når backend er nødvendig
- [ ] Minst 2 arkitekturalternativer vurdert
- [ ] Dokument tilgjengelig for fremtidig beslutning

---

## TASK 45.1: Kvalitetssjekk norsk språk/tone

**Agent**: Spesifikasjonsdokumentasjon
**Subagent(er)**: Kravdokumentasjon, Wireframing & Flyt
**Prioritet**: MEDIUM
**Estimert Verdi**: Medium
**Timeline**: 0.5 dag

### Subtasks:
1. **Korrekturles all UI-tekst** for skrivefeil og konsistens (bokmål) - Deliverable: rettelsesliste
2. **Verifiser varsom, ikke-dømmende tone** gjennom hele appen - Deliverable: tonegjennomgang
3. **Rett eventuelle uklare mikrotekster** (f.eks. knappetekster) - Deliverable: oppdatert tekst i `index.html`

### Spesifikasjoner:
- Skal bygge på merkevareguiden (Task 39) når den finnes
- Ingen endring i funksjonalitet, kun tekst

### Success Criteria:
- [ ] Ingen gjenværende skrivefeil
- [ ] Tone konsistent på tvers av alle 4 sider
- [ ] Gjennomgått av minst én ekstra person

---

## TASK 46.1: Fellesskapsfunksjon — risikovurdering

**Agent**: Innovasjon & Ideutvikling
**Subagent(er)**: Konseptvalidering & Etikk
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2 dager

### Subtasks:
1. **Vurder risiko ved anonymt støtteforum** (moderering, skadelig innhold, ansvar) - Deliverable: risikorapport
2. **Undersøk moderasjonskrav** dersom funksjonen bygges - Deliverable: moderasjonsplan-utkast
3. **Anbefal go/no-go** - Deliverable: beslutningsnotat

### Spesifikasjoner:
- Rent vurderingsarbeid, ingen bygging med mindre risiko vurderes som håndterbar
- Må vurdere moderasjonskostnad realistisk (dette krever kontinuerlig drift)

### Success Criteria:
- [ ] Tydelig anbefaling levert
- [ ] Alle hovedrisikoer dokumentert
- [ ] Ingen utvikling igangsatt uten godkjent moderasjonsplan

---

## TASK 47.1: Wearable-integrasjon (pulsstyrt pust)

**Agent**: Teknisk Arkitektur
**Subagent(er)**: Systemintegrasjon/PWA, Interaktiv kodeprototype
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 3+ dager

### Subtasks:
1. **Undersøk Web Bluetooth-støtte** for pulsbånd/smartklokker - Deliverable: kompatibilitetsnotat
2. **Prototyp enkel pulsavlesning** i nettleser - Deliverable: proof-of-concept
3. **Vurder om pusterytme skal justeres** basert på puls - Deliverable: designnotat

### Spesifikasjoner:
- Eksperimentell task, lav prioritet inntil kjernefunksjoner er solide
- Skal ikke bli en forutsetning for kjernefunksjonalitet

### Success Criteria:
- [ ] Proof-of-concept viser om teknisk mulig
- [ ] Klar anbefaling om videre investering eller ikke

---

## TASK 48.1: AI-samtalestøtte — etisk forhåndsvurdering

**Agent**: Innovasjon & Ideutvikling
**Subagent(er)**: Konseptvalidering & Etikk, Kravdokumentasjon
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2-3 dager

### Subtasks:
1. **Vurder ansvarsrisiko** ved en chatbot i en mental helse-kontekst - Deliverable: risikorapport
2. **Definer harde grenser** (aldri gi medisinske råd, alltid henvise til hjelpelinje ved krisetegn) - Deliverable: policydokument
3. **Anbefal go/no-go samt eventuelt minimumsscope** - Deliverable: beslutningsnotat

### Spesifikasjoner:
- Ingen implementasjon uten eksplisitt godkjenning av policydokumentet
- Må adressere hva som skjer ved uttrykk for selvskadetanker

### Success Criteria:
- [ ] Policydokument dekker krisescenarier eksplisitt
- [ ] Tydelig anbefaling levert
- [ ] Ingen kode skrevet før godkjenning foreligger

---

## TASK 49.1: Fysisk merchandise (pusterom-kort)

**Agent**: CAD & Teknisk Tegning
**Subagent(er)**: Komponentspesifikasjon, Ikon & Illustrasjon
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2 dager

### Subtasks:
1. **Design fysisk "pusterom-kort"** (lommestørrelse, trykt pustemønster) - Deliverable: trykkeklar layout
2. **Spesifiser materiale og dimensjoner** - Deliverable: produksjonsspesifikasjon
3. **Vurder som gratis vedlegg/merchandise** for lansering - Deliverable: kostnadsnotat

### Spesifikasjoner:
- Kun relevant dersom go-to-market-planen (Task 24) inkluderer fysisk tilstedeværelse
- Lav prioritet, ren opsjon

### Success Criteria:
- [ ] Trykkeklar fil levert
- [ ] Kostnad per enhet estimert
- [ ] Beslutning tatt om produksjon eller ikke

---

## TASK 50.1: Internasjonal ekspansjonsstrategi

**Agent**: Markedsanalyse & Research
**Subagent(er)**: Konkurrentanalyse, Målgruppeinnsikt
**Prioritet**: LAV
**Estimert Verdi**: Lav
**Timeline**: 2 dager

### Subtasks:
1. **Identifiser attraktive nordiske/europeiske markeder** utover Norge - Deliverable: markedsrangering
2. **Vurder regulatoriske forskjeller** (personvern, helseinformasjon) per marked - Deliverable: regulatorisk notat
3. **Anbefal rekkefølge for ekspansjon** - Deliverable: ekspansjonsplan

### Spesifikasjoner:
- Forutsetter engelsk lokalisering (Task 21) og hjelpelinje-katalog (Task 34) er på plass
- Rent strategidokument, ingen implementasjon

### Success Criteria:
- [ ] Minst 3 markeder vurdert og rangert
- [ ] Regulatoriske hindre for hvert marked dokumentert
- [ ] Anbefalt rekkefølge begrunnet
