import { Router } from 'express';
import { db } from '../db.js';

export const plansRouter = Router();

plansRouter.get('/:planId', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.planId);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  res.json({ ...plan, steps: JSON.parse(plan.steps) });
});

// Edit/save a plan's steps (user can rewrite text, add/remove steps, mark done)
plansRouter.put('/:planId', (req, res) => {
  const { steps } = req.body;
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.planId);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  if (!Array.isArray(steps)) return res.status(400).json({ error: 'steps must be an array' });

  const cleanSteps = steps
    .filter((s) => s && typeof s.text === 'string' && s.text.trim())
    .map((s) => ({ text: s.text.trim(), done: Boolean(s.done) }));

  db.prepare(`UPDATE plans SET steps = ?, updated_at = datetime('now') WHERE id = ?`).run(
    JSON.stringify(cleanSteps),
    plan.id
  );

  const updated = db.prepare('SELECT * FROM plans WHERE id = ?').get(plan.id);
  res.json({ ...updated, steps: JSON.parse(updated.steps) });
});
