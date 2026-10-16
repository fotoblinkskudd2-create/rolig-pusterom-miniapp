# 1. KONTRADIKSJON
### Et adversarielt multiagent-system som bygger klagesaker for folk som ikke har råd til advokat

> Brevet fra NAV ligger på kjøkkenbenken. Fire sider. «Vedtak». Paragraf 11-5, paragraf 21-3, «det vises til». Klagefrist seks uker. Jeg leser første setning tre ganger og forstår ingenting, og den delen av hodet som pleier å ta over når det blir for mye, kjøper allerede noe på Klarna for å døyve lyden.
> Staten har jurister på lønn. Jeg har et brev og en hjerne i nødstrøm.
> Dette systemet finnes for å gjøre den kampen jevnere.

---

## 1.1 Problemet

**Kjernen:** Folk mister rettigheter de faktisk har, fordi det å hevde dem krever juridisk, økonomisk og byråkratisk kompetanse på tvers av flere systemer samtidig — akkurat når de er mest presset.

- **[F]** Underbruk av sosiale rettigheter («non-take-up») er godt dokumentert internasjonalt. Eurofound (2015, *Access to social benefits: Reducing non-take-up*) fant at underbruk på over 40 % ikke er uvanlig i en del ordninger. Tallene varierer kraftig mellom land og ordninger.
- **[F]** Norge har Gjeldsregisteret (siden 2019), inkassoloven med forskriftsfestede maksimalsatser for salær, gjeldsordningsloven, folketrygdloven, Trygderetten som ankeinstans, Sivilombudet, og fri rettshjelp med inntektsgrenser som mange i lavinntektsgruppen likevel faller utenfor.
- **[A]** De vanskeligste sakene er *tverrgående*: en person med en NAV-sak, tre inkassokrav, et Lånekassen-mislighold, en restskatt og en husleierestanse. Ingen enkelt instans ser helheten. Ingen enkelt AI-prompt klarer den heller — fordi hvert domene har egne regler, frister, kilder og beregninger, og fordi feil i én del forplanter seg.

**Hvorfor dette er et ekte multiagent-problem (ikke bare én stor prompt):**

1. **Domenebredde.** Trygderett, inkassorett, skatterett, gjeldsordning og forvaltningsrett har hver sine rettskilder, rundskriv og praksis. Spesialiserte agenter med egne verktøy og egne kildeutvalg gir bedre presisjon enn én generalist.
2. **Adversarial kontroll.** Det viktigste sikkerhetsgrepet er en agent som *aktivt prøver å slå ned argumentet* slik saksbehandleren på andre siden ville gjort. Én modell som både argumenterer og kritiserer seg selv har dokumentert tendens til selvbekreftelse **[A]**.
3. **Deterministiske beregninger.** Renter, gebyrer, frister og beregningsgrunnlag skal aldri «gjettes» av en språkmodell. De skal gjøres i kode, av en egen agent, og etterprøves.
4. **Sporbarhet.** Hver eneste påstand må kunne spores til en kilde (lovtekst, vedtak, dokument fra brukeren). Det krever en egen verifikasjonsagent med vetorett.

---

## 1.2 Visjon i én setning

> **Gi ethvert menneske med et brev fra staten den samme kvaliteten på motargumentasjon som staten selv har — med full sporbarhet, uten å late som det er en advokat.**

---

## 1.3 Agentene

