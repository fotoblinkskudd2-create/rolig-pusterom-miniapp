import { useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast, copyText } from '../../shared/store.js'
import { Shell, Sheet, Field, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { kr, num, fmtDate, daysUntil, relDays, todayISO, toISODate, addDays } from '../../shared/format.js'
import { downloadICS } from '../../shared/ics.js'

const APP = 'skjold'
const STAGES = [
  { id: 'faktura', label: 'Faktura', days: 14, tip: 'Vanlig regning. Billigst å betale nå – eller be om utsettelse før forfall.' },
  { id: 'purring', label: 'Purring', days: 14, tip: 'Påminnelse, ofte med purregebyr. Ta kontakt nå hvis du ikke kan betale.' },
  { id: 'inkassovarsel', label: 'Inkassovarsel', days: 14, tip: 'Siste sjanse før saken går til inkasso. Varselet skal gi deg minst 14 dager (inkassoloven § 9).' },
  { id: 'betalingsoppfordring', label: 'Betalingsoppfordring', days: 14, tip: 'Saken er hos inkassoselskap. Salær påløper. Du kan nesten alltid få en nedbetalingsavtale – spør.' },
  { id: 'rettslig', label: 'Varsel om rettslig', days: 14, tip: 'Forliksråd eller namsmann kan være neste. Svar skriftlig innen fristen, og vurder å ringe NAV økonomirådgivning.' },
  { id: 'utlegg', label: 'Utlegg / trekk', days: 30, tip: 'Namsmannen kan trekke i lønn/ytelser. Du har krav på å beholde et livsoppholdsbeløp. Snakk med NAV.' },
]
const STATUS = { open: ['Åpen', ''], plan: ['Avtale', 'ok'], disputed: ['Bestridt', 'danger'], paid: ['Betalt', 'ok'] }
const stage = (id) => STAGES.find((s) => s.id === id) || STAGES[0]

const letters = (c) => {
  const head = `Til: ${c.agency || c.creditor || '[kreditor/inkassoselskap]'}
Fra: [navn, adresse, fødselsdato]
Dato: ${fmtDate(new Date())}
Saksnummer/fakturanr: ${c.ref || '[nummer]'}
Opprinnelig kreditor: ${c.creditor || '[navn]'}
`
  return {
    'Be om nedbetalingsavtale': `${head}
Nedbetalingsavtale – sak ${c.ref || ''}

Jeg erkjenner kravet på ${kr(c.amount)}, men har ikke mulighet til å betale hele beløpet nå.

Jeg foreslår en nedbetalingsavtale på [beløp] kr per måned, første gang [dato]. Beløpet er satt ut fra hva jeg realistisk klarer etter faste utgifter.

Jeg ber om at saken stilles i bero mens forslaget vurderes, og at det ikke påløper ytterligere salær eller gebyrer for avtalen.

Bekreft gjerne avtalen skriftlig.

Med vennlig hilsen
[navn]`,
    'Bestrid kravet': `${head}
Innsigelse mot krav – sak ${c.ref || ''}

Jeg bestrider kravet på ${kr(c.amount)}.

Begrunnelse: [f.eks. varen/tjenesten er ikke levert / beløpet er feil / kravet er betalt (kvittering vedlagt) / jeg har aldri inngått avtalen].

Jeg ber om at inndrivelsen stanses inntil innsigelsen er behandlet, jf. inkassoloven og god inkassoskikk, og at det ikke påløper flere omkostninger i mellomtiden.

Med vennlig hilsen
[navn]`,
    'Be om dokumentasjon': `${head}
Forespørsel om dokumentasjon – sak ${c.ref || ''}

Jeg ber om en fullstendig spesifikasjon av kravet: hovedstol, renter, gebyrer og salær hver for seg, med datoer for når de er påløpt, samt kopi av opprinnelig faktura og avtale.

Jeg ber om at saken stilles i bero til jeg har mottatt og fått vurdert dokumentasjonen.

Med vennlig hilsen
[navn]`,
    'Be om betalingsutsettelse': `${head}
Søknad om betalingsutsettelse – sak ${c.ref || ''}

På grunn av [kort forklaring, f.eks. sykdom / venter på utbetaling] ber jeg om utsatt betalingsfrist for kravet på ${kr(c.amount)} til [dato].

Jeg ber om at det ikke påløper ytterligere gebyrer eller salær i utsettelsesperioden.

Med vennlig hilsen
[navn]`,
  }
}

function App() {
  const [cases, setCases] = useLocal(APP, 'cases', [])
  const [tab, setTab] = useState('cases')
  const [edit, setEdit] = useState(null)
  const [view, setView] = useState(null)
  const [panic, setPanic] = useState(false)
  const [toast, showToast] = useToast()

  const open = useMemo(() => cases.filter((c) => c.status !== 'paid').sort((a, b) => a.due.localeCompare(b.due)), [cases])
  const total = open.reduce((t, c) => t + num(c.amount), 0)
  const urgent = open.filter((c) => daysUntil(c.due) <= 7)

  const save = (c) => { setCases((xs) => (xs.some((x) => x.id === c.id) ? xs.map((x) => (x.id === c.id ? c : x)) : [c, ...xs])); setEdit(null); setView(null) }
  const newCase = () => setEdit({ id: uid(), creditor: '', agency: '', ref: '', amount: '', stage: 'purring', received: todayISO(), due: toISODate(addDays(new Date(), 14)), status: 'open', notes: '' })

  return (
    <Shell
      title="Inkasso-skjold" glyph="🛡️" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'cases', icon: '📬', label: 'Saker' }, { id: 'guide', icon: '🧭', label: 'Veiviser' }, { id: 'data', icon: '💾', label: 'Data' }]}
      action={<button className="btn sm" onClick={newCase}>+ Brev</button>}
    >
      {tab === 'cases' && (
        <>
          <button className="btn block" style={{ marginBottom: 12, background: 'var(--danger)' }} onClick={() => setPanic(true)}>😰 Jeg fikk et skummelt brev</button>
          <div className="stats">
            <Stat hero value={kr(total)} label={`${open.length} åpne saker`} />
            <Stat value={urgent.length} label="frister innen 7 dager" />
          </div>
          {cases.length === 0 ? <Empty icon="📬" title="Ingen saker">Legg inn hvert brev du får. Å se alt på ett sted er halve kampen – strutsen taper alltid.</Empty> : (
            <div className="card"><ul className="list">
              {[...open, ...cases.filter((c) => c.status === 'paid')].map((c) => {
                const d = daysUntil(c.due)
                return (
                  <li key={c.id} className="row" onClick={() => setView(c)} style={{ cursor: 'pointer', opacity: c.status === 'paid' ? 0.5 : 1 }}>
                    <span className="grow">
                      <b>{c.creditor || c.agency}</b> <span className={'chip ' + STATUS[c.status][1]}>{STATUS[c.status][0]}</span><br />
                      <span className="muted small">{stage(c.stage).label} · frist <span style={d <= 3 && c.status === 'open' ? { color: 'var(--danger)', fontWeight: 600 } : null}>{relDays(d)}</span></span>
                    </span>
                    <b>{kr(c.amount)}</b>
                  </li>
                )
              })}
            </ul></div>
          )}
          {open.length > 0 && (
            <button className="btn ghost block" onClick={() => downloadICS('inkasso-frister', open.map((c) => ({
              uid: `${c.id}-${c.due}`, title: `🛡️ Frist: ${c.creditor || c.agency} ${kr(c.amount)}`, date: c.due,
              description: `${stage(c.stage).label}. ${stage(c.stage).tip}`, alarmsDaysBefore: [3, 1],
            })), 'Inkasso-skjold')}>📅 Legg alle frister i Kalender</button>
          )}
        </>
      )}

      {tab === 'guide' && (
        <>
          {STAGES.map((s, i) => (
            <div key={s.id} className="card">
              <h2>{i + 1}. {s.label}</h2>
              <p className="small" style={{ margin: 0 }}>{s.tip}</p>
            </div>
          ))}
          <div className="card notice small">
            <b>Gratis hjelp:</b> NAV økonomi- og gjeldsrådgivning <a href="tel:55553339">55 55 33 39</a> · Se usikret gjeld i{' '}
            <a href="https://www.gjeldsregisteret.com" target="_blank" rel="noreferrer">Gjeldsregisteret</a>.
          </div>
          <p className="muted small">Generell informasjon, ikke juridisk rådgivning. Sjekk alltid fristen i selve brevet.</p>
        </>
      )}

      {tab === 'data' && <BackupCard app={APP} toast={showToast} />}

      <Sheet open={panic} title="Pust. Vi tar det i rekkefølge." onClose={() => setPanic(false)}>
        <ol style={{ paddingLeft: 20, lineHeight: 1.7 }}>
          <li><b>Pust ut lenger enn du puster inn.</b> Tre ganger. Brevet blir ikke verre av 30 sekunder.</li>
          <li><b>Er kravet ditt?</b> Kjenner du kreditoren og beløpet? Svindelbrev finnes – ring aldri nummer fra brevet, søk opp selskapet selv.</li>
          <li><b>Finn fristen.</b> Skriv den inn her. Da trenger ikke hodet ditt å holde på den.</li>
          <li><b>Velg én handling:</b> betal, be om avtale, be om dokumentasjon eller bestrid. Malene ligger klare.</li>
          <li><b>Svar skriftlig før fristen.</b> E-post er fint. Ta skjermbilde av at du sendte.</li>
        </ol>
        <button className="btn block" onClick={() => { setPanic(false); newCase() }}>Legg inn brevet nå</button>
      </Sheet>

      <Sheet open={!!edit} title="Brev / sak" onClose={() => setEdit(null)}>{edit && <CaseForm c={edit} onSave={save} onDelete={(c) => { setCases((xs) => xs.filter((x) => x.id !== c.id)); setEdit(null) }} exists={cases.some((x) => x.id === edit.id)} />}</Sheet>
      <Sheet open={!!view} title={view ? (view.creditor || view.agency) : ''} onClose={() => setView(null)}>
        {view && <CaseView c={view} onEdit={() => { setEdit(view); setView(null) }} onStatus={(status) => save({ ...view, status })} showToast={showToast} />}
      </Sheet>
    </Shell>
  )
}

