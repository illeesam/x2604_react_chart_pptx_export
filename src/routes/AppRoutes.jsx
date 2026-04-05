import { Routes, Route, Navigate } from 'react-router-dom';
import { appRoutes } from './routeConfig';
import { ROUTE_PATHS, DEFAULT_REDIRECT } from './routePaths';
import PrivateRoute from './PrivateRoute';

/** routeConfig 기반 라우트 트리 — 페이지 늘리면 routeConfig 만 수정 */
export default function AppRoutes() {
  return (
    <Routes>
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
      <Route
        path={ROUTE_PATHS.ROOT}
        element={<Navigate to={DEFAULT_REDIRECT} replace />}
      />
    </Routes>
  );
}
