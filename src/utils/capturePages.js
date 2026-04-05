import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import CoverPage from '../components/CoverPage';
import ChartPage from '../components/widget/Chart01Widget';
import { DataPage4, DataPage5, DataPage6, DataPage7 } from '../components/widget/Data01Widget';
import { buildPreviewSlots, getPreviewPageCount } from './previewLayout';

export { getPreviewPageCount } from './previewLayout';

const DATA_PAGE_BY_KEY = {
  page4: DataPage4,
  page5: DataPage5,
  page6: DataPage6,
  page7: DataPage7,
};

export function getPageElement(data, pageNum) {
  const { slots } = buildPreviewSlots(data);
  const slot = slots[pageNum];
  if (!slot) return null;
  switch (slot.type) {
    case 'cover':
      return <CoverPage data={data} />;
    case 'chart':
      return <ChartPage pageData={data.charts[slot.key]} pageNum={slot.chartNum} />;
    case 'data': {
      const Comp = DATA_PAGE_BY_KEY[slot.key];
      if (!Comp) return null;
      return <Comp data={data.dataPages[slot.key]} />;
    }
    default:
      return null;
  }
}

/**
 * 미리보기 슬롯 순서대로 화면 밖 렌더·캡처 → canvas 배열
 * onProgress(현재 1~N, 전체 N)
 */
export async function captureAllPages(data, onProgress) {
  const total = getPreviewPageCount(data);
  const { chartKeys } = buildPreviewSlots(data);
  const nChart = chartKeys.length;

  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'left:-9999px', 'top:0',
    'width:900px', 'min-height:600px',
    'background:#fff', 'overflow:visible', 'z-index:9999',
  ].join(';');
  document.body.appendChild(container);

  const results = [];

  for (let p = 0; p < total; p++) {
    if (onProgress) onProgress(p + 1, total);

    const root = createRoot(container);
    root.render(getPageElement(data, p));

    const wait = p === 0 ? 300 : p <= nChart ? 900 : 400;
    await new Promise((r) => setTimeout(r, wait));

    const canvas = await html2canvas(container, {
      scale: 1.8,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    results.push({ canvas, pageNum: p });

    root.unmount();
    await new Promise((r) => setTimeout(r, 80));
  }

  document.body.removeChild(container);
  return results;
}
