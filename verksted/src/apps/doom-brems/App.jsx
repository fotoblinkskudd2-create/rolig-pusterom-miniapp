import { useEffect, useMemo, useState } from 'react';
import { BackupCard, Empty, Shell, useToast } from '../../shared/ui.jsx';
import { useStore } from '../../shared/store.js';
import { copyText, fmtTime, isoDate } from '../../shared/util.js';

const P = 'doom:';
const DEFAULT_ALTS = ['Drikk et glass vann', 'Gå til vinduet i 60 sekunder', 'Send én melding til et ekte menneske', 'Ti knebøy', 'Skriv én setning om hvordan du har det', 'Rydd én ting', 'Gå en runde rundt blokka'];
const APPS = ['Instagram', 'TikTok', 'YouTube', 'Reddit', 'X', 'Facebook', 'Snapchat', 'Nettavis'];

function Brake({ app, seconds, alts, onResult }) {
  const [left, setLeft] = useState(seconds);
  const [phase, setPhase] = useState('ask'); // ask → breathe → done
  const [alt] = useState(() => alts[Math.floor(Math.random() * alts.length)]);
  useEffect(() => {
    if (phase !== 'breathe' || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]);
  const inhale = Math.floor((seconds - left) / 4) % 2 === 0;

  return (
    <div style={{ minHeight: '70dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
      {phase === 'ask' && <>
        <p className="muted">Du åpnet</p>
        <div className="huge accent" style={{ margin: '8px 0 24px' }}>{app}</div>
        <p style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Hvorfor? Ærlig.</p>
        <div className="stack">
          <button className="btn block" onClick={() => setPhase('breathe')}>Jeg har et konkret ærend</button>
          <button className="btn block" onClick={() => setPhase('alt')}>Kjedsomhet / flukt</button>
          <button className="btn primary block" onClick={() => onResult('won', 'ombestemte seg')}>Ingen grunn. Lukk.</button>
        </div>
      </>}
      {phase === 'alt' && <>
        <p className="muted">Feeden fyller ikke hullet. Prøv dette i stedet:</p>
        <div className="big" style={{ margin: '24px 0' }}>{alt}</div>
        <div className="stack">
          <button className="btn primary block" onClick={() => onResult('won', alt)}>Ok. Jeg gjør det.</button>
          <button className="btn block ghost" onClick={() => setPhase('breathe')}>Nei, jeg vil scrolle</button>
        </div>
      </>}
      {phase === 'breathe' && <>
        <div style={{ width: 200, height: 200, margin: '0 auto 24px', borderRadius: '50%', background: 'var(--accent)', opacity: .85,
          transform: `scale(${left <= 0 ? 1 : inhale ? 1 : 0.6})`, transition: 'transform 4s ease-in-out' }} />
        <div className="big mono">{left > 0 ? left : 'Ferdig.'}</div>
        <p className="muted" style={{ margin: '8px 0 24px' }}>{left > 0 ? (inhale ? 'Pust inn …' : 'Pust ut …') : 'Vil du fortsatt?'}</p>
        <div className="stack">
          <button className="btn block" disabled={left > 0} onClick={() => onResult('lost', 'gikk videre')}>Ja – åpne {app} selv</button>
          <button className="btn primary block" onClick={() => onResult('won', 'pustet og droppet')}>Nei. Jeg slipper.</button>
        </div>
      </>}
    </div>
  );
}

export default function App() {
  const [log, setLog] = useStore(P + 'log', []);
  const [seconds, setSeconds] = useStore(P + 'seconds', 10);
  const [alts, setAlts] = useStore(P + 'alts', DEFAULT_ALTS);
  const [tab, setTab] = useState('stats');
  const [braking, setBraking] = useState(null);
  const [setupApp, setSetupApp] = useState('Instagram');
  const toast = useToast();

  // Åpnet fra Snarveier-automasjon: ?app=Instagram
  useEffect(() => {
    const app = new URLSearchParams(location.search).get('app');
    if (app) { setBraking(app); history.replaceState(null, '', location.pathname); }
  }, []);

  const finish = (result, note) => {
    setLog((l) => [{ app: braking, result, note, at: Date.now() }, ...l].slice(0, 2000));
    setBraking(null);
    toast(result === 'won' ? 'Brems vunnet.' : 'Greit. Du valgte selv – det er poenget.');
  };

  const todayKey = isoDate(new Date());
  const todayLog = log.filter((l) => isoDate(l.at) === todayKey);
  const week = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = isoDate(d);
      const ls = log.filter((l) => isoDate(l.at) === k);
      days.push({ k, label: d.toLocaleDateString('nb-NO', { weekday: 'short' }), won: ls.filter((l) => l.result === 'won').length, lost: ls.filter((l) => l.result === 'lost').length });
    }
    return days;
  }, [log]);
  const max = Math.max(1, ...week.map((d) => d.won + d.lost));
  const byApp = log.reduce((a, l) => ({ ...a, [l.app]: (a[l.app] || 0) + 1 }), {});
  const url = `${location.origin}${location.pathname}?app=${encodeURIComponent(setupApp)}`;

  if (braking) return <Shell title="Doom-Brems"><Brake app={braking} seconds={seconds} alts={alts} onResult={finish} /></Shell>;

  return (
    <Shell title="Doom-Brems" tabs={[{ id: 'stats', icon: '▮', label: 'Stats' }, { id: 'oppsett', icon: '⚙', label: 'Oppsett' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'stats' && <>
        <div className="card">
          <div className="grid2">
            <div><div className="muted small">Bremset i dag</div><div className="big ok mono">{todayLog.filter((l) => l.result === 'won').length}</div></div>
            <div><div className="muted small">Gikk videre</div><div className="big mono">{todayLog.filter((l) => l.result === 'lost').length}</div></div>
          </div>
        </div>
        <div className="card">
          <h2>Siste 7 dager</h2>
          <div className="row" style={{ alignItems: 'flex-end', height: 120, gap: 6 }}>
            {week.map((d) => (
              <div key={d.k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', height: `${(d.lost / max) * 90}%`, background: 'var(--surface-2)', borderRadius: '6px 6px 0 0' }} />
                <div style={{ width: '100%', height: `${(d.won / max) * 90}%`, background: 'var(--accent)', borderRadius: d.lost ? 0 : '6px 6px 0 0' }} />
                <span className="small muted">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="muted small" style={{ marginTop: 8 }}>Farge = bremset. Grå = gikk videre.</p>
        </div>
        <div className="card">
          <h2>Test bremsen</h2>
          <div className="chips">{APPS.map((a) => <button key={a} className="chip" onClick={() => setBraking(a)}>{a}</button>)}</div>
        </div>
        {log.length > 0 ? (
          <div className="card">
            <h2>Logg</h2>
            <ul className="list">{log.slice(0, 15).map((l, i) => (
              <li key={i}><span className="dot" style={{ background: l.result === 'won' ? 'var(--accent)' : 'var(--line)' }} /><span className="grow">{l.app} <span className="muted small">– {l.note}</span></span><span className="muted small">{fmtTime(l.at)}</span></li>
            ))}</ul>
          </div>
        ) : <div className="card"><Empty title="Ingen bremser ennå">Sett opp automasjonen under «Oppsett».</Empty></div>}
        {Object.keys(byApp).length > 0 && <p className="muted small">Totalt: {Object.entries(byApp).map(([a, n]) => `${a} ${n}`).join(' · ')}</p>}
      </>}

      {tab === 'oppsett' && <>
        <div className="card">
          <h2>Koble til en app</h2>
          <p className="muted small" style={{ marginBottom: 10 }}>iPhone kan ikke la en webapp blokkere andre apper. Men Snarveier kan åpne denne siden hver gang du åpner Instagram. Det er smutthullet.</p>
          <div className="chips" style={{ marginBottom: 12 }}>{APPS.map((a) => <button key={a} className={'chip' + (a === setupApp ? ' on' : '')} onClick={() => setSetupApp(a)}>{a}</button>)}</div>
          <code className="small" style={{ display: 'block', wordBreak: 'break-all', background: 'var(--surface-2)', padding: 10, borderRadius: 10 }}>{url}</code>
          <button className="btn sm" style={{ marginTop: 8 }} onClick={async () => { await copyText(url); toast('Kopiert'); }}>Kopier URL</button>
        </div>
        <div className="card small">
          <h2>Oppskrift (iOS 17/18)</h2>
          <ol style={{ paddingLeft: 18 }} className="stack">
            <li>Åpne <b>Snarveier</b> → <b>Automasjon</b> → <b>+</b> → <b>App</b>.</li>
            <li>Velg {setupApp}, huk av <b>Er åpnet</b>, velg <b>Kjør umiddelbart</b>.</li>
            <li>Ny tom snarvei. Legg til <b>Hent fil</b> fra iCloud Drive/Shortcuts, filnavn <code>brems.txt</code> (slå av «Vis dokumentvelger», slå av «Feil hvis ikke funnet»).</li>
            <li><b>Hvis</b> fila <i>har ikke noen verdi</i> <b>eller</b> legg til <b>Hent tid mellom datoer</b> (filens endringsdato → Nåværende dato, i minutter) og <b>Hvis</b> resultatet er <b>større enn 10</b>:</li>
            <li>… inni Hvis: <b>Lagre fil</b> (tekst «x») til <code>brems.txt</code>, «Overskriv» på. Så <b>Åpne URL-er</b> med URL-en over.</li>
            <li>Ferdig. Bremsen dukker opp maks én gang per 10 minutter, så du ikke havner i en loop når du velger å gå videre.</li>
          </ol>
          <p className="muted" style={{ marginTop: 8 }}>Navn på handlinger kan variere litt mellom iOS-versjoner. Enkel variant uten tidssperre: bare «Åpne URL-er» – men da kommer bremsen hver gang.</p>
        </div>
        <div className="card">
          <h2>Pustetid</h2>
          <div className="chips">{[5, 10, 20, 30].map((s) => <button key={s} className={'chip' + (s === seconds ? ' on' : '')} onClick={() => setSeconds(s)}>{s} sek</button>)}</div>
        </div>
      </>}

      {tab === 'mer' && <>
        <div className="card">
          <h2>Alternativer når det er kjedsomhet</h2>
          <textarea className="input" rows={7} value={alts.join('\n')} onChange={(e) => setAlts(e.target.value.split('\n').filter((x) => x.trim()).length ? e.target.value.split('\n') : DEFAULT_ALTS)} />
          <p className="muted small" style={{ marginTop: 6 }}>Én per linje.</p>
        </div>
        <BackupCard prefix={P} appName="Doom-Brems" />
      </>}
    </Shell>
  );
}
