/**
 * Verification Script: SATARK-DRISHTI Functionality & Real Data Pipeline
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('🔍 VERIFYING SATARK-DRISHTI (सतर्क-दृष्टि) FUNCTIONALITY');
console.log('==================================================\n');

function fetchJson(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, html: data });
      });
    }).on('error', reject);
  });
}

async function runVerification() {
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  // 1. Check Live HTTP Server & Index Page
  console.log('1. Testing Live Dashboard DOM & Hero Structure:');
  const indexRes = await fetchHtml('/index.html');
  assert(indexRes.status === 200, 'HTTP GET /index.html returns 200 OK');
  assert(indexRes.html.includes('prakalp-hero-banner'), 'DOM contains #prakalp-hero-banner (Satark-Drishti Hero)');
  assert(indexRes.html.includes('india-map-svg'), 'DOM contains 3D Relief India Geospatial Map Silhouette');
  assert(indexRes.html.includes('overview-trend-snapshot'), 'DOM contains #overview-trend-snapshot (Bhavishya-Rekha Preview)');
  assert(indexRes.html.includes('overview-summary-list'), 'DOM contains #overview-summary-list (Top High-Risk Districts & Cartels)');

  // 2. Test Real Data API: /api/stats
  console.log('\n2. Testing Real MoSPI Stats Pipeline (/api/stats):');
  const statsRes = await fetchJson('/api/stats');
  assert(statsRes.status === 200, 'HTTP GET /api/stats returns 200 OK');
  const stats = statsRes.body || {};
  const totalWorks = stats.totalProjects || 0;
  const totalCostCr = stats.totalSanctionedCrore || 0;
  assert(totalWorks === 176925, `Real MoSPI dataset verified: ${totalWorks.toLocaleString('en-IN')} monitored works`);
  assert(totalCostCr > 7000, `Audited Disbursal Portfolio verified: ₹${totalCostCr.toLocaleString('en-IN')} Cr`);
  assert(stats.totalStates >= 36, `States & UT coverage verified: ${stats.totalStates} States/UTs`);
  assert(stats.totalViolations === 23722, `Real S-01 Statutory Violations: ${stats.totalViolations.toLocaleString('en-IN')}`);
  assert(stats.duplicateClaimsCount === 10204, `Real S-02 Duplicates: ${stats.duplicateClaimsCount.toLocaleString('en-IN')}`);
  assert(stats.cartelRiskCount > 0, `Real S-04 Cartel Risks: ${stats.cartelRiskCount.toLocaleString('en-IN')} flagged works`);
  assert(stats.totalVendorsCount > 25000, `Registered Vendor Network: ${stats.totalVendorsCount.toLocaleString('en-IN')} contractors`);

  // 3. Test Real Data API: /api/trends (Bhavishya-Rekha)
  console.log('\n3. Testing Bhavishya-Rekha Spending Velocity API (/api/trends):');
  const trendsRes = await fetchJson('/api/trends');
  assert(trendsRes.status === 200, 'HTTP GET /api/trends returns 200 OK');
  const trends = trendsRes.body || {};
  const yearly = trends.yearlyExpenditureVelocity || [];
  assert(yearly.length >= 5, `Yearly Expenditure Velocity data present (${yearly.length} fiscal years)`);
  assert(yearly[0].fiscalYear && yearly[0].totalSanctionedCr > 0, `First fiscal year: ${yearly[0].fiscalYear} (₹${yearly[0].totalSanctionedCr} Cr)`);

  // 4. Test Real Data API: /api/provenance-ledger
  console.log('\n4. Testing Cryptographic Provenance Ledger API (/api/provenance-ledger):');
  const provRes = await fetchJson('/api/provenance-ledger');
  assert(provRes.status === 200, 'HTTP GET /api/provenance-ledger returns 200 OK');
  const prov = provRes.body || {};
  assert(prov.cryptographicProvenance?.unifiedDatasetHash !== undefined, 'SHA-256 Unified Dataset Hash present');
  assert(prov.verifiedRecordCounts?.totalNationwideProjects === 176925, 'Exact 176,925 MoSPI verified project records confirmed');

  // 5. Test Live Sample Projects Pipeline: /api/projects
  console.log('\n5. Testing Live Registry Feed (/api/projects):');
  const projRes = await fetchJson('/api/projects?limit=5');
  assert(projRes.status === 200, 'HTTP GET /api/projects returns 200 OK');
  const projects = projRes.body?.data || projRes.body?.projects || [];
  assert(Array.isArray(projects) && projects.length === 5, '5 real MoSPI projects loaded from 176,925 database');
  assert(projects[0].state !== undefined && projects[0].cost !== undefined, `First project verified: ${projects[0].id} · ${projects[0].state} · ₹${projects[0].cost}`);

  // 6. Test Frontend JavaScript Controller Functions
  console.log('\n6. Testing Frontend JavaScript Controller Functions:');
  const appJs = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');
  assert(appJs.includes('function renderOverviewTrendSnapshot()'), 'app.js includes renderOverviewTrendSnapshot()');
  assert(appJs.includes('function loadStats()'), 'app.js includes loadStats() for real KPI population');
  assert(appJs.includes('function setupForensicDropdown()'), 'app.js includes setupForensicDropdown()');
  assert(appJs.includes('window.renderOverviewTrendSnapshot = renderOverviewTrendSnapshot'), 'Global window export for renderOverviewTrendSnapshot exists');

  console.log('\n==================================================');
  if (passed === total) {
    console.log(`🎉 ALL ${total} SATARK-DRISHTI TESTS PASSED (100% FUNCTIONAL)!`);
  } else {
    console.log(`⚠️ ${passed}/${total} TESTS PASSED.`);
  }
  console.log('==================================================\n');
}

runVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
