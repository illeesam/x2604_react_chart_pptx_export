// 미리보기 모달 — 자체 axios 데이터 조회, 8개 탭 페이지 렌더, 현재/전체 다운로드 처리
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import CoverPage from '../CoverPage';
import ChartPage from '../widget/Chart01Widget';
import { DataPage4, DataPage5, DataPage6, DataPage7 } from '../widget/Data01Widget';
import {
  downloadPdf, downloadPpt, downloadImage, downloadReadme,
  downloadAllImages, downloadAllPdf, downloadAllPpt,
  downloadPptx, downloadAllPptx,
  downloadHtml, downloadAllHtml,
  makeFilename,
} from '../../utils/downloadHelpers';

const TOTAL_PAGES = 8;

export default function PreviewModal({ onClose }) {
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [downloading, setDownloading] = useState(null);
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
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5">
        <div className="flex h-[92vh] w-full max-w-[920px] flex-col items-center justify-center rounded-xl bg-white shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <div
              className="size-9 rounded-full border-4 border-slate-200 border-t-blue-500"
              style={{ animation: 'spin-modal 0.8s linear infinite' }}
            />
            <p className="m-0 text-sm text-slate-500">데이터 로딩중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="flex h-[92vh] w-full max-w-[920px] flex-col items-center justify-center rounded-xl bg-white shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <p className="m-0 text-sm text-red-700">데이터 로드 실패: {loadError}</p>
            <button
              type="button"
              className="cursor-pointer rounded-md border border-slate-200 bg-white px-5 py-2 text-[13px] font-semibold text-slate-700"
              onClick={onClose}
            >
              닫기
            </button>
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

  const handleReadme = () => run('readme', () => downloadReadme(data, makeFilename(src, currentPage, 'README')));
  const handleImage = () => run('image', () => downloadImage(contentRef, makeFilename(src, currentPage, '이미지')));
  const handlePdf = () => run('pdf', () => downloadPdf(contentRef, makeFilename(src, currentPage, 'PDF')));
  const handlePpt = () => run('ppt', () => downloadPpt(contentRef, makeFilename(src, currentPage, 'PPT')));
  const handlePptx = () => run('pptx', () => downloadPptx(data, currentPage, makeFilename(src, currentPage, 'PPTX')));
  const handleHtml = () => run('html', () => downloadHtml(contentRef, makeFilename(src, currentPage, 'HTML')));
  const handleAllImg = () => run('allImg', () => downloadAllImages(data, src, onProg));
  const handleAllPdf = () => run('allPdf', () => downloadAllPdf(data, makeFilename(src, '전체', '전체PDF'), onProg));
  const handleAllPpt = () => run('allPpt', () => downloadAllPpt(data, makeFilename(src, '전체', '전체PPT'), onProg));
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
  const isAll = ['allImg', 'allPdf', 'allPpt', 'allPptx', 'allHtml'].includes(downloading);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5"
      onClick={(e) => e.target === e.currentTarget && !isBusy && onClose()}
    >
      <div className="flex h-[92vh] w-full max-w-[920px] flex-col rounded-xl bg-white shadow-2xl">

        <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-br from-slate-800 to-slate-700 px-5 py-3">
          <div>
            <div className="text-[15px] font-bold text-white">{data.reportTitle}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              미리보기 — {currentPage === 0 ? '표지' : `${currentPage}P`} / 총 {TOTAL_PAGES - 1}페이지
            </div>
          </div>
          <button
            type="button"
            className="size-[30px] cursor-pointer rounded-full border-0 bg-white/10 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isBusy}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-0 border-b border-slate-200 bg-slate-100 px-3.5 py-2">
          <div className="flex flex-wrap items-center gap-1 py-0.5">
            <span className="mr-1 whitespace-nowrap rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              현재 탭 ({currentPage}P)
            </span>
            <Btn label="README" icon="📝" k="readme" downloading={downloading} onClick={handleReadme} color="#6366f1" />
            <Btn label="이미지" icon="🖼️" k="image" downloading={downloading} onClick={handleImage} color="#0ea5e9" />
            <Btn label="PDF" icon="📄" k="pdf" downloading={downloading} onClick={handlePdf} color="#ef4444" />
            <Btn label="PPT" icon="📊" k="ppt" downloading={downloading} onClick={handlePpt} color="#f97316" />
            <Btn label="PPTX" icon="📋" k="pptx" downloading={downloading} onClick={handlePptx} color="#16a34a" />
            <Btn label="HTML" icon="🌐" k="html" downloading={downloading} onClick={handleHtml} color="#0891b2" />
          </div>

          <div className="mx-2.5 hidden h-7 w-px bg-slate-300 sm:block" />

          <div className="flex flex-wrap items-center gap-1 py-0.5">
            <span className="mr-1 whitespace-nowrap rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              전체 7페이지
            </span>
            <Btn label="전체이미지" icon="🖼️" k="allImg" downloading={downloading} onClick={handleAllImg} color="#0284c7" />
            <Btn label="전체PDF" icon="📄" k="allPdf" downloading={downloading} onClick={handleAllPdf} color="#dc2626" />
            <Btn label="전체PPT" icon="📊" k="allPpt" downloading={downloading} onClick={handleAllPpt} color="#ea580c" />
            <Btn label="전체PPTX" icon="📋" k="allPptx" downloading={downloading} onClick={handleAllPptx} color="#15803d" />
            <Btn label="전체HTML" icon="🌐" k="allHtml" downloading={downloading} onClick={handleAllHtml} color="#0e7490" />
          </div>
        </div>

        {isAll && (
          <div className="border-b border-blue-200 bg-blue-50 px-4 py-1.5">
            <span className="text-xs font-semibold text-blue-700">
              {{ allImg: '이미지', allPdf: 'PDF', allPpt: 'PPT', allPptx: 'PPTX', allHtml: 'HTML' }[downloading] || ''} 생성중
              — {progress.current} / {progress.total} 페이지 렌더링
            </span>
            <div className="mt-1 h-1 overflow-hidden rounded-sm bg-blue-200">
              <div
                className="h-full rounded-sm bg-blue-500 transition-[width] duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3.5 py-2">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i).map((p) => (
            <button
              key={p}
              type="button"
              className={`cursor-pointer whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${
                p === currentPage
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
              onClick={() => goTo(p)}
            >
              {p === 0 ? '📋 표지' : p <= 3 ? `📊 ${p}P` : `📋 ${p}P`}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-0" ref={contentRef}>
          {renderPage()}
        </div>

        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-slate-50 px-5 py-2.5">
          <button
            type="button"
            className="cursor-pointer rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← 이전
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i).map((p) => (
              <button
                key={p}
                type="button"
                className={`size-2 cursor-pointer rounded-full transition-colors ${
                  p === currentPage ? 'bg-blue-500' : 'bg-slate-300'
                }`}
                aria-label={`${p + 1}페이지`}
                onClick={() => goTo(p)}
              />
            ))}
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
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
      type="button"
      className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded border-0 px-2.5 py-1 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed"
      style={{ backgroundColor: color, opacity: disabled && !loading ? 0.45 : 1 }}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <span
          className="inline-block size-3 shrink-0 rounded-full border-2 border-white/30 border-t-white"
          style={{ animation: 'spin-modal 0.8s linear infinite' }}
        />
      ) : (
        icon
      )}
      <span>{loading ? '처리중...' : label}</span>
    </button>
  );
}
