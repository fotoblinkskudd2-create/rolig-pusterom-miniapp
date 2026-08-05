import { useEffect, useState } from 'react';
import { useCouple } from '../context/CoupleContext.jsx';
import { api } from '../api.js';

export default function History({ onViewPlan }) {
  const { me } = useCouple();
  const [history, setHistory] = useState(null);

  useEffect(() => {
    api.getHistory(me.roomId).then((d) => setHistory(d.history));
  }, [me.roomId]);

  return (
    <div className="page history-page">
      <h1>Your history</h1>

      {history === null && <p className="hint">Loading…</p>}
      {history && history.length === 0 && (
        <div className="card muted-card">
          <p>No sessions yet. Play your first round to start your story together.</p>
        </div>
      )}

      <div className="stack">
        {history &&
          history.map((s) => (
            <div className="card history-item" key={s.id}>
              <div className="history-item-header">
                <span className="date">{formatDate(s.startedAt)}</span>
                <span className={s.status === 'completed' ? 'status-pill done' : 'status-pill'}>
                  {s.status === 'completed' ? 'Completed' : 'In progress'}
                </span>
              </div>
              <p className="hint">
                {s.answerCount} answer{s.answerCount === 1 ? '' : 's'} across {s.questionCount} question
                {s.questionCount === 1 ? '' : 's'}
              </p>
              {s.plan && (
                <button className="btn btn-secondary" onClick={() => onViewPlan(s.plan.id)}>
                  View plan
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso.replace(' ', 'T') + 'Z').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
