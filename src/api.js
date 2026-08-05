const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  createRoom: (name) => request('/rooms', { method: 'POST', body: JSON.stringify({ name }) }),
  lookupRoom: (joinCode) => request(`/rooms/by-code/${joinCode}`),
  joinRoom: (joinCode, { name, userId }) =>
    request(`/rooms/by-code/${joinCode}/join`, {
      method: 'POST',
      body: JSON.stringify({ name, userId }),
    }),
  getRoom: (roomId) => request(`/rooms/${roomId}`),
  getPoints: (roomId) => request(`/rooms/${roomId}/points`),
  getHistory: (roomId) => request(`/rooms/${roomId}/history`),
  getActiveSession: (roomId) => request(`/rooms/${roomId}/active-session`),

  startSession: (roomId, questionCount = 5) =>
    request('/sessions', { method: 'POST', body: JSON.stringify({ roomId, questionCount }) }),
  getSession: (sessionId) => request(`/sessions/${sessionId}`),
  submitAnswer: (sessionId, userId, answerText) =>
    request(`/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ userId, answerText }),
    }),

  getPlan: (planId) => request(`/plans/${planId}`),
  savePlan: (planId, steps) =>
    request(`/plans/${planId}`, { method: 'PUT', body: JSON.stringify({ steps }) }),

  getQuestions: () => request('/questions'),
};
