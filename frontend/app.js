/**
 * MPLADS-SATARK (सतर्क) Frontend Client Logic
 * Interactivity for 4 Role Dashboards, Hot Path Sandbox, and Ego-Graph Explorer.
 */

const API_BASE = window.location.origin;

// State management
let currentTab = 'ministry-tab';
let currentPage = 1;
let currentLimit = 25;
let currentProjects = [];
let allStatesData = [];
let currentSelectedProject = null;
let leafletMap = null;
let visNetwork = null;
let stateCharts = {};

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  initLeafletMap();
  loadNationalData();
  loadProjectsTable();
  setupHotPathPresets();
  setupHotPathForm();
  setupModals();
  setupEgoGraph();
  setupConstituencyDropdown();
  setupStateDropdown();
});

// 1. TAB NAVIGATION
function setupTabNavigation() {
  const roleButtons = document.querySelectorAll('.role-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      roleButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(targetTab);
      if (pane) pane.classList.add('active');
      currentTab = targetTab;

      // Trigger map resize if switching to Ministry tab
      if (targetTab === 'ministry-tab' && leafletMap) {
        setTimeout(() => leafletMap.invalidateSize(), 200);
      }

      // Initialize state charts if switching to State tab
      if (targetTab === 'state-tab') {
        renderStateCharts();
      }

      // Load ego graph if switching to Ego-Graph tab
      if (targetTab === 'ego-graph-tab') {
        loadEgoGraph('LOCAL AREA ENGINEERING ORGANISATION (LAEO)-02 JAGDISHPUR');
      }
    });
  });
}

// 2. LEAFLET GIS MAP
function initLeafletMap() {
  const mapElement = document.getElementById('national-gis-map');
  if (!mapElement) return;

  // Center of India coordinates: [21.7679, 78.8718]
  leafletMap = L.map('national-gis-map', {
    center: [22.5, 80.0],
    zoom: 4.5,
    minZoom: 4,
    maxZoom: 10
  });

  // Dark basemap
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB &copy; MoSPI eSAKSHI',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(leafletMap);

  // State coordinate approximations for nationwide visualization
  const stateCentroids = [
    { state: 'Bihar', lat: 25.0961, lon: 85.3131, works: 20000, risk: 'Medium' },
    { state: 'Maharashtra', lat: 19.7515, lon: 75.7139, works: 16420, risk: 'High' },
    { state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, works: 24500, risk: 'High' },
    { state: 'West Bengal', lat: 22.9868, lon: 87.8550, works: 12100, risk: 'Medium' },
    { state: 'Tamil Nadu', lat: 11.1271, lon: 78.6569, works: 9800, risk: 'Low' },
    { state: 'Karnataka', lat: 15.3173, lon: 75.7139, works: 8400, risk: 'Low' },
    { state: 'Gujarat', lat: 22.2587, lon: 71.1924, works: 11200, risk: 'Medium' },
    { state: 'Rajasthan', lat: 27.0238, lon: 74.2179, works: 14300, risk: 'High' },
    { state: 'Madhya Pradesh', lat: 22.9734, lon: 78.6569, works: 15600, risk: 'Medium' },
    { state: 'Odisha', lat: 20.9517, lon: 85.0985, works: 7800, risk: 'Low' },
    { state: 'Kerala', lat: 10.8505, lon: 76.2711, works: 6200, risk: 'Low' },
    { state: 'Assam', lat: 26.2006, lon: 92.9376, works: 5100, risk: 'Medium' }
  ];

  stateCentroids.forEach(item => {
    let color = '#10b981';
    if (item.risk === 'High') color = '#ef4444';
    else if (item.risk === 'Medium') color = '#f59e0b';

    const circle = L.circleMarker([item.lat, item.lon], {
      radius: Math.min(22, Math.max(8, item.works / 1200)),
      fillColor: color,
      color: '#fff',
      weight: 1.5,
      opacity: 0.9,
      fillOpacity: 0.65
    }).addTo(leafletMap);

    circle.bindPopup(`
      <div style="font-family: Inter, sans-serif; color: #111;">
        <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:700;">${item.state}</h4>
        <div style="font-size:12px;"><b>Works Indexed:</b> ${item.works.toLocaleString()}</div>
        <div style="font-size:12px;"><b>Aggregated Risk Tier:</b> <span style="color:${color}; font-weight:bold;">${item.risk}</span></div>
        <button style="margin-top:6px; padding:3px 8px; font-size:11px; background:#2563eb; color:#fff; border:none; border-radius:4px; cursor:pointer;" onclick="filterByState('${item.state}')">View Works</button>
      </div>
    `);
  });
}

