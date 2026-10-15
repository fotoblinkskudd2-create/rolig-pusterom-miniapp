# Master Framework: Unified Content Ecosystem

Status: blueprint v1.0 (2026-10-15). Five projects, one system. This file holds structure only. It contains no book text, finished poems or final designs.

**System spine.** Every asset in every project starts from one **Human Problem** (HP). Each project then expresses that problem in its own way:

```
Human Problem ──► Vibe-Code (web) ──► Book Module (Christian | Islamic) ──► Poetry Disguise ──► Aja Gata Carrier
     HP-xx            VC-xx               CB-xx / IB-xx                      RP-xx               AG-xx
```

Shared ID scheme: `VC` = vibe-code, `CB` = Christian book, `IB` = Islamic book, `RP` = reluctant-reader poetry concept, `AG` = Aja Gata character. Any asset can be traced to its siblings by HP.

---

## SECTION 1: 25 VIBE-CODES SYSTEM

### Families

The codes fall into five families, and those families are reused as the book and poetry design language in Section 6.

| Family | Core need | Codes |
|---|---|---|
| **CALM** | Lower arousal and cognitive load | VC-01, 05, 08, 09, 19 |
| **TRUST** | Lower fear of being tricked, judged or losing something | VC-02, 04, 11, 14, 22 |
| **FLOW** | Lower friction and lostness | VC-06, 07, 10, 12, 17, 20, 23, 24 |
| **JOY** | Make effort feel worth it | VC-03, 18, 25 |
| **BELONGING** | Lower isolation and exclusion | VC-13, 15, 16, 21 |

### Code Table

