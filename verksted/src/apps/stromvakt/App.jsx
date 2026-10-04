import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackupCard, Chips, Shell, useNow } from '../../shared/ui.jsx';
import { useStore } from '../../shared/store.js';
import { fmtTime, num } from '../../shared/util.js';

const P = 'strom:';
const ZONES = [
  { value: 'NO1', label: 'NO1 Øst' }, { value: 'NO2', label: 'NO2 Sør' }, { value: 'NO3', label: 'NO3 Midt' },
  { value: 'NO4', label: 'NO4 Nord' }, { value: 'NO5', label: 'NO5 Vest' },
];
const JOBS = [
  { value: 1, label: 'Tørketrommel 1t' }, { value: 2, label: 'Oppvask 2t' }, { value: 3, label: 'Vask 3t' }, { value: 6, label: 'Elbil 6t' },
];

const ymd = (d) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')];
async function fetchDay(zone, date) {
  const [y, m, d] = ymd(date);
  const r = await fetch(`https://www.hvakosterstrommen.no/api/v1/prices/${y}/${m}-${d}_${zone}.json`);
  if (r.status === 404) return null; // morgendagens priser er ikke publisert ennå (kommer ca. kl. 13)
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const rows = await r.json();
  return rows.map((x) => ({ start: new Date(x.time_start).getTime(), end: new Date(x.time_end).getTime(), nok: x.NOK_per_kWh }));
}

// Pris per kWh inkl. det brukeren har slått på. Grunnlag fra API: spot eks. mva.
function makePricer(s, zone) {
  const vat = zone === 'NO4' || !s.vat ? 1 : 1.25;
  const grid = num(s.grid) / 100; // nettleie i øre inkl. mva
  return (spot) => {
    if (s.mode === 'norgespris') return num(s.norgespris) / 100 * vat + grid;
    let p = spot;
    if (s.support) { const t = num(s.threshold) / 100; if (p > t) p = p - (p - t) * (num(s.supportPct) / 100); }
    return p * vat + grid;
  };
}

// Billigste sammenhengende vindu på `hours` timer blant fremtidige slott.
function cheapestWindow(slots, hours, price, now) {
  const fut = slots.filter((s) => s.end > now);
  if (!fut.length) return null;
  const slotMs = fut[0].end - fut[0].start;
  const n = Math.max(1, Math.round((hours * 3600000) / slotMs));
  let best = null;
  for (let i = 0; i + n <= fut.length; i++) {
    const w = fut.slice(i, i + n);
    if (w[n - 1].end - w[0].start !== n * slotMs) continue; // hull i dataen
    const avg = w.reduce((a, x) => a + price(x.nok), 0) / n;
    if (!best || avg < best.avg) best = { start: w[0].start, end: w[n - 1].end, avg };
  }
  return best;
}

