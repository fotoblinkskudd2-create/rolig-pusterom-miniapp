import { useState } from 'react';
import { BackupCard, Empty, Field, Sheet, Shell, useNow, useToast } from '../../shared/ui.jsx';
import { safeGet, uid, useStore } from '../../shared/store.js';
import { duration, fmtTime, isoDate } from '../../shared/util.js';

const P = 'system:';
const PALETTE = ['#d6409f', '#3e63dd', '#12a594', '#f5a524', '#e5484d', '#8e4ec6', '#0090ff', '#a18072', '#46a758', '#f76b15'];

async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('systemtavla:' + s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function Lock({ onOpen }) {
  const [pin, setPin] = useState('');
  const [bad, setBad] = useState(false);
  const tryOpen = async (e) => {
    e.preventDefault();
    if ((await sha(pin)) === safeGet(P + 'pin', null)) onOpen(); else { setBad(true); setPin(''); }
  };
  return (
    <Shell title="Systemtavla">
      <form onSubmit={tryOpen} className="card" style={{ marginTop: '20dvh', textAlign: 'center' }}>
        <h2>Lukket tavle</h2>
        <input className="input" type="password" inputMode="numeric" autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setBad(false); }} placeholder="PIN" style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
        {bad && <p className="danger small" style={{ marginTop: 8 }}>Feil PIN</p>}
        <button className="btn primary block" style={{ marginTop: 12 }}>Åpne</button>
      </form>
    </Shell>
  );
}

function Grounding() {
  const now = useNow(1000);
  const d = new Date(now);
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="muted small">Akkurat nå er det</div>
      <div className="big" style={{ textTransform: 'capitalize' }}>{d.toLocaleDateString('nb-NO', { weekday: 'long' })}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div className="huge mono accent" style={{ marginTop: 6 }}>{d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</div>
      <p className="muted small" style={{ marginTop: 8 }}>Kjenn føttene mot gulvet. Nevn fem ting du ser.</p>
    </div>
  );
}

