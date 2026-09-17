# TRACE FORCE MRV — Cement QA/QC Analytics Platform

A production-grade MRV (Measurement, Reporting, and Verification) and QA/QC analytics dashboard tailored for the cement manufacturing industry. Built to ingest, parse, validate, and visualize cement plant activity data and greenhouse gas emissions in full compliance with international MRV standards (ISO 14064, GCCA / CSI protocol, and national regulatory postures).

---

## 🚀 Key Features

- **Dynamic Excel Ingestion**: Accepts standard MRV collection workbooks (14 sheets) and dynamically extracts, validates, and models the dataset on client-side upload.
- **Single Source of Truth**: Zero hardcoded values; all metrics, factors, and emissions are dynamically calculated from activity data and verified constants.
- **Comprehensive Quality Assurance**: 18 automated QA/QC check rules spanning:
  - Mass Balance (clinker, cement, raw materials)
  - Emission Intensities (SEE Clinker, SEE Cement)
  - Thermal Energy & Specific Heat Consumption
  - Thermal Substitution Rate (TSR) & Biogenic Carbon Fractions
  - Grid Electricity and Transmission & Distribution Losses
  - Completeness, Evidence Readiness, and Period Locking
- **Interactive Analytics**:
  - Direct vs. Indirect emissions breakdown
  - Fuel energy consumption and alternative fuel substitution
  - Specific emissions benchmarks and regulatory range gauges
- **Audit Traceability**: Every displayed calculation shows its underlying mathematical formula, parameter values, units, and source workbook location.
- **Reporting & Compliance**: Built-in export tools supporting PDF compliance reports and dynamic Excel re-export.
- **Zero-Server Client Architecture**: Operates directly in standard web browsers using vanilla HTML5, CSS3, and JavaScript with CDN-backed visualization engines.

---

## 📁 Project Structure

```text
EGYTRACE/
├── index.html                   # Main application shell and UI layout
├── css/
│   ├── main.css                 # Design system tokens, dark navy theme, typography
│   ├── components.css           # Cards, KPI badges, data tables, modals, upload zone
│   └── print.css                # Print and PDF report formatting rules
├── js/
│   ├── app.js                   # Application coordinator, routing, layout events
│   ├── charts.js                # Chart.js 4 chart renderers (donuts, bars, gauges)
│   ├── export.js                # PDF and Excel reporting utilities
│   ├── formatter.js             # Internationalized number, unit, and date formatters
│   ├── parser.js                # SheetJS multi-sheet parsing & schema validation
│   ├── store.js                 # Central reactive data model & state management
│   └── pages/                   # Module-specific page renderers
│       ├── analytics_dashboard.js  # Interactive analytics charts & gauges
│       ├── calculations.js         # Comprehensive MRV calculation tables
│       ├── constants.js            # Emission factors & NCV reference tables
│       ├── dcs_boundary.js         # Facility DCS boundaries & metering points
│       ├── electricity.js          # Scope 2 grid & generation calculations
│       ├── evidence.js             # Audit readiness & evidence document index
│       ├── governance.js           # Roles, signatories & data collection protocol
│       ├── kiln_fuel.js            # Thermal energy & fuel activity tables
│       ├── overview.js             # Executive summary & high-level KPIs
│       ├── production.js           # Clinker & cement production mass balances
│       ├── qaqc.js                 # 18 QA/QC rule evaluation engine
│       ├── raw_material.js         # Raw meal & calcination inputs
│       ├── regulatory.js           # Posture, thresholds & legal compliance notes
│       ├── report_outputs.js       # Structured regulatory output schedules
│       └── setup.js                # Reporting period, plant ID & baseline config
├── .gitignore                   # Ignore binary executables, raw sheets, & temp files
└── README.md                    # Project documentation
```

---

## 🛠️ Getting Started

### Direct Browser Access
No Node.js or web server required. Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari):

```bash
# Or via local static server if preferred
npx serve .
```

### Supported Data Input
Upload any schema-compatible Excel workbook (`.xlsx`, `.xlsm`) structured according to the standard TRACE FORCE MRV template containing all 14 sheets.

---

## 📜 Technology Stack

- **HTML5 & CSS3**: Vanilla CSS design system with custom CSS properties, responsive grids, and print media rules.
- **JavaScript (ES6+)**: Modular client-side architecture without heavyweight framework overhead.
- **SheetJS (xlsx 0.20.3)**: In-browser binary spreadsheet parsing.
- **Chart.js 4.4.4**: Responsive data visualizations and performance indicators.
- **jsPDF 2.5.1**: Automated client-side PDF document generation.
