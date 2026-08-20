# RESEARCH_NODE — 100 temaer

Format: `[Tittel] | [Hvorfor hot nå] | [Neste steg]`

## Klynge A — AI-agent arkitektur (1-20)
1. Graf-orkestrering vs. lineære chains | Alle store frameworks (LangGraph, CrewAI, AutoGen) migrerer til grafer fordi lineære pipelines ikke håndterer feedback loops | Bygg egen graf-runtime i TS på 48t, test på ett faktisk agent-team
2. Kritiker-agent som tvungen node | Selvkritikk-loop er eneste ting som faktisk reduserer hallusinasjon i multi-agent output | Legg CRITIC-node i alle eksisterende agent-pipelines dine denne uken
3. Seed-mutasjon for divergerende output | Uten mutasjon konvergerer alle LLM-batcher mot samme svar — dette dreper kreativ produksjon i skala | Skriv seed-generator: timestamp+random+hash(forrige output)
4. Multi-agent debate for beslutningskvalitet | Debate-baserte agent-team slår single-agent på komplekse beslutninger i nyere benchmarks | Test 3-agent debate-loop på et faktisk patentspørsmål
5. Memory-arkitektur: episodic vs. semantic | Agenter uten skikkelig minneskille glemmer kontekst og gjentar feil | Design minnelag med separate episodic/semantic stores for AI Empire-stacken
6. Tool-use reliability under load | Agenter som kaller 10+ tools feiler stille — ingen god standard for retry-semantikk ennå | Bygg egen tool-wrapper med eksplisitt failure-state
7. Agent-to-agent protokoller (A2A) | Interoperabilitet mellom agent-frameworks blir neste slagmark, ikke modellkvalitet | Test om dine agenter kan snakke med en fremmed agent via enkel A2A-bro
8. Orchestrator-worker pattern i produksjon | Enkleste pattern som faktisk skalerer uten å bli spaghetti | Refactor ett av dine eksisterende scripts til orchestrator+worker
9. Kostnadskontroll i agent-svermer | Ukontrollerte loops brenner API-budsjett uten varsel | Sett hard token-cap per node i graf-runtimen din
10. Human-in-the-loop uten å drepe farten | De fleste HITL-implementasjoner er for trege til reell bruk | Design async approval-gate som ikke blokkerer resten av grafen
11. Agent-observability / tracing | Uten tracing er multi-agent-feil umulig å debugge | Instrumenter graf-runtimen med enkel span-logging
12. Selvhelbredende agent-pipelines | Agenter som detekterer egen degradering og re-ruter | Bygg fallback-node som trigges på lav-confidence output
13. Prompt-versjonering som kode | Prompts endres uten commit-historikk i de fleste stacks — samme feilklasse som ikke-versjonert config | Legg prompts i git med diff-review
14. Lokal vs. cloud-inferens for agent-svermer | Edge-kjøring kutter latency og kostnad drastisk for høyfrekvente loops | Test Ollama/local model som worker-node i graf
15. Agent-spesialisering vs. generalisering | Smale, spesialiserte agenter slår generalist-agenter på faktisk output-kvalitet | Splitt en av dine "gjør alt"-agenter i 3 smale
16. Sikker sandboxing av agent-kjøring | Agenter med filsystem/shell-tilgang uten sandbox er en tikkende bombe | Kjør worker-noder i isolerte containere
17. Evaluerings-rigger for agent-output | Uten automatisk eval er "det ble bedre" bare vibes | Bygg enkel scorer som sammenligner batch mot forrige batch
18. State-maskiner for lange agent-oppgaver | Lange oppgaver uten eksplisitt state-maskin drifter og mister mål | Modeller graf-eksekvering som eksplisitt FSM
19. Agent-team som simulerer organisasjon | Rolle-baserte team (PM, dev, critic) produserer mer koherent output enn flat swarm | Test rollehierarki på neste vibe-code-prosjekt
20. Kill-switch design for autonome loops | Autonome loops uten hard stop er farlige i produksjon | Bygg global stop-condition i alle loop-noder

