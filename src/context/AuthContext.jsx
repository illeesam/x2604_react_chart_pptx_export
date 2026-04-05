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
import axiosLib from '../utils/axiosLib';
import {
  DEFAULT_LOGIN_ID,
  DEFAULT_LOGIN_PASSWORD,
} from '../auth/authDefaults';
import { API_JSON } from '../utils/apiConfig';
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthTokenPersisted,
  generateAuthToken,
  readTokenFromLocalStorage,
  setAuthTokenPersisted,
  syncMemoryTokenFromStorage,
} from '../utils/authTokenStore';

/** sessionStorage 에 저장되는 로그인 사용자 JSON 키 */
const STORAGE_KEY = 'reporthub_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // 현재 로그인 사용자 { id, name, email } 또는 null
  const [authToken, setAuthToken] = useState(() => readTokenFromLocalStorage()); // API Bearer + localStorage 와 동기
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

  // ── 초기 로드: LS 토큰 → axios 인터셉터용 메모리 (`authToken` state 는 useState 초기값과 동일) ──
  useEffect(() => {
    setAuthTokenPersisted(readTokenFromLocalStorage());
  }, []);

  // ── 세션에만 user 가 남아 있고 토큰이 없으면 불일치 정리 ──
  useEffect(() => {
    if (!user) return;
    const t = readTokenFromLocalStorage();
    if (!t) {
      clearAuthTokenPersisted();
      setAuthToken(null);
      sessionStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }, [user]);

  // ── 로그인용 정적 JSON 로드 (실패 시 loginCatalog null → 데모 폴백) ──
  useEffect(() => {
    axiosLib
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
   * localStorage 토큰 변경·삭제를 React state·메모리에 반영 (다른 탭·개발자도구 삭제·포커스 복귀)
   */
  const applyTokenFromStorage = useCallback(() => {
    syncMemoryTokenFromStorage();
    const t = readTokenFromLocalStorage();
    setAuthToken(t);
    if (!t) {
      setUser((prev) => {
        if (prev) sessionStorage.removeItem(STORAGE_KEY);
        return null;
      });
    }
  }, []);

  // ── 다른 탭에서 LS 수정 시 ──
  useEffect(() => {
    const onStorage = (e) => {
      if (e.storageArea !== localStorage || e.key !== AUTH_TOKEN_STORAGE_KEY) return;
      applyTokenFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [applyTokenFromStorage]);

  // ── 같은 탭에서 LS 수동 삭제 후 포커스 복귀 시 동기화 ──
  useEffect(() => {
    window.addEventListener('focus', applyTokenFromStorage);
    return () => window.removeEventListener('focus', applyTokenFromStorage);
  }, [applyTokenFromStorage]);

  /**
   * id/password 검증 — users 배열이 있으면 그중 일치 행으로 세션 저장, 없으면 데모 계정만 허용
   * 성공 시 임의 Bearer 토큰 발급 → localStorage + state
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
          const token = generateAuthToken();
          setAuthTokenPersisted(token);
          setAuthToken(token);
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
        const token = generateAuthToken();
        setAuthTokenPersisted(token);
        setAuthToken(token);
        setUser(u);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return true;
      }
      return false;
    },
    [loginCatalog],
  );

  /** 세션·토큰·state 정리 */
  const logout = useCallback(() => {
    clearAuthTokenPersisted();
    setAuthToken(null);
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Context 에 노출할 객체 (참조 안정화)
  const value = useMemo(
    () => ({ user, authToken, login, logout, authReady, formHints }),
    [user, authToken, login, logout, authReady, formHints],
  );
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** AuthProvider 하위에서만 사용 — { user, authToken, login, logout, authReady, formHints } */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용하세요.');
  }
  return ctx;
}
