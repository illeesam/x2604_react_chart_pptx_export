// 앱 루트 — 라우터 설정, 네비바, 페이지 라우팅
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ListPage from './pages/ListPage';

// 앱 전체 — BrowserRouter 로 URL 경로 표시
function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
        {/* 상단 고정 네비게이션 바 */}
        <nav style={navStyle}>
          <div style={navInner}>
            <span style={navLogo}>📊 ReportHub</span>
            <span style={navRight}>차트 PPT/PDF 내보내기 시스템</span>
          </div>
        </nav>

        {/* 페이지 라우팅 영역 */}
        <main style={{ paddingTop: 8 }}>
          <Routes>
            {/* 보고서 목록 — URL: /reports */}
            <Route path="/reports" element={<ListPage />} />
            {/* 루트 접근 시 /reports 로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/reports" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// 상단 고정 네비게이션 바 스타일
const navStyle = {
  background: 'linear-gradient(135deg, #1e293b, #334155)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

// 네비 내부 레이아웃 (로고·부제)
const navInner = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '14px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const navLogo  = { color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }; // 로고 텍스트
const navRight = { color: '#94a3b8', fontSize: 13 }; // 우측 부제

export default App;
