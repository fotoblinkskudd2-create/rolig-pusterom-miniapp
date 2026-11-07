# Prediction Machine: design, tooling, and starter code

A Java system that turns measurable question-data into **calibrated probabilities with uncertainty bands**.
It is an estimator, not an oracle. Every output is a probability with a band, versioned, and scored after
the fact with proper scoring rules.

> **Version note.** Library versions below are what I know of at my knowledge cutoff. Check the current
> release on Maven Central or the project site before pinning. Anything marked **⚠ VERIFY** is a legal,
> regulatory, or ToS claim that must be checked before you rely on it.

---

## 0. Scope

| In scope | Out of scope |
|---|---|
| Probabilities for binary, resolvable events | Autonomous trading or order placement |
| Calibration, scoring, walk-forward backtests | "Guaranteed" or "sure" forecasts |
| Auditable, versioned forecasts with bands | Personalised investment advice |
| Domains: prediction markets, equities, commodities, politics | Real-money participation in any market |

---

## 1. Architecture

### 1.1 Components

```
 ┌───────────────────┐  Tick / Event      ┌──────────────────────┐  Observation      ┌────────────────────┐
 │ Data sources      │ ─────────────────▶ │ 1. Ingestion         │ ────────────────▶ │ 2. Feature         │
 │ venues, polls,    │  (DataConnector)   │  validate, de-dup,   │  (point-in-time)  │    pipeline        │
 │ filings, news,    │                    │  availableAt stamp   │                   │  FeatureBuilder    │
 │ LLM extractions   │                    └──────────────────────┘                   └─────────┬──────────┘
 └───────────────────┘                                                                         │ x_t (known at t)
                                                                                              ▼
 ┌──────────────────────────┐   raw p_t    ┌──────────────────────┐   p_cal_t   ┌────────────────────────────┐
 │ 3. Model layer           │ ───────────▶ │ 4. Calibration       │ ──────────▶ │ 5. Prediction service      │
 │ logistic, GBDT, DL TS,   │              │  Platt / isotonic    │             │  Forecast: p, band,        │
 │ ensembles (ProbabilisticClassifier)     │  fit on calib slice  │             │  confidenceLevel, version  │
 └──────────▲───────────────┘              └──────────▲───────────┘             └──────────────┬─────────────┘
            │ fit on fit slice                        │ fit on calib slice                    │ JSON / dashboard
 ┌──────────┴─────────────────────────────────────────┴───────────────────────────┐           ▼
 │ 6. Backtesting & evaluation: walk-forward, embargo, Brier, log loss,           │   ┌─────────────────────┐
 │    reliability, ECE, skill score, block bootstrap                              │   │ 7. Monitoring       │
 └──────────────────────────────────────────┬─────────────────────────────────────┘   │ drift, calibration  │
                                            │ metrics, configs, model artifacts       │ drift, feed health  │
 ┌──────────────────────────────────────────▼─────────────────────────────────────┐   └─────────────────────┘
 │ 8. Experiment tracking & model registry (every run, config, data hash, score)   │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Two paths, one set of rules

- **Training path (offline):** ingest history → features → split by time → fit model on *fit* slice → fit
  calibrator on *calibration* slice → score on *test* slice → log everything.
- **Serving path (online):** ingest latest data → same feature code → model → same calibrator → band → `Forecast`
  with a model version. The feature code must be literally shared between paths. Two implementations drift apart
  and produce silent train/serve skew.

### 1.3 Time discipline (the rule everything else depends on)

```
 time ─────────────────────────────────────────────────────────────────────────────▶
 │◀──────── fit slice (60%) ────────▶│gap│◀─── calibration (20%) ───▶│gap│◀── test (20%) ──▶│
                                    embargo = label horizon (1 step)            (never touched
                                                                                 until final scoring)
