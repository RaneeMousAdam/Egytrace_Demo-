/* ═══════════════════════════════════════════════════════════════
   parser.js — SheetJS Workbook Parser + Schema Validator
   ═══════════════════════════════════════════════════════════════ */

const EXPECTED_SHEETS = [
  '00_README_Control', '01_Setup', '02_DCS_Boundary_Map',
  '03_Production_Input', '04_Raw_Material_Input', '05_Kiln_Fuel_Input',
  '06_Electricity_Input', '07_Constants_EF_NCV', '08_Calculations',
  '09_QAQC_Checks', '10_Report_Outputs', '11_Evidence_Register',
  '12_Regulatory_Refs', '13_Dashboard'
];

/** Required headers per sheet (used for schema validation) */
const REQUIRED_HEADERS = {
  '00_README_Control':   ['Control', 'Value', 'Governance note'],
  '01_Setup':            ['Parameter', 'Value', 'Unit', 'Required?', 'Notes', 'Governance owner'],
  '02_DCS_Boundary_Map': ['Boundary Area', 'Source System', 'DCS/ERP/Lab Tag', 'MRV Field', 'Unit', 'Frequency', 'Evidence Required', 'Calculation Use', 'Mapped Status', 'Owner', 'QA/QC Rule'],
  '03_Production_Input': ['Date', 'Quarter', 'Kiln Line', 'Cement Type', 'Clinker Produced t', 'Cement Produced t', 'Clinker Used t', 'Gypsum t', 'Limestone Additive t', 'Other Additives t', 'Clinker Factor', 'Evidence ID', 'QA Status', 'Notes'],
  '04_Raw_Material_Input':['Date', 'Material', 'Quantity t', 'CaCO3 %', 'MgCO3 %', 'Moisture %', 'Calcination Conversion', 'CaCO3 CO2 t', 'MgCO3 CO2 t', 'Process CO2 Method A t', 'Evidence ID', 'QA Status'],
  '05_Kiln_Fuel_Input':  ['Date', 'Fuel Type', 'Quantity', 'Unit', 'NCV GJ/unit', 'EF tCO2/TJ', 'Oxidation Factor', 'Biomass Fraction', 'Fossil Fraction', 'Energy GJ', 'Energy TJ', 'Fossil CO2 t', 'Biogenic CO2 Memo t', 'Evidence ID', 'QA Status'],
  '06_Electricity_Input':['Date', 'Meter / Source', 'Grid MWh', 'Grid EF tCO2/MWh', 'Grid CO2 t', 'Self-generation MWh', 'Self-generation EF', 'Self-generation CO2 t', 'Renewable MWh', 'Evidence ID', 'QA Status'],
  '07_Constants_EF_NCV': ['Constant / Factor', 'Value', 'Unit', 'Source / rationale', 'Used in', 'Change control', 'Status', 'Source URL'],
  '08_Calculations':     ['Metric', 'Formula / Link', 'Value', 'Unit', 'Governance note', 'QA Source'],
  '09_QAQC_Checks':      ['Check ID', 'Category', 'Check Name', 'Rule', 'Result', 'Status', 'Severity', 'Owner'],
  '10_Report_Outputs':   ['Output Field', 'Value', 'Unit', 'Source', 'Report Label', 'Governance Position', 'Mapped to Cement UI', 'Notes'],
  '11_Evidence_Register':['Evidence ID', 'Evidence Type', 'Description', 'Source System', 'Mapped Sheet', 'Status', 'Owner', 'Reviewer', 'Frequency', 'Notes'],
  '12_Regulatory_Refs':  ['Reference', 'Workbook application', 'Official source URL', 'Page / section pointer', 'Applied sheets', 'Notes', 'Status', 'Last checked'],
};

/**
 * Get all rows from a sheet as array-of-arrays.
 */
function sheetRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
}

/**
 * Get numeric/raw rows (dates as Date objects).
 */
function sheetRowsRaw(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
}

/**
 * Map array of values to object using a headers array.
 */
function rowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = (row[i] !== undefined) ? row[i] : null; });
  return obj;
}

/**
 * Parse a JS Date or Excel serial to ISO date string.
 */
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') {
    // Excel serial — try XLSX helper
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
    } catch(e) {}
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  return String(val);
}

/**
 * Parse numeric value; return null if missing/formula error.
 */
function parseNum(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string' && val.startsWith('#')) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/**
 * Main entry point: parse ArrayBuffer → STORE object.
 */
function parseWorkbook(buffer, filename) {
  const store = window.createEmptyStore();
  store.meta.filename  = filename;
  store.meta.uploadedAt = new Date().toISOString();

  let wb;
  try {
    wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  } catch (e) {
    store._errors.push('Failed to read file: ' + e.message);
    store._valid = false;
    return store;
  }

  // ── Validate sheet names ──────────────────────────────────────
  const missing = EXPECTED_SHEETS.filter(s => !wb.SheetNames.includes(s));
  if (missing.length > 0) {
    missing.forEach(s => store._errors.push(`Missing sheet: "${s}"`));
    store._valid = false;
    return store;
  }

  // ── Validate column headers per sheet ────────────────────────
  for (const [sheet, reqCols] of Object.entries(REQUIRED_HEADERS)) {
    const rows = sheetRows(wb, sheet);
    // Header row is at index 2 (0-based): row 1=title, row 2=desc, row 3=headers
    const headerRow = rows[2] || [];
    for (const col of reqCols) {
      if (!headerRow.includes(col)) {
        store._errors.push(`Sheet "${sheet}" missing column: "${col}"`);
      }
    }
  }

  if (store._errors.length > 0) {
    store._valid = false;
    return store;
  }

  // ── Parse each sheet ─────────────────────────────────────────
  parse00(wb, store);
  parse01(wb, store);
  parse02(wb, store);
  parse03(wb, store);
  parse04(wb, store);
  parse05(wb, store);
  parse06(wb, store);
  parse07(wb, store);
  parse08(wb, store);
  parse09(wb, store);
  parse10(wb, store);
  parse11(wb, store);
  parse12(wb, store);
  parse13(wb, store);

  store._valid = store._errors.length === 0;
  return store;
}

// ── 00_README_Control ────────────────────────────────────────────
function parse00(wb, store) {
  const rows = sheetRows(wb, '00_README_Control');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    store.readme.push(rowToObj(headers, r));
  }
}

// ── 01_Setup ─────────────────────────────────────────────────────
function parse01(wb, store) {
  const rows = sheetRows(wb, '01_Setup');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    const obj = rowToObj(headers, r);
    const key = obj['Parameter'];
    if (key) {
      let val = obj['Value'];
      // Clean up dates
      if (val && typeof val === 'string' && val.includes('T00:00:00')) {
        val = val.split('T')[0];
      }
      store.setup[key] = val;
      store.setupRows.push(obj);
    }
  }
}

// ── 02_DCS_Boundary_Map ──────────────────────────────────────────
function parse02(wb, store) {
  const rows = sheetRows(wb, '02_DCS_Boundary_Map');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    store.dcsMap.push(rowToObj(headers, r));
  }
}

// ── 03_Production_Input ──────────────────────────────────────────
function parse03(wb, store) {
  const rowsRaw = sheetRowsRaw(wb, '03_Production_Input');
  const rowsStr = sheetRows(wb, '03_Production_Input');
  const headers = rowsStr[2] || [];
  for (let i = 3; i < rowsStr.length; i++) {
    const rStr = rowsStr[i];
    const rRaw = rowsRaw[i] || rStr;
    if (!rStr || rStr.every(v => v === null)) continue;
    const obj = rowToObj(headers, rStr);
    obj['Date'] = parseDate(rRaw[0]);
    obj['_dateRaw'] = rRaw[0];
    // Ensure numerics
    ['Clinker Produced t','Cement Produced t','Clinker Used t','Gypsum t','Limestone Additive t','Other Additives t','Clinker Factor'].forEach(k => {
      obj[k] = parseNum(obj[k]);
    });
    store.production.push(obj);
  }
}

