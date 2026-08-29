# Produktplan: Rolig Pusterom 2.0 — "Isolation Mirror"

> Kjørt med parameterverdier: **{{MAL_GRUPPE}} = Isolerte/ensomme individer**, **{{TIDSHORISONT}} = 6 måneder**, **{{BUDSJETT}} = Finansiert (150 000+ kr)**.
> Grunnlag: eksisterende `index.html` (Rolig Pusterom MVP — innsjekk, pusterom, små grep, historikk) og `isolation-mirror.html` (ufullstendig prototype fra commit `02b1a25`, uten de "notatene" commit-meldingen lovet). Denne planen er notatene som manglet.

## 1. Sammendrag — hvor er vi, og hva er poenget

Dere har en fungerende, pen, men lavintensitets MVP (`index.html`): 4 sider, localStorage, ingen server, ingen konto. Den løser mild stress hos folk som allerede har det litt greit. Det er ikke der pengene eller virkningen er.

`isolation-mirror.html` er derimot et *retningsskifte*, halvferdig og uferdig kodet (hardkodet norsk poesi-generator, ingen faktisk bildeanalyse, ingen lagring). Men konseptet — et privat, skambasert refleksjonsrom for folk i isolasjon, ikke et humørtermometer for folk som har det OK — er det som faktisk rettferdiggjør et finansiert 6-måneders løp.

**Anbefaling: drep ikke Pusterom, men bygg Isolation Mirror som det ekte produktet, og la Pusterom bli ett modul inni det (pustesirkelen er god UX, gjenbruk den).** Ikke bygg to apper. Én app, to inngangsdører: rolig hverdagsstøtte vs. akutt isolasjonsnatt.

- Kjernehypotese: isolerte/ensomme mennesker søker anonymitet og lav terskel *mer* enn de søker fellesskap i første kontaktøyeblikk. Fellesskap kommer senere, ikke i første session.
- Det som IKKE fungerer for denne målgruppen: gamification, streaks, presskontakt med "ekte mennesker" dag 1, og noe som helst som ligner på et sosialt nettverk.
- Det som forsvarer 150 000+ kr og 6 måneder: ekte innholdsgenerering (ikke hardkodet tekst), en trygg eskaleringsvei til krisehjelp, og en design- og tekstkvalitet som ikke føles som en skolestudentprototype.

## 2. Målgruppe og innsikt

- **Primær:** Isolerte/ensomme voksne, typisk alene om kvelden/natten, lav terskel for å søke hjelp, høy terskel for å bli sett.
  - Undergruppe A: nylig isolert (samlivsbrudd, flytting, sykdom) — akutt, midlertidig, håper på bedring.
  - Undergruppe B: kronisk isolert (sosial angst, funksjonsnedsettelse, geografisk isolasjon) — søker mestring, ikke "kur".
- **Kjerneinnsikt fra prototypen:** brukeren skriver et notat eller tar et bilde *for seg selv*, ikke for å dele. "Mirror Art" (kunstgenerering) er en belønning for å ha delt noe sant med seg selv — ikke et sosialt objekt.
- Ikke anta at målgruppen vil ha flere funksjoner. Anta at de vil ha **færre klikk til lindring** og **null risiko for eksponering** (skjermlås, ingen pushvarsler med sensitivt innhold, ingen kontosystem som krever e-post ved første bruk).

## 3. Forskningsplan (måned 1)

- Kvalitativ: 8–12 semistrukturerte intervjuer med folk som selvidentifiserer som ensomme/isolerte (rekrutter via Mental Helse, studentsamskipnader, eldresentre — ikke sosiale medier alene, det biaser mot allerede sosialt aktive).
  - Spør spesifikt: "Hva gjorde du sist gang du følte deg mest alene kl. 02:00?" — ikke "hva synes du om appideen".
