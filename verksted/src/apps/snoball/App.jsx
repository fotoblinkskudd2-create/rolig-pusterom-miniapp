import { useMemo, useState } from 'react';
import { BackupCard, Chips, Empty, Field, Sheet, Shell } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { addMonths, fmtDate, kr, num } from '../../shared/util.js';

const P = 'snoball:';

// Månedlig simulering. Minstebeløp på alt, ekstra (+ frigjorte minstebeløp) på målgjelda.
export function simulate(debts, extra, strategy) {
  let ds = debts.map((d) => ({ id: d.id, name: d.name, bal: num(d.balance), r: num(d.rate) / 100 / 12, min: num(d.min), fee: num(d.fee) })).filter((d) => d.bal > 0);
  const order = [...ds].sort(strategy === 'avalanche' ? (a, b) => b.r - a.r || a.bal - b.bal : (a, b) => a.bal - b.bal || b.r - a.r).map((d) => d.id);
  const budget = ds.reduce((a, d) => a + d.min, 0) + num(extra);
  const paidOff = []; const totals = [];
  let interest = 0, fees = 0, month = 0;
  while (ds.some((d) => d.bal > 0.5) && month < 600) {
    month++;
    for (const d of ds) if (d.bal > 0) { const i = d.bal * d.r; d.bal += i + d.fee; interest += i; fees += d.fee; }
    let money = budget;
    for (const d of ds) if (d.bal > 0) { const p = Math.min(d.min, d.bal, money); d.bal -= p; money -= p; }
    for (const id of order) { const d = ds.find((x) => x.id === id); if (d.bal > 0 && money > 0) { const p = Math.min(d.bal, money); d.bal -= p; money -= p; } }
    for (const d of ds) if (d.bal <= 0.5 && !paidOff.find((p) => p.id === d.id)) { d.bal = 0; paidOff.push({ id: d.id, name: d.name, month }); }
    totals.push(ds.reduce((a, d) => a + d.bal, 0));
    if (month > 2 && totals[month - 1] >= totals[month - 2] && totals[month - 2] >= (totals[month - 3] ?? Infinity)) return { stuck: true, budget };
  }
  return { months: month, interest, fees, paidOff, totals, budget, stuck: month >= 600 };
}

function Line({ series, colors, start }) {
  const max = Math.max(1, start, ...series.flatMap((s) => s));
  const len = Math.max(...series.map((s) => s.length), 1);
  return (
    <svg viewBox="0 0 100 40" style={{ width: '100%', height: 140 }} preserveAspectRatio="none">
      {series.map((s, k) => (
        <polyline key={k} fill="none" stroke={colors[k]} strokeWidth="2.5" vectorEffect="non-scaling-stroke" points={[start, ...s].map((v, i) => `${(i / len) * 100},${40 - (v / max) * 38}`).join(' ')} />
      ))}
    </svg>
  );
}

