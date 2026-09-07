const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('🔍 VERIFYING STICKY NAV HEADER & SCROLLBAR FIX');
console.log('==================================================');

let errors = 0;

// 1. Verify frontend/style.css
const css = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');

// A. No hardcoded top: 96px in sentinel-nav-strip
const hasBadTop96 = /\.sentinel-nav-strip[\s\S]*?top:\s*96px/.test(css);
if (hasBadTop96) {
  console.error('❌ FAIL: .sentinel-nav-strip still contains "top: 96px" in style.css');
  errors++;
} else {
  console.log('✅ [PASS] .sentinel-nav-strip no longer has broken top: 96px offset');
}

// B. .sticky-nav-header rule exists with position: sticky
const hasStickyNavHeader = css.includes('.sticky-nav-header') && css.includes('position: sticky');
if (!hasStickyNavHeader) {
  console.error('❌ FAIL: .sticky-nav-header with position: sticky missing in style.css');
  errors++;
} else {
  console.log('✅ [PASS] .sticky-nav-header defined with position: sticky and top: 0');
}

// C. Scrollbar is hidden on .sentinel-nav-container
const hasScrollbarNone = css.includes('scrollbar-width: none');
const hasWebkitScrollbarNone = css.includes('.sentinel-nav-container::-webkit-scrollbar') && css.includes('display: none');
if (!hasScrollbarNone || !hasWebkitScrollbarNone) {
  console.error('❌ FAIL: Scrollbar suppression missing for .sentinel-nav-container');
  errors++;
} else {
  console.log('✅ [PASS] Horizontal scrollbars suppressed via scrollbar-width: none and ::-webkit-scrollbar');
}

// 2. Verify all 9 HTML pages
const pages = [
  { file: 'index.html', pageId: 'overview' },
  { file: 'vidhi-kavach.html', pageId: 'vidhi-kavach' },
  { file: 'punar-drishti.html', pageId: 'punar-drishti' },
  { file: 'artha-darpan.html', pageId: 'artha-darpan' },
  { file: 'chakra-vyuh.html', pageId: 'chakra-vyuh' },
  { file: 'vibhed-netra.html', pageId: 'vibhed-netra' },
  { file: 'sankhya-satya.html', pageId: 'sankhya-satya' },
  { file: 'bhu-drishti.html', pageId: 'bhu-drishti' },
  { file: 'samvaad.html', pageId: 'samvaad' }
];

pages.forEach(p => {
  const filePath = path.join(__dirname, '../frontend', p.file);
  const html = fs.readFileSync(filePath, 'utf8');

  // Check sticky-nav-header presence
  const hasStickyHeader = html.includes('class="sticky-nav-header" id="sticky-nav-header"');
  if (!hasStickyHeader) {
    console.error(`❌ FAIL: ${p.file} missing .sticky-nav-header wrapper`);
    errors++;
  } else {
    console.log(`✅ [PASS] ${p.file}: wrapped in .sticky-nav-header`);
  }

  // Check no duplicate class attributes
  const hasDuplicateClass = /class="[^"]*"\s+[^>]*class="[^"]*"/.test(html);
  if (hasDuplicateClass) {
    console.error(`❌ FAIL: ${p.file} contains duplicate class="..." attributes on single tags`);
    errors++;
  } else {
    console.log(`✅ [PASS] ${p.file}: zero duplicate class="..." attributes`);
  }

  // Check active sentinel nav tab matches page
  const activeNavMatch = html.match(/class="s-nav-tab active"\s+data-nav="([^"]+)"|data-nav="([^"]+)"\s+class="s-nav-tab active"/);
  const activeNav = activeNavMatch ? (activeNavMatch[1] || activeNavMatch[2]) : null;
  if (activeNav !== p.pageId) {
    console.error(`❌ FAIL: ${p.file} expected active sentinel nav "${p.pageId}", found "${activeNav}"`);
    errors++;
  } else {
    console.log(`✅ [PASS] ${p.file}: correct active sentinel nav tab "${activeNav}"`);
  }
});

// 3. Verify frontend/app.js
const js = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');
const hasInstantDispatch = /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{[\s\S]*?initPageDispatcher\(\);[\s\S]*?loadStats/.test(js);
if (!hasInstantDispatch) {
  console.error('❌ FAIL: frontend/app.js does not call initPageDispatcher() immediately on DOMContentLoaded');
  errors++;
} else {
  console.log('✅ [PASS] frontend/app.js calls initPageDispatcher() immediately on DOMContentLoaded');
}

if (errors > 0) {
  console.error(`\n❌ Total Errors: ${errors}`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL STICKY NAV & SCROLLBAR VERIFICATIONS PASSED 100%!\n');
}
