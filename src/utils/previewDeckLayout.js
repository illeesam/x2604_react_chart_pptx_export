/**
 * previewModal 차트·데이터 페이지 — layoutType + areas(areaNo) ↔ 레거시 평면 구조
 */

/** layoutType → Tailwind grid cols (행은 자동) */
export const CHART_LAYOUT_GRID_CLASS = {
  grid2x2: 'grid-cols-2',
  grid2x3: 'grid-cols-2',
  grid3x2: 'grid-cols-3',
  grid1x1: 'grid-cols-1',
};

/**
 * 차트 페이지 데이터에서 차트 배열 추출 (레거시 chart1.. 또는 areas)
 * @returns {{ charts: object[], layoutType: string, title: string }}
 */
export function resolveChartPageLayout(pageData) {
  if (!pageData) {
    return { charts: [], layoutType: 'grid2x3', title: '' };
  }
  const title = pageData.title ?? '';

  if (pageData.areas && typeof pageData.areas === 'object') {
    const layoutType = pageData.layoutType || 'grid2x3';
    const keys = Object.keys(pageData.areas).sort((a, b) => Number(a) - Number(b));
    const charts = keys
      .map((k) => pageData.areas[k])
      .filter(Boolean)
      .map((cell) => (cell && typeof cell === 'object' && cell.chart ? cell.chart : cell));
    return { charts, layoutType, title };
  }

  const legacy = [1, 2, 3, 4, 5, 6]
    .map((n) => pageData[`chart${n}`])
    .filter(Boolean);
  const n = legacy.length;
  const layoutType =
    pageData.layoutType || (n <= 4 ? 'grid2x2' : 'grid2x3');
  return { charts: legacy, layoutType, title };
}

/** ── Data 페이지: areas → 컴포넌트가 쓰는 평면 data ── */

export function resolveDataPage4(data) {
  if (!data?.areas) return data;
  const a1 = data.areas['1'] || {};
  const a2 = data.areas['2'] || {};
  return {
    title: data.title,
    summary: a1.summary ?? a1,
    quarterlyData: a2.quarterlyData ?? a2.rows ?? [],
  };
}

export function resolveDataPage5(data) {
  if (!data?.areas) return data;
  const a1 = data.areas['1'] || {};
  return {
    title: data.title,
    products: a1.products ?? [],
  };
}

export function resolveDataPage6(data) {
  if (!data?.areas) return data;
  const a1 = data.areas['1'] || {};
  const a2 = data.areas['2'] || {};
  return {
    title: data.title,
    totalCustomers: a1.totalCustomers,
    newCustomers: a1.newCustomers,
    churnedCustomers: a1.churnedCustomers,
    nps: a1.nps,
    csat: a1.csat,
    segments: a2.segments ?? [],
  };
}

export function resolveDataPage7(data) {
  if (!data?.areas) return data;
  const a1 = data.areas['1'] || {};
  const a2 = data.areas['2'] || {};
  const a3 = data.areas['3'] || {};
  return {
    title: data.title,
    targets: a1.targets ?? a1,
    initiatives: a2.initiatives ?? [],
    risks: a3.risks ?? [],
  };
}

export const DATA_PAGE_LAYOUT_CLASS = {
  page1_stack: 'flex flex-col gap-5',
  page2_single: 'flex flex-col gap-4',
  page3_stack: 'flex flex-col gap-5',
  page4_stack: 'flex flex-col gap-5',
};
