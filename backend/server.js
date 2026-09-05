/**
 * STEP 1: Minimal Clean Server for MPLADS-SATARK
 * Simple, readable, and easy to understand.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vidhiKavach = require('./rules/vidhi_kavach');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'mospi', 'real_works_recommended_completed.json');

let allProjects = [];
let totalSanctionedINR = 0;
let totalViolationsCount = 0;
let totalNegativeListCount = 0;
let totalMarchRushCount = 0;
const statesSet = new Set();
const stateCounts = {};

// 1. Load the real government projects & run VIDHI-KAVACH on them
console.log('Loading real projects data & running VIDHI-KAVACH audit...');
if (fs.existsSync(DATA_FILE)) {
  const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const byState = {};

  rawData.forEach((w, index) => {
    const state = (w.STATE_NAME && w.STATE_NAME.trim()) || 'Other';
    stateCounts[state] = (stateCounts[state] || 0) + 1;
    statesSet.add(state);

    const cost = Number(w.SANCTION_AMOUNT || w.RECOMMENDED_AMOUNT || 0);
    totalSanctionedINR += cost;

    const proj = {
      id: `MPLADS-${String(w.WORK_RECOMMENDATION_DTL_ID || index + 1).padStart(6, '0')}`,
      workDtlId: w.WORK_RECOMMENDATION_DTL_ID || index + 1,
      title: w.WORK_DESCRIPTION || w.ACTIVITY_NAME || 'Public Development Work',
      category: w.WORK_CATEGORY || '',
      state: state,
      district: w.IDA_NAME || w.CONSTITUENCY || 'Unknown District',
      constituency: w.CONSTITUENCY || 'Unknown',
      mpName: w.MP_NAME || 'Unknown MP',
      cost: cost,
      costFormatted: '₹' + cost.toLocaleString('en-IN'),
      status: w.WORK_STAGE || (w.RECOMMENDED_AMOUNT ? 'In Progress' : 'Completed'),
      date: w.SANCTION_DATE || w.RECOMMENDATION_DATE || '2024-06-01'
    };

    // Run VIDHI-KAVACH Statutory Engine
    const audit = vidhiKavach.auditProject(proj);
    proj.audit = audit;

    if (!audit.isCompliant) {
      totalViolationsCount++;
      if (audit.violations.some(v => v.ruleId.startsWith('NEG-LIST'))) {
        totalNegativeListCount++;
      }
      if (audit.violations.some(v => v.ruleId === 'MARCH-RUSH')) {
        totalMarchRushCount++;
      }
    }

    if (!byState[state]) byState[state] = [];
    byState[state].push(proj);
  });

  // Interleave projects across all 36 States/UTs so the default view is nationwide
  const stateKeys = Object.keys(byState);
  allProjects = [];
  let round = 0;
  while (allProjects.length < rawData.length) {
    for (const s of stateKeys) {
      if (round < byState[s].length) {
        allProjects.push(byState[s][round]);
      }
    }
    round++;
  }

  console.log(`✅ Loaded ${allProjects.length} real projects across ${statesSet.size} States!`);
  console.log(`🛡️ VIDHI-KAVACH flagged ${totalViolationsCount} statutory violations (${totalNegativeListCount} Negative List, ${totalMarchRushCount} March Rush)!`);
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
      totalStates: statesSet.size,
      totalViolations: totalViolationsCount,
      negativeListCount: totalNegativeListCount,
      marchRushCount: totalMarchRushCount
    });
  }

  // API 2: All States with Project Counts
  if (pathname === '/api/states') {
    const list = Object.entries(stateCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    return sendJson(list);
  }

  // API 3: Filterable / Paginated Projects List
  if (pathname === '/api/projects') {
    const search = (reqUrl.searchParams.get('search') || '').toLowerCase();
    const filter = (reqUrl.searchParams.get('filter') || 'all').toLowerCase();
    const stateFilter = (reqUrl.searchParams.get('state') || 'all').toLowerCase();
    const page = parseInt(reqUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(reqUrl.searchParams.get('limit') || '20', 10);

    let filtered = allProjects;

    // Apply State Filter
    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(p => p.state.toLowerCase() === stateFilter);
    }

    // Apply Filter Tab
    if (filter === 'violations') {
      filtered = filtered.filter(p => !p.audit.isCompliant);
    } else if (filter === 'compliant') {
      filtered = filtered.filter(p => p.audit.isCompliant);
    } else if (filter === 'negative-list') {
      filtered = filtered.filter(p => p.audit.violations.some(v => v.ruleId.startsWith('NEG-LIST')));
    }

    // Apply Search
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.state.toLowerCase().includes(search) ||
        p.district.toLowerCase().includes(search) ||
        p.mpName.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        (p.audit.violations && p.audit.violations.some(v => 
          v.ruleId.toLowerCase().includes(search) || 
          v.ruleName.toLowerCase().includes(search) ||
          v.matchedKeyword.toLowerCase().includes(search)
        ))
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
