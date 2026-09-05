/**
 * MPLADS-SATARK (सतर्क)
 * Master Client Controller
 * Complete UI & Feature Separation:
 *  - Mode 1: VIDHI-KAVACH (Statutory Shield)
 *  - Mode 2: PUNAR-DRISHTI (NLP Duplicate Sentry)
 *  - Mode 3: ALL-INDIA REPOSITORY (Master Explorer)
 */

let currentMode = 'vidhi-kavach'; // Default to Feature 1
let currentFilter = 'violations';  // Default filter for Feature 1
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
    switchMode('vidhi-kavach'); // Initialize Feature 1 cleanly
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
}

// 2. Switch Mode - Completely isolates UI, KPIs, Filters, Table and Modals
function switchMode(newMode) {
  currentMode = newMode;
  currentPage = 1;
  currentSearch = '';
  document.getElementById('search-input').value = '';

  // Update active tab buttons
  document.querySelectorAll('.mode-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-mode') === currentMode);
  });

  // Mode Specific UI Configurations
  if (currentMode === 'vidhi-kavach') {
    // Feature 1: VIDHI-KAVACH
    currentFilter = 'violations';

    // Headers
    document.getElementById('view-feature-tag').className = 'feature-tag';
    document.getElementById('view-feature-tag').style.background = '#fef2f2';
    document.getElementById('view-feature-tag').style.color = '#b91c1c';
    document.getElementById('view-feature-tag').style.borderColor = '#fecaca';
    document.getElementById('view-feature-tag').innerHTML = '🛡️ FEATURE 1: VIDHI-KAVACH (विधि-कवच — Statutory Policy Shield)';
    
    document.getElementById('view-heading').innerText = 'Annexure-I Negative List & GFR 62 March Rush Sentry';
    document.getElementById('view-subheading').innerText = 'Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 Statutory Rules';

    // KPIs (Feature 1 Focus)
    renderKPIs({
      c1: { label: 'Total Works Audited', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: '100% Nationwide MoSPI eSAKSHI Data', color: '' },
      c2: { label: 'Statutorily Compliant', val: statsData ? statsData.compliantCount.toLocaleString('en-IN') : '158,074', desc: 'Zero statutory breaches detected', color: 'text-green' },
      c3: { label: 'Negative List Breaches', val: statsData ? statsData.negativeListCount.toLocaleString('en-IN') : '15,953', desc: 'Places of worship & commercial trusts', color: 'text-red', isDanger: true },
      c4: { label: 'March Rush Violations', val: statsData ? statsData.marchRushCount.toLocaleString('en-IN') : '3,204', desc: 'Sanctioned in final 10 days of March (GFR 62)', color: '', isWarning: true }
    });

    // Filter Tabs for Feature 1
    renderFilterTabs([
      { id: 'violations', label: '🚨 All Statutory Red Flags', count: statsData ? statsData.totalViolations : 18851, cls: 'danger-tab active' },
      { id: 'negative-list', label: '🛑 Negative List Breaches', count: statsData ? statsData.negativeListCount : 15953, cls: 'danger-tab' },
      { id: 'march-rush', label: '⏳ March Rush (GFR 62)', count: statsData ? statsData.marchRushCount : 3204, cls: 'warning-tab' },
      { id: 'compliant', label: '✅ Statutorily Compliant Works', count: statsData ? statsData.compliantCount : 158074, cls: 'success-tab' },
      { id: 'all', label: '📋 All 176,925 Works', count: statsData ? statsData.totalProjects : 176925, cls: '' }
    ]);

    // Table Column Header
    document.getElementById('th-audit-col').innerText = 'Statutory Audit Verdict (VIDHI-KAVACH)';

    // Roadmap Explanation
    document.getElementById('roadmap-title').innerHTML = '🛡️ Feature 1: VIDHI-KAVACH (विधि-कवच) Live in Action';
    document.getElementById('roadmap-desc').innerHTML = 'VIDHI-KAVACH audits every project against the official <b>MPLADS 2023 Negative List (Annexure-I)</b> (prohibiting works on places of worship, commercial trusts, clubs) and <b>GFR Rule 62</b> (preventing fiscal year-end March rush). Click any red flag row to inspect the full statutory clause and penalty citation.';

  } else if (currentMode === 'punar-drishti') {
    // Feature 2: PUNAR-DRISHTI
    currentFilter = 'duplicates';

    // Headers
    document.getElementById('view-feature-tag').className = 'feature-tag';
    document.getElementById('view-feature-tag').style.background = '#f5f3ff';
    document.getElementById('view-feature-tag').style.color = '#6d28d9';
    document.getElementById('view-feature-tag').style.borderColor = '#ddd6fe';
    document.getElementById('view-feature-tag').innerHTML = '🔍 FEATURE 2: PUNAR-DRISHTI (पुनर्दृष्टि — NLP Duplicate Sentry)';
    
    document.getElementById('view-heading').innerText = 'Cross-Work Lexical NLP Twin Work & Double-Billing Sentry';
    document.getElementById('view-subheading').innerText = "Vaibhav's TF-IDF & Cosine Similarity Engine detecting duplicate project claims across India";

    // KPIs (Feature 2 Focus)
    const dupeTotal = statsData ? statsData.duplicateClaimsCount : 10204;
    const exactTotal = statsData ? statsData.exactClonesCount : 6965;
    const nearTotal = dupeTotal - exactTotal;

    renderKPIs({
      c1: { label: 'Total Works Scanned', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: 'Across all 36 States & UTs', color: '' },
      c2: { label: 'Duplicate Claims Flagged', val: dupeTotal.toLocaleString('en-IN'), desc: 'Cross-work twin assets in same district', color: '', isPurple: true },
      c3: { label: '100% Exact Clones', val: exactTotal.toLocaleString('en-IN'), desc: 'Identical work descriptions in district', color: 'text-red', isDanger: true },
      c4: { label: 'Near-Clones (85%–99%)', val: nearTotal.toLocaleString('en-IN'), desc: 'Slight variations in title phrasing', color: '', isWarning: true }
    });

    // Filter Tabs for Feature 2
    renderFilterTabs([
      { id: 'duplicates', label: '🔍 All Duplicate Claims', count: dupeTotal, cls: 'purple-tab active' },
      { id: 'exact-clones', label: '⚠️ 100% Exact Title Clones', count: exactTotal, cls: 'purple-tab' },
      { id: 'near-clones', label: '⚡ Near-Clones (85%–99%)', count: nearTotal, cls: 'purple-tab' },
      { id: 'all', label: '📋 All 176,925 Scanned Works', count: statsData ? statsData.totalProjects : 176925, cls: '' }
    ]);

    // Table Column Header
    document.getElementById('th-audit-col').innerText = 'Duplicate Sentry Analysis (PUNAR-DRISHTI)';

    // Roadmap Explanation
    document.getElementById('roadmap-title').innerHTML = '🔍 Feature 2: PUNAR-DRISHTI (पुनर्दृष्टि) Live in Action';
    document.getElementById('roadmap-desc').innerHTML = "PUNAR-DRISHTI applies <b>Vaibhav's TF-IDF tokenization and Cosine Similarity</b> to compare project descriptions within each district. It flags identical work titles (100% exact clones) and rephrased works (85–99% near clones) to prevent double-billing on the same physical asset. Click any duplicate row to inspect both claims side-by-side.";

  } else {
    // Mode 3: ALL-INDIA REPOSITORY
    currentFilter = 'all';

    // Headers
    document.getElementById('view-feature-tag').className = 'feature-tag';
    document.getElementById('view-feature-tag').style.background = '#eff6ff';
    document.getElementById('view-feature-tag').style.color = '#1d4ed8';
    document.getElementById('view-feature-tag').style.borderColor = '#bfdbfe';
    document.getElementById('view-feature-tag').innerHTML = '🇮🇳 ALL-INDIA REPOSITORY (Master MoSPI Explorer)';
    
    document.getElementById('view-heading').innerText = 'Master MoSPI eSAKSHI Project Explorer';
    document.getElementById('view-subheading').innerText = '176,925 Real Government Projects across 36 States and Union Territories';

    // KPIs (Combined View)
    renderKPIs({
      c1: { label: 'Total Government Works', val: statsData ? statsData.totalProjects.toLocaleString('en-IN') : '176,925', desc: '100% Real MoSPI Data', color: '' },
      c2: { label: 'Total Sanctioned Amount', val: statsData ? `₹${statsData.totalSanctionedCrore.toLocaleString('en-IN')} Cr` : '₹14,976.4 Cr', desc: 'Approved central allocations', color: 'text-blue' },
      c3: { label: 'States & UTs Covered', val: statsData ? `${statsData.totalStates} States / UTs` : '36 States / UTs', desc: 'Complete national coverage', color: 'text-green' },
      c4: { label: 'Total Red Flags (Combined)', val: statsData ? (statsData.totalViolations + statsData.duplicateClaimsCount).toLocaleString('en-IN') : '29,055', desc: 'VIDHI-KAVACH + PUNAR-DRISHTI', color: 'text-red', isDanger: true }
    });

    // Filter Tabs for Master View
    renderFilterTabs([
      { id: 'all', label: '🌐 All 176,925 Works', count: statsData ? statsData.totalProjects : 176925, cls: 'active' },
      { id: 'violations', label: '🛡️ Feature 1 Violations', count: statsData ? statsData.totalViolations : 18851, cls: 'danger-tab' },
      { id: 'duplicates', label: '🔍 Feature 2 Duplicates', count: statsData ? statsData.duplicateClaimsCount : 10204, cls: 'purple-tab' },
      { id: 'compliant', label: '✅ Fully Clean Works', count: statsData ? statsData.compliantCount : 158074, cls: 'success-tab' }
    ]);

    // Table Column Header
    document.getElementById('th-audit-col').innerText = 'SATARK Health & Audit Findings';

    // Roadmap Explanation
    document.getElementById('roadmap-title').innerHTML = '🇮🇳 Master All-India Project Repository';
    document.getElementById('roadmap-desc').innerHTML = 'Explore any project from Kashmir to Kanyakumari. Select any State/UT from the dropdown above or enter keywords to inspect central allocations, MPs, and multi-engine forensic audits.';
  }

  loadProjects();
}

