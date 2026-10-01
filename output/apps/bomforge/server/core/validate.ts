// FELLES KJERNE – lik i alle apper. Endre bare via felles mal.
import { ApiError } from './http.js';

type Opts = { label: string; required?: boolean };

/**
 * Samler feltfeil og kaster én 400 med alle feil. Ingen delvis lagring:
 * kall done() før noe skrives til databasen.
 */
export class Validator {
  errors: Record<string, string> = {};
  constructor(private body: any) {
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiError(400, 'ugyldig', 'Forventet et JSON-objekt.');
    }
  }

  fail(key: string, msg: string) {
    if (!this.errors[key]) this.errors[key] = msg;
  }

  private raw(key: string) {
    const v = this.body[key];
    return v === undefined || v === null || v === '' ? undefined : v;
  }

  has(key: string) {
    return key in this.body;
  }

  text(key: string, o: Opts & { max?: number; min?: number; trim?: boolean }): string | undefined {
    const v = this.raw(key);
    const required = o.required ?? true;
    if (v === undefined) {
      if (required) this.fail(key, `${o.label} mangler.`);
      return undefined;
    }
    if (typeof v !== 'string') return this.fail(key, `${o.label} må være tekst.`), undefined;
    const s = o.trim === false ? v : v.trim();
    if (required && s.length === 0) return this.fail(key, `${o.label} mangler.`), undefined;
    if (s.length > (o.max ?? 2000)) return this.fail(key, `${o.label} kan ha maks ${o.max ?? 2000} tegn.`), undefined;
    if (o.min && s.length < o.min) return this.fail(key, `${o.label} må ha minst ${o.min} tegn.`), undefined;
    return s.length === 0 ? undefined : s;
  }

  num(key: string, o: Opts & { min: number; max: number; integer?: boolean }): number | undefined {
    const v = this.raw(key);
    const required = o.required ?? true;
    if (v === undefined) {
      if (required) this.fail(key, `${o.label} mangler.`);
      return undefined;
    }
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(',', '.')) : NaN;
    if (!Number.isFinite(n)) return this.fail(key, `${o.label} må være et tall.`), undefined;
    if (o.integer && !Number.isInteger(n)) return this.fail(key, `${o.label} må være et heltall.`), undefined;
    if (n < o.min || n > o.max)
      return this.fail(key, `${o.label} må være mellom ${o.min} og ${o.max}.`), undefined;
    return n;
  }

  int(key: string, o: Opts & { min: number; max: number }) {
    return this.num(key, { ...o, integer: true });
  }

  date(key: string, o: Opts): string | undefined {
    const v = this.text(key, { ...o, max: 10 });
    if (v === undefined) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return this.fail(key, `${o.label} må ha formatet ÅÅÅÅ-MM-DD.`), undefined;
    const d = new Date(v + 'T00:00:00Z');
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v)
      return this.fail(key, `${o.label} er ikke en gyldig dato.`), undefined;
    return v;
  }

  time(key: string, o: Opts): string | undefined {
    const v = this.text(key, { ...o, max: 5 });
    if (v === undefined) return undefined;
    const m = /^(\d{2}):(\d{2})$/.exec(v);
    if (!m || Number(m[1]) > 23 || Number(m[2]) > 59)
      return this.fail(key, `${o.label} må være et klokkeslett TT:MM.`), undefined;
    return v;
  }

  oneOf<T extends string>(key: string, values: readonly T[], o: Opts): T | undefined {
    const v = this.text(key, o);
    if (v === undefined) return undefined;
    if (!values.includes(v as T)) return this.fail(key, `${o.label} må være en av: ${values.join(', ')}.`), undefined;
    return v as T;
  }

  url(key: string, o: Opts): string | undefined {
    const v = this.text(key, { ...o, max: 2000 });
    if (v === undefined) return undefined;
    try {
      const u = new URL(v);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
      return u.toString();
    } catch {
      return this.fail(key, `${o.label} må være en gyldig nettadresse (https://…).`), undefined;
    }
  }

  bool(key: string, o: Opts): boolean | undefined {
    const v = this.body[key];
    if (v === undefined || v === null) {
      if (o.required ?? true) this.fail(key, `${o.label} mangler.`);
      return undefined;
    }
    if (typeof v !== 'boolean') return this.fail(key, `${o.label} må være ja/nei.`), undefined;
    return v;
  }

  /** Ikke-tomme linjer fra en tekstblokk. */
  lines(key: string, o: Opts & { maxLines: number; maxLength?: number }): string[] | undefined {
    const v = this.text(key, { ...o, max: o.maxLines * ((o.maxLength ?? 200) + 2) });
    if (v === undefined) return undefined;
    const lines = v
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return this.fail(key, `${o.label} mangler.`), undefined;
    if (lines.length > o.maxLines) return this.fail(key, `${o.label}: maks ${o.maxLines} linjer.`), undefined;
    const long = lines.findIndex((l) => l.length > (o.maxLength ?? 200));
    if (long >= 0) return this.fail(key, `${o.label}: linje ${long + 1} er for lang.`), undefined;
    return lines;
  }

  revision(): number {
    const r = this.body.revision;
    if (!Number.isInteger(r) || r < 1) {
      this.fail('revision', 'Revisjon mangler. Last inn siden på nytt.');
      return 0;
    }
    return r;
  }

  done() {
    if (Object.keys(this.errors).length > 0) {
      throw new ApiError(400, 'ugyldig', 'Noen felt må rettes før lagring.', { fields: this.errors });
    }
  }
}

export function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
