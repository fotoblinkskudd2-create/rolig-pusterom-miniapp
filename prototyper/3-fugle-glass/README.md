# 3. Fugler som flyr i glass: «UV-mønster»

## Problemet

Store glassfasader i byer reflekterer himmel og trær, og fugler flyr rett inn. Merking som virker for fugler er ofte stygg og synlig for mennesker. Det er et reelt dilemma: skal arkitekten velge mellom estetikk og fuglevern?

## Hypotese

Fugler ser UV-lys (ca. 300–400 nm). Mennesker gjør det ikke. Et mønster som reflekterer UV, men er nesten usynlig i synlig lys, kan være synlig for fugler og usynlig for oss. `[verifiser: UV-synlighet hos relevante fuglearter og UV-reflektans fra kommersielle filmer]`

Mønsteret er en rutenett av punkter. Avstanden mellom markeringene holdes lav nok til at en fugl ikke flyr gjennom åpningen. Retningslinjer for dette finnes i etablerte fugle-vern-anbefalinger (f.eks. 5 × 10 cm). `[verifiser mot gjeldende anbefaling før bruk]`

## Prototype

- **Generator:** `tools/make_pattern.py`. Lager en SVG for en gitt glassflate, med avstand, punktstørrelse og kontroll mot regelen. Skriver ut dekningsgrad (andel av flaten som er markert).
- **Skisse:** `design.svg`, generert av verktøyet for en 1 000 × 1 000 mm flate.
- **Produksjon (konsept):** UV-reflekterende film eller UV-trykk på glass. Ikke 3D-print.
- **Regel i prototypen:** kantavstand mellom punktene ≤ 100 mm horisontalt, ≤ 50 mm vertikalt. `[verifiser]`

## Testplan

1. **Synlighet for mennesker.** Foto under dagslys og i skygge fra flere vinkler. Panel av mennesker vurderer om mønsteret er synlig fra 3 m.
2. **UV-synlighet.** UV-kamera med UV-pass-filter. Mål reflektans i UV-området med spektrofotometer, hvis tilgjengelig.
3. **Fuglevern.** Ingen levende fugler skal håndteres eller utsettes for testen. Bruk observasjon fra utsiden og litteratur som grunnlag. Dersom det skal testes med fugler, må det gjøres av kvalifiserte personer med relevant tillatelse.
4. **Dekning.** Dekningsgrad under ca. 5 % for å holde utseendet lett `[verifiser]`.

## Markedsanalyse (utkast)

- **Kunder:** arkitekter, byggherrer, kommuner, eiere av store glassbygg.
- **Krav:** ofte påbudt i nybygg i noen land. Må sjekkes lokalt. `[verifiser: norske krav og veiledning]`
- **Konkurranse:** klistremerker, mønsterfilm, fritt-glass. De fleste synlige for mennesker.
- **Forskjell:** UV-basert og lav dekning. Det er vår kjerne-påstand, og den må bevises.
- **Pris og volum:** avhenger av filmkostnad og monteringskostnad per m². `[verifiser]`

## Markedsføring

**Gonzo-versjon:**
> En fugl treffer glasset som en kule som ikke har sett ryggen til noen, og jeg står utenfor bygget med en kaffe og tenker: vi har bygget en fasade som er fin for oss, men ikke for alt som flyr. Det er ikke en mindre tragedie. Det er mange små, stille, hver dag. Vi tegner mønsteret for fuglene. Mennesker får bare et vindu.

**B2B-versjon:**
> UV-mønster for glass. Synlig for fugl, usynlig for mennesker, lav dekning. Dokumenterbar effekt etter testing.

*Merk: «dokumenterbar effekt» er et mål. Ikke bruk før testen er gjennomført.*

## Feilsøking og kjente feilkilder

| Symptom | Mulig årsak | Hvordan sjekke |
|---------|-------------|----------------|
| Mønsteret er synlig for mennesker | Film har for høy synlig reflektans | Spektrofotometer i synlig område |
| Mønsteret er usynlig også i UV | Feil UV-blekk eller film | UV-kamera, sjekk mot referanse |
| Mønsteret ser flimrende ut | Avstanden er for liten, moiré mot andre mønstre | Visuell test fra flere vinkler |
| Gapet mellom punktene er for stort | Skrivefeil i verktøyet, eller feil skalering | `make_pattern.py` skriver ut største gap og gir feil ved brudd |
| Dekningen er for høy | Punktradius er for stor | Verktøyet skriver ut dekningsgrad |

## Åpne spørsmål

- Hvilke fuglearter er relevante for det aktuelle området? Dette påvirker hvilke krav som gjelder.
- Hvilken filmleverandør kan levere UV-reflektans i dokumentert kvalitet?
