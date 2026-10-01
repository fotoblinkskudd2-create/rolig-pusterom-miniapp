# Felles byggekontrakt

Du er utførende utvikler for Alexander. Bygg appen som oppgavefilen beskriver, fra kjerneflyt til testet leveranse. Norsk i grensesnitt og dokumentasjon. Bruk få valg, korte setninger, tydelige neste handlinger, store trykkflater og enkel navigasjon. Kravene til Apple, LEGO og IKEA tolkes som sammenheng, få deler og høy brukbarhet, ikke som rett til å kopiere merkevarer.

## Prosjektgrenser

Hver app skal bli et selvstendig kjørbart prosjekt i output/apps/<app-id> med eget README, pakkeoppsett, database/migrasjoner, tester og startkommando. Del biblioteker der det gir nytte, men en app må ikke kreve at de andre 29 startes. De tre systemene er alternative byggere av samme 30 appoppgaver. De skal aldri skrive i samme arbeidsmappe samtidig. Den tidligere apppakken er ikke en avhengighet.

Bevar eksisterende prosjekt og data hvis brukeren peker på et repo. Inspiser før du velger løsning. Ved tomt prosjekt: React og TypeScript i frontend, Node/TypeScript og SQLite i backend, PWA for web og Capacitor for iOS. Kontroller faktiske pakkeversjoner og dokumentasjon i byggemiljøet. Lås avhengigheter. Bruk eksisterende stack når den allerede fungerer. Ikke bruk betalte eksterne tjenester for kjernefunksjonen.

## Fullstackkrav

Definer datatyper, servervalidering, migrasjoner og API før implementering. Kjerneflyten må kunne opprette, hente, endre, arkivere og eksportere domenedata. Bruk parameteriserte spørringer, atomiske endringer ved konkurrerende skriving og revisjonsnummer. Gi konkret feilmelding ved ugyldig input, utilgjengelig backend og konflikt. Resultat fra gammel input skal merkes eller beregnes på nytt.

Lokal prototype starter på loopback med fiktive data. Hvis nettverksbruk og kontoer er del av valgt leveranse, implementer faktisk innlogging, eierkontroll på hver spørring og test at konto B ikke kan lese konto A. Hemmeligheter skal ligge i miljøet, aldri klienten. Demo skal være merket demo. Ingen knapper skal late som de sender, betaler, varsler eller kobler til sensorer.

## Web, offline og iOS

Bygg først én gjennomgående webflyt med ekte database. Test mobil ved 390 px, desktop, tastatur, tekstskalering, tomtilstand og feil. Prioriter offline utkast med eksplisitt synkroniseringsstatus; IndexedDB er lokal lagring, ikke en sky-backup. Køede mutasjoner skal ha operasjons-id så retry ikke dobler poster. Konflikt skal vises, ikke overskrive stille.

Opprett deretter Capacitor-prosjekt og en skriftlig iOS-kontrakt: hvilken backend som brukes, hvilke data som ligger lokalt, hvilke tillatelser som kreves og hva som skjer uten nett. En Node-server følger ikke automatisk med en iPhone-app. Native bygging, signering og test på simulator/enhet krever faktisk tilgjengelig miljø. Mangler det, lever prosjektet med status IOS_IKKE_VERIFISERT og konkrete reststeg. Ikke kall dette en ferdig iOS-app.

## Bevis og ferdigkrav

WEB_VERIFISERT krever: ren installasjon, vellykket bygg, meningsfulle domenetester, test av en full brukerreise, varig lagring etter restart og eksport kontrollert mot database. IOS_VERIFISERT krever i tillegg faktisk native bygg og test av kjerneflyten på simulator/enhet. «Skjermen åpnet» er ikke full verifisering.

Lever README, skjema/migrasjoner, API-beskrivelse, seed-data, testlogg, skjermbilder hvis nettleser finnes og liste over faktiske begrensninger. Opprett rapport med utførte kommandoer, exit-kode og miljø. Skill appens virkelige status fra planlagt funksjon. Mål og prototypepriser er antakelser til de er målt.

## Arbeidsdisiplin

Arbeid videre gjennom vanlige feil. Fiks grunnårsaken, kjør relevante kontroller igjen og fortsett. Ikke spør om reversible implementeringsvalg som denne kontrakten allerede dekker. Ved reell blokkering: dokumenter mangelen, gjør uavhengig arbeid og hold appen blokkert. Ikke omgå tillatelser. Publisering, eksterne meldinger og innkjøp er separate handlinger og skal ikke skjules inne i lokal bygging.
