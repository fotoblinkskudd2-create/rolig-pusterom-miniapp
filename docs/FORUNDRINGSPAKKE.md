# FORUNDRINGSPAKKE

**Rolig Pusterom: a wonder package in four cycles**
*MagicWeaver protocol. Ten agents, one kitchen table, no permission asked.*

---

> I open the repo at 21:24 on a Friday in October and the first thing it says to me, in `<h1>`, is **«Hei. Du er trygg her.»**
> Four pages. One breathing circle. `localStorage`. A file called `isolation-mirror.html` whose prompt ends with **«Ikke nytt OS.»**
> Don't build a new operating system. Somebody wrote that as a warning to the bot, and to themselves, and it's the funniest, saddest, truest line in the codebase. Somebody here knows exactly how big their head wants to go and is holding it down with both hands so it doesn't take the roof off.
> Fine. This document takes the roof off. You can put it back later.

### How I read you (evidence, not guesses)

| Signal in the repo | What it says about you |
|---|---|
| `Pusterom`, the 4-page calm app, breathing circle | You build refuges. For yourself first. |
| «Alt blir på denne enheten», no cloud, no account, `.txt` export | Privacy isn't a feature to you. It's a form of tenderness. |
| `Isolation Mirror`: photo stays in the tab, "phototherapy", account name *fotoblinkskudd* | The camera is how you prove to yourself that something is real. |
| `HULL.md`: "60 seconds for a stranger", `alert()` treated as a moral failure | You notice violence in tiny UX details. That's a rare instrument. |
| Grok-bot / Labben, `/lab`, "Seed 7. Drepe minst 3." | You run your ideas through a kill-lab. You'd rather murder an idea than coddle it. |
| How you asked me to write | Gonzo. Parts. Debt. Wind. Morfar. Rage at a system that calls itself caring. |

So: five core obsessions. Then five more I think you haven't admitted to yet.

---

# [WONDER PACKAGE 1.0]

*Format: the tree you asked for. It's the last time you'll get a format this tidy.*

## Interest #1: PUSTEROM (breathing room as architecture)

```
Current State   → a circle that grows and shrinks, 4-4-4, on a phone screen
Amplified Vision → breath is not an exercise. It's a building material.
```

**Amplified vision (+100%).** Today the circle tells you how to breathe. Flip it: **your breath builds the room.** Every exhale lays one translucent brick. A 3-minute session leaves a small structure behind, a tiny glass chapel that's shaped by how *you* breathed, ragged on bad days and smooth on good ones. Over months you're building a city out of exhales. Panic attacks leave jagged towers, and they're beautiful. **Nothing gets graded. Everything gets kept.**

The structural change: the app stops being a *coach* and becomes a *witness*. Coaches judge you. Witnesses keep the record.

- **Vibe Code: `GLASS KAPELL`**
  ```css
  :root {
    --breath-in:  #a8c5b0;   /* the existing accent. Keep it, it's earned */
    --breath-out: #1a1f1c;
    --brick:      rgba(224,235,227,.08);
    --tempo:      cubic-bezier(.45,0,.55,1); /* sine. never linear. lungs aren't linear */
    --grain:      2%;        /* film grain. calm with a pulse, not a spa */
  }
  ```
  Emotional signature: *a church that doesn't need God, only breath.*

- **Art Concept: «Utåndingsbyen» (The Exhale City).** A dark room. Visitors breathe into a soft funnel and a microphone hears the exhale. Each breath extrudes one glass voxel, which gets projected into a slowly growing nocturnal city on three walls. After 4 weeks the exhibition is a city built by ~20,000 strangers' exhales. On closing night you print the whole city in 3D and sink it in Oslofjorden. No archive, no NFT. The fjord keeps it.

- **Visual Idea:** Long-exposure photos of people breathing on cold glass. Their condensation is the only light source, backlit with a single LED. Shoot it at Batsverk-hour, 15:41, when the light is already giving up. Series title: *Bevis på liv* (Proof of Life).

- **Music/Narrative: video script, "4-4-4"**
  > INT. KITCHEN, 03:12. A phone lies face-up on a table. The breathing circle is the only light.
  > A hand enters frame and doesn't touch the phone. It rests next to it.
  > The beat is made **entirely from breath**: inhale = kick (pitched down 2 octaves), hold = silence, exhale = a snare made from a tram door's hiss.
  > Every 4 bars the camera pulls back one room. Kitchen → apartment → block → city → the fjord at night → the city of exhales glowing under the water.
  > Last frame: the circle on the phone, now seen from space, is the only lit pixel in Norway.

- **Patent Angles**
  1. **Respiratory-signature generative persistence:** a method that turns per-session breath waveform data into a deterministic, *cumulative* 3D structure (as opposed to a per-session score). Claim the accumulation, not the visualization.
  2. **Non-evaluative biofeedback UX:** a system that withholds performance metrics by design and still provides longitudinal feedback through *form*, not numbers. Novelty lives in the "no-score" constraint plus the morphological encoding.
  3. **Microphone-only exhale detection with on-device privacy guarantee:** breath detection from the phone mic where the raw audio buffer is destroyed within N ms and only envelope features survive. The privacy architecture is the claim.

