import BaseMain from '../pages/BaseMain';
import ReportList from '../pages/ReportList';
import BaseLogin from '../pages/BaseLogin';
import { ROUTES, ROUTE_PATHS } from './routePaths';

const PAGE_BY_KEY = {
  BASE_MAIN: BaseMain,
  REPORT_LIST: ReportList,
  BASE_LOGIN: BaseLogin,
};

/** 상단 메뉴에 노출할 항목 (메인 | 보고서 목록) */
export const navMenuItems = [
  { path: ROUTE_PATHS.BASE_MAIN, label: '메인' },
  { path: ROUTE_PATHS.REPORT_LIST, label: '보고서 목록' },
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
