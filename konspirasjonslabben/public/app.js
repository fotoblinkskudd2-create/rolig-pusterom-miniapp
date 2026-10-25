'use strict';
// Konspirasjonslabben – klient. Vanilla JS. All brukertekst går via textContent.

const LAGER = 'konspirasjonslabben.v1';
let SAK = null;
let tilstand = lesTilstand();

function lesTilstand() {
  const tom = { aktiv: 'cuibono', ferdig: {}, utkast: {}, tallForsok: 0, stemt: [], alias: '' };
  try {
    return Object.assign(tom, JSON.parse(localStorage.getItem(LAGER) || '{}'));
  } catch {
    return tom;
  }
}

function lagre() {
  try { localStorage.setItem(LAGER, JSON.stringify(tilstand)); } catch { /* privat modus – lev med det */ }
}

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function el(tag, attrs = {}, ...barn) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const b of barn.flat()) {
    if (b == null || b === false) continue;
    n.append(b instanceof Node ? b : document.createTextNode(String(b)));
  }
  return n;
}

const SVGNS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs = {}, ...barn) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const b of barn) n.append(b instanceof Node ? b : document.createTextNode(String(b)));
  return n;
}

async function api(sti, data) {
  const res = await fetch(sti, data === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.feil || `Feil ${res.status}`);
  return body;
}

function feil(container, e) {
  container.append(el('p', { class: 'feilmelding' }, '⚠ ' + e.message));
}

function nivaaFor(id) {
  return SAK.nivaer.find((n) => n.id === id);
}

// ---------------------------------------------------------------------------
// Globalt: rang, faner, sak
// ---------------------------------------------------------------------------

function oppdaterGlobal() {
  const ferdige = SAK.nivaer.filter((n) => tilstand.ferdig[n.id] != null);
  const poeng = ferdige.reduce((s, n) => s + tilstand.ferdig[n.id], 0);
  document.getElementById('global-poeng').textContent = poeng;
  document.getElementById('global-rang').textContent =
    ferdige.length ? ferdige[ferdige.length - 1].rang : 'Kritisk tenkende borger (kjedelig)';
  if (ferdige.length === SAK.nivaer.length) visDebrief(false);
}

function tegnFaner() {
  const nav = document.getElementById('faner');
  nav.replaceChildren(
    ...SAK.nivaer.map((n) =>
      el('button', {
        class: 'fane' + (tilstand.aktiv === n.id ? ' aktiv' : '') + (tilstand.ferdig[n.id] != null ? ' ferdig' : ''),
        onclick: () => { tilstand.aktiv = n.id; lagre(); tegnFaner(); tegnNivaa(); },
        'aria-current': tilstand.aktiv === n.id ? 'step' : null,
      }, `${n.nr}. ${n.navn}`)
    ),
    el('button', { class: 'fane debrief-fane', onclick: () => visDebrief(true) }, '🔦 Avsløringen')
  );
}

function tegnSak() {
  const s = SAK.sak;
  const dato = new Date(s.dato + 'T12:00:00');
  document.getElementById('sak-dato').textContent =
    'Dagens sak · ' + dato.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('sak-tittel').textContent = s.tittel;
  document.getElementById('sak-ingress').textContent = s.ingress;
  document.getElementById('sak-fakta').replaceChildren(...s.fakta.map((f) => el('li', {}, f)));
}

// ---------------------------------------------------------------------------
// Nivåskjelett og resultatvisning
// ---------------------------------------------------------------------------

function tegnNivaa() {
  const n = nivaaFor(tilstand.aktiv);
  const rot = document.getElementById('nivaa');
  const kropp = el('div', { class: 'kropp' });
  const resultat = el('div', { class: 'resultat-plass' });
  rot.replaceChildren(
    el('div', { class: 'nivaa-nr' }, `Nivå ${n.nr} av ${SAK.nivaer.length} · Rang: ${n.rang}`),
    el('h2', {}, n.navn),
    el('p', { class: 'intro' }, n.intro),
    el('div', { class: 'oppgave' }, el('strong', {}, 'Oppdrag: '), n.oppgave),
    kropp,
    resultat
  );
  BYGGERE[n.id](kropp, resultat, n);
}

function sannsynlighetBredde(p) {
  if (p >= 1) return 100;
  if (p <= 0) return 0;
  return Math.max(1, Math.min(100, 100 + Math.log10(p) * 14));
}

