# Part 4 — Five VibeCode iOS/Web Applications

Five small, shippable apps, each solving a distinct human problem. Each one includes a **paste-ready VibeCode build prompt**. Vibecode generates Expo / React Native apps that run on iOS and the web.

**Shared rules for all five:**
- **Never ship API keys in the client.** Route LLM calls through Vibecode's built-in AI integration or a small server proxy (e.g., a Cloudflare Worker) that holds the key and rate-limits per device.
- Default models: **Claude Haiku 5.5** for fast/cheap calls, **Claude Sonnet 5.5** for vision and reasoning. On-device where stated.
- Every prompt asks for structured JSON output so the UI never parses free text.

| # | App | Problem | Priority |
|---|-----|---------|----------|
| 1 | **Rolig Mirror** | In-the-moment stress, private | P0: ship first (repo already has v1.1) |
| 2 | **LetterLens** | Scary official/financial letters | P0 |
| 3 | **FridgeFirst** | Household food waste | P1 |
| 4 | **Rehearse** | Anxiety before hard conversations | P1 |
| 5 | **FixItCam** | Broken things thrown away instead of fixed | P2 |

---

## App 1 — Rolig Mirror
**Core problem:** Stress spikes happen in the moment. Existing apps want accounts, streaks and cloud journals. People need 90 seconds of relief that stays private.

**User journey:** Open → tap mood (5 faces) → optional note → app suggests *one* micro-exercise (breathing 4-4-6, grounding 5-4-3-2-1, cold-water reset, a 2-minute walk) with a two-sentence reflection → do it → rate "a bit better?" → history stays on device, export as .txt.

**Key features:** check-in · animated breathing circle · micro-intervention library (40 items, clinician-reviewed) · local weekly pattern ("heavier Monday afternoons") · crisis-word safety screen with helplines (116 123 / 988) · no account, no analytics.

**AI stack:** Apple Foundation Models (iOS 26, on-device) to pick the intervention and write the reflection. Rules-engine fallback on web/older devices. Zero network calls.

**Monetization:** free core. **Rolig Plus $2.99/mo or $24/yr** (themes, widgets, extra programs, PDF export). B2B site licenses for student welfare orgs and employers.

**Timeline:** W1 port v1.1 to Expo · W2 intervention library + safety screen · W3 on-device AI module + fallback · W4 TestFlight → App Store.

**VibeCode prompt**
```
Build "Rolig Mirror", a calm, private stress-relief app (Norwegian UI text, English code).
Screens (bottom tabs): Innsjekk, Pusterom, Små grep, Historikk.
- Innsjekk: 5 mood buttons (😣😕😐🙂😌), optional note textarea, "Lagre" button.
  After saving, show a card with ONE suggested exercise from a local JSON library of
  40 exercises {id, title, steps[], minutes, tags[]} and a two-sentence reflection.
  Choose the exercise with a local rules function using mood + keywords in the note.
  Leave a clearly marked function `suggestWithOnDeviceModel(note, mood)` that can later
  call Apple Foundation Models; fall back to the rules function.
- If the note contains crisis words (list in constants), show a full-screen calm card
  with "Mental Helse 116 123" and "988 (US)" call buttons before anything else.
- Pusterom: animated circle, inhale 4s / hold 4s / exhale 6s, 3 or 5 minute options.
- Små grep: daily checklist of 5 small actions, resets at midnight.
- Historikk: list of check-ins grouped by week, simple 7-day mood line chart,
  "Eksporter som tekst" button sharing a .txt file.
Store everything with AsyncStorage only. No login, no network, no analytics.
Design: soft sage green (#a8c5b0) on off-white (#f5f7f4), dark mode, large rounded cards,
system font, generous spacing, haptic on mood tap.
```

---

## App 2 — LetterLens
**Core problem:** Debt-collection notices, tax letters, benefit decisions and insurance denials are written in legal language with hidden deadlines. People avoid opening them, deadlines pass, and costs pile up.

**User journey:** Snap letter (1–4 pages) → 10s later: *What it is · Who sent it · Amount · Deadline (countdown) · What happens if you ignore it · Your 3 options* → tap an option → editable draft reply (payment plan, dispute, ask for more time) → copy/email → deadline reminder added to calendar.

**Key features:** camera scan with edge detection · plain-language card (reading level ≤ grade 7) · deadline extraction + local notifications · letter inbox sorted by urgency · draft replies with tone control · country packs (Norway first: inkasso/NAV/Skatteetaten; then US/UK).

**AI stack:** on-device OCR (Apple Vision / ML Kit) → Claude Sonnet 5.5 via proxy with strict JSON schema `{type, sender, amount, currency, deadline, stage, consequences, options[]}` → deterministic stage/deadline rules per country (the model extracts; rules decide) → Haiku 5.5 for drafts.

**Monetization:** 3 free letters/month · **Pro $5.99/mo** unlimited + drafts + reminders · white-label for banks and debt-advice services.

