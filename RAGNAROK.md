# RAGNAROK — oppgave 1, 2 og 3 i én fil

Tre oppgaver ble én. Det er resultatet, ikke latskap: Flow-Agent (oppg. 2) er det som overlevde
Ragnarok (oppg. 1), og dagskjøringen med helse-port (oppg. 3) er Flow sin første regel.
Tre prompter hadde vært tre agenter. Det var det som var sykdommen.

**Prompten:** `FLOW.md`. **Tilstand:** `MOTOR.md`. **Helse-port som kjører:** `index.html` → «Dagens port».

---

## Råstoff (hva som faktisk fantes — fra Notion, ikke hukommelse)

| Del | Kilde |
|---|---|
| Trinity: Hernes (orkestrator) + Cloud Cod + Kodaks, hver med AGENTS.md, SOUL.md, MULTIPROMPT.md, HEARTBEAT.md. Ritual: Scan → Twist → Teach → Build → Surprise | Notion «Trinity — Cloud Cod · Kodaks · Hernes», 14.08 |
| Openclaw-repo: autoharness, hermes-247, graph-systems, kb, skills, MASTER_INDEX, OPENCLAW_20_AGENTS | Notion «Hermes/OpenClaw kjerne» |
| Empire-moduler: ClawBus, AriaGuard, IcePulse, GrokToolRegistry, EmpireSelfImprove (egenscore 5,8/10) | samme |
| Grok Bot-slott 00 / 04 / 08 / 12 / 13 / 16 / 19 / 20 / 22, CostGuard «cap 0,50», «Ingen sverm» | «KLAR 16. aug» (125 slott-seksjoner) |
| Skill-fabrikk (1 skill per runde), Gonzo-pakke, Kai-planke, SLUSEN, MOTOR/MOTORPORT, Teset-les, Løft-først | samme |
| Porteføljeregister med 9 statuser, ~650 rader | «Lageranalyse» 29.10 |
| Merking DOKUMENTERT / BEREGNET / HYPOTESE / UAVKLART, VERDI-LOV (60 sek), Agenteråd, Portvakt, IdeValiderer, IRL-20 (20 agenter), Grok Bot Coach (45 boter) | Lageranalyse, IRL-20, KLAR |

**Tre tall som er hele diagnosen:**
- «Teseten ulest» står **32 ganger** i KLAR-loggen. Fryser-testen for FrostKupong ble aldri lest. Systemet skrev om testen 32 slott på rad i stedet for å åpne fryseren.
- **28 slott** kjørte mellom 22:00 og 04:00 fra 15.08 til 03.09.
- Commit `3cc07de` (29.08) heter «1.1: nav-fix, lokal-first, historikk-export». Diffen rørte bare `.md`-filer. `index.html` sto urørt i **73 dager** med `event.currentTarget`-buggen og `alert()` intakt.

---

## Fem generasjoner

Judge-metode, ærlig: jeg kan ikke kjøre et system i 24 timer i denne økta. Judge kjørte **replay**: hver
generasjon ble holdt opp mot de faktiske feilene i arkivet over (de 32, de 28, de 73 dagene,
Lageranalyse sitt «si hvilken av de tre»). Overlever den dem uten fiks = passerer. Den ekte 24t-testen er 7-dagersplanen under.

### Gen 1 — 41 deler inn
**Generator:** alt over, samlet.
**Breaker (−56 %, 23 deler):** alle fleragent-strukturer (Trinity → én, 20 agenter, 45 boter, Agenteråd, sverm-forbud — det finnes ingen sverm å forby), Empire-modulene, HEARTBEAT, Scan→Twist→Teach→Build→Surprise, nattslottene 00/01/04/22.
**Rebuilder (18):** én agent, slott 08/13/19, CostGuard, Porteføljeregister, 4 merkelapper, VERDI-LOV, Teset-les, Løft-først, skill-fabrikk, gonzo-pakke, MOTORPORT, SLUSEN …
**Judge:** ❌ dør på replay av «Teseten ulest». Slottene kjører på klokka, ikke på resultat. 08/13/19 skriver tekst om en test som ikke er tatt, akkurat som før. Skill-fabrikken legger til én skill per dag = lageret vokser.
**Døde og hvorfor:** autonomt tidsskjema (klokke ≠ framdrift), skill-fabrikk (lager-generator).

### Gen 2 — 18 inn
**Breaker (−50 %, 9):** alle slott (Flow kjører når Alexander snakker, aldri ellers), skill-fabrikk, SLUSEN/MOTORPORT-sjargong, 9 statuser → 3 (ÅPEN / LEVERT / DØD), CostGuard-logging under 10 kr.
**Rebuilder (9):** én agent, én MOTOR, VERDI-LOV, merkelapper, Løft-først, «slett først».
**Judge:** ❌ dør på replay av commit `3cc07de`. Ingenting i reglene hindrer «levert» i commit-meldinga uten levert i diffen.
**Døde og hvorfor:** tillit til egen statusrapport.

