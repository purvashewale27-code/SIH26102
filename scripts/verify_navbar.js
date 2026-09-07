const fs = require('fs');
const path = require('path');

console.log('--- Verifying Navbar & Masthead Revamp ---');

const html = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');

// 1. Check for removal of hackathon step pills
const hasStep1Pill = html.includes('Step 1: Foundation');
const hasStepPillClass = html.includes('step-indicator');
console.log('Step 1: Foundation removed:', !hasStep1Pill);
console.log('step-indicator clutter removed:', !hasStepPillClass);

if (hasStep1Pill || hasStepPillClass) {
  console.error('FAIL: Cluttered step pills still found in index.html!');
  process.exit(1);
}

// 2. Check national utility strip has been removed per design request
const hasUtilityBar = html.includes('class="national-utility-bar"');
console.log('National utility bar cleanly removed:', !hasUtilityBar);

if (hasUtilityBar) {
  console.error('FAIL: National utility bar still found in index.html!');
  process.exit(1);
}

// 3. Check Ashoka Chakra emblem & brand hierarchy
const hasAshokaChakra = html.includes('ashoka-chakra-svg');
const hasGovIndia = html.includes('GOVERNMENT OF INDIA');
const hasLiveStatus = html.includes('LIVE FORENSIC SENTINEL');
console.log('Ashoka Chakra emblem present:', hasAshokaChakra);
console.log('Government of India hierarchy present:', hasGovIndia);
console.log('Live status sentinel cleanly removed:', !hasLiveStatus);

if (!hasAshokaChakra || !hasGovIndia || hasLiveStatus) {
  console.error('FAIL: Ministerial masthead validation failed (emblem missing or status badge still present)!');
  process.exit(1);
}

// 4. Check action buttons preserved
const hasSimBtn = html.includes('id="btn-open-simulator"');
const hasProvBtn = html.includes('id="btn-open-provenance"');
console.log('btn-open-simulator ID preserved:', hasSimBtn);
console.log('btn-open-provenance ID preserved:', hasProvBtn);

if (!hasSimBtn || !hasProvBtn) {
  console.error('FAIL: Action buttons with required IDs missing!');
  process.exit(1);
}

// 5. Check primary nav bar items and views
const expectedViews = ['overview', 'investigate', 'map', 'networks', 'trends', 'reports'];
for (const view of expectedViews) {
  const hasView = html.includes(`data-view="${view}"`);
  console.log(`Nav item data-view="${view}" present:`, hasView);
  if (!hasView) {
    console.error(`FAIL: Missing nav view: ${view}`);
    process.exit(1);
  }
}

// 6. Check Ctrl+K search trigger
const hasCtrlK = html.includes('Ctrl+K');
console.log('Ctrl+K shortcut badge present:', hasCtrlK);

// 7. Check CSS rules
const hasNavSticky = css.includes('position: sticky');
const hasNavBg = css.includes('.main-nav-bar');
const hasUtilityCss = css.includes('.national-utility-bar');
console.log('Nav sticky positioning present:', hasNavSticky);
console.log('main-nav-bar styles present:', hasNavBg);
console.log('national-utility-bar styles present:', hasUtilityCss);

if (!hasNavSticky || !hasNavBg || !hasUtilityCss) {
  console.error('FAIL: CSS rules missing for navbar!');
  process.exit(1);
}

// 8. Check JS functions
const hasClockFn = js.includes('function initISTClock()');
const hasFontFn = js.includes('function setPortalFontSize(');
console.log('initISTClock function present in app.js:', hasClockFn);
console.log('setPortalFontSize function present in app.js:', hasFontFn);

if (!hasClockFn || !hasFontFn) {
  console.error('FAIL: JS helper functions missing in app.js!');
  process.exit(1);
}

console.log('\n🌟 ALL NAVBAR & MASTHEAD VERIFICATIONS PASSED 100%! 🌟');
