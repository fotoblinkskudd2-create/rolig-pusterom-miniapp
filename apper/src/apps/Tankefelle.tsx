import { useState } from 'react'
import { Btn, ConfirmRow, Empty, InputRow, Row, Screen, Section, Sheet, TabBar, TextRow, fmtDate, toast, uid, useStore } from '../kit'

type Record_ = { id: string; date: number; situation: string; emotion: string; intensity: number; thought: string; beliefBefore: number; traps: string[]; for_: string; against: string; balanced: string; beliefAfter: number }

export const TRAPS: { n: string; d: string }[] = [
  { n: 'Svart-hvitt', d: 'Alt eller ingenting. «Hvis det ikke er perfekt, er det mislykket.»' },
  { n: 'Katastrofetenkning', d: 'Det verste kommer til å skje, og jeg takler det ikke.' },
  { n: 'Tankelesing', d: 'Jeg vet hva andre tenker om meg, uten bevis.' },
  { n: 'Spå framtida', d: 'Jeg vet hvordan det går, og det går dårlig.' },
  { n: 'Overgeneralisering', d: '«Alltid», «aldri», «alle», ut fra én hendelse.' },
  { n: 'Merkelapper', d: '«Jeg er en taper» i stedet for «jeg gjorde en feil».' },
  { n: 'Bør-tenkning', d: 'Strenge regler for meg og andre: bør, må, skal.' },
  { n: 'Personliggjøring', d: 'Det er min feil, selv når det ikke er det.' },
  { n: 'Mentalt filter', d: 'Ser bare det negative og overser resten.' },
  { n: 'Følelsesresonnering', d: '«Jeg føler meg dum, altså er jeg dum.»' },
]
const EMOTIONS = ['Angst', 'Tristhet', 'Sinne', 'Skam', 'Skyld', 'Uro', 'Ensomhet', 'Sjalusi']
const STEPS = ['Situasjon', 'Følelse', 'Tanke', 'Tankefelle', 'Bevis for', 'Bevis mot', 'Balansert']

const blank = (): Record_ => ({ id: uid(), date: Date.now(), situation: '', emotion: '', intensity: 70, thought: '', beliefBefore: 80, traps: [], for_: '', against: '', balanced: '', beliefAfter: 40 })

function Pct({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="row" style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{label}</span><b>{value} %</b></div>
      <input type="range" min={0} max={100} step={5} value={value} onChange={(e) => onChange(+e.target.value)} aria-label={label} />
    </div>
  )
}

