# 05 Testplan og pilotplan – «Stille vakt»

Merking: `[modell]` · `[antakelse]` · `[kilde]`. **Ingenting er testet ennå.** Kravene i `00_brief.md` (K1–K9) holder
først når testene under er bestått. Testene kommer i to lag:
- **Lag 1, laboratorium** (kantmodul SV-1 og strimmel): T1–T10. Avgjør om hjelpemiddelet er trygt og gjør jobben sin.
- **Lag 2, pilot i kommune** (system = utstyr + arbeidsmåte): P1–P9. Avgjør om beboerne får det bedre, og hva det koster.

## Status for kravene i modellen før test

| Krav | Grense | Modell, pilotvariant P (mid / pessimistisk) | Holder? |
|---|---|---|---|
| K1 Ingen kamera/mikrofon | 0 | 0 (ingen i designet) | Ja, ved konstruksjon |
| K2 QALY | ≥ 3 per 100/år, > 0 pess. | 4,29 / 3,04 `[modell]` | Ja, men marginen i pess. er 1 % |
| K3 ICER | ≤ 275 000 kr/QALY | dominant / 109 000 `[modell]` | Ja, med god margin |
| K4 Netto kommune | ≤ 13 000 kr/beb/år | 757 / 4 960 `[modell]` | Ja, med god margin |
| K5 Fall | ≤ 3,0 per 1000 døgn | 3,03 / 3,19 `[modell]` | **Nei, knapt bom.** Se P+ under |
| K5 Hoftebrudd | −25 % | −19 % / −15 % (P). P+ (+ hoftebeskytter og lav seng for høyrisiko): **−39 % / −31 %** `[modell]` | Bare med P+ |
| K6 Frigjort tid | ≥ 15 t/beb/år | 34 / 22 `[modell]` | Ja |
| K6 Kontakt | ≥ 3 min/beb/døgn | 3,4 / **2,2** `[modell]` | **Bare i mid.** Mottiltak: kontakttid legges fast i turnus (P4) |
| K7 Falske alarmer | ≤ 0,14 per natt | 0,04 `[modell]` | Ja |
| K8 Jus | DPIA, vedtak, stopp ved motstand | prosess | Testes i P1 |
| K9 Kantmodul | ≥ 90 døgn osv. | 259 døgn `[modell]` | Testes i T1–T10 |

## Lag 1 – laboratorietester av SV-1 (prototype P1, 10 enheter)

| # | Krav | Testmetode | Utstyr | Utvalg | Bestått-kriterium | Kost (NOK) | Tid |
|---|---|---|---|---|---|---|---|
| T1 | K9 batteri | Mål strøm (hvile, radio, lys) og ekstrapoler. Akselerert syklus med 20 sitte-opp per natt | Strømanalysator (Otii/Joulescope), 4 × 18650 | 5 enheter | Snittforbruk ≤ 0,30 Wh/døgn ⇒ ≥ 130 døgn (krav 90 + 40 % margin). Varsel om lavt batteri ≥ 30 døgn før tomt | 25 000 | 3 uker |
| T2 | K7 og deteksjon | Seng med madrass og strimmel. 20 forsøkspersoner (60–90 kg, 3 madrasstyper) gjør 400 skriptede hendelser (sitte opp, snu, drikke, gå ut). Ett døgn reell søvn per person | Pleieseng, video **bare i lab** som fasit, logger | 20 personer, 8 000 hendelser | «Ute av seng» oppdaget ≥ 99 % innen 10 s. «Sitter opp» ≥ 60 %. Falske ≤ 0,14 per natt (øvre 95 %-KI ≤ 0,25). d′ ≥ 2,0 | 120 000 | 6 uker |
| T3 | Responstid | Tid fra hendelse til varsel på pleiers telefon via pasientvarsling (Thread → gateway → pasientvarslingssystem) | Gateway, 2 leverandører av pasientvarsling | 500 varsler | Median ≤ 3 s, 99-persentil ≤ 10 s. 0 tapte varsler | 30 000 | 2 uker |
| T4 | Fail-safe | Ta ut batteri, blokker radio og koble fra strimmel | Skjermet boks | 50 forsøk per feil | 100 % gir «ingen kontakt»-varsel innen 10 min, og beboeren flyttes til 3 t-tilsyn i listen | 10 000 | 1 uke |
| T5 | K9 gulvlys | Lux målt i rutenett på 0,5 m² ved sengekant, spektrum og CCT, tid til fullt lys | Luxmeter, spektrometer | 10 enheter | 5–15 lux på ≥ 80 % av flaten. CCT ≤ 2200 K. Ingen blending (IEC 62471 fri gruppe). Myk opptenning 1–2 s | 15 000 | 1 uke |
| T6 | K9 IPX4 | IEC 60529 sprut | Akkreditert lab | 3 enheter | Ingen vann inne, fungerer etterpå | 20 000 | 1 uke |
| T7 | Trykksår | Trykkmapping med og uten strimmel under 3 madrasstyper | Trykkmatte (XSENSOR) | 10 personer | Ingen økning i topptrykk > 5 mmHg over strimmelen | 30 000 | 2 uker |
| T8 | Mekanikk og klemfeste | 15–30 mm rammer, 5 sengemodeller. 50 N sidelast, 1 000 rengjøringsrunder, fall 1 m | Kraftmåler, falltest | 5 enheter | Sitter fast. Ingen sprekk. Ingen skarpe kanter (EN 60601-1 / GPSR kantsjekk) | 15 000 | 2 uker |
| T9 | Desinfeksjon | 500 sykluser med 70 % alkohol og 1000 ppm klor | Tørkeklut, testrigg | 3 enheter | Ingen sprekk eller misfarging. Fortsatt IPX4 | 10 000 | 3 uker |
| T10 | Sabotasjesikkerhet | 10 beboerlignende brukere (pårørende og frivillige, ikke beboere) prøver å åpne luken uten verktøy | Brukertest | 10 personer | 0 åpnet. Ingen deler < smådelssylinder (EN 71-1-mål som referanse) | 5 000 | 1 dag |
| T11 | Regelverk | RED (EN 300 328, EN 301 489), EMC, IEC 62368-1, IEC 62133-2/UN 38.3 (celler), RoHS, batteriforordningen-merking | Akkreditert lab (Nemko o.l.) | 3 enheter | Godkjent, CE-samsvarserklæring signert | 180 000 | 8 uker |

