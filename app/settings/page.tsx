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

  function exportData() {
    const state = loadBudget() ?? loadState();
    const now = new Date();
    const payload = {
      app: "Paper & Ink Ledger",
      format: "budgetApp:v1",
      exportedAt: now.toISOString(),
      budgetAppV1: state,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paper-ink-ledger-${localDateStamp(now)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Export complete.");
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
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
  }

  function resetOnboarding() {
    const confirmed = window.confirm("Reset all local budget data and reopen onboarding?");
    if (!confirmed) return;
    clearBudget();
    window.location.href = "/onboarding";
  }

  return (
    <section className="ledgerPage">
      <header className="pageIntro collageRuled">
        <p className="kicker">Settings</p>
        <h1 className="h1">Archive tools</h1>
        <p className="muted">Manage exports, imports, and onboarding resets without changing the local storage key.</p>
      </header>

      <section className="settingsGrid">
        <article className="settingsCard collageRuled">
          <div className="cardHeader">
            <h2 className="h2">Backup &amp; restore</h2>
            <span className="badge">budgetApp:v1</span>
          </div>
          <p className="muted">Export your ledger as JSON or import a previous archive into the same local versioned key.</p>
          <div className="settingsActions">
            <button className="button" type="button" onClick={exportData}>
              Export JSON
            </button>
            <label className="button ghost" style={{ cursor: "pointer" }}>
              Import JSON
              <input className="fileInputHidden" type="file" accept="application/json,.json" onChange={importData} />
            </label>
          </div>
        </article>

        <article className="settingsCard collageRuled">
          <div className="cardHeader">
            <h2 className="h2">Onboarding reset</h2>
            <span className="sheetCaption">Clears local data and returns to the three-step flow.</span>
          </div>
          <p className="muted">Use this only if you want to restart the ledger from a blank state on this device.</p>
          <div className="settingsActions">
            <button className="button danger" type="button" onClick={resetOnboarding}>
              Reset onboarding
            </button>
          </div>
        </article>
      </section>

      {status ? (
        <section className="ledgerCard collageRuled">
          <p className="muted" role="status">
            {status}
          </p>
        </section>
      ) : null}
    </section>
  );
}
