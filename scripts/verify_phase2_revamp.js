const http = require('http');
const fs = require('fs');
const path = require('path');

function checkFile(relPath, tests) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ [FAIL] Missing file: ${relPath}`);
    return false;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  let allPassed = true;
  for (const { name, regex } of tests) {
    if (regex.test(content)) {
      console.log(`  ✅ [PASS] ${relPath}: ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${relPath}: Missing ${name}`);
      allPassed = false;
    }
  }
  return allPassed;
}

async function checkHttp(pathUrl, expectedType) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${pathUrl}`, (res) => {
      const cType = res.headers['content-type'] || '';
      if (res.statusCode === 200 && (!expectedType || cType.includes(expectedType))) {
        console.log(`  ✅ [PASS] HTTP GET ${pathUrl} -> 200 OK (${cType})`);
        resolve(true);
      } else {
        console.error(`  ❌ [FAIL] HTTP GET ${pathUrl} -> Status ${res.statusCode}, Content-Type: ${cType}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`  ❌ [FAIL] HTTP GET ${pathUrl} -> Network error: ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  console.log('==================================================');
  console.log('🔍 VERIFYING ENHANCED GIGW 3.0 MINISTERIAL FOOTER & SUITE');
  console.log('==================================================');

  // 1. Logo Asset Check
  const logoPath = path.join(__dirname, '..', 'frontend', 'assets', 'satark-logo.png');
  if (fs.existsSync(logoPath) && fs.statSync(logoPath).size > 1000) {
    console.log(`✅ [PASS] Logo asset exists: frontend/assets/satark-logo.png (${fs.statSync(logoPath).size} bytes)`);
  } else {
    console.error('❌ [FAIL] Logo asset missing or empty at frontend/assets/satark-logo.png');
  }

  // 2. index.html Check
  console.log('\nTesting frontend/index.html:');
  const indexPassed = checkFile('frontend/index.html', [
    { name: 'Masthead official logo image', regex: /<img[^>]+satark-logo\.png[^>]+gov-logo-img/ },
    { name: 'GFR-19A memorandum official logo image', regex: /<img[^>]+satark-logo\.png[^>]+memo-logo-img|memo-emblem[\s\S]*?satark-logo\.png/ },
    { name: 'Professional Simple Footer container', regex: /<footer[^>]+site-footer/ },
    { name: 'Ministerial Brand Column & Logo', regex: /footer-brand-col[\s\S]*?footer-gov-seal/ },
    { name: 'Policy Quick Links Navigation', regex: /footer-nav-col[\s\S]*?footer-policy-btn/ },
    { name: 'Support & Helpdesk Column', regex: /footer-contact-col[\s\S]*?1800-11-0001[\s\S]*?support\.mplads@gov\.in/ },
    { name: 'Government Policy Modal Container', regex: /id="gov-policy-modal"/ },
    { name: 'Footer Copyright & Attribution Bar', regex: /footer-bottom-row[\s\S]*?Ministry of Statistics/ }
  ]);

  // 3. style.css Check
  console.log('\nTesting frontend/style.css:');
  const cssPassed = checkFile('frontend/style.css', [
    { name: 'gov-logo-img styling', regex: /\.gov-logo-img\s*\{/ },
    { name: 'site-footer styling', regex: /\.site-footer\s*\{/ },
    { name: 'footer-main-row styling', regex: /\.footer-main-row\s*\{/ },
    { name: 'footer-brand-col styling', regex: /\.footer-brand-col\s*\{/ },
    { name: 'footer-gov-seal styling', regex: /\.footer-gov-seal\s*\{/ },
    { name: 'footer-policy-btn styling', regex: /\.footer-policy-btn\s*\{/ },
    { name: 'footer-contact-col styling', regex: /\.footer-contact-col\s*\{/ },
    { name: 'footer-bottom-row styling', regex: /\.footer-bottom-row\s*\{/ }
  ]);

  // 4. app.js Check
  console.log('\nTesting frontend/app.js:');
  const jsPassed = checkFile('frontend/app.js', [
    { name: '3D Holographic India Geospatial Boundary', regex: /INDIA_BORDER_GEO/ },
    { name: 'Regional State Audit Beacon Nodes', regex: /AUDIT_NODES/ },
    { name: 'Convergent Telemetry Flight Streams to New Delhi', regex: /streamCurves|streamPulses/ },
    { name: 'New Delhi HQ Command Center Pulsating Beacon', regex: /pulseRings/ },
    { name: '360-degree Radar Scanning Sweep Line', regex: /sweepLine/ },
    { name: 'openGovPolicyModal implementation', regex: /function openGovPolicyModal/ },
    { name: 'closeGovPolicyModal implementation', regex: /function closeGovPolicyModal/ },
    { name: 'Global exports for policy modal', regex: /window\.openGovPolicyModal\s*=\s*openGovPolicyModal/ }
  ]);

  // 5. Live HTTP Server Checks
  console.log('\nTesting Live HTTP Server:');
  const logoHttp = await checkHttp('/assets/satark-logo.png', 'image/png');
  const indexHttp = await checkHttp('/index.html', 'text/html');
  const apiHttp = await checkHttp('/api/stats', 'application/json');

  console.log('\n==================================================');
  if (indexPassed && cssPassed && jsPassed && logoHttp && indexHttp && apiHttp) {
    console.log('🎉 ALL REVISED GIGW 3.0 MINISTERIAL FOOTER TESTS PASSED (100%)!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
  }
  console.log('==================================================');
}

run();
