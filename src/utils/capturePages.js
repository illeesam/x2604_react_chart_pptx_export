import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import CoverPage from '../components/CoverPage';
import ChartPage from '../components/widget/Chart01Widget';
import { DataPage4, DataPage5, DataPage6, DataPage7 } from '../components/widget/Data01Widget';

// 보고서 전체 탭 개수 (표지 0 + 차트 1~3 + 데이터 4~7)
export const TOTAL_PAGES = 8; // 0=커버, 1~3=차트, 4~7=데이터

// pageNum(0~7)에 해당하는 페이지 React 엘리먼트 반환
export function getPageElement(data, pageNum) {
  switch (pageNum) {
    case 0: return <CoverPage data={data} />;
    case 1: return <ChartPage pageData={data.charts.page1} pageNum={1} />;
    case 2: return <ChartPage pageData={data.charts.page2} pageNum={2} />;
    case 3: return <ChartPage pageData={data.charts.page3} pageNum={3} />;
    case 4: return <DataPage4 data={data.dataPages.page4} />;
    case 5: return <DataPage5 data={data.dataPages.page5} />;
    case 6: return <DataPage6 data={data.dataPages.page6} />;
    case 7: return <DataPage7 data={data.dataPages.page7} />;
    default: return null;
  }
}

/**
 * 8페이지(0~7)를 화면 밖에 순서대로 렌더·캡처해 canvas 배열로 반환
 * onProgress(현재 인덱스, 전체)로 진행률 전달
 */
export async function captureAllPages(data, onProgress) {
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'left:-9999px', 'top:0',
    'width:900px', 'min-height:600px',
    'background:#fff', 'overflow:visible', 'z-index:9999',
  ].join(';');
  document.body.appendChild(container);

  const results = [];

  for (let p = 0; p < TOTAL_PAGES; p++) {
    // p: 캡처 중인 페이지 번호 (0~7)
    if (onProgress) onProgress(p + 1, TOTAL_PAGES);

    const root = createRoot(container);
    root.render(getPageElement(data, p));

    // 커버·데이터 페이지는 짧게, 차트 페이지는 길게 (렌더 안정화 대기)
    const wait = p === 0 ? 300 : p <= 3 ? 900 : 400;
    await new Promise(r => setTimeout(r, wait));

    const canvas = await html2canvas(container, {
      scale: 1.8,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    results.push({ canvas, pageNum: p }); // pageNum: 캡처된 페이지 인덱스

    root.unmount();
    await new Promise(r => setTimeout(r, 80));
  }

  document.body.removeChild(container);
  return results;
}
