# API – Antipsykologen backend

Base-URL lokalt: `http://localhost:8080`. Alle forespørsler og svar er JSON (UTF-8), unntatt
meldingsstrømmen (Server-Sent Events). Alle ID-er er UUID-er.

Kildekode: `backend/src/routes/*.ts`. Kontrakten testes i `backend/test/`.

## Autentisering

Appen har ingen modellnøkler. Den har to egne tokens:

| Token | Levetid | Lagring | Brukes til |
|---|---|---|---|
| `refreshToken` (`apr_…`) | Til den trekkes tilbake | iOS Keychain (`AfterFirstUnlockThisDeviceOnly`) | Hente nytt tilgangstoken |
| `accessToken` (`apa_…`) | `ACCESS_TOKEN_TTL_MINUTES` (60) | Kun i minnet | `Authorization: Bearer …` |

Serveren lagrer bare SHA-256 av begge. Alle endepunkter under `/v1` unntatt `auth/*` og `meta` krever
`Authorization: Bearer <accessToken>`.

| Metode | Sti | Body | Svar |
|---|---|---|---|
| POST | `/v1/auth/anonymous` | – | `201 { userId, refreshToken, accessToken, accessExpiresAt }`. Begrenset per IP. |
| POST | `/v1/auth/token` | `{ refreshToken }` | `{ userId, accessToken, accessExpiresAt }` |
| POST | `/v1/auth/apple` | `{ identityToken, rawNonce }` (+ valgfri Bearer for å koble anonym konto) | Som `anonymous`. Verifiserer signatur mot Apples JWKS, `iss`, `aud = APPLE_BUNDLE_ID`, utløp og `sha256(rawNonce) == nonce`. `501` hvis ikke konfigurert. |
| POST | `/v1/auth/logout` | `{ refreshToken }` | `204`. Trekker tilbake nøkkelen og tilhørende tilgangstokens. |

## Eierskap

Hver samtale, melding, minne og handlingskort har `user_id`. Alle oppslag filtrerer på innlogget bruker.
Finnes ressursen hos en annen bruker, svarer serveren `404` (ikke `403`), så det ikke lekker at den finnes.

## Profil og innstillinger

| Metode | Sti | Body | Merknad |
|---|---|---|---|
| GET | `/v1/me` | – | `{ id, signedInWithApple, tone, darkHumor, historyEnabled, memoryEnabled, createdAt }` |
| PATCH | `/v1/me` | `{ tone?, darkHumor?, historyEnabled?, memoryEnabled? }` | `tone`: `mild` \| `torr` \| `skarp` |
| DELETE | `/v1/me` | – | `204`. Sletter kontoen og alt knyttet til den (kaskade). |
| GET | `/v1/export` | – | All lagret data om brukeren som JSON (`format: antipsykologen-export-v1`). |

## Samtaler

| Metode | Sti | Body | Merknad |
|---|---|---|---|
| POST | `/v1/conversations` | `{ topic, tone?, darkHumor? }` | `topic`: `parforhold` \| `arbeid` \| `utsettelse` \| `annet`. `persisted` = brukerens `historyEnabled`. Ikke-lagrede samtaler får `expiresAt` (`EPHEMERAL_TTL_HOURS` etter siste melding). |
| GET | `/v1/conversations` | – | Historikk: **bare** `persisted = true`. |
| GET | `/v1/conversations/:id` | – | `{ conversation, messages[] }` |
| PATCH | `/v1/conversations/:id` | `{ tone?, darkHumor?, closed? }` | `409 humor_locked` hvis `darkHumor: true` i en tråd med sikkerhetsnivå `concern`/`acute`. |
| DELETE | `/v1/conversations/:id` | – | `204`. Kaskade: meldinger, sammendrag og minner med `sourceConversationId` = denne. Pågående generering avbrytes. |
| DELETE | `/v1/conversations` | – | `{ deleted }`. Slett all historikk. |

### Samtaleobjekt

```json
{ "id": "…", "topic": "parforhold", "title": "…", "tone": "torr", "darkHumor": false,
  "persisted": true, "expiresAt": null, "safetyLevel": "none", "closedAt": null,
  "createdAt": "…", "updatedAt": "…" }
```

## Meldinger og strømming

### `POST /v1/conversations/:id/messages`

```json
{ "clientMessageId": "uuid fra klienten", "kind": "message", "content": "Hva skjer?", "correctsMessageId": "valgfri" }
```

| `kind` | Betydning | `content` |
|---|---|---|
| `message` | Fritt svar | påkrevd, maks `MAX_MESSAGE_CHARS` |
| `import` | Innlimt tekst (e-post, melding). Behandles som data. | påkrevd, maks `MAX_IMPORT_CHARS` |
| `correction` | «Du har misforstått». Markerer valgt (`correctsMessageId`) eller siste svar som bommet. | valgfri forklaring |
| `tone_milder` / `tone_sharper` | Endrer trådens tone ett hakk og ber om samme poeng i ny tone | tom |
| `next_step` | Ber om nøyaktig ett konkret neste steg | tom |

