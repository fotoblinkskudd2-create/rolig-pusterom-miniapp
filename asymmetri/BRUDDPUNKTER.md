# Bruddpunkter i dronekrigen, Ukraina 2024–2026

*Status: 12. oktober 2026. Åpne kilder, tillit merket. Ingen tall uten kilde.*

**Tillit:** **H** = offisielt/flere uavhengige · **M** = én troverdig kilde eller offisiell påstand · **L** = leverandør, kommersiell interesse eller uverifisert · **A** = avledet/antagelse

---

## 1. Korreksjoner til premisset

| Premiss | Hva kildene faktisk sier |
|---|---|
| Fiber gikk fra ~$4–5/km til $29–35/km | **Delvis.** *Standard* G.652 i Kina: 16 → 40 CNY/km (≈ $2,3 → $5,8), jan 2025 → jan 2026 (Vedomosti, **M**). G.657.A2-spot ~$33–35/km i 2026 finnes bare hos leverandørblogger (**L**). «6x siden sent 2025» er én leverandørpåstand. Ferdige 10–20 km FPV-kanistre er samtidig listet til $105–270 (**L**), altså *billigere* per km enn bulk-spot. Noe her stemmer ikke. |
| Prishoppet skyldes AI-datasentre | **Ikke belagt.** Kildene peker på tre drivere samtidig: militær etterspørsel (Kyiv Post/Vedomosti), AI/datasenter (Corning–Meta $6 mrd-avtale, **H**) og preform-flaskehals (**L**). **Ingen kilde kvantifiserer AI-andelen av FPV-fiberprisen.** Det er en hypotese, ikke et funn. |
| Begge sider ~100 % Kina-avhengige for fiber | **Russland: ja** (eneste innenlandske produsent offline siden mai 2025, Moscow Times, **M**). **Ukraina: sannsynlig for råfiber, ikke tallfestet.** Ukraina vikler selv, men med mangel og kvalitetsproblemer (Ukrainska Pravda jan 2026, **M**). |
| Fiber-FPV typisk 15–25 km | **Utdatert.** NATO-relatert rapportering: «typisk ≤ 20 km» (2025). Fedorov: > 40 km er «ny norm» (**M**, regjeringspåstand). 50 km-spoler i test okt 2025. |
| Jet-Shahed ~55 % vs 85–90 % propell | **Stemmer.** Zelenskyj 28. sep 2026: ~57 % jet (Geran-3/4/5) vs > 90 % propell (**M**). Andre anslag 55–60 %. |
| Patriot-mangel mot ballistiske | **Stemmer, og verre.** Se §3. |
| Čaharnik-barriere | **Ikke funnet under det navnet** i søkene. Kildene beskriver nett-tunneler over veier, og motordrevet piggtråd som fanger og kutter fiber (**M**). |

---

## 2. Bruddpunkter

