const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('🔍 VERIFYING CHAKRA-VYUH PROCUREMENT MATRIX REVAMP');
console.log('==================================================');

const appJsPath = path.join(__dirname, '../frontend/app.js');
const chakraPath = path.join(__dirname, '../backend/ml/chakra_vyuh.js');
const styleCssPath = path.join(__dirname, '../frontend/style.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const chakraJs = fs.readFileSync(chakraPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Check frontend/app.js renderFlowGraph
console.log('\nTesting frontend/app.js:');
assert(appJs.includes('function renderFlowGraph(graphData, svg)'), 'renderFlowGraph function exists');
assert(appJs.includes('const maxRows = Math.max(agencies.length, vendors.length, 3);'), 'Dynamic maxRows calculation');
assert(appJs.includes('const canvasHeight = Math.max(460,'), 'Dynamic canvasHeight calculation with min 460px');
assert(appJs.includes('svg.setAttribute(\'viewBox\', `0 0 ${width} ${canvasHeight}`);'), 'viewBox uses dynamic canvasHeight');
assert(appJs.includes('STAGE 1 CONDUITS: MP (Col 1) ──► IMPLEMENTING AGENCIES (Col 2)'), 'Dedicated Stage 1 conduits (MP -> IA)');
assert(appJs.includes('STAGE 2 CONDUITS: IMPLEMENTING AGENCIES (Col 2) ──► CONTRACTORS (Col 3)'), 'Dedicated Stage 2 conduits (IA -> Vendor)');
assert(appJs.includes('Math.abs(y1 - y2) < 2'), 'Horizontal straight alignment for matched agency-vendor pairs');
assert(appJs.includes('link-stage1 link-from-'), 'Stage 1 link classes present');
assert(appJs.includes('link-stage2 link-from-'), 'Stage 2 link classes present');

// 2. Check backend/ml/chakra_vyuh.js
console.log('\nTesting backend/ml/chakra_vyuh.js:');
assert(chakraJs.includes('vendorAgencies: new Map()'), 'mpRecord tracks vendor-to-agency voucher relationships');
assert(chakraJs.includes('awardingAgency: awardingAgency'), 'vendor node outputs awardingAgency');
assert(chakraJs.includes('source: awardingAgency || mpRec.mpName'), 'links route from awarding agency to vendor');

// 3. Check frontend/style.css
console.log('\nTesting frontend/style.css:');
assert(styleCss.includes('.network-svg'), '.network-svg rule exists');
assert(styleCss.includes('min-height: 440px'), '.network-svg has min-height 440px');

// 4. Test Live Backend API
console.log('\nTesting Live Backend API (/api/cartel-graph):');
fetch('http://localhost:3000/api/cartel-graph?mp=Adv%20Adoor%20Prakash')
  .then(res => res.json())
  .then(data => {
    assert(data.mpName === 'Adv Adoor Prakash', `Correct MP returned: ${data.mpName}`);
    assert(data.nodes.length >= 7, `All nodes present (count=${data.nodes.length}): MP + 3 Agencies + 3 Vendors`);
    
    const agencies = data.nodes.filter(n => n.type === 'agency');
    const vendors = data.nodes.filter(n => n.type === 'vendor');
    
    assert(agencies.length === 3, `3 Agencies present: ${agencies.map(a => a.id).join(', ')}`);
    assert(vendors.length === 3, `3 Vendors present: ${vendors.map(v => v.id).join(', ')}`);
    
    const allumina = vendors.find(v => v.id === 'allumina electronics');
    assert(allumina && allumina.awardingAgency === 'KEL KUNDARA', 'allumina electronics awarded by KEL KUNDARA');
    
    const monopolyLink = data.links.find(l => l.source === 'KEL KUNDARA' && l.target === 'allumina electronics');
    assert(monopolyLink && monopolyLink.amount.includes('97%'), `Direct Stage 2 link from KEL KUNDARA to allumina electronics: ${monopolyLink ? monopolyLink.amount : 'missing'}`);
    
    console.log('\n==================================================');
    if (failCount === 0) {
      console.log(`🎉 ALL ${passCount} CHAKRA-VYUH MATRIX TESTS PASSED (100%)!`);
      console.log('==================================================');
      process.exit(0);
    } else {
      console.error(`💥 ${failCount} TESTS FAILED! (${passCount} passed)`);
      console.log('==================================================');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Failed to fetch from live server:', err);
    process.exit(1);
  });
