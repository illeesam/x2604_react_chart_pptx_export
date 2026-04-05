// 보고서 목록 — reportListData.json(표·페이지 메타) + previewModalData.json(슬라이드 덱)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PreviewModal from '../components/modal/PreviewModal';
import { downloadReadme, downloadAllPpt, downloadAllPdf, downloadAllPptx, downloadAllHtml, makeFilename } from '../utils/downloadHelpers';
import { API_JSON } from '../utils/apiConfig';

const TYPE_COLORS = {
  readme: '#6366f1',
  image: '#0ea5e9',
  pdf: '#ef4444',
  ppt: '#f97316',
  pptx: '#16a34a',
  html: '#0891b2',
};

const STATUS_BADGE_CLASS = {
  최종: 'bg-emerald-500',
  검토중: 'bg-amber-500',
  초안: 'bg-slate-400',
};

export default function ReportList() {
  const [listPayload, setListPayload] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [selectedType, setSelectedType] = useState({});

  const reports = listPayload?.reports ?? [];
  const pageMeta = listPayload?.page;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([axios.get(API_JSON.reportListData), axios.get(API_JSON.previewModalData)])
      .then(([listRes, deckRes]) => {
        if (cancelled) return;
        setListPayload(listRes.data);
        setReportData(deckRes.data);
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

  const handlePreview = () => setShowPreview(true);

  const openHelpPopup = () => {
    const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
    const url = `${base}/help/list-help.html`;
    window.open(url, 'ReportHubListHelp', 'width=1180,height=960,scrollbars=yes,resizable=yes');
  };

  const src = '보고서목록';

  const handleDownload = async (reportId) => {
    const type = selectedType[reportId] || 'pdf';
    if (!reportData) return;
    setDownloading(reportId);
    try {
      switch (type) {
        case 'readme': downloadReadme(reportData, makeFilename(src, reportId, 'README')); break;
        case 'image': alert('이미지 내려받기: 미리보기에서 원하는 페이지의 [이미지] 버튼을 사용하세요.'); break;
        case 'pdf': await downloadAllPdf(reportData, makeFilename(src, reportId, 'PDF')); break;
        case 'ppt': await downloadAllPpt(reportData, makeFilename(src, reportId, 'PPT')); break;
        case 'pptx': await downloadAllPptx(reportData, makeFilename(src, reportId, 'PPTX')); break;
        case 'html': await downloadAllHtml(reportData, makeFilename(src, reportId, 'HTML')); break;
        default: break;
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 font-sans">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-[28px] font-extrabold text-slate-800">
              {pageMeta?.title ?? '보고서 목록'}
            </h1>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-slate-600 shadow-sm"
              onClick={openHelpPopup}
              title="새 창에서 도움말 열기"
            >
              도움말
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {pageMeta?.subtitle ?? '데이터 기반 보고서를 미리보기하거나 다운로드하세요.'}
          </p>
        </div>
        {loading && (
          <div className="rounded-md bg-blue-100 px-3.5 py-1.5 text-[13px] font-semibold text-blue-700">
            데이터 로딩중...
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-100 px-3.5 py-1.5 text-[13px] font-semibold text-red-700">
            데이터 로드 실패: {error}
          </div>
        )}
        {reportData && !loading && (
          <div className="rounded-md bg-green-100 px-3.5 py-1.5 text-[13px] font-semibold text-green-700">
            데이터 로드 완료
          </div>
        )}
      </div>

      <div className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['번호', '보고서명', '담당부서', '생성일', '상태', '작업'].map((h) => (
                <th
                  key={h}
                  className="bg-slate-800 px-4 py-3 text-left text-[13px] font-semibold text-white"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((report, idx) => (
              <tr key={report.id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="border-b border-slate-100 px-4 py-3 text-center text-[13px] text-slate-700">
                  {report.id}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-[14px] font-semibold text-slate-800">
                  {report.title}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-[13px] text-slate-700">
                  {report.department}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-[13px] text-slate-700">
                  {report.date}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-center">
                  <StatusBadge status={report.status} />
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-2.5">
                  <button
                    type="button"
                    className="mr-1.5 cursor-pointer rounded-md border border-blue-500 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handlePreview}
                    disabled={loading}
                  >
                    미리보기
                  </button>
                  <select
                    className="mr-1.5 h-[34px] cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1.5 align-middle text-[13px] text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedType[report.id] || 'pdf'}
                    onChange={(e) => setSelectedType((prev) => ({ ...prev, [report.id]: e.target.value }))}
                    disabled={loading || !reportData || downloading === report.id}
                  >
                    <option value="readme">📝 README</option>
                    <option value="image">🖼️ 이미지</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="ppt">📊 PPT</option>
                    <option value="pptx">📋 PPTX</option>
                    <option value="html">🌐 HTML</option>
                  </select>
                  <button
                    type="button"
                    className="h-[34px] cursor-pointer rounded-md border-0 px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: TYPE_COLORS[selectedType[report.id] || 'pdf'],
                      opacity: downloading === report.id ? 0.7 : 1,
                    }}
                    onClick={() => handleDownload(report.id)}
                    disabled={loading || !reportData || !!downloading}
                  >
                    {downloading === report.id ? '처리중...' : '내려받기'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-700">
        <strong>데이터 로드:</strong> 화면 로드 시{' '}
        <code className="rounded bg-sky-100 px-1">{API_JSON.reportListData}</code> (목록·표) 와{' '}
        <code className="rounded bg-sky-100 px-1">{API_JSON.previewModalData}</code> (목록에서 내려받기용 덱) 을
        axios 로 불러옵니다. 미리보기 모달은 열릴 때마다{' '}
        <code className="rounded bg-sky-100 px-1">{API_JSON.previewModalData}</code> 을 다시 조회합니다.
      </div>

      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  );
}

function StatusBadge({ status }) {
  const bg = STATUS_BADGE_CLASS[status] || 'bg-slate-400';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${bg}`}>
      {status}
    </span>
  );
}
