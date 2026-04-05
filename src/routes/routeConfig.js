import MainPage from '../pages/MainPage';
import ListPage from '../pages/ListPage';
import LoginPage from '../pages/LoginPage';
import { ROUTE_PATHS } from './routePaths';

/** 상단 메뉴에 노출할 항목 (메인 | 보고서 목록) */
export const navMenuItems = [
  { path: ROUTE_PATHS.MAIN, label: '메인' },
  { path: ROUTE_PATHS.REPORTS, label: '보고서 목록' },
];

/**
 * 앱 라우트 목록 — 새 페이지는 { path, Component, title? } 한 줄 추가
 * - path: routePaths.js 의 상수 사용 권장
 * - title: 메타·추후 브레드크럼용 (선택)
 */
export const appRoutes = [
  { path: ROUTE_PATHS.MAIN, Component: MainPage, title: '메인' },
  {
    path: ROUTE_PATHS.REPORTS,
    Component: ListPage,
    title: '보고서 목록',
    requiresAuth: true,
  },
  { path: ROUTE_PATHS.LOGIN, Component: LoginPage, title: '로그인' },
];