**Sum lag 1:** ≈ 460 000 kr og ≈ 4 måneder (delvis parallelt) `[antakelse]`.

## Lag 2 – pilotplan for en norsk kommune

**Design:** stegvis klyngerandomisert innføring (*stepped wedge*) i **4 avdelinger à ≈ 25 plasser (≈ 100 beboere)** i 1–2
sykehjem, pluss **50 hjemmetjenestebrukere med nattlig tilsyn**. Alle avdelingene starter med 3 måneders baseline. Deretter går én avdeling
over hver 3. måned i tilfeldig rekkefølge. Slik blir hver avdeling sin egen kontroll, og alle får tiltaket til slutt. Det er etisk
lettere å forsvare enn en ren kontrollgruppe.

**Forskningspartner:** SEFAS/UiB (MOBID-2, COSMOS) eller SINTEF/NTNU (digitalt tilsyn). REK-søknad (helseforskningsloven) fordi vi samler helseopplysninger til forskning.

### Tidslinje (18 måneder)
| Mnd | Aktivitet | Ressurs |
|---|---|---|
| −3 – 0 | Forankring i kommuneledelse og tillitsvalgte. DPIA (GDPR art. 35) med personvernombud. Risikovurdering etter Normen. REK. Rutine for samtykke og vedtak etter § 4-6a | Prosjektleder 50 %, jurist, personvernombud |
| 0 – 3 | Baseline i alle avdelinger: fall, MOBID-2, QUALID/EQ-5D-proxy, tidsstudie av natt | Forsker 50 %, 2 superbrukere |
| 3 | Avdeling 1 starter: montering, opplæring (2 dager), mimamori-team i gang | Leverandør, superbrukere |
| 6 / 9 / 12 | Avdeling 2, 3 og 4 starter. Hjemmetjenesten starter ved mnd 6 | – |
| 12 – 15 | Alle på tiltak. Gevinstrealisering: turnusen endres så frigjort tid blir planlagt kontakttid | HR, tillitsvalgte |
| 15 – 18 | Analyse, kostnadseffekt, rapport, beslutning om innføring i hele kommunen | Forsker, økonomi |

