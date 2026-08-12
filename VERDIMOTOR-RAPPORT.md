# ALEXANDER RAW VALUE ENGINE — Rapport

**Dato:** 12.08.2026 · **Kjørt av:** Grok Heavy-rolle i Claude Code · **Status:** se Del 9

## Metodenotat (les dette først)

Oppdraget ber om analyse av et fullt korpus (bilder, tidligere samtaler, dokumenter, prototyper). Feltet der korpus skulle limes inn var tomt — jeg har kun konsept-navnene og ett-linjes beskrivelsene i selve oppdragsteksten (kategori A–J), pluss **én konkret, verifiserbar gjenstand**: dette git-repoet, `rolig-pusterom-miniapp`, som er en ferdig fungerende MVP.

Etter regel 11/12 (ikke still unødvendige spørsmål, gjør mest sannsynlige tolkning) har jeg valgt denne tolkningen: repoet er selve beviset på hvilket spor som faktisk er i bevegelse, og blir derfor ankeret for hele analysen. Alt annet materiale (kategori A–D, F–J) behandles som en **idébank uten spesifikasjoner** — jeg gir dem en ærlig, grovkornet klyngevurdering (Del 2–3), ikke fabrikkert detaljanalyse jeg ikke har grunnlag for. Der jeg bruker eksterne kilder (marked, konkurrenter, pris) har jeg faktisk søkt og referert dem — se kildeliste nederst i hver seksjon. Alt annet er tydelig merket VERIFISERT / BEREGNET / ANTAKELSE / UKJENT.

---

## DEL 1 — EXECUTIVE VERDICT

**Høyest verifisert verdi:** `rolig-pusterom-miniapp`. Det er ikke en idé — det er en ferdig, fungerende produkt-MVP (mood-innsjekk, pustesirkel, mikro-handlinger, historikk, ren HTML/JS/localStorage, null avhengigheter). De fleste konsepter i korpuset er på idé-stadiet; dette er på **selg-stadiet**.

**Bygg først:** Ikke bygg mer app. Reposisjoner og selg det som allerede finnes, til B2B/B2G (kommune og bedriftshelse), ikke B2C. Forbrukermarkedet for norske pusteapper er mettet av aktører med psykologfaglig tyngde (Mindfit, Medio, Pusteankeret, iBreathe) — å konkurrere der er en rødt-lys-kamp Alexander taper. Gapet er institusjonelt: 25 % av norske kommuner mangler lavterskel psykisk helse-tilbud, og digitale verktøy brukes i dag som supplement, ikke erstatning, for veiledet selvhjelp (Helsedirektoratet/SINTEF IS-24/8, 2024). Ingen av de nevnte konsurrentene er bygget for **hvit-etikett, installasjonsfri distribusjon via kommune/bedrift** — det er den ubesatte posisjonen.

**Skal drepes / settes på is:** Alt hardware-tungt (subsea, arktisk drone, biomimetisk mekanikk) — reelt interessant, men kapital- og tidskrevende langt utover 30 dager, og konkurrerer ikke med noe Alexander kan verifisere i dag. Ikke drept for godt — flyttet til "høyest langsiktig verdi"-sporet (Del 2), ikke "bygg nå".

**Hvorfor:** Prioriteringsmodellen (Del 2, vektet formel) gir kategori E (rolig teknologi) desidert høyest score — drevet av at prototypen allerede finnes, personlig fit er maks, kapitalbehov er nesten null, og regulatorisk risiko er lav så lenge produktet holder seg strengt ikke-diagnostisk.

**Forventet første verdi:** Ett betalt pilotprosjekt (kommune frisklivssentral eller bedriftshelsetjeneste) i løpet av 30 dager, i størrelsesorden 15 000–40 000 kr for pilot + lisens. Se Del 4/Del 6 for tall og antakelser.

**Størst usikkerhet:** Om en kommune/bedrift faktisk vil betale for et verktøy uten psykologfaglig forankring bak seg. Mindfit og Medio vinner trolig på tillit i et rent forbrukersalg. Løsningen er å selge *infrastruktur og rapportering*, ikke *terapeutisk innhold* — se Del 4.

