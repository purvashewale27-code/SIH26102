/**
 * MPLADS-SATARK: Priority Score Aggregator & Explain-My-Score Waterfall Service
 * Combines all 6 independent detection signals into an explainable, audit-defensible 0-100 score.
 * 
 * Every point is itemized with:
 * - Signal source
 * - Human-readable reason
 * - Honest Provenance Badge: REAL, DERIVED, ESTIMATED, or STATUTORY
 * - Legal / statutory citations where applicable
 */

const signal1 = require('../engines/signal1_isolation_forest');
const signal2 = require('../engines/signal2_graph_network');
const signal3 = require('../engines/signal3_statutory_rules');
const signal4 = require('../engines/signal4_deduplication');
const signal5 = require('../engines/signal5_benford_analysis');
const signal6 = require('../engines/signal6_survival_analysis');

class ScoringService {
  constructor() {
    this.isInitialized = false;
  }

  initialize(trainingProjects = []) {
    if (this.isInitialized) return;
    if (trainingProjects && trainingProjects.length > 0) {
      signal1.fit(trainingProjects.slice(0, 1000));
      signal2.buildGraph(trainingProjects);
    }
    this.isInitialized = true;
  }

  /**
   * Scores a single project across all 6 engines.
   * Returns Priority Score (0-100), Risk Tier, and Additive Waterfall breakdown.
   */
  scoreProject(project, constituencyContext = null) {
    const s1 = signal1.evaluate(project);
    const s2 = signal2.evaluateProject(project);
    const s3 = signal3.evaluateProject(project, constituencyContext);
    const s4 = signal4.evaluateProject(project);
    const s5 = signal5.evaluateProject(project);
    const s6 = signal6.evaluateProject(project);

    const waterfall = [];
    let cumulativeScore = 5; // Base baseline score for active tracking

    waterfall.push({
      factor: 'Baseline Administrative Tracking',
      points: 5,
      cumulative: 5,
      provenance: 'REAL',
      detail: 'Standard entry-level baseline across national audit registry.'
    });

    // 1. Signal 1: Isolation Forest & CPWD variance
    if (s1.cpwd_benchmark?.variance_pct > 50) {
      const pts = Math.min(30, Math.round(s1.cpwd_benchmark.variance_pct * 0.25));
      cumulativeScore += pts;
      waterfall.push({
        factor: 'CPWD Schedule of Rates Variance',
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'DERIVED',
        detail: `Sanctioned cost is ${s1.cpwd_benchmark.variance_pct}% higher than standard ${s1.cpwd_benchmark.benchmark_type} benchmark.`
      });
    }

    if (s1.is_anomaly) {
      const pts = 15;
      cumulativeScore += pts;
      waterfall.push({
        factor: 'Multivariate ML Outlier (Isolation Forest)',
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'REAL AI',
        detail: `Unusual multi-dimensional profile across cost, progress gap, and timeline duration (Isolation anomaly score: ${s1.anomaly_score}).`
      });
    }

    // 2. Signal 2: Network Graph & Concentration
    if (s2.concentration_share_pct > 40) {
      const pts = s2.concentration_share_pct > 65 ? 25 : 15;
      cumulativeScore += pts;
      waterfall.push({
        factor: 'Agency Fund Concentration / Cartelization Risk',
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'REAL AI',
        detail: `${s2.concentration_share_pct}% of the MP's total works have been captured by this single agency.`
      });
    }

    if (s2.cross_constituencies_count > 5) {
      const pts = 10;
      cumulativeScore += pts;
      waterfall.push({
        factor: 'Cross-Constituency Network Monopolization',
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'REAL AI',
        detail: `Agency operates across ${s2.cross_constituencies_count} different parliamentary constituencies.`
      });
    }

    // 3. Signal 3: Statutory Rules & Policy
    if (!s3.is_compliant) {
      for (const v of s3.violations) {
        const pts = v.penalty_points || 20;
        cumulativeScore += pts;
        waterfall.push({
          factor: `Statutory Non-Compliance: [${v.rule_id}]`,
          points: pts,
          cumulative: cumulativeScore,
          provenance: v.provenance || 'STATUTORY',
          detail: `${v.message} (Citation: ${v.citation})`
        });
      }
    }

    // 4. Signal 4: Deduplication
    if (s4.is_duplicate_risk && s4.matched_asset) {
      const pts = Math.min(30, Math.round(s4.duplicate_likelihood_pct * 0.35));
      cumulativeScore += pts;
      waterfall.push({
        factor: 'Cross-Scheme Double Invoicing Hazard',
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'ESTIMATED',
        detail: s4.explanation
      });
    }

    // 5. Signal 5: Benford Forensic Digit Analysis
    if (s5.is_threshold_evasion) {
      const pts = 20;
      cumulativeScore += pts;
      waterfall.push({
        factor: 'Tender Ceiling Evasion (Split Contracts)',
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'DERIVED',
        detail: `Sanctioned amount is pegged just beneath mandatory e-tendering threshold to avoid competitive bidding.`
      });
    } else if (s5.is_anomalous) {
      const pts = 15;
      cumulativeScore += pts;
      waterfall.push({
        factor: "Benford's Law Forensic Digit Distortion",
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'DERIVED',
        detail: `Disbursement distribution significantly deviates from natural Benford logarithmic curve (Chi-Square: ${s5.chi_square_stat}).`
      });
    }

    // 6. Signal 6: Cox Survival Analysis (Zombie Project)
    if (s6.is_zombie_project) {
      const pts = 20;
      cumulativeScore += pts;
      waterfall.push({
        factor: "'Zombie Project' Perpetual Stall Warning",
        points: pts,
        cumulative: cumulativeScore,
        provenance: 'DERIVED',
        detail: `Survival hazard model forecasts only ${s6.completion_probabilities.at_6_months_pct}% likelihood of completion within 6 months.`
      });
    }

    // Clamp score to 100
    const finalScore = Math.min(100, Math.max(0, cumulativeScore));

    // Determine Risk Tier
    let tier = 'LOW';
    let tierColor = '#10b981'; // Green
    if (finalScore >= 80) {
      tier = 'CRITICAL';
      tierColor = '#ef4444'; // Red
    } else if (finalScore >= 60) {
      tier = 'HIGH';
      tierColor = '#f97316'; // Orange
    } else if (finalScore >= 35) {
      tier = 'MEDIUM';
      tierColor = '#f59e0b'; // Amber
    }

    return {
      priority_score: finalScore,
      risk_tier: tier,
      tier_color: tierColor,
      signals: {
        signal1_isolation_forest: s1,
        signal2_network_graph: s2,
        signal3_statutory_rules: s3,
        signal4_deduplication: s4,
        signal5_benford_analysis: s5,
        signal6_survival_analysis: s6
      },
      explain_my_score: waterfall
    };
  }
}

const instance = new ScoringService();
module.exports = instance;
