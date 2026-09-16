const fs = require('fs');
const path = require('path');
const http = require('http');

// Simple DOM Mock for Node testing of openModal
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
    this.classList = new Set();
    this.children = [];
  }
  appendChild(child) {
    this.children.push(child);
  }
  getAttribute(attr) {
    return this[attr] || '';
  }
  setAttribute(attr, val) {
    this[attr] = val;
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
  'modal-gen-dossier-btn': new ElementMock('modal-gen-dossier-btn', 'button')
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
  location: { pathname: '/vidhi-kavach.html', hash: '', search: '' },
  lenis: null
};
global.switchMode = () => {};
global.loadCartelGraph = () => {};
global.loadPrashnaShowcase = () => {};
global.loadOnPageSimPreset = () => {};
global.renderTrendsChart = () => {};
global.initScrollSpy = () => {};
global.jumpToSection = () => {};
global.setupForensicDropdown = () => {};
global.setupModeSwitcher = () => {};
global.setupEventListeners = () => {};
global.renderOverviewTrendSnapshot = () => {};

// Fetch mock project from local server
http.get('http://localhost:3000/api/projects?limit=5', (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    const data = JSON.parse(raw);
    const sampleProject = data.data[0];

    console.log('==================================================');
    console.log('🧪 TESTING MODAL FEATURE ISOLATION ENGINE');
    console.log('==================================================');

    // Load and evaluate app.js functions in context
    const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app.js'), 'utf8');
    
    // Test for each mode
    const modes = [
      { mode: 'vidhi-kavach', title: 'S-01: VIDHI-KAVACH', expectedText: 'VIDHI-KAVACH' },
      { mode: 'punar-drishti', title: 'S-02: PUNAR-DRISHTI', expectedText: 'PUNAR-DRISHTI' },
      { mode: 'artha-darpan', title: 'S-03: ARTHA-DARPAN', expectedText: 'ARTHA-DARPAN' },
      { mode: 'chakra-vyuh', title: 'S-04: CHAKRA-VYUH', expectedText: 'CHAKRA-VYUH' },
      { mode: 'vibhed-netra', title: 'S-05: VIBHED-NETRA', expectedText: 'VIBHED-NETRA' },
      { mode: 'sankhya-satya', title: 'S-06: SANKHYA-SATYA', expectedText: 'SANKHYA-SATYA' },
      { mode: 'bhu-drishti', title: 'S-07: BHU-DRISHTI', expectedText: 'BHU-DRISHTI' }
    ];

    // Evaluate app.js modal functions
    global.window.openModal = null;
    global.closeForensicDropdown = () => {};
    global.openGovPolicyModal = () => {};
    global.openProvenanceModal = () => {};
    global.togglePrashnaEvidence = () => {};
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
    
    // Extract openModal and getActiveSentinelMode cleanly
    const modalCode = appJsContent.substring(
      appJsContent.indexOf('function getActiveSentinelMode()'),
      appJsContent.indexOf('function togglePrashnaEvidence(projId)')
    );
    eval(modalCode);

    let allPassed = true;
    for (const m of modes) {
      window.location.pathname = `/${m.mode}.html`;
      openModal(sampleProject, m.mode);

      const badgeText = documentElements['modal-badge'].innerText;
      const findingsLabel = documentElements['modal-findings-label'].innerText;
      const containerChildren = documentElements['modal-findings-container'].children;

      const hasBadgeMatch = badgeText.includes(m.title);
      const hasLabelMatch = findingsLabel.includes(m.expectedText);
      const hasContent = containerChildren.length >= 2;

      // Ensure NO other sentinels are leaked into this container
      let isIsolated = true;
      let leakFound = '';
      for (const other of modes) {
        if (other.mode !== m.mode) {
          // Check children innerHTML
          for (const child of containerChildren) {
            if (child.innerHTML && child.innerHTML.includes(`S-0${modes.indexOf(other) + 1}: ${other.expectedText}`)) {
              isIsolated = false;
              leakFound = other.expectedText;
              break;
            }
          }
        }
      }

      if (hasBadgeMatch && hasLabelMatch && isIsolated && hasContent) {
        console.log(`  ✅ [PASS] Mode '${m.mode}': Isolated to ${m.title} (No foreign sentinels)`);
      } else {
        console.error(`  ❌ [FAIL] Mode '${m.mode}': badge="${badgeText}", leak="${leakFound}"`);
        allPassed = false;
      }
    }

    console.log('==================================================');
    if (allPassed) {
      console.log('🎉 ALL 7 SENTINEL MODALS ARE 100% PERFECTLY ISOLATED!');
    } else {
      console.error('⚠️ Verification failed.');
      process.exit(1);
    }
    console.log('==================================================');
  });
}).on('error', err => {
  console.error('Failed to connect to local server:', err.message);
  process.exit(1);
});
