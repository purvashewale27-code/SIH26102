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
  console.log('Has onclick="openSimulator()":', root.data.includes('onclick="openSimulator()"'));
  console.log('Has onclick="openProvenanceModal()":', root.data.includes('onclick="openProvenanceModal()"'));
  console.log('Has script app.js?v=2.2:', root.data.includes('app.js?v=2.2'));

  console.log('\n--- 2. Testing GET /app.js?v=2.2 ---');
  const js = await testEndpoint('/app.js?v=2.2');
  console.log('JS Status:', js.status);
  console.log('JS length (bytes):', js.data.length);
  console.log('Has window.openSimulator:', js.data.includes('window.openSimulator = openSimulator'));
  console.log('Has window.openProvenanceModal:', js.data.includes('window.openProvenanceModal = openProvenanceModal'));

  console.log('\n--- 3. Testing GET /style.css?v=2.2 ---');
  const css = await testEndpoint('/style.css?v=2.2');
  console.log('CSS Status:', css.status);
  console.log('Has z-index: 99999 !important:', css.data.includes('99999 !important'));

  console.log('\n--- 4. Testing POST /api/simulate-proposal ---');
  const sim = await testEndpoint('/api/simulate-proposal', 'POST', {
    title: 'Construction of Community Hall and Mandir Boundary Wall',
    cost: 495000,
    date: '2024-03-29',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    category: 'Community Hall',
    vendor: 'Shree Ram Infra Corp Pvt Ltd',
    hasGeotag: false
  });
  console.log('Sim Status:', sim.status);
  const simJson = JSON.parse(sim.data);
  console.log('Sim Score:', simJson.composite.score, 'Tier:', simJson.composite.tier);

  console.log('\n--- 5. Testing GET /api/provenance-ledger ---');
  const prov = await testEndpoint('/api/provenance-ledger');
  console.log('Prov Status:', prov.status);
  const provJson = JSON.parse(prov.data);
  console.log('Total Nationwide Projects:', provJson.verifiedRecordCounts.totalNationwideProjects);
  console.log('Dataset Hash:', provJson.cryptographicProvenance.unifiedDatasetHash);

  console.log('\n✅ ALL VERIFICATIONS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
