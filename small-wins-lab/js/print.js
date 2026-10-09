/* Small Wins Lab — utskrivbare oppgavekort og separat fasit. Bare tekst og kodebaserte figurer. */
(function () {
  'use strict';
  const D = SWL.data, E = SWL.engine, X = SWL.tekst;
  function h(tag, attrs, ...barn) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v !== null && v !== undefined) (k === 'class' ? (el.className = v) : el.setAttribute(k, v));
    for (const b of barn.flat(Infinity)) if (b !== null && b !== undefined && b !== '') el.append(b.nodeType ? b : document.createTextNode(String(b)));
    return el;
  }
  const temaNavn = id => D.TEMAER.find(x => x.id === id).navn;

  function porterBrukt(node, ut) { if (typeof node !== 'string') { ut.add(node.port); node.inn.forEach(n => porterBrukt(n, ut)); } return ut; }

  function oppsett(t) {
    const K = t.komponenter, s = t.starttilstand;
    switch (t.tema) {
      case 'signaler': return [
        h('p', { class: 'mono' }, 'Krets: ', X.krets(K.krets), ' → lampe'),
        h('p', null, 'Brytere ved start: ', X.tilstand(t, s)),
        h('ul', { class: 'smått' }, [...porterBrukt(K.krets, new Set())].map(p => h('li', null, E.PORTER[p].tekst))),
        h('p', { class: 'svarlinje' }, 'Mitt svar: ', ...K.brytere.map(b => h('span', { class: 'avkrysning' }, b + ':  PÅ ☐  AV ☐')))
      ];
      case 'rekkefølge': return [
        h('p', null, 'Kort ved start (klipp ut og legg i rekke):'),
        h('div', { class: 'kortrad' }, s.map(id => h('span', { class: 'papirkort' }, h('b', null, D.KORT[id].symbol), h('small', null, D.KORT[id].navn)))),
        h('p', { class: 'svarlinje' }, 'Mitt svar: ', ...s.map((_, i) => h('span', { class: 'boks' }, String(i + 1))))
      ];
      case 'mønstre': return [
        h('div', { class: 'kortrad' }, K.sekvens.map((x, i) => h('span', { class: 'celle' + (x ? '' : ' tom') }, h('b', null, x ? X.symbol(x) : ' '), h('small', null, String(i + 1))))),
        h('p', null, 'Brikker du kan bruke: ', K.palett.map(X.symbol).join('   ')),
        h('p', { class: 'svarlinje' }, 'Mitt svar (tomme plasser): ____  ____')
      ];
      case 'ruter': return [
        h('table', { class: 'rutenett' }, h('tbody', null, K.rutenett.map(rad => h('tr', null, [...rad].map(c => h('td', { class: c === '#' ? 'stein' : '' }, c === '#' ? '■' : c === '.' ? '' : c)))))),
        h('p', { class: 'smått' }, 'S = start, M = mål, ■ = stein, 1/2 = kontrollpunkt. Tegn ruten i rutenettet.'),
        h('p', { class: 'svarlinje' }, 'Antall steg: ______')
      ];
      case 'feilsøking': return [
        h('p', { class: 'mono' }, X.kjede(K.start, K.operasjoner)),
        h('p', null, 'Tillatte deler å bytte til: ', K.valg.map(X.opTekst).join(',  ')),
        h('p', { class: 'svarlinje' }, 'Jeg bytter del ____ til ______.   Ny regning: __________________')
      ];
    }
  }

  const kortRot = document.getElementById('kort');
  D.TEMAER.forEach(tm => {
    kortRot.append(h('h2', { class: 'temaoverskrift' }, tm.navn + ' (' + tm.prefiks + '-01 til ' + tm.prefiks + '-06)'));
    D.OPPGAVER.filter(t => t.tema === tm.id).forEach(t => {
      kortRot.append(h('article', { class: 'oppgavekort', id: 'kort-' + t.id },
        h('header', null, h('span', { class: 'id' }, t.id), h('span', null, temaNavn(t.tema) + ' · ' + D.NIVÅER[t.nivå])),
        h('h3', null, t.tittel),
        h('p', { class: 'instruks' }, t.kort_instruksjon),
        h('div', { class: 'oppsett' }, oppsett(t)),
        h('p', { class: 'underoverskrift' }, 'Regler'),
        h('ul', null, t.regler.map(r => h('li', null, r.tekst))),
        h('p', { class: 'smått' }, 'Materiell: ' + t.materiell)));
    });
  });

  const fasit = document.getElementById('fasit');
  fasit.append(h('h2', null, 'Fasit og forklaringer'), h('p', { class: 'smått' }, 'Egen del. Flere oppgaver har mer enn én riktig løsning; alle som følger reglene er riktige.'));
  D.OPPGAVER.forEach(t => {
    const g = t.gyldighetskontroll;
    fasit.append(h('div', { class: 'fasitpost' },
      h('p', null, h('b', null, t.id + ' ' + t.tittel)),
      h('p', { class: 'mono' }, 'Eksempel: ' + X.tilstand(t, t.eksempelløsning, D.KORT)),
      h('p', null, t.forklaring),
      h('p', { class: 'smått' }, (g.antall_løsninger ? 'Riktige løsninger: ' + g.antall_løsninger + '. ' : '') + (g.korteste ? 'Korteste rute: ' + g.korteste + ' steg. ' : '') + 'Kontroll: ' + g.metode)));
  });
  document.getElementById('skriv-ut').addEventListener('click', () => window.print());
})();
