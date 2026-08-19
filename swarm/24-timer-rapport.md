# 24-timers multi-agent kjøring — RØDT

**Kjørt:** 2026-08-19
**Modus:** Komprimert enkelt-sesjon-kjøring av full protokoll (se merknad under)
**Repo:** rolig-pusterom-miniapp / branch `claude/24-timers-multi-agent-rodt-6kmuov`

## Merknad om tid

Protokollen spesifiserer 24 klokketimer med faste faser (00:00–24:00). Denne kjøringen er en **komprimert, enkelt-sesjons gjennomføring** av de samme fasene i samme rekkefølge, med samme rollefordeling og samme krav til volum/dybde/kill-disiplin — men uten faktisk 24-timers forløpstid. Ideation Swarm ble kjørt som ekte parallelle agenter (ikke simulert internt av én rolle). Alle andre roller (Engineer, Vibe-Coder, Multi-Media, Writer, Research/Validator, Critic, Orchestrator) er utført sekvensielt i denne sesjonen. Ingen fase-output er styrt av at 24 timer faktisk gikk — kvalitetskravet er det samme, tidsrammen er skalert ned.

---

## FASE 1 — Init & Framing

### North Star

Generere og bygge konsepter — oppfinnelser, produkter, systemer, kunst, musikk, skriving, research — med **reell verdi for vanlige mennesker**, på tvers av domener. Ingen seed ble gitt av bruker; ramme satt bredt (ikke låst til "Rolig"-temaet i repoet, selv om flere overlevende konsepter naturlig havnet der).

### Verdi-filter / kill-kriterier (brukt i konvergens)

1. **48-timers byggbarhet** — må kunne bygges til MVP/prototype-nivå av én person innen 48 timer (digitalt og/eller fysisk).
2. **Differensiering** — må ikke være en ren kopi av noe som allerede finnes uten en reell vri.
3. **IP/originalitets-signal** — konseptet skal ha én ting som gjør det gjenkjennelig og vanskelig å kopiere trivielt (mekanikk, vinkel, format).
4. **Praktisk impact eller ekte affekt** — skal enten løse et reelt, gjenkjennelig problem, eller skape ekte følelsesmessig respons (for kunst/musikk/skriving).

Konsepter som ikke består minst 3 av 4 kriterier dør i konvergens uten unntak.

---

## FASE 2 — Divergence (Ideation Swarm)

Tre parallelle agenter kjørt samtidig:
- **Agent A** — Oppfinnelser & produkter (fysiske + digitale): 34 ideer
- **Agent B** — Kunst, musikk, vibe-code: 35 ideer
- **Agent C** — Skriving, systemer, research: 35 ideer

**Totalt: 104 råideer.** Full liste finnes i vedlegg nederst i dette dokumentet (seksjon "Vedlegg: full rå-idébank"). Ingen sensur ble anvendt i denne fasen per protokoll.

---

## FASE 3 — Convergence 1: Topp 15

Filtrert av Invention Engineer + Critic + Orchestrator mot verdi-filteret. 89 av 104 ideer drept (duplikater, krever kapital/spesialutstyr utover 48t, ingen tydelig mottaker, eller ren teknologi-demo uten menneskelig verdi).

