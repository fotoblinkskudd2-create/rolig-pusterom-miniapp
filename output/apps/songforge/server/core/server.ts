// FELLES KJERNE – lik i alle apper. Endre bare via felles mal.
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { openDb, tx, now, type Db, type Migration, type Row } from './db.js';
import { ApiError, Router, readBody, sendJson, sendDownload, serveStatic, type Ctx } from './http.js';
import { registerAuthRoutes, userFromRequest, sessionCookie } from './auth.js';

export interface AppDef {
  id: string;
  name: string;
  version: string;
  migrations: Migration[];
  routes: (r: Router) => void;
}

export interface AppOptions {
  dbPath: string;
  distDir?: string;
  secureCookies?: boolean;
  log?: boolean;
  /** Opphav som får kalle API-et fra en annen origin, f.eks. capacitor://localhost (native iOS). */
  allowedOrigins?: string[];
}

export interface RunningApp {
  server: Server;
  db: Db;
  url: string;
  close: () => Promise<void>;
}

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export function buildApp(def: AppDef, opts: AppOptions) {
  const db = openDb(opts.dbPath, def.migrations);
  const router = new Router();
  router.get('/api/health', () => ({ ok: true, app: def.id, version: def.version, time: now() }), { auth: false });
  registerAuthRoutes(router);
  def.routes(router);

  const server = createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? '/', 'http://localhost');
    const method = req.method ?? 'GET';
    const origin = req.headers.origin;
    if (origin && opts.allowedOrigins?.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
      if (method === 'OPTIONS') {
        res.writeHead(204).end();
        return;
      }
    }
    try {
      if (!url.pathname.startsWith('/api/')) {
        if (method === 'GET' && opts.distDir && serveStatic(res, opts.distDir, url.pathname)) return;
        throw new ApiError(404, 'finnes_ikke', 'Siden finnes ikke.');
      }
      const match = router.match(method, url.pathname);
      if (match === null) throw new ApiError(404, 'finnes_ikke', 'Ukjent API-adresse.');
      if (match === 'method') throw new ApiError(405, 'metode', 'Metoden er ikke tillatt her.');

      let body: any = {};
      if (MUTATING.has(method)) {
        const ct = req.headers['content-type'] ?? '';
        const raw = await readBody(req);
        if (raw.length > 0) {
          if (!ct.includes('application/json'))
            throw new ApiError(415, 'innholdstype', 'Bruk Content-Type: application/json.');
          try {
            body = JSON.parse(raw);
          } catch {
            throw new ApiError(400, 'ugyldig_json', 'Forespørselen er ikke gyldig JSON.');
          }
        }
      }

      const user = userFromRequest(db, req);
      if (match.route.auth && !user) throw new ApiError(401, 'ikke_innlogget', 'Logg inn for å fortsette.');

      const ctx: Ctx = {
        method,
        path: url.pathname,
        params: match.params,
        query: url.searchParams,
        body,
        headers: req.headers,
        user: user!,
        db
      };

      const opId = req.headers['idempotency-key'];
      let status = 200;
      let result: any;
      if (MUTATING.has(method) && user && typeof opId === 'string' && opId.length > 0) {
        if (opId.length > 100) throw new ApiError(400, 'ugyldig', 'Operasjons-id er for lang.');
        // Operasjons-id gjør retry trygt: samme id gir samme svar, ingen dobbel post.
        const replay = tx(db, () => {
          const prev = db
            .prepare('SELECT status, response FROM op_log WHERE owner_id = ? AND op_id = ?')
            .get(user.id, opId) as Row | undefined;
          if (prev) return { status: Number(prev.status), body: JSON.parse(String(prev.response)), replay: true };
          const r = run(match.route.handler, ctx);
          db.prepare(
            'INSERT INTO op_log (owner_id, op_id, method, path, status, response, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).run(user.id, opId, method, url.pathname, r.status, JSON.stringify(r.body), now());
          return { ...r, replay: false };
        });
        status = replay.status;
        result = replay.body;
        if (replay.replay) res.setHeader('Idempotent-Replay', 'true');
      } else if (MUTATING.has(method)) {
        const r = tx(db, () => run(match.route.handler, ctx));
        status = r.status;
        result = r.body;
      } else {
        const r = run(match.route.handler, ctx);
        status = r.status;
        result = r.body;
      }

      if (result && typeof result === 'object' && 'download' in result) {
        sendDownload(res, result.download);
        return;
      }
      const extra: Record<string, string> = {};
      if (result && typeof result === 'object' && '__cookie' in result) {
        extra['Set-Cookie'] = result.__cookie
          ? sessionCookie(result.__cookie, !!opts.secureCookies)
          : 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0';
        delete result.__cookie;
      }
      sendJson(res, status, result, extra);
    } catch (err) {
      if (err instanceof ApiError) {
        sendJson(res, err.status, { error: { code: err.code, message: err.message, details: err.details } });
      } else {
        console.error(err);
        sendJson(res, 500, { error: { code: 'serverfeil', message: 'Uventet feil på serveren. Prøv igjen.' } });
      }
    } finally {
      if (opts.log) console.log(`${method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
    }
  });

  return { server, db, router };
}

function run(handler: (c: Ctx) => unknown, ctx: Ctx): { status: number; body: any } {
  const out = handler(ctx) as any;
  if (out instanceof Promise) throw new Error('Handlere må være synkrone (SQLite-transaksjon).');
  let status = 200;
  if (out && typeof out === 'object' && '__status' in out) {
    status = out.__status;
    delete out.__status;
  }
  return { status, body: out };
}

export function startApp(def: AppDef, opts: AppOptions & { port: number; host?: string }): Promise<RunningApp> {
  const { server, db } = buildApp(def, opts);
  return new Promise((resolve) => {
    server.listen(opts.port, opts.host ?? '127.0.0.1', () => {
      const addr = server.address() as AddressInfo;
      resolve({
        server,
        db,
        url: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise<void>((r) => {
            server.closeAllConnections();
            server.close(() => {
              db.close();
              r();
            });
          })
      });
    });
  });
}

/** Felles eksportkonvolutt: versjon, tidspunkt og dokumenterte felter. */
export function exportEnvelope<T>(def: Pick<AppDef, 'id' | 'version'>, fields: Record<string, string>, data: T) {
  return {
    format: `${def.id}-eksport`,
    format_version: 1,
    app_version: def.version,
    exported_at: now(),
    fields,
    data
  };
}