| # | Bruddpunkt | Kvantifisering | Type | Rammer | Tillit |
|---|---|---|---|---|---|
| 1 | **Analog/fastfrekvent RF-lenke** dør mot bredbånds-jamming | Billig jammer slår billig drone. Ingen fersk %-rate funnet. | **Strukturell** for analog. Fysikk: J/S skalerer med (d_op/d_jammer)². | Begge | M |
| 2 | **FHSS/mesh** kjøper tid, ikke immunitet | Bredbånds-jammer dekker hele hoppbåndet; mesh flytter bare d_op. | **Midlertidig** (våpenkappløp per frekvenssyklus) | Begge | M |
| 3 | **Fiber: Kina-flaskehals på råfiber/preform** | RU: 100 % import. G.652 ×2,5 på 12 mnd (**M**). G.657.A2 ×~6 (**L**). | **Strukturell.** Preform-kapasitet bygges på år, ikke måneder. | Begge, RU hardest | M/L |
| 4 | **Fiber: Ukrainsk vikle-gap** | RU kjøper ferdigviklet fra Kina; UA vikler selv, rapportert mangel + kvalitet. | **Midlertidig**, men koster nå. | UA | M |
| 5 | **Fiber: fysisk tråd i terrenget** | Kuttes av nett, motordrevet piggtråd, manuelt. Ingen kutterate publisert. | **Strukturell** – tråden *er* angrepsflaten. | Begge | M |
| 6 | **Fiber: rekkevidde = spollengde** | 20 → 40+ km på ~1 år. Vekt og kost skalerer lineært med km. | **Strukturell grense, midlertidig tall.** | Begge | M |
| 7 | **Jet-Geran mot interceptor-droner** | 57 % samlet avskjæring vs > 90 % propell. Beste interceptor (Bars) ~30 % mot jet. Jet ≈ halvparten av nattlige angrep (sep 2026). | **Strukturell inntil interceptorer får jet-fart.** Billig-avskjæring er bygget for 180 km/t-mål. | UA | M |
| 8 | **Ballistiske missiler / Patriot** | Leveranser 2026 ≈ ⅓ av 2025. UA har ~1 % av US-lager, trenger ~5 %. 0 av 28 avskåret over Kyiv én natt i juli. Lockheed: 620 PAC-3/år (2025), mål 2000/år i 2030. CSIS: lager gjenoppbygd tidligst 2029. | **Strukturell til ~2029–2030.** Konkurranse med Midtøsten. | UA | M/H |
| 9 | **Interceptor-droner skalerer, men mot gårsdagens mål** | ~70 % av Shahed-nedskytinger tatt av interceptor-droner (jan 2026). Sting > 11 000 drap 2026 (produsentens tall, **L**). | Styrke som blir **midlertidig** hvis jet-andelen fortsetter opp. | UA | M/L |
| 10 | **Autonomi / terminal guidance** | Vyriy/The Fourth Law: «2–4× treff, +10 % kost» (**L**). 50 000 Shrike m/ Skynode S levert fra jul 2026. **Ingen kilde gir andel av FPV-er med autonomi.** | **Midlertidig gap** – flytter sårbarheten fra lenken til sensoren/modellen (feilklassifisering, falske mål, optisk blending). | Begge | L |
| 11 | **Komponent-Kina-avhengighet generelt** | Kina-andel i UA-droner ~38 % (2025, **M**), men H1-2026-import = 76 % av hele 2025 (RFE/RL). Kinesiske eksportkontroller fra sep 2024 rammer UA hardere enn RU (**M**). | **Strukturell**, asymmetrisk i Russlands favør. | UA mest | M |

---

## 3. Asymmetriene som faktisk betyr noe

1. **Kina sitter på begge sidenes fiber, men behandler dem ulikt.** Russland kjøper ferdige spoler og er 100 % importavhengig. Ukraina vikler selv og får dårligere tilgang på komponenter. Kina kan skru på kranen når som helst, og prisen styres av markeder Kyiv og Moskva ikke påvirker.
2. **Kostnadskurven snur.** Når fiber går fra ~25 % til ~66 % av en FPV-sorties kost (kalkulatoren: 20 km spole, $450 drone, $5,5 → $33/km, 35 % påslag gir +$740 per sortie), blir spollengde et budsjettvalg, ikke bare et taktisk valg. *Tallene er L-tillit, men retningen er robust.*
3. **Russland vinner kostnadskrigen i luften.** Jet-Geran tvinger Ukraina fra billige interceptor-droner tilbake mot dyre missiler som ikke finnes i nok antall.
4. **Fiber gjør EW irrelevant for kontroll-lenken, men gjør krigen fysisk igjen.** Mottiltaket er nett, tråd, saks og radar, ikke spektrum.

---

## 4. Hull i kildegrunnlaget

- Ingen primærkilde fra YOFC/Corning bekrefter fibermangel; prisnivået hviler på leverandørblogger.
- Ingen kilde skiller AI- vs militær-drevet prisøkning.
- Ingen åpen rate for fiberkutt eller fiber-FPV-tap.
- Ingen andel FPV med terminal guidance.
- Kildene du nevnte (Flash, Syrskyi, Zhluktenko, WSJ, Ars Technica) dukket ikke opp med relevante 2026-tall i søkene mine. Det betyr ikke at de ikke finnes – bare at de ikke er brukt her.