function prosent(p) {
  if (p >= 0.01) return (p * 100).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + ' %';
  return p.toLocaleString('nb-NO', { maximumSignificantDigits: 2, notation: 'scientific' }).replace('E', '×10^') + ' ';
}

function meterpar(overbevisning, sannsynlighet, enAv) {
  return el('div', { class: 'meterpar' },
    el('div', { class: 'meter opp' },
      el('div', { class: 'meter-navn' }, 'Overbevisningskraft'),
      el('div', { class: 'meter-tall' }, overbevisning + ' / 100'),
      el('div', { class: 'meter-bar' }, el('div', { style: `width:${overbevisning}%` })),
      el('div', { class: 'meter-sub' }, 'Hvor godt det FØLES. Stiger med retorikk.')
    ),
    el('div', { class: 'meter ned' },
      el('div', { class: 'meter-navn' }, 'Sannsynlighet for at alt stemmer'),
      el('div', { class: 'meter-tall' }, `1 av ${enAv}`),
      el('div', { class: 'meter-bar' }, el('div', { style: `width:${sannsynlighetBredde(sannsynlighet)}%` })),
      el('div', { class: 'meter-sub' }, 'Hvor sant det ER. Synker med hvert ledd.')
    )
  );
}

function teknikkliste(teknikker) {
  if (!teknikker || !teknikker.length) return el('p', { class: 'hint' }, 'Ingen klassiske retoriske grep oppdaget. Du skriver mistenkelig nøkternt.');
  return el('div', { class: 'teknikker' },
    el('div', { class: 'meter-navn' }, 'Teknikker oppdaget i teksten din'),
    ...teknikker.map((t) => el('div', { class: 'teknikk' }, el('b', {}, t.navn), ` ×${t.antall} — `, t.forklaring))
  );
}

function bakromKnapp(n, poeng) {
  const plass = el('div');
  const knapp = el('button', {
    class: 'sekundaer',
    onclick: () => {
      knapp.remove();
      plass.append(
        el('div', { class: 'bakrom' }, el('h3', {}, n.bakrom.navn), el('p', {}, n.bakrom.tekst)),
        nesteKnapp(n)
      );
    },
  }, '🚪 Gå inn i bakrommet (hva skjedde egentlig her?)');
  tilstand.ferdig[n.id] = Math.max(tilstand.ferdig[n.id] || 0, poeng);
  lagre();
  oppdaterGlobal();
  tegnFaner();
  return el('div', {}, knapp, plass);
}

function nesteKnapp(n) {
  const i = SAK.nivaer.findIndex((x) => x.id === n.id);
  const neste = SAK.nivaer[i + 1];
  if (!neste) {
    return el('div', { class: 'knapper' }, el('button', { onclick: () => visDebrief(true) }, '🔦 Til avsløringen'));
  }
  return el('div', { class: 'knapper' }, el('button', {
    onclick: () => { tilstand.aktiv = neste.id; lagre(); tegnFaner(); tegnNivaa(); document.getElementById('faner').scrollIntoView({ behavior: 'smooth' }); },
  }, `Neste: ${neste.navn} →`));
}

// ---------------------------------------------------------------------------
// Nivå 1: Cui bono
// ---------------------------------------------------------------------------

