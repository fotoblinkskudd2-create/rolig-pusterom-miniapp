# GITHUB_VIBE_NODE — 100 repos + bygg-forslag

Format: `[repo] — [hva det er] → [konkret 48t-bygg/fork/remix for Alexander]`

## Agent-frameworks & orkestrering (1-15)
1. langchain-ai/langgraph — graf-basert agent-orkestrering → Fork, strip til minimal kjerne, bygg din egen Hermes-graf-runtime på toppen
2. joaomdmoura/crewAI — rollebasert multi-agent-team → Remix rollemodellen (PM/dev/critic) for AI Empire-content-pipelinen
3. microsoft/autogen — multi-agent conversation framework → Test AutoGen's group-chat-pattern for song/visual-generering med kritiker-loop
4. All-Hands-AI/OpenHands (tidl. OpenDevin) — autonom kodeagent i sandbox → Fork, koble til egne repos, la den kjøre 48t-prototyper autonomt
5. langgenius/dify — visuell agent/LLM-app-builder → Selfhost, bruk som rask backend for miniapp-prototyper uten å skrive orchestration selv
6. FlowiseAI/Flowise — no-code LLM-flow-builder → Bruk til rask prototyping av nye graf-noder før du hardkoder dem
7. letta-ai/letta (tidl. MemGPT) — langtidsminne for agenter → Integrer som minnelag i AI Empire-agentene for ekte persistent kontekst
8. run-llama/llama_index — RAG/data-framework → Bygg RAG over patentdatabase + egen forskningsarkiv for RESEARCH_NODE
9. Significant-Gravitas/AutoGPT — autonom agent-loop pioneer → Studer loop-arkitekturen, ikke bruk direkte — for ustabil, men mønsteret er gull
10. geekan/MetaGPT — simulert softwarefirma av agenter → Test på ett faktisk vibe-code-prosjekt, se om "firma"-metaforen faktisk gir bedre output
11. e2b-dev/E2B — sikre kodesandkasser for agenter → Bruk som eksekveringslag for din agent-graf istedenfor rå shell-tilgang
12. BerriAI/litellm — unified LLM API-proxy → Sett foran alle agentene dine for enkel modellbytte og kostnadslogging
13. promptfoo/promptfoo — prompt-testing/eval-rammeverk → Bruk til å automatisk score CRITIC_MUTATOR-output mot forrige batch
14. Aider-AI/aider — AI-pair-programmer i terminal → Bruk direkte som din daglige vibe-coding-drivverktøy på 48t-sprintene
15. browser-use/browser-use — agent som styrer nettleser → Fork til å automatisk research'e GitHub-trender for neste RESEARCH_NODE-loop

## Modeller, inferens & edge AI (16-30)
16. ggerganov/llama.cpp — lokal LLM-inferens i C++ → Kjør quantized modell på lav-strøm hardware for Arctic edge AI-testing
17. ollama/ollama — enkel lokal modell-runtime → Bruk som lokal worker-node i graf-runtimen for kostnadsfrie loops
18. vllm-project/vllm — høyytelses inferens-server → Selfhost for batch-generering av 100+ enheter uten API-kostnad
19. huggingface/transformers — modell-hub og inferens → Hent liten kvantisert modell for on-device drone-inferens-test
20. mlc-ai/mlc-llm — LLM på edge-enheter (mobil/embedded) → Test kompilering av liten modell for Raspberry Pi-basert drone-controller
21. karpathy/llm.c — minimal LLM-trening i rå C → Studer for å forstå faktisk kostnad ved custom-trening av liten domenemodell
22. openai/whisper + guillaumekln/faster-whisper — tale-til-tekst → Bygg rå video-dagbok-transkribering for build-in-public-content
23. suno-ai / community Suno-wrappers — AI-musikkgenerering-integrasjon → Bygg script som pipe'r SONG_FORGE_NODE-prompts direkte til Suno-kø
24. coqui-ai/TTS — open source tale-syntese → Test norsk TTS for AI-opplest gonzo-podcast-format (research-tema 98)
25. suno-ai/bark — tekst-til-lyd med emosjon → Test for dramatisk opplesning av NAV-vedtak-podcast-konseptet
26. RVC-Project/Retrieval-based-Voice-Conversion — stemmekloning → Vurder etisk bruk for satire-voiceover (med tydelig disclaimer)
27. huggingface/candle — Rust ML-inferens-rammeverk → Test for lav-latency edge-inferens på drone-hardware
28. tinygrad/tinygrad — minimal deep learning-rammeverk → Studer for å bygge egen minimal inferensmotor til embedded drone-bruk
29. NVIDIA/TensorRT — inferens-optimalisering → Test på Jetson-klasse hardware for drone edge AI
30. onnx/onnx + onnxruntime — portabelt modellformat → Konverter trente modeller for kryssplattform edge-deploy (drone/mobil)

