/**
 * 위젯 목록 — `widgetListData.json`, 뒤에서부터 표시.
 * 격자 배경·그리드 스냅·겹침 시 놓은 카드는 유지하고 나머지가 밀려남.
 * 타이틀 호버 시 widgetData(JSON) 툴팁.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosLib from '../utils/axiosLib';
import { API_JSON } from '../utils/apiConfig';
import { normalizePreviewModalData } from '../utils/normalizePreviewModalData';
import { downloadAllPdf, downloadAllPptx, makeFilename } from '../utils/downloadHelpers';
import CoverPage from '../components/CoverPage';
import Chart01Widget from '../components/widget/Chart01Widget';
import Data01Widget from '../components/widget/Data01Widget';

const MIN_W = 220;
const MIN_H = 180;
/** 위젯 스냅·배치 간격 (px) */
const GRID = 20;
/** 배경 격자만 더 촘촘·옅게 표시 */
const GRID_BG = 10;
const GAP = GRID;
const PAD = GRID;
const OVERLAP_ITER = 120;

function snap(n) {
  return Math.round(n / GRID) * GRID;
}

function snapLayoutItem(L) {
  return {
    ...L,
    x: Math.max(0, snap(L.x)),
    y: Math.max(0, snap(L.y)),
    w: Math.max(MIN_W, snap(Math.max(MIN_W, L.w))),
    h: Math.max(MIN_H, snap(Math.max(MIN_H, L.h))),
  };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** mover를 fixed에서 분리(침투가 짧은 축 우선, 이동량이 작은 쪽). */
function separatePair(mover, fixed) {
  if (!rectsOverlap(mover, fixed)) return false;
  const ox =
    Math.min(mover.x + mover.w, fixed.x + fixed.w) - Math.max(mover.x, fixed.x);
  const oy =
    Math.min(mover.y + mover.h, fixed.y + fixed.h) - Math.max(mover.y, fixed.y);
  let dx = 0;
  let dy = 0;
  if (ox < oy) {
    const right = fixed.x + fixed.w - mover.x;
    const left = fixed.x - mover.w - mover.x;
    dx = Math.abs(right) <= Math.abs(left) ? right : left;
  } else {
    const down = fixed.y + fixed.h - mover.y;
    const up = fixed.y - mover.h - mover.y;
    dy = Math.abs(down) <= Math.abs(up) ? down : up;
  }
  mover.x = Math.max(0, snap(mover.x + dx));
  mover.y = Math.max(0, snap(mover.y + dy));
  return true;
}

/**
 * anchorIndex 카드 위치·크기 유지, 겹치는 다른 카드들을 밀어냄.
 * 비앵커끼리 겹치면 z가 높은 쪽을 고정으로 두고 낮은 쪽을 이동.
 */
function resolveOverlaps(layouts, anchorIndex) {
  const r = layouts.map((x) => snapLayoutItem({ ...x }));
  for (let iter = 0; iter < OVERLAP_ITER; iter++) {
    let changed = false;
    for (let i = 0; i < r.length; i++) {
      for (let j = i + 1; j < r.length; j++) {
        if (!rectsOverlap(r[i], r[j])) continue;
        let moverIdx;
        let fixedIdx;
        if (i === anchorIndex) {
          moverIdx = j;
          fixedIdx = i;
        } else if (j === anchorIndex) {
          moverIdx = i;
          fixedIdx = j;
        } else {
          fixedIdx = r[i].z >= r[j].z ? i : j;
          moverIdx = fixedIdx === i ? j : i;
        }
        separatePair(r[moverIdx], r[fixedIdx]);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return r;
}

/** 첫 배치: 세로로 겹치지 않게 쌓기(그리드 정렬) */
function initialLayoutsForWidgets(count) {
  const w0 = snap(440);
  const h0 = snap(320);
  const out = [];
  let y = PAD;
  for (let i = 0; i < count; i++) {
    out.push({
      x: PAD,
      y,
      w: w0,
      h: h0,
      z: 10 + i,
    });
    y += h0 + GAP;
  }
  return out;
}

function canvasMinHeight(layouts) {
  if (!layouts.length) return 400;
  const bottom = layouts.reduce((m, L) => Math.max(m, L.y + L.h), 0);
  return Math.max(400, bottom + PAD * 4);
}

/** @param {import('react').MouseEvent} e */
function stop(e) {
  e.preventDefault();
  e.stopPropagation();
}

function renderWidgetBody(widget, deck) {
  const t = widget.widgetType;
  if (t === 'CoverPage') return <CoverPage data={deck} />;
  if (t === 'Chart01Widget') {
    const pk = widget.widgetAttr?.pageKey;
    return (
      <Chart01Widget
        pageData={deck.charts?.[pk]}
        pageNum={widget.widgetAttr?.chartNum ?? 1}
      />
    );
  }
  if (
    t === 'Data01Widget' ||
    t === 'DataPage4' ||
    t === 'DataPage5' ||
    t === 'DataPage6' ||
    t === 'DataPage7'
  ) {
    const pk = widget.widgetAttr?.pageKey;
    return <Data01Widget data={deck.dataPages?.[pk]} pageKey={pk} />;
  }
  return (
    <div className="p-4 text-xs text-slate-600">
      <div className="font-semibold text-slate-800">{t || 'unknown'}</div>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all">
        {JSON.stringify(widget, null, 2)}
      </pre>
    </div>
  );
}

function WidgetDataJsonPanel({ label, widget, open, onToggle, onClose }) {
  const payload = useMemo(
    () =>
      JSON.stringify(
        {
          widgetType: widget.widgetType,
          widgetAttr: widget.widgetAttr ?? null,
          widgetData: widget.widgetData ?? null,
        },
        null,
        2,
      ),
    [widget],
  );

  const panelRef = useRef(null);
  const bulletRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (bulletRef.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDocDown, true);
    return () => document.removeEventListener('mousedown', onDocDown, true);
  }, [open, onClose]);

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-1.5">
      <button
        ref={bulletRef}
        type="button"
        aria-expanded={open}
        aria-label={`${label} — widgetData JSON 열기/닫기`}
        title="widgetData JSON"
        className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-300/90 bg-white text-slate-500 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <IconBullet />
      </button>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{label}</span>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full z-[600] mt-1 max-h-72 w-[min(100vw-2rem,28rem)] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl"
          role="dialog"
          aria-label="widgetData JSON"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
            <span className="text-[10px] font-bold text-slate-500">widgetData · JSON</span>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              aria-label="닫기"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <IconClose />
            </button>
          </div>
          <pre className="max-h-64 overflow-auto p-2 text-left font-mono text-[10px] leading-snug text-slate-800">
            {payload}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function WidgetList() {
  const [raw, setRaw] = useState(null);
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [widgetEditEnabled, setWidgetEditEnabled] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportBusy, setExportBusy] = useState(false);
  /** widgetData JSON 패널 — 한 번에 하나만 열림 */
  const [widgetDataOpenIndex, setWidgetDataOpenIndex] = useState(null);

  const reversedWidgets = useMemo(() => {
    if (!raw?.widgets?.length) return [];
    return [...raw.widgets].reverse();
  }, [raw]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    axiosLib
      .get(API_JSON.widgetListData)
      .then((res) => {
        if (cancelled) return;
        setRaw(res.data);
        setDeck(normalizePreviewModalData(res.data));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const n = reversedWidgets.length;
    if (n === 0) {
      setLayouts([]);
      return;
    }
    setLayouts(initialLayoutsForWidgets(n));
  }, [reversedWidgets]);

  const minCanvasH = useMemo(() => canvasMinHeight(layouts), [layouts]);

  const closeWidgetDataPanel = useCallback(() => {
    setWidgetDataOpenIndex(null);
  }, []);

  const bringToFront = useCallback((index) => {
    setLayouts((prev) => {
      const maxZ = prev.reduce((m, p) => Math.max(m, p.z), 0);
      return prev.map((L, i) => (i === index ? { ...L, z: maxZ + 1 } : L));
    });
  }, []);

  const startMove = useCallback(
    (e, index) => {
      if (!widgetEditEnabled) return;
      stop(e);
      const L = layouts[index];
      if (!L) return;
      bringToFront(index);
      const startMx = e.clientX;
      const startMy = e.clientY;
      const startX = L.x;
      const startY = L.y;

      const onMove = (ev) => {
        const dx = ev.clientX - startMx;
        const dy = ev.clientY - startMy;
        setLayouts((prev) =>
          prev.map((row, i) =>
            i === index
              ? {
                  ...row,
                  x: Math.max(0, snap(startX + dx)),
                  y: Math.max(0, snap(startY + dy)),
                }
              : row,
          ),
        );
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        setLayouts((prev) => resolveOverlaps(prev, index));
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [layouts, bringToFront, widgetEditEnabled],
  );

  const startResize = useCallback(
    (e, index, dir) => {
      if (!widgetEditEnabled) return;
      stop(e);
      const L = layouts[index];
      if (!L) return;
      bringToFront(index);
      const startMx = e.clientX;
      const startMy = e.clientY;
      const { x: sx, y: sy, w: sw, h: sh } = L;

      const onMove = (ev) => {
        const dx = ev.clientX - startMx;
        const dy = ev.clientY - startMy;
        let x = sx;
        let y = sy;
        let w = sw;
        let h = sh;

        switch (dir) {
          case 'se':
            w = sw + dx;
            h = sh + dy;
            break;
          case 'sw':
            w = sw - dx;
            h = sh + dy;
            x = sx + dx;
            break;
          case 'ne':
            w = sw + dx;
            h = sh - dy;
            y = sy + dy;
            break;
          case 'nw':
            w = sw - dx;
            h = sh - dy;
            x = sx + dx;
            y = sy + dy;
            break;
          default:
            break;
        }

        w = Math.max(MIN_W, w);
        h = Math.max(MIN_H, h);
        if (dir === 'sw' || dir === 'nw') x = sx + sw - w;
        if (dir === 'ne' || dir === 'nw') y = sy + sh - h;

        setLayouts((prev) =>
          prev.map((row, i) =>
            i === index
              ? {
                  ...row,
                  x: Math.max(0, snap(x)),
                  y: Math.max(0, snap(y)),
                  w: snap(Math.max(MIN_W, w)),
                  h: snap(Math.max(MIN_H, h)),
                }
              : row,
          ),
        );
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        setLayouts((prev) => resolveOverlaps(prev, index));
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [layouts, bringToFront, widgetEditEnabled],
  );

  const handleDeckExport = useCallback(async () => {
    if (!deck || exportBusy) return;
    setExportBusy(true);
    try {
      const name = makeFilename(
        '위젯목록',
        '전체',
        exportFormat === 'pdf' ? 'PDF' : 'PPTX',
      );
      if (exportFormat === 'pdf') {
        await downloadAllPdf(deck, name, () => {});
      } else {
        await downloadAllPptx(deck, name);
      }
    } finally {
      setExportBusy(false);
    }
  }, [deck, exportFormat, exportBusy]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-10 text-center text-slate-500">
        <p className="m-0 text-sm">위젯 데이터 로딩…</p>
        <code className="text-xs text-slate-400">{API_JSON.widgetListData}</code>
      </div>
    );
  }

  if (error || !deck || !raw) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-10 text-center text-red-700">
        <p className="m-0 text-sm">로드 실패: {error}</p>
      </div>
    );
  }

  const handleCls =
    'absolute z-30 size-3 rounded-sm border border-slate-400 bg-white shadow-sm hover:bg-blue-50';

  const gridStyle = {
    backgroundColor: '#f8fafc',
    backgroundImage: `
      linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_BG}px ${GRID_BG}px`,
    backgroundPosition: '0 0',
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <IconLayoutWidgets />
            </span>
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
              <p className="mt-1 m-0 text-sm text-slate-500">
                <span className="font-medium text-slate-600">{raw.reportTitle}</span>
                {' · '}
                <code className="text-xs">widgets[]</code> 역순 · 스냅{' '}
                <strong>{GRID}px</strong> · 배경 격자 {GRID_BG}px
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2"
              title="편집 끄면 이동·리사이즈 불가"
            >
              <IconSliders className="shrink-0 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">위젯 편집</span>
              <button
                type="button"
                role="switch"
                aria-checked={widgetEditEnabled}
                onClick={() => setWidgetEditEnabled((v) => !v)}
                className={[
                  'relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  widgetEditEnabled ? 'bg-blue-600' : 'bg-slate-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform',
                    widgetEditEnabled ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <IconDownload className="shrink-0 text-slate-500" />
              <label htmlFor="widget-list-export" className="sr-only">
                보내기 형식
              </label>
              <select
                id="widget-list-export"
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
                onClick={handleDeckExport}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exportBusy ? (
                  <>
                    <IconSpinner />
                    처리 중…
                  </>
                ) : (
                  <>
                    <IconFileDown />
                    받기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 m-0 border-t border-slate-100 pt-3 text-sm text-slate-500">
          카드 <strong>헤더</strong>를 드래그해 이동합니다. 겹치면 다른 카드가 밀려납니다. 제목 왼쪽{' '}
          <strong>블릿</strong>을 누르면 <code className="text-xs">widgetData</code> JSON이 열리며,{' '}
          <strong>×</strong> 또는 패널 바깥을 누르면 닫힙니다.
        </p>
      </header>

      <div
        className="relative w-full rounded-xl border border-slate-300"
        style={{ ...gridStyle, minHeight: minCanvasH }}
      >
        {reversedWidgets.map((w, i) => {
          const L = layouts[i];
          if (!L) return null;
          const label = w.widgetAttr?.tabLabel || w.widgetType;
          return (
            <div
              key={`${w.widgetType}-${reversedWidgets.length - 1 - i}`}
              className="absolute box-border overflow-visible rounded-lg border border-slate-300 bg-white shadow-md"
              style={{
                left: L.x,
                top: L.y,
                width: L.w,
                height: L.h,
                zIndex: L.z,
              }}
              onMouseDown={() => bringToFront(i)}
            >
              <div
                className={[
                  'relative flex h-9 shrink-0 select-none items-center border-b border-slate-200 bg-slate-100/95 px-2',
                  widgetEditEnabled
                    ? 'cursor-grab active:cursor-grabbing'
                    : 'cursor-default',
                ].join(' ')}
                title={widgetEditEnabled ? '헤더를 드래그하여 이동' : '편집이 꺼져 있습니다'}
                onMouseDown={(e) => widgetEditEnabled && startMove(e, i)}
              >
                <WidgetDataJsonPanel
                  label={label}
                  widget={w}
                  open={widgetDataOpenIndex === i}
                  onToggle={() =>
                    setWidgetDataOpenIndex((cur) => (cur === i ? null : i))
                  }
                  onClose={closeWidgetDataPanel}
                />
              </div>
              <div className="h-[calc(100%-2.25rem)] overflow-auto bg-white p-2">
                {renderWidgetBody(w, deck)}
              </div>

              {widgetEditEnabled && (
                <>
                  <button
                    type="button"
                    aria-label="왼쪽 위 크기 조절"
                    className={`${handleCls} -left-1.5 -top-1.5 cursor-nw-resize`}
                    onMouseDown={(e) => startResize(e, i, 'nw')}
                  />
                  <button
                    type="button"
                    aria-label="오른쪽 위 크기 조절"
                    className={`${handleCls} -right-1.5 -top-1.5 cursor-ne-resize`}
                    onMouseDown={(e) => startResize(e, i, 'ne')}
                  />
                  <button
                    type="button"
                    aria-label="왼쪽 아래 크기 조절"
                    className={`${handleCls} -bottom-1.5 -left-1.5 cursor-sw-resize`}
                    onMouseDown={(e) => startResize(e, i, 'sw')}
                  />
                  <button
                    type="button"
                    aria-label="오른쪽 아래 크기 조절"
                    className={`${handleCls} -bottom-1.5 -right-1.5 cursor-se-resize`}
                    onMouseDown={(e) => startResize(e, i, 'se')}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconLayoutWidgets() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLayers({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 2 7l10 5 10-5-10-5Zm0 8.5L4.74 8.25 2 9.5l10 5 10-5-2.74-1.25L12 10.5Zm0 5L4.74 13.25 2 14.5l10 5 10-5-2.74-1.25L12 15.5Z" />
    </svg>
  );
}

function IconSliders({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M9 9h6M5 7H3m18 4h-5M7 17H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDownload({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFileDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 18V12m0 0 2 2m-2-2-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function IconBullet() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
