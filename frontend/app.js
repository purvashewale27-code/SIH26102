/**
 * MPLADS-SATARK (सतर्क)
 * Feature 1: VIDHI-KAVACH (Statutory Shield) Client-side Controller
 */

let currentPage = 1;
const limit = 20;
let currentSearch = '';
let currentFilter = 'all';
let currentLoadedProjects = [];

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
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
    
    // VIDHI-KAVACH Stats
    document.getElementById('stat-violations').innerText = data.totalViolations.toLocaleString('en-IN');
    document.getElementById('stat-violations-desc').innerText = `${data.negativeListCount.toLocaleString('en-IN')} Negative List + ${data.marchRushCount.toLocaleString('en-IN')} March Rush`;

    // Filter Tab Pills
    document.getElementById('pill-violations').innerText = data.totalViolations.toLocaleString('en-IN');
    document.getElementById('pill-neglist').innerText = data.negativeListCount.toLocaleString('en-IN');
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// 2. Fetch Paginated Project Works
async function loadProjects() {
  const tbody = document.getElementById('projects-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Auditing government projects with VIDHI-KAVACH...</td></tr>';

  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: limit,
      search: currentSearch,
      filter: currentFilter
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

      // VIDHI-KAVACH Badge HTML
      const audit = p.audit || { isCompliant: true, status: 'COMPLIANT' };
      let badgeHtml = '';

      if (audit.isCompliant) {
        badgeHtml = `
          <div class="audit-badge audit-badge-success">
            <span class="badge-tag">✓ COMPLIANT</span>
            <span class="badge-desc">Zero Guidelines Breach</span>
          </div>
        `;
      } else {
        const firstViol = audit.violations[0];
        const isNegList = firstViol.ruleId.startsWith('NEG-LIST');
        const badgeClass = isNegList ? 'audit-badge-danger' : 'audit-badge-warning';
        const kwHtml = firstViol.matchedKeyword ? `<span class="badge-kw">"${firstViol.matchedKeyword}"</span>` : '';

        badgeHtml = `
          <div class="audit-badge ${badgeClass}" title="Click to view statutory citation">
            <span class="badge-tag">🚨 ${firstViol.ruleId} (+${firstViol.penalty} pts)</span>
            <span class="badge-desc">${firstViol.ruleName} ${kwHtml}</span>
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

// 3. Open Detailed Statutory Inspection Modal
function openModal(project) {
  const modal = document.getElementById('audit-modal');
  const audit = project.audit || { isCompliant: true, violations: [] };

  document.getElementById('modal-project-id').innerText = `${project.id} (Work #${project.workDtlId})`;
  document.getElementById('modal-desc').innerText = project.title;
  document.getElementById('modal-mp').innerText = `${project.mpName} (${project.constituency})`;
  document.getElementById('modal-cost').innerText = project.costFormatted;
  document.getElementById('modal-location').innerText = `${project.district}, ${project.state}`;
  document.getElementById('modal-date').innerText = project.date;

  const findingsContainer = document.getElementById('modal-findings-container');
  findingsContainer.innerHTML = '';

  if (audit.isCompliant) {
    findingsContainer.innerHTML = `
      <div class="violation-card compliant">
        <div class="violation-title">✅ 100% STATUTORILY COMPLIANT</div>
        <div class="violation-clause">MPLADS Guidelines 2023 & General Financial Rules (GFR 2017)</div>
        <div class="violation-desc">No negative list keywords or fiscal year-end rush detected. Admissible for central fund release.</div>
      </div>
    `;
  } else {
    audit.violations.forEach(v => {
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
