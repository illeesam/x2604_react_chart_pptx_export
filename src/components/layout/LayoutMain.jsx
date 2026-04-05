import { useLocation } from 'react-router-dom';
import LayoutHeader from './LayoutHeader';
import LayoutBottom from './LayoutBottom';
import { ROUTE_PATHS } from '../../routes/routePaths';

/** 메인·로그인에서만 하단(LayoutBottom) 표시 */
const BOTTOM_PATHS = new Set([ROUTE_PATHS.MAIN, ROUTE_PATHS.LOGIN]);

/** 공통 페이지 래퍼 — 전체 배경, 상단 헤더, 본문(children), 조건부 하단 */
export default function LayoutMain({ children }) {
  const { pathname } = useLocation();
  const showBottom = BOTTOM_PATHS.has(pathname);

  return (
    <div style={shell}>
      <LayoutHeader />
      <main style={main}>{children}</main>
      {showBottom ? <LayoutBottom /> : null}
    </div>
  );
}

const shell = {
  minHeight: '100vh',
  background: '#f1f5f9',
  display: 'flex',
  flexDirection: 'column',
};

const main = {
  flex: 1,
  paddingTop: 8,
  minHeight: 0,
};
