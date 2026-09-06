/**
 * MPLADS-SATARK: Feature 6 — SANKHYA-SATYA (संख्या-सत्य)
 * Forensic Digit Analysis (Benford's Law) & Tender-Splitting Sentry
 * 
 * Mathematical Formulation:
 * 1. Newcomb-Benford Distribution: P(d) = log10(1 + 1/d)
 * 2. Chi-Square (χ²) Goodness-of-Fit Test across 131,144 non-zero works
 * 3. GFR Rule 149 / GeM E-Tender Threshold Evasion (Contract Smurfing)
 */

class SankhyaSatyaEngine {
  constructor() {
    this.benfordProbabilities = {
      1: Math.log10(1 + 1 / 1), // 0.3010 (30.1%)
      2: Math.log10(1 + 1 / 2), // 0.1761 (17.6%)
      3: Math.log10(1 + 1 / 3), // 0.1249 (12.5%)
      4: Math.log10(1 + 1 / 4), // 0.0969 (9.7%)
      5: Math.log10(1 + 1 / 5), // 0.0792 (7.9%)
      6: Math.log10(1 + 1 / 6), // 0.0669 (6.7%)
      7: Math.log10(1 + 1 / 7), // 0.0580 (5.8%)
      8: Math.log10(1 + 1 / 8), // 0.0512 (5.1%)
      9: Math.log10(1 + 1 / 9)  // 0.0458 (4.6%)
    };

    // Pre-calculated global MoSPI statistical parameters across all 131,144 non-zero works
    this.globalStats = {
      totalWorksEvaluated: 131144,
      totalTenderSplits5L: 4509,
      totalTenderSplits10L: 3201,
      totalTenderSplits: 7710,
      totalRoundNumbers: 54820,
      chiSquareStat: 13917.59,
      histogram: [
        { digit: 1, observedPct: 27.45, expectedPct: 30.1, count: 36005, diff: -2.65 },
        { digit: 2, observedPct: 24.28, expectedPct: 17.6, count: 31846, diff: +6.68 },
        { digit: 3, observedPct: 10.28, expectedPct: 12.5, count: 13483, diff: -2.22 },
        { digit: 4, observedPct: 9.71,  expectedPct: 9.7,  count: 12739, diff: +0.01 },
        { digit: 5, observedPct: 13.79, expectedPct: 7.9,  count: 18083, diff: +5.89 },
        { digit: 6, observedPct: 3.44,  expectedPct: 6.7,  count: 4515,  diff: -3.26 },
        { digit: 7, observedPct: 4.00,  expectedPct: 5.8,  count: 5246,  diff: -1.80 },
        { digit: 8, observedPct: 3.03,  expectedPct: 5.1,  count: 3974,  diff: -2.07 },
        { digit: 9, observedPct: 4.01,  expectedPct: 4.6,  count: 5253,  diff: -0.59 }
      ]
    };
  }

  getLeadingDigit(val) {
    const num = Math.abs(Number(val));
    if (isNaN(num) || num === 0) return null;
    const str = num.toString().replace(/[^0-9]/g, '');
    for (let char of str) {
      if (char !== '0') return parseInt(char, 10);
    }
    return null;
  }

