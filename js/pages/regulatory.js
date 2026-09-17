/* regulatory.js — 12_Regulatory_Refs */
function renderRegulatory() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Regulatory References', 'Upload a workbook to view regulatory references.');

  const refs = s.regulatory;
  const official = refs.filter(r => r.Status === 'Official');
  const external = refs.filter(r => r.Status !== 'Official');

  function refCard(r) {
    return `
    <div class="reg-card">
      <div class="reg-meta">
        ${fmtStatusChip(r.Status)}
        ${r['Last checked'] ? `<span style="font-size:10px;color:var(--text-muted);">Checked: ${escHtml(r['Last checked']||'')}</span>` : ''}
        ${r['Applied sheets'] ? `<span class="reg-sheets">Sheets: ${escHtml(r['Applied sheets'])}</span>` : ''}
      </div>
      <div class="reg-title">${escHtml(r.Reference||'')}</div>
      <div class="reg-desc">${escHtml(r['Workbook application']||'')}</div>
      ${r['Page / section pointer'] ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">📍 ${escHtml(r['Page / section pointer'])}</div>` : ''}
      ${r.Notes ? `<div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;line-height:1.5;">💬 ${escHtml(r.Notes)}</div>` : ''}
      ${r['Official source URL'] ? `<a href="${escHtml(r['Official source URL'])}" target="_blank" rel="noopener" class="reg-url-btn">🔗 Official Source ↗</a>` : ''}
    </div>`;
  }

  return `
  <div class="page-header">
    <h2>📜 Regulatory References</h2>
    <div class="subtitle">Source: 12_Regulatory_Refs — EU CBAM, EU ETS MRR and ISO standards applied in this workbook</div>
    <div class="badge-row">
      <span class="badge badge-info">${official.length} Official EU references</span>
      <span class="badge badge-accent">${external.length} External standards</span>
    </div>
  </div>

  ${buildDemoBanner(s)}

  <div style="font-size:12px;color:var(--text-muted);margin-bottom:var(--sp-lg);padding:var(--sp-sm) var(--sp-md);background:var(--bg-card);border-radius:var(--r-sm);border:1px solid var(--border);">
    ⚠ Reference only — official standard texts are not reproduced. Always verify against the most current version of each regulation or standard.
  </div>

  ${official.length > 0 ? `
  <div style="margin-bottom:var(--sp-md);">
    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.09em;margin-bottom:var(--sp-md);">🏛️ Official EU / CBAM References</div>
    <div class="grid-2">${official.map(refCard).join('')}</div>
  </div>` : ''}

  ${external.length > 0 ? `
  <div style="margin-top:var(--sp-xl);">
    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.09em;margin-bottom:var(--sp-md);">📗 External Standards</div>
    <div class="grid-2">${external.map(refCard).join('')}</div>
  </div>` : ''}`;
}
window.renderRegulatory = renderRegulatory;