```

Walk-forward (section 4) repeats this with an expanding window and rolling test blocks.

### 1.4 Code layout (matches `src/main/java/com/example/predictionmachine/`)

| Package | Responsibility | Key types |
|---|---|---|
| `core` | Domain records and invariants | `Tick`, `Observation`, `Forecast` |
| `data` | Ingestion contract and sources | `DataConnector`, `CsvTickConnector`, `SyntheticTickGenerator` |
| `features` | Point-in-time feature construction | `FeatureBuilder` |
| `model` | Probabilistic classifiers | `ProbabilisticClassifier`, `LogisticRegression` |
| `calibration` | Raw → calibrated probability; bands | `Calibrator`, `PlattCalibrator`, `BinnedIntervalEstimator` |
| `evaluation` | Scoring and backtests | `Metrics`, `ReliabilityDiagram`, `WalkForwardBacktester` |
| `service` | Serving pipeline | `ForecastService` |
| (root) | End-to-end demo | `App` |

---

## 2. AI/ML capability taxonomy and tooling

### 2.1 Capability slots

| # | Slot | What it must do |
|---|---|---|
| C1 | Ingestion and scheduling | Pull data on schedule, validate, store with `availableAt` |
| C2 | Feature store | Versioned features; point-in-time joins for training |
| C3 | Classical ML | Tabular probabilistic models: logistic, GBDT, ensembles |
| C4 | Deep learning, time series | Sequence models for returns, volatility, event-price paths |
| C5 | LLM event extraction | Turn news, filings, and announcements into typed, timestamped features |
| C6 | Calibration | Map raw scores to honest probabilities |
| C7 | Evaluation and backtesting | Proper scores, walk-forward, bootstrap CIs |
| C8 | Experiment tracking and registry | Record configs, data hashes, metrics, model artifacts |
| C9 | Model serving | Stable API returning `Forecast` objects |
| C10 | Monitoring and drift | Feed health, input drift, live calibration |

### 2.2 Tool and library options

Integration paths: **Native** = same JVM, a library; **REST/gRPC sidecar** = separate process you call over the
network; **JNI** = native binary behind a Java API.

| Capability Slot | Tool/Library (Version) | Purpose | Language/Integration Path | License | Maturity | Trade-offs |
|---|---|---|---|---|---|---|
| C1 Ingestion | Java `HttpClient` (JDK 17 built-in) + Jackson 2.18.x | HTTP/WebSocket pulls, JSON parsing | Native Java | JDK: GPLv2+CPE; Jackson: Apache-2.0 | Very high | Pro: zero extra runtime, you see every retry. Con: backoff, rate limits, and reconnects are yours to write. |
| C1 Ingestion (alt) | Apache Camel 4.x | Routing and connector catalogue (HTTP, Kafka, files, JDBC) | Native Java DSL | Apache-2.0 | High | Pro: hundreds of connectors and retry patterns. Con: large dependency tree and steep learning curve for a small team. |
| C2 Feature store | Apache Parquet (parquet-java 1.14.x) + DuckDB JDBC 1.1.x | Versioned columnar storage; SQL `ASOF JOIN` for point-in-time joins | Native Java (JDBC) | Apache-2.0 / MIT | High | Pro: one file per dataset version, easy to hash and audit. Con: no online serving; you enforce point-in-time discipline yourself. |
| C2 Feature store (alt) | Feast 0.4x (verify latest) | Offline + online feature store with registry | Python SDK; REST/gRPC feature server from Java | Apache-2.0 | Medium-high | Pro: real online store and feature registry. Con: Python-centric, extra infrastructure (registry, online store). |
| C3 Classical ML | Tribuo 4.3.x | Logistic regression, GBDT, evaluation, in pure Java | Native Java | Apache-2.0 | Medium-high | Pro: stays in Java, has reproducible training configs. Con: smaller community than scikit-learn; fewer tutorials. |
| C3 Classical ML (alt) | XGBoost4J 2.1.x | Gradient-boosted trees with logistic objective | JNI (native lib per platform) | Apache-2.0 | Very high | Pro: state-of-the-art tabular performance; models export to Python. Con: native binaries per OS/arch; JNI debugging is painful. |
| C4 Deep learning TS | Train in PyTorch 2.x (+ pytorch-forecasting or Darts); serve via ONNX Runtime Java 1.20.x | Train sequence models in Python, run inference in the JVM | Sidecar training; native Java inference | PyTorch: BSD-3; ONNX Runtime: MIT | High | Pro: best training ecosystem, stable JVM inference. Con: two languages, export pitfalls (dynamic shapes, custom ops). |
| C4 DL TS (alt) | Deep Java Library (DJL) 0.30.x with PyTorch engine | Train and infer in Java | Native Java API over JNI engines | Apache-2.0 | Medium | Pro: one language for training and inference. Con: smaller model zoo; native engine downloads and version coupling. |
| C5 LLM extraction | Thin provider client: Java `HttpClient` + JSON-schema structured outputs | Typed extraction of events, entities, sentiment, dates | Native Java over HTTPS | Your provider's terms | High (API-dependent) | Pro: no framework to fight, outputs validated against a schema. Con: tied to one vendor's API; you write retries. |
| C5 LLM extraction (alt) | LangChain4j 1.x (verify latest) | Abstractions over multiple LLM providers, tools, RAG | Native Java | Apache-2.0 | Medium-high | Pro: provider-agnostic, faster start. Con: abstraction churn between releases; hides request details you need for audit. |
| C6 Calibration | Native `PlattCalibrator` and isotonic (this repo) | Platt scaling, binned bands | Native Java | Repo license | Learner-grade; unit-tested for range and monotonicity | Pro: small, auditable, no dependencies. Con: isotonic and beta calibration still to be written and tested; you own correctness. |
| C6 Calibration (alt) | scikit-learn 1.5.x (`CalibratedClassifierCV`, `IsotonicRegression`) | Mature calibrators, used as an independent oracle | Python sidecar (REST) or offline comparison | BSD-3 | Very high | Pro: battle-tested defaults and docs. Con: second language, an extra service to run. |
| C7 Evaluation and backtesting | Native `Metrics` and `WalkForwardBacktester` (this repo) | Brier, log loss, ECE, walk-forward | Native Java | Repo license | Learner-grade | Pro: explicit leakage controls you can read. Con: no bootstrap or CV tooling yet; test it against an oracle. |
| C7 Evaluation (alt) | scikit-learn 1.5.x metrics (`brier_score_loss`, `log_loss`, `calibration_curve`) + Apache Commons Math 3.6.1 | Independent cross-check and bootstrap statistics | Python sidecar; Java library for statistics | BSD-3; Apache-2.0 | Very high | Pro: reference implementations to test your numbers against. Con: commons-math3 is in maintenance mode; a second stack to keep in sync. |
| C8 Experiment tracking | MLflow 2.x (self-hosted) | Runs, params, metrics, artifacts, model registry | REST from Java (HttpClient); Python server | Apache-2.0 | Very high | Pro: standard UI and registry, language-neutral. Con: you run a server and database; the Java client is REST only. |
| C8 Experiment tracking (alt) | Weights & Biases (hosted) | Runs, sweeps, dashboards | REST from Java | Proprietary SaaS | Very high | Pro: excellent UI, no server to run. Con: data leaves your environment; check residency, pricing, and tenancy ⚠ VERIFY. |
| C9 Model serving | Javalin 6.x | Small HTTP API returning `Forecast` as JSON | Native Java, embedded Jetty | Apache-2.0 | High | Pro: minimal, fast to start, one JAR. Con: you build auth, rate limiting, and metrics wiring. |
| C9 Model serving (alt) | Spring Boot 3.4.x | Full web framework with security, actuator, and config | Native Java | Apache-2.0 | Very high | Pro: enterprise-grade ecosystem, actuator health checks. Con: heavier start-up and a larger surface to learn. |
| C10 Monitoring and drift | Micrometer 1.14.x + Prometheus | Latency, feed lag, forecast counts, rolling Brier | Native Java metrics, scraped by Prometheus | Apache-2.0 | Very high | Pro: standard operational metrics. Con: records counts and latency, not statistical drift or calibration on its own. |
| C10 Monitoring (alt) | Evidently 0.4+ (verify latest) | Data drift and classification-quality reports | Python sidecar, reports exported as HTML or JSON | Apache-2.0 | Medium-high | Pro: drift and calibration reports out of the box. Con: Python; reports are batch, not streaming. |

### 2.3 Recommended default stack

| Slot | Primary (default) | Fallback | Why the primary |
|---|---|---|---|
| C1 Ingestion | JDK `HttpClient` + Jackson | Apache Camel | Fewer moving parts, and you learn exactly what a retry costs. Move to Camel once you have 5+ sources. |
| C2 Feature store | Parquet + DuckDB | Feast | Versioned files plus `ASOF JOIN` are enough for point-in-time training. Feast pays off only with an online serving need. |
| C3 Classical ML | Logistic (in repo) → Tribuo | XGBoost4J | Logistic is the baseline every model must beat. Tribuo keeps GBDT and logistic in Java. Use XGBoost4J if benchmarks demand it. |
| C4 DL TS | PyTorch train → ONNX Runtime Java | DJL | Training ecosystem matters more than language purity for sequence models. |
| C5 LLM extraction | Thin client + JSON schema | LangChain4j | You need to audit exact prompts, responses, and parse failures. A thin client makes that trivial. |
| C6 Calibration | Native Platt + isotonic | scikit-learn | Platt is two parameters: easy to audit and hard to break. Use scikit-learn as the oracle in tests. |
| C7 Evaluation | Native `Metrics` + backtester | scikit-learn cross-check | Own the leakage-sensitive code. Check your numbers against scikit-learn in CI. |
| C8 Tracking | MLflow (self-hosted) | W&B | Open-source, self-hostable, keeps data in your control. |
| C9 Serving | Javalin | Spring Boot | Smallest working service. Spring Boot if you need auth and enterprise plumbing. |
| C10 Monitoring | Micrometer + Prometheus | Evidently | Operational metrics first. Add Evidently for statistical drift reports once live data exists. |

---

## 3. Domain data sources and features

### 3.1 Vocabulary: signal features vs labels

- **Signal feature:** something you can observe at decision time `t`. It must be computable from data *available at* `t`.
- **Label (target):** the resolved outcome of a question asked at `t`. It must be defined before you look at data,
  and it must resolve *after* `t`.
- **Benchmark:** the best cheap alternative forecast. For prediction markets, it is the market price itself.
  For equities, it is the random walk. For politics, it is a polling average or a naive base rate.

A label definition must answer: *what exactly is the event, which source decides it, at what time, and what happens on
ties, withdrawals, annulments, and amendments?* A vague label makes calibration meaningless.

### 3.2 Prediction markets

**Signal features**
- Mid price, bid-ask spread, top-of-book depth, depth imbalance `(bid_depth - ask_depth)/(sum)`.
- Price momentum over 1h, 24h, 7d; realised volatility of the price series.
- Trade-flow: signed volume, trade count, size distribution.
- Time to resolution (in hours), and how close the price is to 0 or 1 (near-resolved markets behave differently).
- Cross-venue price gap for the same question (only if both venues resolve identically; check this).
- Market price history at fixed horizons before resolution (e.g. T-7d, T-1d), without peeking at resolution.

**Label definitions**
- Binary: `1` if the question resolves YES under its official resolution criteria, else `0`.
- Snapshot-based: forecast at a fixed time `T_forecast` before resolution, label is the resolution. Do not
  sample the price at the resolution moment; that is leakage.
- Invalid or annulled markets are excluded from calibration and reported separately.

| Source | Type | Documentation status |
|---|---|---|
| Polymarket CLOB and Gamma APIs | Market data (orders, prices, metadata) | Publicly documented APIs. **⚠ VERIFY** current endpoints, rate limits, data terms, and geographic restrictions for your users. |
| Kalshi REST and WebSocket market data | Regulated exchange data (US event contracts) | Publicly documented. **⚠ VERIFY** API terms, market-data redistribution rules, and eligibility. |
| Manifold Markets API | Play-money markets; good for research | Publicly documented. **⚠ VERIFY** ToS, rate limits, and commercial-use rules. |
| Metaculus API | Forecast questions and community predictions | Publicly documented. **⚠ VERIFY** ToS and attribution requirements. |

### 3.3 Equities

**Signal features**
- Returns over 1d, 5d, 21d (momentum); realised volatility; volume z-scores.
- Order-book imbalance at L2 depth (requires paid L2 data).
- Earnings surprise and post-announcement drift; analyst revision breadth (licensed data).
- Insider filings (Form 4), short interest (public exchange and regulator reports).
- LLM-extracted news events: count, sentiment, novelty, with an `availableAt` timestamp per article.

**Label definitions**
- Direction: `1` if the total return over horizon `h`, net of costs, is positive.
- Threshold: `1` if the price is above `X` at `t+h`. Define `X` in advance and use adjusted closes.
- Pitfalls: corporate actions (use adjusted data with a known adjustment date), delistings (survivorship bias if
  excluded), and time-of-day effects.

| Source | Type | Documentation status |
|---|---|---|
| SEC EDGAR APIs (filings, XBRL) | US filings, official | Publicly documented; fair-access rules limit request rate and require a descriptive User-Agent. **⚠ VERIFY** current policy. |
| FRED API (St. Louis Fed) | Macro time series | Publicly documented, free key. **⚠ VERIFY** per-series licence terms. |
| ECB Data Portal | Euro-area macro and rates | Publicly documented. **⚠ VERIFY** reuse terms. |
| Polygon.io / Alpaca market-data APIs | Historical and live prices | Publicly documented; plan-based access and redistribution limits. **⚠ VERIFY** plan and licence. |
| Stooq, Tiingo, EODHD | End-of-day prices | Publicly documented for some endpoints. **⚠ VERIFY** ToS; some prohibit redistribution. |
| Yahoo Finance (unofficial endpoints) | Prices | No official API; **avoid for production**. Terms restrict automated access. ⚠ VERIFY before any use. |

### 3.4 Commodities

**Signal features**
- Inventory surprise: reported minus consensus (where licensed consensus exists), or minus a seasonal baseline.
- Futures term structure: slope between front and deferred contracts; roll-adjusted returns.
- Speculative positioning: net non-commercial position, expressed as a percentile over the last 3 years.
- Weather: degree-days, precipitation anomalies (for agricultural and energy contracts).
- Seasonality and calendar effects; OPEC and policy-meeting proximity.

**Label definitions**
- Direction of the front-month settlement over horizon `h`, roll-adjusted (use continuous back-adjusted series; document the method).
- Inventory-release direction: did the actual figure beat the stated expectation? Requires a fixed definition of
  "expectation".
- Volatility regime: realised volatility above its trailing median at `t+h`.

| Source | Type | Documentation status |
|---|---|---|
| EIA Open Data API v2 | US energy: inventories, prices, forecasts | Publicly documented, free key. **⚠ VERIFY** series-level terms. Treat STEO forecasts as features *as published*, not revised. |
| CFTC Commitments of Traders | Weekly positioning | Publicly documented. **⚠ VERIFY** release timing (published with a lag; use the release date as `availableAt`). |
| World Bank Pink Sheet | Monthly commodity prices | Publicly documented (spreadsheets). **⚠ VERIFY** reuse terms. |
| USDA NASS Quick Stats API | Agricultural statistics | Publicly documented, key required. **⚠ VERIFY** terms. |
| Open-Meteo | Weather history and forecasts | Publicly documented. **⚠ VERIFY** attribution and commercial-use terms. |
| CME, ICE, LME settlement data | Exchange settlements | Licensed, usually paid. **⚠ VERIFY** licence scope before ingesting. |

### 3.5 Politics

**Signal features**
- Poll average weighted by sample size and recency, with pollster house-effect adjustment (estimate it; do not assume it).
- Poll trend (slope over the last N weeks); dispersion across pollsters; undecided share.
- Fundamentals: economic indicators, incumbency, historical base rate for the contest.
- Prediction-market price (as a feature, *and* as a benchmark).
- News and attention counts from GDELT or equivalent, extracted with an LLM and timestamped.

**Label definitions**
- Named race, named date, named official source: `1` if candidate X is declared winner by that source at `T_resolve`.
- Fix tie-breaks, recounts, and certification delays in advance. "Declared" and "certified" can differ by weeks.
- Vote-share thresholds: define the denominator (valid votes, total votes, or two-party share) before collecting data.

| Source | Type | Documentation status |
|---|---|---|
| Wikipedia opinion-polling tables (via MediaWiki API) | Aggregated poll tables | Public and CC-BY-SA licensed. **⚠ VERIFY** attribution, scraping policy, and the ToS for automated access. |
| Roper Center iPoll | Archive of published polls | Subscription. **⚠ VERIFY** licence before use. |
| Individual pollsters' published tables | Primary poll data | Per-pollster terms. **⚠ VERIFY** each one. |
| Statistics Norway (SSB) API | Norwegian statistics | Publicly documented. **⚠ VERIFY** reuse licence (Norwegian open licence terms). |
| Valgdirektoratet (Norway) result files | Official election results | Publicly available. **⚠ VERIFY** formats and reuse terms. |
| FEC API (US) | Campaign finance | Publicly documented, key required. **⚠ VERIFY** terms. |
| GDELT Project | Global news events | Publicly documented, open. **⚠ VERIFY** licence and usage limits. |
| Wikimedia pageviews API | Attention proxy | Publicly documented. **⚠ VERIFY** Wikimedia API etiquette and terms. |
| Google Trends | Search attention | No official API. **Avoid scraping**; ToS prohibits automated access. ⚠ VERIFY. |

### 3.6 Data licensing, ToS, and legal cautions

Each bullet below is an orientation, not legal advice. **Every specific claim needs checking against current
sources in your jurisdiction before you rely on it.**

- **API terms.** Check rate limits, caching limits, redistribution, commercial use, attribution, and whether you may
  store derived data. Many data licences forbid redistributing the raw series even when derived numbers are fine. ⚠ VERIFY per source.
- **Scraping.** Legality varies with jurisdiction, ToS, and technical access controls. In the EU, databases can carry
  sui generis database rights (Directive 96/9/EC). Robots.txt is not a licence, but ignoring it is poor practice and
  can matter as evidence of intent. ⚠ VERIFY with counsel for your specific use.
- **Personal data.** Political-opinion data about identifiable people is sensitive personal data under GDPR (and
  Norway's personal data act). Aggregate, pseudonymise, and minimise. ⚠ VERIFY.
- **Prediction-market participation.** Trading on event contracts is regulated, often by financial and gambling
  authorities. In the US, CFTC regulates event contracts and states have their own rules. In Norway, real-money
  prediction products may fall under gambling rules. This system does not place trades. ⚠ VERIFY the rules for any
  market you reference, and whether your users can access it.
- **Financial advice.** Publishing probabilities about tradable securities can be treated as investment advice or as
  marketing of financial products in some jurisdictions (MiFID II in the EU, the Norwegian securities trading act). Do
  not present outputs as recommendations, and keep a clear disclaimer. ⚠ VERIFY.
- **Election content.** Some jurisdictions restrict publishing polls or forecasts near elections and require
  disclosure of methodology. ⚠ VERIFY for the jurisdiction and the dates involved.
- **AI-specific rules.** The EU AI Act sets transparency and risk obligations for AI systems. A forecasting tool for
  private research is probably low risk, but a product that influences decisions about people may not be. ⚠ VERIFY.
- **Storage and attribution.** Keep the source, licence, retrieval time, and transformation for every dataset. Without
  this you cannot prove what you were allowed to do with a dataset later.

---

## 4. Calibration and evaluation

### 4.1 What "calibrated" means

A forecaster is calibrated if, among all cases where it says `p`, the event happens about a fraction `p` of the time.
Calibration is measured on out-of-sample data. Calibration does not mean the forecasts are good; a model that always
says the base rate is perfectly calibrated and useless. Calibration and *resolution* (how far forecasts move away from
the base rate) both matter.

### 4.2 Proper scoring rules

| Metric | Formula | Lower is better? | Notes |
|---|---|---|---|
| Brier score | `mean((p - y)^2)` | Yes | Strictly proper. Constant `b` forecast scores `b(1-b)`. |
| Log loss | `-mean(y log p + (1-y) log(1-p))` | Yes | Strictly proper. Punishes confident misses hard; clip `p` to avoid `log 0`. |
| Brier skill score | `1 - Brier / Brier_ref` | Higher is better | Reference is usually the base rate or the market price. |
| ECE | `sum_b (n_b / N) abs(conf_b - acc_b)` | Yes | Summary of the reliability diagram. Depends on bin count; report it. |

**Murphy decomposition** (useful for diagnosis):
`Brier = reliability - resolution + uncertainty`, where
- *reliability* measures miscalibration (want small),
- *resolution* measures how far the bin forecasts move from the base rate (want large),
- *uncertainty* = `b(1-b)` depends only on the outcomes, not on the model.

A model can improve Brier by adding resolution, or by fixing reliability. Calibration fixes reliability only.

### 4.3 Reliability diagrams

- Plot bin mean prediction (x) vs observed frequency (y), with the diagonal as reference.
- Show bin counts. Small bins are noisy, so draw Wilson intervals on each point.
- Do the plot on **out-of-sample** data only. In-sample reliability is flattering by construction.
- Read it as: points below the diagonal are overconfidence; above, underconfidence; an S-shape means the raw scores are
  shrunk or stretched around the centre.

### 4.4 Calibrators

| Method | Parameters | Use when | Risk |
|---|---|---|---|
| Platt scaling (in repo) | 2 (slope, intercept) | Few hundred to a few thousand samples; sigmoid-shaped miscalibration | Wrong shape if miscalibration is non-sigmoid |
| Isotonic regression | Non-parametric, monotone step function | Thousands of samples | Overfits small samples; step artefacts |
| Beta calibration | 3 | Asymmetric miscalibration | Less common tooling |
| Temperature scaling | 1 | Neural networks, logit scaling | Only fixes overall confidence |

Always fit the calibrator on data the model did not train on, and that comes before the test data. Use the calibration slice
(section 1.3). Report calibrated and raw scores side by side; if calibration does not improve log loss out of sample,
do not ship it.

### 4.5 Walk-forward backtesting

- **Expanding window** (used in `WalkForwardBacktester`): every fold trains on all data before the test block. Good when
  the process is stable and data is scarce.
- **Rolling window:** fixed-length training window. Better when the process drifts.
- **Test block length:** long enough to produce a stable Brier (a few hundred observations at least). Short blocks look
  random.
- **Refit cadence:** match the production schedule. Backtests that refit daily but production that refits monthly
  overstate performance.
- **Pooled score:** score the concatenated out-of-sample predictions, not an average of fold scores; fold sizes differ.
- **Uncertainty of the score:** use a **block bootstrap** over the pooled series. Block length must exceed the
  autocorrelation horizon, or the CI is too narrow.

### 4.6 Preventing data leakage: checklist

| Leakage path | Control in this design |
|---|---|
| Features read future ticks | `FeatureBuilder` reads `0..i`; `FeatureBuilderTest` tampers with future ticks and fails if features move |
| Label overlaps with test-period features | Embargo equal to label horizon (`WalkForwardBacktester` embargo = 1) |
| Scaling statistics use all data | `LogisticRegression` standardises with training statistics only |
| Calibration fitted on training data | Separate calibration slice |
| Model selection on the test slice | One held-out test slice, used once; select hyperparameters inside the fit/calibration slices |
| Revised data (vintage leakage) | Store `availableAt` per value; use the vintage known at `t` (TODO: section 5) |
| Survivorship bias | Keep delisted equities, cancelled or annulled markets, and exclude only with a documented reason |
| Resolution-time price used as a feature | Snapshot features at `T_forecast` before resolution |
| Overlapping labels | Use purged/embargoed CV when labels span multiple periods (TODO: CPCV) |
| Feature engineering on the full dataset | Compute all statistics inside the fold |
| Duplicate records across folds | De-duplicate at ingestion; check for identical rows across splits |

### 4.7 Benchmarks you must beat

Before any complicated model, report these on the same out-of-sample slice:
1. **Base rate** (climatology): Brier `b(1-b)`.
2. **Market or poll baseline** where one exists. A model that cannot beat the market price has no edge to report.
3. **Logistic regression** (in repo).
4. Your candidate model, raw and calibrated.

Report all four. If the candidate only beats the base rate, say so plainly.

---

## 5. Starter codebase

### 5.1 Build and run

```bash
cd prediction-machine
mvn -B verify                                            # compiles, runs 11 unit tests
java -jar target/prediction-machine-0.1.0-SNAPSHOT.jar   # runs the end-to-end demo
```

- **JDK 17** target (`maven.compiler.release=17`). It compiles on newer JDKs (21 was used to verify).
  Why 17: it is an LTS release with records, sealed types, and text blocks, and almost every library supports it. Move to 21 when your
  libraries require it. Virtual threads (21) are useful for many concurrent connectors but not necessary yet.
- **Maven**, not Gradle: a small, declarative build that every Java tool and CI system understands. Gradle is a good
  choice once you need multi-module builds with custom tasks.
- **Zero runtime dependencies:** the core builds offline and reads as a textbook implementation. JUnit is test-scope only.

### 5.2 Sample run (verified in this repository)

```
observations: 2995, features: [last_return, momentum_5, imbalance]
split: fit=1797, calib=598, test=598 (embargo 1 between blocks)
platt: slope=1.319 intercept=-0.048 (slope~1, intercept~0 => already calibrated)

