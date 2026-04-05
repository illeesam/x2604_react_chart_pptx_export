// Chart01Widget — 18종 차트 위젯 (윈도우트리 툴팁 + 편집 패널 포함)
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

// 차트 타입 → 한글 라벨 매핑 (뱃지 표시용)
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

// ── 6. 100% 누적 막대 — 합계가 100%가 되도록 정규화
function PercentBarChart({ data }) {
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

// ── 9. 버블 — x·y·r 3차원 데이터
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

// ── 12. 누적 영역 — fill: true + stacked 스케일
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

// ── 13. 가로 막대 — indexAxis: 'y', 항목별 색상
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

// ── 14. 누적 막대 — x·y 모두 stacked
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

// ── 15. 영역 — fill: true + 반투명 배경
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

// ── 17. 음수 포함 막대 — 양수 파랑, 음수 빨강
function NegativeBarChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(d => ({
      ...d,
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

// ── 18. 그룹 가로 막대 — 가로 방향 + 여러 데이터셋
function GroupedHorizontalChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d, i) => ({ ...d, backgroundColor: PALETTE[i % PALETTE.length] })),
  };
  return <Bar data={chartData} options={{ ...BASE_OPTS, indexAxis: 'y' }} />;
}

// 차트 type → 렌더 컴포넌트 매핑 (18종)
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

