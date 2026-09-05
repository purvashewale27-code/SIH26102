/**
 * MPLADS-SATARK (सतर्क)
 * Master Client Controller
 * Complete UI & Feature Separation:
 *  - Mode 1: VIDHI-KAVACH (Statutory Policy Shield)
 *  - Mode 2: PUNAR-DRISHTI (NLP Duplicate Sentry)
 *  - Mode 3: ARTHA-DARPAN (AI Cost Benchmark & Overpricing Sentry)
 *  - Mode 4: CHAKRA-VYUH (Contractor Cartel & Vendor Nexus Graph)
 *  - Mode 5: ALL-INDIA REPOSITORY (Master MoSPI Explorer)
 */

let currentMode = 'vidhi-kavach'; // Default to Feature 1
let currentFilter = 'violations';
let currentState = 'all';
let currentSearch = '';
let currentPage = 1;
const limit = 20;
let currentLoadedProjects = [];
let statsData = null;

document.addEventListener('DOMContentLoaded', () => {
  setupModeSwitcher();
  setupEventListeners();
  loadStats().then(() => {
    switchMode('vidhi-kavach'); // Default to Feature 1
    loadStates();
  });
});

// 1. Feature Mode Switcher Setup
function setupModeSwitcher() {
  const modeTabs = document.querySelectorAll('.mode-tab');
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selectedMode = tab.getAttribute('data-mode');
      if (selectedMode !== currentMode) {
        switchMode(selectedMode);
      }
    });
  });

  // Cartel MP Dropdown change listener
  const cartelSelect = document.getElementById('cartel-mp-select');
  if (cartelSelect) {
    cartelSelect.addEventListener('change', (e) => {
      loadCartelGraph(e.target.value);
    });
  }
}

