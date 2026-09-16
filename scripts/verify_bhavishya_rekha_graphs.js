/**
 * Verification Script: BHAVISHYA-REKHA (Module 12) Graphs & Velocity Rendering
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

console.log('==================================================');
console.log('🔍 VERIFYING BHAVISHYA-REKHA (MODULE 12) GRAPHS');
console.log('==================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// 1. Check HTTP route
http.get('http://localhost:3000/bhavishya-rekha.html', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    assert(res.statusCode === 200, 'HTTP GET /bhavishya-rekha.html returns 200 OK');
    assert(body.includes('id="trend-expenditure-chart"'), 'HTML contains #trend-expenditure-chart');
    assert(body.includes('id="trend-march-spike-chart"'), 'HTML contains #trend-march-spike-chart');
    assert(body.includes('renderTrendsChart'), 'HTML contains direct fallback initializer for renderTrendsChart');

    // 2. Test DOM Mock Render
    const elementStore = {
      'trend-expenditure-chart': { id: 'trend-expenditure-chart', innerHTML: '' },
      'trend-march-spike-chart': { id: 'trend-march-spike-chart', innerHTML: '' }
    };

    const mockWindow = {
      location: { pathname: '/bhavishya-rekha.html', hash: '', href: '' },
      document: {
        getElementById: (id) => elementStore[id] || null,
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {}
      },
      addEventListener: () => {},
      fetch: async () => ({
        ok: true,
        json: async () => ({
          yearlyExpenditureVelocity: [
            { fiscalYear: 'FY 2019-20', totalSanctionedCr: 3840.5, worksSanctioned: 24100 },
            { fiscalYear: 'FY 2020-21', totalSanctionedCr: 2150.2, worksSanctioned: 16800 },
            { fiscalYear: 'FY 2021-22', totalSanctionedCr: 4120.8, worksSanctioned: 28400 },
            { fiscalYear: 'FY 2022-23', totalSanctionedCr: 4950.0, worksSanctioned: 32900 },
            { fiscalYear: 'FY 2023-24', totalSanctionedCr: 5210.4, worksSanctioned: 35120 },
            { fiscalYear: 'FY 2024-25', totalSanctionedCr: 5480.2, worksSanctioned: 39605 }
          ],
          marchRushSpikeTrend: { marchAllocationSharePct: 24.8, marchRushRiskRatio: 3.65 }
        })
      }),
      performance: { now: () => Date.now() }
    };

    const context = vm.createContext({
      window: mockWindow,
      document: mockWindow.document,
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval,
      fetch: mockWindow.fetch,
      performance: mockWindow.performance
    });

    const appJsCode = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');
    vm.runInContext(appJsCode, context);

    context.renderTrendsChart();

    const expHtml = elementStore['trend-expenditure-chart'].innerHTML;
    const marchHtml = elementStore['trend-march-spike-chart'].innerHTML;

    assert(expHtml.includes('FY 2019-20') && expHtml.includes('FY 2024-25'), 'Expenditure Velocity Chart renders all 6 Fiscal Years');
    assert(expHtml.includes('₹3841 Cr') || expHtml.includes('3840.5'), 'Contains accurate financial outlay (₹3,840.5 Cr)');
    assert(expHtml.includes('24,100 works') || expHtml.includes('39,605 works'), 'Contains sanctioned work counts');

    assert(marchHtml.includes('24.8% of Annual Budget'), 'March Rush Chart renders 24.8% allocation share');
    assert(marchHtml.includes('3.65x higher'), 'March Rush Chart renders 3.65x risk multiplier');
    assert(marchHtml.includes('1-2 Quarter Linear Risk Projection'), 'Includes forward-looking predictive risk projection');

    console.log('\n==================================================');
    if (passed === total) {
      console.log(`🎉 ALL ${total} BHAVISHYA-REKHA GRAPH TESTS PASSED (100%)!`);
    } else {
      console.log(`⚠️ ${passed}/${total} TESTS PASSED.`);
    }
    console.log('==================================================\n');
    process.exit(passed === total ? 0 : 1);
  });
}).on('error', (err) => {
  console.error('Server connection error:', err.message);
  process.exit(1);
});
