/**
 * scripts/build_vercel_precomputed.js
 * 
 * Generates lightweight, pre-computed snapshots of MoSPI dataset and intelligence engine outputs.
 * Allows Vercel Serverless Functions to boot in < 50ms with < 50MB RAM footprint,
 * eliminating the 10s execution timeout and 1GB memory limit crashes.
 */

const fs = require('fs');
const path = require('path');

const vidhiKavach = require('../backend/rules/vidhi_kavach');
const punarDrishti = require('../backend/ml/punar_drishti');
const arthaDarpan = require('../backend/ml/artha_darpan');
const chakraVyuh = require('../backend/ml/chakra_vyuh');
const vibhedNetra = require('../backend/ml/vibhed_netra');
const sankhyaSatya = require('../backend/ml/sankhya_satya');
const bhuDrishti = require('../backend/ml/bhu_drishti');
const compositeScorer = require('../backend/ml/composite_scorer');

const DATA_DIR = path.join(__dirname, '..', 'backend', 'data', 'mospi');
const DATA_FILE = path.join(DATA_DIR, 'real_works_recommended_completed.json');
const PART1_FILE = path.join(DATA_DIR, 'real_works_part1.json');
const PART2_FILE = path.join(DATA_DIR, 'real_works_part2.json');

console.log('🚀 Loading raw MoSPI data...');
let rawData = null;
if (fs.existsSync(DATA_FILE)) {
  rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`✅ Loaded combined file (${rawData.length} records)`);
} else if (fs.existsSync(PART1_FILE) && fs.existsSync(PART2_FILE)) {
  const p1 = JSON.parse(fs.readFileSync(PART1_FILE, 'utf8'));
  const p2 = JSON.parse(fs.readFileSync(PART2_FILE, 'utf8'));
  rawData = [...p1, ...p2];
  console.log(`✅ Loaded split files (${rawData.length} records)`);
} else {
  console.error('❌ Data files not found!');
  process.exit(1);
}

const statesSet = new Set();
const stateCounts = {};
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
let totalTenderSplitsCount = 0;
let totalRoundNumbersCount = 0;
let totalGhostAssetsCount = 0;
let totalSpatialClustersCount = 0;
let totalGeocodedCount = 0;
let totalCriticalRiskCount = 0;
let totalHighRiskCount = 0;

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

// Interleave across states
const stateKeys = Object.keys(byState);
let allProjects = [];
let round = 0;
while (allProjects.length < rawData.length) {
  for (const s of stateKeys) {
    if (round < byState[s].length) {
      allProjects.push(byState[s][round]);
    }
  }
  round++;
}

