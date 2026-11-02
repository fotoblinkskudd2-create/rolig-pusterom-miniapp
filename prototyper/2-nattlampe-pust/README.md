# 2. Panikkanfall om natten: «Pusteklokke»

## Problemet

Folk våkner i panikk midt på natten. Telefonen gjør det verre: skarpt blått lys, varsler, og en skjerm som krever at man tar stilling til noe. Behovet er et verktøy som virker uten skjerm, uten lyd som vekker, og uten å kreve at man finner ut hva man skal gjøre.

## Hypotese

Et fysisk objekt med en rolig, forutsigbar rytme gir kroppen et ankerpunkt. Pusten er den eneste automatiske funksjonen vi kan påvirke direkte. Lysets farge og styrke påvirker søvnen, og varmt, dempet lys (rav, ca. 590 nm) forstyrrer søvn mindre enn blått lys. `[verifiser: effekten av rav-lys på søvn og arousal]`

## Prototype

- **Funksjon:** én knapp. Kort trykk: av/på. Langt trykk: velg lysstyrke (tre steg). Rytme: 5 s inn, 5 s ut (6 pust/min). Automatisk avslag etter 15 minutter.
- **Lys:** én rav-LED (ca. 590 nm) bak matt diffusor. Lysstyrke målt under 5 lux ved 30 cm `[verifiser med luxmeter]`.
- **Ingen skjerm, ingen lyd, ingen app.**
- **Elektronikk:** Arduino Nano (eller ATtiny85), MOSFET-driver, 18650-batteri med lader, bryter.
- **Hus:** `cad/pusteklokke.scad`. Base med lomme til elektronikk, kuppel som diffusor. Skalamodell, 95 mm høy.
- **Skisse:** `design.svg`.

Rytmen er bevisst langsommere enn normal pust, og utåndingen er like lang som innåndingen. Det kan endres i koden hvis brukerne trenger noe annet.

## Testplan

1. **Lysmåling.** Luxmeter ved 30 cm og ved hode-avstand. Mål spektrum med enkel spektrometer hvis tilgjengelig.
2. **Rytmemåling.** Logg pust med brystbelte på frivillige (5–10 personer). Sjekk om de faktisk følger rytmen.
3. **Brukbarhet i mørke.** Kan man bruke knappen blindt? Kan man finne den uten å se?
4. **Batteritid.** Hvor mange timer på full lysstyrke og på lavt steg?

Suksesskriterium (forslag): brukere som tester i mørke finner knappen blindt innen tre forsøk, og de får en rolig rytme uten å måtte stille noe. `[verifiser: kriterium]`

## Markedsanalyse (utkast)

- **Målgruppe:** voksne som har søvnproblemer eller panikkangst. Også pårørende.
- **Konkurranse:** pusteapper og lys-lamper med rytme. Forskjellen er at vi er uten skjerm. Det er en svakhet for de som vil ha grafikk, og en styrke for de som vil slippe skjermen.
- **Viktig:** dette er ikke behandling. Det må tydelig merkes som støtte, ikke som erstatning for lege eller psykolog. Ved panikkangst med hyppige anfall skal folk søke hjelp.
- **Regulatorisk:** en lampe uten medisinske påstander er vanligvis ikke medisinsk utstyr. Så snart produktet lover å behandle eller diagnostisere, endrer det seg. `[verifiser med juridisk vurdering]`

## Markedsføring

**Gonzo-versjon:**
> Klokka er tre. Jeg våkner med hjertet i halsen, telefonen lyser blått i ansiktet mitt og en eller annen app vil at jeg skal «ta et dypt åndedrag» med en animasjon som ser ut som en fjern gren av et verdenskrig. Jeg kaster telefonen i gulvet. Det jeg vil ha er et lys som ikke vil noe av meg. Et lys som bare puster. Sånn. Inn. Ut. Ingen skjerm, ingen lyd, ingen varsler. Bare rav og en rytme som er langsommere enn panikken.

**B2B / handel-versjon:**
> Pusteklokke: en rav-lampe med rolig pust-rytme. Ingen skjerm, ingen varsler. Laget for å brukes midt på natten når telefonen gjør vondt verre.

*Merk: ikke bruk «hjelper mot panikkanfall» eller liknende medisinske påstander uten dokumentasjon.*

## Feilsøking og kjente feilkilder

| Symptom | Mulig årsak | Hvordan sjekke |
|---------|-------------|----------------|
| Lampen lyser konstant, ingen rytme | `running` settes ikke, eller `startT` feil | Serial-logg i `loop()` |
| Rytmen hakker | `delay()` for lang, eller PWM-verdi avrundes grovt | Logg `analogWrite`-verdi per 100 ms |
| Lampen slår seg av av seg selv | Auto-avslag er for kort, eller millis-overløp | Sjekk `AUTO_OFF_MS` mot ønsket varighet |
| Knappen reagerer ikke / to trykk | Ingen debounce utover 40 ms | Test med oscilloskop eller logg knapp-tilstand |
| For sterkt lys | Maksimum er for høyt | Luxmåling, sett `maxBright` lavere |
| Rav-lys ser grønt ut | Feil LED-type | Bruk LED spesifisert til ca. 590 nm |

## Åpne spørsmål

- Skal rytmen kunne justeres (4-6 eller 6-6)? Det er en brukerfunksjon, ikke en sikkerhetsfunksjon.
- Er det behov for en stille vibrasjon i stedet for lys, for de som sover med lys av?