function byggCuiBono(kropp, resultat, n) {
  const hjul = ['Mistenkt', 'Motiv', '«Bevis»'].map((t) => el('div', { class: 'hjul' }, el('small', {}, t), '—'));
  let siste = null;
  const tekst = el('textarea', { placeholder: 'Skriv teorien din her. Minst to setninger. Bruk gjerne «tilfeldig?».', 'aria-label': 'Din teori' });
  tekst.value = tilstand.utkast.cuibono || '';
  tekst.addEventListener('input', () => { tilstand.utkast.cuibono = tekst.value; lagre(); });

  const brukKnapp = el('button', {
    class: 'sekundaer', disabled: true,
    onclick: () => {
      if (!siste) return;
      tekst.value = `${siste.mistenkt} vil ${siste.motiv}. ${siste.bevis} ${tekst.value}`.trim();
      tekst.dispatchEvent(new Event('input'));
      tekst.focus();
    },
  }, '↓ Bruk som utkast');

  const spinn = el('button', {
    onclick: async () => {
      hjul.forEach((h) => h.classList.add('spinner'));
      spinn.disabled = true;
      try {
        const [r] = await Promise.all([api('/api/cuibono'), new Promise((ok) => setTimeout(ok, 650))]);
        siste = r;
        [r.mistenkt, r.motiv, r.bevis].forEach((v, i) => hjul[i].replaceChildren(hjul[i].firstChild, v));
        brukKnapp.disabled = false;
      } catch (e) { feil(kropp, e); }
      hjul.forEach((h) => h.classList.remove('spinner'));
      spinn.disabled = false;
    },
  }, '🎰 Snurr Cui Bono-maskinen');

  const analyser = el('button', {
    onclick: async () => {
      resultat.replaceChildren();
      const setn = tekst.value.split(/[.!?]+/).filter((s) => s.trim().length > 8).length;
      if (setn < 2) return feil(resultat, new Error('Minst to setninger. Én setning er en påstand. To er en teori.'));
      try {
        const r = await api('/api/vurder', { nivaa: 'cuibono', data: { tekst: tekst.value } });
        visAnalyse(resultat, r, n);
      } catch (e) { feil(resultat, e); }
    },
  }, '🔍 Analyser teorien');

  kropp.append(el('div', { class: 'knapper' }, spinn, brukKnapp), el('div', { class: 'automat' }, hjul), tekst, el('div', { class: 'knapper' }, analyser));
}

function visAnalyse(resultat, r, n) {
  resultat.replaceChildren(el('div', { class: 'resultat' },
    meterpar(r.overbevisning, r.sannsynlighet, r.enAv),
    el('p', { class: 'rang' }, 'Vurdering: ', el('strong', {}, r.rang)),
    r.kommentar ? el('p', { class: 'kommentar' }, r.kommentar) : null,
    teknikkliste(r.teknikker),
    bakromKnapp(n, r.overbevisning)
  ));
}

// ---------------------------------------------------------------------------
// Nivå 2: Tallmagi
// ---------------------------------------------------------------------------

