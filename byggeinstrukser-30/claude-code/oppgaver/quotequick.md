# Bygg TilbudKlar med Claude Code

# Claude Code: utfør oppgaven

Start Claude Code i pakkens rotmappe. Les CLAUDE.md, FELLES-KONTRAKT.md, KVALITET.md og valgt oppgave. Bruk den definerte app-builder til avgrenset implementering og app-reviewer til uavhengig review når prosjektagenter er tilgjengelige.

Hovedagenten eier planen, felles filvalg, integrasjon, testkjøring og endelig status. Builder får full spesifikasjon, arbeidsmappe, testeksempel og ferdigkrav. Reviewer får samme krav, den faktiske diffen og testbevis. Review skal gi avvik med fil, konsekvens og konkret retting. Hovedagenten retter og kjører relevante kontroller igjen.

Ingen to skrivende agenter får samme appmappe. Ikke la underagenter endre felles pakkeoppsett uten hovedagentens integrasjon. Bruk sekvensiell gjennomføring dersom underagenter ikke finnes i installasjonen; ikke stopp hele oppgaven av den grunn.

Hold fremdrift i rapporter/<app-id>/STATUS.md og KJOEREPLAN.md. Bevar brukerens prosjekt dersom et eksisterende repo er gitt. Ikke påstå at en utestet native funksjon virker fordi den er beskrevet i README. Avslutt med faktisk kode, kjørt testbevis og eksplisitt iOS-status.

## Produktoppdrag: TilbudKlar

App-id: `quotequick`. Område: Bedrift.
Målgruppe: Håndverkere og småbedrifter som må sende presise tilbud.
Problem og løfte: Regn på arbeid, materialer og påslag.

### Bygg disse funksjonene

1. Kunde og tilbudslinjer.
2. Timer, sats og materialer.
3. Synlig påslag og valgt avgift.
4. Versjonert tilbud.
5. PDF-eksport med forutsetninger.

### Skjermer og brukerreise

Start med oversikt og tydelig hovedhandling. Lag opprette/redigere-flate med egne felt, resultat-/detaljflate med synlig lagringsstatus og historikk/eksport. Domenets funksjoner over skal ha egne passende komponenter. Appen skal ikke ende som bare en omdøpt tabell.

Brukerreise: opprett nytt tilbud, legg inn egen input, utfør «Beregn tilbud», vurder resultat, endre ett felt, åpne igjen etter restart, eksporter. Vis avvik og manglende data der de oppstår. Handlinger skal være reversible der domenet tillater det.

### Første inputkontrakt

- Arbeid (`job`): text.
- Timer (`hours`): number, grense 0–10000.
- Timesats kr (`rate`): number, grense 0–10000000.
- Materialer kr (`materials`): number, grense 0–10000000.
- Påslag % (`markup`): number, grense 0–1000.
- Egen MVA-sats % (`vat`): number, grense 0–100.

Disse feltene definerer første kjerneflyt. Utvid dem med datamodellen under for hele produktet. Ikke tving valgfri kontakt eller valgfritt notat til falskt innhold.

### Datamodell og tilstander

Implementer migrasjoner fra følgende minimumsmodell:

Quote(id, owner_id, customer_id, revision, state, currency); QuoteLine(quote_id, kind, quantity, unit_price); TaxSetting(quote_id, rate).

Tilstandsflyt: draft -> reviewed -> issued -> accepted eller rejected.
Alle relevante poster får id, eier ved konto-modus, created_at, updated_at og revision. Dokumenter enheter, validering, indeksbehov og hva sletting gjør med relaterte poster.

### Domene og riktig resultat

Regn penger med desimaler eller minste valutaenhet, ikke upresis flyttallsakkumulering. Avgift er brukerens valg.

Kontrolleksempel som skal bli en reell test:

2 timer × 1000 kr + 100 kr materialer, 10 % påslag og 25 % valgt avgift gir 2887.50 kr. Eksport og skjerm må vise samme sum.

### API og integrasjon

Lag typede endepunkter for domenets hovedentiteter og handlinger. Minimum: liste, opprett, hent, endre, arkiver/gjenåpne og eksport. Legg til beregning eller planlegging som separat domenetjeneste. Statusendring valideres på server. Konkurrerende skriving håndteres med revisjon eller egnet transaksjon.

Eksterne funksjoner holdes bak eksplisitte adaptere. En lokal funksjon som ikke krever tjenesten skal fungere uten den. Test feilsvar fra adapter før integrasjonen kalles ferdig. Ikke bygg en modelltilkobling bare for å utføre et regnestykke.

### iOS-spesifikk oppgave

Rediger linjer på mobil og forhåndsvis PDF før deling.

Lag og dokumenter Capacitor-prosjekt, tillatelser og backendforbindelse. Test gjenåpning og lagring på en faktisk simulator/enhet når miljøet finnes. Registrer ellers IOS_IKKE_VERIFISERT og nøyaktige steg som gjenstår.

### Domenetester utover kontrolleksempelet

- Egen input og minst én grenseverdi i hvert tall-/datofelt.
- Manglende eller ugyldig domeneinput: konkret feil og ingen delvis lagring.
- Tilstandsendring som ikke er tillatt: avvisning, eksisterende data beholdes.
- Endring av input: resultat og eksport skal ikke vise gammel beregning som aktuell.
- Restart, gammel revisjon og dobbel innsending kontrolleres.
- Den første og den siste appspesifikke funksjonen over må inngå i en ende-til-ende-test.

### Leveranse

`output/apps/quotequick/`: fungerende webapp, backend, databaseoppsett, tester, README og iOS-prosjekt. `rapporter/quotequick/`: status, kontrollresultater og faktiske begrensninger. Ikke gi appen ferdigstatus bare fordi filer er opprettet.

### Eksempeldata

```json
{
  "job": "Automatisere henvendelser",
  "hours": 12,
  "rate": 950,
  "materials": 1200,
  "markup": 10,
  "vat": 25
}
```

### Inspirasjon og produktgrense

https://github.com/twentyhq/twenty
Bruk flytmønstre som inspirasjon. Kjernekravene her er egne produktforslag. Kontroller kilde, dato og lisens før kodegjenbruk. Følgende senere utvidelse er en egen milepæl: Tilbudsmal, juridisk kvalitetssikring og signering.

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
