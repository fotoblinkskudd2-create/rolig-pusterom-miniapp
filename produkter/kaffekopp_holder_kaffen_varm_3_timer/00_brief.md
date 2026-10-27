# 00 Brief – Kaffekopp som holder kaffen varm i 3 timer uten strøm

Kjørt headless av `designmaskin.py` 2026-10-27. Ingen oppklaringsspørsmål ble stilt, så alle
antakelser står eksplisitt under.

## Mål i én setning
En **kopp med hank for skrivebordet** som holder 300 ml kaffe i drikkevinduet (≈ 55–66 °C) gjennom
**3 timer med vanlig nipping**, uten batteri, ledning eller lading.

## Målgruppe
- **Primær:** Folk som drikker kaffen sakte ved PC-en på hjemmekontor eller kontor, og som er lei av lunken kaffe
  eller mikrobølgeovnen. De vurderer i dag Ember (oppvarmet, batteri) eller en vakuumkopp med skyvelokk.
- **Sekundær:** Håndverkere, sjåfører og folk som er ute, gave-/firmagavemarkedet.

## Jobben produktet gjør
«Gi meg kaffe som er god å drikke *nå* (ikke skåldende) og *fortsatt* om tre timer, uten at jeg må tenke på det.»

## Harde krav (med tall)

| # | Krav | Tall | Kilde/begrunnelse |
|---|---|---|---|
| K1 | Temperatur ved siste slurk etter 3 t, bruksscenario, **uten** forvarming | **≥ 55 °C** (mål: ≥ 60 °C) | Drikkevindu 55–66 °C `[kilde: Lee & O'Mahony 2002; 2022-studie 58–66 °C]` |
| K1b | Samme, **forvarmet** kopp (skyllet med varmt vann) | **≥ 60 °C** | Idéens «varm» tolket som ≥ 60 °C `[antakelse]` |
| K2 | Lukket lokk, ingen slurker, etter 3 t | ≥ 60 °C | `[antakelse]` |
| K3 | Drikkeklar (≤ 66 °C) etter helling av 85 °C kaffe | ≤ 20 min | IARC: > 65 °C «sannsynlig kreftfremkallende» (2A) `[kilde: IARC 2016]` |
| K4 | Kaffemengde / brutto volum | 300 ml / ≥ 330 ml | Vanlig stor kopp `[antakelse]` |
| K5 | Ytre høyde inkl. lokk | ≤ 125 mm | Skal passe under kaffemaskin og se ut som en kopp `[antakelse]` |
| K6 | Vekt tom med lokk | ≤ 450 g | Tyngre enn en keramikkopp (≈ 300–350 g) oppleves klumpete `[antakelse]` |
| K7 | Energikilde | **0 W**, ingen batteri | Idéen |
| K8 | Matkontakt | Samsvar med (EF) 1935/2004, (EU) 10/2011 for plast, (EF) 2023/2006 GMP | Lov |
| K9 | Oppvaskmaskin | 500 sykluser uten tap av vakuum eller belegg | EN 12875-1 `[antakelse om krav]` |
| K10 | Fall | 1 m på betong, vakuum intakt | `[antakelse]` |
| K11 | Søl ved velt (lokk lukket, skyver stengt) | ≤ 2 ml på 10 s | `[antakelse]` |
| K12 | Produksjonskost (landet, 10 000 stk) | ≤ 150 NOK | Gir utsalgspris ≤ 700 NOK med normal margin `[antakelse]` |

**Bruksscenariet (definisjon brukt i modell og test):** 300 ml kaffe på 85 °C helles i en kopp på
20 °C i et rom på 20 °C, 50 % RF. Over 3 timer tas 12 slurker à 15 ml (180 ml drukket, 120 ml igjen ved
siste slurk). Lokket er av i 8 s per slurk.

## Myke ønsker
- Kan drikkes fra kanten med lokket av, som en vanlig kopp.
- Nøytral smak (keramisk belagt innside), ingen metallsmak.
- Ser ut som en kopp, ikke en termos. Hank.
- Kan skrus/klikkes helt fra hverandre for rengjøring (lokk, pakning).

## Budsjett og pris-mål
- Utsalgspris 549–699 NOK inkl. mva. Det er mellom YETI-koppen (≈ 350–450 NOK) og Ember (≈ 1 000–1 700 NOK).
- Utviklingsbudsjett til første produksjonsserie: ≈ 1 MNOK `[antakelse]`.

## Antakelser gjort (headless)
1. «Varm» = ≥ 60 °C som mål. Det **løftet som kan gis** settes etter robusthetsanalysen (≥ 55 °C uten forvarming).
2. «Kopp» = kopp med hank for bord/skrivebord, ikke en reisekopp. Den trenger likevel lokk, for uten lokk er kravet fysisk umulig (se `01_research.md`).
3. Kaffe helles på 85 °C. Filterkaffe fra kanne er typisk 80–90 °C i koppen `[antakelse]`.
4. Koppen står på 20 °C ved helling, uten forvarming (vanlig bruk og verst tenkelige normalsituasjon).
5. Marked: Norge/Norden først, deretter EU via nettbutikk.
6. Produksjon hos OEM for vakuumbeger i Asia (standard for bransjen).

## Utenfor scope
- Aktiv oppvarming (batteri, induksjon, USB). Det er Embers kategori.
- Reisekopp/flaske med smal munn som skal i bilens koppholder (egen variant, se alternativ C i rapporten).
- Mikrobølgeovn (koppen er av metall).
- Kald drikke. Den fungerer, men er ikke optimalisert for det.
