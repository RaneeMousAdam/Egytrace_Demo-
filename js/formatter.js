/* ═══════════════════════════════════════════════════════════════
   formatter.js — Number, Date, Unit & Badge Formatting Utilities
   Used identically across all pages. Never localise or change
   unit labels from what the workbook specifies.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Format a numeric value by unit type.
 * Returns "Missing" badge HTML if val is null/undefined/empty string.
 *
 * unitType examples: 't', 'tCO2', 'GJ', 'TJ', 'MWh', 'ratio',
 *   'tCO2/t clinker', 'tCO2/t cement', '%', 'GJ/t clinker', 'status', 'text'
 */
function fmt(val, unitType) {
  if (val === null || val === undefined || val === '' || val === 'Missing') {
    return '<span class="badge badge-missing">Missing</span>';
  }
  if (typeof val === 'string' && (val.startsWith('#') || val === 'N/A')) {
    return '<span class="badge badge-missing">N/A</span>';
  }

  const n = parseFloat(val);

  switch (unitType) {
    case 't':
      return isNaN(n) ? escHtml(val) : fmtInt(n);
    case 'tCO2':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 2);
    case 'GJ':
      return isNaN(n) ? escHtml(val) : fmtInt(n);
    case 'TJ':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 3);
    case 'MWh':
      return isNaN(n) ? escHtml(val) : fmtInt(n);
    case 'ratio':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 3);
    case 'tCO2/t clinker':
    case 'tCO2/t cement':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 4);
    case '%':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 2);
    case 'GJ/t clinker':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 3);
    case 'tCO2/MWh':
    case 'tCO2/TJ':
      return isNaN(n) ? escHtml(val) : fmtDec(n, 4);
    case 'status':
    case 'text':
    case 'date':
      return escHtml(String(val));
    default:
      if (!isNaN(n)) {
        // Default: if integer-ish, show as int; else 3dp
        return Number.isInteger(n) ? fmtInt(n) : fmtDec(n, 3);
      }
      return escHtml(String(val));
  }
}

/** Format a plain number value (no badge wrapping). Returns null if missing. */
function fmtRaw(val, decimals = 0) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return decimals === 0 ? fmtInt(n) : fmtDec(n, decimals);
}

/** Integer with thousands separator */
function fmtInt(n) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

/** Fixed decimal */
function fmtDec(n, dp) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n);
}

/** Format a JS Date or serial or string to "Jan 2025" */
function fmtDate(val) {
  if (!val) return '—';
  let d;
  if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'number') {
    // Excel serial number
    d = XLSX.SSF.parse_date_code(val);
    if (!d) return String(val);
    d = new Date(d.y, d.m - 1, d.d);
  } else {
    d = new Date(val);
  }
  if (isNaN(d.getTime())) return escHtml(String(val));
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Format date to YYYY-MM-DD for tables */
function fmtDateFull(val) {
  if (!val) return '—';
  let d;
  if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'number') {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (!parsed) return String(val);
    d = new Date(parsed.y, parsed.m - 1, parsed.d);
  } else {
    d = new Date(val);
  }
  if (isNaN(d.getTime())) return escHtml(String(val));
  return d.toISOString().split('T')[0];
}

/** QA Status badge HTML (PASS / FAIL / Warning) — consistent everywhere */
function fmtQaBadge(status, severity) {
  if (!status) return '<span class="badge badge-missing">—</span>';
  const s = String(status).toUpperCase();
  if (s === 'PASS') {
    return '<span class="badge badge-pass">✓ PASS</span>';
  }
  if (s === 'FAIL') {
    return '<span class="badge badge-fail">✗ FAIL</span>';
  }
  return `<span class="badge badge-warn">⚠ ${escHtml(status)}</span>`;
}

/** Severity badge (Warning / Fail) */
function fmtSeverityBadge(severity) {
  if (!severity) return '';
  const s = String(severity);
  if (s === 'Fail') return '<span class="chip chip-fail">Fail</span>';
  if (s === 'Warning') return '<span class="chip chip-warn">Warning</span>';
  return `<span class="chip">${escHtml(s)}</span>`;
}

/** Status chip (Approved, Demo, Controlled, Locked, Pending, Mapped) */
function fmtStatusChip(status) {
  if (!status) return '';
  const s = String(status);
  const cls = {
    'Approved':   'chip-approved',
    'Demo':       'chip-demo',
    'Controlled': 'chip-controlled',
    'Locked':     'chip-locked',
    'Pending':    'chip-pending',
    'Mapped':     'chip-mapped',
    'Official':   'chip-official',
    'External standard': 'chip-external',
    'PASS':       'chip-pass',
    'FAIL':       'chip-fail',
  }[s] || 'chip-controlled';
  return `<span class="chip ${cls}">${escHtml(s)}</span>`;
}

/** Unit tag span */
function unitTag(unit) {
  if (!unit) return '';
  return `<span class="unit-col text-muted"> ${escHtml(unit)}</span>`;
}

/** Check value against QA range — return 'pass'|'warn'|'fail' */
function qaCheck(val, min, max) {
  const n = parseFloat(val);
  if (isNaN(n)) return 'fail';
  if (n < min || n > max) return 'fail';
  return 'pass';
}

/** Escape HTML special characters */
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Short number for KPI cards (e.g. 510,619 → "510.6 K") */
function fmtShort(n) {
  if (n === null || n === undefined) return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  if (Math.abs(num) >= 1_000_000) return fmtDec(num / 1_000_000, 2) + ' M';
  if (Math.abs(num) >= 1_000)     return fmtDec(num / 1_000, 1) + ' K';
  return fmtDec(num, 2);
}

/** Generate Evidence ID link (navigates to evidence register filtered by ID) */
function evLink(evId) {
  if (!evId) return '—';
  return `<span class="ev-link" onclick="navigateToEvidence('${escHtml(evId)}')">${escHtml(evId)}</span>`;
}

window.fmt       = fmt;
window.fmtRaw    = fmtRaw;
window.fmtInt    = fmtInt;
window.fmtDec    = fmtDec;
window.fmtDate   = fmtDate;
window.fmtDateFull = fmtDateFull;
window.fmtQaBadge  = fmtQaBadge;
window.fmtSeverityBadge = fmtSeverityBadge;
window.fmtStatusChip    = fmtStatusChip;
window.unitTag   = unitTag;
window.qaCheck   = qaCheck;
window.escHtml   = escHtml;
window.fmtShort  = fmtShort;
window.evLink    = evLink;
