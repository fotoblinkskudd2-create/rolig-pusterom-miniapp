import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, mutate, ApiFail, OfflineFail, downloadUrl } from '../core/api';
import { kvGet, kvSet } from '../core/outbox';
import {
  AuthScreen,
  Shell,
  SyncPanel,
  ErrorBox,
  Field,
  ConfirmButton,
  Empty,
  useSession,
  useSync,
  useDraft,
  formatDateTime
} from '../core/ui';
import {
  LIMITS,
  STATE_LABEL,
  remainingMs,
  formatClock,
  pauseSession,
  resumeSession,
  finishSession,
  parseTasks,
  type TaskState,
  type SessionTimes
} from '../../server/app/domain';

const APP_NAME = 'FocusDump';

export interface Session extends SessionTimes {
  id: string;
  remaining_ms: number;
  server_time: string;
}
export interface Task {
  id: string;
  text: string;
  position: number;
  estimate_minutes: number;
  state: TaskState;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  revision: number;
  session: Session | null;
  pending?: boolean;
}

interface Snapshot {
  tasks: Task[];
  now_task_id: string | null;
  fetched_at: string;
  offset_ms: number;
}

const TABS = [
  { id: 'now', label: 'Nå' },
  { id: 'inbox', label: 'Innboks' },
  { id: 'today', label: 'I dag' },
  { id: 'history', label: 'Historikk' }
];

export function App() {
  const { user, setUser, logout } = useSession();
  if (user === undefined) return <p className="auth muted">Laster …</p>;
  if (user === null)
    return <AuthScreen appName={APP_NAME} tagline="Tøm hodet. Velg én handling. Start fem minutter." onDone={setUser} />;
  return <Main user={user} onLogout={logout} />;
}

function Main({ user, onLogout }: { user: { id: string; email: string }; onLogout: () => void }) {
  const [tab, setTab] = useState(() => (location.hash === '#fang' ? 'inbox' : 'now'));
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loadErr, setLoadErr] = useState<ApiFail | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const cacheKey = `tasks:${user.id}`;

  const load = useCallback(async () => {
    try {
      const t0 = Date.now();
      const r = await api<{ tasks: Task[]; now_task_id: string | null }>('GET', '/api/tasks');
      const serverTime = r.tasks.find((t) => t.session)?.session?.server_time;
      const offset = serverTime ? Date.parse(serverTime) - Math.round((t0 + Date.now()) / 2) : 0;
      const s: Snapshot = { ...r, fetched_at: new Date().toISOString(), offset_ms: Math.abs(offset) > 2000 ? offset : 0 };
      setSnap(s);
      setFromCache(false);
      setLoadErr(null);
      kvSet(cacheKey, s);
    } catch (e) {
      if (e instanceof OfflineFail) {
        const cached = await kvGet<Snapshot>(cacheKey);
        if (cached) {
          setSnap(cached);
          setFromCache(true);
        }
      }
      setLoadErr(e as ApiFail);
    }
  }, [cacheKey]);

  useEffect(() => {
    load();
  }, [load]);

  const sync = useSync(load);
  const conflicts = sync.ops.filter((o) => o.status !== 'venter').length;

  /** Lokal (optimistisk) oppdatering når handlingen ligger i offline-køen. */
  const patchLocal = (fn: (tasks: Task[]) => Task[]) => {
    setSnap((s) => {
      if (!s) return s;
      const next = { ...s, tasks: fn(s.tasks) };
      kvSet(cacheKey, next);
      return next;
    });
  };

  const tasks = snap?.tasks ?? [];
  const nowTask = tasks.find((t) => t.state === 'ready' || t.state === 'active' || t.state === 'paused') ?? null;

  return (
    <Shell
      appName={APP_NAME}
      user={user}
      onLogout={onLogout}
      sync={{ online: sync.online, pending: sync.pending, conflicts }}
      tabs={TABS}
      tab={tab}
      onTab={setTab}
    >
      {fromCache && (
        <div className="notice warn" role="status">
          <p>Uten forbindelse. Viser lagret kopi fra {formatDateTime(snap?.fetched_at)}.</p>
        </div>
      )}
      {loadErr && !fromCache && <ErrorBox error={loadErr} />}
      <SyncPanel ops={sync.ops} onRetry={sync.syncNow} />
      {tab === 'now' && (
        <NowView task={nowTask} inboxCount={tasks.filter((t) => t.state === 'inbox').length} offset={snap?.offset_ms ?? 0} reload={load} patchLocal={patchLocal} goInbox={() => setTab('inbox')} />
      )}
      {tab === 'inbox' && <InboxView tasks={tasks} reload={load} patchLocal={patchLocal} goNow={() => setTab('now')} />}
      {tab === 'today' && <TodayView />}
      {tab === 'history' && <HistoryView reload={load} />}
    </Shell>
  );
}

