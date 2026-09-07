const fs = require('fs');
const path = require('path');

console.log('--- Verifying Step 5: Lenis Smooth Scroll & Three.js 3D Animations ---');

const html = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');

// 1. Check CDN script tags in index.html
const hasLenisCdn = html.includes('lenis@1.1.18') || html.includes('lenis.min.js');
const hasThreeCdn = html.includes('three.js/r128') || html.includes('three.min.js');
console.log('Lenis CDN in index.html:', hasLenisCdn);
console.log('Three.js CDN in index.html:', hasThreeCdn);

if (!hasLenisCdn || !hasThreeCdn) {
  console.error('FAIL: Missing Lenis or Three.js CDN script tags in index.html!');
  process.exit(1);
}

// 2. Check hero canvas element
const hasHeroCanvas = html.includes('id="hero-sentinel-canvas"') && html.includes('class="hero-threejs-canvas"');
console.log('Hero sentinel canvas in index.html:', hasHeroCanvas);

if (!hasHeroCanvas) {
  console.error('FAIL: Missing #hero-sentinel-canvas in index.html!');
  process.exit(1);
}

// 3. Check data-lenis-prevent on modals
const hasLenisPrevent = html.includes('data-lenis-prevent');
const countLenisPrevent = (html.match(/data-lenis-prevent/g) || []).length;
console.log('data-lenis-prevent attributes present:', hasLenisPrevent, `(${countLenisPrevent} instances)`);

if (countLenisPrevent < 5) {
  console.error('FAIL: Less than 5 instances of data-lenis-prevent on modals!');
  process.exit(1);
}

// 4. Check CSS rules
const hasLenisCss = css.includes('html.lenis') && css.includes('.lenis.lenis-smooth');
const hasCanvasCss = css.includes('.hero-threejs-canvas') && css.includes('.hero-main-card');
console.log('Lenis CSS rules present in style.css:', hasLenisCss);
console.log('Hero canvas CSS rules present in style.css:', hasCanvasCss);

if (!hasLenisCss || !hasCanvasCss) {
  console.error('FAIL: CSS rules missing for Lenis or Three.js canvas in style.css!');
  process.exit(1);
}

// 5. Check JS functions
const hasLenisFn = js.includes('function initLenisSmoothScroll()');
const hasConstellationFn = js.includes('function initHeroSentinelConstellation()');
const hasModalLenisStop = js.includes('window.lenis.stop()') && js.includes('window.lenis.start()');
const hasExports = js.includes('window.initLenisSmoothScroll') && js.includes('window.initHeroSentinelConstellation');

console.log('initLenisSmoothScroll function in app.js:', hasLenisFn);
console.log('initHeroSentinelConstellation function in app.js:', hasConstellationFn);
console.log('Modal lenis stop/start integration:', hasModalLenisStop);
console.log('Global window exports for Lenis and Three.js:', hasExports);

if (!hasLenisFn || !hasConstellationFn || !hasModalLenisStop || !hasExports) {
  console.error('FAIL: JavaScript implementations or exports missing in app.js!');
  process.exit(1);
}

console.log('\n🌟 ALL STEP 5 (LENIS & THREE.JS) VERIFICATIONS PASSED 100%! 🌟');
