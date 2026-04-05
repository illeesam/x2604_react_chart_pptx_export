/** 하단 푸터 — `shouldShowLayoutBottom` 이 true 인 경로에서만 노출 */
export default function LayoutBottom() {
  const year = new Date().getFullYear(); // 저작권 연도 표시용

  // ── 푸터 ──
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
