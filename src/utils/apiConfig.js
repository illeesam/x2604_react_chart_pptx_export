/** 정적 API JSON 경로 (public/api/ → 개발 서버에서 /api/...) */
export const API_JSON = {
  baseMain: '/api/baseMainData.json',
  reportList: '/api/reportListData.json',
  login: '/api/baseLoginData.json',
};

/**
 * reportListData.json → 미리보기·다운로드용 덱 객체 (reports / page UI 메타 제외)
 */
export function extractReportDeck(reportListPayload) {
  if (!reportListPayload || typeof reportListPayload !== 'object') return null;
  const { reports, page, ...deck } = reportListPayload;
  return Object.keys(deck).length ? deck : null;
}