// 2. Switch Mode - Completely isolates UI, KPIs, Filters, Table and Modals
function switchMode(newMode) {
  currentMode = newMode;
  currentPage = 1;
  currentSearch = '';
  document.getElementById('search-input').value = '';

  // Toggle active tab buttons
  document.querySelectorAll('.mode-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-mode') === currentMode);
  });

  // Graph section visibility (only visible in chakra-vyuh mode)
  const graphSec = document.getElementById('chakra-graph-section');
  if (graphSec) {
    graphSec.style.display = currentMode === 'chakra-vyuh' ? 'block' : 'none';
  }

  // ==========================================
  // MODE 1: VIDHI-KAVACH (Statutory Shield)
  // ==========================================
  if (currentMode === 'vidhi-kavach') {
    currentFilter = 'violations';

    setFeatureHeader(
      '🛡️ FEATURE 1: VIDHI-KAVACH (विधि-कवच — Statutory Policy Shield)',
      'Annexure-I Negative List & GFR 62 March Rush Sentry',
      'Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 Statutory Rules',
      '#fef2f2', '#b91c1c', '#fecaca'
    );

    renderKPIs({
      c1: { label: 'Total Works Audited', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: '100% Nationwide MoSPI eSAKSHI Data' },
      c2: { label: 'Statutorily Compliant', val: statsData ? statsData.compliantCount.toLocaleString('en-IN') : '158,074', desc: 'Zero statutory breaches detected', color: 'text-green' },
      c3: { label: 'Negative List Breaches', val: statsData ? statsData.negativeListCount.toLocaleString('en-IN') : '15,953', desc: 'Places of worship & commercial trusts', color: 'text-red', isDanger: true },
      c4: { label: 'March Rush Violations', val: statsData ? statsData.marchRushCount.toLocaleString('en-IN') : '3,204', desc: 'Sanctioned in final 10 days of March (GFR 62)', isWarning: true }
    });

    renderFilterTabs([
      { id: 'violations', label: '🚨 All Statutory Red Flags', count: statsData ? statsData.totalViolations : 18851, cls: 'danger-tab active' },
      { id: 'negative-list', label: '🛑 Negative List Breaches', count: statsData ? statsData.negativeListCount : 15953, cls: 'danger-tab' },
      { id: 'march-rush', label: '⏳ March Rush (GFR 62)', count: statsData ? statsData.marchRushCount : 3204, cls: 'warning-tab' },
      { id: 'compliant', label: '✅ Statutorily Compliant Works', count: statsData ? statsData.compliantCount : 158074, cls: 'success-tab' },
      { id: 'all', label: '📋 All 176,925 Works', count: statsData ? statsData.totalProjects : 176925, cls: '' }
    ]);

    document.getElementById('th-audit-col').innerText = 'Statutory Audit Verdict (VIDHI-KAVACH)';
    setRoadmap(
      '🛡️ Feature 1: VIDHI-KAVACH (विधि-कवच) Live in Action',
      'VIDHI-KAVACH audits every project against the official <b>MPLADS 2023 Negative List (Annexure-I)</b> (prohibiting works on places of worship, commercial trusts, clubs) and <b>GFR Rule 62</b> (preventing fiscal year-end March rush). Click any red flag row to inspect the full statutory clause and penalty citation.'
    );

  // ==========================================
  // MODE 2: PUNAR-DRISHTI (NLP Duplicate Sentry)
  // ==========================================
  } else if (currentMode === 'punar-drishti') {
    currentFilter = 'duplicates';

    setFeatureHeader(
      '🔍 FEATURE 2: PUNAR-DRISHTI (पुनर्दृष्टि — NLP Duplicate Sentry)',
      'Cross-Work Lexical NLP Twin Work & Double-Billing Sentry',
      "Vaibhav's TF-IDF & Cosine Similarity Engine detecting duplicate project claims across India",
      '#f5f3ff', '#6d28d9', '#ddd6fe'
    );

    const dupeTotal = statsData ? statsData.duplicateClaimsCount : 10204;
    const exactTotal = statsData ? statsData.exactClonesCount : 6965;
    const nearTotal = dupeTotal - exactTotal;

    renderKPIs({
      c1: { label: 'Total Works Scanned', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: 'Across all 36 States & UTs' },
      c2: { label: 'Duplicate Claims Flagged', val: dupeTotal.toLocaleString('en-IN'), desc: 'Cross-work twin assets in district', isPurple: true },
      c3: { label: '100% Exact Clones', val: exactTotal.toLocaleString('en-IN'), desc: 'Identical work descriptions in district', color: 'text-red', isDanger: true },
      c4: { label: 'Near-Clones (85%–99%)', val: nearTotal.toLocaleString('en-IN'), desc: 'Slight variations in title phrasing', isWarning: true }
    });

    renderFilterTabs([
      { id: 'duplicates', label: '🔍 All Duplicate Claims', count: dupeTotal, cls: 'purple-tab active' },
      { id: 'exact-clones', label: '⚠️ 100% Exact Title Clones', count: exactTotal, cls: 'purple-tab' },
      { id: 'near-clones', label: '⚡ Near-Clones (85%–99%)', count: nearTotal, cls: 'purple-tab' },
      { id: 'all', label: '📋 All 176,925 Scanned Works', count: statsData ? statsData.totalProjects : 176925, cls: '' }
    ]);

    document.getElementById('th-audit-col').innerText = 'Duplicate Sentry Analysis (PUNAR-DRISHTI)';
    setRoadmap(
      '🔍 Feature 2: PUNAR-DRISHTI (पुनर्दृष्टि) Live in Action',
      "PUNAR-DRISHTI applies <b>Vaibhav's TF-IDF tokenization and Cosine Similarity</b> to compare project descriptions within each district. It flags identical work titles (100% exact clones) and rephrased works (85–99% near clones) to prevent double-billing on the same physical asset. Click any duplicate row to inspect both claims side-by-side."
    );

  // ==========================================
  // MODE 3: ARTHA-DARPAN (Cost Inflation Sentry)
  // ==========================================
  } else if (currentMode === 'artha-darpan') {
    currentFilter = 'inflated';

    setFeatureHeader(
      '💰 FEATURE 3: ARTHA-DARPAN (अर्थ-दर्पण — AI Cost Benchmark & Overpricing Sentry)',
      'CPWD Schedule of Rates (DSR) & Statistical Peer-Group Benchmark Analyzer',
      'Auditing project budgets against State DSR Multipliers and category peer medians to prevent treasury overbilling',
      '#fffbeb', '#b45309', '#fde68a'
    );

    const inflatedTotal = statsData ? statsData.inflatedCostCount : 69170;
    const critTotal = statsData ? statsData.criticalInflationCount : 27978;
    const modTotal = statsData ? statsData.moderateInflationCount : 12858;
    const excessCr = statsData ? statsData.totalExcessCrore : 3639.86;

    renderKPIs({
      c1: { label: 'Total Works Evaluated', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: 'Calibrated against CPWD Rates' },
      c2: { label: 'Cost Anomalies Flagged', val: inflatedTotal.toLocaleString('en-IN'), desc: 'Deviating from peer benchmarks', isWarning: true },
      c3: { label: 'Critical Inflation (+100%+)', val: critTotal.toLocaleString('en-IN'), desc: 'Sanctioned at ≥ 2x peer median', color: 'text-red', isDanger: true },
      c4: { label: 'Total Excess Cost Risk', val: `₹${excessCr.toLocaleString('en-IN')} Cr`, desc: 'Cumulative price-padding risk flagged', isDanger: true }
    });

    renderFilterTabs([
      { id: 'inflated', label: '💰 All Cost Anomalies', count: inflatedTotal, cls: 'warning-tab active' },
      { id: 'critical-inflation', label: '🚨 Critical Inflation (+100% to +400%)', count: critTotal, cls: 'danger-tab' },
      { id: 'moderate-inflation', label: '⚠️ Moderate Inflation (+50% to +100%)', count: modTotal, cls: 'warning-tab' },
      { id: 'underquoted', label: '📉 Unviable Under-Bids (<-40%)', count: 28334, cls: 'warning-tab' },
      { id: 'fair-estimate', label: '✅ Fair Market Pricing', count: 107755, cls: 'success-tab' }
    ]);

    document.getElementById('th-audit-col').innerText = 'Cost Benchmark Verdict (ARTHA-DARPAN)';
    setRoadmap(
      '💰 Feature 3: ARTHA-DARPAN (अर्थ-दर्पण) Live in Action',
      'ARTHA-DARPAN unifies <b>Vaibhav’s peer-group distribution algorithm</b> with <b>official Central Public Works Department (CPWD) Delhi Schedule of Rates (DSR)</b>. It calculates the median cost for every work category in each State and flags projects sanctioned at 2x to 4x standard rates. Click any row to view the cost deviation breakdown.'
    );

  // ==========================================
  // MODE 4: CHAKRA-VYUH (Contractor Cartel Graph)
  // ==========================================
  } else if (currentMode === 'chakra-vyuh') {
    currentFilter = 'cartels';

    setFeatureHeader(
      '🕸️ FEATURE 4: CHAKRA-VYUH (चक्रव्यूह — Contractor Cartel & Vendor Nexus Graph)',
      'Herfindahl-Hirschman Index (HHI) Monopoly Sentry & Interactive Ego-Network',
      'Forensic analysis of 109,475 payment vouchers across 27,234 registered contractors and 7,231 implementing agencies',
      '#fff1f2', '#be123c', '#fecdd3'
    );

    const cartelTotal = statsData ? statsData.cartelRiskCount : 47302;
    const monopolyTotal = statsData ? statsData.monopolyCount : 23920;
    const vendorTotal = statsData ? statsData.totalVendorsCount : 27234;

    renderKPIs({
      c1: { label: 'Registered Contractors', val: vendorTotal.toLocaleString('en-IN'), desc: 'From official MoSPI payment ledgers' },
      c2: { label: 'Cartel / Monopoly Risks', val: cartelTotal.toLocaleString('en-IN'), desc: 'Works linked to dominant syndicates', isDanger: true },
      c3: { label: 'Single-Vendor Monopolies', val: monopolyTotal.toLocaleString('en-IN'), desc: '1 vendor taking ≥ 60% MP funds', color: 'text-red', isDanger: true },
      c4: { label: 'Payment Vouchers Analyzed', val: '109,521', desc: 'Real transaction vouchers mapped', color: 'text-blue' }
    });

    renderFilterTabs([
      { id: 'cartels', label: '🕸️ All Cartel & Monopoly Risks', count: cartelTotal, cls: 'danger-tab active' },
      { id: 'monopoly', label: '🚨 Single-Vendor Monopolies (≥60% Funds)', count: monopolyTotal, cls: 'danger-tab' },
      { id: 'elevated', label: '⚠️ Elevated Concentration (HHI > 2200)', count: cartelTotal - monopolyTotal, cls: 'warning-tab' },
      { id: 'competitive', label: '✅ Competitive Bidding Allocation', count: 129623, cls: 'success-tab' }
    ]);

    document.getElementById('th-audit-col').innerText = 'Vendor Nexus Verdict (CHAKRA-VYUH)';
    setRoadmap(
      '🕸️ Feature 4: CHAKRA-VYUH (चक्रव्यूह) Live in Action',
      'CHAKRA-VYUH uses graph theory and the <b>Herfindahl-Hirschman Index (HHI)</b> to detect vendor cartels and procurement monopolies. It reveals when a single contractor company corners the vast majority of an MP’s recommendations. Select any high-concentration constituency above to interact with the live ego-network graph.'
    );

    loadCartelGraph(document.getElementById('cartel-mp-select').value);

  // ==========================================
  // MODE 5: ALL-INDIA REPOSITORY (Master Explorer)
  // ==========================================
  } else {
    currentFilter = 'all';

    setFeatureHeader(
      '🇮🇳 ALL-INDIA REPOSITORY (Master MoSPI Explorer)',
      'Nationwide MoSPI eSAKSHI Project Repository',
      '176,925 Real Government Projects across 36 States and Union Territories',
      '#eff6ff', '#1d4ed8', '#bfdbfe'
    );

    renderKPIs({
      c1: { label: 'Total Government Works', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: '100% Real MoSPI Data' },
      c2: { label: 'Total Sanctioned Amount', val: statsData ? `₹${statsData.totalSanctionedCrore.toLocaleString('en-IN')} Cr` : '₹7,908.5 Cr', desc: 'Approved central allocations', color: 'text-blue' },
      c3: { label: 'States & UTs Covered', val: statsData ? `${statsData.totalStates} States / UTs` : '37 States / UTs', desc: 'Complete national coverage', color: 'text-green' },
      c4: { label: 'Total Multi-Engine Red Flags', val: statsData ? (statsData.totalViolations + statsData.duplicateClaimsCount).toLocaleString('en-IN') : '29,055', desc: 'Combined intelligence findings', color: 'text-red', isDanger: true }
    });

    renderFilterTabs([
      { id: 'all', label: '🌐 All 176,925 Works', count: statsData ? statsData.totalProjects : 176925, cls: 'active' },
      { id: 'violations', label: '🛡️ Feature 1 Violations', count: statsData ? statsData.totalViolations : 18851, cls: 'danger-tab' },
      { id: 'duplicates', label: '🔍 Feature 2 Duplicates', count: statsData ? statsData.duplicateClaimsCount : 10204, cls: 'purple-tab' },
      { id: 'inflated', label: '💰 Feature 3 Cost Anomalies', count: statsData ? statsData.inflatedCostCount : 69170, cls: 'warning-tab' },
      { id: 'cartels', label: '🕸️ Feature 4 Cartel Risks', count: statsData ? statsData.cartelRiskCount : 47302, cls: 'danger-tab' },
      { id: 'compliant', label: '✅ Fully Compliant Works', count: statsData ? statsData.compliantCount : 158074, cls: 'success-tab' }
    ]);

    document.getElementById('th-audit-col').innerText = 'SATARK Combined Health';
    setRoadmap(
      '🇮🇳 SATARK Unified All-India Multi-Engine Sentry',
      'Explore any project from Kashmir to Kanyakumari. Select any State/UT from the dropdown above or enter keywords to inspect central allocations, MPs, and multi-engine forensic audits.'
    );
  }

  loadProjects();
}

