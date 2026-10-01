// FELLES KJERNE – lik i alle apper.
// Offline-kø i IndexedDB. Dette er lokal lagring på enheten, ikke sky-backup.
import { useEffect, useState } from 'react';

export interface QueuedOp {
  opId: string;
  method: string;
  path: string;
  body: unknown;
  label: string;
  createdAt: string;
  status: 'venter' | 'konflikt' | 'avvist';
  error?: string;
}

const DB_NAME = 'offline';
const STORE = 'outbox';
const KV = 'kv';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'opId' });
      req.result.createObjectStore(KV);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(name: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openIdb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(name, mode);
    const r = fn(t.objectStore(name));
    t.oncomplete = () => resolve(r.result);
    t.onerror = () => reject(t.error);
  });
}

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export async function listOps(): Promise<QueuedOp[]> {
  try {
    const all = await withStore<QueuedOp[]>(STORE, 'readonly', (s) => s.getAll() as IDBRequest<QueuedOp[]>);
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

export async function enqueue(op: Omit<QueuedOp, 'createdAt' | 'status'>): Promise<QueuedOp> {
  const full: QueuedOp = { ...op, createdAt: new Date().toISOString(), status: 'venter' };
  await withStore(STORE, 'readwrite', (s) => s.put(full));
  notify();
  return full;
}

export async function removeOp(opId: string) {
  await withStore(STORE, 'readwrite', (s) => s.delete(opId));
  notify();
}

async function updateOp(op: QueuedOp) {
  await withStore(STORE, 'readwrite', (s) => s.put(op));
  notify();
}

/** Enkel nøkkel/verdi-lagring for utkast og siste kjente data (lesing uten nett). */
export async function kvGet<T>(key: string): Promise<T | undefined> {
  try {
    return await withStore<T>(KV, 'readonly', (s) => s.get(key) as IDBRequest<T>);
  } catch {
    return undefined;
  }
}
export async function kvSet(key: string, value: unknown) {
  try {
    await withStore(KV, 'readwrite', (s) => s.put(value, key));
  } catch {
    /* lagring utilgjengelig – appen virker fortsatt med nett */
  }
}

let flushing = false;
/**
 * Sender køede operasjoner i rekkefølge med samme operasjons-id.
 * Stopper ved første nettverksfeil. Konflikt og avvisning blir stående synlig.
 */
export async function flush(send: (op: QueuedOp) => Promise<'ok' | 'offline' | { conflict: string } | { rejected: string }>) {
  if (flushing) return;
  flushing = true;
  try {
    for (const op of await listOps()) {
      if (op.status !== 'venter') continue;
      const r = await send(op);
      if (r === 'offline') break;
      if (r === 'ok') await removeOp(op.opId);
      else if ('conflict' in r) await updateOp({ ...op, status: 'konflikt', error: r.conflict });
      else await updateOp({ ...op, status: 'avvist', error: r.rejected });
    }
  } finally {
    flushing = false;
  }
}

export function useOutbox(): QueuedOp[] {
  const [ops, setOps] = useState<QueuedOp[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => listOps().then((o) => alive && setOps(o));
    listeners.add(load);
    load();
    return () => {
      alive = false;
      listeners.delete(load);
    };
  }, []);
  return ops;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
