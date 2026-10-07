// Latency og minne per kombinasjon. Kjør: node --expose-gc task-templates/bench.js
// Skriver bench-results.json. Exit 1 hvis maks latency ≥ budsjett.
const fs = require('node:fs');
const path = require('node:path');
const T = require('./engine.js');
const { HEADERS, VALID, series } = require('./fixtures.js');

const RUNS = 300, WARMUP = 50, MEM_ITER = 2000;
const gc = global.gc || null;
const clone = o => JSON.parse(JSON.stringify(o));

function combos() {
  const out = {};
  for (const [k, v] of Object.entries(VALID)) out[`valid.${k}`] = v;
  for (const len of [1, 180, 2000]) {
    out[`text.${len}`] = { schema_version: '1.0', source: 'isolation_mirror',
      modalities: [{ type: 'text', value: 'å'.repeat(len) }] };
  }
  for (const [mime, h] of [['image/png', 'png'], ['image/jpeg', 'jpeg'], ['image/webp', 'webp'], ['image/heic', 'heic'], ['image/gif', 'gif']]) {
    out[`image.${h}`] = { schema_version: '1.0', source: 'isolation_mirror',
      modalities: [{ type: 'image', mime, bytes: 1e6, header: HEADERS[h] }] };
  }
  for (const n of [1, 10, 100, 1000]) {
    out[`series.${n}`] = { schema_version: '1.0', source: 'history',
      modalities: [{ type: 'timeseries', points: series(n, i => 1 + ((i * 7) % 5)) }] };
  }
  const rev = clone(out['series.1000']); rev.modalities[0].points.reverse();
  out['series.1000.unsorted'] = rev;
  out['corrupt.truncated_json'] = JSON.stringify(VALID.mirrorFull).slice(0, 90);
  out['string.json_1000pts'] = JSON.stringify(out['series.1000']);
  out['corrupt.bad_base64'] = Object.assign(clone(VALID.mirrorImage),
    { modalities: [Object.assign(clone(VALID.mirrorImage.modalities[0]), { header: '@@@@' })] });
  out['corrupt.magic_mismatch'] = Object.assign(clone(VALID.mirrorImage),
    { modalities: [Object.assign(clone(VALID.mirrorImage.modalities[0]), { header: HEADERS.gif })] });
  out['corrupt.ambiguous_tags'] = Object.assign(clone(VALID.mirrorText), { tags: { intensity: 'Low/High', context: '' } });
  out['corrupt.1000_bad_points'] = { schema_version: '1.0', source: 'history',
    modalities: [{ type: 'timeseries', points: series(1000, () => '3').map(p => Object.assign(p, { extra: 1 })) }] };
  out['corrupt.null'] = null;
  return out;
}

function pct(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)]; }
const r3 = v => Math.round(v * 1000) / 1000;

const results = {};
let worst = 0;
for (const [name, input] of Object.entries(combos())) {
  for (let i = 0; i < WARMUP; i++) T.generate(input);
  const lat = [];
  let last;
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    last = T.generate(input);
    lat.push(performance.now() - t0);
  }
  lat.sort((a, b) => a - b);
  const mean = lat.reduce((a, b) => a + b, 0) / RUNS;
  const sd = Math.sqrt(lat.reduce((a, b) => a + (b - mean) ** 2, 0) / (RUNS - 1));

  // Minne: gc → N iterasjoner → heap-delta / N (allokert), gc → delta (beholdt).
  let mem = null;
  if (gc) {
    gc(); const h0 = process.memoryUsage().heapUsed;
    const keep = new Array(MEM_ITER);
    for (let i = 0; i < MEM_ITER; i++) keep[i] = T.generate(input);
    const h1 = process.memoryUsage().heapUsed;
    keep.length = 0; gc();
    const h2 = process.memoryUsage().heapUsed;
    mem = { bytes_per_iteration: Math.round((h1 - h0) / MEM_ITER), retained_after_gc_bytes: h2 - h0 };
  }
  worst = Math.max(worst, lat[RUNS - 1]);
  results[name] = {
    passed: last.constraints.passed,
    error_codes: [...new Set(last.constraints.errors.map(e => e.code))],
    iteration_count: last.iteration_count,
    latency_ms: { p50: r3(pct(lat, 0.5)), p95: r3(pct(lat, 0.95)), p99: r3(pct(lat, 0.99)),
      max: r3(lat[RUNS - 1]), mean: r3(mean), ci95_mean: [r3(mean - 1.96 * sd / Math.sqrt(RUNS)), r3(mean + 1.96 * sd / Math.sqrt(RUNS))] },
    memory: mem
  };
}

const report = {
  node: process.version, runs_per_combo: RUNS, warmup: WARMUP, memory_iterations: MEM_ITER,
  gc_exposed: !!gc, latency_budget_ms: T.LATENCY_BUDGET_MS,
  worst_max_ms: r3(worst), within_budget: worst < T.LATENCY_BUDGET_MS,
  note: 'Maskinavhengig. Minne er heap-delta målt med V8 gc og er et estimat, ikke eksakt per-objekt-størrelse.',
  combos: results
};
fs.writeFileSync(path.join(__dirname, 'bench-results.json'), JSON.stringify(report, null, 2) + '\n');
const w = Math.max(...Object.keys(results).map(k => k.length));
console.log(`${'combo'.padEnd(w)}  pass  p50     p95     max     B/iter`);
for (const [k, v] of Object.entries(results)) {
  console.log(`${k.padEnd(w)}  ${String(v.passed).padEnd(5)} ${String(v.latency_ms.p50).padEnd(7)} ${String(v.latency_ms.p95).padEnd(7)} ${String(v.latency_ms.max).padEnd(7)} ${v.memory ? v.memory.bytes_per_iteration : '-'}`);
}
console.log(`\nworst max ${r3(worst)} ms / budget ${T.LATENCY_BUDGET_MS} ms → ${report.within_budget ? 'OK' : 'FAIL'}`);
process.exit(report.within_budget ? 0 : 1);
