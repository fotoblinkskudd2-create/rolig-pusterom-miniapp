// Beslutningslag. Lukkede spørsmål, faste alternativer, typet svar.
// Modellen (hvis noen) gir råd. Koden handler.
// Fungerer i nettleser (globalThis.Decision) og i Node (module.exports).
(function (root) {
  const THRESHOLD = 0.85;

  // Indekser i actions-lista i index.html. Fakta, ikke konklusjoner.
  const GROUNDING = 2;   // føttene i gulvet
  const BREATH = 4;      // tre dype pust
  const OUTSIDE = 0;     // gå ut

  // Spørsmålet bygges på nytt hver gang, så et grep som er gjort i dag aldri kan velges.
  function nextActionQuestion(actions, facts) {
    const done = new Set(facts.doneToday || []);
    const options = actions.map((_, i) => String(i)).filter(i => !done.has(Number(i)));
    return {
      id: 'neste_grep',
      text: 'Hvilket grep skal foreslås nå?',
      options,
      labels: Object.fromEntries(options.map(i => [i, actions[i]])),
      state: { mood: facts.mood, hour: facts.hour, doneToday: [...done] }
    };
  }

  // Deterministisk regel. Gratis, lokal, alltid tilgjengelig.
  function localRule(q) {
    const has = i => q.options.includes(String(i));
    const mood = Number(q.state.mood) || 3;
    const late = q.state.hour >= 21 || q.state.hour < 6;
    let pick = null;
    if (mood <= 2) pick = [GROUNDING, BREATH].find(has);
    if (pick == null) pick = q.options.map(Number).find(i => !(late && i === OUTSIDE));
    if (pick == null) pick = q.options.map(Number)[0];
    return { label: pick == null ? null : String(pick), confidence: 1 };
  }

  async function decide(q, { transport = null, threshold = THRESHOLD, log = null } = {}) {
    const t0 = Date.now();
    let out;
    if (q.options.length === 0) {
      out = { label: null, confidence: 1, source: 'none', escalated: false };
    } else if (!transport) {
      out = { ...localRule(q), source: 'local', escalated: false };
    } else {
      let r = null, reason = null;
      try { r = await transport(q); } catch (e) { reason = 'transport_error'; }
      if (r && !q.options.includes(r.label)) reason = 'invalid_label';
      else if (r && !(r.confidence >= threshold)) reason = 'low_confidence';
      out = reason
        ? { ...localRule(q), source: 'local', escalated: true, reason, advised: r }
        : { label: r.label, confidence: r.confidence, source: 'jev', escalated: false };
    }
    out.ms = Date.now() - t0;
    if (log) log({ at: new Date().toISOString(), question: q.id, options: q.options, ...out });
    return out;
  }

  // Brier-score over loggede beslutninger med kjent utfall. Lavere er bedre.
  function brier(entries) {
    if (!entries.length) return null;
    return entries.reduce((s, e) => s + (e.confidence - (e.correct ? 1 : 0)) ** 2, 0) / entries.length;
  }

  const api = { decide, nextActionQuestion, localRule, brier, THRESHOLD };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Decision = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
