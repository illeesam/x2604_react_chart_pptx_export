/**
 * Base01WidgetPanel — 위젯 패널 핵심 로직 (재활용 가능 컴포넌트)
 *
 * Props:
 *   raw  {object}  widgetListData 원본 JSON (widgets[], reportTitle 등)
 *   deck {object}  normalizePreviewModalData(raw) 결과 (charts, dataPages 등)
 *
 * 내부 책임:
 *   · 그리드 스냅·겹침 해소·드래그·리사이즈
 *   · 반응형(CSS 그리드) ↔ 자유 배치 토글 + 열 수 선택(1~5)
 *   · 다운로드 (PDF / PPTX) — handleExport 내장
 *   · widgetData JSON 팝오버
 *   · 배치 속성 정보 레이어
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadAllPdf, downloadAllPptx, makeFilename } from '../../utils/downloadHelpers';
import CoverPage    from '../CoverPage';
import Chart01Widget from '../widget/Chart01Widget';
import Data01Widget  from '../widget/Data01Widget';

/* ────────────────────────────────────────────────────────────
   레이아웃 상수
──────────────────────────────────────────────────────────── */
const MIN_W       = 220;   // 위젯 최소 너비 (px)
const MIN_H       = 180;   // 위젯 최소 높이 (px)
const GRID        = 20;    // 스냅·배치 간격 (px) — mouseUp 시 이 단위로 정렬
const GRID_BG     = 10;    // 배경 격자 선 간격 (px) — 시각적 가이드
const GAP         = GRID;  // 위젯 간 초기 여백
const PAD         = GRID;  // 캔버스 바깥 여백
const OVERLAP_ITER = 120;  // 겹침 해소 최대 반복 횟수

/* ────────────────────────────────────────────────────────────
   레이아웃 순수 함수 (side-effect 없음)
──────────────────────────────────────────────────────────── */

/** n 을 GRID 단위로 반올림 */
function snap(n) {
  return Math.round(n / GRID) * GRID;
}

/** 레이아웃 아이템 하나를 유효 범위(최솟값·스냅)로 정규화 */
function snapLayoutItem(L) {
  return {
    ...L,
    x: Math.max(0, snap(L.x)),
    y: Math.max(0, snap(L.y)),
    w: Math.max(MIN_W, snap(Math.max(MIN_W, L.w))),
    h: Math.max(MIN_H, snap(Math.max(MIN_H, L.h))),
  };
}

/** 두 사각형이 겹치는지 확인 */
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * mover 를 fixed 에서 분리.
 * 침투 깊이가 짧은 축(x/y) 방향으로 이동량이 최소인 방향 선택.
 */
function separatePair(mover, fixed) {
  if (!rectsOverlap(mover, fixed)) return false;
  // 각 축 침투 깊이
  const ox = Math.min(mover.x + mover.w, fixed.x + fixed.w) - Math.max(mover.x, fixed.x);
  const oy = Math.min(mover.y + mover.h, fixed.y + fixed.h) - Math.max(mover.y, fixed.y);
  let dx = 0;
  let dy = 0;
  if (ox < oy) {
    // x 축으로 분리 — 오른쪽/왼쪽 중 이동량이 작은 방향
    const right = fixed.x + fixed.w - mover.x;
    const left  = fixed.x - mover.w  - mover.x;
    dx = Math.abs(right) <= Math.abs(left) ? right : left;
  } else {
    // y 축으로 분리 — 아래/위 중 이동량이 작은 방향
    const down = fixed.y + fixed.h - mover.y;
    const up   = fixed.y - mover.h  - mover.y;
    dy = Math.abs(down) <= Math.abs(up) ? down : up;
  }
  mover.x = Math.max(0, snap(mover.x + dx));
  mover.y = Math.max(0, snap(mover.y + dy));
  return true;
}

/**
 * anchorIndex 카드는 고정, 나머지 카드들을 겹치지 않도록 밀어냄.
 * 비앵커끼리 겹칠 경우 z-index 가 높은 쪽을 고정, 낮은 쪽을 이동.
 * 최대 OVERLAP_ITER 회 반복 후 수렴하지 않으면 중단.
 */
function resolveOverlaps(layouts, anchorIndex) {
  const r = layouts.map((x) => snapLayoutItem({ ...x }));
  for (let iter = 0; iter < OVERLAP_ITER; iter++) {
    let changed = false;
    for (let i = 0; i < r.length; i++) {
      for (let j = i + 1; j < r.length; j++) {
        if (!rectsOverlap(r[i], r[j])) continue;
        let moverIdx, fixedIdx;
        if      (i === anchorIndex) { moverIdx = j; fixedIdx = i; }
        else if (j === anchorIndex) { moverIdx = i; fixedIdx = j; }
        else {
          // 비앵커: z 가 높은 쪽을 고정
          fixedIdx = r[i].z >= r[j].z ? i : j;
          moverIdx = fixedIdx === i ? j : i;
        }
        separatePair(r[moverIdx], r[fixedIdx]);
        changed = true;
      }
    }
    if (!changed) break; // 더 이상 겹침 없으면 조기 종료
  }
  return r;
}

/**
 * 최초 배치: 위젯을 세로로 겹치지 않게 쌓음 (그리드 정렬).
 * @param {number} count 위젯 수
 */
function initialLayoutsForWidgets(count) {
  const w0 = snap(440); // 초기 너비
  const h0 = snap(320); // 초기 높이
  const out = [];
  let y = PAD;
  for (let i = 0; i < count; i++) {
    out.push({ x: PAD, y, w: w0, h: h0, z: 10 + i }); // z: 뒤쪽 위젯부터 낮은 값
    y += h0 + GAP;
  }
  return out;
}