## Generativ visuell/video/lyd (31-45)
31. comfyanonymous/ComfyUI — nodebasert Stable Diffusion-workflow → Bygg egen node-graf for gonzo Banksy-bildeserie med reproduserbare seeds
32. AUTOMATIC1111/stable-diffusion-webui — SD-webgrensesnitt → Bruk til rask batch-testing av 25 bildeprompts fra VISUAL_NODE per runde
33. lllyasviel/Fooocus — forenklet SD-generering → Bruk for rask iterasjon når ComfyUI-graf er for treg for 48t-deadline
34. guoyww/AnimateDiff — bilde-til-video-animasjon → Test for video-prompts som trenger statisk-til-bevegelse-overgang
35. Stability-AI/stable-video-diffusion — video-generering fra bilde → Pipe gonzo-bilder direkte inn for automatisk video-variant
36. XPixelGroup / Real-ESRGAN — bildeoppskalering → Bruk som siste steg i pipeline for print-klar Banksy-kvalitet
37. invoke-ai/InvokeAI — profesjonell SD-arbeidsflate → Vurder for konsistent stil-styring på tvers av 100 bilder (samme seed-familie)
38. facebookresearch/AnimatedDrawings — statisk bilde til enkel animasjon → Test for rask, billig "levende" versjon av bilde-satire
39. Zulko/moviepy — programmatisk videoredigering i Python → Bygg auto-pipeline: 100 videoprompts → generert klipp → auto-cut til reel-format
40. remotion-dev/remotion — video laget med React/kode → Bygg templated video-generator for daglig gonzo-content uten manuell redigering
41. ffmpegwasm/ffmpeg.wasm — ffmpeg i nettleser → Bygg klientside video-prosessering direkte i miniapp uten server-kostnad
42. suno-ai community repos for Suno-API-wrapping → Automatiser hele SONG_FORGE_NODE-outputen til faktiske audio-filer
43. facebookresearch/audiocraft (MusicGen) — open source musikkgenerering → Test som gratis alternativ/supplement til Suno for raske iterasjoner
44. haoheliu/AudioLDM — tekst-til-lyd-generering → Test for atmosfærisk lyddesign til video-prompts (drone-swarm-lyd, industri-techno-tekstur)
45. camenduru — samling av Colab-notebooks for generative modeller → Bruk som rask "prøv før du bygger"-lag før du forplikter deg til en modell