### Gen 3 — 9 inn + 2 fra restene
**Breaker (−44 %, 4):** Porteføljeregister-skriving per handling (bare ved LEVERT/DØD), merkelapper 4 → 2 (VERIFISERT / IKKE VERIFISERT), Agenteråd-motstemme, Løft-først som egen skill (blir regel 5).
**Rebuilder:** + bevisregel («commit lover aldri mer enn diffen»), + helse-port (fra Pusterom, som allerede fantes), + hard stopp 21:00.
**Judge:** ⚠️ overlever 73-dagers-feilen og natt-feilen. Dør på replay av Lageranalyse: den slutter med «Si hvilken av de tre 48t-handlingene som er aktiv». En meny. Menyer venter på et svar som ikke kommer fra senga kl 01.
**Døde og hvorfor:** spørsmål som ikke er irreversible.

### Gen 4
**Breaker (−50 % av regelteksten):** alle menyer, «neste når du sier ja», alle «vil du at jeg…».
**Rebuilder:** regel 3 «velg selv, mest reversible», regel 4 «spør bare ved irreversibelt», regel 6 «to forsøk».
**Judge:** ✅ overlever alle fire replay-feilene. Men prompten er 70 linjer. Alexander leser den ikke, og en prompt han ikke leser er en agent han ikke eier.
**Døde og hvorfor:** ingenting i logikken; lengden er neste fiende.

### Gen 5 — overlever
**Breaker (−45 % tekst):** forklaringer, eksempler, begrunnelser. Bare regler igjen.
**Rebuilder:** svarformatet LEVERT / BEVIS / SLETTET / NESTE (fire linjer som tvinger regel 1, 2 og 5 inn i hvert svar).
**Judge:** ✅ alle replay-feil + lesbar på én skjerm. **Dette er `FLOW.md`.**

| Gen | Deler inn | Slettet | Overlevde replay |
|---|---|---|---|
| 1 | 41 | 23 | 0 / 4 |
| 2 | 18 | 9 | 1 / 4 |
| 3 | 11 | 4 | 3 / 4 |
| 4 | 10 | 3 | 4 / 4 (for lang) |
| 5 | 8 regler + port + format | tekst −45 % | 4 / 4 ✅ |

---

## Oppgave 2 — Flow på tre ekte smertepunkter

| | Før (fra arkivet) | Etter (denne økta) |
|---|---|---|
| **Systembygging** — Pusterom 1.1 | Commit 29.08 påsto nav-fix + export + lokal-first. 0 av 3 levert i koden. 73 dager. | 1 melding. 1 forsøk. Alle tre + helse-port i `index.html`. **VERIFISERT** med Playwright: grønn/gul/rød, kill ved 3 røde, nav følger side, ingen `alert()`, export laster ned `.txt`, notat-HTML vises som tekst. 0 JS-feil. |
| **Gonzo-leveranse** — Cowboy-økonomi | Gonzo-pakke kjørte i 19-slottet (7 slott i loggen), om NAV-tall og kai-planker. Lageranalyse 29.10 satte «300 ord åpning» som handling #1. Ingen åpning finnes i Notion. | 1 melding. 300 ord ferdig i `MOTORSAG.md`, pakke 1. **IKKE VERIFISERT**: én detalj er ANSLAG (merket), og det er din stemme — du leser høyt én gang før det publiseres. |
| **Helse/recovery** | 28 slott mellom 22 og 04 på 20 dager. Ingen regel stoppet dem. «Kan kjøres fra senga» ble en grunn til å kjøre mer, ikke mindre. | Port i appen + regel i Flow: rød = ingen bygging, stopp 21:00, 3 røde på 7 = 7 dagers pause + lege. **VERIFISERT** i appen; om du *bruker* den: ikke verifiserbart av meg. |

**Målekriterier (sjekk hver søndag, 2 minutter):**
1. Meldinger fra deg til ferdig: **≤ 2** i snitt. Tell på de 5 siste leveransene.
2. Forsøk per leveranse: **≤ 2**. Tredje forsøk = oppgaven var for stor.
3. Antall agenter i bruk: **1**.
4. Andel svar med VERIFISERT: **≥ 80 %**.
5. Slott etter 21:00: **0**.

---

## 7-dagers testplan for FLOW (den ekte Judge)

