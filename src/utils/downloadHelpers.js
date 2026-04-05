/**
 * 내려받기 — README·이미지/PDF/PPT/HTML·전체 일괄·pptxgen 네이티브 PPTX
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';

/* ──────────────────────────────────────────
   파일명 생성 유틸
   source  : '보고서목록' | '미리보기'
   id      : 보고서 번호 or 페이지 번호 or '전체'
   btnLabel: 'README' | '이미지' | 'PDF' | 'PPT' 등
   반환 예 : 미리보기_3_이미지_20240404153012
────────────────────────────────────────── */
export function makeFilename(source, id, btnLabel) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${source}_${id}_${btnLabel}_${ts}`;
}

/* ──────────────────────────────────────────
   README Download
   보고서 데이터를 마크다운 파일로 저장
────────────────────────────────────────── */
export function downloadReadme(data, filename = 'README') {
  const d = data;
  const p4 = d.dataPages.page4;
  const p5 = d.dataPages.page5;
  const p6 = d.dataPages.page6;
  const p7 = d.dataPages.page7;
  const s = p4.summary;

  const md = `# ${d.reportTitle}

> 생성일: ${d.generatedAt}

---

## 📊 차트 구성 (페이지 1~3)

| 페이지 | 차트 | 유형 | 제목 |
|--------|------|------|------|
| 1P | Chart 1 | Line | ${d.charts.page1.chart1.title} |
| 1P | Chart 2 | Bar | ${d.charts.page1.chart2.title} |
| 1P | Chart 3 | Pie | ${d.charts.page1.chart3.title} |
| 1P | Chart 4 | Doughnut | ${d.charts.page1.chart4.title} |
| 2P | Chart 1 | Radar | ${d.charts.page2.chart1.title} |
| 2P | Chart 2 | PolarArea | ${d.charts.page2.chart2.title} |
| 2P | Chart 3 | Bubble | ${d.charts.page2.chart3.title} |
| 2P | Chart 4 | Scatter | ${d.charts.page2.chart4.title} |
| 3P | Chart 1 | Horizontal Bar | ${d.charts.page3.chart1.title} |
| 3P | Chart 2 | Stacked Bar | ${d.charts.page3.chart2.title} |
| 3P | Chart 3 | Area | ${d.charts.page3.chart3.title} |
| 3P | Chart 4 | Mixed | ${d.charts.page3.chart4.title} |

---

## 💰 ${p4.title}

| 항목 | 금액/비율 |
|------|----------|
| 총 매출 | ₩${s.totalRevenue} |
| 총 비용 | ₩${s.totalCost} |
| 영업이익 | ₩${s.operatingProfit} |
| 순이익 | ₩${s.netProfit} |
| 순이익률 | ${s.profitMargin} |
| YoY 성장률 | ${s.yoyGrowth} |

### 분기별 실적

| 분기 | 매출 | 비용 | 이익 | 이익률 |
|------|------|------|------|--------|
${p4.quarterlyData.map(r => `| ${r.quarter} | ₩${r.revenue} | ₩${r.cost} | ₩${r.profit} | ${r.margin} |`).join('\n')}

---

## 📦 ${p5.title}

| 제품명 | 매출 | 수량 | 평균단가 | 성장률 | 비중 |
|--------|------|------|---------|--------|------|
${p5.products.map(p => `| ${p.name} | ₩${p.revenue} | ${p.units.toLocaleString()} | ₩${p.avgPrice} | ${p.growth} | ${p.share} |`).join('\n')}

---

## 👥 ${p6.title}

- 전체 고객수: **${p6.totalCustomers.toLocaleString()}명**
- 신규 고객: **${p6.newCustomers.toLocaleString()}명**
- 이탈 고객: **${p6.churnedCustomers.toLocaleString()}명**
- NPS: **${p6.nps}점**
- CSAT: **${p6.csat}/5.0**

| 세그먼트 | 고객수 | 매출 | 평균매출 | 유지율 |
|---------|--------|------|---------|--------|
${p6.segments.map(s => `| ${s.segment} | ${s.count.toLocaleString()} | ₩${s.revenue} | ₩${s.avgRevenue} | ${s.retention} |`).join('\n')}

---

## 🎯 ${p7.title}

### 목표

| 항목 | 목표 |
|------|------|
| 매출 목표 | ₩${p7.targets.revenueTarget} |
| 성장률 목표 | ${p7.targets.growthTarget} |
| 신규 고객 목표 | ${p7.targets.newCustomerTarget.toLocaleString()}명 |
| NPS 목표 | ${p7.targets.npsTarget}점 |

### 핵심 이니셔티브

