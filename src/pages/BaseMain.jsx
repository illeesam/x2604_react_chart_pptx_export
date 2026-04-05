import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../routes/routePaths';

// 메인(홈) — 안내 카드와 보고서 목록으로 이동
export default function BaseMain() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-7">
        <h1 className="m-0 text-[26px] font-extrabold text-slate-800">
          ReportHub에 오신 것을 환영합니다
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          차트·데이터 기반 보고서를 미리보고 PDF, PPT, PPTX, HTML 등으로 보낼 수 있습니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          to={ROUTE_PATHS.REPORT_LIST}
          className="flex min-w-[260px] flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-5 text-inherit no-underline shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-[28px]">📋</span>
          <span className="text-[17px] font-bold text-slate-800">보고서 목록</span>
          <span className="text-[13px] text-slate-500">보고서 미리보기 및 다운로드</span>
        </Link>
      </div>
    </div>
  );
}
