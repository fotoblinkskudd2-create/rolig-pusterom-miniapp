const nok = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 });
const nok2 = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const kr = (n) => nok.format(Math.round(Number(n) || 0));
export const kr2 = (n) => nok2.format(Number(n) || 0);
export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export const DAY = 86400000;
export const today = () => new Date(new Date().toDateString());
export const isoDate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(d).toLocaleDateString('nb-NO', opts);
export const fmtTime = (d) => new Date(d).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
export const daysBetween = (a, b) => Math.round((new Date(new Date(b).toDateString()) - new Date(new Date(a).toDateString())) / DAY);
export const addMonths = (d, n) => {
  const x = new Date(d); const day = x.getDate();
  x.setDate(1); x.setMonth(x.getMonth() + n);
  x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return x;
};
export function relDays(n) {
  if (n === 0) return 'i dag';
  if (n === 1) return 'i morgen';
  if (n === -1) return 'i går';
  if (n > 0) return `om ${n} dager`;
  return `for ${-n} dager siden`;
}
export function duration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (h) return `${h}t ${String(m).padStart(2, '0')}m`;
  if (m) return `${m}m ${String(r).padStart(2, '0')}s`;
  return `${r}s`;
}

// Deling: Web Share med fil hvis mulig (iOS), ellers vanlig nedlasting.
export async function shareOrDownload(filename, content, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  try {
    const file = new File([blob], filename, { type });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return 'shared';
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'aborted';
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const t = Object.assign(document.createElement('textarea'), { value: text });
    document.body.appendChild(t); t.select();
    const ok = document.execCommand('copy'); t.remove(); return ok;
  }
}

// iOS-PWA-er har upålitelig push. Kalenderfiler har det ikke: .ics med alarm = påminnelse som faktisk kommer.
const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);
const icsDate = (d) => isoDate(d).replace(/-/g, '');
export function makeIcs(events) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const body = events.map((e, i) => [
    'BEGIN:VEVENT',
    `UID:${stamp}-${i}-${Math.random().toString(36).slice(2)}@verksted`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(e.date)}`,
    `DTEND;VALUE=DATE:${icsDate(new Date(new Date(e.date).getTime() + DAY))}`,
    `SUMMARY:${icsEsc(e.title)}`,
    e.description ? `DESCRIPTION:${icsEsc(e.description)}` : null,
    e.rrule ? `RRULE:${e.rrule}` : null,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(e.title)}`,
    `TRIGGER:-P${e.alarmDays ?? 1}DT0H0M0S`, 'END:VALARM',
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')).join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Verksted//NB\r\nCALSCALE:GREGORIAN\r\n${body}\r\nEND:VCALENDAR\r\n`;
}

export function readFileText(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(file); });
}

// URL-trygg base64 av komprimert JSON – brukes for deling uten server.
export async function packJson(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let out = bytes, tag = 'r';
  if (typeof CompressionStream !== 'undefined') {
    out = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    tag = 'z';
  }
  let bin = ''; for (const b of out) bin += String.fromCharCode(b);
  return tag + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function unpackJson(str) {
  const tag = str[0];
  const b64 = str.slice(1).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
  let bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  if (tag === 'z') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  return JSON.parse(new TextDecoder().decode(bytes));
}
