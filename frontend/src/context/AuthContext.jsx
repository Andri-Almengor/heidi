import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { STORAGE_KEYS } from '../utils/constants';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStorage(STORAGE_KEYS.adminToken, ''));
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.adminUser, null));
  const [loading, setLoading] = useState(false);

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken || '');
    setUser(nextUser || null);
    writeStorage(STORAGE_KEYS.adminToken, nextToken || null);
    writeStorage(STORAGE_KEYS.adminUser, nextUser || null);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const result = await adminApi.login(credentials);
      persist(result.token, result.user);
      return result;
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const logout = useCallback(async () => {
    try {
      if (token) await adminApi.logout(token);
    } catch {
      // Local sign-out must still work when the remote service is unavailable.
    } finally {
      removeStorage(STORAGE_KEYS.adminToken, STORAGE_KEYS.adminUser);
      setToken('');
      setUser(null);
    }
  }, [token]);

  const updatePassword = useCallback(async (values) => {
    const result = await adminApi.changePassword(token, values);
    const nextToken = result.token || token;
    const nextUser = { ...user, mustChangePassword: false };
    persist(nextToken, nextUser);
    return result;
  }, [persist, token, user]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const result = await adminApi.me(token);
    persist(token, result.user);
    return result.user;
  }, [persist, token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    updatePassword,
    refreshProfile,
  }), [token, user, loading, login, logout, updatePassword, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