| # | Agent | Rolle | Verktøy | Kan ikke |
|---|---|---|---|---|
| 1 | **Mottaket** (Intake) | Traumeinformert samtale. Henter fakta i korte, rolige steg. Oppdager krise (selvmordsfare → straks til menneskelige ressurser: 113 / Mental Helse hjelpetelefon 116 123). | Samtale, strukturert skjema | Gi juridiske råd |
| 2 | **Arkivaren** | OCR av brev, PDF-er, skjermbilder. Bygger tidslinje: datoer, frister, saksnumre, beløp, avsender. | OCR (Tesseract / vision-modell), dokumentparser, datoekstraksjon | Tolke jus |
| 3 | **Rettskildeagenten** | Finner relevante lovbestemmelser, forskrifter, rundskriv, praksis (Trygderetten, Sivilombudet, Finansklagenemnda). Returnerer *sitater med presis kildeplassering*, aldri parafraser uten kilde. | Hybrid søk (BM25 + vektorer) over indeksert rettskildekorpus | Finne opp kilder |
| 4 | **Regnemesteren** | Alle tall. Gebyrer mot inkassoforskriftens maksimalsatser, forsinkelsesrente etter forsinkelsesrenteloven, foreldelse (foreldelsesloven: hovedregel 3 år), fristberegning etter forvaltningsloven. | **Kun deterministisk kode**, enhetstestet. LLM får bare kalle funksjoner. | Bruke språkmodell til aritmetikk |
| 5 | **Motparten** (Red Team) | Spiller saksbehandler/kreditor/Trygderetten. Skriver det sterkeste mulige avslaget mot hvert argument. | Samme kilder som Rettskilde | Være snill |
| 6 | **Strategen** | Velger hva som skal prioriteres: Hvilken frist brenner først? Hvilket krav kan bestrides? Hva gir mest effekt per time? Lager en handlingsplan. | Beslutningstre, frist-graf | Overstyre Verifikatoren |
| 7 | **Skriveren** | Skriver klagen, innsigelsen, brevet — i klarspråk, saklig, med kildehenvisninger. Også en «forklar-meg-som-om-jeg-er-sliten»-versjon til brukeren. | Maler, stilguide (Språkrådets klarspråkprinsipper) | Legge til fakta som ikke er i fakta-grafen |
| 8 | **Verifikatoren** | **Vetorett.** Sjekker at hver påstand i utkastet peker på en node i fakta-grafen og at hvert sitat finnes ordrett i kilden. Stopper alt som ikke kan spores. | String-matching mot kildetekst, NLI-modell, sjekklister | Godkjenne noe uten kilde |
| 9 | **Mennesket** | Frivillig jurist / jusstudent (Jussbuss, Jusshjelpa, Jussformidlingen) eller gjeldsrådgiver i NAV/kommune. Godkjenner før noe sendes. | Saksdashbord | — |

---

## 1.4 Samarbeidsarkitekturen

### Prinsipp: «Ingen påstand uten kilde» — en typet påstandsgraf (claim graph)

I stedet for at agentene sender fritekst til hverandre, skriver de til en felles **blackboard** som er en *typet graf*:

```
Dokument ──inneholder──▶ Faktum ──støttes_av──▶ Kildeutdrag
                            │
                            ▼
                         Argument ──bygger_på──▶ Rettsregel ──sitert_fra──▶ Kildeutdrag
                            │
                            ├──angripes_av──▶ Motargument (fra Motparten)
                            │                     │
                            │                     └──besvares_av──▶ Tilsvar
                            ▼
                         Krav / Handling ──har_frist──▶ Frist (beregnet av Regnemesteren)
```

Hver node har: `id`, `type`, `opprettet_av` (agent), `kilde_spans[]`, `tillit` (0–1), `status` (`utkast | angrepet | forsvart | verifisert | avvist`).

**Regel:** Skriveren får bare lese noder med status `verifisert`. Det er den viktigste enkeltmekanismen mot hallusinasjon.

### Datamodell (forenklet, TypeScript)

```ts
type AgentId = 'mottak' | 'arkivar' | 'rettskilde' | 'regnemester'
             | 'motpart' | 'strateg' | 'skriver' | 'verifikator' | 'menneske';

interface KildeSpan {
  kildeId: string;          // f.eks. "lov/1999-05-13-60/§5" eller "bruker/brev-2026-09-14.pdf"
  start: number; end: number;
  ordrettTekst: string;     // kopiert, ikke parafrasert
  hentet: string;           // ISO-dato
}

interface Node {
  id: string;
  type: 'faktum' | 'regel' | 'argument' | 'motargument' | 'tilsvar' | 'krav' | 'frist';
  innhold: string;
  kilder: KildeSpan[];
  opprettetAv: AgentId;
  tillit: number;
  status: 'utkast' | 'angrepet' | 'forsvart' | 'verifisert' | 'avvist';
}

interface Kant { fra: string; til: string; relasjon:
  'støttes_av' | 'bygger_på' | 'angripes_av' | 'besvares_av' | 'har_frist' | 'inneholder'; }

interface Sak {
  id: string;
  domener: ('trygd' | 'inkasso' | 'skatt' | 'gjeldsordning' | 'husleie' | 'lanekassen')[];
  noder: Node[]; kanter: Kant[];
  hendelseslogg: { tid: string; agent: AgentId; handling: string }[];
}
```

### Orkestrering

