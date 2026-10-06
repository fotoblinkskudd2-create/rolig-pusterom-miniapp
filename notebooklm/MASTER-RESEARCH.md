# MASTER RESEARCH — alt jeg bygger, samlet på ett sted

**Til Google NotebookLM** · samlet 06.10.2026 · Europe/Oslo
**Grunnlag:** 64 grener i `rolig-pusterom-miniapp`, 7 andre repoer (`gull-system`, `agentiske-kunstimperium-2.0`, `etterliv-siste-ord`, `arbeidsokt`, `labben`, `grok-bot-`, + listen over alle 29), og titlene på ~50 Claude-økter fra 30.08 til 06.10.2026.
**Merking:** VERIFISERT (står i repo) · BEREGNET (min telling) · ANTAKELSE · UKJENT. Samme skille som `gull-system/SYSTEM.md` krever.

---

## 0. Inngangen

Klokka er 11-noe en tirsdag i oktober, og jeg teller grener.

Sekstifire. Sekstifire grener på et repo som på `main` fortsatt er det samme som 29. august: to HTML-filer, en pustesirkel som går 4-2-6, og en `HULL.md` som lover ting koden aldri fikk. Imens har jeg bygget en Kubernetes-utrulling for en app som ingen bruker. Fem intimprodukter med BOM og Gantt. En lov for hva som teller som gull. Tre hundre sangtekster til Suno. En bok om sparing skrevet av en med gjeld. Ti iPhone-apper. Ti til, samme dag, nesten de samme. Tretti til i kø, én ferdig.

Det her er ikke en idébank. Det er et åsted. Les det sånn.

(Merknad for NotebookLM: alt under er strukturert. Denne inngangen er stemning. Tallene står i seksjon 2 og 9.)

---

## 1. Kortversjonen (les dette hvis du leser ingenting annet)

1. **Én kjerne går igjen i alt:** lokal-først, ingen konto, ingen sky, ingen streak-skam, bygget på 48 timer av én person. Det er ikke en preferanse lenger. Det er en signatur. Sprinten 04.10 kalte den **RÅ RO**.
2. **`main` har stått stille i 38 dager.** Siste commit på `main` er 29.08.2026. Alt etterpå ligger på grener som aldri er flettet. VERIFISERT.
3. **Samme jobb er gjort mange ganger.** Nav-feilen i `switchPage` er rettet på minst 8 grener. PWA er bygget på minst 7. «Ti lokale iPhone-apper i React» ble bygget to ganger samme dag (`vibe10/` og `verksted/`). BEREGNET fra commit-meldinger.
4. **Dokumentasjonen løper fra koden.** 1.1 sa at nav var fikset og eksport fantes. Det stemte ikke i `index.html`. Sprinten sa det rett ut: *«your writing about the product moves faster than the product.»* Grenen `project-value-maximization` (1.2) er den eneste som lukker gapet med 30 tester. VERIFISERT.
5. **Null markedssignal.** `LOGG.md`: «Markedssignal: ingen (ingen brukere har prøvd den)». `ARVEBOKSEN`: «Zero paying customers». Ingen ting i hele porteføljen har en betalende kunde. VERIFISERT.
6. **De tre sterkeste sporene** (min vurdering, ANTAKELSE): (a) Rolig/Pusterom som lokal-først mental helse-verktøy, særlig rettet mot **gutter** og **penger/gjeld-stress**; (b) **SISTE ORD / Etterliv** som har en ferdig betalingstest (2 900 kr) og klare stoppkriterier; (c) **lokale iPhone-PWA-er** for gjeld, abonnement og impulskjøp, fordi smerten er din egen og verktøyene er nesten ferdige.

---

## 2. Kart over alt (klynger)

