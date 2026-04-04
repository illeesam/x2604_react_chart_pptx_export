// 보고서 목록 화면 — 보고서 행 표시, axios 데이터 로드, 다운로드 처리
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PreviewModal from './modal/PreviewModal';
import { downloadReadme, downloadAllPpt, downloadAllPdf, downloadAllPptx, downloadAllHtml, makeFilename } from '../utils/downloadHelpers';

// 형식별 내려받기 버튼 배경색 매핑
const TYPE_COLORS = {
  readme: '#6366f1',
  image:  '#0ea5e9',
  pdf:    '#ef4444',
  ppt:    '#f97316',
  pptx:   '#16a34a',
  html:   '#0891b2',
};

// 데모용 보고서 목록 (실제 본문은 pptData.json 공유)
const REPORT_LIST = [
  { id: 1, title: '2024 분기별 사업 성과 보고서', department: '경영기획팀', date: '2024-04-04', status: '최종' },
  { id: 2, title: '2024 마케팅 채널 분석 보고서', department: '마케팅팀', date: '2024-03-28', status: '검토중' },
  { id: 3, title: '2024 고객 만족도 조사 결과', department: '고객성공팀', date: '2024-03-15', status: '최종' },
  { id: 4, title: '2025년 사업계획 발표자료', department: '경영기획팀', date: '2024-03-01', status: '초안' },
];