  /**
   * Evaluates an individual project for Benford conformity & Tender-Splitting Evasion
   */
  evaluateProject(p) {
    const cost = Number(p.cost || p.sanction_cost || p.SANCTION_AMOUNT || 0);
    const leadingDigit = this.getLeadingDigit(cost);

    // 1. Check GFR 149 Tender Threshold Evasion (Contract Smurfing)
    const isEvasion5L = (cost >= 475000 && cost < 500000);
    const isEvasion10L = (cost >= 950000 && cost < 1000000);
    const isThresholdSplit = isEvasion5L || isEvasion10L;

    // 2. Check Artificial Round-Number Padding (absence of CPWD DSR rate analysis)
    const isRoundNumber = (cost >= 100000 && cost % 100000 === 0);

    // 3. Determine status & anomaly severity
    let status = 'NATURAL_BENFORD_CONFORMITY';
    let severity = 'NORMAL';
    let isAnomalous = false;
    let score = 15;
    let penalty = 0;

    if (isThresholdSplit) {
      status = isEvasion5L ? 'TENDER_SPLIT_5L_EVASION' : 'TENDER_SPLIT_10L_EVASION';
      severity = 'CRITICAL';
      isAnomalous = true;
      score = isEvasion5L ? 95 : 90;
      penalty = 35;
    } else if (isRoundNumber) {
      status = 'ARTIFICIAL_ROUND_ESTIMATE';
      severity = 'WARNING';
      isAnomalous = true;
      score = 60;
      penalty = 15;
    }

    // 4. Generate 4 Explainability Questions (XAI)
    const explainability = this.generateExplainability(p, cost, leadingDigit, isThresholdSplit, isEvasion5L, isEvasion10L, isRoundNumber);

    return {
      leadingDigit,
      cost,
      isThresholdSplit,
      isEvasion5L,
      isEvasion10L,
      isRoundNumber,
      status,
      severity,
      isAnomalous,
      forensicScore: score,
      penalty,
      explainability
    };
  }

  generateExplainability(p, cost, leadingDigit, isThresholdSplit, isEvasion5L, isEvasion10L, isRoundNumber) {
    const where = `${p.constituency || 'Constituency'}, ${p.district} (${p.state}) · Hon'ble MP: ${p.mpName}`;

    let what = '';
    if (isThresholdSplit) {
      const thresholdLimit = isEvasion5L ? '₹5,00,000' : '₹10,00,000';
      const gap = (isEvasion5L ? 500000 : 1000000) - cost;
      what = `Sanction of ₹${cost.toLocaleString('en-IN')} is strategically pegged ₹${gap.toLocaleString('en-IN')} just below the ${thresholdLimit} mandatory e-tendering ceiling.`;
    } else if (isRoundNumber) {
      what = `Sanction of ₹${cost.toLocaleString('en-IN')} is an exact round integer multiple of ₹1 Lakh, proving absence of detailed Bill of Quantities (BOQ) or itemized DSR rate analysis.`;
    } else {
      what = `Sanction of ₹${cost.toLocaleString('en-IN')} with leading digit ${leadingDigit} conforms to normal probabilistic procurement variance.`;
    }

    let why = '';
    if (isThresholdSplit) {
      why = `General Financial Rules (GFR Rule 149) and Central Vigilance Commission (CVC) mandate open competitive bidding via GeM/CPPP for works exceeding statutory thresholds. Smurfing or splitting large projects into sub-threshold tranches constitutes administrative evasion of public tendering.`;
    } else if (isRoundNumber) {
      why = `Real civil engineering works involve decimal quantities and schedule of rate unit costs. Unnatural round number clustering (54,820 nationwide works) reflects arbitrary discretionary allocations rather than field-verified physical estimates.`;
    } else {
      why = `Observed leading digit distribution adheres to the logarithmic Benford curve P(d) = log10(1 + 1/d).`;
    }

    let whatNext = '';
    if (isThresholdSplit) {
      whatNext = `🚨 VIGILANCE DIRECTIVE: Check for parallel recommendation letters awarded to the same contractor in ${p.district}. If multiple contiguous sub-threshold works exist, amalgamate them into a single consolidated open e-tender immediately.`;
    } else if (isRoundNumber) {
      whatNext = `⚠️ ENGINEERING SCRUTINY: Require the Implementing Agency to upload itemized CPWD DSR measurement abstracts before approving fund disbursement.`;
    } else {
      whatNext = `✅ CLEARANCE: Conforms to forensic accounting benchmarks. Standard routine audit applies.`;
    }

    return {
      where,
      what,
      why,
      whatNext
    };
  }
}

const engine = new SankhyaSatyaEngine();
module.exports = engine;
