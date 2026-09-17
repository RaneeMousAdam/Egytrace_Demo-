/* calculations.js — 08_Calculations
   Shows visual flow diagram PLUS underlying table.
   Flow: Process CO2 + Fuel CO2 = Direct Embedded CO2
         Direct + Indirect Grid CO2 = Total Embedded CO2
         Total / Cement Produced = SEE Cement
*/
function renderCalculations() {
  const s = window.STORE;
  if (!s) return renderEmptyState('Calculations', 'Upload a workbook to view the calculation chain.');

  const c = s.calculations;

  function flowVal(metric, unit, dp) {
    const row = c[metric];
    if (!row) return { label: metric, val: '—', unit: unit||'' };
    const v = row.Value;
    if (v === null || v === undefined) return { label: metric, val: '<span class="badge badge-missing">Missing</span>', unit: unit||'' };
    const n = parseFloat(v);
    const display = isNaN(n) ? escHtml(String(v)) : (dp !== undefined ? fmtDec(n, dp) : fmtInt(n));
    return { label: metric, val: display, unit: unit || (row.Unit||'') };
  }

  function flowNode(metric, unit, dp, highlight) {
    const d = flowVal(metric, unit, dp);
    return `<div class="flow-node ${highlight?'highlight':''}">
      <div class="fn-label">${escHtml(d.label)}</div>
      <div class="fn-val">${d.val}</div>
      <div class="fn-unit">${escHtml(d.unit)}</div>
    </div>`;
  }

  function connector(symbol) {
    return `<div class="flow-connector ${symbol==='\u2192'?'arrow':''}">${symbol}</div>`;
  }

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('calculator', 20, 'page-title-icon')}
        <h2>Calculations</h2>
      </div>
      <div class="page-header-actions">
        <span class="chip chip-controlled">${s.calcRows.length} certified metrics</span>
      </div>
    </div>
    <div class="page-desc">Complete MRV mathematical chain: process calcination, fuel combustion, grid Scope 2, and specific emissions intensity.</div>
  </div>

  ${buildDemoBanner(s)}

  <!-- VISUAL FLOW DIAGRAM -->
  <div class="section-card mb-lg">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('network', 15, 'text-muted')}
        <h3 style="margin:0;">Calculation Flow Diagram</h3>
      </div>
    </div>
    <div class="section-card-body">

      <!-- Step 1: Process inputs to Direct Embedded CO2 -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Step 1 — Direct Embedded CO₂ (Process + Fuel)</div>
        <div class="flow-row" style="flex-wrap:wrap;gap:8px;align-items:center;">
          ${flowNode('Selected Process CO2', 'tCO₂', 0, false)}
          ${connector('+')}
          ${flowNode('Fuel Combustion CO2', 'tCO₂', 2, false)}
          ${connector('=')}
          ${flowNode('Direct Embedded CO2', 'tCO₂', 2, true)}
        </div>
      </div>

      <!-- Step 2: Add Indirect to get Total -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Step 2 — Total Embedded CO₂ (Direct + Indirect Grid)</div>
        <div class="flow-row" style="flex-wrap:wrap;gap:8px;align-items:center;">
          ${flowNode('Direct Embedded CO2', 'tCO₂', 2, false)}
          ${connector('+')}
          ${flowNode('Indirect Grid CO2', 'tCO₂', 0, false)}
          ${connector('=')}
          ${flowNode('Total Embedded CO2', 'tCO₂', 2, true)}
        </div>
      </div>

      <!-- Step 3: SEE Cement -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Step 3 — Specific Embedded Emissions (SEE Cement)</div>
        <div class="flow-row" style="flex-wrap:wrap;gap:8px;align-items:center;">
          ${flowNode('Total Embedded CO2', 'tCO₂', 2, false)}
          ${connector('÷')}
          ${flowNode('Cement Produced', 't', 0, false)}
          ${connector('=')}
          ${flowNode('Specific Embedded Emissions Cement', 'tCO₂/t cement', 4, true)}
        </div>
      </div>

      <!-- Step 4: SEE Clinker -->
      <div>
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Step 4 — Specific Embedded Emissions (SEE Clinker)</div>
        <div class="flow-row" style="flex-wrap:wrap;gap:8px;align-items:center;">
          ${flowNode('Direct Embedded CO2', 'tCO₂', 2, false)}
          ${connector('÷')}
          ${flowNode('Clinker Produced', 't', 0, false)}
          ${connector('=')}
          ${flowNode('SEE Clinker', 'tCO₂/t clinker', 4, true)}
        </div>
      </div>

      <!-- Biogenic memo -->
      <div style="margin-top:16px;padding:12px 16px;background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.25);border-radius:var(--r);font-size:12px;color:var(--accent-3);display:flex;align-items:center;gap:8px;">
        ${renderIcon('info', 15)}
        <div><strong>Biogenic CO₂ Memo:</strong> ${fmtDec(parseFloat(c['Biogenic CO2 Memo']?.Value)||0, 2)} tCO₂ — reported separately, not counted in embedded emissions per CBAM rules.</div>
      </div>
    </div>
  </div>

  <!-- Full calculation table -->
  <div class="section-card">
    <div class="section-card-header">
      <div style="display:flex;align-items:center;gap:8px;">
        ${renderIcon('file-text', 15, 'text-muted')}
        <h3 style="margin:0;">Full Calculation Chain</h3>
      </div>
    </div>
    <div class="section-card-body no-pad">
      <div class="table-wrapper" style="border:none;">
        <table class="data-table">
          <thead><tr>
            <th>Metric</th><th>Formula / Link</th><th class="num">Value</th><th>Unit</th><th>Governance Note</th><th>QA Source</th>
          </tr></thead>
          <tbody>
            ${s.calcRows.map(r => {
              const isHighlight = ['Direct Embedded CO2','Total Embedded CO2','Specific Embedded Emissions Cement','SEE Clinker'].includes(r.Metric);
              return `
            <tr style="${isHighlight?'background:rgba(0,212,170,0.04);':''}" >
              <td><strong style="${isHighlight?'color:var(--accent);':''}">${escHtml(r.Metric||'')}</strong></td>
              <td class="mono" style="font-size:11px;color:var(--text-muted);max-width:200px;">${escHtml(r['Formula / Link']||'')}</td>
              <td class="num mono" style="${isHighlight?'color:var(--accent);font-weight:700;':''}">
                ${r.Value !== null && r.Value !== undefined ? fmt(r.Value, r.Unit) : '<span class="badge badge-missing">Missing</span>'}
              </td>
              <td class="unit-col">${escHtml(r.Unit||'')}</td>
              <td style="font-size:11.5px;color:var(--text-secondary);max-width:280px;">${escHtml(r['Governance note']||'')}</td>
              <td style="font-size:11px;color:var(--text-muted);">${escHtml(r['QA Source']||'')}</td>
            </tr>`;}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
window.renderCalculations = renderCalculations;
