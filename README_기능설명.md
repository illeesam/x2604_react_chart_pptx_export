# 기능 상세 설명

이 문서는 **p2604_chart_ppt_export** 프로젝트의 화면 동작, 보내기 방식, 데이터 흐름, **dependencies / devDependencies** 적용 정보를 정리합니다.

---

## 1. 데이터 소스

| 항목 | 내용 |
|------|------|
| URL | 개발 서버 기준 `GET /api/pptData.json` → 실제 파일은 `public/api/pptData.json` |
| 로드 방식 | `ListPage` 마운트 시 **axios**로 비동기 로드 |
| 스키마 개요 | `reportTitle`, `generatedAt`, `charts` (page1~3, 각 4개 차트), `dataPages` (page4~7 테이블·KPI 등) |

로드 실패 시 목록 상단에 오류 메시지가 표시되고, 미리보기·다운로드는 데이터가 있을 때만 활성화됩니다.

---

## 2. 화면 구성

### 2.1 메인 (`App.js`)

- 상단 네비게이션(ReportHub 타이틀)
- 본문에 **보고서 목록**(`ListPage`)만 배치

### 2.2 보고서 목록 (`ListPage.jsx`)

- 샘플 보고서 행(`REPORT_LIST`)을 테이블로 표시(번호, 제목, 부서, 날짜, 상태)
- **미리보기**: 로드된 JSON으로 `PreviewModal` 오픈
- **형식 선택 + 내려받기**: 행마다 README / 이미지 / PDF / PPT / PPTX / HTML 중 선택 후 다운로드
  - **이미지**는 목록에서 선택 시 안내(미리보기 내 **이미지** 버튼 사용 유도)

### 2.3 미리보기 모달 (`PreviewModal.jsx`)

- **8개 탭(0~7)**: 표지(0) + 차트 페이지 1~3 + 데이터 페이지 4~7
- **현재 페이지** 기준: README, 이미지(PNG), PDF, PPT(캡처 기반 pptx), PPTX(네이티브), HTML
- **전체**: 전체 이미지(페이지별 PNG), 전체 PDF, 전체 PPT(이미지 슬라이드), 전체 PPTX(네이티브), 전체 HTML
- 일부 작업은 `capturePages.js`로 화면 밖 렌더 후 **html2canvas**로 순차 캡처하며 진행률을 표시

### 2.4 차트 페이지 (`ChartPage.jsx`)

- **Chart.js** + **react-chartjs-2**로 다음 유형을 `pptData.json`의 `type`에 매핑해 렌더링  
  line, bar, pie, doughnut, radar, polarArea, bubble, scatter, horizontalBar, stackedBar, area, mixed
- 페이지당 최대 4개 차트, 2×2 그리드

### 2.5 데이터 페이지 (`DataPage.jsx` 계열)

- page4: 경영 실적 요약(KPI, 분기별 실적)
- page5: 제품별 성과
- page6: 고객 분석
- page7: 전략·목표·이니셔티브·리스크

### 2.6 표지 (`CoverPage.jsx`)

- 보고서 제목·생성일 등 요약 표지

---

### 2.7 컴포넌트 연결 관계도

#### 트리 구조 (함수 호출 · 파라미터 포함)