// ---------------- Nå ----------------

function NowView({
  task,
  inboxCount,
  offset,
  reload,
  patchLocal,
  goInbox
}: {
  task: Task | null;
  inboxCount: number;
  offset: number;
  reload: () => void;
  patchLocal: (fn: (t: Task[]) => Task[]) => void;
  goInbox: () => void;
}) {
  const [minutes, setMinutes] = useState('5');
  const [err, setErr] = useState<ApiFail | null>(null);
  const [busy, setBusy] = useState(false);

  const makeNow = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api('POST', '/api/now', { minutes: Number(minutes) });
      await reload();
    } catch (e) {
      setErr(e as ApiFail);
    } finally {
      setBusy(false);
    }
  };

  if (!task) {
    return (
      <section className="card stack" aria-labelledby="now-h">
        <h1 id="now-h">Ett neste steg</h1>
        {inboxCount === 0 ? (
          <Empty title="Innboksen er tom.">
            <p>Skriv ned det som surrer i hodet først.</p>
            <button className="btn primary big" onClick={goInbox}>
              Tøm hodet
            </button>
          </Empty>
        ) : (
          <>
            <p className="lead">
              Du har {inboxCount} {inboxCount === 1 ? 'ting' : 'ting'} i innboksen. Vi tar den øverste.
            </p>
            <Field label="Tilgjengelige minutter" hint="1–120. Fem minutter er nok til å komme i gang." error={err?.fields.minutes}>
              {(id) => <input id={id} type="number" inputMode="numeric" min={LIMITS.minutesMin} max={LIMITS.minutesMax} step={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />}
            </Field>
            <ErrorBox error={err && !err.fields.minutes ? err : null} />
            <button className="btn primary big" onClick={makeNow} disabled={busy}>
              Lag nå-kort
            </button>
          </>
        )}
      </section>
    );
  }
  return <NowCard task={task} offset={offset} reload={reload} patchLocal={patchLocal} />;
}

