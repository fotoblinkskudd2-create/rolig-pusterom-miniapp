'use strict';
// Varsellys MVP-server. Kun Node-stdlib. Data i data/db.json.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { evaluate, DEFAULT_RULES, describe } = require('./engine');

const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.json');
const PUBLIC = path.join(__dirname, 'public');

// ---------- lagring ----------
function load() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: {}, sessions: {} }; }
}
let db = load();
function save() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// ---------- auth ----------
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const token = () => crypto.randomBytes(24).toString('base64url');

function newUser(email, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    email, salt, pw: hash(password, salt), created: new Date().toISOString(),
    checkins: [], rules: DEFAULT_RULES.map(r => ({ ...r })),
    plan: { yellow: '', red: '', contactName: '', contactPhone: '' },
    shareToken: null
  };
}

function userFromReq(req) {
  const m = /(?:^|;\s*)vl=([^;]+)/.exec(req.headers.cookie || '');
  const s = m && db.sessions[m[1]];
  return s ? db.users[s.email] : null;
}

// ---------- http-hjelpere ----------
function send(res, status, body, headers = {}) {
  const isObj = typeof body === 'object';
  res.writeHead(status, {
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff', ...headers
  });
  res.end(isObj ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 1e5) { reject(new Error('for stor')); req.destroy(); } });
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch { reject(new Error('ugyldig JSON')); } });
  });
}
const cookie = (t, maxAge) => `vl=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}`;

function status(u) {
  const r = evaluate(u.checkins, u.rules);
  const planText = r.level === 'red' ? u.plan.red : r.level === 'yellow' ? u.plan.yellow : '';
  return { ...r, plan: planText, contactName: u.plan.contactName, contactPhone: u.plan.contactPhone };
}

function validCheckin(c) {
  return /^\d{4}-\d{2}-\d{2}$/.test(c.date) && !isNaN(Date.parse(c.date)) &&
    typeof c.sleep === 'number' && c.sleep >= 0 && c.sleep <= 24 &&
    Number.isInteger(c.mood) && c.mood >= -3 && c.mood <= 3 &&
    Number.isInteger(c.energy) && c.energy >= 1 && c.energy <= 5 &&
    typeof c.meds === 'boolean';
}

// ---------- ruter ----------
async function api(req, res, url) {
  const p = url.pathname, m = req.method;

  if (m === 'POST' && (p === '/api/register' || p === '/api/login')) {
    const { email = '', password = '' } = await readBody(req);
    const e = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e) || String(password).length < 8)
      return send(res, 400, { error: 'Gyldig e-post og passord på minst 8 tegn.' });
    if (p === '/api/register') {
      if (db.users[e]) return send(res, 409, { error: 'E-posten er allerede registrert.' });
      db.users[e] = newUser(e, password);
    } else {
      const u = db.users[e];
      if (!u || !crypto.timingSafeEqual(Buffer.from(hash(password, u.salt), 'hex'), Buffer.from(u.pw, 'hex')))
        return send(res, 401, { error: 'Feil e-post eller passord.' });
    }
    const t = token();
    db.sessions[t] = { email: e, created: Date.now() };
    save();
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie(t, 60 * 60 * 24 * 30) });
  }

  // Delt lenke for tillitsperson: kun farge, aldri rådata.
  if (m === 'GET' && p.startsWith('/api/share/')) {
    const t = p.slice('/api/share/'.length);
    const u = Object.values(db.users).find(x => x.shareToken && x.shareToken === t);
    if (!u) return send(res, 404, { error: 'Lenken finnes ikke eller er trukket tilbake.' });
    const last = u.checkins.map(c => c.date).sort().pop() || null;
    return send(res, 200, { level: evaluate(u.checkins, u.rules).level, lastCheckin: last });
  }

  const u = userFromReq(req);
  if (!u) return send(res, 401, { error: 'Ikke innlogget.' });

  if (m === 'POST' && p === '/api/logout') {
    const t = /(?:^|;\s*)vl=([^;]+)/.exec(req.headers.cookie || '')[1];
    delete db.sessions[t]; save();
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
  }
  if (m === 'GET' && p === '/api/me') {
    return send(res, 200, {
      email: u.email, plan: u.plan, shareToken: u.shareToken,
      rules: u.rules.map(r => ({ ...r, text: describe(r) })),
      checkins: [...u.checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
      status: status(u)
    });
  }
  if (m === 'POST' && p === '/api/checkins') {
    const b = await readBody(req);
    const c = { date: b.date, sleep: Number(b.sleep), mood: Number(b.mood), energy: Number(b.energy),
      meds: b.meds === true, note: String(b.note || '').slice(0, 500) };
    if (!validCheckin(c)) return send(res, 400, { error: 'Ugyldig innsjekk.' });
    u.checkins = u.checkins.filter(x => x.date !== c.date).concat(c); // én per dag, siste vinner
    save();
    return send(res, 200, { ok: true, status: status(u) });
  }
  if (m === 'PUT' && p === '/api/plan') {
    const b = await readBody(req);
    for (const k of ['yellow', 'red', 'contactName', 'contactPhone']) u.plan[k] = String(b[k] || '').slice(0, 2000);
    save();
    return send(res, 200, { ok: true });
  }
  if (m === 'PUT' && p === '/api/rules') {
    const b = await readBody(req);
    const byId = Object.fromEntries((b.rules || []).map(r => [r.id, r]));
    u.rules = u.rules.map(r => {
      const n = byId[r.id]; if (!n) return r;
      const out = { ...r, on: !!n.on };
      for (const k of ['nights', 'hours', 'days', 'threshold', 'energy', 'maxSleep'])
        if (k in r && Number.isFinite(Number(n[k]))) out[k] = Number(n[k]);
      if (['yellow', 'red'].includes(n.level)) out.level = n.level;
      return out;
    });
    save();
    return send(res, 200, { ok: true, status: status(u) });
  }
  if (m === 'POST' && p === '/api/share') {
    u.shareToken = token(); save();
    return send(res, 200, { shareToken: u.shareToken });
  }
  if (m === 'DELETE' && p === '/api/share') {
    u.shareToken = null; save();
    return send(res, 200, { ok: true });
  }
  if (m === 'GET' && p === '/api/export') {
    const rows = [['dato', 'søvn_t', 'humør', 'energi', 'medisin', 'notat']]
      .concat([...u.checkins].sort((a, b) => a.date.localeCompare(b.date)).slice(-90)
        .map(c => [c.date, c.sleep, c.mood, c.energy, c.meds ? 'ja' : 'nei', `"${(c.note || '').replace(/"/g, '""')}"`]));
    return send(res, 200, rows.map(r => r.join(';')).join('\n'), {
      'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="varsellys-90-dager.csv"' });
  }
  if (m === 'DELETE' && p === '/api/account') {
    delete db.users[u.email];
    for (const [t, s] of Object.entries(db.sessions)) if (s.email === u.email) delete db.sessions[t];
    save();
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
  }
  return send(res, 404, { error: 'Ukjent rute.' });
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function serveStatic(req, res, url) {
  let p = url.pathname === '/' || url.pathname.startsWith('/s/') ? '/index.html' : url.pathname;
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'Nei.');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Ikke funnet.');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    send(res, 400, { error: e.message });
  }
});

if (require.main === module) server.listen(PORT, () => console.log(`Varsellys kjører på http://localhost:${PORT}`));
module.exports = server;
