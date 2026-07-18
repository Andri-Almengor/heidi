import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { publicApi } from '../api/publicApi';
import { STORAGE_KEYS } from '../utils/constants';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

const GuestContext = createContext(null);

export function GuestProvider({ children }) {
  const [token, setToken] = useState(() => readStorage(STORAGE_KEYS.guestToken, ''));
  const [participant, setParticipant] = useState(() => readStorage(STORAGE_KEYS.guestParticipant, null));
  const [session, setSession] = useState(() => readStorage(STORAGE_KEYS.guestSession, null));
  const [loading, setLoading] = useState(false);

  const join = useCallback(async (publicCode, guestName) => {
    setLoading(true);
    try {
      const result = await publicApi.join(publicCode, guestName);
      setToken(result.token);
      setParticipant(result.participant);
      setSession(result.session);
      writeStorage(STORAGE_KEYS.guestToken, result.token);
      writeStorage(STORAGE_KEYS.guestParticipant, result.participant);
      writeStorage(STORAGE_KEYS.guestSession, result.session);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParticipant = useCallback((nextParticipant) => {
    setParticipant(nextParticipant);
    writeStorage(STORAGE_KEYS.guestParticipant, nextParticipant);
  }, []);

  const clearGuest = useCallback(() => {
    removeStorage(STORAGE_KEYS.guestToken, STORAGE_KEYS.guestParticipant, STORAGE_KEYS.guestSession);
    setToken('');
    setParticipant(null);
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    token,
    participant,
    session,
    loading,
    isGuestAuthenticated: Boolean(token && participant),
    join,
    updateParticipant,
    clearGuest,
  }), [token, participant, session, loading, join, updateParticipant, clearGuest]);

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) throw new Error('useGuest must be used within GuestProvider.');
  return context;
}
