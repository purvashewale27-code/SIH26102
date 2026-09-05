/**
 * STEP 1: Simple & Clean Client-Side Logic
 */

let currentPage = 1;
const limit = 20;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadProjects();

  // Search input event
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
});

// 1. Fetch Top Summary Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();

    document.getElementById('stat-works').innerText = data.totalProjects.toLocaleString('en-IN');
    document.getElementById('stat-cost').innerText = `₹${data.totalSanctionedCrore.toLocaleString('en-IN')} Cr`;
    document.getElementById('stat-states').innerText = `${data.totalStates} States / UTs`;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// 2. Fetch Paginated Project Works
async function loadProjects() {
  const tbody = document.getElementById('projects-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading real government projects...</td></tr>';

  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: limit,
      search: currentSearch
    });

    const res = await fetch(`/api/projects?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load projects');
    const result = await res.json();

    const projects = result.data;
    if (!projects || projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No projects found matching your search.</td></tr>';
      document.getElementById('prev-btn').disabled = true;
      document.getElementById('next-btn').disabled = true;
      return;
    }

    tbody.innerHTML = '';
    projects.forEach(p => {
      const tr = document.createElement('tr');
      const isCompleted = p.status.toLowerCase().includes('complete');
      const statusClass = isCompleted ? 'status-completed' : 'status-in-progress';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 600; color: #2563eb;">${p.id}</td>
        <td>
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${p.title}</div>
          <div style="font-size: 11px; color: #64748b;">Sanctioned on: ${p.date}</div>
        </td>
        <td>
          <b>${p.state}</b>
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
          <span class="status-badge ${statusClass}">${p.status}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Update Pagination UI
    document.getElementById('page-info').innerText = `Page ${result.page} of ${result.totalPages || 1} (${result.total.toLocaleString()} works)`;
    document.getElementById('prev-btn').disabled = result.page <= 1;
    document.getElementById('next-btn').disabled = result.page >= result.totalPages;

  } catch (err) {
    console.error('Error loading projects:', err);
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell" style="color:#ef4444;">Failed to load project records.</td></tr>';
  }
}