| # | Konsept | Problem → Løsning | Verdi-signal |
|---|---|---|---|
| 1 | **Emosjonell Værmelding** | Vanskelig å sette ord på følelsestilstand → daglig "værmelding"-format for indre vær, kjent metafor gjør det lett å lese seg selv | ★ Bygget (se deep-dive) |
| 2 | **Bruksanvisning for følelser** | Vanskelige følelser mangler et "hvordan håndtere dette"-format folk faktisk husker → IKEA-manual-estetikk for emosjonsregulering | ★ Bygget (se deep-dive) |
| 3 | **"Jeg orker ikke i dag"-knappen** | Par sliter med å signalisere overveldelse uten konfrontasjon/forklaringskrav → ett trykk sender behov, ikke krangel | ★ Bygget (se deep-dive) |
| 4 | **Ensomhets-Kalkulator** | Ensomhet er tabubelagt å snakke om direkte → satirisk, selvbevisst "kalkulator" senker terskelen via humor | ★ Bygget (se deep-dive) |
| 5 | Matrestpar | Matsvinn + sosial isolasjon lokalt → hyperlokal (300m) nabo-matdeling uten profiloppsett | Sterk differensiering (avstandsbegrensning + nulloppsett) |
| 6 | Støy-kvittering | Ansatte mangler dokumentasjon for å ta opp støyproblem med HR/verneombud → automatisk loggførings-PDF | Klar, kjedelig-men-ekte impact |
| 7 | Ensomhets-barometer for eldre | Pårørende oppdager isolasjon hos eldre for sent → daglig enkel-trykk-knapp, varsel ved uteblitt trykk | Høy impact, lav kognitiv terskel for bruker |
| 8 | Anonym lønnssammenligning | Lønnstransparens mangler uten å avsløre individdata → lokalt kryptert, kun aggregert visning | Reelt strukturelt problem, men krever tillitsoppbygging |
| 9 | Matrester-til-middag generator | "Hva lager jeg av det jeg har" er daglig friksjon → 3-5 ingredienser inn, tilpassede oppskrifter ut | Enkel, konkret, lav overraskelse men høy bruksfrekvens |
| 10 | Pusteregning | Pusteøvelser er kjedelige å følge visuelt → tallbasert vokse/krympe-animasjon i takt med pust | Naturlig utvidelse av eksisterende Rolig-app |
| 11 | Tastatur-Seismograf | — (kunst/lek) → skrivehastighet visualisert som jordskjelvdiagram i sanntid | Lavterskel, delbart, morsomt vibe-code-objekt |
| 12 | Manifestet for Middelmådighet | Optimaliseringspress uten motstemme → anti-optimalisering-manifest med skarp, tydelig posisjon | Sterk gonzo-stemme, null byggekostnad |
| 13 | Uenighetsprotokollen | Par/kolleger krangler destruktivt uten struktur → fast trinnvis ritual med tidsbokser | Reelt problem, krever disiplin fra brukere for å virke |
| 14 | Testamentet du skriver i live | Verdier/prioriteringer glemmes i hverdagens støy → årlig ritual for å skrive "verditestamente" | Original vinkel på et kjent behov (refleksjon) |
| 15 | Kvitteringspoesi | Kjøpsdata er følelsesløst → kvitteringer omgjort til korte dikt basert på mønster | Morsom, lav nytte men høy delbarhet |

**Drept i denne runden (eksempler, ikke fullstendig):** alle idéer som krever fysisk hardware-produksjon (Pusteveggen, enhånds-brødskjærer, sykkelhjelm-radar — sterke konsepter, men ikke byggbare til MVP på 48t uten fysisk verksted), alle idéer avhengig av ekte multi-bruker backend/nettverkseffekt for å ha noen verdi i det hele tatt (Stemme-arv, Nabolagsverktøykiste, Delt bil-nøkkelboks — gode idéer, men "død uten kritisk masse" er et strukturelt kill-kriterium), og rene tech-demoer uten menneskelig mottaker (Uendelig Korridor, Myldre-Kart — kunstnerisk fine, men ingen tydelig "for hvem").

---

## FASE 4–6 — Deep Build: 4 konsepter med full pakke

De fire konseptene merket ★ over fikk full pakke: spesifikasjon, kjørbar prototype, media-prompts, skriving, research/risiko, 48-timers handlingsliste. Disse ble valgt fordi de skårer høyest på alle 4 kriterier **og** er faktisk byggbare som selvstendige HTML/JS-filer uten backend — altså ekte "kjørbart nå", ikke "kjørbart om vi hadde en server".

---

### 1. Emosjonell Værmelding

