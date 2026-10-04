import { APPS } from '../registry.js';
import { InstallHint } from '../shared/ui.jsx';

export default function Hub() {
  return (
    <div className="app">
      <header className="topbar"><h1>Verksted<span className="accent">.</span></h1></header>
      <p className="tagline">Ti apper for telefonen. Ingen konto. Ingen sky. Ingen abonnement. Alt blir på enheten din.</p>
      <InstallHint />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {APPS.map((a) => (
          <a key={a.slug} href={`apps/${a.slug}/`} className="card" style={{ textDecoration: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <img src={`icons/${a.slug}-192.png`} alt="" width="56" height="56" style={{ borderRadius: 14 }} />
            <b style={{ fontSize: '1.05rem' }}>{a.name}</b>
            <span className="muted small">{a.tagline}</span>
          </a>
        ))}
      </div>
      <div className="card small muted" style={{ marginTop: 16 }}>
        Hver app kan legges på Hjem-skjermen for seg: åpne appen, trykk Del → «Legg til på Hjem-skjerm». Da får den eget ikon og egen lagring, og virker uten nett (Strømvakt trenger nett for nye priser).
      </div>
    </div>
  );
}
