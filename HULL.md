# HULL — 60 sekunder for en fremmed

## Rettelse til 1.1

1.1-commiten (`3cc07de`, «nav-fix, lokal-first, historikk-export») endret bare `.md`-filene. `index.html` ble ikke rørt. Kontrollert 05.10.2026 i Chromium mot 1.1-filene:

| 1.1 påsto | Faktisk i 1.1 |
|-----------|---------------|
| nav-fix | «Pust med meg» ga **ingen** aktiv menyknapp |
| `alert()` fjernet | `alert('Velg hvordan du har det først.')` fortsatt der |
| «Alt blir på denne enheten» | Setningen fantes ikke på siden |
| Export av historikk | Ingen knapp, ingen funksjon |
| Isolation Mirror åpnes «fra bunnen» | Ingen lenke fra appen |

Funnet ved samme kontroll:

- Notatet ble satt inn som HTML. `<img onerror=…>` i notatet ble kjørt.
- Pustesirkelen brukte 4 s på en utpust som varer 6 s.

Alt over er rettet i 1.2 og låst med tester. Kjører du testpakken mot 1.1-filene, feiler 23 av 27 app-tester. De fire som passerer, gjelder ting 1.1 allerede gjorde riktig: ingen nettverkskall, egne gamle data og bredde.

## Etter 1.2

En fremmed kan:

1. åpne `index.html` og lese «Alt du skriver blir på denne enheten»;
2. sjekke inn uten popup, eller puste med en sirkel som følger teksten;
3. se hjelpenumre som kan ringes med ett trykk;
4. ta historikken med som `.txt`, lage sikkerhetskopi og hente den inn igjen;
5. åpne Isolation Mirror fra Historikk og kopiere Labben-prompten;
6. installere appen på hjemskjermen og bruke den uten nett, når den kjøres fra en webadresse.

## Etter 1.3

7. åpne **Systemrommet** fra forsiden, logge hvem som er her, legge igjen lapper og låse et kjøp i 48 timer;
8. se hva de andre gjorde mens de var borte;
9. vite at «Slett alt» og sikkerhetskopien også gjelder Systemrommet.

Systemrommet lå før 1.3 bare i PR #2, sammen med Kubernetes. Den versjonen var ikke med i sikkerhetskopien eller i «Slett alt». Et ferskt kjøp viste «Låses opp om 2 døgn 0 t», og to innlogginger på rad med samme navn skjulte det andre hadde gjort.

## Mangler fortsatt

- Test på ekte iPhone (Safari og hjemskjerm-modus). Ikke gjort: ingen enhet i denne økten.
- Bruksprøve med mennesker. Plan i `LOGG.md`.
- Appen er ikke publisert på en https-adresse. Det er en beslutning som ikke er tatt.
