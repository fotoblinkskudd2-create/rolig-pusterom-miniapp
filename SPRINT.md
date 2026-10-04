# SPRINT — Rolig: from mini-app to studio

> Innovation sprint, 04.10.2026. Input: this repo. Five commits, about 460 lines of HTML, three notes files and one Grok-bot prompt.
> That is enough material. Nothing here is made up to fill space. Where a fact has to be checked before it ships, it is marked **[verify]**.

---

## 0. Start here: the hole in the floor

On 29.08 the 1.1 commit said: *nav-fix, lokal-first, historikk-export, Isolation Mirror bundet til Labben.* `HULL.md` said a stranger could now "open `index.html` → read «Alt blir på denne enheten» → export history".

`index.html` was never changed in that commit. The docs shipped. The code didn't. The nav was still broken, the trust line wasn't there, there was no export button, and one more thing: **any note a user wrote went into the history page as raw HTML.** In a mental-health app, a person's most private sentence could run as code.

This sprint fixed that first (commit `1.1 i index.html`). The bug isn't the point. The pattern is: **your writing about the product moves faster than the product.** Your vision runs ahead of your execution. That is your biggest asset and your biggest risk, and the whole sprint is built around it. Every roadmap below closes the gap between what you say and what ships, and puts a stranger in front of it every week.

---

## I. VIBE CODE EXTRACTION & ANALYSIS

### The raw material