| 과제명 | 예산 | 담당 | 기한 | 상태 |
|--------|------|------|------|------|
${p7.initiatives.map(r => `| ${r.name} | ₩${r.budget} | ${r.owner} | ${r.deadline} | ${r.status} |`).join('\n')}

### 리스크 현황

| 리스크 | 발생가능성 | 영향도 | 대응방안 |
|--------|-----------|--------|---------|
${p7.risks.map(r => `| ${r.risk} | ${r.probability} | ${r.impact} | ${r.mitigation} |`).join('\n')}

---

*본 보고서는 자동 생성되었습니다.*
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────
   Image Download
   현재 보이는 contentRef DOM 을 PNG 이미지로 저장
────────────────────────────────────────── */
export async function downloadImage(contentRef, filename = '이미지') {
  const el = contentRef.current;
  if (!el) return;

  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `${filename}.png`;
  a.click();
}

/* ──────────────────────────────────────────
   PDF Download
   현재 보이는 contentRef DOM 을 캡처해서 PDF 생성
────────────────────────────────────────── */
export async function downloadPdf(contentRef, filename = 'PDF') {
  const el = contentRef.current;
  if (!el) return;

  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  const ratio = canvas.height / canvas.width;
  const imgH = pdfW * ratio;

  if (imgH <= pdfH) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH);
  } else {
    // 세로가 길면 여러 페이지로 분할
    let yPos = 0;
    while (yPos < canvas.height) {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(canvas.width * (pdfH / pdfW), canvas.height - yPos);
      const ctx = sliceCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, yPos, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
      if (yPos > 0) pdf.addPage();
      pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
      yPos += sliceCanvas.height;
    }
  }

  pdf.save(`${filename}.pdf`);
}

