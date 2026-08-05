const CATEGORY_LABELS = {
  communication: 'Communication',
  appreciation: 'Appreciation',
  'quality-time': 'Quality Time',
  'trust-repair': 'Trust',
  'emotional-safety': 'Emotional Safety',
  'future-vision': 'Future',
};

export default function QuestionCard({ question }) {
  return (
    <div className="card question-card">
      <span className="category-pill">{CATEGORY_LABELS[question.category] || question.category}</span>
      <p className="question-text">{question.text}</p>
    </div>
  );
}
