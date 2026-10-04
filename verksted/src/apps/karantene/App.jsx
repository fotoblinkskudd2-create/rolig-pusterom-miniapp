import { useState } from 'react';
import { BackupCard, Chips, Empty, Field, Sheet, Shell, useNow, useToast } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { duration, fmtDate, kr, num } from '../../shared/util.js';

const P = 'karantene:';
const H = 3600000;
const TIMES = [{ value: 24, label: '24 t' }, { value: 72, label: '72 t' }, { value: 168, label: '1 uke' }, { value: 720, label: '30 dager' }];
const QUESTIONS = [
  'Har jeg noe som gjør samme jobben allerede?',
  'Hvor skal den stå / ligge? Konkret.',
  'Ville jeg kjøpt den til full pris kontant, i dag?',
  'Er det jeg som vil ha den – eller en følelse som vil bli dempet?',
  'Hvor mange timer må jeg jobbe for den?',
];

function Delbetaling() {
  const [price, setPrice] = useState('');
  const [months, setMonths] = useState('12');
  const [rate, setRate] = useState('');
  const [fee, setFee] = useState('39');
  const [setup, setSetup] = useState('0');
  const p = num(price), n = Math.max(1, num(months)), r = num(rate) / 100 / 12;
  const pay = r > 0 ? (p * r) / (1 - Math.pow(1 + r, -n)) : p / n;
  const total = pay * n + num(fee) * n + num(setup);
  return (
    <div className="card">
      <h2>Delbetalings-sannhet</h2>
      <p className="muted small" style={{ marginBottom: 10 }}>Fyll inn tallene fra kassa (nominell rente, termingebyr, etableringsgebyr). Se hva det faktisk koster.</p>
      <div className="grid2">
        <Field label="Pris"><input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
        <Field label="Måneder"><input className="input" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} /></Field>
        <Field label="Rente % p.a."><input className="input" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" /></Field>
        <Field label="Gebyr/mnd"><input className="input" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} /></Field>
      </div>
      <Field label="Etableringsgebyr"><input className="input" inputMode="decimal" value={setup} onChange={(e) => setSetup(e.target.value)} /></Field>
      {p > 0 && <>
        <hr />
        <div className="row between"><span>Per måned</span><b className="mono">{kr(pay + num(fee))}</b></div>
        <div className="row between"><span>Totalt betalt</span><b className="mono">{kr(total)}</b></div>
        <div className="row between"><span>Ekstra for å slippe å vente</span><b className="danger mono">{kr(total - p)} ({((total / p - 1) * 100).toFixed(0)} %)</b></div>
      </>}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useStore(P + 'items', []);
  const [wage, setWage] = useStore(P + 'wage', '');
  const [tab, setTab] = useState('bur');
  const [adding, setAdding] = useState(null);
  const [deciding, setDeciding] = useState(null);
  const now = useNow(1000);
  const toast = useToast();

  const caged = items.filter((i) => !i.decision);
  const decided = items.filter((i) => i.decision);
  const saved = decided.filter((i) => i.decision === 'drop').reduce((a, i) => a + num(i.price), 0);
  const bought = decided.filter((i) => i.decision === 'buy').reduce((a, i) => a + num(i.price), 0);
  const hourly = num(wage);

  const add = (f) => { setItems((xs) => [{ ...f, id: uid(), at: Date.now() }, ...xs]); setAdding(null); toast('I buret. Kom tilbake senere.'); };
  const decide = (it, decision) => {
    setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, decision, decidedAt: Date.now() } : x)));
    setDeciding(null);
    toast(decision === 'drop' ? `${kr(it.price)} reddet.` : 'Ok. Bevisst kjøp er et godt kjøp.');
  };

  return (
    <Shell title="Kjøpekarantene" tabs={[{ id: 'bur', icon: '▣', label: 'Buret' }, { id: 'regn', icon: '%', label: 'Delbetaling' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'bur' && <>
        <div className="card">
          <div className="grid2">
            <div><div className="muted small">Penger reddet</div><div className="big ok mono">{kr(saved)}</div></div>
            <div><div className="muted small">I buret nå</div><div className="big mono">{kr(caged.reduce((a, i) => a + num(i.price), 0))}</div></div>
          </div>
        </div>
        <button className="btn primary block" style={{ marginBottom: 12, minHeight: 56 }} onClick={() => setAdding({ name: '', price: '', url: '', why: '', hours: 72 })}>Jeg vil kjøpe noe …</button>
        {caged.length === 0 ? <div className="card"><Empty title="Buret er tomt">Neste gang fingeren svever over «Kjøp nå» eller «Del opp betalingen» – legg det her først.</Empty></div> : (
          <div className="card">
            <ul className="list">
              {caged.map((it) => {
                const end = it.at + it.hours * H; const left = end - now; const ready = left <= 0;
                const pct = Math.min(100, ((now - it.at) / (it.hours * H)) * 100);
                return (
                  <li key={it.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className="row between"><b className="ellipsis">{it.name}</b><b className="mono">{kr(it.price)}</b></div>
                    <div className="bar"><i style={{ width: pct + '%' }} /></div>
                    <div className="row between">
                      <span className="muted small">{ready ? 'Karantenen er over' : `${duration(left)} igjen`}{hourly ? ` · ${(num(it.price) / hourly).toFixed(1)} t arbeid` : ''}</span>
                      <button className={'btn sm ' + (ready ? 'primary' : 'ghost')} onClick={() => setDeciding(it)}>{ready ? 'Bestem' : 'Se'}</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {decided.length > 0 && (
          <div className="card">
            <h2>Avgjort</h2>
            <ul className="list">{decided.slice(0, 20).map((it) => (
              <li key={it.id}><span className={'badge ' + (it.decision === 'drop' ? 'hot' : '')}>{it.decision === 'drop' ? 'Droppet' : 'Kjøpt'}</span><span className="grow ellipsis">{it.name}</span><span className="mono small">{kr(it.price)}</span></li>
            ))}</ul>
            <p className="muted small" style={{ marginTop: 8 }}>Droppet {decided.filter((i) => i.decision === 'drop').length} av {decided.length}. Kjøpt for {kr(bought)}.</p>
          </div>
        )}
      </>}
      {tab === 'regn' && <Delbetaling />}
      {tab === 'mer' && <>
        <div className="card">
          <h2>Timelønn etter skatt</h2>
          <input className="input" inputMode="decimal" value={wage} onChange={(e) => setWage(e.target.value)} placeholder="f.eks. 220" />
        </div>
        <BackupCard prefix={P} appName="Kjøpekarantene" />
      </>}

      {adding && (
        <Sheet title="Inn i buret" onClose={() => setAdding(null)}>
          <Field label="Hva vil du kjøpe"><input className="input" autoFocus value={adding.name} onChange={(e) => setAdding({ ...adding, name: e.target.value })} /></Field>
          <div className="grid2">
            <Field label="Pris"><input className="input" inputMode="decimal" value={adding.price} onChange={(e) => setAdding({ ...adding, price: e.target.value })} /></Field>
            <Field label="Lenke"><input className="input" value={adding.url} onChange={(e) => setAdding({ ...adding, url: e.target.value })} placeholder="valgfritt" /></Field>
          </div>
          <Field label="Hvorfor nå? (ærlig)"><input className="input" value={adding.why} onChange={(e) => setAdding({ ...adding, why: e.target.value })} placeholder="Kjedelig kveld, så en reklame …" /></Field>
          <Field label="Karantene"><Chips options={TIMES} value={adding.hours} onChange={(v) => setAdding({ ...adding, hours: v })} /></Field>
          <button className="btn primary block" disabled={!adding.name} onClick={() => add(adding)}>Lås inne</button>
        </Sheet>
      )}
      {deciding && (
        <Sheet title={deciding.name} onClose={() => setDeciding(null)}>
          <p className="muted small" style={{ marginBottom: 12 }}>Lagt i buret {fmtDate(deciding.at)}{deciding.why ? ` – «${deciding.why}»` : ''}.</p>
          <div className="card small"><ol style={{ paddingLeft: 18 }} className="stack">{QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol></div>
          {deciding.url && <a className="btn block ghost" href={deciding.url} target="_blank" rel="noreferrer" style={{ marginBottom: 8 }}>Åpne lenken</a>}
          {Date.now() < deciding.at + deciding.hours * H ? (
            <>
              <p className="muted small" style={{ marginBottom: 8 }}>Karantenen er ikke over. Du kan droppe nå – ikke kjøpe.</p>
              <button className="btn primary block" onClick={() => decide(deciding, 'drop')}>Dropp den</button>
            </>
          ) : (
            <div className="grid2">
              <button className="btn primary" onClick={() => decide(deciding, 'drop')}>Dropp</button>
              <button className="btn" onClick={() => decide(deciding, 'buy')}>Kjøp likevel</button>
            </div>
          )}
          <button className="btn block ghost" style={{ marginTop: 8 }} onClick={() => { setItems((xs) => xs.filter((x) => x.id !== deciding.id)); setDeciding(null); }}>Fjern uten å telle</button>
        </Sheet>
      )}
    </Shell>
  );
}
