# 07 Lansering – visuell pakke for «Tretimer»

Bruker **bare påstander fra «lov nå» i `06_pitch.md`**. Tekst merket ⏳ er reservert og byttes inn først når
testen i parentes er bestått og dokumentert. Storyboard: [`storyboard.svg`](storyboard.svg) / [`storyboard.png`](storyboard.png).

## Visuell profil
**Stil i én setning:** Rolig skandinavisk morgenlys: varme, matte flater rundt et kjølig stålprodukt der kontrasten
mellom varm kaffe og kjølig rom bærer historien.

| Hex | Navn | Rolle | Hvorfor |
|---|---|---|---|
| `#3B2A20` | Espresso | Tekst, logo, mørke flater | Kaffens egen farge, høy kontrast mot krem (≈ 12:1) |
| `#F4EDE3` | Havremelk | Bakgrunn, hero-bakgrunn | Varm hvit; gjør stålet kjøligere og kaffen varmere uten å bli klinisk |
| `#D9822B` | Kobber | Aksent: varme, PCM, CTA-knapp | Henviser til kobberbelegget og «varm». Analog med espresso (samme oransje-brune familie) |
| `#2F7F86` | Fjordblå | Kontrast: «kald kaffe», problem-scener, lenker | **Komplementær** til kobber (motsatt på fargesirkelen) → problem (kaldt) og løsning (varmt) skilles uten tekst |
| `#8A9198` | Stål | Produktets egen farge, sekundær grafikk | Nøytral; lar produktet være produktet |

**Typografi:** Overskrifter i *Fraunces* (myk serif, varm, Google Fonts), brødtekst og tall i *Inter* (tabulære
sifre for temperaturer). Maks to vekter per flate. Temperaturer settes alltid med tynt mellomrom: «64 °C».

## Produktfoto – 3 oppsett

