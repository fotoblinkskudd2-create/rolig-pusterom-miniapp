# 4. Vibe Code-design og taksonomi

Maskinlesbar kilde: [`data/vibe_codes.json`](../data/vibe_codes.json), 12 koder, taksonomi `2026.10.0`.

## Mal for en Vibe Code

| Felt | Påkrevd | Beskrivelse |
|---|---|---|
| `id` | ja | `VC-###`, aldri gjenbrukt |
| `slug` | ja | `kebab-case`, stabil |
| `name` | ja | Kort, beskrivende, ikke-dømmende («Tilbaketrekning», ikke «Asosial») |
| `definition` | ja | Én til to setninger om **observerbar opplevelse eller atferd**, ikke diagnose |
| `category` | ja | belastning, atferd, kognisjon, fysiologi, stemningsleie, relasjon, livssituasjon, bevissthet, ressurs, sikkerhet |
| `priority` | ja | P0 sikkerhet · P1 følg opp snart · P2 utforsk · P3 orientering |
| `trigger_signals.patterns` | ja | Regex, case-insensitive, med ordgrenser |
| `trigger_signals.semantic_examples` | ja (≥ 3) | Realistiske utsagn. Blir prototypevektorer |
| `counter_examples` | ja (≥ 2, ikke P0) | Utsagn som ligner, men **ikke** skal utløse koden. Brukes i test og annotasjon |
| `recommended_actions[]` | ja | `{audience: fagperson|sluttbruker, type, text}` |
| `related_codes` | nei | Faglig nærliggende |
| `composition.amplified_by` | nei | Koder som forsterker denne når de opptrer samtidig (vekt × 1,25 + merknad) |
| `safeguards` | P0/P1 | Regler for hva systemet aldri skal gjøre med koden |
| `escalation` | P0 | `immediate_human_review` |

**Skriveregler:** beskriv opplevelse, ikke person («beskriver tidstap», ikke «er dissosiativ»). Tiltak skal være små, konkrete og frivillige. Ingen kode for diagnoser.

## De 12 kodene

| ID | Navn | Pri | Trigger-eksempler (regex) | Utløsende observasjon | Moteksempel (skal ikke utløse) | Anbefalt handling (fagperson / sluttbruker) |
|---|---|---|---|---|---|---|
| VC-001 | Overveldet | P2 | `for mye`, `overveld*`, `drukner`, `rekker ikke` | «Alt kommer på en gang og jeg rekker ingenting» | «Mye å gjøre, men god oversikt» | Sorter de neste 24 t / «Skriv tre ting, velg én» |
| VC-002 | Tilbaketrekning | P2 | `isoler*`, `avlys*`, `holder meg hjemme` | «Avlyste middagen igjen, orket ikke folk» | «Trengte en rolig kveld alene, det var godt» | Skill hvile fra unngåelse / «Send én kort melding» |
| VC-003 | Grubling | P3 | `kverne*`, `grubl*`, `får det ikke ut av hodet` | «Kverner på den samtalen om og om igjen» | «Tenkte gjennom saken og bestemte meg» | Bekymringstid / 10-minutters skrivetimer |
| VC-004 | Høy aktivering | P1 | `panikk*`, `hjertebank*`, `får ikke puste` | «Hjertet hamret og jeg fikk ikke puste på bussen» | «Hjertet banket etter løpeturen» | Psykoedukasjon om stress / lang utpust + 5-4-3-2-1 |
| VC-005 | Lav energi / nedstemthet | P1 | `orker ingenting`, `tomhet`, `ingen energi` | «Orker ingenting og ligger bare i senga» | «Lav energi fordi jeg trente hardt i går» | Kartlegg varighet og håpløshet / én liten ting som pleide å hjelpe |
| VC-006 | Selvkritikk og skam | P2 | `skam*`, `verdiløs`, `en byrde`, `hater meg selv` | «Føler meg som en byrde for alle» | «Litt flau, men det går over» | Selvmedfølelse, sjekk sikkerhet ved «byrde» / «Hva ville du sagt til en venn?» |
| VC-007 | Relasjonell spenning | P3 | `krangl*`, `konflikt*`, `svik*` | «Bare konflikt hjemme for tiden» | «Uenige, men snakket det ut» | Kartlegg trygghet, rutine for vold i nære relasjoner / «Hva trenger du, i én setning?» |
| VC-008 | Økonomisk stress | P2 | `gjeld*`, `inkasso*`, `purring*`, `klarna` | «Inkassobrevet ligger der og jeg tør ikke åpne det» | «Har lagt budsjett og har kontroll» | NAVs gjeldsrådgivning, 55 55 33 39 / «Åpne ett brev. Bare ett.» |
| VC-009 | Tidstap / frakobling | P1 | `husker ikke`, `tiden forsvant`, `uvirkelig*` | «Fant pakker på døra som jeg ikke husker å ha bestilt» | «Glemte nøklene igjen» | Utforsk uten å konkludere, vurder traumekompetent henvisning / jording |
| VC-010 | Søvnforstyrrelse | P2 | `får ikke sove`, `ligger våken`, `søvnløs*` | «Våkner klokka tre og får ikke sove igjen» | «Sov dårlig fordi naboen festet» | Søvndagbok i 2 uker / fast opprettingstid |
| VC-011 | Ressurs og mestring | P3 | `klarte å`, `hjalp`, `stolt`, `fikk til` | «Fikk til å åpne brevet, var stolt av meg selv» | «Ingenting hjelper» | Speil mestringen konkret / «Skriv ned hva du gjorde» |
| VC-012 | Sikkerhet: mulig krise | **P0** | `selvmord*`, `ta livet mitt`, `orker ikke å leve`, `skade meg selv`, `ingen vei ut` | «Det hadde vært bedre for alle om jeg ikke fantes» | *(ingen: negasjon ignoreres)* | Kontakt i dag + risikovurdering etter prosedyre / 113, legevakt 116 117, Mental Helse 116 123 |

