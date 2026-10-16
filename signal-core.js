// Signal — kjernelogikk. Ingen DOM. Kjøres i nettleser og i node (test).
// Tre punkter per dag: søvn (timer), aktivitet 1–5, irritabilitet 1–5.
// Flagger kun når mønsteret bryter brukerens EGEN baseline, og vedvarer.
(function (root) {
  const RULES = {
    minBaselineDays: 7,     // før dette: ingen flagg, bare «lærer»
    baselineWindow: 28,     // dager bakover som utgjør baseline
    recentWindow: 3,        // siste dager som vurderes (holdes utenfor baseline)
    sleepDeltaH: 1.5,       // timer fra baseline-median
    scaleDelta: 1.5,        // poeng fra baseline-median på 1–5
    daysNeeded: 2,          // av recentWindow må så mange dager avvike
    signalsPerDay: 2,       // avvikende signaler som kreves samme dag
    hardSleepH: 4,          // under dette to netter på rad = flagg uansett baseline
  };

  function dayKey(d) {
    const x = new Date(d);
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }

  function addDays(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + n));
  }

  function median(xs) {
    if (!xs.length) return null;
    const s = [...xs].sort((a, b) => a - b);
    const mid = s.length >> 1;
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  // entries: [{day:'YYYY-MM-DD', sleep:Number, activity:1-5, irritability:1-5}]
  function baseline(entries, today, r = RULES) {
    const recentStart = addDays(today, -(r.recentWindow - 1));
    const baseStart = addDays(recentStart, -r.baselineWindow);
    const base = entries.filter(e => e.day >= baseStart && e.day < recentStart);
    return {
      n: base.length,
      sleep: median(base.map(e => e.sleep)),
      activity: median(base.map(e => e.activity)),
      irritability: median(base.map(e => e.irritability)),
    };
  }

  // Retning: 'opp' = mindre søvn / mer aktivitet / mer irritabilitet (hypomani-retning)
  //          'ned' = mer søvn / mindre aktivitet (depressiv retning)
  function deviations(e, b, r = RULES) {
    const out = [];
    const ds = e.sleep - b.sleep;
    if (ds <= -r.sleepDeltaH) out.push({ signal: 'søvn', dir: 'opp', text: `søvn ${fmt(-ds)} t under vanlig` });
    if (ds >= r.sleepDeltaH) out.push({ signal: 'søvn', dir: 'ned', text: `søvn ${fmt(ds)} t over vanlig` });
    const da = e.activity - b.activity;
    if (da >= r.scaleDelta) out.push({ signal: 'aktivitet', dir: 'opp', text: 'aktivitet tydelig høyere' });
    if (da <= -r.scaleDelta) out.push({ signal: 'aktivitet', dir: 'ned', text: 'aktivitet tydelig lavere' });
    const di = e.irritability - b.irritability;
    // Irritabilitet hører til begge poler; teller som «opp» bare sammen med opp-signal, ellers nøytral
    if (di >= r.scaleDelta) out.push({ signal: 'irritabilitet', dir: 'begge', text: 'irritabilitet tydelig høyere' });
    return out;
  }

  function fmt(n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); }

  function dayDirection(devs, r = RULES) {
    if (devs.length < r.signalsPerDay) return null;
    const opp = devs.filter(d => d.dir === 'opp' || d.dir === 'begge').length;
    const ned = devs.filter(d => d.dir === 'ned' || d.dir === 'begge').length;
    if (opp >= r.signalsPerDay && opp >= ned) return 'opp';
    if (ned >= r.signalsPerDay) return 'ned';
    return null;
  }

  // Returnerer {state:'lærer'|'rolig'|'flagg', ...}
  function evaluate(entries, today = dayKey(new Date()), r = RULES) {
    const byDay = Object.fromEntries(entries.map(e => [e.day, e]));
    const recentDays = [];
    for (let i = r.recentWindow - 1; i >= 0; i--) recentDays.push(addDays(today, -i));
    const recent = recentDays.map(d => byDay[d]).filter(Boolean);

    // Hard regel: to netter på rad under hardSleepH — uavhengig av baseline
    for (let i = 1; i < recentDays.length; i++) {
      const a = byDay[recentDays[i - 1]], b = byDay[recentDays[i]];
      if (a && b && a.sleep < r.hardSleepH && b.sleep < r.hardSleepH) {
        return { state: 'flagg', direction: 'opp', reason: `Under ${r.hardSleepH} timer søvn to netter på rad.`, days: [a.day, b.day], hard: true };
      }
    }

    const b = baseline(entries, today, r);
    if (b.n < r.minBaselineDays) return { state: 'lærer', baselineDays: b.n, needed: r.minBaselineDays };

    const flagged = { opp: [], ned: [] };
    for (const e of recent) {
      const devs = deviations(e, b, r);
      const dir = dayDirection(devs, r);
      if (dir) flagged[dir].push({ day: e.day, devs });
    }
    for (const dir of ['opp', 'ned']) {
      if (flagged[dir].length >= r.daysNeeded) {
        return {
          state: 'flagg', direction: dir, baseline: b, days: flagged[dir].map(f => f.day),
          reason: flagged[dir].map(f => `${f.day}: ${f.devs.map(d => d.text).join(', ')}`).join('\n'),
        };
      }
    }
    return { state: 'rolig', baseline: b, loggedRecent: recent.length };
  }

  const api = { RULES, evaluate, baseline, deviations, dayKey, addDays, median };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SignalCore = api;
})(this);
