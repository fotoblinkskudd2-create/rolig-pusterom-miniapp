# Designprompts

> Generert fra `src/concepts.json` med `npm run docs`. Ikke rediger for hånd.

Én skjermprompt og én ikonprompt per app. Promptene er skrevet på engelsk, fordi UI-generatorer
(Figma Make, v0, Galileo, Uizard, Midjourney) gir best resultat på engelsk, men UI-tekstene er norske.
Hver prompt har samme oppbygning: produkt og målgruppe, stemning, palett med hex-koder, skjermer i rekkefølge,
komponenter, bevegelse, tone og en «ikke gjør»-liste mot generisk slop.

Promptene finnes også inne i appen: trykk ⓘ i en app, eller på en rad under «Alle konsepter» på hjemskjermen. Der er det en kopier-knapp.

## 1. 🔨 Gjeldsknuser

Farger: `#ff5a4e` → `#9b0d0d` · tint `#ff3b30`

**Skjermer:**

```text
Design a 3-screen iOS 18 app called «Gjeldsknuser», a local-first debt payoff tool for Norwegians buried in BNPL (Klarna), credit cards and debt collection. Mood: brutally honest, never shaming. Graphite base (#16181D dark / #F2F2F7 light), one hot signal red (#FF3B30) reserved for interest, mint green (#34C759) for paid-off progress. SF Pro Rounded numerals, huge. Screen 1 «Oversikt»: hero card with a live interest taximeter ticking kroner per second like an odometer, beneath it per-day / per-year cost, then an inset grouped list of debts with balance + APR. Screen 2 «Plan»: segmented control Snøball | Skred, debt-free date as a giant headline, month-by-month payoff order as a vertical timeline. Screen 3 «Gjeld»: detail with balance, rate, minimum payment, monthly fee, payment log. Native large-title nav, bottom tab bar, 393×852, light + dark. Microcopy in Norwegian, direct: «Dette koster deg 41 kr i døgnet». No money bags, no 3D coins, no stock illustration.
```

**Ikon:**

```text
iOS app icon, a single sledgehammer cracking a red percent sign, flat vector, deep red gradient, white glyph, no text
```

## 2. 🧩 Delene

Farger: `#c86bff` → `#5856d6` · tint `#af52de`

**Skjermer:**

```text
Design an iOS 18 app «Delene», a private system journal for people with DID/OSDD (plural systems). Feeling: safe, warm, non-clinical, like a shared house notebook. Palette: soft violet (#AF52DE) to indigo (#5856D6) accents on neutral system backgrounds; every alter/part has its own colour dot. Screen 1 «Fremme»: big card showing who is fronting now (colour avatar circles, co-front allowed), a timestamp «siden 14:02», and a horizontal timeline strip of today's switches. Screen 2 «Deler»: grid of part cards (name, age, role, pronouns, colour), tap opens profile with «Trøst» and «Triggere» sections. Screen 3 «Tavla»: message board where parts leave notes for each other, signed with their colour. Screen 4 «Tapt tid»: log of lost time with «hva vet vi» and «hva ble kjøpt». Rounded cards, generous spacing, large title nav, tab bar. Microcopy in Norwegian, gentle: «Alle er velkomne her». No brains, no puzzle-piece cliché in the UI, no medical blue.
```

**Ikon:**

```text
iOS app icon, overlapping translucent circles in violet, indigo and pink forming a soft cluster, flat, no text
```

## 3. 🧊 Impulsbrems

Farger: `#64d2ff` → `#0a5cff` · tint `#0a84ff`

**Skjermer:**

```text
Design an iOS 18 app «Impulsbrems», a cooling-off chamber for impulse purchases. Visual metaphor: items frozen in ice blocks that slowly thaw. Palette: glacier cyan (#64D2FF) to deep blue (#0A5CFF), frosted glass materials, white space. Screen 1 «Fryseren»: list of frozen wishes, each card shows product name, price, a thaw progress ring and remaining time «2 d 4 t», plus price translated to work hours «= 31 arbeidstimer». Screen 2 add sheet: name, price, link, cooling period segmented 24 t | 72 t | 1 uke. Screen 3 «Tint»: when thawed, a decision card with two big buttons «Kjøp» and «Dropp»; dropping adds to a «Spart» counter shown as a giant rounded number. Settings: hourly wage + tax %. Frosted cards with subtle ice texture, large titles, tab bar. Norwegian microcopy. No shopping carts, no confetti.
```

