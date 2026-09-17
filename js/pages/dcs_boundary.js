/* dcs_boundary.js — 02_DCS_Boundary_Map */
function renderDcsBoundary() {
  const s = window.STORE;
  if (!s) return renderEmptyState('DCS Boundary Map', 'Upload a workbook to view the boundary map.');

  const rows = s.dcsMap;
  const areas   = [...new Set(rows.map(r => r['Boundary Area']))].filter(Boolean);
  const owners  = [...new Set(rows.map(r => r['Owner']))].filter(Boolean);
  const mapped  = rows.filter(r => r['Mapped Status'] === 'Mapped').length;
  const pending = rows.filter(r => r['Mapped Status'] !== 'Mapped').length;

  return `
  <div class="page-header">
    <h2>🗺️ DCS / ERP / Lab Boundary Map</h2>
    <div class="subtitle">Source: 02_DCS_Boundary_Map — ${rows.length} fields mapped from plant systems to MRV inputs</div>
    <div class="badge-row">
      <span class="badge badge-pass">${mapped} Mapped</span>
      ${pending > 0 ? `<span class="badge badge-warn">${pending} Pending</span>` : ''}
    </div>
  </div>

  ${buildDemoBanner(s)}

  <div class="filter-row mb-md">
    <input class="filter-input" id="dcs-search" placeholder="🔍 Search boundary, tag, field..." oninput="filterDcsTable()">
    <select class="filter-select" id="dcs-area" onchange="filterDcsTable()">
      <option value="">All Areas</option>
      ${areas.map(a => `<option value="${escHtml(a)}">${escHtml(a)}</option>`).join('')}
    </select>
    <select class="filter-select" id="dcs-owner" onchange="filterDcsTable()">
      <option value="">All Owners</option>
      ${owners.map(o => `<option value="${escHtml(o)}">${escHtml(o)}</option>`).join('')}
    </select>
    <select class="filter-select" id="dcs-status" onchange="filterDcsTable()">
      <option value="">All Statuses</option>
      <option value="Mapped">Mapped</option>
      <option value="Pending">Pending</option>
    </select>
  </div>

  <div class="section-card">
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table" id="dcs-table">
          <thead><tr>
            <th>Boundary Area</th>
            <th>Source System</th>
            <th>DCS/ERP/Lab Tag</th>
            <th>MRV Field</th>
            <th>Unit</th>
            <th>Frequency</th>
            <th>Evidence Required</th>
            <th>Calculation Use</th>
            <th>Status</th>
            <th>Owner</th>
            <th>QA/QC Rule</th>
          </tr></thead>
          <tbody>
            ${rows.map((r, i) => {
              const isMapped = r['Mapped Status'] === 'Mapped';
              return `<tr data-area="${escHtml(r['Boundary Area']||'')}" data-owner="${escHtml(r['Owner']||'')}" data-status="${escHtml(r['Mapped Status']||'')}">
                <td><strong>${escHtml(r['Boundary Area']||'—')}</strong></td>
                <td style="font-size:12px;">${escHtml(r['Source System']||'—')}</td>
                <td class="mono" style="font-size:11px;color:var(--accent-2);">${escHtml(r['DCS/ERP/Lab Tag']||'—')}</td>
                <td><strong>${escHtml(r['MRV Field']||'—')}</strong></td>
                <td class="unit-col">${escHtml(r['Unit']||'')}</td>
                <td style="font-size:12px;">${escHtml(r['Frequency']||'—')}</td>
                <td style="font-size:11px;color:var(--text-secondary);max-width:160px;">${escHtml(r['Evidence Required']||'—')}</td>
                <td style="font-size:12px;color:var(--accent-2);">${escHtml(r['Calculation Use']||'—')}</td>
                <td>${isMapped ? '<span class="chip chip-mapped">✓ Mapped</span>' : '<span class="chip chip-pending">Pending</span>'}</td>
                <td style="font-size:12px;">${escHtml(r['Owner']||'—')}</td>
                <td style="font-size:11px;color:var(--text-muted);max-width:160px;">${escHtml(r['QA/QC Rule']||'—')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function filterDcsTable() {
  const search = (document.getElementById('dcs-search')?.value || '').toLowerCase();
  const area   = document.getElementById('dcs-area')?.value || '';
  const owner  = document.getElementById('dcs-owner')?.value || '';
  const status = document.getElementById('dcs-status')?.value || '';
  const rows = document.querySelectorAll('#dcs-table tbody tr');
  rows.forEach(tr => {
    const text = tr.textContent.toLowerCase();
    const trArea   = tr.dataset.area   || '';
    const trOwner  = tr.dataset.owner  || '';
    const trStatus = tr.dataset.status || '';
    const ok = (!search || text.includes(search))
            && (!area   || trArea === area)
            && (!owner  || trOwner === owner)
            && (!status || trStatus === status);
    tr.style.display = ok ? '' : 'none';
  });
}
window.renderDcsBoundary = renderDcsBoundary;
window.filterDcsTable    = filterDcsTable;