## Klynge B — Vibe coding patterns (21-35)
21. 48-timers byggbarhet som filter | Alt som ikke kan MVP'es på 48t bør ikke startes akkurat nå | Lag sjekkliste: kan dette bygges på 48t? Hvis nei, kutt scope
22. AI-first scaffolding vs. templates | Generert scaffolding fra spec slår statiske boilerplates på tilpasning | Test spec-to-scaffold på neste miniapp
23. Vibe coding uten teknisk gjeld | "Rask kode" og "gjeldfri kode" er ikke motsetninger hvis du strukturerer riktig fra start | Sett minimal lint+type-gate selv på raske prototyper
24. Single-file miniapps som distribusjonsform | Én HTML-fil med alt inline er undervurdert for rask deploy og deling | Konverter neste idé til én selvstendig fil
25. Design-to-code med Figma MCP | Direkte bro fra design til kjørbar kode kutter iterasjonstid drastisk | Test Figma MCP på et faktisk UI-konsept denne uken
26. AI-genererte tester som sikkerhetsnett for fart | Rask koding uten tester er gambling — men AI kan skrive testene raskere enn du kan skrive bugs | Legg AI-generert smoke-test på hvert vibe-code-prosjekt
27. Component libraries generert on-demand | Statiske UI-kits blir foreldet — generer komponenter fra bruksmønster istedenfor | Bygg 5 gjenbrukbare komponenter fra siste 3 prosjekter
28. Fra prompt til deploy uten menneskelig steg | CI/CD-pipeline som tar imot AI-generert diff og deployer automatisk til staging | Sett opp auto-deploy-hook for staging-miljø
29. Refactor-agenter som kjører i bakgrunnen | Bakgrunnsagent som kontinuerlig forenkler kodebase uten å blokkere hovedarbeid | Kjør refactor-loop over natten på ett repo
30. Vibe coding for hardware-integrasjoner | Rask iterasjon på firmware/drone-kode er mulig med riktig simulator-loop | Test SITL-simulator for drone-kode før fysisk flight
31. Monorepo for multi-agent-produkter | Splittede repos bremser agent-koordinering — monorepo med klare grenser vinner | Vurder monorepo for AI Empire-stacken
32. Design systems generert fra brand-tokens | Token-first design lar AI generere konsistent UI uten manuell styling hver gang | Definer token-sett for gonzo Banksy-merkevaren
33. Feilsøking med AI som første respons | Første feilsøkingssteg bør alltid være AI-generert hypotese, ikke manuell grep | Bygg debug-agent som første steg i feilhåndtering
34. Progressive enhancement for miniapps | Bygg kjernefunksjon først, la AI legge på lag — ikke omvendt | Strip neste miniapp til kjernefunksjon, bygg opp derfra
35. Kodegjennomgang av AI for AI | La en kritiker-modell reviewe en generator-modells kode før merge | Sett opp automatisk AI-code-review på PR-nivå

