import LayoutHeader from './LayoutHeader';

/** 공통 페이지 래퍼 — 전체 배경, 상단 헤더, 본문(children) 영역 */
export default function LayoutBody({ children }) {
  return (
    <div style={shell}>
      <LayoutHeader />
      <main style={main}>{children}</main>
    </div>
  );
}

const shell = {
  minHeight: '100vh',
  background: '#f1f5f9',
};

const main = {
  paddingTop: 8,
};
