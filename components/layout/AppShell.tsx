"use client";

import type { ReactNode } from "react";
import { useStore } from "@/context/StoreContext";
import { ExplainerModal } from "@/components/ui/ExplainerModal";
import { UploadPrompt } from "@/components/ui/UploadPrompt";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const { collapsed, handleFile } = useStore();

  return (
    <div
      id="app-shell"
      className={collapsed ? "collapsed" : undefined}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xlsm"))) {
          handleFile(file);
        }
      }}
    >
      <Sidebar />
      <Topbar />
      <main id="content" role="main" aria-live="polite">
        {children}
      </main>
      <Footer />
      <UploadPrompt />
      <ExplainerModal />
    </div>
  );
}
