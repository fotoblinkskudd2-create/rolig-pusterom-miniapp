"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchDashboard, killSwitch, resumeSwarm, type Dashboard } from "@/lib/api";

function fmtNok(n: number): string {
  return new Intl.NumberFormat("no-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);
}

export default function Page() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchDashboard()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  if (error) {
    return (
      <main>
        <h1>REGNViking OS</h1>
        <p className="subtitle">Empire dashboard could not reach the API at the configured URL.</p>
        <p style={{ color: "var(--danger)" }}>{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main>
        <h1>REGNViking OS</h1>
        <p className="subtitle">Loading empire status...</p>
      </main>
    );
  }

  return (
    <main>
      <div className="top-bar">
        <div>
          <h1>REGNViking OS</h1>
          <p className="subtitle">Live empire status - refreshes every 5s</p>
        </div>
        {data.killed ? (
          <button className="resume" onClick={() => resumeSwarm().then(load)}>
            Resume swarm
          </button>
        ) : (
          <button onClick={() => killSwitch("manual dashboard kill").then(load)}>Kill switch</button>
        )}
      </div>

      {data.killed && <div className="killed-banner">Swarm is stopped (kill switch engaged).</div>}

      <div className="grid">
        <div className="stat-card">
          <div className="label">Revenue</div>
          <div className="value">{fmtNok(data.roi.total_revenue_nok)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Cost</div>
          <div className="value">{fmtNok(data.roi.total_cost_nok)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Net</div>
          <div className={`value ${data.roi.profitable ? "profit" : "loss"}`}>{fmtNok(data.roi.net_nok)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Status</div>
          <div className={`value ${data.roi.profitable ? "profit" : "loss"}`}>
            {data.roi.profitable ? "Profitable" : "Not yet profitable"}
          </div>
        </div>
      </div>

      <section>
        <h2>Agents ({data.agents.length})</h2>
        <table>
          <thead>
            <tr><th>Agent</th><th>Status</th><th>Failures</th><th>Revenue</th><th>Cost</th></tr>
          </thead>
          <tbody>
            {data.agents.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                <td>{a.failure_count}</td>
                <td>{fmtNok(a.revenue_nok)}</td>
                <td>{fmtNok(a.cost_nok)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Active inventions ({data.inventions.length})</h2>
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Domain</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {data.inventions.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td><td>{i.title}</td><td>{i.domain}</td><td>{i.status}</td>
                <td>{new Date(i.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {data.inventions.length === 0 && <tr><td colSpan={5}>No inventions yet - run a design cycle.</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Patent status ({data.patents.length})</h2>
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Jurisdiction</th><th>Novelty risk</th><th>Status</th></tr></thead>
          <tbody>
            {data.patents.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.title}</td><td>{p.jurisdiction}</td><td>{p.novelty_risk}</td><td>{p.status}</td>
              </tr>
            ))}
            {data.patents.length === 0 && <tr><td colSpan={5}>No patent drafts yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2>MVPs ({data.mvps.length})</h2>
        <table>
          <thead><tr><th>ID</th><th>Idea</th><th>Slug</th><th>Status</th><th>48h deadline</th></tr></thead>
          <tbody>
            {data.mvps.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td><td>{m.idea}</td><td>{m.slug}</td><td>{m.status}</td>
                <td>{new Date(m.deadline_at).toLocaleString()}</td>
              </tr>
            ))}
            {data.mvps.length === 0 && <tr><td colSpan={5}>No MVPs scaffolded yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2>PanicSafe sessions ({data.panicsafe_sessions.length})</h2>
        <table>
          <thead><tr><th>ID</th><th>Scenario</th><th>Created</th></tr></thead>
          <tbody>
            {data.panicsafe_sessions.map((s) => (
              <tr key={s.id}><td>{s.id}</td><td>{s.scenario}</td><td>{new Date(s.created_at).toLocaleString()}</td></tr>
            ))}
            {data.panicsafe_sessions.length === 0 && <tr><td colSpan={3}>No sessions yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
}
