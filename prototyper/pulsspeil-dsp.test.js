// Kjør: node prototyper/pulsspeil-dsp.test.js
// Syntetisk hud-signal: puls i blodvolum (sterkest i grønn), lysdrift, støy, ujevn framerate.
const assert = require('assert');
const { estimateBpm, rsaAmplitude } = require('./pulsspeil-dsp.js');

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r()); }

function synth({ bpm, seconds = 12, noise = 0.15, seed = 1 }) {
  const r = rng(seed);
  const t = [], rgb = [];
  let time = 0;
  while (time < seconds) {
    const pulse = Math.sin(2 * Math.PI * (bpm / 60) * time);
    const drift = 1 + 0.03 * Math.sin(2 * Math.PI * 0.05 * time); // lys som endrer seg sakte
    // Pulsamplituder i størrelsesorden reelle rPPG-forhold (grønn sterkest)
    const R = 150 * drift * (1 + 0.0010 * pulse) + noise * gauss(r);
    const G = 110 * drift * (1 + 0.0030 * pulse) + noise * gauss(r);
    const B = 90 * drift * (1 + 0.0008 * pulse) + noise * gauss(r);
    t.push(time); rgb.push([R, G, B]);
    time += 1 / 30 + (r() - 0.5) * 0.01; // jitter i framerate
  }
  return { t, rgb };
}

let ok = 0;
for (const [bpm, seed] of [[52, 3], [72, 1], [95, 7], [130, 11]]) {
  const { t, rgb } = synth({ bpm, seed });
  const res = estimateBpm(t, rgb);
  const err = Math.abs(res.bpm - bpm);
  console.log(`sann ${bpm} bpm → estimert ${res.bpm.toFixed(1)} bpm, SNR ${res.snr.toFixed(1)} dB, kvalitet ${res.kvalitet.toFixed(2)}`);
  assert(err < 2, `feil for stor: ${err.toFixed(2)} bpm`);
  ok++;
}

// Ren støy skal gi lav kvalitet
{
  const r = rng(42); const t = [], rgb = [];
  for (let i = 0; i < 360; i++) { t.push(i / 30); rgb.push([150 + gauss(r), 110 + gauss(r), 90 + gauss(r)]); }
  const res = estimateBpm(t, rgb);
  console.log(`ren støy → kvalitet ${res.kvalitet.toFixed(2)}`);
  assert(res.kvalitet < 0.6, 'støy ble vurdert som godt signal');
  ok++;
}

// RSA: puls som svinger ±5 bpm med pusteperiode 11 s → amplitude ≈ 10
{
  const series = [];
  for (let s = 0; s <= 66; s += 0.5) series.push({ t: s, bpm: 70 + 5 * Math.sin((2 * Math.PI * s) / 11) });
  const a = rsaAmplitude(series, 11);
  console.log(`RSA-amplitude ${a.toFixed(2)} (forventet ≈ 10)`);
  assert(Math.abs(a - 10) < 0.6);
  ok++;
}

console.log(`\n${ok} tester bestått`);
