// 보고서 목록 페이지 — 보고서 행 표시, axios 데이터 로드, 다운로드 처리
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PreviewModal from '../components/modal/PreviewModal';
import { downloadReadme, downloadAllPpt, downloadAllPdf, downloadAllPptx, downloadAllHtml, makeFilename } from '../utils/downloadHelpers';

const TYPE_COLORS = {
  readme: '#6366f1',
  image: '#0ea5e9',
  pdf: '#ef4444',
  ppt: '#f97316',
  pptx: '#16a34a',
  html: '#0891b2',
};

const REPORT_LIST = [
  { id: 1, title: '2024 분기별 사업 성과 보고서', department: '경영기획팀', date: '2024-04-04', status: '최종' },
  { id: 2, title: '2024 마케팅 채널 분석 보고서', department: '마케팅팀', date: '2024-03-28', status: '검토중' },
  { id: 3, title: '2024 고객 만족도 조사 결과', department: '고객성공팀', date: '2024-03-15', status: '최종' },
  { id: 4, title: '2025년 사업계획 발표자료', department: '경영기획팀', date: '2024-03-01', status: '초안' },
];

const STATUS_BADGE_CLASS = {
  최종: 'bg-emerald-500',
  검토중: 'bg-amber-500',
  초안: 'bg-slate-400',
};

export default function ReportList() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [selectedType, setSelectedType] = useState({});

  useEffect(() => {
    axios.get('/api/pptData.json')
      .then(res => setReportData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
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
            <h1 className="m-0 text-[28px] font-extrabold text-slate-800">보고서 목록</h1>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-slate-600 shadow-sm"
              onClick={openHelpPopup}
              title="새 창에서 도움말 열기"
            >
              도움말
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">데이터 기반 보고서를 미리보기하거나 다운로드하세요.</p>
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
            {REPORT_LIST.map((report, idx) => (
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
                    disabled={loading || !reportData}
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
        <strong>데이터 로드 방식:</strong> 화면 로드 시 <code className="rounded bg-sky-100 px-1">/api/pptData.json</code> 을
        axios 로 자동 로드합니다. 미리보기는 로드된 데이터 기반으로 7페이지(차트 3 + 데이터 4)를 렌더링합니다.
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
