"use client";

import { Icon } from "@/components/icons/Icon";
import { useStore } from "@/context/StoreContext";

export function UploadPrompt() {
  const { store, handleFile } = useStore();
  if (store) return null;

  return (
    <div id="upload-prompt" style={{ display: "flex" }}>
      <div className="upload-card">
        <div className="uc-logo-mark">
          <Icon name="bar-chart-2" size={32} />
        </div>
        <h2>Welcome to TRACE FORCE MRV</h2>
        <p>
          Drop your cement plant workbook here and we&apos;ll take care of the rest — parsing all 14 sheets, running
          QA/QC checks, and building your compliance dashboard automatically.
        </p>
        <label className="btn btn-primary" htmlFor="file-input-modal" style={{ cursor: "pointer", fontSize: 13, padding: "10px 22px" }}>
          <Icon name="upload" size={16} /> Choose your workbook (.xlsx)
        </label>
        <input
          type="file"
          id="file-input-modal"
          accept=".xlsx,.xlsm"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--text-muted)" }}>or drag & drop anywhere on this page</div>
        <div className="uc-steps">
          <div className="uc-step">
            <span className="uc-step-num">1</span>
            <span>Upload workbook</span>
          </div>
          <div className="uc-step-arrow">
            <Icon name="chevron-right" size={13} />
          </div>
          <div className="uc-step">
            <span className="uc-step-num">2</span>
            <span>Auto-parse & validate</span>
          </div>
          <div className="uc-step-arrow">
            <Icon name="chevron-right" size={13} />
          </div>
          <div className="uc-step">
            <span className="uc-step-num">3</span>
            <span>Explore dashboard</span>
          </div>
        </div>
        <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          Supports: <strong style={{ color: "var(--text-secondary)" }}>TRACE_FORCE_MRV_Cement_QAQC_V28_Collection_Workbook</strong>
        </div>
      </div>
    </div>
  );
}