HELD-OUT TEST SLICE
  base rate (train) : 0.518
  Brier raw         : 0.2033
  Brier calibrated  : 0.2024
  Brier climatology : 0.2510 (reference)
  Brier skill (cal) : +0.1935
  ...
WALK-FORWARD ... pooled out-of-sample: Brier(cal)=0.2050, Brier(ref)=0.2500, skill=+0.1801
FORECAST (estimate, not a guarantee)
  asOf=2024-05-04T22:00:00Z  p=0.340  95% band=[0.305, 0.543]  reliable=true  model=logistic-l2-v1+platt
SANITY CHECK: PASS (calibrated model beats base-rate reference)
```

Remember: this data is synthetic with a planted signal. The skill numbers show the plumbing works. They say nothing about real markets.

### 5.3 Module and key class summary

| File | What it teaches |
|---|---|
| `core/Tick.java` | The raw record contract; `availableAt` is the TODO that matters most |
| `core/Observation.java` | Feature vector plus label, with defensive copying |
| `core/Forecast.java` | Invariants: `lower <= p <= upper` and `p` in [0,1]. A forecast that violates them cannot be built |
| `data/DataConnector.java` | One interface per source; the ingestion contract (sorted, de-duplicated, no back-filling) |
| `data/CsvTickConnector.java` | Bundled-data connector; half-open time windows |
| `data/SyntheticTickGenerator.java` | Seeded, reproducible data; regenerates the bundled CSV |
| `features/FeatureBuilder.java` | Point-in-time features and label built from the future period |
| `model/LogisticRegression.java` | Standardise using train statistics only; L2 regularisation; full-batch gradient descent |
| `calibration/PlattCalibrator.java` | Fit on the calibration slice; slope and intercept as diagnostics |
| `calibration/BinnedIntervalEstimator.java` | Band from Wilson intervals; refuses to be narrow with few cases |
| `evaluation/Metrics.java` | Brier, log loss, skill score, ECE, climatology reference |
| `evaluation/ReliabilityDiagram.java` | Bin-level data for the reliability plot |
| `evaluation/WalkForwardBacktester.java` | Expanding window, embargo, calibration slice, pooled out-of-sample scoring |
| `service/ForecastService.java` | Train once, serve read-only, version every output |
| `App.java` | End-to-end flow with a sanity check that fails the process if there is no skill |

### 5.4 The end-to-end flow (condensed from `App.java`; helpers such as `predictAll`, `outcomes`, `calibrate` omitted)

```java
// 1. Ingestion (TODO: swap in a live connector with the same Tick contract)
List<Tick> ticks = CsvTickConnector.fromClasspath("/sample/ticks.csv").fetch(Instant.EPOCH, Instant.MAX);

