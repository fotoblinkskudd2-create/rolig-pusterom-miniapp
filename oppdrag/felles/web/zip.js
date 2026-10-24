// Minimal ZIP-skriver (lagret, uten komprimering) for nettleser og Node. UTF-8-filnavn.
const TAB = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TAB[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

export function lagZip(filer, dato = new Date(Date.UTC(2026, 0, 1))) {
  // filer: [{navn, data: Uint8Array | string}]
  const enc = new TextEncoder(); const deler = []; const sentral = []; let pos = 0;
  const tid = ((dato.getUTCHours() << 11) | (dato.getUTCMinutes() << 5) | (dato.getUTCSeconds() >> 1)) & 0xffff;
  const dag = (((dato.getUTCFullYear() - 1980) << 9) | ((dato.getUTCMonth() + 1) << 5) | dato.getUTCDate()) & 0xffff;
  for (const f of filer) {
    const navn = enc.encode(f.navn); const data = typeof f.data === "string" ? enc.encode(f.data) : f.data; const crc = crc32(data);
    const lok = new DataView(new ArrayBuffer(30));
    lok.setUint32(0, 0x04034b50, true); lok.setUint16(4, 20, true); lok.setUint16(6, 0x0800, true); lok.setUint16(8, 0, true);
    lok.setUint16(10, tid, true); lok.setUint16(12, dag, true); lok.setUint32(14, crc, true); lok.setUint32(18, data.length, true); lok.setUint32(22, data.length, true);
    lok.setUint16(26, navn.length, true); lok.setUint16(28, 0, true);
    deler.push(new Uint8Array(lok.buffer), navn, data);
    const s = new DataView(new ArrayBuffer(46));
    s.setUint32(0, 0x02014b50, true); s.setUint16(4, 20, true); s.setUint16(6, 20, true); s.setUint16(8, 0x0800, true); s.setUint16(10, 0, true);
    s.setUint16(12, tid, true); s.setUint16(14, dag, true); s.setUint32(16, crc, true); s.setUint32(20, data.length, true); s.setUint32(24, data.length, true);
    s.setUint16(28, navn.length, true); s.setUint32(42, pos, true);
    sentral.push(new Uint8Array(s.buffer), navn);
    pos += 30 + navn.length + data.length;
  }
  const sLengde = sentral.reduce((a, b) => a + b.length, 0);
  const slutt = new DataView(new ArrayBuffer(22));
  slutt.setUint32(0, 0x06054b50, true); slutt.setUint16(8, filer.length, true); slutt.setUint16(10, filer.length, true);
  slutt.setUint32(12, sLengde, true); slutt.setUint32(16, pos, true);
  const alle = [...deler, ...sentral, new Uint8Array(slutt.buffer)];
  const ut = new Uint8Array(alle.reduce((a, b) => a + b.length, 0)); let o = 0;
  for (const d of alle) { ut.set(d, o); o += d.length; }
  return ut;
}
