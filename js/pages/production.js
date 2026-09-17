/* production.js — 03_Production_Input */
function renderProduction() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Production Input', 'Upload a workbook to view production data.');

  const rows  = s.production;
  const dates = rows.map(r => fmtDate(r.Date));
  const clinkerData = rows.map(r => r['Clinker Produced t'] ?? 0);
  const cementData  = rows.map(r => r['Cement Produced t'] ?? 0);
  const factorData  = rows.map(r => r['Clinker Factor'] ?? 0);

  registerLineChart('chart-prod-trend', dates,
    [
      { label: 'Clinker Produced (t)', data: clinkerData, color: '#00d4aa' },
      { label: 'Cement Produced (t)',  data: cementData,  color: '#4facfe' },
    ], 't');

  registerLineChart('chart-factor-trend', dates,
    [{ label: 'Clinker Factor', data: factorData, color: '#f59e0b' }], 'ratio');

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('factory', 20, 'page-title-icon')}
        <h2>Production Input</h2>
      </div>
      <div class="page-header-actions">
        <span class="chip chip-controlled">${rows.length} reporting months</span>
      </div>
    </div>
    <div class="page-desc">Monthly kiln clinker output, finished cement production, clinker-to-cement ratios, and additive mass balances.</div>
  </div>

  ${buildDemoBanner(s)}

  <div class="grid-2 mb-lg">
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('trending-up', 15, 'text-muted')}
          <h3 style="margin:0;">Clinker &amp; Cement Production Trend</h3>
        </div>
      </div>
      <div class="chart-container" style="height:220px;"><canvas id="chart-prod-trend"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('sliders', 15, 'text-muted')}
          <h3 style="margin:0;">Clinker Factor Trend</h3>
        </div>
      </div>
      <div class="chart-container" style="height:220px;"><canvas id="chart-factor-trend"></canvas></div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('file-text', 15, 'text-muted')}
        <h3 style="margin:0;">Monthly Production Register</h3>
      </div>
    </div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Date</th><th>Quarter</th><th>Kiln</th><th>Type</th>
            <th class="num">Clinker Produced</th><th class="num">Cement Produced</th>
            <th class="num">Clinker Used</th><th class="num">Gypsum</th>
            <th class="num">Limestone Add.</th><th class="num">Other Add.</th>
            <th class="num">Clinker Factor</th>
            <th>Evidence ID</th><th>QA Status</th><th>Notes</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
            <tr>
              <td>${escHtml(fmtDate(r.Date))}</td>
              <td>${escHtml(r.Quarter||'—')}</td>
              <td>${escHtml(r['Kiln Line']||'—')}</td>
              <td style="font-size:12px;">${escHtml(r['Cement Type']||'—')}</td>
              <td class="num">${fmt(r['Clinker Produced t'],'t')}</td>
              <td class="num">${fmt(r['Cement Produced t'],'t')}</td>
              <td class="num">${fmt(r['Clinker Used t'],'t')}</td>
              <td class="num">${fmt(r['Gypsum t'],'t')}</td>
              <td class="num">${fmt(r['Limestone Additive t'],'t')}</td>
              <td class="num">${fmt(r['Other Additives t'],'t')}</td>
              <td class="num mono" style="color:var(--accent);">${fmt(r['Clinker Factor'],'ratio')}</td>
              <td>${evLink(r['Evidence ID'])}</td>
              <td>${fmtQaBadge(r['QA Status'])}</td>
              <td style="font-size:11.5px;color:var(--text-muted);max-width:200px;">${escHtml(r.Notes||'')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
window.renderProduction = renderProduction;