## Klynge C — Biomimicry drone-løsninger (36-55)
36. Insektvinge-mekanikk for mikrodroner | Flapping-wing gir bedre manøvrering i trange rom enn rotor i nyere forskning | Skisser patentbar vingemekanisme basert på libelle-flukt
37. Fugleflukt-formasjon for svermnavigasjon | V-formasjon reduserer energiforbruk i svermer, direkte overførbart til dronekontroll-algoritmer | Simuler V-formasjon-algoritme i PyBullet
38. Ekkolokalisering for GPS-fri navigasjon | Flaggermus-inspirert lyd-navigasjon løser Arctic/edge-problemet med dårlig GPS-dekning | Prototyp enkel ultralyd-ekko-modul på billig MCU
39. Gekko-inspirert landingsmekanisme | Adhesjonsbaserte landingsputer lar droner lande på vertikale/skrå flater | Test 3D-printet gekko-hud-prototype for landing
40. Bilagt vingeform for turbulens-resistens | Albatross-vinger håndterer sterk vind bedre enn standard quad-design — relevant for norsk kystklima | Bygg vindtunnel-test (DIY) for albatross-profil
41. Biomimetisk sensor-fusion fra innsektøyne | Compound-eye-design gir bredere synsfelt med lavere prosessorlast | Test lavkost compound-eye-kamera-rigg
42. Maursverm-logikk for distribuert dronekoordinering | Stigmergi (indirekte kommunikasjon via miljø) skalerer bedre enn sentralisert kontroll for store svermer | Implementer stigmergi-algoritme i simulator
43. Fiskestime-unngåelsesmønstre for kollisjonsunngåelse | Boid-algoritmer fra fiskestimer er fortsatt state-of-art for lav-lag kollisjonsunngåelse | Kjør boid-simulering med 20 virtuelle droner
44. Isbjørn-pels-inspirert isolasjon for arktiske droner | Hul-hår-struktur gir isolasjon uten vekt — kritisk for lang batteritid i kulde | Research materialer som kopierer isbjørnpels-struktur
45. Biomimetisk lyddemping fra ugle-vingekant | Serrated vingekant reduserer propellstøy drastisk — relevant for stealth/urban bruk | Test 3D-printet ugle-inspirert propellkant
46. Edderkoppsilke-inspirerte tau for drone-nedfelling/redning | Ultralett høystyrke-linje for presisjonslevering fra drone | Research syntetisk spider-silk-analog for last-slipp
47. Patentbar hybrid: bio-inspirert + edge AI | Kombinasjonen av biomimicry-mekanikk og on-device inferens er fortsatt tynt dekket i patentlandskapet | Kjør patentsøk på "biomimetic UAV + edge inference"
48. Solar-lading via biomimetisk bladform for langtidsdroner | Bladform-optimalisert solcelleplassering øker energihøsting per areal | Skisser bladform-layout for solcellepanel på drone
49. Arktisk edge AI for is-kartlegging | On-device modeller som fungerer offline i -30°C er en reell teknisk nisje med lite konkurranse | Test quantized model på lavtemperatur-hardware
50. Bio-inspirert myk robotikk for skjøre miljøer | Myke aktuatorer skader ikke natur/dyreliv ved nærkontakt-oppdrag | Prototyp enkel soft-actuator med silikon-cast
51. Fugletrekk-inspirert energi-optimal ruteplanlegging | Ruteplanlegging basert på trekkfuglers termikk-bruk kan kutte batteriforbruk drastisk | Bygg ruteplanleggings-algoritme med termikk-modell
52. Kamuflasje-inspirert visuell adaptiv drone-skin | Blekksprut-kromatofor-inspirert overflate for adaptiv kamuflasje | Research e-ink/e-skin-materialer for adaptiv farge
53. Patentmulighet: modulær bio-drone-plattform | Modulært system der vingesett byttes etter oppdragstype (arktisk/urban/skog) | Design modulær festemekanisme, søk patentklasse
54. Biomimetisk propell-form fra hvalfinne-tuberkler | Tuberkel-kant på propellblad reduserer stall og støy (bevist i vindturbin-forskning) | Test 3D-printet tuberkel-propell mot standard
55. Drone-svermer for norsk skogbrannvarsling | Kombinasjon av sverm-logikk og edge AI for tidlig varsling har direkte kommersielt norsk marked | Skriv konseptnotat for pilot med norsk kommune/Skogbrand

