/* governance.js — 00_README_Control */
function renderGovernance() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Governance & Control', 'Upload a workbook to view governance data.');

  const statusRow = s.readme.find(r => r.Control === 'Status');
  const isDemo = statusRow && String(statusRow.Value).includes('DEMO');

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('shield', 20, 'page-title-icon')}
        <h2>Governance &amp; Control</h2>
      </div>
    </div>
    <div class="page-desc">Workbook versioning, operational status, sector classification, and MRV data governance rules.</div>
  </div>

  ${isDemo ? `<div class="demo-banner" style="font-size:13px;padding:12px 16px;">
    ${renderIcon('alert-triangle', 16)}
    <strong>DEMO STATUS:</strong>&nbsp;${escHtml(statusRow?.['Governance note'] || 'This workbook contains demo data and is not suitable for submission.')}
  </div>` : ''}

  <div class="section-card mb-lg">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('file-text', 15, 'text-muted')}
        <h3 style="margin:0;">Control Parameters</h3>
      </div>
    </div>
    <div class="section-card-body no-pad">
      <table class="gov-table">
        <tbody>
          ${s.readme.map(r => `
          <tr>
            <td class="gov-key">${escHtml(r.Control || '')}</td>
            <td class="gov-val">${r.Control === 'Status' && isDemo
              ? `<span class="badge badge-warn" style="font-size:11.5px;"><span class="qa-dot qa-dot-warn"></span> ${escHtml(r.Value||'')}</span>`
              : `<strong>${escHtml(r.Value||r.Control||'')}</strong>`
            }</td>
            <td class="gov-note">${escHtml(r['Governance note'] || r.Value || '')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
window.renderGovernance = renderGovernance;
