import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { roomsRouter } from './routes/rooms.js';
import { sessionsRouter } from './routes/sessions.js';
import { plansRouter } from './routes/plans.js';
import { questionsRouter } from './routes/questions.js';
import { questions as seedQuestions } from './data/questions.js';

// Auto-seed the question bank on first boot so `npm run server` alone is enough.
const existingCount = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
if (existingCount === 0) {
  const insert = db.prepare(
    'INSERT INTO questions (text, category, points, order_index) VALUES (?, ?, ?, ?)'
  );
  const insertMany = db.transaction((items) => {
    items.forEach((q, i) => insert.run(q.text, q.category, q.points, i));
  });
  insertMany(seedQuestions);
  console.log(`Seeded ${seedQuestions.length} questions.`);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/rooms', roomsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/questions', questionsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Couple Connect API listening on http://localhost:${PORT}`);
});
