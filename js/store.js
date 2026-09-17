/* ═══════════════════════════════════════════════════════════════
   store.js — Global Data Model (Single Source of Truth)
   All page renderers read exclusively from window.STORE.
   ═══════════════════════════════════════════════════════════════ */

window.STORE = null;

/**
 * Initialize an empty store structure.
 * Called before parsing; pages check _valid before rendering.
 */
function createEmptyStore() {
  return {
    meta: {
      filename: null,
      uploadedAt: null,
    },
    readme: [],       // 00_README_Control rows
    setup: {},        // 01_Setup key→value map
    setupRows: [],    // 01_Setup full rows with governance owner
    dcsMap: [],       // 02_DCS_Boundary_Map rows
    production: [],   // 03_Production_Input data rows
    rawMaterial: [],  // 04_Raw_Material_Input data rows
    kilnFuel: [],     // 05_Kiln_Fuel_Input data rows
    electricity: [],  // 06_Electricity_Input data rows
    constants: [],    // 07_Constants_EF_NCV — constants table
    fuelDefaults: [], // 07_Constants_EF_NCV — fuel defaults table
    calculations: {}, // 08_Calculations metric→row map
    calcRows: [],     // 08_Calculations all rows
    qaqc: [],         // 09_QAQC_Checks rows
    reportOutputs: [],// 10_Report_Outputs rows
    evidence: [],     // 11_Evidence_Register rows
    regulatory: [],   // 12_Regulatory_Refs rows
    dashboard: {      // 13_Dashboard pre-parsed KPIs
      co2Breakdown: [],
      kpis: {}
    },
    _valid: false,
    _errors: []
  };
}

/**
 * Convenience getter: look up a calculation row by metric name.
 */
function getCalc(metricName) {
  if (!window.STORE || !window.STORE.calcRows) return null;
  return window.STORE.calcRows.find(r => r.metric === metricName) || null;
}

/**
 * Convenience getter: look up a setup parameter value.
 */
function getSetup(param) {
  if (!window.STORE || !window.STORE.setup) return null;
  return window.STORE.setup[param] ?? null;
}

/**
 * Convenience getter: look up a report output row by field name.
 */
function getReport(fieldName) {
  if (!window.STORE || !window.STORE.reportOutputs) return null;
  return window.STORE.reportOutputs.find(r => r.outputField === fieldName) || null;
}

/**
 * Convenience getter: look up an evidence row by ID.
 */
function getEvidence(evId) {
  if (!window.STORE || !window.STORE.evidence) return null;
  return window.STORE.evidence.find(r => r.evidenceId === evId) || null;
}

window.createEmptyStore = createEmptyStore;
window.getCalc = getCalc;
window.getSetup = getSetup;
window.getReport = getReport;
window.getEvidence = getEvidence;
