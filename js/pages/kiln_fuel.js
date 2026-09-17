/* kiln_fuel.js — 05_Kiln_Fuel_Input */
function renderKilnFuel() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Kiln Fuel Input', 'Upload a workbook to view fuel data.');

  const rows   = s.kilnFuel;
  const fuels  = [...new Set(rows.map(r => r['Fuel Type']))].filter(Boolean);
  const labels = fuels;

  // Fossil vs biogenic CO2 by fuel type
  const fossilData   = fuels.map(f => rows.filter(r => r['Fuel Type']===f).reduce((a,r) => a+(r['Fossil CO2 t']||0), 0));
  const biogenicData = fuels.map(f => rows.filter(r => r['Fuel Type']===f).reduce((a,r) => a+(r['Biogenic CO2 Memo t']||0), 0));
  const energyData   = fuels.map(f => rows.filter(r => r['Fuel Type']===f).reduce((a,r) => a+(r['Energy GJ']||0), 0));

  registerGroupedBarChart('chart-fuel-co2', labels,
    [
      { label: 'Fossil CO₂ (t)', data: fossilData,   color: '#f59e0b' },
      { label: 'Biogenic CO₂ Memo (t)', data: biogenicData, color: '#a78bfa' },
    ], 'tCO₂');

  registerStackedBarChart('chart-fuel-energy', labels,
    [{ label: 'Energy (GJ)', data: energyData, color: '#00d4aa' }], 'GJ');

  // Totals
  const totalFossil   = rows.reduce((a,r) => a+(r['Fossil CO2 t']||0), 0);
  const totalBiogenic = rows.reduce((a,r) => a+(r['Biogenic CO2 Memo t']||0), 0);
  const totalEnergy   = rows.reduce((a,r) => a+(r['Energy GJ']||0), 0);

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('flame', 20, 'page-title-icon')}
        <h2>Kiln Fuel Input</h2>
      </div>
      <div class="page-header-actions">
        <span class="badge badge-accent">${fmtInt(totalFossil)} tCO₂ fossil</span>
        <span class="badge badge-purple">${fmtDec(totalBiogenic,2)} tCO₂ biogenic</span>
        <span class="badge badge-info">${fmtInt(totalEnergy)} GJ energy</span>
      </div>
    </div>
    <div class="page-desc">Fuel quantities, net calorific values (NCV), emission factors, biomass fractions, and combustion CO₂ balances.</div>
  </div>

  ${buildDemoBanner(s)}

  <div class="grid-2 mb-lg">
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('bar-chart-2', 15, 'text-muted')}
          <h3 style="margin:0;">Fossil vs Biogenic CO₂ by Fuel Type</h3>
        </div>
      </div>
      <div class="chart-container" style="height:220px;"><canvas id="chart-fuel-co2"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('flame', 15, 'text-muted')}
          <h3 style="margin:0;">Energy by Fuel Type (GJ)</h3>
        </div>
      </div>
      <div class="chart-container" style="height:220px;"><canvas id="chart-fuel-energy"></canvas></div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('file-text', 15, 'text-muted')}
        <h3 style="margin:0;">Fuel Activity Register</h3>
      </div>
      <span class="chip chip-controlled">${rows.length} rows</span>
    </div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Date</th><th>Fuel Type</th>
            <th class="num">Quantity</th><th>Unit</th>
            <th class="num">NCV (GJ/unit)</th><th class="num">EF (tCO₂/TJ)</th>
            <th class="num">Ox. Factor</th><th class="num">Biomass Frac.</th><th class="num">Fossil Frac.</th>
            <th class="num">Energy (GJ)</th><th class="num">Energy (TJ)</th>
            <th class="num">Fossil CO₂ (t)</th><th class="num">Biogenic CO₂ Memo (t)</th>
            <th>Evidence ID</th><th>QA Status</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
            <tr>
              <td>${escHtml(fmtDate(r.Date))}</td>
              <td><strong>${escHtml(r['Fuel Type']||'—')}</strong></td>
              <td class="num">${fmt(r.Quantity,'t')}</td>
              <td class="unit-col">${escHtml(r.Unit||'')}</td>
              <td class="num">${fmt(r['NCV GJ/unit'],'GJ/t clinker')}</td>
              <td class="num">${fmt(r['EF tCO2/TJ'],'tCO2/TJ')}</td>
              <td class="num">${fmt(r['Oxidation Factor'],'ratio')}</td>
              <td class="num">${fmt(r['Biomass Fraction'],'ratio')}</td>
              <td class="num">${fmt(r['Fossil Fraction'],'ratio')}</td>
              <td class="num">${fmt(r['Energy GJ'],'GJ')}</td>
              <td class="num">${fmt(r['Energy TJ'],'TJ')}</td>
              <td class="num mono" style="color:var(--qa-warn);">${fmt(r['Fossil CO2 t'],'tCO2')}</td>
              <td class="num mono" style="color:var(--accent-3);">${fmt(r['Biogenic CO2 Memo t'],'tCO2')}</td>
              <td>${evLink(r['Evidence ID'])}</td>
              <td>${fmtQaBadge(r['QA Status'])}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot style="border-top:2px solid var(--border-strong);">
            <tr style="background:rgba(15,31,61,0.6);">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              <td class="num mono"><strong>${fmtInt(totalEnergy)}</strong></td>
              <td class="num mono"><strong>${fmtDec(rows.reduce((a,r)=>a+(r['Energy TJ']||0),0),2)}</strong></td>
              <td class="num mono" style="color:var(--qa-warn);"><strong>${fmtDec(totalFossil,2)}</strong></td>
              <td class="num mono" style="color:var(--accent-3);"><strong>${fmtDec(totalBiogenic,2)}</strong></td>
              <td></td><td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>`;
}
window.renderKilnFuel = renderKilnFuel;