## Biomimicry / drone / robotikk (46-60)
46. PX4/PX4-Autopilot — open source drone-autopilot → Fork og modifiser flight-controller-logikk for biomimetisk vingekontroll-test
47. ArduPilot/ardupilot — moden open source autopilot-stack → Test SITL-simulering av biomimetisk flappende-vinge-konsept før fysisk bygg
48. dronekit/dronekit-python — Python-API for dronekontroll → Bygg raskt kontrollscript for sverm-koordinering-prototype
49. mavlink/MAVSDK — kommunikasjonsprotokoll for droner → Bruk som kommunikasjonslag for sverm-til-solo-handoff-mekanismen (patent-idé 97)
50. OpenDroneMap/ODM — droneopptak til kart/3D-modell → Bruk for kartlegging-pilot (Arctic is-kartlegging, tema 49)
51. betaflight/betaflight — FPV-racing flight controller-firmware → Fork for rask, lettvekts kontroll-loop-test på mikrodrone-prototype
52. bulletphysics/bullet3 (PyBullet) — fysikksimulator → Simuler boid/sverm-algoritmer og biomimetisk vingemekanikk før fysisk bygg
53. isaac-sim / Isaac Lab (NVIDIA) — robotikk-simulering med RL → Test reinforcement learning på biomimetisk gangart/flukt-kontroll
54. ros2/ros2 — robot operating system → Bygg modulær sensor-fusion-stack for compound-eye-kamera-prototype
55. RoboMaster/RoboRTS eller lignende sverm-repos — sverm-koordinering-kode → Studer for stigmergi-implementasjon (research-tema 42)
56. clearpathrobotics — robotikk-simuleringsverktøy → Test terrengnavigasjon for arktisk bakke-drone-hybrid
57. formlabs / open source soft-robotics-prosjekter (t.eks. soft-robotics-toolkit) — myk aktuator-design → Bruk som referanse for gekko-landing/myk-robotikk-prototype
58. INAV — alternativ flight-controller-firmware for navigasjon → Test for GPS-fri ekkolokaliserings-navigasjonsmodul-integrasjon
59. betaflight/inav-configurator eller QGroundControl — bakkestasjon-software → Fork UI for arktisk bruk (lesbar i sollys/kulde, store touch-targets med hansker)
60. ArduPilot/SITL-antenna-tracker / lignende — antennesporing for lang-rekkevidde → Vurder for norsk kyst/fjell-drone-drift med signalproblemer

## Mental health tech (61-70)
61. HealthRex/CDSS eller lignende åpne klinisk-beslutningsstøtte-repos — beslutningsstøtte-mønstre → Studer arkitektur for triage-flow i AI-terapeut-hybrid (tema 72)
62. openhumans/open-humans — personvern-first helsedata-plattform → Bruk arkitekturmønster for lokal-first datalagring i Rolig Pusterom
63. HeartyPatel / HRV-analyse-repos (åpen kildekode HRV-verktøy) — hjertefrekvensvariabilitet-analyse → Integrer i pustesensor-kalibrering (patent-idé 86)
64. mne-tools/mne-python — EEG/biosignal-analyse i Python → Test for fremtidig EEG-basert stress-deteksjon-utvidelse
65. neurotechx / OpenBCI-repos — åpen kildekode hjerne-datamaskin-grensesnitt → Vurder for avansert biofeedback-lag i mental helse-produktet
66. mindsdb/mindsdb — ML rett i databasen → Bruk for rask prediktiv modell på søvn/stemning-korrelasjon uten separat ML-pipeline
67. huggingface — åpne sentiment/emotion-klassifiseringsmodeller → Bruk for krise-deteksjon fra skriftmønster (tema 74) med streng personvern-wrapper
68. signal-analysis / voice-biomarker-forskningsrepos — stemme-biomarkør-verktøy → Test åpne datasett mot enkel klassifikator (tema 82)
69. matomo-org/matomo — personvern-first analytics (selfhosted) → Bruk istedenfor Google Analytics på alle mental helse-produkter — ingen tredjeparts datalekkasje
70. supabase/supabase — open source Firebase-alternativ → Bruk som backend for Rolig Pusterom med full datakontroll (ikke lock-in til Google/AWS)

