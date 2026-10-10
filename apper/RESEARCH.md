# Research: App Store + GitHub, oktober 2026

Mål: finne 25 appkonsepter som én indieutvikler kan bygge, som kan kjøre helt lokalt uten server, og som treffer et faktisk hull i markedet. Ingen nye «ChatGPT med ny hatt».

## Metode

1. **App Store-signaler.** Trendrapporter for 2026, vinnere av App Store Awards 2025, og analyser av anmeldelser (hva folk klager over og hva de savner).
2. **GitHub-signaler.** Emnet `local-first`, trending-lister for selvhostede verktøy, og awesome-lister for nevrodivergente verktøy. Det viser hva utviklere bygger for seg selv fordi ingen andre gjør det.
3. **Filter.** Hvert konsept måtte bestå alle fem:
   - **Nisje fremfor bredde.** En konkret gruppe med et konkret problem.
   - **Lokal-først.** Fungerer uten konto, sky eller server, og data blir på enheten.
   - **Ingen nettverkseffekt.** Verdifull for én bruker fra første dag.
   - **Engangspris er mulig.** Abonnementstrøtthet er reell.
   - **Norsk fordel der det finnes.** Utlånsforskrift, enkeltpersonforetak, inkasso, BNPL, turnus, DNT og norsk tale.

## Funn

### Fra App Store

| Funn | Kilde |
|------|-------|
| Generiske AI-chatapper taper mot ChatGPT og Gemini. AI fungerer som funksjon i nisjeapper. | [AppOpportunity 2026](https://appopportunity.com/blog/app-store-trends-2026), [mezha.net](https://mezha.net/eng/news/bcb431ee_app_store_keeps/) |
| Spesialisert helse og trening vokser: bekkenbunn, korsbåndrehab, klatrelogg. Generelle treningsapper er mettet. | AppOpportunity 2026 |
| Mental helse-brukere forventer mer nyanse enn en skala fra 1 til 5, og CBT-dagbøker og rapporter til terapeut vokser. | AppOpportunity 2026 |
| Foreldre og familie vokser. Verktøy for samværsforeldre er fragmentert, uten dominerende aktør. | AppOpportunity 2026 |
| Finansverktøy for markeder utenfor USA er en voksende geo-arbitrasje. | AppOpportunity 2026 |
| Spesialistkalkulatorer (snekker, eiendom) lever, mens enkle verktøy blir slukt av iOS. | AppOpportunity 2026 |
| Håndverksnisjer (surdeig, gjæring, vinyl) anslås til 10–50 000 dollar i måneden for en solo-utvikler. | AppOpportunity 2026 |
| Spesifisitet selger: meditasjon for tinnitus eller skiftarbeidere, vanetracker for folk i recovery. | AppOpportunity 2026 |
| Grønt lys for indier: personvern-verktøy, bransjeverktøy og hypernisje-trening. Rødt lys: sosiale nettverk, dating, krypto, generisk AI og abonnementsproduktivitet. | [dev.to, indie-prognose Q3 2026](https://dev.to/snake_sun/indie-ios-q3-2026-forecast-where-the-indies-will-win-and-where-they-will-not-1ige) |
| Hard betalingsmur gir ca. 12 % konvertering mot 2 % for freemium (Adapty-tall, sitert). | dev.to Q3 2026 |
| App Store Awards 2025: **Tiimo** (visuell planlegger for ADHD) ble iPhone App of the Year. Cultural Impact gikk blant annet til **Focus Friend** (fokus med en figur), **Be My Eyes** (tilgjengelighet) og **StoryGraph**. | [Macworld](https://www.macworld.com/article/3000653/apple-reveals-the-17-winners-of-its-2025-app-store-awards.html), [9to5Mac](https://9to5mac.com/2025/11/19/here-are-the-2025-app-store-awards-finalists/) |
| Brukere klager seks ganger oftere over ting som er ødelagt enn de ber om nye funksjoner. Pålitelighet slår funksjonsliste. | unitQ-benchmark 2026, sitert i søkeresultater. Primærkilden er ikke lest. |

### Fra GitHub

| Funn | Kilde |
|------|-------|
| `local-first` er et av de raskest voksende emnene. Logseq (45k stjerner), SiYuan (47k), RxDB (23k) og Super Productivity (23k, timeboksing) ligger i toppen. | [github.com/topics/local-first](https://github.com/topics/local-first) |
| Selvhostede verktøy i trending: openGym (8,7k, egen treningslogg), aurelio-finance (lokal privatøkonomi) og how-to-live-better (offline-leser som én HTML-fil). | [GitTrend self-hosted](https://gittrend.io/trending/self-hosted) |
| Folk bygger verktøy for nevrodivergente selv, fordi markedet ikke gjør det: awesome-adhd, giro og Stimmy-things. | [ecosyste.ms adhd](https://repos.ecosyste.ms/topics/adhd) |
| Mønster: personvern og eierskap til egne data driver utviklingen. Folk vil eie sine egne data. | [Trendshift](https://trendshift.io/repositories/22289), [EpicenterHQ/epicenter](https://oosmetrics.com/repo/EpicenterHQ/epicenter) |

## Fra signal til konsept

| Signal | Konsepter |
|--------|-----------|
| Hypernisje-helse | Korsbånd, Bekkenbunn, Klatrelogg, Tinnitusro, Skiftsøvn, Sekkevekt |
| Mental helse med mer nyanse | Humørvær, Tankefelle, Edru, Delene, Ringerunde |
| Nevrodivergent (Tiimo, Focus Friend) | Dagstripe, Hyttebygger, Impulsbrems |
| Lokal finans | Gjeldsknuser, Boligkalk, Frilanskalk, Impulsbrems |
| Familie uten dominerende aktør | Samvær, Feberlogg |
| Håndverk | Surdeigsvakt, Gjæringslogg, Vinylhylla, Snekkerkalk |
| Personvern-verktøy | Besluttet |
| Tilgjengelighet (Be My Eyes) | Snakkebrett |

## Bevisst utelatt

Sosiale nettverk, dating, krypto og AI-chat-wrappere. Alle er røde lys i kildene, og ingen av dem fungerer lokalt uten server.

## Forbehold

- Mange kilder er bransjeblogger eller selger egne analyseverktøy (AppOpportunity, BigIdeasDB, unitQ). Tallene er deres egne og ikke uavhengig verifisert. Bruk dem som retning, ikke som fasit.
- Det finnes ingen offentlig App Store-API for kategoritrender. Rangeringene her bygger på sekundærkilder, ikke Sensor Tower- eller Appfigures-data.
- GitHub-stjernetallene er øyeblikksbilder fra emnesidene i oktober 2026.
- Neste steg før en eventuell lansering: les konkurrentenes anmeldelser for hver nisje (tell klager), og sjekk om topp tre i nisjen har oppdatert det siste året.
