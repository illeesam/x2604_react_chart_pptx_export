// 표지(page 0) — 핵심 KPI, 분기별 실적, 제품 TOP5, 2025 목표, 보고서 구성 요약

export default function CoverPage({ data }) {
  if (!data) return null;

  // 데이터 페이지 참조 (KPI·제품·고객·전략)
  const p4 = data.dataPages.page4;
  const p5 = data.dataPages.page5;
  const p6 = data.dataPages.page6;
  const p7 = data.dataPages.page7;
  // 경영 실적 요약 객체
  const s  = p4.summary;

  // 상단 핵심 KPI 카드 목록 (색상·배경 포함)
  const kpis = [
    { label: '총 매출',    value: `₩${s.totalRevenue}`,       color: '#3b82f6', bg: '#eff6ff' },
    { label: '영업이익',   value: `₩${s.operatingProfit}`,    color: '#10b981', bg: '#f0fdf4' },
    { label: '순이익',     value: `₩${s.netProfit}`,          color: '#8b5cf6', bg: '#faf5ff' },
    { label: '순이익률',   value: s.profitMargin,              color: '#f59e0b', bg: '#fffbeb' },
    { label: 'YoY 성장률', value: s.yoyGrowth,                color: '#06b6d4', bg: '#ecfeff' },
    { label: 'NPS',        value: `${p6.nps}점`,              color: '#ec4899', bg: '#fdf2f8' },
    { label: '전체 고객',  value: `${p6.totalCustomers.toLocaleString()}명`, color: '#6366f1', bg: '#eef2ff' },
    { label: 'CSAT',       value: `${p6.csat} / 5.0`,         color: '#14b8a6', bg: '#f0fdfa' },
  ];

  // 보고서 페이지 구성 목록 (표지 하단 안내용)
  const pageList = [
    { num: 'P1', label: '월별 매출 추이 / 분기별 비용 / 매출 비중 / 고객 세그먼트' },
    { num: 'P2', label: 'KPI 달성률 / 지역 분포 / 제품 포지셔닝 / 광고비 상관관계' },
    { num: 'P3', label: 'TOP10 제품 / 채널별 주문 / 가입자 성장 / 매출 달성률' },
    { num: 'P4', label: '경영 실적 요약 (분기별 매출·비용·이익)' },
    { num: 'P5', label: '제품별 성과 분석 (매출·수량·단가·성장률)' },
    { num: 'P6', label: '고객 분석 (세그먼트별 매출·유지율)' },
    { num: 'P7', label: '2025년 전략 계획 (이니셔티브·리스크)' },
  ];

  return (
    <div style={s_.page}>
      {/* 헤더 — 보고서 제목·생성일 */}
      <div style={s_.header}>
        <div style={s_.badge}>EXECUTIVE SUMMARY</div>
        <h1 style={s_.title}>{data.reportTitle}</h1>
        <div style={s_.meta}>생성일: {data.generatedAt}</div>
      </div>

      {/* KPI 그리드 — 8개 핵심 지표 카드 */}
      <div style={s_.section}>
        <div style={s_.sectionTitle}>핵심 경영 지표</div>
        <div style={s_.kpiGrid}>
          {kpis.map((k, i) => (
            <div key={i} style={{ ...s_.kpiCard, background: k.bg, borderLeft: `4px solid ${k.color}` }}>
              <div style={s_.kpiLabel}>{k.label}</div>
              <div style={{ ...s_.kpiValue, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2열 레이아웃 — 분기별 실적 표 + 제품별 매출 비중 표 */}
      <div style={s_.twoCol}>
        {/* 분기별 실적 테이블 */}
        <div style={s_.card}>
          <div style={s_.cardTitle}>분기별 실적</div>
          <table style={s_.table}>
            <thead>
              <tr>
                {['분기','매출','이익','이익률'].map(h =>
                  <th key={h} style={s_.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {p4.quarterlyData.map((r, i) => (
                <tr key={i} style={i % 2 === 0 ? s_.trEven : {}}>
                  <td style={s_.td}>{r.quarter}</td>
                  <td style={s_.tdR}>₩{r.revenue}</td>
                  <td style={{ ...s_.tdR, color: '#10b981', fontWeight: 600 }}>₩{r.profit}</td>
                  <td style={{ ...s_.tdR, color: '#3b82f6' }}>{r.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 제품 매출 비중 테이블 (막대 바 포함) */}
        <div style={s_.card}>
          <div style={s_.cardTitle}>제품별 매출 비중</div>
          <table style={s_.table}>
            <thead>
              <tr>
                {['제품','매출','성장률','비중'].map(h =>
                  <th key={h} style={s_.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {p5.products.map((p, i) => (
                <tr key={i} style={i % 2 === 0 ? s_.trEven : {}}>
                  <td style={{ ...s_.td, fontWeight: 600 }}>{p.name}</td>
                  <td style={s_.tdR}>₩{p.revenue}</td>
                  <td style={{ ...s_.tdR, color: '#10b981' }}>{p.growth}</td>
                  <td style={s_.tdR}>
                    {/* 비중 게이지 바 */}
                    <div style={s_.bar}>
                      <div style={{ ...s_.barFill, width: p.share }} />
                      <span style={s_.barTxt}>{p.share}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2열 레이아웃 — 2025 핵심 목표 + 보고서 페이지 구성 */}
      <div style={s_.twoCol}>
        {/* 2025년 핵심 목표 카드 그리드 */}
        <div style={s_.card}>
          <div style={s_.cardTitle}>2025년 핵심 목표</div>
          <div style={s_.targetGrid}>
            {[
              { label: '매출 목표',   value: `₩${p7.targets.revenueTarget}` },
              { label: '성장률',      value: p7.targets.growthTarget },
              { label: '신규 고객',   value: `${p7.targets.newCustomerTarget.toLocaleString()}명` },
              { label: 'NPS 목표',    value: `${p7.targets.npsTarget}점` },
            ].map((t, i) => (
              <div key={i} style={s_.targetCard}>
                <div style={s_.targetLabel}>{t.label}</div>
                <div style={s_.targetValue}>{t.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 보고서 페이지 구성 목록 */}
        <div style={s_.card}>
          <div style={s_.cardTitle}>보고서 구성 (총 7페이지)</div>
          <div>
            {pageList.map((p, i) => (
              <div key={i} style={s_.pageRow}>
                <span style={s_.pageNum}>{p.num}</span>
                <span style={s_.pageLabel}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 인라인 스타일 모음
const s_ = {
  page: { width: '100%', padding: '20px 24px', boxSizing: 'border-box', background: '#fff' },

  header: {
    background: 'linear-gradient(135deg,#1e293b,#334155)',
    borderRadius: 10, padding: '20px 24px', marginBottom: 16, color: '#fff',
  },
  badge: {
    display: 'inline-block', background: '#3b82f6', color: '#fff',
    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 8,
  },
  title: { margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#fff' },
  meta: { color: '#94a3b8', fontSize: 12 },

  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 },

  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  kpiCard: { padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' },
  kpiLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  kpiValue: { fontSize: 15, fontWeight: 800 },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  card: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#fafafa' },
  cardTitle: { fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  th: { background: '#1e293b', color: '#fff', padding: '5px 8px', textAlign: 'center', fontWeight: 600 },
  td: { padding: '4px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 11 },
  tdR: { padding: '4px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 11, textAlign: 'right' },
  trEven: { background: '#f8fafc' },

  bar: { display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  barFill: { height: 6, borderRadius: 3, background: '#3b82f6' },
  barTxt: { fontSize: 10, minWidth: 30 },

  targetGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  targetCard: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '8px 10px', textAlign: 'center' },
  targetLabel: { fontSize: 10, color: '#1d4ed8', marginBottom: 3 },
  targetValue: { fontSize: 14, fontWeight: 700, color: '#1e3a8a' },

  pageRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', borderBottom: '1px solid #f1f5f9' },
  pageNum: { background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' },
  pageLabel: { fontSize: 11, color: '#475569' },
};