## Vibe-code fullstack / creative-tech (71-90)
71. vercel/next.js — fullstack React-rammeverk → Standard-scaffold for alle nye miniapper, 48t fra idé til deploy
72. shadcn-ui/ui — kopierbar komponent-bibliotek → Bruk som rå UI-lag, tilpass tokens til gonzo Banksy-merkevare
73. tailwindlabs/tailwindcss — utility-first CSS → Standard styling-lag for rask iterasjon uten designsystem-overhead
74. supabase/supabase (igjen, som generell backend) — auth+db+storage on-demand → Backend for alt fra dronedata til sanglogg
75. vercel/ai (Vercel AI SDK) — streaming AI-UI-primitiver → Bygg chat/agent-UI for AI Empire-produktene med minimal boilerplate
76. cloudflare/workers-sdk — edge-compute-plattform → Deploy lette agent-endepunkter med lav latency globalt
77. sveltejs/svelte — lettvekts frontend-rammeverk → Test som raskere alternativ til React for enkle, høy-ytelse miniapper
78. framer/motion — animasjonsbibliotek for React → Bruk for å gjøre gonzo-visuelle konsepter levende i miniapp-format
79. excalidraw/excalidraw — open source håndtegnet diagram-verktøy → Fork for rå, uredigert skisse-verktøy i build-in-public-content
80. n8n-io/n8n — open source workflow-automatisering → Koble RESEARCH_NODE-output automatisk til Notion/Airtable-backlog
81. huggingface/chat-ui — open source chat-grensesnitt → Fork som base for egen agent-chat-frontend
82. calcom/cal.com — open source møtebooking → Bruk/fork for booking av eventuelle mental helse-produkt-konsultasjoner
83. plausible/analytics — personvern-first analytics → Alternativ til Matomo, enklere selfhost for raske prosjekter
84. directus/directus — headless CMS/data-plattform → Bruk som rask backend-admin for content-pipeline (100 sanger/bilder/videoer-arkiv)
85. strapi/strapi — headless CMS → Alternativ til Directus for content-tung del av AI Empire (song/visual-arkiv)
86. resend/resend + react-email — transaksjonell e-post-utvikling → Bygg daglig digest-e-post av DAILY_EXECUTOR-output
87. tldraw/tldraw — infinite canvas-bibliotek → Bygg visuelt graf-dashboard for Hermes Loop-orkestrering selv
88. mermaid-js/mermaid — diagram-som-kode → Visualiser graf-eksekvering (denne loopen) som faktisk diagram i dashboard
89. pmndrs/react-three-fiber — Three.js i React → Bygg 3D-visualisering av dronesverm-simulering i nettleser
90. jgraph/drawio (diagrams.net) — diagramverktøy → Bruk for rask patentskisse (mekanisk tegning) før formell søknad

## Norsk systemkritikk / satire-tech / arkiv (91-100)
91. common-crawl / offentlig-tilgjengelig norsk offentlig-data-scraping-verktøy — datainnsamling → Bygg scraper for offentlige NAV/kommune-dokumenter til faktabasert satire
92. simonw/datasette — utforsk og publiser datasett som nettsted → Publiser scraped offentlig data som søkbart satire-faktagrunnlag
93. archivebox/archivebox — selfhosted nettarkivering → Arkiver kilder til gonzo-satire før de slettes/endres (integritet i kritikken)
94. github.com/public-apis/public-apis — katalog over offentlige API-er → Finn norske offentlige API-er (SSB, Kartverket) for datadrevet satire
95. jgm/pandoc — universal dokumentkonvertering → Automatiser konvertering av rå tekst-dagbok til flere publiseringsformater
96. gohugoio/hugo — statisk nettstedsgenerator → Bygg rask, versjonert publiseringsside for "Systemfeil"-dagboken (tema 89)
97. obsidianmd / open source Obsidian-plugin-repos — lenket notatsystem → Bygg personlig kunnskapsgraf som mater RESEARCH_NODE direkte
98. logseq/logseq — open source lenket-notater, lokal-first → Alternativ til Obsidian for build-in-public rå notat-arkiv
99. restic/restic — rask, sikker backup-verktøy → Sikre hele AI Empire-arkivet (kode+content+forskning) automatisk, kryptert
100. git-lfs/git-lfs — versjonering av store filer → Bruk for å versjonere de 100 genererte bildene/videoene sammen med koden i samme repo
