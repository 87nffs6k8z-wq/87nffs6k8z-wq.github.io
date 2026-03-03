"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearBudget, loadBudget, saveBudget } from "../lib/budgetStorage";
import { loadState } from "../lib/storage";

export function SiteHeader() {
  const pathname = usePathname();
  const onOnboarding = pathname === "/onboarding";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  const [transferMessage, setTransferMessage] = useState<string>("");

  const exportData = () => {
    const state = loadBudget() ?? loadState();
    const payload = {
      app: "Neo Budget",
      format: "budgetApp:v1",
      exportedAt: new Date().toISOString(),
      budgetAppV1: state,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neo-budget-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTransferMessage("Exported");
    setTimeout(() => setTransferMessage(""), 1800);
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as any;
      const incoming = parsed?.budgetAppV1 ?? parsed;
      if (!incoming || typeof incoming !== "object") {
        setTransferMessage("Import failed");
        return;
      }

      saveBudget(incoming);
      setTransferMessage("Imported");
      setTimeout(() => window.location.reload(), 300);
    } catch {
      setTransferMessage("Import failed");
    } finally {
      event.target.value = "";
      setTimeout(() => setTransferMessage(""), 1800);
    }
  };

  return (
    <header className="siteHeader">
      <a className="skipLink" href="#main">
        Skip to content
      </a>

      <div className="headerInner">
        <Link className="brand" href="/" aria-label="Home">
          <span className="brandMark" aria-hidden="true" />
          <span className="brandText">NEO BUDGET</span>
        </Link>

        <nav className="topNav" aria-label="Primary">
          <Link className={`topNavLink ${isActive("/") ? "isActive" : ""}`} href="/">
            Overview
          </Link>
          <Link className={`topNavLink ${isActive("/expenses") ? "isActive" : ""}`} href="/expenses">
            Expenses
          </Link>
          <Link className={`topNavLink ${isActive("/budget") ? "isActive" : ""}`} href="/budget">
            Budget
          </Link>
          <Link className={`topNavLink ${isActive("/income") ? "isActive" : ""}`} href="/income">
            Income
          </Link>
          {!onOnboarding ? (
            <>
              <button className="topNavIconBtn" type="button" onClick={exportData} aria-label="Export data">
                ⤓
              </button>
              <label className="topNavIconBtn" aria-label="Import data" title="Import data">
                ⤒
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={importData}
                  style={{ display: "none" }}
                />
              </label>
            </>
          ) : null}
          {!onOnboarding ? (
            <button
              className="topNavLink isDanger"
              type="button"
              onClick={() => {
                clearBudget();
                window.location.reload();
              }}
            >
              Reset onboarding
            </button>
          ) : null}
          {transferMessage ? (
            <span className="topNavTransferStatus" role="status">
              {transferMessage}
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
