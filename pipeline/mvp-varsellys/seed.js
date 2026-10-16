'use strict';
// Lager demobruker demo@varsellys.no / demo1234 med 21 dager data som ender i gult->rødt.
process.env.DB_FILE = process.env.DB_FILE || require('path').join(__dirname, 'data', 'db.json');
const fs = require('fs'); const crypto = require('crypto');
const { DEFAULT_RULES } = require('./engine');
const db = fs.existsSync(process.env.DB_FILE) ? JSON.parse(fs.readFileSync(process.env.DB_FILE)) : { users: {}, sessions: {} };
const salt = crypto.randomBytes(16).toString('hex');
const today = new Date(); today.setHours(12);
const checkins = [];
for (let i = 20; i >= 1; i--) {
  const d = new Date(today - i * 864e5).toISOString().slice(0, 10);
  const late = i <= 2;
  checkins.push({ date: d, sleep: late ? 4.5 : 7 + (i % 3) * 0.5, mood: late ? 2 : (i % 3) - 1,
    energy: late ? 5 : 3, meds: true, note: late ? 'Masse ideer. Trenger ikke søvn.' : '' });
}
db.users['demo@varsellys.no'] = {
  email: 'demo@varsellys.no', salt, pw: crypto.scryptSync('demo1234', salt, 64).toString('hex'),
  created: new Date().toISOString(), checkins, rules: DEFAULT_RULES.map(r => ({ ...r })),
  plan: { yellow: 'Legg deg før 23 tre kvelder. Ingen kjøp over 500 kr. Si fra til Kari.',
    red: 'Ring DPS i dag. Gi Kari bankkortet. Avlys helgens planer.', contactName: 'Kari', contactPhone: '+47 900 00 000' },
  shareToken: 'demo-deling'
};
fs.mkdirSync(require('path').dirname(process.env.DB_FILE), { recursive: true });
fs.writeFileSync(process.env.DB_FILE, JSON.stringify(db, null, 2));
console.log('Demo klar: demo@varsellys.no / demo1234  ·  delt lenke: /s/demo-deling');
