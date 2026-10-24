// Minimal DOM-hjelper: h("div", {class: "x", onclick: f}, barn...)
export function h(tag, attr = {}, ...barn) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attr || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "value") el.value = v;
    else if (k === "checked") el.checked = !!v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const b of barn.flat(Infinity)) {
    if (b === null || b === undefined || b === false) continue;
    el.append(b instanceof Node ? b : document.createTextNode(String(b)));
  }
  return el;
}
export const $ = (s, r = document) => r.querySelector(s);
export function tom(el, ...barn) { el.replaceChildren(...barn.flat(Infinity).filter(b => b != null && b !== false)); return el; }
export async function api(metode, url, kropp) {
  const r = await fetch(url, { method: metode, headers: { "Content-Type": "application/json" }, body: kropp === undefined ? undefined : JSON.stringify(kropp) });
  const t = await r.text();
  const d = t ? JSON.parse(t) : null;
  if (!r.ok) throw new Error((d && (d.feil || (typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail)))) || r.statusText);
  return d;
}
export function lastNed(filnavn, innhold, type = "text/plain") {
  const a = h("a", { href: URL.createObjectURL(new Blob([innhold], { type })), download: filnavn });
  document.body.append(a); a.click(); a.remove();
}
export const kr = (n) => n === null || n === undefined ? "ukjent" : new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);