function byggTallmagi(kropp, resultat, n) {
  const inp = el('input', { type: 'text', placeholder: 'f.eks. 25.10.2026, ditt navn, postnummeret ditt, «Boelo»', maxlength: 200, 'aria-label': 'Tall eller tekst' });
  const forsok = el('p', { class: 'forsok' });
  const liste = el('div');
  const oppdaterForsok = () => {
    forsok.textContent = `Forsøk: ${tilstand.tallForsok} / 3` + (tilstand.tallForsok >= 3 ? ' – nok til å se mønsteret. Eller er det?' : '');
  };
  oppdaterForsok();

  const kjor = async () => {
    if (!inp.value.trim()) return;
    try {
      const r = await api('/api/tallmagi', { input: inp.value });
      tilstand.tallForsok++;
      lagre();
      oppdaterForsok();
      liste.replaceChildren(
        el('p', { class: 'kommentar' }, el('strong', {}, `«${inp.value}»`), ' → ', r.kommentar),
        el('ul', { class: 'treffliste' }, ...r.treff.map((t) =>
          el('li', {},
            el('span', { class: 'maltall' }, t.mal), ' — ', t.hvorfor, el('br'),
            t.steg, el('br'),
            t.juks
              ? el('span', { class: 'juks' }, `⚠ Krevde juks: «${t.juks}»`)
              : el('span', { class: 'ren' }, '✓ «Rent» treff (av hundrevis av mulige kombinasjoner)')
          )
        ))
      );
      if (tilstand.tallForsok >= 3 && !resultat.childElementCount) {
        resultat.append(el('div', { class: 'resultat' },
          el('p', { class: 'kommentar' }, 'Tre forsøk, tre «avsløringer». Prøv et fjerde med noe helt meningsløst. Den finner noe da også.'),
          bakromKnapp(n, Math.min(100, tilstand.tallForsok * 20))
        ));
      }
    } catch (e) { feil(liste, e); }
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') kjor(); });

  kropp.append(
    el('div', { class: 'fordi-form' }, inp, el('button', { onclick: kjor }, '🔢 Finn Det Hemmelige Tallet')),
    forsok,
    liste
  );
}

// ---------------------------------------------------------------------------
// Nivå 3: Den røde tråden
// ---------------------------------------------------------------------------

const PLASSER = {
  klokka: [400, 55], stormen: [150, 110], skjenk: [650, 110], stekeovn: [110, 255], eu: [685, 255],
  grunnloven: [315, 250], telefonen: [505, 250], refleks: [170, 410], sauer: [400, 440], brunost: [630, 410],
};

function byggTraad(kropp, resultat, n) {
  const lenker = Array.isArray(tilstand.utkast.traad) ? tilstand.utkast.traad : [];
  let valgt = null;
  let venter = null;

  const tavle = svg('svg', { class: 'tavle', viewBox: '0 0 800 500', role: 'group', 'aria-label': 'Korktavle med bevisbrikker' });
  const traadLag = svg('g');
  const lappLag = svg('g');
  tavle.append(traadLag, lappLag);

  const lapper = {};
  for (const b of SAK.brikker) {
    const [x, y] = PLASSER[b.id];
    const tekst = `${b.ikon} ${b.navn}`;
    const w = 44 + b.navn.length * 7.4;
    const g = svg('g', { class: 'lapp', tabindex: '0', role: 'button', 'aria-label': b.navn, transform: `translate(${x - w / 2},${y - 20})` },
      svg('rect', { width: w, height: 40, rx: 2 }),
      svg('text', { x: 10, y: 25 }, tekst),
      svg('circle', { class: 'naal', cx: w / 2, cy: 0, r: 5 })
    );
    const velg = () => klikk(b.id);
    g.addEventListener('click', velg);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); velg(); } });
    lapper[b.id] = g;
    lappLag.append(g);
  }

  const fordiInp = el('input', { type: 'text', placeholder: 'fordi …', maxlength: 300, 'aria-label': 'Begrunnelse for tråden' });
  const fordiTittel = el('strong');
  const fordiForm = el('div', { hidden: true },
    el('p', {}, '🧵 ', fordiTittel),
    el('div', { class: 'fordi-form' }, fordiInp,
      el('button', { onclick: () => leggTil() }, 'Stram tråden'),
      el('button', { class: 'sekundaer', onclick: () => avbryt() }, 'Avbryt'))
  );
  fordiInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') leggTil(); });

  const liste = el('ul', { class: 'lenkeliste' });
  const status = el('p', { class: 'forsok' });

  function navn(id) { return SAK.brikker.find((b) => b.id === id).navn; }

  function klikk(id) {
    if (venter) return;
    if (!valgt) { valgt = id; lapper[id].classList.add('valgt'); return; }
    if (valgt === id) { lapper[id].classList.remove('valgt'); valgt = null; return; }
    venter = [valgt, id];
    lapper[id].classList.add('valgt');
    fordiTittel.textContent = `${navn(venter[0])} ↔ ${navn(venter[1])}`;
    fordiForm.hidden = false;
    fordiInp.value = '';
    fordiInp.focus();
  }

  function avbryt() {
    if (venter) venter.forEach((v) => lapper[v].classList.remove('valgt'));
    venter = null; valgt = null;
    fordiForm.hidden = true;
  }

  function leggTil() {
    if (!venter) return;
    const fordi = fordiInp.value.trim();
    if (fordi.length < 3) { fordiInp.placeholder = 'Hver tråd krever et «fordi». Selv her.'; fordiInp.focus(); return; }
    const [fra, til] = venter;
    if (!lenker.some((l) => (l.fra === fra && l.til === til) || (l.fra === til && l.til === fra))) {
      lenker.push({ fra, til, fordi });
    }
    tilstand.utkast.traad = lenker; lagre();
    avbryt();
    tegn();
  }

  function tegn() {
    traadLag.replaceChildren(...lenker.map((l) => {
      const [x1, y1] = PLASSER[l.fra];
      const [x2, y2] = PLASSER[l.til];
      return svg('line', { class: 'traad', x1, y1: y1 - 20, x2, y2: y2 - 20 });
    }));
    liste.replaceChildren(...lenker.map((l, i) => el('li', {},
      el('span', {}, `${navn(l.fra)} ↔ ${navn(l.til)}: `, el('em', {}, l.fordi)),
      el('button', { class: 'sekundaer liten', 'aria-label': 'Fjern tråd', onclick: () => { lenker.splice(i, 1); tilstand.utkast.traad = lenker; lagre(); tegn(); } }, '✕')
    )));
    const p = Math.pow(0.35, lenker.length);
    status.textContent = `${lenker.length} tråder · sannsynlighet for at alle stemmer: ${prosent(p)}`;
  }
  tegn();

  const vurder = el('button', {
    onclick: async () => {
      resultat.replaceChildren();
      if (lenker.length < 4) return feil(resultat, new Error('Minst fire tråder. Ingen har noensinne blitt paranoid av tre.'));
      try {
        const r = await api('/api/vurder', { nivaa: 'traad', data: { lenker } });
        resultat.append(el('div', { class: 'resultat' },
          meterpar(r.overbevisning, r.sannsynlighet, r.enAv),
          el('p', { class: 'rang' }, 'Vurdering: ', el('strong', {}, r.rang), r.sirkel ? ' · 🔁 SIRKEL OPPDAGET' : ''),
          el('p', { class: 'kommentar' }, r.kommentar),
          teknikkliste(r.teknikker),
          bakromKnapp(n, r.overbevisning)
        ));
      } catch (e) { feil(resultat, e); }
    },
  }, '📌 Vurder tavla');

  kropp.append(
    el('p', { class: 'hint' }, 'Klikk én lapp, så en annen. Skriv hvorfor de henger sammen.'),
    el('div', { class: 'tavle-wrap' }, tavle),
    fordiForm, status, liste,
    el('div', { class: 'knapper' }, vurder)
  );
}

