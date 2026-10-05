# LOGG

**Stadium:** lokal prototype · **Kontrollstatus:** 30 automatiske tester grønne i Chromium; ikke testet på ekte iPhone · **Markedssignal:** ingen (ingen brukere har prøvd den)

## Beslutning 05.10.2026 — 1.2

- **Valgt retning:** Gjør det dokumentasjonen lover, sant i koden. Gjør appen installerbar og brukbar uten nett. Lås brukerkravene med tester.
- **Mål:** praktisk nytte for én person som er stresset og åpner appen på telefonen.
- **Viktigste grunn:** 1.1 beskrev rettelser som ikke var gjort (se `HULL.md`). For en app som skal gi trygghet, veier feil dokumentasjon tyngre enn manglende funksjoner. Nye funksjoner oppå det ville vært bygget på en løgn.
- **Avgjørende usikkerhet:** Om iOS Safari oppfører seg som Chromium på tre punkter: eksport/Del-ark i hjemskjerm-modus, service worker på hjemskjerm og `localStorage`-levetid. *eple:* iOS kan slette lagring for nettsteder som ikke er brukt på en stund. Hvor lenge og under hvilke vilkår er ikke kontrollert i denne økten. Det må undersøkes i WebKits dokumentasjon og prøves på enhet. Inntil da er sikkerhetskopien vernet.
- **Første leveranse:** denne versjonen.
- **Nærmeste alternativ, parkert:** en humørgraf over tid. Den er synlig og fin, men gir ingen verdi før folk faktisk lagrer data over tid, og før de vet at dataene ikke forsvinner. Eksport og sikkerhetskopi kom derfor først.

## Hva som ble gjort

| Område | Endring |
|--------|---------|
| Navigasjon | Menyen markeres etter side (`data-page`), ikke etter klikket element. Direkte lenker `#pusterom`, `#historikk`. Pusten stopper når man forlater Pusterom. |
| Sjekk-inn | Ingen `alert()`; rolig melding på siden i stedet. Humørknapper med tekst. Notat maks 1000 tegn. |
| Sikkerhet | Notater bygges med `textContent`. Sikkerhetskopier valideres felt for felt før de leses inn. |
| Personvern | «Alt du skriver blir på denne enheten» står på forsiden. Slett alt med to trykk. Testet: ingen nettverkskall. |
| Data | Eksport `.txt`, sikkerhetskopi `.json`, gjenoppretting som slår sammen uten duplikater. Gamle 1.1-data leses fortsatt. `localStorage`-feil (privat modus) gir melding i stedet for krasj. |
| Pusterom | Animasjonen følger 4-2-6. Rundeteller. Fullførte økter teller i ukesoppsummeringen. |
| Hjelp | Hjelpetelefonen 116 123, Kirkens SOS 22 40 00 40, 113 som `tel:`-lenker på forsiden og i Isolation Mirror. |
| PWA | Manifest, ikoner (192/512/maskable/apple-touch), service worker med nett-først for sider og cache-først for filer, snarveier. |
| Visning | Mørk modus, redusert bevegelse, safe-area på iPhone, trykkflater ≥ 44 px, zoom tillatt (`user-scalable=no` fjernet). |
| Isolation Mirror | Kopiering gir tilbakemelding, med reserveløsning når utklippstavlen er sperret. Bilde-URL frigjøres. Ingen `innerHTML`. |

## Kontrolloversikt

