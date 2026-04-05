import { Routes, Route, Navigate } from 'react-router-dom';
import { appRoutes } from './routeConfig';
import { ROUTE_PATHS, DEFAULT_REDIRECT } from './routePaths';
import PrivateRoute from './PrivateRoute';

/** `appRoutes` 순회 — 인증 필요 시 `PrivateRoute` 래핑, `/` → `DEFAULT_REDIRECT` */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ── 등록 라우트 ── */}
      {appRoutes.map(({ path, Component, requiresAuth }) => (
        <Route
          key={path}
          path={path}
          element={
            requiresAuth ? (
              <PrivateRoute>
                <Component />
              </PrivateRoute>
            ) : (
              <Component />
            )
          }
        />
      ))}
      {/* ── 루트 리다이렉트 ── */}
      <Route
        path={ROUTE_PATHS.ROOT}
        element={<Navigate to={DEFAULT_REDIRECT} replace />}
      />
    </Routes>
  );
}