Kilder: [Finans Norge – Skadestatistikken 2025](https://www.finansnorge.no/artikler/2026/02/skadestatistikken-2025-farre-skader-men-hoye-kostnader-nar-uhellet-er-ute/), [Helsedirektoratet – lavterskeltilbud i kommuner](https://www.helsedirektoratet.no/nyheter/mange-lavterskeltilbud-innen-psykisk-helse--og-rus-i-kommunene), [Mentalt Perspektiv – test av 5 apper](https://mentaltperspektiv.no/anmeldt/test-5-apper-for-psykisk-helse/)

---

## DEL 2 — VERDIKART (klyngenivå)

Korpuset ga kategorinavn, ikke spesifikasjoner. Under er en **ærlig klyngevurdering** av kategoriene A–J, vektet etter Fase 2-formelen. Tallene er BEREGNET (min vurdering av hver klynges profil basert på det oppgitte konseptnavnet og domenekunnskap om markedene), ikke målt.

| Kl. | Konsept | Problem | Kunde | Modenhet | Betalingssignal | IP-signal | Risiko | Vektet score | Neste test |
|---|---|---|---|---|---|---|---|---|---|
| **E** | Rolig teknologi (PanicSafe, B-SAFE pust …) | Stress/uro-selvregulering | Kommune, bedriftshelse, privat | **MVP finnes** (dette repoet) | Middels (institusjonelt marked betaler i dag for kurs à 999–15 000 kr) | Lavt (UX/system, ikke maskin) | Lav | **69,7** | Send Pusterom-lenke til 5 frisklivssentraler i Bergen denne uken |
| **F** | Software/AI-agenter (radar-typer) | Repeterende byråkratisk/manuell smerte | SMB, kommune, devs | Idé → kan bygges på dager | Ukjent, trolig raskt testbart | Svakt (prosess, ikke oppfinnelse) | Lav | **53,0** | Bygg én radar-agent (README-to-Sales) og test på 5 GitHub-repoer |
| **I** | Kreativ produksjon/media | Distribusjon/merkevare for Alexander selv | Følgere, oppdragsgivere | Ferdighet finnes | Lavt per stykk, høyt i sum | Ingen (stil er ikke IP) | Lav | **46,3** | Publiser 3 stk Bergen-satire-hooks, mål respons |
| **H** | Matsvinn/hverdagsverktøy (PantryPilot) | Reelt, men løst av mange | Privatpersoner | Kan bygges raskt | Lavt (mettet gratis-marked) | Ingen | Lav-middels | **38,9** | Ikke prioriter — for mettet marked til differensiering |
| **B** | Subsea/oppdrett/inspeksjon | Reelt, dyrt problem for næringen | Oppdrettsselskap, inspeksjonsfirma | Idé, krever hardware | Høyt *hvis* det virker, men treg salgssyklus | **Sterkt** (mekaniske låser/dokking er patenterbart) | Høy (kapital, teknisk) | 37,3 | Skisser Vortex-Lock som papirpatentskisse, ikke bygg ennå |
| **A** | Vann/kommune/miljø-sensorer | Reelt (lekkasje koster 4 mrd kr/år, se Del 3) | Vannverk, forsikring, hytteeiere | Idé | Middels, men lang B2G-syklus | Middels | Middels-høy | 37,2 | Valider hos ett forsikringsselskap om B2C-vannsensor er interessant partnerkanal |
| **J** | Agentfarm/produksjonssystemer | Meta-problem (effektivisere Alexanders eget arbeid) | Alexander selv | Kan bygges nå | Ingen ekstern betaling — intern verktøy | Ingen | Lav | 36,5 | Bygg som støttesystem til flaggskipet, ikke som eget produkt (se Del 6) |
| **G** | Folk hjelper folk (Nabolaget/Flokk) | Reelt sosialt problem | Kommune, frivillighet | Idé | Svakt (avhengig av gratis/offentlig finansiering) | Ingen | Middels, avhengig av nettverkseffekt | 32,3 | Parkert — krever kritisk masse av brukere Alexander ikke har |
| **D** | Kulde/is/mekanikk (IsKlo, FrostLatch …) | Nisje, uklar kjøper | Ukjent | Idé | Svakt/ukjent | **Sterkt** (rene mekaniske oppfinnelser) | Middels | 29,5 | Behandle som ren IP-portefølje, ikke produktspor — se Del 7 |
| **C** | Arktisk drone/robotikk | Reelt, men konkurransetungt (forsvar/maritim allerede der) | SAR, beredskap, olje/gass | Idé, krever mye kapital | Ukjent | Middels | Høy | 26,8 | Ikke rør før flaggskipet har generert kapital |

**Dedup-funn:**
- E, F og J er egentlig **samme maskin i tre lag**: E = produktet, F = salgs-/researchmotoren, J = orkestreringslaget rundt F. De skal ikke bygges som tre separate prosjekter — F+J blir *verktøyet* Alexander bruker for å selge E (se Del 6).
- B og D er samme underliggende kompetanse (biomimetisk mekanikk/tetning/lås) i to miljøer (subsea vs. arktisk). Slå sammen til én IP-portefølje: "biomimetiske grensesnitt for ekstreme miljøer" — søk patent på mekanismen, ikke på anvendelsen.
- A, B og C deler mønsteret "billig sensor/inspeksjon for infrastruktur ingen har råd til å overvåke kontinuerlig i dag" — samme forretningslogikk, tre bransjer. Hold dem adskilt til flaggskipet finansierer neste trinn.
- G og H er stil/godhet uten betalingsmotor per nå (offentlig/gratis-avhengig). De bør ikke drepes permanent, men de kvalifiserer ikke til "bygg nå".

---

## DEL 3 — TOPP 5 VERDIMASKINER

### 1. PUSTEROM — institusjonell versjon (flaggskip, full detalj i Del 4)
**Verdi i én setning:** Et installasjonsfritt, hvit-etikett selvhjelpsverktøy kommuner og bedrifter kan sette navnet sitt på og få anonymisert trendrapport fra, uten å bygge noe selv.
Kunde: frisklivssentral/HR-avdeling. Smerte: må vise lavterskeltiltak, men har verken budsjett eller utviklerkapasitet. Dagens løsninger: dyre kurs (8 500–15 000 kr/dag, Agil Helse) eller generiske forbrukerapper uten rapportering tilbake til oppdragsgiver. Løsning: dette repoet + kommune-logo + anonymisert dashboard. Minimumsprototype: **finnes allerede**. Pris første leveranse: 5 000 kr pilotoppsett + 990 kr/mnd. Mulig månedlig inntekt ved 10 kunder: ~10 000 kr/mnd + engangsinntekt. Kill-kriterium: hvis 15 kalde henvendelser gir 0 møter innen 3 uker, pivoter budskapet fra "erstatning" til "gratis tillegg til eksisterende kurs".

### 2. BYRÅKRATI-RADAR (fra kategori F: ANBUDSRADAR/GEBYRSJEKK/GitHub Painkiller Radar-mønsteret)
**Verdi i én setning:** En AI-agent som overvåker én spesifikk, kjedelig, tilbakevendende datakilde (anbud, gebyrendringer, GitHub-issues) og varsler kunden når noe krever handling.
Kunde: liten kommuneavdeling eller konsulentfirma. Smerte: manuell sjekking av portaler ingen liker å gjøre. Dagens løsning: en ansatt sjekker manuelt, eller ingenting sjekkes. Løsning: agent + varsling på e-post/Slack. Minimumsprototype: 1–2 dager (skrap + filter + varsel). Pris: 500–2000 kr/mnd per overvåket kilde. Kill-kriterium: hvis datakilden ikke har stabil struktur, dropp — for skjørt til å vedlikeholde billig.

### 3. HYTTEVAKT — vannlekkasje-varsling (fra kategori A)
**Verdi i én setning:** Billig sensor + varsling som stopper en vannskade før den koster 70 000 kr.
Kunde: hytteeier direkte, eller forsikringsselskap som subsidierer utstyret. Smerte: vannskader er nå den dyreste skadetypen i norske hjem — ca. 4 mrd kr/år i erstatninger, 70 000 kr i snitt per skade (Finans Norge, 2025/2026). Dagens løsning: ingenting, eller dyre profesjonelle systemer. Løsning: enkel batteridrevet fuktsensor + mobilvarsel. Minimumsprototype: kjøp ferdig fuktsensor-modul, bygg varslings-app rundt den (ikke oppfinn sensoren på nytt). Pris: 100–100 000 kr avhenger av volum — realistisk start er reseller-avtale med ett forsikringsselskap, ikke eget salg. Kill-kriterium: hvis ingen forsikringsselskap svarer på henvendelse innen 30 dager, dette er en B2B2C-idé som krever en partner Alexander ikke har ennå — parkér til flaggskipet har generert kapital og kontakter.

### 4. MERD-MIK LITE — enkel inspeksjonstjeneste (fra kategori B, nedskalert)
**Verdi i én setning:** Ikke bygg ROV — selg inspeksjonsdata som tjeneste til mindre oppdrettsselskap som ikke har råd til full ROV-flåte.
Kunde: mindre lokalt oppdrettsselskap. Smerte: lovpålagt inspeksjon av merder/fortøyning er dyrt med eksterne dykkere/ROV-firma. Dagens løsning: innleid dykker/ROV per oppdrag. Løsning: start som formidler/lett utstyrsutleie, ikke som produsent. Minimumsprototype: ingen — dette er en tjeneste- og nettverksidé, ikke en byggeoppgave. Kill-kriterium: krever bransjekontakter Alexander må verifisere finnes før noe bygges — høyeste UKJENT-faktor i denne listen, lavest prioritet av de fem.

### 5. README-TO-SALES (fra kategori F, egen kundegruppe: utviklere)
**Verdi i én setning:** En agent som leser et GitHub-repo og skriver en salgsklar README + landingsside-tekst for indie-utviklere som kan bygge men ikke selge.
Kunde: solo-devs/indie SaaS-byggere. Smerte: teknisk godt produkt, elendig presentasjon = ingen konvertering. Dagens løsning: ingenting, eller dyre tekstforfattere. Løsning: engangs-agent-kjøring mot et repo, output er markdown. Minimumsprototype: kan bygges i dag med Claude Code selv — det er *nøyaktig den type oppgave dette verktøyet allerede gjør*. Pris: 500–1500 kr per repo, eller 199 kr/mnd abonnement. Kill-kriterium: hvis konvertering fra gratis prøve til betalt er under 5 % etter 20 forsøk, dette er et volumspill Alexander ikke har distribusjon til ennå.

**Prioritert rekkefølge for de fem:** 1 (Pusterom) bygges/selges nå. 2 og 5 er lavthengende frukt som kan kjøres **parallelt** av samme agent-verktøy uten å stjele fokus (se Del 6 — de er i praksis samme kodebase, ulik kunde). 3 og 4 er reelle men avhenger av partnere Alexander ikke har bekreftet ennå — research, ikke bygg.

---

## DEL 4 — FLAGGSKIPET: PUSTEROM

### Beslutning: **BYGG NÅ** (i betydningen: selg nå — bygging er 90 % ferdig)

Må være sant for at valget lykkes:
1. Minst én kommune/bedrift aksepterer "digitalt supplement" uten klinisk forankring som verdifullt nok til å betale for rapportering, ikke bare innhold.
2. Alexander orker salgsarbeidet (kaldt utsalg til institusjoner) — dette er ikke et bygg-problem lenger, det er et **møte-booking-problem**.
3. Produktet holder seg strengt innenfor ikke-diagnostisk, brukerkontrollert selvhjelp (regel 19) — enhver bevegelse mot "vi oppdager krise" eller "vi varsler noen om deg" dreper tilliten og utløser helseregulatorisk kompleksitet unødvendig.

### Produktdefinisjon
- **Navn:** Pusterom (behold — enkelt, norsk, ufarlig, søkbart)
- **Undertittel:** Lavterskel selvhjelp kommunen/bedriften kan sette sitt navn på
- **Problem:** Institusjoner må vise lavterskeltiltak for psykisk helse/stressmestring, men mangler budsjett, utviklerkapasitet og en enkel måte å vise effekt til ledelse/politikere
- **Bruker:** Den enkelte ansatte/innbygger som sjekker inn
- **Kjøper:** Frisklivskoordinator, HR/HMS-ansvarlig, folkehelsekoordinator
- **Job-to-be-done (kjøper):** "Jeg trenger et konkret, billig, presentabelt lavterskeltiltak jeg kan vise til i årsrapport/sykefraværsstatistikk"
- **Job-to-be-done (bruker):** "Jeg trenger 2 minutter for å roe meg ned uten å måtte forklare meg til noen"
- **Hvorfor bedre enn dagens løsning:** Null installasjon (deles som lenke/QR), null app-store-friksjon, hvit-etikett med organisasjonens navn/logo, anonymisert aggregert trend tilbake til kjøper — ingen av de identifiserte konkurrentene (Mindfit, Medio, Pusteankeret, iBreathe) tilbyr organisasjonsrapportering eller white-label i dag (basert på produktbeskrivelsene funnet i søk — se kilder).
- **Hva produktet aldri skal gjøre:** Diagnostisere, love terapeutisk effekt, lagre identifiserbare helsedata sentralt, varsle tredjepart om en brukers tilstand, eller på noen måte fremstå som erstatning for helsehjelp. All lagring skal forbli lokal (localStorage) med mindre bruker eksplisitt samtykker til noe annet.

### Teknisk konsept
- **Arkitektur i dag (VERIFISERT, lest fra kode):** Én statisk `index.html`, ingen backend, ingen build-steg. Fire sider styrt av CSS `.active`-klasse og en global JS-switcher. Data i `localStorage` under nøklene `checkins` og `doneActions`. Pustesirkelen er en CSS-transform-animasjon drevet av `setTimeout`-kjede (4s inn / 2s hold / 6s ut).
- **Mangler for institusjonelt salg (det som faktisk må bygges):**
  1. Hvit-etikett-lag: query-param eller subdomene som bytter logo/navn/farge (`?org=bergen-kommune`)
  2. Anonymisert aggregering: en lett backend (t.d. Cloudflare Worker + KV, eller Supabase) som mottar kun `{orgId, moodValue, timestamp}` — **ingen fritekst, ingen identifikator** — og viser kjøper et trenddiagram
  3. PWA-manifest + service worker for "legg til på hjemskjerm" uten app-store
  4. Enkel adminvisning (passordbeskyttet side) for kjøper: ukentlig trend + antall unike sesjoner
- **Sikkerhet/personvern:** Ingen persondata forlater enheten med mindre eksplisitt aggregert og anonymisert. Dette er selve salgsargumentet mot institusjonelle kjøpere med GDPR-angst — hold det slik.
- **Feilmåter:** localStorage tømmes ved nettleser-rydding (bruker mister historikk — akseptabelt, kommuniser det); aggregert backend nede = appen fungerer likevel lokalt (grasiøs degradering, ikke kritisk avhengighet).

### Prototypeplan
1. **Papir/mockup (1 dag):** Allerede overgått — produktet finnes. Bruk dagen til å lage 3 hvit-etikett-varianter (ulik logo/farge) som salgsdemo.
2. **Fungerende MVP (48 timer):** Legg til `?org=`-parameter for merkevarebytte + enkel anonymisert teller (kan være så enkelt som en Google Form/Sheet i bakgrunnen for v1) + PWA-manifest. Kostnad: 0 kr (Alexanders egen tid). Suksesskriterium: én kommuneansatt kan åpne lenken på mobil, sjekke inn, og Alexander kan vise dem et tellepunkt uten å ha sett brukerens data.
3. **Feltprototype (30 dager):** Ekte aggregert backend (Cloudflare Worker gratis-tier), admin-dashboard, ett betalende pilotkunde live i minst 2 uker. Kostnad: 0–200 kr/mnd (gratis-tier hosting). Måler: faktisk ukentlig bruk hos pilotkunden, ikke bare "solgt".

### Enkel økonomi (BEREGNET, konservativt/realistisk/optimistisk)
| | Konservativt | Realistisk | Optimistisk |
|---|---|---|---|
| Pilotpris (engang) | 3 000 kr | 5 000 kr | 10 000 kr |
| Månedlig lisens | 490 kr | 990 kr | 1 990 kr |
| Kunder etter 6 mnd | 2 | 6 | 15 |
| Månedlig inntekt etter 6 mnd | 980 kr | 5 940 kr | 29 850 kr |
| Driftskostnad/mnd | 0 kr | 0–200 kr | 500 kr |
| Alexanders tidsbruk/kunde (support) | 1 t/mnd | 0,5 t/mnd | 0,25 t/mnd |

Dette blir aldri et enmannsselskap som lever av 15 kunder à 990 kr — det er beviset (traction) som åpner større avtaler (fylkeskommune, bedriftshelse-kjeder som StoppStress/Agil Helse som partnerkanal, ikke konkurrent).

---

## DEL 5 — SALGSPAKKE (klar til bruk)

**Én setning:** Pusterom gir kommunen/bedriften din et ferdig, GDPR-trygt lavterskeltiltak for stress og nedstemthet — ingen app å laste ned, ingen data som lagres sentralt, og en enkel trendrapport dere faktisk kan vise frem.

**30-sekunders pitch:** "Dere skal vise lavterskeltiltak for psykisk helse, men har verken budsjett eller utviklere til å bygge noe. Pusterom er en ferdig, nettbasert pusterom-app ansatte/innbyggere åpner med én lenke — ingen app store, ingen pålogging. Dere får logo på siden og en anonym oversikt over hvor mange som bruker den, uten å se noens personlige data. Pilot koster 5000 kroner, oppe på under en uke."

**2-minutters pitch:** (utvidelse av 30-sek) "Dagens digitale lavterskeltilbud er enten dyre kurs à 8–15 000 kroner dagen, eller generiske forbrukerapper dere ikke kan sette navn på og ikke får noe rapportering fra. Pusterom løser det motsatte problemet: det er ikke terapi, det er infrastruktur. Fire enkle funksjoner — sjekk inn humør, en styrt pusteøvelse, små konkrete grep, og en personlig historikk for brukeren. Alt lagres lokalt på brukerens enhet. Det eneste dere som organisasjon ser, er et anonymt aggregert tall: hvor mange sesjoner denne uken. Vi setter opp en pilot med deres logo på under 48 timer, til fast pris. Hvis det ikke gir verdi etter 4 uker, betaler dere ikke for videre lisens."

**Én-sides salgstekst:** se vedlegg-struktur i landingsside under (Del 5, pkt. 14).

**Første e-post (til frisklivskoordinator/HMS-ansvarlig):**
> Emne: Lavterskel stressverktøy — ferdig, ikke et prosjekt
>
> Hei [navn],
>
> Jeg bygger Pusterom — en enkel nettbasert app for pusteøvelser og mental sjekk-inn, laget for å settes opp med [kommune/bedrift]s logo på under 48 timer. Ingen app å laste ned, ingen personopplysninger lagres sentralt.
>
> Målet er ikke å erstatte noe dere allerede gjør, men å gi dere et konkret, billig og lett dokumenterbart lavterskeltiltak dere kan vise til i rapportering.
>
> Har dere 15 minutter i uke [X] til en kort demo? Jeg viser dere live på mobilen deres.
>
> Mvh Alexander

**LinkedIn-melding (kortere variant):**
> Hei [navn] — jobber du med lavterskel psykisk helse/HMS hos [org]? Jeg har bygget et ferdig, GDPR-enkelt pusterom-verktøy dere kan sette navnet deres på i løpet av et par dager. Åpen for en 15-min demo?

**Telefonskript:**
> "Hei, det er Alexander. Jeg tar en rask telefon fordi jeg har bygget noe konkret jeg tror er relevant for dere — et lavterskel pusterom/sjekk-inn-verktøy for ansatte/innbyggere, ferdig til bruk, ingen app å installere. Jeg lurer på om det er riktig person jeg snakker med, eller om du kan sette meg i kontakt med den som jobber med lavterskeltiltak/HMS hos dere? [vent på svar] — Fint, kan jeg sende en lenke du kan teste selv på 2 minutter, så tar vi en kort prat etterpå om det er relevant?"

**Pilottilbud:** 5 000 kr engangs (hvit-etikett-oppsett + 4 ukers pilot), deretter valgfritt 990 kr/mnd for fortsatt lisens + trenddashboard. Ingen bindingstid.

**Prisstruktur (tre nivåer):**
- **Pilot** — 5 000 kr engang, 4 uker, egen logo, ingen dashboard
- **Standard** — 990 kr/mnd, hvit-etikett + anonymisert trenddashboard
- **Flerbruker/fylkeskommune** — 2 990 kr/mnd, flere avdelinger/underenheter, kvartalsrapport PDF

**Innvendinger og svar:**
- *"Vi har allerede [Mindfit/Medio]"* → "De er gode forbrukerapper — Pusterom er ikke det. Det er infrastruktur med deres logo og rapportering tilbake, ikke enda en app de ansatte må laste ned selv."
- *"Hvordan vet vi dataene er trygge?"* → "De forlater ikke enheten. Vi ser aldri hvem som skrev hva — bare et anonymt tellepunkt. Det kan vises i kildekoden."
- *"Har dere klinisk/psykologfaglig forankring?"* → "Nei, og det skal vi ikke late som. Dette er et supplement til eksisterende lavterskeltilbud, ikke en erstatning — akkurat slik Helsedirektoratet anbefaler digitale verktøy brukt."
- *"Vi har ikke budsjett"* → "Piloten koster mindre enn ett halvdagskurs for én ansatt. Vi kan starte med to avdelinger."

**FAQ (kort):** Krever ikke IT-avdeling (statisk nettside). Fungerer på alle mobiler. Ingen pålogging for sluttbruker. Kan sies opp når som helst. Ingen personopplysninger sendes til tredjepart.

**Demo-plan:** Vis live på egen mobil → sjekk inn → pust-øvelse → vis adminvisning med anonymt telletall → 5 minutter, ikke lenger.

**Case-study-mal (fylles ut etter første pilot):** "[Org] testet Pusterom i 4 uker med [X] ansatte. [Y] sesjoner registrert. Ledelsens tilbakemelding: [sitat]. Videre bruk: [ja/nei/utvidet]."

**Landingsside-struktur:** Hero (én setning + CTA "Book demo") → Problem (dyre kurs vs. generiske apper) → Løsning (skjermbilder av appen) → Personvern (eksplisitt seksjon — dette er salgsargumentet) → Pris (tre nivåer) → CTA.

**10 hooks/innlegg (LinkedIn/X, rå og direkte, ikke markedsføringsvada):**
1. "Vannskader koster Norge 4 milliarder i året. Hvor mye koster det at ingen sjekker inn med seg selv?"
2. "Jeg bygde et pusterom på én kveld. Det tok lengre tid å skrive denne posten."
3. "25 % av norske kommuner har ikke lavterskeltilbud for psykisk helse. Det er ikke et budsjettproblem alene — det er et 'ingen har bygget det enkle ennå'-problem."
4. "Ikke enda en mental helse-app. En ting kommunen din kan sette sitt eget navn på."
5. "Data forlater aldri telefonen. Det er hele produktet."
6. "8 500 kroner for et halvdagskurs i stressmestring. Piloten min koster mindre og varer fire uker."
7. "Bygget i HTML og JavaScript. Null avhengigheter. Null app store. Det er poenget."
8. "Hva om lavterskeltiltak ikke trengte en anbudsrunde for å komme i gang?"
9. "Jeg spurte ikke om lov til å bygge dette enkelt. Jeg spør om lov til å selge det sånn."
10. "Bergen-bygget. Ingen skyer, ingen sky-buzzword. Bare et sted å puste."

Kilder: [Finans Norge – Skadestatistikken 2025](https://www.finansnorge.no/artikler/2026/02/skadestatistikken-2025-farre-skader-når-uhellet-er-ute/), [Helsedirektoratet](https://www.helsedirektoratet.no/nyheter/mange-lavterskeltilbud-innen-psykisk-helse--og-rus-i-kommunene), [Agil Helse kurspriser](https://agilhelse.no/kurs-og-undervisning/stressmestring-psykisk-helse/)

---

## DEL 6 — KUNDE OG SALG (flaggskipet)

**Prioriterte kundetyper (i rekkefølge):** frisklivssentral/kommune (Bergen-nær, kort reisevei til demo) → bedriftshelsetjeneste som partnerkanal (selg gjennom dem, ikke mot dem) → mellomstore bedrifter med egen HR/HMS-funksjon.

**20 kundeemner — realistisk, ikke fabrikkert:** Jeg har **ikke** verifiserte navn/e-poster til enkeltpersoner (det ville vært oppspinn, mot regel 8). Det jeg *kan* gi er en presis liste over organisasjonstyper og roller å kontakte, sortert etter nærhet til Alexander:

1–8: Frisklivssentraler i Vestland (Bergen kommune, Askøy, Øygarden, Alver, Osterøy, Bjørnafjorden, Vaksdal, Fjell/Sotra-området) — rolle: *frisklivskoordinator* eller *folkehelsekoordinator*, finnes på hver kommunes nettside under "helse og omsorg".
9–12: Bedriftshelsetjenester som kan bli **partnerkanal** (de har allerede kundene, Alexander leverer verktøyet under deres merke): A-Med, Mediteam, Norsk Arbeidshelse, Medi3 — funnet via søk, kontakt daglig leder/salgsansvarlig.
13–16: Mellomstore Bergens-bedrifter med synlig HMS-fokus (bygg/industri/offshore-relatert, hvor sykefravær er en kjent kostnad) — rolle: HR/HMS-ansvarlig.
17–20: Videregående skoler og høyskoler i Bergen (elev-/studenttjeneste), **med forbehold**: helseprodukter rettet mot mindreårige krever ekstra varsomhet — vurder om dette segmentet i det hele tatt skal kontaktes før flaggskipet har bevist seg på voksne, av hensyn til regel 19/20.

**Hvordan få første møte:** E-post (Del 5) → oppfølging på LinkedIn etter 4 dager hvis ingen respons → telefon i uke 2. Mål: 1 bekreftet demo per 8–10 henvendelser (realistisk B2G-konverteringsrate for kald digital henvendelse).

**Plan for første betalte pilot:** Send 8 e-poster uke 1, 8 til uke 2 (frisklivssentraler + bedriftshelse-partnere parallelt). Book minst 2 demoer innen 3 uker. Konverter én til pilotavtale (5 000 kr) innen dag 30. Hvis 0 demoer etter 16 henvendelser: budskapet er feil, ikke kanalen — pivoter til "gratis 4-ukers pilot uten betaling" for å få inn referansecase først.

---

## DEL 7 — PATENT OG WHITESPACE

**Vurdering for flaggskipet (Pusterom):** Dette er en UX/systemkombinasjon (installasjonsfri hvit-etikett + anonymisert aggregering), ikke en teknisk oppfinnelse. **Ikke patenterbart** på noen forsvarlig måte — mekanismen (pust-timing, mood-skala, localStorage) er velkjent og brukt av alle konkurrentene som ble funnet i søk. Riktig IP-strategi: **ingen patent**. Beskytt heller gjennom:
- Varemerke på navnet "Pusterom" (billig, raskt, verdt det hvis det skal selges som merkevare til flere kommuner)
- Forretningshemmelighet på selve salgs-/onboardingsprosessen mot kommuner (den er det faktiske forspranget — konkurrentene har ikke bygget den kanalen)
- Hastighet som forsvar: første til å eie relasjonen til 10 norske frisklivssentraler er vanskelig å kopiere, uavhengig av kode

**For kategori D/B (biomimetisk mekanikk — IsKlo, FrostLatch, Vortex-Lock, RailClaw):** Dette er det eneste sporet i hele korpuset med reelt patentpotensial, fordi det er konkrete mekaniske løsninger (lås/tetning/kutter-mekanismer), ikke programvare eller UX. Jeg har **ikke** gjort et faktisk prior-art-søk i patentdatabaser i denne økten (det krever spesifikke tekniske tegninger/krav jeg ikke har for disse konseptene ennå) — dette er merket UKJENT og krever et eget søk før noe offentliggjøres. **Ikke publiser tekniske detaljer om disse mekanismene offentlig (blogg, X, GitHub) før en patentrådgiver har sett på nyhetsgrad.** Dette er den ene tydelige "ikke offentliggjør ennå"-anbefalingen fra hele analysen.

**Anbefaling:** Ikke bruk tid/penger på patentadvokat for Pusterom. Bruk heller de pengene på patentrådgiver for D/B-porteføljen **når** den blir aktuell (ikke nå — den er ikke i "bygg nå"-sporet).

---

## DEL 8 — KONKURRENTKILL-RAPPORT (flaggskipet)

**Direkte konkurrenter:** Mindfit (dagbok, pusteøvelser, CBT-basert, laget med psykologspesialist), Medio (meditasjon/mindfulness, laget av psykolog), Pusteankeret (oppmerksomhetstrening), iBreathe. Alle er **B2C forbrukerapper** — ingen av dem (basert på det som er synlig i søkeresultatene) selger hvit-etikett/institusjonell distribusjon med rapportering.

**Indirekte konkurrenter:** Bedriftshelsetjenester som selger kurs (Agil Helse, A-Med, Terapivakten) — dyrere, menneskedrevet, ikke skalerbart digitalt supplement. Kommunale FACT-team og "Rask psykisk helsehjelp" — dette er *ikke* konkurrenter, det er potensielle **henvisningspartnere** (Pusterom skal aldri late som det erstatter dem).

**Kundens nåværende workaround:** Ingenting (den ansatte/innbyggeren gjør ingenting), eller en gratis generisk app fra App Store uten organisatorisk forankring.

**Gap ingen løser godt:** Hvit-etikett + anonymisert institusjonell rapportering til lav pris. Det er teknisk trivielt å bygge (Alexander har det 90 % ferdig), men ingen av de identifiserte aktørene har bygget salgskanalen mot kommune/bedrift på denne måten.

**Lett å kopiere:** Selve UI-en (pustesirkel, mood-scale) — triviell kode, kan kopieres på en ettermiddag av hvem som helst.
**Ekte forsprang:** Relasjonene til de første 10 institusjonelle kundene, og merkevarenavnet "Pusterom" hvis det festes tidlig.

**Konklusjon: GULT.** Mulig, men krever reelt salgsarbeid (ikke bare bygging) — Alexander må faktisk ringe/møte kommuner. Ingen teknisk risiko, ren utførelsesrisiko.

---

## DEL 9 — SOFTWARE OG AGENTSYSTEM

Formål: la agenter gjøre research, salgsforberedelse og dokumentasjon for Pusterom-salget (kategori F+J fra Del 2, brukt som verktøy — ikke som eget produkt ennå).

**Hovedagent (orkestrator)**
- Oppdrag: Koordinere de øvrige agentene mot ett mål: neste betalte pilot
- Input: ukentlig status fra hver underagent
- Output: prioritert ukeliste, ikke rapport-i-rapport
- Verktøy: alle under-agenter
- Avgrensning: tar ingen research- eller salgsjobber selv
- Stopper når: ukentlig sjekk er levert
- Skal aldri: love ting til kunder på Alexanders vegne

**Research-agent**
- Oppdrag: finne konkrete, navngitte kommune-/bedriftskontakter (offentlig tilgjengelig informasjon, f.eks. kommunale nettsider)
- Output: liste med org, rolle, offentlig kontaktvei — **aldri** gjettede e-postadresser eller privatpersoner uten offentlig kilde
- Skal aldri: fabrikkere kontaktinfo (dette er den viktigste stoppregelen i hele systemet)

**Ingeniøragent**
- Oppdrag: bygge hvit-etikett-parameter, PWA-manifest, anonymisert telling
- Kvalitetskrav: ingen persondata forlater enheten uten eksplisitt aggregering
- Skal aldri: legge til sporing, identifikatorer eller tredjepartsscript "for analytics" uten eksplisitt instruks

**IP-agent**
- Oppdrag: flagge om noe som skal publiseres (kode, tekst, bilde) utilsiktet avslører en D/B-mekanisme før patentvurdering
- Skal aldri: konkludere selv om patenterbarhet — kun flagge til menneskelig patentrådgiver

**Kundeagent**
- Oppdrag: holde oversikt over hvem som er kontaktet, når, og status
- Output: enkel state-tabell (se format under)

**Salgsagent**
- Oppdrag: tilpasse e-post/pitch-tekstene i Del 5 til spesifikk mottaker, basert på offentlig info om organisasjonen
- Skal aldri: sende noe uten at Alexander har godkjent teksten først

**Kritikeragent**
- Oppdrag: lese alt annet agentene produserer og lete etter overdrevne påstander, uverifiserte tall, eller brudd på regel 19/20 (helsepåstander, personvern)
- Stopper aldri å være skeptisk — dette er den eneste agenten med permanent "block"-fullmakt

**Dokumentasjons-, test- og økonomiagent:** slås sammen til én lettvekts-funksjon i orkestratoren for dette prosjektets størrelse — å sette opp fem separate agenter for en soloutvikler med ett flaggskip er overengineering (regel: ikke bygg for hypotetisk fremtidig skala).

**State-format (enkelt, i repoet, f.eks. `sales-state.json`):**
```json
{
  "org": "Bergen kommune - Frisklivssentralen",
  "role": "Frisklivskoordinator",
  "kontaktkanal": "offentlig e-post fra kommunens nettside",
  "status": "e-post sendt 2026-08-13",
  "neste_steg": "oppfølging LinkedIn 2026-08-17",
  "notater": ""
}
```

**Kvalitetsport (kjøres av kritiker-agenten før noe sendes ut):** Er hver kundekontakt verifisert offentlig, ikke fabrikkert? Er hver helsepåstand ikke-diagnostisk? Er hvert tall i salgsteksten sporbart til en kilde eller tydelig merket antakelse? Hvis nei på noen av disse: blokker, ikke send.

---

## DEL 10 — 48-TIMERS PRODUKSJONSPLAN

**Time 0–4:** Bygg `?org=`-parameter (logo/navn/farge-bytte) i `index.html`. Leveranse: fungerende demo-URL med to ulike "merker". Akseptanse: kan vises på mobil uten feil.

**Time 4–8:** Legg til PWA-manifest + enkel "legg til på hjemskjerm"-prompt. Akseptanse: appen kan installeres på en Android/iPhone-testtelefon.

**Time 8–12:** Sett opp anonymisert telling (enkleste versjon: en Google Sheet via Apps Script webhook, eller Cloudflare Worker om tid tillater). Akseptanse: en sjekk-inn i demo-appen øker en telleverdi Alexander kan se, uten at han ser innholdet.

**Time 12–16:** Skriv og send de første 8 e-postene (Del 5-mal, tilpasset til reelle, offentlig funne frisklivssentraler i Vestland). Beslutning: hvis Alexander ikke finner 8 reelle offentlige kontakter på denne tiden, bruk resten av tiden på bedriftshelse-partnerkanalen i stedet.

**Time 16–24:** Publiser 3 av de 10 hookene (Del 5) på LinkedIn/X for å bygge synlighet parallelt med kaldt utsalg. Mål: ikke virality, men at én kommuneansatt googler navnet og finner noe seriøst.

**Time 24–32:** Bygg admin-visningen (enkel passordbeskyttet side som viser telleverdien). Akseptanse: Alexander kan vise dette i en demo uten å dele kildekode-tilgang.

**Time 32–40:** Send neste 8 e-poster (bedriftshelse-partnerkanal + resten av frisklivssentralene). Følg opp de første 8 fra time 12–16 hvis 4 dager har gått.

**Time 40–48:** Evaluer: 0 svar → budskapet er galt, skriv om åpningslinjen og prøv en helt annen vinkel (f.eks. "gratis pilot" i stedet for "betalt pilot") for neste runde. ≥1 svar → book demo umiddelbart, forbered live-visning.

**Drep/endre-punkt:** Hvis 16 henvendelser (begge kanaler) gir null respons innen 30 dager totalt (ikke bare 48 timer), er ikke produktet problemet — gå til gratis-pilot-strategien for å få referansecase, betaling kommer etterpå.

---

## DEL 11 — KILL REPORT

**Tekniske blindsoner:** localStorage-data er ikke reell "historikk" hvis brukeren bytter enhet eller rydder nettleseren — ikke selg dette som et langsiktig sporingsverktøy, det er det ikke.

**Regulatoriske risikoer:** Så lenge produktet forblir ikke-diagnostisk og lokalt lagret, er GDPR-eksponeringen lav. Risikoen oppstår **hvis** noen (Alexander selv, eller en kunde som ber om det) legger til sentral lagring av identifiserbare mood-data — det gjør Pusterom til et helsedataprodukt over natten, med helt andre krav. **Hold linjen hardt her.**

**Økonomiske feil å unngå:** Ikke anta at 990 kr/mnd × mange kommuner skalerer lineært — B2G-salg har lange sykluser og krever trolig et referansecase før neste 5 kunder kommer. Ikke bygg en runway-plan som forutsetter rask vekst i måned 1–3.

**Falske betalingsantakelser:** Jeg har **ikke** verifisert at noen konkret kommune faktisk vil betale — dette er den største ukjente i hele rapporten (markert tydelig i Del 1). Første 48 timer skal teste nøyaktig dette, ikke anta det.

**Avhengighet av andre:** Bedriftshelse-partnerkanalen krever at et eksternt selskap (A-Med, Mediteam, osv.) vil videreselge — uverifisert, lavere prioritet enn direkte kommunesalg.

**Hvorfor kunden kan si nei:** "Vi har ikke budsjett", "vi har allerede noe", "vi trenger ledelsesgodkjenning" — standard B2G-friksjon. Svar finnes i Del 5.

**Hvorfor Alexander kan miste fokus:** Korpuset inneholder 40+ konsepter. Risikoen er ikke mangel på ideer, det er **for mange gode nok ideer** som stjeler tid fra å ringe 8 kommuner denne uken. Disiplin, ikke kreativitet, er flaskehalsen nå.

**Hva som blir for stort for tidlig:** Ikke bygg admin-dashboard med grafer, filtrering og eksport før én kunde faktisk har bedt om det. Enkleste mulige telleverdi er nok for pilot nummer én.

**Hva som bør kuttes helt fra "bygg nå"-fasen:** Alt hardware (kategori A–D), all agentbygging utover det som direkte støtter salg av Pusterom (kategori F/J), og B2C-forbrukerlansering av Pusterom (rødt hav, tapt kamp mot Mindfit/Medio).

**Forbedret versjon av planen:** Fokuser 100 % av de neste 30 dagene på å få ÉN betalt pilot, ikke ti. Alt annet i korpuset venter til den ene piloten enten bekrefter modellen eller dreper den.

---

## DEL 12 — NESTE HANDLING

**Gjør dette først, i dag:** Legg til `?org=`-parameteren i `index.html` (whitelabel-bytte av navn/logo/farge — ca. 1–2 timers arbeid gitt eksisterende kodebase), og send den første av de åtte e-postene i Del 5 til én frisviklssentral i Bergen kommune. Ikke vent på et perfekt produkt — produktet er allerede godt nok til å teste om noen betaler for det.

---

**PASS**