/* ──────────────────────────────────────────
   현재 페이지 PPT (단일 슬라이드, 차트 이미지 포함)
────────────────────────────────────────── */
export async function downloadPpt(contentRef, filename = 'PPT') {
  const el = contentRef.current;
  if (!el) return;

  const canvas = await html2canvas(el, { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  const slide = pptx.addSlide();
  slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

/* ──────────────────────────────────────────
   전체 이미지 (7페이지 개별 PNG)
────────────────────────────────────────── */
export async function downloadAllImages(data, source = '미리보기', onProgress) {
  const { captureAllPages } = await import('./capturePages');
  const pages = await captureAllPages(data, onProgress); // pages: 각 항목에 canvas, pageNum(0~7)
  for (const { canvas, pageNum } of pages) {
    // pageNum: 파일명 접미에 붙는 페이지 인덱스
    await new Promise(r => setTimeout(r, 150));
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${makeFilename(source, pageNum, '전체이미지')}.png`;
    a.click();
  }
}

/* ──────────────────────────────────────────
   전체 PDF (7페이지 → 1 PDF)
────────────────────────────────────────── */
export async function downloadAllPdf(data, filename = '전체PDF', onProgress) {
  const { captureAllPages } = await import('./capturePages');
  const pages = await captureAllPages(data, onProgress);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  pages.forEach(({ canvas }, idx) => {
    // idx: PDF 안에서의 페이지 순번(0부터)
    if (idx > 0) pdf.addPage();
    const ratio = canvas.height / canvas.width;
    const imgH = Math.min(pdfW * ratio, pdfH);
    const yOffset = (pdfH - imgH) / 2;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, yOffset, pdfW, imgH);
  });

  pdf.save(`${filename}.pdf`);
}

/* ──────────────────────────────────────────
   전체 PPT (7페이지 → 1 PPTX, 차트 실제 이미지)
────────────────────────────────────────── */
export async function downloadAllPpt(data, filename = '전체PPT', onProgress) {
  const { captureAllPages } = await import('./capturePages');
  const pages = await captureAllPages(data, onProgress);

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';

  for (const { canvas } of pages) {
    // pages 순서대로 슬라이드 1장씩 추가
    const slide = pptx.addSlide();
    slide.addImage({ data: canvas.toDataURL('image/png'), x: 0, y: 0, w: '100%', h: '100%' });
  }

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

/* ──────────────────────────────────────────
   현재 페이지 HTML (이미지 임베드 방식)
────────────────────────────────────────── */
export async function downloadHtml(contentRef, filename = 'HTML') {
  const el = contentRef.current;
  if (!el) return;

  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const dataUrl = canvas.toDataURL('image/png');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f1f5f9; display: flex; justify-content: center; padding: 24px; font-family: 'Segoe UI', 'Malgun Gothic', sans-serif; }
    .page { background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.12); border-radius: 8px; overflow: hidden; }
    .page img { display: block; max-width: 100%; height: auto; }
    .footer { text-align: center; margin-top: 12px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div>
    <div class="page"><img src="${dataUrl}" alt="${filename}" /></div>
    <div class="footer">생성: ${new Date().toLocaleString('ko-KR')}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────
   전체 HTML (7페이지 → 1 HTML, 이미지 임베드)
────────────────────────────────────────── */
export async function downloadAllHtml(data, filename = '전체HTML', onProgress) {
  const { captureAllPages } = await import('./capturePages');
  const pages = await captureAllPages(data, onProgress);

  // 각 캡처를 HTML 섹션(표지 / n페이지)으로 묶은 문자열 조각들
  const pageItems = pages.map(({ canvas, pageNum }) => {
    const dataUrl = canvas.toDataURL('image/png');
    // pageNum: 0이면 표지, 그 외는 본문 페이지 번호 표기
    const label = pageNum === 0 ? '표지' : `${pageNum}페이지`;
    return `
    <div class="page">
      <div class="page-label">${label}</div>
      <img src="${dataUrl}" alt="${label}" />
    </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f1f5f9; display: flex; flex-direction: column; align-items: center; padding: 32px 24px; gap: 32px; font-family: 'Segoe UI', 'Malgun Gothic', sans-serif; }
    .page { background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.12); border-radius: 8px; overflow: hidden; width: 100%; max-width: 960px; }
    .page-label { background: #1e293b; color: #fff; font-size: 13px; font-weight: 700; padding: 8px 16px; }
    .page img { display: block; width: 100%; height: auto; }
    .footer { color: #94a3b8; font-size: 12px; margin-top: 8px; }
  </style>
</head>
<body>
  ${pageItems}
  <div class="footer">생성: ${new Date().toLocaleString('ko-KR')}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════
   PPTX (pptxgenjs 네이티브 차트/표 방식)
   PowerPoint에서 차트·표 직접 편집 가능
══════════════════════════════════════════ */

const PPTX_PALETTE = [
  '3B82F6','10B981','F59E0B','EF4444','8B5CF6',
  'EC4899','14B8A6','FB923C','6366F1','34D399',
];

// pptxgenjs v4 ChartType 키는 소문자, barH 없음 (barDir:'bar' 로 처리)
const CHART_TYPE_MAP = {
  line:          { type: 'line' },
  bar:           { type: 'bar' },
  pie:           { type: 'pie' },
  doughnut:      { type: 'doughnut' },
  radar:         { type: 'radar' },
  polarArea:     { type: 'pie' },
  bubble:        { type: 'bubble' },
  scatter:       { type: 'scatter' },
  horizontalBar: { type: 'bar', barDir: 'bar' },
  stackedBar:    { type: 'bar', barGrouping: 'stacked' },
  area:          { type: 'area' },
  mixed:         { type: 'bar' },
};

/** Chart.js 형식 datasets → pptxgen `addChart`용 시리즈 배열 */
function buildPptxChartData(chartData) {
  const isBubble  = chartData.type === 'bubble';
  const isScatter = chartData.type === 'scatter';

  if (isBubble) {
    return chartData.datasets.map((ds, di) => ({
      name: ds.label || `데이터${di + 1}`,
      values: ds.data.map(v => (v && typeof v === 'object' ? (v.y ?? 0) : 0)),
      sizes:  ds.data.map(v => (v && typeof v === 'object' ? (v.r ?? 5)  : 5)),
    }));
  }

  if (isScatter) {
    return chartData.datasets.map((ds, di) => ({
      name: ds.label || `데이터${di + 1}`,
      values: ds.data.map(v => (v && typeof v === 'object' ? (v.y ?? 0) : 0)),
      labels: ds.data.map(v => (v && typeof v === 'object' ? String(v.x ?? '') : '')),
    }));
  }

  return chartData.datasets.map((ds, di) => ({
    name: ds.label || `데이터${di + 1}`,
    labels: chartData.labels.length ? chartData.labels : ds.data.map((_, i) => String(i + 1)),
    values: ds.data.map(v =>
      v !== null && typeof v === 'object' ? (v.y ?? v.r ?? 0) : (v ?? 0)
    ),
  }));
}

/** 단일 슬라이드에 차트 1개 배치 (타입 매핑 실패 시 bar 폴백) */
function addChartToSlide(pptx, slide, chartData, x, y, w, h) {
  const mapping = CHART_TYPE_MAP[chartData.type] || { type: 'bar' };
  const seriesData = buildPptxChartData(chartData);

  const chartType = pptx.ChartType[mapping.type] ?? pptx.ChartType.bar;

  const opts = {
    x, y, w, h,
    chartColors: PPTX_PALETTE.slice(0, Math.max(seriesData.length, 1)),
    showLegend: true,
    legendPos: 'b',
    legendFontSize: 9,
    dataLabelFontSize: 8,
    showValue: false,
    ...(mapping.barDir      && { barDir: mapping.barDir }),
    ...(mapping.barGrouping && { barGrouping: mapping.barGrouping }),
  };

  try {
    slide.addChart(chartType, seriesData, opts);
  } catch (e) {
    console.warn('addChart fallback:', chartData.type, e.message);
    slide.addChart(pptx.ChartType.bar, seriesData, opts);
  }
}

/** `data` 전체를 네이티브 슬라이드 집합으로 구성 (표지·차트·데이터 페이지) */
function buildPptxSlides(pptx, data) {
  const HBG = '1E293B';
  const HFG = 'FFFFFF';

  // ─── 커버 슬라이드용 공용 상수 (MW는 아래 헬퍼 섹션 전에 선언) ───────────────
  const CMW = 12.93, CMX = 0.2;
  const chCell = (text, bg = HBG) =>
    ({ text, options: { bold: true, color: HFG, fill: { color: bg }, align: 'center' } });

  // ── 슬라이드 0: 커버 / 집계 요약 ──
  if (data.dataPages?.page4 && data.dataPages?.page5 && data.dataPages?.page6 && data.dataPages?.page7) {
    const slide = pptx.addSlide();
    const p4 = data.dataPages.page4;
    const p5 = data.dataPages.page5;
    const p6 = data.dataPages.page6;
    const p7 = data.dataPages.page7;
    const s  = p4.summary;

    // 헤더 (풀폭 다크 바)
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.62, fill: { color: HBG } });
    slide.addShape(pptx.ShapeType.rect, { x: CMX, y: 0.1, w: 1.1, h: 0.3, fill: { color: '3B82F6' }, line: { color: '3B82F6' } });
    slide.addText('EXECUTIVE\nSUMMARY', { x: CMX, y: 0.1, w: 1.1, h: 0.3, fontSize: 7, bold: true, color: HFG, align: 'center', valign: 'middle' });
    slide.addText(data.reportTitle, { x: CMX + 1.18, y: 0.1, w: 8, h: 0.3, fontSize: 18, bold: true, color: HFG, valign: 'middle' });
    slide.addText(`생성일: ${data.generatedAt}`, { x: CMX + 1.18, y: 0.39, w: 5, h: 0.18, fontSize: 9, color: '94A3B8' });

    // KPI 카드 (2행 × 4열, 풀폭)
    const kpis = [
      { label: '총 매출',    value: `₩${s.totalRevenue}`,                   color: '3B82F6' },
      { label: '영업이익',   value: `₩${s.operatingProfit}`,                color: '10B981' },
      { label: '순이익률',   value: s.profitMargin,                          color: '8B5CF6' },
      { label: 'YoY 성장률', value: s.yoyGrowth,                            color: 'F59E0B' },
      { label: '전체 고객',  value: `${p6.totalCustomers.toLocaleString()}명`, color: '06B6D4' },
      { label: '신규 고객',  value: `${p6.newCustomers.toLocaleString()}명`,   color: 'EC4899' },
      { label: 'NPS',        value: `${p6.nps}점`,                           color: '6366F1' },
      { label: 'CSAT',       value: `${p6.csat}/5.0`,                        color: 'EF4444' },
    ];
    // 4열 배치: 각 카드 폭 = (CMW - 3*gap) / 4
    const ckW = (CMW - 3 * 0.1) / 4; // ≈ 3.15"
    const ckH = 0.62, ckGap = 0.1, ckY0 = 0.7;
    kpis.forEach((k, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const kx = CMX + col * (ckW + ckGap);
      const ky = ckY0 + row * (ckH + 0.08);
      slide.addShape(pptx.ShapeType.rect, { x: kx, y: ky, w: ckW, h: ckH, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
      slide.addShape(pptx.ShapeType.rect, { x: kx, y: ky, w: ckW, h: 0.05, fill: { color: k.color }, line: { color: k.color } });
      slide.addText(k.label, { x: kx + 0.1, y: ky + 0.07, w: ckW - 0.2, h: 0.2, fontSize: 9,  color: '64748B' });
      slide.addText(k.value, { x: kx + 0.1, y: ky + 0.28, w: ckW - 0.2, h: 0.28, fontSize: 13, bold: true, color: k.color });
    });

    // 분기별 실적 (왼쪽, 약 7.5") + 2025 목표 (오른쪽, 약 5.1")
    const qW = 7.5, tgW = CMW - qW - 0.13;
    slide.addShape(pptx.ShapeType.rect, { x: CMX, y: 2.1, w: qW, h: 0.28, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0' } });
    slide.addText('분기별 실적', { x: CMX + 0.1, y: 2.1, w: qW - 0.2, h: 0.28, fontSize: 10, bold: true, color: '334155', valign: 'middle' });
    const qRows = [
      [chCell('분기'), chCell('매출'), chCell('비용'), chCell('이익'), chCell('이익률')],
      ...p4.quarterlyData.map((r, i) => {
        const bg = i % 2 ? 'FFFFFF' : 'F8FAFC';
        return [
          r.quarter,
          { text: `₩${r.revenue}`, options: { align: 'right', fill: { color: bg } } },
          { text: `₩${r.cost}`,    options: { align: 'right', fill: { color: bg } } },
          { text: `₩${r.profit}`,  options: { align: 'right', color: '10B981', bold: true, fill: { color: bg } } },
          { text: r.margin,         options: { align: 'right', color: '3B82F6', fill: { color: bg } } },
        ];
      }),
    ];
    slide.addTable(qRows, { x: CMX, y: 2.44, w: qW, h: 1.8, fontSize: 10, border: { color: 'E2E8F0', width: 1 }, autoPage: false });

    const tgX = CMX + qW + 0.13;
    slide.addShape(pptx.ShapeType.rect, { x: tgX, y: 2.1, w: tgW, h: 0.28, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0' } });
    slide.addText('2025년 목표', { x: tgX + 0.1, y: 2.1, w: tgW - 0.2, h: 0.28, fontSize: 10, bold: true, color: '334155', valign: 'middle' });
    const tgt = p7.targets;
    const tgtRows = [
      [chCell('항목'), chCell('목표')],
      ['매출 목표',   { text: `₩${tgt.revenueTarget}`,                options: { align: 'right', bold: true, color: '3B82F6' } }],
      ['성장률',      { text: tgt.growthTarget,                        options: { align: 'right', bold: true, color: '10B981' } }],
      ['신규 고객',   { text: `${tgt.newCustomerTarget.toLocaleString()}명`, options: { align: 'right' } }],
      ['NPS 목표',    { text: `${tgt.npsTarget}점`,                    options: { align: 'right' } }],
    ];
    slide.addTable(tgtRows, { x: tgX, y: 2.44, w: tgW, h: 1.8, fontSize: 10, border: { color: 'E2E8F0', width: 1 }, autoPage: false });

    // 제품별 성과 (풀폭)
    slide.addShape(pptx.ShapeType.rect, { x: CMX, y: 4.35, w: CMW, h: 0.28, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0' } });
    slide.addText('제품별 성과', { x: CMX + 0.1, y: 4.35, w: CMW - 0.2, h: 0.28, fontSize: 10, bold: true, color: '334155', valign: 'middle' });
    const prodRows = [
      [chCell('제품명'), chCell('매출'), chCell('판매수량'), chCell('평균단가'), chCell('성장률'), chCell('매출비중')],
      ...p5.products.map((p, i) => {
        const bg = i % 2 ? 'FFFFFF' : 'F8FAFC';
        return [
          { text: p.name,                  options: { bold: true, fill: { color: bg } } },
          { text: `₩${p.revenue}`,         options: { align: 'right', fill: { color: bg } } },
          { text: p.units.toLocaleString(),options: { align: 'right', fill: { color: bg } } },
          { text: `₩${p.avgPrice}`,        options: { align: 'right', fill: { color: bg } } },
          { text: p.growth,                options: { align: 'right', color: '10B981', bold: true, fill: { color: bg } } },
          { text: p.share,                 options: { align: 'right', fill: { color: bg } } },
        ];
      }),
    ];
    slide.addTable(prodRows, { x: CMX, y: 4.69, w: CMW, h: 2.5, fontSize: 10, border: { color: 'E2E8F0', width: 1 }, autoPage: false });
  }

  // ── 차트 페이지 1~3 ──
  [
    { key: 'page1', title: '매출 및 비용 분석', num: 1 },
    { key: 'page2', title: '성과 지표 분석',   num: 2 },
    { key: 'page3', title: '트렌드 및 예측',   num: 3 },
  ].filter(({ key }) => data.charts?.[key]).forEach(({ key, title, num }) => {
    const slide = pptx.addSlide();
    const pg = data.charts[key];

    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: HBG } });
    slide.addText(`PAGE ${num}  |  ${title}`, {
      x: 0.2, y: 0.08, w: 12.5, h: 0.38,
      fontSize: 14, bold: true, color: HFG,
    });

    // LAYOUT_WIDE 13.33" 기준: 차트 2열 × 2행
    // 각 차트 폭 = (12.93 - 0.1) / 2 ≈ 6.41"
    const cW2 = 6.41, cH2 = 3.3, cGx = 0.11, cGy = 0.08;
    const grid = [
      { chart: pg.chart1, x: 0.2,           y: 0.63,           w: cW2, h: cH2 },
      { chart: pg.chart2, x: 0.2 + cW2 + cGx, y: 0.63,           w: cW2, h: cH2 },
      { chart: pg.chart3, x: 0.2,           y: 0.63 + cH2 + cGy, w: cW2, h: cH2 },
      { chart: pg.chart4, x: 0.2 + cW2 + cGx, y: 0.63 + cH2 + cGy, w: cW2, h: cH2 },
    ];
    grid.forEach(({ chart, x, y, w, h }) => addChartToSlide(pptx, slide, chart, x, y, w, h));
  });

  // ─── 공용 헬퍼 ───────────────────────────────────────────────────────────────
  // LAYOUT_WIDE = 13.33" × 7.5"  (margin 0.2" → usable width = 12.93")
  const MW = 12.93, MX = 0.2;

  const hdrSlide = (slide, num, title) => {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: HBG } });
    slide.addShape(pptx.ShapeType.rect, { x: MX, y: 0.08, w: 0.7, h: 0.34, fill: { color: '3B82F6' }, line: { color: '3B82F6' } });
    slide.addText(`PAGE ${num}`, { x: MX, y: 0.08, w: 0.7, h: 0.34, fontSize: 9, bold: true, color: HFG, align: 'center', valign: 'middle' });
    slide.addText(title, { x: MX + 0.78, y: 0.08, w: MW - 0.78, h: 0.34, fontSize: 14, bold: true, color: HFG, valign: 'middle' });
  };

  const secTitle = (slide, text, y) => {
    slide.addShape(pptx.ShapeType.rect, { x: MX, y, w: MW, h: 0.28, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0' } });
    slide.addText(text, { x: MX + 0.1, y, w: MW - 0.2, h: 0.28, fontSize: 11, bold: true, color: '334155', valign: 'middle' });
  };

  const hCell = (text, bgColor = HBG) =>
    ({ text, options: { bold: true, color: HFG, fill: { color: bgColor }, align: 'center' } });

  const tblOpts = (x, y, w, h, fz = 11) =>
    ({ x, y, w, h, fontSize: fz, border: { color: 'E2E8F0', width: 1 }, autoPage: false });

  // 카드 그리기: 배경 + 상단 컬러 바 + 라벨 + 값
  const addCard = (slide, x, y, w, h, label, value, accentColor, bgColor = 'F8FAFC') => {
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: bgColor }, line: { color: 'E2E8F0', width: 1 } });
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.06, fill: { color: accentColor }, line: { color: accentColor } });
    slide.addText(label, { x: x + 0.1, y: y + 0.08, w: w - 0.2, h: 0.22, fontSize: 9, color: '64748B' });
    slide.addText(value, { x: x + 0.1, y: y + 0.3,  w: w - 0.2, h: h - 0.4, fontSize: 12, bold: true, color: accentColor });
  };

  // ── 데이터 페이지 4: 경영 실적 요약 ──────────────────────────────────────────
  // 화면: 6개 KPI카드(2행×3열) + 분기별 실적 풀폭 테이블
  if (data.dataPages?.page4) {
    const slide = pptx.addSlide();
    const pg = data.dataPages.page4;
    const s  = pg.summary;

    hdrSlide(slide, 4, pg.title);

    // 6 KPI 카드 (2행 3열)
    const CARD_COLORS = ['3B82F6','EF4444','10B981','8B5CF6','F59E0B','06B6D4'];
    const cards = [
      { label: '총 매출',    value: `₩${s.totalRevenue}` },
      { label: '총 비용',    value: `₩${s.totalCost}` },
      { label: '영업이익',   value: `₩${s.operatingProfit}` },
      { label: '순이익',     value: `₩${s.netProfit}` },
      { label: '순이익률',   value: s.profitMargin },
      { label: 'YoY 성장률', value: s.yoyGrowth },
    ];
    const cW = 4.21, cH = 0.88, cGap = 0.15, cY0 = 0.58;
    cards.forEach((c, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      addCard(slide,
        MX + col * (cW + cGap), cY0 + row * (cH + cGap),
        cW, cH, c.label, c.value, CARD_COLORS[i]);
    });

    // 분기별 실적 테이블 (풀폭)
    secTitle(slide, '분기별 실적', 2.48);
    const qRows = [
      [hCell('분기'), hCell('매출'), hCell('비용'), hCell('이익'), hCell('이익률')],
      ...pg.quarterlyData.map((r, i) => [
        r.quarter,
        { text: `₩${r.revenue}`, options: { align: 'right', fill: { color: i % 2 ? 'FFFFFF' : 'F8FAFC' } } },
        { text: `₩${r.cost}`,    options: { align: 'right', fill: { color: i % 2 ? 'FFFFFF' : 'F8FAFC' } } },
        { text: `₩${r.profit}`,  options: { align: 'right', color: '10B981', bold: true, fill: { color: i % 2 ? 'FFFFFF' : 'F8FAFC' } } },
        { text: r.margin,         options: { align: 'right', color: '3B82F6', fill: { color: i % 2 ? 'FFFFFF' : 'F8FAFC' } } },
      ]),
    ];
    slide.addTable(qRows, tblOpts(MX, 2.82, MW, 4.3));
  }

  // ── 데이터 페이지 5: 제품별 성과 ────────────────────────────────────────────
  // 화면: 풀폭 제품 테이블 (제품명|매출|판매수량|평균단가|성장률|매출비중)
  if (data.dataPages?.page5) {
    const slide = pptx.addSlide();
    const pg = data.dataPages.page5;

    hdrSlide(slide, 5, pg.title);

    const prodRows = [
      [hCell('제품명'), hCell('매출'), hCell('판매수량'), hCell('평균단가'), hCell('성장률'), hCell('매출비중')],
      ...pg.products.map((p, i) => {
        const bg = i % 2 ? 'FFFFFF' : 'F8FAFC';
        return [
          { text: p.name,                   options: { bold: true, fill: { color: bg } } },
          { text: `₩${p.revenue}`,          options: { align: 'right', fill: { color: bg } } },
          { text: p.units.toLocaleString(),  options: { align: 'right', fill: { color: bg } } },
          { text: `₩${p.avgPrice}`,         options: { align: 'right', fill: { color: bg } } },
          { text: p.growth,                  options: { align: 'right', color: '10B981', bold: true, fill: { color: bg } } },
          { text: p.share,                   options: { align: 'right', fill: { color: bg } } },
        ];
      }),
    ];
    slide.addTable(prodRows, tblOpts(MX, 0.6, MW, 6.5));
  }

  // ── 데이터 페이지 6: 고객 분석 ──────────────────────────────────────────────
  // 화면: 5개 KPI 카드 가로 배열 + 세그먼트별 현황 풀폭 테이블
  if (data.dataPages?.page6) {
    const slide = pptx.addSlide();
    const pg = data.dataPages.page6;

    hdrSlide(slide, 6, pg.title);

    // 5 KPI 카드 (가로 한 줄)
    const kpis = [
      { label: '전체 고객수', value: `${pg.totalCustomers.toLocaleString()}명` },
      { label: '신규 고객',   value: `${pg.newCustomers.toLocaleString()}명` },
      { label: '이탈 고객',   value: `${pg.churnedCustomers.toLocaleString()}명` },
      { label: 'NPS',         value: `${pg.nps}점` },
      { label: 'CSAT',        value: `${pg.csat} / 5.0` },
    ];
    const kW = 2.49, kH = 0.78, kGap = 0.12;
    kpis.forEach((k, i) => {
      const kx = MX + i * (kW + kGap);
      slide.addShape(pptx.ShapeType.rect, { x: kx, y: 0.58, w: kW, h: kH, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } });
      slide.addText(k.label, { x: kx + 0.08, y: 0.63, w: kW - 0.16, h: 0.22, fontSize: 9,  color: '0369A1', align: 'center' });
      slide.addText(k.value, { x: kx + 0.08, y: 0.86, w: kW - 0.16, h: 0.38, fontSize: 14, bold: true, color: '0C4A6E', align: 'center' });
    });

    // 세그먼트 테이블
    secTitle(slide, '세그먼트별 현황', 1.46);
    const segRows = [
      [hCell('세그먼트'), hCell('고객수'), hCell('매출'), hCell('평균매출'), hCell('유지율')],
      ...pg.segments.map((seg, i) => {
        const bg  = i % 2 ? 'FFFFFF' : 'F8FAFC';
        const ret = parseFloat(seg.retention) >= 90 ? '10B981' : 'F59E0B';
        return [
          { text: seg.segment,                options: { bold: true,  fill: { color: bg } } },
          { text: seg.count.toLocaleString(), options: { align: 'right', fill: { color: bg } } },
          { text: `₩${seg.revenue}`,          options: { align: 'right', fill: { color: bg } } },
          { text: `₩${seg.avgRevenue}`,        options: { align: 'right', fill: { color: bg } } },
          { text: seg.retention,               options: { align: 'right', color: ret, bold: true, fill: { color: bg } } },
        ];
      }),
    ];
    slide.addTable(segRows, tblOpts(MX, 1.8, MW, 5.3));
  }

  // ── 데이터 페이지 7: 2025 전략 계획 ─────────────────────────────────────────
  // 화면: 4개 목표 카드 + 핵심 이니셔티브 테이블 + 리스크 현황 테이블
  if (data.dataPages?.page7) {
    const slide = pptx.addSlide();
    const pg = data.dataPages.page7;
    const t  = pg.targets;

    hdrSlide(slide, 7, pg.title);

    // 4 목표 카드 (가로 한 줄)
    const targets = [
      { label: '매출 목표',     value: `₩${t.revenueTarget}` },
      { label: '성장률 목표',   value: t.growthTarget },
      { label: '신규 고객 목표', value: `${t.newCustomerTarget.toLocaleString()}명` },
      { label: 'NPS 목표',      value: `${t.npsTarget}점` },
    ];
    const tW = 3.13, tH = 0.75, tGap = 0.13;
    targets.forEach((tgt, i) => {
      const tx = MX + i * (tW + tGap);
      slide.addShape(pptx.ShapeType.rect, { x: tx, y: 0.58, w: tW, h: tH, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } });
      slide.addShape(pptx.ShapeType.rect, { x: tx, y: 0.58, w: tW, h: 0.06, fill: { color: '3B82F6' }, line: { color: '3B82F6' } });
      slide.addText(tgt.label, { x: tx + 0.08, y: 0.66, w: tW - 0.16, h: 0.22, fontSize: 9,  color: '1D4ED8', align: 'center' });
      slide.addText(tgt.value, { x: tx + 0.08, y: 0.88, w: tW - 0.16, h: 0.38, fontSize: 13, bold: true, color: '1E3A8A', align: 'center' });
    });

    // 핵심 이니셔티브 테이블
    secTitle(slide, '핵심 이니셔티브', 1.43);
    const STATUS_BG = { '진행중': '10B981', '계획': '3B82F6', '완료': '6366F1' };
    const initRows = [
      [hCell('과제명'), hCell('예산'), hCell('담당'), hCell('기한'), hCell('상태')],
      ...pg.initiatives.map((r, i) => {
        const bg = i % 2 ? 'FFFFFF' : 'F8FAFC';
        const sc = STATUS_BG[r.status] || '94A3B8';
        return [
          { text: r.name,        options: { bold: true, fill: { color: bg } } },
          { text: `₩${r.budget}`, options: { align: 'right', fill: { color: bg } } },
          { text: r.owner,        options: { align: 'center', fill: { color: bg } } },
          { text: r.deadline,     options: { align: 'center', fill: { color: bg } } },
          { text: r.status,       options: { align: 'center', bold: true, color: sc, fill: { color: bg } } },
        ];
      }),
    ];
    slide.addTable(initRows, tblOpts(MX, 1.77, MW, 2.3));

    // 리스크 현황 테이블
    secTitle(slide, '리스크 현황', 4.17);
    const PROB_C = { '높음': 'EF4444', '중': 'F59E0B', '낮음': '10B981' };
    const riskRows = [
      [hCell('리스크'), hCell('발생가능성'), hCell('영향도'), hCell('대응방안')],
      ...pg.risks.map((r, i) => {
        const bg = i % 2 ? 'FFFFFF' : 'F8FAFC';
        return [
          { text: r.risk,        options: { bold: true, fill: { color: bg } } },
          { text: r.probability, options: { align: 'center', bold: true, color: PROB_C[r.probability] || '334155', fill: { color: bg } } },
          { text: r.impact,      options: { align: 'center', bold: true, color: PROB_C[r.impact]      || '334155', fill: { color: bg } } },
          { text: r.mitigation,  options: { fontSize: 9, fill: { color: bg } } },
        ];
      }),
    ];
    slide.addTable(riskRows, tblOpts(MX, 4.51, MW, 2.6));
  }
}

