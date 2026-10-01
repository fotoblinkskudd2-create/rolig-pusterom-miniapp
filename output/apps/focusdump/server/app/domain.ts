// FocusDump – ren domenelogikk. Ingen Node- eller DOM-avhengigheter,
// slik at samme kode brukes av server, klient og tester.

export const TASK_STATES = ['inbox', 'ready', 'active', 'paused', 'done'] as const;
export type TaskState = (typeof TASK_STATES)[number];

export const STATE_LABEL: Record<TaskState, string> = {
  inbox: 'Innboks',
  ready: 'Nå-kort',
  active: 'Pågår',
  paused: 'Pause',
  done: 'Ferdig'
};

/** Tillatte overganger. inbox -> ready -> active -> done; active <-> paused. */
export const TRANSITIONS: Record<TaskState, TaskState[]> = {
  inbox: ['ready'],
  ready: ['active', 'inbox'],
  active: ['paused', 'done'],
  paused: ['active', 'done'],
  done: ['inbox']
};

export function canTransition(from: TaskState, to: TaskState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Tilstander som teller som "nå-kort". Bare ett av gangen. */
export const NOW_STATES: TaskState[] = ['ready', 'active', 'paused'];

export const LIMITS = { minutesMin: 1, minutesMax: 120, maxTasksPerCapture: 50, maxTaskLength: 200 };

export function parseTasks(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export interface TaskLike {
  id: string;
  state: TaskState;
  position: number;
  archived_at: string | null;
}

/** Velger første oppgave i innboksen etter posisjon. Stabil ved like posisjoner (id). */
export function pickNext<T extends TaskLike>(tasks: T[]): T | undefined {
  return tasks
    .filter((t) => t.state === 'inbox' && t.archived_at === null)
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))[0];
}

// ---------- Timer ----------
// Timeren regnes fra tidsstempler, aldri fra antall intervall-kall. Reload,
// bakgrunn og lukket app påvirker derfor ikke regnestykket.

export interface SessionTimes {
  duration_s: number;
  started_at: string; // ISO
  paused_at: string | null; // ISO når pauset
  paused_ms: number; // sum av fullførte pauser
  finished_at: string | null;
}

const ms = (iso: string) => new Date(iso).getTime();

export function elapsedMs(s: SessionTimes, nowMs: number): number {
  const end = s.finished_at ? ms(s.finished_at) : s.paused_at ? ms(s.paused_at) : nowMs;
  return Math.max(0, end - ms(s.started_at) - s.paused_ms);
}

export function remainingMs(s: SessionTimes, nowMs: number): number {
  return Math.max(0, s.duration_s * 1000 - elapsedMs(s, nowMs));
}

export function pauseSession(s: SessionTimes, atMs: number): SessionTimes {
  if (s.finished_at) throw new Error('Økten er avsluttet.');
  if (s.paused_at) throw new Error('Økten er allerede satt på pause.');
  return { ...s, paused_at: new Date(atMs).toISOString() };
}

export function resumeSession(s: SessionTimes, atMs: number): SessionTimes {
  if (s.finished_at) throw new Error('Økten er avsluttet.');
  if (!s.paused_at) throw new Error('Økten er ikke satt på pause.');
  const pausedFor = Math.max(0, atMs - ms(s.paused_at));
  return { ...s, paused_at: null, paused_ms: s.paused_ms + pausedFor };
}

export function finishSession(s: SessionTimes, atMs: number): SessionTimes {
  if (s.finished_at) throw new Error('Økten er allerede avsluttet.');
  // En pauset økt avsluttes på pausetidspunktet; pausetiden teller ikke som fokus.
  if (s.paused_at) {
    const r = resumeSession(s, atMs);
    return { ...r, finished_at: new Date(atMs).toISOString() };
  }
  return { ...s, finished_at: new Date(atMs).toISOString() };
}

export function formatClock(msLeft: number): string {
  const total = Math.ceil(msLeft / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------- Daglig oversikt ----------

/** Lokal dato (YYYY-MM-DD) for et tidspunkt, gitt klientens UTC-forskyvning i minutter (Date#getTimezoneOffset). */
export function localDate(iso: string, tzOffsetMin: number): string {
  return new Date(ms(iso) - tzOffsetMin * 60_000).toISOString().slice(0, 10);
}

export interface DayInput {
  tasks: { state: TaskState; created_at: string; updated_at: string }[];
  sessions: SessionTimes[];
}

export function daySummary(input: DayInput, date: string, tzOffsetMin: number, nowMs: number) {
  const onDay = (iso: string) => localDate(iso, tzOffsetMin) === date;
  const done = input.tasks.filter((t) => t.state === 'done' && onDay(t.updated_at)).length;
  const captured = input.tasks.filter((t) => onDay(t.created_at)).length;
  const daySessions = input.sessions.filter((s) => onDay(s.started_at));
  const focusMs = daySessions.reduce((sum, s) => sum + Math.min(elapsedMs(s, nowMs), s.duration_s * 1000), 0);
  return {
    date,
    done,
    captured,
    sessions: daySessions.length,
    focus_minutes: Math.round(focusMs / 60_000)
  };
}

/** Nøytral tekst uten prestasjonspress, streaks eller sammenligning. */
export function dayMessage(s: { done: number; sessions: number }): string {
  if (s.done === 0 && s.sessions === 0) return 'Ingen økter i dag ennå. Det er helt greit.';
  if (s.done === 0) return `Du har startet ${s.sessions} ${s.sessions === 1 ? 'økt' : 'økter'} i dag.`;
  return `Du har gjort ferdig ${s.done} ${s.done === 1 ? 'ting' : 'ting'} i dag.`;
}
