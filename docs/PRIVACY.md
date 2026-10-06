# Personvern: hva lagres, hvor, og hva sendes til modellleverandøren

Dette dokumentet beskriver det koden faktisk gjør. Det lover ikke mer enn infrastrukturen kan dokumentere.

## På iPhone

| Data | Hvor | Beskyttelse |
|---|---|---|
| Utkast (tekst du ikke har sendt, eller som ikke er bekreftet mottatt) | `Application Support/drafts.json` | iOS Data Protection (`completeUnlessOpen`), utelatt fra iCloud-sikkerhetskopi |
| Enhetsnøkkel (refresh token) | Keychain | `AfterFirstUnlockThisDeviceOnly`, ikke synkronisert |
| Tilgangstoken | Kun i minnet | – |
| «Introduksjon fullført» | `UserDefaults` | Ingen innholdsdata |
| Eksportfil (når du ber om den) | Midlertidig mappe | `completeFileProtection`, slettes ved kontosletting |

Appen bufrer ikke samtaler lokalt utover det som vises på skjermen. Historikk hentes fra serveren.
Appen inneholder ingen API-nøkler til modellleverandøren (testet: `backend/test/02-no-secrets-in-client.test.ts`,
og `npm run scan:secrets -- path/til/Antipsykologen.app` for en bygget bundle).

## På serveren (PostgreSQL)

| Tabell | Innhold | Slettes |
|---|---|---|
| `users` | Innstillinger, eventuell Apple `sub` | Kontosletting |
| `conversations` | Tema, tittel (første 80 tegn av første melding), tone, sikkerhetsnivå | Av brukeren; ikke-lagrede automatisk `EPHEMERAL_TTL_HOURS` etter siste melding |
| `messages` | Meldingstekst, svar, status, sikkerhetsnivå og -kategorier, tokenforbruk | Med samtalen |
| `conversation_summaries` | Strukturerte sammendrag av lange tråder | Med samtalen |
| `memories` | Minner du selv har lagret | Av brukeren; minner med kilde-samtale slettes med samtalen |
| `action_cards` | Handlingskort du har lagret | Av brukeren eller ved kontosletting |
| `usage_daily` | Antall kall og tokens per døgn (ingen tekst) | Kontosletting |
| `refresh_tokens`, `access_tokens` | SHA-256 av tokens | Utlogging / kontosletting / utløp |

«Historikk av» betyr: samtalen lagres midlertidig (modellen trenger tråden), vises ikke i historikk,
og slettes automatisk av vedlikeholdsjobben (`server.ts`, hvert 5. minutt). Den er ikke borte i samme
sekund som du lukker appen.

Sikkerhetskopier av databasen er driftsansvar og ikke satt opp i dette repoet. Hvis du tar backup,
må slettinger også gjelde backup innen en dokumentert periode.

### Logger

Serveren logger metode, sti (med ID-er), statuskode, varighet, meldings-ID, sikkerhetsnivå og tokentall.
Den logger ikke meldingstekst, svar, minner, tokens, `Authorization`-header, IP-adresse eller
feilmeldinger fra tredjepart (som kan inneholde tekst). Testet i `backend/test/logging.test.ts`.

## Hos modellleverandøren (Anthropic)

For hvert svar sendes:

- Systeminstruksen (`backend/prompts/system.no.md`) og instruks for tone/sikkerhet/handling.
- Samtalens meldinger (eller et sammendrag av eldre deler + nyere meldinger).
- Minner du har lagret, **bare** når langtidsminne er slått på.

I tillegg sendes:

- Din siste melding og inntil tre tidligere brukermeldinger til en raskere modell for sikkerhetsvurdering
  (`SAFETY_MODEL_CHECK=always`, standard).
- Eldre deler av lange tråder til sammendrag.
- Siste del av tråden når du ber om utkast til handlingskort eller minneforslag.

Ingen bruker-ID, e-post eller Apple-ID sendes til leverandøren. Hvordan leverandøren lagrer og bruker
data styres av avtalen og innstillingene på API-kontoen som `ANTHROPIC_API_KEY` tilhører (for eksempel
oppbevaringstid og eventuell nulloppbevaring). Det må avklares og dokumenteres av den som drifter
tjenesten før lansering. Koden kan ikke garantere det.

## Dine rettigheter i appen

- Se: historikk, minner, handlingskort.
- Rette: minner (rediger), «Du har misforstått» for vurderinger.
- Slette: én samtale, all historikk, ett minne, alle minner, ett handlingskort, hele kontoen.
- Ta med: eksport som JSON.
