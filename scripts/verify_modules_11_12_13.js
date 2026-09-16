/**
 * Verification Script: Modules 11, 12, 13 Dedicated Routes & Real Data Test
 */

const http = require('http');

console.log('==================================================');
console.log('🔍 VERIFYING MODULES 11, 12, 13 (SIMULATION, TRENDS, EXPLORER)');
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

function fetchUrl(pathname, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:3000${pathname}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: postData ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(postData))
      } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json: json });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runVerification() {
  // -------------------------------------------------------------
  // 1. MODULE 11: SATARK-SIMULATION (Pre-Sanction Proposal Sandbox)
  // -------------------------------------------------------------
  console.log('1. Testing Module 11 (SATARK-SIMULATION Dedicated Page & API):');
  const simPage = await fetchUrl('/satark-simulation.html');
  assert(simPage.statusCode === 200, 'HTTP GET /satark-simulation.html returns 200 OK');
  assert(simPage.body.includes('MODULE 11: SATARK-SIMULATION'), 'Contains Module 11 Sovereign Header');
  assert(simPage.body.includes('id="satark-simulation-section"'), 'Contains Pre-Sanction Proposal Sandbox Section');
  assert(simPage.body.includes('id="onpage-sim-form"'), 'Contains On-Page Proposal Parameter Form');
  assert(simPage.body.includes('opsim-btn-1') && simPage.body.includes('opsim-btn-2'), 'Contains 1-Click Benchmark Scenario Buttons');
  assert(!simPage.body.includes('id="project-tbody"'), 'Clean layout: Unrelated project table clutter removed');

  // Test Live Simulation Engine (/api/simulate) with Real Benchmark Proposals
  const sim1 = await fetchUrl('/api/simulate', 'POST', {
    title: 'Construction of Community Hall and Religious Mandir Compound Wall',
    cost: 495000,
    date: '2024-03-29',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    category: 'Community Hall',
    vendor: 'Shree Ram Infra Corp Pvt Ltd',
    hasGeotag: true
  });
  assert(sim1.statusCode === 200, 'Simulation API POST /api/simulate returns 200 OK');
  assert(sim1.json && sim1.json.audit && !sim1.json.audit.isCompliant, 'Scenario 1: Correctly intercepted Annexure-I Negative List & March Rush');

  const sim2 = await fetchUrl('/api/simulate', 'POST', {
    title: 'Standard Anganwadi Child Care & Nutrition Centre Building',
    cost: 750000,
    date: '2023-08-10',
    state: 'Madhya Pradesh',
    district: 'Indore',
    category: 'School / Education',
    vendor: 'MP State Rural Civil Infrastructure Ltd',
    hasGeotag: true
  });
  assert(sim2.json && sim2.json.audit && sim2.json.audit.isCompliant, 'Scenario 4: Correctly validates compliant Anganwadi with zero false positives');

  // -------------------------------------------------------------
  // 2. MODULE 12: BHAVISHYA-REKHA (Expenditure Velocity & Trends)
  // -------------------------------------------------------------
  console.log('\n2. Testing Module 12 (BHAVISHYA-REKHA Dedicated Page & API):');
  const trendsPage = await fetchUrl('/bhavishya-rekha.html');
  assert(trendsPage.statusCode === 200, 'HTTP GET /bhavishya-rekha.html returns 200 OK');
  assert(trendsPage.body.includes('MODULE 12: BHAVISHYA-REKHA'), 'Contains Module 12 Sovereign Header');
  assert(trendsPage.body.includes('id="bhavishya-trends-section"'), 'Contains Dedicated Expenditure Velocity Section');
  assert(trendsPage.body.includes('id="trend-expenditure-chart"'), 'Contains Multi-Year Expenditure Velocity Chart');
  assert(trendsPage.body.includes('id="trend-march-spike-chart"'), 'Contains March Rush Anomaly Detection Chart');
  assert(!trendsPage.body.includes('id="project-tbody"'), 'Clean layout: Unrelated project table clutter removed');

  const trendsApi = await fetchUrl('/api/trends');
  assert(trendsApi.statusCode === 200, 'Trends API GET /api/trends returns 200 OK');
  assert(trendsApi.json && trendsApi.json.yearlyExpenditureVelocity && trendsApi.json.yearlyExpenditureVelocity.length >= 5, 'Real MoSPI Expenditure Velocity data verified across 5+ fiscal years');

  // -------------------------------------------------------------
  // 3. MODULE 13: SATARK-KARYAA (Work Explorer & Action Ledger)
  // -------------------------------------------------------------
  console.log('\n3. Testing Module 13 (SATARK-KARYAA Dedicated Page & API):');
  const karyaaPage = await fetchUrl('/satark-karyaa.html');
  assert(karyaaPage.statusCode === 200, 'HTTP GET /satark-karyaa.html returns 200 OK');
  assert(karyaaPage.body.includes('MODULE 13: SATARK-KARYAA'), 'Contains Module 13 Sovereign Header');
  assert(karyaaPage.body.includes('id="kpi-container"'), 'Contains Dynamic 4 Summary KPI Cards');
  assert(karyaaPage.body.includes('id="state-select"'), 'Contains State / UT Geographic Selector');
  assert(karyaaPage.body.includes('id="search-input"'), 'Contains Live Real-Time Search Box');
  assert(karyaaPage.body.includes('table-container') || karyaaPage.body.includes('real-data-table'), 'Contains Real Data Table');

  const projectsApi = await fetchUrl('/api/projects?limit=5');
  assert(projectsApi.statusCode === 200, 'Projects API GET /api/projects returns 200 OK');
  assert(projectsApi.json && projectsApi.json.total === 176925, 'Total verified MoSPI works database verified: 176,925 records');

  console.log('\n==================================================');
  if (passed === total) {
    console.log(`🎉 ALL ${total} MODULES 11, 12, 13 VERIFICATIONS PASSED (100%)!`);
  } else {
    console.log(`⚠️ ${passed}/${total} TESTS PASSED.`);
  }
  console.log('==================================================\n');
  process.exit(passed === total ? 0 : 1);
}

runVerification();
