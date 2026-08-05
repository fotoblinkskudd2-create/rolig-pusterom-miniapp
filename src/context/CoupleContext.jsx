import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const CoupleContext = createContext(null);

const STORAGE_KEY = 'couple-connect:me';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CoupleProvider({ children }) {
  const [me, setMe] = useState(loadStored);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    if (me) localStorage.setItem(STORAGE_KEY, JSON.stringify(me));
    else localStorage.removeItem(STORAGE_KEY);
  }, [me]);

  const refreshRoom = useCallback(async () => {
    if (!me) return;
    const { users } = await api.getRoom(me.roomId);
    const other = users.find((u) => u.id !== me.userId) || null;
    setPartner(other);
    return users;
  }, [me]);

  useEffect(() => {
    if (me) refreshRoom().catch(() => {});
  }, [me, refreshRoom]);

  const createRoom = useCallback(async (name) => {
    const { room, user } = await api.createRoom(name);
    setMe({ roomId: room.id, joinCode: room.joinCode, userId: user.id, name: user.name });
  }, []);

  const joinRoom = useCallback(async (joinCode, name) => {
    const { room, user } = await api.joinRoom(joinCode, { name });
    setMe({ roomId: room.id, joinCode: room.joinCode, userId: user.id, name: user.name });
  }, []);

  const leaveRoom = useCallback(() => {
    setMe(null);
    setPartner(null);
  }, []);

  const value = { me, partner, createRoom, joinRoom, leaveRoom, refreshRoom };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export function useCouple() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used inside CoupleProvider');
  return ctx;
}
