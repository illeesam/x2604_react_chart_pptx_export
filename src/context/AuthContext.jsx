/**
 * 전역 인증 — `baseLoginData.json` 사용자 목록 + 세션 복원, 폴백은 authDefaults
 */
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

/** sessionStorage 에 저장되는 로그인 사용자 JSON 키 */
const STORAGE_KEY = 'reporthub_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // 현재 로그인 사용자 { id, name, email } 또는 null
  const [loginCatalog, setLoginCatalog] = useState(null); // baseLoginData 응답 전체 (users, formHints)
  const [authReady, setAuthReady] = useState(false); // 로그인 JSON fetch 완료 여부 (폼 활성화·폴백 판단)

  // ── 새로고침 시 세션 복원 ──
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ── 로그인용 정적 JSON 로드 (실패 시 loginCatalog null → 데모 폴백) ──
  useEffect(() => {
    axios
      .get(API_JSON.baseLoginData)
      .then((res) => setLoginCatalog(res.data))
      .catch(() => setLoginCatalog(null))
      .finally(() => setAuthReady(true));
  }, []);

  /** 로그인 폼 기본값 — JSON 의 formHints 우선, 없으면 authDefaults */
  const formHints = useMemo(() => {
    const h = loginCatalog?.formHints;
    return {
      defaultId: h?.defaultId ?? DEFAULT_LOGIN_ID,
      defaultPassword: h?.defaultPassword ?? DEFAULT_LOGIN_PASSWORD,
    };
  }, [loginCatalog]);

  /**
   * id/password 검증 — users 배열이 있으면 그중 일치 행으로 세션 저장, 없으면 데모 계정만 허용
   * @returns {boolean} 성공 true
   */
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

  /** 세션·state 에서 사용자 제거 */
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Context 에 노출할 객체 (참조 안정화)
  const value = useMemo(
    () => ({ user, login, logout, authReady, formHints }),
    [user, login, logout, authReady, formHints],
  );
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** AuthProvider 하위에서만 사용 — { user, login, logout, authReady, formHints } */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용하세요.');
  }
  return ctx;
}