**Ikon:**

```text
iOS app icon, a shopping tag frozen inside a glossy ice cube, cyan to blue gradient, flat vector, no text
```

## 4. 🌗 Skiftsøvn

Farger: `#7d7aff` → `#1c1b4a` · tint `#5e5ce6`

**Skjermer:**

```text
Design an iOS 18 app «Skiftsøvn», a sleep planner for shift workers. Mood: night-time calm, nurse-at-4am tired-friendly. Dark-first: midnight navy (#1C1B4A) to indigo (#5E5CE6), warm amber (#FF9F0A) for daylight windows, muted grey for sleep. Screen 1 «I dag»: a 24-hour circular clock dial showing today's shift arc, the sleep window arc, a caffeine cutoff tick and a «lys/mørke» band, with the next action as a headline «Sov 08:30–15:30». Screen 2 «Uke»: 7 rows, each with a horizontal 24 h bar showing shift (coloured by type) and sleep block. Screen 3 add shift sheet: type chips Dag | Kveld | Natt | Fri, start and end time wheels. Big tap targets, low-contrast-at-night palette, SF Pro Rounded times, tab bar. Norwegian microcopy. No moons with faces, no stars clip-art.
```

**Ikon:**

```text
iOS app icon, a circle split diagonally into sun-amber and night-indigo halves with a thin clock hand, flat, no text
```

## 5. 🎧 Tinnitusro

Farger: `#40c8e0` → `#0b3d4a` · tint `#30b0c7`

**Skjermer:**

```text
Design an iOS 18 app «Tinnitusro», a tinnitus frequency matcher and sound masker. Mood: deep-sea quiet. Palette: abyss teal (#0B3D4A) to sea cyan (#30B0C7), soft white waveform lines. Screen 1 «Mask»: large play/pause disc in the centre with a slowly breathing ring, below it noise colour chips Hvit | Rosa | Brun, a volume slider and a sleep timer row «Slå av etter 30 min». Screen 2 «Finn frekvens»: a horizontal frequency slider (250 Hz–12 kHz, log scale) with a live sine wave visual, fine-tune ±, «Lagre som min tinnitus» button, saved value as a big number «6 200 Hz». Screen 3 «Hakk»: toggle notch filter, shows spectrum curve with a gap at the saved frequency. Minimal chrome, large title, tab bar, dark-first. Norwegian microcopy. Warn about volume gently. No ear illustrations.
```

**Ikon:**

```text
iOS app icon, a calm teal wave line with a small notch cut out of it, dark teal background, flat, no text
```

## 6. 🍞 Surdeigsvakt

Farger: `#ffc56b` → `#a2845e` · tint `#c88a2b`

**Skjermer:**

```text
Design an iOS 18 app «Surdeigsvakt», a sourdough starter keeper and baker's calculator. Mood: warm kitchen, flour-dusted, Scandinavian bakery. Palette: wheat (#FFC56B), crust brown (#A2845E), cream backgrounds, charcoal text. Screen 1 «Starter»: a hero jar illustration (simple, flat) filling according to hours since last feed, headline «Kjell ble matet for 9 t siden», button «Mat nå», then a feed log list. Screen 2 «Ratio»: inputs for starter grams and ratio chips 1:1:1 | 1:2:2 | 1:5:5, output flour and water in big rounded numbers. Screen 3 «Oppskrift»: baker's percentage table (flour 100 %, water 75 %, salt 2 %, levain 20 %) with total dough weight input. Screen 4 «Heving»: countdown ring. Soft shadows, rounded cards, large title, tab bar. Norwegian microcopy. No cartoon bread faces.
```

**Ikon:**

```text
iOS app icon, a simple mason jar with bubbling sourdough rising over the rim, wheat-gold gradient, flat, no text
```

