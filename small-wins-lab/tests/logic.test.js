/* Logikk- og datakontroll. Kjør: node --test tests/
 * Forventningene er skrevet for hånd eller regnet med egne, enkle evaluatorer i denne filen.
 * Motoren (js/engine.js) brukes bare som det som testes, aldri som fasit.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/engine.js');
const D = require('../js/data.js');
const S = require('../js/storage.js');

const T = id => D.OPPGAVER.find(t => t.id === id);
const FELT = ['id', 'tema', 'nivå', 'tittel', 'kort_instruksjon', 'komponenter', 'starttilstand', 'tillatte_handlinger',
  'regler', 'hint_1', 'hint_2', 'forklaring', 'eksempelløsning', 'gyldighetskontroll'];

// ---------------------------------------------------------------- struktur
test('30 oppgaver, unike ID-er, riktige prefikser og fordeling', () => {
  assert.equal(D.OPPGAVER.length, 30);
  const ids = D.OPPGAVER.map(t => t.id);
  assert.equal(new Set(ids).size, 30);
  const forventet = [];
  for (const p of ['SIG', 'REK', 'MON', 'RUT', 'FEI']) for (let i = 1; i <= 6; i++) forventet.push(p + '-0' + i);
  assert.deepEqual(ids.slice().sort(), forventet.slice().sort());
  for (const tema of D.TEMAER) {
    const l = D.OPPGAVER.filter(t => t.tema === tema.id);
    assert.equal(l.length, 6, tema.id);
    for (const n of [1, 2, 3]) assert.equal(l.filter(t => t.nivå === n).length, 2, tema.id + ' nivå ' + n);
    assert.ok(l.every(t => t.id.startsWith(tema.prefiks)), tema.id);
  }
});

test('alle obligatoriske felt finnes og er utfylt', () => {
  for (const t of D.OPPGAVER) {
    for (const f of FELT) assert.ok(t[f] !== undefined && t[f] !== null && t[f] !== '', t.id + ' mangler ' + f);
    assert.ok(Array.isArray(t.regler) && t.regler.length > 0, t.id);
    assert.ok(t.regler.every(r => typeof r.tekst === 'string' && r.tekst.length > 3), t.id + ' regeltekst');
    // Kort instruksjon: høyst to setninger
    const setninger = t.kort_instruksjon.split(/[.!?](\s|$)/).filter(s => s && s.trim()).length;
    assert.ok(setninger <= 2, t.id + ' instruksjon har ' + setninger + ' setninger');
  }
});

// ---------------------------------------------------------------- egne evaluatorer
function minPort(node, inn) {
  if (typeof node === 'string') return inn[node];
  const v = node.inn.map(n => minPort(n, inn));
  const på = v.filter(x => x).length;
  return { NOT: !v[0], AND: på === v.length, OR: på > 0, XOR: på === 1 }[node.port];
}
function minSignalOk(t, s) {
  const lampe = minPort(t.komponenter.krets, s);
  const på = Object.values(s).filter(Boolean).length;
  return t.regler.every(r => (r.type === 'lampe' ? lampe === r.verdi : r.type === 'antallPå' ? på === r.antall : true));
}
function minRekOk(t, o) {
  const p = id => o.indexOf(id);
  return t.regler.every(r => ({
    før: () => p(r.a) < p(r.b), rettEtter: () => p(r.b) - p(r.a) === 1, nabo: () => Math.abs(p(r.a) - p(r.b)) === 1,
    ikkeNabo: () => Math.abs(p(r.a) - p(r.b)) > 1, først: () => p(r.a) === 0, sist: () => p(r.a) === o.length - 1,
    ikkeFørst: () => p(r.a) !== 0, ikkeSist: () => p(r.a) !== o.length - 1, plass: () => p(r.a) === r.plass - 1
  }[r.type])());
}
function minePermutasjoner(n) { // Heap-lignende: alle ordninger av indekser 0..n-1
  const ut = []; const a = [...Array(n).keys()];
  (function gen(k) { if (k === 1) { ut.push(a.slice()); return; } for (let i = 0; i < k; i++) { gen(k - 1); const j = k % 2 ? 0 : i; [a[j], a[k - 1]] = [a[k - 1], a[j]]; } })(n);
  return ut;
}
// Korteste rute med gjentatt avslapping (Bellman-Ford-stil), ikke bredde-først.
function minKorteste(nett) {
  const R = nett.length, K = nett[0].length, kp = [];
  let s, m;
  nett.forEach((rad, r) => [...rad].forEach((c, k) => { if (c === 'S') s = [r, k]; if (c === 'M') m = [r, k]; if (/[1-9]/.test(c)) kp.push(r * K + k); }));
  const full = (1 << kp.length) - 1, INF = 1e9;
  const dist = new Map(); const key = (p, mask) => p * 64 + mask;
  dist.set(key(s[0] * K + s[1], 0), 0);
  let endret = true;
  while (endret) {
    endret = false;
    for (const [k, d] of Array.from(dist.entries())) {
      const p = Math.floor(k / 64), mask = k % 64, r = Math.floor(p / K), c = p % K;
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= R || nc >= K || nett[nr][nc] === '#') continue;
        const np = nr * K + nc; const i = kp.indexOf(np); const nm = i >= 0 ? mask | (1 << i) : mask;
        const nk = key(np, nm);
        if ((dist.has(nk) ? dist.get(nk) : INF) > d + 1) { dist.set(nk, d + 1); endret = true; }
      }
    }
  }
  const v = dist.get(key(m[0] * K + m[1], full)); return v === undefined ? -1 : v;
}
function minMaskin(t, ops) {
  let x = t.komponenter.start; const mel = [x];
  for (const o of ops) { x = o.op === '+' ? x + o.n : o.op === '-' ? x - o.n : x * o.n; mel.push(x); }
  const endr = ops.filter((o, i) => o.op !== t.komponenter.operasjoner[i].op || o.n !== t.komponenter.operasjoner[i].n).length;
  return t.regler.every(r => ({
    resultat: () => x === r.mål, maksEndringer: () => endr <= r.n, aldriOver: () => mel.every(v => v <= r.n),
    aldriUnder: () => mel.every(v => v >= r.n), mellom: () => mel[r.etter] === r.verdi
  }[r.type])()) && endr >= 1;
}
const opStr = ops => ops.map(o => (o.op === '-' ? '−' : o.op) + o.n).join(' ');

// ---------------------------------------------------------------- SIGNALER
const SIG_FASIT = { // skrevet for hånd fra sannhetstabellene
  'SIG-01': ['A0'], 'SIG-02': ['A1B1'], 'SIG-03': ['A0B1', 'A1B0'], 'SIG-04': ['A0B1', 'A1B0'],
  'SIG-05': ['A1B0'], 'SIG-06': ['A0B1C1', 'A1B0C1']
};
const sigKode = s => Object.keys(s).sort().map(k => k + (s[k] ? 1 : 0)).join('');
test('signaler: alle kombinasjoner undersøkt, motor = håndfasit = egen evaluator', () => {
  for (const [id, fasit] of Object.entries(SIG_FASIT)) {
    const t = T(id); const n = t.komponenter.brytere.length; const alle = [];
    for (let m = 0; m < (1 << n); m++) { const s = {}; t.komponenter.brytere.forEach((b, i) => { s[b] = !!(m & (1 << i)); }); alle.push(s); }
    const motor = alle.filter(s => E.sjekk(t, s).ok).map(sigKode).sort();
    const egen = alle.filter(s => minSignalOk(t, s)).map(sigKode).sort();
    assert.deepEqual(motor, fasit.slice().sort(), id + ' motor');
    assert.deepEqual(egen, fasit.slice().sort(), id + ' egen');
    assert.equal(t.gyldighetskontroll.antall_løsninger, fasit.length, id + ' dokumentert antall');
  }
});
test('signaler: forklarende feilmeldinger', () => {
  assert.match(E.sjekk(T('SIG-02'), { A: true, B: false }).melding, /AND.*alle inngangene/);
  assert.match(E.sjekk(T('SIG-03'), { A: true, B: true }).melding, /2 brytere på.*nøyaktig 1/);
  assert.match(E.sjekk(T('SIG-04'), { A: true, B: true }).melding, /XOR/);
});

// ---------------------------------------------------------------- REKKEFØLGE
const REK_FASIT = {
  'REK-01': ['sirkel firkant trekant', 'firkant sirkel trekant'],
  'REK-02': ['stjerne sirkel firkant trekant', 'stjerne trekant sirkel firkant'],
  'REK-03': ['sirkel trekant stjerne firkant', 'trekant sirkel stjerne firkant'],
  'REK-04': ['sirkel firkant trekant rute stjerne', 'firkant sirkel trekant rute stjerne'],
  'REK-05': ['sirkel stjerne rute firkant trekant', 'sirkel rute stjerne firkant trekant'],
  'REK-06': ['sirkel stjerne firkant hjerte rute trekant', 'sirkel stjerne rute hjerte firkant trekant', 'rute hjerte sirkel stjerne firkant trekant']
};
test('rekkefølge: alle permutasjoner undersøkt, flere gyldige godtas', () => {
  for (const [id, fasit] of Object.entries(REK_FASIT)) {
    const t = T(id); const ids = t.komponenter.kort.map(k => k.id);
    const perms = minePermutasjoner(ids.length).map(p => p.map(i => ids[i]));
    assert.equal(new Set(perms.map(p => p.join())).size, [1, 1, 2, 6, 24, 120, 720][ids.length]);
    const egen = perms.filter(p => minRekOk(t, p)).map(p => p.join(' ')).sort();
    const motor = perms.filter(p => E.sjekk(t, p).ok).map(p => p.join(' ')).sort();
    assert.deepEqual(egen, fasit.slice().sort(), id + ' egen');
    assert.deepEqual(motor, fasit.slice().sort(), id + ' motor');
    assert.equal(t.gyldighetskontroll.antall_løsninger, fasit.length, id);
  }
});
test('rekkefølge: konflikt forklares konkret', () => {
  const m = E.sjekk(T('REK-01'), ['trekant', 'sirkel', 'firkant']).melding;
  assert.match(m, /Blå sirkel ● må komme før gul trekant ▲/);
  assert.match(m, /plass 2.*plass 1/);
  assert.deepEqual(E.rekkefølge.flytt(['a', 'b', 'c'], 2, 0), ['c', 'a', 'b']);
  assert.deepEqual(E.rekkefølge.flytt(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c']);
});

// ---------------------------------------------------------------- MØNSTRE
const MON_FASIT = { 'MON-01': [[1]], 'MON-02': [[1, 2]], 'MON-03': [[2, 1]], 'MON-04': [[2, 4]], 'MON-05': [[0, 1]], 'MON-06': [[1, 2]] };
test('mønstre: alle brikkekombinasjoner undersøkt, gitte plasser følger regelen', () => {
  for (const [id, fasit] of Object.entries(MON_FASIT)) {
    const t = T(id);
    const n = t.komponenter.sekvens.filter(x => x === null).length, p = t.komponenter.palett.length;
    const godkjent = [];
    for (let m = 0; m < Math.pow(p, n); m++) { const svar = []; let x = m; for (let i = 0; i < n; i++) { svar.push(x % p); x = Math.floor(x / p); } if (E.sjekk(t, { svar }).ok) godkjent.push(svar); }
    assert.deepEqual(godkjent, fasit, id);
    // Ingen tom plass får være uavgrenset av en regel (ellers er oppgaven tvetydig)
    t.komponenter.sekvens.forEach((x, i) => { if (x === null) for (const r of t.regler) assert.ok(E.mønster.forventet(t, r, i), id + ' plass ' + (i + 1) + ' er ikke bundet'); });
    // Egen kontroll: hele sekvensen med fasit er periodisk/syklisk etter reglene
    const full = E.mønster.fullSekvens(t, { svar: fasit[0] });
    for (const r of t.regler) {
      for (let i = 0; i < full.length; i++) {
        if (r.type === 'periode' && i >= r.periode) assert.equal(full[i][r.egenskap], full[i - r.periode][r.egenskap], id + ' plass ' + (i + 1));
        if (r.type === 'syklus' && i >= 1) assert.equal(r.verdier.indexOf(full[i].tall), (r.verdier.indexOf(full[i - 1].tall) + 1) % r.verdier.length, id);
      }
    }
    assert.equal(t.gyldighetskontroll.antall_løsninger, 1, id);
  }
});
test('mønstre: tom plass og feil brikke gir konkret respons', () => {
  assert.match(E.sjekk(T('MON-02'), { svar: [1, null] }).melding, /Plass 7 er tom/);
  assert.match(E.sjekk(T('MON-05'), { svar: [0, 0] }).melding, /Plass 9: fyllet skal være hul/);
});

// ---------------------------------------------------------------- RUTER
const RUT_KORTESTE = { 'RUT-01': 6, 'RUT-02': 6, 'RUT-03': 8, 'RUT-04': 10, 'RUT-05': 12, 'RUT-06': 16 };
test('ruter: korteste rute = egen avslapping = håndtall', () => {
  for (const [id, n] of Object.entries(RUT_KORTESTE)) {
    const t = T(id);
    assert.equal(minKorteste(t.komponenter.rutenett), n, id + ' egen');
    assert.equal(E.rute.korteste(t), n, id + ' motor');
    assert.equal(t.gyldighetskontroll.korteste, n, id + ' dokumentert');
  }
  // Kontrollpunkt i RUT-05 gir faktisk omvei
  assert.equal(minKorteste(T('RUT-05').komponenter.rutenett.map(r => r.replace('1', '.'))), 8);
});
test('ruter: alternative korteste ruter godtas, lengre avvises der korteste kreves', () => {
  const alt = { sti: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2], [3, 3]] }; // RUT-02, ned før høyre
  assert.ok(E.sjekk(T('RUT-02'), alt).ok);
  const lang = { sti: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 2], [1, 2], [2, 2], [2, 3], [3, 3]] };
  const r = E.sjekk(T('RUT-02'), lang);
  assert.equal(r.ok, false); assert.match(r.melding, /8 steg.*korteste ruten er 6/);
  const alt5 = { sti: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [3, 0], [2, 0], [2, 1], [2, 2], [2, 3], [1, 3], [0, 3], [0, 4]] }; // RUT-05 opp igjen
  assert.ok(E.sjekk(T('RUT-05'), alt5).ok);
  // RUT-04 krever ikke korteste: en lengre gyldig rute godtas
  const lang4 = { sti: [[0, 0], [1, 0], [0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [1, 4], [2, 4], [3, 4], [4, 4]] };
  assert.ok(E.sjekk(T('RUT-04'), lang4).ok);
  // uten kontrollpunkt avvises
  const utenKp = { sti: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [3, 4], [4, 4]] };
  assert.match(E.sjekk(T('RUT-04'), utenKp).melding, /ikke vært innom kontrollpunkt 1/);
});
test('ruter: ulovlige steg forklares', () => {
  const t = T('RUT-01');
  assert.match(E.rute.stegFeil(t, [0, 0], [-1, 0]), /utenfor/);
  assert.match(E.rute.stegFeil(t, [0, 0], [1, 1]), /skrå/);
  assert.match(E.rute.stegFeil(t, [0, 2], [0, 3]), /stein/);
  assert.match(E.rute.stegFeil(t, [0, 0], [0, 2]), /ett felt/);
  assert.equal(E.rute.stegFeil(t, [0, 0], [0, 1]), null);
  assert.equal(E.gyldigTilstand(t, { sti: [[0, 0], [1, 1]] }), false);
});

// ---------------------------------------------------------------- FEILSØKING
const FEI_FASIT = {
  'FEI-01': ['+3 ×2 +1', '×3 ×2 −1'], 'FEI-02': ['−2 ×2 +3', '−1 ×2 +1'], 'FEI-03': ['+2 ×3 −2 ×2'],
  'FEI-04': ['−1 −3 +3 ×2', '−2 −2 +3 ×2'], 'FEI-05': ['+1 +2 ×3 −1 +2'], 'FEI-06': ['+1 ×2 +1 ×2 −2', '+2 +2 +1 ×2 −2']
};
test('feilsøking: alle enkeltbytter undersøkt, flere reparasjoner godtas', () => {
  for (const [id, fasit] of Object.entries(FEI_FASIT)) {
    const t = T(id); const o = t.komponenter.operasjoner; const egen = []; const motor = [];
    for (let i = 0; i < o.length; i++) for (const v of t.komponenter.valg) {
      const ny = o.slice(); ny[i] = v;
      if (minMaskin(t, ny)) egen.push(opStr(ny));
      if (E.sjekk(t, { ops: ny }).ok) motor.push(opStr(ny));
    }
    assert.deepEqual([...new Set(egen)].sort(), fasit.slice().sort(), id + ' egen');
    assert.deepEqual([...new Set(motor)].sort(), fasit.slice().sort(), id + ' motor');
    assert.equal(t.gyldighetskontroll.antall_løsninger, fasit.length, id);
    assert.equal(E.sjekk(t, t.starttilstand).ok, false, id + ' start er feil');
  }
});
test('feilsøking: regelbrudd forklares', () => {
  const op = s => ({ op: s[0] === '−' ? '-' : s[0], n: +s.slice(1) });
  const t4 = T('FEI-04'); const tre = t4.komponenter.operasjoner.slice(); tre[3] = op('×3');
  assert.match(E.sjekk(t4, { ops: tre }).melding, /under 0/);
  const t5 = T('FEI-05'); const tak = t5.komponenter.operasjoner.slice(); tak[4] = op('−1');
  assert.ok(E.sjekk(t5, { ops: tak }).melding.includes('over 20'));
  const to = T('FEI-01').komponenter.operasjoner.slice(); to[0] = op('×3'); to[2] = op('+1');
  assert.match(E.sjekk(T('FEI-01'), { ops: to }).melding, /byttet 2 deler/);
  assert.match(E.sjekk(T('FEI-01'), T('FEI-01').starttilstand).melding, /Se hva denne brikken gjør/);
  assert.equal(E.gyldigTilstand(T('FEI-01'), { ops: [op('×9'), op('×2'), op('−1')] }), false);
});

// ---------------------------------------------------------------- felles
test('eksempelløsning består, starttilstand avvises, start er gyldig tilstand', () => {
  for (const t of D.OPPGAVER) {
    assert.ok(E.gyldigTilstand(t, t.starttilstand), t.id + ' start gyldig');
    assert.ok(E.gyldigTilstand(t, t.eksempelløsning), t.id + ' eksempel gyldig');
    assert.ok(E.sjekk(t, t.eksempelløsning).ok, t.id + ' eksempel består: ' + E.sjekk(t, t.eksempelløsning).melding);
    assert.equal(E.sjekk(t, E.start(t)).ok, false, t.id + ' start avvises');
    assert.ok(E.løsninger(t).length >= 1, t.id);
    for (const l of E.løsninger(t)) assert.ok(E.sjekk(t, l).ok, t.id + ' motorens løsning består');
  }
});

// ---------------------------------------------------------------- lagring
function minneLager() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }, _m: m }; }
test('lagring: rens redder gyldig og dropper ødelagt forsøk', () => {
  const rå = { versjon: 1, gjeldende: 'REK-02', forsøk: { 'REK-02': ['stjerne', 'sirkel', 'firkant', 'trekant'], 'SIG-01': { A: 'kanskje' }, 'XXX-99': 1 },
    løst: { 'SIG-01': true, 'SIG-02': 'ja' }, hint: { 'MON-01': 2, 'MON-02': 9 }, innstillinger: { storTekst: true, ukjent: 1 } };
  const { data, advarsler } = S.rens(rå, D.OPPGAVER, E);
  assert.equal(data.gjeldende, 'REK-02');
  assert.deepEqual(Object.keys(data.forsøk), ['REK-02']);
  assert.deepEqual(data.løst, { 'SIG-01': true });
  assert.deepEqual(data.hint, { 'MON-01': 2 });
  assert.equal(data.innstillinger.storTekst, true);
  assert.ok(advarsler.some(a => a.includes('SIG-01')));
  assert.equal(S.rens({ ødelagt: true }, D.OPPGAVER, E).advarsler.length, 1);
});
test('lagring: import valideres helt før noe endres', () => {
  const god = S.eksporter({ versjon: 1, gjeldende: 'FEI-01', forsøk: { 'RUT-01': { sti: [[0, 0], [1, 0]] } }, løst: { 'SIG-01': true }, hint: { 'SIG-02': 1 }, innstillinger: { storTekst: false } });
  const r = S.validerImport(god, D.OPPGAVER, E);
  assert.ok(r.ok); assert.equal(r.data.gjeldende, 'FEI-01'); assert.deepEqual(r.data.forsøk['RUT-01'].sti, [[0, 0], [1, 0]]);
  for (const [tekst, grunn] of [
    ['', /tom/], ['{ikke json', /JSON/], ['[]', /form/], ['{"versjon":2}', /versjon/],
    ['{"versjon":1,"forsøk":{"RUT-01":{"sti":[[0,0],[2,2]]}}}', /RUT-01/],
    ['{"versjon":1,"hint":{"SIG-01":7}}', /Hint/], ['{"versjon":1,"gjeldende":"<img src=x onerror=alert(1)>"}', /ukjent/],
    ['{"versjon":1,"app":"noe-annet"}', /annen app/], ['x'.repeat(200001), /stor/]
  ]) {
    const v = S.validerImport(tekst, D.OPPGAVER, E);
    assert.equal(v.ok, false, tekst.slice(0, 40)); assert.match(v.feil, grunn);
  }
  const ukjent = S.validerImport('{"versjon":1,"løst":{"ABC-01":true,"SIG-03":true},"hemmelig":"<script>"}', D.OPPGAVER, E);
  assert.ok(ukjent.ok); assert.deepEqual(ukjent.data.løst, { 'SIG-03': true }); assert.deepEqual(ukjent.ignorert, ['ABC-01']);
  assert.equal(ukjent.data.hemmelig, undefined);
});
test('lagring: fall tilbake til minnet når localStorage nekter', () => {
  const nekter = { getItem() { throw new Error('nei'); }, setItem() { throw new Error('nei'); }, removeItem() {} };
  const l = S.åpne(nekter); assert.equal(l.varig, false);
  assert.equal(l.skriv({ versjon: 1 }), false); assert.deepEqual(l.les(), { versjon: 1 });
  const ok = S.åpne(minneLager()); assert.equal(ok.varig, true); ok.skriv({ versjon: 1, x: 2 }); assert.deepEqual(ok.les(), { versjon: 1, x: 2 });
});
