/**
 * backend/ml/composite_scorer.js
 * 
 * Unified Priority Risk Index (0-100) & Additive Waterfall Breakdown
 * Aggregates all 7 independent forensic sentinels into an explainable, audit-defensible composite score.
 * 
 * Score Tiers:
 * - CRITICAL (Score >= 75): 🚨 Immediate Field Vigilance Inquiry
 * - HIGH (Score 55 - 74): ⚠️ Detailed Technical & Rate Audit
 * - ELEVATED (Score 35 - 54): ⚡ Routine Sample Verification
 * - LOW (Score < 35): ✅ Statutorily Compliant & Low Risk
 */

function calculateCompositeScore(p) {
  const waterfall = [];
  let score = 5; // Baseline monitoring score across national audit registry

  waterfall.push({
    engine: 'ADMIN_TRACKING',
    signal: 'Standard Administrative Monitoring Baseline',
    points: 5,
    cumulative: 5,
    provenance: 'REAL',
    citation: 'MoSPI National Project Baseline',
    desc: 'Mandatory central monitoring tracking under MPLADS 2023 Guidelines.'
  });

  // 1. FEATURE 1: VIDHI-KAVACH (Statutory Negative List & March Rush)
  if (p.audit && !p.audit.isCompliant) {
    const isNeg = p.audit.violations && p.audit.violations.some(v => v.ruleId && v.ruleId.startsWith('NEG-LIST'));
    const isRush = p.audit.violations && p.audit.violations.some(v => v.ruleId === 'MARCH-RUSH');
    
    if (isNeg) {
      score += 25;
      waterfall.push({
        engine: 'VIDHI-KAVACH',
        signal: 'Annexure-I Prohibited Negative List Breach',
        points: 25,
        cumulative: score,
        provenance: 'STATUTORY',
        citation: 'MPLADS Guidelines 2023 Annexure-I & GFR Rule 130',
        desc: 'Ineligible work category: places of worship, commercial trusts, or private entities.'
      });
    }
    if (isRush) {
      score += 15;
      waterfall.push({
        engine: 'VIDHI-KAVACH',
        signal: 'March Rush Fiscal Year-End Dumping (GFR 62)',
        points: 15,
        cumulative: score,
        provenance: 'STATUTORY',
        citation: 'General Financial Rules 2017 Rule 62',
        desc: 'Sanctioned during final 10 days of March to prevent lapse of central allocations.'
      });
    }
  }

  // 2. FEATURE 2: PUNAR-DRISHTI (NLP Duplicate & Double-Billing Sentry)
  if (p.duplicate && p.duplicate.isDuplicate) {
    const isExact = p.duplicate.similarityScore === 100;
    const pts = isExact ? 30 : 20;
    score += pts;
    waterfall.push({
      engine: 'PUNAR-DRISHTI',
      signal: isExact ? '100% Exact Title Clone in District' : `Near-Duplicate Claim (${p.duplicate.similarityScore}%)`,
      points: pts,
      cumulative: score,
      provenance: 'REAL AI',
      citation: 'GFR 2017 Rule 99 & MoSPI Guidelines Para 5.1',
      desc: `Twin claim flagged against ${p.duplicate.matchedId || 'prior work'} in ${p.district || 'district'} (${p.duplicate.matchedCost || ''}).`
    });
  }

  // 3. FEATURE 3: ARTHA-DARPAN (CPWD DSR Cost Benchmark Sentry)
  if (p.artha && p.artha.isAnomaly) {
    const isCrit = p.artha.status === 'CRITICAL_INFLATION';
    const pts = isCrit ? 25 : 15;
    score += pts;
    waterfall.push({
      engine: 'ARTHA-DARPAN',
      signal: isCrit ? 'Critical Cost Inflation (+100% to +400%)' : `Price Padding Variance (+${p.artha.costDeviationPct}%)`,
      points: pts,
      cumulative: score,
      provenance: 'DERIVED',
      citation: 'CPWD Delhi Schedule of Rates (DSR 2023-24) & GFR Rule 139',
      desc: `Sanctioned at ${p.costFormatted || ('₹' + p.cost)} vs state peer benchmark of ${p.artha.peerMedianFormatted || 'median'} (Excess: ${p.artha.excessCostFormatted || 'N/A'}).`
    });
  }

  // 4. FEATURE 4: CHAKRA-VYUH (Vendor Cartel & Monopoly Sentry)
  if (p.chakra && p.chakra.hasCartelRisk) {
    const isMono = p.chakra.status === 'MONOPOLY_CARTEL_RISK';
    const pts = isMono ? 25 : 15;
    score += pts;
    waterfall.push({
      engine: 'CHAKRA-VYUH',
      signal: isMono ? `Single-Vendor Monopoly (${p.chakra.topVendorShare}% Funds)` : `High Market Concentration (HHI: ${p.chakra.hhiIndex})`,
      points: pts,
      cumulative: score,
      provenance: 'REAL AI',
      citation: 'Central Vigilance Commission (CVC) Procurement Directives',
      desc: `Contractor "${p.chakra.vendorName || p.chakra.topVendor}" dominates sanctions under ${p.chakra.agencyName || 'agency'}.`
    });
  }

  // 5. FEATURE 5: VIBHED-NETRA (12D Isolation Forest Anomaly Sentry)
  if (p.vibhed && p.vibhed.isAnomaly) {
    const isCrit = p.vibhed.status === 'CRITICAL_OUTLIER';
    const pts = isCrit ? 25 : 15;
    score += pts;
    waterfall.push({
      engine: 'VIBHED-NETRA',
      signal: `12D Isolation Forest Outlier (Score: ${p.vibhed.anomalyScore}/100)`,
      points: pts,
      cumulative: score,
      provenance: 'REAL AI',
      citation: 'Multivariate Tree Isolation (IEEE ICDM 2008)',
      desc: `High multidimensional dissonance across budget, progress gap, and timeline duration.`
    });
  }

  // 6. FEATURE 6: SANKHYA-SATYA (Benford Forensic Digit Sentry)
  if (p.sankhya && p.sankhya.isThresholdSplit) {
    score += 20;
    waterfall.push({
      engine: 'SANKHYA-SATYA',
      signal: 'GFR Rule 149 E-Tender Threshold Evasion (Tender-Splitting)',
      points: 20,
      cumulative: score,
      provenance: 'STATUTORY',
      citation: 'General Financial Rules 2017 Rule 149',
      desc: `Sanctioned just below ceiling to evade mandatory public e-tendering.`
    });
  }

  // 7. FEATURE 7: BHU-DRISHTI (Geospatial Satellite & Ghost Asset Radar)
  if (p.bhu_drishti) {
    if (p.bhu_drishti.isGhostAsset) {
      score += 25;
      waterfall.push({
        engine: 'BHU-DRISHTI',
        signal: 'Ghost Asset: Disbursed Without Verified GPS Geotag',
        points: 25,
        cumulative: score,
        provenance: 'GIS',
        citation: 'MPLADS 2023 Guidelines Para 4.3 (Mandatory Geotagging)',
        desc: `High financial disbursement on paper lacking verified mobile GPS ground footprint.`
      });
    } else if (p.bhu_drishti.isSpatialCluster) {
      score += 15;
      waterfall.push({
        engine: 'BHU-DRISHTI',
        signal: `Hyper-Local Cluster (${p.bhu_drishti.clusterCount} works within ${p.bhu_drishti.clusterRadius}m)`,
        points: 15,
        cumulative: score,
        provenance: 'GIS',
        citation: 'GFR 2017 Rule 139 (Public Benefit Dispersion)',
        desc: `Excessive spatial concentration under same executing agency.`
      });
    }
  }

  const finalScore = Math.min(100, score);
  let tier = 'LOW';
  let tierColor = '#059669';
  if (finalScore >= 75) {
    tier = 'CRITICAL';
    tierColor = '#dc2626';
  } else if (finalScore >= 55) {
    tier = 'HIGH';
    tierColor = '#d97706';
  } else if (finalScore >= 35) {
    tier = 'ELEVATED';
    tierColor = '#7c3aed';
  }

  return {
    score: finalScore,
    tier: tier,
    tierColor: tierColor,
    waterfall: waterfall,
    totalFactors: waterfall.length
  };
}

module.exports = {
  calculateCompositeScore
};
