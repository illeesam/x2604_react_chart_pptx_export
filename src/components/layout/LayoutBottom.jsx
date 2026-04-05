/** 하단 영역 — routePaths.js 의 showLayoutBottom 이 true 인 경로에서만 노출 */
export default function LayoutBottom() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1100px] px-6 py-3.5">
        <span className="text-xs text-slate-400">
          © {year} ReportHub · 차트 PPT/PDF보내기 시스템
        </span>
      </div>
    </footer>
  );
}
