import { Router } from 'express';
import { db } from '../db.js';
import { makeId, makeJoinCode } from '../utils.js';
import { badgeForPoints, dateNightIdeas, badgeTiers } from '../data/planTemplates.js';

export const roomsRouter = Router();

function roomUsers(roomId) {
  return db.prepare('SELECT id, name FROM users WHERE room_id = ? ORDER BY created_at').all(roomId);
}

function roomPoints(roomId) {
  const answerPoints = db
    .prepare(
      `SELECT COALESCE(SUM(a.points), 0) AS total
       FROM answers a
       JOIN sessions s ON s.id = a.session_id
       WHERE s.room_id = ?`
    )
    .get(roomId).total;
  const completedSessions = db
    .prepare(`SELECT COUNT(*) AS c FROM sessions WHERE room_id = ? AND status = 'completed'`)
    .get(roomId).c;
  return answerPoints + completedSessions * 20;
}

// Create a new couple room
roomsRouter.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const roomId = makeId();
  let joinCode;
  do {
    joinCode = makeJoinCode();
  } while (db.prepare('SELECT 1 FROM rooms WHERE join_code = ?').get(joinCode));

  db.prepare('INSERT INTO rooms (id, join_code) VALUES (?, ?)').run(roomId, joinCode);

  const userId = makeId();
  db.prepare('INSERT INTO users (id, room_id, name) VALUES (?, ?, ?)').run(userId, roomId, name.trim());

  res.status(201).json({
    room: { id: roomId, joinCode },
    user: { id: userId, name: name.trim() },
  });
});

// Look up a room by join code (used before joining, to show who's already in)
roomsRouter.get('/by-code/:joinCode', (req, res) => {
  const room = db
    .prepare('SELECT id, join_code AS joinCode FROM rooms WHERE join_code = ?')
    .get(req.params.joinCode.toUpperCase());
  if (!room) return res.status(404).json({ error: 'room not found' });
  res.json({ room, users: roomUsers(room.id) });
});

// Join a room by code. If `userId` is supplied and belongs to the room, resumes as that user.
roomsRouter.post('/by-code/:joinCode/join', (req, res) => {
  const { name, userId } = req.body;
  const room = db
    .prepare('SELECT id, join_code AS joinCode FROM rooms WHERE join_code = ?')
    .get(req.params.joinCode.toUpperCase());
  if (!room) return res.status(404).json({ error: 'room not found' });

  const users = roomUsers(room.id);

  if (userId) {
    const existing = users.find((u) => u.id === userId);
    if (existing) return res.json({ room, user: existing });
  }

  if (users.length >= 2) {
    return res.status(400).json({ error: 'This room already has two people in it.', room, users });
  }

  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const newUserId = makeId();
  db.prepare('INSERT INTO users (id, room_id, name) VALUES (?, ?, ?)').run(newUserId, room.id, name.trim());

  res.status(201).json({ room, user: { id: newUserId, name: name.trim() } });
});

roomsRouter.get('/:roomId', (req, res) => {
  const room = db
    .prepare('SELECT id, join_code AS joinCode FROM rooms WHERE id = ?')
    .get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'room not found' });
  res.json({ room, users: roomUsers(room.id) });
});

roomsRouter.get('/:roomId/active-session', (req, res) => {
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'room not found' });

  const active = db
    .prepare(`SELECT id FROM sessions WHERE room_id = ? AND status = 'active'`)
    .get(room.id);
  res.json({ sessionId: active ? active.id : null });
});

roomsRouter.get('/:roomId/history', (req, res) => {
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'room not found' });

  const sessions = db
    .prepare(
      `SELECT id, status, started_at AS startedAt, completed_at AS completedAt, question_ids AS questionIds
       FROM sessions WHERE room_id = ? ORDER BY started_at DESC`
    )
    .all(room.id);

  const history = sessions.map((s) => {
    const plan = db.prepare('SELECT * FROM plans WHERE session_id = ?').get(s.id);
    const questionCount = JSON.parse(s.questionIds).length;
    const answerCount = db
      .prepare('SELECT COUNT(*) AS c FROM answers WHERE session_id = ?')
      .get(s.id).c;
    return {
      id: s.id,
      status: s.status,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      questionCount,
      answerCount,
      plan: plan ? { ...plan, steps: JSON.parse(plan.steps) } : null,
    };
  });

  res.json({ history });
});

roomsRouter.get('/:roomId/points', (req, res) => {
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'room not found' });

  const points = roomPoints(room.id);
  const badge = badgeForPoints(points);
  const tiersReached = badgeTiers.filter((t) => points >= t.min).length;
  const unlockedIdeas = dateNightIdeas.slice(0, Math.max(1, tiersReached * 2));

  res.json({ points, badge, badgeTiers, unlockedIdeas });
});
