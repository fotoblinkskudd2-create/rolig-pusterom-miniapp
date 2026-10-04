import { useEffect, useMemo, useState } from 'react';
import { BackupCard, Empty, Field, Sheet, Shell, useToast } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { copyText, fmtDate, kr, kr2, num, packJson, unpackJson } from '../../shared/util.js';

const P = 'splitt:';

// Saldo per person (øre for å unngå flyttallsrot). Positiv = skal ha penger.
export function balances(g) {
  const b = Object.fromEntries(g.people.map((p) => [p, 0]));
  for (const e of g.expenses) {
    const cents = Math.round(num(e.amount) * 100);
    const among = e.among.filter((p) => p in b);
    if (!among.length || !(e.paidBy in b)) continue;
    const share = Math.floor(cents / among.length);
    let rest = cents - share * among.length;
    b[e.paidBy] += cents;
    for (const p of among) { b[p] -= share + (rest > 0 ? 1 : 0); rest--; }
  }
  return b;
}
// Grådig minimering av overføringer: største skyldner betaler største kreditor.
export function settle(b) {
  const deb = Object.entries(b).filter(([, v]) => v < 0).map(([p, v]) => [p, -v]).sort((a, c) => c[1] - a[1]);
  const cred = Object.entries(b).filter(([, v]) => v > 0).sort((a, c) => c[1] - a[1]);
  const out = [];
  let i = 0, j = 0;
  while (i < deb.length && j < cred.length) {
    const amt = Math.min(deb[i][1], cred[j][1]);
    if (amt > 0) out.push({ from: deb[i][0], to: cred[j][0], amount: amt / 100 });
    deb[i][1] -= amt; cred[j][1] -= amt;
    if (deb[i][1] === 0) i++;
    if (cred[j][1] === 0) j++;
  }
  return out;
}

function ExpenseEditor({ group, initial, onSave, onDelete, onClose }) {
  const [f, setF] = useState(initial);
  const toggle = (p) => setF({ ...f, among: f.among.includes(p) ? f.among.filter((x) => x !== p) : [...f.among, p] });
  return (
    <Sheet title={initial.id ? 'Endre utgift' : 'Ny utgift'} onClose={onClose}>
      <Field label="Hva"><input className="input" autoFocus value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="Middag, hytte, taxi" /></Field>
      <Field label="Beløp (kr)"><input className="input" inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
      <Field label="Betalt av">
        <div className="chips">{group.people.map((p) => <button key={p} className={'chip' + (f.paidBy === p ? ' on' : '')} onClick={() => setF({ ...f, paidBy: p })}>{p}</button>)}</div>
      </Field>
      <Field label={`Deles på (${f.among.length})`}>
        <div className="chips">{group.people.map((p) => <button key={p} className={'chip' + (f.among.includes(p) ? ' on' : '')} onClick={() => toggle(p)}>{p}</button>)}</div>
      </Field>
      {f.among.length > 0 && num(f.amount) > 0 && <p className="muted small" style={{ marginBottom: 12 }}>{kr2(num(f.amount) / f.among.length)} hver</p>}
      <div className="stack">
        <button className="btn primary block" disabled={!f.desc || !num(f.amount) || !f.paidBy || !f.among.length} onClick={() => onSave(f)}>Lagre</button>
        {onDelete && <button className="btn danger block" onClick={onDelete}>Slett</button>}
      </div>
    </Sheet>
  );
}