| Kontroll | Fremgangsmåte | Resultat |
|----------|---------------|----------|
| Feil i 1.1 reprodusert | Playwright mot `git show 0c66603:index.html` | 6 av 6 dokumenterte feil bekreftet, pluss XSS og pusteanimasjon |
| Testpakke 1.2 | `npm test` (Chromium 141.0.7390.37 via Playwright 1.56.1), gjentatt 5 ganger etter siste endring i appen | 30/30 grønne hver gang |
| Motprøve | Samme pakke mot 1.1: `APP_DIR=<1.1> node --test tests/app.test.mjs` | 1.1 feiler 23 av 27 app-tester, blant annet på alle dokumenterte feil (se `HULL.md`). Noen 1.1-feil skyldes at funksjonen ikke fantes, for eksempel `#pusterom`-ruting. Pusteanimasjonen er derfor også kontrollert separat: 1.1 bruker 4 s på 6 s utpust, 1.2 bruker 6 s. |
| Uten nett | `tests/pwa.test.mjs`: last over http, vent på service worker, slå av nett, last på nytt | Appen, Isolation Mirror og `#pusterom` åpner; sjekk-inn lagres |
| Visuell inspeksjon | Skjermbilder 390 × 844, lys og mørk modus, alle sider | Én feil funnet og rettet: oppsummeringen ramset opp «0 pusteøkter» |
| Bredde | 320 px og 390 px, langt notat | Ingen sideveis scrolling; menyen dekker ikke innhold |
| JS-lint | eslint 10 på skriptene og `sw.js` | 0 feil |
| Hjelpenumre | Websøk 05.10.2026 (kilder under) | 116 123 og 22 40 00 40 er døgnåpne og gratis |
| **Ikke kontrollert** | — | Ekte iPhone/Safari, skjermleser (VoiceOver), bruk med mennesker, GitHub Actions-kjøringen før første push |

## Kilder

- Mental Helse, Hjelpetelefonen 116 123, døgnåpen og gratis: [brosjyre (mentalhelse.no, 2025)](https://mentalhelse.no/content/uploads/2025/11/Brosjyre.pdf), [Bærum kommune, hjelpetelefoner](https://www.baerum.kommune.no/tjenester/helse-og-omsorg/hjelpetelefoner/)
- Kirkens SOS 22 40 00 40, døgnåpen og anonym: [Kirkens SOS årsmelding 2024](https://www.kirkens-sos.no/assets/documents/Årsmelding-Kirkens-SOS-2024.pdf), [Bergen kommune](https://www.bergen.kommune.no/innbyggerhjelpen/helse-og-omsorg/akutt-helsehjelp/livskriser/nar-livet-er-vondt-eller-vanskelig)
- Numrene bør kontrolleres på nytt ved hver større versjon.

## Parkert

| Idé | Hvorfor ikke nå |
|-----|-----------------|
| Humørgraf over tid | Gir verdi først når det finnes data over uker. Kommer etter at bruksprøven viser at folk sjekker inn. |
| Påminnelser/varsler | Krever push og tillatelser, og kan kjennes som press i en rolig app. Må etterspørres av brukere først. |
| Synk mellom enheter | Bryter «ingen sky». Sikkerhetskopi-filen dekker behovet for å flytte data. |
| Slette enkeltinnslag | Nyttig, men ingen har bedt om det. Liten jobb når det trengs. |
| Lydveiledning i Pusterom | Uklart om det hjelper eller forstyrrer. Spør i bruksprøven. |

## Neste arbeidsordre — 1.3 «Ekte telefon»

**Oppdrag:** Bekreft at 1.2 virker på iPhone og hos mennesker før nye funksjoner legges til.

1. **Publiseringsbeslutning (din):** skal appen ligge på en https-adresse, for eksempel GitHub Pages fra dette repoet? Det gjør appen offentlig tilgjengelig, men ingen data forlater enheten. Uten https kan den ikke installeres på iPhone.
2. **Enhetstest på iPhone (Safari og hjemskjerm):** sjekk inn → pust én runde → eksport `.txt` → sikkerhetskopi → slett alt → hent inn → flymodus → åpne fra ikon. Noter hvert steg som virker eller feiler, med iOS-versjon.
3. **Bruksprøve, tre personer, 10 minutter hver:**
   - **Oppgave:** «Du har hatt en tung dag. Bruk appen slik du ville gjort.» Ingen instruksjon.
   - **Observer:** finner de Pusterom? Leser de linjen om lokal lagring? Ser de hjelpenumrene? Hvor nøler de?
   - **Spør etterpå:** «Når skjedde det sist at du trengte noe slikt? Hva gjorde du da?» Ikke «likte du den?».
   - **Bygg videre hvis:** minst to av tre fullfører sjekk-inn og en pusterunde uten hjelp, og minst én sier at de ville brukt den igjen i en konkret situasjon. Dette er vårt arbeidskriterium, ikke en bransjestandard.
4. **Stopp:** når punkt 2 og 3 er dokumentert her, med beslutningen behold, omarbeid eller forkast.