```
App.js
└── ListPage.jsx
    │  axios.get('/api/pptData.json')                                        (보고서 전체 데이터 로드)
    │
    ├── <PreviewModal onClose={fn} />                                        (미리보기 모달 마운트)
    │   │  axios.get('/api/pptData.json')                                    (모달 자체 데이터 조회)
    │   │
    │   ├── <CoverPage data={data} />                                        (page 0 : 표지 렌더)
    │   ├── <ChartPage pageData={data.charts.pageN} pageNum={N} />           (page 1~3 : 차트 렌더)
    │   ├── <DataPage4 data={data.dataPages.page4} />                        (page 4 : 경영 실적)
    │   ├── <DataPage5 data={data.dataPages.page5} />                        (page 5 : 제품별 성과)
    │   ├── <DataPage6 data={data.dataPages.page6} />                        (page 6 : 고객 분석)
    │   └── <DataPage7 data={data.dataPages.page7} />                        (page 7 : 전략·목표)
    │
    │   ── 현재 탭 다운로드 (PreviewModal) ──────────────────────────────────
    │   ├── downloadReadme(data, makeFilename(src, currentPage, 'README'))   (전체 데이터 → .md 저장)
    │   ├── downloadImage(contentRef, makeFilename(src, currentPage, '이미지')) (현재 탭 캡처 → PNG 저장)
    │   ├── downloadPdf(contentRef, makeFilename(src, currentPage, 'PDF'))   (현재 탭 캡처 → PDF 저장)
    │   ├── downloadPpt(contentRef, makeFilename(src, currentPage, 'PPT'))   (현재 탭 캡처 → PPT 슬라이드)
    │   ├── downloadPptx(data, currentPage, makeFilename(src, currentPage, 'PPTX')) (현재 페이지 네이티브 PPTX)
    │   └── downloadHtml(contentRef, makeFilename(src, currentPage, 'HTML')) (현재 탭 캡처 → HTML 저장)
    │
    │   ── 전체 다운로드 (PreviewModal) ─────────────────────────────────────
    │   ├── downloadAllImages(data, src, onProg)                             (전 페이지 PNG 개별 저장)
    │   ├── downloadAllPdf(data, makeFilename(src, '전체', '전체PDF'), onProg) (전 페이지 합쳐 PDF 저장)
    │   ├── downloadAllPpt(data, makeFilename(src, '전체', '전체PPT'), onProg) (전 페이지 이미지 슬라이드 PPT)
    │   ├── downloadAllPptx(data, makeFilename(src, '전체', '전체PPTX'))      (전체 네이티브 PPTX 저장)
    │   └── downloadAllHtml(data, makeFilename(src, '전체', '전체HTML'), onProg) (전 페이지 합쳐 HTML 저장)
    │
    └── ── 목록 다운로드 (ListPage) ─────────────────────────────────────────
        ├── downloadReadme(reportData, makeFilename(src, reportId, 'README')) (전체 데이터 → .md 저장)
        ├── downloadAllPdf(reportData, makeFilename(src, reportId, 'PDF'))    (전 페이지 합쳐 PDF 저장)
        ├── downloadAllPpt(reportData, makeFilename(src, reportId, 'PPT'))    (전 페이지 이미지 슬라이드 PPT)
        ├── downloadAllPptx(reportData, makeFilename(src, reportId, 'PPTX')) (전체 네이티브 PPTX 저장)
        └── downloadAllHtml(reportData, makeFilename(src, reportId, 'HTML')) (전 페이지 합쳐 HTML 저장)

downloadHelpers.js
└── capturePages.js
    └── captureAllPages(data, onProgress)                                    (8 페이지 오프스크린 순차 캡처)
        └── getPageElement(data, pageNum)                                    (페이지 번호 → JSX 반환)
            ├── <CoverPage data={data} />                                    (page 0)
            ├── <ChartPage pageData={data.charts.pageN} pageNum={N} />       (page 1~3)
            └── <DataPage4~7 data={data.dataPages.pageN} />                  (page 4~7)
```

#### 컴포넌트 · 모듈 역할 표

| 컴포넌트 / 모듈 | 유형 | 직접 사용처 | 사용하는 것 (자식·의존) | 주요 역할 |
|---|---|---|---|---|
| `App.js` | 컴포넌트 | — (루트) | `<ListPage />` | 앱 진입점, 공통 네비게이션 렌더 |
| `ListPage.jsx` | 컴포넌트 | `App.js` | `<PreviewModal onClose>`, `downloadHelpers` | 보고서 목록 테이블, axios 로드, 목록 다운로드 |
| `PreviewModal.jsx` | 컴포넌트 | `ListPage` | `<CoverPage data>`, `<ChartPage pageData pageNum>`, `<DataPageN data>`, `downloadHelpers` | 미리보기 모달, **자체 axios 로드**, 탭·내비, 다운로드 |
| `CoverPage.jsx` | 컴포넌트 | `PreviewModal`, `capturePages` | — | `data` prop 받아 표지 슬라이드 렌더 |
| `ChartPage.jsx` | 컴포넌트 | `PreviewModal`, `capturePages` | `chart.js`, `react-chartjs-2` | `pageData`, `pageNum` prop 받아 차트 2×2 렌더 (page1~3) |
| `DataPage.jsx` | 컴포넌트 | `PreviewModal`, `capturePages` | — | `data` prop 받아 KPI·표·전략 렌더 (page4~7) |
| `downloadHelpers.js` | 유틸 | `ListPage`, `PreviewModal` | `captureAllPages()`, `html2canvas`, `jspdf`, `pptxgenjs` | 모든 다운로드 함수 제공 (`makeFilename`포함) |
| `capturePages.js` | 유틸 | `downloadHelpers` | `createRoot()`, `getPageElement()`, `html2canvas` | `captureAllPages(data, onProgress)` — 오프스크린 순차 캡처 |

