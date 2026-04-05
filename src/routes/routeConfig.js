import BaseMain from '../pages/BaseMain';
import ReportList from '../pages/ReportList';
import BaseLogin from '../pages/BaseLogin';
import { ROUTES, ROUTE_PATHS } from './routePaths';

/** ROUTES[].key → 페이지 컴포넌트 (새 페이지 시 여기에 한 줄 추가) */
const PAGE_BY_KEY = {
  BASE_MAIN: BaseMain,
  REPORT_LIST: ReportList,
  BASE_LOGIN: BaseLogin,
};

// ── LayoutHeader 네비 항목 ──
export const navMenuItems = [
  { path: ROUTE_PATHS.BASE_MAIN, label: '메인' },
  { path: ROUTE_PATHS.REPORT_LIST, label: '보고서 목록' },
];

/** `AppRoutes`용 — 메타(ROUTES) + 실제 컴포넌트 매핑 */
export const appRoutes = ROUTES.map((r) => ({
  path: r.path,
  Component: PAGE_BY_KEY[r.key],
  title: r.title,
  requiresAuth: r.requiresAuth,
  showLayoutBottom: r.showLayoutBottom,
}));
