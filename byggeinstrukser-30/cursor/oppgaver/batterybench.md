# Bygg BatteriBenk med Cursor

# Cursor: utfør oppgaven

Åpne denne pakken som et prosjekt i Cursor og bruk Agent. Les .cursor/rules/byggekontrakt.mdc, FELLES-KONTRAKT.md, KVALITET.md og valgt fil under oppgaver/. Kjernevalg løses i agenten; brukerens oppgave skal ikke bli erstattet med en ny idé.

Arbeid i én appmappe om gangen. Gjør først en sammenhengende vertikal flyt: skjema, API, database, resultat og feil. Vis en fungerende lokal versjon når den er tilgjengelig. Utvid så resten av de appspesifikke kravene. Ikke lever en flott frontend mens backend mangler.

Bruk tilgjengelig terminal og nettleser for faktisk kjøring. Hold diagnostikk kort og relevant. Ved kontekstgrense: skriv tilstand, neste handling og kontrollresultat til rapporter/<app-id>/STATUS.md før fortsettelse. Les denne ved gjenopptakelse.

Cursor skal eie implementering og integrasjon i output/apps/<app-id>. Eventuelle ekstra review-agenter skal lese uten å konkurrere om samme filer. Ikke endre prosjektregler for å få en test til å fremstå som bestått. Gå til neste app først når WEB_VERIFISERT er oppnådd eller en konkret ekstern blokkering er registrert.

## Produktoppdrag: BatteriBenk

App-id: `batterybench`. Område: Oppfinnelse.
Målgruppe: Utviklere som trenger et åpent energiregnestykke og testlogg.
Problem og løfte: Beregn teoretisk energitid fra egne tall.

### Bygg disse funksjonene

1. Batterispesifikasjon.
2. Forbruksprofil.
3. Teoretisk energitid.
4. Målt driftstid.
5. Sammenligning beregnet/målt.

### Skjermer og brukerreise

Start med oversikt og tydelig hovedhandling. Lag opprette/redigere-flate med egne felt, resultat-/detaljflate med synlig lagringsstatus og historikk/eksport. Domenets funksjoner over skal ha egne passende komponenter. Appen skal ikke ende som bare en omdøpt tabell.

Brukerreise: opprett batteritest, legg inn egen input, utfør «Beregn energitid», vurder resultat, endre ett felt, åpne igjen etter restart, eksporter. Vis avvik og manglende data der de oppstår. Handlinger skal være reversible der domenet tillater det.

### Første inputkontrakt

- Spenning V (`voltage`): number, grense 0.01–1000.
- Kapasitet mAh (`mah`): number, grense 1–1000000.
- Gjennomsnittlig effekt W (`watts`): number, grense 0.01–1000000.
- Antatt brukbar andel % (`usable`): number, grense 1–100.

Disse feltene definerer første kjerneflyt. Utvid dem med datamodellen under for hele produktet. Ikke tving valgfri kontakt eller valgfritt notat til falskt innhold.

### Datamodell og tilstander

Implementer migrasjoner fra følgende minimumsmodell:

Battery(id, owner_id, voltage, capacity_mah); LoadProfile(battery_id, watts, duration); BatteryTrial(battery_id, temperature, runtime_min).

Tilstandsflyt: specified -> estimated -> tested -> compared.
Alle relevante poster får id, eier ved konto-modus, created_at, updated_at og revision. Dokumenter enheter, validering, indeksbehov og hva sletting gjør med relaterte poster.

### Domene og riktig resultat

Dette er ikke garantert flytid. Synliggjør konstant last, valgt tilgjengelig andel, temperatur og målt avvik. Ingen taktisk droneoptimalisering.

Kontrolleksempel som skal bli en reell test:

12 V ×1000 mAh /1000 =12 Wh. Med 60 W og 100 % antatt brukbar andel gir modellen 12 minutter. Null effekt avvises.

### API og integrasjon

Lag typede endepunkter for domenets hovedentiteter og handlinger. Minimum: liste, opprett, hent, endre, arkiver/gjenåpne og eksport. Legg til beregning eller planlegging som separat domenetjeneste. Statusendring valideres på server. Konkurrerende skriving håndteres med revisjon eller egnet transaksjon.

