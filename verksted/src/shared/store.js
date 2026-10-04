import { useEffect, useRef, useState } from 'react';

// localStorage-hook. Hver app får sitt eget prefiks så de ikke tråkker på hverandre.
export function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
export function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function useStore(key, initial) {
  const [value, setValue] = useState(() => safeGet(key, typeof initial === 'function' ? initial() : initial));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    safeSet(key, value);
  }, [key, value]);
  return [value, setValue];
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Alle nøkler som starter med prefiks – brukes til backup.
export function dumpPrefix(prefix) {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(prefix)) out[k] = safeGet(k, null);
    }
  } catch { /* privat modus */ }
  return out;
}
export function restorePrefix(prefix, data) {
  for (const [k, v] of Object.entries(data || {})) if (k.startsWith(prefix)) safeSet(k, v);
}
