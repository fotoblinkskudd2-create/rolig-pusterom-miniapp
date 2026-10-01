// FELLES KJERNE – lik i alle apper.
// API-klient med konkrete feil, operasjons-id og offline-kø.
import { enqueue, type QueuedOp } from './outbox';

export class ApiFail extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
  get fields(): Record<string, string> {
    return this.details?.fields ?? {};
  }
}

/** Nettverket eller serveren svarer ikke. */
export class OfflineFail extends ApiFail {
  constructor() {
    super(0, 'frakoblet', 'Får ikke kontakt med serveren. Sjekk nettet og prøv igjen.');
  }
}

const isNative = () => !!(window as any).Capacitor?.isNativePlatform?.();
/** I native app: backend-adresse fra build-variabel. På web: samme opphav. */
export const API_BASE: string = isNative() ? (import.meta.env.VITE_API_BASE ?? '') : '';

const TOKEN_KEY = 'auth_token';
export function setToken(t: string | null) {
  // Token lagres bare i native app (cookies på tvers av opphav er upålitelig der).
  if (!isNative()) return;
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ingen lagring tilgjengelig */
  }
}
function getToken(): string | null {
  if (!isNative()) return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function newOpId(): string {
  return crypto.randomUUID();
}

export async function api<T = any>(
  method: string,
  path: string,
  body?: unknown,
  opts: { opId?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.opId) headers['Idempotency-Key'] = opts.opId;
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      credentials: 'same-origin',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new OfflineFail();
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) throw new OfflineFail();
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiFail(res.status, 'ugyldig_svar', 'Serveren svarte med noe uventet.');
  }
  if (!res.ok) {
    const e = json?.error ?? {};
    throw new ApiFail(res.status, e.code ?? 'ukjent', e.message ?? `Feil ${res.status}`, e.details);
  }
  return json as T;
}

/**
 * Muterende kall som legges i offline-køen hvis serveren ikke svarer.
 * Samme operasjons-id brukes ved senere synkronisering, så posten aldri dobles.
 * Returnerer { queued: true } når handlingen ble lagt i kø.
 */
export async function mutate<T = any>(
  method: string,
  path: string,
  body: unknown,
  label: string
): Promise<{ queued: false; data: T } | { queued: true; op: QueuedOp }> {
  const opId = newOpId();
  try {
    const data = await api<T>(method, path, body, { opId });
    return { queued: false, data };
  } catch (e) {
    if (e instanceof OfflineFail) {
      const op = await enqueue({ opId, method, path, body, label });
      return { queued: true, op };
    }
    throw e;
  }
}

export function downloadUrl(path: string) {
  return API_BASE + path;
}