// Helper: Set Feature Header Titles & Colors
function setFeatureHeader(tagHtml, title, subtitle, bg, color, border) {
  const tag = document.getElementById('view-feature-tag');
  tag.className = 'feature-tag';
  tag.style.background = bg;
  tag.style.color = color;
  tag.style.borderColor = border;
  tag.innerHTML = tagHtml;

  document.getElementById('view-heading').innerText = title;
  document.getElementById('view-subheading').innerText = subtitle;
}

// Helper: Set Bottom Roadmap Callout
function setRoadmap(titleHtml, descHtml) {
  document.getElementById('roadmap-title').innerHTML = titleHtml;
  document.getElementById('roadmap-desc').innerHTML = descHtml;
}

// 3. Render Dynamic KPI Row
function renderKPIs(kpis) {
  const c1 = document.getElementById('kpi-c1');
  const c2 = document.getElementById('kpi-c2');
  const c3 = document.getElementById('kpi-c3');
  const c4 = document.getElementById('kpi-c4');

  [c1, c2, c3, c4].forEach(c => {
    c.className = 'kpi-card';
    c.style.background = '';
    c.style.borderColor = '';
  });

  // Card 1
  document.getElementById('kpi-c1-label').innerText = kpis.c1.label;
  document.getElementById('kpi-c1-val').className = `kpi-number ${kpis.c1.color || ''}`;
  document.getElementById('kpi-c1-val').innerText = kpis.c1.val;
  document.getElementById('kpi-c1-desc').innerText = kpis.c1.desc;

  // Card 2
  document.getElementById('kpi-c2-label').innerText = kpis.c2.label;
  document.getElementById('kpi-c2-val').className = `kpi-number ${kpis.c2.color || ''}`;
  document.getElementById('kpi-c2-val').innerText = kpis.c2.val;
  document.getElementById('kpi-c2-desc').innerText = kpis.c2.desc;
  if (kpis.c2.isPurple) {
    c2.style.background = '#faf5ff';
    c2.style.borderColor = '#ddd6fe';
    document.getElementById('kpi-c2-val').style.color = '#7c3aed';
  } else if (kpis.c2.isWarning) {
    c2.style.background = '#fffbeb';
    c2.style.borderColor = '#fde68a';
    document.getElementById('kpi-c2-val').style.color = '#d97706';
  } else if (kpis.c2.isDanger) {
    c2.classList.add('kpi-card-danger');
  }

  // Card 3
  document.getElementById('kpi-c3-label').innerText = kpis.c3.label;
  document.getElementById('kpi-c3-val').className = `kpi-number ${kpis.c3.color || ''}`;
  document.getElementById('kpi-c3-val').innerText = kpis.c3.val;
  document.getElementById('kpi-c3-desc').innerText = kpis.c3.desc;
  if (kpis.c3.isDanger) {
    c3.classList.add('kpi-card-danger');
  }

  // Card 4
  document.getElementById('kpi-c4-label').innerText = kpis.c4.label;
  document.getElementById('kpi-c4-val').className = `kpi-number ${kpis.c4.color || ''}`;
  document.getElementById('kpi-c4-val').innerText = kpis.c4.val;
  document.getElementById('kpi-c4-desc').innerText = kpis.c4.desc;
  if (kpis.c4.isWarning) {
    c4.style.background = '#fffbeb';
    c4.style.borderColor = '#fde68a';
    document.getElementById('kpi-c4-val').style.color = '#d97706';
  } else if (kpis.c4.isDanger) {
    c4.classList.add('kpi-card-danger');
  }
}

