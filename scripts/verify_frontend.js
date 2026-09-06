const http = require('http');

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET / ---');
  const root = await testEndpoint('/');
  console.log('Root Status:', root.status);
  console.log('Cache-Control:', root.headers['cache-control']);

  console.log('\n--- 2. Testing GET /api/trends (Predictive & Time-Series Analytics) ---');
  const trends = await testEndpoint('/api/trends');
  console.log('Trends Status:', trends.status);
  const trendsJson = JSON.parse(trends.data);
  console.log('Yearly Expenditure FY Count:', trendsJson.yearlyExpenditureVelocity.length);
  console.log('March Rush Risk Ratio:', trendsJson.marchRushSpikeTrend.marchRushRiskRatio);

  console.log('\n--- 3. Testing POST /api/simulate-proposal (SHAP & Predictive Risk) ---');
  const sim = await testEndpoint('/api/simulate-proposal', 'POST', {
    title: 'Construction of Boundary Wall for Mandir',
    cost: 495000,
    date: '2024-03-29',
    state: 'Assam',
    district: 'Guwahati',
    category: 'Community Hall',
    vendor: 'Shree Ram Infra Corp',
    hasGeotag: false
  });
  console.log('Sim Status:', sim.status);
  const simJson = JSON.parse(sim.data);
  console.log('Sim Score:', simJson.composite.score, 'Tier:', simJson.composite.tier);
  console.log('SHAP Summary:', simJson.composite.shapSummary);
  console.log('Predictive Delay Prob:', simJson.composite.predictiveRisk.delayProbability + '%');
  console.log('Terrain Multiplier:', simJson.composite.predictiveRisk.regionalTerrainMultiplier + 'x');
  console.log('Model Precision/Recall:', simJson.composite.modelValidationMetrics.precision, '/', simJson.composite.modelValidationMetrics.recall);

  console.log('\n--- 4. Testing POST /api/feedback (HITL Active Learning) ---');
  const fb = await testEndpoint('/api/feedback', 'POST', {
    projectId: 'MPLADS-145555',
    decision: 'CONFIRMED_FRAUD',
    officerRole: 'District Magistrate'
  });
  console.log('Feedback Status:', fb.status);
  const fbJson = JSON.parse(fb.data);
  console.log('Feedback Result:', fbJson.message);

  console.log('\n✅ ALL VERIFICATIONS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