## 7. 🫙 Gjæringslogg

Farger: `#ffd60a` → `#b86e00` · tint `#d18b00`

**Skjermer:**

```text
Design an iOS 18 app «Gjæringslogg», a batch tracker for home fermentation: beer, mead, kombucha, kimchi. Mood: cellar shelf, amber glass, handwritten labels. Palette: honey yellow (#FFD60A) to amber (#B86E00), dark walnut in dark mode. Screen 1 «Hylla»: a list of batch cards styled like jar labels: type icon, name, «Dag 12 av 21», progress bar, status chip (Aktiv / Klar / Ferdig). Screen 2 batch detail: start date, OG, FG, live ABV as a big number «6,4 %», tasting notes timeline. Screen 3 «Kalkulator»: OG/FG steppers with live ABV and apparent attenuation. Large titles, tab bar, rounded corners, subtle paper texture on cards. Norwegian microcopy. No cartoon beer mugs.
```

**Ikon:**

```text
iOS app icon, a glass fermentation jar with rising bubbles and an airlock, honey-amber gradient, flat, no text
```

## 8. 💿 Vinylhylla

Farger: `#3a3a3c` → `#ff375f` · tint `#ff2d55`

**Skjermer:**

```text
Design an iOS 18 app «Vinylhylla», a vinyl record collection app focused on listening, not trading. Mood: late-night listening room, record store crate. Palette: near-black (#1C1C1E), hot pink (#FF2D55) accent, warm grey. Screen 1 «Hylla»: a grid of square record tiles (generated colour gradients from artist name instead of cover art), search bar, sort Artist | År | Mest spilt. Screen 2 «Spill»: a large spinning vinyl disc with the suggested album title, reason «Ikke spilt på 214 dager», buttons «Spill» (increments play count) and «En annen». Screen 3 record detail: artist, album, year, pressing, Goldmine grade picker (M, NM, VG+, VG, G+, G, F, P) as segmented chips, play count, notes. Large titles, tab bar, dark-first. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a black vinyl record with a hot pink label, slight angle, glossy grooves, flat, no text
```

## 9. 🌈 Dagstripe

Farger: `#ffb340` → `#ff375f` · tint `#ff6b2c`

**Skjermer:**

```text
Design an iOS 18 app «Dagstripe», a visual day planner for ADHD and autistic people. Mood: playful but calm, colour as information. Palette: each activity block gets a saturated pastel (orange #FFB340, pink #FF375F, mint #63E6E2, indigo #7D7AFF), neutral system background. Screen 1 «I dag»: a vertical timeline of the day from 06 to 23, coloured rounded blocks with emoji + title + duration, a red «nå»-line sliding through, current block expanded with a countdown ring «22 min igjen». Screen 2 «Nå»: fullscreen focus view of the current block: giant emoji, shrinking pie timer, «Neste: Lunsj 12:00». Screen 3 add block sheet: emoji picker, title, start, duration chips 15 | 30 | 45 | 60 | 90, colour swatches. Screen 4 «Maler». Rounded SF Pro Rounded type, large tap targets, gentle haptics, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a vertical stack of rounded rainbow pastel bars with a thin red now-line crossing, flat, no text
```

## 10. 🛖 Hyttebygger

Farger: `#4cd964` → `#1e6b3a` · tint `#28a745`

**Skjermer:**

```text
Design an iOS 18 app «Hyttebygger», a focus timer where every completed session adds a plank to a Norwegian mountain cabin. Mood: cosy, quiet, hand-built. Palette: forest green (#28A745 to #1E6B3A), tarred-wood brown, snow white, red cabin trim (#C0392B). Screen 1 «Fokus»: centre stage a flat isometric cabin at its current build stage (foundation → walls → roof → chimney smoke → lights in windows), below a big circular timer and duration chips 15 | 25 | 50, a single «Start» button. Running state: the timer ring fills, a plank hovers above the cabin. Broken state: a cracked plank with copy «Du forlot hytta. Planken knakk.». Screen 2 «Hytta»: progress «Trinn 7 av 12», plank count, streak. Screen 3 «Statistikk»: weekly bar chart of focus minutes. Flat vector, soft shadows, large titles, tab bar. Norwegian microcopy. No cartoon animals.
```

