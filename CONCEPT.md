# Pusterom → AERA: Produktkonseptdokument

Fem retninger for hva Pusterom kan bli, med én utviklet videre til prototypenivå.

## 1. Idéjakt — fem retninger

| # | Navn | Hovedkonsept | Problem den løser | Marked |
|---|------|--------------|--------------------|--------|
| 1 | **AERA** (valgt) | Ring med biosensorer (HRV, hudledningsevne, hudtemperatur) som fanger stress i kroppen og guider pusten via mikro-haptikk — uten skjerm. | Stress oppdages for sent; eksisterende apper krever at brukeren selv åpner dem. | Wearables, bedriftshelse, forsikring/forebyggende helse. |
| 2 | Pusterom XR | Romlig, biofeedback-styrt ro-sone for kontor/sykehus i VR/AR — lys og geometri endrer seg med pusten. | Fysiske ro-rom er dyre og statiske; digital wellness mangler nærvær. | Bedrifter, helseinstitusjoner, hoteller, spatial computing. |
| 3 | NeuroPust | EEG-pannebånd som gamifiserer det å nå en rolig tilstand. | Folk gir opp meditasjon fordi de ikke ser fremgang. | Biohacking/prestasjon, terapimarked. |
| 4 | Pusterom Pod | Fysisk, biofilisk "kalm-boks" for flyplasser/kontor — duft, lys, lyd synkronisert med pust, bookbar via app. | Ingen offentlig sted å roe seg ned utenom toalett/bil. | Flyplasser, kontorbygg, eiendomsutviklere. |
| 5 | Breathprint | AI analyserer pustelyd via telefonens mikrofon som biomarkør for luftveisplager og stress. | Luftveissykdom og stress oppdages sent; ingen enkel hjemme-biomarkør. | Digital helse, forsikring, telemedisin. |

## 2. Konseptutvikling — AERA

**Problem:** Kroppen registrerer stress (via HRV og hudledningsevne) minutter til timer før brukeren "føler" det bevisst. Pusterom-appen løser roen når brukeren *ber om den*; AERA løser roen når kroppen *ber om den* — et lukket biofeedback-loop uten at brukeren må åpne noe.

**Målmarked og bruksscenarier:**
- Privat: voksne 25–55 med stressrelaterte søvn-/angstplager (samme gruppe som i dag bruker Pusterom, Calm, Oura).
- Bedrift: HR/bedriftshelse-programmer som betaler for redusert sykefravær og turnover.
- Forsikring/helse: forebyggende programmer som premierer målbar stressreduksjon.

Scenario: I et møte merker AERA at HRV faller og hudledningsevnen stiger, og gir en diskré dobbel vibrasjonspuls som leder brukeren gjennom en 4-2-6 pustesyklus — uten skjerm eller lyd.

**Teknisk spesifikasjon:**
- Sensorer: PPG (puls/HRV), hudledningsevne (EDA), hudtemperatur
- Aktuator: lineær mikro-haptisk motor, 3 pulsmønstre
- Prosessering: on-device stressdeteksjon, ingen rådata forlater ringen
- Batteri: ~4 døgn, induktiv lading
- Tilkobling: BLE til Pusterom-appen (iOS/Android)
- Materiale: matt keramikk, titan innerring
- Personvern: ingen biometri i sky som standard, opt-in for deling

**MVT (Minimum Viable Prototype):** Fase 0 krever ingen egen maskinvare — koble eksisterende Pusterom-app til Apple Watch/Oura via HealthKit, la HRV-trenden trigge en pushvarsling som åpner det eksisterende pusterommet automatisk. Testes med 20–30 brukere over to uker.
Suksesskriterium: målbar nedgang i selvrapportert stress (0–10-skala) i intervensjonsøktene vs. brukerens egen baseline, og åpningsrate på varsler over 40 %.

**Faser:**
1. Programvare-MVT på eksisterende wearables (HealthKit-integrasjon)
2. Egen ring, lukket sløyfe-varsling
3. Bedriftsdashboard med anonymisert teamdata

## 3. Kunstkonsept

Viderefører den organiske sirkelen som allerede finnes i Pusterom-appens pusteøvelse (`.circle` i `index.html`) — fra skjerm til fysisk gjenstand, uten å endre det visuelle språket.

- **Palett:** papir `#f6f4ee` · rolig `#dfe9e1` · salvie `#4f7a63` · skog `#1c2620` · varsel (kun for stressvarsel) `#c06a2e`
- **Formspråk:** én organisk sirkel, aldri en firkant. Ringens lysrand puster i samme 4-2-6-rytme som appens sirkel.
- **Fargelogikk:** salvie er hviletilstanden; et varmt rav-lys er den eneste indikasjonen på at ringen har merket stress — ro skal aldri se ut som en feilmelding.
- **Lyd og vibe:** analoge synth-flater i slekt med Ólafur Arnalds og Brian Enos *Music for Airports*, tempo låst til pustesyklusen. Haptikken er instrumentet i selve ringen; lyden finnes bare i appen.

## 4. Bokpitch

**"Ringen som lærte oss å puste igjen"**

I en verden full av varsler som ber om oppmerksomheten din, bygger et lite team i Norge en ring som ber om ingenting — den bare merker når du holder pusten, og minner deg, med én enkelt vibrasjon, på at du ikke trenger å.

En sakprosa-fortelling som følger AERA fra en enkel HTML-pusteøvelse til en maskinvareprototype: designbeslutningene, brukertestene som feilet, og hva teamet lærte om forskjellen mellom å bygge en app folk åpner og et produkt som møter dem der de allerede er.

*For lesere av Shoe Dog og Why We Sleep — en stille tech-fortelling, ikke hype.*
