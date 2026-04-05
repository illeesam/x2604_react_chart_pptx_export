/**
 * Tab01WidgetList 페이지 — 탭 패널 모드
 * Base01WidgetPanel 을 panelType="tab" 으로 렌더.
 * 데이터 조회 로직은 Base01WidgetList 와 동일.
 */
import { useEffect, useState } from 'react';
import axiosLib from '../utils/axiosLib';
import { API_JSON } from '../utils/apiConfig';
import { normalizePreviewModalData } from '../utils/normalizePreviewModalData';
import Base01WidgetPanel from '../components/widgetPanel/Base01WidgetPanel';

export default function Tab01WidgetList() {
  const [raw, setRaw]         = useState(null);
  const [deck, setDeck]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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

  return <Base01WidgetPanel raw={raw} deck={deck} panelType="tab" />;
}
