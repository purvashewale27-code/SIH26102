const http = require('http');

console.log('==================================================');
console.log('🔍 VERIFYING INDEPENDENT FEATURE PAGES & ROUTING');
console.log('==================================================');

const pagesToTest = [
  { url: '/', file: 'index.html', pageId: 'overview', titleTag: 'MPLADS-SATARK', specialSelector: 'overview-hero-section' },
  { url: '/index.html', file: 'index.html', pageId: 'overview', titleTag: 'MPLADS-SATARK', specialSelector: 'overview-hero-section' },
  { url: '/vidhi-kavach', file: 'vidhi-kavach.html', pageId: 'vidhi-kavach', titleTag: 'VIDHI-KAVACH', specialSelector: 'SENTINEL S-01' },
  { url: '/vidhi-kavach.html', file: 'vidhi-kavach.html', pageId: 'vidhi-kavach', titleTag: 'VIDHI-KAVACH', specialSelector: 'SENTINEL S-01' },
  { url: '/punar-drishti', file: 'punar-drishti.html', pageId: 'punar-drishti', titleTag: 'PUNAR-DRISHTI', specialSelector: 'SENTINEL S-02' },
  { url: '/punar-drishti.html', file: 'punar-drishti.html', pageId: 'punar-drishti', titleTag: 'PUNAR-DRISHTI', specialSelector: 'SENTINEL S-02' },
  { url: '/artha-darpan', file: 'artha-darpan.html', pageId: 'artha-darpan', titleTag: 'ARTHA-DARPAN', specialSelector: 'SENTINEL S-03' },
  { url: '/artha-darpan.html', file: 'artha-darpan.html', pageId: 'artha-darpan', titleTag: 'ARTHA-DARPAN', specialSelector: 'SENTINEL S-03' },
  { url: '/chakra-vyuh', file: 'chakra-vyuh.html', pageId: 'chakra-vyuh', titleTag: 'CHAKRA-VYUH', specialSelector: 'chakra-graph-section' },
  { url: '/chakra-vyuh.html', file: 'chakra-vyuh.html', pageId: 'chakra-vyuh', titleTag: 'CHAKRA-VYUH', specialSelector: 'chakra-graph-section' },
  { url: '/vibhed-netra', file: 'vibhed-netra.html', pageId: 'vibhed-netra', titleTag: 'VIBHED-NETRA', specialSelector: 'SENTINEL S-05' },
  { url: '/vibhed-netra.html', file: 'vibhed-netra.html', pageId: 'vibhed-netra', titleTag: 'VIBHED-NETRA', specialSelector: 'SENTINEL S-05' },
  { url: '/sankhya-satya', file: 'sankhya-satya.html', pageId: 'sankhya-satya', titleTag: 'SANKHYA-SATYA', specialSelector: 'benford-histogram-section' },
  { url: '/sankhya-satya.html', file: 'sankhya-satya.html', pageId: 'sankhya-satya', titleTag: 'SANKHYA-SATYA', specialSelector: 'benford-histogram-section' },
  { url: '/bhu-drishti', file: 'bhu-drishti.html', pageId: 'bhu-drishti', titleTag: 'BHU-DRISHTI', specialSelector: 'bhu-drishti-map-section' },
  { url: '/bhu-drishti.html', file: 'bhu-drishti.html', pageId: 'bhu-drishti', titleTag: 'BHU-DRISHTI', specialSelector: 'bhu-drishti-map-section' },
  { url: '/samvaad', file: 'samvaad.html', pageId: 'samvaad', titleTag: 'SATARK-SAMVAAD', specialSelector: 'samvaad-copilot-card' },
  { url: '/samvaad.html', file: 'samvaad.html', pageId: 'samvaad', titleTag: 'SATARK-SAMVAAD', specialSelector: 'samvaad-copilot-card' }
];

let passCount = 0;
let failCount = 0;

function fetchUrl(pathname) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${pathname}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  for (const page of pagesToTest) {
    try {
      const res = await fetchUrl(page.url);
      const is200 = res.statusCode === 200;
      const isHtml = (res.headers['content-type'] || '').includes('text/html');
      const hasPageId = res.body.includes(`data-page="${page.pageId}"`);
      const hasTitle = res.body.includes(page.titleTag);
      const hasNavStrip = res.body.includes('class="sentinel-nav-strip"');
      const hasUtility = res.body.includes('class="national-utility-bar"');
      const hasFooter = res.body.includes('class="site-footer"');
      const hasSpecial = res.body.includes(page.specialSelector);

      if (is200 && isHtml && hasPageId && hasTitle && hasNavStrip && !hasUtility && hasFooter && hasSpecial) {
        console.log(`  ✅ [PASS] HTTP GET ${page.url.padEnd(20)} -> 200 OK | pageId="${page.pageId}" | title="${page.titleTag}" | special="${page.specialSelector}"`);
        passCount++;
      } else {
        console.error(`  ❌ [FAIL] HTTP GET ${page.url} (status=${res.statusCode}, isHtml=${isHtml}, hasPageId=${hasPageId}, hasTitle=${hasTitle}, hasSpecial=${hasSpecial}, hasNavStrip=${hasNavStrip}, hasUtility=${hasUtility}, hasFooter=${hasFooter})`);
        failCount++;
      }
    } catch (err) {
      console.error(`  ❌ [ERROR] HTTP GET ${page.url}:`, err.message);
      failCount++;
    }
  }

  console.log('\n==================================================');
  if (failCount === 0) {
    console.log(`🎉 ALL ${passCount} INDEPENDENT FEATURE PAGES VERIFIED SUCCESSFULLY (100%)!`);
    console.log('==================================================');
    process.exit(0);
  } else {
    console.error(`💥 ${failCount} PAGE VERIFICATIONS FAILED! (${passCount} passed)`);
    console.log('==================================================');
    process.exit(1);
  }
}

runTests();