#### 함수 호출 관계 상세 표

| 호출 위치 | 함수(파라미터) | 의미 |
|---|---|---|
| `ListPage` | `axios.get('/api/pptData.json')` | 화면 로드 시 보고서 데이터 자동 조회 |
| `ListPage` | `<PreviewModal onClose={fn} />` | 미리보기 버튼 클릭 시 모달 마운트 |
| `ListPage` | `downloadReadme(reportData, makeFilename(src, id, 'README'))` | README .md 저장 |
| `ListPage` | `downloadAllPdf(reportData, makeFilename(src, id, 'PDF'))` | 전 페이지 합쳐 PDF 저장 |
| `ListPage` | `downloadAllPpt(reportData, makeFilename(src, id, 'PPT'))` | 전 페이지 이미지 슬라이드 PPT 저장 |
| `ListPage` | `downloadAllPptx(reportData, makeFilename(src, id, 'PPTX'))` | 전체 네이티브 PPTX 저장 |
| `ListPage` | `downloadAllHtml(reportData, makeFilename(src, id, 'HTML'))` | 전 페이지 합쳐 HTML 저장 |
| `PreviewModal` | `axios.get('/api/pptData.json')` | 모달 마운트 시 자체 데이터 조회 |
| `PreviewModal` | `<CoverPage data={data} />` | 표지(page 0) 렌더 |
| `PreviewModal` | `<ChartPage pageData={data.charts.pageN} pageNum={N} />` | 차트(page 1~3) 렌더 |
| `PreviewModal` | `<DataPage4~7 data={data.dataPages.pageN} />` | 데이터(page 4~7) 렌더 |
| `PreviewModal` | `downloadReadme(data, makeFilename(src, currentPage, 'README'))` | 전체 데이터 README 저장 |
| `PreviewModal` | `downloadImage(contentRef, makeFilename(src, currentPage, '이미지'))` | 현재 탭 DOM 캡처 → PNG 저장 |
| `PreviewModal` | `downloadPdf(contentRef, makeFilename(src, currentPage, 'PDF'))` | 현재 탭 캡처 → PDF 저장 |
| `PreviewModal` | `downloadPpt(contentRef, makeFilename(src, currentPage, 'PPT'))` | 현재 탭 캡처 → 이미지 슬라이드 PPT |
| `PreviewModal` | `downloadPptx(data, currentPage, makeFilename(src, currentPage, 'PPTX'))` | 현재 페이지 네이티브 PPTX 저장 |
| `PreviewModal` | `downloadHtml(contentRef, makeFilename(src, currentPage, 'HTML'))` | 현재 탭 캡처 → HTML 저장 |
| `PreviewModal` | `downloadAllImages(data, src, onProg)` | 전 페이지 PNG 개별 저장 + 진행률 |
| `PreviewModal` | `downloadAllPdf(data, makeFilename(src, '전체', '전체PDF'), onProg)` | 전 페이지 합쳐 PDF 저장 + 진행률 |
| `PreviewModal` | `downloadAllPpt(data, makeFilename(src, '전체', '전체PPT'), onProg)` | 전 페이지 이미지 슬라이드 PPT + 진행률 |
| `PreviewModal` | `downloadAllPptx(data, makeFilename(src, '전체', '전체PPTX'))` | 전체 네이티브 PPTX 저장 |
| `PreviewModal` | `downloadAllHtml(data, makeFilename(src, '전체', '전체HTML'), onProg)` | 전 페이지 합쳐 HTML 저장 + 진행률 |
| `downloadHelpers` | `captureAllPages(data, onProgress)` | 8 페이지 오프스크린 순차 캡처, canvas 배열 반환 |
| `capturePages` | `getPageElement(data, pageNum)` | 페이지 번호 → 렌더할 JSX 컴포넌트 반환 |
| `capturePages` | `createRoot(container).render(element)` | 오프스크린 DOM에 컴포넌트 마운트 |
| `capturePages` | `html2canvas(container, { scale:1.8, … })` | 마운트된 DOM → Canvas 캡처 |