export default function App() {
  const [debts, setDebts] = useStore(P + 'debts', []);
  const [extra, setExtra] = useStore(P + 'extra', '1000');
  const [strategy, setStrategy] = useStore(P + 'strategy', 'snowball');
  const [tab, setTab] = useState('plan');
  const [edit, setEdit] = useState(null);

  const total = debts.reduce((a, d) => a + num(d.balance), 0);
  const snow = useMemo(() => simulate(debts, extra, 'snowball'), [debts, extra]);
  const aval = useMemo(() => simulate(debts, extra, 'avalanche'), [debts, extra]);
  const base = useMemo(() => simulate(debts, 0, 'snowball'), [debts]);
  const pick = strategy === 'avalanche' ? aval : snow;
  const freeDate = pick.months ? addMonths(new Date(), pick.months) : null;

  const save = (f) => { setDebts((xs) => (f.id ? xs.map((x) => (x.id === f.id ? f : x)) : [...xs, { ...f, id: uid() }])); setEdit(null); };
  const blank = { name: '', balance: '', rate: '', min: '', fee: '0' };

  return (
    <Shell title="Gjeld-Snøball" tabs={[{ id: 'plan', icon: '◐', label: 'Plan' }, { id: 'gjeld', icon: '▤', label: 'Gjeld' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'plan' && (debts.length === 0 ? (
        <div className="card"><Empty title="Se monsteret i øynene">Legg inn hver gjeld: kredittkort, forbrukslån, delbetaling, inkasso. Saldo, rente, minstebeløp.<br /><br /><button className="btn primary" onClick={() => { setTab('gjeld'); setEdit(blank); }}>Legg inn første gjeld</button></Empty></div>
      ) : <>
        <div className="card">
          <div className="muted small">Total gjeld</div>
          <div className="big mono">{kr(total)}</div>
          <hr />
          {pick.stuck ? <p className="danger"><b>Du betaler ikke nok til å komme ned.</b> Rentene spiser innbetalingene. Øk beløpet eller ring en gjeldsrådgiver.</p> : <>
            <div className="muted small">Gjeldfri</div>
            <div className="huge accent">{fmtDate(freeDate, { month: 'long', year: 'numeric' })}</div>
            <div className="muted small">{Math.floor(pick.months / 12)} år {pick.months % 12} mnd · {kr(pick.budget)}/mnd · renter {kr(pick.interest)} · gebyrer {kr(pick.fees)}</div>
          </>}
        </div>
        <div className="card">
          <Field label="Ekstra per måned i tillegg til minstebeløp">
            <input className="input" inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} />
          </Field>
          <div className="chips">{[0, 500, 1000, 2000, 5000].map((v) => <button key={v} className={'chip' + (num(extra) === v ? ' on' : '')} onClick={() => setExtra(String(v))}>+{v}</button>)}</div>
        </div>
        <div className="card">
          <h2>Snøball eller skred?</h2>
          <Chips options={[{ value: 'snowball', label: 'Snøball (minste først)' }, { value: 'avalanche', label: 'Skred (dyreste rente først)' }]} value={strategy} onChange={setStrategy} />
          {!snow.stuck && !aval.stuck && <div className="grid2" style={{ marginTop: 12 }}>
            <div className="small"><b>Snøball</b><br />{snow.months} mnd<br />renter {kr(snow.interest)}</div>
            <div className="small"><b>Skred</b><br />{aval.months} mnd<br />renter {kr(aval.interest)}</div>
          </div>}
          <p className="muted small" style={{ marginTop: 10 }}>Skred er billigst på papiret. Snøball gir raske seire – og folk som får seire, gir ikke opp. Velg den du faktisk holder ut.</p>
          {!pick.stuck && !base.stuck && base.months > pick.months && <p className="small" style={{ marginTop: 8 }}>Ekstrabeløpet kutter <b>{base.months - pick.months} måneder</b> og <b className="ok">{kr(base.interest - pick.interest)}</b> i renter.</p>}
        </div>
        {!pick.stuck && <>
          <div className="card">
            <h2>Gjelda over tid</h2>
            <Line start={total} series={[base.stuck ? [] : base.totals, pick.totals]} colors={['var(--line)', 'var(--accent)']} />
            <p className="muted small">Grå: bare minstebeløp. Farge: din plan.</p>
          </div>
          <div className="card">
            <h2>Rekkefølgen</h2>
            <ul className="list">{pick.paidOff.map((p, i) => (
              <li key={p.id}><span className="badge hot">{i + 1}</span><span className="grow">{p.name}</span><span className="muted small">{fmtDate(addMonths(new Date(), p.month), { month: 'short', year: 'numeric' })}</span></li>
            ))}</ul>
          </div>
        </>}
      </>)}

      {tab === 'gjeld' && <>
        <button className="btn primary block" style={{ marginBottom: 12 }} onClick={() => setEdit(blank)}>+ Legg til gjeld</button>
        <div className="card">
          {debts.length === 0 ? <Empty title="Ingen gjeld lagt inn" /> : (
            <ul className="list">{debts.map((d) => (
              <li key={d.id} onClick={() => setEdit(d)} style={{ cursor: 'pointer' }}>
                <div className="grow"><b>{d.name}</b><div className="muted small">{num(d.rate)} % · min {kr(d.min)}/mnd{num(d.fee) ? ` · gebyr ${kr(d.fee)}` : ''}</div></div>
                <b className="mono">{kr(d.balance)}</b>
              </li>
            ))}</ul>
          )}
        </div>
        <p className="muted small">Har du betalt? Trykk på gjelda og oppdater saldoen. Planen regnes på nytt.</p>
      </>}

      {tab === 'mer' && <>
        <div className="card small">
          <h2>Hjelp som er gratis</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li><b>Gjeldsregisteret</b> (gjeldsregisteret.com): se all usikret gjeld – kredittkort og forbrukslån – samlet.</li>
            <li><b>NAV</b> har gratis økonomi- og gjeldsrådgivning, på telefon og ved NAV-kontoret.</li>
            <li><b>Inkasso:</b> sjekk at salærene er riktige. Du kan be om nedbetalingsavtale.</li>
            <li>Refinansiering kan hjelpe – men bare hvis du kutter kortene samtidig.</li>
          </ul>
        </div>
        <BackupCard prefix={P} appName="Gjeld-Snøball" />
      </>}

      {edit && (
        <Sheet title={edit.id ? 'Endre gjeld' : 'Ny gjeld'} onClose={() => setEdit(null)}>
          <Field label="Navn"><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Kredittkort, Klarna, billån …" /></Field>
          <div className="grid2">
            <Field label="Saldo"><input className="input" inputMode="decimal" value={edit.balance} onChange={(e) => setEdit({ ...edit, balance: e.target.value })} /></Field>
            <Field label="Rente % (nominell)"><input className="input" inputMode="decimal" value={edit.rate} onChange={(e) => setEdit({ ...edit, rate: e.target.value })} /></Field>
            <Field label="Minstebeløp/mnd"><input className="input" inputMode="decimal" value={edit.min} onChange={(e) => setEdit({ ...edit, min: e.target.value })} /></Field>
            <Field label="Gebyr/mnd"><input className="input" inputMode="decimal" value={edit.fee} onChange={(e) => setEdit({ ...edit, fee: e.target.value })} /></Field>
          </div>
          <div className="stack">
            <button className="btn primary block" disabled={!edit.name || !num(edit.balance)} onClick={() => save(edit)}>Lagre</button>
            {edit.id && <button className="btn danger block" onClick={() => { setDebts((xs) => xs.filter((x) => x.id !== edit.id)); setEdit(null); }}>Slett (betalt ned!)</button>}
          </div>
        </Sheet>
      )}
    </Shell>
  );
}
