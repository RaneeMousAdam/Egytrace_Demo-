/* report_outputs.js — 10_Report_Outputs */
function renderReportOutputs() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Report Outputs', 'Upload a workbook to view report outputs.');

  const rows = s.reportOutputs;

  // Group by "Mapped to Cement UI"
  const groups = {};
  rows.forEach(r => {
    const ui = r['Mapped to Cement UI'] || 'Other';
    const keys = ui.split('/').map(k => k.trim());
    const key = keys[0] || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('file-text', 20, 'page-title-icon')}
        <h2>Report Outputs</h2>
      </div>
      <div class="page-header-actions">
        <span class="chip chip-controlled">${rows.length} verified fields</span>
      </div>
    </div>
    <div class="page-desc">Aggregated regulatory reporting schedule aligned with CBAM, EU ETS, and third-party verification templates.</div>
  </div>

  ${buildDemoBanner(s)}

  <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;margin-bottom:var(--sp-lg);">
    ${Object.keys(groups).map(g => `
      <a href="#group-${escHtml(g.replace(/\s/g,''))}" style="text-decoration:none;">
        <span class="chip chip-controlled">${escHtml(g)} (${groups[g].length})</span>
      </a>`).join('')}
  </div>

  ${Object.entries(groups).map(([group, groupRows]) => `
  <div class="section-card mb-lg" id="group-${escHtml(group.replace(/\s/g,''))}">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('file-text', 15, 'text-muted')}
        <h3 style="margin:0;">${escHtml(group)}</h3>
      </div>
      <span class="chip chip-controlled">${groupRows.length} fields</span>
    </div>
    <div class="section-card-body no-pad">
      <table class="data-table">
        <thead><tr>
          <th>Output Field</th><th>Value</th><th>Unit</th>
          <th>Source</th><th>Report Label</th><th>Governance Position</th><th>Notes</th>
        </tr></thead>
        <tbody>
          ${groupRows.map(r => {
            const rawVal = r['_valueNum'] !== undefined ? r['_valueNum'] : r.Value;
            const isDate = r.Unit === 'date';
            let displayVal;
            if (rawVal === null || rawVal === undefined || rawVal === '') {
              displayVal = '<span class="badge badge-missing">Missing</span>';
            } else if (isDate) {
              displayVal = `<span class="mono">${escHtml(String(r.Value||''))}</span>`;
            } else if (typeof rawVal === 'number') {
              displayVal = `<span class="mono" style="color:var(--accent);">${fmt(rawVal, r.Unit)}</span>`;
            } else {
              displayVal = `<strong>${escHtml(String(rawVal))}</strong>`;
            }
            return `
          <tr>
            <td><strong>${escHtml(r['Output Field']||'')}</strong></td>
            <td>${displayVal}</td>
            <td class="unit-col">${escHtml(r.Unit||'')}</td>
            <td style="font-size:12px;color:var(--accent-2);">${escHtml(r.Source||'—')}</td>
            <td style="font-size:12px;">${escHtml(r['Report Label']||'—')}</td>
            <td style="font-size:11.5px;color:var(--text-secondary);max-width:200px;">${escHtml(r['Governance Position']||'—')}</td>
            <td style="font-size:11px;color:var(--text-muted);">${escHtml(r.Notes||'—')}</td>
          </tr>`;}).join('')}
        </tbody>
      </table>
    </div>
  </div>`).join('')}`;
}
window.renderReportOutputs = renderReportOutputs;
