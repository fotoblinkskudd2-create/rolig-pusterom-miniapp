// Testdata for skjermbilder (scripts/shots.mjs med SEED=scripts/seed.js). Kjøres kun én gang per kontekst.
(() => {
  if (localStorage.getItem('__seeded')) return
  const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10) }
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v))
  set('provefella:subs', [
    { id: 'a', name: 'Viaplay', price: 149, cycle: 'month', next: d(2), trial: true, url: '' },
    { id: 'b', name: 'Spotify', price: 139, cycle: 'month', next: d(9), trial: false },
    { id: 'c', name: 'ChatGPT Plus', price: 240, cycle: 'month', next: d(15), trial: false },
    { id: 'e', name: 'Adobe', price: 289, cycle: 'month', next: d(-3), trial: false, cancelled: true, cancelledAt: d(-70) },
  ])
  set('gjeld:debts', [
    { id: '1', name: 'Klarna – Lego', type: 'Klarna / delbetaling', balance: 6400, rate: 24, min: 600, start: 9000 },
    { id: '2', name: 'Kredittkort', type: 'Kredittkort', balance: 48000, rate: 26.9, min: 1500, start: 52000 },
    { id: '3', name: 'Forbrukslån', type: 'Forbrukslån', balance: 195000, rate: 14.5, min: 4200, start: 200000 },
  ])
  set('brems:items', [
    { id: 'x', name: 'LEGO Technic Ferrari', price: 4299, why: 'Fordi jeg fortjener det', trigger: 'Stressa', created: Date.now() - 3600e3 * 20, until: Date.now() + 3600e3 * 52 },
    { id: 'y', name: 'Robotstøvsuger', price: 3990, trigger: 'Klarna fristet', created: Date.now() - 3600e3 * 80, until: Date.now() - 3600e3 },
    { id: 'z', name: 'Hoodie', price: 699, trigger: 'Kjedelig', created: 1, until: 2, decision: 'skip', decidedAt: Date.now() - 86400e3 },
  ])
  set('start:tasks', [{ id: 't1', title: 'Åpne posten / regninger', steps: [{ id: 's1', text: 'Hent brevene', done: true }, { id: 's2', text: 'Åpne ett brev', done: false }] }, { id: 't2', title: 'Svare Kari', steps: [] }])
  set('start:done', [{ id: 'q', title: 'Oppvask', date: d(0) }, { id: 'w', title: 'Dusje', date: d(-1) }])
  set('doom:log', Array.from({ length: 30 }, (_, i) => ({ id: 'l' + i, app: ['TikTok', 'Instagram', 'TikTok'][i % 3], choice: i % 3 ? 'stopped' : 'went', reason: ['Kjedelig', 'Unngår noe', 'Ren vane'][i % 3], date: d(-(i % 7)), at: Date.now() - i * 3600e3 })))
  set('garanti:items', [
    { id: 'g1', name: 'Vaskemaskin Bosch', store: 'Elkjøp', price: 7990, date: d(-1800), cat: 'Hvitevarer', rekl: 5, warranty: '', note: '' },
    { id: 'g2', name: 'AirPods Pro', store: 'Power', price: 2790, date: d(-700), cat: 'Småelektronikk', rekl: 2, warranty: '', note: '' },
    { id: 'g3', name: 'iPhone 16', store: 'Komplett', price: 11990, date: d(-200), cat: 'Mobil / PC / nettbrett', rekl: 5, warranty: 1, note: '' },
  ])
  set('spleis:groups', [{ id: 'h', title: 'Hyttetur Hemsedal', people: ['Meg', 'Ola', 'Kari', 'Ali'], updated: 1, expenses: [
    { id: 'e1', desc: 'Hytta', amount: 4800, paidBy: 'Meg', split: ['Meg', 'Ola', 'Kari', 'Ali'], date: d(-2) },
    { id: 'e2', desc: 'Mat Rema', amount: 1320, paidBy: 'Kari', split: ['Meg', 'Ola', 'Kari', 'Ali'], date: d(-2) },
    { id: 'e3', desc: 'Bensin', amount: 900, paidBy: 'Ola', split: ['Meg', 'Ola'], date: d(-1) },
  ] }])
  set('kjokken:pantry', ['egg', 'melk', 'smør', 'brød', 'pasta', 'hvitløk', 'løk', 'hermetiske tomater', 'ost', 'banan'])
  set('minnehull:vault', { data: { parts: [{ id: 'meg', name: 'Meg', color: '#d6409f', emoji: '🫧' }, { id: 'l', name: 'Lille', color: '#ffb224', emoji: '🧸' }, { id: 'b', name: 'Beskytter', color: '#3e63dd', emoji: '🛡️' }],
    fronts: [{ id: 'f1', partId: 'l', at: Date.now() - 3600e3, note: 'kjøpte Lego' }, { id: 'f2', partId: 'meg', at: Date.now() - 4 * 3600e3 }],
    gaps: [{ id: 'g', from: d(0), fromT: '13:10', toT: '15:40', found: 'Klarna-kjøp 1 299 kr, pakke på døra', note: 'Sliten, ok' }],
    board: [{ id: 'm', partId: 'b', text: 'Ikke kjøp mer Lego denne måneden ❤️', at: Date.now() - 7200e3 }] } })
  set('skjold:cases', [
    { id: 'c1', creditor: 'Fjordkraft', agency: 'Kredinor', ref: '88231', amount: 3420, stage: 'inkassovarsel', received: d(-10), due: d(4), status: 'open', notes: '' },
    { id: 'c2', creditor: 'Telenor', agency: '', ref: '', amount: 899, stage: 'purring', received: d(-3), due: d(11), status: 'open', notes: '' },
    { id: 'c3', creditor: 'Klarna', agency: 'Lowell', ref: 'L-221', amount: 12800, stage: 'betalingsoppfordring', received: d(-20), due: d(-6), status: 'plan', notes: '' },
  ])
  localStorage.setItem('__seeded', '1')
})()
