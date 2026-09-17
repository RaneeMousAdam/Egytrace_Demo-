/* ═══════════════════════════════════════════════════════════════
   app.js — Main Application: Bootstrap, Router, Event Handlers
   ═══════════════════════════════════════════════════════════════ */

/* ── Route map ─────────────────────────────────────────────────── */
const ROUTES = {
  'overview':    { label: 'Overview',                  icon: '🏠', render: () => renderOverview()          },
  'governance':  { label: 'Governance & Control',      icon: '🏛️', render: () => renderGovernance()        },
  'setup':       { label: 'Setup & Reporting Period',  icon: '⚙️', render: () => renderSetup()             },
  'dcs':         { label: 'DCS / ERP / Lab Boundary',  icon: '🗺️', render: () => renderDcsBoundary()       },
  'production':  { label: 'Production Input',          icon: '🏭', render: () => renderProduction()        },
  'rawmaterial': { label: 'Raw Material Input',        icon: '🪨', render: () => renderRawMaterial()       },
  'kilnfuel':    { label: 'Kiln Fuel Input',           icon: '🔥', render: () => renderKilnFuel()          },
  'electricity': { label: 'Electricity Input',         icon: '⚡', render: () => renderElectricity()       },
  'constants':   { label: 'Constants, EF & NCV',       icon: '🔬', render: () => renderConstants()         },
  'calculations':{ label: 'Calculations',              icon: '🧮', render: () => renderCalculations()      },
  'qaqc':        { label: 'QA/QC Checks',              icon: '✅', render: () => renderQaqc()              },
  'reportouts':  { label: 'Report Outputs',            icon: '📄', render: () => renderReportOutputs()     },
  'evidence':    { label: 'Evidence Register',         icon: '📁', render: () => renderEvidence()          },
  'regulatory':  { label: 'Regulatory References',     icon: '📜', render: () => renderRegulatory()        },
  'analytics':   { label: 'Analytics Dashboard',       icon: '📈', render: () => renderAnalyticsDashboard()},
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
      return `<div class="nav-item" id="nav-${key}" onclick="navigate('${key}')">
        <span class="nav-icon">${r.icon}</span>
        <span class="nav-label">${r.label}</span>
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
  const qaColor = qaStatus === 'PASS' ? 'badge-pass' : qaStatus === 'FAIL' ? 'badge-fail' : 'badge-info';

  tb.innerHTML = `
    <button class="btn btn-secondary btn-sm btn-icon" onclick="toggleSidebar()" title="Toggle sidebar">☰</button>
    <div class="topbar-site">
      <div class="site-name">${escHtml(site)}</div>
      <div class="site-period">${escHtml(quarter)}</div>
    </div>
    <div class="topbar-spacer"></div>
    <div class="topbar-actions">
      ${qaStatus ? `<span class="badge ${qaColor}" style="font-size:12px;">${qaStatus==='PASS'?'✓':'✗'} QA/QC ${escHtml(qaStatus)}</span>` : ''}
      <label class="btn btn-secondary btn-sm" for="file-input" style="cursor:pointer;">📂 Upload Workbook</label>
      <input type="file" id="file-input" accept=".xlsx,.xlsm" style="display:none;" onchange="handleFileInput(event)">
      <button class="btn btn-primary btn-sm" id="btn-download-pdf" onclick="downloadPDF()">⬇ Download Report</button>
      <button class="btn btn-accent2 btn-sm" onclick="downloadExcel()">📊 Export Excel</button>
    </div>`;
}

/* ── Build footer ───────────────────────────────────────────────── */
function buildFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  const s = window.STORE;
  let disclaimerText = 'TRACE FORCE MRV — Cement QA/QC Dashboard';

  if (s && s._valid) {
    const statusRow = s.readme.find(r => r.Control === 'Status');
    const govNote   = statusRow?.['Governance note'] || '';
    const status    = statusRow?.Value || '';
    const isDemo    = status.includes('DEMO');
    if (isDemo) {
      disclaimerText = `<span class="demo-flag">⚠ ${escHtml(status)}</span> — ${escHtml(govNote)}`;
    } else {
      disclaimerText = escHtml(status ? `${status} | ${govNote}` : govNote);
    }
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
      <div class="uc-icon">📊</div>
      <h2>TRACE FORCE MRV</h2>
      <p>Upload your <strong>TRACE_FORCE_MRV_Cement_QAQC_V28</strong> workbook to begin.<br>
      All 14 sheets will be parsed and validated automatically.</p>
      <label class="btn btn-primary" for="file-input-modal" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;">
        📂 Select Workbook (.xlsx)
      </label>
      <input type="file" id="file-input-modal" accept=".xlsx,.xlsm" style="display:none;" onchange="handleFileInput(event)">
      <div style="margin-top:16px;font-size:11px;color:var(--text-muted);">
        Supported: TRACE_FORCE_MRV_Cement_QAQC_V28_Collection_Workbook
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
        <h3>⚠ Schema Validation Errors — some pages may not render correctly</h3>
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
    content.innerHTML = `<div class="state-box"><div class="spinner"></div><div class="state-title">Parsing workbook...</div><div class="state-sub">${escHtml(file.name)}</div></div>`;
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
              <h3>❌ Workbook Validation Failed</h3>
              <ul>${store._errors.map(err => `<li>${escHtml(err)}</li>`).join('')}</ul>
            </div>
            <div class="state-box">
              <div class="state-icon">📊</div>
              <div class="state-title">Please upload a valid V28 workbook</div>
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
        content.innerHTML = `<div class="state-box"><div class="state-icon">❌</div><div class="state-title">Failed to parse workbook</div><div class="state-sub">${escHtml(err.message)}</div></div>`;
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
    <div class="state-icon">📊</div>
    <div class="state-title">${escHtml(title)}</div>
    <div class="state-sub">${escHtml(sub)}</div>
    <label class="btn btn-primary" for="file-input" style="cursor:pointer;margin-top:8px;">📂 Upload Workbook</label>
  </div>`;
}

function buildDemoBanner(s) {
  if (!s) return '';
  const statusRow = s.readme.find(r => r.Control === 'Status');
  if (!statusRow || !String(statusRow.Value).includes('DEMO')) return '';
  return `<div class="demo-banner">
    <span>⚠️</span>
    <strong>${escHtml(statusRow.Value)}</strong> — ${escHtml(statusRow['Governance note'] || '')}
  </div>`;
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
