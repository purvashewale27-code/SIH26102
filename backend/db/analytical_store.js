/**
 * MPLADS-SATARK: Analytical Serving Layer
 * High-performance columnar / indexed data store for 176,831 nationwide works,
 * 109,475 payment vouchers, CPWD DSR benchmarks, and Bhuvan assets.
 * 
 * Supports sub-second cold path rollups for:
 * 1. Union Ministry / DIID (National overview)
 * 2. State Nodal Authority (State rollups & inter-district ranking)
 * 3. District Magistrate / Collector (District works & field dispatch)
 * 4. Hon'ble Member of Parliament (Constituency self-check & SC/ST tracker)
 */

const fs = require('fs');
const path = require('path');

class AnalyticalStore {
  constructor() {
    this.projects = [];
    this.projectsById = new Map();
    this.expenditures = [];
    this.cpwdRates = null;
    this.bhuvanAssets = [];
    this.statutoryRules = [];
    this.states = [];
    this.constituencies = [];
    this.mps = [];

    // Indices for ultra-fast filtering
    this.byState = new Map();
    this.byConstituency = new Map();
    this.byMp = new Map();
    this.byAgency = new Map();
    this.byDistrict = new Map();
    this.byRiskTier = new Map();

    this.isLoaded = false;
  }

  loadData() {
    if (this.isLoaded) return;
    const baseDir = path.join(__dirname, '..');
    const startTime = Date.now();

    console.log('⚡ Loading MPLADS-SATARK Analytical Data Store...');

    // 1. Load Unified Projects
    const projectsPath = path.join(baseDir, 'data', 'processed', 'mplads_unified_projects.json');
    if (fs.existsSync(projectsPath)) {
      this.projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    }

    // 2. Load CPWD Rates
    const cpwdPath = path.join(baseDir, 'data', 'cpwd', 'cpwd_dsr_rates.json');
    if (fs.existsSync(cpwdPath)) {
      this.cpwdRates = JSON.parse(fs.readFileSync(cpwdPath, 'utf8'));
    }

    // 3. Load Bhuvan Assets
    const bhuvanPath = path.join(baseDir, 'data', 'bhuvan', 'bhuvan_mgnrega_assets.json');
    if (fs.existsSync(bhuvanPath)) {
      const bhuvanData = JSON.parse(fs.readFileSync(bhuvanPath, 'utf8'));
      this.bhuvanAssets = bhuvanData.assets || [];
    }

    // 4. Load Statutory Rules
    const rulesPath = path.join(baseDir, 'policy', 'statutory_rules.json');
    if (fs.existsSync(rulesPath)) {
      const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
      this.statutoryRules = rulesData.rules || [];
    }

    // 5. Load States & Constituencies & MPs
    const statesPath = path.join(baseDir, 'data', 'mospi', 'states.json');
    if (fs.existsSync(statesPath)) {
      this.states = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
    }
    const constPath = path.join(baseDir, 'data', 'mospi', 'constituencies.json');
    if (fs.existsSync(constPath)) {
      this.constituencies = JSON.parse(fs.readFileSync(constPath, 'utf8'));
    }
    const mpsPath = path.join(baseDir, 'data', 'mospi', 'mps.json');
    if (fs.existsSync(mpsPath)) {
      this.mps = JSON.parse(fs.readFileSync(mpsPath, 'utf8'));
    }

    // 6. Build fast lookup indexes
    for (let i = 0; i < this.projects.length; i++) {
      const p = this.projects[i];
      this.projectsById.set(p.project_id, p);

      // State index
      const st = (p.state || 'UNKNOWN').toUpperCase();
      if (!this.byState.has(st)) this.byState.set(st, []);
      this.byState.get(st).push(p);

      // Constituency index
      const constName = (p.constituency || 'UNKNOWN').toUpperCase();
      if (!this.byConstituency.has(constName)) this.byConstituency.set(constName, []);
      this.byConstituency.get(constName).push(p);

      // MP index
      const mpName = (p.mp_name || 'UNKNOWN').toUpperCase();
      if (!this.byMp.has(mpName)) this.byMp.set(mpName, []);
      this.byMp.get(mpName).push(p);

      // Agency index
      const agency = (p.implementing_agency || 'UNKNOWN').toUpperCase();
      if (!this.byAgency.has(agency)) this.byAgency.set(agency, []);
      this.byAgency.get(agency).push(p);

      // District index
      const dist = (p.district || 'UNKNOWN').toUpperCase();
      if (!this.byDistrict.has(dist)) this.byDistrict.set(dist, []);
      this.byDistrict.get(dist).push(p);
    }

    this.isLoaded = true;
    const elapsed = Date.now() - startTime;
    console.log(`✅ Analytical Store initialized in ${elapsed}ms: ${this.projects.length} projects indexed across ${this.byState.size} states & ${this.byConstituency.size} constituencies.`);
  }

  getProjectById(id) {
    return this.projectsById.get(id) || null;
  }

