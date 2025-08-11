import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { API_URL } from '../lib/config';

interface Tokens { accessToken: string; refreshToken: string; }
interface AuthContextValue {
  accessToken: string | null;
  role: 'ADMIN' | 'AUTHOR' | 'READER' | null;
  login: (t: Tokens) => void;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'AUTHOR' | 'READER' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const a = localStorage.getItem('accessToken');
    const r = localStorage.getItem('refreshToken');
  const rl = localStorage.getItem('role');
    if (a) setAccessToken(a);
    if (r) setRefreshToken(r);
  if (rl === 'ADMIN' || rl === 'AUTHOR' || rl === 'READER') setRole(rl);
  }, []);

  const decodeRole = (token: string): 'ADMIN' | 'AUTHOR' | 'READER' | null => {
    try { const payload = JSON.parse(atob(token.split('.')[1])); return payload.role || null; } catch { return null; }
  };

  const saveTokens = (tokens: Tokens) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    const rl = decodeRole(tokens.accessToken);
    setRole(rl);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    if (rl) localStorage.setItem('role', rl); else localStorage.removeItem('role');
  };

  const login = (t: Tokens) => saveTokens(t);
  const logout = () => {
    setAccessToken(null); setRefreshToken(null);
  setRole(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  };

  const attemptRefresh = useCallback(async () => {
    if (refreshing || !refreshToken) return false;
    setRefreshing(true);
    try {
  const res = await fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
      if (!res.ok) { logout(); return false; }
      const data = await res.json();
      saveTokens(data);
      return true;
    } finally { setRefreshing(false); }
  }, [refreshing, refreshToken]);

  const fetchWithAuth = useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    let res = await fetch(input, { ...init, headers });
    if (res.status === 401 && refreshToken) {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        const headers2 = new Headers(init.headers || {});
        const newAccess = localStorage.getItem('accessToken');
        if (newAccess) headers2.set('Authorization', `Bearer ${newAccess}`);
        res = await fetch(input, { ...init, headers: headers2 });
      }
    }
    return res;
  }, [accessToken, refreshToken, attemptRefresh]);

  return <AuthContext.Provider value={{ accessToken, role, login, logout, fetchWithAuth }}>{children}</AuthContext.Provider>;
};

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth outside provider'); return ctx; }
