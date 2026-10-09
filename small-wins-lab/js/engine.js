/* Small Wins Lab — regelmotor.
 * Ren logikk. Ingen DOM. Ingen eval. Reglene er data; hver regeltype er en avgrenset funksjon.
 * Fungerer både i nettleser (window.SWL.engine) og i Node (module.exports).
 */
(function (root) {
  'use strict';

  // ---------- felles ----------
  function kopi(x) { return JSON.parse(JSON.stringify(x)); }
  function ok(melding, ekstra) { return Object.assign({ ok: true, melding: melding || 'Det virket.' }, ekstra || {}); }
  function feil(melding, ekstra) { return Object.assign({ ok: false, melding: melding }, ekstra || {}); }

  // =====================================================================
  // SIGNALER — brytere og porter
  // =====================================================================
  const PORTER = {
    NOT: { f: v => !v[0], tekst: 'NOT snur signalet: på blir av, og av blir på.' },
    AND: { f: v => v.every(Boolean), tekst: 'AND gir signal bare når alle inngangene er på.' },
    OR: { f: v => v.some(Boolean), tekst: 'OR gir signal når minst én inngang er på.' },
    XOR: { f: v => v.filter(Boolean).length === 1, tekst: 'XOR gir signal når nøyaktig én inngang er på.' }
  };

  // Regner ut kretsen. spor får én linje per port, i rekkefølgen signalet går.
  function evalKrets(node, inn, spor) {
    if (typeof node === 'string') return !!inn[node];
    const verdier = node.inn.map(n => evalKrets(n, inn, spor));
    const port = PORTER[node.port];
    if (!port) throw new Error('Ukjent port: ' + node.port);
    const ut = port.f(verdier);
    if (spor) spor.push({ id: node.id, port: node.port, inn: node.inn.map(n => (typeof n === 'string' ? n : n.id)), verdier, ut });
    return ut;
  }

  const signal = {
    start(t) { return kopi(t.starttilstand); },
    gyldigTilstand(t, s) {
      if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
      const keys = Object.keys(s);
      return keys.length === t.komponenter.brytere.length &&
        t.komponenter.brytere.every(b => typeof s[b] === 'boolean');
    },
    beregn(t, s) {
      const spor = [];
      const lampe = evalKrets(t.komponenter.krets, s, spor);
      return { lampe, spor, antallPå: t.komponenter.brytere.filter(b => s[b]).length };
    },
    sjekk(t, s) {
      if (!signal.gyldigTilstand(t, s)) return feil('Forsøket kunne ikke leses.');
      const r = signal.beregn(t, s);
      for (const regel of t.regler) {
        if (regel.type === 'lampe' && r.lampe !== regel.verdi) {
          const siste = r.spor[r.spor.length - 1];
          const innTekst = siste.inn.map((n, i) => n + ' = ' + (siste.verdier[i] ? 'PÅ' : 'AV')).join(', ');
          return feil((regel.verdi ? 'Lampen lyser ikke.' : 'Lampen lyser, men den skal være av.') +
            ' ' + siste.port + '-porten får ' + innTekst + '. ' + PORTER[siste.port].tekst, { regel });
        }
        if (regel.type === 'antallPå' && r.antallPå !== regel.antall) {
          return feil('Nå er ' + r.antallPå + ' ' + (r.antallPå === 1 ? 'bryter' : 'brytere') + ' på. Regelen sier nøyaktig ' + regel.antall + '.', { regel });
        }
        if (regel.type === 'låst' && s[regel.bryter] !== regel.verdi) {
          return feil('Bryter ' + regel.bryter + ' skal stå ' + (regel.verdi ? 'PÅ' : 'AV') + '.', { regel });
        }
      }
      return ok();
    },
    // Alle 2^n kombinasjoner
    alleTilstander(t) {
      const b = t.komponenter.brytere, ut = [];
      for (let m = 0; m < (1 << b.length); m++) {
        const s = {};
        b.forEach((navn, i) => { s[navn] = !!(m & (1 << i)); });
        ut.push(s);
      }
      return ut;
    },
    løsninger(t) { return signal.alleTilstander(t).filter(s => signal.sjekk(t, s).ok); }
  };

  // =====================================================================
  // REKKEFØLGE — flyttbare kort
  // =====================================================================
  function kortNavn(t, id) {
    const k = t.komponenter.kort.find(x => x.id === id);
    return k ? k.navn + ' ' + k.symbol : id;
  }
  function stor(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  const REK_REGLER = {
    før: (o, r) => o.indexOf(r.a) < o.indexOf(r.b),
    rettEtter: (o, r) => o.indexOf(r.b) === o.indexOf(r.a) + 1,
    nabo: (o, r) => Math.abs(o.indexOf(r.a) - o.indexOf(r.b)) === 1,
    ikkeNabo: (o, r) => Math.abs(o.indexOf(r.a) - o.indexOf(r.b)) !== 1,
    først: (o, r) => o[0] === r.a,
    sist: (o, r) => o[o.length - 1] === r.a,
    ikkeFørst: (o, r) => o[0] !== r.a,
    ikkeSist: (o, r) => o[o.length - 1] !== r.a,
    plass: (o, r) => o.indexOf(r.a) === r.plass - 1
  };

  function rekKonfliktTekst(t, o, r) {
    const A = kortNavn(t, r.a), B = r.b ? kortNavn(t, r.b) : '';
    const pa = o.indexOf(r.a) + 1, pb = r.b ? o.indexOf(r.b) + 1 : 0;
    switch (r.type) {
      case 'før': return stor(A) + ' må komme før ' + B + '. Nå står ' + A + ' på plass ' + pa + ' og ' + B + ' på plass ' + pb + '.';
      case 'rettEtter': return stor(B) + ' må komme rett etter ' + A + '. Nå står ' + B + ' på plass ' + pb + ' og ' + A + ' på plass ' + pa + '.';
      case 'nabo': return stor(A) + ' og ' + B + ' må stå ved siden av hverandre. Nå står de på plass ' + pa + ' og ' + pb + '.';
      case 'ikkeNabo': return stor(A) + ' og ' + B + ' får ikke stå ved siden av hverandre.';
      case 'først': return stor(A) + ' må stå først. Nå står det på plass ' + pa + '.';
      case 'sist': return stor(A) + ' må stå sist. Nå står det på plass ' + pa + '.';
      case 'ikkeFørst': return stor(A) + ' får ikke stå først.';
      case 'ikkeSist': return stor(A) + ' får ikke stå sist.';
      case 'plass': return stor(A) + ' må stå på plass ' + r.plass + '. Nå står det på plass ' + pa + '.';
    }
    return 'Ukjent regel.';
  }

  function permutasjoner(a) {
    if (a.length <= 1) return [a.slice()];
    const ut = [];
    a.forEach((x, i) => {
      const rest = a.slice(0, i).concat(a.slice(i + 1));
      permutasjoner(rest).forEach(p => ut.push([x].concat(p)));
    });
    return ut;
  }

  const rekkefølge = {
    start(t) { return kopi(t.starttilstand); },
    gyldigTilstand(t, s) {
      const ids = t.komponenter.kort.map(k => k.id);
      return Array.isArray(s) && s.length === ids.length &&
        ids.every(id => s.filter(x => x === id).length === 1);
    },
    konflikter(t, s) {
      return t.regler.filter(r => !REK_REGLER[r.type](s, r));
    },
    sjekk(t, s) {
      if (!rekkefølge.gyldigTilstand(t, s)) return feil('Forsøket kunne ikke leses.');
      const k = rekkefølge.konflikter(t, s);
      if (k.length) return feil(rekKonfliktTekst(t, s, k[0]), { regel: k[0], antallKonflikter: k.length });
      return ok();
    },
    flytt(s, fra, til) {
      if (til < 0 || til >= s.length || fra === til) return s.slice();
      const ny = s.slice(); const [x] = ny.splice(fra, 1); ny.splice(til, 0, x); return ny;
    },
    løsninger(t) {
      return permutasjoner(t.komponenter.kort.map(k => k.id)).filter(p => rekkefølge.sjekk(t, p).ok);
    }
  };

  // =====================================================================
  // MØNSTRE — fyll tomme plasser
  // =====================================================================
  const EGENSKAP_NAVN = { form: 'formen', fyll: 'fyllet', antall: 'antallet', tall: 'tallet' };

  function fullSekvens(t, s) {
    let j = 0;
    return t.komponenter.sekvens.map(x => {
      if (x !== null) return x;
      const valg = s.svar[j++];
      return valg === null || valg === undefined ? null : t.komponenter.palett[valg];
    });
  }

  // Forventet verdi for en egenskap på plass i, utledet fra de gitte (ikke-tomme) plassene.
  function forventet(t, regel, i) {
    const sek = t.komponenter.sekvens;
    if (regel.type === 'periode') {
      for (let j = i % regel.periode; j < sek.length; j += regel.periode) {
        if (sek[j] !== null) return { verdi: sek[j][regel.egenskap], kilde: j };
      }
      return null;
    }
    if (regel.type === 'syklus') {
      const v = regel.verdier;
      for (let j = 0; j < sek.length; j++) {
        if (sek[j] !== null) {
          const k = v.indexOf(sek[j][regel.egenskap]);
          return { verdi: v[(((k + i - j) % v.length) + v.length) % v.length], kilde: j };
        }
      }
    }
    return null;
  }

  function visVerdi(egenskap, v) {
    const ord = { sirkel: 'sirkel', trekant: 'trekant', firkant: 'firkant', fylt: 'fylt', hul: 'hul' };
    return ord[v] || String(v);
  }

  const mønster = {
    start(t) { return kopi(t.starttilstand); },
    gyldigTilstand(t, s) {
      const blanke = t.komponenter.sekvens.filter(x => x === null).length;
      return !!s && Array.isArray(s.svar) && s.svar.length === blanke &&
        s.svar.every(v => v === null || (Number.isInteger(v) && v >= 0 && v < t.komponenter.palett.length));
    },
    sjekk(t, s) {
      if (!mønster.gyldigTilstand(t, s)) return feil('Forsøket kunne ikke leses.');
      const full = fullSekvens(t, s);
      const tom = full.findIndex(x => x === null);
      if (tom >= 0) return feil('Plass ' + (tom + 1) + ' er tom. Fyll alle tomme plasser først.', { plass: tom });
      for (let i = 0; i < full.length; i++) {
        if (t.komponenter.sekvens[i] !== null) continue; // gitte plasser er låst
        for (const regel of t.regler) {
          const f = forventet(t, regel, i);
          if (f && full[i][regel.egenskap] !== f.verdi) {
            return feil('Plass ' + (i + 1) + ': ' + EGENSKAP_NAVN[regel.egenskap] + ' skal være ' + visVerdi(regel.egenskap, f.verdi) +
              '. ' + regel.tekst, { regel, plass: i });
          }
        }
      }
      return ok();
    },
    løsninger(t) {
      const n = t.komponenter.sekvens.filter(x => x === null).length, p = t.komponenter.palett.length, ut = [];
      const tot = Math.pow(p, n);
      for (let m = 0; m < tot; m++) {
        const svar = []; let x = m;
        for (let i = 0; i < n; i++) { svar.push(x % p); x = Math.floor(x / p); }
        if (mønster.sjekk(t, { svar }).ok) ut.push({ svar });
      }
      return ut;
    },
    fullSekvens,
    forventet
  };

  // =====================================================================
  // RUTER — rutenett med start, mål, hindringer og kontrollpunkter
  // =====================================================================
  function finn(nett, tegn) {
    const ut = [];
    nett.forEach((rad, r) => [...rad].forEach((c, k) => { if (c === tegn) ut.push([r, k]); }));
    return ut;
  }
  function kontrollpunkter(nett) {
    const ut = [];
    nett.forEach((rad, r) => [...rad].forEach((c, k) => { if (/[1-9]/.test(c)) ut.push({ id: c, pos: [r, k] }); }));
    return ut.sort((a, b) => a.id.localeCompare(b.id));
  }

  const rute = {
    start(t) { return kopi(t.starttilstand); },
    info(t) {
      const nett = t.komponenter.rutenett;
      return { nett, rader: nett.length, kol: nett[0].length, start: finn(nett, 'S')[0], mål: finn(nett, 'M')[0], kp: kontrollpunkter(nett) };
    },
    // Kan man gå fra a til b? Returnerer null eller en forklaring.
    stegFeil(t, a, b) {
      const I = rute.info(t);
      if (b[0] < 0 || b[1] < 0 || b[0] >= I.rader || b[1] >= I.kol) return 'Der slutter brettet. Du kan ikke gå utenfor.';
      const d = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
      if (d === 0) return 'Du står allerede der.';
      if (d !== 1) return (a[0] !== b[0] && a[1] !== b[1] && Math.abs(a[0] - b[0]) === 1 && Math.abs(a[1] - b[1]) === 1)
        ? 'Du kan ikke gå på skrå. Gå ett felt opp, ned, til venstre eller til høyre.'
        : 'Du kan bare gå ett felt av gangen.';
      if (I.nett[b[0]][b[1]] === '#') return 'Der står en stein. Du kan ikke gå gjennom den.';
      return null;
    },
    gyldigTilstand(t, s) {
      if (!s || !Array.isArray(s.sti) || s.sti.length < 1) return false;
      if (!s.sti.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger))) return false;
      const I = rute.info(t);
      if (s.sti[0][0] !== I.start[0] || s.sti[0][1] !== I.start[1]) return false;
      for (let i = 1; i < s.sti.length; i++) if (rute.stegFeil(t, s.sti[i - 1], s.sti[i])) return false;
      return true;
    },
    // Bredde-først-søk over (posisjon, besøkte kontrollpunkter). Gir korteste antall steg.
    korteste(t) {
      const I = rute.info(t);
      const alle = (1 << I.kp.length) - 1;
      const kpIndeks = (r, c) => I.kp.findIndex(k => k.pos[0] === r && k.pos[1] === c);
      const nøkkel = (r, c, m) => r + ',' + c + ',' + m;
      let m0 = 0; const k0 = kpIndeks(I.start[0], I.start[1]); if (k0 >= 0) m0 |= 1 << k0;
      const kø = [[I.start[0], I.start[1], m0, 0]]; const sett = new Set([nøkkel(I.start[0], I.start[1], m0)]);
      while (kø.length) {
        const [r, c, m, d] = kø.shift();
        if (r === I.mål[0] && c === I.mål[1] && m === alle) return d;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= I.rader || nc >= I.kol || I.nett[nr][nc] === '#') continue;
          let nm = m; const ki = kpIndeks(nr, nc); if (ki >= 0) nm |= 1 << ki;
          const k = nøkkel(nr, nc, nm); if (sett.has(k)) continue;
          sett.add(k); kø.push([nr, nc, nm, d + 1]);
        }
      }
      return -1;
    },
    // Én korteste rute (brukes som demonstrasjon; alle ruter med samme lengde godtas).
    enKorteste(t) {
      const I = rute.info(t);
      const alle = (1 << I.kp.length) - 1;
      const kpIndeks = (r, c) => I.kp.findIndex(k => k.pos[0] === r && k.pos[1] === c);
      const k0 = kpIndeks(I.start[0], I.start[1]);
      const første = { r: I.start[0], c: I.start[1], m: k0 >= 0 ? 1 << k0 : 0, forrige: null };
      const kø = [første]; const sett = new Set([første.r + ',' + første.c + ',' + første.m]);
      while (kø.length) {
        const n = kø.shift();
        if (n.r === I.mål[0] && n.c === I.mål[1] && n.m === alle) {
          const sti = []; for (let x = n; x; x = x.forrige) sti.unshift([x.r, x.c]); return sti;
        }
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const r = n.r + dr, c = n.c + dc;
          if (r < 0 || c < 0 || r >= I.rader || c >= I.kol || I.nett[r][c] === '#') continue;
          const ki = kpIndeks(r, c); const m = ki >= 0 ? n.m | (1 << ki) : n.m;
          const k = r + ',' + c + ',' + m; if (sett.has(k)) continue;
          sett.add(k); kø.push({ r, c, m, forrige: n });
        }
      }
      return null;
    },
    løsninger(t) { const sti = rute.enKorteste(t); return sti ? [{ sti }] : []; },
    sjekk(t, s) {
      if (!rute.gyldigTilstand(t, s)) return feil('Ruten har et ulovlig steg.');
      const I = rute.info(t);
      const siste = s.sti[s.sti.length - 1];
      if (siste[0] !== I.mål[0] || siste[1] !== I.mål[1]) return feil('Ruten slutter ikke på målet (M). Gå videre til målet.');
      for (const regel of t.regler) {
        if (regel.type === 'kontrollpunkter') {
          const mangler = I.kp.filter(k => !s.sti.some(p => p[0] === k.pos[0] && p[1] === k.pos[1]));
          if (mangler.length) return feil('Du har ikke vært innom kontrollpunkt ' + mangler.map(k => k.id).join(' og ') + '. Ruten må gå gjennom ' + (I.kp.length > 1 ? 'alle kontrollpunktene' : 'kontrollpunktet') + ' før målet.', { regel });
        }
        if (regel.type === 'korteste') {
          const best = rute.korteste(t), steg = s.sti.length - 1;
          if (steg !== best) return feil('Du kom fram på ' + steg + ' steg. Den korteste ruten er ' + best + ' steg. Finn en kortere vei.', { regel, steg, best });
        }
      }
      return ok('Det virket.', { steg: s.sti.length - 1 });
    }
  };

  // =====================================================================
  // FEILSØKING — tallmaskiner
  // =====================================================================
  function brukOp(x, o) {
    if (o.op === '+') return x + o.n;
    if (o.op === '-') return x - o.n;
    if (o.op === '×') return x * o.n;
    throw new Error('Ukjent operasjon: ' + o.op);
  }
  function opTekst(o) { return (o.op === '-' ? '−' : o.op) + ' ' + o.n; }
  function likOp(a, b) { return a.op === b.op && a.n === b.n; }

  const feilsøk = {
    start(t) { return kopi(t.starttilstand); },
    kjør(start, ops) {
      const mellom = [start]; let x = start;
      ops.forEach(o => { x = brukOp(x, o); mellom.push(x); });
      return mellom;
    },
    endringer(t, s) {
      return s.ops.map((o, i) => (likOp(o, t.komponenter.operasjoner[i]) ? -1 : i)).filter(i => i >= 0);
    },
    gyldigTilstand(t, s) {
      if (!s || !Array.isArray(s.ops) || s.ops.length !== t.komponenter.operasjoner.length) return false;
      return s.ops.every((o, i) => o && typeof o === 'object' &&
        (likOp(o, t.komponenter.operasjoner[i]) || t.komponenter.valg.some(v => likOp(v, o))));
    },
    sjekk(t, s) {
      if (!feilsøk.gyldigTilstand(t, s)) return feil('Maskinen har en del som ikke er lov.');
      const låste = t.komponenter.låste || [];
      const endr = feilsøk.endringer(t, s);
      const mellom = feilsøk.kjør(t.komponenter.start, s.ops);
      for (const i of endr) if (låste.includes(i)) return feil('Del ' + (i + 1) + ' er låst og kan ikke byttes.');
      for (const regel of t.regler) {
        if (regel.type === 'maksEndringer' && endr.length > regel.n) {
          return feil('Du har byttet ' + endr.length + ' deler. Bare ' + regel.n + ' bytte er lov. Angre et av byttene.', { regel });
        }
      }
      if (endr.length === 0) return feil('Se hva denne brikken gjør. Ingen del er byttet ennå, og maskinen gir ' + mellom[mellom.length - 1] + '.');
      for (const regel of t.regler) {
        if (regel.type === 'aldriOver') {
          const i = mellom.findIndex(v => v > regel.n);
          if (i >= 0) return feil('Etter del ' + i + ' er tallet ' + mellom[i] + '. Det får aldri bli over ' + regel.n + '.', { regel });
        }
        if (regel.type === 'aldriUnder') {
          const i = mellom.findIndex(v => v < regel.n);
          if (i >= 0) return feil('Etter del ' + i + ' er tallet ' + mellom[i] + '. Det får aldri bli under ' + regel.n + '.', { regel });
        }
        if (regel.type === 'mellom' && mellom[regel.etter] !== regel.verdi) {
          return feil('Etter del ' + regel.etter + ' skal tallet være ' + regel.verdi + '. Nå er det ' + mellom[regel.etter] + '.', { regel });
        }
      }
      const slutt = mellom[mellom.length - 1];
      const mål = t.regler.find(r => r.type === 'resultat').mål;
      if (slutt !== mål) return feil('Maskinen gir ' + slutt + '. Målet er ' + mål + '.');
      return ok();
    },
    // Alle reparasjoner med inntil maksEndringer bytter blant tillatte valg.
    løsninger(t) {
      const ops = t.komponenter.operasjoner, valg = t.komponenter.valg;
      const maks = (t.regler.find(r => r.type === 'maksEndringer') || { n: ops.length }).n;
      const ut = []; const sett = new Set();
      function rek(fra, nå, igjen) {
        const s = { ops: nå };
        const k = JSON.stringify(nå);
        if (!sett.has(k)) { sett.add(k); if (feilsøk.sjekk(t, s).ok) ut.push(kopi(s)); }
        if (igjen === 0) return;
        for (let i = fra; i < ops.length; i++) {
          for (const v of valg) {
            if (likOp(v, ops[i])) continue;
            const ny = nå.slice(); ny[i] = v; rek(i + 1, ny, igjen - 1);
          }
        }
      }
      rek(0, ops.slice(), maks);
      return ut;
    },
    opTekst
  };

  const TYPER = { signaler: signal, rekkefølge, mønstre: mønster, ruter: rute, feilsøking: feilsøk };

  const engine = {
    TYPER, PORTER, signal, rekkefølge, mønster, rute, feilsøk, evalKrets, permutasjoner, kortNavn, opTekst,
    type(t) { return TYPER[t.tema]; },
    start(t) { return TYPER[t.tema].start(t); },
    sjekk(t, s) { return TYPER[t.tema].sjekk(t, s); },
    gyldigTilstand(t, s) { try { return TYPER[t.tema].gyldigTilstand(t, s); } catch (e) { return false; } },
    løsninger(t) { return TYPER[t.tema].løsninger(t); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  else { root.SWL = root.SWL || {}; root.SWL.engine = engine; }
})(typeof window !== 'undefined' ? window : globalThis);
