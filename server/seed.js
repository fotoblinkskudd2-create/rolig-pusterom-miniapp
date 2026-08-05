import { db } from './db.js';
import { questions } from './data/questions.js';

const count = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;

if (count > 0) {
  console.log(`Question bank already seeded (${count} questions). Skipping.`);
  process.exit(0);
}

const insert = db.prepare(
  'INSERT INTO questions (text, category, points, order_index) VALUES (?, ?, ?, ?)'
);

const insertMany = db.transaction((items) => {
  items.forEach((q, i) => insert.run(q.text, q.category, q.points, i));
});

insertMany(questions);

console.log(`Seeded ${questions.length} questions.`);
