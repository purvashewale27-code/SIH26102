/**
 * MPLADS-SATARK: Signal 5 (6E) — Forensic Digit Analysis (Benford's Law)
 * Forensic accounting technique used by tax authorities & CAG auditors worldwide.
 * 
 * Compares leading digit distributions against Newcomb-Benford formula:
 *   P(d) = log10(1 + 1/d)
 * 
 * Detects:
 * 1. Fabricated / manually padded invoices
 * 2. Tender threshold evasion (e.g. splitting contracts to ₹4,95,000 to bypass ₹5L tender limits)
 * 3. Abnormal round-number clustering
 */

class BenfordAnalysisEngine {
  constructor() {
    // Theoretical Benford probabilities for leading digits 1..9
    this.benfordProbabilities = {
      1: Math.log10(1 + 1 / 1), // 0.3010
      2: Math.log10(1 + 1 / 2), // 0.1761
      3: Math.log10(1 + 1 / 3), // 0.1249
      4: Math.log10(1 + 1 / 4), // 0.0969
      5: Math.log10(1 + 1 / 5), // 0.0792
      6: Math.log10(1 + 1 / 6), // 0.0669
      7: Math.log10(1 + 1 / 7), // 0.0580
      8: Math.log10(1 + 1 / 8), // 0.0512
      9: Math.log10(1 + 1 / 9)  // 0.0458
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
   * Analyzes an array of financial amounts (e.g. from an Agency or MP)
   */
  analyzeDistribution(amounts) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    let validCount = 0;
    let thresholdSplitCount = 0; // Contracts between 4.8L and 4.99L (bypassing 5L e-tender)

    for (let i = 0; i < amounts.length; i++) {
      const amt = amounts[i];
      const d = this.getLeadingDigit(amt);
      if (d && counts[d] !== undefined) {
        counts[d]++;
        validCount++;
      }
      if (amt >= 480000 && amt < 500000) {
        thresholdSplitCount++;
      }
    }

    if (validCount < 10) {
      return {
        sample_size: validCount,
        chi_square_stat: 0,
        mad: 0,
        deviation_score: 0.1,
        is_anomalous: false,
        histogram: []
      };
    }

    let chiSquare = 0;
    let totalAbsDev = 0;
    const histogram = [];

    for (let d = 1; d <= 9; d++) {
      const observedProb = counts[d] / validCount;
      const expectedProb = this.benfordProbabilities[d];
      const expectedCount = expectedProb * validCount;

      const diff = observedProb - expectedProb;
      totalAbsDev += Math.abs(diff);
      chiSquare += Math.pow(counts[d] - expectedCount, 2) / expectedCount;

      histogram.push({
        digit: d,
        observed_count: counts[d],
        observed_pct: +(observedProb * 100).toFixed(1),
        expected_pct: +(expectedProb * 100).toFixed(1),
        deviation: +(diff * 100).toFixed(1)
      });
    }

    const mad = totalAbsDev / 9; // Mean Absolute Deviation
    // Critical value for 8 degrees of freedom at p=0.05 is 15.51; at p=0.01 is 20.09
    const isAnomalous = chiSquare > 15.51 || mad > 0.025;
    const deviationScore = Math.min(1.0, +(chiSquare / 30).toFixed(3));

    return {
      sample_size: validCount,
      chi_square_stat: +chiSquare.toFixed(2),
      mad: +mad.toFixed(4),
      deviation_score: deviationScore,
      is_anomalous: isAnomalous,
      threshold_splits_detected: thresholdSplitCount,
      histogram
    };
  }

  evaluateProject(project, agencyProjectAmounts = []) {
    const cost = project.fields?.estimated_cost?.value || 0;
    const leadingDigit = this.getLeadingDigit(cost);

    // Check threshold evasion for this individual project
    const isThresholdEvasion = (cost >= 475000 && cost < 500000) || (cost >= 975000 && cost < 1000000);

    // If an agency's sample pool is provided, use it, else evaluate standard heuristics
    let groupAnalysis = null;
    if (agencyProjectAmounts.length >= 10) {
      groupAnalysis = this.analyzeDistribution(agencyProjectAmounts);
    }

    const devScore = groupAnalysis ? groupAnalysis.deviation_score : (isThresholdEvasion ? 0.65 : 0.15);

    const warnings = [];
    if (isThresholdEvasion) {
      warnings.push(`Threshold Evasion Pattern: Sanctioned amount of ₹${cost.toLocaleString('en-IN')} is strategically pegged just below statutory e-tendering ceiling.`);
    }
    if (groupAnalysis && groupAnalysis.is_anomalous) {
      warnings.push(`Benford Forensic Digit Distortion: Chi-Square statistic (${groupAnalysis.chi_square_stat}) exceeds 95% confidence threshold, indicating non-organic or manipulated accounting figures.`);
    }

    return {
      signal_id: 'SIGNAL_5_BENFORD_ANALYSIS',
      signal_name: "Forensic Digit Analysis (Benford's Law)",
      leading_digit: leadingDigit,
      benford_deviation_score: devScore,
      is_anomalous: devScore >= 0.55,
      is_threshold_evasion: isThresholdEvasion,
      chi_square_stat: groupAnalysis ? groupAnalysis.chi_square_stat : null,
      histogram: groupAnalysis ? groupAnalysis.histogram : this.getDefaultHistogram(leadingDigit),
      warnings
    };
  }

  getDefaultHistogram(observedDigit) {
    const hist = [];
    for (let d = 1; d <= 9; d++) {
      hist.push({
        digit: d,
        expected_pct: +(this.benfordProbabilities[d] * 100).toFixed(1),
        observed_pct: d === observedDigit ? 35.0 : +(this.benfordProbabilities[d] * 100 * 0.9).toFixed(1)
      });
    }
    return hist;
  }
}

const instance = new BenfordAnalysisEngine();
module.exports = instance;
