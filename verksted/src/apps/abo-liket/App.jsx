import { useMemo, useState } from 'react';
import { BackupCard, Chips, Empty, Field, Sheet, Shell, useToast } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { addMonths, DAY, daysBetween, fmtDate, fromIso, isoDate, kr, makeIcs, num, relDays, shareOrDownload, today } from '../../shared/util.js';

const P = 'abo:';
const CYCLES = [
  { value: 'week', label: 'Uke', perMonth: 52 / 12 },
  { value: 'month', label: 'Måned', perMonth: 1 },
  { value: 'quarter', label: 'Kvartal', perMonth: 1 / 3 },
  { value: 'year', label: 'År', perMonth: 1 / 12 },
];
const cycleOf = (v) => CYCLES.find((c) => c.value === v) ?? CYCLES[1];
// Typiske priser – sjekk din egen faktura, de endrer seg hele tiden.
const PRESETS = [
  ['Netflix', 159], ['Spotify', 139], ['Viaplay', 449], ['TV 2 Play', 199], ['HBO Max', 129],
  ['Disney+', 129], ['YouTube Premium', 149], ['Storytel', 229], ['iCloud+', 39], ['ChatGPT Plus', 230],
  ['Adobe', 299], ['Strava', 99], ['Treningssenter', 499], ['Avis digital', 299], ['Xbox / PS Plus', 129],
];

const perMonth = (s) => num(s.price) * cycleOf(s.cycle).perMonth;
function nextRenewal(s) {
  let d = fromIso(s.next);
  const t = today();
  const step = { week: (x) => new Date(x.getTime() + 7 * DAY), month: (x) => addMonths(x, 1), quarter: (x) => addMonths(x, 3), year: (x) => addMonths(x, 12) }[s.cycle] ?? ((x) => addMonths(x, 1));
  let guard = 0;
  while (d < t && guard++ < 1000) d = step(d);
  return d;
}

function Editor({ initial, onSave, onDelete, onClose }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e?.target ? e.target.value : e });
  return (
    <Sheet title={initial.name ? 'Endre abonnement' : 'Nytt abonnement'} onClose={onClose}>
      {!initial.name && (
        <div style={{ marginBottom: 14 }}>
          <div className="muted small" style={{ marginBottom: 6 }}>Hurtigvalg (typisk pris – rett til din):</div>
          <div className="chips">{PRESETS.map(([n, p]) => <button key={n} className="chip" onClick={() => setF({ ...f, name: n, price: String(p) })}>{n}</button>)}</div>
        </div>
      )}
      <Field label="Navn"><input className="input" value={f.name} onChange={set('name')} placeholder="Netflix" /></Field>
      <div className="grid2">
        <Field label="Pris (kr)"><input className="input" inputMode="decimal" value={f.price} onChange={set('price')} placeholder="159" /></Field>
        <Field label="Neste trekk"><input className="input" type="date" value={f.next} onChange={set('next')} /></Field>
      </div>
      <Field label="Trekkes hver"><Chips options={CYCLES} value={f.cycle} onChange={set('cycle')} /></Field>
      <Field label="Gratis prøveperiode slutter (valgfritt)"><input className="input" type="date" value={f.trialEnd || ''} onChange={set('trialEnd')} /></Field>
      <Field label="Hvordan si opp (lenke eller notat)"><input className="input" value={f.cancelHow || ''} onChange={set('cancelHow')} placeholder="Innstillinger → Konto → Avslutt" /></Field>
      <div className="stack">
        <button className="btn primary block" disabled={!f.name || !num(f.price)} onClick={() => onSave(f)}>Lagre</button>
        {onDelete && <button className="btn danger block" onClick={onDelete}>Slett helt</button>}
      </div>
    </Sheet>
  );
}