---

## Kilder

- Kyiv Post – kinesisk fiberpris dobles: https://www.kyivpost.com/post/70906
- Moscow Times – Russland avhengig av kinesisk fiber: https://www.themoscowtimes.com/2026/02/26/russia-forced-to-rely-on-chinese-optical-fiber-imports-after-ukrainian-strikes-halt-domestic-plant-a92054
- Ukrainska Pravda – Ukraina henger etter på fiber-UAV: https://www.pravda.com.ua/eng/articles/2026/01/25/8017810/
- Ukrainska Pravda – Sting mai 2026 / MoD-tall: https://www.pravda.com.ua/eng/news/2026/06/11/8038825/
- Kyiv Post – UA reduserer Kina-avhengighet: https://www.kyivpost.com/post/71701
- RFE/RL via GlobalSecurity – ubehagelig Kina-avhengighet: https://www.globalsecurity.org/wmd/library/news/ukraine/2026/08/ukraine-260823-rferl02.htm
- Euromaidan Press – kinesiske restriksjoner: https://euromaidanpress.com/2024/12/10/new-chinese-restrictions-target-drone-supply-chains-vital-for-ukraine-defense/
- Ukrinform – fiber > 40 km: https://www.ukrinform.net/rubric-ato/4017356-ukrainian-fiberoptic-drones-reach-strike-range-of-over-40-kilometers-fedorov.html
- UNITED24 – mottiltak mot fiber: https://united24media.com/war-in-ukraine/can-fiber-optic-drones-be-stopped-how-ukraine-faces-the-unjammable-threat-12502
- TWZ – russisk fiber dypt bak linjene: https://www.twz.com/news-features/russian-fiber-optic-drones-are-now-reaching-into-ukrainian-cities-far-behind-the-lines
- TechTimes – 90 % vs 57 %: https://www.techtimes.com/articles/328255/20260929/ukraine-stops-90-propeller-shaheds-only-57-jet-ones-russia-designed-it-that-way.htm
- TechTimes – jet = halvparten av nattlige angrep: https://www.techtimes.com/articles/326566/20260903/jet-powered-drones-now-half-russias-nightly-strikes-stressing-ukraines-cheap-interceptors.htm
- The Defender – Bars 30 %: https://thedefender.media/en/2026/10/bars-30per-effective/
- DroneXL – interceptor-droner skalerer: https://dronexl.co/2026/03/01/ukraine-is-scaling-up-interceptor-drones-as-russias-shahed-threat-outpaces-every-defense
- Reuters via Internazionale – leveranser ⅓: https://www.internazionale.it/ultime-notizie-reuters/2026/08/05/ukraine-says-missile-interceptor-deliveries-have-fallen-to-third-of-2025-level
- NBC – Patriot-mangel: https://www.nbcpalmsprings.com/2026/08/17/ukraine-warns-of-patriot-missile-shortage-as-interceptors-run-low
- Libertarian Institute – 0 av 28: https://libertarianinstitute.org/news/ukraine-lacks-interceptors-to-shoot-down-russian-ballistic-missiles/
- Kyiv Post – terminal guidance: https://www.kyivpost.com/post/60152
- Janes – SkyFall/Auterion Shrike: https://www.janes.com/defence-intelligence-insights/defence-news/air/skyfall-and-auterion-delivering-shrike-uavs-with-skynode-s-autonomy-to-ukraine
- Hengtong – fibermangel 2026 (L): https://www.hengtongglobal.com/info/optical-fiber-shortage-2026-buyers-guide-103466005.html
- GL Fibercable – G657A2-krise (L): https://www.gl-fibercable.com/newsdetail/2026-fiber-optic-market-crisis:-g657a2-supply-shortage-and-soaring-prices-reshape-global-procurement-strategies.html
- Accio – prisutvikling (L): https://www.accio.com/business/fiber-optic-drone-price
- Oyii – strukturelt prisrally (L): https://www.oyii.net/news/structural-price-rally-in-fiber-optic-cables-ai-powered-demand-supply-constraints-2026-forecast/