- **Tilstandsmaskin, ikke fri sverm.** En orkestrator (deterministisk kode, f.eks. LangGraph eller Claude Agent SDK med subagenter) styrer fasene. Frie «agenter-som-chatter-med-hverandre» gir støy og kostnadseksplosjon **[A]**.
- **Debattrunder med tak.** Argument → Motpart angriper → Rettskilde/Strateg forsvarer → maks 3 runder → Verifikator avgjør status. Argumenter som ikke overlever, merkes `avvist` og vises *likevel* til mennesket med begrunnelse (gjennomsiktighet).
- **Kostnadsruting.** Billig modell for OCR-opprydding og klassifisering, sterkeste modell for Motpart og Verifikator (der feil koster mest).

---

## 1.5 Arbeidsflyten — en ekte sak, steg for steg

**Eksempel:** Kari, 34, enslig mor. Har fått avslag på arbeidsavklaringspenger (AAP), har tre inkassokrav og en betalingsoppfordring fra Lånekassen.

| Fase | Hva skjer | Output |
|---|---|---|
| 0. Krisesjekk | Mottaket stiller rolige spørsmål. Ingen krisesignal. | Samtykke, risikonivå |
| 1. Innsamling | Kari tar bilde av 7 brev. Arkivaren OCR-er, trekker ut 23 datoer, 9 beløp, 4 frister. | Tidslinje |
| 2. Frist-triage | Regnemesteren beregner: AAP-klagefrist (6 uker etter at vedtaket kom fram, folketrygdloven § 21-12 — mot 3 uker som hovedregel i forvaltningsloven § 29) går ut om **9 dager**. Inkassokrav nr. 2 har et salær som **overstiger** maksimalsats. Krav nr. 3 er muligens **foreldet**. | Frist-graf, røde flagg |
| 3. Rettskilder | Rettskilde henter relevante paragrafer og praksis for hvert flagg, med ordrette sitater. | Regel-noder |
| 4. Argumentbygging | Strategen bygger tre argumentløp. | Argument-noder |
| 5. Angrep | Motparten skriver det sterkeste avslaget mot hvert argument. Eksempel: «Foreldelse er avbrutt ved betalingsoppfordring datert …». | Motargumenter |
| 6. Tilsvar | Rettskilde finner at betalingsoppfordringen ikke er et foreldelsesavbrudd etter foreldelsesloven § 14–17 (*hypotetisk eksempel — må vurderes konkret*). Eller: argumentet faller. | Status: forsvart / avvist |
| 7. Verifikasjon | Verifikatoren matcher hvert sitat ordrett. To påstander mangler kilde → sendt tilbake. | Verifisert graf |
| 8. Skriving | Skriveren lager: (a) AAP-klage, (b) innsigelse mot salær, (c) foreldelsesinnsigelse, (d) én A4-side til Kari: «Dette gjør vi, i denne rekkefølgen». | Utkast |
| 9. Menneske | Frivillig jurist leser i dashbordet, ser påstandsgrafen, godkjenner/endrer. | Godkjent pakke |
| 10. Oppfølging | Påminnelser om frister. Når svar kommer: ny syklus. | Saken lever |

---

## 1.6 Teknologistabel

| Lag | Valg | Kommentar |
|---|---|---|
| Orkestrering | Claude Agent SDK eller LangGraph (Python) | Eksplisitt tilstandsmaskin, sjekkpunkter, menneske-i-løkka-avbrudd |
| Modeller | Sterk frontier-modell for Motpart/Verifikator/Skriver; mindre modell for ekstraksjon | Kostnadsruting |
| Rettskildekorpus | Lover og forskrifter fra Lovdatas åpne data **[F: Lovdata tilbyr gjeldende lover og sentrale forskrifter som åpne data]**; rundskriv fra nav.no; Sivilombudets uttalelser (offentlige) | Praksis fra Trygderetten krever lisensavklaring **[A]** |
| Søk | PostgreSQL + pgvector + BM25 (hybrid), paragrafnivå-chunking med stabil ID | Juridiske tekster krever presis granularitet |
| Beregning | Ren Python/TypeScript-modul med property-based tester (Hypothesis / fast-check) | Satser versjonert per år |
| OCR | Vision-modell + Tesseract som fallback | Norske tegn æøå testes eksplisitt |
| Verifikasjon | Ordrett substring-match + NLI («følger påstanden av sitatet?») | Begge må passere |
| Lagring | Kryptert per sak, kort lagringstid, sletting på forespørsel | Særlige kategorier personopplysninger (helse) → GDPR art. 9 |
| UI | React-dashbord for jurist + mobilvennlig flyt for bruker (se Brevknuseren, kap. 3) | |

