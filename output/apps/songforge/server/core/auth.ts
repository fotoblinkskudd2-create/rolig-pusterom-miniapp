// FELLES KJERNE – lik i alle apper. Endre bare via felles mal.
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { ApiError, type Router, type User } from './http.js';
import { type Db, type Row, now, newId } from './db.js';
import { Validator } from './validate.js';

const SESSION_DAYS = 30;
const failures = new Map<string, { count: number; until: number }>();

function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(pw: string, stored: string): boolean {
  const [, saltHex, hashHex] = stored.split('$');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(pw, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

export function createSession(db: Db, userId: string): string {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    sha256(token),
    userId,
    now(),
    expires
  );
  return token;
}

export function tokenFromRequest(req: IncomingMessage): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
  const cookie = req.headers.cookie ?? '';
  const m = /(?:^|;\s*)sid=([a-f0-9]{64})/.exec(cookie);
  return m ? m[1] : null;
}

export function userFromRequest(db: Db, req: IncomingMessage): User | null {
  const token = tokenFromRequest(req);
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .get(sha256(token), now()) as Row | undefined;
  return row ? { id: String(row.id), email: String(row.email) } : null;
}

export function sessionCookie(token: string, secure: boolean): string {
  return `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure ? '; Secure' : ''}`;
}

function credentials(body: any) {
  const v = new Validator(body);
  const email = v.text('email', { label: 'E-post', max: 200 });
  const password = v.text('password', { label: 'Passord', max: 200, trim: false });
  if (email && !/^[^\s@]+@[^\s@]+$/.test(email)) v.fail('email', 'Skriv en gyldig e-postadresse.');
  if (password && password.length < 8) v.fail('password', 'Passordet må ha minst 8 tegn.');
  v.done();
  return { email: email!.toLowerCase(), password: password! };
}

/** Registrerer konto-endepunkter. Returnerer Set-Cookie via spesialfelt __cookie. */
export function registerAuthRoutes(router: Router) {
  router.post(
    '/api/auth/register',
    (ctx) => {
      const { email, password } = credentials(ctx.body);
      const exists = ctx.db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
      if (exists) throw new ApiError(409, 'finnes', 'Det finnes allerede en konto med denne e-posten.');
      const id = newId();
      ctx.db
        .prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
        .run(id, email, hashPassword(password), now());
      const token = createSession(ctx.db, id);
      return { __status: 201, __cookie: token, user: { id, email }, token };
    },
    { auth: false }
  );

  router.post(
    '/api/auth/login',
    (ctx) => {
      const { email, password } = credentials(ctx.body);
      const f = failures.get(email);
      if (f && f.count >= 10 && f.until > Date.now())
        throw new ApiError(429, 'for_mange', 'For mange forsøk. Vent 15 minutter.');
      const row = ctx.db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email) as
        | Row
        | undefined;
      if (!row || !verifyPassword(password, String(row.password_hash))) {
        const cur = failures.get(email) ?? { count: 0, until: 0 };
        failures.set(email, { count: cur.count + 1, until: Date.now() + 15 * 60_000 });
        throw new ApiError(401, 'feil_innlogging', 'Feil e-post eller passord.');
      }
      failures.delete(email);
      const token = createSession(ctx.db, String(row.id));
      return { __cookie: token, user: { id: row.id, email: row.email }, token };
    },
    { auth: false }
  );

  router.post('/api/auth/logout', (ctx) => {
    const token = ctx.headers.authorization?.startsWith('Bearer ')
      ? ctx.headers.authorization.slice(7)
      : /(?:^|;\s*)sid=([a-f0-9]{64})/.exec(ctx.headers.cookie ?? '')?.[1];
    if (token) ctx.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    return { __cookie: '', ok: true };
  });

  router.get('/api/auth/me', (ctx) => ({ user: ctx.user }));
}
