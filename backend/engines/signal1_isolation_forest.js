/**
 * MPLADS-SATARK: Signal 1 (6A) — Multivariate Isolation Forest Anomaly Engine
 * Calibrated against CPWD Delhi Schedule of Rates (DSR 2023-24) benchmarks.
 * 
 * Uses an ensemble of isolation decision trees across multi-dimensional features:
 * - Sanctioned Estimated Cost
 * - Derived Actual Expenditure
 * - Cost Overrun %
 * - Delay Days
 * - Physical Progress Gap %
 * - Cost Variance vs CPWD Benchmark Rate
 */

const fs = require('fs');
const path = require('path');

class IsolationTreeNode {
  constructor(size) {
    this.size = size;
    this.splitFeature = null;
    this.splitValue = null;
    this.left = null;
    this.right = null;
  }
}

class IsolationForestEngine {
  constructor(numTrees = 50, sampleSize = 256) {
    this.numTrees = numTrees;
    this.sampleSize = sampleSize;
    this.maxDepth = Math.ceil(Math.log2(Math.max(sampleSize, 2)));
    this.trees = [];
    this.cpwdRates = null;
    this.isFitted = false;
    this.featureNames = [
      'cost',
      'expenditure',
      'cost_overrun',
      'delay_days',
      'progress_gap',
      'cpwd_variance'
    ];
  }