// 4. Render Dynamic Filter Tabs
function renderFilterTabs(tabs) {
  const container = document.getElementById('filter-tab-bar');
  container.innerHTML = '';

  tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `filter-tab ${t.cls}`;
    btn.setAttribute('data-filter', t.id);
    btn.innerHTML = `${t.label} <span class="tab-count-badge" style="font-size:11px;opacity:0.85;margin-left:4px;">(${t.count.toLocaleString('en-IN')})</span>`;

    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = t.id;
      currentPage = 1;
      loadProjects();
    });

    container.appendChild(btn);
  });
}

// 5. Setup General Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      currentPage = 1;
      loadProjects();
    }, 300);
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadProjects();
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    loadProjects();
  });

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-dismiss-btn').addEventListener('click', closeModal);
  document.getElementById('audit-modal').addEventListener('click', (e) => {
    if (e.target.id === 'audit-modal') closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// 6. Fetch Top Summary Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    statsData = await res.json();
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// 7. Fetch States for Dropdown
async function loadStates() {
  try {
    const res = await fetch('/api/states');
    if (!res.ok) return;
    const states = await res.json();
    const select = document.getElementById('state-select');
    select.innerHTML = '<option value="all">🇮🇳 All 36 States & UTs (All-India)</option>';
    states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.innerText = `${s.name} (${s.count.toLocaleString('en-IN')} works)`;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      currentState = e.target.value;
      currentPage = 1;
      loadProjects();
    });
  } catch (err) {
    console.error('Failed to load states list:', err);
  }
}

