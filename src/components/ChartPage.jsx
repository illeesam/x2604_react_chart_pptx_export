// 차트 페이지 (page 1~3) — 18종 차트를 2×3 그리드(페이지당 6개)로 렌더
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';

// chart.js 필요 스케일·플러그인 전역 등록
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// 차트 데이터셋 색상 팔레트 (순환 사용)
const PALETTE = [
  'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)',
  'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)',
  'rgba(20,184,166,0.8)', 'rgba(251,146,60,0.8)', 'rgba(99,102,241,0.8)',
  'rgba(52,211,153,0.8)',
];

// 차트 타입 → 한글 라벨 매핑 (차트 카드 제목 왼쪽 뱃지 표시용)
const TYPE_LABELS = {
  line:             '꺾은선',
  bar:              '세로막대',
  pie:              '파이',
  doughnut:         '도넛',
  stepLine:         '계단형',
  percentBar:       '100%막대',
  radar:            '레이더',
  polarArea:        '폴라',
  bubble:           '버블',
  scatter:          '산점도',
  horizontalStacked:'수평누적',
  stackedArea:      '누적영역',
  horizontalBar:    '가로막대',
  stackedBar:       '누적막대',
  area:             '영역',
  mixed:            '혼합',
  negativeBar:      '음수막대',
  groupedHorizontal:'그룹가로',
};

// 타입별 뱃지 배경색
const TYPE_COLORS = {
  line:             '#3b82f6',
  bar:              '#10b981',
  pie:              '#ef4444',
  doughnut:         '#8b5cf6',
  stepLine:         '#0891b2',
  percentBar:       '#f59e0b',
  radar:            '#6366f1',
  polarArea:        '#ec4899',
  bubble:           '#14b8a6',
  scatter:          '#f97316',
  horizontalStacked:'#84cc16',
  stackedArea:      '#06b6d4',
  horizontalBar:    '#a855f7',
  stackedBar:       '#22c55e',
  area:             '#0ea5e9',
  mixed:            '#dc2626',
  negativeBar:      '#64748b',
  groupedHorizontal:'#b45309',
};

// 모든 차트 공통 옵션 (반응형, 범례 하단)
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
};

// ── 1. 꺾은선 — tension 0.4 곡선, 포인트 강조
function LineChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      borderColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
      backgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '0.15'),
      tension: 0.4,
      pointRadius: 3,
    })),
  };
  return <Line data={chartData} options={BASE_OPTS} />;
}

// ── 2. 세로 막대 — 데이터셋별 팔레트 색상
function BarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return <Bar data={chartData} options={BASE_OPTS} />;
}

// ── 3. 파이 — 항목별 팔레트 색상
function PieChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <Pie data={chartData} options={BASE_OPTS} />;
}

// ── 4. 도넛 — 파이와 동일 구조, 가운데 구멍
function DoughnutChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <Doughnut data={chartData} options={BASE_OPTS} />;
}

// ── 5. 계단형 꺾은선 — stepped: 'before' 로 단계적 변화 표시
function StepLineChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      borderColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
      backgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '0.1'),
      stepped: 'before',
      pointRadius: 3,
    })),
  };
  return <Line data={chartData} options={BASE_OPTS} />;
}

// ── 6. 100% 누적 막대 — 각 구간 합계가 100%가 되도록 정규화
function PercentBarChart({ data }) {
  // 각 라벨 위치의 합계를 구해 비율로 변환
  const totals = data.labels.map((_, li) =>
    data.datasets.reduce((sum, ds) => sum + (ds.data[li] || 0), 0)
  );
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      data: d.data.map((v, li) => totals[li] ? Math.round((v / totals[li]) * 100) : 0),
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return (
    <Bar
      data={chartData}
      options={{
        ...BASE_OPTS,
        scales: {
          x: { stacked: true },
          y: { stacked: true, max: 100, ticks: { callback: v => `${v}%` } },
        },
      }}
    />
  );
}

// ── 7. 레이더 — 반투명 배경 면적, 다각형 축
function RadarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      borderColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
      backgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '0.2'),
      pointBackgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
    })),
  };
  return <Radar data={chartData} options={BASE_OPTS} />;
}

// ── 8. 폴라 에어리어 — 방사형 각도별 면적
function PolarAreaChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <PolarArea data={chartData} options={BASE_OPTS} />;
}