VC-011 finnes med vilje. En taksonomi som bare teller underskudd, tegner et bilde av personen som er mørkere enn virkeligheten. Mestring skal også bli sett.

## Komposisjon

Komposisjon er modellert som `amplified_by`. Når kode A og en av dens forsterkere er til stede i samme tidsvindu, øker vekten (× 1,25) og en faglig merknad vises. Eksempler som er implementert:

- **VC-008 + VC-006** → «Økonomisk stress med skam fører ofte til at brev forblir uåpnet: unngåelsessløyfe.» (testet i `test_observation_classifies_and_recommends`)
- **VC-005 + VC-002** → øk oppfølgingsfrekvensen og sjekk sikkerhet.
- **VC-010 + VC-003** → prioriter tiltak mot nattlig grubling.

## Klassifiseringsregler (hybrid)

```mermaid
flowchart TD
  A[Tekst] --> N[Normaliser: små bokstaver, Unicode NFC]
  N --> R[Regex per kode]
  R --> NEG{Negasjon innen 3 ord før?<br/>ikke/aldri/ingen}
  NEG -- ja, og ikke P0 --> RN[treff markeres som negert<br/>score × 0,3]
  NEG -- nei, eller P0 --> RS[rule_score = 0,6 + 0,2·(n−1), maks 1]
  N --> E[Embedding]
  E --> S[maks cosinus mot kodens prototyper<br/>kalibrert til 0–1]
  RS --> P0{P0-treff?}
  P0 -- ja --> ESC[score = 1,0, escalate = true<br/>alltid øverst, ML kan ikke senke]
  P0 -- nei --> C[score = 0,6·regel + 0,4·semantikk]
  RN --> C
  S --> C
  C --> T{score ≥ 0,45?}
  T -- ja --> SUG[Forslag med begrunnelse]
  T -- nei --> X[Ingen forslag]
```

| Trinn | MVP (implementert) | MLP / produksjon |
|---|---|---|
| Nøkkelord og regex | `classifier.py`, mønstre i JSON | Utvides med lemmatisering (spaCy `nb_core_news`) |
| Negasjon | Vindu på 30 tegn før treffet | Avhengighetsparsing + annotert negasjonssett |
| Beslutningsregler | P0-overstyring, terskel 0,45 | Terskel per kode, kalibrert mot validering (maks F1, eller recall ≥ 0,95 for P1) |
| Semantisk matching | Cosinus mot prototyper (hashing-embedder i dev) | BGE-M3 + re-rank av topp-20 |
| ML-klassifikator | — | Finjustert multi-label (XLM-R / NB-BERT), sigmoid per kode. Kombineres: `0,4·regel + 0,6·modell`, P0 fortsatt regelstyrt **og** modellstyrt (union, høyeste recall vinner) |
| Menneske i løkka | `PATCH …/suggestions/{code}` | Bekreftelser og avvisninger blir aktive læringskandidater |

## To-do

- [ ] Fagråd går gjennom og godkjenner alle 12 kodene (firøyeprinsipp)
- [ ] Minst 20 utsagn og 10 moteksempler per kode fra anonymiserte kilder
- [ ] Bestem om VC-009 skal vises for sluttbrukere (anbefaling: nei, kun fagperson)

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | Klinisk validering av VC-012-mønstre (falske negativer er uakseptable) | Må |
| 2 | Terskel per kode | Bør |
| 3 | Lemmatisering og bedre negasjon | Bør |
| 4 | Nynorsk- og dialektvarianter i mønstre (`ikkje`, `orkar`) | Bør |
| 5 | Koder for positiv relasjon / støtte | Kan |