| ID | Vibe-Code | Human Problem Solved | Implementation Principle | GitHub / Design-System Reference |
|---|---|---|---|---|
| VC-01 | **Clarity Cascade** | Cognitive overload, so the user freezes | One primary action per view. Reveal secondary detail only on request (progressive disclosure). | `alphagov/govuk-frontend` ("one thing per page" pattern); `Shopify/polaris` (primary vs. secondary actions) |
| VC-02 | **Trust Mirror** | Fear that the system misunderstood or will misuse input | Reflect the user's input back in plain language before committing ("Here's what you told us"), with an edit link per line. | `alphagov/govuk-frontend` (Check-answers / Summary List); `primer/react` (confirmation dialogs) |
| VC-03 | **Micro-Joy** | Task fatigue, so effort feels thankless | A small, earned celebration on meaningful completion, never on trivial clicks. It is disabled under `prefers-reduced-motion`. | `catdad/canvas-confetti` (has a `disableForReducedMotion` flag); `airbnb/lottie-web` |
| VC-04 | **Soft Landing** | Fear of irreversible mistakes | Offer undo instead of "Are you sure?". Make the action, then offer reversal for 5–10 s. | `emilkowalski/sonner` (toast with action); `Shopify/polaris` (Toast with action) |
| VC-05 | **Breath Gate** | Impulsive or anxiety-driven high-stakes actions | Insert a deliberate pause before destructive or emotional commits, such as typing to confirm or a 3-second hold. | `primer/react` (GitHub's "type the repo name to delete" pattern); local: `index.html` → Pusterom |
| VC-06 | **Empty-Room Welcome** | Blank-page paralysis | Empty states that explain the value, show an example and offer exactly one first action. | `Shopify/polaris` (EmptyState); `carbon-design-system/carbon` (empty-state patterns) |
| VC-07 | **Wayfinder Thread** | Lostness in multi-step flows | Persistent position cues: steps, breadcrumbs and "3 of 5". Never hide how much remains. | `uswds/uswds` (Step Indicator); `carbon-design-system/carbon` (ProgressIndicator) |
| VC-08 | **Honest Wait** | Uncertainty while waiting, leading to abandonment | Use skeletons for the layout and determinate progress for durations. Never use a spinner without a time hint over 2 s. | `dvtng/react-loading-skeleton`; `material-components/material-web` (progress indicators) |
| VC-09 | **Quiet Mode** | Sensory overload (anxiety, ADHD, migraine, trauma) | Calm default motion. Honor `prefers-reduced-motion` and `prefers-contrast`, and add a manual "quiet" toggle. | `motiondivision/motion` (`useReducedMotion`); `adobe/react-spectrum` |
| VC-10 | **Command Whisper** | Expert friction from too many clicks to reach known places | A keyboard-summoned command palette with fuzzy match and recents. | `pacocoursey/cmdk`; `shadcn-ui/ui` (Command component) |
| VC-11 | **Forgiving Field** | Form shame: red errors that feel like scolding | Validate on blur, not on keystroke. Accept loose formats and normalize silently. Error text says what to do, not what you did wrong. | `react-hook-form/react-hook-form`; `alphagov/govuk-frontend` (error message guidance) |
| VC-12 | **Choice Diet** | Decision paralysis (Hick's law) | Show three options at most, with one marked recommended. Put the rest behind "More options". | `Shopify/polaris` (actions guidelines); `microsoft/fluentui` (ChoiceGroup) |
| VC-13 | **Belonging Signal** | Isolation, the sense of "I'm alone in this" | Show ambient, privacy-safe social presence ("12 people breathed here today") with no individual tracking. | `liveblocks/liveblocks` (presence); `primer/react` (AvatarStack) |
| VC-14 | **Consent Lantern** | Feeling manipulated by dark patterns | Consent that is granular, equal-weight, reversible and in plain language. "No" is as easy as "Yes". | `orestbida/cookieconsent`; `alphagov/govuk-frontend` (cookie banner) |
| VC-15 | **Accessible Floor** | Exclusion of disabled and keyboard users | Visible focus, full keyboard paths, correct ARIA and 4.5:1 contrast are baseline requirements, not features. | `radix-ui/primitives`; `adobe/react-spectrum` (React Aria) |
| VC-16 | **Dark Shelter** | Eye strain, night use, reading in shared spaces | A theme that follows the system by default, can be overridden manually and does not flash on load. | `pacocoursey/next-themes`; `primer/primitives` (theme tokens) |
| VC-17 | **Guided First Steps** | Onboarding overwhelm | Contextual, skippable, resumable hints shown at the moment of need, not a 9-slide carousel. | `kamranahmedse/driver.js`; `shipshapecode/shepherd` |
| VC-18 | **Streak Without Shame** | Habit guilt: one miss and "I've failed, quit" | Track consistency, not perfection. Allow streak freezes, celebrate returns and never use red "broken" states. | `HabitRPG/habitica` (habit mechanics); `primer/react` (GitHub contribution-graph logic) |
| VC-19 | **Readable Rhythm** | Reading fatigue on long text | Line length of 45–75ch, line-height 1.5–1.7, a fluid type scale and generous paragraph spacing. | `tailwindlabs/tailwindcss-typography`; `vercel/geist-font` |
| VC-20 | **Thumb Reach** | One-handed mobile strain | Primary actions sit in the bottom third. Use bottom sheets instead of top modals. | `emilkowalski/vaul` (drawer); `material-components/material-web` (bottom sheet spec) |
| VC-21 | **Status Lighthouse** | Ambiguity about state: did it work? | Every state is signaled by color + icon + text together, never color alone. | `carbon-design-system/carbon` (notifications); `primer/react` (StateLabel) |
| VC-22 | **Save-State Promise** | Fear of losing work | Autosave with a visible "Saved · 14:02" timestamp, local-first where possible, plus export. | `excalidraw/excalidraw` (local autosave); `ueberdosis/tiptap`; local: `index.html` history export |
| VC-23 | **Shortcut Ramp** | Stalled novice-to-expert growth | Show the keyboard shortcut inside tooltips and menus. Pressing `?` opens a cheat sheet. | `jamiebuilds/tinykeys`; `primer/react` (Tooltip with keybinding hint) |
| VC-24 | **Typo Grace** | "No results" shame and dead ends | Fuzzy, typo-tolerant search. Zero-result pages always suggest a next step. | `krisk/Fuse`; `meilisearch/meilisearch` |
| VC-25 | **Closure Card** | Open-loop anxiety (Zeigarnik effect) | Every flow ends with an explicit summary: what happened, what's saved and the one next step. | `alphagov/govuk-frontend` (Panel / confirmation page); `Shopify/polaris` |

**Local reference implementation.** This repo's `index.html` already demonstrates VC-02 (the "Alt blir på denne enheten" line), VC-05 (Pusterom), VC-06 (the empty history state), VC-11 (the `alert()` was removed in 1.1) and VC-22 (history export). Use it as the seed demo for the vibe-code library.

---

## SECTION 2: CHRISTIAN SELF-HELP MASTER TEMPLATE + 20 BOOK TOPICS

### 2.1 Series Rules (apply to all 100 books)

- **Scope:** broadly ecumenical and Nicene. Where Catholic, Orthodox and Protestant readings differ (e.g., confession, sacraments), say so in a "Traditions differ" sidebar. Do not adjudicate.
- **Scripture:** quote a public-domain or licensed translation (WEB/KJV free; NIV/ESV need publisher permission above their quota limits). Cite book:chapter:verse for every quotation.
- **Clinical boundary:** each book contains a "When this book is not enough" page (therapy, abuse, suicidality and addiction referrals). The Forgiveness, Marriage and Anger books must state that forgiveness ≠ reconciliation ≠ staying in danger.
- **Review gate:** each manuscript goes through a theology reviewer, a licensed counselor (for psychological claims) and a sensitivity reader.

### 2.2 Master Structure (200 pages)

| Part | Pages | Component | Function |
|---|---|---|---|
| **Front** | 6 | Title, contents, *How to Use This Book* (solo / pair / small group) | Sets expectations (VC-07) |
| **Part 0: Threshold** (intro framework) | 18 | **0.1 The Ache:** the problem as lived experience, as a composite case<br>**0.2 The Lie:** the false belief driving it, named in one sentence<br>**0.3 The Word:** one anchor passage, used for the whole book<br>**0.4 The Map:** a one-page diagram of the book's framework<br>**0.5 Where Am I?:** a 12-item self-diagnostic with score bands | Diagnose before prescribing |
| **Part I: Core Modules** (3–5; default 4 × 30pp) | 120 | See module anatomy below | Transformation |
| **Part II: Practice** (implementation) | 28 | **Field Plan:** 30 days, 1 page per day (read → do → note)<br>**Re-entry rule:** "Missed days? Restart at the next Sunday, not Day 1." (VC-18)<br>**Group Guide:** a 6-session discussion plan<br>**Obstacle Map:** the 5 likely failure points and a pre-planned response for each | Behavior change |
| **Part III: Reflection & Prayer** | 18 | **Lectio Divina** on the anchor passage<br>**Daily Examen** adapted to the theme<br>**Written prayers:** 7 short liturgies (morning, crisis, gratitude, confession, intercession, lament, sending)<br>**Prayer prompts:** 20 open prompts | Spiritual integration |
| **Back** | 10 | "When this book is not enough", glossary, notes, further reading, series map | Safety + series flow |

### 2.3 Module Anatomy (repeats 3–5×, ~30 pp each)

| # | Block | Pages | Spec |
|---|---|---|---|
| 1 | **Scene** | 3 | A composite real-world vignette with one character, one moment and an unresolved ending |
| 2 | **Text** | 6 | One OT + one NT passage: context, one original-language key word (Hebrew/Greek) and the common misreading |
| 3 | **Framework** | 7 | A named model (2×2, cycle, ladder or spectrum) with a diagram, used only in this module |
| 4 | **Push-back** | 4 | The three strongest objections or doubts, answered honestly. "I don't know" is allowed. |
| 5 | **Field Test** | 5 | One concrete exercise with time, materials and success criteria |
| 6 | **Pause** | 3 | A Breath Gate block (VC-05): 60-second silence, then one prayer prompt and one journal line |
| 7 | **Closure Card** | 2 | A summary in 3 bullets plus one sentence to remember (VC-25) |

**Book-level arc for the modules:** M1 *Name it* → M2 *Root it* (theology) → M3 *Rewire it* (practice) → M4 *Live it with others* → (optional M5 *Carry it forward*).

### 2.4 20 Christian Book Topics

| ID | Working Title | Human Problem | Anchor Text | Signature Framework (name only) |
|---|---|---|---|---|
| CB-01 | **Forgiveness** | Bitterness that poisons the forgiver | Matt 18:21–35 | The Debt Ledger (release ≠ reconcile ≠ trust) |
| CB-02 | **Identity** | Worth tied to performance | Eph 2:10; Gal 2:20 | Given vs. Earned Identity Map |
| CB-03 | **Calling** | "What am I for?" paralysis | 1 Cor 7:17; Eph 4:1 | Gifts × Burden × Door Matrix |
| CB-04 | **Financial Stewardship** | Debt, money shame, consumer anxiety | Luke 16:10–13; Prov 22:7 | Owner→Steward Ledger |
| CB-05 | **Anxiety** | Chronic worry | Phil 4:6–8; Matt 6:25–34 | Worry→Prayer Conversion Loop |
| CB-06 | **Grief & Lament** | Pain the church rushes past | Psalm 88; John 11:35 | The Lament Arc (complain → ask → trust) |
| CB-07 | **Rest & Sabbath** | Burnout as identity | Exod 20:8–11; Mark 2:27 | Four Rests Grid (body, mind, soul, social) |
| CB-08 | **Anger** | Anger that leaks or explodes | Eph 4:26; James 1:19–20 | Signal / Fuel / Fire Ladder |
| CB-09 | **Shame vs. Guilt** | "I am bad" rather than "I did bad" | Gen 3; Rom 8:1 | The Covering Spectrum |
| CB-10 | **Doubt** | Fear that questions disqualify faith | Mark 9:24; Jude 22 | Honest-Doubt Inventory |
| CB-11 | **Marriage as Covenant** | Contract mindset in marriage | Eph 5:21–33; Ruth 1:16 | Covenant vs. Contract Audit |
| CB-12 | **Parenting as Discipleship** | Behavior control vs. heart formation | Deut 6:4–9 | Rules → Rhythms → Relationship |
| CB-13 | **Friendship** | Adult loneliness | Prov 18:24; 1 Sam 18 | Friendship Depth Rings |
| CB-14 | **Work & Excellence** | Meaningless or idolized work | Col 3:23–24; Gen 2:15 | Cultivate & Keep Model |
| CB-15 | **Suffering** | "Why is God allowing this?" | Job 38–42; Rom 8:18–28 | Presence-not-Answer Framework |
| CB-16 | **Generosity** | Scarcity mindset | 2 Cor 9:6–11 | Open-Hand Gradient |
| CB-17 | **Spiritual Disciplines** | Inconsistent devotional life | 1 Tim 4:7–8 | Small-Repeated-Kind Habit Stack |
| CB-18 | **Servant Leadership** | Leading by control or fear | Mark 10:42–45; John 13 | Towel-and-Basin Leadership Loop |
| CB-19 | **Attention & Digital Life** | A fragmented mind | Rom 12:2; Phil 4:8 | Attention Budget |
| CB-20 | **Hope While Waiting** | Despair in long delays | Rom 5:3–5; Lam 3:21–26 | Waiting-Room Practices |

Topics CB-21 to CB-100 should be generated from the same columns. Before a new topic is added, it must have a distinct **Human Problem** and a distinct **Signature Framework**.

---

## SECTION 3: ISLAMIC SELF-HELP MASTER TEMPLATE + 20 BOOK TOPICS

### 3.1 Series Rules (apply to all 100 books)

- **Scope:** mainstream Sunni scholarly consensus, madhhab-neutral. Where rulings differ, add an "Ikhtilaf note" and defer to local scholars. Practical fiqh content (finance, marriage) is reviewed by a qualified *'alim* before print.
- **Qur'an:** Arabic + transliteration + translation, cited Surah:Ayah. Name the translation used (e.g., Sahih International, or Abdel Haleem with a license).
- **Hadith:** only *sahih* or *hasan*. Each hadith is cited with collection + number + grading (e.g., *Sahih al-Bukhari 6464*). No *da'if* or fabricated narrations, including popular "motivational" ones.
- **Scholarly lens:** each book draws on at least one classical source (al-Ghazali *Ihya' 'Ulum al-Din*, Ibn al-Qayyim *Madarij al-Salikin*, Ibn Rajab *Jami' al-'Ulum wal-Hikam*, an-Nawawi *Riyad as-Salihin*) and at least one tafsir (Ibn Kathir, al-Tabari, al-Sa'di).
- **Image rule:** no depiction of Allah, prophets or angels in any form, including the animal characters (Section 5).
- **Clinical boundary:** the same "When this book is not enough" page as the Christian series, with language affirming that seeking help is consistent with *tawakkul*.

### 3.2 Master Structure (200 pages)

| Part | Pages | Component | Function |
|---|---|---|---|
| **Front** | 6 | Basmala, contents, *How to Use This Book* (solo / *halaqa* / family) | Orientation |
| **Part 0: Muqaddimah** (intro framework) | 18 | **0.1 The Condition:** the lived problem (composite case)<br>**0.2 The Veil:** the heart-disease or false belief behind it (*marad al-qalb* lens)<br>**0.3 The Ayah:** one anchor ayah for the whole book, with tafsir summary<br>**0.4 The Map:** a one-page framework diagram<br>**0.5 Muhasabah Check:** a 12-item self-accounting diagnostic | Diagnose the heart before the act |
| **Part I: Core Modules** (3–5; default 4 × 30pp) | 120 | See module anatomy below | Transformation |
| **Part II: 'Amal** (implementation) | 28 | **40-Day Plan:** 1 page per day (*niyyah* → act → note), using the 40-day frame found in Islamic tradition<br>**Consistency rule:** "Small and constant beats large and broken" (Bukhari 6464) (VC-18)<br>**Halaqa Guide:** 6 sessions<br>**Obstacle Map:** the 5 likely failure points and a pre-planned response for each | Behavior change |
| **Part III: Dhikr, Du'a & Muhasabah** | 18 | **Masnun du'as** for the theme (Arabic / transliteration / meaning / source)<br>**Dhikr routine:** morning and evening, linked to the theme<br>**Tadabbur sheet:** a slow-reading guide for the anchor ayah<br>**Nightly Muhasabah:** a 3-question journal<br>**Prayer-time anchors:** one micro-practice per *salah* | Spiritual integration |
| **Back** | 10 | "When this book is not enough", glossary (Arabic terms), sources with gradings, further reading, series map | Safety + scholarly integrity |

### 3.3 Module Anatomy (repeats 3–5×, ~30 pp each)

| # | Block | Pages | Spec |
|---|---|---|---|
| 1 | **Qissa** | 3 | A story from the *sirah*, the Companions or a contemporary composite, with an unresolved moment |
| 2 | **Ayah & Tafsir** | 6 | One ayah: Arabic root analysis of a key word, classical tafsir and the common misapplication |
| 3 | **Hadith** | 4 | 1–2 authenticated hadith with context (*asbab*) |
| 4 | **Framework** | 7 | A named model (2×2, cycle, stations/*maqamat* ladder) with a diagram |
| 5 | **Boundary Check** | 2 | What this is *not*. For example, *tawakkul* ≠ passivity and *sabr* ≠ tolerating abuse. Defer to an 'alim where relevant. |
| 6 | **'Amal Test** | 4 | One concrete practice with time, conditions and a sign of success |
| 7 | **Pause** | 2 | A Breath Gate (VC-05): a short dhikr, one du'a and one muhasabah line |
| 8 | **Closure Card** | 2 | 3 bullets plus one line to carry (VC-25) |

**Book-level arc for the modules:** M1 *Recognize* (*ma'rifah*) → M2 *Root* (Qur'an/Sunnah) → M3 *Purify & Act* (*tazkiyah*) → M4 *Live it in the Ummah* → (optional M5 *Istiqamah*, or steadfastness).

### 3.4 20 Islamic Book Topics

| ID | Working Title | Human Problem | Anchor | Signature Framework (name only) |
|---|---|---|---|---|
| IB-01 | **Tawakkul** (Trust) | Control anxiety vs. passive fatalism | 65:2–3; Tirmidhi 2517 ("tie your camel") | Tie-Then-Trust Loop |
| IB-02 | **Ihsan** (Excellence) | Mediocre or performative effort | Muslim 8 (Hadith Jibril) | Watched-and-Watching Scale |
| IB-03 | **Sabr** (Patience) | Breaking under pressure | 2:153–157 | Three Sabrs Grid (in obedience, from sin, through trial) |
| IB-04 | **Shukr** (Gratitude) | Comparison and entitlement | 14:7 | Heart-Tongue-Limb Gratitude Triad |
| IB-05 | **Tawbah** (Repentance) | Despair after sin | 39:53; Muslim 2703 | The Open Door Cycle (stop, regret, resolve, restore) |
| IB-06 | **Ikhlas & Niyyah** | Doing good for an audience | 98:5; Bukhari 1 | Intention Audit |
| IB-07 | **Ummah** (Community) | Isolation, especially for converts and diaspora | 3:103; 49:10 | Rope-and-Knot Belonging Map |
| IB-08 | **Rizq & Halal Wealth** | Debt, riba exposure, money anxiety | 65:2–3; 2:275–280 | Halal Provision Ledger (needs fiqh review) |
| IB-09 | **Adab al-Lisan** (Speech) | Gossip, harshness, online speech | 49:11–12 | Speak / Silence / Sift Filter |
| IB-10 | **Silat al-Rahim** (Kinship) | Family estrangement | 4:1; Bukhari 5986 | Kinship Repair Ladder |
| IB-11 | **Zuhd** (Detachment) | Consumerism and status hunger | 57:20 | Hand-not-Heart Model |
| IB-12 | **Khushu'** (Presence in Salah) | Distracted prayer | 23:1–2 | Five-Point Presence Prep |
| IB-13 | **Hasad** (Envy) | Envy and resentment | 113:5; 4:32 | Envy→Du'a Conversion |
| IB-14 | **Amanah** (Trustworthiness) | Integrity at work | 4:58; 33:72 | Trust Triangle (God, people, self) |
| IB-15 | **Sakinah** (Marriage) | Conflict and emotional distance | 30:21 | Sakinah-Mawaddah-Rahmah Check |
| IB-16 | **Tarbiyah** (Parenting) | Fear-based or absent parenting | 31:12–19 (Luqman) | Luqman Sequence |
| IB-17 | **Qadar & Grief** | Loss and "why me" | 2:155–156; 57:22–23 | Inna lillahi Framework |
| IB-18 | **Haya'** (Modesty & Dignity) | Shamelessness vs. toxic shame | Bukhari 24 | Dignity Spectrum |
| IB-19 | **Waqt** (Time) | Wasted days, a scrolling life | 103 (al-'Asr) | Four Conditions Time Audit |
| IB-20 | **Khawf & Raja'** (Fear & Hope) | Swinging between despair and complacency | 39:9; 15:56 | Two Wings Balance |

### 3.5 Parallel Pairing Rule

The two series run **in parallel, not merged**. They share a Human Problem but keep their own theology. No syncretism and no "both are the same" claims.

| Shared HP | Christian | Islamic |
|---|---|---|
| Release from wrong done | CB-01 Forgiveness | IB-05 Tawbah (+ *'afw*) |
| Trust under uncertainty | CB-05 Anxiety | IB-01 Tawakkul |
| Money & debt | CB-04 Stewardship | IB-08 Rizq |
| Loss | CB-06 Lament | IB-17 Qadar & Grief |
| Marriage | CB-11 Covenant | IB-15 Sakinah |
| Consistency | CB-17 Disciplines | IB-12 Khushu' / IB-03 Sabr |

---

## SECTION 4: RELUCTANT READER POETRY FRAMEWORK + 15 CONCEPTS

### 4.1 The Invisible Poetry Framework

**Thesis:** resistant readers do not reject poetry. They reject *poetic signaling*: line-broken abstraction, elevated diction and homework-style interpretation. Remove the signal and keep the compression.

**Five Laws**

1. **Disguise:** every piece borrows a non-literary container people already read without effort (receipts, error logs, chat threads). The form *is* the hook.
2. **7-Word Hook:** the reader must know what's going on within seven words. Confusion is never the entry fee.
3. **Constraint as Engine:** the borrowed form's rules (character limits, fields, timestamps) do the line-breaking. Rhyme is optional and meter is irrelevant.
4. **The Turn:** each piece needs a single twist (a *volta*) where the mundane form suddenly carries real weight. No turn means no piece.
5. **Exit Fast:** stop one beat after the turn. No moral and no closing summary line.

**Three-Read Architecture**

| Read | What the reader experiences | Design requirement |
|---|---|---|
| 1st (3 sec) | "Ha, it's a receipt." | Works as a joke or recognition on its own |
| 2nd (30 sec) | "Wait, the pattern means something." | Repetition and structure carry the subtext |
| 3rd (days later) | The gut punch returns | One concrete detail the reader can't shake |

**Tone Spec**

| DO | DON'T |
|---|---|
| Clever, deadpan, specific | Flowery, abstract, "soul-searching" |
| Concrete nouns (a parking ticket, a voicemail) | Moon, rain-as-tears or roses, unless the cliché is the joke |
| Contemporary objects and language | Archaic diction (thee, 'tis, o'er) |
| Humor as the doorway to grief | Sentiment announced up front |
| Under 120 words per piece (90% of pieces) | Multi-page lyric sequences |
| Pattern-based (lists, fields, logs) | Free verse that just looks like prose with Enter pressed |

**Collection Spec (×100):** 64–96 pages, 40–60 pieces, one disguise format per collection (with a 10% "glitch" quota of pieces that break their own form at the emotional peak). Sequence pieces along a quiet arc: setup → escalation → turn → aftermath. **Success metric:** screenshot-ability, meaning a single page can be shared standalone and still land.

### 4.2 15 Concept Matrix

| ID | Collection Concept | Disguise Format | Core Mechanic | Turn Strategy | Primary Reader |
|---|---|---|---|---|---|
| RP-01 | **Terms & Conditions** | Legal fine print / ToS | Numbered clauses and definitions | The clause no one reads hides the confession | Office workers, cynics |
| RP-02 | **Patch Notes** | Software release notes | `v2.3: Fixed / Known Issues / Deprecated` | "Known Issues" lists what therapy didn't fix | Devs, gamers |
| RP-03 | **Receipts** | Store receipts | Itemized list, totals, return policy | The total doesn't add up, and the difference is the poem | Everyone with a wallet |
| RP-04 | **Error 404** | Error messages / system logs | Timestamps and error codes | The log reveals a human pattern over time | Tech-weary readers |
| RP-05 | **Unread** | Group-chat / DM transcripts | Read receipts, typing indicators, deleted messages | "Typing…" that never resolves | Teens, young adults |
| RP-06 | **1-Star Reviews** | Customer reviews of abstract things (Monday, adulthood, Grandpa's silence) | Rating, verified purchase, helpful-votes | The review drifts from complaint into praise | Comedy fans |
| RP-07 | **Autocomplete** | Search-bar suggestions | Truncated queries in descending order | The last suggestion is the one you never typed aloud | Phone natives |
| RP-08 | **Inner Weather** | TV weather forecast | Pressure fronts, 5-day outlook, warnings | The "weather warning" becomes an intervention | Anxious readers |
| RP-09 | **Lost & Found** | Classified ads / telephone-pole posters | Reward, last seen, tear-off tabs | The lost thing is a version of the poster's author | Commuters |
| RP-10 | **Box Score** | Sports stats | Stats tables, play-by-play | The stat that matters is never tracked | Sports fans (high resistance) |
| RP-11 | **Some Assembly Required** | Flat-pack instructions | Numbered steps, parts list, wordless panels | The final step can't be done alone | Visual / dyslexic readers |
| RP-12 | **Recipes for Inedible Things** | Recipe cards | Ingredients, method, serves | "Serves: 1" | Home cooks |
| RP-13 | **Two-Panel** | Meme formats (Drake, distracted boyfriend, "nobody: / me:") | Image macro + caption, described in text | Panel 2 is quietly devastating | Social-media natives |
| RP-14 | **Choose Your Path** | Flowcharts / branching decision trees | Yes/No arrows | Every path loops to the same box | Puzzle and logic lovers |
| RP-15 | **Overheard** | 50-word eavesdropped micro-stories | Location tag + fragment of dialogue | The listener realizes it's about them | Reluctant prose readers |

The other 85 collections are built either as **format × theme** (RP-02 × Grief, RP-02 × Debt and so on, drawing themes from the 40 book topics) or as new disguise formats that pass all Five Laws.

---

## SECTION 5: AJA GATA ANIMAL CHARACTER ARCHETYPES (5-TIER VALUE SYSTEM)

### 5.1 Design Rules

- **Motivated selection:** every animal appears in **both** Biblical and Qur'anic or hadith sources (or is explicitly noted where it doesn't). That lets the same character serve both book series and stay authentic to each.
- **Tier hierarchy:** when a character's values conflict, the **lower tier number wins** (Spiritual > Emotional > Practical > Community > Creative). This gives every story a built-in decision engine.
- **Shadow trait:** each character has a defined flaw (its value overextended). Without this they're mascots, not characters.
- **Hard guardrails:** characters never represent God, Christ, prophets or angels. They are witnesses and companions, not sacred figures. The fish is *not* Jonah/Yunus, and the raven is *not* Elijah's provider. They are creatures who were there.

### 5.2 Cast Overview

| ID | Name | Animal | Archetype | Scriptural Root (Bible / Qur'an–Hadith) | Shadow |
|---|---|---|---|---|---|
| AG-01 | **Aja** | Cat (*gata*) | The Observer-Guide (series narrator) | Bible: absent, so Aja is the *outsider who notices* / Hadith: cats are not impure (Abu Dawud 75); woman punished for starving a cat (Bukhari 3318) | Aloofness, watching instead of helping |
| AG-02 | **Nami** | Ant | The Faithful Builder | Prov 6:6–8; 30:25 / Qur'an 27:18–19 (Surah an-Naml) | Workaholism, worth through output |
| AG-03 | **Nahla** | Bee | The Healer-Maker | Prov 16:24; Ps 19:10 / Qur'an 16:68–69 (Surah an-Nahl) | Perfectionism, stinging when disturbed |
| AG-04 | **Korvo** | Raven / Crow | The Teacher of Hard Lessons | Gen 8:7; 1 Kgs 17:4–6; Luke 12:24 / Qur'an 5:31 (the crow teaches burial) | Bluntness that wounds |
| AG-05 | **Hud-Hud** | Hoopoe | The Scout & Truth-Teller to Power | Bible: no direct (functional parallel: Nathan, 2 Sam 12) / Qur'an 27:20–28 | Recklessness, reporting before verifying |
| AG-06 | **Jamal** | Camel | The Patient Endurer | Matt 19:24; Gen 24 / Qur'an 88:17; Tirmidhi 2517 ("tie your camel") | Stubbornness, endurance as an excuse not to change |
| AG-07 | **Bahr** | Great Fish | The Container of Second Chances | Jonah 1:17 / Qur'an 37:139–148; 21:87 | Swallowing what should be confronted |

### 5.3 Character Value Profiles

#### AG-01 · Aja: the Cat (Observer-Guide)
**Role:** the narrator across all series. She lands on her feet, which carries the series' resilience theme. She opens and closes books, comments in margins and is the "voice" of the poetry collections' introductions.
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Attentiveness**: noticing is a form of reverence | Stops the story to point at what everyone missed |
| 2 Emotional | **Chosen closeness**: affection given freely, never extracted | Sits near the hurting one without speaking |
| 3 Practical | **Resilience**: falls, rights itself, continues | Models the re-entry rule (VC-18) |
| 4 Community | **Gentle boundaries**: belongs without being owned | Shows that "no" is not rejection |
| 5 Creative | **Curiosity**: play as discovery | Introduces each Field Test / 'Amal Test |

#### AG-02 · Nami: the Ant (Faithful Builder)
**Role:** the voice of habit, consistency and preparation. She owns the 30/40-day plans.
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Faithfulness in small things** | Treats a crumb carried as worship |
| 2 Emotional | **Steadiness**: mood doesn't decide action | Keeps going on gray days, quietly |
| 3 Practical | **Preparation**: store in summer | Teaches planning, budgeting and sequencing |
| 4 Community | **Collective strength**: the colony carries what one can't | Hands off loads, asks for help |
| 5 Creative | **Architecture**: beauty in structure | Draws the framework diagrams |

#### AG-03 · Nahla: the Bee (Healer-Maker)
**Role:** the voice of turning raw experience into something nourishing. She leads healing and generosity themes.
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Guided purpose**: following an inner direction | Flies the path she was shown |
| 2 Emotional | **Sweetness from struggle**: pain processed, not hidden | Shows how grief can become nourishment |
| 3 Practical | **Diligent craft**: many trips, one jar | Breaks big change into flights |
| 4 Community | **Pollination**: your growth feeds others' | Connects characters to one another |
| 5 Creative | **Making**: transformation as art | Hosts the journaling and making exercises |

#### AG-04 · Korvo: the Raven (Teacher of Hard Lessons)
**Role:** delivers the "Push-back" and "Boundary Check" blocks. He is honest, dark-humored and never cruel on purpose.
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Provision in strange forms**: help comes from unexpected places | Brings what's needed, not what's wanted |
| 2 Emotional | **Facing death and loss honestly** | Sits with grief without fixing it |
| 3 Practical | **Showing, not telling**: teaches by demonstration | Models the action (cf. Qur'an 5:31) |
| 4 Community | **Truth that serves the group** | Names the elephant in the room |
| 5 Creative | **Dark wit**: humor at the edge | Voices the deadpan poetry collections (RP-01, 04, 06) |

#### AG-05 · Hud-Hud: the Hoopoe (Scout & Truth-Teller)
**Role:** courage and accountability. He reports what he has seen to those in power and accepts being checked.
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Witness**: truth owed to God above status | Speaks up despite rank |
| 2 Emotional | **Courage under scrutiny** | Accepts "we will verify" without defensiveness (27:27) |
| 3 Practical | **Reconnaissance**: going out and gathering facts | Leads research and self-assessment chapters |
| 4 Community | **Accountability**: reports for the group's good | Models whistleblowing and honest feedback |
| 5 Creative | **Storytelling**: reports vividly and precisely | Narrates the Scene / Qissa openers |

#### AG-06 · Jamal: the Camel (Patient Endurer)
**Role:** patience, trust and long journeys. He is the mascot of the Breath Gate (VC-05).
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Trust after effort**: "tie it, then trust" | Never skips the rope, never fears beyond it |
| 2 Emotional | **Patience**: carries heat without complaint, but without denial either | Names his thirst honestly |
| 3 Practical | **Reserve management**: water stored for the desert stretch | Teaches pacing, savings and energy budgets |
| 4 Community | **Caravan loyalty**: travels at the pace of the slowest | Waits for the struggling character |
| 5 Creative | **Absurd humor**: the camel through the needle's eye | The comic relief of "impossible" situations |

#### AG-07 · Bahr: the Great Fish (Container of Second Chances)
**Role:** the bridge between failure and restart. He appears at the low point of every book arc.
| Tier | Value | Behavioral Expression |
|---|---|---|
| 1 Spiritual | **Mercy in the dark**: the low point as a holding place, not a grave | Frames rock bottom as a pause, not an end |
| 2 Emotional | **Holding space**: containment without judgment | Lets characters cry inside the silence |
| 3 Practical | **Timing**: release at the right moment and shore | Teaches waiting before acting |
| 4 Community | **Restoration**: returning someone to their people | Ends arcs with reintegration |
| 5 Creative | **Depth**: the unseen world beneath | Voices the quiet, lyrical pieces of the poetry series |

### 5.4 Ensemble Dynamics

| Pairing | Tension | Story Use |
|---|---|---|
| Nami × Jamal | Speed vs. pace | Productivity vs. rest books (CB-07 / IB-19) |
| Korvo × Nahla | Blunt truth vs. gentle healing | Forgiveness / Tawbah |
| Hud-Hud × Aja | Speak up vs. observe | Courage and accountability |
| Bahr × anyone | Container for a character's failure | Every module's low point |

---

## SECTION 6: CROSS-PROJECT INTERCONNECTION LAYER

### 6.1 Vibe-Codes as Book & Poetry Design Language

The vibe-codes act as a **UX system for print**. Each one becomes a recurring component in the books and the poetry collections.

| Vibe-Code | Book Component (both series) | Poetry Component |
|---|---|---|
| VC-01 Clarity Cascade | One big idea per module; secondary material in sidebars | One turn per piece |
| VC-05 Breath Gate | "Pause" block in every module | White-space page before each collection's peak piece |
| VC-06 Empty-Room Welcome | Self-diagnostic in Part 0 gives every reader a starting point | Opening piece is the easiest possible entry |
| VC-07 Wayfinder Thread | Running header: "Module 2 of 4 · Root it" | Format markers (v1.0 → v4.2, Day 1 → Day 40) |
| VC-11 Forgiving Field | Self-assessments with no "fail" bands | No allusions that require prior knowledge |
| VC-18 Streak Without Shame | Re-entry rule in 30/40-day plans | Collection arcs that include relapse |
| VC-19 Readable Rhythm | 60–70ch measure, 11.5/16pt body for print | Short lines, generous margins |
| VC-25 Closure Card | End-of-module 3-bullet card | Final piece as a "receipt" for the whole collection |

### 6.2 Character Deployment Rules Across Projects

| Medium | Character Function | Frequency |
|---|---|---|
| Self-help books | Margin guide; opens Scene/Qissa; voices Push-back/Boundary Check | 1 lead character per book + Aja (constant) |
| Poetry collections | Persona/speaker for an entire collection | 1 character per collection (e.g., Korvo voices RP-04 *Error 404*) |
| Web | Empty states, Closure Cards, loading copy (VC-06, 08, 25) | Contextual, never decorative |
| Community/education | Discussion-guide avatars; children's/family editions | By theme |

**Tradition rule:** in Christian books, characters cite Biblical roots only. In Islamic books they cite Qur'anic/hadith roots only. The character's *personality and values* are constant, and its *sources* follow the book.

### 6.3 Three Concrete Cross-Project Examples

#### Example A: Soft Landing → Tawbah / Forgiveness → Patch Notes
| Layer | Blueprint |
|---|---|
| **Human Problem** | "I've done something I can't take back, so I'm done." |
| **Web (VC-04)** | Deletions in the Rolig app trigger a toast: "Removed. *Undo*." Microcopy principle: mistakes are reversible by default. |
| **Christian (CB-01, M3 "Rewire it")** | Framework module: *The Undo Isn't Amnesia*, where release of debt ≠ erasing memory. Anchor Matt 18:21–35. Field Test: a written release letter (not sent). |
| **Islamic (IB-05, M2 "Root")** | Framework module: *The Door Stays Open*. Anchor 39:53 + Muslim 2703 (repentance accepted until the sun rises from the west). 'Amal: a 3-night tawbah routine. |
| **Poetry (RP-02 *Patch Notes*)** | Collection blueprint: each piece is a version log of one person. The turn: "Rollback available" appears under Known Issues. |
| **Carrier** | **Aja** (lands on her feet) narrates the re-entry, and **Bahr** holds the low point. |
| **Shared metric** | Re-entry rate: app (returns after a deletion), books (readers resuming after a missed day), poetry (pages shared from the Known Issues sections). |

#### Example B: Breath Gate → Anxiety / Tawakkul → Terms & Conditions
| Layer | Blueprint |
|---|---|
| **Human Problem** | Acting on panic: sending the message or making the purchase at 02:00. |
| **Web (VC-05)** | Pusterom: a 3-second hold-to-confirm before emotional actions, plus a breathing circle as the gate. (Already present in this repo's `index.html`.) |
| **Christian (CB-05, M3)** | Framework: *Worry→Prayer Conversion Loop* (Phil 4:6–7). The Pause block is built as a literal gate: 60 s silence before the prayer prompt. |
| **Islamic (IB-01, M1)** | Framework: *Tie-Then-Trust Loop*. Anchor Tirmidhi 2517 ("Tie it, and rely upon Allah"). Boundary Check: tawakkul ≠ passivity. 'Amal: a written "rope list" (what is mine to do) vs. a "trust list". |
| **Poetry (RP-01 *Terms & Conditions*)** | Blueprint: a contract the anxious mind makes the user sign. The turn: clause 14.2, "User may wait three seconds before agreeing." |
| **Carrier** | **Jamal** the Camel (literally the tied camel) is the Breath Gate mascot across all three media. |
| **Shared metric** | Pause completion: app (gate completions), books (Pause blocks journaled), poetry (reader survey: "made me stop"). |

#### Example C: Streak Without Shame → Disciplines / Consistency → Box Score
| Layer | Blueprint |
|---|---|
| **Human Problem** | "I missed three days, so I'm a fraud, so I quit." |
| **Web (VC-18)** | The history view shows *days returned*, not *streak broken*. A missed day renders as neutral gray, never red. A return triggers Micro-Joy (VC-03). |
| **Christian (CB-17, Part II)** | Field Plan re-entry rule: "Missed days? Restart at the next Sunday." Framework: *Small-Repeated-Kind Habit Stack* (1 Tim 4:7–8). |
| **Islamic (IB-03 / IB-12, Part II)** | 40-day plan consistency rule anchored in Bukhari 6464 / Muslim 783 ("the most beloved deeds… are the most consistent, even if small"). |
| **Poetry (RP-10 *Box Score*)** | Blueprint: weekly stat sheets of an ordinary life. The turn: the only unrecorded stat ("showed up anyway: 3/7") is the one that wins the game. |
| **Carrier** | **Nami** the Ant owns the plans. **Jamal** walks at the pace of the one who fell behind. |
| **Shared metric** | 30/40-day completion *including* restarts, a deliberate rejection of perfect-streak metrics. |

### 6.4 Production Pipeline (how a new asset enters the system)

1. Define the **Human Problem** (HP-xx) in one sentence.
2. Map it to 1–2 **Vibe-Codes** (the interaction pattern).
3. Assign a **Christian** and/or **Islamic** book slot (CB/IB) and choose the module position.
4. Pick a **Poetry Disguise** (RP) whose form mirrors the HP mechanic.
5. Assign an **Aja Gata Carrier** using the tier hierarchy (lowest tier in conflict decides the character's choice).
6. Define **one shared metric** that is measurable across web, print and poetry.
7. Pass the **review gates** for the tradition (theology / 'alim), clinical safety and sensitivity.

Verification note: all scripture, hadith numbers and repository names must be re-checked against the primary source before publication. Hadith numbering follows the Sunnah.com / Darussalam conventions.
