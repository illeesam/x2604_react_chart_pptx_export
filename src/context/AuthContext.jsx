import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import axios from 'axios';
import {
  DEFAULT_LOGIN_ID,
  DEFAULT_LOGIN_PASSWORD,
} from '../auth/authDefaults';
import { API_JSON } from '../utils/apiConfig';

const STORAGE_KEY = 'reporthub_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginCatalog, setLoginCatalog] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    axios
      .get(API_JSON.login)
      .then((res) => setLoginCatalog(res.data))
      .catch(() => setLoginCatalog(null))
      .finally(() => setAuthReady(true));
  }, []);

  const formHints = useMemo(() => {
    const h = loginCatalog?.formHints;
    return {
      defaultId: h?.defaultId ?? DEFAULT_LOGIN_ID,
      defaultPassword: h?.defaultPassword ?? DEFAULT_LOGIN_PASSWORD,
    };
  }, [loginCatalog]);

  const login = useCallback(
    (id, password) => {
      const users = loginCatalog?.users;
      if (Array.isArray(users) && users.length > 0) {
        const row = users.find((u) => u.id === id && u.password === password);
        if (row) {
          const u = {
            id: row.id,
            name: row.name ?? row.id,
            email: row.email ?? '',
          };
          setUser(u);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          return true;
        }
        return false;
      }
      if (id === DEFAULT_LOGIN_ID && password === DEFAULT_LOGIN_PASSWORD) {
        const u = {
          id,
          name: '데모 사용자',
          email: 'demo@reporthub.local',
        };
        setUser(u);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return true;
      }
      return false;
    },
    [loginCatalog],
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, authReady, formHints }),
    [user, login, logout, authReady, formHints],
  );
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용하세요.');
  }
  return ctx;
}
