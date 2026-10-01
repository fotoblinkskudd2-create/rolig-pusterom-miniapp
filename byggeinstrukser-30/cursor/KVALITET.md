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
