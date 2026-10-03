# 12. Brukeropplæring og dokumentasjon

## Opplæringsmateriell

| Materiell | Målgruppe | Format | Innhold |
|---|---|---|---|
| **«Hva systemet er, og ikke er»** | alle | Video 3 min | Hypoteser, ikke diagnoser. Menneske i løkka. Hva P0 betyr og ikke betyr. |
| **Første observasjon** | terapeut | Video 4 min + interaktiv sandkasse | Skriv notat → les begrunnelse → Stemmer / Stemmer ikke → anbefalinger |
| **Når krisebanneret vises** | terapeut | Video 3 min + skriftlig rutine | Hva du gjør, hvem du varsler, dokumentasjon. Systemet erstatter aldri egen vurdering |
| **Samtykke i praksis** | terapeut | Video 3 min + manus | Hvordan forklare de tre formålene muntlig, hva som skjer ved tilbaketrekking |
| **Lage og endre koder** | fagansvarlig | Workshop 2 t | Malen, gode og dårlige triggere, moteksempler, firøyeprinsipp, versjonering |
| **Annotering** | annotatorer | Workshop 3 t + kalibreringssett (50) | Retningslinje, tvilstilfeller, enighet |
| **Revisjon** | personvernombud | Manual + 1 t gjennomgang | Audit-visning, typiske mønstre, eksport |
| **Brukermanual** | alle | Web (MkDocs), søkbar | Oppgavebasert: «Slik gjør du …» |
| **FAQ** | alle | Web | Se under |
| **Kontrollkort** | terapeut | 10 kort i sandkassen | Bevisst gale forslag. Trener på å avvise, mot automasjonsbias |

## Sandkasse og testdata

- Egen `sandbox`-tenant med **kun syntetiske data**. Ingen ekte personer, heller ikke anonymiserte.
- Seed-skript: 20 fiktive kontakter, 300 observasjoner generert fra malene i `data/vibe_codes.json`, inkludert P0-tilfeller og kontrollkort.
- Tilbakestilles hver natt. Tydelig gult banner: «Sandkasse: ikke ekte data».
- Lokalt: `docker compose up` + dev-tokens (`dev-terapeut-ola`, `dev-fagansvarlig-ane`, `dev-personvernombud-per`).

## FAQ (utkast)

**Stiller systemet diagnoser?** Nei. Det foreslår temaer basert på ord og mening i teksten. Du avgjør.

**Hva om systemet ikke oppdager at noen er i fare?** Det kan skje. Systemet er laget for å fange mest mulig, men det er ikke en sikkerhetsvurdering. Din kliniske vurdering og virksomhetens rutiner gjelder alltid.

**Hvorfor fikk jeg et forslag som er helt feil?** Trykk «Stemmer ikke». Det tar ett sekund, og det gjør systemet bedre.

**Kan kollegaen min se mine kontakter?** Bare hvis hen er tildelt kontakten. Alle oppslag logges.

**Hva skjer hvis klienten trekker samtykket?** For automatiske forslag: vektorene slettes umiddelbart, notatene dine blir liggende. For lagring av notater: følg journalrutinen.

**Kan jeg foreslå en ny kode?** Ja, via fagansvarlig. Ta med eksempler og moteksempler.

## Dokumentasjonsstruktur

```
docs/
├── README.md                     inngang, «start her»
├── arkitektur/
│   ├── oversikt.md               (= 02) diagrammer, prinsipper
│   ├── adr/                      Architecture Decision Records
│   │   ├── 0001-pgvector-foer-dedikert-vektordb.md
│   │   ├── 0002-python-fastapi.md
│   │   └── 0003-selvhostede-modeller.md
│   └── sikkerhet.md              trusselmodell (STRIDE)
├── api/
│   ├── openapi.yaml              kilde til sannhet
│   └── guide.md                  (= 05) eksempler, feil, paginering
├── data/
│   ├── data-dictionary.md        (= 03) alle tabeller og felt, klassifisering (åpen / intern / sensitiv)
│   ├── json-schemas/             schema_ref-filer
│   └── migrasjoner.md
├── taksonomi/
│   ├── vibe-codes.md             (= 04) generert fra vibe_codes.json
│   ├── endringslogg.md           generert fra change_note
│   └── etikettering-guide.md     annoteringsretningslinje
├── ml/
│   ├── pipeline.md               (= 06)
│   ├── modellkort/               ett per modellversjon: data, metrikker, begrensninger, bias
│   └── evalueringsrapporter/
├── drift/
│   ├── runbooks/                 én per alarm
│   ├── backup-restore.md
│   └── utrulling.md
├── personvern/
│   ├── dpia.md
│   ├── behandlingsprotokoll.md
│   └── samtykketekster/          versjonert
└── brukere/
    ├── manual/
    └── faq.md
```

## Etiketteringsguide (skjelett)

1. **Formål**: hvorfor vi annoterer, og hvordan dataene brukes.
2. **Enhet**: hele observasjonen er multi-label; spenn markeres for forklarbarhet.
3. **Per kode**: definisjon, 5 positive, 5 negative og 3 tvilstilfeller med begrunnelse.
4. **Negasjon og hypotetisk språk**: «jeg er ikke overveldet» → ingen kode; «hvis jeg mister jobben blir jeg overveldet» → ingen kode (hypotetisk); unntak: P0 annoteres alltid.
5. **Sitater og andres opplevelser**: «mamma er deprimert» → ikke kode for personen. Merk eventuelt `annen_person`.
6. **Tidsdimensjon**: nåtid og siste 2 uker. Fortid > 3 måneder merkes `historisk`.
7. **Konfidens 1–5**: bruk 1–2 aktivt. Det er verdifull informasjon.
8. **Når du er usikker på P0**: annoter P0 og merk for adjudikering. Ved tvil: inkluder.
9. **Kalibrering**: 50 felles eksempler før start, κ rapporteres per kode.

## To-do

- [ ] Spill inn tre første videoer (systemet, første observasjon, krise)
- [ ] Seed-skript for sandkasse
- [ ] ADR 0001–0003

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | Kriserutine + video | Må før pilot |
| 2 | Sandkasse med syntetiske data | Må |
| 3 | Etiketteringsguide v1.0 | Må før annotering |
| 4 | Modellkort-mal | Bør |
| 5 | MkDocs-portal | Kan |
