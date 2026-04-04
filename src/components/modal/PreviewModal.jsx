// 미리보기 모달 — 자체 axios 데이터 조회, 8개 탭 페이지 렌더, 현재/전체 다운로드 처리
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import CoverPage from '../CoverPage';
import ChartPage from '../ChartPage';
import { DataPage4, DataPage5, DataPage6, DataPage7 } from '../DataPage';
import {
  downloadPdf, downloadPpt, downloadImage, downloadReadme,
  downloadAllImages, downloadAllPdf, downloadAllPpt,
  downloadPptx, downloadAllPptx,
  downloadHtml, downloadAllHtml,
  makeFilename,
} from '../../utils/downloadHelpers';

// 표지(0) + 차트 3페이지(1~3) + 데이터 4페이지(4~7) = 총 8탭
const TOTAL_PAGES = 8;

// 미리보기 모달 페이지 — 8탭 전환·캡처·다운로드
export default function PreviewModal({ onClose }) {
  // 모달 자체적으로 조회한 보고서 데이터
  const [data, setData] = useState(null);
  // 데이터 로딩 중 여부
  const [loadingData, setLoadingData] = useState(true);
  // 데이터 조회 오류 메시지
  const [loadError, setLoadError] = useState(null);
  // 현재 보고 있는 탭(페이지) 번호 (0~7)
  const [currentPage, setCurrentPage] = useState(0);
  // 현재 처리 중인 다운로드 키 (예: 'pdf', 'allPdf')
  const [downloading, setDownloading] = useState(null);
  // 전체 다운로드 진행 상태 { current, total }
  const [progress, setProgress] = useState({ current: 0, total: 7 });
  // 현재 탭 DOM 참조 — html2canvas 캡처 대상
  const contentRef = useRef(null);

  // 모달 마운트 시 /api/pptData.json 자체 조회
  useEffect(() => {
    setLoadingData(true);
    setLoadError(null);
    axios.get('/api/pptData.json')
      .then(res => setData(res.data))
      .catch(err => setLoadError(err.message))
      .finally(() => setLoadingData(false));
  }, []);

  // 로딩 중 화면 — 스피너 표시
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

  // 오류 화면 — 에러 메시지 + 닫기 버튼
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

  // 탭 이동 — 0~7 범위 클램프
  const goTo = (p) => setCurrentPage(Math.max(0, Math.min(TOTAL_PAGES - 1, p)));

  // 전체 다운로드 진행률 콜백
  const onProg = (cur, total) => setProgress({ current: cur, total });

  // 다운로드 실행 래퍼 — 시작/완료 시 downloading 상태 관리
  const run = async (key, fn) => {
    setDownloading(key);
    setProgress({ current: 0, total: 7 });
    try { await fn(); } finally { setDownloading(null); }
  };

  // 파일명 생성 시 사용할 출처 라벨
  const src = '미리보기';

  // ── 현재 탭 다운로드 핸들러 ──────────────────────────────────
  // 전체 데이터를 마크다운(.md)으로 저장
  const handleReadme = () => run('readme', () => downloadReadme(data,      makeFilename(src, currentPage, 'README')));
  // 현재 탭 DOM을 캡처해 PNG로 저장
  const handleImage  = () => run('image',  () => downloadImage(contentRef, makeFilename(src, currentPage, '이미지')));
  // 현재 탭 캡처 → 가로 A4 PDF 저장
  const handlePdf    = () => run('pdf',    () => downloadPdf(contentRef,   makeFilename(src, currentPage, 'PDF')));
  // 현재 탭 캡처 → 이미지 슬라이드 1장짜리 PPT 저장
  const handlePpt    = () => run('ppt',    () => downloadPpt(contentRef,   makeFilename(src, currentPage, 'PPT')));
  // 현재 페이지 데이터로 네이티브 차트·표 PPTX 저장
  const handlePptx   = () => run('pptx',   () => downloadPptx(data, currentPage, makeFilename(src, currentPage, 'PPTX')));
  // 현재 탭 캡처 이미지를 임베드한 HTML 저장
  const handleHtml   = () => run('html',   () => downloadHtml(contentRef, makeFilename(src, currentPage, 'HTML')));

  // ── 전체 7페이지 다운로드 핸들러 ─────────────────────────────
  // 전 페이지 PNG 개별 저장 + 진행률 표시
  const handleAllImg  = () => run('allImg',  () => downloadAllImages(data, src, onProg));
  // 전 페이지 캡처 합쳐 PDF 한 파일 저장
  const handleAllPdf  = () => run('allPdf',  () => downloadAllPdf(data,  makeFilename(src, '전체', '전체PDF'),  onProg));
  // 전 페이지 캡처 이미지 슬라이드 PPT 저장
  const handleAllPpt  = () => run('allPpt',  () => downloadAllPpt(data,  makeFilename(src, '전체', '전체PPT'),  onProg));
  // 전체 데이터로 네이티브 PPTX 저장 (캡처 없음)
  const handleAllPptx = () => run('allPptx', () => downloadAllPptx(data, makeFilename(src, '전체', '전체PPTX')));
  // 전 페이지 캡처 합쳐 HTML 한 파일 저장
  const handleAllHtml = () => run('allHtml', () => downloadAllHtml(data, makeFilename(src, '전체', '전체HTML'), onProg));

  // 탭 번호에 따라 렌더할 페이지 컴포넌트 반환
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

  // 다운로드 처리 중 여부
  const isBusy = !!downloading;
  // 전체 페이지 다운로드 중 여부 (진행률 바 표시 조건)
  const isAll  = ['allImg','allPdf','allPpt','allPptx','allHtml'].includes(downloading);

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && !isBusy && onClose()}>
      <div style={s.modal}>

        {/* 헤더 — 보고서 제목·현재 페이지 정보·닫기 버튼 */}
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>{data.reportTitle}</div>
            <div style={s.headerSub}>미리보기 — {currentPage === 0 ? '표지' : `${currentPage}P`} / 총 {TOTAL_PAGES - 1}페이지</div>
          </div>
          {/* 처리 중에는 닫기 비활성 */}
          <button style={s.closeBtn} onClick={onClose} disabled={isBusy}>✕</button>
        </div>

        {/* 버튼 바 — 현재 탭 / 전체 다운로드 버튼 그룹 */}
        <div style={s.btnBar}>
          {/* 현재 탭 단위 다운로드 */}
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

          {/* 전체 7페이지 일괄 다운로드 */}
          <div style={s.btnGroup}>
            <span style={s.groupLabel}>전체 7페이지</span>
            <Btn label="전체이미지" icon="🖼️" k="allImg"  downloading={downloading} onClick={handleAllImg}  color="#0284c7" />
            <Btn label="전체PDF"    icon="📄" k="allPdf"  downloading={downloading} onClick={handleAllPdf}  color="#dc2626" />
            <Btn label="전체PPT"    icon="📊" k="allPpt"  downloading={downloading} onClick={handleAllPpt}  color="#ea580c" />
            <Btn label="전체PPTX"   icon="📋" k="allPptx" downloading={downloading} onClick={handleAllPptx} color="#15803d" />
            <Btn label="전체HTML"   icon="🌐" k="allHtml" downloading={downloading} onClick={handleAllHtml} color="#0e7490" />
          </div>
        </div>

        {/* 전체 다운로드 진행 바 — isAll 일 때만 표시 */}
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

        {/* 탭 버튼 목록 — 표지(0), 차트 1~3P, 데이터 4~7P */}
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

        {/* 페이지 콘텐츠 영역 — html2canvas 캡처 대상 */}
        <div style={s.body} ref={contentRef}>
          {renderPage()}
        </div>

        {/* 푸터 — 이전/다음 버튼, 페이지 도트 인디케이터 */}
        <div style={s.footer}>
          <button
            style={{ ...s.navBtn, opacity: currentPage === 0 ? 0.3 : 1 }}
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← 이전
          </button>
          {/* 현재 페이지 위치를 나타내는 도트 */}
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

// 다운로드 버튼 — k: 작업 키, downloading과 같을 때만 스피너
function Btn({ label, icon, k, downloading, onClick, color }) {
  // 이 버튼이 현재 처리 중인지 여부
  const loading = downloading === k;
  // 다른 버튼이 처리 중이면 비활성
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

// 인라인 스타일 모음
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
  body: { flex: 1, overflowY: 'auto', padding: 0, minHeight: 0 }, // 현재 탭 페이지 본문(캡처 대상)
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
    borderRadius: '0 0 12px 12px',
  },
  navBtn: {
    padding: '7px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155',
  },
  pageIndicator: { display: 'flex', gap: 6, alignItems: 'center' }, // 페이지 위치 도트 묶음
  dot: { width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' }, // 개별 페이지 도트
  spinner: {
    width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0,
  },
  // 로딩 상태 스타일
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  loadingSpinner: {
    width: 36, height: 36, border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: '#64748b', fontSize: 14, margin: 0 },
  // 오류 상태 스타일
  errorWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  errorText: { color: '#b91c1c', fontSize: 14, margin: 0 },
  retryBtn: {
    padding: '7px 20px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155',
  },
};