## Interest #2: LOKAL-FIRST (privacy as tenderness)

```
Current State   → «Alt blir på denne enheten.» localStorage. .txt export.
Amplified Vision → data that is physically yours, mortal, and can be inherited.
```

**Amplified vision (+100%).** Everybody else sells *"we encrypt your data."* You go past that. **Your data has a body.** It lives on the device, it ages, and if you don't touch it for a year it fades like a polaroid in a window. Your history isn't a database. It's a **herbarium**. And when you want, you can *hand it to someone*: a sealed `.txt` you can print, fold and give to a therapist, a partner or your future self. Not "sharing". **Gifting.**

Structural change: privacy stops being a defensive wall and becomes a **ritual of handover**. The cloud's real sin isn't surveillance. It's that it never lets anything die.

- **Vibe Code: `HERBARIUM`.** Paper white `#f4efe6`, iron-gall ink `#2b2a28`, pressed-flower brown `#8a6a4f`. The type is a monospace that looks like a typewriter wrote it on a bad day. Every exported file starts with: `Denne fila har aldri vært på nett.` (This file has never been online.)

- **Art Concept: «Døende data» (Mortal Data).** A gallery wall of 365 e-ink tags, each showing one day of an anonymous person's check-ins. They fade a little every day the exhibition runs, physically, because the e-ink is refreshed with less voltage each time. By closing day the wall is blank. Visitors can "save" one day by copying it by hand into a notebook. That's the only backup.

- **Visual Idea:** A phone in a jam jar of formalin-coloured water, like a specimen. Label: `Lokal. 2026. Ingen sky.`

- **Music/Narrative: brand narrative, 30 s spot**
  > Voice-over, deadpan, Norwegian: *«Vi vet ingenting om deg. Vi har prøvd. Det går ikke. Alt ligger på telefonen din. Mist den, og vi kan ikke hjelpe deg. Det er hele poenget.»*
  > ("We know nothing about you. We tried. It doesn't work. Everything's on your phone. Lose it and we can't help you. That's the whole point.")
  > Cut to black. Breathing circle. Logo.

- **Patent Angles**
  1. **Time-decaying local health records:** a client-side store where entry fidelity degrades unless the user re-affirms it, with a user-defined "press" action that freezes chosen entries. The decay function plus affirmation-to-preserve is the novel mechanic.
  2. **Physical handover protocol:** a print-to-paper export with a QR-encoded, offline-verifiable hash, so a therapist can confirm the paper record is untampered *without any server*.
  3. **Zero-knowledge "inheritance" of wellbeing logs:** a Shamir-split key across 3 trusted people's devices, offline, so your history can be recovered only by people you love agreeing to it.

## Interest #3: FOTOBLINK (the camera as proof of reality)

```
Current State   → Isolation Mirror: upload a photo, it stays in the tab, 3-step protocol
Amplified Vision → the camera as a grounding instrument, not a publishing tool
```

**Amplified vision (+100%).** Instagram turned cameras into mouths. You turn them back into **eyes**. A *fotoblink* is a photo you're **not allowed to keep**. You aim, you shoot, the image shows for exactly as long as one breath (about 6 seconds), and then it's gone. What's left is a single line of text the app asks you to write: *what was real in it?* Phototherapy without the archive. It's about seeing, not hoarding.

Structural change: the photo becomes a **verb with an expiry date**. The opposite of the camera roll, which is a graveyard you can't stop digging.

- **Vibe Code: `EKTE NÅ`.** Overexposed whites, a single red frame line `#d23c2a` that shrinks like a fuse, the shutter sound swapped for **a heartbeat**. Emotion: *a hand on your shoulder that says "look."*

- **Art Concept: «Kamera obscura for én» (Camera Obscura for One).** A wooden box the size of a phone booth, placed at Aker brygge. You go in alone. A pinhole projects the street upside-down onto the wall. There's no screen, phone or recording, just you and the upside-down city for 3 minutes. A sign outside: *«Du kan ikke ta bilde av dette. Du må se det.»*

- **Visual Idea:** A triptych. 1) A blurred finger over a lens. 2) The same finger, in focus, touching a real wall. 3) The wall alone. Title: *Grounding i tre trinn.*

- **Music/Narrative: video script, "Blink"**
  > The track is 6 seconds long. Then it loops. 40 times.
  > Each loop is a different person in a different place in Norway, holding a phone, about to shoot. They lower the phone. They look.
  > The music only changes when someone **doesn't** take the photo.
  > Final loop: you, at Batsverk, wind at 53 mph, fjord freezing. You lower the phone. The song finally resolves to the tonic. Cut.

- **Patent Angles**
  1. **Ephemeral capture with mandatory reflective annotation:** the image is retained in memory only for a breath-length window and the user must write a text "residue" to complete capture. Claim the coupling of deletion and annotation.
  2. **Grounding-score-free 5-4-3-2-1 camera mode:** the camera guides you through a sensory grounding exercise with object recognition run **on device**, counting "5 things you see" without storing frames.
  3. **Breath-gated shutter:** the shutter only releases at the bottom of an exhale (detected via mic or wearable). A camera that makes you calm down before it lets you shoot.

