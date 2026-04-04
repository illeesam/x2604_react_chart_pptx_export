import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import CoverPage from './CoverPage';
import ChartPage from './ChartPage';
import { DataPage4, DataPage5, DataPage6, DataPage7 } from './DataPage';
import {
  downloadPdf, downloadPpt, downloadImage, downloadReadme,
  downloadAllImages, downloadAllPdf, downloadAllPpt,
  downloadPptx, downloadAllPptx,
  downloadHtml, downloadAllHtml,
  makeFilename,
} from '../utils/downloadHelpers';

const TOTAL_PAGES = 8;   // 0=커버, 1~3=차트, 4~7=데이터

export default function PreviewModal({ onClose }) {
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [downloading, setDownloading] = useState(null); // string key
  const [progress, setProgress] = useState({ current: 0, total: 7 });
  const contentRef = useRef(null);

  useEffect(() => {
    setLoadingData(true);
    setLoadError(null);
    axios.get('/api/pptData.json')
      .then(res => setData(res.data))
      .catch(err => setLoadError(err.message))
      .finally(() => setLoadingData(false));
  }, []);

  if (loadingData) {
    return (
      <div style={s.overlay}>
        <div style={{ ...s.modal, alignItems: 'center', justifyContent: 'center' }}>
          <div style={s.loadingWrap}>
            <div style={s.loadingSpinner} />
            <p style={s.loadingText}>데이터 로딩중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{ ...s.modal, alignItems: 'center', justifyContent: 'center' }}>
          <div style={s.errorWrap}>
            <p style={s.errorText}>데이터 로드 실패: {loadError}</p>
            <button style={s.retryBtn} onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    );
  }

  const goTo = (p) => setCurrentPage(Math.max(0, Math.min(TOTAL_PAGES - 1, p)));

  const onProg = (cur, total) => setProgress({ current: cur, total });

  const run = async (key, fn) => {
    setDownloading(key);
    setProgress({ current: 0, total: 7 });
    try { await fn(); } finally { setDownloading(null); }
  };

  const src = '미리보기';

  // ── 현재 탭 ──
  const handleReadme = () => run('readme', () => downloadReadme(data,      makeFilename(src, currentPage, 'README')));
  const handleImage  = () => run('image',  () => downloadImage(contentRef, makeFilename(src, currentPage, '이미지')));
  const handlePdf    = () => run('pdf',    () => downloadPdf(contentRef,   makeFilename(src, currentPage, 'PDF')));
  const handlePpt    = () => run('ppt',    () => downloadPpt(contentRef,   makeFilename(src, currentPage, 'PPT')));
  const handlePptx   = () => run('pptx',   () => downloadPptx(data, currentPage, makeFilename(src, currentPage, 'PPTX')));
  const handleHtml   = () => run('html',   () => downloadHtml(contentRef, makeFilename(src, currentPage, 'HTML')));

  // ── 전체 7페이지 ──
  const handleAllImg  = () => run('allImg',  () => downloadAllImages(data, src, onProg));
  const handleAllPdf  = () => run('allPdf',  () => downloadAllPdf(data,  makeFilename(src, '전체', '전체PDF'),  onProg));
  const handleAllPpt  = () => run('allPpt',  () => downloadAllPpt(data,  makeFilename(src, '전체', '전체PPT'),  onProg));
  const handleAllPptx = () => run('allPptx', () => downloadAllPptx(data, makeFilename(src, '전체', '전체PPTX')));
  const handleAllHtml = () => run('allHtml', () => downloadAllHtml(data, makeFilename(src, '전체', '전체HTML'), onProg));

  const renderPage = () => {
    switch (currentPage) {
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
  };

  const isBusy = !!downloading;
  const isAll  = ['allImg','allPdf','allPpt','allPptx','allHtml'].includes(downloading);

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && !isBusy && onClose()}>
      <div style={s.modal}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>{data.reportTitle}</div>
            <div style={s.headerSub}>미리보기 — {currentPage === 0 ? '표지' : `${currentPage}P`} / 총 {TOTAL_PAGES - 1}페이지</div>
          </div>
          <button style={s.closeBtn} onClick={onClose} disabled={isBusy}>✕</button>
        </div>

        {/* ── 버튼 바 ── */}
        <div style={s.btnBar}>
          {/* 현재 탭 */}
          <div style={s.btnGroup}>
            <span style={s.groupLabel}>현재 탭 ({currentPage}P)</span>
            <Btn label="README"  icon="📝" k="readme" downloading={downloading} onClick={handleReadme}  color="#6366f1" />
            <Btn label="이미지"  icon="🖼️" k="image"  downloading={downloading} onClick={handleImage}   color="#0ea5e9" />
            <Btn label="PDF"     icon="📄" k="pdf"    downloading={downloading} onClick={handlePdf}     color="#ef4444" />
            <Btn label="PPT"     icon="📊" k="ppt"    downloading={downloading} onClick={handlePpt}     color="#f97316" />
            <Btn label="PPTX"    icon="📋" k="pptx"   downloading={downloading} onClick={handlePptx}    color="#16a34a" />
            <Btn label="HTML"    icon="🌐" k="html"   downloading={downloading} onClick={handleHtml}    color="#0891b2" />
          </div>

          <div style={s.divider} />

          {/* 전체 7페이지 */}
          <div style={s.btnGroup}>
            <span style={s.groupLabel}>전체 7페이지</span>
            <Btn label="전체이미지" icon="🖼️" k="allImg"  downloading={downloading} onClick={handleAllImg}  color="#0284c7" />
            <Btn label="전체PDF"    icon="📄" k="allPdf"  downloading={downloading} onClick={handleAllPdf}  color="#dc2626" />
            <Btn label="전체PPT"    icon="📊" k="allPpt"  downloading={downloading} onClick={handleAllPpt}  color="#ea580c" />
            <Btn label="전체PPTX"   icon="📋" k="allPptx" downloading={downloading} onClick={handleAllPptx} color="#15803d" />
            <Btn label="전체HTML"   icon="🌐" k="allHtml" downloading={downloading} onClick={handleAllHtml} color="#0e7490" />
          </div>
        </div>

        {/* ── 전체 진행 오버레이 ── */}
        {isAll && (
          <div style={s.progressBar}>
            <span style={s.progressText}>
              {{ allImg: '이미지', allPdf: 'PDF', allPpt: 'PPT', allPptx: 'PPTX', allHtml: 'HTML' }[downloading] || ''} 생성중
              — {progress.current} / {progress.total} 페이지 렌더링
            </span>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${(progress.current / progress.total) * 100}%` }} />
            </div>
          </div>
        )}

        {/* ── 탭 ── */}
        <div style={s.tabs}>
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i).map(p => (
            <button
              key={p}
              style={{ ...s.tab, ...(p === currentPage ? s.tabActive : {}) }}
              onClick={() => goTo(p)}
            >
              {p === 0 ? '📋 표지' : p <= 3 ? `📊 ${p}P` : `📋 ${p}P`}
            </button>
          ))}
        </div>

        {/* ── 콘텐츠 ── */}
        <div style={s.body} ref={contentRef}>
          {renderPage()}
        </div>

        {/* ── 푸터 ── */}
        <div style={s.footer}>
          <button
            style={{ ...s.navBtn, opacity: currentPage === 0 ? 0.3 : 1 }}
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← 이전
          </button>
          <div style={s.pageIndicator}>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i).map(p => (
              <span
                key={p}
                style={{ ...s.dot, background: p === currentPage ? '#3b82f6' : '#cbd5e1' }}
                onClick={() => goTo(p)}
              />
            ))}
          </div>
          <button
            style={{ ...s.navBtn, opacity: currentPage === TOTAL_PAGES - 1 ? 0.3 : 1 }}
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === TOTAL_PAGES - 1}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
}

function Btn({ label, icon, k, downloading, onClick, color }) {
  const loading = downloading === k;
  const disabled = !!downloading;
  return (
    <button
      style={{ ...s.dlBtn, background: color, opacity: disabled && !loading ? 0.45 : 1 }}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? <span style={s.spinner} /> : icon}
      <span>{loading ? '처리중...' : label}</span>
    </button>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: '100%', maxWidth: 920,
    height: '92vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px',
    background: 'linear-gradient(135deg,#1e293b,#334155)',
    borderRadius: '12px 12px 0 0',
  },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: 700 },
  headerSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  closeBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
    width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 13,
  },

  /* 버튼 바 */
  btnBar: {
    display: 'flex', alignItems: 'center', gap: 0,
    padding: '8px 14px', background: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap',
  },
  btnGroup: { display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', padding: '2px 0' },
  groupLabel: {
    fontSize: 10, fontWeight: 700, color: '#64748b',
    background: '#e2e8f0', borderRadius: 4, padding: '2px 7px', marginRight: 3, whiteSpace: 'nowrap',
  },
  divider: { width: 1, height: 28, background: '#cbd5e1', margin: '0 10px' },
  dlBtn: {
    border: 'none', color: '#fff', padding: '5px 11px', borderRadius: 5,
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  },

  /* 진행 바 */
  progressBar: {
    padding: '6px 16px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe',
  },
  progressText: { fontSize: 12, color: '#1d4ed8', fontWeight: 600 },
  progressTrack: {
    marginTop: 4, height: 4, background: '#bfdbfe', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: '#3b82f6', borderRadius: 2, transition: 'width 0.3s',
  },

  /* 탭 */
  tabs: {
    display: 'flex', gap: 4, padding: '8px 14px',
    borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto',
  },
  tab: {
    padding: '4px 11px', borderRadius: 5, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    whiteSpace: 'nowrap', color: '#64748b',
  },
  tabActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' },

  body: { flex: 1, overflowY: 'auto', padding: 0, minHeight: 0 },

  /* 푸터 */
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
    borderRadius: '0 0 12px 12px',
  },
  navBtn: {
    padding: '7px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155',
  },
  pageIndicator: { display: 'flex', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' },
  spinner: {
    width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0,
  },
};