**Ikon:**

```text
iOS app icon, a tiny red Norwegian cabin with turf roof under construction, one floating plank, green gradient, flat, no text
```

## 11. 🧗 Klatrelogg

Farger: `#ffa64d` → `#7a3e00` · tint `#e8770e`

**Skjermer:**

```text
Design an iOS 18 app «Klatrelogg», a climbing logbook for bouldering and sport climbing. Mood: chalk, rubber, gym wall. Palette: chalk white, burnt orange (#E8770E), deep rust (#7A3E00), hold colours as accents. Screen 1 «Logg»: big quick-add card: segmented Buldring | Tau, grade picker as horizontally scrolling chips (Font 4 … 8A), attempts stepper, result chips Toppet | Flash | Prosjekt, «Lagre». Below, today's session list. Screen 2 «Pyramide»: a centred grade pyramid of horizontal bars, widest at the bottom, labelled by grade, plus max grade and flash rate. Screen 3 «Økter»: calendar dots and session list. Bold rounded numerals, chunky tap targets for chalky fingers, large titles, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a single orange climbing hold with a chalk handprint, rust gradient, flat, no text
```

## 12. 🦵 Korsbånd

Farger: `#3d9bff` → `#003a80` · tint `#0a84ff`

**Skjermer:**

```text
Design an iOS 18 app «Korsbånd», an ACL reconstruction rehab companion. Mood: clinical precision meets sports motivation. Palette: physio blue (#0A84FF) to navy (#003A80), success green for milestones, white. Screen 1 «I dag»: header «Dag 23 · Fase 2: Kontroll», a progress bar across the five phases, today's exercise checklist (heel slides, quad sets, straight leg raise) with sets × reps. Screen 2 «Mål»: big semicircular protractor visual showing today's knee flexion «118°» and extension «−2°», input steppers, line chart over time with target band. Screen 3 «Smerte»: 0–10 slider with colour gradient and swelling note. Clean, data-forward, large titles, tab bar. Norwegian microcopy, with a quiet disclaimer «Følg planen fra fysioterapeuten din». No anatomical gore.
```

**Ikon:**

```text
iOS app icon, a minimal line drawing of a bent knee with a protractor arc, blue gradient, flat, no text
```

## 13. 🌸 Bekkenbunn

Farger: `#ff8fa8` → `#b8335a` · tint `#e0457b`

**Skjermer:**

```text
Design an iOS 18 app «Bekkenbunn», a discreet pelvic floor (Kegel) trainer. Mood: soft, body-positive, private. Palette: blush pink (#FF8FA8) to raspberry (#B8335A), cream background, no anatomical imagery at all. Screen 1 «Trening»: one large breathing circle that contracts on «Knip» and expands on «Slipp», with the phase word inside and a rep counter «4 / 10», program chips Nybegynner | Utholdenhet | Hurtig. Screen 2 «Kalender»: month grid with filled dots for completed days, current streak big «12 dager». Screen 3 settings: discreet mode (rename app to «Pust»), haptics toggle. Rounded type, minimal chrome, large title, tab bar. Norwegian microcopy, kind and plain.
```

**Ikon:**

```text
iOS app icon, an abstract pink blossom formed by two concentric soft circles, blush gradient, flat, no text
```

## 14. 🏡 Samvær

Farger: `#4cd964` → `#0b7a3e` · tint `#30a14e`

**Skjermer:**

```text
Design an iOS 18 app «Samvær», a co-parenting organiser for separated parents. Mood: neutral ground, calm, fair, no blame. Palette: two parent colours, sage green (#30A14E) and warm sand (#E0A458), on neutral system backgrounds. Screen 1 «Kalender»: month grid where each day is filled with the colour of the parent who has the kids, today highlighted, handover days marked with a small arrow; picker for pattern 7/7 | 2-2-3 | Annenhver helg. Screen 2 «Utgifter»: balance hero «Kari skylder Ola 640 kr» with a centred balance bar, list of expenses (what, who paid, amount, split 50/50). Screen 3 «Overlevering»: notes cards («Medisin i sekken», «Gymtøy»). Large titles, tab bar, rounded cards. Norwegian microcopy, careful and neutral.
```

