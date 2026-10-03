# 9. Sikkerhet, personvern og etikk

> Dette er et faglig utgangspunkt, ikke juridisk rådgivning. Behandlingsgrunnlag, DPIA og tekster må kvalitetssikres av personvernombud og jurist før pilot.

## Rettslig ramme (antatt Norge/EØS)

| Krav | Konsekvens |
|---|---|
| GDPR art. 6 + **art. 9** (helseopplysninger) | Behandlingsgrunnlag: art. 9(2)(h) helsehjelp, med pasientjournalloven/helsepersonelloven for helseaktører, **eller** uttrykkelig samtykke art. 9(2)(a) for ikke-helseaktører |
| Art. 22 (automatiserte avgjørelser) | Systemet tar **ingen** avgjørelser. Alle forslag krever menneskelig vurdering. Dokumenter det i DPIA |
| Art. 25 (innebygd personvern) | Dataminimering, pseudonymisering, egne formålssamtykker |
| **Art. 35 DPIA** | Påkrevd: helsedata + ny teknologi + profilering |
| Art. 15–20 | Innsyn, retting, sletting, dataportabilitet: `GET /contacts/{id}/export`, `DELETE` |
| Normen (helse) | Logging av tilgang, tilgangsstyring etter tjenstlig behov, risikovurdering |
| EU AI Act | Sannsynligvis ikke høyrisiko så lenge systemet er beslutningsstøtte uten medisinsk utstyrsformål. **Vurder MDR** hvis systemet markedsføres for diagnostikk eller behandling |
| CCPA / CPRA (hvis US-brukere) | «Sensitive personal information», rett til å begrense bruk, ingen salg. EØS-hosting endres ikke |

## Tekniske tiltak

| Område | Tiltak |
|---|---|
| **Dataminimering** | Fødselsår i stedet for dato; ingen fødselsnummer i klartekst (HMAC); `display_name` kryptert; pseudonym i UI og logger; ingen fritekst i logger |
| **Kryptering i transit** | TLS 1.3 overalt, HSTS, mTLS internt (service mesh) |
| **Kryptering i hvile** | Disk (sky-standard) + **feltkryptering** (envelope: DEK per tenant, KEK i Key Vault/HSM, rotasjon hver 12. måned) for `text_enc`, `name_enc`. Backups krypteres separat |
| **Tilgangskontroll** | OIDC + MFA; RBAC (rolle) + **ABAC** (tildeling = tjenstlig behov) håndhevet i Postgres-RLS; admin ser ikke klinisk innhold; nødtilgang («break the glass») med begrunnelse + varsel til personvernombud |
| **Logging** | Append-only audit med hash-kjede; hvem, hva, når, hvorfor (`purpose`), utfall; avviste forsøk logges; applikasjonslogger uten PII (strukturerte, med pseudonym); oppbevaring av audit i 10 år (helse), applogg i 90 dager |
| **Pseudonymisering** | PII-maskering før embedding; vektorer i egen tabell som slettes ved tilbaketrukket ML-samtykke (implementert + testet) |
| **Anonymisering for forskning/trening** | Egen database, k-anonymitet ≥ 10 for aggregater, fritekst manuelt kontrollert eller syntetisk erstattet; reidentifiseringstest før utlevering |
| **Sletting** | Myk sletting → hard sletting etter lovpålagt frist; sletting propagerer til vektorer, backup-utløp dokumentert (backup roteres ut innen 35 dager) |
| **Applikasjonssikkerhet** | OWASP ASVS nivå 2; CSP strict; CSRF-token i BFF; ratebegrensning; avhengighetsskann (Dependabot, Trivy); årlig pentest |
| **Leverandører** | Databehandleravtale med sky; EØS-region; ingen ekstern AI-API med klartekst helsedata |

## Samtykke-mal (utkast)

