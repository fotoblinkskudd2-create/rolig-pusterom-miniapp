// Delte input for test og benchmark. Ekte header-byte, ingen plassholdere.
const b64 = bytes => Buffer.from(bytes).toString('base64');

const HEADERS = {
  png:  b64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52]),
  jpeg: b64([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]),
  webp: b64([0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
  heic: b64([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]),
  gif:  b64([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0, 0, 0])
};

// Siste punkt er i går, så lange serier aldri havner i fremtiden.
function series(n, f) {
  const start = Date.now() - n * 86400000;
  return Array.from({ length: n }, (_, i) => ({
    t: new Date(start + i * 86400000).toISOString(),
    mood: f(i)
  }));
}

const VALID = {
  mirrorText: {
    schema_version: '1.0', source: 'isolation_mirror',
    modalities: [{ type: 'text', value: 'Ingen har ringt på ni dager.', lang: 'nb' }]
  },
  mirrorImage: {
    schema_version: '1.0', source: 'isolation_mirror',
    modalities: [{ type: 'image', mime: 'image/jpeg', bytes: 284113, header: HEADERS.jpeg, width: 3024, height: 4032 }]
  },
  mirrorFull: {
    schema_version: '1.0', source: 'isolation_mirror', tags: { intensity: 'high', context: 'isolation' },
    modalities: [
      { type: 'text', value: 'Kjøkkenet er stille. Telefonen også.' },
      { type: 'image', mime: 'image/png', bytes: 51200, header: HEADERS.png },
      { type: 'mood', value: 2 }
    ]
  },
  checkin: {
    schema_version: '1.0', source: 'checkin',
    modalities: [{ type: 'mood', value: 4 }, { type: 'text', value: 'Gikk tur.' }]
  },
  breathing: { schema_version: '1.0', source: 'breathing', modalities: [{ type: 'mood', value: 1 }] },
  historyUp: {
    schema_version: '1.0', source: 'history',
    modalities: [{ type: 'timeseries', points: series(20, i => 1 + Math.floor(i / 5)) }, { type: 'action', index: 0 }]
  },
  historyShort: {
    schema_version: '1.0', source: 'history',
    modalities: [{ type: 'timeseries', points: series(5, i => 1 + i) }]
  }
};

module.exports = { HEADERS, VALID, series, b64 };