// 2. Features: point-in-time by construction
List<Observation> obs = new FeatureBuilder().build(ticks);

// 3. Chronological split with an embargo of one step (label horizon = 1)
int n = obs.size(), trainEnd = (int) (n * 0.6), calEnd = (int) (n * 0.8);
List<Observation> fitSet  = obs.subList(0, trainEnd);
List<Observation> calSet  = obs.subList(trainEnd + 1, calEnd);
List<Observation> testSet = obs.subList(calEnd + 1, n);

// 4. Model on the fit slice only
LogisticRegression model = new LogisticRegression();
model.fit(fitSet);

// 5. Calibration on the calibration slice only
PlattCalibrator calibrator = new PlattCalibrator();
calibrator.fit(predictAll(model, calSet), outcomes(calSet));

// 6. Held-out evaluation: the test slice has not been used by anything above
double[] testRaw = predictAll(model, testSet);
double[] testCal = calibrate(calibrator, testRaw);
boolean[] testY  = outcomes(testSet);
double brierCal  = Metrics.brier(testCal, testY);
double brierRef  = Metrics.climatologyBrier(Metrics.baseRate(outcomes(fitSet)), testY);

// 7. Walk-forward backtest (fresh model and calibrator per fold)
var report = new WalkForwardBacktester(1, 0.25)
        .run(obs, LogisticRegression::new, PlattCalibrator::new, 1500, 250);

