import { useEffect, useRef, useState } from 'react';
import { useCouple } from '../context/CoupleContext.jsx';
import { api } from '../api.js';
import QuestionCard from '../components/QuestionCard.jsx';
import ProgressDots from '../components/ProgressDots.jsx';
import RevealCard from '../components/RevealCard.jsx';

export default function Session({ sessionId, onDone, onExit }) {
  const { me, partner } = useCouple();
  const [session, setSession] = useState(null);
  const [ackCount, setAckCount] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.getSession(sessionId).then((s) => !cancelled && setSession(s));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!session || session.status !== 'active') return;
    pollRef.current = setInterval(() => {
      api.getSession(sessionId).then(setSession).catch(() => {});
    }, 2500);
    return () => clearInterval(pollRef.current);
  }, [session, sessionId]);

  useEffect(() => {
    if (session && session.status === 'completed' && ackCount >= session.completedRounds.length) {
      onDone(session.plan.id);
    }
  }, [session, ackCount, onDone]);

  if (!session) return <div className="page center-page">Loading your session…</div>;

  const pendingReveal = session.completedRounds.length > ackCount;
  const revealRound = pendingReveal ? session.completedRounds[ackCount] : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await api.submitAnswer(sessionId, me.userId, answerText.trim());
      setSession(updated);
      setAnswerText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (revealRound) {
    return (
      <div className="page session-page">
        <ProgressDots total={session.totalQuestions} current={revealRound.index} />
        <RevealCard round={revealRound} meId={me.userId} onContinue={() => setAckCount((c) => c + 1)} />
      </div>
    );
  }

  if (session.status === 'completed') {
    return <div className="page center-page">Wrapping up your plan…</div>;
  }

  const { question, answers } = session.currentRound;
  const alreadyAnswered = answers.some((a) => a.userId === me.userId);

  return (
    <div className="page session-page">
      <button className="btn btn-link exit-link" onClick={onExit}>
        ← Home
      </button>
      <ProgressDots total={session.totalQuestions} current={session.currentIndex} />
      <QuestionCard question={question} />

      {alreadyAnswered ? (
        <div className="card muted-card waiting-card">
          <p>Nice one! Waiting for {partner ? partner.name : 'your partner'} to answer…</p>
          <div className="pulse-dot" />
        </div>
      ) : (
        <form className="stack" onSubmit={handleSubmit}>
          <textarea
            className="text-input textarea"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Take your time…"
            autoFocus
            maxLength={600}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting || !answerText.trim()}>
            {submitting ? 'Sending…' : 'Submit answer (+10 pts)'}
          </button>
        </form>
      )}
    </div>
  );
}
