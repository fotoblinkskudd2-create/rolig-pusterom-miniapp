// Pulsspeil — signalbehandling for kamera-puls (rPPG).
// POS-algoritmen: Wang, den Brinker, Stuijk, de Haan (2017), IEEE TBME 64(7).
// Ingen avhengigheter. Fungerer i nettleser (window.PulsDSP) og Node (module.exports).
(function (root) {
  'use strict';

  function mean(a) { let s = 0; for (const v of a) s += v; return s / a.length; }
  function std(a) { const m = mean(a); let s = 0; for (const v of a) s += (v - m) * (v - m); return Math.sqrt(s / a.length); }

  // Lineær resampling av ujevne tidsstempler (sekunder) til jevn rate fs.
  function resample(t, values, fs) {
    const out = [];
    const t0 = t[0], t1 = t[t.length - 1];
    let j = 0;
    for (let x = t0; x <= t1; x += 1 / fs) {
      while (j < t.length - 2 && t[j + 1] < x) j++;
      const span = t[j + 1] - t[j] || 1e-9;
      const w = Math.min(1, Math.max(0, (x - t[j]) / span));
      out.push(values[j] * (1 - w) + values[j + 1] * w);
    }
    return out;
  }

  // POS: rgb = [[r,g,b], ...] ved jevn rate fs. Returnerer pulssignal h.
  function pos(rgb, fs) {
    const N = rgb.length;
    const l = Math.max(2, Math.round(1.6 * fs));
    const h = new Array(N).fill(0);
    for (let n = 0; n + l <= N; n++) {
      const win = rgb.slice(n, n + l);
      const mr = mean(win.map(c => c[0])), mg = mean(win.map(c => c[1])), mb = mean(win.map(c => c[2]));
      const s1 = [], s2 = [];
      for (const [r, g, b] of win) {
        const rn = r / mr, gn = g / mg, bn = b / mb;
        s1.push(gn - bn);
        s2.push(gn + bn - 2 * rn);
      }
      const alpha = std(s1) / (std(s2) || 1e-9);
      const hw = s1.map((v, i) => v + alpha * s2[i]);
      const mh = mean(hw);
      for (let i = 0; i < l; i++) h[n + i] += hw[i] - mh;
    }
    return h;
  }

  // Effektspekter via direkte DFT på frekvensgitter (små vinduer, så O(N·K) er greit).
  function spectrum(x, fs, fMin, fMax, df) {
    const m = mean(x);
    const N = x.length;
    const freqs = [], power = [];
    for (let f = fMin; f <= fMax + 1e-9; f += df) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        // Hann-vindu demper lekkasje
        const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1));
        const v = (x[n] - m) * w;
        const a = (2 * Math.PI * f * n) / fs;
        re += v * Math.cos(a); im -= v * Math.sin(a);
      }
      freqs.push(f); power.push(re * re + im * im);
    }
    return { freqs, power };
  }

  // Estimer puls fra rå RGB-målinger med tidsstempler (sekunder).
  // Returnerer { bpm, kvalitet (0–1), snr }.
  function estimateBpm(t, rgb, opts) {
    const o = Object.assign({ fs: 30, fMin: 0.7, fMax: 3.0, df: 1 / 120 }, opts);
    if (t.length < o.fs * 4) return null;
    const r = resample(t, rgb.map(c => c[0]), o.fs);
    const g = resample(t, rgb.map(c => c[1]), o.fs);
    const b = resample(t, rgb.map(c => c[2]), o.fs);
    const sig = pos(r.map((v, i) => [v, g[i], b[i]]), o.fs);
    const { freqs, power } = spectrum(sig, o.fs, o.fMin, o.fMax, o.df);
    let k = 0;
    for (let i = 1; i < power.length; i++) if (power[i] > power[k]) k = i;
    // Parabolsk interpolasjon rundt toppen for finere oppløsning
    let f = freqs[k];
    if (k > 0 && k < power.length - 1) {
      const a = power[k - 1], b2 = power[k], c = power[k + 1];
      const d = (a - c) / (2 * (a - 2 * b2 + c) || 1e-9);
      if (Math.abs(d) < 1) f += d * o.df;
    }
    // SNR: effekt innenfor ±0,1 Hz rundt topp vs. resten av båndet
    let inBand = 0, rest = 0;
    for (let i = 0; i < power.length; i++) {
      if (Math.abs(freqs[i] - freqs[k]) <= 0.1) inBand += power[i]; else rest += power[i];
    }
    const snr = 10 * Math.log10(inBand / (rest || 1e-12));
    const kvalitet = Math.max(0, Math.min(1, (snr + 6) / 12)); // −6 dB → 0, +6 dB → 1
    return { bpm: f * 60, snr, kvalitet, signal: sig };
  }

  // RSA-amplitude: gjennomsnittlig (maks − min) puls per pustesyklus.
  function rsaAmplitude(bpmSeries, breathPeriodSec) {
    if (bpmSeries.length < 2) return null;
    const t0 = bpmSeries[0].t, t1 = bpmSeries[bpmSeries.length - 1].t;
    const amps = [];
    for (let s = t0; s + breathPeriodSec <= t1; s += breathPeriodSec) {
      const seg = bpmSeries.filter(p => p.t >= s && p.t < s + breathPeriodSec).map(p => p.bpm);
      if (seg.length >= 3) amps.push(Math.max(...seg) - Math.min(...seg));
    }
    return amps.length ? mean(amps) : null;
  }

  const api = { resample, pos, spectrum, estimateBpm, rsaAmplitude };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PulsDSP = api;
})(typeof window !== 'undefined' ? window : globalThis);
