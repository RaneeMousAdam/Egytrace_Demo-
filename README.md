# TRACE FORCE MRV — Cement QA/QC Analytics Platform

A browser-based analytics platform for cement plant emissions reporting. Upload your MRV collection workbook and the platform will parse all 14 sheets, run automated quality checks, calculate emissions, and produce compliance-ready outputs — entirely in the browser, with no server required.

Built to meet the rigorous data traceability and quality standards of ISO 14064, the GCCA/CSI Cement CO2 and Energy Protocol, and EU CBAM reporting requirements.

---

## What it does

**Dynamic workbook ingestion.** Drop in a standard TRACE FORCE MRV collection workbook (.xlsx) and the platform extracts, validates, and models every field automatically. Nothing is hardcoded — every value on screen traces back to a specific cell in your workbook.

**18 automated QA/QC checks.** The platform validates mass balances, emission intensities, thermal energy, alternative fuel substitution rates, grid electricity, and evidence completeness. Problems are surfaced before they reach regulators.

**Full calculation transparency.** Every emission figure shows its formula, inputs, units, and source location. Clinker calcination, fuel combustion, Scope 2 grid electricity, specific embedded emissions (SEE), and thermal substitution rate (TSR) are all calculated from first principles.

**Compliance-ready outputs.** Generate a PDF compliance report or export a structured Excel workbook — both formatted for submission to regulatory bodies and external verifiers.

**Evidence readiness tracking.** Every data point is linked to its supporting documentation — calibration certificates, weighbridge tickets, lab reports, and invoices. The evidence register shows you exactly what is verified and what is outstanding.

---

## Getting started

Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari). No installation, no build step, no server.

If you prefer a local static server:

```bash
npx serve .
```

Then upload a schema-compatible `TRACE_FORCE_MRV_Cement_QAQC_V28_Collection_Workbook.xlsx` file using the upload button. The platform accepts any workbook that follows the standard 14-sheet template.

---

## Project structure

```
EGYTRACE/
├── index.html                   # Application shell and entry point
├── css/
│   ├── main.css                 # Design system: tokens, layout, typography, theme
│   ├── components.css           # Reusable components: cards, tables, buttons, modals
│   └── print.css                # Print and PDF formatting rules
├── js/
│   ├── app.js                   # Router, layout coordinator, upload handler
│   ├── charts.js                # Chart.js 4 wrappers (donut, bar, line, gauge)
│   ├── export.js                # PDF and Excel export utilities
│   ├── formatter.js             # Number, unit, and date formatters
│   ├── parser.js                # SheetJS workbook parser and schema validator
│   ├── store.js                 # Central data model and state
│   └── pages/
│       ├── overview.js          # Executive summary and primary KPIs
│       ├── governance.js        # Roles, signatories, and collection protocol
│       ├── setup.js             # Reporting period, plant ID, and scope
│       ├── dcs_boundary.js      # DCS/ERP/Lab data boundary and metering register
│       ├── production.js        # Clinker and cement production mass balances
│       ├── raw_material.js      # Raw meal inputs and calcination data
│       ├── kiln_fuel.js         # Kiln fuel consumption and heat input
│       ├── electricity.js       # Scope 2 grid electricity and generation
│       ├── constants.js         # Emission factors, NCV values, and QA ranges
│       ├── calculations.js      # Full MRV calculation chain with audit trail
│       ├── qaqc.js              # 18 automated QA/QC rule evaluation results
│       ├── report_outputs.js    # Structured regulatory output schedules
│       ├── evidence.js          # Audit readiness and evidence document index
│       ├── regulatory.js        # Applicable standards and compliance posture
│       └── analytics_dashboard.js  # Interactive benchmarking and trend charts
├── .gitignore
└── README.md
```

---

## Technology

- **HTML5 and CSS3** — Vanilla CSS with custom properties, responsive grid layouts, and print rules. No framework dependencies.
- **JavaScript (ES6+)** — Modular, framework-free client-side architecture.
- **SheetJS (xlsx 0.20.3)** — In-browser binary Excel parsing.
- **Chart.js 4.4.4** — Responsive charts and data visualizations.
- **jsPDF 2.5.1** — Client-side PDF report generation.

---

## Data requirements

The platform expects a workbook with these 14 sheets in the standard TRACE FORCE MRV V28 schema:

`00_README_Control`, `01_Setup_ReportingPeriod`, `02_DCS_ERP_Lab_Boundary`, `03_Production_Input`, `04_RawMaterial_Input`, `05_KilnFuel_Input`, `06_Electricity_Input`, `07_Constants_EF_NCV`, `08_Calculations`, `09_QAQC_Checks`, `10_ReportOutputs`, `11_EvidenceRegister`, `12_RegulatoryReferences`, `13_AnalyticsDashboard`

Sheets with missing or renamed columns will trigger a validation warning. The platform will display what it can parse and flag any gaps.
