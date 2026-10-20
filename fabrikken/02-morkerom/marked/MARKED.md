# MØRKEROM — marked v0.1

650 000 nordmenn er ganske eller veldig plaget av ensomhet. Og hver eneste av dem har en telefon som kan ta et bilde, vise det med en gang, telle likes og så: ingenting. Kameraet i lomma er bygd for å vise deg til andre. Mørkerom er bygd for at du skal se på noe.

## 1. Problemet, i tall

| Påstand | Merking | Kilde |
|---|---|---|
| 14,5 % av voksne (≈ 650 000) var «ganske» eller «veldig mye» plaget av ensomhet siste 14 dager (2025) | DOKUMENTERT | [SSB, livskvalitet](https://www.ssb.no/sosiale-forhold-og-kriminalitet/levekar/statistikk/livskvalitet/artikler-om-livskvalitet/hvor-mange-foler-seg-ensomme-i-norge) |
| Ytterligere ~28 % var «litt plaget» | DOKUMENTERT | samme |
| SSB-figuren peker på 2024-undersøkelsen; tallene bør kontrolleres mot NOT 2026/13 | UAVKLART | [SSB NOT 2026/13](https://www.ssb.no/sosiale-forhold-og-kriminalitet/levekar/artikler/livskvalitetsundersokelsen-2025/_/attachment/inline/71c9705c-9a00-40d3-90e3-ad55009cba43:3d5a74d8554c7d36fa4d8e1dad861828348a392e/NOT2026-13.pdf) |

## 2. Hva forskningen sier om foto og velvære (og ikke sier)

| Påstand | Merking | Kilde |
|---|---|---|
| Foto-hver-dag virket som egenomsorg, fellesskap og minnearbeid hos deltakerne. Det hjalp dem å senke farten i stressende perioder | DOKUMENTERT, men liten kvalitativ studie, ikke kontrollert | [Brewster & Cox 2019, *Health* 23(6)](https://www.lancaster.ac.uk/news/daily-photography-improves-wellbeing) |
| Forfatterne understreker at praksisen *ikke* er entydig positiv | DOKUMENTERT | samme |
| Fotobaserte tiltak kan øke velvære, men det er «paucity of high quality published studies»; mindful fotografering er lovende | DOKUMENTERT (doktorgradsgjennomgang, ikke fagfellevurdert artikkel) | [Exeter 2024](https://ore.exeter.ac.uk/repository/handle/10871/137056) |
| Terapeutisk fotografi (selv) ≠ PhotoTherapy (med terapeut): «vitaminer mot reseptmedisin» | DOKUMENTERT | [Weiser, *Arteterapia* 2014](https://doaj.org/article/bd9d6d68dc0f4b0797d8179f681210d7) |
| Mørkerom hjelper mot ensomhet | **Ikke påstått.** | — |

Det vi bygger på: å *se etter* noe, og å vente. Det vi ikke påstår: at det behandler noe.

## 3. Markedet finnes allerede: skjermløst og forsinket

| Produkt | Hva | Pris | Merking |
|---|---|---|---|
| **Camp Snap** | skjermløst digitalkamera, viral på TikTok | $69, $59 på Black Friday 2025 ([Tom's Guide](https://www.tomsguide.com/cameras-photography/black-friday-2025-camp-snap-cameras-deals)) | DOKUMENTERT |
| **Camp Snap CS-Pro** | premiumversjon, forhåndssalg fra 1.12.2025 | $99 ([Vice](https://www.vice.com/en/article/camp-snap-cs-pro-pre-order)) | DOKUMENTERT |
| **Gudak Cam** (app, 2017) | 24 bilder per rull, 72 t fremkalling | $0,99 ([iPhone in Canada](https://www.iphoneincanada.ca/2017/07/14/analog-camera-ios-app-gudak/)) | DOKUMENTERT. Kunne lures ved å endre telefonens dato. |
| **Dispo** (app, 2021) | bilder fremkalles neste morgen kl. 09 | gratis ([Axios](https://www.axios.com/2021/02/16/retro-photo-app-is-winning-buzz)) | DOKUMENTERT. Hypen toppet seg tidlig 2021. |
| Engangskameraer (film) | | ~150–250 kr + fremkalling | HYPOTESE om pris |

**Lærdommen:**
1. Folk betaler for et *dårligere* kamera hvis det gir dem et annet forhold til bildene (Camp Snap).
2. Forsinkelse er attraktivt, men en app kan jukses (Gudak). Et kamera med egen klokke, uten skjerm og med krypterte filer kan ikke det.
3. Sosiale forsinkelsesapper (Dispo) lever på hype. Mørkerom har ingen sosial funksjon og trenger ikke hype.

## 4. Posisjonering

> *Et kamera uten skjerm som lar bildene ligge i mørket i 48 timer. Hver morgen: ett oppdrag.*

| | Camp Snap | Mørkerom |
|---|---|---|
| Skjerm | ingen | ingen foran, e-blekk bak *etter* 48 t |
| Fremkalling | ved overføring til PC | 48 t, per bilde, uten å kunne jukses |
| Oppdrag | — | 64, ett per dag |
| Kryptering | — | AES-256-GCM, nøkkel i kameraet |
| Overføring | USB til PC | eget Wi-Fi til telefonen, først når fremkalt |
| Pris | $69 | 1 190 kr |

**Kjøper:** voksen som vil bruke telefonen mindre og se mer. Første marked er Norge, direkte salg.

## 5. Det jeg ikke vet

1. **Er 48 t riktig?** Gudak brukte 72 t, Dispo ~12 t. HYPOTESE: 48 t er nok til at man glemmer bildet og blir overrasket. Testes med to prototyper: 24 t og 48 t.
2. **Er bildekvaliteten god nok** til at originalen er verdt å hente? UAVKLART til første linse er testet.
3. **Bruker folk oppdragene?** Mål: andel bilder tatt med dagens oppdrag i tankene. Kan ikke måles uten å spørre. Spør.
4. **CE/RED for et kamera med Wi-Fi og lagring** kan bli strengere enn for Stafett (personvern, EN 18031). UAVKLART.
