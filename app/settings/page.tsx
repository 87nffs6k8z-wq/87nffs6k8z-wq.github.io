"use client";

import { ChangeEvent, useState } from "react";
import { clearBudget, loadBudget, saveBudget, type BudgetState } from "../lib/budgetStorage";
import { loadState } from "../lib/storage";

function localDateStamp(now: Date) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function SettingsPage() {
  const [status, setStatus] = useState("");

  const exportData = () => {
    const state = loadBudget() ?? loadState();
    const now = new Date();
    const payload = {
      app: "Neo Budget",
      format: "budgetApp:v1",
      exportedAt: now.toISOString(),
      budgetAppV1: state,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neo-budget-export-${localDateStamp(now)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Export complete.");
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const incoming =
        typeof parsed === "object" && parsed !== null && "budgetAppV1" in parsed
          ? (parsed as { budgetAppV1?: unknown }).budgetAppV1
          : parsed;

      if (!incoming || typeof incoming !== "object") {
        setStatus("Import failed: invalid budget file.");
        return;
      }

      saveBudget(incoming as BudgetState);
      setStatus("Import complete. Reloading...");
      setTimeout(() => window.location.reload(), 300);
    } catch {
      setStatus("Import failed: invalid JSON.");
    } finally {
      event.target.value = "";
    }
  };

  const resetOnboarding = () => {
    const confirmed = window.confirm("Reset all local budget data and start onboarding again?");
    if (!confirmed) return;

    clearBudget();
    window.location.href = "/onboarding";
  };

  return (
    <section className="stack">
      <header className="pageHeader">
        <h1 className="h1">Settings</h1>
        <p className="muted">Manage data transfer and onboarding tools.</p>
      </header>

      <div className="card settingsCard">
        <h2 className="h2">Backup and Restore</h2>
        <p className="muted">Export your current budget data or import a saved JSON backup.</p>
        <div className="row settingsActions" style={{ marginTop: 12 }}>
          <button className="button" type="button" onClick={exportData}>
            Export JSON
          </button>
          <label className="button ghost" style={{ cursor: "pointer" }}>
            Import JSON
            <input type="file" accept="application/json,.json" onChange={importData} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      <div className="card settingsCard">
        <h2 className="h2">Onboarding</h2>
        <p className="muted">Need to start setup again? This clears local data and reopens first-run setup.</p>
        <div className="row settingsActions" style={{ marginTop: 12 }}>
          <button className="button ghost dangerBtn" type="button" onClick={resetOnboarding}>
            Reset Onboarding
          </button>
        </div>
      </div>

      {status ? (
        <p className="muted" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
