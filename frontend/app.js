/**
 * MPLADS-SATARK (सतर्क)
 * Feature 1: VIDHI-KAVACH (Statutory Shield) Client-side Controller
 */

let currentPage = 1;
const limit = 20;
let currentSearch = '';
let currentFilter = 'all';
let currentState = 'all';
let currentLoadedProjects = [];

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadStates();
  loadProjects();
  setupEvents();
});

function setupEvents() {
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

  // Filter Tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      currentPage = 1;
      loadProjects();
    });
  });

  // KPI Danger Card click triggers Violations filter
  document.getElementById('card-violations').addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    const violTab = document.querySelector('.filter-tab[data-filter="violations"]');
    if (violTab) violTab.classList.add('active');
    currentFilter = 'violations';
    currentPage = 1;
    loadProjects();
  });

  // Pagination buttons
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

// 1. Fetch Top Summary Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();

    document.getElementById('stat-works').innerText = data.totalProjects.toLocaleString('en-IN');
    document.getElementById('stat-cost').innerText = `₹${data.totalSanctionedCrore.toLocaleString('en-IN')} Cr`;
    document.getElementById('stat-states').innerText = `${data.totalStates} States / UTs`;
    
    // VIDHI-KAVACH + PUNAR-DRISHTI Stats
    document.getElementById('stat-violations').innerText = data.totalViolations.toLocaleString('en-IN');
    document.getElementById('stat-violations-desc').innerText = `${data.negativeListCount.toLocaleString('en-IN')} Negative List + ${data.marchRushCount.toLocaleString('en-IN')} March Rush`;

    // Filter Tab Pills
    document.getElementById('pill-violations').innerText = data.totalViolations.toLocaleString('en-IN');
    document.getElementById('pill-neglist').innerText = data.negativeListCount.toLocaleString('en-IN');
    const dupePill = document.getElementById('pill-duplicates');
    if (dupePill && data.duplicateClaimsCount) {
      dupePill.innerText = data.duplicateClaimsCount.toLocaleString('en-IN');
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// 2. Fetch States for Dropdown
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

// 3. Fetch Paginated Project Works
async function loadProjects() {
  const tbody = document.getElementById('projects-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Auditing government projects with VIDHI-KAVACH & PUNAR-DRISHTI...</td></tr>';

  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: limit,
      search: currentSearch,
      filter: currentFilter,
      state: currentState
    });

    const res = await fetch(`/api/projects?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load projects');
    const result = await res.json();

    currentLoadedProjects = result.data || [];
    if (currentLoadedProjects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No projects found matching current criteria.</td></tr>';
      document.getElementById('prev-btn').disabled = true;
      document.getElementById('next-btn').disabled = true;
      return;
    }

    tbody.innerHTML = '';
    currentLoadedProjects.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'clickable-row';

      // VIDHI-KAVACH + PUNAR-DRISHTI Badges
      const audit = p.audit || { isCompliant: true, status: 'COMPLIANT', violations: [] };
      const dupe = p.duplicate;
      let badgeHtml = '';

      if (dupe && dupe.isDuplicate) {
        badgeHtml += `
          <div class="audit-badge audit-badge-purple" style="margin-bottom: 4px;" title="Click to inspect twin duplicate project">
            <span class="badge-tag">🔍 PUNAR-DRISHTI: ${dupe.similarityScore}% CLONE</span>
            <span class="badge-desc">Twin Work: ${dupe.matchedId}</span>
          </div>
        `;
      }

      if (audit.violations.some(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH')) {
        const firstViol = audit.violations.find(v => v.ruleId.startsWith('NEG-LIST') || v.ruleId === 'MARCH-RUSH');
        const isNegList = firstViol.ruleId.startsWith('NEG-LIST');
        const badgeClass = isNegList ? 'audit-badge-danger' : 'audit-badge-warning';
        const kwHtml = firstViol.matchedKeyword ? `<span class="badge-kw">"${firstViol.matchedKeyword}"</span>` : '';

        badgeHtml += `
          <div class="audit-badge ${badgeClass}" title="Click to view statutory citation">
            <span class="badge-tag">🚨 ${firstViol.ruleId} (+${firstViol.penalty} pts)</span>
            <span class="badge-desc">${firstViol.ruleName} ${kwHtml}</span>
          </div>
        `;
      } else if (!dupe) {
        badgeHtml = `
          <div class="audit-badge audit-badge-success">
            <span class="badge-tag">✓ COMPLIANT</span>
            <span class="badge-desc">Zero Guidelines Breach</span>
          </div>
        `;
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
    document.getElementById('page-info').innerText = `Page ${result.page} of ${result.totalPages || 1} (${result.total.toLocaleString()} records)`;
    document.getElementById('prev-btn').disabled = result.page <= 1;
    document.getElementById('next-btn').disabled = result.page >= result.totalPages;

  } catch (err) {
    console.error('Error loading projects:', err);
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell" style="color:#ef4444;">Failed to load project records.</td></tr>';
  }
}

// 4. Open Detailed Statutory & Duplicate Inspection Modal
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

  // 1. If Duplicate Detected by PUNAR-DRISHTI, render rich comparison box
  if (dupe && dupe.isDuplicate) {
    const dupeBox = document.createElement('div');
    dupeBox.className = 'duplicate-compare-box';
    dupeBox.innerHTML = `
      <div class="duplicate-compare-title">🔍 PUNAR-DRISHTI: Lexical NLP Twin Work Detected (${dupe.similarityScore}% Similarity)</div>
      <div class="duplicate-grid">
        <div>
          <div class="dupe-item-label">Current Work (${project.id}):</div>
          <div class="dupe-item-text">${project.title}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Cost: <b>${project.costFormatted}</b></div>
        </div>
        <div>
          <div class="dupe-item-label">Twin Work in Same District (${dupe.matchedId}):</div>
          <div class="dupe-item-text">${dupe.matchedTitle}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Cost: <b>${dupe.matchedCost}</b></div>
        </div>
      </div>
      <div style="font-size:11px;color:#6b21a8;margin-top:8px;">
        <b>Forensic Audit Directive:</b> High probability of double-billing or re-sanctioning the same asset under two different letters. Verify physical measurement books before releasing funds.
      </div>
    `;
    findingsContainer.appendChild(dupeBox);
  }

  // 2. Statutory Violations
  const nonDupeViols = audit.violations.filter(v => v.ruleId !== 'PUNAR-01');
  if (nonDupeViols.length === 0 && !dupe) {
    findingsContainer.innerHTML = `
      <div class="violation-card compliant">
        <div class="violation-title">✅ 100% STATUTORILY COMPLIANT</div>
        <div class="violation-clause">MPLADS Guidelines 2023 & General Financial Rules (GFR 2017)</div>
        <div class="violation-desc">No negative list keywords, duplicate claims, or fiscal year-end rush detected. Admissible for central fund release.</div>
      </div>
    `;
  } else {
    nonDupeViols.forEach(v => {
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

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('audit-modal').style.display = 'none';
}
