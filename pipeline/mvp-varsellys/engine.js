'use strict';
// Varsellys signalmotor. Ren funksjon: innsjekker + regler -> status.
// Innsjekk: { date:'YYYY-MM-DD', sleep:Number(timer), mood:-3..3, energy:1..5, meds:Boolean }

const LEVEL = { green: 0, yellow: 1, red: 2 };

const DEFAULT_RULES = [
  { id: 'sleep_drop', on: true, level: 'yellow', nights: 2, hours: 2,
    label: 'Søvn minst {hours} t under din normal {nights} netter på rad' },
  { id: 'sleep_drop_hard', on: true, level: 'red', nights: 3, hours: 3,
    label: 'Søvn minst {hours} t under din normal {nights} netter på rad' },
  { id: 'mood_high', on: true, level: 'yellow', days: 3, threshold: 2,
    label: 'Humør +{threshold} eller høyere {days} dager på rad' },
  { id: 'mood_low', on: true, level: 'yellow', days: 4, threshold: -2,
    label: 'Humør {threshold} eller lavere {days} dager på rad' },
  { id: 'meds_missed', on: true, level: 'yellow', days: 2,
    label: 'Medisin ikke tatt {days} dager på rad' },
  { id: 'high_energy_low_sleep', on: true, level: 'red', days: 2, energy: 5, maxSleep: 5,
    label: 'Energi {energy}/5 og under {maxSleep} t søvn {days} dager på rad' }
];

function describe(rule) {
  return rule.label.replace(/\{(\w+)\}/g, (_, k) => rule[k]);
}

function sortByDate(checkins) {
  return [...checkins].sort((a, b) => a.date.localeCompare(b.date));
}

// Personlig søvnnormal = median av opptil 14 innsjekker før de siste `exclude`.
function sleepBaseline(sorted, exclude) {
  const pool = sorted.slice(0, Math.max(0, sorted.length - exclude)).slice(-14)
    .map(c => c.sleep).filter(n => typeof n === 'number');
  if (pool.length < 5) return null;
  const s = [...pool].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Sant hvis de siste n innsjekkene ligger på sammenhengende datoer og alle oppfyller pred.
function lastNConsecutive(sorted, n, pred) {
  if (sorted.length < n) return false;
  const tail = sorted.slice(-n);
  for (let i = 1; i < tail.length; i++) {
    const gap = (Date.parse(tail[i].date) - Date.parse(tail[i - 1].date)) / 864e5;
    if (gap !== 1) return false;
  }
  return tail.every(pred);
}

function evaluate(checkins, rules = DEFAULT_RULES) {
  const sorted = sortByDate(checkins);
  const hits = [];
  for (const r of rules) {
    if (!r.on) continue;
    let hit = false;
    if (r.id.startsWith('sleep_drop')) {
      const base = sleepBaseline(sorted, r.nights);
      hit = base !== null && lastNConsecutive(sorted, r.nights, c => base - c.sleep >= r.hours);
      if (hit) hits.push({ id: r.id, level: r.level, text: describe(r), detail: `Din normal: ${base} t` });
      continue;
    }
    if (r.id === 'mood_high') hit = lastNConsecutive(sorted, r.days, c => c.mood >= r.threshold);
    if (r.id === 'mood_low') hit = lastNConsecutive(sorted, r.days, c => c.mood <= r.threshold);
    if (r.id === 'meds_missed') hit = lastNConsecutive(sorted, r.days, c => c.meds === false);
    if (r.id === 'high_energy_low_sleep')
      hit = lastNConsecutive(sorted, r.days, c => c.energy >= r.energy && c.sleep < r.maxSleep);
    if (hit) hits.push({ id: r.id, level: r.level, text: describe(r) });
  }
  // To gule samtidig = rød.
  let level = hits.reduce((m, h) => LEVEL[h.level] > LEVEL[m] ? h.level : m, 'green');
  if (level === 'yellow' && hits.filter(h => h.level === 'yellow').length >= 2) level = 'red';
  return { level, hits, baseline: sleepBaseline(sorted, 0), days: sorted.length };
}

module.exports = { evaluate, sleepBaseline, DEFAULT_RULES, describe };