**Spesifikasjon:** Daglig generert, deterministisk (dato-seedet) "værmelding" for følelser — temperatur (%), vind, nedbørssjanse (gråt), sikt, trykk, og utsikter. Samme offentlige melding for alle samme dag (som ekte værmelding), pluss en "personlig variant"-knapp som reroller med ny seed. Ingen input kreves — null-friksjon, daglig retur-vane-potensial.

**Prototype:** [`swarm/prototyper/emosjonell-varmelding.html`](prototyper/emosjonell-varmelding.html) — kjørbar, ingen avhengigheter, ren HTML/CSS/JS.

**Media-pakke:**
- Bilde-prompt (Midjourney/Flux): `minimalist weather app UI, soft nordic pastel gradient sky, abstract emotional cloud formations, gentle typography, muted sage and warm grey palette, editorial illustration style --ar 3:4`
- Musikk (Suno): "ambient morning forecast radio interlude, soft synth pads, gentle marimba, calm Scandinavian public radio jingle feel, 70bpm"

**Skriving (produkttekst):**
> Du sjekker værmeldingen hver dag. Du sjekker aldri din egen. Emosjonell Værmelding gir deg det samme fem-sekunders sjekkpunktet — temperatur, vind, sikt — men for det som faktisk styrer dagen din.

**Research/risiko:** Prior art finnes i mood-tracker-appkategorien (Daylio, How We Feel), men ingen identifisert konkurrent bruker ren værmelding-metaforikk som **hele** grensesnittet uten stemningsvalg/logging. Differensieringen er format, ikke funksjon — svakhet: lett å kopiere konseptet selv om koden er original. Ingen teknisk risiko (ren klient-side). Markedssignal: sterkt egnet som gratis daglig-vane-app / viral delbart skjermbilde-format. **Anbefaling: GO** — bygg videre til delbar-bilde-eksport.

**48-timers handlingsliste:**
1. Legg til "del som bilde"-eksport (canvas → PNG) for sosial deling.
2. Utvid til 7-dagers "utsikter"-visning basert på seed-serie.
3. Test dato-seed-determinismen på tvers av tidssoner (unngå at "i dag" endres midt på dagen for brukere i andre soner).

---

### 2. Bruksanvisning for følelser

**Spesifikasjon:** Velg eller skriv inn en følelse → få en IKEA-manual-stil "monteringsanvisning": verktøy som trengs, deler inkludert, nummererte trinn, advarselsboks. 6 forhåndsdefinerte følelser (sinne, sorg, skam, sjalusi, overveldelse, ensomhet) med håndskrevne, terapeutisk forankrede trinn; fallback-generator for enhver annen følelse brukeren skriver inn.

**Prototype:** [`swarm/prototyper/bruksanvisning-for-folelser.html`](prototyper/bruksanvisning-for-folelser.html) — kjørbar, ingen avhengigheter.

**Media-pakke:**
- Bilde-prompt: `IKEA-style instruction manual illustration, minimalist line-art, no text, abstract human figures assembling an emotion represented as furniture parts, warm paper texture background, isometric perspective --ar 4:5`
- Musikk (Suno): "quirky deadpan instrumental, woodwind and pizzicato strings, subtle absurdist Scandinavian furniture-store instrumental muzak, 90bpm"

**Skriving:**
> Følelser kommer aldri med bruksanvisning. Denne gir deg én likevel — ikke fordi følelser er møbler, men fordi noen ganger trenger du bare å vite hvilket trinn som kommer først.

**Research/risiko:** Sterkeste differensiering av de fire — formatet (møbel-manual-estetikk) er ikke brukt i noen kjent mental helse-app. IP-signal høyt: format + tekstlig stemme er original og vanskelig å kopiere uten å virke som plagiat. Risiko: innholdet (de 6 håndskrevne manualene) er ikke klinisk validert — bør ikke fremstilles som terapi. **Kill-risiko hvis** dette markedsføres som medisinsk/terapeutisk verktøy uten fagfellevurdering. **Anbefaling: GO, men med tydelig disclaimer** og eventuelt fagfellevurdering av innholdet før bredere lansering.

