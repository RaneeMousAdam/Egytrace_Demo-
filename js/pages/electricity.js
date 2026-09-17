/* electricity.js — 06_Electricity_Input */
function renderElectricity() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Electricity Input', 'Upload a workbook to view electricity data.');

  const rows  = s.electricity;
  const dates = rows.map(r => fmtDate(r.Date));

  registerLineChart('chart-elec-mwh', dates,
    [{ label: 'Grid MWh', data: rows.map(r => r['Grid MWh'] ?? 0), color: '#4facfe' }], 'MWh');
  registerLineChart('chart-elec-co2', dates,
    [{ label: 'Indirect Grid CO₂ (t)', data: rows.map(r => r['Grid CO2 t'] ?? 0), color: '#00d4aa' }], 'tCO₂');

  const totalMWh = rows.reduce((a,r) => a+(r['Grid MWh']||0), 0);
  const totalCO2 = rows.reduce((a,r) => a+(r['Grid CO2 t']||0), 0);

  return `
  <div class="page-header">
    <h2>⚡ Electricity Input</h2>
    <div class="subtitle">Source: 06_Electricity_Input — purchased grid electricity, grid EF and indirect CO₂</div>
    <div class="badge-row">
      <span class="badge badge-info">${fmtInt(totalMWh)} MWh total</span>
      <span class="badge badge-accent">${fmtDec(totalCO2,2)} tCO₂ indirect</span>
    </div>
  </div>

  ${buildDemoBanner(s)}

  <div class="grid-2 mb-lg">
    <div class="chart-card">
      <div class="chart-card-header"><h3>Grid Electricity Consumption Trend</h3></div>
      <div class="chart-container" style="height:200px;"><canvas id="chart-elec-mwh"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><h3>Indirect Grid CO₂ Trend</h3></div>
      <div class="chart-container" style="height:200px;"><canvas id="chart-elec-co2"></canvas></div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-card-header"><h3>📋 Monthly Electricity Data</h3></div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Date</th><th>Meter / Source</th>
            <th class="num">Grid MWh</th><th class="num">Grid EF (tCO₂/MWh)</th><th class="num">Grid CO₂ (t)</th>
            <th class="num">Self-gen MWh</th><th class="num">Self-gen EF</th><th class="num">Self-gen CO₂ (t)</th>
            <th class="num">Renewable MWh</th>
            <th>Evidence ID</th><th>QA Status</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
            <tr>
              <td>${escHtml(fmtDate(r.Date))}</td>
              <td style="font-size:12px;">${escHtml(r['Meter / Source']||'—')}</td>
              <td class="num">${fmt(r['Grid MWh'],'MWh')}</td>
              <td class="num">${fmt(r['Grid EF tCO2/MWh'],'tCO2/MWh')}</td>
              <td class="num" style="color:var(--accent);">${fmt(r['Grid CO2 t'],'tCO2')}</td>
              <td class="num">${fmt(r['Self-generation MWh'],'MWh')}</td>
              <td class="num">${fmt(r['Self-generation EF'],'tCO2/MWh')}</td>
              <td class="num">${fmt(r['Self-generation CO2 t'],'tCO2')}</td>
              <td class="num">${fmt(r['Renewable MWh'],'MWh')}</td>
              <td>${evLink(r['Evidence ID'])}</td>
              <td>${fmtQaBadge(r['QA Status'])}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot style="border-top:2px solid var(--border-strong);">
            <tr style="background:rgba(15,31,61,0.6);">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td class="num mono"><strong>${fmtInt(totalMWh)}</strong></td>
              <td></td>
              <td class="num mono" style="color:var(--accent);"><strong>${fmtDec(totalCO2,2)}</strong></td>
              <td colspan="6"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>`;
}
window.renderElectricity = renderElectricity;
