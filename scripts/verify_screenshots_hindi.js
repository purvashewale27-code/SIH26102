const fs = require('fs');

// Read frontend/i18n.js
const i18nContent = fs.readFileSync('frontend/i18n.js', 'utf8');

// Create minimal DOM mock to run translateNode
class MockNode {
  constructor(type, val, tag = '') {
    this.nodeType = type;
    this.nodeValue = val;
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
  }
  appendChild(child) {
    this.children.push(child);
  }
  get firstChild() {
    return this.children[0] || null;
  }
  get nextSibling() {
    return null;
  }
  hasAttribute(attr) {
    return !!this.attributes[attr];
  }
  getAttribute(attr) {
    return this.attributes[attr];
  }
  setAttribute(attr, val) {
    this.attributes[attr] = val;
  }
}

// Extract the translation logic by eval in a sandbox
let globalWin = {};
const sandbox = {
  window: globalWin,
  document: {
    documentElement: { lang: 'en' },
    body: Object.assign(new MockNode(1, '', 'body'), {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    }),
    querySelectorAll: () => [],
    getElementById: () => null,
    readyState: 'complete',
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => 'hi',
    setItem: () => {}
  },
  setTimeout: () => {},
  clearTimeout: () => {},
  Node: {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
  },
  CustomEvent: function() {}
};

const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(i18nContent, sandbox);

const translateNode = sandbox.window.translateNode;

// Test cases from the 5 user screenshots
const testCases = [
  // Screenshot 1
  'Boundary wall, road gate guard wall at Bohera Majherpara Kaborsthan and gate at infront / Jumman Ali mudi shop under Chhotojagulia G.P and Barasat I पंचायत Samity. (Sl.No.१&२)',
  'विद्यालय Bus for Bal Bharti Vidhya मंदिर, Ribandar, Tiswadi, गोवा.',
  'at Jalanpur near Mansha मंदिर under Banjora ग्राम पंचायत, Mejia Block, Bankura District, Plot No १७४०, JL No ७४',
  'Installation / one (?) nos / solar photovoltaic Submersible Pump with overhead tank with pipe line for पेयजल at Deulvira Village Near Laxmi मंदिर, Indpur ग्राम पंचायत, Indpur Block under Bankura District JL १३६ PLOT ११०',
  'Excavation / Pit for Koneru Near Guru Kunta Temple Reach ३ in Gurajala Village, Simhadripuram Mandal',
  'Constructing a new सामुदायिक भवन near Maremma temple , Kamalapura, Hosapete',
  'Installation / २५० (Two Hundred Fifty) solar street lights at various public locations in Blocks Tiloi, Bahadurpur, Singhpur, Amethi, Sangrampur, Bhadar, Bhetua, Gauriganj, Jamo, Shahgarh, Musafirkhana, Jagdishpur and Shukul Bazar, District Amethi, as per the enclosed list.',
  'SK NURUL ISLAM',
  'Shri Sadanand Mhalu Shet Tanavade (2023-29)',
  'Sitting Rajya Sabha',
  'ARUP CHAKRABORTY',
  'Y S Avinash Reddy',
  'E. TUKARAM',
  'KISHORI LAL',
  'North 24 Parganas(जिलाधिकारी NORTH TWENTY FOUR PARGANAS_IDA)',
  'BANKURA(जिलाधिकारी BANKURA_IDA)',
  'Y.S.R. Kadapa(जिला कलेक्टर CUDDAPAH_IDA)',
  'Vijayanagara(उपायुक्त VIJAYANAGARA_IDA)',
  'Amethi(DISTRICT MAGISTRAE AMETHI_IDA)',
  'NEG-LIST-01 (+25 pts)',
  'MARCH-RUSH (+15 pts)',

  // Screenshot 2
  'SENTINEL एस-०१: VIDHI-KAVACH (विधि-कवच — सांविधिक नीति ढाल)',

  // Screenshot 3
  'Cross-Work Lexical NLP Twin Work & Double-Billing Sentry',
  "Vaibhav's TF-IDF & Cosine Similarity Engine identifying identical work descriptions and duplicate billing claims across India",
  '10,204 Duplicate Claims (6,965 Clones)',
  'TOTAL WORKS SCANNED',
  'Across all 36 States & UTs',
  'DUPLICATE CLAIMS FLAGGED',
  'Cross-work twin assets in district',
  '100% EXACT CLONES',
  'Identical work descriptions in district',
  'NEAR-CLONES (85%–99%)',
  'Slight variations in title phrasing',
  'SENTINEL एस-०२: PUNAR-DRISHTI (पुनर्द्दष्टि — NLP DUPLICATE SENTRY)',
  "Vaibhav's TF-IDF & Cosine Similarity Engine detecting duplicate project claims across India",
  'All Duplicate Claims',
  '100% Exact Title Clones',
  'Near-Clones (85%–99%)',
  'All 176,925 Scanned Works',

  // Screenshot 4
  'Provision / Lighting arrangement with Street light poles',
  'Provision / Lighting arrangment with street light & Poles',
  'Park Revonation / ward no 7, The working agency will be concerned Municipal Corporation',
  'Const. / General Chaupal',
  '1st phase / Community Media Centre at Soibam leikai, Public Mongpham, Porompat.',
  '1st phase / Athoupung Leikol, a Public park at Arapti Maning Leikal (Paona Mongpham), Lilong.',
  'Manoj Tiwari NORTH EAST दिल्ली',
  'SUKHJINDER SINGH RANDHAWA GURDASPUR',
  'SATPAL BRAHAMCHARI SONEPAT',
  'ANGOMCHA BIMOL AKOIJAM इनर मणिपुर',
  '100% EXACT CLONE',
  'Twin: MPLADS-146722 (₹8,98,145)',
  'Inspect Twin Work',

  // Screenshot 5
  'SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — COST INTEGRITY SENTRY)',
  'CPWD Schedule of Rates Benchmark & Cost Inflation Sentry',
  'CPWD Schedule / Rates Benchmark & Cost Inflation Sentry',
  'Calibrated with 108 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations',
  'Calibrated with 178 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations',
  '₹3,639.1 Cr Flagged Excess Overrun Risk',
  'TOTAL WORKS EVALUATED',
  'Calibrated against CPWD Rates',
  'COST ANOMALIES FLAGGED',
  'Deviating from peer benchmarks',
  'CRITICAL INFLATION (+100%+)',
  'Sanctioned at ≥ 2x peer median',
  'TOTAL EXCESS COST RISK',
  'Cumulative price-padding risk flagged',
  'SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHMARK & OVERPRICING SENTRY)',
  'CPWD Schedule of Rates (DSR) & Statistical Peer-Group Benchmark Analyzer',
  'CPWD Schedule / Rates (DSR) & Statistical Peer-Group Benchmark Analyzer',
  'Auditing project budgets against State DSR Multipliers and category peer medians to prevent treasury overbilling',
  'All Cost Anomalies',
  'Critical Inflation (+100% to +400%)',
  'Moderate Inflation (+40% to +100%)',
  'Unviable Under-Bids (<-40%)',
  'Fair Market Pricing',
  'COST BENCHMARK VERDICT (ARTHA-DARPAN)'
];

