/**
 * MPLADS-SATARK: Audit Inspection Dossier Generator
 * Produces an audit-grade Inspection Memorandum with pre-filled statutory citations,
 * Explain-My-Score evidence, and physical on-ground verification checklist for District Engineers.
 */

const scoringService = require('./scoring_service');

class DossierGenerator {
  generateDossier(project, constituencyContext = null) {
    const scoreData = scoringService.scoreProject(project, constituencyContext);
    const cost = project.fields?.estimated_cost?.value || 0;
    const exp = project.fields?.actual_expenditure?.value || 0;
    const dateGenerated = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const memoNumber = `MEMO/SATARK/${project.state ? project.state.substring(0,3).toUpperCase() : 'IND'}/${project.project_id || 'DEMO-001'}`;

    return {
      memorandum_id: memoNumber,
      date_of_issue: dateGenerated,
      confidentiality_level: 'OFFICIAL — FOR ADMINISTRATIVE AUDIT USE ONLY',
      subject: `Statutory Field Inspection Notice: Preliminary Anomaly Findings on Project ${project.project_id}`,
      project_details: {
        project_id: project.project_id,
        project_title: project.project_title,
        state: project.state,
        district: project.district,
        constituency: project.constituency,
        mp_name: project.mp_name,
        implementing_agency: project.implementing_agency,
        vendor_name: project.vendor_name || 'N/A',
        sanction_cost_inr: cost,
        sanction_cost_formatted: `₹${cost.toLocaleString('en-IN')}`,
        actual_expenditure_formatted: `₹${Math.round(exp).toLocaleString('en-IN')}`,
        status: project.fields?.completion_status?.value || 'In Progress',
        delay_days: project.fields?.delay_days?.value || 0,
        physical_progress_pct: project.fields?.physical_progress_pct?.value || 0
      },
      audit_assessment: {
        priority_score: scoreData.priority_score,
        risk_tier: scoreData.risk_tier,
        tier_color: scoreData.tier_color,
        signals: scoreData.signals,
        waterfall_breakdown: scoreData.explain_my_score
      },
      field_verification_checklist: [
        {
          item_no: 1,
          checkpoint: 'Physical Asset Existence & GPS Co-location',
          instruction: 'Verify whether the structure physically exists at the geo-coordinates indicated on the eSAKSHI work order.',
          statutory_ref: 'MPLADS Guidelines 2023, Clause 4.2 (Inspection of Works)'
        },
        {
          item_no: 2,
          checkpoint: 'Negative List Verification',
          instruction: 'Ensure the facility is not utilized for religious, private commercial, or political purposes.',
          statutory_ref: 'GFR 2017 Rule 130 & MPLADS 2023 Annexure-I'
        },
        {
          item_no: 3,
          checkpoint: 'Cross-Scheme Signboard Inspection',
          instruction: 'Check on-site display board to ensure duplicate PMGSY/MGNREGA boards are not co-erected for this single asset.',
          statutory_ref: 'MPLADS Guidelines 2023, Clause 5.1 (Citizen Information Boards)'
        },
        {
          item_no: 4,
          checkpoint: 'Measurement Book (MB) Reconciliation',
          instruction: 'Reconcile physical dimensions and material grades with CPWD Delhi Schedule of Rates specification subheads.',
          statutory_ref: 'CPWD Works Manual 2019 & GFR Rule 139'
        },
        {
          item_no: 5,
          checkpoint: 'Vendor & Payment Authentication',
          instruction: 'Cross-verify voucher disbursement records with the physical implementing agency cashbook.',
          statutory_ref: 'GFR 2017 Rule 99 (Disbursement & Vouching)'
        }
      ],
      signoff_block: {
        inspecting_officer_title: 'District Inspection Officer / Assistant Engineer',
        countersigning_authority: 'District Magistrate / Deputy Commissioner',
        recommendation_options: [
          'Cleared — No Irregularity Observed',
          'Administrative Correction Required',
          'Statutory Non-Compliance Confirmed — Refer to Competent Authority for Inquiry'
        ]
      }
    };
  }
}

const instance = new DossierGenerator();
module.exports = instance;
