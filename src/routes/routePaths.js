/**
 * URL 경로 상수 — 링크·리다이렉트·routeConfig 에서 공통 사용
 * 새 페이지 추가 시 여기 path 를 먼저 정의하고 routeConfig 에 연결
 */
export const ROUTE_PATHS = {
  ROOT: '/',
  MAIN: '/main',
  REPORTS: '/reports',
  LOGIN: '/login',
};

/** 접속 시 기본으로 보낼 경로 (루트 / 등) */
export const DEFAULT_REDIRECT = ROUTE_PATHS.MAIN;
