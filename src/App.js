import React from 'react';
import ListPage from './components/ListPage';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* 상단 네비바 */}
      <nav style={navStyle}>
        <div style={navInner}>
          <span style={navLogo}>📊 ReportHub</span>
          <span style={navRight}>차트 PPT/PDF 내보내기 시스템</span>
        </div>
      </nav>
      {/* 메인 컨텐츠 */}
      <main style={{ paddingTop: 8 }}>
        <ListPage />
      </main>
    </div>
  );
}

const navStyle = {
  background: 'linear-gradient(135deg, #1e293b, #334155)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const navInner = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '14px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const navLogo = { color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' };
const navRight = { color: '#94a3b8', fontSize: 13 };

export default App;