**48-timers handlingsliste:**
1. Få en faktisk terapeut/psykolog til å lese gjennom de 6 manualene for grov faglig sjekk.
2. Legg til "skriv ut som PDF"-funksjon (fysisk gjenstand-følelse forsterker konseptet).
3. Utvid fallback-generatoren med enkel lokal tekstanalyse for bedre skreddersydde "deler".

---

### 3. "Jeg orker ikke i dag"-knappen

**Spesifikasjon:** Lavterskel signalapp for par/nære relasjoner — ett trykk sender et ufarlig, ikke-konfronterende signal ("jeg trenger noe, ikke spør om detaljer ennå"), med valgfrie forhåndsdefinerte behovs-chips ("rom", "hold rundt meg", "snakk senere"). Prototypen er en enhets-demo (sender/mottaker-rolle-bytte lokalt); ekte versjon krever push-varsling mellom to enheter.

**Prototype:** [`swarm/prototyper/jeg-orker-ikke-i-dag.html`](prototyper/jeg-orker-ikke-i-dag.html) — kjørbar demo, tydelig merket som enhets-simulering.

**Media-pakke:**
- Bilde-prompt: `single warm amber notification icon, minimalist app icon design, soft glow, calming color palette, flat design, app store icon style --ar 1:1`
- (Ikke musikk-relevant — utility-app, ikke medieopplevelse.)

**Skriving:**
> Ikke alle vanskelige dager trenger en forklaring med en gang. Noen ganger trenger de bare at noen vet det.

**Research/risiko:** Nærmeste prior art: "check-in"-funksjoner i familie-sikkerhetsapper (Life360-typer) og generiske "thinking of you"-apper — men ingen identifisert konkurrent er spesifikt bygget rundt "signal uten forklaringskrav" som kjernemekanikk for parforhold. Teknisk risiko for ekte versjon: krever push-backend (Firebase/APNs) — **ikke** byggbart som ren klient-side som de tre andre; dette er det eneste av de fire konseptene som faktisk trenger en backend for å ha reell verdi utover demo. **Anbefaling: GO for videre bygging, men merk at 48t-grensen for "ekte" versjon er stram** — demo-nivået er ferdig, push-integrasjon er neste skritt, ikke valgfritt polish.

**48-timers handlingsliste:**
1. Sett opp minimal Firebase-prosjekt for ekte to-enhets push-varsling.
2. Legg til enkel "paring" mellom to telefoner via delt kode (ingen kontoopprettelse).
3. Brukertest med ett ekte par — valider at "ingen forklaringskrav" faktisk oppleves trygt og ikke passiv-aggressivt.

---

### 4. Ensomhets-Kalkulator

**Spesifikasjon:** Satirisk "kalkulator" — brukeren svarer på absurd-men-relaterbare spørsmål (antall åpne faner, dager siden noen tekstet først, antall dempede gruppechatter, selvsamtale-frekvens, forhold til leveringsbudet) og får en humoristisk "ensomhetsindeks" med tiered kommentarer som glir fra morsomt til genuint omtenksomt ved høy score.

**Prototype:** [`swarm/prototyper/ensomhets-kalkulator.html`](prototyper/ensomhets-kalkulator.html) — kjørbar, ingen avhengigheter.

**Media-pakke:**
- Bilde-prompt: `retro desktop calculator illustration, playful flat vector style, muted sage and terracotta colors, single quirky icon, meme-adjacent editorial illustration --ar 1:1`
- Musikk: ikke relevant (tekst/humor-drevet, ikke lyd-drevet).

**Skriving:**
> Vi laget en kalkulator for noe som ikke skal kunne beregnes. Den er ikke vitenskapelig. Den er bare ærlig nok til å få deg til å le, og kanskje sende én tekstmelding etterpå.

