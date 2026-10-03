# Multi-Agent Orchestration Blueprint — Research → Visual Intelligence → Synthesis → 10 Artifacts

Status: architecture spec v1.0 · Scope: roles, contracts, data flow, gates, prompt templates.
Out of scope: agent outputs, sample artifacts, answers to research questions.

---

## 0. Design Principles

| # | Principle | Consequence |
|---|-----------|-------------|
| P1 | **Contracts over conversation** | Every agent receives a typed envelope and returns a typed envelope. Free text exists only inside declared string fields. |
| P2 | **Waterfall between layers, hybrid inside layers** | Layers L0→L4 run strictly in order. Inside L1 and L3, agents run in parallel or as a DAG. Feedback re-enters at the lowest layer that owns the defect. |
| P3 | **Provenance on every claim** | Every field that asserts something cites `evidence_refs` (image region, brief clause, upstream artifact id). Unreferenced claims fail validation. |
| P4 | **Orchestrator never generates** | ORC routes, validates, schedules, merges, and escalates. It does not write artifact content. |
| P5 | **Researcher owns direction, agents own execution** | The human sets parameters, approves gates, and breaks ties. Agents never change research parameters. |
| P6 | **Deterministic checks before model checks** | Schema, license, size, and format checks run first and cheaply. Rubric/LLM judges run only on schema-valid outputs. |
| P7 | **Immutable iterations** | Each iteration writes a new versioned snapshot. Nothing is overwritten; diffs are first-class objects. |

---

## 1. System Architecture Diagram

```
                         ┌──────────────────────────────────────────┐
                         │  H  HUMAN RESEARCHER                     │
                         │  brief · reference set · parameters      │
                         └───────┬───────────────────────▲──────────┘
                                 │ ResearchBrief         │ Gate H0–H3, escalations
                                 ▼                       │
┌────────────────────────────────────────────────────────┴───────────────────────┐
│ ORC  ORCHESTRATOR  (state machine · scheduler · router · validator · ledger)    │
└──┬─────────────────────────────────────────────────────────────────────────────┘
   │
   ▼  L0  INTAKE ─────────────────────────────────────────────────────────────────
   ┌──────────────┐   ┌──────────────┐
   │ RIA  Research│──▶│ RIG  Rights &│──▶ ResearchContext  ──────────────┐
   │ Intake Agent │   │ Input Gate   │                                    │
   └──────────────┘   └──────────────┘                                    │
   │                                                                      │
   ▼  L1  VISUAL ANALYSIS LAYER (parallel fan-out per image) ─────────────│────────
   ┌──────────────┐                                                       │
   │ VIS-ING      │  normalize · tile · keyframe · hash                   │
   └──────┬───────┘                                                       │
          ├────────────┬─────────────┬─────────────┬───────────────┐      │
          ▼            ▼             ▼             ▼               ▼      │
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
   │VIS-COMP  │ │VIS-COLOR │ │VIS-MOTION│ │VIS-SEM   │ │VIS-TEXT (OCR)│   │
   │compositn │ │color/tone│ │motion/dyn│ │semantics │ │typography    │   │
   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
        └────────────┴────────────┼────────────┴──────────────┘           │
                                  ▼                                       │
                         ┌─────────────────┐                              │
                         │ VIS-FUSE        │──▶ VisualFindings (JSON)     │
                         │ cross-image     │                              │
                         └────────┬────────┘                              │
                                  │                     [H1 optional]     │
   ▼  L2  SYNTHESIS LAYER (sequential, with internal critique loop) ──────│────────
                                  ▼                                       ▼
                         ┌─────────────────┐  ┌─────────────────┐
                         │ SYN-INT         │─▶│ SYN-DIV         │
                         │ integrator      │  │ divergent axes  │
                         └─────────────────┘  └────────┬────────┘
                                                       ▼
                         ┌─────────────────┐  ┌─────────────────┐
                         │ SYN-FRAME       │◀─│ SYN-CRIT        │
                         │ framework compl.│  │ constraint/novel│
                         └────────┬────────┘  └─────────────────┘
                                  │ ConceptualFramework          [H2 mandatory]
   ▼  L3  ARTIFACT GENERATION LAYER (DAG, 3 tiers) ───────────────────────────────
                                  │
     Tier A  ┌────────┐ ┌────────┐ ┌────────┐
     (roots) │G01 IDEA│ │G05 VIBE│ │G09 TXT │
             └───┬────┘ └───┬────┘ └───┬────┘
                 │          ├──────────┼───────────┬──────────┐
     Tier B  ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌────▼───┐ ┌────▼───┐
             │G03 CONC│ │G04 CUT │ │G08 IMG │ │G07 MUS │ │G06 CODE│
             └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
                 │          └──────────┴──────────┴──────────┤
     Tier C  ┌───▼────┐                                 ┌────▼────┐
             │G02 PAT │                                 │G10 STRAT│
             └───┬────┘                                 └────┬────┘
                 └──────────────────┬────────────────────────┘
   ▼  L4  QUALITY & AGGREGATION ────┼──────────────────────────────────────────────
                                    ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │QG-SCHEMA │─▶│QG-RUBRIC │─▶│QG-COHERE │─▶│QG-NOVEL  │─▶│ AGG      │
   │determin. │  │per-type  │  │cross-art │  │dedupe/   │  │aggregator│
   └──────────┘  └──────────┘  └──────────┘  │prior-art │  └────┬─────┘
                                             └──────────┘       │
                                                                ▼
                                                  ┌───────────────────────┐
                                                  │ FBK  feedback planner │
                                                  └───────────┬───────────┘
                     ┌────────────────────────────────────────┼─────────────┐
                     ▼ re-enter L3 (artifact defect)          ▼ L2 / L1     ▼ converged
                  regenerate subset                     reframe / re-look   OutputBundle
                                                                            [H3 release]
```

**Execution model.** L0→L1→L2→L3→L4 is waterfall. Inside L1, the five extractors run in parallel per image, then fuse. Inside L2, the four agents run as a short sequential chain with one internal critique loop. Inside L3, the ten generators run as a three-tier DAG. Tiers run in parallel internally. L4 feeds back to the lowest layer that owns each defect.

---

## 2. Agent Specifications Table

### 2.1 Control & Intake

| Agent | Role | Input Type | Output Specification | Success Criteria |
|---|---|---|---|---|
| **ORC** Orchestrator | State machine, scheduler, router, ledger keeper. Never generates content. | `ResearchBrief`, all envelopes, `GateDecision` | `TaskEnvelope[]` dispatched; `RunLedger` entries; `EscalationNotice` | 100% of dispatched tasks have a schema-valid input; no task runs with unresolved upstream deps; ledger replayable |
| **RIA** Research Intake | Parse brief into machine-usable research context | `ResearchBrief` (free text + structured fields) | `ResearchContext` (§5.2) | Every objective has ≥1 measurable criterion; all ambiguities listed in `open_questions`; zero invented constraints |
| **RIG** Rights & Input Gate | Verify licensing, consent, PII, format of reference media | `ImageSet` manifest + `ResearchContext.rights_policy` | `ClearedImageSet` + `RightsReport` | No item passes without `license_status ∈ {owned, licensed, public_domain, fair_use_flagged}`; PII faces/plates flagged |

### 2.2 L1 — Visual Analysis

