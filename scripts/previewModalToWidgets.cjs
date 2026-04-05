/**
 * 레거시 previewModalData → widgets 배열 형식 일회 변환 (이미 widgets 면 스킵)
 * 실행: node scripts/previewModalToWidgets.cjs
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'public', 'api', 'previewModalData.json');
const raw = fs.readFileSync(srcPath, 'utf8');
const p = JSON.parse(raw);

if (Array.isArray(p.widgets) && p.widgets.length > 0) {
  console.log('already widgets format, skip');
  process.exit(0);
}

function sortKeys(keys) {
  return [...keys].sort((a, b) => {
    const na = +(String(a).match(/\d+/) || [0])[0];
    const nb = +(String(b).match(/\d+/) || [0])[0];
    return na - nb;
  });
}

const DATA_PAGE_TYPE = {
  page4: 'DataPage4',
  page5: 'DataPage5',
  page6: 'DataPage6',
  page7: 'DataPage7',
};

const { reportTitle, generatedAt, previewNav, charts, dataPages } = p;
const widgets = [];

widgets.push({
  widgetType: 'CoverPage',
  widgetAttr: {
    cover: previewNav.cover,
    chartTabIcon: previewNav.chartTabIcon,
    dataTabIcon: previewNav.dataTabIcon,
    chartPageLabels: previewNav.chartPageLabels,
    dataPageLabels: previewNav.dataPageLabels,
  },
  widgetData: null,
});

sortKeys(Object.keys(charts)).forEach((key, i) => {
  widgets.push({
    widgetType: 'Chart01Widget',
    widgetAttr: {
      pageKey: key,
      chartNum: i + 1,
      tabLabel: previewNav.chartPageLabels?.[key],
    },
    widgetData: charts[key],
  });
});

sortKeys(Object.keys(dataPages)).forEach((key) => {
  widgets.push({
    widgetType: DATA_PAGE_TYPE[key] || 'DataPage4',
    widgetAttr: {
      pageKey: key,
      tabLabel: previewNav.dataPageLabels?.[key],
    },
    widgetData: dataPages[key],
  });
});

const out = { reportTitle, generatedAt, widgets };
fs.writeFileSync(srcPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log('wrote', widgets.length, 'widgets to', srcPath);
