/* qaqc.js — 09_QAQC_Checks */
function renderQaqc() {
  const s = window.STORE;
  if (!s) return renderEmptyState('QA/QC Checks', 'Upload a workbook to view QA/QC checks.');

  const checks = s.qaqc;
  const total  = checks.length;
  const passed = checks.filter(r => String(r.Status).toUpperCase() === 'PASS').length;
  const failed = total - passed;
  const qaPct  = total > 0 ? Math.round(passed/total*100) : 0;

  // Group by Category
  const cats = {};
  checks.forEach(r => {
    const cat = r.Category || 'Other';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(r);
  });

  // Category summary for horizontal bar chart
  const catLabels = Object.keys(cats);
  const catPass   = catLabels.map(c => cats[c].filter(r => String(r.Status).toUpperCase()==='PASS').length);
  const catColors = catLabels.map((c,i) => {
    const fail = cats[c].filter(r => String(r.Status).toUpperCase()==='FAIL').length;
    return fail > 0 ? 'rgba(239,68,68,0.7)' : 'rgba(34,197,94,0.7)';
  });

  registerHBarChart('chart-qa-cats', catLabels, catPass, catColors);

  const overallBadge = failed > 0
    ? '<span class="badge badge-fail"><span class="qa-dot qa-dot-fail"></span> Fail</span>'
    : '<span class="badge badge-pass"><span class="qa-dot qa-dot-pass"></span> Pass</span>';

  return `
  <div class="page-header">
    <div class="page-title-row">
      <div class="page-title-wrap">
        ${renderIcon('check-circle', 20, 'page-title-icon')}
        <h2>QA/QC Checks</h2>
      </div>
      <div class="page-header-actions">
        ${overallBadge}
        <span class="chip chip-controlled">${total} checks</span>
      </div>
    </div>
    <div class="page-desc">Automated checks that catch issues before they reach regulators — covering mass balances, physical limits, and completeness across ${Object.keys(cats).length} check categories.</div>
  </div>


  ${buildDemoBanner(s)}

  <!-- Aggregate Scorecard -->
  <div class="grid-2 mb-lg">
    <div class="card">
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:16px;">
        <div style="text-align:center;">
          <div style="font-size:44px;font-weight:800;color:${failed>0?'var(--qa-fail)':'var(--qa-pass)'};" class="mono">${passed}</div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;">Passed</div>
        </div>
        <div style="font-size:28px;color:var(--text-muted);">/</div>
        <div style="text-align:center;">
          <div style="font-size:44px;font-weight:800;color:var(--text-secondary);" class="mono">${total}</div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;">Total</div>
        </div>
        <div style="flex:1;">
          <div style="font-size:28px;font-weight:800;color:${qaPct===100?'var(--qa-pass)':'var(--qa-warn)'};" class="mono">${qaPct}%</div>
          <div style="font-size:11px;color:var(--text-muted);">Pass Rate</div>
          <div class="progress-bar mt-sm">
            <div class="progress-fill" style="width:${qaPct}%;background:${qaPct===100?'var(--qa-pass)':'var(--qa-warn)'}"></div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${Object.entries(cats).map(([cat, rows]) => {
          const catFail = rows.filter(r => String(r.Status).toUpperCase()==='FAIL').length;
          const catPass2 = rows.length - catFail;
          return `<div style="background:${catFail>0?'var(--qa-fail-dim)':'var(--qa-pass-dim)'};border:1px solid ${catFail>0?'var(--qa-fail-border)':'var(--qa-pass-border)'};border-radius:var(--r-sm);padding:5px 10px;">
            <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">${escHtml(cat)}</div>
            <div style="font-size:13px;font-weight:700;color:${catFail>0?'var(--qa-fail)':'var(--qa-pass)'};">${catPass2}/${rows.length}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderIcon('bar-chart-2', 15, 'text-muted')}
          <h3 style="margin:0;">Checks Passed by Category</h3>
        </div>
      </div>
      <div class="chart-container" style="height:180px;"><canvas id="chart-qa-cats"></canvas></div>
    </div>
  </div>

  <!-- Checks by Category -->
  ${Object.entries(cats).map(([cat, rows]) => {
    const catFail = rows.filter(r => String(r.Status).toUpperCase()==='FAIL').length;
    return `
  <div class="qa-category-group">
    <div class="qa-category-header">
      <span class="qa-dot ${catFail>0?'qa-dot-fail':'qa-dot-pass'}"></span>
      <span class="cat-name">${escHtml(cat)}</span>
      <span class="cat-score" style="color:${catFail>0?'var(--qa-fail)':'var(--qa-pass)'};">${rows.length-catFail}/${rows.length} PASS</span>
    </div>
    <div class="table-wrapper">
      <table class="data-table compact">
        <thead><tr>
          <th>Check ID</th><th>Check Name</th><th>Rule</th>
          <th class="num">Result</th><th>Status</th><th>Severity</th><th>Owner</th><th>Comment</th>
        </tr></thead>
        <tbody>
          ${rows.map(r => {
            const isPass = String(r.Status).toUpperCase() === 'PASS';
            const isFail = String(r.Status).toUpperCase() === 'FAIL';
            const rowBg  = isFail ? 'background:rgba(239,68,68,0.04);' : '';
            return `
          <tr style="${rowBg}">
            <td class="mono" style="color:var(--accent-2);font-size:11px;">${escHtml(r['Check ID']||'')}</td>
            <td><strong>${escHtml(r['Check Name']||'')}</strong></td>
            <td style="font-size:11.5px;color:var(--text-secondary);max-width:200px;">${escHtml(r.Rule||'')}</td>
            <td class="num mono" style="font-size:12px;">${escHtml(String(r.Result||''))}</td>
            <td>${fmtQaBadge(r.Status, r.Severity)}</td>
            <td>${fmtSeverityBadge(r.Severity)}</td>
            <td style="font-size:12px;">${escHtml(r.Owner||'—')}</td>
            <td style="font-size:11px;color:var(--text-muted);">${escHtml(r.Comment||'—')}</td>
          </tr>`;}).join('')}
        </tbody>
      </table>
    </div>
  </div>`;}).join('')}`;
}
window.renderQaqc = renderQaqc;