| Agent | Role | Input Type | Output Specification | Success Criteria |
|---|---|---|---|---|
| **VIS-ING** Ingest | Normalize, tile, keyframe-sample video, perceptual-hash, dedupe | `ClearedImageSet` | `NormalizedAsset[]` (id, phash, dims, color space, keyframes[]) | No duplicate phash < threshold; all assets sRGB-normalized with original preserved |
| **VIS-COMP** Composition | Spatial structure, balance, framing, hierarchy, depth | `NormalizedAsset` | `CompositionFindings` | Every finding has bbox/polygon ref; grid & focal points sum-consistent |
| **VIS-COLOR** Color & Tone | Palette, harmony, contrast, luminance, temperature | `NormalizedAsset` | `ColorFindings` | Palette weights sum to 1.0 ±0.01; values in declared color space; WCAG contrast pairs computed |
| **VIS-MOTION** Motion & Dynamics | Implied motion (stills) and measured motion (video): vectors, rhythm, cut cadence | `NormalizedAsset` (+ keyframes) | `MotionFindings` | Stills marked `implied`; video marked `measured` with frame timestamps |
| **VIS-SEM** Semantics | Objects, scenes, symbols, actions, affect, cultural codes | `NormalizedAsset` | `SemanticFindings` | Each label has confidence + region; affect labels separated from object labels; no identity inference on people |
| **VIS-TEXT** Typography/OCR | In-image text, type classification, layout of text | `NormalizedAsset` | `TypographyFindings` | OCR confidence per string; font class not font identity unless verified |
| **VIS-FUSE** Fusion | Merge per-image findings; compute cross-set patterns, clusters, outliers, tensions | All `*Findings` for set | `VisualFindings` (§3.3) | Every pattern cites ≥2 assets; contradictions surfaced, not averaged away |

### 2.3 L2 — Synthesis

| Agent | Role | Input Type | Output Specification | Success Criteria |
|---|---|---|---|---|
| **SYN-INT** Integrator | Map visual patterns onto research objectives; build insight graph | `VisualFindings`, `ResearchContext`, `FeedbackDelta?` | `InsightGraph` (nodes: insight; edges: supports/contradicts/extends) | Each objective linked to ≥1 insight or flagged `uncovered` |
| **SYN-DIV** Divergent Ideation | Generate orthogonal exploration axes and territories (not artifacts) | `InsightGraph`, `ResearchContext` | `ExplorationAxes[]` (axis, poles, rationale, evidence_refs) | ≥ `params.min_axes`; pairwise axis similarity < `params.axis_overlap_max` |
| **SYN-CRIT** Constraint & Novelty Critic | Stress-test axes vs constraints, ethics, feasibility, prior iterations | `ExplorationAxes`, `ResearchContext`, `IterationHistory` | `CritiqueReport` (keep/modify/kill per axis, reasons) | Every kill has a cited constraint; no axis kept that violates a hard constraint |
| **SYN-FRAME** Framework Compiler | Compile the ConceptualFramework: territories, design tokens, artifact briefs | `InsightGraph`, critiqued axes, `ResearchContext` | `ConceptualFramework` (§5.3) incl. 10 `ArtifactBrief`s | All 10 briefs present (or explicitly `disabled` by researcher); tokens machine-readable |

### 2.4 L3 — Artifact Generators

| Agent | Role | Input Type | Output Specification | Success Criteria |
|---|---|---|---|---|
| **G01 IDEA** | Atomic idea units | Framework, InsightGraph | `IdeaSet` | See §4 G01 gate |
| **G02 PAT** | Invention disclosure drafts | Framework, `ConceptSet`, prior-art index | `InventionDisclosure[]` | See §4 G02 gate |
| **G03 CONC** | Developed concepts | Framework, `IdeaSet`, `VibeFramework` | `ConceptSet` | See §4 G03 gate |
| **G04 CUT** | Visual edit decision specs | Framework, `VibeFramework`, `VisualFindings`, source media | `CutSpec[]` (EDL/OTIO) | See §4 G04 gate |
| **G05 VIBE** | Aesthetic frameworks | Framework, `VisualFindings` | `VibeFramework[]` | See §4 G05 gate |
| **G06 CODE** | Executable code | Framework, `ConceptSet`, `VibeFramework` tokens | `CodePackage` | See §4 G06 gate |
| **G07 MUS** | Music compositions/specs | Framework, `VibeFramework`, `MotionFindings` | `MusicPackage` | See §4 G07 gate |
| **G08 IMG** | Images | Framework, `VibeFramework`, `VisualFindings` | `ImagePackage` | See §4 G08 gate |
| **G09 TXT** | Text analyses | Framework, `VisualFindings`, `InsightGraph`, `ResearchContext.sources` | `TextAnalysis[]` | See §4 G09 gate |
| **G10 STRAT** | Strategic insights | All Tier A+B outputs, `ResearchContext` | `StrategicInsightSet` | See §4 G10 gate |

### 2.5 L4 — Quality, Aggregation, Feedback

| Agent | Role | Input Type | Output Specification | Success Criteria |
|---|---|---|---|---|
| **QG-SCHEMA** | Deterministic validation (JSON Schema, file formats, sizes, licenses, lint/test exit codes) | Any artifact envelope | `ValidationResult` (pass/fail + violations[]) | Zero false passes on schema; runs < 2 s per artifact |
| **QG-RUBRIC** | Per-type rubric scoring by an independent judge model | Valid artifact + its `ArtifactBrief` + rubric | `RubricScore` (per-criterion 0–5, rationale, evidence_refs) | Judge ≠ generator model instance; inter-run variance ≤ 0.5 on calibration set |
| **QG-COHERE** | Cross-artifact coherence vs framework & each other | All scored artifacts of iteration | `CoherenceReport` (conflicts[], orphan artifacts, token drift) | Every conflict names two artifact ids and the violated framework clause |
| **QG-NOVEL** | Dedupe vs history; similarity vs prior-art/reference corpus | Artifacts + `IterationHistory` + external indices | `NoveltyReport` (similarity scores, nearest neighbors) | Scores reported with index + version used; no silent pass on index failure |
| **AGG** Aggregator | Assemble the iteration bundle, compute iteration metrics | All L4 reports + artifacts | `OutputBundle` (§5.6) + `IterationMetrics` | Bundle self-contained; every artifact traceable to brief clauses |
| **FBK** Feedback Planner | Convert defects into routed refinement tasks; decide continue/converge/escalate | `IterationMetrics`, all L4 reports, `ResearchContext.loop_policy` | `FeedbackDelta` (§6.2) | Every defect routed to exactly one owning layer; no task without acceptance criterion |

---

## 3. Visual Intelligence Pipeline

### 3.1 Image Input Requirements

| Requirement | Specification | Enforced by |
|---|---|---|
| Formats | Stills: PNG, JPEG, WebP, TIFF, HEIC. Video: MP4/H.264, MOV/ProRes, WebM. Vector: SVG (rasterized at 2048px long edge for analysis) | VIS-ING |
| Resolution | Min 512 px short edge; recommended ≥ 1024. Below min → `low_res` flag, analysis allowed, confidence capped at 0.6 | VIS-ING |
| Color | Embedded ICC respected; analysis copy converted to sRGB; original retained | VIS-ING |
| Set size | 3 ≤ n ≤ `params.max_refs` (default 60). n < 3 → cross-set patterns disabled | ORC |
| Video | Keyframes: scene-change detection + uniform sampling at `params.kf_rate` (default 2 fps), cap 300 frames/clip | VIS-ING |
| Metadata | Per item: `source`, `license_status`, `role ∈ {primary_ref, counter_ref, context, own_material}`, optional researcher note | RIG |
| Rights | No item enters L1 without cleared `license_status`; `own_material` required for anything G04 CUT will edit | RIG |
| Privacy | Faces/plates/documents detected → blurred in analysis copies unless `consent=true` | RIG |

### 3.2 Extraction Parameters

