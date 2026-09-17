/* constants.js — 07_Constants_EF_NCV */
function renderConstants() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Constants & Factors', 'Upload a workbook to view constants.');

  return `
  <div class="page-header">
    <h2>🔬 Constants, EF &amp; NCV</h2>
    <div class="subtitle">Source: 07_Constants_EF_NCV — controlled constants, emission factors and fuel default values</div>
  </div>

  ${buildDemoBanner(s)}

  <!-- General Constants Table -->
  <div class="section-card mb-lg">
    <div class="section-card-header">
      <h3>📊 General Constants &amp; QA Bounds</h3>
      <span class="chip chip-controlled">${s.constants.length} entries</span>
    </div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Constant / Factor</th><th class="num">Value</th><th>Unit</th>
            <th>Source / Rationale</th><th>Used In</th><th>Change Control</th><th>Status</th><th>Source URL</th>
          </tr></thead>
          <tbody>
            ${s.constants.map(r => `
            <tr>
              <td><strong>${escHtml(r['Constant / Factor']||'')}</strong></td>
              <td class="num mono" style="color:var(--accent);">${r.Value !== null ? fmtDec(parseFloat(r.Value),4) : '<span class="badge badge-missing">Missing</span>'}</td>
              <td class="unit-col">${escHtml(r.Unit||'')}</td>
              <td style="font-size:11px;color:var(--text-secondary);max-width:220px;">${escHtml(r['Source / rationale']||'—')}</td>
              <td style="font-size:12px;color:var(--accent-2);">${escHtml(r['Used in']||'—')}</td>
              <td style="font-size:12px;">${escHtml(r['Change control']||'—')}</td>
              <td>${fmtStatusChip(r.Status)}</td>
              <td style="font-size:11px;">${r['Source URL'] ? `<a href="${escHtml(r['Source URL'])}" target="_blank" class="text-accent" style="font-size:10px;">Link ↗</a>` : '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Fuel Defaults Table -->
  <div class="section-card">
    <div class="section-card-header">
      <h3>⛽ Fuel Default NCV / EF / Oxidation Factors</h3>
      <span class="chip chip-controlled">${s.fuelDefaults.length} fuel types</span>
    </div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Fuel Type</th>
            <th class="num">Default NCV</th><th>NCV Unit</th>
            <th class="num">Default EF</th><th>EF Unit</th>
            <th class="num">Default Ox. Factor</th>
            <th class="num">Default Biomass %</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            ${s.fuelDefaults.map(r => {
              const biomass = parseFloat(r['Default Biomass %']);
              const isAlt   = !isNaN(biomass) && biomass > 0;
              return `
            <tr>
              <td><strong>${escHtml(r['Fuel Type']||'')}</strong>${isAlt ? ' <span class="chip chip-demo" style="font-size:10px;">Alt</span>' : ''}</td>
              <td class="num mono" style="color:var(--accent);">${fmt(r['Default NCV'],'GJ/t clinker')}</td>
              <td class="unit-col">${escHtml(r['NCV Unit']||'')}</td>
              <td class="num mono" style="color:var(--qa-warn);">${fmt(r['Default EF'],'tCO2/TJ')}</td>
              <td class="unit-col">${escHtml(r['EF Unit']||'')}</td>
              <td class="num">${fmt(r['Default Ox.'],'ratio')}</td>
              <td class="num" style="color:${isAlt?'var(--accent-3)':'var(--text-secondary)'};">${fmt(r['Default Biomass %'],'%')}</td>
              <td style="font-size:11px;color:var(--text-muted);max-width:200px;">${escHtml(r['Notes']||'')}</td>
            </tr>`;}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
window.renderConstants = renderConstants;