### A. ROLIG / PUSTEROM — flaggskipet
| Del | Hva | Hvor | Status |
|---|---|---|---|
| Rolig 1.1 | 4 sider: Innsjekk, Pusterom (4-2-6), Små grep, Historikk. `localStorage`. | `main` | Kjører. Nav-bug og manglende eksport i koden. |
| Isolation Mirror | Note/bilde → privat protokoll + Labben-prompt | `main` | Prototype |
| 1.2 | Gjør 1.1 sant i koden. PWA, eksport/backup/gjenoppretting, slett-alt, hjelpetelefoner som `tel:`, 30 tester grønne i Chromium | `claude/project-value-maximization-e7rdl9`, `claude/new-session-gp7heo` | **Beste kandidat til å flettes først.** Ikke testet på ekte iPhone. |
| 2.0 Systemrommet + K8s | «Hvem er her», lapper mellom deler, kjøpsbrems 48 t, design-tokens, mørk modus, Docker/nginx med CSP, restricted PSS, null egress | `claude/pr-token-k8s-10pzyq` | Bygget. Overdimensjonert for null brukere. |
| Samtidig + Mørkerommet | Alle puster i takt via `Date.now() % 12000`. Bilde fremkalles bare på utpust. | `claude/20-sterke-konsepter-jndyat` | Bygget. 18 konsepter til i `KONSEPTER.md`. |
| Speil | Isolation Mirror flettet inn som side | `claude/daily-ai-tasks-iftdiw` | Bygget |
| Innsikt / Bygg 1 | Streak, humørkurve i ren SVG, uke-mot-uke | `claude/byggesystem-development-bd56kh` | Bygget |
| Pusterom CLI | Samme app i terminal, Python stdlib | `claude/cli-system-builder-5ycx32` | Bygget |
| Rolig 2.0 / produktplan | Isolation Mirror som hovedprodukt for ensomme voksne | `claude/product-solution-development-8kr2e8` | Plan |
| Zip-strategi | Markedsstrategi under navnet Pusterom | `claude/zip-product-market-strategy-a4uf85` | Plan |
| Verdimotor | Selg B2B/B2G (kommune, bedriftshelse). Pilot 15–40k kr på 30 dager. | `claude/alexander-value-engine-vfaop7` | Plan, ikke testet |
| Forebygging for gutter | Lokal-først, «verktøy, ikke hjelp», Kompis-modus, ungdomsråd + fagråd som beslutningsporter | `claude/youth-suicide-prevention-architecture-85rya6` | Arkitektur |
| Psykologiet Vibe Coding | Fritekst → forklarbare «Vibe Codes». Krise-recall = 1,0 som hard CI-grense. FastAPI + pgvector, 14 tester | `claude/psychology-vibe-coding-system-qi5q2r` | MVP-skisse med kode |
| Sprint RÅ RO | Topp 3: **Inkasso-pust**, **To Rom (Pusterom 2.0)**, **Fem pust i minuttet + Pustemerket**. 90-dagersplan. | `claude/creative-innovation-sprint-qnst9h` | Plan |
| Rolig Objects / AERA | Ring, lampe, stein, pute, boks. AERA = biosensor-ring som guider pust | `claude/five-product-concepts-development-k5ntsk`, `claude/revolutionary-product-concept-k11cla` | Konsept |
| Dupliserte bugfix/PWA-grener | `analyse-forbedring`, `autonomous-creative-force`, `badus-ai-mega-prompts`, `bygg-total`, `creative-system-dev`, `system-analysis-value`, `system-cleanup`, `system-optimization-expansion`, `webreact-system-review` | — | Samme arbeid, mange ganger |

### B. ARV OG MINNE
| Del | Hva | Status |
|---|---|---|
| **SISTE ORD** (`etterliv-siste-ord` + `claude/etterliv-produktlab-1nsalg`) | Tre brev fra dine egne svar. Ingen KI som finner opp stemme. SHA-256-låst godkjenning. 990 kr selvbetjent / 2 900 kr assistert. 23 tester. | **Klar for betalingstest.** Stopp hvis median > 4 t eller kunden ikke vil eie teksten. |
| ARVEBOKSEN | Stemmearkiv som blir familiens arv. 14-dagers kommersiell og regulatorisk sprint (MDR, GDPR, arverett). | Plan. «Six prompt engines. Zero paying customers.» |
| Family Memory AI | RAG over familiearkiv, ingen finjustering, kilder er uforanderlige | Teknisk blåkopi |
| Rekkefølge (fra Etterliv) | SISTE ORD → HVERDAGSARV → (senere) ETTERLÅS, EKKO | Bestemt |