---

## 1.7 Hvordan bygge og teste det i praksis

### Fase 1 — Smal kile (uke 1–6): **Kun inkasso**
Hvorfor inkasso først: reglene er relativt mekaniske (maksimalsatser, foreldelse, frister), feil er lette å måle, og volumet er enormt **[A]**.

- Bygg Regnemesteren for inkasso + foreldelse, med 200+ enhetstester.
- Bygg Arkivaren for inkassobrev.
- Test på 50 anonymiserte/syntetiske inkassobrev. **Mål:** 100 % korrekt beregning, ≥ 95 % korrekt ekstraksjon.

### Fase 2 — Adversarial sløyfe (uke 7–14)
- Legg til Rettskilde, Motpart, Verifikator.
- **Evalueringsmetode: tilbakeprøving (backtesting) mot publiserte avgjørelser.** Ta offentlige avgjørelser (f.eks. Finansklagenemnda inkasso, Sivilombudet), fjern konklusjon og begrunnelse, gi systemet faktumet, og mål:
  - Fant systemet de samme rettsreglene som nemnda la til grunn? (recall)
  - Fant Motparten de motargumentene nemnda faktisk brukte?
  - Hallusinerte sitater: **mål = 0**.
- Mål også *kalibrering*: når systemet sier 80 % tillit, har det rett ~80 % av gangene?

### Fase 3 — Pilot med mennesker (uke 15–26)
- Samarbeid med et studentdrevet rettshjelptiltak eller en kommunal gjeldsrådgivningstjeneste.
- Systemet er *verktøy for rådgiveren*, ikke direkte for publikum, i piloten.
- **Mål:** tid per sak (før/etter), andel saker der fristen ble nådd, rådgivers vurdering av kvalitet, antall feil fanget av mennesket.

### Fase 4 — Utvidelse
Trygd (AAP, uføre), skatt, Lånekassen, husleie. Én domeneagent om gangen, hver med egen evalueringsbank.

---

## 1.8 Utfordringer og hindringer (ærlig)

| Utfordring | Alvor | Tiltak |
|---|---|---|
| **Regulering av rettshjelp.** Advokatloven (ny lov, i kraft 2025 **[A: verifiser ikrafttredelse og unntak]**) regulerer hvem som kan drive rettshjelpsvirksomhet. | Høy | Start som *verktøy for jurister/rådgivere*. Få juridisk vurdering før direkte-til-publikum. |
| **Hallusinerte kilder** | Kritisk | Verifikator med vetorett, ordrett-match, null-toleranse-test i CI |
| **Sensitive personopplysninger** | Høy | DPIA, dataminimering, lokal behandling der mulig, EØS-hosting, kort lagring |
| **Feil råd gir reell skade** | Høy | Menneske godkjenner alt som sendes; tydelig «dette er ikke advokatbistand» |
| **Lisens på praksis-data** | Middels | Start med åpne kilder; forhandle med Lovdata |
| **Kostnad per sak** | Middels | Kostnadsruting; estimert kost per sak i fase 2 bør måles, mål < 50 kr **[S]** |
| **Systemet blir våpen for kverulanter** | Middels | Strategen vurderer også *om* noe bør klages; Motparten er brutal ærlig |
| **Staten oppfatter det som angrep** | Lav–middels | Rammes inn som *bedre saksgrunnlag og færre feilvedtak* — som sparer også forvaltningen tid |

---

## 1.9 Hvorfor dette er verdt det

- **Samfunnsverdi:** Hvis selv en liten andel av feilaktige vedtak og ulovlige gebyrer blir korrigert, er verdien per person enorm — ofte forskjellen mellom å klare seg og å gå under **[A]**.
- **Kommersielt:** B2G (kommuner, NAV-kontorenes økonomiske rådgivning), B2B (rettshjelpskontorer, fagforeninger, Forbrukerrådet-lignende aktører). Lisens per rådgiver. Brevknuseren (kap. 3) er gratis inngangsport.
- **Forskningsverdi:** Påstandsgrafen + adversarial verifikasjon er en generell arkitektur for *høyrisiko-dokumentarbeid* (forsikring, helse, compliance). Evalueringsbanken mot offentlige avgjørelser er i seg selv publiserbar **[A]**.

> Klokka er 04:40. Brevet ligger fortsatt der. Men nå har det en motstander.
