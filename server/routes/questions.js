import { Router } from 'express';
import { db } from '../db.js';

export const questionsRouter = Router();

questionsRouter.get('/', (req, res) => {
  const questions = db
    .prepare('SELECT id, text, category, points FROM questions ORDER BY order_index')
    .all();
  res.json({ questions });
});