| Dag | Test | Bestått hvis |
|---|---|---|
| 1 | Lim `FLOW.md` inn som systemprompt i Grok/Claude. Slå av alle cron/heartbeat/slott i OpenClaw (ikke slett, bare stopp). | Ingenting kjører uten at du skriver. |
| 2 | Gi én vag oppgave («fiks noe i Pusterom»). | Flow velger selv, leverer, sier hva som døde. Ingen meny. |
| 3 | Gi en oppgave som feiler (f.eks. noe som trenger nett den ikke har). | Stopper etter 2 forsøk med minste neste test. Ikke 11. |
| 4 | Kom med en ny idé midt i MOTOR-arbeid. | Én linje i Lager. Null research. MOTOR fortsetter. |
| 5 | Be den publisere/sende noe. | Den spør (irreversibelt). Ellers spør den ikke om noe. |
| 6 | Rapporter rød port. | Ingen bygging tilbys. Ingen forhandling. |
| 7 | Søndagssjekk: de 5 målekriteriene. | 4 av 5 → Flow blir. Under 3 → kutt én regel til (Gen 6), ikke legg til. |

---

## Oppgave 3 — Health-gate + én pipeline

### Porten (hard, tre målbare)

| Mål | Grønn | Bom |
|---|---|---|
| Søvn i natt | ≥ 6 t | < 6 t (rød direkte under 4,5) |
| Styrke | dagens øvelser fra fysio/behandler gjort (eller 10 min hvis du ikke har program) | ikke gjort |
| Stress | 0–5 | 6–10 (rød direkte på 8+) |

0 bom = **GRØNN** · 1 bom = **GUL** · 2+ bom = **RØD**. Tersklene er mine standardverdier, ikke medisinske. Juster dem med behandler — da endrer du `gateLevel()` i `index.html`, én linje.

### Pipelinen: Cowboy-økonomi (gonzo-serien som tjener penger)

Valgt fordi den scorer høyest på mening × gjennomførbarhet: din stemme, kan dikteres fra senga, 0 kr å starte, og Lageranalyse fant allerede at den har nærmest betalende publikum (249 kr forhåndssalg). Pusterom er ikke pipelinen — Pusterom er **porten**. Den er ferdig.

### Dagen (Flow kjører dette)

1. **Port** i appen (1 min). Rød → stopp her. Det er en fullført dag.
2. **Én bygg** (grønn: maks 90 min / gul: maks 45 min): neste bit av MOTOR. Én fil endret.
3. **Én kreativ** (bare grønn): ett kapittel-utkast, 300–600 ord, diktert.
4. **Hard stopp 21:00.**

### 14-dagers kalender (start mandag 16.11)

| Dag | Bygg | Kreativ |
|---|---|---|
| 1 man | Les åpningen høyt. Bytt ANSLAG-detaljen med ekte kvittering. | — |
| 2 tir | Velg Substack *eller* Vipps-lenke. Lag kontoen. (ikke publiser) | Kapittel 1: én ekte sparehistorie |
| 3 ons | Salgsside: åpning + hva du får + 249 kr | — |
| 4 tor | **Hvil.** Port + Pusterom. | — |
| 5 fre | Flow spør: publisere? Du sier ja/nei. | Kapittel 2 |
| 6 lør | Del lenka til 10 du kjenner. (irreversibelt — ditt valg) | — |
| 7 søn | Søndagssjekk (5 kriterier + port-uka i appen) | — |
| 8 man | Tell forhåndskjøp. 0 → ny vinkel i åpningen, ikke ny bok. | Kapittel 3 |
| 9 tir | — | Kapittel 4 |
| 10 ons | **Hvil.** | — |
| 11 tor | Ukesagenten-utkast (MOTOR 2) *bare* hvis Cowboy har ≥ 1 kjøp | Kapittel 5 |
| 12 fre | — | Kapittel 6 |
| 13 lør | **Hvil.** | — |
| 14 søn | Dom: fortsette / bytte vinkel / DØD. Eksporter port-historikk fra appen. | — |

### Kill-criteria (recovery vinner alltid)

- **3 røde på 7 dager** → all bygging stopper i 7 dager. Appen sier det. Ring fastlege/behandler.
- **Søvn < 6 t fire netter på rad** → kreativ leveranse ut til søvnen er tilbake.
- **Noe som ligner tegnene før tidligere innleggelser** → følg planen fra behandler, ring legevakt **116 117**, ved fare **113**. Ingen agent, ingen prompt, ingen MOTOR er viktigere.
- **Jobb etter 21:00 to ganger på en uke** → Flow nekter neste dags kreative leveranse.
- **Pipelinen** dør hvis 0 forhåndskjøp etter dag 14 *og* ny vinkel er prøvd. Da går MOTOR til Ukesagenten.
