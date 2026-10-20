# STAFETT — marked v0.1

Jeg har gravd. Her er det jeg fant, merket. Ingen tall uten kilde, og ingen kilde uten at jeg sier hvor svak den er.

## 1. Problemet finnes — i tall

| Påstand | Merking | Kilde |
|---|---|---|
| ~25 % av voksne nordmenn hadde rentebærende usikret gjeld i 2025 | DOKUMENTERT (forskning) | [OsloMet/SIFO](https://www.oslomet.no/forskning/forskningsnyheter/gjeldsregisteret-hjelper-bankene-men-oker-presset-pa-lantakere) |
| 171 407 personer (4 %) hadde utleggstrekk i 2025; 69 % av dem hadde rentebærende kreditt | DOKUMENTERT (forskning) | samme |
| Over 50 000 personer har mer enn en halv million i usikret kreditt | DOKUMENTERT (forskning) | samme |
| Misligholdt forbruksgjeld 59,6 mrd. kr ved utgangen av 2023, snitt 91 300 kr per inkassosak | DOKUMENTERT (tilsyn) | [Finanstilsynet, forbruksgjeld](https://www.finanstilsynet.no/4990ef/contentassets/aaf5f43e56c8450b97ba4a50190679eb/rapport-om-utviklingen-i-forbruksgjeld-april-2025.pdf) |
| Total usikret gjeld 177,3 mrd. kr ved utgangen av 2025 | UAVKLART (sekundærkilde, tall spriker) | [kortio.no](https://kortio.no/undersokelser/total-kredittkortgjeld-i-norge/) |
| Forbrukertilsynet: «Kjøp nå, betal senere» *er* kreditt; påbud med tvangsmulkt 9 mill. kr/uke (2024) | DOKUMENTERT (vedtak) | [Forbrukertilsynet](https://www.forbrukertilsynet.no/wp-content/uploads/2024/07/pabudsvedtak-med-tvangsmulkt-klarna.pdf) |
| Forbrukerrådet (2025): unge forstår ikke at «ta det på Klarna» er kreditt | DOKUMENTERT som *klage*, ikke vedtak | [Vixio](https://www.vixio.com/insights/pc-norwegian-consumer-council-reports-klarna-breaching-regulatory-requirements) |

Ni millioner kroner. Per uke. Det var tvangsmulkten staten mente måtte til for å få et selskap til å si at kreditt er kreditt. Og jeg skal selge en 1 490-kroners dings til folk med utleggstrekk? Ja. Men ikke på avbetaling. Se `OKONOMI.md`, punkt 3.

## 2. Hvem dette egentlig er for

| Segment | Størrelse | Merking |
|---|---|---|
| Mennesker med DID / dissosiative lidelser | 1,1–1,5 % livstidsprevalens oppgis ofte, men er en sammensatt sekundærverdi. Enkeltstudier: 1,1 % (Tyrkia, kvinner, 2007), 0,4 % (Tyrkia, 1999), 1,5 % 12-mnd (New York, 2006) | UAVKLART — spriker, se [Wikipedia-oppsummering](https://en.wikipedia.org/wiki/Dissociative_identity_disorder) og [SAGE](https://sk.sagepub.com/ency/edvol/embed/the-sage-encyclopedia-of-abnormal-and-clinical-psychology/chpt/dissociative-disorders-epidemiology) |
| Bredere: alle som «mister tid» — ADHD, dissosiasjon ved PTSD, depresjon, søvnløshet | ikke tallfestet her | HYPOTESE |
| Bredest: alle som kjøper impulsivt på kreditt og vil ha en pause-knapp | jf. 25 % med rentebærende usikret gjeld | HYPOTESE om andel som ønsker et fysisk verktøy |

**Kjernebrukeren** (for prototypen): én person, ett system, ett skrivebord. Som deg.
**Første marked**: Norge, norsk språk, direkte salg. Ikke Amazon. Ikke Klarna.

Om behandlingsrammen, uten å love noe: ISSTD-kursmateriale lister *skriftlig* kommunikasjon som en teknikk for indre kommunikasjon. Et ISSTD-kurs kobler det å vite «hvem sine tanker er hvem» til impulskontroll og sikkerhet ([ISSTD kursside](https://cfas.isst-d.org/node/1959), [Steele/Boon/van der Hart-utdrag](https://cfas.isst-d.org/sites/default/files/course/2024-09/ISSTD%20-%20L2.2%20Accel%2C%20Class%2013.docx)). DOKUMENTERT som kursmateriale. **Ikke** en retningslinje, og **ikke** bevis for at Stafett virker. Stafett påstår ingen helseeffekt.

## 3. Konkurrenter og naboer

| Produkt | Hva | Pris | Hvorfor ikke det |
|---|---|---|---|
| **Simply Plural** | app for plurale systemer: medlemmer, fronting, chat, avstemning | gratis / engangskjøp $2–7 ([AlternativeTo](https://alternativeto.net/software/simply-plural/about)) | lever i telefonen — i lomma til den delen som har den. Sky-synk. |
| **Plural Star** | ende-til-ende-kryptert, «Observatory Mode» som journal ([Buy Me a Coffee](https://buymeacoffee.com/pluralstar/the-current-state-plural-star)) | donasjon | samme: telefon, ingen fysisk tilstedeværelse |
| **PluralKit** | Discord-bot | gratis | sosialt verktøy, ikke overlevering |
| **TRMNL** | e-blekk-ramme 7,5", ESP32, åpen fastvare | $139 ([Liliputing](https://liliputing.com/trmnl-is-a-139-wifi-enabled-e-ink-display-with-open-source-firmware-you-can-also-make-one-from-a-jailbroken-kindle/)) | dashbord for sky-tjenester; ingen inndata, ingen lokal logikk |
| **Budsjett-apper** (Spiir, bank-apper) | kategoriserer kjøp *etterpå* | gratis | ser kjøpet etter at det har skjedd. Antar én bruker. |
| **Ønskeliste/«vent 30 dager»-regler** | folkevett | gratis | finnes ikke som *ting* i rommet |

**Hullet:** Ingen av dem er en fysisk gjenstand som står der når du kommer tilbake. Ingen av dem antar at den som kommer tilbake, er en annen enn den som gikk.

## 4. Posisjonering

> *Stafett er ikke en budsjett-app. Det er en notatbok med skjerm for et hode med flere sjåfører.*

- **Pris:** 1 490 kr ferdig / 690 kr bygg-selv-sett / programvaren gratis (i Pusterom).
- **Kanal:** egen nettside + 3D-print-miljøer (Printables) for byggesettet. Organisasjoner som jobber med gjeldsrådgivning og traumer, som *samarbeidspartnere*, ikke som salgskanal.
- **Løfte:** lokal, ingen konto, ingen sky. Ingen helsepåstander.

## 5. Det jeg ikke vet (og må finne ut før én eneste enhet selges)

1. **Virker det?** Én bruker, fire uker, prototypen på pulten. Mål: antall noter, antall ting i kjølerommet, hvor mange droppet. UAVKLART til det er gjort.
2. **Vil folk betale for en fysisk ting når telefonen gjør det samme?** HYPOTESE: ja, fordi telefonen følger den delen som har den. Kan være feil.
3. **Er det trygt?** Kan en del bruke noter mot en annen? Designvalg demper det (ingen sletting, ingen straff), men det må testes med en behandler i rommet. UAVKLART.
4. **CE/RED-kostnad** er anslått, ikke tilbudt. Be tre lab-er om pris (en norsk, en tysk, en kinesisk).
