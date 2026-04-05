// Data01Widget — 데이터 페이지 (layoutType 별 레이아웃 + default export 라우터)
import React from 'react';
import {
  DATA_PAGE_LAYOUT_CLASS,
  resolveDataPage4,
  resolveDataPage5,
  resolveDataPage6,
  resolveDataPage7,
} from '../../utils/previewDeckLayout';

/** 슬롯 키 → JSON 에 layoutType 이 없을 때 기본 템플릿 */
const PAGE_KEY_TO_DEFAULT_LAYOUT = {
  page1: 'page1_stack',
  page2: 'page2_single',
  page3: 'page3_stack',
  page4: 'page4_stack',
};

function pageNumFromKey(pageKey) {
  const m = String(pageKey || '').match(/(\d+)/);
  return m ? Number(m[1]) : 1;
}

function AreaShell({ areaNo, children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-slate-100 bg-white p-1 ${className}`}
      data-area-no={areaNo}
    >
      {children}
    </section>
  );
}

function page1_stack({ data, pageNum }) {
  const flat = resolveDataPage4(data);
  const s = flat.summary;
  const layoutClass = data.layoutType
    ? DATA_PAGE_LAYOUT_CLASS[data.layoutType] || DATA_PAGE_LAYOUT_CLASS.page1_stack
    : '';

  const summaryCards = [
    { label: '총 매출', value: `₩${s.totalRevenue}`, color: '#3b82f6' },
    { label: '총 비용', value: `₩${s.totalCost}`, color: '#ef4444' },
    { label: '영업이익', value: `₩${s.operatingProfit}`, color: '#10b981' },
    { label: '순이익', value: `₩${s.netProfit}`, color: '#8b5cf6' },
    { label: '순이익률', value: s.profitMargin, color: '#f59e0b' },
    { label: 'YoY 성장률', value: s.yoyGrowth, color: '#06b6d4' },
  ];

  const kpiBlock = (
    <div className="mb-5 grid grid-cols-3 gap-3">
      {summaryCards.map((c, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 border-t-4"
          style={{ borderTopColor: c.color }}
        >
          <div className="mb-1.5 text-xs text-slate-500">{c.label}</div>
          <div className="text-base font-bold" style={{ color: c.color }}>{c.value}</div>
        </div>
      ))}
    </div>
  );

  const tableBlock = (
    <>
      <h3 className="mb-2.5 mt-5 text-[15px] font-bold text-slate-700">분기별 실적</h3>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {['분기', '매출', '비용', '이익', '이익률'].map((h) => (
              <th key={h} className="bg-slate-800 px-3 py-2 text-center font-semibold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(flat.quarterlyData || []).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
              <td className="border-b border-slate-200 px-3 py-2 text-left">{row.quarter}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right">₩{row.revenue}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right">₩{row.cost}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-emerald-600">
                ₩{row.profit}
              </td>
              <td className="border-b border-slate-200 px-3 py-2 text-right text-blue-500">{row.margin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className={`box-border w-full bg-white p-6 ${layoutClass}`}>
      <PageHeader num={pageNum} title={data.title} />
      {data.areas ? (
        <>
          <AreaShell areaNo="1">{kpiBlock}</AreaShell>
          <AreaShell areaNo="2" className="mt-2">{tableBlock}</AreaShell>
        </>
      ) : (
        <>
          {kpiBlock}
          {tableBlock}
        </>
      )}
    </div>
  );
}

function page2_single({ data, pageNum }) {
  const flat = resolveDataPage5(data);
  const layoutClass = data.layoutType
    ? DATA_PAGE_LAYOUT_CLASS[data.layoutType] || DATA_PAGE_LAYOUT_CLASS.page2_single
    : '';

  const table = (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          {['제품명', '매출', '판매수량', '평균단가', '성장률', '매출비중'].map((h) => (
            <th key={h} className="bg-slate-800 px-3 py-2 text-center font-semibold text-white">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(flat.products || []).map((p, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
            <td className="border-b border-slate-200 px-3 py-2 font-semibold">{p.name}</td>
            <td className="border-b border-slate-200 px-3 py-2 text-right">₩{p.revenue}</td>
            <td className="border-b border-slate-200 px-3 py-2 text-right">{p.units.toLocaleString()}</td>
            <td className="border-b border-slate-200 px-3 py-2 text-right">₩{p.avgPrice}</td>
            <td className="border-b border-slate-200 px-3 py-2 text-right text-emerald-600">{p.growth}</td>
            <td className="border-b border-slate-200 px-3 py-2 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <div className="h-2 rounded bg-blue-500" style={{ width: p.share }} />
                <span className="min-w-9 text-xs">{p.share}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={`box-border w-full bg-white p-6 ${layoutClass}`}>
      <PageHeader num={pageNum} title={data.title} />
      {data.areas ? <AreaShell areaNo="1">{table}</AreaShell> : table}
    </div>
  );
}

function page3_stack({ data, pageNum }) {
  const flat = resolveDataPage6(data);
  const layoutClass = data.layoutType
    ? DATA_PAGE_LAYOUT_CLASS[data.layoutType] || DATA_PAGE_LAYOUT_CLASS.page3_stack
    : '';

  const kpis = [
    { label: '전체 고객수', value: flat.totalCustomers.toLocaleString(), unit: '명' },
    { label: '신규 고객', value: flat.newCustomers.toLocaleString(), unit: '명' },
    { label: '이탈 고객', value: flat.churnedCustomers.toLocaleString(), unit: '명' },
    { label: 'NPS', value: flat.nps, unit: '점' },
    { label: 'CSAT', value: flat.csat, unit: '/5.0' },
  ];

  const kpiRow = (
    <div className="mb-5 flex gap-3">
      {kpis.map((k, i) => (
        <div
          key={i}
          className="flex-1 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-3.5 text-center"
        >
          <div className="mb-1 text-[11px] text-sky-700">{k.label}</div>
          <div className="text-xl font-extrabold text-sky-900">
            {k.value}
            <span className="ml-0.5 text-xs font-normal">{k.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const segTable = (
    <>
      <h3 className="mb-2.5 mt-5 text-[15px] font-bold text-slate-700">세그먼트별 현황</h3>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {['세그먼트', '고객수', '매출', '평균매출', '유지율'].map((h) => (
              <th key={h} className="bg-slate-800 px-3 py-2 text-center font-semibold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(flat.segments || []).map((seg, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
              <td className="border-b border-slate-200 px-3 py-2 font-semibold">{seg.segment}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right">{seg.count.toLocaleString()}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right">₩{seg.revenue}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right">₩{seg.avgRevenue}</td>
              <td
                className={`border-b border-slate-200 px-3 py-2 text-right font-semibold ${
                  parseFloat(seg.retention) >= 90 ? 'text-emerald-600' : 'text-amber-500'
                }`}
              >
                {seg.retention}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className={`box-border w-full bg-white p-6 ${layoutClass}`}>
      <PageHeader num={pageNum} title={data.title} />
      {data.areas ? (
        <>
          <AreaShell areaNo="1">{kpiRow}</AreaShell>
          <AreaShell areaNo="2" className="mt-2">{segTable}</AreaShell>
        </>
      ) : (
        <>
          {kpiRow}
          {segTable}
        </>
      )}
    </div>
  );
}

function page4_stack({ data, pageNum }) {
  const flat = resolveDataPage7(data);
  const t = flat.targets;
  const STATUS_COLOR = { 진행중: '#10b981', 계획: '#3b82f6', 완료: '#6366f1' };
  const PROB_COLOR = { 높음: '#ef4444', 중: '#f59e0b', 낮음: '#10b981' };
  const layoutClass = data.layoutType
    ? DATA_PAGE_LAYOUT_CLASS[data.layoutType] || DATA_PAGE_LAYOUT_CLASS.page4_stack
    : '';

  const targetsBlock = (
    <div className="mb-5 grid grid-cols-4 gap-3">
      {[
        { label: '매출 목표', value: `₩${t.revenueTarget}` },
        { label: '성장률 목표', value: t.growthTarget },
        { label: '신규 고객 목표', value: `${t.newCustomerTarget.toLocaleString()}명` },
        { label: 'NPS 목표', value: `${t.npsTarget}점` },
      ].map((item, i) => (
        <div key={i} className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3.5 text-center">
          <div className="mb-1 text-[11px] text-blue-700">{item.label}</div>
          <div className="text-base font-bold text-blue-900">{item.value}</div>
        </div>
      ))}
    </div>
  );

  const initTable = (
    <>
      <h3 className="mb-2.5 mt-5 text-[15px] font-bold text-slate-700">핵심 이니셔티브</h3>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {['과제명', '예산', '담당', '기한', '상태'].map((h) => (
              <th key={h} className="bg-slate-800 px-3 py-2 text-center font-semibold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(flat.initiatives || []).map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
              <td className="border-b border-slate-200 px-3 py-2 font-semibold">{r.name}</td>
              <td className="border-b border-slate-200 px-3 py-2 text-right">₩{r.budget}</td>
              <td className="border-b border-slate-200 px-3 py-2">{r.owner}</td>
              <td className="border-b border-slate-200 px-3 py-2">{r.deadline}</td>
              <td className="border-b border-slate-200 px-3 py-2">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: STATUS_COLOR[r.status] || '#94a3b8' }}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const riskTable = (
    <>
      <h3 className="mb-2.5 mt-5 text-[15px] font-bold text-slate-700">리스크 현황</h3>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {['리스크', '발생가능성', '영향도', '대응방안'].map((h) => (
              <th key={h} className="bg-slate-800 px-3 py-2 text-center font-semibold text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(flat.risks || []).map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
              <td className="border-b border-slate-200 px-3 py-2 font-semibold">{r.risk}</td>
              <td className="border-b border-slate-200 px-3 py-2">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: PROB_COLOR[r.probability] || '#94a3b8' }}
                >
                  {r.probability}
                </span>
              </td>
              <td className="border-b border-slate-200 px-3 py-2">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: PROB_COLOR[r.impact] || '#94a3b8' }}
                >
                  {r.impact}
                </span>
              </td>
              <td className="border-b border-slate-200 px-3 py-2 text-xs">{r.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className={`box-border w-full bg-white p-6 ${layoutClass}`}>
      <PageHeader num={pageNum} title={data.title} />
      {data.areas ? (
        <>
          <AreaShell areaNo="1">{targetsBlock}</AreaShell>
          <AreaShell areaNo="2" className="mt-2">{initTable}</AreaShell>
          <AreaShell areaNo="3" className="mt-2">{riskTable}</AreaShell>
        </>
      ) : (
        <>
          {targetsBlock}
          {initTable}
          {riskTable}
        </>
      )}
    </div>
  );
}

function PageHeader({ num, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b-2 border-blue-500 pb-3">
      <span className="rounded bg-blue-500 px-2.5 py-1 text-xs font-bold text-white">PAGE {num}</span>
      <h2 className="m-0 text-lg font-bold text-slate-800">{title}</h2>
    </div>
  );
}

const LAYOUTS = {
  page1_stack: page1_stack,
  page2_single: page2_single,
  page3_stack: page3_stack,
  page4_stack: page4_stack,
};

/** pageKey + data.layoutType(또는 pageKey 기본값)으로 레이아웃 분기 */
export default function Data01Widget({ data, pageKey }) {
  if (!data) return null;
  const lt = data.layoutType || PAGE_KEY_TO_DEFAULT_LAYOUT[pageKey];
  const Render = lt ? LAYOUTS[lt] : null;
  if (!Render) return null;
  const pageNum = pageNumFromKey(pageKey);
  return React.createElement(Render, { data, pageNum });
}
