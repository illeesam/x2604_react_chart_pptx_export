import { useLocation } from 'react-router-dom';
import LayoutHeader from './LayoutHeader';
import LayoutBottom from './LayoutBottom';
import { shouldShowLayoutBottom } from '../../routes/routePaths';

/** 공통 페이지 래퍼 — 전체 배경, 상단 헤더, 본문(children), routePaths 기준 조건부 하단 */
export default function LayoutMain({ children }) {
  const { pathname } = useLocation();
  const showBottom = shouldShowLayoutBottom(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <LayoutHeader />
      <main className="min-h-0 flex-1 pt-2">{children}</main>
      {showBottom ? <LayoutBottom /> : null}
    </div>
  );
}
