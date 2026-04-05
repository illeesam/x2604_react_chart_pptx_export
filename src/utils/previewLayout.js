/**
 * 미리보기·캡처 슬롯 순서 — `charts` / `dataPages` 키 + `previewNav` 라벨
 */

/** page1, page2 … 숫자 순 정렬 */
function sortPageKeys(keys) {
  return [...keys].sort((a, b) => {
    const na = +(String(a).match(/\d+/) || [0])[0];
    const nb = +(String(b).match(/\d+/) || [0])[0];
    return na - nb;
  });
}

/** 표지 → 차트 페이지들 → 데이터 페이지들 순 `slots` 배열 생성 */
export function buildPreviewSlots(data) {
  const chartKeys = sortPageKeys(Object.keys(data?.charts || {}));
  const dataKeys = sortPageKeys(Object.keys(data?.dataPages || {}));
  const slots = [{ type: 'cover' }];
  chartKeys.forEach((key, i) => slots.push({ type: 'chart', key, chartNum: i + 1 }));
  dataKeys.forEach((key) => slots.push({ type: 'data', key }));
  return { slots, chartKeys, dataKeys };
}

/** 슬롯 개수 (= 미리보기·캡처 총 페이지 수) */
export function getPreviewPageCount(data) {
  return buildPreviewSlots(data).slots.length;
}

/** 상단 배너 부제: 미리보기 — {이 값} / 총 N페이지 */
export function getBannerSubtitleForPage(data, pageIndex) {
  const { slots } = buildPreviewSlots(data);
  const slot = slots[pageIndex];
  if (!slot) return '';
  const nav = data.previewNav || {};
  if (slot.type === 'cover') {
    const c = nav.cover || {};
    return c.bannerSubtitle ?? c.tabLabel ?? '표지';
  }
  if (slot.type === 'chart') {
    return data.charts?.[slot.key]?.title ?? `${slot.chartNum}P`;
  }
  if (slot.type === 'data') {
    return data.dataPages?.[slot.key]?.title ?? slot.key;
  }
  return '';
}

/** 탭 버튼 텍스트 (아이콘 + 라벨) */
export function getTabLabelForPage(data, pageIndex) {
  const { slots } = buildPreviewSlots(data);
  const slot = slots[pageIndex];
  if (!slot) return '';
  const nav = data.previewNav || {};
  if (slot.type === 'cover') {
    const c = nav.cover || {};
    return `${c.tabIcon ?? '📋'} ${c.tabLabel ?? '표지'}`;
  }
  if (slot.type === 'chart') {
    const icon = nav.chartTabIcon ?? '📊';
    const custom = nav.chartPageLabels?.[slot.key];
    return `${icon} ${custom ?? `${slot.chartNum}P`}`;
  }
  if (slot.type === 'data') {
    const icon = nav.dataTabIcon ?? '📋';
    const custom = nav.dataPageLabels?.[slot.key];
    const title = data.dataPages?.[slot.key]?.title;
    return `${icon} ${custom ?? title ?? slot.key}`;
  }
  return '';
}

/** 표지 제외 본문 페이지 수 (전체 다운로드 UI 등) */
export function getContentPageCount(data) {
  return Math.max(0, getPreviewPageCount(data) - 1);
}
