import { useEffect, useState } from 'react';
import { useCouple } from '../context/CoupleContext.jsx';
import { api } from '../api.js';
import BadgeBanner from '../components/BadgeBanner.jsx';

export default function Home({ onStartSession }) {
  const { me, partner, refreshRoom, leaveRoom } = useCouple();
  const [pointsInfo, setPointsInfo] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPoints(me.roomId).then(setPointsInfo).catch(() => {});
  }, [me.roomId]);

  useEffect(() => {
    if (partner) return;
    const id = setInterval(() => refreshRoom().catch(() => {}), 3000);
    return () => clearInterval(id);
  }, [partner, refreshRoom]);

  // Poll for a session your partner may have already started, so either of
  // you can jump into the same game from your own device.
  useEffect(() => {
    let cancelled = false;
    function check() {
      api
        .getActiveSession(me.roomId)
        .then(({ sessionId }) => !cancelled && setActiveSessionId(sessionId))
        .catch(() => {});
    }
    check();
    const id = setInterval(check, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [me.roomId]);

  async function handleStart() {
    setError('');
    setStarting(true);
    try {
      const session = await api.startSession(me.roomId, 5);
      onStartSession(session.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(me.joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="page home">
      <h1>Hey {me.name} 👋</h1>

      {!partner && (
        <div className="card muted-card">
          <p>Waiting for your partner to join…</p>
          <div className="join-code-display" onClick={copyCode}>
            {me.joinCode}
          </div>
          <p className="hint">{copied ? 'Copied!' : 'Tap the code to copy it and send it to them.'}</p>
        </div>
      )}

      {partner && (
        <div className="card muted-card">
          <p>
            You and <strong>{partner.name}</strong> are connected 💞
          </p>
        </div>
      )}

      {pointsInfo && <BadgeBanner pointsInfo={pointsInfo} />}

      {error && <p className="error-text">{error}</p>}

      {activeSessionId ? (
        <div className="card muted-card">
          <p>{partner ? `${partner.name} started a session!` : 'A session is already in progress.'}</p>
          <button className="btn btn-primary btn-big" onClick={() => onStartSession(activeSessionId)}>
            ▶️ Join session
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-big" onClick={handleStart} disabled={!partner || starting}>
          {starting ? 'Starting…' : '🎲 Start a session'}
        </button>
      )}
      {!partner && <p className="hint">You'll need your partner in the room to start.</p>}

      {pointsInfo && pointsInfo.unlockedIdeas.length > 0 && (
        <div className="card">
          <h2>Unlocked date night ideas</h2>
          <ul className="idea-list">
            {pointsInfo.unlockedIdeas.map((idea, i) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn btn-link" onClick={leaveRoom}>
        Leave room
      </button>
    </div>
  );
}