Eksterne funksjoner holdes bak eksplisitte adaptere. En lokal funksjon som ikke krever tjenesten skal fungere uten den. Test feilsvar fra adapter før integrasjonen kalles ferdig. Ikke bygg en modelltilkobling bare for å utføre et regnestykke.

### iOS-spesifikk oppgave

Feltlogg for sivile prototyper; sensorkobling er separat og må testes fysisk.

Lag og dokumenter Capacitor-prosjekt, tillatelser og backendforbindelse. Test gjenåpning og lagring på en faktisk simulator/enhet når miljøet finnes. Registrer ellers IOS_IKKE_VERIFISERT og nøyaktige steg som gjenstår.

### Domenetester utover kontrolleksempelet

- Egen input og minst én grenseverdi i hvert tall-/datofelt.
- Manglende eller ugyldig domeneinput: konkret feil og ingen delvis lagring.
- Tilstandsendring som ikke er tillatt: avvisning, eksisterende data beholdes.
- Endring av input: resultat og eksport skal ikke vise gammel beregning som aktuell.
- Restart, gammel revisjon og dobbel innsending kontrolleres.
- Den første og den siste appspesifikke funksjonen over må inngå i en ende-til-ende-test.

### Leveranse

`output/apps/batterybench/`: fungerende webapp, backend, databaseoppsett, tester, README og iOS-prosjekt. `rapporter/batterybench/`: status, kontrollresultater og faktiske begrensninger. Ikke gi appen ferdigstatus bare fordi filer er opprettet.

### Eksempeldata

```json
{
  "voltage": 14.8,
  "mah": 1200,
  "watts": 80,
  "usable": 80
}
```

### Inspirasjon og produktgrense

https://github.com/toeverything/AFFiNE
Bruk flytmønstre som inspirasjon. Kjernekravene her er egne produktforslag. Kontroller kilde, dato og lisens før kodegjenbruk. Følgende senere utvidelse er en egen milepæl: Målerigg. Resultatet er et overslag, ingen flytidsgaranti.

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

# Kontrollpunkter

1. Problem og målgruppe er konkrete; funksjoner er knyttet til problemet.
2. Én komplett brukerreise fungerer med egen input, ikke bare eksempeldata.
3. Domeneeksempelet i oppgaven gir nøyaktig forventet resultat.
4. Ugyldige tall, datoer, linjer, manglende felt og maksimumsgrenser avvises før lagring.
5. Reload og serverrestart bevarer data. Dobbel innsending gir ikke doble poster.
6. Endring med gammel revisjon gir synlig konflikt og mulighet til å hente ny versjon.
7. Sletting krever synlig bekreftelse; arkiv kan åpnes igjen. Eksport har versjon, tidspunkt og dokumenterte felter.
8. Flere kontoer krever verifisert eierisolasjon. Lokal énbrukermodus må merkes tydelig.
9. Mobilbredde 390 px: ingen horisontal rulling, ingen skjulte hovedhandlinger, ingen små kritiske trykkflater.
10. Frakoblet bruk, synkronisering, retry og konflikt testes hvis offline-funksjonen er implementert.
11. Eksterne integrasjoner har ekte suksess- og feiltest; ellers er funksjonen tydelig uimplementert.
12. Ren installasjon, bygg, tester og dokumentert kjøring på en ny database.
13. Testlogg inneholder hva som ble kjørt, ikke bare «alt grønt».
14. Native iOS får egen status og eget bevis. Generert Xcode-prosjekt alene er ikke verifisert native app.

# Rapporteringsformat per app

App / kravversjon / kodeversjon / eier / status.
Implementert: konkrete brukerhandlinger.
Verifisert: kommando, tidspunkt, exit-kode og relevante testresultater.
Blokkert: konkret årsak og neste håndterbare steg.
Ikke implementert: navngitte krav som gjenstår.
Artefakter: prosjektmappe, README, skjermbilder, testlogg og eksporteksempel.
Neste handling: ett konkret arbeid som flytter status.