| Dimension | Agent | Parameters extracted | Units / encoding |
|---|---|---|---|
| **Composition** | VIS-COMP | grid alignment (thirds, golden, center, symmetric, none) · focal points (≤5) · visual weight map · leading lines · negative-space ratio · horizon angle · depth planes (fg/mg/bg) · framing (crop tightness) · subject scale · balance vector | normalized coords [0,1]; angles in degrees; ratios [0,1] |
| **Color** | VIS-COLOR | dominant palette k=8 (OKLCH + hex + weight) · harmony type · luminance histogram (16 bins) · key (high/low/mid) · contrast (global RMS, WCAG pairs) · temperature (K estimate) · saturation distribution · accent ratio | OKLCH; weights sum 1.0 |
| **Motion** | VIS-MOTION | implied motion vectors (stills) · optical-flow magnitude/direction (video) · rhythm/repetition period · blur type · cut cadence (shots/min) · camera move class · energy curve over time | px/frame normalized; timestamps ms |
| **Semantic** | VIS-SEM | objects (label, bbox, conf) · scene class · actions · symbols/iconography · material/texture classes · affect (valence, arousal) · era/style cues · narrative tension markers · cultural-code flags | labels from controlled vocab + free `other`; conf [0,1] |
| **Typography** | VIS-TEXT | strings (OCR, conf) · type class (serif, grotesk, mono, script, display) · weight · case · tracking estimate · text/image ratio | conf [0,1] |
| **Cross-set** | VIS-FUSE | recurring motifs · palette clusters · composition archetypes · outliers · contradictions · gaps vs research objectives | refs to asset ids |