// ---------------------------------------------------------------------------
// Nivå 4: Sitatsmia
// ---------------------------------------------------------------------------

function byggSitat(kropp, resultat, n) {
  const borte = new Set(Array.isArray(tilstand.utkast.sitat) ? tilstand.utkast.sitat : []);
  const forhånd = el('div', { class: 'sitatkort', 'aria-live': 'polite' });

  const ordspans = SAK.pressemelding.map((o, i) => {
    const s = el('span', { class: 'ord' + (borte.has(i) ? ' borte' : ''), tabindex: '0', role: 'button', 'aria-pressed': String(borte.has(i)) }, o);
    const veksle = () => {
      if (borte.has(i)) borte.delete(i); else borte.add(i);
      s.classList.toggle('borte', borte.has(i));
      s.setAttribute('aria-pressed', String(borte.has(i)));
      tilstand.utkast.sitat = [...borte]; lagre();
      oppdater();
    };
    s.addEventListener('click', veksle);
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); veksle(); } });
    return s;
  });

  function beholdt() { return SAK.pressemelding.map((_, i) => i).filter((i) => !borte.has(i)); }

  function oppdater() {
    const b = beholdt();
    let t = '';
    b.forEach((idx, k) => {
      if (k > 0 && idx !== b[k - 1] + 1) t += ' ...';
      t += (k ? ' ' : '') + SAK.pressemelding[idx];
    });
    forhånd.textContent = t ? `«${t}»` : '«…»';
  }
  oppdater();

  const pm = el('div', { class: 'pressemelding' },
    el('div', { class: 'pressemelding-hode' }, 'Pressemelding · Avdeling for normaltid · 24.10.2026 (fiktiv)'),
    ...ordspans.flatMap((s) => [s, ' '])
  );

  const smi = el('button', {
    onclick: async () => {
      resultat.replaceChildren();
      try {
        const r = await api('/api/vurder', { nivaa: 'sitat', data: { beholdt: beholdt() } });
        if (!r.sitat) return feil(resultat, new Error(r.kommentar));
        resultat.append(el('div', { class: 'resultat' },
          el('div', { class: 'sitatkort' }, r.sitat),
          el('div', { class: 'meterpar', style: 'margin-top:14px' },
            el('div', { class: 'meter opp' },
              el('div', { class: 'meter-navn' }, 'Kontekst fjernet'),
              el('div', { class: 'meter-tall' }, r.dodelighet + ' %'),
              el('div', { class: 'meter-bar' }, el('div', { style: `width:${r.dodelighet}%` }))),
            el('div', { class: 'meter opp' },
              el('div', { class: 'meter-navn' }, 'Uhyggefaktor'),
              el('div', { class: 'meter-tall' }, r.overbevisning + ' / 100'),
              el('div', { class: 'meter-bar' }, el('div', { style: `width:${r.overbevisning}%` })))
          ),
          el('p', { class: 'rang' }, 'Vurdering: ', el('strong', {}, r.rang), ` · ${r.hull} sett med «...»`),
          el('p', { class: 'kommentar' }, r.kommentar),
          bakromKnapp(n, r.overbevisning)
        ));
      } catch (e) { feil(resultat, e); }
    },
  }, '⚒ Smi sitatet');

  kropp.append(
    el('p', { class: 'hint' }, 'Klikk på ord for å sladde dem. Klikk igjen for å angre.'),
    pm,
    el('p', { class: 'meter-navn', style: 'margin-top:14px' }, 'Forhåndsvisning'),
    forhånd,
    el('div', { class: 'knapper' }, smi,
      el('button', { class: 'sekundaer', onclick: () => { borte.clear(); ordspans.forEach((s) => s.classList.remove('borte')); tilstand.utkast.sitat = []; lagre(); oppdater(); } }, 'Gjenopprett konteksten (kjedelig)'))
  );
}