// 8. Serving: train the packaged pipeline and forecast the latest decision point
ForecastService service = ForecastService.train(fitSet, calSet, 10);
Forecast f = service.predict(latest.asOf(), latest.features());

// 9. Sanity check: no skill over the base rate is a failure, not a result
if (!(brierCal < brierRef)) System.exit(1);
```

### 5.5 `// TODO` markers placed in the code

Search the source for `TODO:`. The main integration points:

- `core/Tick.java`: add `availableAt` for point-in-time correctness.
- `data/DataConnector.java`: `fetchAsOf` for revisions.
- `data/CsvTickConnector.java`: real connectors (prediction markets, equities, commodities, polls).
- `features/FeatureBuilder.java`: domain features (order-book depth, poll averages, LLM-extracted events).
- `model/ProbabilisticClassifier.java`: adapters for Tribuo, XGBoost4J, ONNX Runtime.
- `calibration/Calibrator.java` and `PlattCalibrator`: isotonic and beta calibrators.
- `evaluation/WalkForwardBacktester.java`: purged and combinatorial CV.
- `service/ForecastService.java`: HTTP endpoint and parameter-level persistence.

---

## 6. Risks and limitations

**Overfitting and backtest overfitting.** Trying 50 feature sets and keeping the best one makes the best one look good
by chance. Count every configuration you tried and deflate your results accordingly. Keep one final test slice you
open once.

