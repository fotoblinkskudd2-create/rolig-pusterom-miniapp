import { ApiError, type Ctx, type Router } from '../core/http.js';
import { type Row, now } from '../core/db.js';
import { Validator } from '../core/validate.js';
import { getOwned, insertOwned, updateOwned, setArchived, deleteOwned, listOwned } from '../core/repo.js';
import { exportEnvelope } from '../core/server.js';
import {
  type TaskState,
  type SessionTimes,
  TASK_STATES,
  NOW_STATES,
  LIMITS,
  canTransition,
  pickNext,
  pauseSession,
  resumeSession,
  finishSession,
  remainingMs,
  daySummary,
  dayMessage,
  STATE_LABEL
} from './domain.js';
import { APP } from './meta.js';

type Task = { id: string; text: string; position: number; estimate_minutes: number; state: TaskState; archived_at: string | null; created_at: string; updated_at: string; revision: number };

const asTask = (r: Row) => r as unknown as Task;
const asSession = (r: Row) => r as unknown as SessionTimes & { id: string; task_id: string; revision: number };

/**
 * Tidspunkt for en handling. Køede offline-handlinger kan sende med `at`
 * (når brukeren faktisk trykket). Godtas bare innen siste døgn og ikke i fremtiden.
 */
function actionTime(body: any): number {
  const t = Date.now();
  if (body?.at === undefined) return t;
  const at = new Date(body.at).getTime();
  if (!Number.isFinite(at) || at > t + 5000 || at < t - 86400_000)
    throw new ApiError(400, 'ugyldig', 'Tidspunktet for handlingen er ugyldig.', { fields: { at: 'Ugyldig tidspunkt.' } });
  return at;
}

function currentNow(ctx: Ctx): Task | undefined {
  const row = ctx.db
    .prepare(
      `SELECT * FROM tasks WHERE owner_id = ? AND archived_at IS NULL AND state IN (${NOW_STATES.map(() => '?').join(',')})
       ORDER BY position LIMIT 1`
    )
    .get(ctx.user.id, ...NOW_STATES) as Row | undefined;
  return row ? asTask(row) : undefined;
}

function openSession(ctx: Ctx, taskId: string) {
  const r = ctx.db
    .prepare('SELECT * FROM focus_sessions WHERE task_id = ? AND owner_id = ? AND finished_at IS NULL ORDER BY started_at DESC LIMIT 1')
    .get(taskId, ctx.user.id) as Row | undefined;
  return r ? asSession(r) : undefined;
}

function withSession(ctx: Ctx, task: Task) {
  const session = NOW_STATES.includes(task.state) ? openSession(ctx, task.id) : undefined;
  return {
    ...task,
    state_label: STATE_LABEL[task.state],
    session: session ? { ...session, remaining_ms: remainingMs(session, Date.now()), server_time: now() } : null
  };
}

function nextPosition(ctx: Ctx): number {
  const r = ctx.db.prepare('SELECT COALESCE(MAX(position), 0) AS p FROM tasks WHERE owner_id = ?').get(ctx.user.id) as Row;
  return Number(r.p) + 1;
}

function transition(ctx: Ctx, task: Task, revision: number, to: TaskState): Task {
  if (task.archived_at) throw new ApiError(409, 'arkivert', 'Oppgaven er arkivert. Gjenåpne den først.');
  if (!canTransition(task.state, to))
    throw new ApiError(409, 'ugyldig_overgang', `Kan ikke gå fra «${STATE_LABEL[task.state]}» til «${STATE_LABEL[to]}».`);
  if (NOW_STATES.includes(to) && !NOW_STATES.includes(task.state)) {
    const cur = currentNow(ctx);
    if (cur && cur.id !== task.id)
      throw new ApiError(409, 'har_naa_kort', 'Du har allerede et nå-kort. Gjør det ferdig eller legg det tilbake først.');
  }
  return asTask(updateOwned(ctx.db, 'tasks', task.id, ctx.user.id, revision, { state: to }));
}

