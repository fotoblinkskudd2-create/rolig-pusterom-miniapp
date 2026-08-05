export default function RevealCard({ round, meId, onContinue }) {
  const mine = round.answers.find((a) => a.userId === meId);
  const theirs = round.answers.find((a) => a.userId !== meId);

  return (
    <div className="card reveal-card">
      <div className="reveal-badge">+{(mine?.points || 0) + (theirs?.points || 0)} pts earned 🎉</div>
      <p className="question-text small">{round.question.text}</p>

      <div className="answer-block">
        <div className="answer-name">You</div>
        <p>{mine?.answerText}</p>
      </div>
      <div className="answer-block">
        <div className="answer-name">{theirs?.name || 'Your partner'}</div>
        <p>{theirs?.answerText}</p>
      </div>

      <button className="btn btn-primary" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
