/* Small Wins Lab — brukergrensesnitt.
 * Leser oppgavedata (SWL.data), spør regelmotoren (SWL.engine) og lagrer via SWL.storage.
 * All tekst settes med textContent. Ingen innerHTML fra data eller import.
 */
(function () {
  'use strict';
  const D = SWL.data, E = SWL.engine, S = SWL.storage, X = SWL.tekst;
  const OPP = D.OPPGAVER;
  const finn = id => OPP.find(t => t.id === id);
  const temaNavn = id => D.TEMAER.find(x => x.id === id).navn;

  // ---------------------------------------------------------------- tilstand
  const lager = S.åpne();
  const lastet = S.rens(lager.les(), OPP, E);
  let P = lastet.data;                       // lagret framdrift
  let advarsler = lastet.advarsler.slice();  // vises én gang
  const økt = { historikk: {}, valgt: {}, svar: {} }; // bare i minnet

  function lagre() { lager.skriv(P); }
  function forsøk(t) { return P.forsøk[t.id] !== undefined ? P.forsøk[t.id] : E.start(t); }
  function lik(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  function settForsøk(t, ny) {
    const gammel = forsøk(t);
    if (lik(gammel, ny)) return;
    (økt.historikk[t.id] = økt.historikk[t.id] || []).push(gammel);
    P.forsøk[t.id] = ny;
    økt.svar[t.id] = null;
    lagre(); tegn();
  }
  function angre(t) {
    const nå = forsøk(t);
    const h = økt.historikk[t.id] || [];
    if (h.length) P.forsøk[t.id] = h.pop();
    else if (t.tema === 'ruter' && nå.sti.length > 1) P.forsøk[t.id] = { sti: nå.sti.slice(0, -1) };
    else { økt.svar[t.id] = { type: 'info', tittel: 'Ingenting å angre.', tekst: 'Brettet er slik det var da du begynte.' }; tegn(); return; }
    økt.svar[t.id] = { type: 'info', tittel: 'Angret.', tekst: 'Siste endring er tatt bort.' };
    lagre(); tegn();
  }
  function nullstill(t) {
    const nå = forsøk(t), start = E.start(t);
    if (lik(nå, start)) { økt.svar[t.id] = { type: 'info', tittel: 'Brettet er allerede som i starten.', tekst: '' }; tegn(); return; }
    (økt.historikk[t.id] = økt.historikk[t.id] || []).push(nå);
    P.forsøk[t.id] = start; økt.valgt[t.id] = undefined;
    økt.svar[t.id] = { type: 'info', tittel: 'Startet på nytt.', tekst: '«Angre» henter tilbake forsøket.' };
    lagre(); tegn();
  }
  function sjekk(t) {
    const s = forsøk(t);
    const r = E.sjekk(t, s);
    if (r.ok) {
      const først = !P.løst[t.id];
      P.løst[t.id] = true; lagre();
      økt.svar[t.id] = { type: 'ok', tittel: 'Det virket.', tekst: 'Du fant en løsning.' + (først ? '' : ' (Løst før – fint å prøve igjen.)'), forklaring: t.forklaring };
    } else {
      const urørt = lik(s, E.start(t)) && !/Se hva denne brikken gjør/.test(r.melding);
      økt.svar[t.id] = { type: 'feil', tittel: 'Prøv igjen.', tekst: r.melding + (urørt ? ' Se hva denne brikken gjør: endre én ting og sjekk igjen.' : '') };
    }
    tegn();
    const fb = document.getElementById('tilbakemelding'); if (fb) fb.focus({ preventScroll: false });
  }
  function hint(t) {
    P.hint[t.id] = Math.min(2, (P.hint[t.id] || 0) + 1); lagre(); tegn();
  }

  // ---------------------------------------------------------------- DOM-hjelp
  function h(tag, attrs, ...barn) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'tekst') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const b of barn.flat(Infinity)) if (b !== null && b !== undefined && b !== false) el.append(b.nodeType ? b : document.createTextNode(String(b)));
    return el;
  }
  const knapp = (tekst, onclick, attrs) => h('button', Object.assign({ type: 'button', onclick }, attrs || {}), tekst);

  // ---------------------------------------------------------------- ruting
  function rute() {
    const d = location.hash.replace(/^#\/?/, '').split('/');
    if (d[0] === 'oppgave' && finn(d[1])) return { side: 'oppgave', id: d[1] };
    if (d[0] === 'tema' && D.TEMAER.some(x => x.id === decodeURIComponent(d[1]))) return { side: 'tema', tema: decodeURIComponent(d[1]) };
    if (d[0] === 'framdrift') return { side: 'framdrift' };
    return { side: 'hjem' };
  }
  const gå = hash => { if (location.hash === hash) tegn(); else location.hash = hash; };
  const åpneOppgave = id => gå('#/oppgave/' + id);

  function nesteOppgave(id) {
    const i = OPP.findIndex(t => t.id === id);
    for (let k = 1; k <= OPP.length; k++) { const t = OPP[(i + k) % OPP.length]; if (!P.løst[t.id]) return t.id; }
    return OPP[(i + 1) % OPP.length].id;
  }
  function førsteÅpne() {
    if (P.gjeldende) return P.gjeldende;
    const t = OPP.find(x => !P.løst[x.id]); return t ? t.id : OPP[0].id;
  }

  // ---------------------------------------------------------------- tegning
  let forrigeSide = '';
  function tegn() {
    const app = document.getElementById('app');
    const fokusNøkkel = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fokus : null;
    const v = rute();
    document.body.classList.toggle('stor-tekst', !!P.innstillinger.storTekst);
    let innhold;
    if (v.side === 'oppgave') innhold = sideOppgave(finn(v.id));
    else if (v.side === 'tema') innhold = sideTema(v.tema);
    else if (v.side === 'framdrift') innhold = sideFramdrift();
    else innhold = sideHjem();
    app.replaceChildren(banner(), innhold);
    const sideNøkkel = JSON.stringify(v);
    if (sideNøkkel !== forrigeSide) { forrigeSide = sideNøkkel; window.scrollTo(0, 0); const h1 = app.querySelector('h1'); if (h1) h1.focus({ preventScroll: true }); }
    else if (fokusNøkkel) { const el = app.querySelector('[data-fokus="' + CSS.escape(fokusNøkkel) + '"]'); if (el) el.focus({ preventScroll: true }); }
  }

  function banner() {
    const l = [];
    if (!lager.varig) l.push('Framdriften lagres ikke på denne enheten. Den finnes bare mens siden er åpen. Bruk «Framdrift» for å laste den ned.');
    l.push(...advarsler);
    if (!l.length) return '';
    return h('div', { class: 'banner', role: 'status' },
      l.map(x => h('p', null, x)),
      advarsler.length ? knapp('Greit', () => { advarsler = []; tegn(); }, { class: 'liten' }) : '');
  }

  function toppNav(ekstra) {
    return h('nav', { class: 'topp', 'aria-label': 'Navigasjon' },
      h('a', { href: '#/', class: 'lenke' }, '⌂ Start'), ekstra || '');
  }

  // ---------- hjem
  function sideHjem() {
    const løste = Object.keys(P.løst).length;
    const fortsett = førsteÅpne();
    return h('section', { class: 'side hjem' },
      h('h1', { tabindex: '-1' }, 'Small Wins Lab'),
      h('p', { class: 'ingress' }, 'Små logikkoppgaver. Prøv, se hva som skjer, prøv igjen.'),
      knapp('Prøv en oppgave', () => åpneOppgave(fortsett), { class: 'primær stor', 'data-fokus': 'start' }),
      h('p', { class: 'dempet' }, P.gjeldende ? 'Du fortsetter på ' + fortsett + ' ' + finn(fortsett).tittel + '.' : 'Du begynner på ' + fortsett + '.'),
      h('h2', null, 'Velg tema'),
      h('ul', { class: 'temaliste' }, D.TEMAER.map(tm => {
        const l = OPP.filter(t => t.tema === tm.id), n = l.filter(t => P.løst[t.id]).length;
        return h('li', null, h('a', { href: '#/tema/' + encodeURIComponent(tm.id), class: 'tema-kort', 'data-fokus': 'tema-' + tm.id },
          h('span', { class: 'ikon', 'aria-hidden': 'true' }, tm.ikon),
          h('span', { class: 'tema-tekst' }, h('strong', null, tm.navn), h('span', null, tm.kort)),
          h('span', { class: 'teller' }, n + ' av 6')));
      })),
      h('p', { class: 'dempet' }, 'Løst totalt: ' + løste + ' av 30.'),
      h('div', { class: 'radknapper' },
        h('a', { href: 'print.html', class: 'knapp-lenke' }, '🖨 Oppgavekort for utskrift'),
        h('a', { href: '#/framdrift', class: 'knapp-lenke' }, '⇅ Framdrift og innstillinger')),
      h('p', { class: 'smått' }, 'Alt skjer på denne enheten. Ingen konto. Dette er en prototype som viser mekanismen; den lover ingen dokumentert læringseffekt.'));
  }

  // ---------- tema
  function sideTema(temaId) {
    const tm = D.TEMAER.find(x => x.id === temaId);
    return h('section', { class: 'side' },
      toppNav(),
      h('nav', { class: 'temafaner', 'aria-label': 'Bytt tema' }, D.TEMAER.map(x => h('a', { href: '#/tema/' + encodeURIComponent(x.id), class: 'fane' + (x.id === temaId ? ' aktiv' : ''), 'aria-current': x.id === temaId ? 'page' : null }, x.navn))),
      h('h1', { tabindex: '-1' }, tm.ikon + ' ' + tm.navn),
      h('p', { class: 'ingress' }, tm.kort + '.'),
      [1, 2, 3].map(n => h('div', { class: 'nivå' },
        h('h2', null, D.NIVÅER[n]),
        h('ul', { class: 'oppgaveliste' }, OPP.filter(t => t.tema === temaId && t.nivå === n).map(t => {
          const status = P.løst[t.id] ? '✓ Løst' : P.forsøk[t.id] !== undefined ? '• Påbegynt' : 'Ny';
          return h('li', null, h('a', { href: '#/oppgave/' + t.id, class: 'oppgave-lenke' + (P.løst[t.id] ? ' løst' : ''), 'data-fokus': 'opp-' + t.id },
            h('span', { class: 'id' }, t.id), h('span', { class: 'tittel' }, t.tittel), h('span', { class: 'status' }, status)));
        })))));
  }

  // ---------- oppgave
  function sideOppgave(t) {
    if (P.gjeldende !== t.id) { P.gjeldende = t.id; lagre(); }
    const s = forsøk(t);
    const svar = økt.svar[t.id];
    const i = OPP.indexOf(t);
    const hintN = P.hint[t.id] || 0;
    const løstNå = svar && svar.type === 'ok';
    return h('section', { class: 'side oppgave tema-' + t.tema.replace('ø', 'o') },
      toppNav(h('a', { href: '#/tema/' + encodeURIComponent(t.tema), class: 'lenke' }, '← ' + temaNavn(t.tema))),
      h('p', { class: 'meta' }, t.id + ' · ' + temaNavn(t.tema) + ' · ' + D.NIVÅER[t.nivå] + (P.løst[t.id] ? ' · ✓ Løst' : '')),
      h('h1', { tabindex: '-1' }, t.tittel),
      h('p', { class: 'instruks' }, t.kort_instruksjon),
      regelListe(t, s),
      h('div', { class: 'brett' }, brett(t, s)),
      h('div', { id: 'tilbakemelding', class: 'tilbakemelding' + (svar ? ' ' + svar.type : ''), tabindex: '-1', 'aria-live': 'polite' },
        svar ? [h('strong', null, svar.tittel), svar.tekst ? h('p', null, svar.tekst) : '', svar.forklaring ? h('p', { class: 'forklaring' }, h('b', null, 'Hvorfor: '), svar.forklaring) : ''] : ''),
      h('div', { class: 'handlinger' },
        løstNå ? knapp('Neste oppgave →', () => { økt.svar[t.id] = null; åpneOppgave(nesteOppgave(t.id)); }, { class: 'primær', 'data-fokus': 'neste' })
          : knapp('Sjekk', () => sjekk(t), { class: 'primær', 'data-fokus': 'sjekk' }),
        knapp('↶ Angre', () => angre(t), { 'data-fokus': 'angre' }),
        knapp(hintN >= 2 ? 'Ingen flere hint' : 'Hint ' + (hintN + 1) + ' av 2', () => hint(t), { 'data-fokus': 'hint', disabled: hintN >= 2 }),
        knapp('Start på nytt', () => nullstill(t), { 'data-fokus': 'nullstill' })),
      hintN ? h('ol', { class: 'hint' }, [t.hint_1, t.hint_2].slice(0, hintN).map((x, k) => h('li', null, h('b', null, 'Hint ' + (k + 1) + ': '), x))) : '',
      h('details', { class: 'fasit' }, h('summary', null, 'Vis en løsning (frivillig)'),
        h('p', null, h('b', null, 'Eksempel: '), X.tilstand(t, t.eksempelløsning, D.KORT)),
        h('p', null, t.forklaring),
        h('p', { class: 'dempet' }, løsningsTall(t))),
      h('nav', { class: 'bla', 'aria-label': 'Bla mellom oppgaver' },
        knapp('◀ Forrige', () => åpneOppgave(OPP[(i + OPP.length - 1) % OPP.length].id), { 'data-fokus': 'forrige' }),
        h('span', { class: 'dempet' }, (i + 1) + ' / 30'),
        knapp('Neste ▶', () => åpneOppgave(OPP[(i + 1) % OPP.length].id), { 'data-fokus': 'neste-bla' })));
  }
  function løsningsTall(t) {
    const g = t.gyldighetskontroll;
    if (g.antall_løsninger > 1) return 'Det finnes ' + g.antall_løsninger + ' riktige løsninger. Alle godtas.';
    if (t.tema === 'ruter') return 'Korteste rute: ' + g.korteste + ' steg. Alle ruter som følger reglene godtas.';
    return 'Denne oppgaven har én riktig løsning.';
  }

  function regelListe(t, s) {
    let status = null;
    if (t.tema === 'signaler' && E.signal.gyldigTilstand(t, s)) {
      const r = E.signal.beregn(t, s);
      status = t.regler.map(x => (x.type === 'lampe' ? r.lampe === x.verdi : x.type === 'antallPå' ? r.antallPå === x.antall : true));
    }
    return h('div', { class: 'regler' }, h('h2', null, 'Regler'),
      h('ul', null, t.regler.map((r, k) => h('li', { class: status ? (status[k] ? 'oppfylt' : 'ikke') : '' },
        status ? h('span', { class: 'merke' }, status[k] ? '✓ ' : '○ ') : '', r.tekst,
        status ? h('span', { class: 'skjult' }, status[k] ? ' (oppfylt)' : ' (ikke oppfylt ennå)') : ''))));
  }

  function brett(t, s) {
    switch (t.tema) {
      case 'signaler': return brettSignal(t, s);
      case 'rekkefølge': return brettRekkefølge(t, s);
      case 'mønstre': return brettMønster(t, s);
      case 'ruter': return brettRute(t, s);
      case 'feilsøking': return brettMaskin(t, s);
    }
  }

  // ---------- signaler
  function brettSignal(t, s) {
    const r = E.signal.beregn(t, s);
    const merke = v => (v ? '● PÅ' : '○ AV');
    return [
      h('div', { class: 'brytere', role: 'group', 'aria-label': 'Brytere' }, t.komponenter.brytere.map(b =>
        h('button', { type: 'button', class: 'bryter' + (s[b] ? ' på' : ''), 'aria-pressed': s[b] ? 'true' : 'false', 'data-fokus': 'bryter-' + b,
          onclick: () => settForsøk(t, Object.assign({}, s, { [b]: !s[b] })) },
          h('span', { class: 'navn' }, 'Bryter ' + b), h('span', { class: 'verdi' }, merke(s[b]))))),
      h('ol', { class: 'krets', 'aria-label': 'Porter i rekkefølge' }, r.spor.map(p =>
        h('li', null, h('span', { class: 'port' }, p.port),
          h('span', { class: 'inn' }, 'inn: ' + p.inn.map((n, k) => n + ' ' + merke(p.verdier[k])).join(', ')),
          h('span', { class: 'ut' + (p.ut ? ' på' : '') }, '→ ' + merke(p.ut))))),
      h('div', { class: 'lampe' + (r.lampe ? ' på' : ''), role: 'status' },
        h('span', { class: 'lampe-ikon', 'aria-hidden': 'true' }, r.lampe ? '☀' : '◯'),
        h('span', null, r.lampe ? 'Lampen lyser' : 'Lampen er av'))
    ];
  }

  // ---------- rekkefølge
  function brettRekkefølge(t, s) {
    const valgt = økt.valgt[t.id];
    const flytt = (id, retning) => {
      const fra = s.indexOf(id), til = fra + retning;
      økt.valgt[t.id] = id;
      if (til < 0 || til >= s.length) { økt.svar[t.id] = { type: 'info', tittel: 'Kortet står allerede ' + (til < 0 ? 'først.' : 'sist.'), tekst: '' }; tegn(); return; }
      settForsøk(t, E.rekkefølge.flytt(s, fra, til));
    };
    const vi = valgt ? s.indexOf(valgt) : -1;
    return [
      h('p', { class: 'hjelp' }, 'Trykk på et kort for å velge det. Flytt med knappene, eller med piltastene.'),
      h('ol', { class: 'kortrad' }, s.map((id, k) => {
        const kort = D.KORT[id];
        return h('li', null, h('button', {
          type: 'button', class: 'kort farge-' + kort.farge + (valgt === id ? ' valgt' : ''), 'data-fokus': 'kort-' + id,
          'aria-pressed': valgt === id ? 'true' : 'false', 'aria-label': 'Plass ' + (k + 1) + ': ' + kort.navn + (valgt === id ? ', valgt' : ''),
          onclick: () => { økt.valgt[t.id] = valgt === id ? undefined : id; tegn(); },
          onkeydown: e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); flytt(id, e.key === 'ArrowLeft' ? -1 : 1); } }
        }, h('span', { class: 'plass' }, String(k + 1)), h('span', { class: 'symbol', 'aria-hidden': 'true' }, kort.symbol), h('span', { class: 'kortnavn' }, kort.navn)));
      })),
      h('div', { class: 'flytt' },
        knapp('◀ Flytt til venstre', () => flytt(valgt, -1), { disabled: vi <= 0, 'data-fokus': 'flytt-v' }),
        knapp('Flytt til høyre ▶', () => flytt(valgt, 1), { disabled: vi < 0 || vi >= s.length - 1, 'data-fokus': 'flytt-h' })),
      h('p', { class: 'dempet', 'aria-live': 'polite' }, valgt ? 'Valgt: ' + D.KORT[valgt].navn + ' ' + D.KORT[valgt].symbol + ' på plass ' + (vi + 1) + '.' : 'Ingen kort valgt.')
    ];
  }

  // ---------- mønstre
  function brettMønster(t, s) {
    const sek = t.komponenter.sekvens;
    const blanke = sek.map((x, i) => (x === null ? i : -1)).filter(i => i >= 0);
    let valgt = økt.valgt[t.id];
    if (valgt === undefined || valgt >= blanke.length) { valgt = s.svar.findIndex(v => v === null); if (valgt < 0) valgt = 0; }
    const velgBrikke = p => {
      const svar = s.svar.slice(); svar[valgt] = p;
      const nesteTom = svar.findIndex((v, j) => v === null && j !== valgt);
      økt.valgt[t.id] = nesteTom >= 0 ? nesteTom : valgt;
      settForsøk(t, { svar });
    };
    let j = 0;
    return [
      h('ol', { class: 'sekvens', 'aria-label': 'Mønsteret' }, sek.map((x, i) => {
        if (x !== null) return h('li', { class: 'celle', 'aria-label': 'Plass ' + (i + 1) + ': ' + X.brikkeNavn(x) }, h('span', { class: 'symbol', 'aria-hidden': 'true' }, X.symbol(x)), h('span', { class: 'nr' }, String(i + 1)));
        const k = j++; const v = s.svar[k];
        return h('li', null, h('button', {
          type: 'button', class: 'celle tom' + (k === valgt ? ' valgt' : '') + (v !== null ? ' fylt' : ''), 'data-fokus': 'tom-' + k,
          'aria-pressed': k === valgt ? 'true' : 'false',
          'aria-label': 'Plass ' + (i + 1) + ': ' + (v === null ? 'tom' : X.brikkeNavn(t.komponenter.palett[v])) + (k === valgt ? ', valgt' : ''),
          onclick: () => { økt.valgt[t.id] = k; tegn(); }
        }, h('span', { class: 'symbol', 'aria-hidden': 'true' }, v === null ? '?' : X.symbol(t.komponenter.palett[v])), h('span', { class: 'nr' }, String(i + 1))));
      })),
      h('p', { class: 'hjelp' }, 'Velg brikke til plass ' + (blanke[valgt] + 1) + ':'),
      h('div', { class: 'palett', role: 'group', 'aria-label': 'Brikker' }, t.komponenter.palett.map((p, k) =>
        h('button', { type: 'button', class: 'brikke', 'data-fokus': 'palett-' + k, 'aria-label': 'Legg inn ' + X.brikkeNavn(p), onclick: () => velgBrikke(k) },
          h('span', { 'aria-hidden': 'true' }, X.symbol(p)))))
    ];
  }

  // ---------- ruter
  function brettRute(t, s) {
    const I = E.rute.info(t);
    const nå = s.sti[s.sti.length - 1];
    const besøkt = new Map(); s.sti.forEach((p, k) => besøkt.set(p[0] + ',' + p[1], k));
    const steg = mål => {
      const f = E.rute.stegFeil(t, nå, mål);
      if (f) { økt.svar[t.id] = { type: 'info', tittel: 'Det steget går ikke.', tekst: f }; tegn(); return; }
      settForsøk(t, { sti: s.sti.concat([mål]) });
    };
    const piltast = e => {
      const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (!d) return; e.preventDefault(); steg([nå[0] + d[0], nå[1] + d[1]]);
    };
    const navn = { 'S': 'start', 'M': 'mål', '#': 'stein', '.': 'fritt' };
    const kpStatus = I.kp.map(k => k.id + (s.sti.some(p => p[0] === k.pos[0] && p[1] === k.pos[1]) ? ' ✓' : ' ○'));
    return [
      h('div', { class: 'rutenett', style: 'grid-template-columns: repeat(' + I.kol + ', 1fr)', role: 'group', 'aria-label': 'Rutenett ' + I.rader + ' × ' + I.kol + '. Bruk piltastene for å gå.', tabindex: '0', 'data-fokus': 'rutenett', onkeydown: piltast },
        I.nett.map((rad, r) => [...rad].map((c, k) => {
          const her = nå[0] === r && nå[1] === k; const nr = besøkt.get(r + ',' + k);
          const type = /[1-9]/.test(c) ? 'kp' : { 'S': 'start', 'M': 'mål', '#': 'stein', '.': 'fri' }[c];
          return h('button', {
            type: 'button', tabindex: '-1', class: 'felt ' + type + (nr !== undefined ? ' besøkt' : '') + (her ? ' her' : ''),
            'aria-label': 'Rad ' + (r + 1) + ', kolonne ' + (k + 1) + ': ' + (/[1-9]/.test(c) ? 'kontrollpunkt ' + c : navn[c]) + (her ? ', du står her' : ''),
            onclick: () => steg([r, k])
          }, h('span', { class: 'tegn', 'aria-hidden': 'true' }, her ? '●' : c === '#' ? '■' : c === '.' ? (nr !== undefined ? '·' : '') : c),
            nr !== undefined && nr > 0 && !her ? h('span', { class: 'stegnr', 'aria-hidden': 'true' }, String(nr)) : '');
        }))),
      h('div', { class: 'piler', role: 'group', 'aria-label': 'Gå' },
        knapp('↑', () => steg([nå[0] - 1, nå[1]]), { 'aria-label': 'Gå opp', class: 'pil opp', 'data-fokus': 'pil-opp', onkeydown: piltast }),
        knapp('←', () => steg([nå[0], nå[1] - 1]), { 'aria-label': 'Gå til venstre', class: 'pil venstre', 'data-fokus': 'pil-v', onkeydown: piltast }),
        knapp('↓', () => steg([nå[0] + 1, nå[1]]), { 'aria-label': 'Gå ned', class: 'pil ned', 'data-fokus': 'pil-ned', onkeydown: piltast }),
        knapp('→', () => steg([nå[0], nå[1] + 1]), { 'aria-label': 'Gå til høyre', class: 'pil høyre', 'data-fokus': 'pil-h', onkeydown: piltast })),
      h('p', { class: 'dempet', 'aria-live': 'polite' }, 'Steg: ' + (s.sti.length - 1) + (I.kp.length ? ' · Kontrollpunkt: ' + kpStatus.join(', ') : '') + '. ● = deg, ■ = stein.')
    ];
  }

  // ---------- feilsøking
  function brettMaskin(t, s) {
    const K = t.komponenter; const mel = E.feilsøk.kjør(K.start, s.ops);
    const endr = E.feilsøk.endringer(t, s);
    const valgt = økt.valgt[t.id];
    const maks = (t.regler.find(r => r.type === 'maksEndringer') || {}).n;
    const mål = t.regler.find(r => r.type === 'resultat').mål;
    const kontroll = t.regler.filter(r => r.type === 'mellom');
    const bytt = (i, o) => { const ops = s.ops.slice(); ops[i] = o; settForsøk(t, { ops }); };
    const slutt = mel[mel.length - 1];
    return [
      h('ol', { class: 'maskin', 'aria-label': 'Maskinen' },
        h('li', { class: 'startverdi' }, h('span', null, 'Start'), h('strong', null, String(K.start))),
        s.ops.map((o, i) => {
          const k = kontroll.find(r => r.etter === i + 1);
          return h('li', { class: 'del' },
            h('button', {
              type: 'button', class: 'op' + (valgt === i ? ' valgt' : '') + (endr.includes(i) ? ' endret' : ''), 'data-fokus': 'op-' + i,
              'aria-pressed': valgt === i ? 'true' : 'false', 'aria-label': 'Del ' + (i + 1) + ': ' + X.opTekst(o) + (endr.includes(i) ? ', byttet' : '') + '. Trykk for å bytte.',
              onclick: () => { økt.valgt[t.id] = valgt === i ? undefined : i; tegn(); }
            }, h('span', { class: 'delnr' }, 'Del ' + (i + 1)), h('span', { class: 'optekst' }, X.opTekst(o)), endr.includes(i) ? h('span', { class: 'merkelapp' }, '✎ byttet') : ''),
            h('span', { class: 'verdi' }, '→ ' + mel[i + 1]),
            k ? h('span', { class: 'kontroll' + (mel[i + 1] === k.verdi ? ' ok' : '') }, (mel[i + 1] === k.verdi ? '✓' : '○') + ' skal være ' + k.verdi) : '');
        }),
        h('li', { class: 'resultat' + (slutt === mål ? ' ok' : '') }, h('span', null, 'Resultat: ' + slutt), h('span', null, (slutt === mål ? '✓ ' : '○ ') + 'Mål: ' + mål))),
      valgt !== undefined ? h('div', { class: 'valg' },
        h('p', { class: 'hjelp' }, 'Bytt del ' + (valgt + 1) + ' (' + X.opTekst(s.ops[valgt]) + ') med:'),
        h('div', { class: 'valgknapper' },
          K.valg.map((o, k) => knapp(X.opTekst(o), () => bytt(valgt, o), { class: 'valgknapp' + (o.op === s.ops[valgt].op && o.n === s.ops[valgt].n ? ' aktiv' : ''), 'data-fokus': 'valg-' + k })),
          endr.includes(valgt) ? knapp('Tilbake til ' + X.opTekst(K.operasjoner[valgt]), () => bytt(valgt, K.operasjoner[valgt]), { class: 'valgknapp', 'data-fokus': 'valg-orig' }) : ''))
        : h('p', { class: 'hjelp' }, 'Trykk på en del for å bytte den.'),
      h('p', { class: 'dempet', 'aria-live': 'polite' }, 'Byttet: ' + endr.length + (maks !== undefined ? ' av ' + maks + ' tillatt' : '') + '.')
    ];
  }

  // ---------- framdrift
  function sideFramdrift() {
    let melding = økt.framdriftMelding || null;
    const tekstfelt = h('textarea', { id: 'importtekst', rows: '5', 'aria-label': 'Lim inn framdrift', placeholder: 'Lim inn framdrift her …' });
    const fil = h('input', { type: 'file', accept: 'application/json,.json,.txt', id: 'importfil', 'aria-label': 'Velg framdriftsfil' });
    const hent = tekst => {
      const r = S.validerImport(tekst, OPP, E);
      if (!r.ok) { økt.framdriftMelding = { type: 'feil', tekst: 'Importen ble avvist. Ingenting er endret. ' + r.feil }; tegn(); return; }
      P = r.data; økt.historikk = {}; økt.svar = {}; økt.valgt = {}; lagre();
      økt.framdriftMelding = { type: 'ok', tekst: 'Framdriften er hentet: ' + Object.keys(P.løst).length + ' løste oppgaver.' + (r.ignorert.length ? ' Ukjente oppgaver ble hoppet over: ' + r.ignorert.join(', ') + '.' : '') };
      tegn();
    };
    const eksport = S.eksporter(P);
    let bekreft = økt.bekreftNullstill;
    return h('section', { class: 'side' },
      toppNav(),
      h('h1', { tabindex: '-1' }, 'Framdrift'),
      h('p', null, lager.varig ? 'Framdriften lagres i denne nettleseren.' : 'Framdriften lagres ikke på denne enheten. Last den ned før du lukker siden.'),
      h('p', null, 'Lagret: gjeldende oppgave, forsøk, løste oppgaver (' + Object.keys(P.løst).length + '), brukte hint og innstillinger. Ingen navn.'),
      melding ? h('p', { class: 'tilbakemelding ' + melding.type, role: 'status' }, melding.tekst) : '',
      h('h2', null, 'Ta med framdriften'),
      knapp('Last ned framdrift (.json)', () => {
        const blob = new Blob([eksport], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'small-wins-lab-framdrift.json' });
        document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      }, { class: 'primær', 'data-fokus': 'last-ned' }),
      h('details', null, h('summary', null, 'Vis som tekst (for kopiering)'), h('textarea', { rows: '6', readonly: true, 'aria-label': 'Framdrift som tekst', id: 'eksporttekst' }, eksport)),
      h('h2', null, 'Hent framdrift'),
      h('p', { class: 'dempet' }, 'Hele filen kontrolleres før noe endres. En avvist fil endrer ingenting.'),
      fil,
      knapp('Hent fra fil', () => { const f = fil.files[0]; if (!f) { økt.framdriftMelding = { type: 'feil', tekst: 'Velg en fil først.' }; tegn(); return; } f.text().then(hent); }, { 'data-fokus': 'hent-fil' }),
      tekstfelt,
      knapp('Hent fra tekst', () => hent(tekstfelt.value), { 'data-fokus': 'hent-tekst' }),
      h('h2', null, 'Innstillinger'),
      h('label', { class: 'bryterlinje' }, h('input', { type: 'checkbox', checked: P.innstillinger.storTekst, 'data-fokus': 'stor-tekst', onchange: e => { P.innstillinger.storTekst = e.target.checked; lagre(); tegn(); } }), ' Større tekst'),
      h('h2', null, 'Begynn helt på nytt'),
      bekreft ? h('div', { class: 'radknapper' },
        knapp('Ja, slett all framdrift', () => { P = S.tom(); økt.historikk = {}; økt.svar = {}; økt.valgt = {}; økt.bekreftNullstill = false; økt.framdriftMelding = { type: 'ok', tekst: 'All framdrift er slettet.' }; lagre(); tegn(); }, { class: 'fare', 'data-fokus': 'slett-ja' }),
        knapp('Avbryt', () => { økt.bekreftNullstill = false; tegn(); }, { 'data-fokus': 'slett-nei' }))
        : knapp('Slett all framdrift …', () => { økt.bekreftNullstill = true; tegn(); }, { 'data-fokus': 'slett' }));
  }

  // ---------------------------------------------------------------- oppstart
  window.addEventListener('hashchange', () => { økt.framdriftMelding = null; økt.bekreftNullstill = false; tegn(); });
  tegn();
  if (advarsler.length) lagre(); // skriv tilbake den rensede tilstanden
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* appen virker uten */ });
  }
  window.SWL.app = { tilstand: () => P, lagerVarig: () => lager.varig };
})();
