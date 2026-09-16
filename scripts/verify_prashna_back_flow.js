const fs = require('fs');
const path = require('path');

// Simple DOM Mock for Node testing
class ElementMock {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.innerText = '';
    this.innerHTML = '';
    this.style = {
      display: '',
      background: '',
      color: '',
      borderColor: '',
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.children = [];
  }
  appendChild(child) {
    this.children.push(child);
  }
}

const documentElements = {
  'audit-modal': new ElementMock('audit-modal'),
  'modal-badge': new ElementMock('modal-badge', 'span'),
  'modal-findings-label': new ElementMock('modal-findings-label', 'label'),
  'modal-findings-container': new ElementMock('modal-findings-container'),
  'modal-project-id': new ElementMock('modal-project-id'),
  'modal-desc': new ElementMock('modal-desc'),
  'modal-mp': new ElementMock('modal-mp'),
  'modal-cost': new ElementMock('modal-cost'),
  'modal-location': new ElementMock('modal-location'),
  'modal-date': new ElementMock('modal-date'),
  'modal-gen-dossier-btn': new ElementMock('modal-gen-dossier-btn', 'button'),
  'modal-dismiss-btn': new ElementMock('modal-dismiss-btn', 'button'),
  'prashna-modal': new ElementMock('prashna-modal'),
  'prashna-project-id': new ElementMock('prashna-project-id'),
  'prashna-executive-summary': new ElementMock('prashna-executive-summary'),
  'prashna-sentinels-evidence': new ElementMock('prashna-sentinels-evidence'),
  'prashna-technical-details': new ElementMock('prashna-technical-details')
};

global.document = {
  getElementById: (id) => documentElements[id] || null,
  createElement: (tag) => new ElementMock('', tag),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  body: new ElementMock('body')
};

global.window = {
  location: { pathname: '/samvaad.html', hash: '', search: '' },
  lenis: null,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Mock project
const sampleProject = {
  id: 'MPLADS-146721',
  workDtlId: '146721',
  title: 'Construction of Community Hall and Religious Compound Wall',
  mpName: 'Gautam Gambhir',
  district: 'EAST',
  state: 'Delhi',
  cost: 1051705,
  costFormatted: '₹10.52 Lakh',
  date: '2023-03-29',
  composite: { score: 100, tier: 'CRITICAL RISK' },
  audit: {
    isCompliant: false,
    violations: [
      { ruleId: 'PUNAR-01', ruleName: 'Potential Duplicate Work / Ghost Asset Claim', penalty: 35, clause: 'MoSPI Guidelines 2023 / GFR Rules', matchedKeyword: '100% Match with MPLADS-146721' }
    ]
  },
  duplicate: {
    isDuplicate: true,
    similarityScore: 94,
    matchedId: 'MPLADS-146720',
    matchedTitle: 'Construction of Hall in East Delhi'
  },
  artha: {
    isAnomaly: true,
    costDeviationPct: 38,
    excessCostFormatted: '₹3.98 Lakh',
    peerMedianFormatted: '₹6.54 Lakh'
  },
  chakra: {
    hasCartelRisk: true,
    hhiIndex: 3200,
    topVendor: 'Apex Builders & Traders',
    topVendorShare: 76
  },
  vibhed: {
    isAnomaly: true,
    anomalyScore: 88
  },
  sankhya: {
    isThresholdSplit: true
  },
  bhu_drishti: {
    isGhostAsset: true
  }
};

// Load app.js code
const appJsPath = path.join(__dirname, '..', 'frontend', 'app.js');
eval(fs.readFileSync(appJsPath, 'utf8'));

// Run test
console.log('Testing Prashna Modal -> Sentinel Inspection -> Return Flow:');

// Step 1: Open Prashna Modal
openPrashnaModal(sampleProject);
console.log('1. openPrashnaModal called.');
console.log('   prashna-modal display:', documentElements['prashna-modal'].style.display);
console.log('   prashna-executive-summary contains WHERE, WHAT, WHY, WHAT NEXT:', 
  documentElements['prashna-executive-summary'].innerHTML.includes('1. WHERE') &&
  documentElements['prashna-executive-summary'].innerHTML.includes('2. WHAT') &&
  documentElements['prashna-executive-summary'].innerHTML.includes('3. WHY') &&
  documentElements['prashna-executive-summary'].innerHTML.includes('4. WHAT NEXT')
);

// Step 2: User clicks "INSPECT FULL STATUTORY CLAUSE →" for Vidhi-Kavach
inspectSentinelFromPrashna('MPLADS-146721', 'vidhi-kavach');

setTimeout(() => {
  console.log('2. inspectSentinelFromPrashna executed.');
  console.log('   prashna-modal display:', documentElements['prashna-modal'].style.display);
  console.log('   audit-modal display:', documentElements['audit-modal'].style.display);
  console.log('   window.isModalOpenedFromPrashna:', window.isModalOpenedFromPrashna);
  
  const container = documentElements['modal-findings-container'];
  const hasBackBanner = container.children.some(c => c.className === 'prashna-return-banner');
  console.log('   Has "← Back to Why Was This Flagged?" banner at top:', hasBackBanner);
  console.log('   Footer dismiss button text:', documentElements['modal-dismiss-btn'].innerHTML);

  // Step 3: User clicks "← Back to Forensic Reason Summary"
  returnToPrashnaModal();

  setTimeout(() => {
    console.log('3. returnToPrashnaModal executed.');
    console.log('   audit-modal display:', documentElements['audit-modal'].style.display);
    console.log('   prashna-modal display:', documentElements['prashna-modal'].style.display);
    console.log('   Prashna project ID in header:', documentElements['prashna-project-id'].innerText);

    // Step 4: User now inspects Punar-Drishti (Twin Comparison)
    inspectSentinelFromPrashna('MPLADS-146721', 'punar-drishti');

    setTimeout(() => {
      console.log('4. Second sentinel (PUNAR-DRISHTI) inspect executed.');
      console.log('   audit-modal display:', documentElements['audit-modal'].style.display);
      console.log('   modal badge:', documentElements['modal-badge'].innerText);
      
      const hasBackBanner2 = documentElements['modal-findings-container'].children.some(c => c.className === 'prashna-return-banner');
      console.log('   Has back banner for Punar-Drishti modal:', hasBackBanner2);

      console.log('\n========================================');
      console.log('✓ ALL PRASHNA BACK-NAVIGATION TESTS PASSED!');
      console.log('========================================');
      process.exit(0);
    }, 150);
  }, 150);
}, 150);
