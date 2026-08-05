export default function BadgeBanner({ pointsInfo }) {
  const { points, badge, badgeTiers } = pointsInfo;
  const nextTier = badgeTiers.find((t) => t.min > points);
  const currentMin = badge.min;
  const span = nextTier ? nextTier.min - currentMin : 1;
  const progress = nextTier ? Math.min(1, (points - currentMin) / span) : 1;

  return (
    <div className="card badge-card">
      <div className="badge-row">
        <span className="badge-emoji">{badge.emoji}</span>
        <div>
          <div className="badge-name">{badge.name}</div>
          <div className="badge-points">{points} pts</div>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      {nextTier && (
        <p className="hint">
          {nextTier.min - points} pts to {nextTier.emoji} {nextTier.name}
        </p>
      )}
    </div>
  );
}