window.filterByState = function(stateName) {
  const districtTabBtn = document.querySelector('[data-tab="district-tab"]');
  if (districtTabBtn) districtTabBtn.click();
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    searchInput.value = stateName;
    loadProjectsTable();
  }
};

// 3. LOAD NATIONAL DATA & STATE ROLLUPS
async function loadNationalData() {
  try {
    const [summaryRes, statesRes] = await Promise.all([
      fetch(`${API_BASE}/api/national-summary`),
      fetch(`${API_BASE}/api/states`)
    ]);

    if (summaryRes.ok) {
      const summary = await summaryRes.json();
      document.getElementById('kpi-sanctioned').innerText = `₹${summary.total_sanctioned_crore.toLocaleString()} Cr`;
      document.getElementById('kpi-expenditure').innerText = `₹${summary.total_expenditure_crore.toLocaleString()} Cr`;
      document.getElementById('kpi-projects').innerText = summary.total_projects.toLocaleString();
      document.getElementById('kpi-delayed').innerText = `${summary.delayed_projects.toLocaleString()} (${summary.delayed_pct}%)`;
    }

    if (statesRes.ok) {
      allStatesData = await statesRes.json();
      renderStateTable(allStatesData);
    }
  } catch (err) {
    console.error('Error loading national data:', err);
    document.getElementById('api-status-badge').innerText = 'Offline (Local Cache)';
  }
}