// 3. Render KPI Row
function renderKPIs(kpis) {
  const c1 = document.getElementById('kpi-c1');
  const c2 = document.getElementById('kpi-c2');
  const c3 = document.getElementById('kpi-c3');
  const c4 = document.getElementById('kpi-c4');

  // Reset custom styles
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
  // Search Input with Debouncing
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

  // Pagination Buttons
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

  // Modal Close Events
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
  const loadingMsg = currentMode === 'punar-drishti' 
    ? 'Scanning works with PUNAR-DRISHTI NLP Duplicate Sentry...'
    : (currentMode === 'vidhi-kavach' ? 'Auditing works with VIDHI-KAVACH Statutory Policy Shield...' : 'Loading MoSPI works...');

  tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">${loadingMsg}</td></tr>`;

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
      let badgeHtml = '';

      // Clean Separation in Table Column 6:
      if (currentMode === 'vidhi-kavach') {
        // ONLY SHOW FEATURE 1 (VIDHI-KAVACH) BADGES - NEVER DUPLICATE BADGES!
        const firstViol = audit.violations.find(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
        if (firstViol) {
          const isNegList = firstViol.ruleId.startsWith('NEG-LIST');
          const badgeClass = isNegList ? 'audit-badge-danger' : 'audit-badge-warning';
          const kwHtml = firstViol.matchedKeyword ? `<span class="badge-kw">"${firstViol.matchedKeyword}"</span>` : '';
          badgeHtml = `
            <div class="audit-badge ${badgeClass}" title="Click to view statutory citation">
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
        // ONLY SHOW FEATURE 2 (PUNAR-DRISHTI) BADGES - NEVER STATUTORY BADGES!
        if (dupe && dupe.isDuplicate) {
          const isExact = dupe.similarityScore === 100;
          badgeHtml = `
            <div class="audit-badge audit-badge-purple" title="Click to compare twin project in district">
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

      } else {
        // Master Explorer: Show both if flagged
        if (dupe && dupe.isDuplicate) {
          badgeHtml += `
            <div class="audit-badge audit-badge-purple" style="margin-bottom: 4px;">
              <span class="badge-tag">🔍 PUNAR-DRISHTI: ${dupe.similarityScore}% CLONE</span>
            </div>
          `;
        }
        const firstViol = audit.violations.find(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
        if (firstViol) {
          const badgeClass = firstViol.ruleId.startsWith('NEG-LIST') ? 'audit-badge-danger' : 'audit-badge-warning';
          badgeHtml += `
            <div class="audit-badge ${badgeClass}">
              <span class="badge-tag">🚨 ${firstViol.ruleId}</span>
            </div>
          `;
        }
        if (!badgeHtml) {
          badgeHtml = `
            <div class="audit-badge audit-badge-success">
              <span class="badge-tag">✅ COMPLIANT</span>
            </div>
          `;
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

    // Update Pagination UI
    document.getElementById('page-info').innerText = `Page ${result.page} of ${result.totalPages || 1} (${result.total.toLocaleString('en-IN')} records)`;
    document.getElementById('prev-btn').disabled = result.page <= 1;
    document.getElementById('next-btn').disabled = result.page >= result.totalPages;

  } catch (err) {
    console.error('Error loading projects:', err);
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell" style="color:#ef4444;">Failed to load project records.</td></tr>';
  }
}

// 9. Open Detailed Inspection Modal (Feature-Specific)
function openModal(project) {
  const modal = document.getElementById('audit-modal');
  const audit = project.audit || { isCompliant: true, violations: [] };
  const dupe = project.duplicate;

  document.getElementById('modal-project-id').innerText = `${project.id} (Work #${project.workDtlId})`;
  document.getElementById('modal-desc').innerText = project.title;
  document.getElementById('modal-mp').innerText = `${project.mpName} (${project.constituency})`;
  document.getElementById('modal-cost').innerText = project.costFormatted;
  document.getElementById('modal-location').innerText = `${project.district}, ${project.state}`;
  document.getElementById('modal-date').innerText = project.date;

  const findingsContainer = document.getElementById('modal-findings-container');
  findingsContainer.innerHTML = '';

  if (currentMode === 'punar-drishti') {
    // FEATURE 2 MODAL: Dedicated Twin Work Comparison
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

  } else if (currentMode === 'vidhi-kavach') {
    // FEATURE 1 MODAL: Dedicated Statutory Policy Citations
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

  } else {
    // MASTER VIEW MODAL: Combined findings
    document.getElementById('modal-badge').innerText = 'SATARK COMPOSITE AUDIT VERDICT';
    document.getElementById('modal-badge').style.background = '#eff6ff';
    document.getElementById('modal-badge').style.color = '#1d4ed8';
    document.getElementById('modal-badge').style.borderColor = '#bfdbfe';

    if (dupe && dupe.isDuplicate) {
      const dupeBox = document.createElement('div');
      dupeBox.className = 'duplicate-compare-box';
      dupeBox.innerHTML = `
        <div class="duplicate-compare-title">🔍 PUNAR-DRISHTI: Lexical NLP Twin Work Detected (${dupe.similarityScore}% Similarity)</div>
        <div class="duplicate-grid">
          <div><b>Current:</b> ${project.title} (${project.costFormatted})</div>
          <div><b>Twin:</b> ${dupe.matchedTitle} (${dupe.matchedCost})</div>
        </div>
      `;
      findingsContainer.appendChild(dupeBox);
    }

    const statutoryViols = audit.violations.filter(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
    if (statutoryViols.length === 0 && !dupe) {
      findingsContainer.innerHTML = `
        <div class="violation-card compliant">
          <div class="violation-title">✅ FULLY CLEAR IN ALL AUDIT ENGINES</div>
          <div class="violation-desc">Statutorily compliant and zero duplicate work claims detected.</div>
        </div>
      `;
    } else {
      statutoryViols.forEach(v => {
        const card = document.createElement('div');
        card.className = 'violation-card';
        card.innerHTML = `
          <div class="violation-title">🚨 ${v.ruleId}: ${v.ruleName}</div>
          <div class="violation-clause">📜 Legal Citation: <b>${v.clause}</b></div>
          <div class="violation-desc">${v.explanation}</div>
        `;
        findingsContainer.appendChild(card);
      });
    }
  }

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('audit-modal').style.display = 'none';
}
