export default function ProgressDots({ total, current }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i <= current ? 'dot dot-filled' : 'dot'} />
      ))}
    </div>
  );
}
