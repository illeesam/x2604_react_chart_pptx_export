/**
 * WidgetList 페이지 — 데이터 조회 전담
 * widgetListData.json 로드 후 Base01WidgetPanel 에 raw·deck 전달.
 * 레이아웃·다운로드·UI 로직은 모두 Base01WidgetPanel 내부에서 처리.
 */
import { useEffect, useState } from 'react';
import axiosLib from '../utils/axiosLib';
import { API_JSON } from '../utils/apiConfig';
import { normalizePreviewModalData } from '../utils/normalizePreviewModalData';
import Base01WidgetPanel from '../components/widgetPanel/base01WidgetPanel';

export default function WidgetList() {
  const [raw, setRaw]         = useState(null); // widgetListData 원본
  const [deck, setDeck]       = useState(null); // normalizePreviewModalData 결과
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // 마운트 시 widgetListData.json 조회
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
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-10 text-center text-slate-500">
        <p className="m-0 text-sm">위젯 데이터 로딩…</p>
        <code className="text-xs text-slate-400">{API_JSON.widgetListData}</code>
      </div>
    );
  }

  // ── 오류 ──
  if (error || !deck || !raw) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-10 text-center text-red-700">
        <p className="m-0 text-sm">로드 실패: {error}</p>
      </div>
    );
  }

  // ── 정상: 패널에 데이터 위임 (다운로드 포함 모든 로직은 패널 내부 처리) ──
  return <Base01WidgetPanel raw={raw} deck={deck} />;
}
