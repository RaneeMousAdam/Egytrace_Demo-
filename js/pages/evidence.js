/* evidence.js — 11_Evidence_Register */
function renderEvidence() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Evidence Register', 'Upload a workbook to view the evidence register.');

  const rows    = s.evidence;
  const sheets  = [...new Set(rows.map(r => r['Mapped Sheet']))].filter(Boolean);
  const owners  = [...new Set(rows.map(r => r['Owner']))].filter(Boolean);
  const mapped  = rows.filter(r => r.Status === 'Mapped').length;
  const pending = rows.filter(r => r.Status !== 'Mapped').length;

  // Pre-filter: check if we came here from an EV-ID link
  const preFilter = window._evidenceFilter || '';
  window._evidenceFilter = '';

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('folder', 20, 'page-title-icon')}
        <h2>Evidence Register</h2>
      </div>
      <div class="page-header-actions">
        <span class="badge badge-pass"><span class="qa-dot qa-dot-pass"></span> ${mapped} Mapped</span>
        ${pending > 0 ? `<span class="badge badge-warn"><span class="qa-dot qa-dot-warn"></span> ${pending} Pending</span>` : ''}
      </div>
    </div>
    <div class="page-desc">Comprehensive audit-trail registry linking activity data, lab certificates, invoices, and weighbridge records.</div>
  </div>

  ${buildDemoBanner(s)}

  <div class="filter-row mb-md">
    <input class="filter-input" id="ev-search" placeholder="Search by evidence ID, description..." value="${escHtml(preFilter)}" oninput="filterEvidenceTable()">
    <select class="filter-select" id="ev-status" onchange="filterEvidenceTable()">
      <option value="">All Statuses</option>
      <option value="Mapped">Mapped</option>
      <option value="Pending">Pending</option>
    </select>
    <select class="filter-select" id="ev-sheet" onchange="filterEvidenceTable()">
      <option value="">All Sheets</option>
      ${sheets.map(s => `<option value="${escHtml(s)}">${escHtml(s)}</option>`).join('')}
    </select>
    <select class="filter-select" id="ev-owner" onchange="filterEvidenceTable()">
      <option value="">All Owners</option>
      ${owners.map(o => `<option value="${escHtml(o)}">${escHtml(o)}</option>`).join('')}
    </select>
  </div>

  <div class="section-card">
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table" id="ev-table">
          <thead><tr>
            <th>Evidence ID</th><th>Type</th><th>Description</th>
            <th>Source System</th><th>Mapped Sheet</th>
            <th>Status</th><th>Owner</th><th>Reviewer</th><th>Frequency</th><th>Notes</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => {
              const isMapped  = r.Status === 'Mapped';
              const isPending = !isMapped;
              return `
            <tr class="${isPending?'pending-row':''}" data-id="${escHtml(r.evidenceId||'')}" data-status="${escHtml(r.Status||'')}" data-sheet="${escHtml(r['Mapped Sheet']||'')}" data-owner="${escHtml(r['Owner']||'')}">
              <td class="mono" style="color:var(--accent-2);font-weight:600;">${escHtml(r.evidenceId||'')}</td>
              <td style="font-size:12px;">${escHtml(r['Evidence Type']||'—')}</td>
              <td style="max-width:220px;font-size:12px;">${escHtml(r.Description||'—')}</td>
              <td style="font-size:12px;color:var(--text-secondary);">${escHtml(r['Source System']||'—')}</td>
              <td style="font-size:12px;color:var(--accent-2);">${escHtml(r['Mapped Sheet']||'—')}</td>
              <td>${isMapped
                ? '<span class="badge badge-pass"><span class="qa-dot qa-dot-pass"></span> Mapped</span>'
                : '<span class="badge badge-warn"><span class="qa-dot qa-dot-warn"></span> Pending</span>'}</td>
              <td style="font-size:12px;">${escHtml(r['Owner']||'—')}</td>
              <td style="font-size:12px;">${escHtml(r['Reviewer']||'—')}</td>
              <td style="font-size:11px;color:var(--text-muted);">${escHtml(r['Frequency']||'—')}</td>
              <td style="font-size:11.5px;color:var(--text-muted);max-width:180px;">${escHtml(r['Notes']||'—')}</td>
            </tr>`;}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function filterEvidenceTable() {
  const search = (document.getElementById('ev-search')?.value || '').toLowerCase();
  const status = document.getElementById('ev-status')?.value || '';
  const sheet  = document.getElementById('ev-sheet')?.value || '';
  const owner  = document.getElementById('ev-owner')?.value || '';
  const rows   = document.querySelectorAll('#ev-table tbody tr');
  rows.forEach(tr => {
    const text  = tr.textContent.toLowerCase();
    const trId  = tr.dataset.id || '';
    const ok = (!search || text.includes(search) || trId.toLowerCase().includes(search))
            && (!status || tr.dataset.status === status)
            && (!sheet  || tr.dataset.sheet  === sheet)
            && (!owner  || tr.dataset.owner  === owner);
    tr.style.display = ok ? '' : 'none';
  });
}

function navigateToEvidence(evId) {
  window._evidenceFilter = evId;
  navigate('evidence');
}

window.renderEvidence        = renderEvidence;
window.filterEvidenceTable   = filterEvidenceTable;
window.navigateToEvidence    = navigateToEvidence;