**Timeline:** W1 scan + OCR + JSON card · W2 inbox + reminders · W3 drafts + Norway rules pack · W4 paywall + launch (SEO landing page per letter type).

**VibeCode prompt**
```
Build "LetterLens": photograph an official or financial letter and get a plain-language
explanation with the deadline.
- Home: inbox list of scanned letters as cards sorted by deadline; red badge if ≤7 days.
  Big floating "Skann brev / Scan letter" button.
- Scan: camera with document edge detection, up to 4 pages, then run OCR on device.
- Send OCR text to my backend endpoint POST /analyze (placeholder URL in config) which
  returns JSON: {letterType, sender, amount, currency, deadlineISO, stage
  (invoice|reminder|collection_notice|collection|enforcement|decision|other),
  plainSummary (max 60 words), ifIgnored, options:[{label, explanation}]}.
- Letter detail: deadline countdown band at top, sections for summary, amount, a 5-step
  stage indicator, and option buttons. Tapping an option calls POST /draft
  {letterId, option, tone: polite|firm|hardship} and shows an editable draft with
  Copy / Share buttons. Never auto-send.
- Schedule local notifications 7, 3 and 1 day before deadline.
- Disclaimer footer: "Not legal advice. Check the deadline in the original letter."
- Paywall after 3 letters/month (RevenueCat), Pro $5.99/mo.
Design: trustworthy navy (#1f3a5f) + white, red only for urgency, large type.
```

---

## App 3 — FridgeFirst
**Core problem:** Households cause ~60% of global food waste, over 1 billion tonnes a year in total (UNEP Food Waste Index 2024). The typical family throws away food worth hundreds of dollars a year because nobody remembers what's in the fridge.

**User journey:** Snap fridge/pantry or a grocery receipt → items detected with estimated use-by dates → "Use first" list → tap "What can I cook tonight?" → 3 recipes that use the most at-risk items in ≤ 30 min → mark cooked → monthly "money & CO₂ saved".

**Key features:** photo + receipt item detection · shelf-life estimates (USDA FoodKeeper data, not LLM guesses) · use-first push at 16:00 · recipes constrained to what you have plus pantry staples · shared household list · savings tracker.

**AI stack:** Claude Sonnet 5.5 vision for item detection (JSON `{name, category, qty, confidence}`) → deterministic shelf-life lookup → Haiku 5.5 recipe generation with constraint "must use ≥ 2 at-risk items, ≤ 30 min, user diet flags".

**Monetization:** free core · **Plus $3.99/mo** (household sharing, unlimited scans, meal plans) · affiliate grocery-delivery links for missing ingredients · grocery-retailer partnerships (anti-waste programs).

**Timeline:** W1 scan + item list · W2 shelf-life engine + reminders · W3 recipes + savings · W4 household sync + launch.

**VibeCode prompt**
```
Build "FridgeFirst", a food-waste app.
- Tabs: Fridge, Cook, Saved.
- Fridge: grid of items with colored freshness bars (green/amber/red). "+" opens camera:
  photo of fridge shelf OR grocery receipt → POST /detect returns
  [{name, category, quantity, confidence}]. Show a review list where the user can
  edit/remove before saving. Assign use-by dates from a bundled JSON shelf-life table
  (category → days, fridge/freezer/pantry); user can edit dates.
- Daily local notification at 16:00 listing items expiring within 2 days.
- Cook: button "Hva kan jeg lage i kveld? / What can I cook tonight?" → POST /recipes
  with at-risk items + diet flags → 3 recipe cards (title, minutes, uses[], steps[]).
  "Jeg lagde den" marks used items as consumed and adds estimated value saved.
- Saved: monthly kroner/dollars saved and kg CO2e avoided (2.5 kg CO2e per kg food, constant).
- Household sharing via invite code (Supabase backend).
Design: fresh green/orange, playful food emoji, big tap targets.
```

---

## App 4 — Rehearse
**Core problem:** People avoid or fumble high-stakes conversations: salary negotiation, a breakup, confronting a landlord, telling a parent about a diagnosis, job interviews. The anxiety comes from never having practiced out loud.

**User journey:** Pick scenario or describe your own → set the other person's persona (tough boss, defensive sibling) and your goal → **live voice role-play** (2–8 min) → instant debrief: what landed, filler words, interruptions, missed asks, suggested phrasing → retry the hardest moment → save "script cards" for the real conversation.

**Key features:** realtime voice role-play · persona difficulty slider · debrief with timestamped transcript highlights · "replay the moment" retry · script cards · scenario library (work, family, health, money).

**AI stack:** realtime speech-to-speech model (e.g., OpenAI Realtime API or Gemini Live via server-side session) for low-latency role-play; Claude Sonnet 5.5 for the structured debrief (`{wins[], misses[], fillerCount, talkRatio, suggestedLines[]}`) from the transcript. Audio not stored by default.