// ── 9. 버블 — x·y·r 3차원 데이터, 시장성/성장성 축
function BubbleChart({ data }) {
  const chartData = {
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return (
    <Bubble
      data={chartData}
      options={{
        ...BASE_OPTS,
        scales: {
          x: { title: { display: true, text: '시장성' } },
          y: { title: { display: true, text: '성장성' } },
        },
      }}
    />
  );
}

// ── 10. 산점도 — 광고비 vs 매출 상관관계
function ScatterChart({ data }) {
  const chartData = {
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return (
    <Scatter
      data={chartData}
      options={{
        ...BASE_OPTS,
        scales: {
          x: { title: { display: true, text: '광고비(백만원)' } },
          y: { title: { display: true, text: '매출(백만원)' } },
        },
      }}
    />
  );
}

// ── 11. 수평 누적 막대 — 가로 방향 + stacked
function HorizontalStackedChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return (
    <Bar
      data={chartData}
      options={{
        ...BASE_OPTS,
        indexAxis: 'y',
        scales: { x: { stacked: true }, y: { stacked: true } },
      }}
    />
  );
}

// ── 12. 누적 영역 — fill: true + stacked 스케일로 면적 누적
function StackedAreaChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      fill: true,
      borderColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
      backgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '0.5'),
      tension: 0.4,
    })),
  };
  return (
    <Line
      data={chartData}
      options={{
        ...BASE_OPTS,
        scales: { y: { stacked: true } },
      }}
    />
  );
}

// ── 13. 가로 막대 — indexAxis: 'y' 단일 데이터셋, 항목별 색상
function HorizontalBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d) => ({
      ...d,
      backgroundColor: data.labels.map((_, idx) => PALETTE[idx % PALETTE.length]),
    })),
  };
  return <Bar data={chartData} options={{ ...BASE_OPTS, indexAxis: 'y' }} />;
}

// ── 14. 누적 막대 — x·y 모두 stacked, 여러 데이터셋
function StackedBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return (
    <Bar
      data={chartData}
      options={{ ...BASE_OPTS, scales: { x: { stacked: true }, y: { stacked: true } } }}
    />
  );
}

// ── 15. 영역 — fill: true + 반투명 배경으로 면적 강조
function AreaChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      fill: true,
      borderColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
      backgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '0.3'),
      tension: 0.4,
    })),
  };
  return <Line data={chartData} options={BASE_OPTS} />;
}

// ── 16. 혼합 — 막대(매출) + 꺾은선(달성률) 이중 Y축
function MixedChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => {
      const base = { ...d, backgroundColor: PALETTE[i % PALETTE.length] };
      if (d.type === 'line') {
        base.borderColor = PALETTE[i % PALETTE.length].replace('0.8', '1');
        base.tension = 0.4;
        base.pointRadius = 3;
        base.yAxisID = 'y1';
      } else {
        base.yAxisID = 'y';
      }
      return base;
    }),
  };
  return (
    <Bar
      data={chartData}
      options={{
        ...BASE_OPTS,
        scales: {
          y:  { type: 'linear', position: 'left',  title: { display: true, text: '매출(억)' } },
          y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '달성률(%)' } },
        },
      }}
    />
  );
}

// ── 17. 음수 포함 막대 — 양수(유입)는 파랑, 음수(유출)는 빨강으로 자동 색상
function NegativeBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({
      ...d,
      // 양수 → 파랑, 음수 → 빨강
      backgroundColor: d.data.map(v => v >= 0 ? 'rgba(59,130,246,0.8)' : 'rgba(239,68,68,0.8)'),
      borderColor: d.data.map(v => v >= 0 ? 'rgba(59,130,246,1)' : 'rgba(239,68,68,1)'),
      borderWidth: 1,
    })),
  };
  return (
    <Bar
      data={chartData}
      options={{
        ...BASE_OPTS,
        scales: { y: { grid: { color: ctx => ctx.tick.value === 0 ? '#334155' : '#e2e8f0' } } },
      }}
    />
  );
}

// ── 18. 그룹 가로 막대 — 가로 방향 + 여러 데이터셋 나란히
function GroupedHorizontalChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return <Bar data={chartData} options={{ ...BASE_OPTS, indexAxis: 'y' }} />;
}

// 차트 type → 렌더 컴포넌트 매핑 테이블 (18종)
const CHART_RENDERERS = {
  line:             LineChart,
  bar:              BarChart,
  pie:              PieChart,
  doughnut:         DoughnutChart,
  stepLine:         StepLineChart,
  percentBar:       PercentBarChart,
  radar:            RadarChart,
  polarArea:        PolarAreaChart,
  bubble:           BubbleChart,
  scatter:          ScatterChart,
  horizontalStacked:HorizontalStackedChart,
  stackedArea:      StackedAreaChart,
  horizontalBar:    HorizontalBarChart,
  stackedBar:       StackedBarChart,
  area:             AreaChart,
  mixed:            MixedChart,
  negativeBar:      NegativeBarChart,
  groupedHorizontal:GroupedHorizontalChart,
};