### 3.3 Structured Output Format — `VisualFindings` (JSON Schema, draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:moas:schema:visual_findings:1.0",
  "type": "object",
  "required": ["run_id", "iteration", "asset_findings", "set_patterns", "quality"],
  "properties": {
    "run_id":    { "type": "string" },
    "iteration": { "type": "integer", "minimum": 1 },
    "asset_findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["asset_id", "phash", "composition", "color", "motion", "semantic"],
        "properties": {
          "asset_id": { "type": "string" },
          "phash":    { "type": "string" },
          "role":     { "enum": ["primary_ref", "counter_ref", "context", "own_material"] },
          "flags":    { "type": "array", "items": { "enum": ["low_res", "blurred_pii", "ocr_heavy", "video"] } },
          "composition": {
            "type": "object",
            "required": ["grid", "focal_points", "negative_space_ratio", "balance_vector"],
            "properties": {
              "grid": { "enum": ["thirds", "golden", "center", "symmetric", "diagonal", "none"] },
              "focal_points": { "type": "array", "maxItems": 5, "items": { "$ref": "#/$defs/point" } },
              "negative_space_ratio": { "$ref": "#/$defs/unit" },
              "horizon_angle_deg": { "type": "number" },
              "depth_planes": { "type": "array", "items": { "enum": ["fg", "mg", "bg"] } },
              "leading_lines": { "type": "array", "items": { "$ref": "#/$defs/polyline" } },
              "balance_vector": { "$ref": "#/$defs/point" },
              "framing_tightness": { "$ref": "#/$defs/unit" }
            }
          },
          "color": {
            "type": "object",
            "required": ["palette", "key", "temperature_k"],
            "properties": {
              "palette": {
                "type": "array", "maxItems": 8,
                "items": {
                  "type": "object",
                  "required": ["oklch", "hex", "weight"],
                  "properties": {
                    "oklch":  { "type": "array", "items": { "type": "number" }, "minItems": 3, "maxItems": 3 },
                    "hex":    { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" },
                    "weight": { "$ref": "#/$defs/unit" },
                    "role":   { "enum": ["dominant", "secondary", "accent", "neutral"] }
                  }
                }
              },
              "harmony": { "enum": ["mono", "analogous", "complementary", "split", "triadic", "tetradic", "none"] },
              "key": { "enum": ["high", "mid", "low"] },
              "luminance_hist": { "type": "array", "items": { "type": "number" }, "minItems": 16, "maxItems": 16 },
              "contrast_rms": { "type": "number" },
              "temperature_k": { "type": "number" },
              "wcag_pairs": { "type": "array", "items": { "type": "object" } }
            }
          },
          "motion": {
            "type": "object",
            "required": ["mode"],
            "properties": {
              "mode": { "enum": ["implied", "measured", "static"] },
              "vectors": { "type": "array", "items": { "type": "object" } },
              "rhythm_period_ms": { "type": ["number", "null"] },
              "cut_cadence_spm": { "type": ["number", "null"] },
              "camera_move": { "enum": ["static", "pan", "tilt", "dolly", "handheld", "zoom", "mixed", null] },
              "energy_curve": { "type": "array", "items": { "type": "number" } }
            }
          },
          "semantic": {
            "type": "object",
            "required": ["objects", "scene", "affect"],
            "properties": {
              "objects": { "type": "array", "items": { "$ref": "#/$defs/label_region" } },
              "scene":   { "$ref": "#/$defs/label" },
              "actions": { "type": "array", "items": { "$ref": "#/$defs/label" } },
              "symbols": { "type": "array", "items": { "$ref": "#/$defs/label_region" } },
              "materials": { "type": "array", "items": { "$ref": "#/$defs/label" } },
              "affect": {
                "type": "object",
                "required": ["valence", "arousal"],
                "properties": {
                  "valence": { "type": "number", "minimum": -1, "maximum": 1 },
                  "arousal": { "$ref": "#/$defs/unit" },
                  "confidence": { "$ref": "#/$defs/unit" }
                }
              },
              "style_cues": { "type": "array", "items": { "$ref": "#/$defs/label" } }
            }
          },
          "typography": {
            "type": "object",
            "properties": {
              "strings": { "type": "array", "items": { "type": "object" } },
              "type_classes": { "type": "array", "items": { "enum": ["serif", "grotesk", "humanist", "mono", "script", "display", "blackletter"] } },
              "text_image_ratio": { "$ref": "#/$defs/unit" }
            }
          }
        }
      }
    },
    "set_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["pattern_id", "dimension", "description", "support", "strength"],
        "properties": {
          "pattern_id": { "type": "string" },
          "dimension":  { "enum": ["composition", "color", "motion", "semantic", "typography", "cross"] },
          "kind":       { "enum": ["motif", "cluster", "archetype", "outlier", "contradiction", "gap"] },
          "description": { "type": "string", "maxLength": 400 },
          "support":    { "type": "array", "items": { "type": "string" }, "minItems": 2 },
          "counter_evidence": { "type": "array", "items": { "type": "string" } },
          "strength":   { "$ref": "#/$defs/unit" },
          "objective_links": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "quality": {
      "type": "object",
      "required": ["coverage", "mean_confidence", "warnings"],
      "properties": {
        "coverage": { "$ref": "#/$defs/unit" },
        "mean_confidence": { "$ref": "#/$defs/unit" },
        "warnings": { "type": "array", "items": { "type": "string" } }
      }
    }
  },
  "$defs": {
    "unit":  { "type": "number", "minimum": 0, "maximum": 1 },
    "point": { "type": "array", "items": { "type": "number", "minimum": 0, "maximum": 1 }, "minItems": 2, "maxItems": 2 },
    "polyline": { "type": "array", "items": { "$ref": "#/$defs/point" }, "minItems": 2 },
    "label": {
      "type": "object", "required": ["label", "confidence"],
      "properties": { "label": { "type": "string" }, "confidence": { "$ref": "#/$defs/unit" }, "vocab": { "type": "string" } }
    },
    "label_region": {
      "allOf": [ { "$ref": "#/$defs/label" } ],
      "properties": { "bbox": { "type": "array", "items": { "$ref": "#/$defs/unit" }, "minItems": 4, "maxItems": 4 } }
    }
  }
}
```

### 3.4 Consumers of Visual Intelligence

| Consumer | Fields consumed | Purpose |
|---|---|---|
| SYN-INT | `set_patterns`, `quality`, `semantic.affect` | Map patterns to objectives |
| SYN-DIV | `set_patterns[kind=contradiction|gap|outlier]` | Seed exploration axes from tension |
| G05 VIBE | `color`, `composition`, `typography`, `materials`, `style_cues` | Derive aesthetic tokens |
| G04 CUT | `motion`, `composition.focal_points`, keyframes, `own_material` assets | Edit decisions, reframing |
| G07 MUS | `motion.energy_curve`, `rhythm_period_ms`, `cut_cadence_spm`, `affect` | Tempo/dynamics mapping |
| G08 IMG | full palette, composition archetypes, `counter_ref` assets | Conditioning + negative guidance |
| G09 TXT | all, plus `typography.strings` | Visual-semiotic analysis |
| QG-COHERE | palette + affect | Detect token drift across artifacts |
| QG-NOVEL | `phash`, embeddings | Similarity vs references (anti-copy) |

---

## 4. The 10 Artifact Generator Specifications

**Common contract for all generators**

- **Input envelope:** `TaskEnvelope{ artifact_brief, framework_ref, upstream_refs[], constraints, feedback_delta?, budget }`
- **Output envelope:** `ArtifactEnvelope{ artifact_id, type, version, payload, evidence_refs[], self_assessment, open_issues[], cost }`
- **Hard rules:** cite `evidence_refs` for every design decision; never alter `ResearchContext`; report `open_issues` instead of guessing; respect `budget.max_items` and `budget.max_tokens`.
- **Self-assessment:** the generator scores itself against the brief's acceptance criteria. ORC logs the score but never uses it for gating; independent judges (QG-*) gate.

| ID | Tier | Upstream deps |
|---|---|---|
| G01 IDEA | A | Framework |
| G05 VIBE | A | Framework, VisualFindings |
| G09 TXT | A | Framework, VisualFindings, InsightGraph |
| G03 CONC | B | G01, G05 |
| G04 CUT | B | G05, VisualFindings, own_material |
| G06 CODE | B | G03 (if exists), G05 tokens |
| G07 MUS | B | G05, MotionFindings |
| G08 IMG | B | G05, VisualFindings |
| G02 PAT | C | G03, prior-art index |
| G10 STRAT | C | All Tier A + B |

---

### G01 — IDEAS

| Field | Spec |
|---|---|
| Input sources | `ConceptualFramework.territories`, `InsightGraph`, `ExplorationAxes`, `FeedbackDelta.ideas` |
| Processing instructions | 1) For each territory, generate candidate ideas spanning every axis pole. 2) Normalize each to one atomic proposition (single mechanism, single beneficiary). 3) Tag with axis coordinates. 4) Cluster; drop intra-cluster duplicates (cosine > `params.idea_dup`). 5) Rank by `objective_fit × novelty_estimate`. |
| Output format | `IdeaSet{ ideas[]: { idea_id, statement (≤40 words), mechanism, beneficiary, axis_coords, territory_id, objective_links[], evidence_refs[], assumptions[], risk_flags[] } }` |
| Quality gates | Schema valid · ≥1 idea per active territory · axis coverage ≥ 80% of poles · pairwise dup < threshold · each idea links ≥1 objective · rubric (clarity, novelty, fit, testability) mean ≥ 3.5/5 |

### G02 — PATENTS (Invention Disclosure Drafts)

| Field | Spec |
|---|---|
| Input sources | `ConceptSet` (technical concepts only), `ConceptualFramework.constraints`, prior-art index (patent DB + literature), `QG-NOVEL` history |
| Processing instructions | 1) Select concepts flagged `technical_mechanism=true`. 2) Decompose into problem, technical solution, embodiments, advantages. 3) Run prior-art query plan; record queries and top-k hits. 4) Draft claim *structures* (independent + dependent tree) as skeletons for counsel. 5) Mark every element `novel | known | uncertain` against hits. 6) Never state patentability conclusions. |
| Output format | `InventionDisclosure{ disclosure_id, title, field, background_problem, summary, embodiments[], figures_spec[], claim_tree{independent[], dependent[]}, prior_art{queries[], hits[{id, source, similarity, distinguishing_features}]}, element_novelty_map, inventorship_note, legal_review_required: true }` |
| Quality gates | `legal_review_required` must equal `true` · prior-art section non-empty with index version · every independent claim maps to ≥1 embodiment · max similarity to any hit < `params.patent_sim_max` else route to FBK · no confidential researcher data outside `confidentiality` scope · **H-gate mandatory before any external use** |

### G03 — CONCEPTS

| Field | Spec |
|---|---|
| Input sources | `IdeaSet` (top-k), `VibeFramework`, `ConceptualFramework.artifact_briefs.concept`, `ResearchContext.audience` |
| Processing instructions | 1) Merge compatible ideas into concept candidates (1–3 ideas each). 2) Specify value proposition, user/actor, mechanism, experience flow, aesthetic binding (vibe id), feasibility assumptions. 3) Define validation experiments. 4) Flag `technical_mechanism` for G02 and `software_surface` for G06. |
| Output format | `ConceptSet{ concepts[]: { concept_id, name, source_idea_ids[], value_prop, actors[], mechanism, experience_flow[], vibe_id, feasibility{assumptions[], risks[], dependencies[]}, validation_experiments[], flags{technical_mechanism, software_surface}, evidence_refs[] } }` |
| Quality gates | Each concept traces to ≥1 idea and 1 vibe · experiments falsifiable (metric + threshold) · rubric (coherence, desirability, feasibility, distinctiveness) ≥ 3.5 · QG-COHERE: no contradiction with framework constraints |

### G04 — CUTS (Visual Edits)

| Field | Spec |
|---|---|
| Input sources | `VibeFramework`, `VisualFindings` (motion, composition), keyframes, **only** `own_material` / licensed-for-edit assets, `artifact_briefs.cut` (target duration, aspect ratios, platforms) |
| Processing instructions | 1) Build shot inventory from keyframes. 2) Select and order shots against the vibe's rhythm tokens and the brief's narrative arc. 3) Specify reframes (crop windows from focal points), transitions, speed ramps, grade (LUT parameters from vibe palette). 4) Emit a non-destructive edit decision list; rendering is a downstream tool step. 5) Produce one variant per requested aspect ratio. |
| Output format | `CutSpec{ cut_id, vibe_id, otio_timeline (OpenTimelineIO JSON) | cmx3600_edl, aspect_ratio, duration_ms, shots[{asset_id, in_ms, out_ms, crop_window, speed, transition_out}], grade{lut_params}, audio_ref?, render_job? }` |
| Quality gates | OTIO validates · all asset_ids ∈ cleared edit set · duration within ±3% of brief · cadence (shots/min) within vibe tolerance · focal points stay inside safe area for every aspect · rendered proxy passes black-frame/flash check (photosensitivity) |

### G05 — VIBES (Aesthetic Frameworks)

| Field | Spec |
|---|---|
| Input sources | `VisualFindings` (palette clusters, composition archetypes, typography, materials, affect), `ConceptualFramework.territories`, `ResearchContext.brand_constraints?` |
| Processing instructions | 1) Derive 1 vibe per territory (or `params.vibe_count`). 2) Encode as design tokens: color (OKLCH roles), type scale, spacing, radius, texture, motion curves, sound-color mapping hints, composition rules. 3) Specify do/don't rules as testable predicates. 4) Bind every token to evidence assets. 5) Emit both human-readable and W3C Design Tokens JSON. |
| Output format | `VibeFramework{ vibe_id, name, territory_id, affect_target{valence, arousal}, tokens (W3C DTCG JSON), composition_rules[], motion_rules{easing, duration_ranges, rhythm_period_ms}, audio_hints{tempo_range, timbre_classes, dynamics}, predicates{must[], must_not[]}, evidence_refs[] }` |
| Quality gates | DTCG schema valid · color tokens pass WCAG AA for declared text pairs · every token cites ≥1 asset · vibes pairwise distinct (palette ΔE₀₀ centroid > `params.vibe_delta_min`) · predicates machine-checkable |

### G06 — CODE

| Field | Spec |
|---|---|
| Input sources | `ConceptSet[flags.software_surface]`, `VibeFramework.tokens`, `artifact_briefs.code` (language, runtime, repo target, license), existing repo context if provided |
| Processing instructions | 1) Produce an implementation plan (modules, interfaces). 2) Generate code + tests + README. 3) Consume design tokens via generated theme file, never hard-coded values. 4) Run in sandbox: install, lint, typecheck, test. 5) Return patch or package, plus execution log. No network calls or secrets in output. |
| Output format | `CodePackage{ package_id, concept_id, language, files[{path, content_hash}], patch (unified diff) | archive_ref, tests[], run_log{install, lint, typecheck, test: {exit_code, summary}}, deps[{name, version, license}], sbom_ref }` |
| Quality gates | All run_log exit codes = 0 · coverage ≥ `params.min_test_coverage` · dependency licenses ∈ allowlist · SAST/secret scan clean · tokens imported not inlined · reproducible: second sandbox run identical hashes |

### G07 — MUSIC

| Field | Spec |
|---|---|
| Input sources | `VibeFramework.audio_hints`, `MotionFindings.energy_curve`, `rhythm_period_ms`, `CutSpec` (if sync required), `artifact_briefs.music` (duration, use, stems) |
| Processing instructions | 1) Map energy curve to section form and dynamics. 2) Map rhythm period / cut cadence to tempo and meter. 3) Map affect (valence/arousal) to mode, harmonic tension, register. 4) Emit symbolic score (MIDI + MusicXML) and an audio-render request spec for an audio model/DAW. 5) If synced to a cut, align hit points to cut boundaries. 6) No imitation of named living artists; no reference-track melodic reuse. |
| Output format | `MusicPackage{ music_id, vibe_id, tempo_bpm, meter, key_mode, form[{section, start_bar, bars, energy}], midi_ref, musicxml_ref, stems_spec[], render_request{engine, params}, sync_points[{ms, cut_id, shot_index}], audio_ref? }` |
| Quality gates | MIDI parses · duration ±1 bar of brief · sync points within ±40 ms · loudness target (e.g. −14 LUFS integrated) on render · melodic similarity vs reference/known corpus < `params.melody_sim_max` · no clipping |

### G08 — IMAGES

| Field | Spec |
|---|---|
| Input sources | `VibeFramework`, `VisualFindings` (archetypes, palette, `counter_ref` for negative guidance), `ConceptSet` (if illustrating concepts), `artifact_briefs.image` (count, sizes, uses) |
| Processing instructions | 1) Build structured generation specs (subject, composition archetype, palette tokens, lighting, lens, material, negative constraints). 2) Call image model(s) with seeds recorded. 3) Run post-checks: palette ΔE vs tokens, composition match, safety classifier, similarity vs references. 4) Return best-k per spec with full reproducibility metadata. Do not reproduce reference images or identifiable real people. |
| Output format | `ImagePackage{ images[{image_id, spec_id, file_ref, model, model_version, seed, prompt_struct, conditioning_refs[], dims, palette_delta_e, composition_score, ref_similarity, safety}] }` |
| Quality gates | Safety pass · max `ref_similarity` (pHash + embedding) < `params.img_sim_max` · mean palette ΔE₀₀ to tokens < `params.palette_de_max` · resolution ≥ brief · C2PA/provenance metadata attached |

### G09 — TEXT ANALYSES

| Field | Spec |
|---|---|
| Input sources | `VisualFindings`, `InsightGraph`, `ResearchContext.sources` (papers, notes, transcripts), `artifact_briefs.text` (analysis lenses, length, audience) |
| Processing instructions | 1) Apply each requested analytical lens (e.g. semiotic, thematic, comparative, discourse) as a separate pass. 2) Every claim cites a source span or visual finding id. 3) Separate observation / interpretation / speculation explicitly. 4) Record counter-readings. 5) Flag gaps where evidence is insufficient. |
| Output format | `TextAnalysis{ analysis_id, lens, scope, sections[{heading, claims[{text, type: observation|interpretation|speculation, evidence_refs[], confidence}]}], counter_readings[], gaps[], bibliography[] }` |
| Quality gates | 100% claims have evidence_refs · citation spans resolve · speculation ≤ `params.spec_ratio_max` of claims · QG-RUBRIC (rigor, clarity, originality, balance) ≥ 3.5 · hallucinated citation check = 0 |

### G10 — STRATEGIC INSIGHTS

| Field | Spec |
|---|---|
| Input sources | All Tier A + B artifacts of current iteration, `InsightGraph`, `ResearchContext.objectives` and `decision_context`, `IterationHistory` |
| Processing instructions | 1) Synthesize across artifact types — not within one. 2) For each objective: findings, implications, options, trade-offs, risks, leading indicators. 3) Rank options by researcher-defined criteria weights. 4) State confidence and what evidence would change the recommendation. 5) List decisions only the researcher can make. |
| Output format | `StrategicInsightSet{ insights[{insight_id, objective_id, finding, implication, options[{option, pros[], cons[], cost_class, risk_class}], recommendation, confidence, change_conditions[], supporting_artifacts[]}], decisions_for_researcher[], watchlist_indicators[] }` |
| Quality gates | Each insight cites ≥2 artifacts of ≥2 different types · every objective covered or explicitly `insufficient_evidence` · criteria weights match `ResearchContext` exactly · no recommendation without change_conditions |

---

## 5. Data Flow Logic

### 5.1 Main Loop (Pseudocode)

```text
PROCEDURE run_system(researcher_brief, image_set, params):

  # ── L0 INTAKE ─────────────────────────────────────────────
  ctx        ← RIA.parse(researcher_brief)                         # ResearchContext
  ctx.open_questions ≠ ∅ → GATE H0(ctx)  (researcher answers / approves)
  cleared    ← RIG.clear(image_set, ctx.rights_policy)
  history    ← ∅
  delta      ← NULL                                                 # FeedbackDelta

  LOOP iteration = 1 TO params.max_iterations:

    # ── STAGE 1: VISUAL ANALYSIS (parallel fan-out) ─────────
    IF iteration = 1 OR delta.reenter_layer ≤ L1:
        assets ← VIS-ING.normalize(cleared, scope = delta?.l1_scope)
        PARALLEL FOR a IN assets:
            f[a] ← { VIS-COMP(a), VIS-COLOR(a), VIS-MOTION(a),
                     VIS-SEM(a), VIS-TEXT(a) }                      # each validated by QG-SCHEMA
        findings ← VIS-FUSE.merge(f, ctx)                           # VisualFindings
        IF findings.quality.coverage < params.min_coverage:
            ESCALATE("insufficient visual coverage", findings.quality)
        OPTIONAL GATE H1(findings)

    # ── STAGE 2: SYNTHESIS (sequential + critique loop) ─────
    IF iteration = 1 OR delta.reenter_layer ≤ L2:
        graph ← SYN-INT.integrate(findings, ctx, delta?.l2)
        axes  ← SYN-DIV.diverge(graph, ctx, history)
        REPEAT up to params.crit_rounds:
            crit ← SYN-CRIT.review(axes, ctx, history)
            BREAK IF crit.all_keep
            axes ← SYN-DIV.revise(axes, crit)
        framework ← SYN-FRAME.compile(graph, axes, ctx)            # incl. 10 ArtifactBriefs
        GATE H2(framework)        # mandatory on iteration 1 and whenever reenter_layer ≤ L2

    # ── STAGE 3: 10 GENERATORS (3-tier DAG) ─────────────────
    targets ← (iteration = 1) ? ALL_ENABLED : delta.regen_set
    FOR tier IN [A, B, C]:
        PARALLEL FOR g IN generators(tier) ∩ targets:
            env ← build_task(g, framework, upstream(g), ctx.constraints,
                             delta?.for(g), params.budget[g])
            out[g] ← g.create(env)
            v ← QG-SCHEMA.validate(out[g])
            WHILE NOT v.pass AND retries(g) < params.schema_retries:
                out[g] ← g.repair(out[g], v.violations)
                v ← QG-SCHEMA.validate(out[g])
            IF NOT v.pass: mark_failed(g); block dependents(g)
        carry_forward(unchanged artifacts from history, versions pinned)

    # ── STAGE 4: QUALITY CHECK → FEEDBACK OR FINALIZE ───────
    scores    ← PARALLEL QG-RUBRIC.score(a) FOR a IN out
    coherence ← QG-COHERE.check(out, framework)
    novelty   ← QG-NOVEL.check(out, history, external_indices)
    bundle, metrics ← AGG.assemble(out, scores, coherence, novelty, iteration)
    history.append(bundle)

    delta ← FBK.plan(metrics, scores, coherence, novelty, ctx.loop_policy, history)

    SWITCH delta.decision:
        CASE "converged":  GOTO FINALIZE
        CASE "escalate":   decision ← GATE Hx(delta.escalation)   # researcher decides
                           APPLY decision TO ctx / delta
        CASE "continue":   CONTINUE
  END LOOP
  # max_iterations reached without convergence → escalate with best bundle

  FINALIZE:
    GATE H3(bundle)                                  # release approval
    RETURN bundle (immutable, signed, with full ledger)