**Data leakage.** The most common and most damaging failure. The controls in section 4.6 reduce the risk; they do not
eliminate it. Leakage often shows up as "too good to be true" Brier scores. Treat any out-of-sample skill above a
market baseline as suspicious until you have explained it.

**Market efficiency.** Liquid prediction markets and equities already reflect public information. Your model has to beat
the market's price, after fees and spreads, to be useful at all. Most published "edges" vanish on contact with
costs, latency, and capacity limits. A useful default assumption is that you have no edge until a benchmark test
shows otherwise.

**Non-stationarity and regime shifts.** A calibration fitted in one regime can be wrong in the next. Election cycles, rate
regimes, and market-structure changes break historical relationships. Monitor live calibration, not only backtests.

**Small samples.** Individual events are rare. A single election or a few hundred resolved markets cannot pin down
calibration in the tails. The bands in this system reflect that: when a bin has few cases, the band is wide, and the
code marks it unreliable. Respect that flag.

**The meaning of a probability for a unique event.** "70%" for a single election is not a frequency you can observe in
one trial. Calibration is verifiable only across many similar forecasts. Be explicit about the reference class, and do not
present single-event probabilities as validated frequencies.

**Label and resolution errors.** Resolution sources can change, be wrong, or be revised. Markets are annulled. Elections
are certified weeks later. Store the resolution source and time, and check a sample by hand.

