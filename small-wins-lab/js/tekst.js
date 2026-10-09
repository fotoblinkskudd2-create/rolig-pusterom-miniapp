/* Small Wins Lab — tekstvisning av komponenter og tilstander.
 * Brukes både av appen (fasit) og utskriftsvisningen. Bare tekst, aldri HTML.
 */
(function (root) {
  'use strict';
  const FORM = { sirkel: ['●', '○'], trekant: ['▲', '△'], firkant: ['■', '□'] };
  const FORMNAVN = { sirkel: 'sirkel', trekant: 'trekant', firkant: 'firkant' };
  const FLERTALL = { sirkel: 'sirkler', trekant: 'trekanter', firkant: 'firkanter' };

  function symbol(x) {
    if (!x) return '__';
    if (x.tall !== undefined) return String(x.tall);
    const s = FORM[x.form][x.fyll === 'hul' ? 1 : 0];
    return s.repeat(x.antall || 1);
  }
  function brikkeNavn(x) {
    if (x.tall !== undefined) return 'tallet ' + x.tall;
    const n = x.antall || 1;
    if (n > 1) return n + ' ' + FLERTALL[x.form];
    return (x.fyll === 'hul' ? 'hul ' : 'fylt ') + FORMNAVN[x.form];
  }
  function krets(node) {
    if (typeof node === 'string') return node;
    return node.port + '(' + node.inn.map(krets).join(', ') + ')';
  }
  function opTekst(o) { return (o.op === '-' ? '−' : o.op) + ' ' + o.n; }
  function kjede(start, ops) {
    let x = start; const deler = [String(start)];
    ops.forEach(o => { x = o.op === '+' ? x + o.n : o.op === '-' ? x - o.n : x * o.n; deler.push('[' + opTekst(o) + ']', String(x)); });
    return deler.join(' → ');
  }
  function retninger(sti) {
    const ut = [];
    for (let i = 1; i < sti.length; i++) {
      const dr = sti[i][0] - sti[i - 1][0], dc = sti[i][1] - sti[i - 1][1];
      ut.push(dr === 1 ? '↓' : dr === -1 ? '↑' : dc === 1 ? '→' : '←');
    }
    return ut.join(' ');
  }
  const RUTE_TEGN = { 'S': 'S', 'M': 'M', '#': '■', '.': '·' };
  function rutenett(nett) { return nett.map(rad => [...rad].map(c => RUTE_TEGN[c] || c).join(' ')); }

  // Kort tekst for en tilstand (start eller løsning).
  function tilstand(t, s, kort) {
    switch (t.tema) {
      case 'signaler': return t.komponenter.brytere.map(b => b + ' = ' + (s[b] ? 'PÅ' : 'AV')).join(', ');
      case 'rekkefølge': return s.map(id => kort[id].symbol).join('  ') + '   (' + s.map(id => kort[id].navn).join(', ') + ')';
      case 'mønstre': {
        let j = 0;
        return t.komponenter.sekvens.map(x => (x ? symbol(x) : (s.svar[j] === null || s.svar[j] === undefined ? (j++, '__') : symbol(t.komponenter.palett[s.svar[j++]])))).join('  ');
      }
      case 'ruter': return s.sti.length > 1 ? retninger(s.sti) + '  (' + (s.sti.length - 1) + ' steg)' : 'Står på S.';
      case 'feilsøking': return kjede(t.komponenter.start, s.ops);
    }
    return '';
  }

  const tekst = { FORM, symbol, brikkeNavn, krets, opTekst, kjede, retninger, rutenett, tilstand };
  if (typeof module !== 'undefined' && module.exports) module.exports = tekst;
  else { root.SWL = root.SWL || {}; root.SWL.tekst = tekst; }
})(typeof window !== 'undefined' ? window : globalThis);
