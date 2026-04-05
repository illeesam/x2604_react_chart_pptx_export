import {
  resolveDataPage4,
  resolveDataPage5,
  resolveDataPage6,
  resolveDataPage7,
} from '../utils/previewDeckLayout';

/** 미리보기 0번 슬롯 — KPI·분기 실적·제품 비중·목표·보고서 구성 요약 */
export default function CoverPage({ data }) {
  if (!data) return null;

  const p4 = resolveDataPage4(data.dataPages.page4);
  const p5 = resolveDataPage5(data.dataPages.page5);
  const p6 = resolveDataPage6(data.dataPages.page6);
  const p7 = resolveDataPage7(data.dataPages.page7);
  const summary = p4.summary;

  // ── 상단 KPI 카드 데이터 ──
  const kpis = [
    { label: '총 매출', value: `₩${summary.totalRevenue}`, color: '#3b82f6', bg: '#eff6ff' },
    { label: '영업이익', value: `₩${summary.operatingProfit}`, color: '#10b981', bg: '#f0fdf4' },
    { label: '순이익', value: `₩${summary.netProfit}`, color: '#8b5cf6', bg: '#faf5ff' },
    { label: '순이익률', value: summary.profitMargin, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'YoY 성장률', value: summary.yoyGrowth, color: '#06b6d4', bg: '#ecfeff' },
    { label: 'NPS', value: `${p6.nps}점`, color: '#ec4899', bg: '#fdf2f8' },
    { label: '전체 고객', value: `${p6.totalCustomers.toLocaleString()}명`, color: '#6366f1', bg: '#eef2ff' },
    { label: 'CSAT', value: `${p6.csat} / 5.0`, color: '#14b8a6', bg: '#f0fdfa' },
  ];

  // ── 보고서 구성 안내 (P1~P7) ──
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
    <div className="box-border w-full bg-white px-6 py-5">
      {/* ── 히어로(제목·생성일) ── */}
      <div className="mb-4 rounded-[10px] bg-gradient-to-br from-slate-800 to-slate-700 px-6 py-5 text-white">
        <div className="mb-2 inline-block rounded bg-blue-500 px-2.5 py-1 text-[11px] font-bold">
          EXECUTIVE SUMMARY
        </div>
        <h1 className="mb-1.5 text-[22px] font-extrabold text-white">{data.reportTitle}</h1>
        <div className="text-xs text-slate-400">생성일: {data.generatedAt}</div>
      </div>

      {/* ── KPI 그리드 ── */}
      <div className="mb-3.5">
        <div className="mb-2 text-[13px] font-bold text-slate-600">핵심 경영 지표</div>
        <div className="grid grid-cols-4 gap-2.5">
          {kpis.map((k, i) => (
            <div
              key={i}
              className="rounded-md border border-slate-200 px-3 py-2.5 border-l-4"
              style={{ backgroundColor: k.bg, borderLeftColor: k.color }}
            >
              <div className="mb-1 text-[11px] text-slate-500">{k.label}</div>
              <div className="text-[15px] font-extrabold" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 분기 실적 / 제품 비중 ── */}
      <div className="mb-3.5 grid grid-cols-2 gap-3.5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-700">
            분기별 실적
          </div>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {['분기', '매출', '이익', '이익률'].map((h) => (
                  <th key={h} className="bg-slate-800 px-2 py-1.5 text-center font-semibold text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p4.quarterlyData.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                  <td className="border-b border-slate-100 px-2 py-1">{r.quarter}</td>
                  <td className="border-b border-slate-100 px-2 py-1 text-right">₩{r.revenue}</td>
                  <td className="border-b border-slate-100 px-2 py-1 text-right font-semibold text-emerald-600">
                    ₩{r.profit}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1 text-right text-blue-500">{r.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-700">
            제품별 매출 비중
          </div>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {['제품', '매출', '성장률', '비중'].map((h) => (
                  <th key={h} className="bg-slate-800 px-2 py-1.5 text-center font-semibold text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p5.products.map((p, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                  <td className="border-b border-slate-100 px-2 py-1 font-semibold">{p.name}</td>
                  <td className="border-b border-slate-100 px-2 py-1 text-right">₩{p.revenue}</td>
                  <td className="border-b border-slate-100 px-2 py-1 text-right text-emerald-600">{p.growth}</td>
                  <td className="border-b border-slate-100 px-2 py-1 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="h-1.5 min-w-[20px] rounded-sm bg-blue-500" style={{ width: p.share }} />
                      <span className="min-w-[30px] text-[10px]">{p.share}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 전략 목표 / 보고서 목차 ── */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-700">
            2025년 핵심 목표
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '매출 목표', value: `₩${p7.targets.revenueTarget}` },
              { label: '성장률', value: p7.targets.growthTarget },
              { label: '신규 고객', value: `${p7.targets.newCustomerTarget.toLocaleString()}명` },
              { label: 'NPS 목표', value: `${p7.targets.npsTarget}점` },
            ].map((t, i) => (
              <div key={i} className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-2 text-center">
                <div className="mb-1 text-[10px] text-blue-700">{t.label}</div>
                <div className="text-sm font-bold text-blue-900">{t.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-700">
            보고서 구성 (총 7페이지)
          </div>
          <div>
            {pageList.map((p, i) => (
              <div key={i} className="flex items-center gap-2 border-b border-slate-100 py-1">
                <span className="whitespace-nowrap rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {p.num}
                </span>
                <span className="text-[11px] text-slate-600">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
