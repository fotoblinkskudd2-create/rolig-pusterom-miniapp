// Minimal IndexedDB nøkkel/verdi-lager for blobs (bilder). localStorage tåler ikke bilder.
const open = (db) => new Promise((res, rej) => {
  const r = indexedDB.open(db, 1)
  r.onupgradeneeded = () => r.result.createObjectStore('kv')
  r.onsuccess = () => res(r.result)
  r.onerror = () => rej(r.error)
})
const tx = async (db, mode, fn) => {
  const d = await open(db)
  return new Promise((res, rej) => {
    const t = d.transaction('kv', mode)
    const out = fn(t.objectStore('kv'))
    t.oncomplete = () => res(out instanceof IDBRequest ? out.result : undefined)
    t.onerror = () => rej(t.error)
  })
}
export const idbGet = (db, key) => tx(db, 'readonly', (s) => s.get(key))
export const idbSet = (db, key, val) => tx(db, 'readwrite', (s) => { s.put(val, key) })
export const idbDel = (db, key) => tx(db, 'readwrite', (s) => { s.delete(key) })
export const idbKeys = (db) => tx(db, 'readonly', (s) => s.getAllKeys())

// Skalerer ned bilde (kvitteringer trenger ikke 12 MP) og returnerer JPEG-blob.
export async function shrinkImage(file, max = 1400, quality = 0.72) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url })
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale)
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    return await new Promise((res) => c.toBlob(res, 'image/jpeg', quality))
  } finally { URL.revokeObjectURL(url) }
}

export const blobToDataURL = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b) })
export const dataURLToBlob = (u) => fetch(u).then((r) => r.blob())
