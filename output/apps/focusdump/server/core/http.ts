// FELLES KJERNE – lik i alle apper. Endre bare via felles mal.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import type { Db } from './db.js';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export interface User {
  id: string;
  email: string;
}

export interface Ctx {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
  headers: IncomingMessage['headers'];
  user: User;
  db: Db;
}

export interface Download {
  download: { filename: string; contentType: string; body: string };
}

export type Handler = (ctx: Ctx) => unknown;

interface Route {
  method: string;
  re: RegExp;
  keys: string[];
  handler: Handler;
  auth: boolean;
}

export class Router {
  routes: Route[] = [];

  add(method: string, path: string, handler: Handler, opts: { auth?: boolean } = {}) {
    const keys: string[] = [];
    const re = new RegExp(
      '^' +
        path.replace(/:([a-zA-Z_]+)/g, (_, k) => {
          keys.push(k);
          return '([^/]+)';
        }) +
        '$'
    );
    this.routes.push({ method, re, keys, handler, auth: opts.auth ?? true });
  }
  get(p: string, h: Handler, o?: { auth?: boolean }) { this.add('GET', p, h, o); }
  post(p: string, h: Handler, o?: { auth?: boolean }) { this.add('POST', p, h, o); }
  patch(p: string, h: Handler, o?: { auth?: boolean }) { this.add('PATCH', p, h, o); }
  put(p: string, h: Handler, o?: { auth?: boolean }) { this.add('PUT', p, h, o); }
  delete(p: string, h: Handler, o?: { auth?: boolean }) { this.add('DELETE', p, h, o); }

  match(method: string, path: string) {
    let pathMatched = false;
    for (const r of this.routes) {
      const m = r.re.exec(path);
      if (!m) continue;
      pathMatched = true;
      if (r.method !== method) continue;
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route: r, params };
    }
    return pathMatched ? 'method' : null;
  }
}

export const MAX_BODY = 256 * 1024;

export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new ApiError(413, 'for_stor', 'Forespørselen er for stor (maks 256 kB).'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
};

export function sendJson(res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS,
    ...extra
  });
  res.end(text);
}

export function sendDownload(res: ServerResponse, d: Download['download']) {
  res.writeHead(200, {
    'Content-Type': d.contentType,
    'Content-Disposition': `attachment; filename="${d.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS
  });
  res.end(d.body);
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

/** Serverer bygget frontend (dist/) med SPA-fallback. */
export function serveStatic(res: ServerResponse, distDir: string, urlPath: string): boolean {
  if (!existsSync(distDir)) return false;
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let file = join(distDir, safe);
  if (!file.startsWith(distDir)) return false;
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(distDir, 'index.html');
  if (!existsSync(file)) return false;
  const ext = extname(file);
  const immutable = file.includes(`${join(distDir, 'assets')}`);
  res.writeHead(200, {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    ...SECURITY_HEADERS
  });
  res.end(readFileSync(file));
  return true;
}