| Artifact | What it actually says |
|---|---|
| `index.html` | «Hei. Du er trygg her.» A 1–5 mood scale. A 4-2-6 breath cycle (inhale 4s, hold 2s, exhale 6s). Seven small acts. «Ingen sjekk-ins ennå. Det er greit.» |
| `isolation-mirror.html` | A dark room (#1a1f1c). «Bildet forlater ikke enheten.» A three-step private protocol. «Du er ikke alene i dette. **Kampen teller.**» |
| The Labben prompt | `RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky` · `DNA: fototerapi + passiv mekanikk + 48t` · `Seed 7. Drepe minst 3.` · `nynorsk` · `Ikke nytt OS.` |
| `HULL.md` | "60 sekunder for en fremmed." A self-audit that names its own failures in numbered lines. Calls the old Midjourney prompt "slop". |
| `RUN.md` | «Ingen server. Ingen konto.» «Ingenting går på nett.» |
| Your handle | *fotoblinkskudd*, a flash shot. A photographer's name. |

### The signature: **RÅ RO** (raw calm)

The surface says *you're safe here*. Underneath is someone who wrote *Kampen teller*, *the struggle counts*, and who kills three ideas out of every seven. This isn't a wellness brand that discovered pain. **It's someone in the storm building the one room that stays still.** The calm isn't decoration. It's held in place against something.

Most of the "calm" market sells calm from the outside: pastel skies, a soothing voice that has never been late on a bill. Your work sells calm from the inside: "Det er greit" said by someone who knows it often isn't.

### Five codes (the DNA strands)

1. **LOKAL: nothing leaves.** Not a feature. A moral position. «Ingen sky. Det skal bli slik.» The product's trust is its architecture, not its privacy policy.
2. **KORT: short sentences, periods, imperatives.** «Sett føttene i gulvet. 3 dype pust.» No adjectives doing emotional labour. The rhythm of your copy is the rhythm of the breath: short, held, released.
3. **SANN: one true sentence.** "Skriv én setning som er sann akkurat nå." Honesty over positivity. You never say "you've got this". You say "the struggle counts".
4. **KAMP: the fight is acknowledged, not fixed.** No promise of healing. You count care (*«Du har tatt vare på deg selv 4 ganger denne uken»*), not progress. That's a radical metric, and it's right.
5. **DREP: kill to keep.** Seed 7, kill 3. "Slop" as a named enemy. Your aesthetic is defined by what you remove.

### Your grammar: definition by refusal

Look at how you write: *Ingen server. Ingen konto. Ingen sky. Ingen marketplace. Ikke nytt OS. Ingen slop.* Your brand speaks in negations. That's rare and strong. Patagonia's "Don't buy this jacket" and the Light Phone ("a phone designed to be used as little as possible") are the closest commercial cousins. **Make the Refusal List a public, versioned brand asset** (see §VII).

### Tension map (where the energy is)

```
        CALM SURFACE ─────────────────────── RAW INTERIOR
   «Du er trygg her»                         «Kampen teller»
   light room #f5f7f4                        dark mirror #1a1f1c
   breath, 4-2-6                             Seed 7 · Drepe 3
   bokmål, soft                              nynorsk, hard
   for the user                              for the maker
```

Every strong concept below sits on this line and uses both ends at once.

---

## II. PATTERN MAPPING & HIDDEN CONNECTIONS

### 1. Your breath cycle is already a piece of music
4 + 2 + 6 = **12 seconds = 5 breaths per minute.** That sits inside the range used in *resonance-frequency* / HRV-biofeedback breathing (roughly 4.5–7 breaths/min in the literature **[verify exact range in sources you cite]**). The long exhale is also the physiologically "right" one: exhale-weighted breathing is the standard way into parasympathetic down-regulation.

In music terms: at 60 BPM, one breath is **12 beats, three bars of 4/4**: bar 1 = rise, half of bar 2 = suspension, bar 2b–3 = release. **You have a time signature, a tempo and a song form. You don't have the sound yet.** Every sonic idea below grows out of this.

### 2. Fotoblinkskudd × Isolation Mirror × "48t" = phototherapy with a clock
Your handle is photographic. The Mirror is a photo tool. Your Labben DNA literally says *fototerapi + passiv mekanikk + 48t*. There's real practice here: Judy Weiser's *PhotoTherapy Techniques* (looking at your own photos as a therapy tool) and Jo Spence's work with photography and illness. **No consumer product combines a private photo practice with deliberate forgetting.** That's the opening.

### 3. HULL.md is a method, not a note
"60 seconds for a stranger" plus naming your own failures in public is a usability doctrine and a content format. The mental-health app market has a documented privacy problem: Mozilla's *Privacy Not Included* reviews flagged most mental-health apps they examined, and the US FTC ordered BetterHelp in 2023 to pay $7.8M over sharing health data with advertisers. **Your "lokal-first" isn't a niche preference. It's the answer to the category's scandal,** and HULL is how you prove it in public.

### 4. Labben is a generative engine pointed at the wrong target
The `/lab` prompt (constraints → 7 seeds → kill 3 → IRP on the survivor) is basically Eno & Schmidt's *Oblique Strategies* turned into a pipeline. You built it to make ideas for yourself. Turned around, it becomes a product for other makers, and a form of content.

### 5. The two rooms are a narrative, not a theme toggle
`HULL.md` lists "dark mode" as missing. Wrong framing. You already *have* the dark mode: it's the Mirror. **Light room = Pusterom (day, body, breath). Dark room = Mirror (night, image, truth).** Dark mode isn't a setting. It's walking into the other room.

### 6. "Kampen teller" × Knausgård × Fosse
*Min kamp* is the best-known Norwegian book about the struggle of being ordinary. Jon Fosse (Nobel 2023) writes in **nynorsk**, in breath-length repetition, the language your Labben prompt asks for. Your copy voice already lives between them: Knausgård's honesty, Fosse's breath. It's a literary position few app makers could claim.

### 7. The stress nobody designs for: money
Your Labben framing (one person, local, no cloud, 48h) plus your recurring themes (systems, debt, the letter on the table) point to an unclaimed intersection: **the nervous-system moment of opening a bill.** The UK's Money and Mental Health Policy Institute exists because the link between money and mental health is well established. Money apps (YNAB, Monzo, even Cleo with its irreverent "roast mode") deal with numbers. Calm apps deal with breathing. **Nobody designs for the 90 seconds between seeing the envelope and opening it.**

### 8. Selves, plural
Every mood tracker assumes one continuous "I" who checks in. Many people don't experience themselves like that: dissociation, parts work (IFS), trauma-shaped minds. A check-in that asks *who* is checking in, not just *how*, is an unclaimed design space with deep emotional resonance.

### Highest-potential intersections (ranked)
1. **Breath-as-tempo × local Web Audio** → a sonic identity no competitor can copy because it *is* the product's mechanism.
2. **Money moment × breath protocol** → a wedge with real differentiation and a clear B2B/B2G path.
3. **Photo × forgetting (48h)** → Isolation Mirror becomes a real practice.
4. **HULL method × privacy scandal** → content that builds trust faster than marketing could.
5. **Refusal grammar × physical object** → a breathing object with no app, no Bluetooth, no account.

---

## III. CONCEPT GENERATION & EXPANSION

Value indicators: 💰 commercial · 🫀 emotional · 🔧 feasibility · ⚡ differentiation · 📡 reach (H/M/L)

### A. PRODUCT (software)

**1. TO ROM (Two Rooms): Pusterom 2.0.**
An installable PWA, offline, one file plus a manifest and service worker. Light room (check-in, breathe, small acts) and dark room (Mirror). You change rooms with a gesture, not a menu. The breath circle is the only animation in the app.
💰M 🫀H 🔧H ⚡M 📡M

**2. INKASSO-PUST (The Envelope Breath).**
A mode for the moment before opening a bill, a letter from NAV or the bank app. *"I'm about to open something."* → three 12-second breaths → "Open it. Read only two things: the amount and the date. Write them here. Close it." → one true sentence → the right help line (NAV's økonomi- og gjeldsrådgivning **[verify number]**, Gjeldsregisteret to see the full picture). Nothing is stored unless you choose to.
💰H 🫀H 🔧H ⚡H 📡M

**3. 03:00-ROMMET (The 3 a.m. Room).**
The app changes after midnight: fewer words, darker, slower cycle (4-2-8), bigger touch targets, and the crisis line always one tap away (Mental Helse 116 123, Kirkens SOS 22 40 00 40 **[verify both before shipping]**). No new features, just the existing ones at night pace.
💰L 🫀H 🔧H ⚡M 📡M

**4. HVEM SJEKKER INN? (Parts-aware check-in).**
Optional: name up to a few "parts" (or none). A check-in can be from a part. History shows who was here, not just how it went. Zero clinical language. IFS-informed, not IFS-branded.
💰L 🫀H 🔧H ⚡H 📡L

**5. 48-TIMERS SPEILET (The 48-Hour Mirror).**
The Mirror becomes a daily practice: one photo of something real. It lives in IndexedDB for 48 hours and then dissolves, with a visible fade over the last 6 hours. Passive mechanics: you do nothing, it forgets for you. You can choose to keep one photo a week.
💰L 🫀H 🔧H ⚡H 📡M

**6. KAMERA-PULS (camera biofeedback).**
Finger on the phone camera → PPG pulse estimate → shows whether the breath is slowing your heart. Processed locally, frame by frame, nothing stored. Turns "follow the circle" into "watch your body answer".
💰M 🫀M 🔧M ⚡M 📡M

### B. CONTENT (music, image, story)

**7. FEM PUST I MINUTTET (Five Breaths a Minute): the record.**
An ambient album where every track runs at the 12-second cycle. Not "relaxing music", but breathing scores: one track per protocol (day, night, envelope, mirror). Norwegian lineage: Biosphere (Geir Jenssen, *Substrata*), Arve Henriksen's breath-trumpet, Deathprod's weight.
💰M 🫀H 🔧H ⚡M 📡H

**8. PUSTEMERKET (the 12-second sonic mark).**
A sonic logo that is one breath: 4s swell, 2s suspension, 6s release. Used at the start of every video, record, installation, and as the only sound in the app. Sonic branding where the logo is the mechanism.
💰M 🫀M 🔧H ⚡H 📡M

**9. HULL: the 60-second audit series.**
A public format: you install a big mental-health app as a stranger and write what happens in the first 60 seconds. What it asks, what it tracks, what it sells. Numbered, dry, merciless. You audit yourself first.
💰L 🫀M 🔧H ⚡H 📡H

**10. RAPPORTER FRA STORMEN (Reports from the Storm).**
First-person gonzo writing (text and audio) about the systems that cause the stress: debt collection, waiting lists, bureaucracy. Not self-help. The opposite tone from the app, on purpose. This is the raw interior, published.
💰L 🫀H 🔧H ⚡H 📡M

**11. SMÅ GREP: the deck.**
52 printed cards, one act each, written in house voice. Offline, giftable, and works in a waiting room. *Oblique Strategies* for nervous systems.
💰M 🫀M 🔧H ⚡L 📡H

### C. HYBRID (physical × digital × spatial)

**12. PUSTESTEINEN (The Breathing Stone).**
A palm-sized object (ceramic or stone-cast) with a haptic motor that pulses 4-2-6. One button. No app, no Bluetooth, no account, no charging anxiety (weeks per charge). The anti-wearable.
💰H 🫀H 🔧M ⚡H 📡M

**13. PUSTEROM I DET OFFENTLIGE (public breathing rooms).**
A light installation for waiting rooms: library, NAV office, A&E, train station. A circle of light breathing at 5 per minute, no screen, no text. Turrell's sky rooms at municipal scale. Funded by art and health grants.
💰M 🫀H 🔧M ⚡H 📡H

**14. KLASSEROM-MODUS (classroom mode).**
A projector mode of Pusterom for teachers, aimed at the *folkehelse og livsmestring* theme in the Norwegian curriculum (LK20). No student data at all, by design. A school can adopt it without a privacy assessment because there's nothing to assess.
💰H 🫀M 🔧H ⚡M 📡H

**15. KAMPBOKA (The Struggle Book).**
Year-end: your check-ins become a printed book, generated locally as a PDF. The ones you made it through. Optional print-on-demand. A physical object that proves the year happened.
💰M 🫀H 🔧H ⚡H 📡L

**16. LABBEN: the constraint engine.**
Your `/lab` pipeline as a tool for other makers: pick constraints, generate seven ideas, kill three, stress-test the survivor. Sold as a card set, a prompt pack, or a workshop.
💰M 🫀L 🔧H ⚡M 📡M

### D. RADICAL ALTERNATIVES (you haven't considered these)

**17. PUST PÅ RADIO.**
No app at all: a daily 5-minute broadcast or podcast feed with one breath protocol over the 12-second score. Distribution without an install, a tracker or a login. A public-service format to pitch to NRK P2 / P13 **[pitch target, not validated]**.
💰L 🫀M 🔧H ⚡H 📡H

**18. ROLIG (the studio).**
Stop thinking of this as an app. Rolig becomes a label in the Teenage Engineering / Rune Grammofon sense: software, records, objects and writing under one code. Every release follows the Refusal List.
💰H 🫀H 🔧M ⚡H 📡H

**19. DIALEKT-PUST (voices of the country).**
Optional voice guidance recorded by real people in real dialects, collected through a dugnad. Stored offline in the app. Care that sounds like home, not like a San Francisco meditation teacher.
💰L 🫀H 🔧M ⚡H 📡M

**20. DEN TOMME APPEN (The Empty App).**
A version that does nothing except slowly darken the screen over 12-second breaths until it's black, then turns itself off. Sold for 1 kr as an art piece. A manifesto as a product.
💰L 🫀M 🔧H ⚡H 📡H (press)

---

## IV. VALUE ASSESSMENT MATRIX

Scores 1–10. Weighted equally on purpose: you're early, and every axis can still kill you.

| # | Concept | Commercial | Emotional | Feasibility | Differentiation | Reach | **Total** |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | **Inkasso-pust** | 7 | 9 | 8 | 10 | 6 | **40** |
| 2 | **To Rom (Pusterom 2.0)** | 6 | 8 | 10 | 7 | 7 | **38** |
| 3 | **Fem pust i minuttet + Pustemerket** | 5 | 9 | 9 | 7 | 8 | **38** |
| 4 | HULL audit series | 5 | 7 | 10 | 8 | 7 | **37** |
| 5 | Pustesteinen | 7 | 8 | 6 | 9 | 6 | **36** |
| 6 | Hvem sjekker inn? | 4 | 10 | 8 | 10 | 4 | **36** |
| 7 | Klasserom-modus | 8 | 6 | 9 | 5 | 7 | **35** |
| 8 | 03:00-rommet | 4 | 9 | 9 | 7 | 6 | **35** |

**Rationale**

1. **Inkasso-pust (40).** Highest differentiation in the set: no one owns "the moment before opening the bill". Feasible as a mode inside To Rom. Commercial path through B2B/B2G (debt-counselling services, municipalities, unions, possibly banks that want to look human). Reach is limited by stigma, so it's a wedge, not a mass product.
2. **To Rom (38).** Feasibility 10 because most of it exists. It's the platform for #1, #6 and #8. Differentiation is moderate on its own: local-first breathing apps exist. The Mirror and the voice are what lift it.
3. **Album + mark (38).** Cheapest way to build cultural reach. Streaming pays little, but the record does the job of a brand campaign and creates an asset the app, the stone and installations all use.
4. **HULL series (37).** Free to make, strong trust-builder, press-friendly. Low direct revenue, so it's marketing, and the best kind.
5. **Pustesteinen (36).** The most investable object and the strongest margin story, but hardware is where small studios die. Prototype it, don't manufacture it, in 90 days.
6. **Hvem sjekker inn? (36).** Emotional resonance 10: for the people who need it, nothing else comes close. Small and sensitive audience. Build it quietly into To Rom as an option and don't market it loudly.
7. **Klasserom (35).** The most direct revenue path in Norway. Lower differentiation and slow procurement. A good year-two play.
8. **03:00 (35).** Mostly a "do the right thing" feature. Ship it inside To Rom, because it's cheap, and because a calm app that goes silent at 3 a.m. fails at the hardest hour.

---

## V. DEEP-DIVE DESIGN DEVELOPMENT (TOP 3)

### 1 · INKASSO-PUST

**Positioning statement**
*For people whose chest tightens when a bill arrives, Inkasso-pust is the 90 seconds between seeing the envelope and opening it: a breathing protocol that gets you to the two numbers that matter and to the help that exists. Unlike budgeting apps, it doesn't want your bank login. Unlike calm apps, it doesn't pretend the letter isn't there.*

**Visual direction**
- Starts in the **light room**, not the dark one. This is daytime courage, not 3 a.m. despair.
- One unusual element: **paper**. The screen gets a faint warm paper texture (#f0e9df, your existing soft-beige). The envelope is the only illustration in the whole product: one line, no face, no emoji.
- Typography stays `system-ui`. Numbers (amount, due date) are set large, in tabular figures, alone on screen. *Make the number smaller than the fear by making it exactly as big as it is.*

**Sonic direction**
- The 12-second mark (Pustemerket), three times. Then silence, and the user opens the letter in silence. **Sound stops when reality starts.** That's the design.

**Narrative direction**
- Script (draft, house voice):
  1. «Du skal åpne noe. Vi gjør det sammen.»
  2. ○ three breaths ○
  3. «Åpne det nå. Les bare to ting: beløpet og datoen.»
  4. [ beløp ] [ dato ] → large, alone.
  5. «Det er et tall. Det er ikke deg.»
  6. «Én setning som er sann akkurat nå:» [ ________ ]
  7. «Neste steg finnes. Du trenger ikke ta det i dag.» → help options.
- Line 5 is the brand in one sentence.

**Target audience psychology**
- **Who:** people avoiding letters, apps and inboxes. Unopened post is the tell. Often ashamed, often competent in every other area of life. Freelancers, artists, people on benefits, people in debt collection, people with ADHD-shaped admin paralysis.
- **The need:** not information (they know they owe money) but *permission to look*. Avoidance is a nervous-system response, not a character flaw. The product treats it like one.
- **What they fear from an app:** being tracked, judged, sold to lenders. That's exactly what the Refusal List protects against: no bank connection, no account, no data.

**Differentiation strategy**
| They do | Inkasso-pust does |
|---|---|
| Budgeting apps want your bank login and show *all* the numbers | Asks for nothing and shows *two* numbers |
| Calm apps help you forget the letter | Gets you to open it |
| Debt services start at the phone call | Starts 90 seconds earlier, at the envelope |
| Cleo jokes about your spending | Doesn't joke and doesn't judge |

**Competitive landscape**
- *Money:* YNAB, Monzo, Cleo, bank apps. All assume you're ready to look.
- *Calm:* Calm, Headspace, Breathwrk, Apple's Mindfulness. None have a money mode.
- *Public:* NAV's financial counselling, Gjeldsregisteret, the UK's Money and Mental Health Policy Institute (research, not product).
- **Repositioning:** this creates a category, *the pre-action ritual*. The same pattern works for opening the NAV letter, a doctor's results, a message from the ex. Inkasso-pust is the first instance of a format.

**Reference systems**
- Design: the clarity of the *Dieter Rams* calculator; the Japanese *ma* (meaningful pause).
- Culture: Knausgård's ordinary shame, made speakable.
- Behavioural: "implementation intentions" (if X, then Y) and exposure ladders. Small, scheduled, bounded contact with the feared thing.
- Product: Duolingo's tiny-session model, without the guilt-owl.

---

### 2 · TO ROM (Pusterom 2.0)

**Positioning statement**
*A breathing room that never leaves your phone. Two rooms, light and dark, built by someone who needed both. No account, no cloud, no streak, no score. Just a place that is the same every time you come back.*

**Visual direction**
- **Light room** (existing tokens, keep them): `#f5f7f4` bg, `#3a4a3f` text, `#a8c5b0` accent, soft blue `#d4e4f0`. Hilma af Klint's circles as the key reference: the breath circle is the logo.
- **Dark room** (Mirror): `#1a1f1c` bg, `#2a332c` card, `#e0ebe3` text. The darkroom of photography. Red-safe-light is tempting, but stay green-black: it's yours.
- **The threshold:** moving between rooms is a 6-second crossfade (one exhale). No menu item labelled "Dark mode".
- **One motion rule:** only the breath moves. No bouncing buttons, no confetti, no streak flames. When something animates, it does it on the 4-2-6 curve.

**Sonic direction**
- Optional sound, synthesized locally with the Web Audio API: two detuned sine/triangle oscillators, a low-pass filter opening on the inhale and closing on the exhale, soft noise "air" on the hold. **No audio files are downloaded.** The sound is generated from the same timer that drives the circle, so it can never drift.
- Light room: open fifth (A2 + E3). Dark room: same root, add a minor third an octave up. Same breath, different weather.

**Narrative direction**
- The app speaks first, briefly, and never twice in a row. Copy is written as if you're sitting next to the person, not coaching them.
- Empty states are part of the story: «Ingen sjekk-ins ennå. Det er greit.» stays. Add: «Du kom tilbake. Det teller.» on return after 7+ days. Never «Du har mistet streaken din».

**Target audience psychology**
- **Who:** people who have deleted Calm or Headspace for being too much: too cheerful, too many notifications, too much subscription. Privacy-literate people. People with low capacity on bad days.
- **The need:** *sameness.* On a bad day you want the room to be where you left it. No update banner, no new content, no "what's new".
- **The trust trigger:** the sentence «Alt blir på denne enheten», then *proving* it (no network requests at all, checkable in devtools, stated in RUN.md).

**Differentiation strategy**
- Against Calm/Headspace: no content library, no subscription, no celebrity voices. A tool, not a channel.
- Against Daylio / How We Feel / Finch: no gamification, no pet, no streak. Care is counted, not scored.
- Against Apple Breathe: works on any phone, has a dark room, says something human.
- **The moat isn't features. It's refusals that competitors with investors can't make.** A subscription company can't promise "no account". You can.

**Competitive landscape**
Mental-health apps are a crowded market with a trust problem (see §II.3). Calm and Headspace own content; Finch owns gamified self-care; Daylio and How We Feel own tracking. **The empty quadrant is high trust × low content**, a tool that does one thing and asks for nothing. To Rom takes that quadrant and makes it look intentional, not cheap.

**Reference systems**
- Software: Ink & Switch's *Local-first software* essay (2019), the manifesto you already follow without citing; the Light Phone; iA Writer's typographic restraint.
- Space: James Turrell's sky rooms; Olafur Eliasson's *The Weather Project*; a Norwegian *hytte* at dusk with no Wi-Fi.
- Image: Agnes Martin's grids; Tom Sandberg's quiet black-and-white.

---

### 3 · FEM PUST I MINUTTET + PUSTEMERKET

**Positioning statement**
*An album you breathe to. Every track runs at five breaths a minute, the tempo of the Pusterom app. Not music about calm. Music that is a breathing instruction, written by a person who needed one.*

**Sonic direction**
- **Tempo law:** 60 BPM; every phrase is 12 beats (4 rise / 2 hold / 6 fall). A listener can breathe to any track without a guide.
- **Palette:** breath itself (recorded inhale/exhale, heavily slowed and filtered), bowed and struck metal, a single sustained brass or trumpet line (Arve Henriksen territory), field recordings from the coast in wind, analog tape saturation. Avoid: generic pads, rain stock, "528 Hz" pseudoscience, binaural-beat claims.
- **Tracklist sketch** (each = a protocol in the app):
  1. *Innsjekk* (light room, open fifths)
  2. *Pusterom* (the 4-2-6 cycle, purest form)
  3. *Små grep* (seven short pieces, one per small act, 84 seconds each = 7 breaths)
  4. *Konvolutten* (Inkasso-pust: three breaths, then the music stops dead)
  5. *Speilet* (dark room, minor third added)
  6. *03:00* (4-2-8, slowest track, almost nothing)
  7. *Kampen teller* (the only track with a voice, one sentence, spoken once)
- **Pustemerket:** the first 12 seconds of track 2, isolated. That's the logo.

**Visual direction (cover / identity)**
- One circle. Photographed, not drawn: a real light source, slow shutter, the circle blurred by a 12-second exposure. **Your photography is the cover.** Fotoblinkskudd makes the mark.
- Back cover: the Refusal List.

**Narrative direction**
- Liner notes in house voice: who it's for, how to use it, what it isn't ("This is not treatment. This is a tempo.").
- Release story: "I made a breathing app nobody had to log into. Then I made the soundtrack."

**Target audience psychology**
- **Who:** the ambient/modern-classical audience (Max Richter's *Sleep* audience) plus the people who will never install a wellness app but will press play.
- **Need:** a ritual without a screen. Music is the oldest local-first technology.

**Differentiation**
- Marconi Union's *Weightless* and Richter's *Sleep* are calm music. This is **functional music with a fixed tempo contract**: every track is usable as a breathing guide. It's closer to a metronome with a soul than to "relaxing music".
- The album is also the app's sound design, so it isn't a merch side project. It's the same system.

**Competitive landscape**
Streaming "sleep/focus" playlists are flooded with anonymous, generated filler. That's the slop. A named, authored, Norwegian, tempo-locked record stands against it, and labels like **Rune Grammofon** and **Hubro** already sell exactly this sensibility to an international audience **[approach as targets, not assumed fits]**.

**Reference systems**
Biosphere *Substrata* · Eno *Music for Airports* · Max Richter *Sleep* · Éliane Radigue · William Basinski *The Disintegration Loops* (decay as content: see the 48-hour Mirror) · Arve Henriksen · ECM's cover restraint.

---

## VI. PROTOTYPE PATHWAYS (TOP 3)

Global rule for all three: **one shipped thing per week, and one stranger in front of it per week.** HULL is the testing framework.

### 1 · INKASSO-PUST

**Phase 1: Research sprint (weeks 1–3)**
- *Validate:* Does breathing before opening reduce avoidance, or just add a step? Which moment is right: physical letter, Digipost/e-Boks, bank app, SMS reminder?
- *Methods:*
  - 8 interviews with people who have unopened post right now (recruit via Gjeldsregisteret forums, artist networks, union contacts). Ask: "Tell me about the last letter you didn't open." Don't pitch.
  - 1–2 conversations with financial counsellors (NAV or municipal). Ask: what do people say when they finally call? What do they wish they'd done 3 months earlier?
  - Paper prototype: the seven-line script on index cards. Watch someone go through it with a real (or realistic) letter.
- *Key questions:* Do they want to type the amount, or is seeing it enough? Does «Det er et tall. Det er ikke deg.» land or sound glib? Is "help line" a relief or a threat?
- **Kill criterion:** if 5 of 8 say they'd never open an app *before* opening a letter, pivot the trigger to a printed card (fridge magnet / envelope sticker with a QR to the protocol).

**Phase 2: Conceptual design (weeks 3–6)**
- Deliverables: final script (bokmål + nynorsk), screen flow (7 screens max), envelope line illustration, the paper texture token, help-resource sheet with verified numbers.
- Design system additions: `--paper: #f0e9df` (exists), `--figure` (large tabular numerals), a "silence" state where the UI shows nothing but the number.
- Iteration: 3 rounds × 3 strangers. Measure time to completion and "would you do this again?". Nothing else.

**Phase 3: Technical specification**
- Lives inside `index.html` as a new page `#page-konvolutt`, entry from Home: «Skal du åpne noe?».
- Stack: vanilla JS, no dependencies, reuses `runBreathCycle()` with a `cycles: 3` parameter.
- Storage: **default is not storing anything.** Optional local log of "opened" events (date only, never the amount unless the user ticks "remember the amount").
- Help resources: a static list in the HTML, no network calls, numbers reviewed monthly.
- Resource needs: you, ~2–3 weeks of evenings. A financial counsellor for a 1-hour content review.

**Phase 4: Alpha**
- Build first: the script + breath + two-number screen. No logging, no help screen yet → test the core.
- Testing framework: 10 people, two weeks, real post. Diary study by *message* (they text you after each use; you don't track them).
- **Success metrics:** ≥6/10 report opening something they'd been avoiding; ≥4/10 use it more than once unprompted; 0 people feel judged (ask directly).

**Phase 5: Positioning & launch**
- Message: *«Det er et tall. Det er ikke deg.»*, one line, one envelope, one link.
- Audience: personal finance communities, freelancer/artist unions, debt-help orgs as distribution partners (not advertisers).
- Timing: launch right **before** a heavy bill moment (January after Christmas, or around tax settlement in spring). Write a gonzo *Rapport fra stormen* the same week, about opening your own letter.
- B2B/B2G follow-up: a white-label-free "embed" (a link to the static page) that counselling services can put in their own letters. Free. Their reach becomes yours.

---

### 2 · TO ROM (Pusterom 2.0)

**Phase 1: Research sprint (weeks 1–2)**
- *Validate:* Do strangers understand two rooms without explanation? Does the trust line change behaviour (more honest notes)?
- *Methods:* The HULL 60-second test with 5 strangers on their own phones (Nielsen's "five users find most problems" heuristic). Record nothing but your notes. Plus a quick look at 5 competing apps' first 60 seconds (doubles as the first HULL audit episode).
- *Key questions:* Where do they tap first? Do they find the Mirror? Do they understand nothing leaves the phone? Do they read the copy?

**Phase 2: Conceptual design (weeks 2–5)**
- Deliverables: room-switch interaction (swipe up from the breath circle? long press?), token file for both rooms, revised copy deck, PWA icon (the circle, photographed), 03:00 variant spec, "Hvem sjekker inn?" option spec (hidden behind a settings line).
- Iteration cycles: weekly. Ship to a test URL, put it in front of one stranger, fix, repeat.

**Phase 3: Technical specification**
- **Zero build step.** Keep single-file HTML as a rule (it's part of the brand: anyone can read the source).
- Add: `manifest.webmanifest`, `sw.js` (cache-first, versioned, no runtime fetches), app icon set.
- Storage: move from `localStorage` to IndexedDB for Mirror images (needed for 48-hour Mirror); keep `localStorage` for check-ins (simple, already exported).
- Sound: Web Audio API, ~80 lines, oscillators + filter + noise buffer, driven by the same phase state as the circle.
- 03:00 mode: a `hour >= 0 && hour < 5` check, switches the cycle to 4-2-8 and the copy set.
- Testing: a Playwright smoke test (this sprint used one to check the 1.1 fix) that runs the four pages, the export, and checks **no network requests** are made. That last one is the brand promise as a test.
- Resources: you. Optional: one front-end friend for a 2-hour review of the service worker.

**Phase 4: Alpha**
- Build first: PWA install + the room switch + local sound. Then 03:00. Then parts.
- Testing: 15 people install it on their home screen. After 14 days, ask: "Is it still on your home screen? Why?"
- **Success metrics:** ≥8/15 still installed at day 14; ≥5/15 found the Mirror without being told; 0 network requests in the CI test; stranger time-to-first-breath < 20 seconds.

**Phase 5: Positioning & launch**
- Message: *«Et pusterom som aldri forlater telefonen din.»*
- Launch format: a HULL episode about your own app first. Show the network tab: empty. Then publish. Launch on a GitHub Pages URL with the source one click away.
- Channels: Norwegian privacy/tech community, ambient-music community (with the album), Hacker News "Show HN" (the no-build, no-network angle travels internationally).
- Timing: before winter, when *mørketid* (the dark season) arrives. The dark room in the dark season.

---

### 3 · FEM PUST I MINUTTET + PUSTEMERKET

**Phase 1: Research sprint (weeks 1–2)**
- *Validate:* Can listeners actually breathe to the tracks without instructions? Does a fixed 60 BPM, 12-beat phrase feel musical or mechanical after 10 minutes?
- *Methods:* Make three 3-minute sketches at different densities. Play them to 6 people lying down, no instructions. Watch their breathing (chest/belly). Ask afterwards what they noticed. Also: listen deliberately through the "sleep/relax" top playlists on streaming to map the slop you're defining yourself against.
- *Key question:* Is the tempo contract audible, or only conceptual?

**Phase 2: Conceptual design (weeks 2–6)**
- Deliverables: Pustemerket in final form (12s, mastered, plus a 6s short version), 3 finished tracks (*Pusterom*, *Konvolutten*, *03:00*), the cover photograph (12-second exposure of a light circle), liner notes v1.
- Design system: a *tempo bible*: one page that defines the 12-beat phrase, allowed keys (A as home), dynamics (inhale = filter opens, never volume jumps), and forbidden things (no drops, no beats, no binaural claims).
- Iteration: every track goes through the "lie down" test once.

**Phase 3: Technical specification**
- DAW of your choice; work at 60 BPM with a 12-beat grid locked. Record breath with a decent condenser in a dead room or wardrobe.
- Deliver stems so the app engine and the record share the same root and timbre (the app will synthesize an approximation; the record is the "real" version).
- Distribution: a DIY distributor for streaming; Bandcamp for the physical (cassette or vinyl later, which is very on-brand for "local-first").
- Resources: your time; mastering engineer (one day); optional session player (trumpet/bowed instrument) for one track. Grants: Kulturrådet / Fond for lyd og bilde-type schemes for recording **[check current schemes and deadlines]**.

**Phase 4: Alpha**
- Release Pustemerket first, as a standalone 12-second sound: the app's start sound, a social post, a test of whether people recognise it.
- Then an EP of 3 tracks (the ones above). Testing: "lie down" sessions with 10 more people; Bandcamp listen-through data; replies.
- **Success metrics:** ≥7/10 breathe in phase within two cycles without instruction; at least one label or curator replies to the pitch; 100 people who heard it ask "where's the app?" (track by asking, not by tracking).

**Phase 5: Positioning & launch**
- Message: *«Musikk du puster til. Fem pust i minuttet.»*
- Release the EP the same week as To Rom 2.0. The app links to the record, the record links to the app. One system, two doors.
- Pitch to curated (human) playlists and radio, not algorithmic sleep playlists. Pitch to the labels named above with a finished EP, not a demo.
- Full album at month 6–9, with a live performance in a public breathing room (concept #13): one 40-minute set at 5 breaths/minute, audience lying down.

---

## VII. VIBE CODE SYSTEMS DOCUMENTATION

> This is the north star. If a new thing breaks one of these, it doesn't ship under the Rolig name.

### 7.1 The Refusal List (versioned, public)

```
ROLIG — NEKTELISTE v1

Ingen konto.
Ingen sky.
Ingen sporing. Ikke engang «anonym».
Ingen streak.
Ingen varsler vi ikke ble bedt om.
Ingen abonnement på å puste.
Ingen løfte om å bli frisk.
Ingen slop.
Ikke nytt OS.
```

Publish it in the README, on the album back cover, on the stone's box. Add a line only when you've refused something real.

### 7.2 Visual language

| Token | Light room | Dark room | Use |
|---|---|---|---|
| `--bg` | `#f5f7f4` | `#1a1f1c` | background |
| `--card` | `#ffffff` | `#2a332c` | surfaces |
| `--text` | `#3a4a3f` | `#e0ebe3` | body |
| `--muted` | `#7a8a7f` | `#8a9a8f` | support copy |
| `--accent` | `#a8c5b0` | `#a8c5b0` | the breath, primary action (same in both rooms: the breath doesn't change) |
| `--soft-blue` | `#d4e4f0` | — | exhale state |
| `--paper` | `#f0e9df` | — | Inkasso-pust, summaries |

- **Shape:** circles and 16px-radius rectangles. Nothing sharp, nothing glossy.
- **Type:** `system-ui`. No web fonts = no network request = the promise held. Sizes few: 1.6 / 1.25 / 1 / 0.85 rem.
- **Image:** real photographs only, by you or by the user. No stock, no AI imagery. Long exposures, natural light, grain is fine.
- **Motion:** only the breath moves. Easing on the 4-2-6 curve. No spring physics, no confetti.
- **Emoji:** the five mood faces are the only emoji. They're a scale, not a decoration. (Consider replacing with five circles of different fill in 2.0; the face might be too cute for a 1/5 day.)

### 7.3 Sonic identity

- **Home key:** A. Light = open fifth. Dark = add the minor third.
- **Tempo:** 60 BPM, 12-beat phrase. Everything is in tempo with the breath or silent.
- **The mark:** Pustemerket, 12 seconds. Short version 6 seconds (one exhale) for UI.
- **Silence is a sound:** the app is silent by default. Sound is an invitation, never autoplay.
- **Never:** jingles, success chimes, notification pings, binaural/"healing frequency" claims.

### 7.4 Narrative tone

**Voice:** someone sitting next to you on the floor. Not above you, not in front of you.

| Do | Don't |
|---|---|
| «Det er greit.» | «Du klarer dette! 💪» |
| «Kampen teller.» | «Din reise mot bedre helse» |
| «Sett føttene i gulvet.» | «Ta deg tid til et mindful øyeblikk» |
| «Det er et tall. Det er ikke deg.» | «Ta kontroll over økonomien din!» |
| «Du kom tilbake. Det teller.» | «Du har mistet streaken din» |
| «Ingen sjekk-ins ennå.» | «Begynn reisen din i dag!» |

**Rules**
- Max ~10 words per sentence in-app. Periods, not exclamation marks.
- One sentence of warmth per screen. Not two.
- Second person, present tense, imperative or plain statement.
- No therapy-speak you'd be embarrassed to say out loud in a kitchen.
- Bokmål in the app by default, nynorsk available. Nynorsk for the hard, true sentences in the content work.
- **Two registers, one source.** The app is the calm surface. *Rapporter fra stormen* is the raw interior: first-person, profane where it's earned, angry at systems, never at the reader. They must never mix on the same screen. The app never swears. The essays never say "det er greit".

### 7.5 Creative principles

1. **Lokal før alt.** If it needs a server, it needs a very good reason, written down.
2. **Seed 7, drepe 3.** Every concept, track, screen and sentence goes through it.
3. **60 sekunder for en fremmed.** Nothing ships before a stranger has used it for 60 seconds.
4. **Skriv HULL først.** Name your own failures before anyone else does. Publicly.
5. **Docs follow code.** (New, from this sprint.) A changelog line is written *after* the diff exists, never before.
6. **Same every time.** Things that help on a bad day don't change.
7. **The struggle counts, the score doesn't.** Count care. Never rank it.

### 7.6 What belongs / what doesn't

| Belongs | Doesn't |
|---|---|
| A single HTML file you can read | A React app with 1,400 dependencies |
| A ceramic object with one button | A smart ring with an app and a subscription |
| A record with a tempo contract | A "lo-fi beats to relax to" playlist |
| A public audit of your own app | A testimonial carousel |
| A help line, verified this month | "Reach out to someone you trust 💛" |
| Photographs of real things | AI images of serene women on rocks |
| Grants, sales, licences | Selling data, ads, "anonymous analytics" |
| Saying "this is not treatment" | Clinical claims (they also make you a medical device under EU MDR) |

---

## VIII. STRATEGIC MESSAGING FRAMEWORKS

### 8.1 Internal alignment (briefing collaborators)

**The one-paragraph brief**
> Rolig makes calm for people who are in the storm. Everything we make is local-first: no account, no cloud, no tracking. Everything moves at five breaths a minute. We write short, true sentences. We count care, not progress. We kill three ideas out of every seven, and we put every thing in front of a stranger for 60 seconds before it ships. If you're about to add something, check the Refusal List first.

**Briefing kit for each collaborator type**
- *Developer:* RUN.md + the Refusal List + "no network requests" test. Rule: no build step, no dependency without a written reason.
- *Musician / sound designer:* the tempo bible (60 BPM, 12-beat phrase, A home key, no claims). Listen to Pustemerket first.
- *Designer / maker (Pustesteinen):* tokens table, "only the breath moves", "one button", photo of the circle.
- *Writer:* the do/don't table and the two-register rule.

**Decision filter (in order)**
1. Does it leave the device? → If yes, stop.
2. Would a stranger get it in 60 seconds?
3. Does it move on the breath, or stay still?
4. Is it true?
5. Which three alternatives did we kill to choose this?

### 8.2 Investor / client / funder pitch

**Be honest with yourself first:** "no account, no data, no subscription to breathe" is incompatible with a venture-scale Calm competitor. That's a feature. Pitch it to the right money:
- **Grants & foundations:** Stiftelsen Dam (health projects, applied *through* a member organisation such as a mental-health NGO), Kulturrådet (record, installation), Innovasjon Norge (the hardware object) **[check current schemes, eligibility and deadlines]**.
- **Public sector / B2G:** municipalities, schools (Klasserom-modus), financial-counselling services (Inkasso-pust). They need exactly what you refuse to collect: they can't take on data risk.
- **Revenue-based or small angel money:** for Pustesteinen's first batch, if the prototype earns it.

**The 90-second pitch narrative**
1. **Problem.** Mental-health apps are a trust disaster. Regulators have fined major players for sharing health data with advertisers. People who most need help are the ones least willing to hand over data.
2. **Insight.** Calm isn't content. It's a tempo: five breaths a minute. You don't need a library, a subscription or a server to deliver a tempo.
3. **Product.** A system built on that tempo: a local-first app with two rooms (open source, zero data), a protocol for the hardest everyday moment (opening a bill), a record you breathe to, and a breathing object with no app.
4. **Why us.** Built from the inside of the storm, not from a wellness boardroom. A maker who does photography, music, writing and code under one code, with a public record of their own failures (HULL).
5. **Why now.** The privacy backlash, money stress, and the public sector's need for tools that create no data liability.
6. **Model.** Free core forever. Revenue from objects (Pustesteinen), music, public-sector licences/installations, and print (Kampboka, card deck). Never data. Never ads.
7. **Ask.** Specific and small: a grant for the record, a pilot with one municipality or counselling service, a hardware prototype budget.

**Proof points to collect before you pitch (see 90-day plan):** 15 installs still alive at day 14; 10 Inkasso-pust alpha users and their quotes; Pustemerket + a 3-track EP; one partner letter of intent.

### 8.3 Audience engagement (community and culture)

- **Build in public, but the HULL way:** publish failures before features. Every release starts with what didn't work. That's your distinct rhythm and it builds trust faster than polish.
- **Three content streams, one tempo:**
  1. *HULL* (audits: your own app, then others'): monthly.
  2. *Rapporter fra stormen* (gonzo essays): when something's burning.
  3. *Pustemerket* (12-second posts: one breath, one photo, one sentence): weekly. Native format for short video; it's literally a breath long.
- **Community without a platform:** no Discord-for-the-app. Instead: an open GitHub repo (people can read the source, file issues, translate), a dugnad for Dialekt-pust, and IRL "public breathing rooms" (a 40-minute lie-down listening session).
- **Rituals over campaigns:** annual *Mørketid-pust* (first day of the dark season), annual Kampboka export day (31 December: "take your year with you").

### 8.4 Long-term vision

```
YEAR 1  ─ TOOL     To Rom 2.0 · Inkasso-pust · Pustemerket · EP · HULL series
YEAR 2  ─ OBJECT   Pustesteinen (small batch) · full album · Klasserom pilot · Kampboka
YEAR 3  ─ PLACE    Public breathing rooms · live sets · licensed protocols for public services
ALWAYS  ─ STUDIO   ROLIG: software, sound, objects, writing. One code: RÅ RO.
```

The pattern: **one tempo, many materials.** App, record, object, room. Each is a different door into the same 12 seconds. That coherence is what turns separate projects into a body of work, and a body of work into a studio people trust.

---

## 90-DAY ACTION PLAN

### Launch first: **To Rom 2.0** (platform), with **Inkasso-pust** as its first new room.
The record runs in parallel because it uses a different part of you and doesn't depend on code.

### Weeks 1–2: Close the gap
- [x] 1.1 promises live in `index.html` (done in this sprint: nav, trust line, export, Mirror link, note escaping).
- [ ] Add **"Docs follow code"** to HULL.md and actually do it.
- [ ] Add a smoke test that loads the app and asserts **zero network requests**.
- [ ] Ship PWA (manifest, service worker, circle icon). Deploy to GitHub Pages.
- [ ] HULL test: 5 strangers, 60 seconds each. Write HULL 2.0.
- [ ] **Start immediately:** recruit 8 people for the Inkasso-pust interviews. Book one financial counsellor.
- [ ] Record breath samples. Draft Pustemerket.

### Weeks 3–6: Build the two rooms, find the envelope
- [ ] Room switch (6-second crossfade) + local Web Audio breath.
- [ ] 03:00 mode with verified crisis numbers.
- [ ] Inkasso-pust: interviews done → paper prototype → script final (bokmål + nynorsk).
- [ ] Pustemerket final. Use it as the app's only sound.
- [ ] Sketch 3 EP tracks; run the "lie down" test.
- [ ] Publish HULL episode #1: your own app's first 60 seconds, with the empty network tab.

### Weeks 7–10: Alpha
- [ ] Inkasso-pust alpha inside To Rom → 10 users, 2 weeks, real post, diary by text.
- [ ] To Rom: 15-person home-screen test running.
- [ ] 48-hour Mirror (IndexedDB + fade) behind a toggle.
- [ ] **Commission:** a Pustesteinen breadboard prototype (small microcontroller + LRA haptic driver + rechargeable cell, one button; any maker space or hardware freelancer can do this) and one ceramic shell test from a local ceramicist. Goal: hold it, feel the 4-2-6, decide if it's real.
- [ ] Finish 3 EP tracks; mastering booked; cover photograph shot.

### Weeks 11–13: Launch & partner
- [ ] Release To Rom 2.0 + EP in the same week, before *mørketid* peaks.
- [ ] Publish *Rapport fra stormen #1*: opening your own envelope with Inkasso-pust.
- [ ] Show HN / Norwegian tech press with the "zero network requests" angle.
- [ ] **Partnerships to approach:**
  1. One financial-counselling service or municipal NAV office: pilot Inkasso-pust as a link in their letters.
  2. One mental-health NGO: the route to Stiftelsen Dam funding.
  3. Rune Grammofon / Hubro (or similar): send the finished EP.
  4. One library or waiting room: test a public breathing room (a lamp, a dimmer, a simple 12-second timer circuit, no network).
  5. Kulturrådet: application for the full album **[check deadline]**.

### Kill criteria (decide on day 90)
- To Rom: < 5/15 still installed at day 14 → simplify, don't add.
- Inkasso-pust: < 4/10 opened something they were avoiding → move the trigger off the phone (printed card).
- EP: < 7/10 breathe in phase unprompted → the tempo contract isn't audible; rewrite, don't release.
- Pustesteinen: if holding it doesn't calm *you* in 30 seconds, kill it. Seed 7, drepe 3.

---

*The circle is still the logo. Five breaths a minute is still the tempo. Everything else is negotiable, except the Refusal List.*

**Kampen teller.**