- Konkurrentkartlegging: sammenlign mot Woebot, Wysa, Finch, og norske aktører (Assistert Selvhjelp, Nkvinne). Finn hullet: de fleste er enten kliniske (tunge) eller "gamified" (barnslige for denne målgruppen).
- Kvantitativ validering: en enkel landingsside med e-postliste + venteliste, målt konvertering fra 2–3 målrettede annonser (lavt budsjett, ~5 000 kr), for å teste om budskapet "Du er ikke alene i dette" faktisk trigger klikk.
- **Beslutningspunkt etter måned 1:** hvis intervjuene viser at målgruppen primært vil ha *menneskekontakt* fremfor *privat refleksjon*, pivoter til en peer-support-modell — det er et annet produkt med andre juridiske krav (moderering, ansvar). Ikke bygg begge.

## 4. Brainstorming — konseptalternativer, rangert

1. **Isolation Mirror som kjerneflyt (anbefalt).** Notat/bilde inn → generert privat protokoll (konkrete, kroppslige mikrohandlinger) + valgfri "Mirror Art" (AI-generert bilde/tekst som en form for anerkjennelse). Alt lokalt/kryptert som standard.
2. **Isolasjonsdagbok med mønstergjenkjenning.** Som Historikk-siden i dag, men med enkel trendvisning ("du er mest alene på søndager") — nyttig, men ikke differensierende alene.
3. **Peer-matching for isolerte.** Høy effekt, men høy risiko (moderering, sikkerhet, ansvar for skade) og passer dårlig med 6-måneders/finansiert-men-ikke-uendelig scope. Parkeres til v3.
4. **Terapeut-on-demand.** Krever helsepersonell, GDPR særkategori-data, forsikring. Utenfor scope og budsjett i denne horisonten.

Prioriter #1. Bruk #2 som en gratis "gulrot"-funksjon i samme app for retensjon.

## 5. Design og UX-retning

- Behold den rolige, lave-kontrast estetikken fra `index.html` (fargepalett `--accent: #a8c5b0` osv.) for hverdagsmodulen, men isolasjonsflyten (`isolation-mirror.html`) trenger en *bevisst* mørkere, nattlig visuell identitet — det er allerede antydet i `:root { --bg:#1a1f1c; }`, dyrk det videre i stedet for å harmonisere alt til pastell. Isolasjon skjer om natten; ikke lys det opp med samme lyse tema som "sjekk inn"-siden.
- Ett tydelig, stort inngangspunkt fra hjem-siden: "Det er tungt akkurat nå" → rett inn i Isolation Mirror-flyten, uten mellomsteg.
  - Skriveintensitet skal være valgfri på alle nivåer — bilde ELLER tekst ELLER bare trykk "jeg er her".
- Fjern all placeholder-tekst som ikke er ment å skipes til produksjon (se pkt. 7 — "Bergen-regn"-linjen er hardkodet demo-tekst, ikke en funksjon).
- Tilgjengelighet: kontrast på mørkt tema må WCAG AA-testes (dagens `--muted:#8a9a8f` på `--bg:#1a1f1c` bør sjekkes), og hele appen skal fungere med skjermleser — dette er en målgruppe der noen også har funksjonsnedsettelser som bidrar til isolasjonen.

## 6. Prototype-plan (måned 1–3)

- **Steg 1 (uke 1–2):** Fjern hardkodet output i `generate()` i `isolation-mirror.html`. Erstatt med et faktisk LLM-kall (server-side proxy, aldri API-nøkkel i klienten) som genererer den private protokollen ut fra notatteksten.
- **Steg 2 (uke 3–4):** Bildefunksjonen skal enten faktisk gjøre noe (bildeanalyse → refleksjonstekst) eller fjernes. Ikke behold en fil-input som ikke brukes til noe reelt — det bryter tillit umiddelbart hos en mistroisk målgruppe.
- **Steg 3 (uke 5–8):** Bygg persistens: kryptert lokal lagring som standard (som dagens `localStorage`-mønster, men med valgfri kryptert sky-backup mot konto — kun for de som aktivt ber om det).
- **Steg 4 (uke 9–12):** Krise-eskaleringslogikk — enkel nøkkelordgjenkjenning på alvorlig innhold (selvmordstanker, akutt fare) som avbryter "kunstgenerering"-flyten og viser direkte, uomgåelig kontaktinfo til hjelpelinjer (Mental Helse 116 123, Kirkens SOS 22 40 00 40). Dette er ikke valgfritt — det er en forutsetning for å i det hele tatt lansere til denne målgruppen.
- Brukertest hver 2-ukers syklus med 3–5 personer fra målgruppen, ikke bare internt team.

