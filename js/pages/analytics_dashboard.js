/* analytics_dashboard.js — 13_Dashboard
   Deeper visual analytics beyond Overview:
   - CO2 component breakdown (donut + share bar)
   - Fuel mix: fossil vs biogenic stacked
   - Clinker factor vs QA band (range bar)
   - SEE Clinker/Cement vs QA thresholds
   - TSR vs QA thresholds
   - SHC vs QA range
*/
function renderAnalyticsDashboard() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Analytics Dashboard', 'Upload a workbook to view analytics.');

  const c = s.calculations;

  // Values from calculations
  const clinkerFactor = parseFloat(c['Clinker Factor']?.Value) || 0;
  const seeClinker    = parseFloat(c['SEE Clinker']?.Value) || 0;
  const seeCement     = parseFloat(c['Specific Embedded Emissions Cement']?.Value) || 0;
  const tsr           = parseFloat(c['Thermal Substitution Rate (TSR)']?.Value ?? c['Thermal Substitution Rate']?.Value) || 0;
  const shc           = parseFloat(c['Specific Heat Consumption']?.Value) || 0;

  // QA bounds from constants sheet
  const constMap = {};
  s.constants.forEach(r => { constMap[r['Constant / Factor']] = parseFloat(r.Value); });

  const cfMin  = constMap['Clinker factor min QA'] ?? 0.25;
  const cfMax  = constMap['Clinker factor max QA'] ?? 1.00;
  const seeMin = constMap['SEE clinker min QA'] ?? 0.50;
  const seeMax = constMap['SEE clinker max QA'] ?? 1.20;
  const shcMin = constMap['Specific heat min QA'] ?? 2.8;
  const shcMax = constMap['Specific heat max QA'] ?? 4.5;
  const tsrMin = constMap['TSR min QA'] ?? 0;
  const tsrMax = constMap['TSR max QA'] ?? 80;

  // CO2 breakdown
  const breakdown = s.dashboard.co2Breakdown.length > 0
    ? s.dashboard.co2Breakdown
    : buildFallbackBreakdown(c);

  // Fuel mix: fossil vs biogenic per fuel type
  const kilnFuel  = s.kilnFuel;
  const fuelTypes = [...new Set(kilnFuel.map(r => r['Fuel Type']))].filter(Boolean);
  const fossilArr  = fuelTypes.map(f => kilnFuel.filter(r=>r['Fuel Type']===f).reduce((a,r)=>a+(r['Fossil CO2 t']||0),0));
  const biogenArr  = fuelTypes.map(f => kilnFuel.filter(r=>r['Fuel Type']===f).reduce((a,r)=>a+(r['Biogenic CO2 Memo t']||0),0));
  const energyArr  = fuelTypes.map(f => kilnFuel.filter(r=>r['Fuel Type']===f).reduce((a,r)=>a+(r['Energy GJ']||0),0));
  const totalEnergy = energyArr.reduce((a,b)=>a+b,0);

  registerDonutChart('adash-co2-donut', breakdown);
  registerGroupedBarChart('adash-fuel-mix', fuelTypes,
    [
      { label: 'Fossil CO₂ (t)', data: fossilArr, color: '#f59e0b' },
      { label: 'Biogenic CO₂ (t)', data: biogenArr, color: '#a78bfa' },
    ], 'tCO₂');
  registerStackedBarChart('adash-fuel-energy', fuelTypes,
    [{ label: 'Energy (GJ)', data: energyArr, color: '#00d4aa' }], 'GJ');

  function rangeBarHtml(id, value, min, max, qaMin, qaMax, unit, label, explainKey) {
    const range  = max - min;
    const valPct = range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 50;
    const qaPct1 = range > 0 ? ((qaMin - min) / range) * 100 : 0;
    const qaPct2 = range > 0 ? ((qaMax - min) / range) * 100 : 100;
    const inRange = value >= qaMin && value <= qaMax;
    return `
    <div class="chart-card" ${explainKey ? `data-explain="${explainKey}" style="cursor:pointer;"` : ''}>
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:6px;">
          <h3 style="margin:0;">${escHtml(label)}</h3>
          ${explainKey ? `<span style="color:var(--text-muted);display:flex;">${renderIcon('info', 13)}</span>` : ''}
        </div>
        <span class="badge ${inRange?'badge-pass':'badge-fail'}">
          <span class="qa-dot ${inRange?'qa-dot-pass':'qa-dot-fail'}"></span>
          ${inRange?'In Range':'Out of Range'}
        </span>
      </div>
      <div style="padding:12px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;color:var(--text-muted);">
          <span>${min}${unit}</span>
          <span style="font-size:14px;font-weight:700;color:${inRange?'var(--qa-pass)':'var(--qa-fail)'}" class="mono">${fmtDec(value,3)} ${unit}</span>
          <span>${max}${unit}</span>
        </div>
        <div class="range-bar-track">
          <div class="range-bar-qa" style="left:${qaPct1}%;right:${100-qaPct2}%;"></div>
          <div class="range-bar-value" style="left:${valPct}%;background:${inRange?'var(--accent)':'var(--qa-fail)'};"></div>
        </div>
        <div class="range-bar-labels">
          <span>Min</span>
          <span style="color:var(--qa-pass);">QA min: ${qaMin}${unit}</span>
          <span style="color:var(--qa-pass);">QA max: ${qaMax}${unit}</span>
          <span>Max</span>
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('bar-chart-2', 20, 'page-title-icon')}
        <h2>Analytics Dashboard</h2>
      </div>
    </div>
    <div class="page-desc">Advanced performance indicators, fuel mix substitutions, emission intensity gauges, and QA threshold bounds.</div>
  </div>

  ${buildDemoBanner(s)}

  <!-- CO2 breakdown + Fuel mix -->
  <div class="grid-2 mb-lg">
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('bar-chart-2', 15, 'text-muted')}
          <h3 style="margin:0;">CO₂ Component Breakdown</h3>
        </div>
        <span class="badge badge-accent">${fmtInt(breakdown.reduce((a,d)=>a+d.tCO2,0))} tCO₂ total</span>
      </div>
      <div style="display:flex;gap:20px;align-items:center;">
        <div class="chart-container" style="height:200px;width:200px;flex-shrink:0;"><canvas id="adash-co2-donut"></canvas></div>
        <div style="flex:1;">
          ${breakdown.map(d => `
          <div class="metric-row">
            <span class="metric-dot" style="background:${window.CO2_COLORS[d.component]||'#60a5fa'}"></span>
            <span class="metric-name">${escHtml(d.component)}</span>
            <span class="metric-value">${fmtInt(d.tCO2)}</span>
            <span class="metric-share">${fmtDec((d.share||0)*100,1)}%</span>
          </div>`).join('')}
          <div style="margin-top:12px;">
            <div class="co2-share-bar">
              ${breakdown.map(d => `<div class="seg" style="flex:${d.share};background:${window.CO2_COLORS[d.component]||'#60a5fa'};"></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('flame', 15, 'text-muted')}
          <h3 style="margin:0;">Fuel Mix — Fossil vs Biogenic CO₂</h3>
        </div>
      </div>
      <div class="chart-container" style="height:220px;"><canvas id="adash-fuel-mix"></canvas></div>
    </div>
  </div>

  <!-- Fuel energy + QA gauges row -->
  <div class="grid-2 mb-lg">
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('zap', 15, 'text-muted')}
          <h3 style="margin:0;">Fuel Energy by Type</h3>
        </div>
        <span class="badge badge-info">TSR: ${fmtDec(tsr,2)}%</span>
      </div>
      <div class="chart-container" style="height:200px;"><canvas id="adash-fuel-energy"></canvas></div>
      <div style="margin-top:12px;padding:10px 14px;background:var(--bg-panel);border-radius:var(--r-sm);font-size:12px;">
        <strong>Thermal Substitution Rate (TSR):</strong>
        <span class="mono" style="color:var(--accent);margin-left:8px;">${fmtDec(tsr,2)}%</span>
        <span style="color:var(--text-muted);margin-left:8px;">Alt fuel energy as % of total (${fmtInt(totalEnergy)} GJ total)</span>
      </div>
    </div>

    ${rangeBarHtml('cf-gauge', clinkerFactor, 0, 1.2, cfMin, cfMax, '', 'Clinker Factor vs QA Band', 'kpi-clinker-factor')}
  </div>

  <!-- SEE + SHC + TSR gauges -->
  <div class="grid-2 mb-lg">
    ${rangeBarHtml('see-clinker-gauge', seeClinker, 0, 1.5, seeMin, seeMax, ' tCO₂/t', 'SEE Clinker vs QA Range', 'kpi-see-clinker')}
    ${rangeBarHtml('see-cement-gauge', seeCement, 0, 1.5, 0.20, 1.20, ' tCO₂/t', 'SEE Cement vs QA Range', 'kpi-see-cement')}
  </div>

  <div class="grid-2 mb-lg">
    ${rangeBarHtml('shc-gauge', shc, 0, 6, shcMin, shcMax, ' GJ/t', 'Specific Heat Consumption vs QA Range', 'kpi-specific-heat')}
    ${rangeBarHtml('tsr-gauge', tsr, 0, 100, tsrMin, tsrMax, '%', 'Thermal Substitution Rate vs QA Range', 'kpi-tsr')}
  </div>

  <!-- QA/QC Summary mini-table -->
  <div class="section-card">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('calculator', 15, 'text-muted')}
        <h3 style="margin:0;">Key Metrics Summary Table (from 08_Calculations + 13_Dashboard)</h3>
      </div>
    </div>
    <div class="section-card-body no-pad">
      <table class="data-table">
        <thead><tr><th>Metric</th><th class="num">Value</th><th>Unit</th><th>QA Result</th><th>Source</th></tr></thead>
        <tbody>
          ${[
            {metric:'Clinker Factor',      val:clinkerFactor, unit:'ratio',           qaIn: clinkerFactor>=cfMin&&clinkerFactor<=cfMax, src:'08_Calculations', key:'kpi-clinker-factor'},
            {metric:'SEE Clinker',         val:seeClinker,    unit:'tCO₂/t clinker',  qaIn: seeClinker>=seeMin&&seeClinker<=seeMax,     src:'08_Calculations', key:'kpi-see-clinker'},
            {metric:'SEE Cement',          val:seeCement,     unit:'tCO₂/t cement',   qaIn: seeCement>=0.20&&seeCement<=1.20,           src:'08_Calculations', key:'kpi-see-cement'},
            {metric:'Specific Heat Consumption', val:shc, unit:'GJ/t clinker',        qaIn: shc>=shcMin&&shc<=shcMax,                  src:'08_Calculations', key:'kpi-specific-heat'},
            {metric:'TSR',                 val:tsr,           unit:'%',               qaIn: tsr>=tsrMin&&tsr<=tsrMax,                  src:'08_Calculations', key:'kpi-tsr'},
          ].map(row => `
          <tr ${row.key ? `data-explain="${row.key}" style="cursor:pointer;" title="Click for definition"` : ''}>
            <td><strong>${escHtml(row.metric)}</strong></td>
            <td class="num mono" style="color:var(--accent);">${fmtDec(row.val, 4)}</td>
            <td class="unit-col">${escHtml(row.unit)}</td>
            <td>${row.qaIn ? '<span class="badge badge-pass"><span class="qa-dot qa-dot-pass"></span> In Range</span>' : '<span class="badge badge-fail"><span class="qa-dot qa-dot-fail"></span> Out of Range</span>'}</td>
            <td style="font-size:11px;color:var(--text-muted);">${escHtml(row.src)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
window.renderAnalyticsDashboard = renderAnalyticsDashboard;