export const EXPORT_FIELDS: Record<string, string> = {
  'tasks[].id': 'Oppgavens id (UUID).',
  'tasks[].text': 'Oppgaveteksten slik brukeren skrev den.',
  'tasks[].position': 'Rekkefølge i innboksen (lavest først).',
  'tasks[].estimate_minutes': 'Valgt øktlengde i minutter (1–120).',
  'tasks[].state': 'inbox | ready | active | paused | done.',
  'tasks[].archived_at': 'Tidspunkt for arkivering, ellers null.',
  'tasks[].created_at / updated_at': 'ISO 8601 i UTC.',
  'tasks[].revision': 'Revisjonsnummer, øker ved hver endring.',
  'sessions[].task_id': 'Oppgaven økten gjelder.',
  'sessions[].duration_s': 'Planlagt varighet i sekunder.',
  'sessions[].started_at / paused_at / finished_at': 'Tidsstempler i UTC. paused_at er satt mens økten står på pause.',
  'sessions[].paused_ms': 'Sum av fullførte pauser i millisekunder.',
  'sessions[].focus_ms': 'Beregnet fokustid = slutt − start − pauser.'
};

export function exportData(ctx: Ctx) {
  const tasks = ctx.db.prepare('SELECT * FROM tasks WHERE owner_id = ? ORDER BY position').all(ctx.user.id) as Row[];
  const sessions = (
    ctx.db.prepare('SELECT * FROM focus_sessions WHERE owner_id = ? ORDER BY started_at').all(ctx.user.id) as Row[]
  ).map((r) => {
    const s = asSession(r);
    const focus = s.duration_s * 1000 - remainingMs(s, Date.now());
    return { ...r, focus_ms: focus };
  });
  return exportEnvelope(APP, EXPORT_FIELDS, { tasks, sessions });
}

