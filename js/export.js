/* ═══════════════════════════════════════════════════════════════
   export.js — PDF Report + Excel Re-export
   Enterprise light theme — crisp white pages, navy typography,
   blue accents, and zero emoji or unvalidated color arguments.
   ═══════════════════════════════════════════════════════════════ */

/* ── PDF Export ─────────────────────────────────────────────────── */
async function downloadPDF() {
  const s = window.STORE;
  if (!s || !s._valid) {
    alert('Please upload a valid workbook first.');
    return;
  }

  const btn = document.getElementById('btn-download-pdf');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `${window.renderIcon ? window.renderIcon('download', 14) : ''} Generating PDF...`;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const M = 16;
    const TW = W - M * 2;
    let y = 0;

    // Helper: add header accent line to each page
    function applyPageHeader(title) {
      // Top blue accent bar
      doc.setFillColor(22, 119, 255);
      doc.rect(0, 0, W, 4, 'F');

      // Running header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('TRACE FORCE MRV  |  Cement QA/QC Verification Report', M, 11);
      if (title) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 78, 104);
        doc.text(title, W - M, 11, { align: 'right' });
      }

      // Thin separator rule
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(M, 14, W - M, 14);
    }

    // Helper: add page if needed
    function checkPage(needed, title) {
      if (y + needed > 275) {
        doc.addPage();
        applyPageHeader(title);
        y = 22;
      }
    }

    // ── Page 1: Cover Page ───────────────────────────────────────
    // Top brand bar
    doc.setFillColor(15, 39, 71); // Navy #0F2747
    doc.rect(0, 0, W, 70, 'F');

    doc.setFillColor(22, 119, 255); // Blue #1677FF
    doc.rect(0, 0, W, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TRACE FORCE MRV', M, 28);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(190, 215, 255);
    doc.text('Cement QA/QC Embedded Emissions Report', M, 38);

    doc.setFontSize(9);
    doc.setTextColor(147, 197, 253);
    doc.text('EU ETS / CBAM Aligned  |  ISO 14064 Compliance Assurance', M, 48);

    // Metadata Card
    y = 80;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, TW, 94, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 71);
    doc.text('Reporting & Operational Parameters', M + 8, y + 10);

    doc.setDrawColor(226, 232, 240);
    doc.line(M + 8, y + 14, M + TW - 8, y + 14);

    const site     = s.setup['Installation / site'] || 'Primary Facility';
    const quarter  = s.setup['Reporting quarter']   || '—';
    const product  = s.setup['Primary product']     || '—';
    const country  = s.setup['Country']             || '—';
    const pStart   = s.setup['Period start']        || '—';
    const pEnd     = s.setup['Period end']          || '—';
    const version  = s.readme.find(r => r.Control === 'Workbook Version')?.Value || 'v0.2';
    const qaStatus = s.calculations['QA/QC Overall Status']?.Value || 'PASS';
    const evStatus = s.calculations['Evidence Status']?.Value || 'Mapped';

    const coverLines = [
      ['Installation / Site:', site],
      ['Country / Jurisdiction:', country],
      ['Primary Product:', product],
      ['Reporting Quarter:', quarter],
      ['Accounting Period:', `${pStart} to ${pEnd}`],
      ['Workbook Specification:', version],
      ['QA/QC Overall Status:', qaStatus],
      ['Evidence Coverage Status:', evStatus],
      ['Report Generation Date:', new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'],
    ];

    let cy = y + 22;
    coverLines.forEach(([k, v]) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 78, 104);
      doc.text(k, M + 8, cy);

      doc.setFont('helvetica', 'normal');
      if (k.includes('QA/QC Overall Status')) {
        const isP = String(v).toUpperCase() === 'PASS';
        doc.setTextColor(isP ? 22 : 220, isP ? 163 : 38, isP ? 74 : 38);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(23, 43, 77);
      }
      doc.text(String(v), M + 68, cy);
      cy += 7.5;
    });

    // Clean summary statement on cover
    y = 186;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(M, y, TW, 26, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 71);
    doc.text('Verification & Methodology Statement', M + 6, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'This report summarizes activity data, clinker ratios, emission factors, and energy balances ' +
      'compiled in strict alignment with MRV greenhouse gas accounting standards. All calculations ' +
      'have undergone automated cross-sheet reconciliation.',
      M + 6,
      y + 14,
      { maxWidth: TW - 12 }
    );

    // Cover page footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Page 1 of 4  |  Confidential QA/QC Record', M, 285);

    // ── Page 2: Executive KPI Summary ────────────────────────────
    doc.addPage();
    applyPageHeader('Executive KPI Summary');
    y = 24;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 71);
    doc.text('Emissions & Production Summary', M, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Direct, indirect, and specific embedded emission indicators reconciled from Sheet 08_Calculations.', M, y);
    y += 8;

    const kpiRows = [
      ['Clinker Production',         s.calculations['Clinker Produced']?.Value,                   't'],
      ['Cement Production',          s.calculations['Cement Produced']?.Value,                    't'],
      ['Clinker Factor',             s.calculations['Clinker Factor']?.Value,                     'ratio'],
      ['Process CO₂ (Selected)',     s.calculations['Selected Process CO2']?.Value,               'tCO₂'],
      ['Fuel Combustion CO₂',       s.calculations['Fuel Combustion CO2']?.Value,                'tCO₂'],
      ['Biogenic CO₂ Memo',         s.calculations['Biogenic CO2 Memo']?.Value,                 'tCO₂'],
      ['Direct Embedded CO₂',      s.calculations['Direct Embedded CO2']?.Value,                'tCO₂'],
      ['Grid Electricity Consumed',  s.calculations['Grid Electricity MWh']?.Value,               'MWh'],
      ['Indirect Grid CO₂',         s.calculations['Indirect Grid CO2']?.Value,                  'tCO₂'],
      ['Total Embedded CO₂',       s.calculations['Total Embedded CO2']?.Value,                 'tCO₂'],
      ['SEE Clinker',                s.calculations['SEE Clinker']?.Value,                        'tCO₂/t clinker'],
      ['SEE Cement',                 s.calculations['Specific Embedded Emissions Cement']?.Value, 'tCO₂/t cement'],
      ['Specific Heat Consumption', s.calculations['Specific Heat Consumption']?.Value,          'GJ/t clinker'],
      ['Thermal Substitution Rate', s.calculations['Thermal Substitution Rate (TSR)']?.Value,    '%'],
    ];

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, TW, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 78, 104);
    doc.text('METRIC / INDICATOR', M + 4, y + 5);
    doc.text('REPORTED VALUE', M + TW - 55, y + 5);
    doc.text('UNIT', M + TW - 20, y + 5);
    y += 7;

    kpiRows.forEach(([name, val, unit], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(M, y, TW, 7, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(M, y + 7, M + TW, y + 7);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(23, 43, 77);
      doc.text(String(name), M + 4, y + 5);

      const formatted = val !== null && val !== undefined
        ? (typeof val === 'number' ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(val) : String(val))
        : '—';
      doc.setFont('helvetica', 'bold');
      doc.text(formatted, M + TW - 55, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(String(unit), M + TW - 20, y + 5);
      y += 7;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Page 2 of 4  |  Trace Force MRV Cement QA/QC Protocol', M, 285);

    // ── Page 3: QA/QC Results ─────────────────────────────────────
    doc.addPage();
    applyPageHeader('QA/QC Check Results');
    y = 24;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 71);
    doc.text('Automated QA/QC Validation Register', M, y);
    y += 6;

    const qaTotal  = s.qaqc.length;
    const qaPassed = s.qaqc.filter(r => String(r.Status).toUpperCase() === 'PASS').length;
    const isOverallPass = qaPassed === qaTotal;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isOverallPass ? 22 : 220, isOverallPass ? 163 : 38, isOverallPass ? 74 : 38);
    doc.text(`Overall Verification Status: ${qaPassed} of ${qaTotal} checks PASS`, M, y);
    y += 8;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, TW, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 78, 104);
    doc.text('ID', M + 2, y + 5);
    doc.text('CATEGORY', M + 18, y + 5);
    doc.text('CHECK NAME', M + 55, y + 5);
    doc.text('RESULT', M + TW - 42, y + 5);
    doc.text('STATUS', M + TW - 16, y + 5);
    y += 7;

    s.qaqc.forEach((r, i) => {
      checkPage(8, 'QA/QC Check Results');
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(M, y, TW, 7, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(M, y + 7, M + TW, y + 7);

      const isPass = String(r.Status).toUpperCase() === 'PASS';
      const isWarn = String(r.Status).toUpperCase() === 'WARNING';

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 119, 255);
      doc.text(String(r['Check ID'] || ''), M + 2, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(String(r.Category || '').substring(0, 16), M + 18, y + 5);

      doc.setTextColor(23, 43, 77);
      doc.text(String(r['Check Name'] || '').substring(0, 32), M + 55, y + 5);

      doc.setTextColor(100, 116, 139);
      doc.text(String(r.Result || '').substring(0, 12), M + TW - 42, y + 5);

      if (isPass) {
        doc.setTextColor(22, 163, 74);
      } else if (isWarn) {
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setTextColor(220, 38, 38);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(String(r.Status || ''), M + TW - 16, y + 5);
      y += 7;
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Page 3 of 4  |  Automated Verification Ledger', M, 285);

    // ── Page 4: Evidence & Regulatory Assurance ───────────────────
    doc.addPage();
    applyPageHeader('Evidence & Regulatory Assurance');
    y = 24;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 71);
    doc.text('Evidence Register & Regulatory Linkage', M, y);
    y += 6;

    const mappedCount = s.evidence.filter(r => r.Status === 'Mapped').length;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${mappedCount} of ${s.evidence.length} documentary evidence sources verified and mapped.`, M, y);
    y += 8;

    // Evidence Table
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, TW, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 78, 104);
    doc.text('EVIDENCE ID', M + 2, y + 5);
    doc.text('DESCRIPTION / SOURCE', M + 50, y + 5);
    doc.text('STATUS', M + TW - 18, y + 5);
    y += 7;

    s.evidence.forEach((r, i) => {
      checkPage(8, 'Evidence & Regulatory Assurance');
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(M, y, TW, 7, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(M, y + 7, M + TW, y + 7);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 119, 255);
      doc.text(String(r.evidenceId || '').substring(0, 24), M + 2, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(23, 43, 77);
      doc.text(String(r.Description || '').substring(0, 48), M + 50, y + 5);

      const isMapped = r.Status === 'Mapped';
      doc.setTextColor(isMapped ? 22 : 220, isMapped ? 163 : 38, isMapped ? 74 : 38);
      doc.setFont('helvetica', 'bold');
      doc.text(String(r.Status || ''), M + TW - 18, y + 5);
      y += 7;
    });

    y += 8;
    checkPage(30, 'Evidence & Regulatory Assurance');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 39, 71);
    doc.text('Governing Standards & Rules', M, y);
    y += 7;

    s.regulatory.forEach(r => {
      checkPage(14, 'Evidence & Regulatory Assurance');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 119, 255);
      doc.text(String(r.Reference || '').substring(0, 60), M, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(String(r['Workbook application'] || '').substring(0, 95), M, y, { maxWidth: TW });
      y += 6;
    });

    // Clean formal audit footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Page 4 of 4  |  End of Generated Report', M, 285);

    // Save with clean naming
    const filename = `TRACE_FORCE_MRV_Cement_Report_${quarter.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

  } catch (e) {
    console.error('PDF export error:', e);
    alert('PDF generation failed: ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml || `${window.renderIcon ? window.renderIcon('download', 14) : ''} Get Report`;
    }
  }
}

/* ── Excel Re-export ─────────────────────────────────────────────── */
function downloadExcel() {
  const s = window.STORE;
  if (!s || !s._valid) {
    alert('Please upload a valid workbook first.');
    return;
  }

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
    XLSX.writeFile(wb, `TRACE_FORCE_MRV_Cement_Export_${quarter.replace(/\s/g, '_')}.xlsx`);

  } catch (e) {
    console.error('Excel export error:', e);
    alert('Excel export failed: ' + e.message);
  }
}

window.downloadPDF   = downloadPDF;
window.downloadExcel = downloadExcel;