function CaseView({ c, onEdit, onStatus, showToast }) {
  const L = letters(c)
  const [which, setWhich] = useState(Object.keys(L)[0])
  const s = stage(c.stage)
  return (
    <>
      <div className="card">
        <ul className="list">
          <li className="row"><span className="grow muted">Beløp</span><b>{kr(c.amount)}</b></li>
          <li className="row"><span className="grow muted">Steg</span><b>{s.label}</b></li>
          <li className="row"><span className="grow muted">Frist</span><b>{fmtDate(c.due)} ({relDays(daysUntil(c.due))})</b></li>
          {c.agency && <li className="row"><span className="grow muted">Inkassoselskap</span><b>{c.agency}</b></li>}
          {c.ref && <li className="row"><span className="grow muted">Saksnr</span><b>{c.ref}</b></li>}
        </ul>
        <p className="small" style={{ marginBottom: 0 }}>💡 {s.tip}</p>
        {c.notes && <p className="small muted">{c.notes}</p>}
      </div>
      <div className="row wrap" style={{ marginBottom: 12 }}>
        {Object.entries(STATUS).map(([k, [l]]) => <button key={k} className={'chip' + (c.status === k ? '' : ' off')} onClick={() => onStatus(k)}>{l}</button>)}
      </div>
      <div className="card">
        <h2>Brevmal</h2>
        <select className="input" value={which} onChange={(e) => setWhich(e.target.value)} style={{ marginBottom: 10 }}>{Object.keys(L).map((k) => <option key={k}>{k}</option>)}</select>
        <pre className="letter">{L[which]}</pre>
        <button className="btn block" style={{ marginTop: 10 }} onClick={async () => { await copyText(L[which]); showToast('Kopiert – fyll inn [klammene]') }}>📋 Kopier brev</button>
      </div>
      <button className="btn ghost block" onClick={onEdit}>Endre saken</button>
    </>
  )
}

