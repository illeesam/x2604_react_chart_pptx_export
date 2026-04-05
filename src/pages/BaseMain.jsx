import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosLib from '../utils/axiosLib';
import { ROUTE_PATHS } from '../routes/routePaths';
import { API_JSON } from '../utils/apiConfig';

/** 홈 — `baseMainData.json` 히어로 문구·진입 링크 카드 */
export default function BaseMain() {
  const [payload, setPayload] = useState(null); // baseMainData 전체
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosLib
      .get(API_JSON.baseMainData)
      .then((res) => setPayload(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const hero = payload?.hero; // title, description
  const links = Array.isArray(payload?.links) ? payload.links : []; // 카드 목록

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      {/* ── 히어로 ── */}
      <div className="mb-7">
        <h1 className="m-0 text-[26px] font-extrabold text-slate-800">
          {hero?.title ?? 'ReportHub'}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          {hero?.description ?? (error ? `메인 데이터를 불러오지 못했습니다: ${error}` : '불러오는 중…')}
        </p>
      </div>

      {/* ── 진입 링크 카드 ── */}
      <div className="flex flex-wrap gap-4">
        {links.map((item) => {
          const to =
            item.path === '/reportList' ? ROUTE_PATHS.REPORT_LIST : item.path || ROUTE_PATHS.REPORT_LIST;
          return (
            <Link
              key={to + (item.title || '')}
              to={to}
              className="flex min-w-[260px] flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-5 text-inherit no-underline shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-[28px]">{item.icon ?? '📋'}</span>
              <span className="text-[17px] font-bold text-slate-800">{item.title ?? '링크'}</span>
              <span className="text-[13px] text-slate-500">{item.subtitle ?? ''}</span>
            </Link>
          );
        })}
        {!payload && !error ? (
          <div className="text-sm text-slate-400">카드 데이터 로딩…</div>
        ) : null}
        {payload && links.length === 0 ? (
          <div className="text-sm text-slate-500">표시할 링크가 없습니다. baseMainData.json 의 links 를 확인하세요.</div>
        ) : null}
      </div>
    </div>
  );
}
