import { useState } from 'react';
import { useCouple } from '../context/CoupleContext.jsx';

export default function Onboarding() {
  const { createRoom, joinRoom } = useCouple();
  const [mode, setMode] = useState('choose'); // choose | create | join
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createRoom(name.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setBusy(true);
    setError('');
    try {
      await joinRoom(code.trim().toUpperCase(), name.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page onboarding">
      <div className="hero">
        <div className="hero-emoji">💞</div>
        <h1>Reconnect</h1>
        <p className="subtitle">A playful little game for the two of you.</p>
      </div>

      {mode === 'choose' && (
        <div className="stack">
          <button className="btn btn-primary" onClick={() => setMode('create')}>
            Start a new room
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('join')}>
            Join with a code
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form className="stack" onSubmit={handleCreate}>
          <label className="field-label" htmlFor="name">
            What should we call you?
          </label>
          <input
            id="name"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            maxLength={30}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create room'}
          </button>
          <button type="button" className="btn btn-link" onClick={() => setMode('choose')}>
            Back
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form className="stack" onSubmit={handleJoin}>
          <label className="field-label" htmlFor="join-name">
            What should we call you?
          </label>
          <input
            id="join-name"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={30}
          />
          <label className="field-label" htmlFor="code">
            Join code
          </label>
          <input
            id="code"
            className="text-input code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCDE"
            maxLength={5}
            autoCapitalize="characters"
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy || !name.trim() || !code.trim()}>
            {busy ? 'Joining…' : 'Join room'}
          </button>
          <button type="button" className="btn btn-link" onClick={() => setMode('choose')}>
            Back
          </button>
        </form>
      )}
    </div>
  );
}