```

### 5.2 `ResearchContext` (L0 output)

```json
{
  "run_id": "string",
  "objectives": [{ "objective_id": "O1", "statement": "string", "success_metric": "string", "weight": 0.0 }],
  "research_questions": [{ "rq_id": "string", "text": "string", "objective_links": ["O1"] }],
  "audience": { "segments": ["string"], "context": "string" },
  "constraints": {
    "hard": [{ "id": "C1", "rule": "string", "check": "predicate|human" }],
    "soft": [{ "id": "S1", "rule": "string", "weight": 0.0 }]
  },
  "enabled_artifacts": ["idea","patent","concept","cut","vibe","code","music","image","text","strategy"],
  "artifact_overrides": { "<type>": { "count": 0, "format": "string", "notes": "string" } },
  "decision_context": { "criteria": [{ "name": "string", "weight": 0.0 }], "horizon": "string" },
  "sources": [{ "source_id": "string", "type": "paper|note|dataset|transcript|url", "ref": "string" }],
  "rights_policy": { "allow_fair_use": false, "pii_mode": "blur|consent_only|exclude" },
  "confidentiality": "public|internal|restricted",
  "loop_policy": { "max_iterations": 0, "convergence": {}, "budget_usd": 0, "auto_continue": true },
  "open_questions": ["string"]
}
```

### 5.3 `ConceptualFramework` (L2 output)

```json
{
  "framework_id": "string", "iteration": 1,
  "thesis": "string (≤ 120 words, the organizing proposition)",
  "territories": [{ "territory_id": "T1", "name": "string", "axis_coords": {}, "objective_links": [], "evidence_refs": [] }],
  "exploration_axes": [{ "axis_id": "string", "pole_a": "string", "pole_b": "string", "rationale": "string" }],
  "design_tokens_seed": { "palette_clusters": [], "composition_archetypes": [], "motion_profile": {} },
  "constraints_applied": ["C1", "S1"],
  "killed_directions": [{ "axis_id": "string", "reason": "string", "constraint_ref": "string" }],
  "artifact_briefs": {
    "<type>": {
      "enabled": true, "count": 0, "territories": ["T1"],
      "goal": "string", "acceptance_criteria": [{ "id": "AC1", "test": "string", "threshold": "string" }],
      "format": "string", "budget": { "max_tokens": 0, "max_items": 0, "max_usd": 0 }
    }
  }
}
```

### 5.4 Envelopes

```jsonc
// TaskEnvelope (ORC → agent)
{ "task_id": "uuid", "run_id": "string", "iteration": 1, "agent_id": "G03",
  "schema_out": "urn:moas:schema:concept_set:1.0",
  "inputs": { "framework_ref": "uri", "upstream_refs": ["uri"], "context_ref": "uri" },
  "brief": { "...": "ArtifactBrief" }, "feedback": { "...": "FeedbackDelta slice | null" },
  "budget": { "max_tokens": 0, "max_items": 0, "deadline_s": 0 },
  "idempotency_key": "hash(inputs, agent_version, brief)" }