### C. LOKALE iPHONE-APPER (PWA, ingen konto)
| Del | Apper | Status |
|---|---|---|
| Vibe10 (`claude/vibe-code-ios-web-react-fkfsrf`) | Prøvefella, Gjeldsradar, Kjøpebrems, Startknappen, Doombrems, Garantiboksen, Spleiselapp, Kjøleskapet, Minnehull, Inkasso-skjold | Bygget, med RESEARCH.md og PROMPTS.md |
| Verksted (`claude/vibe-code-ios-web-ideas-bpnyyv`) | Abo-Liket, Dump, Kvitt, Splitt, Doom-Brems, Strømvakt, Kjøpekarantene, Gjeld-Snøball, Brunstøy, Systemtavla | Bygget samme dag. **Stor overlapp med Vibe10** (abonnement, gjeld, impulskjøp, doomscroll, kvitteringer, spleis, støy, plurale systemer). |
| 30 apper (`claude/30-apper`) | FocusDump … UtgivelsesPlan | 1 av 30 WEB_VERIFISERT, 29 IKKE_STARTET |
| VIBE20 (`agentiske-kunstimperium-2.0/vibe20`) | 20 apper i én Expo-binær | Bygget |
| Fiksa | Reparasjons- og feilsøkingsapp (Expo) | Bygget i to repoer |
| ARBEIDSØKT (`arbeidsokt`) | Stemme ved siden av en som skrur. Kun fra kilde. Sikkerhetsstopp på strøm, airbag, bremser. | Prototype |
| gull-system Origin-kø | ANKER, FRISTVAKT, FLOKK NÆR, VED SIDEN AV, EN TING | PENDING |
| Spill | Fjæreplytt, Kodebro, Planteløp (læring for 7–15 år) | Spillbare |

**Smutthullene som går igjen (VERIFISERT i `verksted/IDEER.md`):** `.ics` med VALARM i stedet for web-push · Snarveier «når app åpnes» → URL · `?add=` som API · hele databasen komprimert i `#hash` · støy som WAV i `<audio>` overlever lydløs-bryteren · én origin, mange manifest · bilder krympet i IndexedDB.

### D. AGENT- OG PROMPTMASKINERI
| Del | Hva |
|---|---|
| Labben / LabEngine (`labben`) | Swift. 7 ideer inn, minst 3 drept, første trekk under 2 t, Grok-prompt ut. «Hvis du legger til nettverk er produktet knust.» |
| Grok-bot (`grok-bot-`) | Nesten tomt repo (README 11 byte). Runtime-målet for Labben-promptene. |
| gull-system | Pipeline: problem → prior-art → IdeValiderer → prototype → åpnes på egen Mac. **VERDI-LOV:** 60-sekundersregel, maks to seter, null våpen, «sterkere enn input, ellers STOPP». |
| OPPFINNER-OS / VIBE CODE FACTORY | 12-agent 24t-loop og 8-agent 12t-sprint. README-en sier selv: «Parallell kjøring og timeplan er ønsketenkning.» |
| MR ART master prompt v3 | Én styringsprompt som henter tidligere arbeid, fyller hull, bygger leveranse, fører tilbake. `state.json`. |
| Hermes Loop | 100 research-temaer, 100 GitHub-mål, 100 sanger, 100 bilde- og 100 video-prompter, 50 handlinger, kritiker-node |
| Multi-agent orchestration | Typede konvolutter, «orchestrator never generates», proveniens på hver påstand |
| Promptlab (`agentiske-kunstimperium-2.0`) | Kort liste → prompt/systemprompt/loop/graf. Ukildefestede tall i karantene. Motstander med fast katalog. |
| 24t-sverm RØDT, REGNViking OS, Openclaw, axel-* repoer | Tidligere svermer og systemprompter |

### E. FYSISKE PRODUKTER OG OPPFINNELSER
Rolig Objects (5) · AERA-ring · NATTVAKT (biteskinne med sensor) · LEGO × Apple (10 modulære konsepter) · **VÅR** (fem intimprodukter for kvinner: GLØD, AVTRYKK, SAMKLANG, LENE, KJERNE — 46 s Word, BOM, COGS, Gantt, IP) · ZIP shear-pin og LOS cone dock (gull-system, PASS digitalt) · Pusteklode, Vibe-stein.
**Drept** i gull-system: VinkelKors, MED-IFF IR, CROSS-FAN, MED-KAST. **Regel:** null våpen.

### F. TEKST, KUNST, MUSIKK
| Verk | Hva |
|---|---|
| Essay «Fem tunge» | KI · frykt · miljøvern · krig · politikk. Gonzo. Fakta: Tromsø kommune-KI-saken 2025, Fosen-dommen 11.10.2021, IEA 415 TWh. |
| Bok «Spar som en cowboy» | 80 s, gonzo-western om gjeld og indeksfond. Research, disposisjon, kapittel 1. Fakta: SPIVA 97 % av aktive fond i Europa slo ikke indeks over 10 år; UBS 5,2 % reell årlig avkastning 1900–2024. |
| Konseptarkiv (11) | BLIKKEROSJON (malerier slites av å bli sett), BLUNKEKINOEN, DISSENSMASKINEN, SELVETS FOLKERETT, FREMMED PUST m.fl. |
| Hermes sanger | 100 tekster + Suno-prompter: techno, black metal, norsk folkemusikk. NAV, oljefond, bunad med QR-kode. |
| Gonzo/Banksy-visuelt | 100 bilde- og 100 video-prompter |
| Andre | «Den onde tvillingbroderens guide» (30 s), Norske idiotnyheter som Banksy-satire, Kong Harald-vitsegenerator |

