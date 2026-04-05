/** 하단 영역 — 메인·로그인 페이지에서만 노출 */
export default function LayoutBottom() {
  const year = new Date().getFullYear();
  return (
    <footer style={footer}>
      <div style={inner}>
        <span style={muted}>© {year} ReportHub · 차트 PPT/PDF보내기 시스템</span>
      </div>
    </footer>
  );
}

const footer = {
  marginTop: 'auto',
  borderTop: '1px solid #e2e8f0',
  background: '#fff',
};

const inner = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '14px 24px',
};

const muted = {
  fontSize: 12,
  color: '#94a3b8',
};
