/**
 * STEP 1: Minimal Clean Server for MPLADS-SATARK
 * Simple, readable, and easy to understand.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'mospi', 'real_works_recommended_completed.json');

let allProjects = [];
let totalSanctionedINR = 0;
const statesSet = new Set();

// 1. Load the real government projects simply
console.log('Loading real projects data...');
if (fs.existsSync(DATA_FILE)) {
  const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  allProjects = rawData.map((w, index) => {
    const cost = Number(w.SANCTION_AMOUNT || w.RECOMMENDED_AMOUNT || 0);
    totalSanctionedINR += cost;
    if (w.STATE_NAME) statesSet.add(w.STATE_NAME.trim());

    return {
      id: `MPLADS-${String(index + 1).padStart(6, '0')}`,
      title: w.WORK_DESCRIPTION || w.ACTIVITY_NAME || 'Public Development Work',
      state: w.STATE_NAME || 'Unknown State',
      district: w.IDA_NAME || w.CONSTITUENCY || 'Unknown District',
      constituency: w.CONSTITUENCY || 'Unknown',
      mpName: w.MP_NAME || 'Unknown MP',
      cost: cost,
      costFormatted: '₹' + cost.toLocaleString('en-IN'),
      status: w.WORK_STAGE || (w.RECOMMENDED_AMOUNT ? 'In Progress' : 'Completed'),
      date: w.SANCTION_DATE || w.RECOMMENDATION_DATE || '2024-06-01'
    };
  });
  console.log(`✅ Loaded ${allProjects.length} real projects across ${statesSet.size} States!`);
} else {
  console.warn('⚠️ Raw data file not found, starting with empty list.');
}

// 2. Simple HTTP Server
const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Helper to send JSON responses
  const sendJson = (data, statusCode = 200) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
  };

  // API 1: Top Statistics
  if (pathname === '/api/stats') {
    return sendJson({
      totalProjects: allProjects.length,
      totalSanctionedCrore: +(totalSanctionedINR / 1e7).toFixed(2),
      totalStates: statesSet.size
    });
  }

  // API 2: Filterable / Paginated Projects List
  if (pathname === '/api/projects') {
    const search = (reqUrl.searchParams.get('search') || '').toLowerCase();
    const page = parseInt(reqUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(reqUrl.searchParams.get('limit') || '20', 10);

    let filtered = allProjects;
    if (search) {
      filtered = allProjects.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.state.toLowerCase().includes(search) ||
        p.district.toLowerCase().includes(search) ||
        p.mpName.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      );
    }

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return sendJson({
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
      data: paginated
    });
  }

  // Serve static files from the frontend folder
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const publicDir = path.join(__dirname, '..', 'frontend');
  const safePath = path.normalize(path.join(publicDir, filePath));

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    return fs.createReadStream(safePath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Step 1 Server Running: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
