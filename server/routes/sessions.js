import { Router } from 'express';
import { db } from '../db.js';
import { makeId } from '../utils.js';
import { generatePlanSteps } from '../planGenerator.js';

export const sessionsRouter = Router();

function shuffledQuestionIds(count) {
  const all = db.prepare('SELECT id FROM questions').all().map((q) => q.id);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, Math.min(count, all.length));
}

function getQuestion(id) {
  return db.prepare('SELECT id, text, category, points FROM questions WHERE id = ?').get(id);
}

function buildSessionState(session) {
  const questionIds = JSON.parse(session.question_ids);
  const users = db
    .prepare('SELECT id, name FROM users WHERE room_id = ? ORDER BY created_at')
    .all(session.room_id);

  const rounds = questionIds.map((qid, index) => {
    const question = getQuestion(qid);
    const answers = db
      .prepare(
        `SELECT a.user_id AS userId, a.answer_text AS answerText, a.points AS points, u.name
         FROM answers a JOIN users u ON u.id = a.user_id
         WHERE a.session_id = ? AND a.question_id = ?`
      )
      .all(session.id, qid);
    return { index, question, answers };
  });

  const currentRound = rounds[session.current_index] || null;
  const answeredUserIds = currentRound ? currentRound.answers.map((a) => a.userId) : [];
  const waitingFor = currentRound
    ? users.filter((u) => !answeredUserIds.includes(u.id)).map((u) => u.id)
    : [];

  let plan = null;
  if (session.status === 'completed') {
    plan = db.prepare('SELECT * FROM plans WHERE session_id = ?').get(session.id);
    if (plan) plan = { ...plan, steps: JSON.parse(plan.steps) };
  }

  return {
    id: session.id,
    roomId: session.room_id,
    status: session.status,
    totalQuestions: questionIds.length,
    currentIndex: session.current_index,
    currentRound: session.status === 'active' ? currentRound : null,
    waitingFor,
    completedRounds: rounds.filter((r) => r.index < session.current_index),
    plan,
  };
}

// Start a new session for a room. If one is already active, resume it instead
// of creating a duplicate (so either partner can safely tap "Start a session").
sessionsRouter.post('/', (req, res) => {
  const { roomId, questionCount = 5 } = req.body;
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId);
  if (!room) return res.status(404).json({ error: 'room not found' });

  const active = db
    .prepare(`SELECT * FROM sessions WHERE room_id = ? AND status = 'active'`)
    .get(roomId);
  if (active) return res.status(200).json(buildSessionState(active));

  const questionIds = shuffledQuestionIds(questionCount);
  if (questionIds.length === 0) {
    return res.status(400).json({ error: 'question bank is empty — run npm run seed' });
  }

  const sessionId = makeId();
  db.prepare(
    'INSERT INTO sessions (id, room_id, status, question_ids, current_index) VALUES (?, ?, ?, ?, 0)'
  ).run(sessionId, roomId, 'active', JSON.stringify(questionIds));

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  res.status(201).json(buildSessionState(session));
});

sessionsRouter.get('/:sessionId', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'session not found' });
  res.json(buildSessionState(session));
});

// Submit an answer for the current question of a session
sessionsRouter.post('/:sessionId/answers', (req, res) => {
  const { userId, answerText } = req.body;
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'session not found' });
  if (session.status !== 'active') return res.status(400).json({ error: 'session already completed' });
  if (!answerText || !answerText.trim()) return res.status(400).json({ error: 'answerText is required' });

  const questionIds = JSON.parse(session.question_ids);
  const currentQuestionId = questionIds[session.current_index];
  const question = getQuestion(currentQuestionId);

  const alreadyAnswered = db
    .prepare('SELECT 1 FROM answers WHERE session_id = ? AND question_id = ? AND user_id = ?')
    .get(session.id, currentQuestionId, userId);
  if (alreadyAnswered) {
    return res.status(400).json({ error: 'you already answered this question' });
  }

  db.prepare(
    'INSERT INTO answers (id, session_id, question_id, user_id, answer_text, points) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(makeId(), session.id, currentQuestionId, userId, answerText.trim(), question.points);

  const users = db.prepare('SELECT id FROM users WHERE room_id = ?').all(session.room_id);
  const answeredCount = db
    .prepare('SELECT COUNT(*) AS c FROM answers WHERE session_id = ? AND question_id = ?')
    .get(session.id, currentQuestionId).c;

  let updatedSession = session;
  if (answeredCount >= users.length) {
    const nextIndex = session.current_index + 1;
    if (nextIndex >= questionIds.length) {
      db.prepare(
        `UPDATE sessions SET current_index = ?, status = 'completed', completed_at = datetime('now') WHERE id = ?`
      ).run(nextIndex, session.id);

      const sessionQuestions = questionIds.map(getQuestion);
      const steps = generatePlanSteps(sessionQuestions);
      db.prepare(
        'INSERT INTO plans (id, session_id, room_id, steps) VALUES (?, ?, ?, ?)'
      ).run(makeId(), session.id, session.room_id, JSON.stringify(steps));
    } else {
      db.prepare('UPDATE sessions SET current_index = ? WHERE id = ?').run(nextIndex, session.id);
    }
    updatedSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session.id);
  }

  res.status(201).json(buildSessionState(updatedSession));
});
