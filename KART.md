# KART — alle grener, 10.10.2026

**Tilstand før 1.3:** 86 grener, 3 PR-er, 0 merget. `main` sto på 1.1, og 1.1 lovet rettelser som aldri kom inn i koden (se `HULL.md`).
27 grener skrev om `index.html`. 17 av dem fikset **den samme** nav-feilen (`event.currentTarget`) hver for seg. Ingen av dem nådde `main`.

**Regelen herfra:** én app-gren om gangen, og den merges før neste starter. Alt som ikke er Pusterom, flyttes til eget repo.

Kolonnen «Hva» er hentet fra siste commit på grenen. Kontrollert med `git log` og `git diff main...<gren>` den 10.10.2026.

---

## 1. Landet i 1.3 — denne grenen (`claude/rydding-landing-1-2`)

| Gren | Hva som ble tatt med |
|------|----------------------|
| `project-value-maximization-e7rdl9` | **Grunnmuren.** 1.2: ekte 1.1-rettelser, PWA, offline, sikkerhetskopi, hjelpenumre, 30 tester. Hele grenen er med. |
| `pr-token-k8s-10pzyq` (PR #2) | **Systemrommet** er hentet ut og skrevet om (trygg DOM, med i sikkerhetskopi og «Slett alt», 15 tester). Kubernetes, Docker og design-tokens er **ikke** tatt med: det er en publiseringsbeslutning som ikke er tatt, og den hører ikke hjemme i en app for én person uten server. |

## 2. Erstattet — trygge å slette når 1.3 er merget

Alle disse retter feil som nå er rettet og låst med tester i 1.3. Det finnes ikke noe unikt i dem som ikke er nevnt i del 3.

| Gren | Hva den gjorde |
|------|----------------|
| `agent-packages-setup-njj22y` | 1.1-fiksene + røyktest (+ agentpakker CLAUDE.md/AGENTS.md, se del 4) |
| `curate-input-images-tn2cfl` | 1.1-fiksene + AGENT.md «Ukespeilet» |
| `new-session-gp7heo` | 1.1-fiksene |
| `openclaw-hermes-improvement-h8iewv` | 1.1-fiksene + XSS |
| `system-cleanup-optimization-30d8t6` | nav-fiks |
| `system-optimization-expansion-w61mwz` | nav-fiks + bakgrunnstimer + iOS-meta |
| `system-analysis-value-iptrvh` | nav-fiks + XSS + PWA |
| `webreact-system-review-m9jhbk` | nav-fiks + XSS + filsplitt |
| `zip-product-market-strategy-a4uf85` | XSS-fiks (+ Zip-strategi, se del 4) |
| `system-analysis-framework-uq7tec` | «30-dagers rammeverk» oppå 1.0 |

## 3. Idéer til Pusterom — hent én om gangen, etter bruksprøven

Disse har noe 1.3 ikke har. De er bygget oppå gamle 1.0-filer og kan ikke merges rett inn. Ta ideen, ikke koden. `LOGG.md` sier at bruksprøven kommer først.

| Gren | Idé | Merknad |
|------|-----|---------|
| `analyse-forbedring-arbeid-eiew4h` (PR #1) | flere pustemønstre, streak | Streak kan kjennes som press. Pustemønstre er trygt. |
| `bygg-total-v22572`, `autonomous-creative-force-4x9ya3`, `badus-ai-mega-prompts-p7hxcx` | pustemønstre, humørgraf, streak | Samme idé bygget tre ganger. Humørgrafen er parkert i `LOGG.md`. |
| `automate-tasks-schedule-8ssf9a` | faste tider, kalendereksport (.ics) | Påminnelser er parkert. Kalenderfil krever ingen tillatelser og er verdt å vurdere. |
| `byggesystem-development-bd56kh` | «Innsikt» i Historikk | |
| `20-sterke-konsepter-jndyat` | **Mørkerommet**, «Samtidig» + 20 konsepter | Egen side, kan løftes inn som `systemrom.html` ble. |
| `ventil-app-design-ri8xap` | **VENTIL**: sinne ut, tvungen nedkjøling | Egen side. Passer ved siden av Pusterom. |
| `daily-ai-tasks-iftdiw` | Isolation Mirror som egen side i appen | |
| `creative-surprise-challenge-ktxfoz` | skjult gull-øyeblikk etter tre ritualer | |
| `creative-system-dev-5ogc1r` | generativ kunst, lokal innsikt | |
| `creative-innovation-sprint-qnst9h` | RÅ RO-sprint, 20 konsepter | |
| `creative-ideas-generator-y7buy6` | idégenerator (30 ideer) | |
| `new-smarter-product-g2owd5` | SmarteMind, AI-coach | Krever sky. Kolliderer med «ingen sky». |
| `wonder-package-creative-gsf1do` | Forundringspakke | |

## 4. Egne produkter som ligger i feil repo → flytt til eget repo

Hver av disse er sitt eget prosjekt. I Pusterom-repoet blir de bare støy, og de kan aldri merges hit.

| Gren | Produkt |
|------|---------|
| `antipsykologen-ios-backend-i0uig0` | Antipsykologen: iOS-backend |
| `app-ideas-design-code-sve3pz` | 25 iOS-aktige React-apper |
| `vibe-code-ios-web-ideas-bpnyyv` | Verksted: ti React-PWA-er |
| `vibe-code-ios-web-react-fkfsrf` | Vibe10: ti React-PWA-er |
| `30-apper` | 30 apper, status «PÅGÅR, ikke verifisert» |
| `couple-connect-app-i4ue1u` | Reconnect: app for par |
| `fiksa-mobile-app-5tymlz` | Fiksa: reparasjonsapp |
| `regnviking-os-swarm-y73vk1` | REGNViking OS: agent-sverm |
| `fjorten-motor-oppgaver-e5bnve`, `grok-kjerne-malebenk-sgc9k1` | grokkjerne, kontrollmotor, Slusen-CRM. **To grener med samme kjerne.** |
| `psychology-vibe-coding-system-qi5q2r` | Psykologiet: backend og API |
| `public-failure-database-8dod0z` | Folkets regnskap: robot i GitHub Actions |
| `small-wins-lab-6bs7rx` | Small Wins Lab |
| `etterliv-produktlab-1nsalg` | Etterliv: SISTE ORD |
| `spill-2-6-14` | tre spill |
| `cli-system-builder-5ycx32` | Pusterom-CLI (Python) |
| `new-session-04vaqe` | beslutningslag og router |
| `multimodal-task-templates-pysqdd` | task-maler |
| `github-reverse-engineering-w7vohy` | repo → prompt-verktøy |
| `24-timers-multi-agent-rodt-6kmuov` | fire sverm-prototyper |
| `hermes-loop-graph-orchestrator-xf7bs5` | Hermes Loop: 400 prompter |
| `eight-gates-ai-commercial-6f7xp7` | Eight Gates: reklamefilm |
| `five-womens-intimate-products-1mzk67` | VÅR: produktportefølje |
| `sparing-aksjer-guide-joc7vk` | bok: «Spar som en cowboy» |
| `essay-norsk-fem-temaer-8jaohz` | essay: «Fem tunge» |
| `mr-art-master-prompt-v3-d060v8`, `master-research-engine-bqyh6b` | MR ART |
| `mediebruk-workflow-system-465c3p` | workflow for mediebruk |

## 5. Dokumenter, prompter og strategi → ett arkiv

Dette er tekst, ikke kode. Samle det i ett arkiv-repo (for eksempel `rolig-arkiv`) med én mappe per gren, eller la grenene ligge. **Ikke** merg dem til Pusterom.

`20-social-media-texts-0fn4j3` og `-bqu0v7` (to like oppgaver) · `ai-agent-prompt-system-46m7ld` · `alexander-innovation-loop-88tan5` · `alexander-value-engine-vfaop7` · `arveboksen-framework-14day-e6bni1` · `creative-ideas-generator-ipiemc` · `family-memory-ai-blueprint-qrs4yu` · `five-product-concepts-development-k5ntsk` · `generative-design-prompt-1ihs4w` og `-5vuel3` (to like oppgaver) · `giga-prompts-multiagenter-nk0wkj` · `google-notebook-master-research-gnjtzk` og `-jwvhzs` (to like oppgaver) · `happiness-system-blueprint-n6lwzu` · `idea-optimization-efficiency-6znulc` · `impressive-30-page-content-sb4rch` · `innovation-concept-generation-i7cs15` · `innovative-product-concept-7avdna` · `lego-apple-product-design-rgcfdh` · `life-transformation-app-design-08x22m` · `multi-agent-orchestration-arch-qohgt5` · `multi-agent-task-generation-951dvx` og `-99nswx` (to like oppgaver) · `ops-week-41-single-result-41nktm` · `product-solution-development-8kr2e8` · `revolutionary-product-concept-k11cla` · `seo-agency-landing-page-bng3md` · `six-innovation-concepts-aqob2d` · `youth-suicide-prevention-architecture-85rya6`

## 6. Allerede døde

| Gren | Status |
|------|--------|
| `clawmem-code-plugin-8nfqhh` | PR #3 er lukket. Grenen la til og fjernet det samme, så diffen er tom. |

---

## Rekkefølge (dine beslutninger, ikke utført)

1. **Merg 1.3** (`claude/rydding-landing-1-2`) inn i `main`. Da er `main` sann igjen.
2. **Lukk PR #1 og #2** med en lenke hit. PR #1 er bygget på 1.0. PR #2 sin app-del er landet, og Kubernetes-delen venter på en publiseringsbeslutning.
3. **Slett grenene i del 2 og 6.** Ingenting går tapt; alt er i 1.3 eller i dette kartet.
   ```
   git push origin --delete \
     claude/project-value-maximization-e7rdl9 claude/agent-packages-setup-njj22y \
     claude/curate-input-images-tn2cfl claude/new-session-gp7heo \
     claude/openclaw-hermes-improvement-h8iewv claude/system-cleanup-optimization-30d8t6 \
     claude/system-optimization-expansion-w61mwz claude/system-analysis-value-iptrvh \
     claude/webreact-system-review-m9jhbk claude/system-analysis-framework-uq7tec \
     claude/clawmem-code-plugin-8nfqhh
   ```
   (`zip-product-market-strategy` står i del 2, men har også Zip-strategien. Flytt `docs/zip-strategi.md` først.)
4. **Del 4:** opprett et repo per produkt og flytt grenen dit (`git push <nytt-repo> origin/claude/<gren>:main`).
5. **Del 3:** ikke før bruksprøven i `LOGG.md` er gjort.