### G. KOMMERSIELT / B2B
Verdimotor (B2B/B2G-pilot) · SEO/hastighet/ASO-byrå landingsside · Fivefold (AI-coach: trening, sykkel, økonomi, garderobe, karriere) · Happiness System Blueprint · «Integrated wealth and creative system» og «Life transformation» (økter 06.10).

---

## 3. DNA-et: regler du selv har skrevet (VERIFISERT, sitert)

- «Null server. Alt kjører i nettleseren.» (`KONSEPTER.md`)
- «Én mekanikk per konsept. Hvis det trenger en forklaring på over to setninger, er det dødt.»
- «Bygges på 48 timer av én person med én HTML-fil.»
- «Ingen streaks, ingen skam, ingen gamification som straffer dårlige dager.»
- «Seed 7. Drepe minst 3. IRP på overlevende #1. Ikke nytt OS.» (Labben-prompten)
- «GULL = Axel kan åpne, kjøre eller bruke greia på egen enhet innen 60 sekunder.» (`gull-system`)
- «Maks to seter. Én eier. Ingen sverm.»
- «Sterkere enn input — ellers STOPP.»
- «Vet ikke. Ikke gjett.» (`arbeidsokt`)
- «Motoren finner ikke opp stemme.» (`etterliv-siste-ord`)
- «Du er ikke alene i dette. Kampen teller.» (Isolation Mirror)
- «Alt blir på denne enheten.»

**Motsigelsen:** Reglene sier *maks to seter, ingen sverm*. Promptene sier *12 agenter i parallell, 24 timer*. Reglene sier *én HTML-fil*. Grenene har Kubernetes, FastAPI, pgvector og Expo. Reglene vinner hver gang du faktisk leverer noe som virker.

---

## 4. Mønstre på tvers

1. **Penger er stresset ingen designer for.** Gjeld-Snøball, Gjeldsradar, Inkasso-skjold, Kjøpebrems/Kjøpekarantene, Prøvefella, Spar som en cowboy, Inkasso-pust. Seks prosjekter på 14 dager peker samme vei. Sprinten sa det også: *«The stress nobody designs for: money.»*
2. **Plurale systemer / dissosiasjon.** Systemtavla, Minnehull, Systemrommet, «Selves, plural» i sprinten. Lokal, kryptert, uten journal. Det finnes nesten ingen verktøy for dette. Ingen av dem er testet av noen som lever med det, utenom deg selv.
3. **Tillit = lokal-først.** Gutter-arkitekturen, Isolation Mirror, SISTE ORD, Vibe10: alle sier det samme. Folk som har det vondt vil ikke bli notert noe sted.
4. **Kill-kriterier er skrevet, men sjelden brukt.** Nesten hvert dokument har «drep hvis». Nesten ingenting er faktisk drept, utenom i `gull-system/INVENTORY.md`. Der virker det.
5. **Gonzo-stemmen virker bedre enn klinisk språk.** Innovasjonsloopen 23.08 sa det. Essayet og bok-kapittelet beviser det.
6. **Agentene genererer mer enn du rekker å fullføre.** 300 sanger, 200 visuelle prompter, 100 repo-mål, 30 apper i kø. Flaskehalsen er ikke ideer. Den er fletting, testing på iPhone, og en kunde.

---

## 5. Hull (det som mangler overalt)

| Hull | Hvor det viser seg |
|---|---|
| Ingen fletting til `main` | 64 grener, `main` fra 29.08 |
| Ingen test på ekte iPhone | `LOGG.md`, `30-apper`, `HULL.md` |
| Ingen bruker, ingen betaling | Alle |
| Grok-bot er tomt | `grok-bot-` |
| Kilder til tall mangler i mange planer | Verdimotor, Zip, Rolig Objects |
| Duplikater som ikke er ryddet | Vibe10 ≈ Verksted; to TASKS.md; to generative design-prompter |
| Juss ikke sjekket | VÅR (medisinsk utstyr?), ARVEBOKSEN (MDR, arveloven), gutter-forebygging (GDPR art. 9) |

---

## 6. Hva jeg ville gjort de neste 14 dagene (ANTAKELSE, mitt forslag)