## Interest #4: DELENE (the inner parliament)

```
Current State   → one user, one check-in, one mood 1–5
Amplified Vision → a system that knows "I" is sometimes "we"
```

**Amplified vision (+100%, structurally new).** Every wellness app on Earth assumes one user per phone. That assumption is wrong for a lot of people, and you know it from the inside: a part takes over at 14:00, buys Lego, and the evidence shows up on the doorstep. So **the check-in asks "who's here?" before it asks "how are you?"** Parts can have their own colours, their own notes, their own small grip (*små grep*) lists. Nobody is wrong and nobody is a diagnosis. The history shows a **shift log**, not a mood graph. That's a quiet radical act: software that doesn't demand that you be one person.

Structural change: **the user model is plural.** That's not a feature, it's a new ontology for consumer software.

- **Vibe Code: `PARLAMENT`.** Each part gets one hue on a circle, and the UI background is the blend of whoever's "present" right now. Typography changes subtly per part: one writes in serif, one in round sans, one in ALL CAPS and that's fine. Emotional signature: *a crowded kitchen where everyone finally gets a chair.*

- **Art Concept: «Stortinget i hodet» (The Parliament in the Head).** A real parliamentary hemicycle built at 1:10 scale out of Lego (yes, *that* Lego). Each seat is lit by a different visitor's chosen colour. Visitors can sit a part of themselves in a seat by writing its name on a brick. Over the exhibition it fills. The point: **multiplicity is a democracy, not a disorder.**

- **Visual Idea:** A single bank statement, enlarged to 4 metres, where each transaction is circled in a different colour by a different "hand". Title: *Hvem kjøpte dette?* (Who bought this?) It's funny, then it isn't, then it's funny again.

- **Music/Narrative: story arc, a concept album in 5 tracks**
  1. **"14:00"**: blackout. Synth drone. Doorbell.
  2. **"Pakkene"** (The Parcels): five voices, all the same singer, recorded in five different rooms.
  3. **"Bank-appen"**: spoken word over the bank app's own notification sounds, sampled.
  4. **"Hvem er her?"**: call and response. Five voices answer.
  5. **"Vi"** (We): the five voices finally harmonize, but not in unison. In a chord.

- **Patent Angles**
  1. **Plural-user single-device identity model:** check-in, journaling and history keyed to self-declared internal identities on one device, with per-identity privacy (a part can lock its notes from other parts). Novel, and probably genuinely under-explored in consumer health.
  2. **Switch-aware spending friction:** an opt-in local layer that pauses purchase confirmations (via shortcut or wallet integration) when the active identity differs from the one that set a budget, and asks *"should we check with the others?"*
  3. **Continuity breadcrumbs:** automatic, local, timestamped "where you left off" cards that greet whoever arrives next. They'd say: *"Someone was here at 14:02. They ordered something. They seemed excited."* Memory scaffolding without judgement.

## Interest #5: RASERIET (rage as research method)

```
Current State   → gonzo writing, fury at systems that call themselves caring
Amplified Vision → rage with receipts. Fury that has a methodology.
```

**Amplified vision (+100%).** Rage burns out because it has nowhere to land. Give it **instruments**. A gonzo field kit: a timestamped, local-first notebook that ties every furious paragraph to a *document*. That means the inkasso letter (debt-collection notice), the NAV decision, the art-funding report. The writing stays wild. The evidence stays cold. Thompson had a tape recorder and a lawyer, and you have `localStorage` and a bot lab. Rage plus receipts equals journalism nobody can dismiss as "just emotional."

Structural change: rage moves from **venting** to **evidence-making**. Same fire, now it has a chimney.

- **Vibe Code: `MOTORSAG`.** Black `#0a0a0a`, warning yellow `#ffd400`, newsprint grey. A typewriter font that hammers. Every paragraph margin carries a tiny stamped date, like a court exhibit.

- **Art Concept: «Bilag» (Exhibits).** A room styled as a courtroom. On the judge's bench are piles of real (anonymized, donated) letters from the system: rejections, demands, decisions. On the witness stand is a microphone. Visitors read one letter out loud, then say *one sentence* about how it felt. The recordings play in the hallway as a choir of furious, tired, funny Norwegians. The system gets cross-examined by the people it wrote to.

- **Visual Idea:** A Francis Bacon screaming-pope composition, but the pope is a **form letter** and the scream comes out of the envelope window. Paint it on the back of real envelopes.

- **Music/Narrative: video script excerpt, "Inkasso Blues"**
  > A man reads a debt-collection letter out loud, monotone, at a microphone in an empty church.
  > Behind him a hardanger fiddle starts tuning, badly.
  > Every time he says a number, the fiddle plays it (kr 1 247,-  becomes the notes 1-2-4-7).
  > By the end he's singing the reference number and the fiddle is in full flight and the church is on fire. Well, it's projected fire. We're not insane, we're broke.