function Group({ g, update, onBack }) {
  const [edit, setEdit] = useState(null);
  const [newP, setNewP] = useState('');
  const toast = useToast();
  const b = useMemo(() => balances(g), [g]);
  const plan = useMemo(() => settle(b), [b]);
  const total = g.expenses.reduce((a, e) => a + num(e.amount), 0);

  const addPerson = (e) => {
    e.preventDefault();
    const n = newP.trim();
    if (!n || g.people.includes(n)) return;
    update({ ...g, people: [...g.people, n] }); setNewP('');
  };
  const save = (f) => {
    update({ ...g, expenses: f.id ? g.expenses.map((x) => (x.id === f.id ? f : x)) : [{ ...f, id: uid(), at: Date.now() }, ...g.expenses] });
    setEdit(null);
  };
  const share = async () => {
    const link = `${location.origin}${location.pathname}#g=${await packJson(g)}`;
    if (navigator.share) { try { await navigator.share({ title: g.name, text: `Regnskap: ${g.name}`, url: link }); return; } catch { /* avbrutt */ } }
    await copyText(link); toast('Lenke kopiert');
  };
  const copyPlan = async () => {
    const txt = `${g.name} – oppgjør\n` + (plan.length ? plan.map((t) => `${t.from} → ${t.to}: ${kr2(t.amount)}`).join('\n') : 'Alle er skuls.') + `\nTotalt: ${kr(total)}`;
    await copyText(txt); toast('Oppgjør kopiert – lim inn i gruppechatten');
  };

  return <>
    <div className="row" style={{ marginBottom: 12 }}>
      <button className="btn sm ghost" onClick={onBack}>‹ Grupper</button>
      <b className="grow ellipsis" style={{ fontSize: '1.2rem' }}>{g.name}</b>
      <button className="btn sm" onClick={share}>Del lenke</button>
    </div>
    <div className="card">
      <div className="muted small">Totalt brukt</div>
      <div className="big mono">{kr(total)}</div>
      <hr />
      <h2>Oppgjør</h2>
      {plan.length === 0 ? <p className="muted">Ingen skylder noen noe.</p> : (
        <ul className="list">{plan.map((t, i) => <li key={i}><b>{t.from}</b><span className="muted">→</span><b className="grow">{t.to}</b><b className="accent mono">{kr2(t.amount)}</b></li>)}</ul>
      )}
      <button className="btn block" style={{ marginTop: 8 }} onClick={copyPlan}>Kopier oppgjør (til Vipps/chat)</button>
    </div>
    <div className="card">
      <h2>Folk</h2>
      <ul className="list">
        {g.people.map((p) => (
          <li key={p}><span className="grow">{p}</span><span className={'mono ' + (b[p] > 0 ? 'ok' : b[p] < 0 ? 'danger' : 'muted')}>{b[p] > 0 ? '+' : ''}{kr2(b[p] / 100)}</span></li>
        ))}
      </ul>
      <form className="row" onSubmit={addPerson} style={{ marginTop: 8 }}>
        <input className="input grow" value={newP} onChange={(e) => setNewP(e.target.value)} placeholder="Legg til navn" />
        <button className="btn" type="submit">+</button>
      </form>
    </div>
    <div className="card">
      <div className="row between"><h2 style={{ margin: 0 }}>Utgifter</h2>
        <button className="btn sm primary" disabled={!g.people.length} onClick={() => setEdit({ desc: '', amount: '', paidBy: g.people[0], among: [...g.people] })}>+ Utgift</button></div>
      {g.expenses.length === 0 ? <Empty title="Ingenting ennå">{g.people.length < 2 ? 'Legg til folk først.' : 'Hvem betalte sist?'}</Empty> : (
        <ul className="list">
          {g.expenses.map((e) => (
            <li key={e.id} onClick={() => setEdit(e)} style={{ cursor: 'pointer' }}>
              <div className="grow"><b>{e.desc}</b><div className="muted small">{e.paidBy} betalte · delt på {e.among.length} · {fmtDate(e.at, { day: 'numeric', month: 'short' })}</div></div>
              <b className="mono">{kr(e.amount)}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
    {edit && <ExpenseEditor group={g} initial={edit} onSave={save} onClose={() => setEdit(null)} onDelete={edit.id ? () => { update({ ...g, expenses: g.expenses.filter((x) => x.id !== edit.id) }); setEdit(null); } : null} />}
  </>;
}

export default function App() {
  const [groups, setGroups] = useStore(P + 'groups', []);
  const [openId, setOpenId] = useState(null);
  const [name, setName] = useState('');
  const [tab, setTab] = useState('grupper');
  const [incoming, setIncoming] = useState(null);
  const toast = useToast();

  // Åpnet fra delt lenke: #g=<komprimert JSON>
  useEffect(() => {
    const m = location.hash.match(/#g=(.+)/);
    if (!m) return;
    unpackJson(m[1]).then((g) => setIncoming(g)).catch(() => toast('Lenken var ødelagt'));
    history.replaceState(null, '', location.pathname);
  }, [toast]);

  const update = (g) => setGroups((xs) => xs.map((x) => (x.id === g.id ? { ...g, updatedAt: Date.now() } : x)));
  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const g = { id: uid(), name: name.trim(), people: [], expenses: [], updatedAt: Date.now() };
    setGroups((xs) => [g, ...xs]); setName(''); setOpenId(g.id);
  };
  const accept = () => {
    setGroups((xs) => (xs.some((x) => x.id === incoming.id) ? xs.map((x) => (x.id === incoming.id ? incoming : x)) : [incoming, ...xs]));
    setOpenId(incoming.id); setIncoming(null); toast('Gruppe importert');
  };
  const g = groups.find((x) => x.id === openId);

  return (
    <Shell title="Splitt" tabs={[{ id: 'grupper', icon: '◎', label: 'Grupper' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={(t) => { setTab(t); setOpenId(null); }}>
      {tab === 'grupper' && (g ? <Group g={g} update={update} onBack={() => setOpenId(null)} /> : <>
        <form className="card row" onSubmit={create}>
          <input className="input grow" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ny gruppe: Hyttetur, Kollektivet …" />
          <button className="btn primary" type="submit">Lag</button>
        </form>
        <div className="card">
          {groups.length === 0 ? <Empty title="Ingen grupper">Ingen konto. Ingen dagsgrense på utgifter. Del regnskapet med en lenke.</Empty> : (
            <ul className="list">
              {groups.map((x) => {
                const tot = x.expenses.reduce((a, e) => a + num(e.amount), 0);
                return <li key={x.id} onClick={() => setOpenId(x.id)} style={{ cursor: 'pointer' }}>
                  <div className="grow"><b>{x.name}</b><div className="muted small">{x.people.length} personer · {x.expenses.length} utgifter</div></div>
                  <b className="mono">{kr(tot)}</b>
                </li>;
              })}
            </ul>
          )}
        </div>
      </>)}
      {tab === 'mer' && <>
        <div className="card small">
          <h2>Slik deler du uten server</h2>
          <p className="muted">«Del lenke» pakker hele gruppa inn i selve lenka (komprimert). Den som åpner den, får en kopi lokalt. Legger noen til en utgift, deler de en ny lenke tilbake – siste lenke vinner.</p>
        </div>
        <div className="card">
          <h2>Slett gruppe</h2>
          {groups.length === 0 ? <p className="muted small">Ingen.</p> : groups.map((x) => (
            <div key={x.id} className="row between" style={{ marginBottom: 6 }}><span>{x.name}</span>
              <button className="btn sm danger" onClick={() => confirm(`Slette ${x.name}?`) && setGroups((xs) => xs.filter((y) => y.id !== x.id))}>Slett</button></div>
          ))}
        </div>
        <BackupCard prefix={P} appName="Splitt" />
      </>}
      {incoming && (
        <Sheet title="Delt gruppe" onClose={() => setIncoming(null)}>
          <p style={{ marginBottom: 12 }}><b>{incoming.name}</b> – {incoming.people.length} personer, {incoming.expenses.length} utgifter.</p>
          {groups.some((x) => x.id === incoming.id) && <p className="muted small" style={{ marginBottom: 12 }}>Du har denne gruppa fra før. Importen erstatter din versjon.</p>}
          <button className="btn primary block" onClick={accept}>Importer</button>
        </Sheet>
      )}
    </Shell>
  );
}
