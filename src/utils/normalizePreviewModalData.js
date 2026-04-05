/**
 * previewModalData.json — `widgets[]` 형식이면 렌더·다운로드용 기존 형태로 정규화
 * (CoverPage / Chart01Widget / Data01Widget + pageKey page4~7, widgetAttr 에 탭 등)
 */

/**
 * @param {object|null|undefined} raw API 원본
 * @returns {object} 항상 `previewNav`, `charts`, `dataPages` 포함 (레거시면 그대로 반환)
 */
export function normalizePreviewModalData(raw) {
  if (!raw || !Array.isArray(raw.widgets) || raw.widgets.length === 0) {
    return raw;
  }

  const { reportTitle, generatedAt, widgets } = raw;
  const previewNav = {
    cover: {},
    chartTabIcon: '📊',
    dataTabIcon: '📋',
    chartPageLabels: {},
    dataPageLabels: {},
  };
  const charts = {};
  const dataPages = {};

  for (const w of widgets) {
    const widgetType = w.widgetType;
    const a = w.widgetAttr || {};
    const d = w.widgetData;

    if (widgetType === 'CoverPage') {
      if (a.cover) Object.assign(previewNav.cover, a.cover);
      if (a.chartTabIcon != null) previewNav.chartTabIcon = a.chartTabIcon;
      if (a.dataTabIcon != null) previewNav.dataTabIcon = a.dataTabIcon;
      if (a.chartPageLabels) Object.assign(previewNav.chartPageLabels, a.chartPageLabels);
      if (a.dataPageLabels) Object.assign(previewNav.dataPageLabels, a.dataPageLabels);
    } else if (widgetType === 'Chart01Widget') {
      const key = a.pageKey;
      if (key && d != null) charts[key] = d;
      if (key && a.tabLabel != null) previewNav.chartPageLabels[key] = a.tabLabel;
    } else if (
      widgetType === 'Data01Widget' ||
      widgetType === 'DataPage4' ||
      widgetType === 'DataPage5' ||
      widgetType === 'DataPage6' ||
      widgetType === 'DataPage7'
    ) {
      const key = a.pageKey;
      if (key && d != null) dataPages[key] = d;
      if (key && a.tabLabel != null) previewNav.dataPageLabels[key] = a.tabLabel;
    }
  }

  return { reportTitle, generatedAt, previewNav, charts, dataPages };
}
