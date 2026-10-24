// IndexedDB: befaringer (JSON-dokument) og bilder (originalbytes, uendret).
const DB = "befaring", V = 1;
function aapne() {
  return new Promise((ok, feil) => {
    const r = indexedDB.open(DB, V);
    r.onupgradeneeded = () => { r.result.createObjectStore("befaringer", { keyPath: "id" }); r.result.createObjectStore("bilder"); };
    r.onsuccess = () => ok(r.result); r.onerror = () => feil(r.error);
  });
}
async function tx(lager, modus, f) {
  const db = await aapne();
  return new Promise((ok, feil) => { const t = db.transaction(lager, modus); const res = f(t.objectStore(lager)); t.oncomplete = () => ok(res && res.result); t.onerror = () => feil(t.error); });
}
export const lagreBefaring = b => tx("befaringer", "readwrite", s => s.put(b));
export const hentBefaring = id => tx("befaringer", "readonly", s => s.get(id));
export const alleBefaringer = () => tx("befaringer", "readonly", s => s.getAll());
export const lagreBilde = (nokkel, bytes) => tx("bilder", "readwrite", s => s.put(bytes, nokkel));
export const hentBilde = nokkel => tx("bilder", "readonly", s => s.get(nokkel));