// ArtifactEnvelope (agent → ORC)
{ "task_id": "uuid", "agent_id": "G03", "agent_version": "semver",
  "status": "ok|partial|failed|needs_input",
  "payload": { }, "evidence_refs": ["uri#fragment"],
  "self_assessment": [{ "criterion_id": "AC1", "met": true, "note": "string" }],
  "open_issues": [{ "severity": "low|med|high", "text": "string" }],
  "cost": { "tokens_in": 0, "tokens_out": 0, "usd": 0, "wall_s": 0 } }
```

### 5.5 Dependency Resolution Rules

| Rule | Behavior |
|---|---|
| R1 | A generator runs only when every declared upstream artifact is `status=ok` and schema-valid in **this** iteration or carried forward with pinned version. |
| R2 | If an upstream artifact is regenerated, all transitive dependents are marked `stale` and added to `regen_set`. |
| R3 | `partial` upstream allowed only if the brief declares `accept_partial_upstream=true`. |
| R4 | A failed generator does not block siblings; dependents receive `blocked` status and are reported, not skipped silently. |
| R5 | Same `idempotency_key` → cached result returned; no re-execution. |

### 5.6 `OutputBundle`

```json
{ "bundle_id": "string", "run_id": "string", "iteration": 0,
  "framework_ref": "uri", "visual_findings_ref": "uri",
  "artifacts": [{ "artifact_id": "string", "type": "string", "version": "string",
                  "status": "accepted|accepted_with_issues|rejected|blocked",
                  "rubric": {}, "novelty": {}, "trace": ["brief clause → finding → framework → artifact"] }],
  "metrics": { "quality_index": 0, "coverage": 0, "coherence": 0, "novelty": 0, "cost_usd": 0, "delta_vs_prev": {} },
  "ledger_ref": "uri", "signature": "string" }
```

---

## 6. Feedback Loop Definition

### 6.1 How Outputs Feed Back as Inputs

| Output (iteration *n*) | Becomes input to (iteration *n+1*) | Channel |
|---|---|---|
| `RubricScore` < threshold | Same generator | `FeedbackDelta.for(g).defects[]` with criterion + evidence |
| `CoherenceReport.conflicts` | Lower-ranked artifact of the pair (by researcher priority), or SYN-FRAME if the conflict is in the framework | `regen_set` or `reenter_layer = L2` |
| `NoveltyReport` (too similar to history) | Generator + SYN-DIV (to open new axis) | `delta.exploration_pressure += k` |
| `NoveltyReport` (too similar to external ref/prior art) | Generator with `must_not` constraint referencing neighbor ids | hard constraint injection |
| `open_issues[severity=high]` from any agent | ORC → FBK → owning layer or researcher | escalation |
| `StrategicInsightSet.decisions_for_researcher` | Researcher | Gate Hx |
| `VisualFindings.quality.warnings` (gaps) | Researcher (request more refs) or VIS-* re-run with altered params | `reenter_layer = L1` |
| Accepted artifacts | Carried forward as pinned upstream; added to `IterationHistory` for dedupe | history store |

### 6.2 `FeedbackDelta` Schema

```json
{ "delta_id": "string", "from_iteration": 0,
  "decision": "continue|converged|escalate",
  "reenter_layer": "L1|L2|L3",
  "regen_set": ["G03", "G02"],
  "l1_scope": { "assets": ["id"], "extractors": ["VIS-COLOR"], "param_overrides": {} },
  "l2": { "add_axes_hint": "string", "drop_axes": ["id"], "reweight_objectives": {} },
  "per_generator": {
    "G03": { "defects": [{ "criterion_id": "string", "observed": "string", "required": "string", "evidence_refs": [] }],
             "keep": ["artifact_id"], "must_not": ["string"], "exploration_pressure": 0.0 } },
  "escalation": { "reason": "string", "options": ["string"], "default_if_no_answer": "string" },
  "acceptance_for_next": [{ "artifact_type": "string", "criterion_id": "string", "threshold": 0 }] }