## 7. Teknisk arkitektur og MVP-scope

- Behold "ingen konto påkrevd"-prinsippet så langt som mulig — det er en konverteringsfordel for en mistroisk målgruppe, ikke bare en teknisk snarvei.
- Flytt fra ren klient-HTML til en tynn backend kun der det er nødvendig: LLM-proxy (skjuler nøkkel, rate-limiter, logger IKKE råtekst utover det som trengs for krisedeteksjon), og valgfri kryptert synk.
- Eksplisitt IKKE i MVP-scope: brukerkontosystem med sosial innlogging, offentlige profiler, delingsfunksjoner, in-app kjøp av "kunst"-NFT-type greier (fristende, men det tåkelegger formålet og målgruppens tillit).
- Datahåndtering: notater/bilder om psykisk helse er sensitive personopplysninger (GDPR særkategori). Krev databehandleravtale med LLM-leverandør, minimer lagring, gi brukeren en synlig "slett alt"-knapp fra dag 1 — ikke en fase 2-greie.

## 8. Go-to-market / markedsføring

- **Kanaler som faktisk treffer isolerte mennesker:** partnerskap med Mental Helse, studentsamskipnader, eldresentre, fastlegekontorer (plakater/QR-kode i venterom) — ikke Instagram-influencere.
- **Budskap:** "Du er ikke alene i dette" (allerede i koden — behold linjen, den er god) fremfor "bli lykkeligere". Isolerte mennesker reagerer negativt på pushy lykke-budskap.
- **Lavterskel first-touch:** en enkel, delbar mikroside (ikke app-nedlasting som første steg) — senk friksjonen til null før du ber om noe som helst.
- Med finansiert budsjett (150 000+ kr): sett av minst 40 % til partnerskap/fagfellevalidering (f.eks. en fagperson som kvalitetssikrer krisehåndteringen — dette er også et tillitssignal dere kan bruke i markedsføring), og maks 30 % til betalt annonsering — resten til produkt/design.

## 9. Monetisering

- **Ikke** ta betalt for kjernefunksjonen (innsjekk, pusterom, privat protokoll) — betalingsmur på et krisebehov er både etisk problematisk og dårlig konvertering.
- Monetiser: valgfri kryptert sky-backup/synk på tvers av enheter (abonnement), og en B2B-kanal (lisensiering til bedriftshelse/kommuner/studentsamskipnader som ønsker å tilby dette som et lavterskeltiltak).
- Ved 150 000+ kr budsjett og 6 måneder er realistisk mål: 1–2 betalte pilotavtaler med kommune/samskipnad innen måned 6, ikke tusenvis av betalende sluttbrukere — B2B2C er raskere vei til inntekt for denne typen produkt enn ren forbrukerbetaling.

## 10. Milepæler (6 måneder)

- **Måned 1:** Forskning ferdig, beslutningspunkt tatt (pkt. 3), konsept låst.
- **Måned 2–3:** Fungerende Isolation Mirror-prototype med ekte generering, kryptert lagring, krise-eskalering. Internt testet.
- **Måned 4:** Brukertesting med 15–20 personer fra målgruppen, fagfellevalidering av krisehåndtering (psykolog/fagperson gjennomgår flyten).
- **Måned 5:** Go-to-market-kanaler aktivert, første partnerskapssamtaler, betalt pilot-tilbud til minst 3 kommuner/organisasjoner.
- **Måned 6:** Offentlig lansering (myk, ikke stor kampanje), minst 1 signert B2B-pilot, målbare bruksdata (retensjon dag 7/dag 30) som grunnlag for neste finansieringsrunde.

