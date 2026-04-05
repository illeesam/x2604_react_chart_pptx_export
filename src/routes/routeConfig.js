import MainPage from '../pages/MainPage';
import ListPage from '../pages/ListPage';
import LoginPage from '../pages/LoginPage';
import { ROUTES, ROUTE_PATHS } from './routePaths';

const PAGE_BY_KEY = {
  MAIN: MainPage,
  REPORTS: ListPage,
  LOGIN: LoginPage,
};

/** 상단 메뉴에 노출할 항목 (메인 | 보고서 목록) */
export const navMenuItems = [
  { path: ROUTE_PATHS.MAIN, label: '메인' },
  { path: ROUTE_PATHS.REPORTS, label: '보고서 목록' },
];

/**
 * 앱 라우트 목록 — ROUTES 메타(path, requiresAuth, showLayoutBottom, title) + 컴포넌트
 */
export const appRoutes = ROUTES.map((r) => ({
  path: r.path,
  Component: PAGE_BY_KEY[r.key],
  title: r.title,
  requiresAuth: r.requiresAuth,
  showLayoutBottom: r.showLayoutBottom,
}));
