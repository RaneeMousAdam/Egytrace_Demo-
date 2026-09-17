/* ═══════════════════════════════════════════════════════════════
   pages/overview.js — Overview (Home) Page
   Executive summary: Minimalist KPI cards, CO2 donut, QA/QC pass rate,
   evidence readiness, workbook context panel.
   All values sourced from STORE.calcRows, STORE.dashboard,
   STORE.qaqc, STORE.evidence, STORE.readme, STORE.setup.
   ═══════════════════════════════════════════════════════════════ */

function renderOverview() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Overview', 'Upload a workbook to view the executive summary.');

  const calcs = s.calculations;
  const dash  = s.dashboard;

  // Pull key values from STORE (calculations sheet is source of truth)
  const clinkerProd  = calcs['Clinker Produced']?.Value;
  const cementProd   = calcs['Cement Produced']?.Value;
  const clinkerFactor= calcs['Clinker Factor']?.Value;
  const directCO2    = calcs['Direct Embedded CO2']?.Value;
  const totalCO2     = calcs['Total Embedded CO2']?.Value;
  const seeCement    = calcs['Specific Embedded Emissions Cement']?.Value;
  const tsr          = calcs['Thermal Substitution Rate (TSR)']?.Value ?? calcs['Thermal Substitution Rate']?.Value;
  const shc          = calcs['Specific Heat Consumption']?.Value;
  const qaStatus     = calcs['QA/QC Overall Status']?.Value;
  const evStatus     = calcs['Evidence Status']?.Value;

  // QA/QC pass-rate from qaqc sheet
  const total  = s.qaqc.length;
  const passed = s.qaqc.filter(r => String(r.Status).toUpperCase() === 'PASS').length;
  const failed = s.qaqc.filter(r => String(r.Status).toUpperCase() === 'FAIL').length;
  const qaPct  = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Evidence summary
  const evTotal   = s.evidence.length;
  const evMapped  = s.evidence.filter(r => String(r.Status) === 'Mapped').length;
  const evPending = evTotal - evMapped;

  // CO2 breakdown from dashboard sheet
  const breakdown = dash.co2Breakdown && dash.co2Breakdown.length > 0
    ? dash.co2Breakdown
    : buildFallbackBreakdown(calcs);

  // Workbook context
  const site    = s.setup['Installation / site'] || '—';
  const country = s.setup['Country'] || '—';
  const quarter = s.setup['Reporting quarter'] || '—';
  const product = s.setup['Primary product'] || '—';
  const pStart  = s.setup['Period start'] || '—';
  const pEnd    = s.setup['Period end'] || '—';
  const method  = s.setup['Selected calcination method'] || '—';
  const version = s.readme.find(r => r.Control === 'Workbook Version')?.Value || '—';

  // Status badge
  const qaDotClass = qaStatus === 'PASS' ? 'qa-dot-pass' : 'qa-dot-fail';
  const qaColor = qaStatus === 'PASS' ? 'badge-pass' : 'badge-fail';

  // Register CO2 donut chart
  registerDonutChart('chart-co2-donut', breakdown);

  // Build CO2 breakdown metric rows
  const breakdownRows = breakdown.map(d => `
    <div class="metric-row">
      <span class="metric-dot" style="background:${window.CO2_COLORS[d.component]||'#60a5fa'}"></span>
      <span class="metric-name">${escHtml(d.component)}</span>
      <span class="metric-value">${fmtInt(d.tCO2)}</span>
      <span class="metric-share">${fmtDec((d.share||0)*100,1)}%</span>
    </div>
  `).join('');

  // TSR display
  const tsrVal = tsr !== null && tsr !== undefined ? fmtDec(parseFloat(tsr), 2) : '—';

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('home', 20, 'page-title-icon')}
        <h2>Overview</h2>
      </div>
      <div class="page-header-actions">
        <span class="badge ${qaColor}" style="cursor:pointer;" data-explain="kpi-qaqc-status">
          <span class="qa-dot ${qaDotClass}"></span>
          QA/QC ${escHtml(qaStatus||'—')}
        </span>
        <span class="badge badge-accent">v${escHtml(version)}</span>
      </div>
    </div>
    <div class="page-desc">Here's your plant at a glance &mdash; ${escHtml(site)}, ${escHtml(country)} &middot; ${escHtml(quarter)} &middot; ${escHtml(product)}</div>
  </div>

  ${buildDemoBanner(s)}

  <!-- KPI Cards Row 1: Production -->
  <div class="grid-4 mb-lg">
    ${kpiCard('Clinker Production', fmtRaw(clinkerProd, 0), 't', 'Total kiln clinker produced in period', 'kpi-clinker-prod', 'accent-card')}
    ${kpiCard('Cement Production', fmtRaw(cementProd, 0), 't', 'Total finished cement dispatched', 'kpi-cement-prod', 'accent-card')}
    ${kpiCard('Clinker Factor', fmtRaw(clinkerFactor, 3), 'ratio', 'Proportion of clinker per ton of cement', 'kpi-clinker-factor')}
    ${kpiCard('Specific Heat', fmtRaw(shc, 3), 'GJ/t clinker', 'Thermal energy consumed per ton clinker', 'kpi-specific-heat')}
  </div>

  <!-- KPI Cards Row 2: Emissions -->
  <div class="grid-4 mb-lg">
    ${kpiCard('Direct Embedded CO₂', fmtRaw(directCO2, 0), 'tCO₂', 'Process calcination + fuel combustion', 'kpi-direct-co2')}
    ${kpiCard('Total Embedded CO₂', fmtRaw(totalCO2, 0), 'tCO₂', 'Scope 1 direct + Scope 2 grid electricity', 'kpi-total-co2')}
    ${kpiCard('SEE Cement', fmtRaw(seeCement, 4), 'tCO₂/t cement', 'Specific embedded emissions intensity', 'kpi-see-cement')}
    ${kpiCard('Thermal Substitution', tsrVal, tsrVal !== '—' ? '%' : '', 'Alternative fuel thermal share', 'kpi-tsr')}
  </div>

  <!-- Main body: 2-column layout -->
  <div class="grid-2 mb-lg">

    <!-- CO2 Breakdown chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('bar-chart-2', 15, 'text-muted')}
          <h3 style="margin:0;">CO₂ Component Breakdown</h3>
        </div>
        <span class="badge badge-accent">${fmtRaw(totalCO2, 0)} tCO₂ total</span>
      </div>
      <div style="display:flex;gap:24px;align-items:center;">
        <div class="chart-container" style="height:200px;width:200px;flex-shrink:0;">
          <canvas id="chart-co2-donut"></canvas>
        </div>
        <div style="flex:1;">
          ${breakdownRows}
          <div class="divider" style="margin:12px 0"></div>
          <div style="font-size:11px;color:var(--text-muted);line-height:1.4;">
            Direct = Calcination + Fuel Combustion<br>
            Total = Direct + Indirect Grid CO₂
          </div>
        </div>
      </div>
    </div>

    <!-- Workbook Context -->
    <div class="section-card">
      <div class="section-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('file-text', 15, 'text-muted')}
          <h3 style="margin:0;">Workbook Context</h3>
        </div>
        <span class="chip chip-controlled">v${escHtml(version)}</span>
      </div>
      <div class="section-card-body" style="padding:0">
        <div class="kv-panel">
          ${kvRow('Site', site)}
          ${kvRow('Country', country)}
          ${kvRow('Reporting Quarter', quarter)}
          ${kvRow('Period', pStart + ' → ' + pEnd)}
          ${kvRow('Product', product)}
          ${kvRow('Calcination Method', method)}
          ${kvRow('Evidence Status', evStatus || '—')}
          ${kvRow('QA/QC Status', `<span class="badge ${qaColor}"><span class="qa-dot ${qaDotClass}"></span> ${escHtml(qaStatus||'—')}</span>`)}
        </div>
      </div>
    </div>
  </div>

  <!-- QA/QC Pass-rate + Evidence -->
  <div class="grid-2 mb-lg">
    <!-- QA/QC scorecard -->
    <div class="section-card">
      <div class="section-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('check-circle', 15, 'text-muted')}
          <h3 style="margin:0;">QA/QC Summary</h3>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigate('qaqc')">
          View All Checks ${renderIcon('chevron-right', 12)}
        </button>
      </div>
      <div class="section-card-body">
        <div class="scorecard" style="padding:0;background:transparent;border:none;margin-bottom:16px;">
          <div class="scorecard-metric" style="padding-right:24px;">
            <div class="sc-val sc-pass">${passed}</div>
            <div class="sc-label">Passed</div>
          </div>
          <div class="scorecard-metric" style="padding:0 24px;">
            <div class="sc-val sc-fail">${failed}</div>
            <div class="sc-label">Failed</div>
          </div>
          <div class="scorecard-metric" style="padding:0 24px;">
            <div class="sc-val sc-info">${total}</div>
            <div class="sc-label">Total</div>
          </div>
          <div class="scorecard-metric" style="padding-left:24px;border:none;">
            <div class="sc-val" style="color:${qaPct===100?'var(--qa-pass)':'var(--qa-warn)'}">${qaPct}%</div>
            <div class="sc-label">Pass Rate</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${qaPct}%;background:${qaPct===100?'linear-gradient(90deg,var(--qa-pass),#16a34a)':'linear-gradient(90deg,var(--qa-warn),#d97706)'}"></div>
        </div>
        <div style="margin-top:12px;">
          ${buildQaCategoryMiniSummary(s.qaqc)}
        </div>
      </div>
    </div>

    <!-- Evidence Register summary -->
    <div class="section-card">
      <div class="section-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('folder', 15, 'text-muted')}
          <h3 style="margin:0;">Evidence Readiness</h3>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigate('evidence')">
          View Register ${renderIcon('chevron-right', 12)}
        </button>
      </div>
      <div class="section-card-body">
        <div class="scorecard" style="padding:0;background:transparent;border:none;margin-bottom:16px;">
          <div class="scorecard-metric" style="padding-right:24px;">
            <div class="sc-val sc-pass">${evMapped}</div>
            <div class="sc-label">Mapped</div>
          </div>
          <div class="scorecard-metric" style="padding:0 24px;">
            <div class="sc-val" style="color:${evPending>0?'var(--qa-warn)':'var(--qa-pass)'}">${evPending}</div>
            <div class="sc-label">Pending</div>
          </div>
          <div class="scorecard-metric" style="padding-left:24px;border:none;">
            <div class="sc-val sc-info">${evTotal}</div>
            <div class="sc-label">Total</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${evTotal>0?Math.round(evMapped/evTotal*100):0}%"></div>
        </div>
        <div style="margin-top:16px;font-size:12px;color:var(--text-secondary);">
          ${evPending > 0
            ? `<span class="badge badge-warn"><span class="qa-dot qa-dot-warn"></span> ${evPending} evidence item${evPending>1?'s':''} pending review</span>`
            : '<span class="badge badge-pass"><span class="qa-dot qa-dot-pass"></span> All evidence mapped and verified</span>'}
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text-muted);">
          Evidence covers: Production, Raw Material, Fuel (×4), Electricity (×3), Factor Library, QA/QC
        </div>
      </div>
    </div>
  </div>

  <!-- Key emission metrics row -->
  <div class="section-card">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('calculator', 15, 'text-muted')}
        <h3 style="margin:0;">All Calculated Metrics</h3>
      </div>
      <span style="font-size:11.5px;color:var(--text-muted);">Sourced from 08_Calculations sheet</span>
    </div>

    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Metric</th><th>Value</th><th>Unit</th><th>Governance Note</th><th>QA Source</th>
          </tr></thead>
          <tbody>
            ${s.calcRows.filter(r => r.Value !== null && r.Value !== undefined).map(r => `
            <tr>
              <td><strong>${escHtml(r.Metric)}</strong></td>
              <td class="num mono">${fmt(r.Value, r.Unit)}</td>
              <td class="unit-col">${escHtml(r.Unit||'')}</td>
              <td style="font-size:11.5px;color:var(--text-secondary);max-width:280px;">${escHtml(r['Governance note']||'')}</td>
              <td style="font-size:11px;color:var(--text-muted);">${escHtml(r['QA Source']||'')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}

function buildFallbackBreakdown(calcs) {
  const process  = parseFloat(calcs['Selected Process CO2']?.Value) || 0;
  const fuel     = parseFloat(calcs['Fuel Combustion CO2']?.Value)  || 0;
  const indirect = parseFloat(calcs['Indirect Grid CO2']?.Value)    || 0;
  const total    = process + fuel + indirect;
  if (total === 0) return [];
  return [
    { component: 'Process CO2',         tCO2: process,  share: process/total  },
    { component: 'Fuel Combustion CO2', tCO2: fuel,     share: fuel/total     },
    { component: 'Indirect Grid CO2',   tCO2: indirect, share: indirect/total },
  ];
}

function buildQaCategoryMiniSummary(qaqc) {
  const cats = {};
  qaqc.forEach(r => {
    const cat = r.Category || 'Other';
    if (!cats[cat]) cats[cat] = { pass: 0, total: 0 };
    cats[cat].total++;
    if (String(r.Status).toUpperCase() === 'PASS') cats[cat].pass++;
  });
  return Object.entries(cats).map(([cat, v]) => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span style="font-size:11px;color:var(--text-secondary);min-width:130px;">${escHtml(cat)}</span>
      <div class="progress-bar" style="flex:1;height:4px;">
        <div class="progress-fill" style="width:${Math.round(v.pass/v.total*100)}%;height:4px;background:${v.pass===v.total?'var(--qa-pass)':'var(--qa-warn)'}"></div>
      </div>
      <span style="font-size:11px;color:var(--text-muted);min-width:40px;text-align:right;">${v.pass}/${v.total}</span>
    </div>
  `).join('');
}

function kpiCard(label, value, unit, desc, key = '', cls = '') {
  const v = value !== null && value !== undefined ? value : '—';
  return `
    <div class="kpi-card ${cls}" ${key ? `data-explain="${key}"` : ''} title="Click to view explanation">
      <div class="kpi-top">
        <span class="kpi-label">${escHtml(label)}</span>
        <button class="kpi-info-trigger" aria-label="Information" tabindex="-1">
          ${renderIcon('info', 13)}
        </button>
      </div>
      <div class="kpi-val-row">
        <span class="kpi-value">${v !== '—' ? `<span class="mono">${v}</span>` : '—'}</span>
        ${unit ? `<span class="kpi-unit">${escHtml(unit)}</span>` : ''}
      </div>
      ${desc ? `<div class="kpi-desc">${escHtml(desc)}</div>` : ''}
    </div>`;
}

function kvRow(key, val) {
  return `<div class="kv-row"><span class="kv-key">${escHtml(key)}</span><span class="kv-val">${val}</span></div>`;
}

window.renderOverview = renderOverview;
window.kpiCard = kpiCard;