function NowCard({ task, offset, reload, patchLocal }: { task: Task; offset: number; reload: () => void; patchLocal: (fn: (t: Task[]) => Task[]) => void }) {
  const [tick, setTick] = useState(Date.now());
  const [err, setErr] = useState<ApiFail | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const s = task.session;
  const left = s ? remainingMs(s, tick + offset) : task.estimate_minutes * 60_000;
  const timeUp = !!s && left === 0;

  const act = async (kind: 'start' | 'pause' | 'resume' | 'finish', label: string) => {
    setBusy(true);
    setErr(null);
    const at = new Date(Date.now() + offset).toISOString();
    try {
      const r = await mutate('POST', `/api/tasks/${task.id}/${kind}`, { revision: task.revision, at }, `${label}: ${task.text}`);
      if (r.queued) {
        // Uten nett: oppdater lokalt med samme tidsstempelregel som serveren.
        const atMs = Date.parse(at);
        patchLocal((all) =>
          all.map((t) => {
            if (t.id !== task.id) return t;
            let session = t.session;
            let state: TaskState = t.state;
            if (kind === 'start') {
              session = { id: 'lokal', duration_s: t.estimate_minutes * 60, started_at: at, paused_at: null, paused_ms: 0, finished_at: null, remaining_ms: 0, server_time: at };
              state = 'active';
            } else if (session) {
              const next = kind === 'pause' ? pauseSession(session, atMs) : kind === 'resume' ? resumeSession(session, atMs) : finishSession(session, atMs);
              session = kind === 'finish' ? null : { ...session, ...next };
              state = kind === 'pause' ? 'paused' : kind === 'resume' ? 'active' : 'done';
            }
            return { ...t, state, session, revision: t.revision + 1, pending: true };
          })
        );
      } else await reload();
    } catch (e) {
      setErr(e as ApiFail);
    } finally {
      setBusy(false);
    }
  };

  const putBack = async () => {
    setBusy(true);
    try {
      await api('POST', `/api/tasks/${task.id}/state`, { revision: task.revision, state: 'inbox' });
      await reload();
    } catch (e) {
      setErr(e as ApiFail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card now-card stack" aria-labelledby="now-title">
      <div className="row">
        <span className="pill">{STATE_LABEL[task.state]}</span>
        {task.pending && <span className="badge wait">Ikke synkronisert</span>}
      </div>
      <h1 id="now-title" className="now-text">
        {task.text}
      </h1>
      <div className={`timer num ${task.state === 'paused' ? 'paused' : ''}`} aria-live="off" role="timer" aria-label={`Gjenstår ${formatClock(left)}`}>
        {formatClock(left)}
      </div>
      {timeUp && <p className="notice info">Tiden er ute. Merk som ferdig, eller fortsett litt til.</p>}
      <ErrorBox error={err} onReload={reload} />
      <div className="actions">
        {task.state === 'ready' && (
          <>
            <button className="btn primary big" disabled={busy} onClick={() => act('start', 'Start')}>
              Start {task.estimate_minutes} min
            </button>
            <button className="btn" disabled={busy} onClick={putBack}>
              Legg tilbake i innboksen
            </button>
          </>
        )}
        {task.state === 'active' && (
          <>
            <button className="btn primary big" disabled={busy} onClick={() => act('pause', 'Pause')}>
              Pause
            </button>
            <button className="btn big" disabled={busy} onClick={() => act('finish', 'Ferdig')}>
              Ferdig
            </button>
          </>
        )}
        {task.state === 'paused' && (
          <>
            <button className="btn primary big" disabled={busy} onClick={() => act('resume', 'Fortsett')}>
              Fortsett
            </button>
            <button className="btn big" disabled={busy} onClick={() => act('finish', 'Ferdig')}>
              Ferdig
            </button>
          </>
        )}
      </div>
      <p className="small muted">Tiden regnes fra tidspunktene du trykker, så den stemmer også etter omstart. Appen lover ikke varsel når tiden er ute.</p>
    </section>
  );
}

// ---------------- Innboks ----------------

function InboxView({ tasks, reload, patchLocal, goNow }: { tasks: Task[]; reload: () => void; patchLocal: (fn: (t: Task[]) => Task[]) => void; goNow: () => void }) {
  const [draft, setDraft, clearDraft] = useDraft('capture', { tasks: '', minutes: '5' });
  const [err, setErr] = useState<ApiFail | null>(null);
  const [queued, setQueued] = useState(false);
  const [busy, setBusy] = useState(false);
  const inbox = tasks.filter((t) => t.state === 'inbox');
  const done = tasks.filter((t) => t.state === 'done');
  const lines = useMemo(() => parseTasks(draft.tasks), [draft.tasks]);

  const capture = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setQueued(false);
    const ids = lines.map(() => crypto.randomUUID());
    try {
      const r = await mutate('POST', '/api/tasks/capture', { tasks: draft.tasks, minutes: Number(draft.minutes), ids }, `Fangst: ${lines.length} oppgave(r)`);
      if (r.queued) {
        setQueued(true);
        const nowIso = new Date().toISOString();
        const maxPos = Math.max(0, ...tasks.map((t) => t.position));
        patchLocal((all) => [
          ...all,
          ...lines.map((text, i) => ({
            id: ids[i], text, position: maxPos + i + 1, estimate_minutes: Number(draft.minutes), state: 'inbox' as const,
            archived_at: null, created_at: nowIso, updated_at: nowIso, revision: 1, session: null, pending: true
          }))
        ]);
      } else await reload();
      clearDraft();
    } catch (e) {
      setErr(e as ApiFail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="card stack" onSubmit={capture} aria-labelledby="cap-h" noValidate>
        <h1 id="cap-h">Tøm hodet</h1>
        <Field label="Oppgaver, én per linje" hint={lines.length ? `${lines.length} linje(r). Utkastet lagres på enheten mens du skriver.` : 'Skriv alt som surrer. Rekkefølgen kan endres etterpå.'} error={err?.fields.tasks}>
          {(id) => <textarea id={id} value={draft.tasks} onChange={(e) => setDraft({ ...draft, tasks: e.target.value })} rows={5} />}
        </Field>
        <Field label="Tilgjengelige minutter per oppgave" hint="1–120" error={err?.fields.minutes}>
          {(id) => <input id={id} type="number" inputMode="numeric" min={1} max={120} step={1} value={draft.minutes} onChange={(e) => setDraft({ ...draft, minutes: e.target.value })} />}
        </Field>
        <ErrorBox error={err && !Object.keys(err.fields).length ? err : null} />
        {queued && <p className="notice warn">Lagret på enheten. Sendes når nettet er tilbake.</p>}
        <button className="btn primary big" disabled={busy}>
          Legg i innboksen
        </button>
      </form>

      <section className="stack" aria-labelledby="inbox-h">
        <div className="row">
          <h2 id="inbox-h" className="grow">
            Innboks ({inbox.length})
          </h2>
          {inbox.length > 0 && (
            <button className="btn small" onClick={goNow}>
              Til nå-kort
            </button>
          )}
        </div>
        {inbox.length === 0 ? (
          <Empty title="Ingenting i innboksen." />
        ) : (
          <ol className="list">
            {inbox.map((t, i) => (
              <TaskRow key={t.id} task={t} first={i === 0} last={i === inbox.length - 1} reload={reload} />
            ))}
          </ol>
        )}
      </section>

      {done.length > 0 && (
        <section className="stack" aria-labelledby="done-h">
          <h2 id="done-h">Ferdig</h2>
          <ul className="list">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} first last reload={reload} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function TaskRow({ task, first, last, reload }: { task: Task; first: boolean; last: boolean; reload: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);
  const [minutes, setMinutes] = useState(String(task.estimate_minutes));
  const [err, setErr] = useState<ApiFail | null>(null);
  const [saved, setSaved] = useState(false);

  const call = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      await reload();
      return true;
    } catch (e) {
      setErr(e as ApiFail);
      return false;
    }
  };
  const save = async () => {
    const ok = await call(() => api('PATCH', `/api/tasks/${task.id}`, { revision: task.revision, text, estimate_minutes: Number(minutes) }));
    if (ok) {
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };
  const fetchLatest = async () => {
    const cur = await api<Task>('GET', `/api/tasks/${task.id}`);
    setText(cur.text);
    setMinutes(String(cur.estimate_minutes));
    setErr(null);
    await reload();
  };

  return (
    <li>
      {editing ? (
        <div className="stack">
          <Field label="Oppgave" error={err?.fields.text}>
            {(id) => <input id={id} value={text} onChange={(e) => setText(e.target.value)} maxLength={200} />}
          </Field>
          <Field label="Minutter" error={err?.fields.estimate_minutes}>
            {(id) => <input id={id} type="number" min={1} max={120} value={minutes} onChange={(e) => setMinutes(e.target.value)} />}
          </Field>
          <ErrorBox error={err && !Object.keys(err.fields).length ? err : null} onReload={fetchLatest} />
          <div className="row">
            <button className="btn primary" onClick={save}>
              Lagre
            </button>
            <button className="btn" onClick={() => { setEditing(false); setText(task.text); setMinutes(String(task.estimate_minutes)); setErr(null); }}>
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="grow">
            <div className="task-text">{task.text}</div>
            <div className="small muted">
              {task.estimate_minutes} min · {STATE_LABEL[task.state]}
              {task.pending && ' · ikke synkronisert'}
              {saved && ' · Lagret'}
            </div>
          </div>
          {task.state === 'inbox' && !task.pending && (
            <>
              <button className="btn icon" aria-label={`Flytt «${task.text}» opp`} disabled={first} onClick={() => call(() => api('POST', `/api/tasks/${task.id}/move`, { revision: task.revision, direction: 'up' }))}>
                ↑
              </button>
              <button className="btn icon" aria-label={`Flytt «${task.text}» ned`} disabled={last} onClick={() => call(() => api('POST', `/api/tasks/${task.id}/move`, { revision: task.revision, direction: 'down' }))}>
                ↓
              </button>
            </>
          )}
          {task.state === 'done' && (
            <button className="btn small" onClick={() => call(() => api('POST', `/api/tasks/${task.id}/state`, { revision: task.revision, state: 'inbox' }))}>
              Gjenåpne
            </button>
          )}
          {!task.pending && (
            <>
              <button className="btn small" onClick={() => setEditing(true)}>
                Endre
              </button>
              <button className="btn small" onClick={() => call(() => api('POST', `/api/tasks/${task.id}/archive`, { revision: task.revision }))}>
                Arkiver
              </button>
            </>
          )}
        </div>
      )}
      {!editing && <ErrorBox error={err} onReload={fetchLatest} />}
    </li>
  );
}

// ---------------- I dag ----------------

function TodayView() {
  const [data, setData] = useState<{ date: string; done: number; captured: number; sessions: number; focus_minutes: number; message: string } | null>(null);
  const [err, setErr] = useState<ApiFail | null>(null);
  useEffect(() => {
    api('GET', `/api/today?tz=${new Date().getTimezoneOffset()}`).then(setData).catch(setErr);
  }, []);
  if (err) return <ErrorBox error={err} />;
  if (!data) return <p className="muted">Laster …</p>;
  return (
    <section className="card stack" aria-labelledby="today-h">
      <h1 id="today-h">I dag</h1>
      <p className="lead">{data.message}</p>
      <dl className="stats">
        <div>
          <dt>Ferdig</dt>
          <dd className="num">{data.done}</dd>
        </div>
        <div>
          <dt>Økter</dt>
          <dd className="num">{data.sessions}</dd>
        </div>
        <div>
          <dt>Fokusminutter</dt>
          <dd className="num">{data.focus_minutes}</dd>
        </div>
        <div>
          <dt>Skrevet ned</dt>
          <dd className="num">{data.captured}</dd>
        </div>
      </dl>
      <p className="small muted">Ingen mål, rekker eller sammenligning. Bare det som faktisk skjedde.</p>
    </section>
  );
}

// ---------------- Historikk og eksport ----------------

function HistoryView({ reload }: { reload: () => void }) {
  const [archived, setArchived] = useState<Task[] | null>(null);
  const [err, setErr] = useState<ApiFail | null>(null);
  const load = useCallback(() => {
    api<{ tasks: Task[] }>('GET', '/api/tasks?archived=1')
      .then((r) => setArchived(r.tasks))
      .catch(setErr);
  }, []);
  useEffect(load, [load]);
  const act = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      load();
      reload();
    } catch (e) {
      setErr(e as ApiFail);
    }
  };
  return (
    <>
      <section className="card stack" aria-labelledby="exp-h">
        <h1 id="exp-h">Eksport</h1>
        <p className="muted">Eksporten inneholder alle oppgaver og økter fra databasen, med formatversjon og tidspunkt.</p>
        <div className="row">
          <a className="btn primary" href={downloadUrl('/api/export?download=1')} download>
            Last ned JSON
          </a>
          <a className="btn" href={downloadUrl('/api/export?format=csv')} download>
            Last ned CSV
          </a>
        </div>
      </section>
      <section className="stack" aria-labelledby="arch-h">
        <h2 id="arch-h">Arkiv</h2>
        <ErrorBox error={err} />
        {archived === null ? (
          <p className="muted">Laster …</p>
        ) : archived.length === 0 ? (
          <Empty title="Arkivet er tomt." />
        ) : (
          <ul className="list">
            {archived.map((t) => (
              <li key={t.id} className="row">
                <div className="grow">
                  <div>{t.text}</div>
                  <div className="small muted">Arkivert {formatDateTime(t.archived_at)}</div>
                </div>
                <button className="btn small" onClick={() => act(() => api('POST', `/api/tasks/${t.id}/unarchive`, { revision: t.revision }))}>
                  Gjenåpne
                </button>
                <ConfirmButton className="btn small danger" label="Slett" confirmLabel="Slett for godt" onConfirm={() => act(() => api('DELETE', `/api/tasks/${t.id}`, { confirm: true }))} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
