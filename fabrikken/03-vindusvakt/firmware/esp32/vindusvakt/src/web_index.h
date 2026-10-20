// GENERERT fra index.html av tools/bake_web.py
#pragma once
static const char WEB_INDEX[] = R"STAFETTWEB(<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#e9ecef">
<title>Vindusvakt</title>
<style>
  /* Kaldt vinduslys: blågrå papir, blekk, én fjordblå aksent. */
  :root { --papir: #e9ecef; --kort: #f6f7f8; --blekk: #1d2226; --dempet: #66707a; --linje: #cfd5da; --fjord: #2f5f7a; }
  @media (prefers-color-scheme: dark) {
    :root { --papir: #12161a; --kort: #1b2126; --blekk: #e3e8ec; --dempet: #8e99a3; --linje: #2c353d; --fjord: #8cc0dc; }
  }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  html, body { margin: 0; background: var(--papir); color: var(--blekk); }
  body { font: 16px/1.45 -apple-system, system-ui, sans-serif; padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
  header { padding: calc(14px + env(safe-area-inset-top)) 16px 10px; display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--linje); }
  .merke { font-weight: 800; letter-spacing: .14em; font-size: 13px; }
  main { max-width: 560px; margin: 0 auto; padding: 0 16px; }
  h2 { font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--dempet); margin: 26px 0 10px; }
  .lys { font-size: 22px; line-height: 1.3; margin-top: 18px; }
  .stort { font-size: 64px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
  .stort small { font-size: 22px; font-weight: 700; }
  .uke { display: grid; grid-template-columns: 26px repeat(7, 1fr); gap: 2px; align-items: center; }
  .uke canvas { width: 100%; aspect-ratio: 4 / 3; image-rendering: pixelated; display: block; background: var(--linje); }
  .uke .t, .uke .d { font-size: 11px; color: var(--dempet); text-align: center; font-variant-numeric: tabular-nums; }
  .kort { background: var(--kort); border: 1px solid var(--linje); border-radius: 12px; padding: 14px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { border: 1px solid var(--linje); background: var(--kort); color: inherit; border-radius: 999px; padding: 7px 12px; font: inherit; font-size: 14px; cursor: pointer; }
  .chip[aria-pressed="true"] { background: var(--fjord); color: var(--kort); border-color: var(--fjord); }
  .rad { display: flex; gap: 8px; }
  .rad > * { flex: 1; min-width: 0; }
  label { display: block; font-size: 13px; font-weight: 600; margin: 10px 0 4px; }
  input { width: 100%; font: inherit; color: inherit; background: var(--kort); border: 1px solid var(--linje); border-radius: 10px; padding: 10px; }
  .knapp { margin-top: 12px; width: 100%; padding: 13px; border: 0; border-radius: 10px; background: var(--blekk); color: var(--papir); font: inherit; font-weight: 700; cursor: pointer; }
  .knapp:focus-visible, .chip:focus-visible, input:focus { outline: 2px solid var(--fjord); outline-offset: 1px; }
  .melding { min-height: 1.4em; font-size: 14px; margin-top: 6px; color: var(--dempet); }
  .kobling { background: var(--kort); border: 1px solid var(--fjord); border-radius: 10px; padding: 12px; margin-top: 16px; }
  .liten { font-size: 13px; color: var(--dempet); margin-top: 26px; }
</style>
</head>
<body>
<header><span class="merke">VINDUSVAKT</span><span id="sted" style="color:var(--dempet)"></span></header>
<main>
  <div id="kobling" class="kobling" hidden></div>
  <div class="stort" id="stort">–</div>
  <div class="lys" id="lys"></div>

  <h2>Uka i vinduet</h2>
  <div class="uke" id="uke" aria-label="Sju dager, fire tider om dagen"></div>

  <h2>Hvor står vinduet?</h2>
  <div class="kort">
    <div class="chips" id="steder"></div>
    <div class="rad">
      <div><label for="navn">Navn</label><input id="navn" maxlength="40" autocomplete="off"></div>
    </div>
    <div class="rad">
      <div><label for="lat">Breddegrad</label><input id="lat" inputmode="decimal" placeholder="69.6492"></div>
      <div><label for="lon">Lengdegrad</label><input id="lon" inputmode="decimal" placeholder="18.9553"></div>
    </div>
    <button class="knapp" id="lagre" type="button">Bruk dette stedet</button>
    <div class="melding" id="m-sted" aria-live="polite"></div>
  </div>

  <p class="liten">Rammen tar ett bilde i timen og beholder bare et lite svart-hvitt bilde på 112 × 84 piksler og en lysverdi. Originalen lagres aldri. Ingenting går på nett. Lukk linsedekselet bak når du ikke vil at den skal se.</p>
</main>
<script>
(() => {
  const $ = (s) => document.querySelector(s);
  const lager = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  function lesHash() {
    const k = new URLSearchParams(location.hash.slice(1)).get('k');
    if (k) { lager.set('vv_k', k); history.replaceState(null, '', location.pathname); }
    return k;
  }
  lesHash();
  let nokkel = lager.get('vv_k') || '';
  window.addEventListener('hashchange', () => { const k = lesHash(); if (k) { nokkel = k; last(); } });
  const STEDER = [['Oslo', 59.9139, 10.7522], ['Bergen', 60.3913, 5.3221], ['Trondheim', 63.4305, 10.3951], ['Bodø', 67.2804, 14.4049],
                  ['Tromsø', 69.6492, 18.9553], ['Hammerfest', 70.6634, 23.6821], ['Vardø', 70.3705, 31.1107], ['Longyearbyen', 78.2232, 15.6267]];
  const to = (n) => String(n).padStart(2, '0');
  const DAGER = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
  const TIMER = [8, 12, 16, 20];
  let tilstand = null;

  async function api(sti, kropp) {
    const r = await fetch(sti, { method: kropp ? 'POST' : 'GET', headers: Object.assign({ 'X-Vindusvakt-Nokkel': nokkel }, kropp ? { 'Content-Type': 'application/json' } : {}), body: kropp ? JSON.stringify(kropp) : undefined });
    if (r.status === 401) { const j = await r.json(); $('#kobling').textContent = 'Ikke koblet: ' + j.feil + '.'; $('#kobling').hidden = false; return null; }
    return r;
  }
  async function pbm(url, canvas) {
    const r = await fetch(url, { headers: { 'X-Vindusvakt-Nokkel': nokkel } });
    if (!r.ok) return;
    const b = new Uint8Array(await r.arrayBuffer());
    let i = 0, felt = [], cur = '';
    while (felt.length < 3) { const c = b[i++]; if (c === 10 || c === 32) { if (cur) felt.push(cur); cur = ''; } else cur += String.fromCharCode(c); }
    const w = +felt[1], h = +felt[2], rad = Math.ceil(w / 8);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d'), img = ctx.createImageData(w, h);
    const mork = matchMedia('(prefers-color-scheme: dark)').matches;
    const lys = mork ? [227, 232, 236] : [233, 236, 239], blekk = mork ? [18, 22, 26] : [29, 34, 38];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = (b[i + y * rad + (x >> 3)] & (0x80 >> (x & 7))) ? blekk : lys;
      img.data.set([v[0], v[1], v[2], 255], (y * w + x) * 4);
    }
    ctx.putImageData(img, 0, 0);
  }
  // Lokal midnatt for en dato i Europe/Oslo (telefonen kan stå i en annen tidssone, enheten gjør ikke det)
  function dagStart(ts, forskyv) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + forskyv);
    return d.getTime();
  }
  function tegnUke() {
    const u = $('#uke');
    u.replaceChildren(document.createElement('span'));
    for (let d = -6; d <= 0; d++) {
      const s = document.createElement('span');
      s.className = 'd';
      const dt = new Date(dagStart(tilstand.naa, d));
      s.textContent = d === 0 ? 'i dag' : DAGER[dt.getDay()] + ' ' + dt.getDate();
      u.append(s);
    }
    for (const t of TIMER) {
      const lab = document.createElement('span');
      lab.className = 't';
      lab.textContent = to(t);
      u.append(lab);
      for (let d = -6; d <= 0; d++) {
        const mål = dagStart(tilstand.naa, d) + t * 36e5;
        const c = document.createElement('canvas');
        c.width = 112; c.height = 84;
        u.append(c);
        if (mål > tilstand.naa) continue;
        let best = null, avst = 40 * 6e4 + 1;
        for (const p of tilstand.prover) { const a = Math.abs(p.ts - mål); if (a < avst) { avst = a; best = p; } }
        if (best) { c.setAttribute('aria-label', DAGER[new Date(mål).getDay()] + ' kl. ' + to(t)); pbm('/api/prove/' + best.ts + '.pbm', c); }
      }
    }
  }
  function tegn() {
    const s = tilstand;
    $('#sted').textContent = s.sted.navn;
    if (s.sol.type === 'morketid') $('#stort').innerHTML = s.sol.dager_til_sol + ' <small>dager til sola</small>';
    else if (s.sol.type === 'midnattssol') $('#stort').innerHTML = '24 t <small>midnattssol</small>';
    else $('#stort').innerHTML = Math.floor(s.sol.lengde_min / 60) + ' t <small>' + (s.sol.lengde_min % 60) + ' min lys</small>';
    $('#lys').textContent = s.lys;
    tegnUke();
    const ch = $('#steder');
    ch.replaceChildren();
    for (const [n, la, lo] of STEDER) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = n;
      b.setAttribute('aria-pressed', String(n === s.sted.navn));
      b.addEventListener('click', () => { $('#navn').value = n; $('#lat').value = la; $('#lon').value = lo; });
      ch.append(b);
    }
    if (!$('#navn').value) { $('#navn').value = s.sted.navn; $('#lat').value = s.sted.lat; $('#lon').value = s.sted.lon; }
  }
  async function last() {
    try {
      const r = await api('/api/state?now=' + Date.now());
      if (!r) return;
      tilstand = await r.json();
      $('#kobling').hidden = true;
      tegn();
    } catch (e) { $('#kobling').textContent = 'Finner ikke rammen. Er telefonen på nettet «Vindusvakt-…»?'; $('#kobling').hidden = false; }
  }
  $('#lagre').addEventListener('click', async () => {
    const la = parseFloat(String($('#lat').value).replace(',', '.')), lo = parseFloat(String($('#lon').value).replace(',', '.'));
    if (!isFinite(la) || !isFinite(lo)) { $('#m-sted').textContent = 'Skriv bredde- og lengdegrad som tall, f.eks. 69.6492 og 18.9553.'; return; }
    const r = await api('/api/sted', { navn: $('#navn').value.trim(), lat_u: Math.round(la * 1e6), lon_u: Math.round(lo * 1e6) });
    if (!r) return;
    const j = await r.json();
    $('#m-sted').textContent = j.ok ? 'Lagret. Rammen regner lyset for ' + $('#navn').value.trim() + ' nå.' : j.feil;
    last();
  });
  last();
  setInterval(last, 5 * 60000);
})();
</script>
</body>
</html>
)STAFETTWEB";
