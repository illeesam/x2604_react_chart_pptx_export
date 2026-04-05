import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATHS } from './routePaths';

/** 로그인 시에만 children 렌더, 미로그인이면 로그인으로 이동(state.from에 이전 경로 저장) */
export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

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