### F1. Hero på hvit (nettbutikk, Kickstarter-forside)
- **Komposisjon:** Kopp i ¾-vinkel (hanken mot høyre, 30° fra kamera), sentrert horisontalt men med lokkets drikkeåpning på øvre tredjedelslinje. Lokket på. Ett eksemplar uten lokk ved siden av (60 % av høyden, bak og til venstre) for å vise kanten.
- **Lys:** Key: 120 × 180 cm softbox 45° venstre, litt over, 1:1 referanse. Fill: hvit refleks høyre, forhold key:fill **3:1** (beholder form på sylinderen). Back/rim: stripbox bak høyre, +1 EV over key, gir kantlys langs stålet og skiller fra bakgrunnen. Polariseringsfilter på objektiv for å temme refleksene i stålet.
- **Kamera:** 100 mm makro på fullformat, **f/11** (hele koppen skarp), 1/160 s (blits-synk), ISO 100. Stativ. Fokusstabling 3 bilder hvis f/11 ikke dekker lokk + bunn.
- **Bakgrunn:** Hvit hulkehl (sømløs), +1,5 EV for ren hvit (#FFFFFF) til nettbutikk; separat versjon på `#F4EDE3`.
- **Etterarbeid:** Utklipp, fjern støv og fingeravtrykk, myk kontaktskygge under. Ingen endring av form eller farge på produktet (markedsføringsloven: bildet skal vise faktisk produkt). Eksport 2 000 × 2 000 px sRGB.

### F2. Livsstil – skrivebordet (annonser, sosiale medier)
- **Komposisjon:** Skrivebord ved vindu. Koppen på nedre høyre tredjedelskryss, tastaturkant og bordkant som **ledende linjer** inn mot koppen. Hånd på vei mot hanken (handling). Skjerm ute av fokus i bakgrunnen; ingen logo på PC.
- **Lys:** Key = dagslys fra vindu venstre (morgen, 5500 K). Fill = hvit refleks 1,5 m høyre, forhold **4:1** (stemning, mørkere skygger). Back = liten LED med CTO-filter (3200 K) bak koppen for varm glød i dampen og kantlys. Damp: steamer/damp-pen utenfor bildet (ikke CGI).
- **Kamera:** 50 mm, **f/2,8** (bakgrunn uskarp, kopp og hånd skarp), 1/200 s, ISO 400.
- **Bakgrunn:** Ekte hjemmekontor, lyst tre, en plante. Fjordblå tekopp eller pute i bakgrunnen som fargeaksent.
- **Etterarbeid:** Lett varm grading (+5 temp i høylys, fjordblå toner i skygger – split toning), behold naturlig hudtone. 4:5 og 9:16 utsnitt.

### F3. Detalj – lokket og halsen (nøkkelfunksjonen)
- **Komposisjon:** Lokket halvveis løftet, sett fra 20° over kanten. Den rullede kanten og kantskjørtet fyller midten, diagonal fra nedre venstre til øvre høyre (ledende linje). Damp stiger fra åpningen.
- **Lys:** Key: liten softbox (60 cm) rett over, litt bak (topplys på damp og kant). Fill: refleks foran, forhold **2:1**. Back: hardt spotlys med smal snoot bak, mot svart flagg, slik at dampen lyser mot mørk bakgrunn.
- **Kamera:** 100 mm makro, **f/5,6**, 1/250 s, ISO 200. Alternativt et kontinuerlig lys og 1/60 s for mykere damp.
- **Bakgrunn:** Espresso-brun papp (`#3B2A20`), 1 m bak koppen, ute av fokus.
- **Etterarbeid:** Fremhev kantskjørtet med lokal kontrast. Valgfritt: et overlay-utsnitt av snittegningen (`tegning.png`) i 20 % opasitet for teknisk side. Ingen påstander om temperatur i bildet.

## Video 30 s
- **Formål:** Forhåndssalg (Kickstarter/egen side) og annonser. Vise *problemet* og *mekanismen* – ikke bevise ytelse før T1.
- **Målgruppe:** Segment A, hjemmekontor-nipperen (25–55 år).
- **Format:** 16:9 (3840 × 2160) master, 9:16 (1080 × 1920) utsnitt for Reels/TikTok – komponer med motivet i midtre 56 % av bredden. **24 fps**; helling og damp i **60 fps** (spilles av i 24 = 2,5× slow motion). Tekst stor nok for lyd av (≥ 6 % av bildehøyden). Undertekster brent inn i 9:16.
- **Musikk:** Rolig akustisk, ≈ 90 BPM (ett taktslag = 0,67 s). Klipp på taktslag, unntatt ved følelsesskiftet (scene 2→3) der musikken starter ved første helling.

| # | Tid | Bildeutsnitt | Kamerabevegelse | Hva vises | Tekst på skjerm | Lyd |
|---|---|---|---|---|---|---|
| 1 | 0–3 s | Detalj | Statisk, 100 mm | **Problemet:** hånd løfter vanlig keramikkopp; hinne på lunken kaffe; ansiktet trekker seg. Fjordblå grading | «Kald igjen?» | Tikkende klokke, Teams-pling. Ingen musikk |
| 2 | 3–6 s | Halvnær | Rask push-in | Person ved PC går mot mikrobølgeovnen; pip-pip. Kort montasje (3 klipp på taktslag) | «Tredje runde i mikroen i dag.» | Mikropip ×3 |
| 3 | 6–10 s | Nær | Sakte tilt ned, **60 fps** | **Skifte:** varm kaffe helles i Tretimer, damp i bakgrunnslys. Grading går fra blå til varm | «Møt Tretimer.» | Musikken starter på første dråpe |
| 4 | 10–14 s | Detalj / animasjon | 3D-animert snitt, langsom rotasjon | Snitt av veggen: kobberfarget PCM-lag «fylles» med varme, vakuumspalten markert | «Et lag som tar opp overskuddsvarmen – og gir den tilbake.» | Lavt, varmt «sus» |
| 5 | 14–18 s | Nær | Statisk, rack focus fra lokk til åpning | Lokket trykkes på, skjørtet glir over kanten; tommel skyver drikkeåpningen | «Tett vakuumlokk. Drikk uten å ta det av.» | Mykt klikk på taktslag |
| 6 | 18–23 s | Total | Timelapse, slider 30 cm | Skrivebord fra morgen til ettermiddag: lyset vandrer, møter på skjermen, koppen står | «Laget for den som drikker sakte.» ⏳ etter T1: «Over 55 °C ved siste slurk etter 3 t*» | Musikk bygger |
| 7 | 23–27 s | Halvnær | Håndholdt, rolig | Siste slurk, fornøyd. Kamera glir forbi tomt hjørne av bordet – ingen lader | «Ingen batteri. Ingen lading.» | Musikk, fornøyd «mm» |
| 8 | 27–30 s | Total (packshot) | Statisk | **Produkt + løfte:** hero på havremelk, logo, pris | «Tretimer – drikkeklar kaffe uten batteri.» + «Forhåndsbestill» | Siste akkord på taktslag |

\* Fotnote ved ⏳-tekst (bare etter test): «Målt av [lab], 300 ml, 85 °C inn, 20 °C rom, 12 slurker. Se tretimer.no/test.»

## Kontroll mot `06_pitch.md`
- Ingen tall for temperatur eller tid brukes før T1/T3. «Over 55 °C» er merket ⏳.
- Ingen navngitte konkurrenter, ingen helsepåstand (IARC), ingen «oppvaskmaskin», ingen «patentert».
- «Uten batteri / ingen lading», «tett vakuumlokk», «lag som tar opp overskuddsvarmen» er konstruktive fakta. Sistnevnte forutsetter at PCM-et er med i produktet (variant A).