**Research/risiko:** Format (satirisk BuzzFeed-quiz-stil kalkulator) er velprøvd og lavrisiko å bygge, men også lett å kopiere — differensieringen ligger i tone og spørsmålsvalg, ikke mekanikk. Reell risiko: å gjøre narr av et alvorlig tema (ensomhet) kan slå feil hvis tonen ikke balanseres riktig — høy-score-resultatet er derfor bevisst skrevet varmt, ikke kynisk, i prototypen. **Anbefaling: GO som lavkost, høy-delbarhet inngangsport** til de mer seriøse konseptene (kan linke videre til Bruksanvisning/Værmelding).

**48-timers handlingsliste:**
1. A/B-test tonen på høyeste tier — sikre at den leser som omsorg, ikke som spott.
2. Legg til delbart resultat-kort (samme canvas-eksport-mønster som Værmelding).
3. Kobl resultatsiden til de andre tre appene som "neste steg"-lenker.

---

## FASE 7 — Endelig ranking (alle 15 konvergerte konsepter)

| Rangering | Konsept | Bygget? | Kill/Go |
|---|---|---|---|
| 1 | Bruksanvisning for følelser | Ja | GO — sterkest differensiering + impact |
| 2 | Emosjonell Værmelding | Ja | GO — sterkest daglig-vane-potensial |
| 3 | Ensomhets-barometer for eldre | Nei (spec only) | GO — høyest impact per bruker, men trenger hardware/varslings-partner |
| 4 | "Jeg orker ikke i dag"-knappen | Ja (demo) | GO — men krever backend for ekte verdi |
| 5 | Matrestpar | Nei (spec only) | GO — sterk, men avhengig av lokal kritisk masse |
| 6 | Ensomhets-Kalkulator | Ja | GO — lav kostnad, god inngangsport |
| 7 | Støy-kvittering | Nei (spec only) | GO — kjedelig men solid B2C/B2B-nisje |
| 8 | Matrester-til-middag generator | Nei (spec only) | GO — lett å bygge, moderat differensiering |
| 9 | Pusteregning | Nei (spec only) | GO — naturlig tillegg til eksisterende Rolig-app |
| 10 | Manifestet for Middelmådighet | Nei (tekst-konsept) | GO — null byggekost, ren skriving |
| 11 | Tastatur-Seismograf | Nei (spec only) | GO — morsom, lav prioritet |
| 12 | Testamentet du skriver i live | Nei (spec only) | HOLD — god idé, uklar "hvem bygger dette for meg"-mekanisme |
| 13 | Anonym lønnssammenligning | Nei (spec only) | HOLD — reelt problem, men tillits-/juridisk kompleksitet undervurdert i 48t-rammen |
| 14 | Uenighetsprotokollen | Nei (spec only) | HOLD — avhenger av at begge parter faktisk følger protokollen, høy friksjon |
| 15 | Kvitteringspoesi | Nei (spec only) | KILL — morsom, men ingen retur-verdi utover første bruk |

---

## FASE 8 — Shutdown & Handoff

**Status:** 4 konsepter er bygget som kjørbare, testbare prototyper i `swarm/prototyper/`. 11 ytterligere konsepter er spesifisert med problem→løsning→verdi og klar GO/HOLD/KILL-vurdering, klare til å plukkes opp i en senere kjøring uten å måtte gjenta idefasen.

**Kjør videre (prioritert):**
1. "Jeg orker ikke i dag"-knappen — koble på ekte push-backend (eneste blocker for reell bruk).
2. Bruksanvisning for følelser — få faglig sjekk av de 6 manualene, legg til PDF-eksport.
3. Ensomhets-barometer for eldre — vurder som neste build-spor; høyeste impact-per-bruker av de ikke-bygde konseptene.

