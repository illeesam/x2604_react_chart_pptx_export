/**
 * 라우트 정의 (단일 출처)
 * - path: URL
 * - title: 페이지 제목·네비 라벨 등
 * - requiresAuth: true 이면 미로그인 접근 시 로그인 페이지로 이동
 * - showLayoutBottom: true 이면 LayoutMain 에서 LayoutBottom 표시
 *
 * 새 페이지: 아래 ROUTES 에 객체 한 줄 추가 후 routeConfig 의 PAGE_BY_KEY 에 컴포넌트 연결
 */
export const ROUTES = [
  {
    key: 'MAIN',
    path: '/main',
    title: '메인',
    requiresAuth: false,
    showLayoutBottom: true,
  },
  {
    key: 'REPORTS',
    path: '/reports',
    title: '보고서 목록',
    requiresAuth: true,
    showLayoutBottom: false,
  },
  {
    key: 'LOGIN',
    path: '/login',
    title: '로그인',
    requiresAuth: false,
    showLayoutBottom: true,
  },
];

/** 링크·Navigate 용 path 상수 ({ ROOT, MAIN, REPORTS, LOGIN }) */
export const ROUTE_PATHS = {
  ROOT: '/',
  ...Object.fromEntries(ROUTES.map((r) => [r.key, r.path])),
};

/** 접속 시 기본으로 보낼 경로 */
export const DEFAULT_REDIRECT = ROUTE_PATHS.MAIN;

function normalizePathname(pathname) {
  if (!pathname) return '';
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** 현재 URL 기준 LayoutBottom 표시 여부 */
export function shouldShowLayoutBottom(pathname) {
  const p = normalizePathname(pathname);
  const row = ROUTES.find((r) => r.path === p);
  return row?.showLayoutBottom ?? false;
}

/** 현재 URL 기준 인증 필요 여부 (등록되지 않은 경로는 false) */
export function requiresAuthForPath(pathname) {
  const p = normalizePathname(pathname);
  const row = ROUTES.find((r) => r.path === p);
  return row?.requiresAuth ?? false;
}