// ── 04_Raw_Material_Input ────────────────────────────────────────
function parse04(wb, store) {
  const rowsRaw = sheetRowsRaw(wb, '04_Raw_Material_Input');
  const rowsStr = sheetRows(wb, '04_Raw_Material_Input');
  const headers = rowsStr[2] || [];
  for (let i = 3; i < rowsStr.length; i++) {
    const rStr = rowsStr[i];
    const rRaw = rowsRaw[i] || rStr;
    if (!rStr || rStr.every(v => v === null)) continue;
    const obj = rowToObj(headers, rStr);
    obj['Date'] = parseDate(rRaw[0]);
    ['Quantity t','CaCO3 %','MgCO3 %','Moisture %','Calcination Conversion','CaCO3 CO2 t','MgCO3 CO2 t','Process CO2 Method A t'].forEach(k => {
      obj[k] = parseNum(obj[k]);
    });
    store.rawMaterial.push(obj);
  }
}

// ── 05_Kiln_Fuel_Input ───────────────────────────────────────────
function parse05(wb, store) {
  const rowsRaw = sheetRowsRaw(wb, '05_Kiln_Fuel_Input');
  const rowsStr = sheetRows(wb, '05_Kiln_Fuel_Input');
  const headers = rowsStr[2] || [];
  for (let i = 3; i < rowsStr.length; i++) {
    const rStr = rowsStr[i];
    const rRaw = rowsRaw[i] || rStr;
    if (!rStr || rStr.every(v => v === null)) continue;
    const obj = rowToObj(headers, rStr);
    obj['Date'] = parseDate(rRaw[0]);
    ['Quantity','NCV GJ/unit','EF tCO2/TJ','Oxidation Factor','Biomass Fraction','Fossil Fraction','Energy GJ','Energy TJ','Fossil CO2 t','Biogenic CO2 Memo t'].forEach(k => {
      obj[k] = parseNum(obj[k]);
    });
    store.kilnFuel.push(obj);
  }
}

// ── 06_Electricity_Input ─────────────────────────────────────────
function parse06(wb, store) {
  const rowsRaw = sheetRowsRaw(wb, '06_Electricity_Input');
  const rowsStr = sheetRows(wb, '06_Electricity_Input');
  const headers = rowsStr[2] || [];
  for (let i = 3; i < rowsStr.length; i++) {
    const rStr = rowsStr[i];
    const rRaw = rowsRaw[i] || rStr;
    if (!rStr || rStr.every(v => v === null)) continue;
    const obj = rowToObj(headers, rStr);
    obj['Date'] = parseDate(rRaw[0]);
    ['Grid MWh','Grid EF tCO2/MWh','Grid CO2 t','Self-generation MWh','Self-generation EF','Self-generation CO2 t','Renewable MWh'].forEach(k => {
      obj[k] = parseNum(obj[k]);
    });
    store.electricity.push(obj);
  }
}

// ── 07_Constants_EF_NCV ──────────────────────────────────────────
// Two tables: constants (header at row 2), fuel defaults (header somewhere after)
function parse07(wb, store) {
  const rows = sheetRows(wb, '07_Constants_EF_NCV');
  const constHeaders = rows[2] || [];
  let fuelHeaderIdx = -1;

  // Find second header row (Fuel Type | Default NCV | ...)
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (r && r[0] === 'Fuel Type' && r[1] === 'Default NCV') {
      fuelHeaderIdx = i;
      break;
    }
  }

  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    if (i === fuelHeaderIdx) continue; // skip fuel header row
    if (fuelHeaderIdx > -1 && i > fuelHeaderIdx) {
      // Fuel defaults table
      const fuelHeaders = rows[fuelHeaderIdx] || [];
      const obj = rowToObj(fuelHeaders, r);
      if (!obj['Fuel Type']) continue;
      obj['Default NCV'] = parseNum(obj['Default NCV']);
      obj['Default EF']  = parseNum(obj['Default EF']);
      obj['Default Ox.'] = parseNum(obj['Default Ox.']);
      obj['Default Biomass %'] = parseNum(obj['Default Biomass %']);
      store.fuelDefaults.push(obj);
    } else {
      // Constants table
      const obj = rowToObj(constHeaders, r);
      if (!obj['Constant / Factor']) continue;
      obj['Value'] = parseNum(obj['Value']);
      store.constants.push(obj);
    }
  }
}