export default function ListPage() {
  // 보고서 본문 데이터 (axios 로드 결과)
  const [reportData, setReportData] = useState(null);
  // 초기 데이터 로딩 상태
  const [loading, setLoading] = useState(true);
  // axios 오류 메시지
  const [error, setError] = useState(null);
  // 미리보기 모달 표시 여부
  const [showPreview, setShowPreview] = useState(false);
  // 현재 처리 중인 다운로드 reportId
  const [downloading, setDownloading] = useState(null);
  // 행별 선택된 내려받기 형식 { [reportId]: 'pdf' | 'ppt' | ... }
  const [selectedType, setSelectedType] = useState({});

  // 화면 마운트 시 /api/pptData.json 자동 조회
  useEffect(() => {
    axios.get('/api/pptData.json')
      .then(res => setReportData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 미리보기 모달 열기
  const handlePreview = () => setShowPreview(true);

  // 도움말 팝업 새 창 열기
  const openHelpPopup = () => {
    const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
    const url = `${base}/help/list-help.html`;
    const features = 'width=1180,height=960,scrollbars=yes,resizable=yes';
    window.open(url, 'ReportHubListHelp', features);
  };

  // 파일명 생성 시 사용할 출처 라벨
  const src = '보고서목록';

  // 선택된 형식으로 보고서 파일 다운로드
  const handleDownload = async (reportId) => {
    const type = selectedType[reportId] || 'pdf';
    if (!reportData) return;
    setDownloading(reportId);
    try {
      switch (type) {
        case 'readme': downloadReadme(reportData, makeFilename(src, reportId, 'README')); break;
        // 이미지는 미리보기에서 페이지별 저장 안내
        case 'image':  alert('이미지 내려받기: 미리보기에서 원하는 페이지의 [이미지] 버튼을 사용하세요.'); break;
        case 'pdf':    await downloadAllPdf(reportData,  makeFilename(src, reportId, 'PDF'));  break;
        case 'ppt':    await downloadAllPpt(reportData,  makeFilename(src, reportId, 'PPT'));  break;
        case 'pptx':   await downloadAllPptx(reportData, makeFilename(src, reportId, 'PPTX')); break;
        case 'html':   await downloadAllHtml(reportData, makeFilename(src, reportId, 'HTML')); break;
        default: break;
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={s.container}>
      {/* 페이지 헤더 — 제목·도움말·로드 상태 배지 */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.titleRow}>
            <h1 style={s.pageTitle}>보고서 목록</h1>
            <button type="button" style={s.btnHelp} onClick={openHelpPopup} title="새 창에서 도움말 열기">
              도움말
            </button>
          </div>
          <p style={s.pageSub}>데이터 기반 보고서를 미리보기하거나 다운로드하세요.</p>
        </div>
        {/* 데이터 로드 상태 배지 */}
        {loading && <div style={s.loadingBadge}>데이터 로딩중...</div>}
        {error && <div style={s.errorBadge}>데이터 로드 실패: {error}</div>}
        {reportData && !loading && <div style={s.successBadge}>데이터 로드 완료</div>}
      </div>

      {/* 보고서 목록 테이블 */}
      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>
              {['번호', '보고서명', '담당부서', '생성일', '상태', '작업'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPORT_LIST.map((report, idx) => (
              <tr key={report.id} style={idx % 2 === 0 ? s.trEven : s.trOdd}>
                <td style={s.tdCenter}>{report.id}</td>
                <td style={s.tdMain}>{report.title}</td>
                <td style={s.td}>{report.department}</td>
                <td style={s.td}>{report.date}</td>
                <td style={s.tdCenter}>
                  {/* 상태 뱃지 (최종/검토중/초안) */}
                  <StatusBadge status={report.status} />
                </td>
                <td style={s.tdActions}>
                  {/* 미리보기 버튼 — 데이터 로드 전 비활성 */}
                  <button
                    style={s.btnPreview}
                    onClick={handlePreview}
                    disabled={loading || !reportData}
                  >
                    미리보기
                  </button>
                  {/* 내려받기 형식 선택 드롭다운 */}
                  <select
                    style={s.select}
                    value={selectedType[report.id] || 'pdf'}
                    onChange={e => setSelectedType(prev => ({ ...prev, [report.id]: e.target.value }))}
                    disabled={loading || !reportData || downloading === report.id}
                  >
                    <option value="readme">📝 README</option>
                    <option value="image">🖼️ 이미지</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="ppt">📊 PPT</option>
                    <option value="pptx">📋 PPTX</option>
                    <option value="html">🌐 HTML</option>
                  </select>
                  {/* 내려받기 실행 버튼 — 처리 중 비활성 */}
                  <button
                    style={{
                      ...s.btnDownload,
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

      {/* 하단 데이터 로드 방식 안내 카드 */}
      <div style={s.infoCard}>
        <strong>데이터 로드 방식:</strong> 화면 로드 시 <code>/api/pptData.json</code> 을 axios 로 자동 로드합니다.
        미리보기는 로드된 데이터 기반으로 7페이지(차트 3 + 데이터 4)를 렌더링합니다.
      </div>

      {/* 미리보기 모달 — showPreview 상태가 true일 때만 마운트 */}
      {showPreview && (
        <PreviewModal onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

// 보고서 상태 뱃지 컴포넌트 (최종 / 검토중 / 초안)
function StatusBadge({ status }) {
  const colors = { '최종': '#10b981', '검토중': '#f59e0b', '초안': '#94a3b8' };
  return (
    <span style={{ background: colors[status] || '#94a3b8', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>
      {status}
    </span>
  );
}

// 인라인 스타일 모음
const s = {
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', fontFamily: "'Segoe UI', 'Malgun Gothic', sans-serif" },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 800, color: '#1e293b' },
  btnHelp: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  pageSub: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  loadingBadge: { background: '#dbeafe', color: '#1d4ed8', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600 },
  errorBadge: { background: '#fee2e2', color: '#b91c1c', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600 },
  successBadge: { background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600 },
  tableCard: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#1e293b', color: '#fff', padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 },
  td: { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  tdCenter: { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center' },
  tdMain: { padding: '12px 16px', fontSize: 14, color: '#1e293b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' },
  tdActions: { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  trEven: { background: '#fafafa' },
  trOdd: { background: '#fff' },
  btnPreview: {
    marginRight: 6, padding: '6px 14px', borderRadius: 6, border: '1px solid #3b82f6',
    color: '#3b82f6', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  select: {
    marginRight: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1',
    fontSize: 13, color: '#334155', background: '#fff', cursor: 'pointer',
    height: 34, verticalAlign: 'middle',
  },
  btnDownload: {
    padding: '6px 16px', borderRadius: 6, border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, height: 34,
    verticalAlign: 'middle',
  },
  infoCard: {
    background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
    padding: '12px 16px', fontSize: 13, color: '#0369a1',
  },
};