> **Samtykke til bruk av opplysninger i Psykologiet**
>
> Vi spør om tre ting, hver for seg. Du kan si ja til noe og nei til annet. Behandlingen din påvirkes ikke av hva du svarer.
>
> **1. Lagre notater fra samtalene våre** (`behandling_observasjon`)
> Behandleren din skriver korte notater om hvordan du har det. Bare behandlere som jobber med deg kan lese dem. ☐ Ja ☐ Nei
>
> **2. Automatiske forslag** (`ml_klassifisering`)
> Et dataprogram leser notatene og foreslår temaer behandleren kan se nærmere på, for eksempel «søvn» eller «økonomisk stress». Programmet bestemmer ingenting. Behandleren din vurderer alltid selv. Hvis du sier nei, leser programmet likevel etter ord som kan bety at du er i fare, slik at du kan få hjelp raskt. Det lagres ingen data fra det. ☐ Ja ☐ Nei
>
> **3. Forbedre tjenesten** (`forskning_anonymisert`)
> Opplysninger der navn og alt som kan peke på deg er fjernet, brukes til å gjøre forslagene bedre. ☐ Ja ☐ Nei
>
> Du kan trekke samtykket når som helst i appen eller ved å si fra til behandleren din. Trekker du nr. 2, sletter vi de automatiske dataene med en gang. Du har rett til innsyn, retting og sletting. Kontakt personvernombudet på [e-post].
>
> Samtykketekst versjon `samtykke-v1`, [dato].

## Datahåndteringspolicy (utkast, sammendrag)

1. **Formål**: støtte faglig oppfølging. Ikke vurdering av arbeidsevne, forsikring, ytelser eller lignende. Bruk til andre formål er forbudt og teknisk sperret (ingen eksport-API utenom innsyn).
2. **Ansvar**: Behandlingsansvarlig er [virksomhet]. Fagansvarlig eier taksonomien. Personvernombudet reviderer kvartalsvis.
3. **Tilgang**: kun tjenstlig behov, tidsavgrenset tildeling, kvartalsvis gjennomgang av tilganger.
4. **Lagringstid**: observasjoner etter journalforskrift / avtale; vektorer så lenge ML-samtykke gjelder; audit i 10 år.
5. **Avvik**: meldes personvernombud innen 24 t, Datatilsynet innen 72 t ved risiko.
6. **Endringer i modeller og koder**: krever versjonering, evaluering mot testsett og godkjenning fra fagansvarlig + teknisk ansvarlig.

## Etiske risikoer og tiltak

| Risiko | Eksempel | Sannsynlighet × konsekvens | Tiltak |
|---|---|---|---|
| **Falsk negativ på krise** | Indirekte formulering («jeg har ordnet alt, dere slipper meg snart») fanges ikke | Middels × Kritisk | Regler + modell i union; ≥ 500 kliniske P0-eksempler; recall = 1,0 som CI-gate; tydelig kommunikasjon om at systemet **ikke** er en sikkerhetsvurdering; aldri erstatning for vaktordning |
| **Falsk positiv på krise** | Sitat fra en film | Høy × Lav–Middels | Akseptert kostnad; rask avvisning; overvåk alarmtretthet |
| **Merkelapp-effekt** | Behandler ser personen gjennom kodene | Middels × Høy | Hypotese-språk, ressurskode (VC-011), ingen koder i oversiktslister uten kontekst, opplæring |
| **Bias** | Dialekt, nynorsk og andrespråk gir lavere recall; kulturelle uttrykk for ubehag tolkes feil | Høy × Høy | Rettferdighetsmåling per gruppe; nn- og dialektvarianter; annotatorer med ulik bakgrunn; flerspråklig modell |
| **Feilaktig intervensjon** | Selvhjelpstips når personen trenger akutt hjelp | Lav × Høy | Sluttbruker får aldri tiltak uten at P0-sjekk er kjørt; P0 overstyrer alt |
| **Funksjonsglidning** | Ledelse vil bruke aggregater til ytelsesmåling av behandlere | Middels × Høy | Formålsbegrensning i policy; ingen behandler-rangering i produktet |
| **Overtillit (automation bias)** | Behandler bekrefter alt | Middels × Middels | Overvåk bekreftelsesrate per bruker (> 95 % = samtale); tilfeldige «kontrollkort» i opplæring |
| **Reidentifisering** | Fritekst i treningsdata | Lav × Høy | PII-maskering, manuell kontroll, egen database |
| **Sensitive koder** (VC-009) | Tolkes som diagnose | Middels × Høy | `safeguards`, kun fagpersonvisning, opplæring |

## To-do

- [ ] DPIA (start i sprint 1, ferdig før pilot)
- [ ] Juridisk avklaring av behandlingsgrunnlag
- [ ] Brukerteste samtykketeksten med 5 personer (forståelse)
- [ ] Rutine for «break the glass»

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | DPIA + behandlingsgrunnlag | Må, blokkerer pilot |
| 2 | Feltkryptering + KMS | Må |
| 3 | PII-maskering | Må |
| 4 | Innsynseksport | Må |
| 5 | Rettferdighetsmåling | Bør |
| 6 | Hash-kjedet audit | Bør |