export default function Tankefelle() {
  const [tab, setTab] = useState<'new' | 'list' | 'patterns'>('new')
  const [recs, setRecs] = useStore<Record_[]>('tanke:records', [])
  const [draft, setDraft] = useStore<Record_>('tanke:draft', blank())
  const [step, setStep] = useStore('tanke:step', 0)
  const [view, setView] = useState<Record_ | null>(null)
  const set = (p: Partial<Record_>) => setDraft({ ...draft, ...p })
  const can = [draft.situation, draft.emotion, draft.thought, draft.traps.length, true, true, draft.balanced][step]

  const finish = () => { setRecs([{ ...draft, date: Date.now() }, ...recs]); setDraft(blank()); setStep(0); toast(`${draft.beliefBefore} % → ${draft.beliefAfter} %`); setTab('list') }
  const counts = TRAPS.map((t) => ({ ...t, c: recs.filter((r) => r.traps.includes(t.n)).length })).filter((t) => t.c).sort((a, b) => b.c - a.c)
  const avgDrop = recs.length ? Math.round(recs.reduce((s, r) => s + (r.beliefBefore - r.beliefAfter), 0) / recs.length) : 0

  return (
    <>
      {tab === 'new' && (
        <Screen title="Nytt skjema" subtitle={`Steg ${step + 1} av 7 · ${STEPS[step]}`}>
          <div style={{ display: 'flex', gap: 4, padding: '0 16px 18px' }}>
            {STEPS.map((s, i) => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--tint)' : 'var(--fill)' }} />)}
          </div>
          {step === 0 && <Section header="Hva skjedde?" footer="Bare fakta: hvor, når, hvem. Som et kamera ville sett det."><TextRow value={draft.situation} onChange={(v) => set({ situation: v })} placeholder="Sjefen svarte ikke på meldingen min i dag." /></Section>}
          {step === 1 && (
            <>
              <Section header="Hva følte du?"><div className="row chips">{EMOTIONS.map((e) => <button key={e} className={'chip' + (draft.emotion === e ? ' on' : '')} onClick={() => set({ emotion: e })}>{e}</button>)}</div>
                <InputRow value={EMOTIONS.includes(draft.emotion) ? '' : draft.emotion} onChange={(v) => set({ emotion: v })} placeholder="Eller skriv selv …" /></Section>
              <Section><Pct label="Hvor sterkt" value={draft.intensity} onChange={(n) => set({ intensity: n })} /></Section>
            </>
          )}
          {step === 2 && (
            <>
              <Section header="Hvilken tanke kom automatisk?" footer="Den første, rå tanken. Ikke pynt på den."><TextRow value={draft.thought} onChange={(v) => set({ thought: v })} placeholder="Hun er misfornøyd med meg. Jeg får sparken." /></Section>
              <Section><Pct label="Hvor mye tror du på den?" value={draft.beliefBefore} onChange={(n) => set({ beliefBefore: n })} /></Section>
            </>
          )}
          {step === 3 && (
            <Section header="Hvilke tankefeller ser du?" footer="Velg én eller flere.">
              {TRAPS.map((t) => {
                const on = draft.traps.includes(t.n)
                return <Row key={t.n} label={t.n} detail={t.d} onClick={() => set({ traps: on ? draft.traps.filter((x) => x !== t.n) : [...draft.traps, t.n] })} value={<span className="tint" style={{ fontSize: 20 }}>{on ? '✓' : ''}</span>} />
              })}
            </Section>
          )}
          {step === 4 && <Section header="Hva støtter tanken?" footer="Faktiske bevis, ikke følelser."><TextRow value={draft.for_} onChange={(v) => set({ for_: v })} placeholder="Hun pleier å svare raskt." /></Section>}
          {step === 5 && <Section header="Hva taler mot tanken?" footer="Hva ville du sagt til en venn som tenkte dette?"><TextRow value={draft.against} onChange={(v) => set({ against: v })} placeholder="Hun er på kurs i dag. Jeg fikk ros forrige uke." /></Section>}
          {step === 6 && (
            <>
              <Section header="En mer balansert tanke"><TextRow value={draft.balanced} onChange={(v) => set({ balanced: v })} placeholder="Hun er sannsynligvis opptatt. Jeg har ingen grunn til å tro at jeg får sparken." /></Section>
              <Section footer={`Den automatiske tanken: «${draft.thought}»`}><Pct label="Hvor mye tror du på den automatiske tanken nå?" value={draft.beliefAfter} onChange={(n) => set({ beliefAfter: n })} /></Section>
            </>
          )}
          <div className="btn-row">
            {step > 0 && <Btn kind="gray" onClick={() => setStep(step - 1)}>Tilbake</Btn>}
            {step < 6 ? <Btn disabled={!can} onClick={() => setStep(step + 1)}>Neste</Btn> : <Btn disabled={!can} onClick={finish}>Ferdig</Btn>}
          </div>
          {step > 0 && <div className="center"><button className="btn plain" style={{ width: 'auto' }} onClick={() => { setDraft(blank()); setStep(0) }}>Start på nytt</button></div>}
        </Screen>
      )}

      {tab === 'list' && (
        <Screen title="Skjemaer">
          {recs.length === 0 ? <Empty icon="🪤" title="Ingen skjemaer ennå" text="Neste gang en tanke biter, fang den." /> : (
            <Section>
              {recs.map((r) => (
                <Row key={r.id} onClick={() => setView(r)} chevron label={r.thought} detail={`${fmtDate(r.date)} · ${r.emotion} · ${r.traps.join(', ')}`}
                  value={<span><span className="muted">{r.beliefBefore}</span> → <b style={{ color: 'var(--green)' }}>{r.beliefAfter} %</b></span>} />
              ))}
            </Section>
          )}
        </Screen>
      )}

      {tab === 'patterns' && (
        <Screen title="Mønstre">
          {recs.length === 0 ? <Empty icon="📊" title="Ingen data" /> : (
            <>
              <div className="grid2">
                <div className="card"><div className="stat-l">Skjemaer</div><div className="mid-num">{recs.length}</div></div>
                <div className="card"><div className="stat-l">Snitt ned</div><div className="mid-num" style={{ color: 'var(--green)' }}>−{avgDrop} pp</div></div>
              </div>
              <Section header="Dine vanligste feller">
                {counts.map((t) => (
                  <div key={t.n} className="row" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>{t.n}</span><span className="muted">{t.c}</span></div>
                    <div className="progress"><div style={{ width: `${(t.c / counts[0].c) * 100}%` }} /></div>
                  </div>
                ))}
              </Section>
            </>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'new', label: 'Nytt', icon: '✍️' }, { id: 'list', label: 'Skjemaer', icon: '🗂️' }, { id: 'patterns', label: 'Mønstre', icon: '📊' }]} />

      {view && (
        <Sheet open onClose={() => setView(null)} title={fmtDate(view.date, { dateStyle: 'medium' })}>
          <Section header="Situasjon"><div className="row">{view.situation}</div></Section>
          <Section header="Følelse"><Row label={view.emotion} value={`${view.intensity} %`} /></Section>
          <Section header="Automatisk tanke"><Row label={view.thought} value={`${view.beliefBefore} % → ${view.beliefAfter} %`} /></Section>
          <Section header="Tankefeller"><div className="row">{view.traps.join(', ')}</div></Section>
          {view.for_ && <Section header="Bevis for"><div className="row">{view.for_}</div></Section>}
          {view.against && <Section header="Bevis mot"><div className="row">{view.against}</div></Section>}
          <Section header="Balansert tanke"><div className="row">{view.balanced}</div></Section>
          <Section><ConfirmRow label="Slett skjema" onConfirm={() => { setRecs(recs.filter((r) => r.id !== view.id)); setView(null) }} /></Section>
        </Sheet>
      )}
    </>
  )
}