// 8. Fetch Paginated Project Works
async function loadProjects() {
  const tbody = document.getElementById('projects-tbody');
  const modeLabels = {
    'vidhi-kavach': 'Auditing works with VIDHI-KAVACH Statutory Shield...',
    'punar-drishti': 'Scanning works with PUNAR-DRISHTI NLP Duplicate Sentry...',
    'artha-darpan': 'Evaluating project budgets with ARTHA-DARPAN CPWD Rate Sentry...',
    'chakra-vyuh': 'Tracing vendor contracts with CHAKRA-VYUH Cartel Sentry...',
    'all-works': 'Loading nationwide MoSPI records...'
  };

  tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">${modeLabels[currentMode] || 'Loading...'}</td></tr>`;

  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: limit,
      search: currentSearch,
      filter: currentFilter,
      state: currentState,
      mode: currentMode
    });

    const res = await fetch(`/api/projects?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load projects');
    const result = await res.json();

    currentLoadedProjects = result.data || [];
    if (currentLoadedProjects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No projects found matching current criteria.</td></tr>';
      document.getElementById('prev-btn').disabled = true;
      document.getElementById('next-btn').disabled = true;
      document.getElementById('page-info').innerText = 'Page 0 of 0';
      return;
    }

    tbody.innerHTML = '';
    currentLoadedProjects.forEach((p) => {
      const tr = document.createElement('tr');
      tr.className = 'clickable-row';

      const audit = p.audit || { isCompliant: true, status: 'COMPLIANT', violations: [] };
      const dupe = p.duplicate;
      const artha = p.artha;
      const chakra = p.chakra;
      let badgeHtml = '';

      // ==========================================
      // CLEAN SEPARATION IN TABLE COLUMN 6
      // ==========================================
      if (currentMode === 'vidhi-kavach') {
        // ONLY FEATURE 1 (VIDHI-KAVACH) BADGES
        const firstViol = audit.violations.find(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
        if (firstViol) {
          const isNegList = firstViol.ruleId.startsWith('NEG-LIST');
          const badgeClass = isNegList ? 'audit-badge-danger' : 'audit-badge-warning';
          const kwHtml = firstViol.matchedKeyword ? `<span class="badge-kw">"${firstViol.matchedKeyword}"</span>` : '';
          badgeHtml = `
            <div class="audit-badge ${badgeClass}">
              <span class="badge-tag">🚨 ${firstViol.ruleId} (+${firstViol.penalty} pts)</span>
              <span class="badge-desc">${firstViol.ruleName} ${kwHtml}</span>
            </div>
          `;
        } else {
          badgeHtml = `
            <div class="audit-badge audit-badge-success">
              <span class="badge-tag">✅ COMPLIANT</span>
              <span class="badge-desc">Zero Guidelines Breach</span>
            </div>
          `;
        }

      } else if (currentMode === 'punar-drishti') {
        // ONLY FEATURE 2 (PUNAR-DRISHTI) BADGES
        if (dupe && dupe.isDuplicate) {
          const isExact = dupe.similarityScore === 100;
          badgeHtml = `
            <div class="audit-badge audit-badge-purple">
              <span class="badge-tag">${isExact ? '🔍 100% EXACT CLONE' : `⚡ ${dupe.similarityScore}% NEAR-CLONE`}</span>
              <span class="badge-desc">Twin: ${dupe.matchedId} (${dupe.matchedCost})</span>
            </div>
            <div style="margin-top:4px;">
              <span style="display:inline-block;padding:2px 6px;font-size:10px;font-weight:700;color:#6d28d9;background:#ede9fe;border-radius:4px;">
                👁️ Inspect Twin Work
              </span>
            </div>
          `;
        } else {
          badgeHtml = `
            <div class="audit-badge audit-badge-success">
              <span class="badge-tag">✅ UNIQUE ASSET</span>
              <span class="badge-desc">No Duplicate in District</span>
            </div>
          `;
        }

      } else if (currentMode === 'artha-darpan') {
        // ONLY FEATURE 3 (ARTHA-DARPAN) BADGES
        if (artha && artha.isAnomaly) {
          const isCrit = artha.status === 'CRITICAL_INFLATION';
          const isUnder = artha.status === 'UNVIABLE_UNDERQUOTING';
          const badgeCls = isCrit ? 'audit-badge-danger' : (isUnder ? 'audit-badge-warning' : 'audit-badge-cost');
          badgeHtml = `
            <div class="audit-badge ${badgeCls}">
              <span class="badge-tag">${isCrit ? '🚨 CRITICAL INFLATION' : (isUnder ? '📉 UNVIABLE BID' : '⚠️ PRICE PADDING')} (+${artha.costDeviationPct}%)</span>
              <span class="badge-desc">Peer: ${artha.peerMedianFormatted} · Excess: ${artha.excessCostFormatted}</span>
            </div>
            <div style="margin-top:4px;">
              <span style="display:inline-block;padding:2px 6px;font-size:10px;font-weight:700;color:#b45309;background:#fef3c7;border-radius:4px;">
                📊 View CPWD Rate Audit
              </span>
            </div>
          `;
        } else {
          badgeHtml = `
            <div class="audit-badge audit-badge-success">
              <span class="badge-tag">✅ FAIR PRICING</span>
              <span class="badge-desc">Conforms to CPWD Benchmark</span>
            </div>
          `;
        }

      } else if (currentMode === 'chakra-vyuh') {
        // ONLY FEATURE 4 (CHAKRA-VYUH) BADGES
        if (chakra && chakra.hasCartelRisk) {
          const isMonopoly = chakra.status === 'MONOPOLY_CARTEL_RISK';
          badgeHtml = `
            <div class="audit-badge audit-badge-cartel">
              <span class="badge-tag">${isMonopoly ? '🚨 VENDOR MONOPOLY' : '⚠️ HIGH CONCENTRATION'} (${chakra.topVendorShare}%)</span>
              <span class="badge-desc">Vendor: ${chakra.vendorName} · HHI: ${chakra.hhiIndex}</span>
            </div>
            <div style="margin-top:4px;">
              <span style="display:inline-block;padding:2px 6px;font-size:10px;font-weight:700;color:#be123c;background:#ffe4e6;border-radius:4px;">
                🕸️ Trace Cartel Network
              </span>
            </div>
          `;
        } else {
          badgeHtml = `
            <div class="audit-badge audit-badge-success">
              <span class="badge-tag">✅ OPEN PROCUREMENT</span>
              <span class="badge-desc">Competitive Vendor Distribution</span>
            </div>
          `;
        }

      } else {
        // MASTER EXPLORER (Combined)
        if (dupe && dupe.isDuplicate) {
          badgeHtml += `<div class="audit-badge audit-badge-purple" style="margin-bottom:2px;"><span class="badge-tag">🔍 DUPLICATE CLONE</span></div>`;
        }
        if (artha && artha.status === 'CRITICAL_INFLATION') {
          badgeHtml += `<div class="audit-badge audit-badge-danger" style="margin-bottom:2px;"><span class="badge-tag">💰 INFLATED (+${artha.costDeviationPct}%)</span></div>`;
        }
        if (chakra && chakra.status === 'MONOPOLY_CARTEL_RISK') {
          badgeHtml += `<div class="audit-badge audit-badge-cartel" style="margin-bottom:2px;"><span class="badge-tag">🕸️ MONOPOLY (${chakra.topVendorShare}%)</span></div>`;
        }
        const firstViol = audit.violations.find(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
        if (firstViol) {
          badgeHtml += `<div class="audit-badge audit-badge-danger"><span class="badge-tag">🚨 ${firstViol.ruleId}</span></div>`;
        }
        if (!badgeHtml) {
          badgeHtml = `<div class="audit-badge audit-badge-success"><span class="badge-tag">✅ ALL CLEAR</span></div>`;
        }
      }

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 600; color: #2563eb;">${p.id}</td>
        <td>
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${p.title}</div>
          <div style="font-size: 11px; color: #64748b;">Category: ${p.category || 'Standard Work'} · Sanctioned: ${p.date}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #0f172a;">${p.state}</div>
          <div style="font-size: 11px; color: #64748b;">${p.district}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${p.mpName}</div>
          <div style="font-size: 11px; color: #64748b;">${p.constituency}</div>
        </td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #0f172a;">
          ${p.costFormatted}
        </td>
        <td>
          ${badgeHtml}
        </td>
      `;

      tr.addEventListener('click', () => openModal(p));
      tbody.appendChild(tr);
    });

    document.getElementById('page-info').innerText = `Page ${result.page} of ${result.totalPages || 1} (${result.total.toLocaleString('en-IN')} records)`;
    document.getElementById('prev-btn').disabled = result.page <= 1;
    document.getElementById('next-btn').disabled = result.page >= result.totalPages;

  } catch (err) {
    console.error('Error loading projects:', err);
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell" style="color:#ef4444;">Failed to load project records.</td></tr>';
  }
}

