// FELLES KJERNE – lik i alle apper. Rolige, store komponenter.
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { api, ApiFail, OfflineFail, setToken } from './api';
import { flush, listOps, useOnline, useOutbox, removeOp, type QueuedOp } from './outbox';

export interface SessionUser {
  id: string;
  email: string;
}

// ---------- Konto ----------

export function useSession() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    api<{ user: SessionUser }>('GET', '/api/auth/me')
      .then((r) => {
        setUser(r.user);
        try {
          localStorage.setItem('last_user', JSON.stringify(r.user));
        } catch {}
      })
      .catch((e) => {
        if (e instanceof OfflineFail) {
          // Uten nett: bruk sist kjente bruker slik at lokale utkast og køen er tilgjengelig.
          setOffline(true);
          try {
            const last = localStorage.getItem('last_user');
            setUser(last ? JSON.parse(last) : null);
          } catch {
            setUser(null);
          }
        } else setUser(null);
      });
  }, []);
  const logout = async () => {
    try {
      await api('POST', '/api/auth/logout', {});
    } catch {}
    setToken(null);
    try {
      localStorage.removeItem('last_user');
    } catch {}
    setUser(null);
  };
  return { user, setUser, logout, offline };
}

export function AuthScreen({ appName, tagline, onDone }: { appName: string; tagline: string; onDone: (u: SessionUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<ApiFail | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api<{ user: SessionUser; token: string }>('POST', `/api/auth/${mode}`, { email, password });
      setToken(r.token);
      try {
        localStorage.setItem('last_user', JSON.stringify(r.user));
      } catch {}
      onDone(r.user);
    } catch (e) {
      setErr(e as ApiFail);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth">
      <h1>{appName}</h1>
      <p className="lead">{tagline}</p>
      <form onSubmit={submit} className="card stack" noValidate>
        <h2>{mode === 'login' ? 'Logg inn' : 'Lag konto'}</h2>
        <Field label="E-post" error={err?.fields.email}>
          {(id) => <input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
        </Field>
        <Field label="Passord" hint={mode === 'register' ? 'Minst 8 tegn.' : undefined} error={err?.fields.password}>
          {(id) => (
            <input
              id={id}
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
        </Field>
        {err && !Object.keys(err.fields).length && <ErrorBox error={err} />}
        <button className="btn primary" disabled={busy}>
          {mode === 'login' ? 'Logg inn' : 'Lag konto'}
        </button>
        <button type="button" className="btn ghost" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(null); }}>
          {mode === 'login' ? 'Ny her? Lag konto' : 'Har konto? Logg inn'}
        </button>
      </form>
      <p className="muted small">Dataene lagres på serveren du er koblet til. Hver konto ser bare egne data.</p>
    </main>
  );
}

// ---------- Synkronisering ----------

async function sendQueued(op: QueuedOp) {
  try {
    await api(op.method, op.path, op.body, { opId: op.opId });
    return 'ok' as const;
  } catch (e) {
    if (e instanceof OfflineFail) return 'offline' as const;
    const f = e as ApiFail;
    if (f.status === 409) return { conflict: f.message };
    return { rejected: f.message };
  }
}

/** Synkroniserer køen når nettet kommer tilbake og hvert 20. sekund. */
export function useSync(onSynced: () => void) {
  const online = useOnline();
  const ops = useOutbox();
  const pending = ops.filter((o) => o.status === 'venter').length;
  const run = useCallback(async () => {
    const n = (await listOps()).length;
    await flush(sendQueued);
    const after = (await listOps()).length;
    if (after !== n) onSynced();
  }, [onSynced]);
  useEffect(() => {
    if (online) run();
    const t = setInterval(() => navigator.onLine && run(), 20_000);
    return () => clearInterval(t);
  }, [online, run]);
  return { online, ops, pending, syncNow: run };
}

export function SyncBadge({ online, pending, conflicts }: { online: boolean; pending: number; conflicts: number }) {
  let text = 'Synkronisert';
  let cls = 'ok';
  if (conflicts > 0) {
    text = `${conflicts} konflikt${conflicts > 1 ? 'er' : ''}`;
    cls = 'warn';
  } else if (pending > 0) {
    text = `${pending} venter på nett`;
    cls = 'wait';
  } else if (!online) {
    text = 'Frakoblet';
    cls = 'wait';
  }
  return (
    <span className={`badge ${cls}`} role="status" aria-live="polite">
      {text}
    </span>
  );
}

export function SyncPanel({ ops, onRetry }: { ops: QueuedOp[]; onRetry: () => void }) {
  if (ops.length === 0) return null;
  return (
    <section className="card stack sync-panel" aria-label="Ikke synkronisert">
      <h2>Ikke synkronisert ennå</h2>
      <p className="muted small">Disse endringene ligger bare på denne enheten til de er sendt.</p>
      <ul className="list">
        {ops.map((o) => (
          <li key={o.opId} className="row">
            <div className="grow">
              <strong>{o.label}</strong>
              <div className="small muted">
                {o.status === 'venter' ? 'Venter på nett' : o.status === 'konflikt' ? `Konflikt: ${o.error}` : `Avvist: ${o.error}`}
              </div>
            </div>
            {o.status !== 'venter' && (
              <button className="btn small" onClick={() => removeOp(o.opId)}>
                Forkast
              </button>
            )}
          </li>
        ))}
      </ul>
      <button className="btn" onClick={onRetry}>
        Prøv å synkronisere nå
      </button>
    </section>
  );
}

// ---------- Skall ----------

export function Shell({
  appName,
  user,
  onLogout,
  sync,
  tabs,
  tab,
  onTab,
  children
}: {
  appName: string;
  user: SessionUser;
  onLogout: () => void;
  sync: { online: boolean; pending: number; conflicts: number };
  tabs: { id: string; label: string }[];
  tab: string;
  onTab: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <header className="top">
        <div className="brand">{appName}</div>
        <SyncBadge {...sync} />
        <details className="account">
          <summary aria-label="Konto">{user.email.slice(0, 1).toUpperCase()}</summary>
          <div className="menu card">
            <div className="small muted">Innlogget som</div>
            <div className="small">{user.email}</div>
            <button className="btn small" onClick={onLogout}>
              Logg ut
            </button>
          </div>
        </details>
      </header>
      <main className="content">{children}</main>
      <nav className="tabs" aria-label="Hovedmeny">
        {tabs.map((t) => (
          <button key={t.id} className={t.id === tab ? 'tab active' : 'tab'} aria-current={t.id === tab ? 'page' : undefined} onClick={() => onTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ---------- Skjema ----------

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && (
        <div className="error-text" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export function ErrorBox({ error, onReload }: { error: ApiFail | Error | null; onReload?: () => void }) {
  if (!error) return null;
  const f = error instanceof ApiFail ? error : null;
  return (
    <div className={f?.code === 'konflikt' ? 'notice warn' : 'notice error'} role="alert">
      <p>{error.message}</p>
      {f?.code === 'konflikt' && onReload && (
        <button className="btn" onClick={onReload}>
          Hent ny versjon
        </button>
      )}
    </div>
  );
}

/** To-trinns bekreftelse for sletting. */
export function ConfirmButton({ label, confirmLabel, onConfirm, className }: { label: string; confirmLabel: string; onConfirm: () => void; className?: string }) {
  const [asking, setAsking] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (asking) ref.current?.focus();
  }, [asking]);
  if (!asking)
    return (
      <button className={className ?? 'btn danger'} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  return (
    <span className="confirm" role="group" aria-label="Bekreft">
      <button ref={ref} className="btn danger" onClick={() => { setAsking(false); onConfirm(); }}>
        {confirmLabel}
      </button>
      <button className="btn" onClick={() => setAsking(false)}>
        Avbryt
      </button>
    </span>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}

/** Utkast som overlever reload og manglende nett (localStorage). */
export function useDraft<T>(key: string, initial: T): [T, (v: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`draft:${key}`);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(`draft:${key}`, JSON.stringify(v));
    } catch {}
  };
  const clear = () => {
    setValue(initial);
    try {
      localStorage.removeItem(`draft:${key}`);
    } catch {}
  };
  return [value, set, clear];
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '–';
  return new Date(iso).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' });
}