**Monetization:** 2 free sessions/week · **Pro $9.99/mo** · B2B: sales/customer-success onboarding and career services at universities ($8–15 per seat/mo).

**Timeline:** W1 text role-play + debrief · W2 realtime voice · W3 retry-moment + script cards · W4 scenario library + paywall + launch.

**VibeCode prompt**
```
Build "Rehearse", an app to practice difficult conversations out loud.
- Home: scenario library cards (Ask for a raise, Set a boundary with family, Dispute a bill,
  Job interview, Tell someone bad news) + "Create your own".
- Setup: other person's role, personality (slider: supportive → tough), my goal (text),
  duration (2/5/8 min).
- Session: full-screen voice call UI with animated orb, mute, end. Connect to my backend
  POST /session which returns a realtime voice session token (placeholder); fall back to
  push-to-talk text mode if unavailable. Show a live transcript toggle.
- Debrief: POST /debrief with transcript → {score0to100, wins[], misses[], fillerWords:number,
  talkRatio, keyMoments:[{timestamp, quote, better}], suggestedLines[]}.
  Render as cards; each keyMoment has "Prøv igjen / Retry this moment" which starts a
  60-second mini-session from that point.
- Script cards: save suggestedLines to a deck for the real conversation.
- Privacy note: audio is not stored; transcripts saved locally only.
Design: deep indigo with warm coral accent, calm but energizing.
```

---

## App 5 — FixItCam
**Core problem:** People throw away fixable things (a dripping tap, a wobbly chair, a dead lamp, a torn jacket) because they don't know what's wrong or how to fix it. The EU's Right to Repair Directive (2024) pushes the same way, yet practical guidance stays scattered.

**User journey:** Point camera at the broken thing + say what's wrong → diagnosis with likely causes ranked → difficulty, time, tools, parts (with part names to search) → step-by-step guide, where the camera can confirm each step ("does it look like this?") → "Too hard? Find a repair café or pro" → log saved items and CO₂.

**Key features:** multimodal diagnosis · safety gate (mains electricity, gas, structural → "call a professional", hard-coded rules) · step-by-step with check photos · parts list · repair-café / pro finder (map) · personal "saved from landfill" counter.

**AI stack:** Claude Sonnet 5.5 vision via proxy (`{object, likelyIssues:[{cause, probability, difficulty, safetyRisk}], tools[], parts[], steps[]}`) · deterministic safety classifier on object/issue categories · optional retrieval over iFixit-style guides where licensing allows.

**Monetization:** free diagnoses (5/month) · **Pro $4.99/mo** · affiliate parts/tools · lead fees from local repair pros.

**Timeline:** W1 photo → diagnosis card · W2 steps with check-photos · W3 safety rules + pro finder · W4 counters + paywall + launch.

**VibeCode prompt**
```
Build "FixItCam", a repair-helper app.
- Home: big camera button "Hva er ødelagt? / What's broken?" + recent repairs list +
  counter "Ting reddet: N · CO2 spart: X kg".
- Capture: photo (up to 3) + short text or voice description. POST /diagnose → JSON
  {object, category, likelyIssues:[{cause, probability, difficulty:1-5, minutes,
  safetyRisk: none|low|high}], tools[], parts:[{name, searchQuery}], steps:[{text, checkHint}]}.
- If category is electrical-mains, gas, structural, or any safetyRisk=high: show a
  stop screen "Dette bør en fagperson gjøre" with a "Finn reparatør" map button; do not
  show steps.
- Guide: one step per screen, large text, "Ta bilde for å sjekke" button that sends the
  photo + current step to POST /check → {ok:boolean, tip}. Progress bar.
- Finish: "Fikset!" or "Trenger hjelp" → map of repair cafés/pros (placeholder data).
- Save completed repairs; counter adds object category CO2 estimate from a bundled table.
Design: workshop yellow (#f2b705) + charcoal, chunky buttons, works with gloves (large targets).
```

---

## Development priority & portfolio logic

| Order | App | Why this order | Build effort | Revenue path |
|---|---|---|---|---|
| 1 | Rolig Mirror | Code exists; zero inference cost; brand-building | 3–4 weeks | B2B licenses |
| 2 | LetterLens | Highest pain + strong SEO wedge; feeds Ledger (Concept 2) | 4 weeks | Pro + white-label |
| 3 | FridgeFirst | Broad market, clear ROI story, retailer partners | 4 weeks | Plus + affiliate |
| 4 | Rehearse | Realtime voice adds cost and complexity; strong B2B upside | 4–5 weeks | Pro + seats |
| 5 | FixItCam | Safety surface needs care; niche but loyal | 4 weeks | Pro + affiliate + leads |

Shared infrastructure to build once: auth-less device IDs + RevenueCat paywall, an LLM proxy with per-device rate limits and prompt registry, and an eval harness with 50 golden inputs per app.
