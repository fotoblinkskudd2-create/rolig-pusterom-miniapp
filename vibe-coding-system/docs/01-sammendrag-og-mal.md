# 1. Sammendrag og mål

## Prosjektmål

**Psykologiet Vibe Coding System** gjør fritekst fra samtaler, innsjekker og notater om til strukturerte, forklarbare **Vibe Codes**: navngitte arbeidshypoteser om hva som foregår hos en person, for eksempel *Overveldet*, *Grubling* eller *Økonomisk stress*. Hver kode kobles til konkrete forslag til tiltak.

Systemet foreslår. Mennesker avgjør. Ingen kode er en diagnose, og ingen kode blir stående uten at en fagperson har bekreftet den.

Tre ting systemet skal gjøre:

1. **Kunnskapsbase**: en versjonert, faglig godkjent taksonomi av koder med triggere, moteksempler og tiltak.
2. **Kontaktkunnskapsbase**: kontakter, interaksjoner og observasjoner med samtykke, pseudonymisering og revisjonsspor.
3. **Hybrid klassifisering og anbefaling**: regler pluss semantisk søk som gir forslag med begrunnelse, der krisesignaler alltid går rett til et menneske.

## Suksesskriterier (KPI-er)

| KPI | Mål MVP | Mål produksjon | Måles via |
|---|---|---|---|
| Krise-recall (VC-012) på gullsett | 1,00 | 1,00 (hard grense, CI blokkerer) | `test_golden_set_regression` |
| Mikro-F1 for øvrige koder | ≥ 0,75 | ≥ 0,85 på klinisk annotert testsett | ML-regresjon |
| Andel forslag bekreftet av fagperson | ≥ 60 % | ≥ 75 % | `code_suggestion.status` |
| Tid fra observasjon til synlig forslag | p95 < 800 ms | p95 < 300 ms | OTel-tracing |
| Tid fra P0-flagg til menneskelig vurdering | < 4 t (arbeidstid) | < 1 t | `reviewed_at - created_at` |
| Dokumentasjonstid spart per time | 3 min | 5–8 min | brukerundersøkelse + logg |
| Opplevd nytte (SUS-skår) | ≥ 68 | ≥ 75 | kvartalsvis SUS |
| Avvik fra personvern (meldepliktige) | 0 | 0 | avviksregister |
| Andel tilgangsforsøk uten tjenstlig behov som blir avvist og logget | 100 % | 100 % | audit `outcome=denied` |

## Målgruppe og roller

| Rolle | Hvem | Hovedoppgaver | Ser klinisk tekst? |
|---|---|---|---|
| **Terapeut / behandler** | Psykolog, terapeut, rådgiver | Registrere observasjoner, vurdere forslag, se anbefalinger | Ja, kun egne tildelte kontakter |
| **Fagansvarlig** | Klinisk leder, fagråd | Eie taksonomien: opprette, versjonere og godkjenne koder (firøyeprinsipp) | Nei (kun anonymiserte eksempler) |
| **Konsulent** | Ekstern veileder | Lese anonymiserte mønstre på gruppenivå | Nei |
| **Sluttbruker** | Klient eller innbygger (valgfritt, fase 2) | Innsjekk, egne selvhjelpsforslag, innsyn og samtykke | Bare sin egen |
| **Systemadministrator** | Drift | Brukere, roller, jobber, overvåking | Nei. Audit uten detaljer |
| **Personvernombud** | DPO | Revisjon, innsyn, avvik | Metadata og detaljer, ved behov |

## Antakelser (til de blir bekreftet, se kapittel 14)

- Norge/EØS, GDPR med art. 9 (helseopplysninger). Normen for informasjonssikkerhet i helse og omsorg gjelder hvis kunden er helseaktør.
- Oppstartsvolum: 50–200 fagpersoner, < 50 samtidige, ~5 000 observasjoner per måned.
- Sky i EØS (for eksempel Azure Norway East). On-prem er mulig med samme containere.
- Semantisk søk og forslag må føles umiddelbare (< 1 s). Ingen sanntidsstrømming.

## To-do

- [ ] Bekreft roller og første arbeidsflyt med oppdragsgiver (kap. 14)
- [ ] Sett KPI-baselines i første pilotuke
- [ ] Utnevn fagansvarlig som eier taksonomien

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | Avklare om sluttbruker-rollen er med i MVP | Må |
| 2 | Avtale målepunkt for «dokumentasjonstid spart» | Bør |
| 3 | Konsulentrolle med gruppeaggregater (k-anonymitet ≥ 10) | Kan |