  queryProjects(filters = {}) {
    let result = this.projects;

    if (filters.state) {
      const st = filters.state.toUpperCase();
      result = this.byState.get(st) || [];
    }

    if (filters.constituency) {
      const cn = filters.constituency.toUpperCase();
      result = result.filter(p => (p.constituency || '').toUpperCase() === cn);
    }

    if (filters.mp_name) {
      const mp = filters.mp_name.toUpperCase();
      result = result.filter(p => (p.mp_name || '').toUpperCase().includes(mp));
    }

    if (filters.district) {
      const dt = filters.district.toUpperCase();
      result = result.filter(p => (p.district || '').toUpperCase() === dt);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        (p.project_title && p.project_title.toLowerCase().includes(q)) ||
        (p.project_id && p.project_id.toLowerCase().includes(q)) ||
        (p.implementing_agency && p.implementing_agency.toLowerCase().includes(q)) ||
        (p.vendor_name && p.vendor_name.toLowerCase().includes(q))
      );
    }

    if (filters.risk_tier) {
      const tier = filters.risk_tier.toUpperCase();
      result = result.filter(p => (p.priority_score_tier || '').toUpperCase() === tier);
    }

    const total = result.length;
    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 50, 10);
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginated
    };
  }

  getNationalSummary() {
    let totalSanctioned = 0;
    let totalExpenditure = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let recommendedCount = 0;
    let delayedCount = 0;
    let marchRushCount = 0;

    for (let i = 0; i < this.projects.length; i++) {
      const p = this.projects[i];
      const cost = p.fields?.estimated_cost?.value || 0;
      const exp = p.fields?.actual_expenditure?.value || 0;
      const status = p.fields?.completion_status?.value || '';
      const isMarch = p.fields?.is_march_rush?.value || false;
      const delay = p.fields?.delay_days?.value || 0;

      totalSanctioned += cost;
      totalExpenditure += exp;
      if (status === 'Completed') completedCount++;
      else if (status === 'In Progress') inProgressCount++;
      else recommendedCount++;

      if (delay > 0) delayedCount++;
      if (isMarch) marchRushCount++;
    }

    return {
      total_projects: this.projects.length,
      total_sanctioned_crore: +(totalSanctioned / 1e7).toFixed(2),
      total_expenditure_crore: +(totalExpenditure / 1e7).toFixed(2),
      utilization_rate_pct: totalSanctioned > 0 ? +((totalExpenditure / totalSanctioned) * 100).toFixed(1) : 0,
      completed_projects: completedCount,
      in_progress_projects: inProgressCount,
      recommended_projects: recommendedCount,
      delayed_projects: delayedCount,
      delayed_pct: +((delayedCount / (this.projects.length || 1)) * 100).toFixed(1),
      march_rush_projects: marchRushCount,
      total_states: this.byState.size,
      total_constituencies: this.byConstituency.size,
      total_agencies: this.byAgency.size
    };
  }

  getStateRollups() {
    const rollups = [];
    for (const [stateName, works] of this.byState.entries()) {
      let cost = 0;
      let exp = 0;
      let completed = 0;
      let delayed = 0;
      let marchRush = 0;

      for (let i = 0; i < works.length; i++) {
        const w = works[i];
        cost += w.fields?.estimated_cost?.value || 0;
        exp += w.fields?.actual_expenditure?.value || 0;
        if (w.fields?.completion_status?.value === 'Completed') completed++;
        if ((w.fields?.delay_days?.value || 0) > 0) delayed++;
        if (w.fields?.is_march_rush?.value) marchRush++;
      }

      rollups.push({
        state: stateName,
        total_projects: works.length,
        sanctioned_crore: +(cost / 1e7).toFixed(2),
        expenditure_crore: +(exp / 1e7).toFixed(2),
        utilization_pct: cost > 0 ? +((exp / cost) * 100).toFixed(1) : 0,
        completed_count: completed,
        completion_rate_pct: +((completed / works.length) * 100).toFixed(1),
        delayed_count: delayed,
        march_rush_count: marchRush
      });
    }

    rollups.sort((a, b) => b.total_projects - a.total_projects);
    return rollups;
  }

  getConstituencySummary(constituencyName) {
    const key = (constituencyName || '').toUpperCase();
    const works = this.byConstituency.get(key) || [];
    if (works.length === 0) return null;

    let cost = 0;
    let exp = 0;
    let completed = 0;
    let scCategoryCost = 0;
    let stCategoryCost = 0;

    for (let i = 0; i < works.length; i++) {
      const w = works[i];
      const c = w.fields?.estimated_cost?.value || 0;
      cost += c;
      exp += w.fields?.actual_expenditure?.value || 0;
      if (w.fields?.completion_status?.value === 'Completed') completed++;

      const cat = (w.work_category || '').toUpperCase();
      if (cat.includes('SC')) scCategoryCost += c;
      if (cat.includes('ST')) stCategoryCost += c;
    }

    const scPct = cost > 0 ? +((scCategoryCost / cost) * 100).toFixed(2) : 0;
    const stPct = cost > 0 ? +((stCategoryCost / cost) * 100).toFixed(2) : 0;

    return {
      constituency: works[0].constituency,
      state: works[0].state,
      mp_name: works[0].mp_name,
      total_projects: works.length,
      sanctioned_crore: +(cost / 1e7).toFixed(2),
      expenditure_crore: +(exp / 1e7).toFixed(2),
      completion_rate_pct: +((completed / works.length) * 100).toFixed(1),
      sc_quota_pct: scPct,
      sc_compliant: scPct >= 15.0,
      st_quota_pct: stPct,
      st_compliant: stPct >= 7.5
    };
  }
}

const storeInstance = new AnalyticalStore();
module.exports = storeInstance;