// 9. Interactive SVG Network Ego-Graph for CHAKRA-VYUH
async function loadCartelGraph(mpName) {
  try {
    const res = await fetch(`/api/cartel-graph?mp=${encodeURIComponent(mpName)}`);
    if (!res.ok) return;
    const graphData = await res.json();

    const svg = document.getElementById('network-svg');
    const width = svg.clientWidth || 800;
    const height = 260;
    svg.innerHTML = ''; // Clear previous

    const hhiBadge = document.getElementById('graph-hhi-badge');
    if (hhiBadge) {
      hhiBadge.innerText = `HHI Concentration: ${graphData.hhi} · Top Vendor: ${graphData.topVendorShare}% · Disbursed: ₹${graphData.totalDisbursedCrore} Cr`;
    }

    const cx = width / 2;
    const cy = height / 2;

    // Node Positions
    const nodePositions = new Map();
    nodePositions.set(graphData.mpName, { x: cx, y: cy });

    // Inner Ring: Agencies
    const agencies = graphData.nodes.filter(n => n.type === 'agency');
    agencies.forEach((a, idx) => {
      const angle = (idx / Math.max(1, agencies.length)) * 2 * Math.PI - Math.PI / 2;
      const r = 65;
      nodePositions.set(a.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });

    // Outer Ring: Vendors
    const vendors = graphData.nodes.filter(n => n.type === 'vendor');
    vendors.forEach((v, idx) => {
      const angle = (idx / Math.max(1, vendors.length)) * 2 * Math.PI - Math.PI / 2;
      const r = 110;
      nodePositions.set(v.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });

    // Render Links
    graphData.links.forEach(l => {
      const p1 = nodePositions.get(l.source);
      const p2 = nodePositions.get(l.target);
      if (p1 && p2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.setAttribute('stroke', l.color || '#cbd5e1');
        line.setAttribute('stroke-width', l.color === '#ef4444' ? '3' : '1.5');
        line.setAttribute('stroke-dasharray', l.color === '#ef4444' ? 'none' : '4,2');
        svg.appendChild(line);
      }
    });

    // Render Nodes
    graphData.nodes.forEach(n => {
      const pos = nodePositions.get(n.id);
      if (!pos) return;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', n.size || 16);
      circle.setAttribute('fill', n.color);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y + (n.size || 16) + 12);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10px');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', '#1e293b');
      text.textContent = n.label;
      g.appendChild(text);

      svg.appendChild(g);
    });

  } catch (err) {
    console.error('Failed to load cartel graph:', err);
  }
}

