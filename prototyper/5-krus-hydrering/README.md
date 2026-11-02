# 5. Eldre som ikke drikker nok: «Underlaget»

## Problemet

Dehydrering er en vanlig årsak til forvirring og innleggelse hos eldre. Tørstefølelsen svekkes med alderen, og mange drikker for lite uten å merke det. Pårørende og hjemmetjenester har dårlig oversikt. De fleste løsninger krever en app, en telefon, eller at brukeren husker å trykke på noe.

## Hypotese

Et underlag under koppen kan telle hva som drikkes, uten at brukeren må gjøre noe. Det kan minne med et mykt lys når det går for lenge uten væske. Ingen skjerm, ingen app, ingen tall å huske.

*Viktig: dette er ikke et medisinsk produkt. Det sier ingenting om hva som er riktig væskemengde for en person. Det skal ikke erstatte vurdering fra helsepersonell.*

## Prototype

- **Underlag:** `cad/underlag.scad`. Skive med vektcelle-lomme og kabelkanal, og plass til lysring. Mål er for vanlig bjelke-vektcelle `[verifiser]`.
- **Firmware:** `firmware/underlag.ino`. HX711-vektcelle, registrerer slurker ved vektreduksjon med koppen stående, og påminner med mykt varmt lys.
- **Skisse:** `design.svg`.
- **Produksjon (konsept):** skive i tre eller aluminium, med CNC eller laser. Ikke 3D-print.

## Logikk

1. Kopp på underlaget: vekten registreres og stabiliseres (median av 5 målinger).
2. Vekten synker med minst 5 g og står stabil: det regnes som én slurk. Vekt-løft og -setting (endringer over 50 g) ignoreres.
3. Kopp fjernes og settes tilbake: forrige vekt sammenlignes, og forskjellen registreres.
4. Hvis det har gått 120 minutter uten registrert væske: lysringen pulser mykt. Stopper når det drikkes.

Begrensning: uten sanntidsklokke (RTC) kan ikke firmware skille dag og natt. Det legges til i neste versjon. `[verifiser: RTC DS3231 eller tilsvarende]`

## Testplan

1. **Vektnøyaktighet.** Kjente vekter, 0 til 500 g. Mål avvik.
2. **Slurk-deteksjon.** Test med vann, te og melk, flere tørkesteg. Telles hver slurk riktig?
3. **Falske positiver.** Trykk på koppen, flytt den, sett den ned hardt. Telles det feilaktig?
4. **Brukerstudie.** 5–10 eldre brukere i hjemmemiljø, med samtykke. Bruker de det? Forstår de lyset? Hvor ofte skjer det at de glemmer det?

Suksesskriterium (forslag): slurk-deteksjon riktig i minst 90 % av tilfellene i kontrollert test, og under 5 falske positive per time i hjemmetest. `[verifiser: kriterium]`

## Markedsanalyse (utkast)

- **Kunder:** hjemmetjenester, sykehjem, pårørende. Den eldre selv er brukeren, men kjøperen er ofte ikke brukeren.
- **Verdi:** færre innleggelser for dehydrering. `[verifiser: helseøkonomisk underlag, kostnad per innleggelse]`
- **Konkurranse:** drikkeapper, smarte flasker, påminnelsesklokker. Vår forskjell: ingen app, ingen skjerm, og passiv telling.
- **Regulatorisk:** et produkt som lover å overvåke helsetilstand kan regnes som medisinsk utstyr. Så lenge det bare teller væske og viser lys, er det nærmere et hjelpemiddel. `[verifiser med juridisk vurdering]`
- **Personvern:** vekt- og drikkedata er helsedata. Må lagres lokalt eller med strenge krav.

## Markedsføring

**Gonzo-versjon:**
> Mamma sitter i stolen og tar en slurk av kaffen som om det var en pliktpakke. Jeg vet hvor lite hun drikker. Hun vet det ikke selv. Hun sier «jeg har drukket nok» med et smil som er tomt, og så er hun forvirret klokka fire om ettermiddagen. Vi tegnet et underlag. Det teller ikke for henne. Det teller for oss. Og lyset puster bare når det er for lenge siden sist.

**B2B-versjon:**
> Drikkeunderlag med passiv slurk-telling og mykt lys. Ingen app, ingen skjerm. For hjemmetjenester og pårørende.

*Merk: ikke bruk «forebygger dehydrering» eller liknende påstand uten dokumentasjon. Og ikke bruk «mamma» om kundene; det er bare et eksempel i gonzo-teksten, og den skal ikke leses som et kundebilde.*

## Feilsøking og kjente feilkilder

| Symptom | Mulig årsak | Hvordan sjekke |
|---------|-------------|----------------|
| Slurker telles ikke | Terskel for høy, eller vekten har drift | Serial-logg av vekt, juster `SIP_MIN_G` |
| Falske slurker når koppen settes ned | Støt og vibrasjon gir store utslag | Logg endringer over tid |
| Drift etter timer | Temperaturdrift i vektcellen, kondens på koppen | Kalibrer ved samme temperatur, tørk underlaget |
| Ingen tilbakemelding til bruker | Lysringen er for svak, eller LED-pin feil | Sjekk PWM-pin og lysstyrke |
| Vekt ikke stabil | Underlaget står skjevt eller er i kontakt med bordet | Vater underlaget, sjekk mekanisk montering |

## Åpne spørsmål

- Hvilken væskemengde per slurk er realistisk? (Modellen teller gram, og antar 1 g ≈ 1 ml for vann.)
- Trenger pårørende varsling på telefon? Det er en egen løsning med mer kompleksitet og personvern.
