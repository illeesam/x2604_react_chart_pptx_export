import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATHS } from './routePaths';

/** 인증 가드 — `user` 없으면 로그인으로, `state.from`에 되돌아갈 경로 저장 */
export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // ── 미로그인 → 로그인 페이지 ──
  if (!user) {
    return (
      <Navigate
        to={ROUTE_PATHS.BASE_LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