### Pilotmålinger
| # | Krav | Mål | Metode | Bestått-kriterium (pilot) |
|---|---|---|---|---|
| P1 | K8 Jus og verdighet | Andel beboere med gyldig samtykke eller vedtak før oppstart. Antall motstandsepisoder som ble stoppet. Klager | Revisjon av journal, personvernombud | 100 % gyldig grunnlag. 0 tilfeller av tiltak mot motstand uten kap. 9-vedtak. 0 avvik til Datatilsynet |
| P2 | K5 Fall | Fall per 1000 beboerdøgn fra avvikssystemet (samme definisjon før og etter) | Avvik + journal, blindet koding | Ned ≥ 15 % mot baseline (rate ratio, 95 %-KI rapporteres). Hoftebrudd telles, men piloten er for liten til å vise effekt (≈ 3 per år) |
| P3 | K6 Tid | Pleietid på natt: tidsstudie 2 uker før og 2 uker etter, per avdeling | Arbeidstidsstudie (observatør + app) | Nattlige runder ned ≥ 60 %. Frigjort ≥ 15 t/beb/år |
| P4 | K6 Kontakt | Planlagt og registrert 1:1-tid («mitt kvarter») per beboer | Turnus og registrering i EPJ som tiltak | ≥ 3 min/beb/døgn i snitt over 3 mnd. **Legges inn i turnus som fast tiltak, ikke som «hvis tid blir til overs»** |
| P5 | K2 Livskvalitet | QUALID (proxy) og EQ-5D-5L proxy. Søvn (aktigrafi hos 20 beboere med samtykke eller vedtak) | Måling ved baseline, 3 og 6 mnd | QUALID bedre med ≥ 3 poeng. Våkne episoder per natt ned ≥ 25 % |
| P6 | Smerte | MOBID-2 hver måned. CMAI (agitasjon) | Sykepleier, mimamori-team | Andel med MOBID-2 ≥ 3 ned ≥ 20 %. CMAI ned ≥ 10 % (Husebø: 17 %) |
| P7 | K7 | Falske alarmer per beboer-natt, logget i kantmodulen | Logg (bare hendelser) | ≤ 0,14 |
| P8 | K4 Kost | Faktisk kost (utstyr, lisens, opplæring, timer) mot verdien av frigjort tid | Regnskap | Netto ≤ 13 000 kr/beb/år |
| P9 | Arbeidsmiljø | Ansattes opplevde belastning og trygghet (QPS Nordic-utdrag). Turnover | Spørreskjema | Ikke dårligere enn baseline. ≥ 70 % vil fortsette |

**Styrke:** Med ≈ 100 beboere, 1,37 fall per beboer-år (≈ 137 fall per år) og 12 mnd før/etter kan piloten påvise en reduksjon i fallraten
på ≈ 30 % med 80 % styrke (Poisson, α = 0,05, uten klyngekorreksjon) `[modell, grovt]`. Fall klumper seg hos få beboere (overspredning), og avdelingene
er klynger. Reelt minste påvisbare effekt er derfor ≈ 40 %. Modellen venter ≈ 19 %. **Piloten kan altså ikke bevise fallgevinsten.
P2 rapporterer punktestimat og KI, ikke signifikans. Livskvalitet, smerte og tid er hovedmålene.** Hoftebrudd krever en multisenterstudie (≈ 2 000 beboer-år).

**Stoppregler:** Piloten stoppes i en avdeling ved (a) to alvorlige hendelser der en beboer lå uoppdaget > 60 min på grunn av systemet, (b) brudd på K1 eller
K8, eller (c) dobbelt så mange fall som i baseline over 2 måneder.

**Budsjett, pilot** `[antakelse]`: utstyr 150 enheter × 6 900 = 1,04 MNOK · gateway og integrasjon 0,30 · opplæring og veiledning 0,24 ·
prosjektleder og forsker (1,5 årsverk) 1,8 · tidsstudier og frikjøp 0,6 · DPIA, jurist, REK 0,15 · vaske-tørke-toalett (4 stk) 0,32 · kosedyr,
hoftebeskyttere, lave senger/matter 0,25. **Sum ≈ 4,7 MNOK** (krav ≤ 5 MNOK). Mulig finansiering: Helsedirektoratets kompetanse- og
innovasjonstilskudd, Forskningsrådet (Offentlig sektor-ph.d. / innovasjonsprosjekt i offentlig sektor), KS FoU.

## Hvordan målingene skal inn i `score()` for neste versjon
1. **T2 → `SENSOR["matte"]`:** bytt antatt d′ (2,2) med målt d′ og målt bakgrunnsrate N (hendelser per natt) i `problem.py`. Da følger falske alarmer og treffrate direkte.
2. **T1 → `enhet_sv1()`:** bytt antatt effekt (MCU, radio, forsterker) med målt Wh/døgn.
3. **T3 → responstid:** bytt antatt median og σ for R i `p_raskere()`.
4. **P2 → fallmodell:** bytt antatte andeler (35 % fra seng, 15 % toalett) og effekt per tiltak med pilotens rate ratio og 95 %-KI. Kjør robusthet med nedre KI-grense som pessimistisk scenario.
5. **P3/P4 → tid:** bytt `kontaktandel`, andel natt som kan flyttes (75 %) og minutter per runde med målte verdier.
6. **P5/P6 → QALY-vekter:** QUALID og EQ-5D endring per komponent erstatter antatte vekter for søvn, kontakt og smerte. Dette er den viktigste oppdateringen fordi søvn + kontakt + smerte står for 75 % av gevinsten i modellen.
7. **P8 → kost:** bytt kostpostene med regnskapstall.
8. Kjør `python3 -m maskin produkter/hoyteknologisk_eldreomsorg_inspirert --fokus livskvalitet_per_krone` og `varianter.py` på nytt, og oppdater RAPPORT.md med `[målt]`-merker.
