# p2604_chart_ppt_export

React 기반 **보고서 목록·미리보기** 화면에서 Chart.js 차트와 데이터 페이지를 구성하고, **PDF / PPT(이미지 슬라이드) / PPTX(네이티브 차트·표) / HTML / README(마크다운)** 등으로 보낼 수 있는 샘플 웹 앱입니다.

## 요구 사항

- [Node.js](https://nodejs.org/) (LTS 권장)
- npm

## 설치 및 실행

```bash
npm install
npm start
```

개발 서버가 기동되면 브라우저에서 앱을 열 수 있습니다. 빌드는 다음으로 수행합니다.

```bash
npm run build
```

## 주요 기능 (요약)

- 보고서 목록 테이블, 상태 배지, **미리보기** 모달
- `/api/pptData.json` JSON 데이터 로드 후 **표지 + 차트 3페이지 + 데이터 4페이지** 구성
- 다양한 형식의 **다운로드**(목록·미리보기 각각)

자세한 화면별 동작, 보내기 종류별 차이, 사용 라이브러리 역할은 [**README_기능설명.md**](./README_기능설명.md)를 참고하세요.

## 프로젝트 구조 (개략)

| 경로 | 설명 |
|------|------|
| `public/api/pptData.json` | 보고서 본문 데이터 (axios로 로드) |
| `src/App.js` | 앱 셸·네비게이션 |
| `src/components/` | 목록, 미리보기, 표지, 차트·데이터 페이지 |
| `src/utils/downloadHelpers.js` | 다운로드·PPTX 생성 로직 |
| `src/utils/capturePages.js` | 전체 페이지 html2canvas 캡처 |
| `craco.config.js` | CRA 위 Webpack 설정 (pptxgenjs 등 브라우저 번들용 fallbacks) |

## 라이선스

`package.json`의 `private: true` 설정에 따라 비공개 프로젝트로 관리됩니다.
