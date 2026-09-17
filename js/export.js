/* ═══════════════════════════════════════════════════════════════
   export.js — PDF Report + Excel Re-export
   Both generated live from window.STORE — no static/cached values.
   ═══════════════════════════════════════════════════════════════ */

/* ── PDF Export ─────────────────────────────────────────────────── */
async function downloadPDF() {
  const s = window.STORE;
  if (!s || !s._valid) { alert('Please upload a valid workbook first.'); return; }

  const btn = document.getElementById('btn-download-pdf');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating PDF...'; }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210; const M = 15; const TW = W - M * 2;
    let y = 0;

    // Helper: add page if needed
    function checkPage(needed) {
      if (y + needed > 270) { doc.addPage(); y = 20; }
    }

    // ── Cover Page ──────────────────────────────────────────────
    doc.setFillColor(7, 15, 30);
    doc.rect(0, 0, W, 297, 'F');

    // Accent bar
    doc.setFillColor(0, 212, 170);
    doc.rect(0, 0, W, 6, 'F');

    doc.setTextColor(238, 242, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TRACE FORCE MRV', M, 50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 212, 170);
    doc.text('Cement QA/QC Embedded Emissions Report', M, 60);

    doc.setFontSize(11);
    doc.setTextColor(143, 163, 200);
    const site    = s.setup['Installation / site'] || '—';
    const quarter = s.setup['Reporting quarter']   || '—';
    const product = s.setup['Primary product']     || '—';
    const country = s.setup['Country']             || '—';
    const pStart  = s.setup['Period start']        || '—';
    const pEnd    = s.setup['Period end']           || '—';
    const version = s.readme.find(r => r.Control === 'Workbook Version')?.Value || '—';
    const qaStatus= s.calculations['QA/QC Overall Status']?.Value || '—';
    const evStatus= s.calculations['Evidence Status']?.Value || '—';

    const coverLines = [
      ['Site:',           site],
      ['Country:',        country],
      ['Product:',        product],
      ['Reporting Period:', quarter],
      ['Period Start:',   pStart],
      ['Period End:',     pEnd],
      ['Workbook Version:', version],
      ['QA/QC Status:',  qaStatus],
      ['Evidence Status:', evStatus],
      ['Generated:',     new Date().toISOString().replace('T',' ').substring(0,19) + ' UTC'],
    ];

    let cy = 80;
    coverLines.forEach(([k, v]) => {
      doc.setTextColor(143, 163, 200); doc.setFont('helvetica','bold');
      doc.text(k, M, cy);
      doc.setTextColor(238, 242, 255); doc.setFont('helvetica','normal');
      doc.text(String(v), M + 52, cy);
      cy += 8;
    });

    // Status disclaimer from 00_README_Control
    const statusNote = s.readme.find(r => r.Control === 'Status');
    if (statusNote) {
      doc.setFillColor(30, 48, 80);
      doc.roundedRect(M, cy + 4, TW, 18, 3, 3, 'F');
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text('⚠  ' + String(statusNote.Value), M + 5, cy + 13);
      doc.setTextColor(143, 163, 200); doc.setFont('helvetica','normal');
      doc.text(String(statusNote['Governance note'] || ''), M + 5, cy + 19, { maxWidth: TW - 10 });
    }

    // ── Page 2: Executive KPI Summary ──────────────────────────
    doc.addPage();
    doc.setFillColor(7, 15, 30);
    doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(0, 212, 170);
    doc.rect(0, 0, W, 3, 'F');
    y = 18;

    doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(238, 242, 255);
    doc.text('Executive KPI Summary', M, y); y += 10;

    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(143,163,200);
    doc.text('Source: 08_Calculations', M, y); y += 8;

    const kpiRows = [
      ['Clinker Production',           s.calculations['Clinker Produced']?.Value,                     't'],
      ['Cement Production',            s.calculations['Cement Produced']?.Value,                      't'],
      ['Clinker Factor',               s.calculations['Clinker Factor']?.Value,                       'ratio'],
      ['Process CO₂ (Selected)',       s.calculations['Selected Process CO2']?.Value,                 'tCO₂'],
      ['Fuel Combustion CO₂',         s.calculations['Fuel Combustion CO2']?.Value,                  'tCO₂'],
      ['Biogenic CO₂ Memo',           s.calculations['Biogenic CO2 Memo']?.Value,                   'tCO₂'],
      ['Direct Embedded CO₂',        s.calculations['Direct Embedded CO2']?.Value,                  'tCO₂'],
      ['Grid Electricity',             s.calculations['Grid Electricity MWh']?.Value,                 'MWh'],
      ['Indirect Grid CO₂',           s.calculations['Indirect Grid CO2']?.Value,                    'tCO₂'],
      ['Total Embedded CO₂',         s.calculations['Total Embedded CO2']?.Value,                   'tCO₂'],
      ['SEE Clinker',                  s.calculations['SEE Clinker']?.Value,                          'tCO₂/t clinker'],
      ['SEE Cement',                   s.calculations['Specific Embedded Emissions Cement']?.Value,   'tCO₂/t cement'],
      ['Specific Heat Consumption',   s.calculations['Specific Heat Consumption']?.Value,            'GJ/t clinker'],
      ['Thermal Substitution Rate',   s.calculations['Thermal Substitution Rate (TSR)']?.Value,      '%'],
    ];

    // Table header
    doc.setFillColor(15, 31, 61);
    doc.rect(M, y, TW, 7, 'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(100,130,180);
    doc.text('METRIC', M+3, y+5);
    doc.text('VALUE', M+TW-50, y+5);
    doc.text('UNIT', M+TW-25, y+5);
    y += 7;

    kpiRows.forEach(([name, val, unit], i) => {
      if (i % 2 === 0) { doc.setFillColor(12,25,48); doc.rect(M, y, TW, 7, 'F'); }
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(238,242,255);
      doc.text(String(name), M+3, y+5);
      const formatted = val !== null && val !== undefined
        ? (typeof val === 'number' ? new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(val) : String(val))
        : 'Missing';
      doc.setFont('helvetica','bold');
      doc.text(formatted, M+TW-50, y+5);
      doc.setFont('helvetica','normal'); doc.setTextColor(100,130,180);
      doc.text(String(unit), M+TW-25, y+5);
      y += 7;
    });

    // ── Page 3: QA/QC Results ───────────────────────────────────
    doc.addPage();
    doc.setFillColor(7, 15, 30);
    doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(0, 212, 170);
    doc.rect(0, 0, W, 3, 'F');
    y = 18;

    doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(238,242,255);
    doc.text('QA/QC Check Results', M, y); y += 10;

    const qaTotal  = s.qaqc.length;
    const qaPassed = s.qaqc.filter(r => String(r.Status).toUpperCase()==='PASS').length;
    doc.setFontSize(10); doc.setTextColor(qaStatus==='PASS'?[34,197,94]:[239,68,68]);
    doc.text(`Overall: ${qaPassed}/${qaTotal} checks PASS`, M, y); y += 8;

    doc.setFillColor(15, 31, 61);
    doc.rect(M, y, TW, 7, 'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(100,130,180);
    doc.text('ID', M+2, y+5);
    doc.text('CATEGORY', M+18, y+5);
    doc.text('CHECK NAME', M+55, y+5);
    doc.text('RESULT', M+TW-40, y+5);
    doc.text('STATUS', M+TW-15, y+5);
    y += 7;

    s.qaqc.forEach((r, i) => {
      checkPage(8);
      if (i % 2 === 0) { doc.setFillColor(12,25,48); doc.rect(M, y, TW, 7, 'F'); }
      const isPass = String(r.Status).toUpperCase()==='PASS';
      doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(79,172,254);
      doc.text(String(r['Check ID']||''), M+2, y+5);
      doc.setTextColor(143,163,200);
      doc.text(String(r.Category||'').substring(0,14), M+18, y+5);
      doc.setTextColor(238,242,255);
      doc.text(String(r['Check Name']||'').substring(0,28), M+55, y+5);
      doc.setTextColor(143,163,200);
      doc.text(String(r.Result||'').substring(0,10), M+TW-40, y+5);
      doc.setTextColor(isPass ? [34,197,94] : [239,68,68]);
      doc.setFont('helvetica','bold');
      doc.text(String(r.Status||''), M+TW-15, y+5);
      y += 7;
    });

    // ── Page 4: Evidence + Regulatory ──────────────────────────
    doc.addPage();
    doc.setFillColor(7, 15, 30);
    doc.rect(0, 0, W, 297, 'F');
    doc.setFillColor(0, 212, 170);
    doc.rect(0, 0, W, 3, 'F');
    y = 18;

    doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(238,242,255);
    doc.text('Evidence Register Summary', M, y); y += 8;
    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(143,163,200);
    doc.text(`${s.evidence.filter(r=>r.Status==='Mapped').length}/${s.evidence.length} evidence items Mapped`, M, y); y += 8;

    s.evidence.forEach((r, i) => {
      checkPage(8);
      if (i % 2 === 0) { doc.setFillColor(12,25,48); doc.rect(M, y, TW, 7, 'F'); }
      doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(79,172,254);
      doc.text(String(r.evidenceId||'').substring(0,20), M+2, y+5);
      doc.setFont('helvetica','normal'); doc.setTextColor(238,242,255);
      doc.text(String(r.Description||'').substring(0,35), M+48, y+5);
      const isMapped = r.Status === 'Mapped';
      doc.setTextColor(isMapped?[34,197,94]:[239,68,68]);
      doc.text(String(r.Status||''), M+TW-18, y+5);
      y += 7;
    });

    y += 10;
    checkPage(30);
    doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(238,242,255);
    doc.text('Regulatory References', M, y); y += 8;
    s.regulatory.forEach(r => {
      checkPage(14);
      doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(79,172,254);
      doc.text(String(r.Reference||'').substring(0,50), M, y); y += 5;
      doc.setFont('helvetica','normal'); doc.setTextColor(143,163,200);
      doc.text(String(r['Workbook application']||'').substring(0,80), M, y, { maxWidth: TW }); y += 7;
    });

    // ── Footer disclaimer on last page ──────────────────────────
    const disclaimerRow = s.readme.find(r => r.Control === 'Status');
    if (disclaimerRow) {
      doc.setFontSize(7); doc.setTextColor(100,100,100);
      const dText = `${disclaimerRow.Value} — ${disclaimerRow['Governance note'] || ''}`;
      doc.text(dText, M, 285, { maxWidth: TW });
    }

    // Save
    const filename = `TRACE_FORCE_MRV_Cement_Report_${quarter.replace(/\s/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

  } catch (e) {
    console.error('PDF export error:', e);
    alert('PDF generation failed: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Download Report'; }
  }
}

/* ── Excel Re-export ─────────────────────────────────────────────── */
function downloadExcel() {
  const s = window.STORE;
  if (!s || !s._valid) { alert('Please upload a valid workbook first.'); return; }

  try {
    const wb = XLSX.utils.book_new();

    // Helper: sheet from array-of-rows
    function addSheet(name, rows) {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }

    // 00_README_Control
    addSheet('00_README_Control', [
      ['Control', 'Value', 'Governance note'],
      ...s.readme.map(r => [r.Control, r.Value, r['Governance note']])
    ]);

    // 01_Setup
    addSheet('01_Setup', [
      ['Parameter', 'Value', 'Unit', 'Required?', 'Notes', 'Governance owner'],
      ...s.setupRows.map(r => [r.Parameter, r.Value, r.Unit, r['Required?'], r.Notes, r['Governance owner']])
    ]);

    // 02_DCS_Boundary_Map
    addSheet('02_DCS_Boundary_Map', [
      ['Boundary Area','Source System','DCS/ERP/Lab Tag','MRV Field','Unit','Frequency','Evidence Required','Calculation Use','Mapped Status','Owner','QA/QC Rule'],
      ...s.dcsMap.map(r => ['Boundary Area','Source System','DCS/ERP/Lab Tag','MRV Field','Unit','Frequency','Evidence Required','Calculation Use','Mapped Status','Owner','QA/QC Rule'].map(k => r[k]))
    ]);

    // 03_Production_Input
    addSheet('03_Production_Input', [
      ['Date','Quarter','Kiln Line','Cement Type','Clinker Produced t','Cement Produced t','Clinker Used t','Gypsum t','Limestone Additive t','Other Additives t','Clinker Factor','Evidence ID','QA Status','Notes'],
      ...s.production.map(r => [r.Date,r.Quarter,r['Kiln Line'],r['Cement Type'],r['Clinker Produced t'],r['Cement Produced t'],r['Clinker Used t'],r['Gypsum t'],r['Limestone Additive t'],r['Other Additives t'],r['Clinker Factor'],r['Evidence ID'],r['QA Status'],r.Notes])
    ]);

    // 04_Raw_Material_Input
    addSheet('04_Raw_Material_Input', [
      ['Date','Material','Quantity t','CaCO3 %','MgCO3 %','Moisture %','Calcination Conversion','CaCO3 CO2 t','MgCO3 CO2 t','Process CO2 Method A t','Evidence ID','QA Status'],
      ...s.rawMaterial.map(r => [r.Date,r.Material,r['Quantity t'],r['CaCO3 %'],r['MgCO3 %'],r['Moisture %'],r['Calcination Conversion'],r['CaCO3 CO2 t'],r['MgCO3 CO2 t'],r['Process CO2 Method A t'],r['Evidence ID'],r['QA Status']])
    ]);

    // 05_Kiln_Fuel_Input
    addSheet('05_Kiln_Fuel_Input', [
      ['Date','Fuel Type','Quantity','Unit','NCV GJ/unit','EF tCO2/TJ','Oxidation Factor','Biomass Fraction','Fossil Fraction','Energy GJ','Energy TJ','Fossil CO2 t','Biogenic CO2 Memo t','Evidence ID','QA Status'],
      ...s.kilnFuel.map(r => [r.Date,r['Fuel Type'],r.Quantity,r.Unit,r['NCV GJ/unit'],r['EF tCO2/TJ'],r['Oxidation Factor'],r['Biomass Fraction'],r['Fossil Fraction'],r['Energy GJ'],r['Energy TJ'],r['Fossil CO2 t'],r['Biogenic CO2 Memo t'],r['Evidence ID'],r['QA Status']])
    ]);

    // 06_Electricity_Input
    addSheet('06_Electricity_Input', [
      ['Date','Meter / Source','Grid MWh','Grid EF tCO2/MWh','Grid CO2 t','Self-generation MWh','Self-generation EF','Self-generation CO2 t','Renewable MWh','Evidence ID','QA Status'],
      ...s.electricity.map(r => [r.Date,r['Meter / Source'],r['Grid MWh'],r['Grid EF tCO2/MWh'],r['Grid CO2 t'],r['Self-generation MWh'],r['Self-generation EF'],r['Self-generation CO2 t'],r['Renewable MWh'],r['Evidence ID'],r['QA Status']])
    ]);

    // 07_Constants_EF_NCV
    addSheet('07_Constants_EF_NCV', [
      ['Constant / Factor','Value','Unit','Source / rationale','Used in','Change control','Status','Source URL'],
      ...s.constants.map(r => [r['Constant / Factor'],r.Value,r.Unit,r['Source / rationale'],r['Used in'],r['Change control'],r.Status,r['Source URL']]),
      [],
      ['Fuel Type','Default NCV','NCV Unit','Default EF','EF Unit','Default Ox.','Default Biomass %','Notes'],
      ...s.fuelDefaults.map(r => [r['Fuel Type'],r['Default NCV'],r['NCV Unit'],r['Default EF'],r['EF Unit'],r['Default Ox.'],r['Default Biomass %'],r.Notes])
    ]);

    // 08_Calculations
    addSheet('08_Calculations', [
      ['Metric','Formula / Link','Value','Unit','Governance note','QA Source'],
      ...s.calcRows.map(r => [r.Metric, r['Formula / Link'], r.Value, r.Unit, r['Governance note'], r['QA Source']])
    ]);

    // 09_QAQC_Checks
    addSheet('09_QAQC_Checks', [
      ['Check ID','Category','Check Name','Rule','Result','Status','Severity','Owner','Comment'],
      ...s.qaqc.map(r => [r['Check ID'],r.Category,r['Check Name'],r.Rule,r.Result,r.Status,r.Severity,r.Owner,r.Comment])
    ]);

    // 10_Report_Outputs
    addSheet('10_Report_Outputs', [
      ['Output Field','Value','Unit','Source','Report Label','Governance Position','Mapped to Cement UI','Notes'],
      ...s.reportOutputs.map(r => [r['Output Field'],r.Value,r.Unit,r.Source,r['Report Label'],r['Governance Position'],r['Mapped to Cement UI'],r.Notes])
    ]);

    // 11_Evidence_Register
    addSheet('11_Evidence_Register', [
      ['Evidence ID','Evidence Type','Description','Source System','Mapped Sheet','Status','Owner','Reviewer','Frequency','Notes'],
      ...s.evidence.map(r => [r['Evidence ID'],r['Evidence Type'],r.Description,r['Source System'],r['Mapped Sheet'],r.Status,r.Owner,r.Reviewer,r.Frequency,r.Notes])
    ]);

    // 12_Regulatory_Refs
    addSheet('12_Regulatory_Refs', [
      ['Reference','Workbook application','Official source URL','Page / section pointer','Applied sheets','Notes','Status','Last checked'],
      ...s.regulatory.map(r => [r.Reference,r['Workbook application'],r['Official source URL'],r['Page / section pointer'],r['Applied sheets'],r.Notes,r.Status,r['Last checked']])
    ]);

    const quarter = s.setup['Reporting quarter'] || 'Q1';
    XLSX.writeFile(wb, `TRACE_FORCE_MRV_Cement_Export_${quarter.replace(/\s/g,'_')}.xlsx`);

  } catch(e) {
    console.error('Excel export error:', e);
    alert('Excel export failed: ' + e.message);
  }
}

window.downloadPDF   = downloadPDF;
window.downloadExcel = downloadExcel;