**Ikon:**

```text
iOS app icon, two small houses side by side sharing one heart-shaped roof line, green and sand, flat, no text
```

## 15. 🌡️ Feberlogg

Farger: `#ff6b5e` → `#ff9f0a` · tint `#ff5e3a`

**Skjermer:**

```text
Design an iOS 18 app «Feberlogg», a fever and medicine log for parents of sick kids at night. Mood: calm authority at 3 am, readable half-asleep. Dark-first with warm coral (#FF5E3A) and amber (#FF9F0A), extra large type, high contrast. Screen 1 «Nå»: child switcher at the top (avatar circles), a big card «Neste Paracet tidligst 04:00 · om 47 min» with a countdown ring, last temperature «39,4 °C kl 03:12», two huge buttons «Mål temp» and «Gi medisin». Screen 2 «Logg»: combined timeline of temperatures and doses, small line chart of temp with a 38 °C reference line. Screen 3 «Dose»: weight input, medicine picker, calculated mg and ml, with the clear notice «Veiledende. Følg pakningsvedlegg og lege». Large title, tab bar. Norwegian microcopy. No cartoon thermometers.
```

**Ikon:**

```text
iOS app icon, a minimal thermometer with a crescent moon behind it, coral to amber gradient, flat, no text
```

## 16. 🌦️ Humørvær

Farger: `#64d2ff` → `#bf5af2` · tint `#7a5cff`

**Skjermer:**

```text
Design an iOS 18 app «Humørvær», a mood tracker built on a 2D mood meter (energy × pleasantness) instead of a 1–5 scale. Mood: weather map of the mind. Palette: four quadrant colours, red-orange (high energy, unpleasant), yellow (high, pleasant), green-teal (low, pleasant), blue-violet (low, unpleasant), blending smoothly across a square. Screen 1 «Sjekk inn»: a large square gradient pad, draggable dot, live emotion word under it («Rastløs», «Rolig», «Nedfor», «Begeistret»), tag chips, optional note, «Lagre». Screen 2 «Uke»: scatter of the week's points on a miniature pad plus a list. Screen 3 «Rapport»: summary for a therapist (most common quadrant, top tags) with an «Eksporter» button. Soft gradients, rounded type, large titles, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a square split into four soft blended colour quadrants with a small white dot, flat, no text
```

## 17. 🪤 Tankefelle

Farger: `#7d7aff` → `#30b0c7` · tint `#5e5ce6`

**Skjermer:**

```text
Design an iOS 18 app «Tankefelle», a CBT thought record. Mood: clear-headed, gentle, notebook-like. Palette: indigo (#5E5CE6) to teal (#30B0C7), lots of white, one accent per step. Screen 1 «Ny»: a step-by-step wizard with a progress dots header: Situasjon → Følelse (+ intensity slider) → Automatisk tanke (+ belief %) → Tankefelle (chips: Svart-hvitt, Katastrofetenkning, Tankelesing, Spå framtida, Overgeneralisering, Merkelapper, Bør-tenkning, Personliggjøring, Mentalt filter, Følelsesresonnering) → Bevis for → Bevis mot → Balansert tanke (+ new belief %). Screen 2 «Skjemaer»: list with before→after belief change «95 % → 30 %». Screen 3 «Mønstre»: horizontal bar chart of most frequent traps. Large titles, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a simple speech bubble caught in an open minimalist trap outline, indigo to teal gradient, flat, no text
```

## 18. 🌅 Edru

Farger: `#ffb340` → `#ff6b2c` · tint `#ff8a00`

**Skjermer:**

