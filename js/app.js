/* ═══════════════════════════════════════════════════════════════
   app.js — Main Application: Bootstrap, Router, Event Handlers
   ═══════════════════════════════════════════════════════════════ */

/* ── Route map ─────────────────────────────────────────────────── */
const ROUTES = {
  'overview':    { label: 'Overview',                  icon: 'home',            render: () => renderOverview()          },
  'governance':  { label: 'Governance & Control',      icon: 'shield',          render: () => renderGovernance()        },
  'setup':       { label: 'Setup & Reporting Period',  icon: 'settings',        render: () => renderSetup()             },
  'dcs':         { label: 'DCS / ERP / Lab Boundary',  icon: 'network',         render: () => renderDcsBoundary()       },
  'production':  { label: 'Production Input',          icon: 'factory',         render: () => renderProduction()        },
  'rawmaterial': { label: 'Raw Material Input',        icon: 'package',         render: () => renderRawMaterial()       },
  'kilnfuel':    { label: 'Kiln Fuel Input',           icon: 'flame',           render: () => renderKilnFuel()          },
  'electricity': { label: 'Electricity Input',         icon: 'zap',             render: () => renderElectricity()       },
  'constants':   { label: 'Constants, EF & NCV',       icon: 'sliders',         render: () => renderConstants()         },
  'calculations':{ label: 'Calculations',              icon: 'calculator',      render: () => renderCalculations()      },
  'qaqc':        { label: 'QA/QC Checks',              icon: 'check-circle',    render: () => renderQaqc()              },
  'reportouts':  { label: 'Report Outputs',            icon: 'file-text',       render: () => renderReportOutputs()     },
  'evidence':    { label: 'Evidence Register',         icon: 'folder',          render: () => renderEvidence()          },
  'regulatory':  { label: 'Regulatory References',     icon: 'book-open',       render: () => renderRegulatory()        },
  'analytics':   { label: 'Analytics Dashboard',       icon: 'bar-chart-2',     render: () => renderAnalyticsDashboard()},
};

let _currentPage = 'overview';

/* ── Initialise ─────────────────────────────────────────────────── */
function init() {
  buildSidebar();
  buildTopbar();
  buildFooter();
  setupEventHandlers();

  // Check hash on load
  const hash = window.location.hash.replace('#','') || 'overview';
  if (window.STORE && window.STORE._valid) {
    navigate(ROUTES[hash] ? hash : 'overview');
  } else {
    showUploadPrompt();
  }
}

/* ── Build static sidebar ───────────────────────────────────────── */
function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const sections = [
    { label: 'Main',      keys: ['overview'] },
    { label: 'Governance', keys: ['governance', 'setup'] },
    { label: 'Data Inputs', keys: ['dcs','production','rawmaterial','kilnfuel','electricity'] },
    { label: 'Factors',    keys: ['constants'] },
    { label: 'Outputs',    keys: ['calculations','qaqc','reportouts'] },
    { label: 'Compliance', keys: ['evidence','regulatory'] },
    { label: 'Analytics',  keys: ['analytics'] },
  ];

  nav.innerHTML = sections.map(sec => `
    <div class="nav-section-label">${sec.label}</div>
    ${sec.keys.map(key => {
      const r = ROUTES[key];
      if (!r) return '';
      return `<div class="nav-item" id="nav-${key}" onclick="navigate('${key}')" title="${escHtml(r.label)}">
        <span class="nav-icon">${renderIcon(r.icon, 16)}</span>
        <span class="nav-label">${escHtml(r.label)}</span>
        <button class="nav-info-btn" onclick="event.stopPropagation();showExplanation('nav-${key}')" aria-label="What is ${escHtml(r.label)}?" title="About this section">${renderIcon('info', 11)}</button>
      </div>`;
    }).join('')}
  `).join('');
}

