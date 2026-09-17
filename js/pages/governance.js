/* governance.js — 00_README_Control */
function renderGovernance() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Governance & Control', 'Upload a workbook to view governance data.');

  const statusRow = s.readme.find(r => r.Control === 'Status');
  const isDemo = statusRow && String(statusRow.Value).includes('DEMO');

  return `
  <div class="page-header">
    <h2>🏛️ Governance &amp; Control</h2>
    <div class="subtitle">Source: 00_README_Control — workbook version, status, sector and key governance rules</div>
  </div>

  ${isDemo ? `<div class="demo-banner" style="font-size:13px;padding:12px 16px;">
    <span style="font-size:18px;">⚠️</span>
    <strong>DEMO STATUS:</strong>&nbsp;${escHtml(statusRow?.['Governance note'] || 'This workbook contains demo data and is not suitable for submission.')}
  </div>` : ''}

  <div class="section-card mb-lg">
    <div class="section-card-header"><h3>📋 Control Panel</h3></div>
    <div class="section-card-body no-pad">
      <table class="gov-table">
        <tbody>
          ${s.readme.map(r => `
          <tr>
            <td class="gov-key">${escHtml(r.Control || '')}</td>
            <td class="gov-val">${r.Control === 'Status' && isDemo
              ? `<span class="badge badge-warn" style="font-size:12px;">⚠ ${escHtml(r.Value||'')}</span>`
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
