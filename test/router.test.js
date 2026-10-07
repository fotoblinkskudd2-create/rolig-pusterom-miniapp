// Kjør: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const { decide, nextActionQuestion, localRule, brier } = require('../decision/router.js');

const ACTIONS = [
  "Gå ut i frisk luft i 5 minutter",
  "Drikk et glass vann sakte",
  "Sett deg og kjenn føttene i gulvet",
  "Skriv ned én ting du er takknemlig for",
  "Ta tre dype pust der du er",
  "Legg telefonen bort i 10 minutter",
  "Strekk armene over hodet"
];

const facts = (over = {}) => ({ mood: 3, hour: 14, doneToday: [], ...over });

test('spørsmålet bygges på nytt hver gang: gjort i dag er ikke et alternativ', () => {
  const q = nextActionQuestion(ACTIONS, facts({ doneToday: [0, 1] }));
  assert.deepEqual(q.options, ['2', '3', '4', '5', '6']);
});

test('alt gjort i dag gir ingen alternativer og ingen beslutning', async () => {
  const q = nextActionQuestion(ACTIONS, facts({ doneToday: [0, 1, 2, 3, 4, 5, 6] }));
  const d = await decide(q);
  assert.equal(d.label, null);
  assert.equal(d.source, 'none');
});

test('lokal regel: lavt humør gir jording først', () => {
  const q = nextActionQuestion(ACTIONS, facts({ mood: 1 }));
  assert.equal(localRule(q).label, '2');
});

test('lokal regel: jording allerede gjort gir pust', () => {
  const q = nextActionQuestion(ACTIONS, facts({ mood: 2, doneToday: [2] }));
  assert.equal(localRule(q).label, '4');
});

test('lokal regel: sent på kvelden foreslås ikke å gå ut', () => {
  const q = nextActionQuestion(ACTIONS, facts({ mood: 4, hour: 23 }));
  assert.notEqual(localRule(q).label, '0');
});

test('uten transport: lokal regel, ingen nettverk', async () => {
  const q = nextActionQuestion(ACTIONS, facts());
  const d = await decide(q);
  assert.equal(d.source, 'local');
  assert.equal(d.escalated, false);
});

test('transport over terskel: etiketten brukes', async () => {
  const q = nextActionQuestion(ACTIONS, facts());
  const transport = async () => ({ label: '5', confidence: 0.93 });
  const d = await decide(q, { transport });
  assert.equal(d.label, '5');
  assert.equal(d.source, 'jev');
});

test('transport under terskel: eskalerer, går aldri videre i stillhet', async () => {
  const q = nextActionQuestion(ACTIONS, facts({ mood: 1 }));
  const transport = async () => ({ label: '5', confidence: 0.6 });
  const d = await decide(q, { transport });
  assert.equal(d.escalated, true);
  assert.equal(d.source, 'local');
  assert.equal(d.label, '2');
});

test('transport finner på et fjerde alternativ: avvises', async () => {
  const q = nextActionQuestion(ACTIONS, facts({ doneToday: [5] }));
  const transport = async () => ({ label: '5', confidence: 0.99 });
  const d = await decide(q, { transport });
  assert.equal(d.escalated, true);
  assert.notEqual(d.label, '5');
});

test('transport kaster: lokal regel tar over', async () => {
  const q = nextActionQuestion(ACTIONS, facts());
  const transport = async () => { throw new Error('nett nede'); };
  const d = await decide(q, { transport });
  assert.equal(d.source, 'local');
  assert.equal(d.escalated, true);
});

test('hver beslutning logges med alternativer, etikett, confidence og latens', async () => {
  const log = [];
  const q = nextActionQuestion(ACTIONS, facts());
  await decide(q, { log: e => log.push(e) });
  assert.equal(log.length, 1);
  for (const k of ['question', 'options', 'label', 'confidence', 'source', 'escalated', 'ms']) {
    assert.ok(k in log[0], k);
  }
});

test('Brier-score: perfekt = 0, helt feil = 1', () => {
  assert.equal(brier([{ confidence: 1, correct: true }]), 0);
  assert.equal(brier([{ confidence: 1, correct: false }]), 1);
  assert.equal(brier([]), null);
});

const { jevTransport, fromResponse } = require('../decision/jev-transport.js');

test('jev-transport nekter å starte uten nøkkel i miljøet', () => {
  assert.throws(() => jevTransport({ apiKey: '', endpoint: '' }), /\.env/);
});

test('jev-svar mappes til typet etikett', () => {
  const q = nextActionQuestion(ACTIONS, facts());
  assert.deepEqual(fromResponse({ answers: [{ id: 'neste_grep', answer: 4, confidence: 0.9 }] }, q), { label: '4', confidence: 0.9 });
});