---

## 3. 보내기 종류별 동작

| 형식 | 구현 요약 | 비고 |
|------|-----------|------|
| **README** | JSON을 마크다운 문자열로 직렬화 후 `.md` Blob 다운로드 | 차트 목록·데이터 테이블 요약 |
| **이미지** | `html2canvas`로 현재 미리보기 영역 캡처 → PNG | scale 2 |
| **PDF** | 단일 영역 캡처 → **jsPDF** 가로 A4; 세로 초과 시 슬라이스 후 다페이지 | 목록「전체 PDF」는 8페이지 캡처 후 1개 PDF |
| **PPT** (라벨) | 캡처 이미지를 **pptxgenjs** 한 슬라이드에 풀사이즈 | 확장자는 `.pptx` (이미지 슬라이드) |
| **PPTX** | **pptxgenjs** 네이티브 `addChart` / `addTable` / 도형·텍스트로 슬라이드 구성 | PowerPoint에서 차트·표 편집 가능 |
| **HTML** | 캡처 PNG를 data URL로 임베드한 단일 HTML 파일 | 전체 HTML은 페이지별 섹션 |

파일명은 `makeFilename(출처, id, 라벨)`로 타임스탬프를 붙여 생성합니다.

### 3.1 전체 페이지 캡처 (`capturePages.js`)

- 보이지 않는 DOM에 React 루트를 만들어 페이지별로 마운트
- 차트 페이지는 렌더 안정화를 위해 대기 시간을 길게 설정 후 `html2canvas` (scale 1.8)
- **총 8장**: 표지 + 차트 3 + 데이터 4

---

## 4. 빌드·번들 설정 (`craco.config.js`)

**pptxgenjs** 등이 브라우저 번들에서 Node 전용 모듈을 참조할 수 있어, CRACO로 Webpack `resolve.fallback`을 조정하고 `node:` 스킴을 치환하는 플러그인을 추가합니다.

---

## 5. Dependencies (라이브러리 적용 정보)

`package.json`의 **dependencies** 기준이며, 프로젝트 내에서의 **역할**을 요약합니다.

| 패키지 | 버전 (package.json) | 적용 내용 |
|--------|---------------------|-----------|
| **react** | ^19.2.4 | UI 컴포넌트·훅 |
| **react-dom** | ^19.2.4 | DOM 렌더링; `capturePages`에서 `createRoot`로 오프스크린 렌더 |
| **react-scripts** | 5.0.1 | Create React App 기본 스크립트·번들(실행은 CRACO로 래핑) |
| **axios** | ^1.14.0 | `pptData.json` HTTP 로드 |
| **chart.js** | ^4.5.1 | 차트 엔진; 스케일·플러그인 등록 후 각 차트 타입에 사용 |
| **react-chartjs-2** | ^5.3.1 | Chart.js를 React 컴포넌트(Line, Bar, Pie 등)로 래핑 |
| **html2canvas** | ^1.4.1 | DOM → Canvas → PNG / PDF / PPT용 래스터 캡처 |
| **jspdf** | ^4.2.1 | PDF 생성·이미지 삽입·다페이지 분할 |
| **pptxgenjs** | ^4.0.1 | PPTX 작성: 이미지 전체 슬라이드, 네이티브 차트·표·도형 |

---

## 6. DevDependencies

| 패키지 | 버전 (package.json) | 적용 내용 |
|--------|---------------------|-----------|
| **@craco/craco** | ^7.1.0 | `craco start` / `craco build`로 CRA Webpack 설정 확장 (`craco.config.js`) |

---

## 7. npm 스크립트

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| `start` | `craco start` | 개발 서버 |
| `build` | `craco build` | 프로덕션 빌드 |
| `test` | `craco test` | 테스트 러너 |

---

## 8. 참고

- 목록의 보고서 메타데이터(`REPORT_LIST`)는 데모용 하드코딩이며, 실제 본문은 모두 `pptData.json` 한 세트를 공유합니다.
- PPTX 네이티브 차트 중 일부 타입(예: polarArea)은 라이브러리 제약에 맞춰 맵핑·폴백이 있을 수 있습니다(`downloadHelpers.js` 내 `CHART_TYPE_MAP`, try/catch 폴백).