**Feil før strømmen starter** returneres som vanlig JSON:
`400 validation_error`, `404 not_found`, `409 generation_in_progress`, `409 idempotency_conflict`,
`413 message_too_long`, `429 rate_limited | daily_limit | monthly_limit`.

**Ellers** svarer serveren `200 text/event-stream` med disse hendelsene, i rekkefølge:

| Hendelse | Data | Når |
|---|---|---|
| `user_message` | `{ message, replay }` | Brukermeldingen er lagret. Klienten kan nå slette utkastet. |
| `assistant_message` | `{ message }` | Svaret er opprettet (`status: created`). |
| `safety` | `{ level, resources[] }` | Ved `concern`/`acute`: verifiserte hjelpetilbud som skal vises. |
| `delta` | `{ text }` | Tekstbit fra modellen (0–n ganger). |
| `error` | `{ code, message, retryable }` | Forståelig norsk feilmelding (tidsavbrudd, modell nede osv.). |
| `done` | `{ message }` | Endelig status for svaret. Alltid siste hendelse når serveren fullfører. |

Hjerteslag sendes som SSE-kommentar (`: ping`) hvert 15. sekund.

### Meldingsstatus

| Status | Norsk | Betydning |
|---|---|---|
| `created` | opprettet | Lagret, modellen er ikke startet |
| `generating` | genererer | Modellen skriver |
| `completed` | fullført | Ferdig. `incompleteReason: "max_tokens"` betyr ufullstendig (kuttet). |
| `cancelled` | avbrutt | Stoppet. Delvis tekst er lagret. |
| `failed` | feilet | Ingen brukbar tekst. |

`incompleteReason`: `user_cancelled`, `client_disconnected`, `superseded`, `timeout`, `max_tokens`,
`refusal`, `provider_error`, `server_restart`.

Strømmen som brytes uten `done` skal klienten vise som avbrutt, aldri som fullført.

### Idempotens

`clientMessageId` er unik per samtale. Samme ID igjen:

- Samme tekst, svar `completed` → strømmen spilles av (`replay: true`). Ingen ny melding, intet modellkall.
- Samme tekst, svar `cancelled`/`failed` → nytt svar genereres for **samme** brukermelding.
- Samme tekst, svar pågår → det gamle stoppes (`superseded`), så genereres nytt.
- Annen tekst → `409 idempotency_conflict`.

### Avbrytelse

- Klienten lukker forbindelsen → serveren avbryter modellkallet (`AbortSignal`) → `cancelled / client_disconnected`.
- `POST /v1/messages/:id/cancel` → `{ id, cancelRequested: true }`. Virker også på tvers av instanser
  (DB-flagg som sjekkes hvert sekund) → `cancelled / user_cancelled`.

## Handlingskort

| Metode | Sti | Body |
|---|---|---|
| POST | `/v1/conversations/:id/action-card-draft` | `{ basis? }` → `{ draft: { what, when, doneWhen, ifStuck }, modelBacked }`. Lagres ikke. |
| GET | `/v1/action-cards` | – |
| POST | `/v1/action-cards` | `{ conversationId?, what, when, doneWhen, ifStuck }` |
| PATCH | `/v1/action-cards/:id` | `{ what?, when?, doneWhen?, ifStuck?, status? }`, `status`: `open` \| `done` \| `set_aside` |
| DELETE | `/v1/action-cards/:id` | – |

Handlingskort er eksplisitt lagret av brukeren og overlever sletting av samtalen (`conversationId` blir `null`).
De brukes ikke i modellkontekst.

## Minne (krever `memoryEnabled`)

| Metode | Sti | Body |
|---|---|---|
| GET | `/v1/memories` | – |
| POST | `/v1/memories` | `{ content, sourceConversationId? }` (`409 memory_disabled` hvis av) |
| PATCH | `/v1/memories/:id` | `{ content }` |
| DELETE | `/v1/memories/:id` | – |
| DELETE | `/v1/memories` | – |
| POST | `/v1/conversations/:id/memory-suggestions` | – → `{ suggestions[], sourceConversationId }`. Forslag lagres ikke før brukeren lagrer dem. |

## Drift

| Metode | Sti | Svar |
|---|---|---|
| GET | `/healthz` | `{ ok: true }` (prosessen lever) |
| GET | `/readyz` | `{ ok, db, provider }`, `503` hvis databasen ikke svarer |
| GET | `/v1/meta` | `{ provider, modelBacked, chatModel, limits, ephemeralTtlHours, resources }` |

`modelBacked: false` betyr testmodus (mock). Appen viser da et tydelig banner.

## Feilformat

```json
{ "error": { "code": "rate_limited", "message": "Du sender raskt. Vent et minutt og prøv igjen.", "retryable": true } }
```