// ---------------------------------------------------------------------------
// Nivå 5: Motbevis-immunforsvaret
// ---------------------------------------------------------------------------

const JUKSELAPP = [
  'Akkurat det de vil at du skal tro.',
  'Hvem betalte for den rapporten?',
  'Det er et røykteppe.',
  'Selvfølgelig sier de det – de er også med på det.',
  'Nettopp derfor er det så mistenkelig.',
];

function byggImmun(kropp, resultat, n) {
  const svar = Array.isArray(tilstand.utkast.immun) ? tilstand.utkast.immun : [];
  const felt = SAK.motbevis.map((m, i) => {
    const t = el('textarea', { placeholder: 'Hvorfor bekrefter dette egentlig teorien?', 'aria-label': `Svar på motbevis ${i + 1}` });
    t.value = svar[i] || '';
    t.addEventListener('input', () => { svar[i] = t.value; tilstand.utkast.immun = svar; lagre(); });
    const lapp = el('div', { class: 'jukselapp' }, ...JUKSELAPP.map((j) =>
      el('button', { type: 'button', onclick: () => { t.value = (t.value + ' ' + j).trim(); t.dispatchEvent(new Event('input')); } }, '+ ' + j)
    ));
    return { t, node: el('div', { class: 'motbevis' }, el('div', { class: 'motbevis-tekst' }, m), t, lapp) };
  });

  const vurder = el('button', {
    onclick: async () => {
      resultat.replaceChildren();
      try {
        const r = await api('/api/vurder', { nivaa: 'immun', data: { svar: felt.map((f) => f.t.value) } });
        resultat.append(el('div', { class: 'resultat' },
          el('div', { class: 'meterpar' },
            el('div', { class: 'meter opp' },
              el('div', { class: 'meter-navn' }, 'Immunitet mot virkeligheten'),
              el('div', { class: 'meter-tall' }, r.immunitet + ' %'),
              el('div', { class: 'meter-bar' }, el('div', { style: `width:${r.immunitet}%` }))),
            el('div', { class: 'meter ned' },
              el('div', { class: 'meter-navn' }, 'Falsifiserbarhet (det vitenskapen krever)'),
              el('div', { class: 'meter-tall' }, r.falsifiserbarhet + ' %'),
              el('div', { class: 'meter-bar' }, el('div', { style: `width:${r.falsifiserbarhet}%` })))
          ),
          el('p', { class: 'rang' }, 'Vurdering: ', el('strong', {}, r.rang)),
          el('p', { class: 'kommentar' }, r.kommentar),
          r.monstre.length
            ? el('div', { class: 'teknikker' }, el('div', { class: 'meter-navn' }, 'Immunmekanismer i bruk'),
                ...r.monstre.map((m) => el('div', { class: 'teknikk' }, el('b', {}, m.navn), ` ×${m.antall}`)))
            : null,
          bakromKnapp(n, r.overbevisning)
        ));
      } catch (e) { feil(resultat, e); }
    },
  }, '🛡 Test immunforsvaret');

  kropp.append(...felt.map((f) => f.node), el('div', { class: 'knapper' }, vurder));
}

// ---------------------------------------------------------------------------
// Nivå 6: Viralovnen
// ---------------------------------------------------------------------------

