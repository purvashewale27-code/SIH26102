const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('🔍 VERIFYING BHU-DRISHTI GIS SATELLITE MAP ENGINE');
console.log('==================================================');

let errors = 0;

// 1. Check local Leaflet assets
const vendorDir = path.join(__dirname, '../frontend/vendor/leaflet');
const jsPath = path.join(vendorDir, 'leaflet.js');
const cssPath = path.join(vendorDir, 'leaflet.css');
const imgDir = path.join(vendorDir, 'images');

if (fs.existsSync(jsPath) && fs.statSync(jsPath).size > 100000) {
  console.log(`✅ [PASS] Local Leaflet JS: ${fs.statSync(jsPath).size} bytes`);
} else {
  console.error('❌ FAIL: Missing or incomplete local leaflet.js');
  errors++;
}

if (fs.existsSync(cssPath) && fs.statSync(cssPath).size > 10000) {
  console.log(`✅ [PASS] Local Leaflet CSS: ${fs.statSync(cssPath).size} bytes`);
} else {
  console.error('❌ FAIL: Missing or incomplete local leaflet.css');
  errors++;
}

if (fs.existsSync(imgDir) && fs.readdirSync(imgDir).length >= 4) {
  console.log(`✅ [PASS] Local Leaflet Images: ${fs.readdirSync(imgDir).length} files`);
} else {
  console.error('❌ FAIL: Missing local leaflet marker/layer images');
  errors++;
}

// 2. Check HTML files
const htmlFiles = ['index.html', 'bhu-drishti.html'];
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, '../frontend', f), 'utf8');
  const hasLocalCss = content.includes('href="vendor/leaflet/leaflet.css"');
  const hasLocalJs = content.includes('src="vendor/leaflet/leaflet.js"');
  const hasMapId = content.includes('id="bhu-drishti-map"');
  const hasHeaderId = content.includes('id="bhu-drishti-map-section"');

  if (hasLocalCss && hasLocalJs && hasMapId && hasHeaderId) {
    console.log(`✅ [PASS] ${f}: Correct local Leaflet tags and map elements`);
  } else {
    console.error(`❌ FAIL: ${f} missing local Leaflet tags or map elements`);
    errors++;
  }
});

// 3. Check CSS rules in frontend/style.css
const styleCss = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');
const hasMapRule = styleCss.includes('#bhu-drishti-map') && styleCss.includes('height: 440px');
const hasContainerRule = styleCss.includes('.leaflet-container');
const hasCardRule = styleCss.includes('.bhu-map-card');

if (hasMapRule && hasContainerRule && hasCardRule) {
  console.log('✅ [PASS] frontend/style.css: Dedicated #bhu-drishti-map and .leaflet-container styling');
} else {
  console.error('❌ FAIL: frontend/style.css missing required map container styling');
  errors++;
}

// 4. Check JS logic in frontend/app.js
const appJs = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');
const hasGuard = appJs.includes("typeof L === 'undefined'");
const hasInvalidate = appJs.includes('bhuLeafletMap.invalidateSize(true)');
const hasPreferCanvas = appJs.includes('preferCanvas: true');
const hasTileError = appJs.includes('tileerror');
const hasWindowExports = appJs.includes('window.loadSpatialMapPoints = loadSpatialMapPoints');
const hasNoBadCall = !appJs.includes("loadSpatialMapPoints('all');");

if (hasGuard && hasInvalidate && hasPreferCanvas && hasTileError && hasWindowExports && hasNoBadCall) {
  console.log('✅ [PASS] frontend/app.js: Robust L-guard, invalidateSize, tileerror fallback, and exports');
} else {
  console.error(`❌ FAIL: frontend/app.js checks failed (guard=${hasGuard}, invalidate=${hasInvalidate}, canvas=${hasPreferCanvas}, tileerror=${hasTileError}, exports=${hasWindowExports}, noBadCall=${hasNoBadCall})`);
  errors++;
}

// 5. Test Live HTTP Server Endpoints
function fetchHttp(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function testEndpoints() {
  try {
    // A. Leaflet JS
    const jsRes = await fetchHttp('/vendor/leaflet/leaflet.js');
    if (jsRes.status === 200 && jsRes.headers['content-type'].includes('application/javascript')) {
      console.log('✅ [PASS] HTTP GET /vendor/leaflet/leaflet.js -> 200 OK (application/javascript)');
    } else {
      console.error(`❌ FAIL: HTTP GET /vendor/leaflet/leaflet.js returned status ${jsRes.status}`);
      errors++;
    }

    // B. Leaflet CSS
    const cssRes = await fetchHttp('/vendor/leaflet/leaflet.css');
    if (cssRes.status === 200 && cssRes.headers['content-type'].includes('text/css')) {
      console.log('✅ [PASS] HTTP GET /vendor/leaflet/leaflet.css -> 200 OK (text/css)');
    } else {
      console.error(`❌ FAIL: HTTP GET /vendor/leaflet/leaflet.css returned status ${cssRes.status}`);
      errors++;
    }

    // C. Spatial Map API
    const apiRes = await fetchHttp('/api/spatial-map?filter=all-spatial');
    const json = JSON.parse(apiRes.data);
    if (apiRes.status === 200 && json.success && Array.isArray(json.data) && json.data.length > 0) {
      console.log(`✅ [PASS] HTTP GET /api/spatial-map -> 200 OK (returned ${json.data.length} GPS points)`);
      const sample = json.data[0];
      if (typeof sample.lat === 'number' && typeof sample.lon === 'number' && sample.title) {
        console.log(`✅ [PASS] Sample Geotag Record: "${sample.title}" at [${sample.lat}, ${sample.lon}]`);
      }
    } else {
      console.error(`❌ FAIL: HTTP GET /api/spatial-map did not return valid points`);
      errors++;
    }

    if (errors > 0) {
      console.error(`\n❌ Total Errors: ${errors}`);
      process.exit(1);
    } else {
      console.log('\n🎉 ALL BHU-DRISHTI GIS RADAR TESTS PASSED (100%)!\n');
    }
  } catch (err) {
    console.error('Server request failed:', err);
    process.exit(1);
  }
}

testEndpoints();
