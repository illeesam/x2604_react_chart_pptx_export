/**
 * previewModalData.json — Chart/Data widgetData 에 layoutType + areas(areaNo) 부여
 * 실행: node scripts/addWidgetLayouts.cjs
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'api', 'previewModalData.json');
const deck = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function sortChartKeysFromWidget(wd) {
  return Object.keys(wd)
    .filter((k) => /^chart\d+$/.test(k))
    .sort((a, b) => Number(a.replace('chart', '')) - Number(b.replace('chart', '')));
}

for (const w of deck.widgets || []) {
  if (w.widgetType === 'Chart01Widget' && w.widgetData && !w.widgetData.areas) {
    const wd = w.widgetData;
    const keys = sortChartKeysFromWidget(wd);
    const n = keys.length;
    const areas = {};
    keys.forEach((k, i) => {
      areas[String(i + 1)] = wd[k];
    });
    const layoutType = n > 4 ? 'grid2x3' : 'grid2x2';
    w.widgetData = {
      layoutType,
      title: wd.title,
      areas,
    };
  }

  const pk = w.widgetAttr?.pageKey;
  const isDataWidget =
    w.widgetType === 'Data01Widget' ||
    w.widgetType === 'DataPage4' ||
    w.widgetType === 'DataPage5' ||
    w.widgetType === 'DataPage6' ||
    w.widgetType === 'DataPage7';

  if (isDataWidget && w.widgetData && !w.widgetData.areas) {
    const d = w.widgetData;
    if (pk === 'page1') {
      w.widgetData = {
        layoutType: 'page1_stack',
        title: d.title,
        areas: {
          1: { summary: d.summary },
          2: { quarterlyData: d.quarterlyData },
        },
      };
    } else if (pk === 'page2') {
      w.widgetData = {
        layoutType: 'page2_single',
        title: d.title,
        areas: { 1: { products: d.products } },
      };
    } else if (pk === 'page3') {
      w.widgetData = {
        layoutType: 'page3_stack',
        title: d.title,
        areas: {
          1: {
            totalCustomers: d.totalCustomers,
            newCustomers: d.newCustomers,
            churnedCustomers: d.churnedCustomers,
            nps: d.nps,
            csat: d.csat,
          },
          2: { segments: d.segments },
        },
      };
    } else if (pk === 'page4') {
      w.widgetData = {
        layoutType: 'page4_stack',
        title: d.title,
        areas: {
          1: { targets: d.targets },
          2: { initiatives: d.initiatives },
          3: { risks: d.risks },
        },
      };
    }
  }
}

fs.writeFileSync(filePath, `${JSON.stringify(deck, null, 2)}\n`, 'utf8');
console.log('updated layouts in', filePath);