## 11. Risiko, antakelser og beslutningspunkter

- **Antakelse:** brukere stoler nok på en app til å skrive om isolasjon. Risiko: hvis tillit uteblir, faller hele konseptet. Mitigering: radikal transparens om datalagring, ingen skjulte analytics.
- **Antakelse:** LLM-generert "trøst" oppleves som ekte nok. Risiko: genisk, robotaktig tekst føles verre enn ingenting for en sårbar bruker. Mitigering: menneskelig redigert prompt-design + fagperson-review av tone, ikke rå LLM-output.
- **Beslutningspunkt (måned 1):** peer-support vs. privat refleksjon (se pkt. 3).
- **Beslutningspunkt (måned 4):** hvis fagfellevalidering av krisehåndtering ikke er tilfredsstillende, utsett offentlig lansering — ikke lanser noe som kan svikte i et akutt øyeblikk for å holde tidslinjen.
- Regulatorisk risiko: hvis appen begynner å ligne et medisinsk hjelpemiddel (diagnostiske påstander), trigges strengere krav (MDR/helselovgivning). Hold språket til "mestring og støtte", aldri "behandling" eller "diagnose".

## 12. Eksempler og kanttilfeller

**Eksempel 1 — Kjerneflyt, akutt kveld.** Anna, 34, nylig separert, bor alene i Bergen, kl. 23:40. Hun åpner appen, trykker "Det er tungt akkurat nå" (ikke "sjekk inn" — det føles for lett). Skriver tre setninger om at leiligheten føles tom. Får en protokoll: "sett føttene i gulvet, tre pust, skriv én sann setning" — hun har allerede gjort det siste. Får en kort, ikke-klisjeaktig refleksjonstekst generert fra det hun skrev, ingen emoji, ingen "du klarer dette!"-tone. Lukker appen uten å ha delt noe med noen — det er poenget, ikke en mangel.
- Mål: fullføring av flyten uten avbrudd, og at hun åpner appen igjen innen 7 dager.

**Eksempel 2 — B2B-pilot.** En studentsamskipnad ønsker å tilby appen til studenter som melder ensomhet i en velferdsundersøkelse. De trenger: anonymisert aggregert bruksstatistikk (uten individdata), en enkel administrasjonsvisning, og bekreftelse på at krisehenvisning peker til deres egen studenthelsetjeneste i tillegg til nasjonale linjer.
- Mål: signert avtale innen måned 6, konfigurerbar krisehenvisning per institusjon.

**Kanttilfelle 1 — Innhold som indikerer akutt fare.** Bruker skriver noe som antyder umiddelbar selvmordsfare. Systemet MÅ avbryte normal "kunstgenerering"-flyt og vise direkte, uomgåelig informasjon om nødhjelp — aldri la dette gå gjennom en vanlig LLM-generert "trøstetekst" uten menneskelig fallback-sti.

**Kanttilfelle 2 — Ingen internettforbindelse.** Målgruppen kan ha ustabil tilgang (gamle telefoner, dårlig data-abonnement pga. lav inntekt). Kjernefunksjoner (pustesirkel, statiske "små grep") må fungere 100 % offline; kun den generative protokollen krever nett — vis en tydelig, ikke-skambelagt feilmelding og fall tilbake til en forhåndsskrevet (ikke-generert) versjon.

**Kanttilfelle 3 — Bruker vil slette alt.** En bruker som ombestemmer seg og vil forsvinne sporløst (relevant nettopp fordi målgruppen frykter eksponering) må kunne slette all data — lokalt og i sky — med ett trykk, uten "er du sikker?"-friksjon utover én enkel bekreftelse, og uten at det krever kundeservice-kontakt.
