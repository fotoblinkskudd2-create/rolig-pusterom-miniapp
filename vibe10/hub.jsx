import { boot } from './shared/boot.jsx'
import { Shell, InstallHint } from './shared/ui.jsx'
import { apps } from './apps.config.js'

function Hub() {
  return (
    <Shell title="Vibe10" glyph="🔟">
      <p className="muted" style={{ marginTop: 0 }}>
        Ti apper for folk som er lei av abonnement, kontoer og sky. Alt lagres på telefonen. Virker i flymodus.
        Åpne en app → Del → «Legg til på Hjem-skjerm». Hver app blir sitt eget ikon.
      </p>
      <InstallHint />
      <div className="card" style={{ padding: 6 }}>
        <ul className="list">
          {apps.map((a, i) => (
            <li key={a.id} style={{ padding: 0 }}>
              <a href={`./apps/${a.id}/`} className="row" style={{ padding: 10, color: 'inherit', textDecoration: 'none' }}>
                <img src={`./apps/${a.id}/icon-180.png`} width="52" height="52" alt="" style={{ borderRadius: 12 }} />
                <span className="grow">
                  <b>{i + 1}. {a.name}</b><br />
                  <span className="muted small">{a.tagline}</span>
                </span>
                <span className="muted" aria-hidden>›</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="muted small">Ingen data forlater enheten. Ingen analytics. Kildekode i repoet.</p>
    </Shell>
  )
}

boot(Hub, './')