export default function App() {
  const [members, setMembers] = useStore(P + 'members', []);
  const [front, setFront] = useStore(P + 'front', []); // { id, members: [ids], start, end, note }
  const [board, setBoard] = useStore(P + 'board', []); // { id, from, to, text, at, pinned, readBy }
  const [lost, setLost] = useStore(P + 'lost', []); // { id, at, where, found, note }
  const [hasPin, setHasPin] = useState(() => !!safeGet(P + 'pin', null));
  const [open, setOpen] = useState(() => !safeGet(P + 'pin', null));
  const [tab, setTab] = useState('nå');
  const [memberEdit, setMemberEdit] = useState(null);
  const [msg, setMsg] = useState({ from: '', to: 'alle', text: '' });
  const [lostEdit, setLostEdit] = useState(null);
  const [pinSet, setPinSet] = useState('');
  const now = useNow(30000);
  const toast = useToast();

  if (!open) return <Lock onOpen={() => setOpen(true)} />;

  const byId = Object.fromEntries(members.map((m) => [m.id, m]));
  const current = front.find((f) => !f.end);
  const currentIds = current?.members ?? [];

  const toggleFront = (id) => {
    const t = Date.now();
    const next = currentIds.includes(id) ? currentIds.filter((x) => x !== id) : [...currentIds, id];
    setFront((fs) => {
      const closed = fs.map((f) => (f.end ? f : { ...f, end: t }));
      return next.length ? [{ id: uid(), members: next, start: t, end: null }, ...closed].slice(0, 3000) : closed;
    });
  };
  const saveMember = (m) => { setMembers((ms) => (m.id ? ms.map((x) => (x.id === m.id ? m : x)) : [...ms, { ...m, id: uid() }])); setMemberEdit(null); };
  const post = (e) => {
    e.preventDefault();
    if (!msg.text.trim()) return;
    setBoard((b) => [{ id: uid(), from: msg.from || currentIds[0] || '', to: msg.to, text: msg.text.trim(), at: Date.now(), pinned: false }, ...b]);
    setMsg({ ...msg, text: '' }); toast('Lagt på tavla');
  };
  const name = (id) => byId[id]?.name ?? (id === 'alle' ? 'Alle' : 'Ukjent');
  const color = (id) => byId[id]?.color ?? 'var(--muted)';
  const todayFront = front.filter((f) => isoDate(f.start) === isoDate(new Date()));
  const unreadFor = board.filter((b) => b.to === 'alle' || currentIds.includes(b.to));

  return (
    <Shell title="Systemtavla" tabs={[{ id: 'nå', icon: '◉', label: 'Fremme' }, { id: 'tavle', icon: '✎', label: 'Tavla' }, { id: 'tid', icon: '◷', label: 'Tapt tid' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'nå' && <>
        <Grounding />
        <div className="card">
          <div className="row between" style={{ marginBottom: 8 }}><h2 style={{ margin: 0 }}>Hvem er fremme?</h2><button className="btn sm" onClick={() => setMemberEdit({ name: '', color: PALETTE[members.length % PALETTE.length], role: '', notes: '' })}>+ Medlem</button></div>
          {members.length === 0 ? <Empty title="Ingen lagt inn">Legg inn dem dere vet om. Navn, farge, kanskje en rolle. Dere bestemmer.</Empty> : (
            <div className="chips">
              {members.map((m) => (
                <button key={m.id} className="chip" onClick={() => toggleFront(m.id)} onDoubleClick={() => setMemberEdit(m)}
                  style={currentIds.includes(m.id) ? { background: m.color, borderColor: m.color, color: '#111', fontWeight: 700 } : { borderColor: m.color }}>
                  {m.name}
                </button>
              ))}
            </div>
          )}
          {current && <p className="muted small" style={{ marginTop: 10 }}>{currentIds.map(name).join(' + ')} fremme i {duration(now - current.start)}.</p>}
          {members.length > 0 && <p className="muted small" style={{ marginTop: 6 }}>Trykk for å slå av/på (co-front går fint). Dobbelttrykk for å endre.</p>}
        </div>
        {unreadFor.length > 0 && (
          <div className="card">
            <h2>Til {current ? 'dere som er fremme' : 'alle'}</h2>
            {unreadFor.slice(0, 3).map((b) => (
              <div key={b.id} style={{ borderLeft: `4px solid ${color(b.from)}`, paddingLeft: 10, marginBottom: 10 }}>
                <div className="small muted">{name(b.from)} → {name(b.to)} · {new Date(b.at).toLocaleDateString('nb-NO')}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{b.text}</div>
              </div>
            ))}
          </div>
        )}
        {todayFront.length > 0 && (
          <div className="card">
            <h2>I dag</h2>
            <ul className="list">{todayFront.map((f) => (
              <li key={f.id}>{f.members.map((id) => <span key={id} className="dot" style={{ background: color(id) }} />)}
                <span className="grow">{f.members.map(name).join(' + ')}</span>
                <span className="muted small">{fmtTime(f.start)}–{f.end ? fmtTime(f.end) : 'nå'}</span></li>
            ))}</ul>
          </div>
        )}
      </>}

      {tab === 'tavle' && <>
        <form className="card" onSubmit={post}>
          <div className="grid2">
            <Field label="Fra"><select className="input" value={msg.from} onChange={(e) => setMsg({ ...msg, from: e.target.value })}>
              <option value="">{currentIds[0] ? name(currentIds[0]) + ' (fremme)' : 'Ukjent'}</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select></Field>
            <Field label="Til"><select className="input" value={msg.to} onChange={(e) => setMsg({ ...msg, to: e.target.value })}>
              <option value="alle">Alle</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select></Field>
          </div>
          <textarea className="input" value={msg.text} onChange={(e) => setMsg({ ...msg, text: e.target.value })} placeholder="Husk tannlegen torsdag. Ikke kjøp mer Lego. Vi klarte det i går." />
          <button className="btn primary block" style={{ marginTop: 10 }} type="submit">Legg på tavla</button>
        </form>
        {board.length === 0 ? <div className="card"><Empty title="Tom tavle">Beskjeder mellom dere, uten å måtte huske.</Empty></div> :
          [...board].sort((a, b) => b.pinned - a.pinned || b.at - a.at).map((b) => (
            <div key={b.id} className="card" style={{ borderLeft: `5px solid ${color(b.from)}` }}>
              <div className="row between small muted"><span>{b.pinned ? '📌 ' : ''}{name(b.from)} → {name(b.to)}</span><span>{new Date(b.at).toLocaleDateString('nb-NO')} {fmtTime(b.at)}</span></div>
              <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0 10px' }}>{b.text}</p>
              <div className="row">
                <button className="btn sm ghost" onClick={() => setBoard((xs) => xs.map((x) => (x.id === b.id ? { ...x, pinned: !x.pinned } : x)))}>{b.pinned ? 'Løsne' : 'Fest'}</button>
                <button className="btn sm ghost" onClick={() => confirm('Fjerne beskjeden?') && setBoard((xs) => xs.filter((x) => x.id !== b.id))}>Fjern</button>
              </div>
            </div>
          ))}
      </>}

      {tab === 'tid' && <>
        <button className="btn primary block" style={{ marginBottom: 12, minHeight: 56 }} onClick={() => setLostEdit({ where: '', found: '', note: '', at: Date.now() })}>Jeg kom til nå – logg det</button>
        <p className="muted small" style={{ marginBottom: 12 }}>Ingen skam. Bare spor. Hva ser du rundt deg? Kvitteringer, pakker, meldinger, bank-appen?</p>
        {lost.length === 0 ? <div className="card"><Empty title="Ingen hull logget" /></div> : (
          <div className="card"><ul className="list">{lost.map((l) => (
            <li key={l.id} style={{ alignItems: 'flex-start' }}>
              <div className="grow">
                <b>{new Date(l.at).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })} {fmtTime(l.at)}</b>{l.where && <span className="muted"> · {l.where}</span>}
                {l.found && <div className="small">Fant: {l.found}</div>}
                {l.note && <div className="small muted" style={{ whiteSpace: 'pre-wrap' }}>{l.note}</div>}
              </div>
              <button className="btn sm ghost" onClick={() => confirm('Slette?') && setLost((xs) => xs.filter((x) => x.id !== l.id))}>✕</button>
            </li>
          ))}</ul></div>
        )}
      </>}

      {tab === 'mer' && <>
        <div className="card">
          <h2>PIN-gardin</h2>
          <p className="muted small" style={{ marginBottom: 10 }}>Hindrer at noen som plukker opp telefonen leser tavla. Det er en gardin, ikke kryptering.</p>
          {hasPin ? <button className="btn block danger" onClick={() => { localStorage.removeItem(P + 'pin'); setHasPin(false); toast('PIN fjernet'); }}>Fjern PIN</button> : (
            <div className="row"><input className="input grow" type="password" inputMode="numeric" value={pinSet} onChange={(e) => setPinSet(e.target.value)} placeholder="Ny PIN (minst 4)" />
              <button className="btn" disabled={pinSet.length < 4} onClick={async () => { localStorage.setItem(P + 'pin', JSON.stringify(await sha(pinSet))); setPinSet(''); setHasPin(true); toast('PIN satt'); }}>Sett</button></div>
          )}
        </div>
        <div className="card">
          <h2>Medlemmer</h2>
          {members.length === 0 ? <p className="muted small">Ingen.</p> : <ul className="list">{members.map((m) => (
            <li key={m.id} onClick={() => setMemberEdit(m)} style={{ cursor: 'pointer' }}><span className="dot" style={{ background: m.color }} /><span className="grow">{m.name}{m.role && <span className="muted small"> · {m.role}</span>}</span><span className="muted small">endre</span></li>
          ))}</ul>}
        </div>
        <div className="card small muted">Systemtavla er et notatverktøy, ikke behandling. Har dere en terapeut, kan logg og tavle være nyttig å ta med.</div>
        <BackupCard prefix={P} appName="Systemtavla" />
      </>}

      {memberEdit && (
        <Sheet title={memberEdit.id ? 'Endre' : 'Nytt medlem'} onClose={() => setMemberEdit(null)}>
          <Field label="Navn"><input className="input" autoFocus value={memberEdit.name} onChange={(e) => setMemberEdit({ ...memberEdit, name: e.target.value })} /></Field>
          <Field label="Farge"><div className="chips">{PALETTE.map((c) => <button key={c} type="button" className="chip" aria-label={c} onClick={() => setMemberEdit({ ...memberEdit, color: c })} style={{ background: c, width: 36, outline: memberEdit.color === c ? '3px solid var(--text)' : 'none' }} />)}</div></Field>
          <Field label="Rolle / beskrivelse (valgfritt)"><input className="input" value={memberEdit.role} onChange={(e) => setMemberEdit({ ...memberEdit, role: e.target.value })} /></Field>
          <Field label="Notater (alder, liker, trygghet …)"><textarea className="input" value={memberEdit.notes} onChange={(e) => setMemberEdit({ ...memberEdit, notes: e.target.value })} /></Field>
          <div className="stack">
            <button className="btn primary block" disabled={!memberEdit.name} onClick={() => saveMember(memberEdit)}>Lagre</button>
            {memberEdit.id && <button className="btn danger block" onClick={() => { if (confirm('Fjerne medlem? Historikk beholdes.')) { setMembers((ms) => ms.filter((x) => x.id !== memberEdit.id)); setMemberEdit(null); } }}>Fjern</button>}
          </div>
        </Sheet>
      )}
      {lostEdit && (
        <Sheet title="Tapt tid" onClose={() => setLostEdit(null)}>
          <Field label="Hvor er du"><input className="input" value={lostEdit.where} onChange={(e) => setLostEdit({ ...lostEdit, where: e.target.value })} placeholder="Hjemme, butikken, bussen …" /></Field>
          <Field label="Hva fant du"><input className="input" value={lostEdit.found} onChange={(e) => setLostEdit({ ...lostEdit, found: e.target.value })} placeholder="Pakke på døra, ny app, melding sendt …" /></Field>
          <Field label="Notat"><textarea className="input" value={lostEdit.note} onChange={(e) => setLostEdit({ ...lostEdit, note: e.target.value })} placeholder="Siste du husker. Hvordan kroppen kjennes." /></Field>
          <button className="btn primary block" onClick={() => { setLost((xs) => [{ ...lostEdit, id: uid() }, ...xs]); setLostEdit(null); }}>Lagre</button>
        </Sheet>
      )}
    </Shell>
  );
}