function byggViral(kropp, resultat, n) {
  const tekst = el('textarea', { placeholder: 'Skriv innlegget. Tips: hent inn teorien fra nivå 1.', maxlength: 1200, 'aria-label': 'Innlegg' });
  tekst.value = tilstand.utkast.viral || '';
  tekst.addEventListener('input', () => { tilstand.utkast.viral = tekst.value; lagre(); });
  const sett = (v) => { tekst.value = v; tekst.dispatchEvent(new Event('input')); };

  const verktoy = el('div', { class: 'knapper' },
    el('button', { class: 'sekundaer liten', onclick: () => sett(tilstand.utkast.cuibono || tekst.value) }, '↺ Hent teorien fra nivå 1'),
    el('button', { class: 'sekundaer liten', onclick: () => sett(tekst.value.toUpperCase()) }, '⇪ CAPS LOCK'),
    el('button', { class: 'sekundaer liten', onclick: () => sett(tekst.value + ' 🚨👁️⏰') }, '+ 🚨👁️⏰'),
    el('button', { class: 'sekundaer liten', onclick: () => sett(tekst.value + '\n\nDEL FØR DE SLETTER DETTE!!') }, '+ Del før de sletter'),
    el('button', { class: 'sekundaer liten', onclick: () => sett(tekst.value + '\nGjør din egen research.') }, '+ Gjør din egen research'),
    el('button', { class: 'sekundaer liten', onclick: () => sett(tekst.value + '\nHvorfor snakker ingen om dette???') }, '+ Hvorfor snakker ingen …')
  );

  const alias = el('input', { type: 'text', placeholder: 'Alias (f.eks. «Sannhetssøker1814»)', maxlength: 40, 'aria-label': 'Alias' });
  alias.value = tilstand.alias || '';
  alias.addEventListener('input', () => { tilstand.alias = alias.value; lagre(); });

  const vurder = el('button', {
    onclick: async () => {
      resultat.replaceChildren();
      if (tekst.value.trim().length < 20) return feil(resultat, new Error('Minst 20 tegn. Selv kjedebrev har en ingress.'));
      try {
        const r = await api('/api/vurder', { nivaa: 'viral', data: { tekst: tekst.value } });
        const navn = alias.value.trim() || 'Anonym sannhetssøker';
        const publiser = el('button', {
          onclick: async () => {
            publiser.disabled = true;
            try {
              await api('/api/teorier', { alias: navn, tekst: tekst.value });
              publiser.textContent = '✓ Publisert til Arkivet';
              lastArkiv();
            } catch (e) { publiser.disabled = false; feil(resultat, e); }
          },
        }, '📤 Publiser til Arkivet');
        resultat.append(el('div', { class: 'resultat' },
          el('div', { class: 'post' },
            el('div', { class: 'post-hode' }, el('div', { class: 'avatar' }, '🦉'),
              el('div', {}, el('div', { class: 'post-navn' }, navn), el('div', { class: 'post-tid' }, 'for 3 min siden · 🌐'))),
            el('div', { class: 'post-tekst' }, tekst.value),
            el('div', { class: 'post-tall' },
              el('span', {}, `😡😮 ${Math.round(r.delinger * 2.3).toLocaleString('nb-NO')}`),
              el('span', {}, `${r.delinger.toLocaleString('nb-NO')} delinger`)),
            el('div', { class: 'faktasjekk-merke' }, `ℹ Faktasjekk publisert. Delt ${r.rettelseDelinger.toLocaleString('nb-NO')} ganger.`)
          ),
          el('div', { class: 'meterpar', style: 'margin-top:14px' },
            el('div', { class: 'meter opp' },
              el('div', { class: 'meter-navn' }, 'Viralitet'),
              el('div', { class: 'meter-tall' }, r.viralitet + ' / 100'),
              el('div', { class: 'meter-bar' }, el('div', { style: `width:${r.viralitet}%` }))),
            el('div', { class: 'meter ned' },
              el('div', { class: 'meter-navn' }, 'Faktainnhold'),
              el('div', { class: 'meter-tall' }, r.faktainnhold + ' %'),
              el('div', { class: 'meter-bar' }, el('div', { style: `width:${r.faktainnhold}%` })))
          ),
          el('p', { class: 'rang' }, 'Vurdering: ', el('strong', {}, r.rang)),
          el('p', { class: 'kommentar' }, r.kommentar),
          teknikkliste(r.teknikker),
          el('div', { class: 'knapper' }, publiser),
          bakromKnapp(n, r.overbevisning)
        ));
      } catch (e) { feil(resultat, e); }
    },
  }, '🔥 Sett i ovnen');

  kropp.append(alias, el('div', { style: 'height:8px' }), tekst, verktoy, el('div', { class: 'knapper' }, vurder));
}

