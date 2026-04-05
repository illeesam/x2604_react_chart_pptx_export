import { useLocation } from 'react-router-dom';
import LayoutHeader from './LayoutHeader';
import LayoutBottom from './LayoutBottom';
import { shouldShowLayoutBottom } from '../../routes/routePaths';

/** 공통 셸 — 헤더 + `children`(페이지) + 경로별 선택적 푸터 */
export default function LayoutMain({ children }) {
  const { pathname } = useLocation();
  const showBottom = shouldShowLayoutBottom(pathname); // ROUTES[].showLayoutBottom 반영

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <LayoutHeader />
      {/* ── 페이지 본문 ── */}
      <main className="min-h-0 flex-1 pt-2">{children}</main>
      {showBottom ? <LayoutBottom /> : null}
    </div>
  );
}
