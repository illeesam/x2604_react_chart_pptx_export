// Data01Widget — 데이터 페이지 컴포넌트 모음 (page4~7)

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
    <div className="box-border w-full bg-white p-6">
      <PageHeader num={4} title={data.title} />
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
          {data.quarterlyData.map((row, i) => (
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
    </div>
  );
}

export function DataPage5({ data }) {
  if (!data) return null;
  return (
    <div className="box-border w-full bg-white p-6">
      <PageHeader num={5} title={data.title} />
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
          {data.products.map((p, i) => (
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
    </div>
  );
}

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
    <div className="box-border w-full bg-white p-6">
      <PageHeader num={6} title={data.title} />
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
          {data.segments.map((seg, i) => (
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
    </div>
  );
}

export function DataPage7({ data }) {
  if (!data) return null;
  const t = data.targets;
  const STATUS_COLOR = { 진행중: '#10b981', 계획: '#3b82f6', 완료: '#6366f1' };
  const PROB_COLOR = { 높음: '#ef4444', 중: '#f59e0b', 낮음: '#10b981' };
  return (
    <div className="box-border w-full bg-white p-6">
      <PageHeader num={7} title={data.title} />
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
          {data.initiatives.map((r, i) => (
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
          {data.risks.map((r, i) => (
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
