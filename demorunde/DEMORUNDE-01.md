# DEMORUNDE 01 — Konspirasjonsteorier

**Dato:** 08.11.2026 · **Varighet:** 40 min (simulert tidslinje) · **Agenter:** koordinator, teknologi (+kildesjekk), psykologi (+forskning), mediekunnskap (+innhold)
**Kjørt av:** én Claude-økt som spilte rollene i rekkefølge etter `.claude/agents/*.md`. Neste runde kan kjøres med ekte parallelle subagenter via skillen `demorunde`.

---

## 0–5 · Rammer
- Målgruppe: én person med en telefon. Både den som *tviler* og den som er *glad i* noen som tror.
- Rammer: lokal-first, ingen konto, ingen sky, ingen sensur, ingen latterliggjøring.
- Suksess: brukeren kan (1) kjenne igjen en teknikk, (2) sjekke en påstand på 60 sek, (3) ta en pause før deling, (4) ha én bedre samtale.

## 5–10 · Diagnose
Konspirasjonstro er ikke dumhet. Den dekker tre behov (Douglas, Sutton & Cichocka 2017):

| Behov | Hvordan troen dekker det | Hva et tiltak må gi i stedet |
|---|---|---|
| Epistemisk | Enkel forklaring på kaos | Et verktøy for å finne ut selv |
| Eksistensielt | Følelse av kontroll når man er redd | Ro i kroppen + reell handlingsevne |
| Sosialt | Tilhørighet, «vi som har skjønt det» | Relasjon som overlever uenighet |

**Funn:** Et pusterom er et uvanlig godt sted for dette. Angst og maktesløshet driver mønstersøking. Ro først, kildekritikk etterpå.

## 10–20 · Teknologi
| # | Tiltak | Mekanisme | Evidens | Kost | Risiko |
|---|---|---|---|---|---|
| T1 | Lokal manipulasjons-skanner | Markerer teknikk-signaler i limt tekst | Bygger på teknikklistene i Roozenbeek 2022 | 3 t | Kan leses som «sannhetsmaskin» → må si at den ikke er det |
| T2 | Lateral-lesing-knapper | Ett trykk til faktisk.no, Fact Check Explorer, Wikipedia, bildesøk | Wineburg & McGrew 2019 | 1 t | Lav |
| T3 | «Før du deler»-pause | Pust + nøyaktighetsspørsmål | Pennycook m.fl., *Nature* 2021 | 2 t | Lav |
| T4 | AI-dialog (DebunkBot) | Skreddersydd motbevis i dialog | Costello, Pennycook & Rand, *Science* 2024 (~20 % ned, 2 mnd) | 1 t som prompt / 20 t som tjeneste | API-nøkkel i klient = lekkasje |
| T5 | Nettleserutvidelse som skanner feeden | Automatisk merking | — | 40 t | Overvåkingsfølelse, plattformavhengig |

## 20–30 · Psykologi
| # | Tiltak | Mekanisme | Evidens | Kost | Risiko |
|---|---|---|---|---|---|
| P1 | Prebunk-trening, 6 teknikker | Inokulering | Roozenbeek m.fl., *Sci. Adv.* 2022; Bad News-spillet | 3 t | Kan gi generell skepsis mot *alt* → forklar teknikk, ikke «stol ikke på noe» |
| P2 | Samtaleguide for pårørende | Lytt, sikkerhet 1–10, kriterier, ett motbevis | Costello 2024 (mekanisme), Debunking Handbook 2020 | 2 t | Lav |
| P3 | Ro-før-vurdering | Senk arousal før vurdering | Angst ↔ konspirasjonstro (Douglas 2017) | 0 t (finnes: Pusterom) | Lav |
| P4 | Konspirasjonsmentalitets-test | Selvinnsikt | Bruce/Brotherton GCB-skala | 2 t | Stempler folk → defensiv |
| P5 | Gruppechat-moderator-bot | Sosial korrigering | Svak | 30 t | Høy |

## 30–35 · Mediekunnskap
| # | Tiltak | Mekanisme | Evidens | Kost | Risiko |
|---|---|---|---|---|---|
| M1 | SIFT som 4-stegs sjekkliste | Vane på 30 sek | Caulfield; Stanford COR | 1 t | Lav |
| M2 | Oppdiktede øvelsesposter | Trygg svekket dose | Inokuleringsteori | 2 t | Lav hvis oppdiktet |
| M3 | Kurs/workshop-pakke | Undervisning | God, men krever lærer | 15 t | Ingen rekkevidde alene |
| M4 | Ukentlig «myte-nyhetsbrev» | Eksponering | Kan forsterke myten (gjentakelse) | 5 t | Illusory truth |

## 35–40 · Drap og syntese

### Drept
- **T5 Nettleserutvidelse** — overvåkingsfølelse mater nøyaktig mistilliten vi vil ned.
- **P4 Mentalitetstest** — å få et tall på at du er «konspiratorisk» gjør folk defensive, ikke nysgjerrige.
- **P5 Gruppechat-bot** — dyr, svak evidens, oppleves som sensur.
- **M3 Kurspakke** — bra, men ikke noe én person kan bruke i kveld.
- **M4 Myte-nyhetsbrev** — gjentar myter; gjentakelse øker opplevd sannhet.
- **T4 som tjeneste** — API-nøkkel i en lokal HTML-fil er en lekkasje. Overlever kun som kopierbar prompt.

### Overlevende → ett bygg: `motgift.html`
Fire faner, én fil, alt lokalt:

| Fane | Tiltak | Behov det dekker |
|---|---|---|
| **Tren** | P1 + M2: 12 oppdiktede poster, 6 teknikker, poeng lagres lokalt | Epistemisk |
| **Sjekk** | T1 + T2 + M1: skanner med markering + SIFT + lateral-lenker | Epistemisk |
| **Pause** | T3 + P3: 3 pust + «hvor sikker er du?» før deling | Eksistensielt |
| **Samtale** | P2 + T4 (prompt): guide + kopierbar DebunkBot-prompt | Sosialt |

## Målepunkter (lokalt, ingen sporing)
- Treffprosent i Tren over tid (lagres i `motgift.quiz`).
- Antall pauser tatt og hvor mange som endte med «deler ikke» (`motgift.pauses`).
- Ærlig grense: dette måler atferd i appen, ikke effekt i verden. Ekte effektmåling krever en studie.

## Neste steg
1. Test på ekte iPhone (fortsatt åpent fra HULL.md).
2. Flere øvelsesposter via subagenten `innhold` — spesielt norske temaer (strøm, vaksine, ulv, 5G).
3. Demorunde 02: kjør med ekte parallelle subagenter og la `forskning` verifisere hver effektstørrelse.