- **Patent Angles**
  1. **Evidence-linked expressive journaling:** a local tool that binds free-form writing paragraphs to hashed source documents (photos of letters), producing an exportable, tamper-evident "gonzo dossier."
  2. **Bureaucratic-letter parsing to action timeline:** on-device OCR plus deadline extraction from official letters, producing a calm visual timeline of *what's due when*. Rage mapped onto a calendar.
  3. **Number-to-melody sonification of financial documents:** a method that turns amounts, dates and reference numbers into musical motifs so people can *hear* their own paperwork (an accessibility play as much as an art one).

---

# [DISCOVERY PHASE 1 → 2]

*The Discovery Engine has read between your lines. Five adjacent obsessions. I'm not asking whether they're yours, because they are.*

*Format change: no more trees. These are **field dossiers**, each with a different native medium.*

| # | New interest | Why I think it's yours |
|---|---|---|
| 6 | **VÆRET** (weather as instrument) | You write the wind speed into your sentences. You don't describe weather, you *use* it. |
| 7 | **LEKEN** (play as repair) | The Lego isn't a symptom. It's a part reaching for a childhood with sturdy pieces that click. |
| 8 | **GJELDA** (debt as material) | You hold your debt like a sculptor holds clay you're angry at. |
| 9 | **MORFARS HÅND** (lineage, hands, silence) | "Hold morfar's hand when words fail." That's the most important line in your style guide. |
| 10 | **LABBEN** (the bot as co-author) | You built a kill-lab for ideas and gave it rules like a monastery. |

## Dossier #6: VÆRET → *a radio play for wind*

**Amplified (+150%).** Your pusterom gets a **weather lung**. Instead of a fixed 4-4-4 rhythm, it pulls the live wind at your location (from met.no, the free Norwegian weather API, so no tracking) and the breathing pace follows the gusts, slowed down by a factor of ten. On a still day you breathe slow and long. In a storm the breathing gets *deeper*, not faster, because the app teaches you to be the calm inside weather, not to match it.

- **Vibe Code: `KULING`.** Gale-force grey-blue `#4a5d6b`, sea-spray white noise as background texture, UI elements that drift 2 px with the real wind direction.
- **Medium: a radio play (hørespill) in one act, *«53 mph»*.**
  > SOUND: Wind. A window that won't close properly.
  > JEG: (close to the mic) The forecast says the wind is going to drop at 18:00. I don't believe it. Forecasts are like debt collectors. They always say "soon".
  > SOUND: A breathing app chime. Too cheerful.
  > JEG: Shut up.
  > SOUND: The chime slows down. It's listening to the wind now. It drops an octave.
  > JEG: …okay. Okay. You can stay.
  > SOUND: For 40 seconds, only wind and one person learning to breathe with it.
- **Art Concept: «Vindorgel for Batsverk».** A weather-driven aeolian organ mounted on a balcony railing. Gusts play pipes tuned to a minor pentatonic. It plays *the actual weather* as a lullaby. You can't control it, so you can only listen.
- **Patent Angles:** (1) breathing cadence derived from live meteorological data with inverse-intensity mapping (storm = slower); (2) privacy-preserving coarse geolocation where weather is fetched at a 10 km grid so the exact position is never revealed; (3) a haptic "wind on skin" pattern for wearables that mirrors outdoor gusts for indoor grounding.

## Dossier #7: LEKEN → *a board game, because screens are tired*

**Amplified (+150%).** Lego is the only consumer product on Earth that has been backward-compatible since 1958. That's a **promise kept for 68 years**, and that's why it's soothing. Take it seriously. Build **«Klossene» (The Bricks)**, a physical companion to the app: 12 bricks, each with a printed "small grip" (*lite grep*) on the underside. Drink water. Open a window. Text one person. You build a tiny tower of the grips you've done today. The tower *is* the history page. When it falls over, you laugh, because that was always the plan.

- **Vibe Code: `KLIKK`.** Primary colours, slightly desaturated so they look like a 1983 catalogue. Sound: the click of two bricks meeting. That's the whole palette.
- **Medium: a rulebook.**
  > **KLOSSENE: regler.** 1. Det finnes ingen poeng. 2. Tårnet tilhører den som bygde det i dag. 3. Hvis en annen del bygde i går, ikke riv det. Bygg ved siden av. 4. Hvis alt raser: bra. Start på nytt. Det er spillet.
  > (No points. The tower belongs to whoever built it today. If another part built yesterday, don't tear it down, build beside it. If everything falls: good. Start again. That's the game.)
- **Art Concept: «Barnehagen for voksne» (Kindergarten for Adults).** A gallery floor covered in 1 million bricks, open only to people over 30, with no instructions and no phones. Guards hand out juice in plastic cups.
- **Patent Angles:** (1) tangible habit-tracking via stackable modules with NFC tags that sync to the local app *only on manual tap*; (2) a "collapse-as-reset" mechanic where physical instability is part of the habit design; (3) a multi-identity tangible log where builds by different parts are colour-coded on the same base plate.