console.log(`\n======================================================`);
console.log(`VERIFYING TRANSLATION FOR ALL ${testCases.length} SCREENSHOT PHRASES`);
console.log(`======================================================\n`);

let failCount = 0;
let glitchCount = 0;

testCases.forEach((tc, idx) => {
  const node = new MockNode(3, tc);
  translateNode(node, 'hi');
  const result = node.nodeValue;

  // Check for regex partial replacement glitches (like Benchमार्चk or मार्चket or मार्चemma or मार्चCH)
  const hasGlitch = /Benchमार्चk|मार्चket|मार्चemma|मार्चCH/.test(result);
  if (hasGlitch) glitchCount++;

  // Check if any English letters remain
  const englishMatches = result.match(/[a-zA-Z]+/g) || [];
  const hasEnglish = englishMatches.length > 0;
  if (hasEnglish) failCount++;

  if (hasGlitch || hasEnglish) {
    console.log(`[#${idx + 1}] ORIGINAL: ${tc}`);
    console.log(`     RESULT  : ${result}`);
    if (hasGlitch) console.error(`     ❌ GLITCH DETECTED in: ${result}`);
    if (hasEnglish) console.warn(`     ⚠️ REMAINING ENGLISH: ${englishMatches.join(', ')}`);
    console.log('---');
  }
});

console.log(`\nRESULTS:`);
console.log(`Total Tested: ${testCases.length}`);
console.log(`Substring Glitches: ${glitchCount} (Must be 0)`);
console.log(`Remaining English: ${failCount}`);

if (glitchCount === 0 && failCount === 0) {
  console.log(`\n🎉 100% PERFECT! Zero glitches, zero English words remain!`);
} else {
  console.log(`\nNeeds fine-tuning for remaining items.`);
}