// 뱃지 호버 시 표시할 JSON 구조·데이터 정보 포맷터
function formatTooltip(cd) {
  const MAX_LABELS = 5;
  const MAX_DATA   = 4;

  // labels 미리보기
  const lblArr  = cd.labels || [];
  const lblPrev = lblArr.slice(0, MAX_LABELS).join(', ')
    + (lblArr.length > MAX_LABELS ? ` ... +${lblArr.length - MAX_LABELS}개` : '');
  const lblLine = lblArr.length > 0
    ? `labels (${lblArr.length}): [${lblPrev}]`
    : 'labels: []';

  // datasets 미리보기
  const dsLines = (cd.datasets || []).map((ds, i) => {
    const arr = Array.isArray(ds.data) ? ds.data : [];
    const dPrev = arr.slice(0, MAX_DATA)
      .map(v => (typeof v === 'object' ? JSON.stringify(v) : v))
      .join(', ')
      + (arr.length > MAX_DATA ? ` ... +${arr.length - MAX_DATA}개` : '');
    const typeStr = ds.type ? ` | type:"${ds.type}"` : '';
    return `  [${i}] label:"${ds.label || '-'}"${typeStr}\n      data(${arr.length}): [${dPrev}]`;
  }).join('\n');

  return [
    `type   : "${cd.type}"`,
    `title  : "${cd.title}"`,
    lblLine,
    `datasets (${(cd.datasets || []).length}):`,
    dsLines,
  ].join('\n');
}

// 개별 차트 카드 — 타입 뱃지(호버 툴팁 포함) + 제목 + 차트 영역
function ChartCard({ chartData }) {
  // 툴팁 표시 여부
  const [tip, setTip] = useState(false);

  // type에 맞는 렌더러 선택, 없으면 BarChart 폴백
  const Renderer  = CHART_RENDERERS[chartData.type] || BarChart;
  // 한글 타입 라벨 및 뱃지 색상
  const typeLabel = TYPE_LABELS[chartData.type] || chartData.type;
  const typeColor = TYPE_COLORS[chartData.type] || '#64748b';

  return (
    <div style={{ ...styles.chartCard, position: 'relative' }}>
      {/* 제목 행 — 타입 뱃지(왼쪽) + 차트 제목 */}
      <div style={styles.titleRow}>
        {/* 뱃지 — 마우스 오버 시 JSON 구조 툴팁 표시 */}
        <span
          style={{ ...styles.typeBadge, background: typeColor, cursor: 'help' }}
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          {typeLabel}
        </span>
        <span style={styles.chartTitle}>{chartData.title}</span>
      </div>

      {/* JSON 구조·데이터 툴팁 — 뱃지 호버 시 카드 내부 절대 위치로 표시 */}
      {tip && (
        <div style={styles.tooltip}>
          {formatTooltip(chartData)}
        </div>
      )}

      {/* 차트 캔버스 영역 */}
      <div style={styles.chartBody}>
        <Renderer data={chartData} />
      </div>
    </div>
  );
}

// 차트 페이지 — 페이지 헤더 + 2열 3행(6개) 차트 그리드
export default function ChartPage({ pageData, pageNum }) {
  if (!pageData) return null;
  // chart1~chart6 를 배열로 변환
  const charts = [
    pageData.chart1, pageData.chart2, pageData.chart3,
    pageData.chart4, pageData.chart5, pageData.chart6,
  ].filter(Boolean); // 없는 항목 제외
  return (
    <div style={styles.page}>
      {/* 페이지 번호 뱃지 + 섹션 제목 */}
      <div style={styles.pageHeader}>
        <span style={styles.pageNum}>PAGE {pageNum}</span>
        <h2 style={styles.pageTitle}>{pageData.title}</h2>
      </div>
      {/* 2열 × 3행 차트 그리드 */}
      <div style={styles.chartGrid}>
        {charts.map((chart, idx) => (
          <ChartCard key={idx} chartData={chart} />
        ))}
      </div>
    </div>
  );
}

// 인라인 스타일 모음
const styles = {
  page: {
    width: '100%',
    padding: '20px 24px',
    boxSizing: 'border-box',
    background: '#fff',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: '2px solid #3b82f6',
  },
  pageNum: {
    background: '#3b82f6',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 4,
  },
  pageTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' },
  // 2열 × 3행 그리드 (페이지당 6개 차트)
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  chartCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '10px 12px',
    background: '#fafafa',
  },
  // 제목 행 — 타입 뱃지 + 차트 제목 가로 배치
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  // 차트 타입 뱃지 (왼쪽)
  typeBadge: {
    flexShrink: 0,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    whiteSpace: 'nowrap',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  // 차트 캔버스 높이 — 6개 표시를 위해 줄임
  chartBody: { height: 170 },

  // 뱃지 호버 툴팁 — 카드 기준 절대 위치, 다크 모노스페이스
  tooltip: {
    position: 'absolute',
    top: 30,        // 뱃지 바로 아래
    left: 0,
    zIndex: 9999,
    background: '#0f172a',
    color: '#94a3b8',
    fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
    fontSize: 11,
    lineHeight: 1.7,
    whiteSpace: 'pre',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #1e293b',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    minWidth: 320,
    maxWidth: 440,
    pointerEvents: 'none',  // 마우스 이벤트 통과
  },
};
