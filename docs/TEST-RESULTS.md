# Testresultater

Kjørt 2026-10-06 i byggemiljøet (Linux, Node 22.22.0, PostgreSQL 16). Programlogikk testes med mock-modell, ekte database og ekte HTTP/SSE.

Kommandoer: `cd backend && npm run typecheck && npm test`

```
✓ test/01-authorization.test.ts > 1. Bruker A får ikke tilgang til bruker Bs data > samtaler, meldinger, avbrytelse, minner, handlingskort og eksport er isolert
✓ test/01-authorization.test.ts > 1. Bruker A får ikke tilgang til bruker Bs data > ugyldige ID-er gir 404, ikke 500
✓ test/02-no-secrets-in-client.test.ts > 2. API-nøkler finnes ikke i iOS-bundle eller klientkode > .env.example inneholder bare variabelnavn, ingen verdier for hemmeligheter
✓ test/02-no-secrets-in-client.test.ts > 2. API-nøkler finnes ikke i iOS-bundle eller klientkode > appens offline-kopi av hjelpetilbud er identisk med serverens kontrollerte konfigurasjon
✓ test/02-no-secrets-in-client.test.ts > 2. API-nøkler finnes ikke i iOS-bundle eller klientkode > iOS-kildekode, ressurser, plist og prosjektfil er rene
✓ test/02-no-secrets-in-client.test.ts > 2. API-nøkler finnes ikke i iOS-bundle eller klientkode > skanneren fanger faktisk en nøkkel (kontroll av testen)
✓ test/03-streaming-abort.test.ts > 3. Avbrutt strømming vises som avbrutt > avbrutt svar merkes som avbrutt i videre kontekst, ikke som fullført
✓ test/03-streaming-abort.test.ts > 3. Avbrutt strømming vises som avbrutt > klienten bryter forbindelsen: svaret lagres som cancelled med delvis tekst
✓ test/03-streaming-abort.test.ts > 3. Avbrutt strømming vises som avbrutt > max_tokens markeres som ufullstendig
✓ test/03-streaming-abort.test.ts > 3. Avbrutt strømming vises som avbrutt > modellfeil midt i: delvis tekst blir cancelled med provider_error, ikke fullført
✓ test/03-streaming-abort.test.ts > 3. Avbrutt strømming vises som avbrutt > stopp-knappen (cancel-endepunkt) gir cancelled/user_cancelled og done-hendelse
✓ test/03-streaming-abort.test.ts > 3. Avbrutt strømming vises som avbrutt > tidsavbrudd før første tekst gir failed/timeout med forståelig feilmelding
✓ test/04-idempotency.test.ts > 4. Gjentatt forespørsel skaper ikke doble meldinger > ny melding mens et svar genereres avvises med 409
✓ test/04-idempotency.test.ts > 4. Gjentatt forespørsel skaper ikke doble meldinger > nytt forsøk etter avbrudd: samme brukermelding, nytt svar
✓ test/04-idempotency.test.ts > 4. Gjentatt forespørsel skaper ikke doble meldinger > samme ID med annen tekst avvises
✓ test/04-idempotency.test.ts > 4. Gjentatt forespørsel skaper ikke doble meldinger > samme clientMessageId etter fullført svar: avspilling, ingen ny melding, intet nytt modellkall
✓ test/04-idempotency.test.ts > 4. Gjentatt forespørsel skaper ikke doble meldinger > samtidige like forespørsler gir én brukermelding
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > eksport inneholder brukerens data
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > historikk av: samtalen vises ikke i historikk og har utløpstid
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > kontosletting fjerner alt, og tokenet slutter å virke
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > minne av: minner brukes ikke i kontekst og kan ikke opprettes
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > minne avledet av slettet samtale forsvinner og brukes ikke i ny kontekst
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > minner kan ses, korrigeres og slettes enkeltvis og samlet
✓ test/05-deletion-memory.test.ts > 5. Slettede data kommer ikke tilbake gjennom minne > slett all historikk fjerner samtaler, sammendrag og avledede minner
✓ test/06-correction.test.ts > 6. «Du har misforstått» korrigerer videre kontekst > korrigering kan peke på et bestemt svar
✓ test/06-correction.test.ts > 6. «Du har misforstått» korrigerer videre kontekst > markerer vurderingen, instruerer modellen, og merknaden følger med i senere svar
✓ test/06-correction.test.ts > 6. «Du har misforstått» korrigerer videre kontekst > sammendrag: korrigeringer beholdes og hypoteser blir ikke fakta
✓ test/07-safety.test.ts > 7. Vold eller selvskading stopper mørk humor > akutt selvskading: fast svar uten modell og uten humor
✓ test/07-safety.test.ts > 7. Vold eller selvskading stopper mørk humor > feiler modellklassifiseringen, brukes screeneren
✓ test/07-safety.test.ts > 7. Vold eller selvskading stopper mørk humor > modellklassifisering fanger signal screeneren ikke ser, og kan ikke senke et tydelig signal
✓ test/07-safety.test.ts > 7. Vold eller selvskading stopper mørk humor > modellklassifisering kan avkrefte svake signaler (benektelse)
✓ test/07-safety.test.ts > 7. Vold eller selvskading stopper mørk humor > numre i det faste svaret finnes i den kontrollerte konfigurasjonen
✓ test/07-safety.test.ts > 7. Vold eller selvskading stopper mørk humor > voldssignal: humor av, sikkerhetsmodus, hjelpetilbud – og det varer i tråden
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > acute: Han står utenfor døra med kniv.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > acute: Jeg har bestemt meg for å ta livet mitt i kveld. Pillene ligger klare.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Da truet samboeren meg med kniven.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Han sa «jeg dreper deg» og knuste en tallerken.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Han slo meg i går da han var full.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Han tar telefonen min og får ikke lov til å møte venner.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Jeg er livredd for ham når han drikker.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Jeg vil ta livet mitt.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Samboeren min truer med å drepe meg hvis jeg går.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > concern: Venninnen min snakker om å ta livet sitt.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > none: Denne jobben tar livet av meg.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > none: Han legger aldri inn oppvasken og jeg er så lei.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > none: Jeg døde av latter da han falt i snøen.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > none: Mandager dreper meg.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > none: Vi krangler om penger hele tiden.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > returnerer aldri brukerens tekst
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > uncertain: I filmen sier hun «jeg vil dø», og det traff meg.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > uncertain: Jeg har aldri tenkt å ta livet mitt, men jeg er sliten.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > uncertain: Jeg kunne drept ham for at han lot oppvasken stå.
✓ test/07-safety.test.ts > screener: kontekst, negasjon, sitat og usikkerhet > uncertain: Jeg orker ikke mer av dette prosjektet.
✓ test/08-no-divorce-default.test.ts > 8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre > ingen sikkerhetsmodus: Han legger aldri inn oppvasken, og jeg er så lei av å mase.
✓ test/08-no-divorce-default.test.ts > 8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre > ingen sikkerhetsmodus: Hun er på telefonen hele kvelden og jeg føler meg usynlig.
✓ test/08-no-divorce-default.test.ts > 8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre > ingen sikkerhetsmodus: Vi har ikke hatt sex på tre måneder.
✓ test/08-no-divorce-default.test.ts > 8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre > ingen sikkerhetsmodus: Vi krangler om hvem som skal hente i barnehagen.
✓ test/08-no-divorce-default.test.ts > 8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre > systeminstruksen forbyr skilsmisse som standard og legger beslutningen hos brukeren
✓ test/08-no-divorce-default.test.ts > 8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre > vanlig frustrasjon sendes til modellen med parforhold-instruks, uten sikkerhetsmodus
✓ test/09-injection.test.ts > 9. Importert tekst kan ikke overstyre instruksjoner > datablokker kan ikke lukkes eller åpne nye tagger
✓ test/09-injection.test.ts > 9. Importert tekst kan ikke overstyre instruksjoner > importert tekst havner i brukerrollen, aldri i systeminstruksen, og kan ikke slå på humor
✓ test/09-injection.test.ts > 9. Importert tekst kan ikke overstyre instruksjoner > klienten kan ikke sende systemroller eller ukjente meldingstyper
✓ test/09-injection.test.ts > 9. Importert tekst kan ikke overstyre instruksjoner > minner og sammendrag escapes på samme måte
✓ test/09-injection.test.ts > 9. Importert tekst kan ikke overstyre instruksjoner > sikkerhetsvurdering kjøres også på importert tekst
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > dagskvote og kostnadstak stopper modellkall
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > feilet svar tas ikke med i senere kontekst, og nytt forsøk virker
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > modellfeil «auth» → failed + norsk melding, brukermelding lagret
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > modellfeil «network» → failed + norsk melding, brukermelding lagret
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > modellfeil «overloaded» → failed + norsk melding, brukermelding lagret
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > modellfeil «rate_limited» → failed + norsk melding, brukermelding lagret
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > ugyldig JSON gir generell feil uten å speile innholdet
✓ test/10-network-errors.test.ts > 10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst > valideringsfeil og grenser er forståelige
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > HTTP-feil kartlegges til forståelige kategorier
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > MODEL_FALLBACKS=off sender ikke fallback-parametre
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > avbrytelse stopper strømmen og gir ProviderError(aborted)
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > konfigurasjon nekter oppstart uten nøkkel, og mock i produksjon
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > refusal og max_tokens kartlegges
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > sender riktig forespørsel og strømmer tekst
✓ test/anthropic-adapter.test.ts > Anthropic-adapter (falsk lokal server) > tomme verdier fra .env.example tolkes som ikke satt
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > avviser feil nonce
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > avviser feil publikum
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > avviser feil utsteder
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > avviser token signert med en annen nøkkel
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > avviser utløpt
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > godtar gyldig token og gir samme konto ved ny innlogging
✓ test/apple-auth.test.ts > Sign in with Apple – serververifisering > kobler Apple-ID til eksisterende anonym konto
✓ test/flow.test.ts > grunnflyt: melding → backend → modell → strømmet svar > fornyer tilgangstoken med enhetsnøkkel, og utlogging trekker den tilbake
✓ test/flow.test.ts > grunnflyt: melding → backend → modell → strømmet svar > helsesjekk
✓ test/flow.test.ts > grunnflyt: melding → backend → modell → strømmet svar > krever innlogging
✓ test/flow.test.ts > grunnflyt: melding → backend → modell → strømmet svar > meta viser tydelig at mock ikke er en modell
✓ test/flow.test.ts > grunnflyt: melding → backend → modell → strømmet svar > strømmer svar i biter og lagrer fullført svar
✓ test/logging.test.ts > logger inneholder ikke samtaletekst, hemmeligheter eller IP > hele flyten, inkludert feil og sikkerhetssignal
✓ test/summary.test.ts > lange tråder sammendras strukturert > sammendrag lages over budsjett, gamle meldinger byttes ut, siste beholdes

Test Files  15 passed (15)
Tests  93 passed (93)
```

Andre sjekker kjørt:

- `npm run typecheck`: ingen feil
- `npm run scan:secrets -- ../ios`: ingen funn
- `npm run evals -- --dry-run`: evalfil gyldig, 19 saker
- Alle `.swift`-filer parset med tree-sitter-swift: ingen syntaksfeil (dette er IKKE kompilering)
- `ios/Antipsykologen.xcodeproj/project.pbxproj` parset med npm-pakken `xcode`: 2 targets
- Manuell røyktest: `npm start` (testmodus) → `/readyz` → anonym konto → samtale → strømmet svar med curl

## Ikke kjørt

- iOS XCTest (`ios/AntipsykologenTests`, 13 tester): krever macOS med Xcode. Swift-verktøykjeden kunne ikke lastes ned i byggemiljøet.
- Samtaleevalueringer mot ekte modell (`npm run evals`): `ANTHROPIC_API_KEY` var ikke tilgjengelig.
- `docker compose up`: Docker-daemonen kjørte ikke.
