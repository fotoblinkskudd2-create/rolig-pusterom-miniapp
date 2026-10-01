import { describe, it, expect } from 'vitest';
import {
  parseTasks,
  pickNext,
  pauseSession,
  resumeSession,
  finishSession,
  remainingMs,
  elapsedMs,
  canTransition,
  daySummary,
  dayMessage,
  localDate,
  formatClock,
  type SessionTimes
} from '../server/app/domain.js';

const T0 = Date.parse('2026-10-01T08:00:00.000Z');
const iso = (ms: number) => new Date(ms).toISOString();
const session = (duration_s = 300): SessionTimes => ({
  duration_s,
  started_at: iso(T0),
  paused_at: null,
  paused_ms: 0,
  finished_at: null
});

describe('Kontrolleksempel fra oppgaven', () => {
  it('tre oppgaver i kø: første velges; pause etter 60 s av 300 s beholder 240 s; gjenoppta fortsetter derfra', () => {
    const lines = parseTasks('Rydde skrivebord\nSende tilbud\nBestille deler');
    expect(lines).toHaveLength(3);
    const tasks = lines.map((text, i) => ({ id: `t${i}`, text, state: 'inbox' as const, position: i + 1, archived_at: null }));
    expect(pickNext(tasks)?.text).toBe('Rydde skrivebord');

    let s = session(300);
    s = pauseSession(s, T0 + 60_000);
    expect(remainingMs(s, T0 + 60_000)).toBe(240_000);
    // Tiden står stille under pause, uansett hvor lenge pausen varer.
    expect(remainingMs(s, T0 + 3_600_000)).toBe(240_000);

    s = resumeSession(s, T0 + 500_000);
    expect(remainingMs(s, T0 + 500_000)).toBe(240_000);
    expect(remainingMs(s, T0 + 510_000)).toBe(230_000);
  });
});

describe('Timer regnes fra tidsstempler', () => {
  it('reload/bakgrunn: samme svar uansett hvor ofte vi spør', () => {
    const s = session(300);
    const a = remainingMs(s, T0 + 123_456);
    for (let i = 0; i < 100; i++) remainingMs(s, T0 + i);
    expect(remainingMs(s, T0 + 123_456)).toBe(a);
    expect(a).toBe(300_000 - 123_456);
  });

  it('går aldri under null', () => {
    expect(remainingMs(session(60), T0 + 10 * 60_000)).toBe(0);
  });

  it('flere pauser summeres', () => {
    let s = session(300);
    s = pauseSession(s, T0 + 10_000);
    s = resumeSession(s, T0 + 20_000);
    s = pauseSession(s, T0 + 30_000);
    s = resumeSession(s, T0 + 50_000);
    expect(s.paused_ms).toBe(30_000);
    expect(elapsedMs(s, T0 + 60_000)).toBe(30_000);
  });

  it('avvis dobbel pause, gjenoppta uten pause og handling etter avslutning', () => {
    const s = pauseSession(session(), T0 + 1000);
    expect(() => pauseSession(s, T0 + 2000)).toThrow();
    expect(() => resumeSession(session(), T0 + 2000)).toThrow();
    const f = finishSession(session(), T0 + 5000);
    expect(() => pauseSession(f, T0 + 6000)).toThrow();
    expect(() => finishSession(f, T0 + 6000)).toThrow();
  });

  it('avslutning under pause teller ikke pausetiden som fokus', () => {
    let s = pauseSession(session(), T0 + 60_000);
    s = finishSession(s, T0 + 120_000);
    expect(elapsedMs(s, T0 + 999_999)).toBe(60_000);
  });

  it('formaterer klokke', () => {
    expect(formatClock(240_000)).toBe('4:00');
    expect(formatClock(59_001)).toBe('1:00');
    expect(formatClock(0)).toBe('0:00');
  });
});

describe('Tilstandsflyt', () => {
  it('inbox -> ready -> active -> done; active <-> paused', () => {
    expect(canTransition('inbox', 'ready')).toBe(true);
    expect(canTransition('ready', 'active')).toBe(true);
    expect(canTransition('active', 'paused')).toBe(true);
    expect(canTransition('paused', 'active')).toBe(true);
    expect(canTransition('active', 'done')).toBe(true);
  });
  it('ulovlige overganger avvises', () => {
    expect(canTransition('inbox', 'active')).toBe(false);
    expect(canTransition('inbox', 'done')).toBe(false);
    expect(canTransition('done', 'active')).toBe(false);
    expect(canTransition('paused', 'ready')).toBe(false);
  });
});

describe('Valg av neste', () => {
  it('hopper over arkiverte og ikke-innboks, stabil ved like posisjoner', () => {
    const t = [
      { id: 'b', state: 'inbox' as const, position: 1, archived_at: null },
      { id: 'a', state: 'inbox' as const, position: 1, archived_at: null },
      { id: 'c', state: 'inbox' as const, position: 0, archived_at: '2026-01-01' },
      { id: 'd', state: 'done' as const, position: 0, archived_at: null }
    ];
    expect(pickNext(t)?.id).toBe('a');
    expect(pickNext([])).toBeUndefined();
  });
  it('tomme linjer ignoreres', () => {
    expect(parseTasks('\n  a \n\n b\r\n')).toEqual(['a', 'b']);
  });
});

describe('Daglig oversikt', () => {
  it('lokal dato bruker klientens tidssone', () => {
    // 23:30 UTC er neste dag i Norge (UTC+2 om sommeren, offset -120).
    expect(localDate('2026-07-01T23:30:00Z', -120)).toBe('2026-07-02');
    expect(localDate('2026-07-01T23:30:00Z', 0)).toBe('2026-07-01');
  });
  it('teller ferdige og fokusminutter uten press', () => {
    const s = finishSession(session(300), T0 + 300_000);
    const sum = daySummary(
      { tasks: [{ state: 'done', created_at: iso(T0), updated_at: iso(T0 + 300_000) }], sessions: [s] },
      '2026-10-01',
      0,
      T0 + 400_000
    );
    expect(sum).toMatchObject({ done: 1, sessions: 1, focus_minutes: 5, captured: 1 });
    expect(dayMessage({ done: 0, sessions: 0 })).toMatch(/helt greit/);
    expect(dayMessage(sum)).not.toMatch(/streak|rekord|bare/i);
  });
});
