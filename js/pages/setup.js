/* setup.js — 01_Setup */
function renderSetup() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Setup', 'Upload a workbook to view setup parameters.');

  // Group rows by governance owner
  const groups = {};
  s.setupRows.forEach(r => {
    const owner = r['Governance owner'] || 'Other';
    if (!groups[owner]) groups[owner] = [];
    groups[owner].push(r);
  });

  const groupOrder = ['Plant', 'EgyTrace', 'Production', 'Sustainability', 'Other'];
  const orderedGroups = [
    ...groupOrder.filter(g => groups[g]),
    ...Object.keys(groups).filter(g => !groupOrder.includes(g))
  ];

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('settings', 20, 'page-title-icon')}
        <h2>Setup &amp; Reporting Period</h2>
      </div>
    </div>
    <div class="page-desc">Facility boundaries, reporting period timeframe, calcination methodology, and governance owners.</div>
  </div>

  ${buildDemoBanner(s)}

  ${orderedGroups.map(owner => `
  <div class="section-card mb-lg">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('sliders', 15, 'text-muted')}
        <h3 style="margin:0;">${escHtml(owner)} Parameters</h3>
      </div>
      <span class="chip chip-controlled">${groups[owner].length} items</span>
    </div>
    <div class="section-card-body no-pad">
      <table class="gov-table">
        <thead style="border-bottom:1px solid var(--border);">
          <tr>
            <td class="gov-key" style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);">Parameter</td>
            <td class="gov-val" style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);">Value</td>
            <td style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);">Unit</td>
            <td style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);">Required</td>
            <td class="gov-note" style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);">Notes</td>
          </tr>
        </thead>
        <tbody>
          ${groups[owner].map(r => `
          <tr>
            <td class="gov-key">${escHtml(r.Parameter || '')}</td>
            <td class="gov-val"><strong>${escHtml(r.Value || '—')}</strong></td>
            <td style="font-size:11px;color:var(--text-muted);">${escHtml(r.Unit || '')}</td>
            <td>${r['Required?'] === 'Yes' ? '<span class="badge badge-pass" style="font-size:10px;">Required</span>' : '<span style="font-size:11px;color:var(--text-muted);">Optional</span>'}</td>
            <td class="gov-note">${escHtml(r.Notes || '')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`).join('')}`;
}
window.renderSetup = renderSetup;