const BYGGERE = {
  cuibono: byggCuiBono,
  tallmagi: byggTallmagi,
  traad: byggTraad,
  sitat: byggSitat,
  immun: byggImmun,
  viral: byggViral,
};

// ---------------------------------------------------------------------------
// Arkivet
// ---------------------------------------------------------------------------

let arkivSort = 'topp';

async function lastArkiv() {
  const liste = document.getElementById('arkiv-liste');
  try {
    const teorier = await api('/api/teorier?sort=' + arkivSort);
    if (!teorier.length) {
      liste.replaceChildren(el('p', { class: 'tom' }, 'Arkivet er tomt. Mistenkelig tomt. Bli den første til å publisere fra Viralovnen.'));
      return;
    }
    liste.replaceChildren(...teorier.map(teorikort));
  } catch (e) {
    liste.replaceChildren();
    feil(liste, e);
  }
}

function teorikort(t) {
  const harStemt = tilstand.stemt.includes(t.id);
  const stemKnapp = (type, tekst, klasse) => el('button', {
    class: klasse, disabled: harStemt,
    onclick: async () => {
      try {
        await api(`/api/teorier/${encodeURIComponent(t.id)}/stem`, { type });
        tilstand.stemt.push(t.id); lagre();
        lastArkiv();
      } catch (e) { alert(e.message); }
    },
  }, tekst);
  const p = typeof t.sannsynlighet === 'number' ? t.sannsynlighet : 0;
  return el('article', { class: 'teori' },
    el('div', { class: 'teori-alias' }, t.alias, ' · ', new Date(t.tid).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })),
    el('div', { class: 'teori-tekst' }, t.tekst),
    el('div', { class: 'teori-meta' }, `${t.rang} · overbevisning ${t.overbevisning} · sannsynlighet ${prosent(p)}`),
    el('div', { class: 'teori-stem' },
      stemKnapp('aapnet', `👁 Åpnet øynene mine (${t.stemmer.aapnet})`),
      stemKnapp('sjekket', `🔍 Jeg sjekket kilden (${t.stemmer.sjekket})`, 'sjekk'))
  );
}

document.querySelectorAll('.sortering button').forEach((b) => b.addEventListener('click', () => {
  arkivSort = b.dataset.sort;
  document.querySelectorAll('.sortering button').forEach((x) => x.classList.toggle('aktiv', x === b));
  lastArkiv();
}));

// ---------------------------------------------------------------------------
// Avsløringen
// ---------------------------------------------------------------------------

function visDebrief(rull) {
  const d = document.getElementById('debrief');
  d.hidden = false;
  document.getElementById('debrief-liste').replaceChildren(...SAK.nivaer.map((n) =>
    el('div', { class: 'debrief-kort' },
      el('div', { class: 'fra' }, `Nivå ${n.nr}: ${n.navn}` + (tilstand.ferdig[n.id] != null ? ' ✓' : '')),
      el('h4', {}, n.bakrom.navn),
      el('p', {}, n.bakrom.tekst))
  ));
  if (rull) d.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('nullstill').addEventListener('click', () => {
  if (!confirm('Slette all fremgang og alle utkast? (Arkivet påvirkes ikke.)')) return;
  const stemt = tilstand.stemt;
  tilstand = { aktiv: 'cuibono', ferdig: {}, utkast: {}, tallForsok: 0, stemt, alias: '' };
  lagre();
  document.getElementById('debrief').hidden = true;
  tegnFaner(); tegnNivaa(); oppdaterGlobal();
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

(async function start() {
  try {
    SAK = await api('/api/sak');
  } catch (e) {
    document.getElementById('sak-tittel').textContent = 'Kunne ikke nå serveren. Kjør «node server.js» og last siden på nytt.';
    return;
  }
  if (!nivaaFor(tilstand.aktiv)) tilstand.aktiv = 'cuibono';
  tegnSak();
  tegnFaner();
  tegnNivaa();
  oppdaterGlobal();
  lastArkiv();
})();