```text
Design an iOS 18 app «Edru», a recovery companion for sobriety (alcohol, drugs, gambling). Mood: sunrise, dignity, no shame. Palette: dawn amber (#FFB340) to sunrise orange (#FF6B2C), deep night blue for the urge screen. Screen 1 «Teller»: giant live counter «47 dager 6 t 12 min», money saved «8 460 kr», next milestone progress «60 dager». Screen 2 «Bølge» (urge surfing): a full-screen slow wave animation that rises and falls over 10 minutes, a calm timer, copy «Trangen topper seg og legger seg. Bli her.», after finishing: «Hva trigget?» chips. Screen 3 «Historikk»: past streaks preserved as bars (no reset-to-zero shame), copy «Hver dag teller fortsatt». Large title, tab bar, rounded type. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a half sun rising over a calm horizon line, amber to orange gradient, flat, no text
```

## 19. 📞 Ringerunde

Farger: `#4cd964` → `#30b0c7` · tint `#20a38a`

**Skjermer:**

```text
Design an iOS 18 app «Ringerunde», a personal keep-in-touch reminder (a tiny relationship CRM without the corporate feel). Mood: warm, human, kitchen-table. Palette: leaf green (#4CD964) to teal (#30B0C7), warm off-white. Screen 1 «På tide»: list of people sorted by how overdue they are, each row with an initial avatar, name, «Sist: 47 dager siden», an overdue bar, and quick actions «Ringte», «Melding», «Møttes». Screen 2 person detail: desired frequency (Ukentlig, Månedlig, Kvartalsvis), contact history timeline, «Snakk om neste gang» notes. Screen 3 «Alle». Rounded avatars with generated pastel colours, large titles, tab bar. Norwegian microcopy. No social feed patterns, no likes.
```

**Ikon:**

```text
iOS app icon, a classic phone handset forming a loop with a small heart, green to teal gradient, flat, no text
```

## 20. 🪚 Snekkerkalk

Farger: `#c9a46b` → `#5c4326` · tint `#a2742f`

**Skjermer:**

```text
Design an iOS 18 app «Snekkerkalk», a woodworking calculator: cut-list optimiser and stair calculator. Mood: workshop, pencil on timber, tape-measure yellow. Palette: pine (#C9A46B), walnut (#5C4326), tape yellow (#FFD60A) accent, graph-paper backgrounds. Screen 1 «Kappliste»: inputs for stock length (mm) and kerf, a list of cuts (length × quantity) with add row, result: «7 lengder · 4,2 % svinn» and a visual plan, one horizontal bar per stock board, divided into coloured segments for each cut, grey hatched waste at the end. Screen 2 «Trapp»: total rise and run inputs, output number of steps, riser height, tread depth, comfort rule check (2 × opptrinn + inntrinn ≈ 62 cm) with a green/red badge and a side-profile stair diagram. Bold mono numerals, large titles, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a hand saw crossing a pine plank with a measuring tick scale, wood brown gradient, flat, no text
```

## 21. 🏠 Boligkalk

Farger: `#3d9bff` → `#30b0c7` · tint `#0a84ff`

**Skjermer:**

```text
Design an iOS 18 app «Boligkalk», a Norwegian mortgage calculator that knows local lending rules. Mood: trustworthy, bank-grade clarity without bank branding. Palette: clear blue (#0A84FF) to teal (#30B0C7), white, green/red status badges. Screen 1 «Lån»: inputs (kjøpesum, egenkapital, rente, løpetid) in an inset grouped list, segmented Annuitet | Serie, results card: monthly payment first month, total interest, a stacked area chart of interest vs principal over time. Screen 2 «Krav»: checklist with status badges: Egenkapital ≥ 10 %, Gjeld ≤ 5 × inntekt, Stresstest (+3 pp) betjenbar, each with the exact numbers. Screen 3 «Kjøp»: dokumentavgift 2,5 %, tinglysing, total cash needed. Large titles, tab bar, tabular figures. Norwegian microcopy. No house clip-art.
```

**Ikon:**

```text
iOS app icon, a minimal house outline with a percent sign as the window, blue to teal gradient, flat, no text
```

## 22. 🧾 Frilanskalk

Farger: `#4cd964` → `#0a84ff` · tint `#1f9d55`