export default function App() {
  const [subs, setSubs] = useStore(P + 'subs', []);
  const [wage, setWage] = useStore(P + 'wage', '');
  const [tab, setTab] = useState('liste');
  const [edit, setEdit] = useState(null);
  const toast = useToast();

  const active = subs.filter((s) => !s.killedAt);
  const killed = subs.filter((s) => s.killedAt);
  const month = active.reduce((a, s) => a + perMonth(s), 0);
  const saved = killed.reduce((a, s) => a + perMonth(s) * (Math.max(0, Date.now() - s.killedAt) / (DAY * 30.44)), 0);
  const hourly = num(wage);

  const upcoming = useMemo(() => active
    .map((s) => ({ ...s, renew: nextRenewal(s), trialDays: s.trialEnd ? daysBetween(today(), fromIso(s.trialEnd)) : null }))
    .sort((a, b) => a.renew - b.renew), [active]);

  const save = (f) => {
    setSubs((xs) => (f.id ? xs.map((x) => (x.id === f.id ? f : x)) : [...xs, { ...f, id: uid(), createdAt: Date.now() }]));
    setEdit(null);
  };
  const kill = (s) => {
    setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, killedAt: Date.now() } : x)));
    toast(`${s.name} er drept. ${kr(perMonth(s) * 12)} i året tilbake i lomma.`);
  };
  const revive = (s) => setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, killedAt: null } : x)));

  const calendar = async (list) => {
    const events = list.flatMap((s) => {
      const ev = [{ title: `Trekk: ${s.name} ${kr(s.price)}`, date: s.renew, alarmDays: 2, description: `Vil du fortsatt betale for ${s.name}? ${s.cancelHow || ''}`,
        rrule: { week: 'FREQ=WEEKLY', month: 'FREQ=MONTHLY', quarter: 'FREQ=MONTHLY;INTERVAL=3', year: 'FREQ=YEARLY' }[s.cycle] }];
      if (s.trialEnd) ev.push({ title: `PRØVEPERIODE SLUTTER: ${s.name}`, date: fromIso(s.trialEnd), alarmDays: 2, description: `Si opp før dette hvis du ikke vil betale. ${s.cancelHow || ''}` });
      return ev;
    });
    if (!events.length) return toast('Ingen aktive abonnement');
    await shareOrDownload('abo-paminnelser.ics', makeIcs(events), 'text/calendar');
  };

  const blank = { name: '', price: '', cycle: 'month', next: isoDate(new Date()), trialEnd: '', cancelHow: '' };

  return (
    <Shell title="Abo-Liket" tabs={[{ id: 'liste', icon: '◉', label: 'Aktive' }, { id: 'drept', icon: '✕', label: 'Drept' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'liste' && <>
        <div className="card">
          <div className="muted small">Du blør hver måned</div>
          <div className="huge accent mono">{kr(month)}</div>
          <div className="row wrap" style={{ marginTop: 8, gap: 16 }}>
            <span><b className="mono">{kr(month * 12)}</b> <span className="muted">i året</span></span>
            <span><b className="mono">{kr(month * 12 * 10)}</b> <span className="muted">på ti år</span></span>
            {hourly > 0 && <span><b className="mono">{(month / hourly).toFixed(1)} t</b> <span className="muted">arbeid/mnd</span></span>}
          </div>
        </div>
        {upcoming.some((s) => s.trialDays != null && s.trialDays >= 0 && s.trialDays <= 7) && (
          <div className="card" style={{ borderColor: 'var(--danger)' }}>
            <h2 className="danger">Prøveperioder som snart biter</h2>
            {upcoming.filter((s) => s.trialDays != null && s.trialDays >= 0 && s.trialDays <= 7).map((s) => (
              <div key={s.id} className="row between"><b>{s.name}</b><span className="danger">{relDays(s.trialDays)}</span></div>
            ))}
          </div>
        )}
        <div className="card">
          <div className="row between" style={{ marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>Neste trekk</h2>
            <button className="btn sm primary" onClick={() => setEdit(blank)}>+ Legg til</button>
          </div>
          {upcoming.length === 0 ? <Empty title="Ingen ennå">Legg inn alt du betaler for. Alt. Også det du har glemt.</Empty> : (
            <ul className="list">
              {upcoming.map((s) => {
                const d = daysBetween(today(), s.renew);
                return (
                  <li key={s.id}>
                    <div className="grow" onClick={() => setEdit(s)} style={{ cursor: 'pointer' }}>
                      <div className="row"><b className="ellipsis">{s.name}</b>{d <= 3 && <span className="badge hot">{relDays(d)}</span>}</div>
                      <div className="muted small">{kr(s.price)} / {cycleOf(s.cycle).label.toLowerCase()} · {fmtDate(s.renew, { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <button className="btn sm danger" onClick={() => kill(s)}>Drep</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {upcoming.length > 0 && <button className="btn block" onClick={() => calendar(upcoming)}>Påminnelser i kalenderen (.ics)</button>}
        <p className="muted small" style={{ marginTop: 8 }}>Kalenderfila varsler 2 dager før hvert trekk og før prøveperioder slutter. Virker også når push-varsler fra web-apper svikter.</p>
      </>}

      {tab === 'drept' && <>
        <div className="card">
          <div className="muted small">Spart siden du begynte å drepe</div>
          <div className="huge ok mono">{kr(saved)}</div>
          <div className="muted small">{kr(killed.reduce((a, s) => a + perMonth(s) * 12, 0))} per år som ikke lenger forsvinner.</div>
        </div>
        <div className="card">
          {killed.length === 0 ? <Empty title="Kirkegården er tom">Gå tilbake og drep noe.</Empty> : (
            <ul className="list">
              {killed.map((s) => (
                <li key={s.id}>
                  <div className="grow"><b style={{ textDecoration: 'line-through' }}>{s.name}</b><div className="muted small">Drept {fmtDate(s.killedAt)} · {kr(perMonth(s))}/mnd</div></div>
                  <button className="btn sm ghost" onClick={() => revive(s)}>Gjenoppliv</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </>}

      {tab === 'mer' && <>
        <div className="card">
          <h2>Timelønn etter skatt</h2>
          <p className="muted small" style={{ marginBottom: 10 }}>Så viser appen hvor mange timer av livet ditt abonnementene koster.</p>
          <input className="input" inputMode="decimal" value={wage} onChange={(e) => setWage(e.target.value)} placeholder="f.eks. 220" />
        </div>
        <div className="card">
          <h2>Si opp i Norge</h2>
          <ul className="small" style={{ paddingLeft: 18 }}>
            <li>App Store-abonnement: Innstillinger → [navnet ditt] → Abonnementer.</li>
            <li>Sjekk bindingstid i avtalen før du sier opp – noen trekker ut oppsigelsestiden.</li>
            <li>Angrerett på nettkjøp: 14 dager.</li>
            <li>Se etter trekk du ikke kjenner igjen i nettbanken – søk på «abonnement», «subscription», «Klarna», «Apple.com/bill».</li>
          </ul>
        </div>
        <BackupCard prefix={P} appName="Abo-Liket" />
      </>}

      {edit && <Editor initial={edit} onSave={save} onClose={() => setEdit(null)}
        onDelete={edit.id ? () => { setSubs((xs) => xs.filter((x) => x.id !== edit.id)); setEdit(null); } : null} />}
    </Shell>
  );
}
