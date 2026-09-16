const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'frontend', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

const checks = [
  { name: 'modal-card flex column', pass: cssContent.includes('display: flex !important;\n  flex-direction: column !important;') },
  { name: 'modal-card overflow-x hidden', pass: cssContent.includes('overflow-x: hidden !important;') },
  { name: 'modal-body overflow-y auto & overflow-x hidden', pass: cssContent.includes('overflow-y: auto !important;\n  overflow-x: hidden !important;') },
  { name: 'modal-footer flex-wrap wrap', pass: cssContent.includes('flex-wrap: wrap !important;') },
  { name: 'modal-footer box-sizing border-box', pass: cssContent.includes('box-sizing: border-box !important;') },
  { name: 'simulator-modal-card overflow-x hidden', pass: cssContent.includes('.simulator-modal-card {\n  max-width: 1140px;\n  width: 95vw;\n  max-height: 90vh;\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden !important;\n  overflow-x: hidden !important;') },
  { name: 'dossier-modal-card overflow-x hidden', pass: cssContent.includes('.dossier-modal-card {\n  max-width: 960px;\n  width: 95vw;\n  max-height: 92vh;\n  display: flex !important;\n  flex-direction: column !important;\n  background: #475569;\n  padding: 0;\n  border-radius: 8px;\n  overflow: hidden !important;\n  overflow-x: hidden !important;') },
  { name: 'provenance-modal-card overflow-x hidden', pass: cssContent.includes('.provenance-modal-card {\n  max-width: 980px;\n  width: 95vw;\n  max-height: 90vh;\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden !important;\n  overflow-x: hidden !important;') },
  { name: 'responsive mobile modal styles', pass: cssContent.includes('@media (max-width: 640px)') }
];

console.log('=== CSS VERIFICATION CHECKS ===');
let allPassed = true;
checks.forEach(c => {
  console.log(`${c.pass ? '✓ PASS' : '✗ FAIL'}: ${c.name}`);
  if (!c.pass) allPassed = false;
});

const htmlFiles = [
  'frontend/index.html',
  'frontend/vidhi-kavach.html',
  'frontend/punar-drishti.html',
  'frontend/artha-darpan.html',
  'frontend/chakra-vyuh.html',
  'frontend/sankhya-satya.html',
  'frontend/vibhed-netra.html',
  'frontend/bhu-drishti.html',
  'frontend/bhavishya-rekha.html',
  'frontend/satark-karyaa.html',
  'frontend/satark-simulation.html',
  'frontend/samvaad.html',
  'frontend/prashna-kavach.html'
];

console.log('\n=== HTML FILES VERIFICATION ===');
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  // Check for any remaining problematic inline styles on modal-footer
  const hasBadInline = /modal-footer"[^>]*width:\s*100%;/i.test(content);
  if (hasBadInline) {
    console.log(`✗ FAIL: ${f} has bad inline width on modal-footer`);
    allPassed = false;
  } else {
    console.log(`✓ PASS: ${f} modal-footers cleaned`);
  }
});

console.log(`\nOVERALL RESULT: ${allPassed ? 'ALL AUDIT CHECKS PASSED (100%)' : 'SOME CHECKS FAILED'}`);
process.exit(allPassed ? 0 : 1);
