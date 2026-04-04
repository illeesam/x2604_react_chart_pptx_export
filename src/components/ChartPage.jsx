import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const PALETTE = [
  'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)',
  'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)',
  'rgba(20,184,166,0.8)', 'rgba(251,146,60,0.8)', 'rgba(99,102,241,0.8)',
  'rgba(52,211,153,0.8)',
];

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
};

function buildDataset(raw, idx) {
  return {
    ...raw,
    backgroundColor: Array.isArray(raw.data)
      ? raw.data.map((_, i) => PALETTE[(idx + i) % PALETTE.length])
      : PALETTE[idx % PALETTE.length],
    borderColor: PALETTE[idx % PALETTE.length].replace('0.8', '1'),
    borderWidth: 2,
  };
}

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

function BarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return <Bar data={chartData} options={BASE_OPTS} />;
}

function PieChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <Pie data={chartData} options={BASE_OPTS} />;
}

function DoughnutChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <Doughnut data={chartData} options={BASE_OPTS} />;
}

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

function PolarAreaChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({ ...d, backgroundColor: PALETTE.slice(0, d.data.length) })),
  };
  return <PolarArea data={chartData} options={BASE_OPTS} />;
}

function BubbleChart({ data }) {
  const chartData = {
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return <Bubble data={chartData} options={{ ...BASE_OPTS, scales: { x: { title: { display: true, text: '시장성' } }, y: { title: { display: true, text: '성장성' } } } }} />;
}

function ScatterChart({ data }) {
  const chartData = {
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: PALETTE[i % PALETTE.length],
    })),
  };
  return <Scatter data={chartData} options={{ ...BASE_OPTS, scales: { x: { title: { display: true, text: '광고비(백만원)' } }, y: { title: { display: true, text: '매출(백만원)' } } } }} />;
}

function HorizontalBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({
      ...d,
      backgroundColor: data.labels.map((_, idx) => PALETTE[idx % PALETTE.length]),
    })),
  };
  return <Bar data={chartData} options={{ ...BASE_OPTS, indexAxis: 'y' }} />;
}

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

function MixedChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => {
      const base = { ...d, backgroundColor: PALETTE[i % PALETTE.length] };
      if (d.type === 'line') {
        base.borderColor = PALETTE[i % PALETTE.length].replace('0.8', '1');
        base.tension = 0.4;
        base.pointRadius = 4;
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
          y: { type: 'linear', position: 'left', title: { display: true, text: '매출(억)' } },
          y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '달성률(%)' } },
        },
      }}
    />
  );
}

const CHART_RENDERERS = {
  line: LineChart,
  bar: BarChart,
  pie: PieChart,
  doughnut: DoughnutChart,
  radar: RadarChart,
  polarArea: PolarAreaChart,
  bubble: BubbleChart,
  scatter: ScatterChart,
  horizontalBar: HorizontalBarChart,
  stackedBar: StackedBarChart,
  area: AreaChart,
  mixed: MixedChart,
};

function ChartCard({ chartData }) {
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

export default function ChartPage({ pageData, pageNum }) {
  if (!pageData) return null;
  const charts = [pageData.chart1, pageData.chart2, pageData.chart3, pageData.chart4];
  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <span style={styles.pageNum}>PAGE {pageNum}</span>
        <h2 style={styles.pageTitle}>{pageData.title}</h2>
      </div>
      <div style={styles.chartGrid}>
        {charts.map((chart, idx) => (
          <ChartCard key={idx} chartData={chart} />
        ))}
      </div>
    </div>
  );
}

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
  chartBody: { height: 220 },
};
