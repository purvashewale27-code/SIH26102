const fs = require('fs');
const path = require('path');

// Simple DOM Mock for Node testing
class ElementMock {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.innerText = '';
    this.innerHTML = '';
    this.value = '';
    this.checked = false;
    this.style = {
      display: '',
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.classList = new Set();
    this.children = [];
    this.options = [];
  }
  appendChild(child) {
    this.children.push(child);
    if (this.tagName === 'select') this.options.push(child);
  }
  insertBefore(newNode, refNode) {
    const idx = this.children.indexOf(refNode);
    if (idx >= 0) {
      this.children.splice(idx, 0, newNode);
    } else {
      this.children.push(newNode);
    }
  }
  querySelector(sel) {
    if (sel === '.modal-body') return documentElements['modal-body'];
    if (sel === '.sim-presets-banner') return documentElements['sim-presets-banner'];
    if (sel === '.sim-form-container') return documentElements['sim-form-container'];
    if (sel === '.sim-section-heading') return documentElements['sim-section-heading'];
    return null;
  }
}

const documentElements = {
  'simulator-modal': new ElementMock('simulator-modal'),
  'modal-body': new ElementMock('modal-body'),
  'sim-presets-banner': new ElementMock('sim-presets-banner'),
  'sim-form-container': new ElementMock('sim-form-container'),
  'sim-section-heading': new ElementMock('sim-section-heading', 'h4'),
  'sim-form': new ElementMock('sim-form', 'form'),
  'sim-title': new ElementMock('sim-title', 'input'),
  'sim-cost': new ElementMock('sim-cost', 'input'),
  'sim-date': new ElementMock('sim-date', 'input'),
  'sim-state': new ElementMock('sim-state', 'select'),
  'sim-district': new ElementMock('sim-district', 'input'),
  'sim-category': new ElementMock('sim-category', 'select'),
  'sim-vendor': new ElementMock('sim-vendor', 'input'),
  'sim-has-geotag': new ElementMock('sim-has-geotag', 'input'),
  'sim-cost-hint': new ElementMock('sim-cost-hint', 'span'),
  'btn-run-sim': new ElementMock('btn-run-sim', 'button')
};

documentElements['simulator-modal'].appendChild(documentElements['modal-body']);
documentElements['modal-body'].appendChild(documentElements['sim-presets-banner']);
documentElements['modal-body'].appendChild(documentElements['sim-form-container']);
documentElements['sim-form-container'].appendChild(documentElements['sim-section-heading']);
documentElements['sim-form-container'].appendChild(documentElements['sim-form']);

global.document = {
  getElementById: (id) => documentElements[id] || null,
  createElement: (tag) => {
    const el = new ElementMock('', tag);
    return el;
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  body: new ElementMock('body')
};

global.window = {
  location: { pathname: '/index.html', hash: '', search: '' },
  lenis: null,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Mock fetch for simulation
global.fetch = async (url) => {
  return {
    ok: true,
    json: async () => ({
      executionTimeMs: 12,
      composite: { priorityScore: 92, riskTier: 'CRITICAL RISK', color: '#dc2626' },
      signals: {
        vidhi_kavach: { isCompliant: false, violations: ['Negative List'] },
        punar_drishti: { isDuplicate: true, similarityScore: 94 },
        artha_darpan: { isAnomaly: true, costDeviationPct: 38 },
        chakra_vyuh: { hasCartelRisk: true, topVendorShare: 76 },
        vibhed_netra: { isAnomaly: true, anomalyScore: 88 },
        sankhya_satya: { isThresholdSplit: true },
        bhu_drishti: { isGhostAsset: true }
      },
      shapWaterfall: []
    })
  };
};

// Load app.js
const appJsPath = path.join(__dirname, '..', 'frontend', 'app.js');
eval(fs.readFileSync(appJsPath, 'utf8'));

console.log('Testing Real MoSPI Audits Importer in Proposal Simulator:');

// Step 1: Open Simulator
openSimulator();
console.log('1. openSimulator() executed.');
console.log('   simulator-modal display:', documentElements['simulator-modal'].style.display);

// Check that panel was injected into modal-body
const realPanel = documentElements['modal-body'].children.find(c => c.id === 'sim-real-audit-panel');
console.log('   sim-real-audit-panel injected:', Boolean(realPanel));

// Step 2: Check active loaded real audit fields
console.log('2. Default loaded Real Audit:');
console.log('   Title:', documentElements['sim-title'].value);
console.log('   Cost:', documentElements['sim-cost'].value);
console.log('   State:', documentElements['sim-state'].value);
console.log('   District:', documentElements['sim-district'].value);

if (documentElements['sim-cost'].value !== 1051705) {
  throw new Error('Default real audit cost mismatch');
}

// Step 3: Load Real Audit 3 (Patna Bihar Ravi Shankar Prasad)
loadRealMospiAudit('MPLADS-165402');
console.log('3. Loaded Real Audit MPLADS-165402 (Patna Bihar):');
console.log('   Title:', documentElements['sim-title'].value);
console.log('   Cost:', documentElements['sim-cost'].value);
console.log('   State:', documentElements['sim-state'].value);
console.log('   District:', documentElements['sim-district'].value);

if (documentElements['sim-cost'].value !== 2850000) {
  throw new Error('Real audit 3 cost mismatch');
}

// Step 4: Switch to Benchmark Preset 2
loadSimulatorPreset(2);
console.log('4. Switched to Benchmark Scenario #2:');
console.log('   Title:', documentElements['sim-title'].value);
console.log('   Cost:', documentElements['sim-cost'].value);

console.log('\n========================================');
console.log('✓ REAL MOSPI AUDITS SIMULATOR TEST PASSED!');
console.log('========================================');
process.exit(0);