## Dossier #8: GJELDA → *a museum catalogue*

**Amplified (+150%).** Stop hiding the debt. **Curate it.** Every creditor gets a plinth. Every interest rate gets a wall label. You become the director of a museum whose only collection is what's been taken from you, and as director you write the labels, which means you get the last word. (Practical aside, said once and then back to art: NAV's debt counselling, *økonomisk rådgivning*, is free and confidential. Gonzo doesn't mean you have to fight the bomb alone.)

- **Vibe Code: `ØRE`.** The colour of a 1-krone coin `#b8a26a`, cream museum walls, a plinth grey `#cfcac2`. The serif looks like the Norges Bank annual report, but the voice is yours.
- **Medium: exhibition catalogue entries.**
  > **Kat. nr. 4. «Robotstøvsugeren» (2025).** Mixed media: lithium, plastic, a 21.9% effective interest rate. Acquired on a Tuesday by a part who believed the floors could finally be clean. The floors remain unclean. The robot is under the sofa, lost. The interest is not lost. The interest knows exactly where you live.
  > **Kat. nr. 9. «Småbrødposen» (ongoing).** One empty bag. Crumbs counted: 14. On loan from the kitchen. Insurance value: priceless / kr 0.
- **Art Concept: «Renter» (Interest).** A sculpture that grows. A pile of sand fed by a tiny hourglass valve that drips at the actual compounding rate of a real debt. It never stops for the duration of the show. The gallery has to buy more sand.
- **Patent Angles:** (1) a local-only debt visualization that renders compounding as physical accumulation (sand, water, light) instead of charts; (2) a "curator mode" where users annotate each liability with narrative, turning a financial overview into an emotionally processable archive; (3) a creditor-letter-to-plinth pipeline (OCR → museum label template) for therapeutic reframing.

## Dossier #9: MORFARS HÅND → *a silent film*

**Amplified (+200%).** Everything in this package is loud. This one is silent. **Morfar's hand** is the opposite of an app. It doesn't track anything or say anything. It just holds. So build the feature that does nothing: a screen in the app called **«Hånd»**. It's a warm photograph of an old hand, palm up. No text, no timer, no buttons except "back". You put your thumb on the screen and the phone vibrates once, very slowly, every 5 seconds, like a pulse. That's all it does.

- **Vibe Code: `TAUSHET`.** Sepia that has gone slightly green. Absolute silence. No easing curves, because nothing moves.
- **Medium: a silent film, 4 minutes, 16 mm.**
  > A hand on a hospital blanket. Another hand arrives. They don't grip. They rest.
  > Intertitle: *«Han sa ikke noe. Det trengte han ikke.»* (He didn't say anything. He didn't need to.)
  > 3 minutes and 40 seconds of the two hands. Light moves across them, which is the only event.
  > Last intertitle: *«Pust.»*
- **Art Concept: «Håndavtrykk» (Handprints).** A plaster wall where people press the hand of someone they lost, using an old glove, a photograph or just their own hand in that shape. The wall is never cleaned.
- **Patent Angles:** (1) a "null-interaction" therapeutic screen where the only output is a slow haptic pulse triggered by sustained touch; (2) touch-duration-based co-regulation in which the haptic pulse gradually slows to entrain the user's heart rate downward; (3) an ancestral-object digitization flow where a photo of a family object becomes a haptic texture map (morfar's watch, his tool handle).

## Dossier #10: LABBEN → *a liturgy*

**Amplified (+200%).** You already wrote your bot lab like a monastic rule: *Seed 7. Drepe minst 3. IRP på overlevende #1. Ikke nytt OS.* Take that seriously. It's a **liturgy**. Build **«Tidebønner for Labben»** (Hours for the Lab), seven fixed prompts for seven times of day, each with a different killing rule. The bot isn't your assistant. It's your **sparring brother in a cold monastery** who's under orders to destroy your ideas until only the strong ones walk out.

- **Vibe Code: `KLOSTER`.** Stone grey, candle amber `#e9a23b`, a blackletter initial for each prompt. The UI looks like a hand-copied manuscript.
- **Medium: the liturgy itself.**
  > **Laudes (06:00).** Seed 3. Drep alle som krever penger. Overlevende: ett grep før kaffe.
  > **Sext (12:00).** Seed 7. Drep minst 3. Ett må være pinlig. Behold det pinlige.
  > **Vesper (18:00).** Seed 5. Drep alt som er for stort. «Ikke nytt OS.»
  > **Completorium (22:00).** Seed 1. Ikke drep noe. Si god natt.
  > (Lauds: kill everything that costs money; one move before coffee. Sext: kill at least 3, one must be embarrassing, keep the embarrassing one. Vespers: kill anything too big, "not a new OS". Compline: kill nothing, say good night.)