```

### 6.3 Quality Gates and Refinement Triggers

| Trigger | Condition | Action |
|---|---|---|
| T1 Schema failure | QG-SCHEMA fail after `schema_retries` | Mark failed; block dependents; include in delta |
| T2 Rubric low | any criterion < 2 **or** mean < `params.rubric_min` (default 3.5) | Regenerate that generator with defects |
| T3 Coherence conflict | conflict severity ≥ med | Regenerate lower-priority artifact; if ≥3 conflicts share a framework clause → `reenter_layer=L2` |
| T4 Novelty collapse | mean pairwise similarity vs history > `params.history_sim_max` | Increase exploration pressure; SYN-DIV adds ≥1 new axis |
| T5 External similarity | similarity to prior art / reference > type threshold | Hard `must_not`; if repeated twice → escalate |
| T6 Coverage gap | objective with zero accepted artifacts | Route to SYN-FRAME (brief rebalance) |
| T7 Visual insufficiency | `coverage < min_coverage` or mean conf < 0.5 | Escalate: request references or accept reduced confidence |
| T8 Budget | spend ≥ 80% of `budget_usd` | Escalate with best bundle + projected cost to converge |
| T9 Stagnation | `quality_index` gain < `params.min_gain` for 2 iterations | Escalate: converge as-is, reframe (L2), or stop |
| T10 Safety/rights | any safety or rights violation | Hard stop for that artifact; immediate escalation; never auto-retry |

**Convergence condition** (all must hold):

```text
converged ⇔  ∀ enabled type t: accepted_count(t) ≥ brief.count(t)
          ∧  quality_index ≥ params.q_target
          ∧  coherence ≥ params.coh_target
          ∧  no open high-severity issues
          ∧  no pending researcher decisions
quality_index = Σ_t w_t · mean_rubric(t) / 5          (w_t from ctx, default uniform)
```

### 6.4 Researcher Intervention Points

| Gate | When | Mandatory | Researcher can | Default on timeout |
|---|---|---|---|---|
| **H0** Brief lock | After RIA, if `open_questions ≠ ∅` | Yes | Answer, edit objectives/constraints, disable artifact types | Block (no run) |
| **H1** Visual review | After VIS-FUSE | Optional (`loop_policy.h1`) | Add/remove refs, re-weight assets, veto patterns | Continue |
| **H2** Framework lock | Iteration 1 and any `reenter_layer ≤ L2` | Yes | Approve, edit thesis/territories, kill/keep axes, edit briefs | Block |
| **Hx** Escalation | T5, T7–T10, `decisions_for_researcher` | Yes | Choose option, adjust params/budget, stop | Apply `default_if_no_answer` only if it is non-destructive, else block |
| **H3** Release | Before finalize | Yes | Accept/reject per artifact, request one more iteration | Block |
| **Anytime** Interrupt | Any time | — | Pause, inject note into `FeedbackDelta`, change priority | — |

Researcher edits are written to the ledger as `GateDecision{gate, actor, diff, rationale, timestamp}` and **always override** agent outputs.

---

## 7. Integration Instructions

### 7.1 Universal Prompt Skeleton

Every agent prompt is assembled by ORC from this skeleton. `{{…}}` slots are filled programmatically. Nothing outside the slots varies per call.

```text
SYSTEM:
You are {{AGENT_ID}} — {{AGENT_ROLE_NAME}} in a multi-agent research system.
Your single responsibility: {{RESPONSIBILITY}}.
You do NOT: {{OUT_OF_SCOPE}}.

OPERATING RULES
1. Use only the inputs provided below. Do not invent sources, assets, data, or citations.
2. Every claim or design decision must reference evidence via `evidence_refs`
   using ids that exist in the inputs.
3. If inputs are insufficient or contradictory, do not guess: record it in
   `open_issues` with severity and continue with what is supported.
4. Respect all HARD constraints absolutely. Treat SOFT constraints as weighted preferences.
5. Do not modify research objectives, constraints, or parameters.
6. Return exactly one JSON object that validates against OUTPUT_SCHEMA.
   No prose outside the JSON. No markdown fences.
7. Stay within BUDGET. If you must truncate, set status="partial" and explain in open_issues.

USER:
<task id="{{TASK_ID}}" run="{{RUN_ID}}" iteration="{{ITERATION}}">
<research_context>{{RESEARCH_CONTEXT_SLICE}}</research_context>
<inputs>{{UPSTREAM_PAYLOADS_OR_REFS}}</inputs>
<brief>{{ARTIFACT_BRIEF_OR_STAGE_INSTRUCTIONS}}</brief>
<feedback>{{FEEDBACK_DELTA_SLICE_OR_NONE}}</feedback>
<procedure>{{AGENT_PROCEDURE}}</procedure>
<acceptance_criteria>{{ACCEPTANCE_CRITERIA}}</acceptance_criteria>
<budget>{{BUDGET}}</budget>
<output_schema>{{OUTPUT_SCHEMA_JSON}}</output_schema>
</task>
```

### 7.2 Per-Agent Slot Values

Slots `RESPONSIBILITY`, `OUT_OF_SCOPE`, and `AGENT_PROCEDURE` per agent. `AGENT_PROCEDURE` for G01–G10 equals the "Processing instructions" in §4, verbatim, numbered.

| Agent | RESPONSIBILITY | OUT_OF_SCOPE | AGENT_PROCEDURE (summary; full text in registry) |
|---|---|---|---|
| RIA | convert the researcher brief into a structured ResearchContext | answering research questions; adding objectives the researcher did not state | Extract objectives → attach measurable metric or flag → classify constraints hard/soft → list ambiguities as open_questions |
| RIG | decide whether each reference item may enter analysis and under what conditions | judging aesthetic value; analyzing content | Check license field → detect PII → assign status → blur/exclude per policy → report |
| VIS-ING | normalize and index visual assets for analysis | interpreting content | Decode → color-convert → keyframe → pHash → dedupe → manifest |
| VIS-COMP | measure compositional structure of one asset | color, semantics, interpretation of meaning | Detect grid → focal points → weight map → lines → depth → balance |
| VIS-COLOR | measure color and tonal properties of one asset | composition, semantics | Quantize palette (k=8, OKLCH) → harmony → luminance → contrast → temperature |
| VIS-MOTION | measure implied or actual motion of one asset | narrative interpretation | Classify static/implied/measured → vectors/flow → rhythm → cadence → energy curve |
| VIS-SEM | identify depicted content and affect of one asset | identifying real persons; inferring sensitive attributes | Objects → scene → actions → symbols → materials → affect → style cues, each with confidence + region |
| VIS-TEXT | extract and classify text present in one asset | font identification without verification | OCR → confidence → type class → layout ratio |
| VIS-FUSE | find cross-asset patterns, contradictions and gaps | creating concepts or recommendations | Cluster per dimension → motifs/archetypes/outliers → contradictions → gaps vs objectives |
| SYN-INT | link visual patterns to research objectives in an insight graph | generating ideas or artifacts | Map patterns → insights → edges (supports/contradicts/extends) → uncovered objectives |
| SYN-DIV | propose orthogonal exploration axes | producing artifacts; evaluating feasibility | Derive axes from tensions/gaps → define poles → rationale → check overlap |
| SYN-CRIT | test axes against constraints, ethics, feasibility and history | proposing replacements beyond a one-line hint | For each axis: keep/modify/kill + cited constraint |
| SYN-FRAME | compile the ConceptualFramework and the 10 artifact briefs | producing artifact content | Thesis → territories → token seed → briefs with acceptance criteria and budgets |
| G01–G10 | produce `{{TYPE}}` artifacts that satisfy the artifact brief | other artifact types; changing the framework | §4 processing instructions for that type |
| QG-RUBRIC | score one artifact against its brief and rubric | rewriting or improving the artifact | Score each criterion 0–5 → cite evidence → list concrete defects |
| QG-COHERE | detect conflicts between artifacts and the framework | scoring individual quality | Pairwise check vs framework predicates and tokens → conflicts list |
| QG-NOVEL | measure similarity to history and external references | judging quality | Embed → nearest neighbors per index → scores + index versions |
| FBK | turn quality reports into a routed FeedbackDelta | generating content; overriding researcher decisions | Classify defects → owning layer → regen_set → decision per §6.3 |

### 7.3 Judge Prompt Template (QG-RUBRIC)

```text
SYSTEM:
You are QG-RUBRIC, an independent evaluator. You did not create this artifact.
Score strictly against the rubric. Do not reward length or confident tone.
Do not rewrite the artifact. Return only JSON matching OUTPUT_SCHEMA.