**Drep permanent:** Kvitteringspoesi (#15) — ingen retur-verdi, ingen videre handling planlagt.

**Hold i fryseboks (ikke drept, ikke prioritert):** Testamentet du skriver i live, Anonym lønnssammenligning, Uenighetsprotokollen — alle tre krever en løsning på et strukturelt friksjonsproblem (partisipasjon fra flere parter) før de er byggbare på 48t-nivå.

Ingen "vi kan fortsette senere"-tåke: denne rapporten er sluttilstanden for denne kjøringen. Neste kjøring starter enten på handlingslisten over, eller på en ny North Star.

---

## Vedlegg: full rå-idébank (104 ideer, uredigert fra Ideation Swarm)

### Agent A — Oppfinnelser & produkter (34)

1. Pusteveggen — Fysisk klistremerke med LED-ring på dusjveggen som pulserer i 4-7-8-rytme; angstdempende pusteveiledning uten skjerm.
2. Nabolagsverktøykiste-app — Digital oversikt over hvem i gata som eier stigen/boremaskinen/tilhengeren; matcher lån med SMS-varsel når noe blir ledig.
3. Glemselsknapp for medisiner — Liten NFC-brikke på pilleboksen; trykk når du tar dosen, telefonen logger automatisk uten app-oppstart.
4. Strømpris-lyspære — Smart LED som skifter farge basert på sanntids strømpris, ingen app nødvendig.
5. Ærlig CV-generator — Oversetter "jobbhopping" og "hull i CV-en" til ærlige, positive formuleringer.
6. Matrestpar — App som matcher naboer med overskuddsmat samme kveld, hyperlokal radius (300m), null profiloppsett.
7. Sorg-tidslinje — Digitalt verktøy som lager en rolig, privat tidslinje av minner om en avdød.
8. Enhånds-brødskjærer — Skjærebrett med innebygd skrutvinge og styreskinne for kniv.
9. Støy-kvittering — App som måler støynivå på arbeidsplassen og genererer PDF-dokumentasjon.
10. Plante-testamente — QR-tag på potteplanter med stell-instruksjoner for når andre passer dem.
11. Mikrolån mellom venner — Digital IOU-lapp som tracker smågjeld i en vennegjeng med automatisk saldo-utjevning.
12. Ensomhets-barometer for eldre — Fysisk daglig-trykk-knapp; uteblitt trykk varsler pårørende.
13. Resept-oversetter — Skanner utenlandsk oppskrift og konverterer mål/ingredienser til norsk system.
14. Skuffe-arkeologi-app — Bilde av rotete skuff → AI foreslår kast/donér/behold.
15. Sykkelhjelm med blinklys-vibrasjon — Vibrerer i retning av bil som nærmer seg bakfra.
16. "Jeg orker ikke i dag"-knapp for par — Diskret varsling til partner uten umiddelbart forklaringskrav.
17. Kompostkvern-varsel — Fuktighetssensor i kompostbingen med tekstvarsel.
18. Familietre av gjenstander — QR-merkelapp-system som knytter historie til arvegods.
19. Værbasert klesknagg — Smart knagg som lyser opp riktig jakke basert på værmelding.
20. Anonym lønnssammenligning på jobben — Lokalt, kryptert, aggregert lønnsvisning.
21. Én-hånds fletting av hår — 3D-printet verktøy for hårfletting med én hånd.
22. Stille alarm for hørselshemmede — Vibrerende pute koblet til brannalarm/dørklokke.
23. Matrester-til-middag generator — Ingredienser inn, tilpassede oppskrifter ut.
24. Fysisk "gjeld til jorda"-kalender — Vegg-kalender med daglig bærekrafts-mikrotiltak.
25. Panikknapp-armbånd for demens — GPS + én knapp, varsler pårørende med lokasjon.
26. Stemme-arv — Lokal stemmemodell trent på avdødes opptak for etterlatt-trøst.
27. Delt bil-nøkkelboks — Låsbar nøkkelboks med roterende kode for uformell bildeling.
28. Tekst-til-tegneserie for barnesamtaler — Vanskelig samtale → enkel, aldersriktig tegneserie.
29. Selvvanne-pinne med SMS — Jordfuktighetspinne som sender SMS ved behov for vann.
30. Anonym "jeg så deg"-oppslagstavle lokalt — Geofenset digital oppslagstavle for hyggelige gjensyn.
31. Kroppsspråk-øvingsspeil for jobbintervju — Lokal kamera-feedback på øyekontakt/holdning.
32. Fysisk "ikke forstyrr"-lys for hjemmekontor — Kalendersynkronisert lys utenfor kontordøra.
33. Micro-donasjon ved handling — Betalingskort runder opp kjøp, donerer differansen lokalt.
34. Søvnlydskart for naboer — Anonym rapportering av nattestøy med mønsterkart.

### Agent B — Kunst, musikk, vibe-code (35)

1. Pusteregning — Pust i takt med tall som vokser/krymper, ren SVG-animasjon.
2. Ekkokammer — Generativ lydinstallasjon fra mikrofonstillhet (Web Audio API).
3. Vemodige Postkort — AI-genererte postkort fra steder som ikke finnes lenger.
4. Gonzo-Karaoke — Transkriberer mikrofon live, roper ut absurd feilaktige lyrics.
5. Sørgemodus — Ambient dark-folk album, Suno: nordisk begravelseshymne.
6. Trafikklys-Ballett — Fiktiv trafikkdata styrer dansende partikkelsverm i browser.
7. Kroppens Kart — Interaktiv SVG-kropp, kollektivt anonymt smerte/glede-varmekart.
8. Insekt-Synth — Feltopptak av insekter pitchet ned til bass-drone.
9. Uendelig Korridor — Three.js/WebGL prosedyre-generert korridor-loop.
10. Det Glemte Ordet — Generativ poesi fra ukens mest googlede ord.
11. Klokkeslettets Farge — Bakgrunnsfarge endres basert på klokkeslett.
12. Skrik i Flaske — Ta opp skrik, "forsegle" med reverb, visuell hav-scape.
13. Bestemors Oppskrift-Glitch — Skannede oppskrifter kjørt gjennom glitch-algoritmer.
14. Kollektiv Puls — Multiplayer-klikk-rytme blandes til global "hjerterytme".
15. Sinna-Sang Generator — Markov-kjede genererer punk-vers fra brukerens irritasjoner.
16. Nattbuss-Sjanger — Liminal space synthwave for nattbusser.
17. Fargeblind Test-Kunst — Ishihara-mønstre med skjulte emosjonelle ord.
18. Digital Komposthaug — Tekst "råtner" visuelt over tid, blir til nye ord.
19. Ensomhets-Kalkulator — Satirisk "beregning" av ensomhet fra ulagrede faner.
20. Stille Disco for Én — Instrumental house bygget på lyden av egne fottrinn.
21. Fjordens Hukommelse — Generativ landskapskunst av fiktiv værhistorikk.
22. Tastatur-Seismograf — Visualiserer skrivehastighet/rytme som jordskjelvdiagram.
23. Parallelle Liv — To Game of Life-varianter kjører asynkront side om side.
24. Skambenk — Performance-kunst-konsept, offentlig sittende med pinlig skilt.
25. Frostrøyk-Vokal — Vintervokal-EP tatt opp utendørs i kulde.
26. Den Uendelige Unnskyldning — Genererer stadig lengre absurde unnskyldninger.
27. Speilnevron-Chat — To chatboter smitter hverandres tone gradvis.
28. Vaskemaskin-Symfoni — Husholdningsmaskiner remikset til perkusjon.
29. Emosjonell Værmelding — Daglig generert "værmelding" for følelser.
30. Ekko av Ukjente — Portretter generert fra beskrivelser av drømmefigurer.
31. Strekkode-Sang — Strekkoder fra kvitteringer konvertert til MIDI-noter.
32. Tomrom-Detektor — Finner og markerer "negative rom" i opplastede bilder.
33. Den Siste SMS-en — Interaktiv strøm av anonymt delte siste meldinger til tapte kontakter.
34. Myldre-Kart — Boids-simulering av folkemengde i fiktiv norsk by-plaza.
35. Angst-ASMR — Rolige ASMR-lyder over urovekkende bass-drone.

### Agent C — Skriving, systemer, research (35)

1. Manifestet for Tirsdag — Tirsdag som ukas ekte startdag, full produktivitetsfilosofi.
2. Angrebrevet — Formelt "angrebrev" til tidligere versjon av seg selv, rettsdokument-format.
3. Kvitteringspoesi — Kvitteringer skrevet om til korte dikt basert på kjøpsmønster.
4. Gonzo på dyrlegevakta — 48 timer på akutt dyrlegevakt, subjektivt om eierne.
5. Nyhetsbrevet "Ting som gikk galt i dag" — Daglig nyhetsbrev med anonyme småfeil.
6. Det Ufullstendige CV-et — CV-format som lister det du ikke kan.
7. Gonzo-serien "Jeg prøvde algoritmen" — Lever etter én algoritmes anbefalinger bokstavelig.
8. Skilsmissekontrakt for Vennskap — Formell "avslutningskontrakt" for utgåtte vennskap.
9. Nyhetsbrevserie "Den siste generasjonen som husker" — Intervju om noe som forsvinner.
10. Manifestet for Middelmådighet — Anti-optimalisering, retten til å være god nok.
11. Research: gatenavn som forteller glemt historie — kartlegging + lokalhistorie-produkt.
12. Frokostblanding-arkeologi — Sporer forsvunne frokostblandinger fra norske hyller.
13. Uenighetsprotokollen — Strukturert ritual for produktiv krangling med tidsbokser.
14. "Ærlige varedeklarasjoner" — Brutalt ærlige produktbeskrivelser som parodi.
15. Abonnement på tilfeldige komplimenter fra fremmede — Anonym peer-to-peer oppmuntring.
16. Research: dialekters forsvinning via TV-værmeldinger — podcast/lydessay.
17. Manifestet "Retten til å kjede seg" — Borgerrettighetserklæring mot konstant stimulering.
18. Nyhetsbrev "Prisen på ting ingen spør om" — Produksjonskost vs. salgspris.
19. "Angremodus"-tjeneste — System for å formelt trekke tilbake en beslutning uten skam.
20. Gonzo: bo på Nav-ytelse i en uke — dokumentert dag for dag uten kommentar.
21. Research: hva nordmenn googler kl 03:00 — kulturelt portrett av nattetanker.
22. "Bruksanvisning for følelser" — IKEA-manual-stil for vanskelige følelser.
23. "Testamentet du skriver i live" — Årlig ritual for å skrive verditestamente.
24. "Sidetekster" — Historier fortalt kun gjennom fotnoter til usynlig hovedtekst.
25. Research: broer/veier oppkalt etter menn vs. kvinner — kartprodukt.
26. Manifest for Sen Respons — Etikette-regler for retten til å svare sent.
27. "Lånt liv" — Tjeneste der man låner noen andres rutine/hverdag en dag.
28. Gonzo: alle gratis vareprøver/kundeundersøkelser i en by i en måned.
29. Nyhetsbrev "Det du ikke visste at du manglet" — Ukentlig objekt fra annen kultur.
30. Research: norske firmanavn som er ordspill — kulturhistorisk leksikon.
31. "Stillhetsrommet" — Protokoll for daglig obligatorisk taushet på arbeidsplasser.
32. Manifest: "Retten til å endre mening offentlig" — Vokabular mot cancel-kultur.
33. "Advarselsetiketter for livsvalg" — FDA-stil advarsler på hverdagsbeslutninger.
34. Research: norske dialektord for vær uten oversettelse — språklig skattkammer.
35. Gonzo-serie "Jeg leste alle vilkårene" — Oppsummerer reelt brukte tjenesters vilkår.