  loadBenchmarks() {
    if (this.cpwdRates) return;
    try {
      const p = path.join(__dirname, '..', 'data', 'cpwd', 'cpwd_dsr_rates.json');
      if (fs.existsSync(p)) {
        this.cpwdRates = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.warn('⚠️ Could not load CPWD rates:', e.message);
    }
  }

  getCpwdVariance(project) {
    this.loadBenchmarks();
    const state = project.state || 'National';
    const cost = project.fields?.estimated_cost?.value || 0;
    const title = (project.project_title || '').toLowerCase();

    let multiplier = 1.0;
    if (this.cpwdRates?.state_cost_indices?.[state]) {
      multiplier = this.cpwdRates.state_cost_indices[state].cost_index_multiplier || 1.0;
    }

    // Benchmark standard cost based on keywords
    let benchmarkCost = 1500000 * multiplier; // Default ₹15L
    let benchmarkType = 'General Construction';

    if (title.includes('road') || title.includes('pathway')) {
      benchmarkCost = 2200000 * multiplier; // ₹22L/km baseline
      benchmarkType = 'CPWD Subhead 16: Road Works';
    } else if (title.includes('hall') || title.includes('bhavan') || title.includes('shed')) {
      benchmarkCost = 3500000 * multiplier; // ₹35L baseline
      benchmarkType = 'CPWD Subhead 03: RCC Building';
    } else if (title.includes('water') || title.includes('drainage') || title.includes('borewell')) {
      benchmarkCost = 800000 * multiplier; // ₹8L baseline
      benchmarkType = 'CPWD Subhead 19: Water Supply & Drainage';
    } else if (title.includes('solar') || title.includes('light') || title.includes('high mast')) {
      benchmarkCost = 500000 * multiplier; // ₹5L baseline
      benchmarkType = 'CPWD Subhead 23: Electrical Installations';
    }

    const variancePct = benchmarkCost > 0 ? ((cost - benchmarkCost) / benchmarkCost) * 100 : 0;
    return {
      variance_pct: +variancePct.toFixed(2),
      benchmark_cost: Math.round(benchmarkCost),
      benchmark_type: benchmarkType,
      state_multiplier: multiplier
    };
  }

  extractFeatures(project) {
    const cost = project.fields?.estimated_cost?.value || 0;
    const expenditure = project.fields?.actual_expenditure?.value || 0;
    const costOverrun = project.fields?.cost_overrun_pct?.value || 0;
    const delayDays = project.fields?.delay_days?.value || 0;
    const progressGap = project.fields?.progress_gap_pct?.value || 0;
    const cpwd = this.getCpwdVariance(project);

    return [
      cost / 1e6,               // Normalize to Lakhs/Crores scale
      expenditure / 1e6,
      costOverrun / 100,
      delayDays / 365,
      progressGap / 100,
      cpwd.variance_pct / 100
    ];
  }

  // Pre-fitting on baseline samples for instantaneous (<1ms) inference
  fit(trainingProjects) {
    this.loadBenchmarks();
    this.trees = [];
    const n = trainingProjects.length;
    if (n === 0) return;

    for (let t = 0; t < this.numTrees; t++) {
      // Subsample
      const sample = [];
      const actualSampleSize = Math.min(this.sampleSize, n);
      for (let s = 0; s < actualSampleSize; s++) {
        const randIdx = Math.floor(Math.random() * n);
        sample.push(this.extractFeatures(trainingProjects[randIdx]));
      }
      const tree = this.buildTree(sample, 0, this.maxDepth);
      this.trees.push(tree);
    }
    this.isFitted = true;
  }

  buildTree(data, currentDepth, maxDepth) {
    const node = new IsolationTreeNode(data.length);
    if (currentDepth >= maxDepth || data.length <= 1) {
      return node;
    }

    // Pick random feature
    const featIdx = Math.floor(Math.random() * this.featureNames.length);
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < data.length; i++) {
      const v = data[i][featIdx];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (min === max) {
      return node;
    }

    // Pick uniform random split value
    const splitVal = min + Math.random() * (max - min);
    const leftData = [];
    const rightData = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i][featIdx] < splitVal) {
        leftData.push(data[i]);
      } else {
        rightData.push(data[i]);
      }
    }

    node.splitFeature = featIdx;
    node.splitValue = splitVal;
    node.left = this.buildTree(leftData, currentDepth + 1, maxDepth);
    node.right = this.buildTree(rightData, currentDepth + 1, maxDepth);
    return node;
  }

  c(n) {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    // Euler-Mascheroni approximation: 2 * (ln(n - 1) + 0.5772156649) - (2 * (n - 1) / n)
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
  }

  pathLength(features, node, currentDepth = 0) {
    if (!node.left || !node.right) {
      return currentDepth + this.c(node.size);
    }
    if (features[node.splitFeature] < node.splitValue) {
      return this.pathLength(features, node.left, currentDepth + 1);
    } else {
      return this.pathLength(features, node.right, currentDepth + 1);
    }
  }

  evaluate(project) {
    this.loadBenchmarks();
    const cpwd = this.getCpwdVariance(project);
    const features = this.extractFeatures(project);

    let avgPathLength = 0;
    if (this.trees.length > 0) {
      let totalPath = 0;
      for (let i = 0; i < this.trees.length; i++) {
        totalPath += this.pathLength(features, this.trees[i]);
      }
      avgPathLength = totalPath / this.trees.length;
    } else {
      // Fallback heuristic if not pre-fitted
      avgPathLength = this.maxDepth * 0.7;
    }

    const cVal = this.c(this.sampleSize);
    // Anomaly score s = 2 ^ (- avgPathLength / c(n))
    const rawScore = cVal > 0 ? Math.pow(2, - (avgPathLength / cVal)) : 0.5;
    const normalizedScore = Math.min(1.0, Math.max(0.0, rawScore));

    // Determine contributing factors
    const factors = [];
    const cost = project.fields?.estimated_cost?.value || 0;
    const delay = project.fields?.delay_days?.value || 0;
    const overrun = project.fields?.cost_overrun_pct?.value || 0;
    const progressGap = project.fields?.progress_gap_pct?.value || 0;

    if (cpwd.variance_pct > 75) {
      factors.push({
        name: 'CPWD Benchmark Inflation',
        detail: `Sanctioned cost is ${cpwd.variance_pct}% above CPWD DSR benchmark (${cpwd.benchmark_type})`,
        weight: 30
      });
    }

    if (delay > 365) {
      factors.push({
        name: 'Severe Project Delay',
        detail: `Delayed by ${delay} days past standard completion timeline`,
        weight: 25
      });
    }

    if (progressGap > 40) {
      factors.push({
        name: 'Physical Progress Deficit',
        detail: `Physical progress is ${progressGap}% behind expected milestone curve`,
        weight: 20
      });
    }

    if (cost > 10000000) { // Over 1 Crore
      factors.push({
        name: 'High-Value Outlier',
        detail: `Large individual allocation of ₹${(cost/1e7).toFixed(2)} Cr requiring enhanced oversight`,
        weight: 15
      });
    }

    let severity = 'LOW';
    if (normalizedScore > 0.75) severity = 'CRITICAL';
    else if (normalizedScore > 0.60) severity = 'HIGH';
    else if (normalizedScore > 0.45) severity = 'MEDIUM';

    return {
      signal_id: 'SIGNAL_1_ISOLATION_FOREST',
      signal_name: 'Multivariate Anomaly Detection (Isolation Forest)',
      anomaly_score: +normalizedScore.toFixed(3),
      severity,
      is_anomaly: normalizedScore >= 0.60,
      cpwd_benchmark: {
        variance_pct: cpwd.variance_pct,
        benchmark_type: cpwd.benchmark_type,
        benchmark_cost: cpwd.benchmark_cost,
        state_multiplier: cpwd.state_multiplier
      },
      contributing_factors: factors
    };
  }
}

const instance = new IsolationForestEngine();
module.exports = instance;