/**
 * 캔버스 최소 높이 계산.
 * 모든 위젯 하단 중 가장 아래 + 여백.
 */
function canvasMinHeight(layouts) {
  if (!layouts.length) return 400;
  const bottom = layouts.reduce((m, L) => Math.max(m, L.y + L.h), 0);
  return Math.max(400, bottom + PAD * 4);
}

/** 마우스 이벤트 기본 동작·버블링 차단 (드래그 시작 시 텍스트 선택 방지) */
function stop(e) {
  e.preventDefault();
  e.stopPropagation();
}

/* ────────────────────────────────────────────────────────────
   위젯 본문 렌더러
   widgetType 에 따라 적합한 컴포넌트를 반환
──────────────────────────────────────────────────────────── */
function renderWidgetBody(widget, deck) {
  const t = widget.widgetType;

  // 표지 위젯
  if (t === 'CoverPage') return <CoverPage data={deck} />;

  // 차트 위젯 — pageKey 로 charts 슬롯 참조
  if (t === 'Chart01Widget') {
    const pk = widget.widgetAttr?.pageKey;
    return (
      <Chart01Widget
        pageData={deck.charts?.[pk]}
        pageNum={widget.widgetAttr?.chartNum ?? 1}
      />
    );
  }

  // 데이터 위젯
  if (['Data01Widget'].includes(t)) {
    const pk = widget.widgetAttr?.pageKey;
    return <Data01Widget data={deck.dataPages?.[pk]} pageKey={pk} />;
  }

  // 알 수 없는 타입 — JSON 원문 표시
  return (
    <div className="p-4 text-xs text-slate-600">
      <div className="font-semibold text-slate-800">{t || 'unknown'}</div>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all">
        {JSON.stringify(widget, null, 2)}
      </pre>
    </div>
  );
}