/* ──────────────────────────────────────────
   현재 페이지 PPTX (네이티브 차트/표, 단일 슬라이드)
────────────────────────────────────────── */
// pageNum(0~7)에 해당하는 슬라이드만 담은 PPTX 1파일 저장
export async function downloadPptx(data, pageNum, filename = 'PPTX') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';

  // 전체 data에서 해당 페이지 데이터만 남긴 뒤 슬라이드 생성
  const singleData = slicePageData(data, pageNum);
  buildPptxSlides(pptx, singleData);

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

/* ──────────────────────────────────────────
   전체 7페이지 PPTX (네이티브 차트/표)
────────────────────────────────────────── */
export async function downloadAllPptx(data, filename = '전체PPTX') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  buildPptxSlides(pptx, data);
  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

/* 단일 슬라이드용 data 슬라이스 — pageNum: 0=표지(전체), 1~3=차트만, 4~7=데이터만 */
function slicePageData(data, pageNum) {
  if (pageNum === 0) return data; // 표지 슬라이드는 p4~p7 등 전역 참조가 있어 원본 유지
  if (pageNum <= 3) {
    const key = `page${pageNum}`; // charts.page1 | page2 | page3
    return { charts: { [key]: data.charts[key] }, dataPages: {} };
  }
  const key = `page${pageNum}`; // dataPages.page4 … page7
  return { charts: {}, dataPages: { [key]: data.dataPages[key] } };
}
