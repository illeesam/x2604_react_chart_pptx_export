import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../routes/routePaths';

// 메인(홈) — 안내 카드와 보고서 목록으로 이동
export default function BaseMain() {
  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <h1 style={s.title}>ReportHub에 오신 것을 환영합니다</h1>
        <p style={s.lead}>
          차트·데이터 기반 보고서를 미리보고 PDF, PPT, PPTX, HTML 등으로 보낼 수 있습니다.
        </p>
      </div>

      <div style={s.cards}>
        <Link to={ROUTE_PATHS.REPORT_LIST} style={s.card}>
          <span style={s.cardIcon}>📋</span>
          <span style={s.cardTitle}>보고서 목록</span>
          <span style={s.cardDesc}>보고서 미리보기 및 다운로드</span>
        </Link>
      </div>
    </div>
  );
}

const s = {
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  hero: { marginBottom: 28 },
  title: { margin: 0, fontSize: 26, fontWeight: 800, color: '#1e293b' },
  lead: { margin: '12px 0 0', fontSize: 15, color: '#64748b', lineHeight: 1.6 },
  cards: { display: 'flex', flexWrap: 'wrap', gap: 16 },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    padding: '22px 24px',
    minWidth: 260,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'box-shadow 0.15s, border-color 0.15s',
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#1e293b' },
  cardDesc: { fontSize: 13, color: '#64748b' },
};