1. **Flett 1.2 til `main`.** Én gren. Den med 30 tester. Slett eller arkiver de 8 andre bugfix-grenene.
2. **Legg Rolig på telefonen din og bruk den i 7 dager.** Skriv i `HULL.md` hva som feilet på iPhone.
3. **Kjør SISTE ORD-testen på én ekte person** for 990 eller 2 900 kr. Mål minutter og om de betaler.
4. **Slå sammen Vibe10 og Verksted** til én mappe. Velg tre apper (Gjeldsradar, Inkasso-skjold, Kjøpebrems). Bruk dem på din egen gjeld.
5. **Ikke start noen ny sverm** før punkt 1–3 har et svar.

---

## 7. Spørsmål å stille NotebookLM

- Hvilke prosjekter overlapper mest, og hvilke kan slås sammen?
- Hva sier dokumentene om penger og gjeld, samlet?
- Hvilke kill-kriterier er skrevet, og hvilke prosjekter bryter dem nå?
- Lag en tidslinje fra 26.07 til 06.10.2026.
- Hvilke tall i dokumentene har kilde, og hvilke har ikke?
- Hva er forskjellen mellom Rolig 2.0 i `produktplan-rolig-2.0.md`, `SPRINT.md` og `pr-token-k8s`?
- Hvilke regulatoriske risikoer nevnes på tvers (GDPR art. 9, MDR, arveloven, EU AI Act)?
- Lag en podkast (Audio Overview) der to verter krangler om hva jeg bør drepe.

---

## 8. Tidslinje (VERIFISERT fra commit-datoer)

| Dato | Hendelse |
|---|---|
| 26.07 | Rolig mini-app: 4 sider |
| 01.08–16.08 | Bølge 1: PWA, XSS-fiks, Reconnect (par-app), SmarteMind, VENTIL, REGNViking OS, LEGO×Apple, Verdimotor, Zip, Fiksa, AERA |
| 14.08 | Isolation Mirror |
| 19.08–25.08 | 24t-sverm RØDT, Rolig 2.0 generativ kunst, Hermes Loop (100×5), innovasjonsloop, 2× TASKS.md |
| 29.08 | 1.1 på `main` (siste commit der). Labben/LabEngine. |
| 30.08–02.09 | CLI, Happiness, kreative generatorer, seks konsepter |
| 11.09–17.09 | `gull-system`: VERDI-LOV, 60s-regel. axel-systemprompts, multiagent-lab, alex-gull |
| 28.09 | `arbeidsokt` |
| 30.09–02.10 | 20 konsepter (Samtidig, Mørkerommet bygget), 30 apper, spill, giga-prompter, konseptarkiv |
| 03.10 | Etterliv/SISTE ORD, Family Memory AI, Psykologiet Vibe Coding, multi-agent-arkitektur, MR ART v3 |
| 04.10 | ARVEBOKSEN, Sprint RÅ RO, «Spar som en cowboy», Vibe10 + Verksted |
| 05.10 | 1.2 (30 tester), 2.0 Systemrommet + K8s, gutter-forebygging, essay «Fem tunge», SEO-landingsside |
| 06.10 | VÅR intimprodukter, Fivefold, dette dokumentet |

---

## 9. Tall

| Hva | Antall | Merking |
|---|---|---|
| Grener i `rolig-pusterom-miniapp` (utenom `main`) | 64 | VERIFISERT |
| Repoer på kontoen | 29 (5 arkivert) | VERIFISERT |
| Markdown-dokumenter lagt til på grener | 76 filer, ~1 MB | VERIFISERT |
| Grener som retter samme nav-bug | ≥ 8 | BEREGNET |
| Grener som bygger PWA | ≥ 7 | BEREGNET |
| Apper bygget som PWA/Expo | ~45 (Vibe10 10 + Verksted 10 + VIBE20 20 + spill 3 + Fiksa + FocusDump) | BEREGNET |
| Betalende kunder | 0 | VERIFISERT |
| Dager siden `main` endret seg | 38 | BEREGNET |

---

## 10. Filer i denne mappen

- `MASTER-RESEARCH.md` — dette dokumentet. Last opp først.
- `KILDEPAKKE.md` — fulltekst av 42 nøkkeldokumenter fra grenene, uendret, med gren og sti over hvert. Last opp som kilde nummer to.

**Slik:** notebooklm.google.com → Ny notatbok → Legg til kilde → Last opp → velg begge filene (eller lim inn som tekst).

---

Sekstifire grener. Null kunder. Én pustesirkel som fortsatt går 4-2-6 på `main` og venter.

Hvem av dem drar du inn først?