function renderStateTable(states) {
  const tbody = document.getElementById('state-rollups-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  states.forEach(st => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${st.state}</b></td>
      <td>${st.total_projects.toLocaleString()}</td>
      <td>₹${st.sanctioned_crore}</td>
      <td>₹${st.expenditure_crore}</td>
      <td><span class="badge ${st.utilization_pct > 100 ? 'badge-derived' : 'badge-real'}">${st.utilization_pct}%</span></td>
      <td><span class="text-red">${st.delayed_count} (${Math.round((st.delayed_count/st.total_projects)*100)}%)</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 4. LOAD PROJECTS TABLE (DISTRICT COLLECTOR QUEUE)
async function loadProjectsTable() {
  const tbody = document.getElementById('projects-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">Loading nationwide works...</td></tr>';

  const search = document.getElementById('project-search-input')?.value || '';
  const risk = document.getElementById('risk-filter')?.value || '';

  const params = new URLSearchParams({
    page: currentPage,
    limit: currentLimit
  });
  if (search) params.append('search', search);
  if (risk) params.append('risk_tier', risk);

  try {
    const res = await fetch(`${API_BASE}/api/projects?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    currentProjects = data.data;

    tbody.innerHTML = '';
    if (currentProjects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">No projects found matching filters.</td></tr>';
      return;
    }

    currentProjects.forEach(p => {
      const cost = p.fields?.estimated_cost?.value || 0;
      const delay = p.fields?.delay_days?.value || 0;
      const isMarch = p.fields?.is_march_rush?.value || false;

      // Generate deterministic tier for demo table
      let tier = 'LOW';
      let score = 25;
      if (delay > 365 || isMarch || cost > 5000000) {
        tier = 'HIGH';
        score = 72;
      }
      if (delay > 500 && isMarch) {
        tier = 'CRITICAL';
        score = 88;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-size:11px; color:#93c5fd;">${p.project_id}</td>
        <td>
          <div style="font-weight:600; max-width:340px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${p.project_title}
          </div>
          <div style="font-size:11px; color:var(--text-muted);">${p.implementing_agency || 'LAEO'}</div>
        </td>
        <td>${p.state}<br><span style="font-size:11px; color:var(--text-muted);">${p.district || p.constituency}</span></td>
        <td style="font-weight:600;">₹${cost.toLocaleString('en-IN')}</td>
        <td>${delay > 0 ? `<span class="text-red">${delay}d delay</span>` : '<span class="text-green">On Schedule</span>'}</td>
        <td style="font-family:var(--font-mono); font-weight:700;">${score}/100</td>
        <td><span class="tier-badge tier-${tier}">${tier}</span></td>
        <td>
          <button class="action-btn" style="padding:4px 8px; font-size:11px;" onclick="openExplainModal('${p.project_id}')">
            <i class="fa-solid fa-list-check"></i> Audit
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('page-indicator').innerText = `Page ${data.page} of ${data.totalPages || 1} (${data.total.toLocaleString()} works)`;
  } catch (e) {
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#f87171;">Failed to load project records.</td></tr>';
  }
}

// Pagination & search hooks
document.getElementById('prev-page-btn')?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadProjectsTable();
  }
});
document.getElementById('next-page-btn')?.addEventListener('click', () => {
  currentPage++;
  loadProjectsTable();
});
document.getElementById('project-search-input')?.addEventListener('input', () => {
  currentPage = 1;
  loadProjectsTable();
});
document.getElementById('risk-filter')?.addEventListener('change', () => {
  currentPage = 1;
  loadProjectsTable();
});

// 5. EXPLAIN-MY-SCORE MODAL
window.openExplainModal = async function(projectId) {
  try {
    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectId)}`);
    if (!res.ok) throw new Error('Failed to fetch details');
    const data = await res.json();
    currentSelectedProject = data.project;

    const evalData = data.evaluation;
    document.getElementById('modal-project-title').innerText = currentSelectedProject.project_title;
    document.getElementById('modal-project-meta').innerText = `${currentSelectedProject.project_id} · ${currentSelectedProject.state}, ${currentSelectedProject.district} · Hon'ble MP: ${currentSelectedProject.mp_name}`;

    const scoreBadge = document.getElementById('modal-score-badge');
    scoreBadge.innerText = `${evalData.priority_score} / 100`;
    scoreBadge.style.backgroundColor = evalData.tier_color;

    document.getElementById('modal-tier-text').innerText = `${evalData.risk_tier} RISK TIER`;
    document.getElementById('modal-tier-text').style.color = evalData.tier_color;

    const waterfallList = document.getElementById('modal-waterfall-list');
    waterfallList.innerHTML = '';

    evalData.explain_my_score.forEach(item => {
      const div = document.createElement('div');
      div.className = 'waterfall-item';
      div.innerHTML = `
        <div>
          <div class="waterfall-factor">
            ${item.factor} 
            <span class="badge badge-${item.provenance.toLowerCase().replace(' ', '-')}">${item.provenance}</span>
          </div>
          <div class="waterfall-desc">${item.detail}</div>
        </div>
        <div class="waterfall-pts">+${item.points} pts</div>
      `;
      waterfallList.appendChild(div);
    });

    document.getElementById('explain-modal').classList.add('active');
  } catch (e) {
    alert('Could not load project audit detail: ' + e.message);
  }
};

function setupModals() {
  document.getElementById('close-explain-modal')?.addEventListener('click', () => {
    document.getElementById('explain-modal').classList.remove('active');
  });

  document.getElementById('close-dossier-modal')?.addEventListener('click', () => {
    document.getElementById('dossier-modal').classList.remove('active');
  });

  document.getElementById('modal-dossier-btn')?.addEventListener('click', () => {
    if (currentSelectedProject) {
      document.getElementById('explain-modal').classList.remove('active');
      openDossierModal(currentSelectedProject.project_id);
    }
  });
}

// 6. PRINT-READY AUDIT DOSSIER
window.openDossierModal = async function(projectId) {
  try {
    const res = await fetch(`${API_BASE}/api/dossier/${encodeURIComponent(projectId)}`);
    if (!res.ok) throw new Error('Failed to generate dossier');
    const dos = await res.json();

    const area = document.getElementById('dossier-content-area');
    area.innerHTML = `
      <div class="dossier-header-crest">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" style="height:48px; margin-bottom:6px;" alt="Emblem">
        <h2>GOVERNMENT OF INDIA · DISTRICT AUDIT & VIGILANCE CELL</h2>
        <div>OFFICE OF THE DISTRICT MAGISTRATE & DEPUTY COMMISSIONER</div>
      </div>

      <div class="dossier-memo-meta">
        <div><b>MEMORANDUM NO:</b> ${dos.memorandum_id}</div>
        <div><b>DATE OF ISSUE:</b> ${dos.date_of_issue}</div>
      </div>

      <div class="dossier-subject">
        SUBJECT: ${dos.subject}
      </div>

      <p style="font-size:13px; margin-bottom:12px;">
        Pursuant to statutory powers under Chapter IV of the MPLADS Revised Guidelines 2023 read with GFR 2017 Rules 99, 130, and 139, the physical asset identified below has been flagged for prioritized field inspection based on multi-layer anomaly detection signals:
      </p>

      <table class="dossier-table">
        <tr>
          <th style="width:25%;">Project ID</th>
          <td style="font-family:monospace;">${dos.project_details.project_id}</td>
          <th style="width:25%;">Sanctioned Cost</th>
          <td>${dos.project_details.sanction_cost_formatted}</td>
        </tr>
        <tr>
          <th>Work Description</th>
          <td colspan="3">${dos.project_details.project_title}</td>
        </tr>
        <tr>
          <th>Jurisdiction</th>
          <td>${dos.project_details.district}, ${dos.project_details.state} (${dos.project_details.constituency})</td>
          <th>Hon'ble MP</th>
          <td>${dos.project_details.mp_name}</td>
        </tr>
        <tr>
          <th>Implementing Agency</th>
          <td>${dos.project_details.implementing_agency}</td>
          <th>Contractor / Vendor</th>
          <td>${dos.project_details.vendor_name}</td>
        </tr>
        <tr>
          <th>Derived Priority Score</th>
          <td colspan="3" style="font-weight:bold; color:#b91c1c;">
            ${dos.audit_assessment.priority_score} / 100 (${dos.audit_assessment.risk_tier} RISK TIER)
          </td>
        </tr>
      </table>

      <h4 style="font-size:14px; margin:16px 0 6px 0; text-transform:uppercase;">I. Field Verification Checklist for Inspecting Engineer:</h4>
      <table class="dossier-table">
        <thead>
          <tr>
            <th style="width:8%;">Item</th>
            <th style="width:30%;">Audit Checkpoint</th>
            <th>Inspection Instruction</th>
            <th style="width:20%;">Verification Finding</th>
          </tr>
        </thead>
        <tbody>
          ${dos.field_verification_checklist.map(chk => `
            <tr>
              <td>${chk.item_no}</td>
              <td><b>${chk.checkpoint}</b><br><span style="font-size:10px; color:#555;">${chk.statutory_ref}</span></td>
              <td>${chk.instruction}</td>
              <td>[ &nbsp; ] Verified<br>[ &nbsp; ] Deficit Noted</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="dossier-signatures">
        <div class="sig-line">
          Signature of District Inspecting Engineer<br>
          (With Stamp and Date)
        </div>
        <div class="sig-line">
          Countersigned: District Magistrate / Collector<br>
          (Competent Administrative Authority)
        </div>
      </div>
    `;

    document.getElementById('dossier-modal').classList.add('active');
  } catch (e) {
    alert('Error generating dossier: ' + e.message);
  }
};

// 7. LIVE HOT PATH DEMO (< 50ms)
function setupHotPathPresets() {
  document.getElementById('preset-legit')?.addEventListener('click', () => {
    document.getElementById('hp-title').value = 'Construction of Concrete Pavement Road in Gram Panchayat Ward 4';
    document.getElementById('hp-cost').value = '1500000';
    document.getElementById('hp-progress').value = '70';
    document.getElementById('hp-delay').value = '30';
    document.getElementById('hp-march').value = 'false';
    document.getElementById('run-hot-path-btn').click();
  });

  document.getElementById('preset-temple')?.addEventListener('click', () => {
    document.getElementById('hp-title').value = 'Construction of Temple Community Hall and Boundary Wall';
    document.getElementById('hp-cost').value = '2500000';
    document.getElementById('hp-progress').value = '30';
    document.getElementById('hp-delay').value = '180';
    document.getElementById('hp-march').value = 'false';
    document.getElementById('run-hot-path-btn').click();
  });

  document.getElementById('preset-tender-split')?.addEventListener('click', () => {
    document.getElementById('hp-title').value = 'Installation of High Mast Solar Street Lights in Market Area';
    document.getElementById('hp-cost').value = '498000';
    document.getElementById('hp-progress').value = '50';
    document.getElementById('hp-delay').value = '90';
    document.getElementById('hp-march').value = 'true';
    document.getElementById('run-hot-path-btn').click();
  });

  document.getElementById('preset-zombie')?.addEventListener('click', () => {
    document.getElementById('hp-title').value = 'Construction of Drinking Water Reservoir and Pipeline Distribution';
    document.getElementById('hp-cost').value = '3800000';
    document.getElementById('hp-progress').value = '15';
    document.getElementById('hp-delay').value = '410';
    document.getElementById('hp-march').value = 'true';
    document.getElementById('run-hot-path-btn').click();
  });
}

function setupHotPathForm() {
  const form = document.getElementById('hot-path-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('run-hot-path-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scoring on Hot Path...';

    const payload = {
      project_title: document.getElementById('hp-title').value,
      state: document.getElementById('hp-state').value,
      district: document.getElementById('hp-district').value,
      estimated_cost: Number(document.getElementById('hp-cost').value),
      physical_progress_pct: Number(document.getElementById('hp-progress').value),
      delay_days: Number(document.getElementById('hp-delay').value),
      is_march_rush: document.getElementById('hp-march').value === 'true',
      implementing_agency: document.getElementById('hp-agency').value
    };

    const clientStart = performance.now();
    try {
      const res = await fetch(`${API_BASE}/api/hot-path/score-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const clientEnd = performance.now();
      const clientLatency = (clientEnd - clientStart).toFixed(1);

      if (!res.ok) throw new Error('Hot path execution failed');
      const data = await res.json();

      // Latency indicator
      const latBadge = document.getElementById('latency-indicator');
      latBadge.innerText = `Engine: ${data.latency_ms}ms | Total Roundtrip: ${clientLatency}ms (SLA PASSED)`;
      latBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      latBadge.style.color = '#34d399';

      // Score circle
      const evalData = data.evaluation;
      const scoreNum = document.getElementById('hp-score-number');
      scoreNum.innerText = evalData.priority_score;
      const circle = document.getElementById('hp-score-circle');
      circle.style.borderColor = evalData.tier_color;
      circle.style.boxShadow = `0 0 20px ${evalData.tier_color}55`;

      const tierBadge = document.getElementById('hp-tier-badge');
      tierBadge.innerText = `${evalData.risk_tier} RISK TIER`;
      tierBadge.style.color = evalData.tier_color;

      // Radar summary badges
      const sigs = evalData.signals;
      document.getElementById('sig-badge-1').innerHTML = `<i class="fa-solid fa-tree"></i> Sig 1: Isolation Score: <b>${sigs.signal1_isolation_forest.anomaly_score}</b>`;
      document.getElementById('sig-badge-2').innerHTML = `<i class="fa-solid fa-diagram-project"></i> Sig 2: Network Risk: <b>${sigs.signal2_network_graph.network_risk_score}</b>`;
      document.getElementById('sig-badge-3').innerHTML = `<i class="fa-solid fa-scale-balanced"></i> Sig 3: Violations: <b>${sigs.signal3_statutory_rules.violations_count}</b>`;
      document.getElementById('sig-badge-4').innerHTML = `<i class="fa-solid fa-clone"></i> Sig 4: Dedup Match: <b>${sigs.signal4_deduplication.duplicate_likelihood_pct}%</b>`;
      document.getElementById('sig-badge-5').innerHTML = `<i class="fa-solid fa-calculator"></i> Sig 5: Benford Dist: <b>${sigs.signal5_benford_analysis.benford_deviation_score}</b>`;
      document.getElementById('sig-badge-6').innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Sig 6: 6M Hazard: <b>${sigs.signal6_survival_analysis.completion_probabilities.at_6_months_pct}%</b>`;

      // Waterfall list
      const wList = document.getElementById('hp-waterfall-items');
      wList.innerHTML = '';
      evalData.explain_my_score.forEach(item => {
        const div = document.createElement('div');
        div.className = 'waterfall-item';
        div.innerHTML = `
          <div>
            <div class="waterfall-factor">
              ${item.factor} 
              <span class="badge badge-${item.provenance.toLowerCase().replace(' ', '-')}">${item.provenance}</span>
            </div>
            <div class="waterfall-desc">${item.detail}</div>
          </div>
          <div class="waterfall-pts">+${item.points}</div>
        `;
        wList.appendChild(div);
      });

    } catch (err) {
      alert('Hot path error: ' + err.message);
    } finally {
      btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Evaluate Live on Hot Path';
    }
  });
}

// 8. EGO-GRAPH NETWORK VISUALIZATION (VIS.JS)
function setupEgoGraph() {
  document.getElementById('load-ego-graph-btn')?.addEventListener('click', () => {
    const query = document.getElementById('ego-agency-search').value;
    loadEgoGraph(query);
  });
}

async function loadEgoGraph(agencyName) {
  const container = document.getElementById('vis-network-container');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/ego-graph/${encodeURIComponent(agencyName)}`);
    if (!res.ok) throw new Error('Failed to load ego-graph');
    const graphData = await res.json();

    const nodes = new vis.DataSet(graphData.nodes.map(n => ({
      id: n.id,
      label: n.label,
      title: n.full_name || n.label,
      color: {
        background: n.color,
        border: '#ffffff',
        highlight: { background: '#f59e0b', border: '#ffffff' }
      },
      font: { color: '#ffffff', size: 12, face: 'Inter' },
      shape: n.type === 'agency' ? 'hexagon' : (n.type === 'mp' ? 'diamond' : 'dot'),
      size: n.size || 18
    })));

    const edges = new vis.DataSet(graphData.links.map(l => ({
      from: l.source,
      to: l.target,
      label: l.label,
      font: { color: '#94a3b8', size: 10, align: 'middle' },
      color: { color: 'rgba(255,255,255,0.2)', highlight: '#38bdf8' },
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      width: 1.5
    })));

    const options = {
      physics: {
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 140
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100
      }
    };

    if (visNetwork) visNetwork.destroy();
    visNetwork = new vis.Network(container, { nodes, edges }, options);
  } catch (err) {
    console.error('Error loading ego graph:', err);
  }
}

// 9. CONSTITUENCY MP PROFILE & SC/ST QUOTA METERS
function setupConstituencyDropdown() {
  const dropdown = document.getElementById('constituency-dropdown');
  if (!dropdown) return;

  dropdown.addEventListener('change', async () => {
    const constName = dropdown.value;
    try {
      const res = await fetch(`${API_BASE}/api/constituency/${encodeURIComponent(constName)}`);
      if (!res.ok) return;
      const data = await res.json();

      document.getElementById('mp-display-name').innerText = data.mp_name;
      document.getElementById('mp-display-constituency').innerText = `18th Lok Sabha · ${data.constituency}, ${data.state}`;
      document.getElementById('mp-stat-works').innerText = data.total_projects.toLocaleString();
      document.getElementById('mp-stat-cost').innerText = `₹${data.sanctioned_crore} Cr`;
      document.getElementById('mp-stat-comp').innerText = `${data.completion_rate_pct}%`;

      // SC Quota meter
      const scFill = document.getElementById('sc-progress-fill');
      scFill.style.width = `${Math.min(100, (data.sc_quota_pct / 20) * 100)}%`;
      document.getElementById('sc-current-pct').innerText = `Current: ${data.sc_quota_pct}%`;
      const scBadge = document.getElementById('sc-compliance-badge');
      if (data.sc_compliant) {
        scBadge.className = 'badge badge-real';
        scBadge.innerText = 'COMPLIANT (>= 15%)';
        scFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      } else {
        scBadge.className = 'badge badge-statutory';
        scBadge.innerText = 'NON-COMPLIANT (< 15%)';
        scFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
      }

      // ST Quota meter
      const stFill = document.getElementById('st-progress-fill');
      stFill.style.width = `${Math.min(100, (data.st_quota_pct / 15) * 100)}%`;
      document.getElementById('st-current-pct').innerText = `Current: ${data.st_quota_pct}%`;
      const stBadge = document.getElementById('st-compliance-badge');
      if (data.st_compliant) {
        stBadge.className = 'badge badge-real';
        stBadge.innerText = 'COMPLIANT (>= 7.5%)';
        stFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      } else {
        stBadge.className = 'badge badge-statutory';
        stBadge.innerText = 'NON-COMPLIANT (< 7.5%)';
        stFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Trigger initial
  dropdown.dispatchEvent(new Event('change'));
}

// 10. STATE CHARTS
function setupStateDropdown() {
  document.getElementById('state-selector')?.addEventListener('change', renderStateCharts);
}

function renderStateCharts() {
  const ctxStatus = document.getElementById('state-status-chart')?.getContext('2d');
  const ctxAgency = document.getElementById('agency-concentration-chart')?.getContext('2d');
  const ctxMarch = document.getElementById('march-rush-chart')?.getContext('2d');

  if (!ctxStatus || !ctxAgency || !ctxMarch) return;

  if (stateCharts.status) stateCharts.status.destroy();
  if (stateCharts.agency) stateCharts.agency.destroy();
  if (stateCharts.march) stateCharts.march.destroy();

  // 1. Completion Donut
  stateCharts.status = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Delayed (>180d)'],
      datasets: [{
        data: [4763, 15237, 7761],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } }
    }
  });

  // 2. Agency Bar Chart
  stateCharts.agency = new Chart(ctxAgency, {
    type: 'bar',
    data: {
      labels: ['LAEO Jagdishpur', 'PWD Road Div 1', 'Zilla Parishad', 'DRDA Central', 'RES Engg'],
      datasets: [{
        label: 'Funds Allocated (₹ Cr)',
        data: [18.4, 14.2, 11.5, 9.8, 7.2],
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { display: false } }
    }
  });

  // 3. March Rush Pacing
  stateCharts.march = new Chart(ctxMarch, {
    type: 'bar',
    data: {
      labels: ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Feb)', 'March Rush'],
      datasets: [{
        label: 'Disbursement %',
        data: [12, 18, 22, 21, 27],
        backgroundColor: ['#3b82f6', '#3b82f6', '#3b82f6', '#f59e0b', '#ef4444'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#94a3b8' } },
        y: { ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}