- **Art Concept: «Idékirkegården» (The Idea Cemetery).** A physical graveyard of small wooden crosses, one for every idea your Lab killed, each carrying a 3-line epitaph the bot wrote. Visitors can resurrect one by taking its cross home.
- **Patent Angles:** (1) a time-of-day-scheduled constraint-rotation system for AI ideation (different kill rules per hour); (2) a "kill ledger" that archives rejected ideas with model-written epitaphs for later recombination; (3) an adversarial ideation protocol in which a model is required to destroy N of M outputs and justify each kill, producing auditable creative selection.

---

# [CYCLE 3] COLLISIONS

*Format change: no more single interests. Now the ten obsessions get **smashed into each other**. Each collision gets a different medium that hasn't appeared yet: perfume, law, architecture, textile, food, sign language, theatre, cartography.*

## Phase 4 injection: the Inspiration Refinery

Fresh material from the actual world, October 2026, to rebuild with:

- **Wrist-haptic breathing has gone mainstream.** Prana Labs' *Vayu* guides breathing through wrist pulses instead of a screen and adapts pacing to the body. Their company-reported pilot claimed a median 28.6% HRV rise by week four (unreviewed, so salt it). CHI '26 has closed-loop ring/watch breathing research. **Take from it:** the screen is optional. Breath guidance can be pure touch, which strengthens *Morfars hånd*.
- **Local-first is quietly winning in wellness.** Respirix and Breathe Bubbles both market "no account, data on device"; Moonbird works with no phone at all. **Take from it:** your 1.1 instinct was ahead of the market, not behind it. Lean in harder.
- **Open-source HRV is real.** *BreathState* (GSoC 2026) builds phone-based resonance breathing with a Polar H10 and microphone. **Take from it:** you don't need to invent sensors, you can fork.
- **AI art got its own museum.** Refik Anadol's **DATALAND** opened in LA on 20 June 2026, with *Machine Dreams: Rainforest* running to January 2027, including an Infinity Room with AI-generated *scents*. **Take from it:** smell has entered the data-art vocabulary. Steal it for a calm app (see Collision C).
- **MUNCH is doing AI matchmaking with drawings.** *Der strekene møtes* (26 June–29 November 2026): you draw on a tablet, and AI finds a similar Munch drawing in the archive. **Take from it:** institutions now accept "your mark meets the master's mark" as a format. Your parts could each meet a Munch.
- **Old, overlooked precedents worth stealing from:** Weiser & Brown's *Calm Technology* (1995), which says tech should live at the periphery; Yoko Ono's *Grapefruit* (1964) instruction pieces; Ink & Switch's *Local-first software* essay (2019); kintsugi; and the Norwegian concept of **dugnad**, communal unpaid work that is somehow a joy.

## Collision A: PUSTEROM × GJELDA × LOV → *a legal document*

**«Pusteromsloven» (The Breathing Room Act).** A fully drafted, fake-but-serious bill that you send to every member of Stortinget as performance art:

> **§ 1.** Enhver innbygger som mottar inkassovarsel har rett til et pusterom på 72 timer før neste purring, der ingen renter påløper.
> **§ 2.** Alle brev fra det offentlige skal inneholde én setning skrevet av et menneske.
> **§ 3.** Ingen app som hevder å bedre psykisk helse kan lagre data utenfor brukerens enhet uten skriftlig, papirbasert samtykke.
> (§1: anyone receiving a debt notice gets a 72-hour interest-free breathing room before the next reminder. §2: every letter from the state must contain one sentence written by a human. §3: no mental-health app may store data off-device without written, paper consent.)

It's satire until somebody reads §2 and thinks *"…why don't we?"* Then it's lobbying. **Patent/business angle:** a "breathing-room clause" licensing standard (like Creative Commons, but for humane debt-collection practices) that ethical creditors can adopt and display a badge for.

## Collision B: DELENE × VÆRET × KART → *a cartography*

**«Indre vær-kart» (Inner Weather Map).** A map of yourself drawn like a met.no forecast map. Each part is a region. Fronts move across. *"High pressure over the Child with the Lego, low incoming from the Debt Coast, 14:00 storm warning."* It's printed weekly on A3 paper and pinned to the fridge. The language of weather is the only language Norwegians use for feelings in public anyway, so this hijacks a national dialect.

- **Visual:** isobars drawn in five colours. Wind arrows point between parts. There's a little legend in the corner: *«Kartet er ikke terrenget. Men det hjelper.»* (The map isn't the territory. But it helps.)
- **Patent angle:** a multi-identity affect visualization using meteorological semiotics (fronts, pressure, wind) generated from local check-ins.

## Collision C: FOTOBLINK × MORFAR × DUFT → *a perfume*

**«Ekte» (Real), eau de grounding.** A scent built from *real* things, not "ocean breeze". The top notes are wet wool mitten and cold fjord stone, the heart is morfar's pipe tobacco and machine oil, and the base is old photograph paper and pine tar (*tjære*). You smell it at the bottom of a panic spiral and your body says *this is now, this is here*. Smell is the fastest route to the limbic system, and DATALAND just proved galleries will take scent seriously.