/* ── Build topbar content ───────────────────────────────────────── */
function buildTopbar() {
  const tb = document.getElementById('topbar');
  if (!tb) return;
  const s   = window.STORE;
  const site    = s?._valid ? (s.setup['Installation / site'] || 'Demo Cement Plant') : 'TRACE FORCE MRV';
  const quarter = s?._valid ? (s.setup['Reporting quarter'] || '—') : 'No workbook loaded';
  const qaStatus= s?._valid ? (s.calculations['QA/QC Overall Status']?.Value || '—') : null;
  const qaDotClass = qaStatus === 'PASS' ? 'qa-dot-pass' : qaStatus === 'FAIL' ? 'qa-dot-fail' : 'qa-dot-warn';
  const qaColor = qaStatus === 'PASS' ? 'badge-pass' : qaStatus === 'FAIL' ? 'badge-fail' : 'badge-info';

  tb.innerHTML = `
    <button class="btn btn-secondary btn-icon" onclick="toggleSidebar()" title="Toggle sidebar" aria-label="Toggle sidebar">
      ${renderIcon('menu', 14)}
    </button>
    <div class="topbar-site">
      <div class="site-name">${escHtml(site)}</div>
      <div class="site-period">${escHtml(quarter)}</div>
    </div>
    <div class="topbar-spacer"></div>
    <div class="topbar-actions">
      ${qaStatus ? `<span class="badge ${qaColor}" style="font-size:11.5px;cursor:pointer;" data-explain="kpi-qaqc-status"><span class="qa-dot ${qaDotClass}"></span> QA/QC ${escHtml(qaStatus)}</span>` : ''}
      <label class="btn btn-secondary btn-sm" for="file-input" style="cursor:pointer;" data-explain="btn-upload">
        ${renderIcon('upload', 14)} Load Workbook
      </label>
      <input type="file" id="file-input" accept=".xlsx,.xlsm" style="display:none;" onchange="handleFileInput(event)">
      <button class="btn btn-primary btn-sm" id="btn-download-pdf" onclick="downloadPDF()" data-explain="btn-download-pdf">
        ${renderIcon('download', 14)} Get Report
      </button>
      <button class="btn btn-secondary btn-sm" onclick="downloadExcel()" data-explain="btn-export-excel">
        ${renderIcon('file-spreadsheet', 14)} Export Data
      </button>
    </div>`;
}

/* ── Build footer ───────────────────────────────────────────────── */
function buildFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  const s = window.STORE;
  let disclaimerText = 'TRACE FORCE MRV — Cement QA/QC Analytics Platform';

  if (s && s._valid) {
    const site = s.setup['Installation / site'] || '';
    const quarter = s.setup['Reporting quarter'] || '';
    disclaimerText = `TRACE FORCE MRV — Cement QA/QC Platform | ${site ? escHtml(site) + ' | ' : ''}${quarter ? escHtml(quarter) + ' | ' : ''}Operational Control`;
  }

  footer.innerHTML = `<div class="footer-text">${disclaimerText}</div>`;
}

/* ── Show upload prompt ─────────────────────────────────────────── */
function showUploadPrompt() {
  let prompt = document.getElementById('upload-prompt');
  if (!prompt) {
    prompt = document.createElement('div');
    prompt.id = 'upload-prompt';
    document.body.appendChild(prompt);
  }
  prompt.style.display = 'flex';
  prompt.innerHTML = `
    <div class="upload-card">
      <div class="uc-logo-mark">
        ${renderIcon('bar-chart-2', 32)}
      </div>
      <h2>Welcome to TRACE FORCE MRV</h2>
      <p>Drop your cement plant workbook here and we'll take care of the rest — parsing all 14 sheets, running QA/QC checks, and building your compliance dashboard automatically.</p>
      <label class="btn btn-primary" for="file-input-modal" style="cursor:pointer;font-size:13px;padding:10px 22px;" data-explain="btn-upload">
        ${renderIcon('upload', 16)} Choose your workbook (.xlsx)
      </label>
      <input type="file" id="file-input-modal" accept=".xlsx,.xlsm" style="display:none;" onchange="handleFileInput(event)">
      <div style="margin-top:12px;font-size:11.5px;color:var(--text-muted);">
        or drag &amp; drop anywhere on this page
      </div>
      <div class="uc-steps">
        <div class="uc-step"><span class="uc-step-num">1</span><span>Upload workbook</span></div>
        <div class="uc-step-arrow">${renderIcon('chevron-right', 13)}</div>
        <div class="uc-step"><span class="uc-step-num">2</span><span>Auto-parse &amp; validate</span></div>
        <div class="uc-step-arrow">${renderIcon('chevron-right', 13)}</div>
        <div class="uc-step"><span class="uc-step-num">3</span><span>Explore dashboard</span></div>
      </div>
      <div style="margin-top:20px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:14px;">
        Supports: <strong style="color:var(--text-secondary)">TRACE_FORCE_MRV_Cement_QAQC_V28_Collection_Workbook</strong>
      </div>
    </div>`;
}

function hideUploadPrompt() {
  const el = document.getElementById('upload-prompt');
  if (el) el.style.display = 'none';
}

/* ── Navigate to a page ──────────────────────────────────────────── */
function navigate(pageKey) {
  if (!ROUTES[pageKey]) { console.warn('Unknown page:', pageKey); return; }

  _currentPage = pageKey;
  window.location.hash = pageKey;

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + pageKey);
  if (activeNav) { activeNav.classList.add('active'); activeNav.scrollIntoView({ block: 'nearest' }); }

  // Show loading briefly
  const content = document.getElementById('content');
  if (!content) return;

  if (!window.STORE || !window.STORE._valid) {
    content.innerHTML = renderEmptyState(ROUTES[pageKey].label, 'Upload a workbook to view this page.');
    return;
  }

  // Show validation errors if any
  if (window.STORE._errors && window.STORE._errors.length > 0) {
    content.innerHTML = `
      <div class="error-banner">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          ${renderIcon('alert-triangle', 16)}
          <h3 style="margin:0;">A few fields need attention &mdash; data may be incomplete</h3>
        </div>
        <ul>${window.STORE._errors.map(e => `<li>${escHtml(e)}</li>`).join('')}</ul>
      </div>
      ${ROUTES[pageKey].render()}`;
  } else {
    content.innerHTML = ROUTES[pageKey].render();
  }

  // Run pending chart inits
  flushCharts();

  // Re-apply any post-render filters
  if (pageKey === 'evidence' && window._evidenceFilter) {
    const searchEl = document.getElementById('ev-search');
    if (searchEl) { searchEl.value = window._evidenceFilter; filterEvidenceTable(); window._evidenceFilter = ''; }
  }

  // Scroll top
  content.scrollTop = 0;
}