function Chart({ slots, price, now }) {
  if (!slots.length) return null;
  const vals = slots.map((s) => price(s.nok));
  const max = Math.max(...vals, 0.01), min = Math.min(...vals, 0);
  const W = 100, H = 40, bw = W / slots.length;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 6}`} style={{ width: '100%', height: 180 }} preserveAspectRatio="none" role="img" aria-label="Pris gjennom døgnet">
      {slots.map((s, i) => {
        const v = vals[i], h = ((v - Math.min(0, min)) / (max - Math.min(0, min))) * H;
        const isNow = now >= s.start && now < s.end;
        return <rect key={s.start} x={i * bw + bw * 0.1} y={H - h} width={bw * 0.8} height={Math.max(h, 0.3)} rx={bw * 0.2}
          fill={isNow ? 'var(--text)' : v <= avg ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 35%, var(--surface-2))'} />;
      })}
      {[0, 6, 12, 18].map((h) => { const i = slots.findIndex((s) => new Date(s.start).getHours() === h && new Date(s.start).getMinutes() === 0);
        return i < 0 ? null : <text key={h} x={i * bw} y={H + 5.5} fontSize="3.5" fill="var(--muted)">{String(h).padStart(2, '0')}</text>; })}
    </svg>
  );
}

export default function App() {
  const [zone, setZone] = useStore(P + 'zone', 'NO1');
  const [s, setS] = useStore(P + 'settings', { vat: true, support: true, threshold: '77', supportPct: '90', grid: '0', mode: 'spot', norgespris: '40' });
  const [cache, setCache] = useStore(P + 'cache', {});
  const [job, setJob] = useState(3);
  const [day, setDay] = useState('today');
  const [tab, setTab] = useState('nå');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const now = useNow(30000);

  const keyFor = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${zone}-${ymd(d).join('')}`; };
  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const out = {};
      for (const off of [0, 1]) {
        const d = new Date(); d.setDate(d.getDate() + off);
        const k = `${zone}-${ymd(d).join('')}`;
        const rows = await fetchDay(zone, d);
        if (rows) out[k] = rows;
      }
      setCache((c) => {
        const t = ymd(new Date()).join('');
        const keep = Object.fromEntries(Object.entries(c).filter(([k]) => k.slice(-8) >= t));
        return { ...keep, ...out };
      });
    } catch (e) {
      setErr('Fikk ikke hentet priser (' + e.message + '). Viser lagret data hvis den finnes.');
    } finally { setLoading(false); }
  }, [zone, setCache]);
  useEffect(() => { load(); }, [load]);

  const price = useMemo(() => makePricer(s, zone), [s, zone]);
  const todaySlots = cache[keyFor(0)] || [];
  const tomorrowSlots = cache[keyFor(1)] || [];
  const all = [...todaySlots, ...tomorrowSlots];
  const cur = todaySlots.find((x) => now >= x.start && now < x.end);
  const shown = day === 'today' ? todaySlots : tomorrowSlots;
  const vals = shown.map((x) => price(x.nok));
  const win = cheapestWindow(all, job, price, now);
  const ore = (v) => `${(v * 100).toFixed(0)} øre`;

  return (
    <Shell title="Strømvakt" tabs={[{ id: 'nå', icon: '⚡', label: 'Nå' }, { id: 'innst', icon: '⚙', label: 'Innstillinger' }]} tab={tab} onTab={setTab}>
      <div style={{ marginBottom: 12 }}><Chips options={ZONES} value={zone} onChange={setZone} /></div>
      {tab === 'nå' && <>
        {err && <div className="card danger small">{err}</div>}
        <div className="card">
          <div className="muted small">Akkurat nå {s.mode === 'norgespris' ? '(Norgespris)' : ''}</div>
          <div className="huge accent mono">{cur ? ore(price(cur.nok)) : loading ? '…' : '–'}</div>
          <div className="muted small">per kWh{s.vat && zone !== 'NO4' ? ' inkl. mva' : ''}{s.support && s.mode === 'spot' ? ' etter strømstøtte' : ''}{num(s.grid) ? ' + nettleie' : ''}{cur ? ` · spot ${ore(cur.nok)} eks. mva` : ''}</div>
        </div>
        <div className="card">
          <h2>Når bør maskina gå?</h2>
          <Chips options={JOBS} value={job} onChange={setJob} />
          {win ? (
            <div style={{ marginTop: 12 }}>
              <div className="big mono">{fmtTime(win.start)}–{fmtTime(win.end)}</div>
              <div className="muted small">{new Date(win.start).toDateString() === new Date().toDateString() ? 'i dag' : 'i morgen'} · snitt {ore(win.avg)}/kWh</div>
            </div>
          ) : <p className="muted small" style={{ marginTop: 12 }}>Ikke nok data fremover ennå.</p>}
        </div>
        <div className="card">
          <div className="row between" style={{ marginBottom: 8 }}>
            <Chips options={[{ value: 'today', label: 'I dag' }, { value: 'tomorrow', label: 'I morgen' }]} value={day} onChange={setDay} />
            <button className="btn sm ghost" onClick={load} disabled={loading}>{loading ? '…' : 'Oppdater'}</button>
          </div>
          {shown.length ? <>
            <Chart slots={shown} price={price} now={now} />
            <div className="grid2 small" style={{ marginTop: 8 }}>
              <div>Lavest <b className="mono">{ore(Math.min(...vals))}</b> kl. {fmtTime(shown[vals.indexOf(Math.min(...vals))].start)}</div>
              <div>Høyest <b className="mono">{ore(Math.max(...vals))}</b> kl. {fmtTime(shown[vals.indexOf(Math.max(...vals))].start)}</div>
              <div>Snitt <b className="mono">{ore(vals.reduce((a, b) => a + b, 0) / vals.length)}</b></div>
              <div className="muted">{shown.length} prisperioder</div>
            </div>
          </> : <p className="muted small">{day === 'tomorrow' ? 'Morgendagens priser publiseres rundt kl. 13.' : 'Ingen data.'}</p>}
        </div>
        <p className="muted small">Priser fra hvakosterstrommen.no (Nord Pool day-ahead). Sist hentet lagres for bruk uten nett.</p>
      </>}

      {tab === 'innst' && <>
        <div className="card">
          <h2>Avtale</h2>
          <Chips options={[{ value: 'spot', label: 'Spotpris' }, { value: 'norgespris', label: 'Norgespris (fast)' }]} value={s.mode} onChange={(v) => setS({ ...s, mode: v })} />
          {s.mode === 'norgespris' && <label className="field" style={{ marginTop: 12 }}><span>Norgespris øre/kWh eks. mva</span><input className="input" inputMode="decimal" value={s.norgespris} onChange={(e) => setS({ ...s, norgespris: e.target.value })} /></label>}
        </div>
        <div className="card">
          <label className="row between" style={{ marginBottom: 10 }}><span>Legg på 25 % mva (ikke NO4)</span><input type="checkbox" checked={s.vat} onChange={(e) => setS({ ...s, vat: e.target.checked })} /></label>
          <label className="row between" style={{ marginBottom: 10 }}><span>Trekk fra strømstøtte</span><input type="checkbox" checked={s.support} onChange={(e) => setS({ ...s, support: e.target.checked })} /></label>
          {s.support && <div className="grid2">
            <label className="field"><span>Terskel øre eks. mva</span><input className="input" inputMode="decimal" value={s.threshold} onChange={(e) => setS({ ...s, threshold: e.target.value })} /></label>
            <label className="field"><span>Dekning %</span><input className="input" inputMode="decimal" value={s.supportPct} onChange={(e) => setS({ ...s, supportPct: e.target.value })} /></label>
          </div>}
          <label className="field"><span>Nettleie energiledd (øre/kWh inkl. mva)</span><input className="input" inputMode="decimal" value={s.grid} onChange={(e) => setS({ ...s, grid: e.target.value })} /></label>
          <p className="muted small">Satsene for strømstøtte og Norgespris endres av staten. Sjekk gjeldende tall hos nettselskapet ditt eller regjeringen.no og rett her.</p>
        </div>
        <BackupCard prefix={P} appName="Strømvakt" />
      </>}
    </Shell>
  );
}