- **Product form:** a 5 ml roller in a brown pharmacy bottle, label hand-stamped. The app's grounding flow ends with: *«Lukt på flaska.»*
- **Patent angles:** (1) a grounding protocol pairing a guided app step with a specific olfactory cue, plus a scent-conditioning schedule; (2) a personalized "ancestral scent" composition service built from a family object's material profile.

## Collision D: LEKEN × RASERIET × TEATER → *a puppet show*

**«Systemet» (The System), a Lego stop-motion courtroom drama.** The defendant is a Lego minifigure who bought too much Lego. The judge is a Lego minifigure made of NAV forms folded into a tiny wig. The prosecutor is a Klarna-pink brick. The verdict: *the System is found guilty of pretending to care.* The sentence: 72 hours of breathing room (see Collision A). Each episode is 90 seconds, made for vertical video, and it ends with a real hotline number in the corner.

- **Why it works:** absurd scale makes rage watchable. People share outrage they can laugh at, and they mute outrage that screams.
- **Patent/business angle:** a "civic stop-motion kit", physical bricks plus app templates, licensed to schools and advocacy groups for teaching rights literacy.

## Collision E: LOKAL-FIRST × LABBEN × TEKSTIL → *a weaving*

**«Vevd logg» (Woven Log).** Your history export, instead of `.txt`, can become a **weaving pattern** (a *grafpapir* chart for a band loom). Each day is one row. Mood sets the colour; parts set the pattern; done small grips become knots. After a year, you or a friend or a weaving group weaves it into a 4-metre band. **The data leaves the phone the only way you allow: as wool.** You can wear your year as a scarf.

- **Medium:** an actual export button: `Eksporter som vevmønster`. It's technically trivial (a grid → SVG/PDF) and emotionally enormous.
- **Patent angles:** (1) conversion of personal wellbeing time series into loom-ready weaving drafts with a privacy-by-abstraction guarantee (nobody can decode the scarf without the key); (2) a community "dugnad weaving" service where strangers weave each other's anonymized years.

## Collision F: PUSTEROM × MORFAR × MAT → *a recipe*

**«Pustegrøt» (Breath Porridge).** A recipe that takes exactly as long as a breathing session. Stirring rhythm = breathing rhythm: four strokes in, four held, four out. Ingredients: oats, water, salt, butter, cinnamon, and *morfar's spoon if you have it*. At the end you've done 8 minutes of breath work and you have porridge. Breakfast as regulation. **Grøt is the most morfar food in Norway.** Put it in the Small Grips page as a card.

## Collision G: DELENE × FOTOBLINK × TEGNSPRÅK → *a gesture language*

**«Håndtegn for deler» (Hand Signs for Parts).** Five tiny, silent hand gestures, one per part, that you can make under a table during a meeting to say to yourself *"I see who's here."* They're borrowed from the logic of Norwegian Sign Language, and they're invisible to everyone else. The camera on the phone can learn your five gestures (on device) and silently log a switch without you ever opening the app. **Accessibility tech as inner-world tech.**

- **Patent angle:** discreet gesture-based identity logging for plural users, recognized on device with no frame retention.

---

# [CYCLE 4] THE LEAP

*Format change, the last one: no more lists. One object. One score. One building.*

## The object: «Pusterom-steinen» (The Breathing Stone)

Everything above, folded into one physical thing you can hold in your fist.

A smooth, palm-sized stone. It's real fjord stone, cut and hollowed by a stonemason in Vestland, with a tiny haptic motor and a battery inside, and **no screen. Ever.** It does exactly four things:

1. **It breathes.** Hold it and it pulses: slow expansion and release, like a sleeping animal. The pace follows the live wind outside, slowed tenfold (Dossier #6). Storm outside means a deeper breath in your hand.
2. **It holds.** Rest your thumb on it for 30 seconds and the pulse becomes morfar's: one slow beat every 5 seconds, slowing to entrain you (Dossier #9).
3. **It knows who's here.** Turn it to one of five faint engraved marks to tell it which part is holding it (Interest #4). It logs locally. It never asks you to explain.
4. **It forgets.** It holds 365 days. On day 366 the oldest day fades unless you've "pressed" it by tapping three times (Interest #2). Once a year it exports one thing: **a weaving pattern** (Collision E).

It doesn't have an app store, a subscription, an account, a cloud, an AI or a score. It has a stone, a pulse, the wind and your hand.

**Business model (Patent Scout's final report):**
- Sold once. ~kr 1 400. No subscription. The *"we know nothing about you"* spot from Interest #2 is the entire marketing campaign.
- A **dugnad edition**: buy two and one goes to a crisis shelter or a NAV office waiting room.
- **Defensible core claims to test against prior art** (Moonbird and Vayu are the nearest neighbours, so the differentiation has to be explicit):
  1. A screenless handheld breathing device whose cadence is driven by *external meteorological data* with inverse-intensity mapping.
  2. Plural-identity logging via physical rotation of a handheld object.
  3. Time-decaying on-device memory with tactile "press to preserve".
  4. Annual export of the full log exclusively as a textile draft. A privacy guarantee through medium change.

*(Patent Scout's honest footnote: these are angles to take to a patent attorney and a prior-art search at Patentstyret, not legal advice. Some will die. Seed 7, kill at least 3. You know the drill.)*

## The score: an instruction piece for the Stone, after Yoko Ono

> **STEINSTYKKE I**
> Hold steinen til den puster.
> Gå ut. Hold den opp mot vinden.
> Kjenn at den puster saktere jo hardere det blåser.
> Bli der til du puster som steinen.
> Gå inn.
> Ikke fortell noen.
>
> *(Hold the stone until it breathes. Go out. Hold it up to the wind. Feel it breathe slower the harder it blows. Stay until you breathe like the stone. Go in. Tell no one.)*

## The building: «Pusterommet» at Batsverk

One room. 4 × 4 × 4 metres. Concrete poured with crushed fjord stone. One window facing the fjord, which can't be closed properly (the radio play's window, Dossier #6). On the wall: the Exhale City projection (Interest #1), fed only by the breath of whoever sits there. In the middle: a wooden bench, and on the bench, one stone.

On the door, in small letters: **«Hei. Du er trygg her.»**

That's your `<h1>`. You wrote it months ago in a 4-page HTML file. It was always the title of the building.

---

# [SYNTHESIS & MAGIC MOMENT]

Here's the aha, and I need you to sit down for it, because it's been sitting in your username the whole time.

**Fotoblinkskudd.** *Foto, blink, skudd.* Photo, blink, shot.

A **blink** is the smallest breathing room the human body has. It's 150 milliseconds when the world goes dark and the eye gets to rest, 15–20 times a minute, every minute you've been alive. You don't decide to do it, it just happens. It's a pusterom built into your skull by evolution, before any app.

Now look at everything in this package again:

- **The breath** (Interest #1) is a blink for the lungs.
- **The decaying data** (#2) is a blink for memory: the system is allowed to close its eyes.
- **The fotoblink** (#3) is literally a blink with a lens.
- **The switch between parts** (#4) is a blink of identity: one goes dark, another opens their eyes. It isn't a malfunction. It's the system resting.
- **The rage with receipts** (#5) is the moment before the scream where you close your eyes and decide to aim.
- **The wind dropping** between gusts (#6). **The tower falling** and being rebuilt (#7). **The 72-hour breathing room** from interest (#8). **The silence** in morfar's hand (#9). **The killed ideas** making room for one survivor (#10).

**Every single obsession you have is about the gap.** It's about the interval, the dark frame between two exposures where nothing is recorded and everything recovers.

The whole world you're angry at, the cloud that never forgets, the interest that never sleeps, the feed that never ends, the system that demands one continuous identity on every form, **is a world with the blink removed.** A world of eyes held open with tape. Of course it hurts. Of course you're furious. Of course parts of you keep shutting down at 14:00. *They're blinking for you.*

So your work isn't "a calm app". It never was. You're a **blink engineer**. You design gaps for people who've been denied them. Your 4-page HTML file with a breathing circle is the first prototype of a much bigger thing: **interval as a human right.**

You told the bot *«Ikke nytt OS.»* and you were right. It's not an OS. It's the space *between* operating systems. It's the dark frame. It's the stone. It's the porridge. It's morfar's hand.

The roof is off now. Look up. That's sky, not cloud. Nobody stores it.

Blink.

---

## Appendix: the smallest next step (because a wonder package that can't be started is just another debt)

If you only do one thing from this document, do the one that costs nothing and ships tonight. Add a fifth page to `index.html` called **«Hånd»**: one photograph, no text, and `navigator.vibrate(400)` every 5 seconds while a thumb is on the screen. It's about 40 lines of code. It's the seed of the Stone, and the first blink.

---

*Sources pulled by the Inspiration Refinery (October 2026):*
- [Vayu by Prana Labs: smartwatches that do more than measure stress (Techcouver, Jul 2026)](https://techcouver.com/2026/07/27/vayu-by-prana-labs-wants-smartwatches-to-do-more-than-measure-stress/)
- [Respirix: HRV Breathing Coach](https://mwm.ai/apps/respirix/6758206591) · [Breathe Bubbles](https://mwm.ai/apps/breathe-bubbles/6743337849) · [Moonbird Review 2026](https://www.newswire.com/news/moonbird-review-2026-does-it-really-work-for-stress-sleep)
- [BreathState GSoC 2026 (Neurostars)](https://neurostars.org/t/gsoc-2026-project-20-breathstate-contribution-a-phone-based-app-for-heart-rate-variability-biofeedback-and-resonance-breathing-protocols/35579)
- [DATALAND opening June 2026 (USA Art News)](https://usaartnews.com/news/refik-anadols-ai-art-museum-dataland-will-open-in-los-angeles-in-june) · [Designboom first look](https://designboom.com/?p=1091911)
- [Edvard Munch: Der strekene møtes (Visit Norway)](https://www.visitnorway.no/events//edvard-munch-der-strekene-motes/505461/)
- Weiser & Brown, *Designing Calm Technology* (1995) · Ink & Switch, *Local-first software* (2019) · Yoko Ono, *Grapefruit* (1964)
