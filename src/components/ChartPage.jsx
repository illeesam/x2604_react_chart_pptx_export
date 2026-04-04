// 차트 페이지 (page 1~3) — chart.js 12종 차트를 2×2 그리드로 렌더
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

// 모든 차트 공통 옵션 (반응형, 범례 하단)
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
};

// 꺾은선 차트 — tension 0.4 곡선, 포인트 강조
function LineChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      borderColor: PALETTE[i % PALETTE.length].replace('0.8', '1'),
      backgroundColor: PALETTE[i % PALETTE.length].replace('0.8', '0.15'),
      tension: 0.4,
      pointRadius: 4,
    })),
  };
  return <Line data={chartData} options={BASE_OPTS} />;
}

// 막대 차트 — 데이터셋별 팔레트 색상
function BarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return <Bar data={chartData} options={BASE_OPTS} />;
}

// 파이 차트 — 데이터 항목별 팔레트 색상
function PieChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <Pie data={chartData} options={BASE_OPTS} />;
}

// 도넛 차트 — 파이 차트와 동일 구조
function DoughnutChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <Doughnut data={chartData} options={BASE_OPTS} />;
}

// 레이더 차트 — 반투명 배경 면적 표시
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

// 폴라 에어리어 차트 — 방사형 각도별 면적
function PolarAreaChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <PolarArea data={chartData} options={BASE_OPTS} />;
}

// 버블 차트 — x·y·r 3차원 데이터, 시장성/성장성 축
function BubbleChart({ data }) {
  const chartData = {
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return <Bubble data={chartData} options={{ ...BASE_OPTS, scales: { x: { title: { display: true, text: '시장성' } }, y: { title: { display: true, text: '성장성' } } } }} />;
}

// 산점도 차트 — 광고비 vs 매출 상관관계
function ScatterChart({ data }) {
  const chartData = {
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return <Scatter data={chartData} options={{ ...BASE_OPTS, scales: { x: { title: { display: true, text: '광고비(백만원)' } }, y: { title: { display: true, text: '매출(백만원)' } } } }} />;
}

// 수평 막대 차트 — indexAxis: 'y' 로 가로 방향
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

// 누적 막대 차트 — x·y 모두 stacked 활성화
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

// 영역 차트 — fill: true + 반투명 배경으로 면적 강조
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

// 혼합 차트 — 막대(매출)·꺾은선(달성률) 이중 Y축
function MixedChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => {
      const base = { ...d, backgroundColor: PALETTE[i % PALETTE.length] };
      if (d.type === 'line') {
        // 꺾은선 데이터셋 → 오른쪽 Y축(y1) 사용
        base.borderColor = PALETTE[i % PALETTE.length].replace('0.8', '1');
        base.tension = 0.4;
        base.pointRadius = 4;
        base.yAxisID = 'y1';
      } else {
        // 막대 데이터셋 → 왼쪽 Y축(y) 사용
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

// 차트 type → 렌더 컴포넌트 매핑 테이블
const CHART_RENDERERS = {
  line:          LineChart,
  bar:           BarChart,
  pie:           PieChart,
  doughnut:      DoughnutChart,
  radar:         RadarChart,
  polarArea:     PolarAreaChart,
  bubble:        BubbleChart,
  scatter:       ScatterChart,
  horizontalBar: HorizontalBarChart,
  stackedBar:    StackedBarChart,
  area:          AreaChart,
  mixed:         MixedChart,
};

// 개별 차트 카드 — 제목 + 차트 영역
function ChartCard({ chartData }) {
  // type 에 맞는 렌더러 선택, 없으면 BarChart 폴백
  const Renderer = CHART_RENDERERS[chartData.type] || BarChart;
  return (
    <div style={styles.chartCard}>
      <div style={styles.chartTitle}>{chartData.title}</div>
      <div style={styles.chartBody}>
        <Renderer data={chartData} />
      </div>
    </div>
  );
}

// 차트 페이지 — 페이지 헤더 + 2×2 차트 그리드
export default function ChartPage({ pageData, pageNum }) {
  if (!pageData) return null;
  // chart1~chart4 를 배열로 변환
  const charts = [pageData.chart1, pageData.chart2, pageData.chart3, pageData.chart4];
  return (
    <div style={styles.page}>
      {/* 페이지 번호 뱃지 + 섹션 제목 */}
      <div style={styles.pageHeader}>
        <span style={styles.pageNum}>PAGE {pageNum}</span>
        <h2 style={styles.pageTitle}>{pageData.title}</h2>
      </div>
      {/* 2열 2행 차트 그리드 */}
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
    padding: '24px',
    boxSizing: 'border-box',
    background: '#fff',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 12,
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
  pageTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  chartCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 16,
    background: '#fafafa',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 10,
    textAlign: 'center',
  },
  // 차트 캔버스 높이 고정
  chartBody: { height: 220 },
};