console.log('🔍 Running PUNAR-DRISHTI...');
const duplicateMap = punarDrishti.analyzeDuplicates(allProjects, 0.85);
allProjects.forEach(p => {
  const dupe = duplicateMap.get(p.id);
  if (dupe) {
    p.duplicate = dupe;
    totalDuplicateClaimsCount++;
    if (dupe.similarityScore === 100) totalExactClonesCount++;
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

console.log('💰 Running ARTHA-DARPAN...');
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

console.log('🕸️ Running CHAKRA-VYUH...');
chakraVyuh.buildFromVouchers();
allProjects.forEach(p => {
  p.chakra = chakraVyuh.evaluateProject(p);
  if (p.chakra.hasCartelRisk) {
    totalCartelRiskCount++;
    if (p.chakra.status === 'MONOPOLY_CARTEL_RISK') totalMonopolyCount++;
  }
});

console.log('🌲 Running VIBHED-NETRA...');
vibhedNetra.calibrate(allProjects);
allProjects.forEach(p => {
  p.vibhed = vibhedNetra.evaluateProject(p);
  if (p.vibhed.isAnomaly) {
    totalMlAnomaliesCount++;
    if (p.vibhed.status === 'CRITICAL_OUTLIER') totalCriticalMlAnomaliesCount++;
    if (p.vibhed.status === 'ELEVATED_RISK') totalElevatedMlAnomaliesCount++;
  }
});

console.log('🔢 Running SANKHYA-SATYA...');
allProjects.forEach(p => {
  p.sankhya = sankhyaSatya.evaluateProject(p);
  if (p.sankhya.isThresholdSplit) totalTenderSplitsCount++;
  if (p.sankhya.isRoundNumber) totalRoundNumbersCount++;
});

console.log('🛰️ Running BHU-DRISHTI...');
allProjects.forEach((p, idx) => {
  p.bhu_drishti = bhuDrishti.evaluateBhuDrishti(p, idx);
  p.lat = p.bhu_drishti.latitude;
  p.lon = p.bhu_drishti.longitude;
  totalGeocodedCount++;
  if (p.bhu_drishti.spatial_anomaly === 'GHOST_ASSET') totalGhostAssetsCount++;
  if (p.bhu_drishti.spatial_anomaly === 'SPATIAL_CLUSTER') totalSpatialClustersCount++;
});

console.log('🎯 Running COMPOSITE SCORER...');
allProjects.forEach(p => {
  p.composite = compositeScorer.calculateCompositeScore(p);
  if (p.composite.tier === 'CRITICAL') totalCriticalRiskCount++;
  if (p.composite.tier === 'HIGH') totalHighRiskCount++;
});

console.log('📊 Assembling Precomputed Stats...');
const stats = {
  totalProjects: allProjects.length,
  totalSanctionedCrore: +(totalSanctionedINR / 1e7).toFixed(2),
  totalStates: statesSet.size,
  totalViolations: totalViolationsCount,
  negativeListCount: totalNegativeListCount,
  marchRushCount: totalMarchRushCount,
  duplicateClaimsCount: totalDuplicateClaimsCount,
  exactClonesCount: totalExactClonesCount,
  compliantCount: allProjects.length - totalViolationsCount,
  inflatedCostCount: totalInflatedCostCount,
  criticalInflationCount: totalCriticalInflationCount,
  moderateInflationCount: totalModerateInflationCount,
  totalExcessCrore: +(totalExcessINR / 1e7).toFixed(2),
  totalVendorsCount: chakraVyuh.vendorStats.size,
  cartelRiskCount: totalCartelRiskCount,
  monopolyCount: totalMonopolyCount,
  totalVouchersCount: chakraVyuh.vouchersCount,
  mlAnomaliesCount: totalMlAnomaliesCount,
  criticalMlAnomaliesCount: totalCriticalMlAnomaliesCount,
  elevatedMlAnomaliesCount: totalElevatedMlAnomaliesCount,
  tenderSplitsCount: totalTenderSplitsCount,
  roundNumbersCount: totalRoundNumbersCount,
  benfordChiSquare: sankhyaSatya.globalStats.chiSquareStat,
  benfordEvaluatedCount: sankhyaSatya.globalStats.totalWorksEvaluated,
  ghostAssetsCount: totalGhostAssetsCount,
  spatialClustersCount: totalSpatialClustersCount,
  geocodedCount: totalGeocodedCount,
  totalGeocodedCount: totalGeocodedCount,
  verifiedGeotagsCount: totalGeocodedCount - totalGhostAssetsCount - totalSpatialClustersCount,
  criticalRiskCount: totalCriticalRiskCount,
  highRiskCount: totalHighRiskCount
};

const states = Object.entries(stateCounts)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

const filterCounts = {
  'violations': totalViolationsCount,
  'compliant': allProjects.length - totalViolationsCount,
  'negative-list': totalNegativeListCount,
  'march-rush': totalMarchRushCount,
  'duplicates': totalDuplicateClaimsCount,
  'exact-clones': totalExactClonesCount,
  'near-clones': totalDuplicateClaimsCount - totalExactClonesCount,
  'inflated': totalInflatedCostCount,
  'critical-inflation': totalCriticalInflationCount,
  'moderate-inflation': totalModerateInflationCount,
  'cartels': totalCartelRiskCount,
  'monopoly': totalMonopolyCount,
  'anomalies': totalMlAnomaliesCount,
  'critical-anomalies': totalCriticalMlAnomaliesCount,
  'elevated-anomalies': totalElevatedMlAnomaliesCount,
  'tender-splits': totalTenderSplitsCount,
  'round-numbers': totalRoundNumbersCount,
  'all-spatial': totalGeocodedCount,
  'ghost-assets': totalGhostAssetsCount,
  'spatial-clusters': totalSpatialClustersCount,
  'verified-geotags': totalGeocodedCount - totalGhostAssetsCount - totalSpatialClustersCount
};

const topCartels = chakraVyuh.getTopCartels(30);
const benfordStats = sankhyaSatya.globalStats;

const egoGraphs = {};
const notableMps = ['SUDAMA PRASAD', 'RAVI SHANKAR PRASAD', 'GIRIRAJ SINGH', 'CHIRAG PASWAN', 'NITYANAND RAI', 'RAJ KUMAR SINGH', 'RADHA MOHAN SINGH'];
const allTargetMps = new Set([...topCartels.map(c => c.mpName), ...notableMps]);
allTargetMps.forEach(mp => {
  const g = chakraVyuh.getEgoGraph(mp);
  if (g && g.nodes && g.nodes.length > 0) {
    egoGraphs[mp] = g;
  }
});

// Compact MP concentration map for live simulation / audits
const mpConcentrationSummary = {};
chakraVyuh.mpConcentration.forEach((rec, mp) => {
  mpConcentrationSummary[mp] = {
    mpName: rec.mpName,
    constituency: rec.constituency,
    totalDisbursed: rec.totalDisbursed,
    hhi: rec.hhi,
    topVendorShare: rec.topVendorShare,
    topVendor: rec.topVendor,
    status: rec.status,
    uniqueVendors: rec.vendors.size
  };
});

const precomputedStats = {
  stats,
  states,
  filterCounts,
  topCartels,
  benfordStats,
  egoGraphs,
  mpConcentrationSummary
};

fs.writeFileSync(
  path.join(DATA_DIR, 'precomputed_stats.json'),
  JSON.stringify(precomputedStats, null, 2),
  'utf8'
);
console.log(`✅ Saved precomputed_stats.json (${Object.keys(egoGraphs).length} ego-graphs indexed)`);

console.log('🎯 Curating High-Density Diverse Project Sample (6,000 records)...');
const selectedMap = new Map();

function addProjects(list, maxCount) {
  let count = 0;
  for (const p of list) {
    if (!selectedMap.has(p.id)) {
      selectedMap.set(p.id, p);
      count++;
      if (count >= maxCount) break;
    }
  }
}

// 1. Ensure at least 40 records per state across all 37 states
states.forEach(st => {
  const stProjs = allProjects.filter(p => p.state === st.name);
  addProjects(stProjs, 40);
});

// 2. High-priority anomaly buckets
const negList = allProjects.filter(p => p.audit && p.audit.violations.some(v => v.ruleId.startsWith('NEG-LIST')));
addProjects(negList, 700);

const marchRush = allProjects.filter(p => p.audit && p.audit.violations.some(v => v.ruleId === 'MARCH-RUSH'));
addProjects(marchRush, 400);

const dupes = allProjects.filter(p => p.duplicate && p.duplicate.isDuplicate);
addProjects(dupes, 600);

const inflated = allProjects.filter(p => p.artha && p.artha.isAnomaly);
addProjects(inflated, 600);

const cartels = allProjects.filter(p => p.chakra && p.chakra.hasCartelRisk);
addProjects(cartels, 600);

const outliers = allProjects.filter(p => p.vibhed && p.vibhed.isAnomaly);
addProjects(outliers, 600);

const tenderSplits = allProjects.filter(p => p.sankhya && p.sankhya.isThresholdSplit);
addProjects(tenderSplits, 500);

const roundNums = allProjects.filter(p => p.sankhya && p.sankhya.isRoundNumber);
addProjects(roundNums, 400);

const ghostAssets = allProjects.filter(p => p.bhu_drishti && p.bhu_drishti.isGhostAsset);
addProjects(ghostAssets, 400);

const spatialClusters = allProjects.filter(p => p.bhu_drishti && p.bhu_drishti.isSpatialCluster);
addProjects(spatialClusters, 400);

const compliant = allProjects.filter(p => p.audit && p.audit.isCompliant && p.composite && p.composite.tier === 'LOW');
addProjects(compliant, 800);

// Fill up to ~6,000 if needed from allProjects
addProjects(allProjects, 6000 - selectedMap.size);

const finalSample = Array.from(selectedMap.values());
console.log(`✅ Selected ${finalSample.length} curated projects!`);

fs.writeFileSync(
  path.join(DATA_DIR, 'precomputed_projects.json'),
  JSON.stringify(finalSample),
  'utf8'
);
const mbSize = (fs.statSync(path.join(DATA_DIR, 'precomputed_projects.json')).size / (1024 * 1024)).toFixed(2);
console.log(`✅ Saved precomputed_projects.json (${mbSize} MB)`);
console.log('🎉 Precomputation complete!');