// ── 08_Calculations ──────────────────────────────────────────────
function parse08(wb, store) {
  const rows = sheetRows(wb, '08_Calculations');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    const obj = rowToObj(headers, r);
    if (!obj['Metric']) continue;
    obj['Value'] = parseNum(obj['Value']) !== null ? parseNum(obj['Value']) : obj['Value'];
    store.calcRows.push(obj);
    store.calculations[obj['Metric']] = obj;
  }
}

// ── 09_QAQC_Checks ───────────────────────────────────────────────
function parse09(wb, store) {
  const rows = sheetRows(wb, '09_QAQC_Checks');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    const obj = rowToObj(headers, r);
    if (!obj['Check ID']) continue;
    // Result may be numeric
    const numResult = parseNum(obj['Result']);
    if (numResult !== null) obj['_resultNum'] = numResult;
    store.qaqc.push(obj);
  }
}

// ── 10_Report_Outputs ────────────────────────────────────────────
function parse10(wb, store) {
  const rows = sheetRows(wb, '10_Report_Outputs');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    const obj = rowToObj(headers, r);
    if (!obj['Output Field']) continue;
    // camelCase key for lookup
    obj.outputField = obj['Output Field'];
    const numVal = parseNum(obj['Value']);
    if (numVal !== null) obj['_valueNum'] = numVal;
    // Clean date values
    if (obj['Value'] && typeof obj['Value'] === 'string' && obj['Value'].includes('T00:00:00')) {
      obj['Value'] = obj['Value'].split('T')[0];
    }
    store.reportOutputs.push(obj);
  }
}

// ── 11_Evidence_Register ─────────────────────────────────────────
function parse11(wb, store) {
  const rows = sheetRows(wb, '11_Evidence_Register');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    const obj = rowToObj(headers, r);
    if (!obj['Evidence ID']) continue;
    obj.evidenceId = obj['Evidence ID'];
    store.evidence.push(obj);
  }
}

// ── 12_Regulatory_Refs ───────────────────────────────────────────
function parse12(wb, store) {
  const rows = sheetRows(wb, '12_Regulatory_Refs');
  const headers = rows[2] || [];
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(v => v === null)) continue;
    const obj = rowToObj(headers, r);
    if (!obj['Reference']) continue;
    store.regulatory.push(obj);
  }
}

// ── 13_Dashboard ─────────────────────────────────────────────────
// Irregular structure — parse known positions
function parse13(wb, store) {
  const rows = sheetRows(wb, '13_Dashboard');
  // CO2 breakdown: rows where col F='Component'... find the metric header
  let metricHeaderIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === 'Metric' && rows[i][1] === 'Value') {
      metricHeaderIdx = i;
      break;
    }
  }

  if (metricHeaderIdx >= 0) {
    for (let i = metricHeaderIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      const metric = r[0];
      const val    = parseNum(r[1]);
      const unit   = r[2];
      const govPos = r[3];
      // CO2 breakdown rows have col F = 'Component'
      const comp   = r[5];
      const tco2   = parseNum(r[6]);
      const share  = parseNum(r[7]);
      if (comp && tco2 !== null && share !== null) {
        store.dashboard.co2Breakdown.push({ component: comp, tCO2: tco2, share: share });
      }
      store.dashboard.kpis[metric] = { value: val, unit: unit, govPos: govPos };
    }
  }
}

window.parseWorkbook = parseWorkbook;