## Klynge D — Gonzo satire på norsk politikk/system (56-70)
56. NAV-byråkratiet som kafkask kunstinstallasjon | Ingen har gjort skarp visuell satire på saksbehandlingstid — åpent felt | Lag bildeserie: "Søknad i limbo" i Banksy-stil
57. Oljefondet som moralsk skuespill | Etikkrådet vs. faktiske investeringer er komisk gull som ingen utnytter visuelt | Skisser 5 bilde-konsepter om "grønt fond, sort olje"
58. Kommunesammenslåing som identitetstyveri | Tvangssammenslåtte kommuner mister navn/identitet — sterk metafor-mulighet | Research 3 konkrete kommune-case for satire-serie
59. Bompengedebatten som religionskrig | Ingen sak splitter Norge så absurd langs så små beløp | Lag video-konsept: bompenge-alter med ofringer
60. Snusdåse-kapitalisme og ungdomshelse-paradokset | Statlig moralisme vs. statlig inntekt fra vice — klassisk hykleri-vinkel | Skriv gonzo-tekst om statens "sunne" avhengighet
61. Barnevernet i EMD-speilet | Internasjonal skam møter nasjonal stolthet — sterk visuell kontrast-mulighet | Research EMD-dommer for faktabasert satire-grunnlag
62. Distriktsopprør vs. sentralisering | "Norge i miniatyr"-metaforen er underbrukt i visuell satire | Skisser kart-basert Banksy-stil verk om sentralisering
63. Formuesskatt-eksodus til Sveits | Rikfolk som flykter fra "verdens beste velferdsstat" er ren gonzo-komikk | Lag bilde-serie: kofferter fylt med skattemeldinger
64. Oljearbeider vs. klimaminister-dobbeltmoral | Norge selger olje og prediker klima samtidig — klassisk norsk skisofreni | Skriv sang om "grønn eksport av sort skyld"
65. Politiets vold-statistikk vs. "tillitssamfunnet" | Myten om det trygge, tillitsfulle Norge sprekker i statistikken | Research 5 konkrete statistikk-punkter for faktabasert satire
66. Studielån som livslang gjeldsslaveri | "Gratis utdanning" er en myte når gjelden følger deg til 60 | Lag video-konsept: student i lenker av papir
67. Kongehuset som skattefinansiert reality-show | Monarkiet i et "likhets"-samfunn er absurd nok til å skrive seg selv | Skisser satirisk bildeserie om kongehus-luksus vs. "likhet"
68. Vindkraft-utbygging vs. samisk reindrift | Grønn energi som koloniserer urfolksland er sterk, ubehagelig sannhet | Research konkrete Fosen-case-fakta for presis satire
69. Sykehuskøer i verdens rikeste land | Helsekø-paradokset i et land med oljefond på 15000+ milliarder | Lag bilde: pasient i kø foran fond-tallverk
70. Politisk konsensuskultur som kreativ dødsdom | Norsk "janteloven i politikkform" kveler faktisk debatt | Skriv gonzo-essay om konsensus som sensur

## Klynge E — Mental health tech (71-85)
71. Biofeedback via wearables for panikkangst-intervensjon | Sanntids HRV-varsling før panikkanfall er teknisk mulig men underutviklet i norske apper | Test HRV-sensor-integrasjon i Rolig Pusterom-appen
72. AI-terapeut vs. menneskelig terapeut-hybrid | Ren AI-terapi mangler tillit, ren human skalerer ikke — hybrid er vinnerformelen | Design hybrid-flow: AI triage + human follow-up
73. Pusteteknikk-gamification uten å bli banal | De fleste pusteapper er kjedelige — gamification uten å trivialisere alvor er en designutfordring | A/B-test 2 gamification-lag på eksisterende pusteapp
74. Krise-deteksjon fra skriftmønster | Endring i skrivemønster (tempo, ordvalg) kan varsle forverring før bruker selv merker det | Prototyp enkel NLP-drift-detektor på journalføring
75. Personvern-first mental helse-data-arkitektur | Mental helse-data er mest sensitive datatype som finnes — arkitektur må være personvern-first, ikke etterpåklokt | Design lokal-first datalagring for helseapp
76. Digital fenotyping fra telefonbruk | Passiv datainnsamling (skjermtid, bevegelse) kan predikere depresjonsepisoder | Research etisk rammeverk før implementasjon
77. Mikrodoser av eksponeringsterapi via AR | AR-basert gradert eksponering for fobier er billigere og mer skalerbart enn klinikk | Skisser AR-prototype for én spesifikk fobi
78. Søvnmønster-analyse koblet til stemningsprediksjon | Søvndata er sterkeste enkeltprediktor for neste-dags mental tilstand | Koble søvndata-API til stemningsvarsel-modul
79. Peer-support-matching med AI | AI-matchet peer-support (ikke terapi) er underutforsket og billig å bygge | Prototyp enkel matching-algoritme basert på deletema
80. Krisetelefon-avlastning med AI-triage | AI-førstelinje kan filtrere akutt fra ikke-akutt og frigjøre menneskelig kapasitet til de som trenger det mest | Design triage-flow med hard eskaleringsgrense til menneske
81. Mental helse-tech for skiftarbeidere/oljearbeidere | Norsk offshore-sektor har unikt mental helse-behov ingen bygger spesifikt for | Intervju 3 offshore-arbeidere om faktisk behov
82. Stemme-biomarkører for tidlig depresjonsvarsling | Stemmeanalyse (tonehøyde, pause-mønster) er en lovende, lite utnyttet biomarkør | Test åpen stemme-datasett mot enkel klassifikator
83. Gamifisert eksponeringstrapp for sosial angst | Strukturert, AI-tilpasset progresjon slår statiske "gjør dette i dag"-lister | Design 5-trinns eksponeringstrapp med AI-tilpasning
84. Etisk rammeverk for AI som ikke skal "fikse" følelser | Fare for at mental helse-AI optimerer bort ubehag som faktisk trengs (sorg, etc.) | Skriv eksplisitt etisk manifest for egne mental helse-produkter
85. Familie-inkludert mental helse-tracking | De fleste apper isolerer bruker — familie/nettverk-involvering øker faktisk bedring | Skisser opt-in familie-visning i Rolig Pusterom

