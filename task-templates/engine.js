/*
 * Rolig task-template engine. Ingen avhengigheter. Kjører i nettleser og Node.
 *
 * generate(input) -> { analysis, refinement, iteration_count, constraints }
 * Nøyaktig disse fire nøklene, alltid. Avvist input gir analysis.status "rejected",
 * refinement null og feilkoder i constraints.errors. Ingen plassholdere fylles inn.
 */
(function (root) {
  'use strict';

  const SCHEMA_VERSION = '1.0';
  const LATENCY_BUDGET_MS = 500;
  const MAX_DEPTH = 6;
  const MAX_TEXT = 2000;
  const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
  const MAX_POINTS = 1000;
  const MAX_ITERATIONS = 3;
  const MIN_TREND_N = 10;      // normaltilnærming til Mann-Kendall holder ikke under dette
  const ALPHA = 0.05;
  const FUTURE_SKEW_MS = 5 * 60 * 1000;

  // Speiler `actions` i index.html (indeks = id).
  const ACTIONS = [
    'Gå ut i frisk luft i 5 minutter',
    'Drikk et glass vann sakte',
    'Sett deg og kjenn føttene i gulvet',
    'Skriv ned én ting du er takknemlig for',
    'Ta tre dype pust der du er',
    'Legg telefonen bort i 10 minutter',
    'Strekk armene over hodet'
  ];

  const MIME = {
    'image/png':  h => eq(h, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'image/jpeg': h => eq(h, 0, [0xff, 0xd8, 0xff]),
    'image/gif':  h => eq(h, 0, [0x47, 0x49, 0x46, 0x38]),
    'image/webp': h => eq(h, 0, [0x52, 0x49, 0x46, 0x46]) && eq(h, 8, [0x57, 0x45, 0x42, 0x50]),
    'image/heic': h => eq(h, 4, [0x66, 0x74, 0x79, 0x70]) &&
      ['heic', 'heix', 'hevc', 'mif1', 'msf1'].includes(ascii(h, 8, 4))
  };

  // Typedefinisjoner. Felt som ikke står her er udefinerte og gir E_UNDEFINED_FIELD.
  const TYPES = {
    envelope: { required: ['schema_version', 'source', 'modalities'], optional: ['tags'] },
    text:       { required: ['type', 'value'], optional: ['lang'] },
    image:      { required: ['type', 'mime', 'bytes', 'header'], optional: ['width', 'height'] },
    mood:       { required: ['type', 'value'], optional: [] },
    timeseries: { required: ['type', 'points'], optional: [] },
    point:      { required: ['t', 'mood'], optional: [] },
    action:     { required: ['type', 'index'], optional: [] }
  };
  const SOURCES = {
    isolation_mirror: { anyOf: ['text', 'image'], allowed: ['text', 'image', 'mood'] },
    checkin:          { anyOf: ['mood'],          allowed: ['mood', 'text'] },
    history:          { anyOf: ['timeseries'],    allowed: ['timeseries', 'action'] },
    breathing:        { anyOf: ['mood'],          allowed: ['mood'] }
  };
  const TAGS = {
    intensity: ['low', 'medium', 'high'],
    context: ['isolation', 'stress', 'sleep', 'low_mood']
  };
  const LANGS = ['nb', 'nn', 'en'];
  const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];

  const now = (typeof performance !== 'undefined' && performance.now)
    ? () => performance.now() : () => Date.now();

  function eq(h, off, sig) {
    if (h.length < off + sig.length) return false;
    for (let i = 0; i < sig.length; i++) if (h[off + i] !== sig[i]) return false;
    return true;
  }
  function ascii(h, off, len) {
    let s = '';
    for (let i = off; i < off + len && i < h.length; i++) s += String.fromCharCode(h[i]);
    return s;
  }
  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v) &&
      (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
  }
  function isInt(v) { return typeof v === 'number' && Number.isInteger(v); }

  function decodeBase64(s) {
    if (typeof s !== 'string' || s.length === 0 || s.length % 4 !== 0 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return null;
    if (typeof atob === 'function') {
      try {
        const bin = atob(s);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
      } catch (_) { return null; }
    }
    return Uint8Array.from(Buffer.from(s, 'base64'));
  }

  // Ikke-semantisk rens: NFC, kontrolltegn og null-bredde-tegn ut, trim.
  // Endrer aldri betydning. Tvetydige verdier blir ikke "rettet" her.
  function cleanText(s) {
    return s.normalize('NFC')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‍⁠﻿]/g, '')
      .trim();
  }

  function walkGuards(v, path, depth, seen, errors) {
    if (v === null || typeof v !== 'object') return;
    if (seen.has(v)) { errors.push(err('E_CYCLE', path, 'sirkulær referanse')); return; }
    if (depth > MAX_DEPTH) { errors.push(err('E_DEPTH', path, `dypere enn ${MAX_DEPTH}`)); return; }
    seen.add(v);
    for (const k of Object.keys(v)) {
      if (FORBIDDEN_KEYS.includes(k)) errors.push(err('E_FORBIDDEN_KEY', `${path}.${k}`, 'reservert nøkkel'));
      else walkGuards(v[k], `${path}.${k}`, depth + 1, seen, errors);
    }
    seen.delete(v);
  }

  function err(code, path, message) { return { code, path, message }; }

  function checkFields(obj, def, path, errors) {
    for (const k of def.required) {
      if (!(k in obj) || obj[k] === undefined) errors.push(err('E_REQUIRED', `${path}.${k}`, 'mangler'));
    }
    for (const k of Object.keys(obj)) {
      if (!def.required.includes(k) && !def.optional.includes(k)) {
        errors.push(err('E_UNDEFINED_FIELD', `${path}.${k}`, 'ikke definert i typen'));
      }
    }
  }

  function validateModality(m, path, errors, warnings) {
    if (!isPlainObject(m)) { errors.push(err('E_TYPE', path, 'modalitet må være objekt')); return; }
    const def = TYPES[m.type];
    if (typeof m.type !== 'string' || !def || m.type === 'envelope' || m.type === 'point') {
      errors.push(err('E_ENUM', `${path}.type`, `ukjent modalitet: ${JSON.stringify(m.type)}`));
      return;
    }
    checkFields(m, def, path, errors);

    switch (m.type) {
      case 'text': {
        if (typeof m.value !== 'string') { errors.push(err('E_TYPE', `${path}.value`, 'må være streng')); break; }
        const c = cleanText(m.value);
        if (c !== m.value) warnings.push(err('W_SANITIZED', `${path}.value`, 'kontrolltegn/mellomrom fjernet'));
        if (c.length === 0) errors.push(err('E_EMPTY', `${path}.value`, 'tom tekst – ingen plassholder settes inn'));
        if (c.length > MAX_TEXT) errors.push(err('E_TEXT_LENGTH', `${path}.value`, `> ${MAX_TEXT} tegn`));
        if ('lang' in m && !LANGS.includes(m.lang)) errors.push(err('E_ENUM', `${path}.lang`, `lang ∈ ${LANGS}`));
        break;
      }
      case 'image': {
        if (typeof m.mime !== 'string' || !MIME[m.mime]) {
          errors.push(err('E_MIME', `${path}.mime`, `støttes ikke: ${JSON.stringify(m.mime)}`));
        }
        if (!isInt(m.bytes) || m.bytes <= 0) errors.push(err('E_TYPE', `${path}.bytes`, 'heltall > 0'));
        else if (m.bytes > MAX_IMAGE_BYTES) errors.push(err('E_SIZE', `${path}.bytes`, `> ${MAX_IMAGE_BYTES}`));
        const h = decodeBase64(m.header);
        if (!h) errors.push(err('E_BASE64', `${path}.header`, 'korrupt base64'));
        else if (h.length < 12) errors.push(err('E_HEADER_SHORT', `${path}.header`, 'trenger ≥12 byte'));
        else if (MIME[m.mime] && !MIME[m.mime](h)) {
          errors.push(err('E_MAGIC_MISMATCH', `${path}.header`, `byte matcher ikke ${m.mime}`));
        }
        for (const d of ['width', 'height']) {
          if (d in m && (!isInt(m[d]) || m[d] <= 0 || m[d] > 20000)) {
            errors.push(err('E_RANGE', `${path}.${d}`, '1–20000'));
          }
        }
        break;
      }
      case 'mood':
        validateMood(m.value, `${path}.value`, errors);
        break;
      case 'timeseries': {
        if (!Array.isArray(m.points)) { errors.push(err('E_TYPE', `${path}.points`, 'må være liste')); break; }
        if (m.points.length === 0) errors.push(err('E_EMPTY', `${path}.points`, 'tom serie'));
        if (m.points.length > MAX_POINTS) { errors.push(err('E_SIZE', `${path}.points`, `> ${MAX_POINTS}`)); break; }
        const limit = Date.now() + FUTURE_SKEW_MS;
        let prev = -Infinity, sorted = true;
        m.points.forEach((p, i) => {
          const pp = `${path}.points[${i}]`;
          if (!isPlainObject(p)) { errors.push(err('E_TYPE', pp, 'punkt må være objekt')); return; }
          checkFields(p, TYPES.point, pp, errors);
          validateMood(p.mood, `${pp}.mood`, errors);
          const ts = parseTimestamp(p.t);
          if (ts === null) errors.push(err('E_TIMESTAMP', `${pp}.t`, 'ISO-8601 med tidssone kreves'));
          else if (ts > limit) errors.push(err('E_TIMESTAMP', `${pp}.t`, 'i fremtiden'));
          else { if (ts < prev) sorted = false; prev = ts; }
        });
        if (!sorted) warnings.push(err('W_SORTED', `${path}.points`, 'sortert kronologisk'));
        break;
      }
      case 'action':
        if (!isInt(m.index) || m.index < 0 || m.index >= ACTIONS.length) {
          errors.push(err('E_RANGE', `${path}.index`, `0–${ACTIONS.length - 1}`));
        }
        break;
    }
  }

  function validateMood(v, path, errors) {
    if (!isInt(v)) errors.push(err('E_TYPE', path, `heltall kreves, fikk ${JSON.stringify(v)}`));
    else if (v < 1 || v > 5) errors.push(err('E_RANGE', path, '1–5'));
  }

  function parseTimestamp(t) {
    if (typeof t !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/.test(t)) return null;
    const ms = Date.parse(t);
    return Number.isNaN(ms) ? null : ms;
  }

  function validateTags(tags, errors) {
    if (!isPlainObject(tags)) { errors.push(err('E_TYPE', '$.tags', 'må være objekt')); return; }
    for (const [k, v] of Object.entries(tags)) {
      const path = `$.tags.${k}`;
      if (!TAGS[k]) { errors.push(err('E_UNDEFINED_FIELD', path, 'ukjent tag')); continue; }
      if (typeof v !== 'string') { errors.push(err('E_TYPE', path, 'tag må være streng')); continue; }
      if (TAGS[k].includes(v)) continue;
      // Tvetydig: case-variant, mellomrom, flere verdier, tom. Gjettes aldri.
      const folded = v.trim().toLowerCase();
      const parts = folded.split(/[\s,/|;+]+/).filter(Boolean);
      const hint = parts.length > 1 ? 'flere verdier'
        : TAGS[k].includes(folded) ? `mente du "${folded}"? avvist, gjettes ikke`
        : v.trim() === '' ? 'tom verdi' : `ukjent verdi, gyldig: ${TAGS[k].join('|')}`;
      errors.push(err('E_TAG_AMBIGUOUS', path, hint));
    }
  }

  function validate(input) {
    const errors = [], warnings = [];
    if (!isPlainObject(input)) {
      errors.push(err('E_ROOT_TYPE', '$', 'rot må være et vanlig objekt'));
      return { errors, warnings };
    }
    walkGuards(input, '$', 0, new WeakSet(), errors);
    if (errors.length) return { errors, warnings };

    checkFields(input, TYPES.envelope, '$', errors);
    if ('schema_version' in input && input.schema_version !== SCHEMA_VERSION) {
      errors.push(err('E_SCHEMA_VERSION', '$.schema_version', `forventet ${SCHEMA_VERSION}`));
    }
    const src = SOURCES[input.source];
    if ('source' in input && !src) {
      errors.push(err('E_ENUM', '$.source', `source ∈ ${Object.keys(SOURCES).join('|')}`));
    }
    if ('tags' in input) validateTags(input.tags, errors);

    if (!Array.isArray(input.modalities)) {
      if ('modalities' in input) errors.push(err('E_TYPE', '$.modalities', 'må være liste'));
      return { errors, warnings };
    }
    const seenTypes = {};
    input.modalities.forEach((m, i) => {
      validateModality(m, `$.modalities[${i}]`, errors, warnings);
      if (m && typeof m.type === 'string') {
        if (seenTypes[m.type] !== undefined && m.type !== 'action') {
          errors.push(err('E_DUPLICATE_MODALITY', `$.modalities[${i}]`,
            `${m.type} finnes allerede på [${seenTypes[m.type]}] – tvetydig hvilken som gjelder`));
        } else seenTypes[m.type] = i;
      }
    });
    if (src) {
      const present = Object.keys(seenTypes);
      if (!src.anyOf.some(t => present.includes(t))) {
        errors.push(err('E_MODALITY_COMBO', '$.modalities', `${input.source} krever én av ${src.anyOf}`));
      }
      for (const t of present) {
        if (TYPES[t] && !src.allowed.includes(t)) {
          errors.push(err('E_MODALITY_COMBO', '$.modalities', `${t} ikke tillatt for ${input.source}`));
        }
      }
    }
    return { errors, warnings };
  }

  // Ren, ikke-semantisk normalisering. Returnerer ny kopi.
  function normalize(input) {
    const out = Object.assign({}, input);
    out.modalities = input.modalities.map(m => {
      if (m.type === 'text') return Object.assign({}, m, { value: cleanText(m.value) });
      if (m.type === 'timeseries') {
        return Object.assign({}, m, {
          points: m.points.slice().sort((a, b) => Date.parse(a.t) - Date.parse(b.t))
        });
      }
      return m;
    });
    return out;
  }

  // Mann-Kendall med tie-korreksjon. Tolkes kun når n ≥ MIN_TREND_N og p < ALPHA.
  function mannKendall(xs) {
    const n = xs.length;
    if (n < MIN_TREND_N) {
      return { method: 'mann-kendall', n, S: null, z: null, p: null, significant: false,
        direction: null, interpretation: `utilstrekkelig data (n=${n} < ${MIN_TREND_N}); ingen trend tolkes` };
    }
    let S = 0;
    for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n; j++) S += Math.sign(xs[j] - xs[i]);
    const counts = {};
    for (const x of xs) counts[x] = (counts[x] || 0) + 1;
    let tie = 0;
    for (const t of Object.values(counts)) tie += t * (t - 1) * (2 * t + 5);
    const variance = (n * (n - 1) * (2 * n + 5) - tie) / 18;
    if (variance === 0) {
      return { method: 'mann-kendall', n, S, z: 0, p: 1, significant: false, direction: null,
        interpretation: 'konstant serie; ingen variasjon å teste' };
    }
    const z = S > 0 ? (S - 1) / Math.sqrt(variance) : S < 0 ? (S + 1) / Math.sqrt(variance) : 0;
    const p = 2 * (1 - phi(Math.abs(z)));
    const significant = p < ALPHA;
    const direction = significant ? (S > 0 ? 'up' : 'down') : null;
    return { method: 'mann-kendall', n, S, z: round(z, 4), p: round(p, 4), significant, direction,
      interpretation: significant
        ? `monoton trend ${direction === 'up' ? 'opp' : 'ned'} (p=${round(p, 4)} < ${ALPHA}); beskriver tid, ikke årsak`
        : `ingen signifikant trend (p=${round(p, 4)} ≥ ${ALPHA})` };
  }

  function phi(x) { // Abramowitz-Stegun 7.1.26, |feil| < 1.5e-7
    const t = 1 / (1 + 0.3275911 * x / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t +
      0.254829592) * t * Math.exp(-(x * x) / 2);
    return 0.5 * (1 + y);
  }
  function round(v, d) { const f = 10 ** d; return Math.round(v * f) / f; }

  function byType(input) {
    const o = { action: [] };
    for (const m of input.modalities) {
      if (m.type === 'action') o.action.push(m.index); else o[m.type] = m;
    }
    return o;
  }

  function analyze(input) {
    const m = byType(input);
    const present = input.modalities.map(x => x.type).filter((t, i, a) => a.indexOf(t) === i);
    const analysis = {
      status: 'accepted',
      source: input.source,
      modalities_present: present,
      tags: input.tags || {},
      causal_claim: false,
      notes: []
    };
    if (m.timeseries) analysis.mood_trend = mannKendall(m.timeseries.points.map(p => p.mood));
    if (m.timeseries && m.action.length) {
      analysis.notes.push('Små grep og humør er registrert samtidig. Samtidighet er ikke årsak; ingen effekt påstås.');
    }
    if (m.image) analysis.notes.push('Bildet er kun verifisert på format og størrelse. Innhold analyseres ikke, det forlater ikke enheten.');
    return analysis;
  }

  function refine(input, analysis) {
    const m = byType(input);
    const r = { steps: [], fields: {} };
    if (input.source === 'isolation_mirror') {
      r.steps.push('Sett føttene i gulvet. 3 dype pust.', 'Skriv én setning som er sann akkurat nå.');
      r.steps.push(m.image
        ? 'Bildet ligger bare her. Ikke del det. Se på det i 20 sekunder.'
        : 'Ta ett bilde av noe ekte i nærheten — ikke for andre, for deg.');
      if (m.text) r.fields.problem = m.text.value.slice(0, 180);
      r.lab_prompt = 'Grok-bot runtime. /lab. Klasse M.\nPROBLEM: Isolasjon.' +
        (m.text ? ' ' + r.fields.problem : '') +
        '\nBRUKER: én person, lokal, ingen sky\nRAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky' +
        '\nDNA: fototerapi + passiv mekanikk + 48t\nLEVERANSE: ideer\nSeed 7. Drepe minst 3. IRP på overlevende #1.' +
        '\nSkriv IDE ≤3 setninger på nynorsk. Stopp.\nIkke nytt OS.';
    } else if (input.source === 'checkin' || input.source === 'breathing') {
      r.fields.mood = m.mood.value;
      if (m.text) r.fields.note = m.text.value;
      r.steps.push(m.mood.value <= 2
        ? 'Pusterom: 4 inn, 2 hold, 6 ut. Tre runder.'
        : 'Velg ett lite grep fra listen.');
    } else if (input.source === 'history') {
      r.fields.points = m.timeseries.points.length;
      if (m.action.length) r.fields.actions = m.action.map(i => ACTIONS[i]);
      r.steps.push(analysis.mood_trend.significant
        ? 'Se på perioden der trenden snur. Ikke konkluder om hvorfor.'
        : 'For lite eller for flatt til å si noe. Fortsett å sjekke inn.');
    }
    return r;
  }

  function generate(raw) {
    const t0 = now();
    const constraints = {
      schema_version: SCHEMA_VERSION,
      passed: false,
      checks: [],
      errors: [],
      warnings: [],
      metrics: { latency_ms: null, latency_budget_ms: LATENCY_BUDGET_MS, within_budget: null }
    };
    let input = raw, iteration_count = 0, analysis = { status: 'rejected' }, refinement = null;

    if (typeof raw === 'string') {
      try { input = JSON.parse(raw); } catch (e) {
        constraints.errors.push(err('E_PARSE', '$', 'korrupt JSON: ' + e.message));
        input = undefined;
      }
    }

    if (input !== undefined) {
      // Valider → normaliser → valider på nytt til stabilt. Feil stopper løkka.
      let prevWarnings = -1;
      while (iteration_count < MAX_ITERATIONS) {
        iteration_count++;
        const v = validate(input);
        constraints.errors = v.errors;
        if (v.errors.length) break;
        if (v.warnings.length === 0) break;
        if (v.warnings.length === prevWarnings) {
          constraints.errors.push(err('E_UNSTABLE', '$', 'normalisering konvergerer ikke'));
          break;
        }
        constraints.warnings.push(...v.warnings);
        prevWarnings = v.warnings.length;
        input = normalize(input);
      }
      if (iteration_count >= MAX_ITERATIONS && constraints.errors.length === 0) {
        const last = validate(input);
        if (last.warnings.length) constraints.errors.push(err('E_UNSTABLE', '$', 'normalisering konvergerer ikke'));
      }
    }

    const codes = new Set(constraints.errors.map(e => e.code));
    const group = (id, list) => {
      const hit = list.filter(c => codes.has(c));
      constraints.checks.push(hit.length ? { id, passed: false, codes: hit } : { id, passed: true });
    };
    group('C_PARSE', ['E_PARSE', 'E_ROOT_TYPE', 'E_CYCLE', 'E_DEPTH', 'E_FORBIDDEN_KEY']);
    group('C_SCHEMA', ['E_REQUIRED', 'E_UNDEFINED_FIELD', 'E_SCHEMA_VERSION', 'E_TYPE', 'E_ENUM']);
    group('C_TAGS', ['E_TAG_AMBIGUOUS']);
    group('C_MODALITY', ['E_MODALITY_COMBO', 'E_DUPLICATE_MODALITY', 'E_EMPTY', 'E_RANGE',
      'E_TEXT_LENGTH', 'E_TIMESTAMP', 'E_SIZE']);
    group('C_IMAGE', ['E_MIME', 'E_BASE64', 'E_HEADER_SHORT', 'E_MAGIC_MISMATCH']);
    group('C_STABLE', ['E_UNSTABLE']);

    if (constraints.errors.length === 0) {
      analysis = analyze(input);
      refinement = refine(input, analysis);
    }

    const latency = now() - t0;
    constraints.metrics.latency_ms = round(latency, 3);
    constraints.metrics.within_budget = latency < LATENCY_BUDGET_MS;
    constraints.checks.push({ id: 'C_LATENCY', passed: constraints.metrics.within_budget });
    constraints.passed = constraints.checks.every(c => c.passed);
    return { analysis, refinement, iteration_count, constraints };
  }

  // Kjent adapter for localStorage['checkins'] i index.html (mood lagres som "1"–"5").
  // Eksplisitt konvertering, ikke gjetting: alt annet enn ett siffer 1–5 sendes videre urørt
  // og avvises av validatoren.
  function fromCheckins(list) {
    const points = (Array.isArray(list) ? list : []).map(e => ({
      t: e && e.date,
      mood: (typeof (e && e.mood) === 'string' && /^[1-5]$/.test(e.mood)) ? Number(e.mood) : e && e.mood
    }));
    return { schema_version: SCHEMA_VERSION, source: 'history', modalities: [{ type: 'timeseries', points }] };
  }

  const api = { generate, validate, mannKendall, fromCheckins, SCHEMA_VERSION, LATENCY_BUDGET_MS, ACTIONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TaskTemplates = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