/* ──────────────────────────────────────────────────────────────
   TipNode — 읽기 전용 윈도우트리 노드 (뱃지 호버 툴팁용)
   depth < 2 는 기본 펼침, 클릭으로 접기/펼치기 토글
────────────────────────────────────────────────────────────── */
function TipNode({ label, value, depth, isLast }) {
  const [open, setOpen] = useState(depth < 2);
  const isArr = Array.isArray(value);
  const isObj = value !== null && typeof value === 'object';
  // 들여쓰기 px
  const pad = depth * 14;
  // 윈도우 트리 연결 문자
  const br = isLast ? '└─' : '├─';

  // 리프 노드 — 값 유형별 색상 표시
  if (!isObj) {
    const color = typeof value === 'string' ? '#7dd3fc'
      : typeof value === 'number' ? '#86efac'
      : '#fde68a';
    return (
      <div style={{ paddingLeft: pad, lineHeight: '1.6', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#475569' }}>{br} </span>
        <span style={{ color: '#e2e8f0' }}>{label}: </span>
        <span style={{ color }}>{JSON.stringify(value)}</span>
      </div>
    );
  }

  // 컬렉션 노드 — 배열/객체 자식 목록
  const children = isArr
    ? value.map((v, i) => ({ key: `[${i}]`, val: v }))
    : Object.entries(value).map(([k, v]) => ({ key: k, val: v }));

  return (
    <div>
      {/* 접기/펼치기 헤더 행 */}
      <div
        style={{ paddingLeft: pad, lineHeight: '1.6', cursor: 'pointer', whiteSpace: 'nowrap' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ color: '#475569' }}>{br} </span>
        <span style={{ color: '#fbbf24' }}>{open ? '▼' : '▶'} </span>
        <span style={{ color: '#e2e8f0' }}>{label}</span>
        <span style={{ color: '#475569' }}> {isArr ? `[${value.length}]` : `{${children.length}}`}</span>
      </div>
      {/* 펼침 상태일 때 자식 노드 렌더 */}
      {open && children.map((c, i) => (
        <TipNode
          key={c.key}
          label={c.key}
          value={c.val}
          depth={depth + 1}
          isLast={i === children.length - 1}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   EditNode — 편집 가능 윈도우트리 노드
   · 리프 클릭 → 인라인 입력 (Enter 확정, Esc 취소)
   · 배열 노드 → + 버튼으로 항목 추가
   · onRemove prop → × 버튼으로 상위 배열에서 제거
   · path 기반 setDraft 로 깊은 객체 불변 업데이트
────────────────────────────────────────────────────────────── */
function EditNode({ label, value, path, setDraft, depth, isLast, onRemove }) {
  const [open, setOpen] = useState(depth < 3);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');

  const isArr = Array.isArray(value);
  const isObj = value !== null && typeof value === 'object';
  const pad = depth * 14;
  const br = isLast ? '└─' : '├─';

  // path 경로의 값을 newVal 로 교체 (불변 deep-clone 후 갱신)
  const commit = (newVal) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      if (path.length > 0) cur[path[path.length - 1]] = newVal;
      return next;
    });
    setEditing(false);
  };

  // 배열 끝에 새 항목 추가 (기존 첫 항목 구조 복제)
  const addItem = () => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next;
      for (const p of path) cur = cur[p];
      const sample = cur.length > 0
        ? (typeof cur[0] === 'object' ? JSON.parse(JSON.stringify(cur[0])) : 0)
        : 0;
      cur.push(sample);
      return next;
    });
  };

  // 배열의 idx 번째 항목 제거
  const removeAt = (idx) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next;
      for (const p of path) cur = cur[p];
      cur.splice(idx, 1);
      return next;
    });
  };

  // 리프 노드
  if (!isObj) {
    const color = typeof value === 'string' ? '#7dd3fc'
      : typeof value === 'number' ? '#86efac'
      : '#fde68a';
    return (
      <div style={{ paddingLeft: pad, lineHeight: '1.8', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
        <span style={{ color: '#475569', flexShrink: 0 }}>{br} </span>
        <span style={{ color: '#e2e8f0', flexShrink: 0 }}>{label}: </span>
        {editing ? (
          <input
            autoFocus
            style={ep.input}
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // 숫자로 변환 가능하면 Number, 아니면 string 유지
                const parsed = editVal !== '' && !isNaN(editVal) ? Number(editVal) : editVal;
                commit(parsed);
              }
              if (e.key === 'Escape') setEditing(false);
            }}
            onBlur={() => setEditing(false)}
          />
        ) : (
          <span
            style={{ color, cursor: 'pointer', textDecoration: 'underline dotted', flexShrink: 0 }}
            onClick={() => { setEditVal(String(value)); setEditing(true); }}
          >
            {JSON.stringify(value)}
          </span>
        )}
        {/* 상위 배열에서 이 항목 삭제 */}
        {onRemove && <button style={ep.rmBtn} onClick={onRemove}>×</button>}
      </div>
    );
  }

  // 컬렉션 노드
  const children = isArr
    ? value.map((v, i) => ({ key: `[${i}]`, val: v, idx: i }))
    : Object.entries(value).map(([k, v]) => ({ key: k, val: v, idx: null }));

  return (
    <div>
      {/* 헤더 행 — 토글 + 배열이면 + 버튼 */}
      <div style={{ paddingLeft: pad, lineHeight: '1.8', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#475569', flexShrink: 0 }}>{br} </span>
        <span
          style={{ color: '#fbbf24', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setOpen(o => !o)}
        >
          {open ? '▼' : '▶'}{' '}
        </span>
        <span style={{ color: '#e2e8f0', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>{label}</span>
        <span style={{ color: '#475569', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
          {' '}{isArr ? `[${value.length}]` : `{${children.length}}`}
        </span>
        {/* 배열이면 항목 추가 버튼 */}
        {isArr && <button style={ep.addBtn} onClick={addItem}>+</button>}
        {/* 상위 배열에서 이 노드 삭제 */}
        {onRemove && <button style={ep.rmBtn} onClick={onRemove}>×</button>}
      </div>
      {/* 자식 노드 목록 */}
      {open && children.map((c, i) => (
        <EditNode
          key={`${c.key}-${i}`}
          label={c.key}
          value={c.val}
          path={isArr ? [...path, c.idx] : [...path, c.key]}
          setDraft={setDraft}
          depth={depth + 1}
          isLast={i === children.length - 1}
          onRemove={isArr ? () => removeAt(c.idx) : undefined}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   EditPanel — 차트 데이터 편집 오버레이 패널
   · 다크 테마 full-screen 오버레이
   · 헤더: 타입 뱃지 + 차트 제목 + 닫기
   · 본문: EditNode 트리
   · 푸터: 취소 | 저장·적용
────────────────────────────────────────────────────────────── */
function EditPanel({ chartData, onSave, onClose }) {
  // 편집 중인 차트 데이터 초안 (원본 깊은 복사)
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(chartData)));
  const typeColor = TYPE_COLORS[draft.type] || '#64748b';

  return (
    <div style={ep.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ep.panel}>
        {/* 편집 패널 헤더 */}
        <div style={ep.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...ep.typeBadge, background: typeColor }}>
              {TYPE_LABELS[draft.type] || draft.type}
            </span>
            <span style={ep.panelTitle}>{draft.title}</span>
          </div>
          <button style={ep.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 조작 안내 */}
        <div style={ep.guide}>
          <span>클릭: 값 편집</span>
          <span style={ep.sep}>│</span>
          <span>Enter: 확인</span>
          <span style={ep.sep}>│</span>
          <span>Esc: 취소</span>
          <span style={ep.sep}>│</span>
          <span style={{ color: '#86efac' }}>+: 항목 추가</span>
          <span style={ep.sep}>│</span>
          <span style={{ color: '#fca5a5' }}>×: 항목 삭제</span>
        </div>

        {/* 트리 편집 본문 */}
        <div style={ep.body}>
          <EditNode
            label="📊 chart"
            value={draft}
            path={[]}
            setDraft={setDraft}
            depth={0}
            isLast={true}
          />
        </div>

        {/* 푸터 — 취소 / 저장·적용 */}
        <div style={ep.footer}>
          <button style={ep.cancelBtn} onClick={onClose}>취소</button>
          <button style={ep.saveBtn} onClick={() => onSave(draft)}>저장·적용</button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ChartCard — 개별 차트 카드
   · 타입 뱃지 호버 → TipNode 윈도우트리 툴팁
   · ✏️ 편집 아이콘 클릭 → EditPanel 오픈
   · onUpdate 콜백으로 부모(ChartPage)에 수정 데이터 전달
────────────────────────────────────────────────────────────── */
function ChartCard({ chartData, onUpdate }) {
  // 툴팁 표시 여부
  const [tip, setTip] = useState(false);
  // 편집 패널 열림 여부
  const [editOpen, setEditOpen] = useState(false);

  // type에 맞는 렌더러 선택, 없으면 BarChart 폴백
  const Renderer  = CHART_RENDERERS[chartData.type] || BarChart;
  const typeLabel = TYPE_LABELS[chartData.type] || chartData.type;
  const typeColor = TYPE_COLORS[chartData.type] || '#64748b';

  return (
    <div style={styles.chartCard}>
      {/* 제목 행 — 타입 뱃지 + 제목 + 편집 아이콘 */}
      <div style={styles.titleRow}>
        {/* 타입 뱃지 — 호버 시 트리 툴팁 */}
        <span
          style={{ ...styles.typeBadge, background: typeColor, cursor: 'help' }}
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          {typeLabel}
        </span>
        <span style={styles.chartTitle}>{chartData.title}</span>
        {/* 편집 아이콘 — 맨 우측 */}
        <span
          style={styles.editBtn}
          onClick={() => setEditOpen(true)}
          title="차트 데이터 편집"
        >
          ✏️
        </span>
      </div>

      {/* 윈도우트리 구조 툴팁 — 뱃지 호버 시 */}
      {tip && (
        <div style={styles.tooltip}>
          <TipNode label="📊 chart" value={chartData} depth={0} isLast={true} />
        </div>
      )}

      {/* 차트 캔버스 영역 */}
      <div style={styles.chartBody}>
        <Renderer data={chartData} />
      </div>

      {/* 편집 패널 오버레이 */}
      {editOpen && (
        <EditPanel
          chartData={chartData}
          onSave={(updated) => { onUpdate(updated); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ChartPage (default export) — 페이지 헤더 + 2×3 차트 그리드
   · localCharts 로컬 상태로 편집 결과 반영
   · pageData: 해당 슬라이드 차트 JSON
   · pageNum: 미리보기 탭 번호 (1~3)
────────────────────────────────────────────────────────────── */
export default function ChartPage({ pageData, pageNum }) {
  // chart1~chart6 를 로컬 상태로 관리 (편집 반영) — Hook은 항상 최상단 호출
  const [localCharts, setLocalCharts] = useState(() =>
    pageData
      ? [pageData.chart1, pageData.chart2, pageData.chart3,
         pageData.chart4, pageData.chart5, pageData.chart6].filter(Boolean)
      : []
  );

  if (!pageData) return null;

  // idx 번째 차트 데이터를 newData 로 교체
  const handleUpdate = (idx, newData) =>
    setLocalCharts(prev => prev.map((c, i) => i === idx ? newData : c));

  return (
    <div style={styles.page}>
      {/* 페이지 번호 뱃지 + 섹션 제목 */}
      <div style={styles.pageHeader}>
        <span style={styles.pageNum}>PAGE {pageNum}</span>
        <h2 style={styles.pageTitle}>{pageData.title}</h2>
      </div>
      {/* 2열 × 3행 차트 그리드 */}
      <div style={styles.chartGrid}>
        {localCharts.map((chart, idx) => (
          <ChartCard
            key={idx}
            chartData={chart}
            onUpdate={(d) => handleUpdate(idx, d)}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   EditPanel 전용 스타일 (ep)
────────────────────────────────────────────────────────────── */
const ep = {
  // 전체 화면 어두운 오버레이
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  // 패널 컨테이너 (다크 테마)
  panel: {
    background: '#0f172a',
    borderRadius: 10,
    width: '100%', maxWidth: 560,
    maxHeight: '82vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    border: '1px solid #1e293b',
  },
  // 패널 헤더
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid #1e293b',
  },
  typeBadge: {
    color: '#fff', fontSize: 11, fontWeight: 700,
    padding: '2px 8px', borderRadius: 4, flexShrink: 0,
  },
  panelTitle: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  closeBtn: {
    background: 'none', border: 'none', color: '#94a3b8',
    cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0,
  },
  // 조작 안내 바
  guide: {
    display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
    padding: '6px 16px', background: '#1e293b',
    fontSize: 10, color: '#94a3b8',
  },
  sep: { color: '#334155' },
  // 트리 편집 본문 (스크롤)
  body: {
    flex: 1, overflowY: 'auto', padding: '10px 16px',
    fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
    fontSize: 12, lineHeight: 1.6,
  },
  // 푸터 버튼 영역
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: 8,
    padding: '10px 16px', borderTop: '1px solid #1e293b',
  },
  cancelBtn: {
    padding: '6px 16px', borderRadius: 6,
    background: '#1e293b', border: '1px solid #334155',
    color: '#94a3b8', cursor: 'pointer', fontSize: 12,
  },
  saveBtn: {
    padding: '6px 20px', borderRadius: 6,
    background: '#3b82f6', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  },
  // 인라인 편집 입력창
  input: {
    background: '#1e293b', border: '1px solid #3b82f6',
    color: '#86efac', fontSize: 12, padding: '1px 6px',
    borderRadius: 4, outline: 'none',
    fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
    width: 130,
  },
  // 배열 항목 추가 버튼
  addBtn: {
    background: '#166534', border: 'none', color: '#86efac',
    cursor: 'pointer', fontSize: 11, fontWeight: 700,
    borderRadius: 3, padding: '0 6px', lineHeight: '17px', flexShrink: 0,
  },
  // 배열 항목 삭제 버튼
  rmBtn: {
    background: '#7f1d1d', border: 'none', color: '#fca5a5',
    cursor: 'pointer', fontSize: 11, fontWeight: 700,
    borderRadius: 3, padding: '0 6px', lineHeight: '17px', flexShrink: 0,
  },
};

/* ──────────────────────────────────────────────────────────────
   ChartCard / ChartPage 공용 인라인 스타일 (styles)
────────────────────────────────────────────────────────────── */
const styles = {
  // 차트 슬라이드 페이지 전체 래퍼
  page: {
    width: '100%', padding: '20px 24px',
    boxSizing: 'border-box', background: '#fff',
  },
  // PAGE 뱃지 + 섹션 제목 행
  pageHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #3b82f6',
  },
  pageNum: {
    background: '#3b82f6', color: '#fff',
    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
  },
  pageTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' },
  // 2열 × 3행 그리드
  chartGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  },
  // 개별 차트 카드 (position: relative — 툴팁 기준)
  chartCard: {
    border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 12px', background: '#fafafa',
    position: 'relative',
  },
  // 제목 행 — 뱃지 + 제목 + 편집 아이콘 가로 배치
  titleRow: {
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
  },
  // 차트 타입 뱃지
  typeBadge: {
    flexShrink: 0, color: '#fff', fontSize: 10, fontWeight: 700,
    padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap',
  },
  chartTitle: {
    fontSize: 12, fontWeight: 600, color: '#475569',
    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
    flex: 1,
  },
  // 편집 아이콘 — 제목 행 맨 우측
  editBtn: {
    marginLeft: 'auto', cursor: 'pointer', fontSize: 13,
    lineHeight: 1, flexShrink: 0, userSelect: 'none', opacity: 0.75,
  },
  // 차트 캔버스 높이 — 6개 표시를 위해 조정
  chartBody: { height: 170 },
  // 뱃지 호버 윈도우트리 툴팁
  tooltip: {
    position: 'absolute', top: 30, left: 0,
    zIndex: 9999,
    background: '#0f172a', color: '#94a3b8',
    fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
    fontSize: 11, lineHeight: 1.7,
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #1e293b',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    minWidth: 300, maxWidth: 420, maxHeight: 380, overflowY: 'auto',
    pointerEvents: 'none',
  },
};