## Klynge F — Patentbare mekanismer & rå kreativ produksjon (86-100)
86. Patentbar pustesensor-kalibrering for stress-adaptiv feedback | Adaptiv kalibrering (ikke statisk terskel) er trolig patenterbar mekanisme | Skriv teknisk beskrivelse, sjekk prior art
87. Mekanisk energihøsting fra drone-vingeflaps | Piezoelektrisk høsting fra vingeflaps kan forlenge flytid marginalt men målbart | Kjør enkel piezo-test på vingeprototype
88. Modulær agent-plugin-arkitektur som IP | Standardisert plugin-grensesnitt for agent-tools kan være verdt å beskytte/lisensiere | Dokumenter arkitektur formelt før du deler den åpent
89. Rå tekst-serie: "Systemfeil" — ukentlig gonzo-dagbok | Ukentlig, uredigert, rå tekst bygger sterkere følgerskap enn polerte essays | Skriv første "Systemfeil"-utgave denne uken, ingen redigering
90. Patentsøk-automatisering med AI-agent | Manuelt patentsøk er tidkrevende — agent som screener prior art kan spare uker | Bygg enkel patentsøk-agent mot offentlig USPTO/Espacenet API
91. Lydinstallasjon: black metal møter norsk folkemusikk møter techno | Sjangerkollisjon som konsept er underutforsket live, mest gjort i studio | Skisser 20-min live-set-struktur som blander alle tre
92. Rå videodagbok fra AI Empire-byggingen | Uredigert build-in-public-video slår polerte demo-videoer på tillit og rekkevidde | Film neste bygge-økt uredigert, post rå
93. Patentbar gestbasert dronekontroll for kalde hender | Gestkontroll som fungerer med hansker i arktisk kulde er en reell, uløst UX-nisje | Prototyp enkel IMU-basert gestkontroll, test med hansker
94. Manifest: "Anti-fluff" som merkevareprinsipp | Et eksplisitt skrevet anti-fluff-manifest gir hele merkevaren en filterbar identitet | Skriv 1-siders manifest, publiser som fast referanse
95. Patentbar hybrid pust+puls-basert biofeedback-loop | Kombinert signal (ikke bare pust ELLER puls) gir mer presis stress-deteksjon | Skriv teknisk spec, sjekk om kombinasjonen er patenterbar
96. Rå kreativ produksjon: daglig 1-times "no-edit"-blokk | Tidsboksede, uredigerte kreative økter produserer mer råmateriale enn perfeksjonisme | Blokk 1t i morgen for ren no-edit-produksjon
97. Patentbar sverm-til-enkeltdrone-handoff-mekanisme | Sømløs overgang fra sverm-modus til solo-oppdrag er teknisk og trolig patenterbar | Skisser handoff-logikk, dokumenter for søknad
98. Gonzo-podcast-format: AI leser opp NAV-vedtak dramatisk | Absurd format som er billig å produsere og har viralt potensial | Skriv pilotmanus, test AI-stemme-opplesning på ett anonymisert vedtak
99. Patentbar selv-kalibrerende propellstøy-kansellering | Aktiv støykansellering tilpasset propellfrekvens i sanntid er en smal, verdifull nisje | Research eksisterende ANC-patenter for gap-analyse
100. Rå arkiv-prosjekt: dokumenter hele AI Empire-byggingen offentlig i sanntid | Offentlig, uredigert byggelogg blir egen distribusjonskanal og troverdighetsbevis over tid | Sett opp enkel offentlig logg (git commits + rå notater), start i dag
