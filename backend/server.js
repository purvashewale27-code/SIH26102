/**
 * STEP 1: Minimal Clean Server for MPLADS-SATARK
 * Simple, readable, and easy to understand.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vidhiKavach = require('./rules/vidhi_kavach');
const punarDrishti = require('./ml/punar_drishti');
const arthaDarpan = require('./ml/artha_darpan');
const chakraVyuh = require('./ml/chakra_vyuh');
const vibhedNetra = require('./ml/vibhed_netra');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'mospi', 'real_works_recommended_completed.json');

let allProjects = [];
let totalSanctionedINR = 0;
let totalViolationsCount = 0;
let totalNegativeListCount = 0;
let totalMarchRushCount = 0;
let totalDuplicateClaimsCount = 0;
let totalExactClonesCount = 0;
let totalInflatedCostCount = 0;
let totalCriticalInflationCount = 0;
let totalModerateInflationCount = 0;
let totalExcessINR = 0;
let totalCartelRiskCount = 0;
let totalMonopolyCount = 0;
let totalMlAnomaliesCount = 0;
let totalCriticalMlAnomaliesCount = 0;
let totalElevatedMlAnomaliesCount = 0;
const statesSet = new Set();
const stateCounts = {};

// 1. Load the real government projects & run VIDHI-KAVACH + PUNAR-DRISHTI on them
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

  // 2. Run PUNAR-DRISHTI (Vaibhav's TF-IDF Duplicate Detector)
  const duplicateMap = punarDrishti.analyzeDuplicates(allProjects, 0.85);
  allProjects.forEach(p => {
    const dupe = duplicateMap.get(p.id);
    if (dupe) {
      p.duplicate = dupe;
      totalDuplicateClaimsCount++;
      if (dupe.similarityScore === 100) {
        totalExactClonesCount++;
      }
      p.audit.violations.push({
        ruleId: dupe.ruleId,
        ruleName: dupe.ruleName,
        clause: dupe.clause,
        severity: dupe.severity,
        penalty: dupe.penalty,
        matchedKeyword: `${dupe.similarityScore}% Match with ${dupe.matchedId}`,
        explanation: dupe.explanation,
        matchedTitle: dupe.matchedTitle,
        matchedId: dupe.matchedId,
        matchedCost: dupe.matchedCost
      });
      p.audit.isCompliant = false;
      p.audit.riskScore = Math.min(100, p.audit.riskScore + dupe.penalty);
    }
  });

  // 3. Run ARTHA-DARPAN (Feature 3: AI Cost Benchmark & Overpricing Sentry)
  arthaDarpan.train(allProjects);
  allProjects.forEach(p => {
    p.artha = arthaDarpan.evaluateProject(p);
    if (p.artha.isAnomaly) {
      totalInflatedCostCount++;
      if (p.artha.status === 'CRITICAL_INFLATION') totalCriticalInflationCount++;
      if (p.artha.status === 'MODERATE_INFLATION') totalModerateInflationCount++;
      totalExcessINR += p.artha.excessCost;
    }
  });

  // 4. Run CHAKRA-VYUH (Feature 4: Contractor Cartel & Vendor Nexus Sentry)
  chakraVyuh.buildFromVouchers();
  allProjects.forEach(p => {
    p.chakra = chakraVyuh.evaluateProject(p);
    if (p.chakra.hasCartelRisk) {
      totalCartelRiskCount++;
      if (p.chakra.status === 'MONOPOLY_CARTEL_RISK') totalMonopolyCount++;
    }
  });

  // 5. Run VIBHED-NETRA (Feature 5: 12-Dimensional Isolation Forest & Multi-Feature Anomaly Sentry)
  vibhedNetra.calibrate(allProjects);
  allProjects.forEach(p => {
    p.vibhed = vibhedNetra.evaluateProject(p);
    if (p.vibhed.isAnomaly) {
      totalMlAnomaliesCount++;
      if (p.vibhed.status === 'CRITICAL_OUTLIER') totalCriticalMlAnomaliesCount++;
      if (p.vibhed.status === 'ELEVATED_RISK') totalElevatedMlAnomaliesCount++;
    }
  });

  console.log(`✅ Loaded ${allProjects.length} real projects across ${statesSet.size} States!`);
  console.log(`🛡️ VIDHI-KAVACH: ${totalViolationsCount} statutory violations (${totalNegativeListCount} Negative List, ${totalMarchRushCount} March Rush)`);
  console.log(`🔍 PUNAR-DRISHTI: ${totalDuplicateClaimsCount} duplicate works (${totalExactClonesCount} exact 100% clones)`);
  console.log(`💰 ARTHA-DARPAN: ${totalInflatedCostCount} cost anomalies (₹${(totalExcessINR / 1e7).toFixed(1)} Cr excess risk flagged)`);
  console.log(`🕸️ CHAKRA-VYUH: ${totalCartelRiskCount} contractor cartel risks across ${chakraVyuh.vendorStats.size} vendors`);
  console.log(`🌲 VIBHED-NETRA: ${totalMlAnomaliesCount} multi-dimensional anomalies (${totalCriticalMlAnomaliesCount} critical outliers)`);
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
      marchRushCount: totalMarchRushCount,
      duplicateClaimsCount: totalDuplicateClaimsCount,
      exactClonesCount: totalExactClonesCount,
      compliantCount: allProjects.length - totalViolationsCount,
      // Feature 3: ARTHA-DARPAN
      inflatedCostCount: totalInflatedCostCount,
      criticalInflationCount: totalCriticalInflationCount,
      moderateInflationCount: totalModerateInflationCount,
      totalExcessCrore: +(totalExcessINR / 1e7).toFixed(2),
      // Feature 4: CHAKRA-VYUH
      totalVendorsCount: chakraVyuh.vendorStats.size,
      cartelRiskCount: totalCartelRiskCount,
      monopolyCount: totalMonopolyCount,
      totalVouchersCount: chakraVyuh.vouchersCount,
      // Feature 5: VIBHED-NETRA
      mlAnomaliesCount: totalMlAnomaliesCount,
      criticalMlAnomaliesCount: totalCriticalMlAnomaliesCount,
      elevatedMlAnomaliesCount: totalElevatedMlAnomaliesCount
    });
  }

  // API 2: All States with Project Counts
  if (pathname === '/api/states') {
    const list = Object.entries(stateCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    return sendJson(list);
  }

  // API 2B: Top Cartel Constituencies
  if (pathname === '/api/top-cartels') {
    return sendJson(chakraVyuh.getTopCartels(20));
  }

  // API 2C: Ego-Network Graph for an MP
  if (pathname === '/api/cartel-graph') {
    const mp = reqUrl.searchParams.get('mp') || 'SUDAMA PRASAD';
    return sendJson(chakraVyuh.getEgoGraph(mp));
  }

  // API 3: Filterable / Paginated Projects List
  if (pathname === '/api/projects') {
    const search = (reqUrl.searchParams.get('search') || '').toLowerCase();
    const filter = (reqUrl.searchParams.get('filter') || 'all').toLowerCase();
    const stateFilter = (reqUrl.searchParams.get('state') || 'all').toLowerCase();
    const mode = (reqUrl.searchParams.get('mode') || 'all').toLowerCase();
    const page = parseInt(reqUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(reqUrl.searchParams.get('limit') || '20', 10);

    let filtered = allProjects;

    // Feature Mode Separation defaults
    if (mode === 'punar-drishti') {
      if (!filter || filter === 'duplicates') {
        filtered = filtered.filter(p => p.duplicate && p.duplicate.isDuplicate);
      }
    } else if (mode === 'vidhi-kavach') {
      if (!filter || filter === 'violations') {
        filtered = filtered.filter(p => p.audit.violations.some(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH'));
      }
    } else if (mode === 'artha-darpan') {
      if (!filter || filter === 'inflated') {
        filtered = filtered.filter(p => p.artha && p.artha.isAnomaly);
      }
    } else if (mode === 'chakra-vyuh') {
      if (!filter || filter === 'cartels') {
        filtered = filtered.filter(p => p.chakra && p.chakra.hasCartelRisk);
      }
    } else if (mode === 'vibhed-netra') {
      if (!filter || filter === 'anomalies') {
        filtered = filtered.filter(p => p.vibhed && p.vibhed.isAnomaly);
      }
    }

    // Apply State Filter
    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(p => p.state.toLowerCase() === stateFilter);
    }

    // Apply Specific Filter Tabs
    if (filter === 'violations') {
      filtered = filtered.filter(p => p.audit.violations.some(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH'));
    } else if (filter === 'compliant') {
      filtered = filtered.filter(p => p.audit.isCompliant);
    } else if (filter === 'negative-list') {
      filtered = filtered.filter(p => p.audit.violations.some(v => v.ruleId.startsWith('NEG-LIST')));
    } else if (filter === 'march-rush') {
      filtered = filtered.filter(p => p.audit.violations.some(v => v.ruleId === 'MARCH-RUSH'));
    } else if (filter === 'duplicates') {
      filtered = filtered.filter(p => p.duplicate && p.duplicate.isDuplicate);
    } else if (filter === 'exact-clones') {
      filtered = filtered.filter(p => p.duplicate && p.duplicate.similarityScore === 100);
    } else if (filter === 'near-clones') {
      filtered = filtered.filter(p => p.duplicate && p.duplicate.similarityScore >= 80 && p.duplicate.similarityScore < 100);
    } else if (filter === 'inflated') {
      filtered = filtered.filter(p => p.artha && p.artha.isAnomaly);
    } else if (filter === 'critical-inflation') {
      filtered = filtered.filter(p => p.artha && p.artha.status === 'CRITICAL_INFLATION');
    } else if (filter === 'moderate-inflation') {
      filtered = filtered.filter(p => p.artha && p.artha.status === 'MODERATE_INFLATION');
    } else if (filter === 'underquoted') {
      filtered = filtered.filter(p => p.artha && p.artha.status === 'UNVIABLE_UNDERQUOTING');
    } else if (filter === 'fair-estimate') {
      filtered = filtered.filter(p => p.artha && p.artha.status === 'FAIR_MARKET');
    } else if (filter === 'cartels') {
      filtered = filtered.filter(p => p.chakra && p.chakra.hasCartelRisk);
    } else if (filter === 'monopoly') {
      filtered = filtered.filter(p => p.chakra && p.chakra.status === 'MONOPOLY_CARTEL_RISK');
    } else if (filter === 'elevated') {
      filtered = filtered.filter(p => p.chakra && p.chakra.status === 'ELEVATED_CONCENTRATION');
    } else if (filter === 'competitive') {
      filtered = filtered.filter(p => p.chakra && !p.chakra.hasCartelRisk);
    } else if (filter === 'anomalies') {
      filtered = filtered.filter(p => p.vibhed && p.vibhed.isAnomaly);
    } else if (filter === 'critical-anomalies') {
      filtered = filtered.filter(p => p.vibhed && p.vibhed.status === 'CRITICAL_OUTLIER');
    } else if (filter === 'elevated-anomalies') {
      filtered = filtered.filter(p => p.vibhed && p.vibhed.status === 'ELEVATED_RISK');
    } else if (filter === 'inliers') {
      filtered = filtered.filter(p => p.vibhed && p.vibhed.status === 'HEALTHY_INLIER');
    }

    // Apply Search
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.state.toLowerCase().includes(search) ||
        p.district.toLowerCase().includes(search) ||
        p.mpName.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        (p.duplicate && (
          p.duplicate.matchedId.toLowerCase().includes(search) ||
          p.duplicate.matchedTitle.toLowerCase().includes(search)
        )) ||
        (p.audit.violations && p.audit.violations.some(v => 
          v.ruleId.toLowerCase().includes(search) || 
          v.ruleName.toLowerCase().includes(search) ||
          (v.matchedKeyword && v.matchedKeyword.toLowerCase().includes(search))
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