function csv(rows: (string | number | null)[][]): string {
  return rows
    .map((r) => r.map((c) => (c === null ? '' : /[;"\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c))).join(';'))
    .join('\n');
}

export function routes(r: Router) {
  r.get('/api/tasks', (ctx) => {
    const archived = ctx.query.get('archived') === '1';
    const tasks = listOwned(ctx.db, 'tasks', ctx.user.id, { archived, orderBy: 'position ASC' }).map((t) =>
      withSession(ctx, asTask(t))
    );
    const cur = currentNow(ctx);
    return { tasks, now_task_id: cur?.id ?? null };
  });

  // Rask fangst: én oppgave per linje.
  r.post('/api/tasks/capture', (ctx) => {
    const v = new Validator(ctx.body);
    const lines = v.lines('tasks', { label: 'Oppgaver', maxLines: LIMITS.maxTasksPerCapture, maxLength: LIMITS.maxTaskLength });
    const minutes = v.int('minutes', { label: 'Tilgjengelige minutter', min: LIMITS.minutesMin, max: LIMITS.minutesMax });
    const ids = ctx.body.ids;
    if (ids !== undefined && (!Array.isArray(ids) || (lines && ids.length !== lines.length)))
      v.fail('ids', 'Antall id-er må stemme med antall linjer.');
    v.done();
    let pos = nextPosition(ctx);
    const created = lines!.map((text, i) =>
      asTask(insertOwned(ctx.db, 'tasks', ctx.user.id, { text, position: pos++, estimate_minutes: minutes!, state: 'inbox', archived_at: null }, ids?.[i]))
    );
    return { __status: 201, tasks: created };
  });

  r.get('/api/tasks/:id', (ctx) => withSession(ctx, asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id))));

  // Endre ett eller flere felt med revisjonskontroll.
  r.patch('/api/tasks/:id', (ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    const fields: Record<string, string | number> = {};
    if (v.has('text')) {
      const t = v.text('text', { label: 'Oppgave', max: LIMITS.maxTaskLength });
      if (t) fields.text = t;
    }
    if (v.has('estimate_minutes')) {
      const m = v.int('estimate_minutes', { label: 'Minutter', min: LIMITS.minutesMin, max: LIMITS.minutesMax });
      if (m !== undefined) fields.estimate_minutes = m;
    }
    if (Object.keys(fields).length === 0 && Object.keys(v.errors).length === 0) v.fail('text', 'Ingen endringer å lagre.');
    v.done();
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    if ('estimate_minutes' in fields && (task.state === 'active' || task.state === 'paused'))
      throw new ApiError(409, 'okt_pagar', 'Øktlengden kan ikke endres mens økten pågår.');
    return withSession(ctx, asTask(updateOwned(ctx.db, 'tasks', task.id, ctx.user.id, revision, fields)));
  });

  // Enkle tilstandsendringer uten timer: legg tilbake i innboks, gjenåpne ferdig.
  r.post('/api/tasks/:id/state', (ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    const to = v.oneOf('state', TASK_STATES, { label: 'Tilstand' });
    v.done();
    if (to === 'active' || to === 'paused' || to === 'done')
      throw new ApiError(409, 'bruk_okt', 'Bruk start, pause eller ferdig for økter.');
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    let updated = transition(ctx, task, revision, to!);
    if (to === 'inbox') {
      updated = asTask(updateOwned(ctx.db, 'tasks', updated.id, ctx.user.id, updated.revision, { position: nextPosition(ctx) }));
    }
    return withSession(ctx, updated);
  });

  // "Lag nå-kort": velg første oppgave i innboksen (eller en valgt oppgave).
  r.post('/api/now', (ctx) => {
    const v = new Validator(ctx.body);
    const minutes = v.int('minutes', { label: 'Tilgjengelige minutter', min: LIMITS.minutesMin, max: LIMITS.minutesMax, required: false });
    v.done();
    const existing = currentNow(ctx);
    if (existing) throw new ApiError(409, 'har_naa_kort', 'Du har allerede et nå-kort.', { current: withSession(ctx, existing) });
    let task: Task | undefined;
    if (ctx.body.task_id) {
      task = asTask(getOwned(ctx.db, 'tasks', String(ctx.body.task_id), ctx.user.id));
    } else {
      const all = listOwned(ctx.db, 'tasks', ctx.user.id, { orderBy: 'position ASC' }).map(asTask);
      task = pickNext(all);
    }
    if (!task) throw new ApiError(409, 'tom_innboks', 'Innboksen er tom. Skriv ned noe først.');
    let updated = transition(ctx, task, task.revision, 'ready');
    if (minutes !== undefined)
      updated = asTask(updateOwned(ctx.db, 'tasks', updated.id, ctx.user.id, updated.revision, { estimate_minutes: minutes }));
    return withSession(ctx, updated);
  });

  r.post('/api/tasks/:id/start', (ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    v.done();
    const at = actionTime(ctx.body);
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    const updated = transition(ctx, task, revision, 'active');
    insertOwned(ctx.db, 'focus_sessions', ctx.user.id, {
      task_id: task.id,
      duration_s: task.estimate_minutes * 60,
      started_at: new Date(at).toISOString(),
      paused_at: null,
      paused_ms: 0,
      finished_at: null,
      archived_at: null
    });
    return withSession(ctx, updated);
  });

  const sessionAction = (kind: 'pause' | 'resume' | 'finish') => (ctx: Ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    v.done();
    const at = actionTime(ctx.body);
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    const s = openSession(ctx, task.id);
    if (!s) throw new ApiError(409, 'ingen_okt', 'Det finnes ingen aktiv økt for denne oppgaven.');
    let next: SessionTimes;
    try {
      next = kind === 'pause' ? pauseSession(s, at) : kind === 'resume' ? resumeSession(s, at) : finishSession(s, at);
    } catch (e) {
      throw new ApiError(409, 'ugyldig_overgang', (e as Error).message);
    }
    const to: TaskState = kind === 'pause' ? 'paused' : kind === 'resume' ? 'active' : 'done';
    const updated = transition(ctx, task, revision, to);
    updateOwned(ctx.db, 'focus_sessions', s.id, ctx.user.id, s.revision, {
      paused_at: next.paused_at,
      paused_ms: next.paused_ms,
      finished_at: next.finished_at
    });
    return withSession(ctx, updated);
  };
  r.post('/api/tasks/:id/pause', sessionAction('pause'));
  r.post('/api/tasks/:id/resume', sessionAction('resume'));
  r.post('/api/tasks/:id/finish', sessionAction('finish'));

  // Omprioritering: bytt plass med naboen over/under i innboksen.
  r.post('/api/tasks/:id/move', (ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    const dir = v.oneOf('direction', ['up', 'down'] as const, { label: 'Retning' });
    v.done();
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    const neighbor = ctx.db
      .prepare(
        `SELECT * FROM tasks WHERE owner_id = ? AND archived_at IS NULL AND state = 'inbox' AND position ${dir === 'up' ? '<' : '>'} ?
         ORDER BY position ${dir === 'up' ? 'DESC' : 'ASC'} LIMIT 1`
      )
      .get(ctx.user.id, task.position) as Row | undefined;
    if (!neighbor) throw new ApiError(409, 'ytterst', dir === 'up' ? 'Oppgaven er allerede øverst.' : 'Oppgaven er allerede nederst.');
    const n = asTask(neighbor);
    const moved = updateOwned(ctx.db, 'tasks', task.id, ctx.user.id, revision, { position: n.position });
    updateOwned(ctx.db, 'tasks', n.id, ctx.user.id, n.revision, { position: task.position });
    return withSession(ctx, asTask(moved));
  });

  r.post('/api/tasks/:id/archive', (ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    v.done();
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    if (task.state === 'active' || task.state === 'paused')
      throw new ApiError(409, 'okt_pagar', 'Avslutt økten før du arkiverer.');
    // Et nå-kort som arkiveres legges tilbake i innboksen, så gjenåpning er trygg.
    const fields: Record<string, string> = { archived_at: now() };
    if (task.state === 'ready') fields.state = 'inbox';
    return withSession(ctx, asTask(updateOwned(ctx.db, 'tasks', task.id, ctx.user.id, revision, fields)));
  });

  r.post('/api/tasks/:id/unarchive', (ctx) => {
    const v = new Validator(ctx.body);
    const revision = v.revision();
    v.done();
    const task = asTask(getOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id));
    if (!task.archived_at) throw new ApiError(409, 'ikke_arkivert', 'Oppgaven er ikke arkivert.');
    return withSession(ctx, asTask(setArchived(ctx.db, 'tasks', task.id, ctx.user.id, revision, false)));
  });

  r.delete('/api/tasks/:id', (ctx) => deleteOwned(ctx.db, 'tasks', ctx.params.id, ctx.user.id, ctx.body));

  r.get('/api/today', (ctx) => {
    const tz = Number(ctx.query.get('tz') ?? 0);
    if (!Number.isInteger(tz) || Math.abs(tz) > 900) throw new ApiError(400, 'ugyldig', 'Ugyldig tidssone.');
    const date = ctx.query.get('date') ?? new Date(Date.now() - tz * 60_000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, 'ugyldig', 'Ugyldig dato.');
    const tasks = ctx.db.prepare('SELECT state, created_at, updated_at FROM tasks WHERE owner_id = ?').all(ctx.user.id) as any[];
    const sessions = ctx.db.prepare('SELECT * FROM focus_sessions WHERE owner_id = ?').all(ctx.user.id) as any[];
    const s = daySummary({ tasks, sessions }, date, tz, Date.now());
    return { ...s, message: dayMessage(s) };
  });

  r.get('/api/export', (ctx) => {
    const data = exportData(ctx);
    const stamp = data.exported_at.slice(0, 19).replace(/[:T]/g, '-');
    if (ctx.query.get('format') === 'csv') {
      const rows: (string | number | null)[][] = [['id', 'tekst', 'tilstand', 'minutter', 'posisjon', 'arkivert', 'opprettet', 'endret', 'revisjon']];
      for (const t of data.data.tasks as any[])
        rows.push([t.id, t.text, t.state, t.estimate_minutes, t.position, t.archived_at, t.created_at, t.updated_at, t.revision]);
      return {
        download: {
          filename: `focusdump-${stamp}.csv`,
          contentType: 'text/csv; charset=utf-8',
          body: `# focusdump-eksport format_version=1 exported_at=${data.exported_at}\n` + csv(rows)
        }
      };
    }
    if (ctx.query.get('download') === '1')
      return { download: { filename: `focusdump-${stamp}.json`, contentType: 'application/json; charset=utf-8', body: JSON.stringify(data, null, 2) } };
    return data;
  });
}