// 10. Open Detailed Inspection Modal (Feature-Specific)
function openModal(project) {
  const modal = document.getElementById('audit-modal');
  const audit = project.audit || { isCompliant: true, violations: [] };
  const dupe = project.duplicate;
  const artha = project.artha;
  const chakra = project.chakra;

  document.getElementById('modal-project-id').innerText = `${project.id} (Work #${project.workDtlId})`;
  document.getElementById('modal-desc').innerText = project.title;
  document.getElementById('modal-mp').innerText = `${project.mpName} (${project.constituency})`;
  document.getElementById('modal-cost').innerText = project.costFormatted;
  document.getElementById('modal-location').innerText = `${project.district}, ${project.state}`;
  document.getElementById('modal-date').innerText = project.date;

  const findingsContainer = document.getElementById('modal-findings-container');
  findingsContainer.innerHTML = '';

  // ==========================================
  // FEATURE 1 MODAL: VIDHI-KAVACH
  // ==========================================
  if (currentMode === 'vidhi-kavach') {
    document.getElementById('modal-badge').innerText = 'VIDHI-KAVACH STATUTORY VERDICT';
    document.getElementById('modal-badge').style.background = '#fef2f2';
    document.getElementById('modal-badge').style.color = '#b91c1c';
    document.getElementById('modal-badge').style.borderColor = '#fecaca';

    const statutoryViols = audit.violations.filter(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
    if (statutoryViols.length === 0) {
      findingsContainer.innerHTML = `
        <div class="violation-card compliant">
          <div class="violation-title">✅ 100% STATUTORILY COMPLIANT</div>
          <div class="violation-clause">MPLADS Guidelines 2023 & General Financial Rules (GFR 2017)</div>
          <div class="violation-desc">No negative list keywords (places of worship, commercial trusts) or fiscal year-end rush detected. Admissible under central guidelines.</div>
        </div>
      `;
    } else {
      statutoryViols.forEach(v => {
        const card = document.createElement('div');
        card.className = 'violation-card';
        card.innerHTML = `
          <div class="violation-title">🚨 ${v.ruleId}: ${v.ruleName} [Severity: ${v.severity}, Penalty: +${v.penalty} pts]</div>
          <div class="violation-clause">📜 Legal Citation: <b>${v.clause}</b></div>
          <div class="violation-desc">${v.explanation}</div>
          ${v.matchedKeyword ? `<div style="margin-top: 6px;"><span class="violation-match">Matched Prohibited Term: "${v.matchedKeyword}"</span></div>` : ''}
        `;
        findingsContainer.appendChild(card);
      });
    }

  // ==========================================
  // FEATURE 2 MODAL: PUNAR-DRISHTI
  // ==========================================
  } else if (currentMode === 'punar-drishti') {
    document.getElementById('modal-badge').innerText = 'PUNAR-DRISHTI DUPLICATE SENTRY AUDIT';
    document.getElementById('modal-badge').style.background = '#f5f3ff';
    document.getElementById('modal-badge').style.color = '#7c3aed';
    document.getElementById('modal-badge').style.borderColor = '#ddd6fe';

    if (dupe && dupe.isDuplicate) {
      const isExact = dupe.similarityScore === 100;
      const dupeBox = document.createElement('div');
      dupeBox.className = 'duplicate-compare-box';
      dupeBox.innerHTML = `
        <div class="duplicate-compare-title">
          🔍 ${isExact ? '100% Exact Title & Asset Clone' : `High-Probability Near Clone (${dupe.similarityScore}% Lexical Match)`}
        </div>
        <div class="duplicate-grid">
          <div>
            <div class="dupe-item-label">Current Work (${project.id}):</div>
            <div class="dupe-item-text">${project.title}</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">Sanction Cost: <b>${project.costFormatted}</b></div>
            <div style="font-size:11px;color:#64748b;">Sanction Date: <b>${project.date}</b></div>
          </div>
          <div>
            <div class="dupe-item-label">Twin Work in Same District (${dupe.matchedId}):</div>
            <div class="dupe-item-text">${dupe.matchedTitle}</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">Sanction Cost: <b>${dupe.matchedCost}</b></div>
            <div style="font-size:11px;color:#64748b;">District: <b>${project.district}</b></div>
          </div>
        </div>
        <div style="margin-top:12px;padding:10px;background:#ffffff;border-radius:6px;border:1px solid #ede9fe;">
          <div style="font-size:11px;font-weight:700;color:#6d28d9;margin-bottom:2px;">📋 Forensic Audit Directive (Double-Billing Prevention):</div>
          <div style="font-size:12px;color:#475569;line-height:1.4;">
            ${dupe.explanation} A physical inspection and cross-verification of Measurement Books (MB) is mandatory before releasing Treasury funds for this recommendation letter.
          </div>
        </div>
      `;
      findingsContainer.appendChild(dupeBox);
    } else {
      findingsContainer.innerHTML = `
        <div class="violation-card compliant">
          <div class="violation-title">✅ UNIQUE WORK ALLOCATION</div>
          <div class="violation-clause">PUNAR-DRISHTI District Lexical Cross-Check</div>
          <div class="violation-desc">No twin or duplicate work description detected within ${project.district} across all historical sanctions. Safe for fund disbursement.</div>
        </div>
      `;
    }

  // ==========================================
  // FEATURE 3 MODAL: ARTHA-DARPAN
  // ==========================================
  } else if (currentMode === 'artha-darpan') {
    document.getElementById('modal-badge').innerText = 'ARTHA-DARPAN COST BENCHMARK AUDIT';
    document.getElementById('modal-badge').style.background = '#fffbeb';
    document.getElementById('modal-badge').style.color = '#b45309';
    document.getElementById('modal-badge').style.borderColor = '#fde68a';

    const card = document.createElement('div');
    card.className = 'duplicate-compare-box';
    card.style.borderColor = '#fde68a';
    card.style.borderLeftColor = '#d97706';
    card.style.background = '#fffdf7';

    card.innerHTML = `
      <div class="duplicate-compare-title" style="color:#b45309;">
        💰 CPWD DSR Rate & Peer-Group Cost Comparison [Deviation: ${artha.costDeviationPct > 0 ? '+' : ''}${artha.costDeviationPct}%]
      </div>
      <div class="duplicate-grid" style="border-color:#fef3c7;">
        <div>
          <div class="dupe-item-label" style="color:#d97706;">Sanctioned Cost:</div>
          <div style="font-size:16px; font-weight:800; color:#0f172a;">${project.costFormatted}</div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">Work Category: <b>${project.category || 'General Work'}</b></div>
        </div>
        <div>
          <div class="dupe-item-label" style="color:#d97706;">State Peer Median (Benchmark):</div>
          <div style="font-size:16px; font-weight:800; color:#047857;">${artha.peerMedianFormatted}</div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">CPWD State Index: <b>${artha.stateMultiplier}x (${project.state})</b></div>
        </div>
      </div>
      <div style="margin-top:12px;padding:10px;background:#ffffff;border-radius:6px;border:1px solid #fde68a;">
        <div style="font-size:11px;font-weight:700;color:#b45309;margin-bottom:2px;">
          ${artha.isAnomaly ? `🚨 Excess Cost at Risk: ${artha.excessCostFormatted}` : '✅ Fair Value Assessment'}
        </div>
        <div style="font-size:12px;color:#475569;line-height:1.4;">
          ${artha.explanation}
        </div>
      </div>
    `;
    findingsContainer.appendChild(card);

  // ==========================================
  // FEATURE 4 MODAL: CHAKRA-VYUH
  // ==========================================
  } else if (currentMode === 'chakra-vyuh') {
    document.getElementById('modal-badge').innerText = 'CHAKRA-VYUH CONTRACTOR NEXUS AUDIT';
    document.getElementById('modal-badge').style.background = '#fff1f2';
    document.getElementById('modal-badge').style.color = '#be123c';
    document.getElementById('modal-badge').style.borderColor = '#fecdd3';

    const card = document.createElement('div');
    card.className = 'duplicate-compare-box';
    card.style.borderColor = '#fecdd3';
    card.style.borderLeftColor = '#e11d48';
    card.style.background = '#fff5f6';

    card.innerHTML = `
      <div class="duplicate-compare-title" style="color:#be123c;">
        🕸️ Contractor Allocation & Market Concentration (HHI Index: ${chakra.hhiIndex})
      </div>
      <div class="duplicate-grid" style="border-color:#ffe4e6;">
        <div>
          <div class="dupe-item-label" style="color:#e11d48;">Contractor / Payee:</div>
          <div style="font-size:13px; font-weight:700; color:#0f172a;">${chakra.vendorName}</div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">Implementing Agency: <b>${chakra.agencyName}</b></div>
        </div>
        <div>
          <div class="dupe-item-label" style="color:#e11d48;">Top Contractor Share:</div>
          <div style="font-size:16px; font-weight:800; color:${chakra.topVendorShare >= 60 ? '#dc2626' : '#047857'};">${chakra.topVendorShare}% of Funds</div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">Dominant Entity: <b>${chakra.topVendor}</b></div>
        </div>
      </div>
      <div style="margin-top:12px;padding:10px;background:#ffffff;border-radius:6px;border:1px solid #fecdd3;">
        <div style="font-size:11px;font-weight:700;color:#be123c;margin-bottom:2px;">
          ${chakra.hasCartelRisk ? '🚨 Cartel Concentration Directive (CVC Guidelines)' : '✅ Competitive Procurement Clearance'}
        </div>
        <div style="font-size:12px;color:#475569;line-height:1.4;">
          ${chakra.explanation}
        </div>
      </div>
    `;
    findingsContainer.appendChild(card);

  // ==========================================
  // MASTER EXPLORER MODAL
  // ==========================================
  } else {
    document.getElementById('modal-badge').innerText = 'SATARK COMPOSITE AUDIT VERDICT';
    document.getElementById('modal-badge').style.background = '#eff6ff';
    document.getElementById('modal-badge').style.color = '#1d4ed8';
    document.getElementById('modal-badge').style.borderColor = '#bfdbfe';

    const card = document.createElement('div');
    card.className = 'violation-card';
    card.innerHTML = `
      <div class="violation-title">🇮🇳 Multi-Engine Intelligence Snapshot</div>
      <div style="font-size:12px; color:#334155; margin-top:8px; line-height:1.6;">
        • <b>Statutory Status:</b> ${audit.isCompliant ? '✅ Compliant' : '🚨 ' + audit.violations.length + ' Violations Flagged'}<br>
        • <b>Duplicate Status:</b> ${dupe && dupe.isDuplicate ? `🔍 ${dupe.similarityScore}% Clone with ${dupe.matchedId}` : '✅ Unique Asset'}<br>
        • <b>Cost Benchmark:</b> ${artha && artha.isAnomaly ? `💰 ${artha.status} (+${artha.costDeviationPct}%)` : '✅ Fair Market Price'}<br>
        • <b>Vendor Concentration:</b> ${chakra && chakra.hasCartelRisk ? `🕸️ ${chakra.status} (${chakra.topVendorShare}%)` : '✅ Competitive Bidding'}
      </div>
    `;
    findingsContainer.appendChild(card);
  }

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('audit-modal').style.display = 'none';
}
