/* raw_material.js — 04_Raw_Material_Input */
function renderRawMaterial() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Raw Material Input', 'Upload a workbook to view raw material data.');

  const rows  = s.rawMaterial;
  const dates = rows.map(r => fmtDate(r.Date));

  registerLineChart('chart-rawmat-qty', dates,
    [{ label: 'Quantity (t)', data: rows.map(r => r['Quantity t'] ?? 0), color: '#00d4aa' }], 't');
  registerLineChart('chart-rawmat-co2', dates,
    [
      { label: 'CaCO₃ CO₂ (t)', data: rows.map(r => r['CaCO3 CO2 t'] ?? 0), color: '#4facfe' },
      { label: 'MgCO₃ CO₂ (t)', data: rows.map(r => r['MgCO3 CO2 t'] ?? 0), color: '#a78bfa' },
      { label: 'Process CO₂ Method A (t)', data: rows.map(r => r['Process CO2 Method A t'] ?? 0), color: '#00d4aa' },
    ], 'tCO₂');

  return `
  <div class="page-header">
    <h2>🪨 Raw Material Input</h2>
    <div class="subtitle">Source: 04_Raw_Material_Input — carbonate input pathway (Method A)</div>
  </div>

  ${buildDemoBanner(s)}

  <div class="grid-2 mb-lg">
    <div class="chart-card">
      <div class="chart-card-header"><h3>Raw Material Quantity Trend</h3></div>
      <div class="chart-container" style="height:200px;"><canvas id="chart-rawmat-qty"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><h3>Process CO₂ Trend (Method A)</h3></div>
      <div class="chart-container" style="height:200px;"><canvas id="chart-rawmat-co2"></canvas></div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-card-header"><h3>📋 Monthly Raw Material Data</h3></div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Date</th><th>Material</th>
            <th class="num">Quantity (t)</th><th class="num">CaCO₃ %</th><th class="num">MgCO₃ %</th>
            <th class="num">Moisture %</th><th class="num">Calcination Conv.</th>
            <th class="num">CaCO₃ CO₂ (t)</th><th class="num">MgCO₃ CO₂ (t)</th>
            <th class="num">Process CO₂ Method A (t)</th>
            <th>Evidence ID</th><th>QA Status</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
            <tr>
              <td>${escHtml(fmtDate(r.Date))}</td>
              <td>${escHtml(r.Material||'—')}</td>
              <td class="num">${fmt(r['Quantity t'],'t')}</td>
              <td class="num">${fmt(r['CaCO3 %'],'%')}</td>
              <td class="num">${fmt(r['MgCO3 %'],'%')}</td>
              <td class="num">${fmt(r['Moisture %'],'%')}</td>
              <td class="num">${fmt(r['Calcination Conversion'],'ratio')}</td>
              <td class="num">${fmt(r['CaCO3 CO2 t'],'tCO2')}</td>
              <td class="num">${fmt(r['MgCO3 CO2 t'],'tCO2')}</td>
              <td class="num" style="color:var(--accent);">${fmt(r['Process CO2 Method A t'],'tCO2')}</td>
              <td>${evLink(r['Evidence ID'])}</td>
              <td>${fmtQaBadge(r['QA Status'])}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
window.renderRawMaterial = renderRawMaterial;