**Skjermer:**

```text
Design an iOS 18 app «Frilanskalk», an hourly-rate and tax set-aside calculator for Norwegian freelancers (ENK). Mood: confident, grown-up money tool. Palette: money green (#1F9D55) to clear blue (#0A84FF), white cards, tabular numerals. Screen 1 «Timepris»: a hero result card «Du må ta 1 140 kr/t eks. mva», below an inset grouped form: ønsket netto årslønn, ferieuker, sykedager, fakturerbar andel slider, månedlige utgifter, pensjon %, skatt+trygd %. A horizontal stacked bar shows where each krone of the rate goes (skatt, utgifter, pensjon, ferie/sykdom, deg). Screen 2 «Faktura»: enter invoice amount, toggle MVA 25 %, output «Sett av» amounts as three tiles: MVA, Skatt, Til deg. Large titles, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a receipt with a clock face on it, green to blue gradient, flat, no text
```

## 23. ⚖️ Besluttet

Farger: `#8e8e93` → `#3a3a3c` · tint `#636366`

**Skjermer:**

```text
Design an iOS 18 app «Besluttet», a decision helper with a weighted matrix and a coin-flip gut check. Mood: stoic, grey-scale calm, one colour only for the winner. Palette: graphite (#3A3A3C), system greys, winner highlight in green (#34C759). Screen 1 «Matrise»: options as columns, criteria as rows with weight steppers (1–5), cells are 1–10 score chips, a totals row with the winner column glowing. Screen 2 «Mynt»: a large 3D-ish coin that flips with a tap, lands on one option, then asks «Ble du lettet eller skuffet?» with two buttons, and records the gut answer. Screen 3 «Beslutninger»: saved decisions with the date and «Hvordan gikk det?» follow-up. Monochrome, crisp, large titles, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a minimal balance scale with one pan slightly lower, graphite gradient, silver glyph, flat, no text
```

## 24. 🎒 Sekkevekt

Farger: `#34c759` → `#8a6a3f` · tint `#3a9d4f`

**Skjermer:**

```text
Design an iOS 18 app «Sekkevekt», a backpacking gear weight planner. Mood: Norwegian mountain, topo map, lightweight. Palette: moss green (#3A9D4F), earth brown (#8A6A3F), snow white, subtle contour-line pattern in headers. Screen 1 «Tur»: hero total «Basevekt 6,4 kg» with a segmented donut (Ly, Sove, Kjøkken, Klær, Annet), three tiles Base | Forbruk | På kroppen, then packed items grouped by category with grams and a checkbox. Screen 2 «Lager»: all gear with name, category, grams, search. Screen 3 «Tyngst»: top-5 heaviest items as horizontal bars with copy «Bytt disse først». Large titles, tab bar, tabular figures. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a minimal backpack silhouette with a small mountain peak on the pocket, moss to earth gradient, flat, no text
```

## 25. 🗣️ Snakkebrett

Farger: `#3d9bff` → `#5856d6` · tint `#2f6bff`

**Skjermer:**

```text
Design an iOS 18 app «Snakkebrett», an AAC (augmentative communication) board that speaks Norwegian phrases aloud. Mood: maximum clarity and accessibility, friendly not childish. Palette: strong blue (#2F6BFF) to indigo (#5856D6), with category colours (Behov green, Følelser orange, Folk pink, Svar blue), WCAG AAA contrast. Screen 1 «Brett»: two giant buttons at the top «JA» (green) and «NEI» (red), category tabs, a 2-column grid of big rounded phrase tiles with emoji + text («Jeg har vondt», «Jeg er tørst», «Kan du vente litt?»), tapping speaks and briefly highlights. Screen 2 «Skriv»: large text field, «Snakk» button, «Vis stort» button that shows the text fullscreen in huge type to turn the phone towards someone. Screen 3 «Mine»: add and reorder custom phrases. Huge tap targets (min 64 pt), large title, tab bar. Norwegian microcopy.
```

**Ikon:**

```text
iOS app icon, a bold rounded speech bubble with three sound waves, blue to indigo gradient, flat, no text
```
