/**
 * MPLADS-SATARK: Official Audit Inspection Memorandum (Form GFR-19A / Vigilance Notice)
 * Generates official, printable audit inspection memorandums with:
 * - Official MoSPI / DIID Header & Government of India Seal
 * - Barcode & Unique Memo Number (MEMO/SATARK/STATE/ID)
 * - Project Metadata & Sanction Particulars
 * - Comprehensive Sentinel Audit Assessment (Composite Risk Score 0-100 & Waterfall)
 * - Exact Statutory Violations with GFR 2017 & MPLADS 2023 Rule Citations
 * - 5-Point Mandatory Field Engineer Inspection Checklist
 * - District Magistrate / Collector Countersignature Block
 */

const scoringService = require('./scoring_service');

class DossierGenerator {
  generateDossier(project, constituencyContext = null) {
    const projId = project.id || project.project_id || 'DEMO-001';
    const projTitle = project.title || project.project_title || 'Untitled Infrastructure Work';
    const state = project.state || 'National';
    const district = project.district || 'District';
    const constituency = project.constituency || 'Parliamentary Constituency';
    const mpName = project.mpName || project.mp_name || 'Hon. Member of Parliament';
    const agency = project.implementingAgency || project.implementing_agency || 'District Rural Development Agency (DRDA)';
    const vendor = project.vendorName || project.vendor_name || (project.chakra && project.chakra.vendorName) || 'M/S Maa Sharda Construction Pvt Ltd';
    const cost = Number(project.cost || project.fields?.estimated_cost?.value || 0);
    const costFormatted = project.costFormatted || `₹${cost.toLocaleString('en-IN')}`;
    const status = project.status || project.fields?.completion_status?.value || 'Under Execution';

    const dateGenerated = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const stateCode = (state.replace(/[^a-zA-Z]/g, '').substring(0, 3) || 'IND').toUpperCase();
    const memoNumber = `MEMO/SATARK/${stateCode}/${projId}`;
    const barcodeCode = `*SATARK-${stateCode}-${projId}*`;

    // Extract Composite Score & Waterfall
    let compositeScore = 15;
    let riskTier = 'LOW';
    let tierColor = '#10b981';
    let waterfall = [];

    if (project.composite) {
      compositeScore = project.composite.score;
      riskTier = project.composite.tier;
      tierColor = project.composite.tierBadge?.color || (compositeScore >= 75 ? '#ef4444' : compositeScore >= 55 ? '#f59e0b' : '#3b82f6');
      waterfall = project.composite.waterfall || [];
    } else {
      const scoreData = scoringService.scoreProject(project, constituencyContext);
      compositeScore = scoreData.priority_score;
      riskTier = scoreData.risk_tier;
      tierColor = scoreData.tier_color;
      waterfall = scoreData.explain_my_score || [];
    }

    // Compile itemized statutory violations for official table
    const statutoryViolations = [];

    // 1. Negative list / March rush
    if (project.audit && project.audit.violations) {
      project.audit.violations.forEach(v => {
        statutoryViolations.push({
          sentinel: 'VIDHI-KAVACH',
          ruleId: v.ruleId || 'GFR-130',
          ruleName: v.ruleName || 'Statutory Non-Compliance',
          legalClause: v.clause || 'MPLADS Guidelines 2023 Annexure-I / GFR Rule 130',
          finding: v.detail || v.ruleName,
          severity: 'CRITICAL'
        });
      });
    }

    // 2. Duplicate Work
    if (project.duplicate && project.duplicate.isDuplicate) {
      statutoryViolations.push({
        sentinel: 'PUNAR-DRISHTI',
        ruleId: 'PUNAR-01',
        ruleName: 'Lexical Twin Work / Duplicate Allocation',
        legalClause: 'GFR 2017 Rule 99 & Anti-Duplication Guideline',
        finding: project.duplicate.explanation || `Duplicate claim flagged with work ${project.duplicate.matchedId}.`,
        severity: 'HIGH'
      });
    }

    // 3. Cost Anomaly
    if (project.artha && project.artha.isAnomaly) {
      statutoryViolations.push({
        sentinel: 'ARTHA-DARPAN',
        ruleId: 'DSR-DEV',
        ruleName: 'CPWD Schedule of Rates Benchmark Deviation',
        legalClause: 'CPWD Works Manual 2019 & GFR Rule 139',
        finding: project.artha.explanation || `Cost deviates by ${project.artha.costDeviationPct}% from peer median.`,
        severity: project.artha.severity || 'HIGH'
      });
    }

    // 4. Cartel Monopoly
    if (project.chakra && project.chakra.hasCartelRisk) {
      statutoryViolations.push({
        sentinel: 'CHAKRA-VYUH',
        ruleId: 'CARTEL-MONOPOLY',
        ruleName: 'Market Concentration & Single-Vendor Monopoly',
        legalClause: 'CVC Procurement Directives & Competition Act 2002',
        finding: project.chakra.explanation || `Single vendor controls ${project.chakra.topVendorShare}% of constituency allocations.`,
        severity: project.chakra.severity || 'CRITICAL'
      });
    }

    // 5. Multi-dimensional Anomaly
    if (project.vibhed && project.vibhed.isAnomaly) {
      statutoryViolations.push({
        sentinel: 'VIBHED-NETRA',
        ruleId: 'IFOREST-OUTLIER',
        ruleName: 'Multivariate Isolation Forest Structural Outlier',
        legalClause: 'GFR 2017 Rule 144 & CVC Forensic Standards',
        finding: project.vibhed.explainability?.what || `Extreme statistical anomaly score ${project.vibhed.anomalyScore}/100.`,
        severity: project.vibhed.severity || 'CRITICAL'
      });
    }

    // 6. Benford / Tender-Splitting
    if (project.sankhya && project.sankhya.isAnomalous) {
      statutoryViolations.push({
        sentinel: 'SANKHYA-SATYA',
        ruleId: project.sankhya.isThresholdSplit ? 'GFR-149-SPLIT' : 'ROUND-ESTIMATE',
        ruleName: project.sankhya.isThresholdSplit ? 'Tender Threshold Evasion (Contract Smurfing)' : 'Artificial Round Estimate',
        legalClause: 'General Financial Rules (GFR 2017 Rule 149) & CVC Circulars',
        finding: project.sankhya.explainability?.what || 'Work sanctioned just below mandatory e-tender ceiling.',
        severity: project.sankhya.severity || 'CRITICAL'
      });
    }

    // 7. Ghost Asset / Spatial Anomaly
    if (project.bhu_drishti && (project.bhu_drishti.isGhostAsset || project.bhu_drishti.isSpatialCluster)) {
      statutoryViolations.push({
        sentinel: 'BHU-DRISHTI',
        ruleId: project.bhu_drishti.isGhostAsset ? 'GEO-GHOST' : 'GEO-CLUSTER',
        ruleName: project.bhu_drishti.isGhostAsset ? 'Disbursement Without Verified Geotag' : 'Hyper-Local Geocoordinate Clustering',
        legalClause: 'MPLADS 2023 Para 4.2 & Remote Sensing Field Verification Protocol',
        finding: project.bhu_drishti.anomaly_description || project.bhu_drishti.anomalyDesc || 'Spatial verification required before fund release.',
        severity: project.bhu_drishti.risk_level || 'CRITICAL'
      });
    }

    return {
      memoNumber,
      barcodeCode,
      dateOfIssue: dateGenerated,
      authority: 'Ministry of Statistics & Programme Implementation (MoSPI)',
      division: 'Data Informatics & Innovation Division (DIID)',
      vigilanceCell: 'MPLADS-SATARK Central AI Vigilance Core',
      confidentialityLevel: 'OFFICIAL — VIGILANCE INQUIRY NOTICE',
      subject: `Statutory Vigilance Inspection Memorandum: Forensic Findings on Work ID ${projId}`,
      project: {
        id: projId,
        workDtlId: project.workDtlId || projId,
        title: projTitle,
        state,
        district,
        constituency,
        mpName,
        implementingAgency: agency,
        vendorName: vendor,
        category: project.category || 'General Civil Work',
        sanctionCost: cost,
        sanctionCostFormatted: costFormatted,
        sanctionDate: project.sanctionDate || project.date || 'N/A',
        status,
        financialProgress: project.financialProgress != null ? project.financialProgress : 100,
        physicalProgress: project.physicalProgress != null ? project.physicalProgress : 70,
        provenanceTag: project.provenance || 'REAL: MoSPI eSAKSHI'
      },
      auditAssessment: {
        compositeScore,
        riskTier,
        tierColor,
        totalSignalsFlagged: statutoryViolations.length,
        waterfallBreakdown: waterfall
      },
      statutoryViolations,
      fieldChecklist: [
        {
          itemNo: 1,
          checkpoint: 'Physical Asset Existence & GPS Ground Co-location',
          instruction: 'Conduct physical site visit at registered coordinates. Measure asset dimensions against approved architectural drawing.',
          legalClause: 'MPLADS Guidelines 2023, Clause 4.2 (Inspection of Works)'
        },
        {
          itemNo: 2,
          checkpoint: 'Negative List Verification (Annexure-I)',
          instruction: 'Verify on-ground that the structure is NOT inside religious, trust-owned, political, or private commercial premises.',
          legalClause: 'GFR 2017 Rule 130 & MPLADS 2023 Annexure-I'
        },
        {
          itemNo: 3,
          checkpoint: 'Cross-Scheme Multi-Funding Board Audit',
          instruction: 'Inspect physical signage. Ensure no parallel boards (PMGSY, MGNREGA, Smart City) are erected claiming the same asset.',
          legalClause: 'MPLADS Guidelines 2023, Clause 5.1 (Citizen Information Boards)'
        },
        {
          itemNo: 4,
          checkpoint: 'Measurement Book (MB) Reconciliation',
          instruction: 'Reconcile site measurements with MB entries and CPWD DSR subheads before recommending next tranche.',
          legalClause: 'CPWD Works Manual 2019 & GFR Rule 139'
        },
        {
          itemNo: 5,
          checkpoint: 'Vendor & Implementing Agency Cashbook Vouching',
          instruction: 'Cross-verify eSAKSHI disbursement transaction vouchers against physical treasury passbook and bank statement.',
          legalClause: 'GFR 2017 Rule 99 (Disbursement & Vouching)'
        }
      ],
      signoffBlock: {
        inspectingOfficer: 'Executive Engineer / District Inspection Officer (Designated)',
        countersigningAuthority: 'District Magistrate & Collector (Competent Authority)',
        humanInTheLoopDisclaimer: 'CONFIDENTIAL: Generated by MPLADS-SATARK under Rule 144(i) GFR 2017. This memorandum serves as an advisory technical inquiry notice. Final legal orders rest exclusively with the District Authority.'
      }
    };
  }
}

const instance = new DossierGenerator();
module.exports = instance;