**Model risk and operational risk.** Silent feed failures produce plausible but wrong forecasts. A stale price looks like
a confident forecast. Monitor feed lag and missing values first, and refuse to forecast when inputs are stale.

**LLM extraction risk.** LLM-extracted features can hallucinate entities, dates, or sentiment. Constrain outputs with a schema,
store the raw response, validate against a second source where possible, and treat extraction accuracy as its own
measured quantity.

**Regulatory and reputational risk.** See section 3.6. Beyond legal exposure, a forecast presented as more certain than it is
can mislead people who make real decisions. Show bands, versions, and limitations on every output.

**Honest expectations.** The most valuable outcome of this project is a rigorous measurement of whether a model beats a
simple benchmark. A negative result, correctly measured, is a success of the process.

---

## 7. Suggested learning path

1. **M1 (done):** this skeleton, synthetic data, tests, calibration, walk-forward.
2. **M2:** one read-only connector for one prediction-market API, with `availableAt` on every record. Store raw responses.
3. **M3:** a market-price benchmark on resolved questions. Your model must beat it, or report that it does not.
4. **M4:** isotonic calibration and block-bootstrap confidence intervals on the Brier skill score. Check your metrics
   against scikit-learn in a test.
5. **M5:** a Javalin endpoint returning `Forecast` JSON, plus MLflow logging per training run.
6. **M6:** LLM extraction with a JSON schema for one domain. Measure extraction accuracy against a hand-labelled sample.
7. **M7:** monitoring: rolling Brier, reliability, and feed lag as Micrometer metrics, with alerts.
