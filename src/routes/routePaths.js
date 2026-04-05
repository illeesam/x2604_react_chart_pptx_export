/**
 * 라우트 정의 (단일 출처)
 * - path: URL
 * - title: 페이지 제목·네비 라벨 등
 * - requiresAuth: true 이면 미로그인 접근 시 로그인 페이지로 이동
 * - showLayoutBottom: true 이면 LayoutMain 에서 LayoutBottom 표시
 *
 * 새 페이지: 아래 ROUTES 에 객체 한 줄 추가 후 routeConfig 의 PAGE_BY_KEY 에 컴포넌트 연결
 */

// ── 라우트 메타 (단일 출처) ──
export const ROUTES = [
  {
    key: 'BASE_MAIN',
    path: '/baseMain',
    title: '메인',
    requiresAuth: false,
    showLayoutBottom: true,
  },
  {
    key: 'REPORT_LIST',
    path: '/reportList',
    title: '보고서 목록',
    requiresAuth: true,
    showLayoutBottom: false,
  },
  {
    key: 'BASE_LOGIN',
    path: '/baseLogin',
    title: '로그인',
    requiresAuth: false,
    showLayoutBottom: true,
  },
];

// ── 코드에서 쓰는 path 상수 (ROUTES에서 파생) ──
export const ROUTE_PATHS = {
  ROOT: '/',
  ...Object.fromEntries(ROUTES.map((r) => [r.key, r.path])),
};

export const DEFAULT_REDIRECT = ROUTE_PATHS.BASE_MAIN;

/** trailing slash 제거 등 경로 정규화 */
function normalizePathname(pathname) {
  if (!pathname) return '';
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

// ── LayoutMain 에서 사용하는 헬퍼 ──

/** 등록된 path에 대응하는 `showLayoutBottom` */
export function shouldShowLayoutBottom(pathname) {
  const p = normalizePathname(pathname);
  const row = ROUTES.find((r) => r.path === p);
  return row?.showLayoutBottom ?? false;
}

/** 등록된 path에 대응하는 `requiresAuth` */
export function requiresAuthForPath(pathname) {
  const p = normalizePathname(pathname);
  const row = ROUTES.find((r) => r.path === p);
  return row?.requiresAuth ?? false;
}