/* ── File input handler ──────────────────────────────────────────── */
function handleFileInput(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Show loading
  const content = document.getElementById('content');
  if (content) {
    content.innerHTML = `<div class="state-box"><div class="spinner"></div><div class="state-title">Reading your workbook&hellip;</div><div class="state-sub" style="color:var(--text-muted);font-size:12px;">${escHtml(file.name)}</div><div class="state-sub" style="font-size:11.5px;margin-top:4px;">Parsing all 14 sheets and running QA/QC checks</div></div>`;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const store = parseWorkbook(e.target.result, file.name);
      window.STORE = store;

      if (!store._valid && store._errors.length > 0) {
        // Show critical errors (missing sheets)
        if (content) {
          content.innerHTML = `
            <div class="error-banner">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                ${renderIcon('alert-triangle', 16)}
                <h3 style="margin:0;">We couldn't read this workbook</h3>
              </div>
              <ul>${store._errors.map(err => `<li>${escHtml(err)}</li>`).join('')}</ul>
              <div style="margin-top:10px;font-size:12px;color:var(--text-muted);">Make sure you're uploading a <strong style="color:var(--text-secondary);">TRACE_FORCE_MRV_Cement_QAQC_V28</strong> workbook with all 14 sheets intact.</div>
            </div>
            <div class="state-box">
              <div class="state-icon" style="color:var(--accent);">${renderIcon('upload', 40)}</div>
              <div class="state-title">Try a different file</div>
              <div class="state-sub">Upload a valid V28 workbook to get started</div>
              <label class="btn btn-primary" for="file-input" style="cursor:pointer;margin-top:8px;">
                ${renderIcon('upload', 14)} Choose Workbook
              </label>
            </div>`;
        }
        buildTopbar(); buildFooter();
        return;
      }

      hideUploadPrompt();
      buildTopbar();
      buildFooter();
      navigate(_currentPage === 'overview' ? 'overview' : _currentPage);

      // Reset file inputs so same file can be re-uploaded
      event.target.value = '';
      const modal = document.getElementById('file-input-modal');
      if (modal) modal.value = '';

    } catch(err) {
      console.error('Parse error:', err);
      if (content) {
        content.innerHTML = `<div class="state-box"><div class="state-icon" style="color:var(--qa-fail);">${renderIcon('x-circle', 40)}</div><div class="state-title">Failed to parse workbook</div><div class="state-sub">${escHtml(err.message)}</div></div>`;
      }
    }
  };
  reader.readAsArrayBuffer(file);
}

/* ── Sidebar toggle ─────────────────────────────────────────────── */
function toggleSidebar() {
  document.getElementById('app-shell').classList.toggle('collapsed');
}

/* ── Hash change listener ───────────────────────────────────────── */
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#','');
  if (hash && ROUTES[hash] && hash !== _currentPage) {
    navigate(hash);
  }
});

/* ── Drag and drop on upload prompt ─────────────────────────────── */
function setupDragDrop() {
  document.addEventListener('dragover', e => { e.preventDefault(); });
  document.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm'))) {
      handleFileInput({ target: { files: [file], value: '' } });
    }
  });
}

/* ── Shared helpers used by multiple page renderers ────────────── */
function renderEmptyState(title, sub) {
  return `<div class="state-box">
    <div class="state-icon" style="color:var(--accent);">${renderIcon('upload', 40)}</div>
    <div class="state-title">No data loaded yet</div>
    <div class="state-sub">Upload your TRACE FORCE MRV workbook to view ${escHtml(title.toLowerCase())}.</div>
    <label class="btn btn-primary" for="file-input" style="cursor:pointer;margin-top:8px;" data-explain="btn-upload">
      ${renderIcon('upload', 14)} Choose Workbook
    </label>
  </div>`;
}

function buildDemoBanner(s) {
  return '';
}

/* ── Event setup ────────────────────────────────────────────────── */
function setupEventHandlers() {
  setupDragDrop();
}

/* ── Auto-init on DOMContentLoaded ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

window.navigate        = navigate;
window.handleFileInput = handleFileInput;
window.toggleSidebar   = toggleSidebar;
window.renderEmptyState= renderEmptyState;
window.buildDemoBanner = buildDemoBanner;
window.buildTopbar     = buildTopbar;
window.buildFooter     = buildFooter;
