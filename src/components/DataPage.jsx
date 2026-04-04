import React from 'react';

/* ──────────────────────────────────────────
   Page 4 – 경영 실적 요약
────────────────────────────────────────── */
export function DataPage4({ data }) {
  if (!data) return null;
  const s = data.summary;
  const summaryCards = [
    { label: '총 매출', value: `₩${s.totalRevenue}`, color: '#3b82f6' },
    { label: '총 비용', value: `₩${s.totalCost}`, color: '#ef4444' },
    { label: '영업이익', value: `₩${s.operatingProfit}`, color: '#10b981' },
    { label: '순이익', value: `₩${s.netProfit}`, color: '#8b5cf6' },
    { label: '순이익률', value: s.profitMargin, color: '#f59e0b' },
    { label: 'YoY 성장률', value: s.yoyGrowth, color: '#06b6d4' },
  ];
  return (
    <div style={pg.page}>
      <PageHeader num={4} title={data.title} />
      <div style={pg.summaryGrid}>
        {summaryCards.map((c, i) => (
          <div key={i} style={{ ...pg.summaryCard, borderTop: `4px solid ${c.color}` }}>
            <div style={pg.cardLabel}>{c.label}</div>
            <div style={{ ...pg.cardValue, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <h3 style={pg.sectionTitle}>분기별 실적</h3>
      <table style={pg.table}>
        <thead>
          <tr>{['분기','매출','비용','이익','이익률'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.quarterlyData.map((row, i) => (
            <tr key={i} style={i % 2 === 0 ? pg.trEven : {}}>
              <td style={pg.td}>{row.quarter}</td>
              <td style={pg.tdR}>₩{row.revenue}</td>
              <td style={pg.tdR}>₩{row.cost}</td>
              <td style={{ ...pg.tdR, color: '#10b981', fontWeight: 600 }}>₩{row.profit}</td>
              <td style={{ ...pg.tdR, color: '#3b82f6' }}>{row.margin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────
   Page 5 – 제품별 성과
────────────────────────────────────────── */
export function DataPage5({ data }) {
  if (!data) return null;
  return (
    <div style={pg.page}>
      <PageHeader num={5} title={data.title} />
      <table style={pg.table}>
        <thead>
          <tr>{['제품명','매출','판매수량','평균단가','성장률','매출비중'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.products.map((p, i) => (
            <tr key={i} style={i % 2 === 0 ? pg.trEven : {}}>
              <td style={{ ...pg.td, fontWeight: 600 }}>{p.name}</td>
              <td style={pg.tdR}>₩{p.revenue}</td>
              <td style={pg.tdR}>{p.units.toLocaleString()}</td>
              <td style={pg.tdR}>₩{p.avgPrice}</td>
              <td style={{ ...pg.tdR, color: '#10b981' }}>{p.growth}</td>
              <td style={pg.tdR}>
                <div style={pg.barWrap}>
                  <div style={{ ...pg.barFill, width: p.share, background: '#3b82f6' }} />
                  <span style={pg.barLabel}>{p.share}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────
   Page 6 – 고객 분석
────────────────────────────────────────── */
export function DataPage6({ data }) {
  if (!data) return null;
  const kpis = [
    { label: '전체 고객수', value: data.totalCustomers.toLocaleString(), unit: '명' },
    { label: '신규 고객', value: data.newCustomers.toLocaleString(), unit: '명' },
    { label: '이탈 고객', value: data.churnedCustomers.toLocaleString(), unit: '명' },
    { label: 'NPS', value: data.nps, unit: '점' },
    { label: 'CSAT', value: data.csat, unit: '/5.0' },
  ];
  return (
    <div style={pg.page}>
      <PageHeader num={6} title={data.title} />
      <div style={pg.kpiRow}>
        {kpis.map((k, i) => (
          <div key={i} style={pg.kpiCard}>
            <div style={pg.kpiLabel}>{k.label}</div>
            <div style={pg.kpiValue}>{k.value}<span style={pg.kpiUnit}>{k.unit}</span></div>
          </div>
        ))}
      </div>
      <h3 style={pg.sectionTitle}>세그먼트별 현황</h3>
      <table style={pg.table}>
        <thead>
          <tr>{['세그먼트','고객수','매출','평균매출','유지율'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.segments.map((s, i) => (
            <tr key={i} style={i % 2 === 0 ? pg.trEven : {}}>
              <td style={{ ...pg.td, fontWeight: 600 }}>{s.segment}</td>
              <td style={pg.tdR}>{s.count.toLocaleString()}</td>
              <td style={pg.tdR}>₩{s.revenue}</td>
              <td style={pg.tdR}>₩{s.avgRevenue}</td>
              <td style={{ ...pg.tdR, color: parseFloat(s.retention) >= 90 ? '#10b981' : '#f59e0b' }}>{s.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────
   Page 7 – 2025 전략 계획
────────────────────────────────────────── */
export function DataPage7({ data }) {
  if (!data) return null;
  const t = data.targets;
  const STATUS_COLOR = { '진행중': '#10b981', '계획': '#3b82f6', '완료': '#6366f1' };
  const PROB_COLOR = { '높음': '#ef4444', '중': '#f59e0b', '낮음': '#10b981' };
  return (
    <div style={pg.page}>
      <PageHeader num={7} title={data.title} />
      <div style={pg.targetGrid}>
        {[
          { label: '매출 목표', value: `₩${t.revenueTarget}` },
          { label: '성장률 목표', value: t.growthTarget },
          { label: '신규 고객 목표', value: `${t.newCustomerTarget.toLocaleString()}명` },
          { label: 'NPS 목표', value: `${t.npsTarget}점` },
        ].map((item, i) => (
          <div key={i} style={pg.targetCard}>
            <div style={pg.targetLabel}>{item.label}</div>
            <div style={pg.targetValue}>{item.value}</div>
          </div>
        ))}
      </div>
      <h3 style={pg.sectionTitle}>핵심 이니셔티브</h3>
      <table style={pg.table}>
        <thead>
          <tr>{['과제명','예산','담당','기한','상태'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.initiatives.map((r, i) => (
            <tr key={i} style={i % 2 === 0 ? pg.trEven : {}}>
              <td style={{ ...pg.td, fontWeight: 600 }}>{r.name}</td>
              <td style={pg.tdR}>₩{r.budget}</td>
              <td style={pg.td}>{r.owner}</td>
              <td style={pg.td}>{r.deadline}</td>
              <td style={pg.td}>
                <span style={{ ...pg.badge, background: STATUS_COLOR[r.status] || '#94a3b8' }}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={pg.sectionTitle}>리스크 현황</h3>
      <table style={pg.table}>
        <thead>
          <tr>{['리스크','발생가능성','영향도','대응방안'].map(h => <th key={h} style={pg.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.risks.map((r, i) => (
            <tr key={i} style={i % 2 === 0 ? pg.trEven : {}}>
              <td style={{ ...pg.td, fontWeight: 600 }}>{r.risk}</td>
              <td style={pg.td}><span style={{ ...pg.badge, background: PROB_COLOR[r.probability] || '#94a3b8' }}>{r.probability}</span></td>
              <td style={pg.td}><span style={{ ...pg.badge, background: PROB_COLOR[r.impact] || '#94a3b8' }}>{r.impact}</span></td>
              <td style={{ ...pg.td, fontSize: 12 }}>{r.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────
   Shared sub-components
────────────────────────────────────────── */
function PageHeader({ num, title }) {
  return (
    <div style={pg.pageHeader}>
      <span style={pg.pageNum}>PAGE {num}</span>
      <h2 style={pg.pageTitle}>{title}</h2>
    </div>
  );
}

const pg = {
  page: { width: '100%', padding: 24, boxSizing: 'border-box', background: '#fff' },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #3b82f6' },
  pageNum: { background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 4 },
  pageTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#334155', margin: '20px 0 10px' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 },
  summaryCard: { padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' },
  cardLabel: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  cardValue: { fontSize: 16, fontWeight: 700 },

  kpiRow: { display: 'flex', gap: 12, marginBottom: 20 },
  kpiCard: { flex: 1, padding: 14, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', textAlign: 'center' },
  kpiLabel: { fontSize: 11, color: '#0369a1', marginBottom: 4 },
  kpiValue: { fontSize: 20, fontWeight: 800, color: '#0c4a6e' },
  kpiUnit: { fontSize: 12, fontWeight: 400, marginLeft: 2 },

  targetGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  targetCard: { padding: 14, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' },
  targetLabel: { fontSize: 11, color: '#1d4ed8', marginBottom: 4 },
  targetValue: { fontSize: 16, fontWeight: 700, color: '#1e3a8a' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: '#1e293b', color: '#fff', padding: '8px 12px', textAlign: 'center', fontWeight: 600 },
  td: { padding: '7px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' },
  tdR: { padding: '7px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' },
  trEven: { background: '#f8fafc' },

  barWrap: { display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  barFill: { height: 8, borderRadius: 4 },
  barLabel: { fontSize: 12, minWidth: 36 },

  badge: { display: 'inline-block', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10 },
};