USER:
<artifact type="{{TYPE}}" id="{{ARTIFACT_ID}}">{{PAYLOAD}}</artifact>
<brief>{{ARTIFACT_BRIEF}}</brief>
<rubric>
{{#each CRITERIA}}
- {{id}}: {{definition}}
  0 = {{anchor_0}} | 3 = {{anchor_3}} | 5 = {{anchor_5}}
{{/each}}
</rubric>
<output_schema>
{ "artifact_id": "string",
  "scores": [{ "criterion_id": "string", "score": 0, "rationale": "≤60 words",
               "evidence_refs": ["string"], "defects": ["string"] }],
  "blocking": false }
</output_schema>
```

Rubric criteria per type (anchors live in the rubric registry, versioned):

| Type | Criteria |
|---|---|
| idea | clarity, novelty, objective_fit, testability |
| patent | technical_specificity, claim_support, prior_art_distinction, completeness |
| concept | coherence, desirability, feasibility, distinctiveness |
| cut | rhythm_fit, narrative_arc, framing_quality, vibe_fidelity |
| vibe | internal_consistency, evidence_grounding, distinctiveness, operability |
| code | correctness, readability, token_usage, test_quality |
| music | affect_fit, structure, sync_accuracy, originality |
| image | vibe_fidelity, composition, craft, originality |
| text | rigor, clarity, originality, balance |
| strategy | evidence_breadth, decision_usefulness, risk_honesty, actionability |

### 7.4 Expected Response Formats

| Producer | Format | Transport |
|---|---|---|
| All LLM agents | Single JSON object, UTF-8, no fences, validates against `schema_out` | Message body |
| Binary outputs (images, audio, renders, archives) | Content-addressed file (`sha256`) in artifact store; JSON holds `file_ref = store://sha256/<hash>` | Object store |
| Code | Unified diff or archive ref + `run_log` | Object store + JSON |
| Timelines | OpenTimelineIO JSON (preferred) or CMX3600 EDL | JSON / file ref |
| Scores | MIDI 1.0 + MusicXML 4.0 | File refs |
| Design tokens | W3C Design Tokens (DTCG) JSON | Inline JSON |

### 7.5 Validation Rules (QG-SCHEMA + ORC)

| # | Rule | On violation |
|---|---|---|
| V1 | Output parses as JSON and validates against `schema_out` (exact version) | Repair loop (max `schema_retries`, default 2) with violations listed |
| V2 | Every `evidence_refs` id resolves to an existing input object/region | Reject; repair with list of dangling refs |
| V3 | `task_id`, `run_id`, `iteration`, `agent_id` echo the envelope | Reject (possible cross-talk) |
| V4 | Numeric ranges (units, weights sum, confidences) within schema bounds | Repair |
| V5 | Counts within `budget.max_items`; `status=partial` iff truncated | Repair |
| V6 | No hard-constraint predicate fails (`ctx.constraints.hard[check=predicate]`) | Reject; route to FBK |
| V7 | File refs exist, hash matches, MIME type matches declared format | Reject |
| V8 | Rights: every asset referenced in G04/G08 conditioning ∈ cleared set with sufficient license | Hard stop (T10) |
| V9 | Safety classifiers pass for text, image, audio outputs | Hard stop (T10) |
| V10 | Patent drafts: `legal_review_required == true`, prior_art non-empty | Reject |
| V11 | Code: run_log exit codes all 0, license allowlist, secret scan clean | Reject; repair with log |
| V12 | Judge independence: `QG-RUBRIC.model_instance ≠ generator.model_instance` | ORC re-dispatches to another judge |

### 7.6 Orchestrator Implementation Notes

| Concern | Specification |
|---|---|
| State machine | States per task: `queued → running → validating → (repairing) → done / failed / blocked`. Per iteration: `L0 … L4 → decided`. Persist after every transition. |
| Concurrency | Per-layer worker pools; L1 parallel by asset × extractor; L3 parallel within tier. Back-pressure via `params.max_inflight`. |
| Idempotency | `idempotency_key = sha256(agent_version ‖ schema_out ‖ canonical(inputs) ‖ brief)`. |
| Versioning | Agents, schemas, rubrics, and prompts each carry semver; recorded on every envelope. A change in any one invalidates the cache for that agent. |
| Ledger | Append-only event log: task dispatch, outputs (by hash), validations, scores, gate decisions, costs. Sufficient to replay any iteration. |
| Model routing | Vision-capable model for L1; strongest reasoning model for L2, G02, G10, judges; specialized models (image, audio) behind G07/G08 tool calls. Judges use a different instance or model from generators. |
| Failure policy | Transient errors: retry with exponential backoff (2, 4, 8 s). Schema errors: repair loop. Persistent: mark failed, block dependents, report. |
| Observability | Per-agent latency, cost, pass rate, repair rate, rubric distribution; alert when repair rate > 20% (prompt/schema drift). |
| Security | Agents receive only the context slice they need (least privilege). `confidentiality=restricted` → no external indices, no third-party model endpoints not cleared by researcher. |

---

### Appendix A — Parameter Registry (defaults)

| Param | Default | Used by |
|---|---|---|
| `max_iterations` | 5 | ORC |
| `max_refs` | 60 | ORC / VIS-ING |
| `kf_rate` | 2 fps | VIS-ING |
| `min_coverage` | 0.8 | VIS-FUSE / T7 |
| `min_axes` / `axis_overlap_max` | 4 / 0.6 | SYN-DIV |
| `crit_rounds` | 2 | SYN-CRIT |
| `schema_retries` | 2 | QG-SCHEMA |
| `rubric_min` | 3.5 | T2 |
| `q_target` / `coh_target` | 0.8 / 0.85 | Convergence |
| `min_gain` | 0.02 | T9 |
| `idea_dup` | 0.88 cosine | G01 |
| `patent_sim_max` | 0.85 | G02 |
| `vibe_delta_min` | ΔE₀₀ 15 | G05 |
| `min_test_coverage` | 0.7 | G06 |
| `melody_sim_max` | 0.6 | G07 |
| `img_sim_max` / `palette_de_max` | 0.85 / 10 | G08 |
| `spec_ratio_max` | 0.25 | G09 |
| `history_sim_max` | 0.8 | T4 |