/* ────────────────────────────────────────────────────────────
   WidgetLayoutInfoPanel
   위젯 카드 헤더 위치 아이콘 클릭 → 해당 위젯의 배치 속성(x·y·w·h·z·pageKey) 팝오버
   content 는 select-text 로 드래그·복사 가능
──────────────────────────────────────────────────────────── */
function WidgetLayoutInfoPanel({ label, widget, layout, open, onToggle, onClose }) {
  const btnRef   = useRef(null); // 아이콘 버튼 참조
  const panelRef = useRef(null); // 팝오버 DOM 참조

  /** JSON 직렬화 — widget 변경 시에만 재계산 (widgetData JSON 패널과 동일한 내용) */
  const jsonText = useMemo(() => JSON.stringify(
    {
      widgetType: widget.widgetType,
      widgetAttr: widget.widgetAttr ?? null,
      widgetData: widget.widgetData ?? null,
    },
    null, 2,
  ), [widget]);

  const [copied, setCopied] = useState(false); // 복사 완료 피드백 상태

  /** 클립보드 복사 */
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // 팝오버 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target))   return;
      onClose();
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open, onClose]);

  return (
    <div className="relative shrink-0">
      {/* 위치 정보 아이콘 버튼 */}
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-label={`${label} — 배치 위치 정보`}
        title="위젯 위치 정보"
        className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-300/90 bg-white text-slate-500 shadow-sm hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        <IconPosition />
      </button>

      {/* 위치 정보 팝오버 */}
      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full z-[620] mt-1 w-[min(100vw-2rem,28rem)] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl"
          role="dialog"
          aria-label="위젯 배치 위치 정보"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* 팝오버 헤더 */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-800 px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-slate-300">배치 위치 · Layout</span>
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-700 hover:text-white"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="닫기"
            >
              <IconClose />
            </button>
          </div>

          {/* 속성 테이블 — select-text 로 복사 가능 */}
          <div className="select-text px-3 py-2">
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['타입',    widget.widgetType],
                  ['pageKey', widget.widgetAttr?.pageKey ?? '—'],
                  ['X',       layout?.x ?? '—'],
                  ['Y',       layout?.y ?? '—'],
                  ['W (너비)',  layout?.w ?? '—'],
                  ['H (높이)',  layout?.h ?? '—'],
                  ['Z (순서)',  layout?.z ?? '—'],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-100 last:border-0">
                    <td className="py-1 pr-3 font-semibold text-slate-500">{k}</td>
                    <td className="py-1 font-mono text-slate-800">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JSON 미리보기 + 복사 버튼 */}
          <div className="border-t border-slate-200 px-2 pb-2 pt-1.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">JSON</span>
              <button
                type="button"
                className={[
                  'rounded px-2 py-0.5 text-[10px] font-semibold transition-colors',
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700',
                ].join(' ')}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleCopy}
              >
                {copied ? '✓ 복사됨' : '복사'}
              </button>
            </div>
            {/* 드래그 선택 가능한 JSON pre */}
            <pre className="select-text max-h-72 overflow-auto rounded bg-slate-950 p-2 font-mono text-[10px] leading-snug text-emerald-300 whitespace-pre-wrap break-all">
              {jsonText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   LayoutInfoLayer
   헤더 아이콘 클릭 → 전체 위젯 배치 속성(x·y·w·h·z·pageKey) 테이블 오버레이
──────────────────────────────────────────────────────────── */
function LayoutInfoLayer({ widgets, layouts, onClose }) {
  const overlayRef = useRef(null); // 패널 DOM 참조 (바깥 클릭 감지용)

  // 패널 바깥 클릭 시 닫기
  useEffect(() => {
    const onDown = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[800] flex items-start justify-center bg-black/30 pt-16">
      <div
        ref={overlayRef}
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl"
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <IconLayoutWidgets className="text-white" />
            <span className="text-sm font-bold text-white">위젯 배치 속성 정보</span>
            <span className="ml-1 rounded-full bg-slate-600 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              {widgets.length}개
            </span>
          </div>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={onClose}
            aria-label="닫기"
          >
            <IconClose />
          </button>
        </div>

        {/* 배치 속성 테이블 (스크롤 가능) */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 text-slate-600">
                {['#', '위젯 라벨', '타입', 'X', 'Y', 'W', 'H', 'Z', 'pageKey'].map((h, i) => (
                  <th
                    key={h}
                    className={`border-b border-slate-200 px-3 py-2 font-semibold ${i >= 3 && i <= 7 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {widgets.map((w, i) => {
                const L     = layouts[i]; // 해당 위젯의 레이아웃 값
                const label = w.widgetAttr?.tabLabel || w.widgetType;
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="border-b border-slate-100 px-3 py-2 font-semibold text-slate-800">{label}</td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {w.widgetType}
                      </span>
                    </td>
                    {L ? (
                      <>
                        <td className="border-b border-slate-100 px-3 py-2 text-right font-mono text-slate-600">{L.x}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right font-mono text-slate-600">{L.y}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right font-mono text-blue-600">{L.w}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right font-mono text-blue-600">{L.h}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right font-mono text-slate-500">{L.z}</td>
                      </>
                    ) : (
                      <td colSpan={5} className="border-b border-slate-100 px-3 py-2 text-center text-slate-400">—</td>
                    )}
                    <td className="border-b border-slate-100 px-3 py-2 font-mono text-[10px] text-slate-500">
                      {w.widgetAttr?.pageKey ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 패널 푸터 — 상수 안내 + 닫기 */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-slate-50 px-4 py-2">
          <span className="text-[10px] text-slate-400">
            스냅 {GRID}px · 최소 {MIN_W}×{MIN_H}px · 겹침해소 최대 {OVERLAP_ITER}회
          </span>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-900"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PropsInfoLayer
   헤더 아이콘 클릭 → raw / deck props 전체를 JSON 으로 보여주는 오버레이
   탭(raw / deck) 전환, 드래그 선택·복사 가능
──────────────────────────────────────────────────────────── */
function PropsInfoLayer({ raw, deck, onClose }) {
  const overlayRef = useRef(null);
  const [tab,    setTab]    = useState('raw');   // 'raw' | 'deck'
  const [copied, setCopied] = useState(false);

  /** raw / deck JSON — 탭 변경 시에만 재계산 */
  const rawJson  = useMemo(() => JSON.stringify(raw,  null, 2), [raw]);
  const deckJson = useMemo(() => JSON.stringify(deck, null, 2), [deck]);
  const activeJson = tab === 'raw' ? rawJson : deckJson;

  /** 클립보드 복사 */
  const handleCopy = () => {
    navigator.clipboard.writeText(activeJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // 패널 바깥 클릭 시 닫기
  useEffect(() => {
    const onDown = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[800] flex items-start justify-center bg-black/40 pt-14">
      <div
        ref={overlayRef}
        className="flex w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl"
        style={{ maxHeight: '82vh' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between rounded-t-xl border-b border-slate-700 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <IconLayers className="text-slate-300" />
            <span className="text-sm font-bold text-white">Props 정보</span>
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              Base01WidgetPanel
            </span>
          </div>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
            onClick={onClose}
            aria-label="닫기"
          >
            <IconClose />
          </button>
        </div>

        {/* 탭 바 + 복사 버튼 */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="flex gap-1">
            {[
              { key: 'raw',  label: 'raw',  desc: 'widgetListData 원본' },
              { key: 'deck', label: 'deck', desc: 'normalizePreviewModalData 결과' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                title={desc}
                className={[
                  'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                  tab === key
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700',
                ].join(' ')}
              >
                {label}
                <span className="ml-1 text-[10px] opacity-60">{desc}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={[
              'rounded px-2.5 py-1 text-[11px] font-semibold transition-colors',
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700',
            ].join(' ')}
          >
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>

        {/* JSON 본문 — 드래그 선택·복사 가능 */}
        <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4">
          <pre className="select-text font-mono text-[11px] leading-relaxed text-emerald-300 whitespace-pre-wrap break-all">
            {activeJson}
          </pre>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-slate-50 px-4 py-2">
          <span className="text-[10px] text-slate-400">
            raw: {(rawJson?.length ?? 0).toLocaleString()} chars &nbsp;·&nbsp;
            deck: {(deckJson?.length ?? 0).toLocaleString()} chars
          </span>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-900"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Base01WidgetPanel (default export)
   Props: raw {object}, deck {object}
──────────────────────────────────────────────────────────── */
export default function Base01WidgetPanel({ raw, deck, panelType: panelTypeProp = 'grid' }) {
  /* ── UI 상태 ── */
  const [layouts, setLayouts]                     = useState([]);       // 위젯별 { x, y, w, h, z }
  const [widgetEditEnabled, setWidgetEditEnabled] = useState(true);     // 드래그·리사이즈 활성 여부
  const [responsive, setResponsive]               = useState(false);    // true: CSS 그리드 / false: 자유 배치
  const [responsiveCols, setResponsiveCols]       = useState(3);        // 반응형 열 수 (1~5)
  const [exportFormat, setExportFormat]           = useState('pdf');    // 선택된 다운로드 형식
  const [exportBusy, setExportBusy]               = useState(false);    // 다운로드 진행 중 여부
  const [localPanelType, setLocalPanelType]               = useState(panelTypeProp); // 'grid' | 'tab' — select 로 변경 가능
  const panelType = localPanelType; // 이하 코드에서 panelType 으로 참조
  const [expanded, setExpanded]                           = useState(false); // true: 좌우 여백 제거, 전체 너비 확장
  const [widgetLayoutOpenIndex, setWidgetLayoutOpenIndex] = useState(null); // 위치 정보 팝오버 열린 위젯 인덱스
  const [showLayoutInfo, setShowLayoutInfo]               = useState(false); // 배치 속성 레이어 표시 여부
  const [showPropsInfo,  setShowPropsInfo]                = useState(false); // props JSON 레이어 표시 여부
  const [draggingIndex, setDraggingIndex]         = useState(null);     // 현재 드래그·리사이즈 중인 위젯 인덱스
  const [activeTabIndex, setActiveTabIndex]       = useState(0);        // 탭 모드에서 현재 선택된 위젯 인덱스

  /* ── 파생 데이터 ── */

  /** raw.widgets 를 역순으로 — 마지막 위젯이 맨 위(가장 최근) */
  const reversedWidgets = useMemo(() => {
    if (!raw?.widgets?.length) return [];
    return [...raw.widgets].reverse();
  }, [raw]);

  /** 위젯 수 변경 시 초기 레이아웃 재생성 (widgetAttr에서 읽기) */
  useEffect(() => {
    const layouts = reversedWidgets.map((w, i) => snapLayoutItem({
      x: w.widgetAttr?.left ?? 20,
      y: w.widgetAttr?.top ?? 20,
      w: w.widgetAttr?.width ?? 400,
      h: w.widgetAttr?.height ?? 300,
      z: 10 + i
    }));
    setLayouts(layouts);
  }, [reversedWidgets]);

  /** 자유 배치 모드에서 캔버스 최소 높이 (모든 위젯 하단 + 여백) */
  const minCanvasH = useMemo(() => canvasMinHeight(layouts), [layouts]);

  /* ── 콜백 ── */



  /** 위치 정보 팝오버 전체 닫기 */
  const closeWidgetLayoutPanel = useCallback(() => setWidgetLayoutOpenIndex(null), []);

  /**
   * 클릭된 위젯을 최상위 z-index 로 올림.
   * setLayouts 내부에서 maxZ 를 계산해 +1 적용.
   */
  const bringToFront = useCallback((index) => {
    setLayouts((prev) => {
      const maxZ = prev.reduce((m, p) => Math.max(m, p.z), 0);
      return prev.map((L, i) => (i === index ? { ...L, z: maxZ + 1 } : L));
    });
  }, []);

  /**
   * 드래그 이동 시작.
   * onMove: raw 픽셀로 즉시 반영(부드러움) → onUp: 스냅 + 겹침 해소
   */
  const startMove = useCallback(
    (e, index) => {
      if (!widgetEditEnabled) return;
      stop(e);
      const L = layouts[index];
      if (!L) return;
      bringToFront(index);
      setDraggingIndex(index);

      const startMx = e.clientX, startMy = e.clientY; // 드래그 시작 마우스 좌표
      const startX  = L.x,      startY  = L.y;        // 드래그 시작 위젯 좌표

      const onMove = (ev) => {
        const dx = ev.clientX - startMx;
        const dy = ev.clientY - startMy;
        // 스냅 없이 raw 픽셀 → 부드러운 실시간 이동
        setLayouts((prev) =>
          prev.map((row, i) =>
            i === index ? { ...row, x: Math.max(0, startX + dx), y: Math.max(0, startY + dy) } : row,
          ),
        );
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup',   onUp);
        setDraggingIndex(null);
        // mouseUp 시 스냅 정렬 + 겹침 해소
        setLayouts((prev) => resolveOverlaps(prev, index));
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    },
    [layouts, bringToFront, widgetEditEnabled],
  );

  /**
   * 모서리 핸들 드래그 크기 조절 시작.
   * dir: 'nw' | 'ne' | 'sw' | 'se' (조절 핸들 위치)
   * onMove: raw 픽셀 → 부드러운 실시간 반영 / onUp: 스냅 + 겹침 해소
   */
  const startResize = useCallback(
    (e, index, dir) => {
      if (!widgetEditEnabled) return;
      stop(e);
      const L = layouts[index];
      if (!L) return;
      bringToFront(index);
      setDraggingIndex(index);

      const startMx = e.clientX, startMy = e.clientY;
      const { x: sx, y: sy, w: sw, h: sh } = L; // 리사이즈 시작 시점 위치·크기

      const onMove = (ev) => {
        const dx = ev.clientX - startMx;
        const dy = ev.clientY - startMy;
        let x = sx, y = sy, w = sw, h = sh;

        // 핸들 방향별 x·y·w·h 변화 계산
        switch (dir) {
          case 'se': w = sw + dx; h = sh + dy;                       break; // 우하: 너비+높이만 증가
          case 'sw': w = sw - dx; h = sh + dy; x = sx + dx;         break; // 좌하: 너비 증가, x 이동
          case 'ne': w = sw + dx; h = sh - dy; y = sy + dy;         break; // 우상: 높이 증가, y 이동
          case 'nw': w = sw - dx; h = sh - dy; x = sx + dx; y = sy + dy; break; // 좌상: 전방향
          default: break;
        }

        w = Math.max(MIN_W, w);
        h = Math.max(MIN_H, h);
        // sw/nw: x 는 오른쪽 끝 고정 상태에서 왼쪽으로 늘어남
        if (dir === 'sw' || dir === 'nw') x = sx + sw - w;
        // ne/nw: y 는 아래쪽 끝 고정 상태에서 위쪽으로 늘어남
        if (dir === 'ne' || dir === 'nw') y = sy + sh - h;

        // 스냅 없이 raw 픽셀 → 부드러운 실시간 반영
        setLayouts((prev) =>
          prev.map((row, i) =>
            i === index ? { ...row, x: Math.max(0, x), y: Math.max(0, y), w, h } : row,
          ),
        );
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup',   onUp);
        setDraggingIndex(null);
        // mouseUp 시 스냅 정렬 + 겹침 해소
        setLayouts((prev) => resolveOverlaps(prev, index));
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    },
    [layouts, bringToFront, widgetEditEnabled],
  );

  /**
   * 다운로드 처리 (PDF / PPTX).
   * exportFormat state 기준으로 deck 전체를 내보냄.
   * exportBusy 로 중복 실행 방지.
   */
  const handleExport = useCallback(async () => {
    if (!deck || exportBusy) return;
    setExportBusy(true);
    try {
      const name = makeFilename('위젯목록', '전체', exportFormat === 'pdf' ? 'PDF' : 'PPTX');
      if (exportFormat === 'pdf') await downloadAllPdf(deck, name, () => {});
      else                        await downloadAllPptx(deck, name);
    } finally {
      setExportBusy(false);
    }
  }, [deck, exportFormat, exportBusy]);

  /* ── 스타일 ── */

  /** 캔버스 배경 격자 스타일 (CSS 선형 그라디언트 반복 패턴) */
  const gridStyle = {
    backgroundColor: '#f8fafc',
    backgroundImage: `
      linear-gradient(to right,  rgba(148,163,184,0.14) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_BG}px ${GRID_BG}px`,
  };

  /** 리사이즈 핸들 공통 클래스 */
  const handleCls = 'absolute z-30 size-3 rounded-sm border border-slate-400 bg-white shadow-sm hover:bg-blue-50';

  /* ── 탭 모드 렌더 (panelType === 'tab') ── */
  if (panelType === 'tab') {
    const safeIdx   = Math.max(0, Math.min(activeTabIndex, reversedWidgets.length - 1));
    const activeW   = reversedWidgets[safeIdx];
    const activeLabel = activeW ? (activeW.widgetAttr?.tabLabel || activeW.widgetType) : '';

    return (
      <div className={expanded ? 'px-2 pb-16 pt-6' : 'mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6'}>

        {/* ── 헤더 ── */}
        <header className="mb-4 border-b border-slate-200 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">

            {/* 좌측: 아이콘 + 제목 */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                <IconLayoutWidgets className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="m-0 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                  {raw?.reportTitle || '위젯 목록'}
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    <IconLayers className="text-slate-500" />
                    탭 모드
                  </span>
                </h1>
                <p className="m-0 mt-1 text-sm text-slate-500">
                  <span className="font-medium text-slate-600">{activeLabel}</span>
                  {' · '}
                  {safeIdx + 1} / {reversedWidgets.length} 페이지
                </p>
              </div>
            </div>

            {/* 우측: 좌우 확장 + 다운로드 */}
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {/* 패널 유형 선택 */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2">
                <IconLayoutWidgets className="shrink-0 text-slate-500" style={{ width: 16, height: 16 }} />
                <label htmlFor="tab-panel-type" className="whitespace-nowrap text-xs font-semibold text-slate-600">패널 유형</label>
                <select
                  id="tab-panel-type"
                  value={panelType}
                  onChange={(e) => setLocalPanelType(e.target.value)}
                  className="cursor-pointer rounded border border-slate-200 bg-white py-1 pl-2 pr-6 text-xs font-semibold text-slate-700"
                >
                  <option value="grid">grid</option>
                  <option value="tab">tab</option>
                </select>
              </div>

              {/* 좌우 확장 토글 */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2">
                <IconExpand className="shrink-0 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">좌우 확장</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={expanded}
                  onClick={() => setExpanded((v) => !v)}
                  className={['relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none', expanded ? 'bg-violet-600' : 'bg-slate-300'].join(' ')}
                >
                  <span className={['absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200', expanded ? 'translate-x-5' : 'translate-x-0'].join(' ')} />
                </button>
              </div>
              {/* 다운로드 */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <IconDownload className="shrink-0 text-slate-500" />
                <label htmlFor="tab-export-fmt" className="sr-only">보내기 형식</label>
                <select
                  id="tab-export-fmt"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="max-w-[11rem] cursor-pointer rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-8 text-xs font-semibold text-slate-700"
                >
                  <option value="pdf">PDF 다운로드 (전체 캡처)</option>
                  <option value="pptx">PPTX 다운로드 (네이티브 슬라이드)</option>
                </select>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exportBusy ? <><IconSpinner />처리 중…</> : <><IconFileDown />받기</>}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── 탭 바 ── */}
        <div className="mb-3 flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1.5">
          {reversedWidgets.map((w, i) => {
            const label = w.widgetAttr?.tabLabel || w.widgetType;
            const isActive = i === safeIdx;
            return (
              <button
                key={`tab-${i}`}
                type="button"
                onClick={() => setActiveTabIndex(i)}
                className={[
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-700',
                ].join(' ')}
                title={label}
              >
                {/* 탭 타입별 작은 색상 dot */}
                <span className={[
                  'size-2 shrink-0 rounded-full',
                  w.widgetType === 'CoverPage'     ? 'bg-slate-400' :
                  w.widgetType === 'Chart01Widget'  ? 'bg-blue-500'  :
                  w.widgetType === 'Data01Widget'   ? 'bg-emerald-500' : 'bg-indigo-400',
                ].join(' ')} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── 현재 탭 본문 ── */}
        {activeW && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            {/* 탭 콘텐츠 헤더 */}
            <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3">
              <WidgetLayoutInfoPanel
                label={activeLabel}
                widget={activeW}
                layout={layouts[safeIdx]}
                open={widgetLayoutOpenIndex === safeIdx}
                onToggle={() => setWidgetLayoutOpenIndex((cur) => (cur === safeIdx ? null : safeIdx))}
                onClose={closeWidgetLayoutPanel}
              />
            </div>
            {/* 콘텐츠 본문 */}
            <div className="min-h-[500px] overflow-auto p-3">
              {renderWidgetBody(activeW, deck)}
            </div>
          </div>
        )}

        {/* ── 이전 / 다음 네비 ── */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTabIndex((v) => Math.max(0, v - 1))}
            disabled={safeIdx === 0}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← 이전
          </button>
          {/* 도트 네비 */}
          <div className="flex items-center gap-1.5">
            {reversedWidgets.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTabIndex(i)}
                className={['size-2 rounded-full transition-colors', i === safeIdx ? 'bg-blue-500' : 'bg-slate-300'].join(' ')}
                aria-label={`${i + 1}번 탭으로 이동`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveTabIndex((v) => Math.min(reversedWidgets.length - 1, v + 1))}
            disabled={safeIdx === reversedWidgets.length - 1}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음 →
          </button>
        </div>
      </div>
    );
  }

  /* ── 렌더 ── */
  return (
    <div className={expanded ? 'px-2 pb-16 pt-6' : 'mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6'}>

      {/* 배치 속성 정보 레이어 */}
      {showLayoutInfo && (
        <LayoutInfoLayer
          widgets={reversedWidgets}
          layouts={layouts}
          onClose={() => setShowLayoutInfo(false)}
        />
      )}
      {/* Props JSON 레이어 */}
      {showPropsInfo && (
        <PropsInfoLayer
          raw={raw}
          deck={deck}
          onClose={() => setShowPropsInfo(false)}
        />
      )}

      {/* ── 헤더 ── */}
      <header className="mb-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">

          {/* 좌측: 아이콘 버튼 2개 + 제목·설명 */}
          <div className="flex min-w-0 items-center gap-2">
            {/* 배치 속성 레이어 토글 */}
            <button
              type="button"
              title="위젯 배치 속성 정보 보기"
              aria-label="위젯 배치 속성 정보 레이어 열기"
              onClick={() => setShowLayoutInfo((v) => !v)}
              className={[
                'flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md transition-colors',
                showLayoutInfo
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 ring-2 ring-blue-400 ring-offset-1'
                  : 'bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
              ].join(' ')}
            >
              <IconLayoutWidgets className="text-white" />
            </button>
            {/* Props JSON 레이어 토글 */}
            <button
              type="button"
              title="Props JSON 보기 (raw · deck)"
              aria-label="Props 정보 레이어 열기"
              onClick={() => setShowPropsInfo((v) => !v)}
              className={[
                'flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md transition-colors',
                showPropsInfo
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 ring-2 ring-emerald-400 ring-offset-1'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
              ].join(' ')}
            >
              <IconCode className="text-white" />
            </button>

            <div className="min-w-0">
              <h1 className="m-0 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                위젯 목록
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                  title="덱 기준보내기"
                >
                  <IconLayers className="text-slate-500" />
                  덱 동기화
                </span>
              </h1>
              <p className="m-0 mt-1 text-sm text-slate-500">
                <span className="font-medium text-slate-600">{raw?.reportTitle}</span>
                {' · '}
                <code className="text-xs">widgets[]</code> 역순 · 스냅{' '}
                <strong>{GRID}px</strong> · 배경 격자 {GRID_BG}px
              </p>
            </div>
          </div>

          {/* 우측: 반응형·편집 토글 + 다운로드 */}
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">

            {/* 패널 타입 선택 */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2">
              <IconLayoutWidgets className="shrink-0 text-slate-500" style={{ width: 16, height: 16 }} />
              <label htmlFor="wpanel-type" className="text-xs font-semibold text-slate-600 whitespace-nowrap">패널 유형</label>
              <select
                id="wpanel-type"
                value={panelType}
                onChange={(e) => {
                  // panelType prop 은 외부에서 전달받으므로 내부 override state 로 관리
                  setLocalPanelType(e.target.value);
                }}
                className="cursor-pointer rounded border border-slate-200 bg-white py-1 pl-2 pr-6 text-xs font-semibold text-slate-700"
              >
                <option value="grid">grid</option>
                <option value="tab">tab</option>
              </select>
            </div>

            {/* 반응형 토글 + 열 수 선택 */}
            <div
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2"
              title="반응형: CSS 그리드 / 해제: 자유 드래그"
            >
              <IconResponsive className="shrink-0 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">반응형</span>
              {/* 반응형 ON/OFF 토글 스위치 */}
              <button
                type="button"
                role="switch"
                aria-checked={responsive}
                onClick={() => setResponsive((v) => !v)}
                className={[
                  'relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none',
                  responsive ? 'bg-emerald-500' : 'bg-slate-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200',
                    responsive ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
              {/* 열 수 선택 드롭다운 — 반응형 ON 시만 활성 */}
              <select
                value={responsiveCols}
                onChange={(e) => setResponsiveCols(Number(e.target.value))}
                disabled={!responsive}
                aria-label="반응형 열 수 선택"
                className={[
                  'rounded border border-slate-200 bg-white py-1 pl-2 pr-6 text-xs font-semibold text-slate-700',
                  !responsive ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                ].join(' ')}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}열</option>
                ))}
              </select>
            </div>

            {/* 좌우 확장 토글 */}
            <div
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2"
              title="좌우 여백을 제거해 전체 너비로 확장"
            >
              <IconExpand className="shrink-0 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">좌우 확장</span>
              <button
                type="button"
                role="switch"
                aria-checked={expanded}
                onClick={() => setExpanded((v) => !v)}
                className={[
                  'relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none',
                  expanded ? 'bg-violet-600' : 'bg-slate-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200',
                    expanded ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>

            {/* 위젯 편집 토글 — 반응형 ON 시 비활성 */}
            <div
              className={[
                'flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2',
                responsive ? 'pointer-events-none opacity-40' : '',
              ].join(' ')}
              title={responsive ? '반응형 모드에서는 드래그 비활성' : '편집 끄면 이동·리사이즈 불가'}
            >
              <IconSliders className="shrink-0 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">위젯 편집</span>
              {/* 편집 ON/OFF 토글 스위치 */}
              <button
                type="button"
                role="switch"
                aria-checked={widgetEditEnabled}
                onClick={() => setWidgetEditEnabled((v) => !v)}
                className={[
                  'relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none',
                  widgetEditEnabled ? 'bg-blue-600' : 'bg-slate-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200',
                    widgetEditEnabled ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>

            {/* 다운로드 형식 선택 + 받기 버튼 */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <IconDownload className="shrink-0 text-slate-500" />
              <label htmlFor="wpanel-export-fmt" className="sr-only">보내기 형식</label>
              <select
                id="wpanel-export-fmt"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="max-w-[11rem] cursor-pointer rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-8 text-xs font-semibold text-slate-700"
              >
                <option value="pdf">PDF 다운로드 (전체 캡처)</option>
                <option value="pptx">PPTX 다운로드 (네이티브 슬라이드)</option>
              </select>
              <button
                type="button"
                disabled={exportBusy}
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exportBusy ? <><IconSpinner />처리 중…</> : <><IconFileDown />받기</>}
              </button>
            </div>
          </div>
        </div>

        {/* 하단 안내 문구 — 현재 모드에 따라 다른 설명 표시 */}
        <p className="m-0 mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
          {responsive ? (
            <>
              <strong>반응형 모드</strong>: CSS {responsiveCols}열 그리드 배치 · 드래그 비활성.
              왼쪽 <strong>아이콘</strong>을 클릭하면 배치 속성 정보를 볼 수 있습니다.
            </>
          ) : (
            <>
              카드 <strong>헤더</strong>를 드래그해 이동합니다. 겹치면 다른 카드가 밀려납니다.
              제목 왼쪽 <strong>블릿</strong>을 누르면 <code className="text-xs">widgetData</code> JSON이 열리며,{' '}
              <strong>×</strong> 또는 패널 바깥을 누르면 닫힙니다.
              왼쪽 <strong>아이콘</strong>을 클릭하면 배치 속성 정보를 볼 수 있습니다.
            </>
          )}
        </p>
      </header>

      {/* ── 반응형 모드: CSS 그리드 ── */}
      {responsive ? (
        <div className="rounded-xl border border-slate-300 p-4" style={gridStyle}>
          <div className="grid gap-5" style={{
            // 최대 N열 + 화면 축소 시 자동 감소:
            //   minmax( max(MIN_PX, calc(100% / N)), 1fr )
            //   → 컨테이너가 아무리 넓어도 각 열 최소폭 = 컨테이너/N 이므로 N열 초과 불가
            //   → 컨테이너가 좁아지면 MIN_PX 가 기준이 되어 N-1, N-2 … 1열로 자연 감소
            // gap(20px) * (N-1) 을 먼저 뺀 뒤 N 으로 나눠야 정확히 N열이 들어감
            gridTemplateColumns: responsiveCols === 1
              ? '1fr'
              : `repeat(auto-fill, minmax(max(200px, calc((100% - ${20 * (responsiveCols - 1)}px) / ${responsiveCols})), 1fr))`,
          }}>
            {reversedWidgets.map((w, i) => {
              const label = w.widgetAttr?.tabLabel || w.widgetType;
              return (
                <div
                  key={`resp-${w.widgetType}-${i}`}
                  className="flex flex-col rounded-lg border border-slate-300 bg-white shadow-md"
                  style={{ minHeight: 320 }}
                >
                  {/* 카드 헤더 (드래그 없음) */}
                  <div className="flex h-9 shrink-0 select-none items-center gap-1 border-b border-slate-200 bg-slate-100/95 px-2">
                    <WidgetLayoutInfoPanel
                      label={label}
                      widget={w}
                      layout={layouts[i]}
                      open={widgetLayoutOpenIndex === i}
                      onToggle={() => setWidgetLayoutOpenIndex((cur) => (cur === i ? null : i))}
                      onClose={closeWidgetLayoutPanel}
                    />
                  </div>
                  {/* 카드 본문 */}
                  <div className="min-h-0 flex-1 overflow-auto bg-white p-2">
                    {renderWidgetBody(w, deck)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── 자유 배치 모드: 절대 위치 드래그·리사이즈 ── */
        <div
          className="relative w-full rounded-xl border border-slate-300"
          style={{ ...gridStyle, minHeight: minCanvasH }}
        >
          {reversedWidgets.map((w, i) => {
            const L = layouts[i];
            if (!L) return null;
            const label      = w.widgetAttr?.tabLabel || w.widgetType;
            const isDragging = draggingIndex === i; // 현재 이 위젯이 드래그 중인지
            return (
              <div
                key={`${w.widgetType}-${reversedWidgets.length - 1 - i}`}
                className="absolute box-border overflow-visible rounded-lg border border-slate-300 bg-white shadow-md"
                style={{
                  left: L.x, top: L.y, width: L.w, height: L.h, zIndex: L.z,
                  // 드래그 중: transition 없음(즉각 반응) / 정지 후: settle 애니메이션
                  transition: isDragging
                    ? 'none'
                    : 'left 0.12s ease-out, top 0.12s ease-out, width 0.12s ease-out, height 0.12s ease-out',
                  // 드래그 중 GPU 합성 레이어 활성화 → 렌더링 성능 향상
                  willChange: isDragging ? 'left, top, width, height' : 'auto',
                }}
                onMouseDown={() => bringToFront(i)} // 클릭 시 최상위로
              >
                {/* 카드 헤더 — 드래그 핸들 */}
                <div
                  className={[
                    'relative flex h-9 shrink-0 select-none items-center gap-1 border-b border-slate-200 bg-slate-100/95 px-2',
                    widgetEditEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                  ].join(' ')}
                  title={widgetEditEnabled ? '헤더를 드래그하여 이동' : '편집이 꺼져 있습니다'}
                  onMouseDown={(e) => widgetEditEnabled && startMove(e, i)}
                >
                  <WidgetLayoutInfoPanel
                    label={label}
                    widget={w}
                    layout={L}
                    open={widgetLayoutOpenIndex === i}
                    onToggle={() => setWidgetLayoutOpenIndex((cur) => (cur === i ? null : i))}
                    onClose={closeWidgetLayoutPanel}
                  />
                </div>

                {/* 카드 본문 */}
                <div className="h-[calc(100%-2.25rem)] overflow-auto bg-white p-2">
                  {renderWidgetBody(w, deck)}
                </div>

                {/* 리사이즈 핸들 4개 (편집 모드에서만 표시) */}
                {widgetEditEnabled && (
                  <>
                    <button type="button" aria-label="왼쪽 위 크기 조절"
                      className={`${handleCls} -left-1.5 -top-1.5 cursor-nw-resize`}
                      onMouseDown={(e) => startResize(e, i, 'nw')} />
                    <button type="button" aria-label="오른쪽 위 크기 조절"
                      className={`${handleCls} -right-1.5 -top-1.5 cursor-ne-resize`}
                      onMouseDown={(e) => startResize(e, i, 'ne')} />
                    <button type="button" aria-label="왼쪽 아래 크기 조절"
                      className={`${handleCls} -bottom-1.5 -left-1.5 cursor-sw-resize`}
                      onMouseDown={(e) => startResize(e, i, 'sw')} />
                    <button type="button" aria-label="오른쪽 아래 크기 조절"
                      className={`${handleCls} -bottom-1.5 -right-1.5 cursor-se-resize`}
                      onMouseDown={(e) => startResize(e, i, 'se')} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SVG 아이콘 컴포넌트 모음
──────────────────────────────────────────────────────────── */

/** 4분할 격자 아이콘 — 헤더 배치 속성 버튼 */
function IconLayoutWidgets({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

/** 레이어 스택 아이콘 — "덱 동기화" 뱃지 */
function IconLayers({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 2 7l10 5 10-5-10-5Zm0 8.5L4.74 8.25 2 9.5l10 5 10-5-2.74-1.25L12 10.5Zm0 5L4.74 13.25 2 14.5l10 5 10-5-2.74-1.25L12 15.5Z" />
    </svg>
  );
}

/** 슬라이더 아이콘 — 위젯 편집 토글 */
function IconSliders({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M9 9h6M5 7H3m18 4h-5M7 17H3"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 반응형 화면 아이콘 — 반응형 토글 */
function IconResponsive({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 19v2M17 19v2M7 3v2M17 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 12h6M12 9l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 다운로드 화살표 아이콘 — 다운로드 영역 */
function IconDownload({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 파일 다운로드 아이콘 — 받기 버튼 내부 */
function IconFileDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 18V12m0 0 2 2m-2-2-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 회전 스피너 아이콘 — 처리 중 상태 */
function IconSpinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/** 코드 브라켓 아이콘 — Props JSON 레이어 토글 */
function IconCode({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 좌우 확장 아이콘 — 좌우 확장 토글 */
function IconExpand({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 9H3V3h6v2M19 9h2V3h-6v2M5 15H3v6h6v-2M19 15h2v6h-6v-2"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M12 9l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 위치(좌표) 아이콘 — 위젯 위치 정보 팝오버 열기 버튼 */
function IconPosition() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2a8 8 0 0 1 8 8c0 5-8 14-8 14S4 15 4 10a8 8 0 0 1 8-8Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** 원형 블릿 아이콘 — widgetData JSON 팝오버 열기 버튼 */

/** X 닫기 아이콘 — 각종 닫기 버튼 */
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