function CaseForm({ c: init, onSave, onDelete, exists }) {
  const [c, set] = useState(init)
  const up = (k) => (e) => set({ ...c, [k]: e.target.value })
  const setStage = (id) => set({ ...c, stage: id, due: toISODate(addDays(c.received, stage(id).days)) })
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (c.creditor.trim() || c.agency.trim()) onSave(c) }}>
      <Field label="Hvem krever penger? (opprinnelig kreditor)"><input className="input" value={c.creditor} onChange={up('creditor')} placeholder="Telenor, Klarna, Fjordkraft …" /></Field>
      <Field label="Inkassoselskap (hvis noe)"><input className="input" value={c.agency} onChange={up('agency')} placeholder="Intrum, Lowell, Kredinor …" /></Field>
      <div className="row">
        <Field label="Beløp (kr)"><input className="input" inputMode="decimal" value={c.amount} onChange={up('amount')} /></Field>
        <Field label="Saksnr"><input className="input" value={c.ref} onChange={up('ref')} /></Field>
      </div>
      <Field label="Hva slags brev?"><select className="input" value={c.stage} onChange={(e) => setStage(e.target.value)}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
      <div className="row">
        <Field label="Mottatt"><input className="input" type="date" value={c.received} onChange={up('received')} /></Field>
        <Field label="Frist (sjekk brevet!)"><input className="input" type="date" value={c.due} onChange={up('due')} /></Field>
      </div>
      <Field label="Notater"><textarea className="input" value={c.notes} onChange={up('notes')} placeholder="Ringte 12.10, snakket med …" /></Field>
      <div className="stack"><button className="btn block">Lagre</button>{exists && <button type="button" className="btn ghost block" onClick={() => onDelete(c)}>Slett</button>}</div>
    </form>
  )
}

boot(App)
