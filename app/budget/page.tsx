"use client";

import { useEffect, useMemo, useState } from "react";
import { loadState, newId, saveState, type BudgetState } from "../lib/storage";
import { useHydrated } from "../lib/useHydrated";
import { handleNumberArrowStep } from "../lib/numberInput";
import { money } from "../lib/currency";

type LedgerBudgetRow = {
  id: string;
  name: string;
  mode: "percent" | "fixed";
  value: number;
};

function deriveRows(state: BudgetState): LedgerBudgetRow[] {
  const percentRows = state.budgetCategories.map((item) => ({
    id: item.id,
    name: item.name,
    mode: "percent" as const,
    value: item.percent,
  }));
  const fixedRows = state.allocations
    .filter((item) => item.mode === "fixed")
    .map((item) => ({ id: item.id, name: item.name, mode: "fixed" as const, value: item.value }));
  return [...percentRows, ...fixedRows];
}

function applyRows(state: BudgetState, rows: LedgerBudgetRow[]) {
  return {
    ...state,
    budgetCategories: rows
      .filter((item) => item.mode === "percent")
      .map((item) => ({ id: item.id, name: item.name, percent: Math.max(0, item.value) })),
    allocations: rows
      .filter((item) => item.mode === "fixed")
      .map((item) => ({ id: item.id, name: item.name, mode: "fixed" as const, value: Math.max(0, item.value) })),
  };
}

export default function BudgetPage() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [draft, setDraft] = useState<LedgerBudgetRow>({ id: newId(), name: "", mode: "percent", value: 0 });

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const rows = useMemo(() => (state ? deriveRows(state) : []), [state]);
  const percentTotal = rows.filter((item) => item.mode === "percent").reduce((sum, item) => sum + item.value, 0);
  const fixedTotal = rows.filter((item) => item.mode === "fixed").reduce((sum, item) => sum + item.value, 0);

  function commit(nextRows: LedgerBudgetRow[]) {
    setState((current) => {
      if (!current) return current;
      return applyRows(current, nextRows);
    });
  }

  function updateRow(id: string, patch: Partial<LedgerBudgetRow>) {
    commit(rows.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addRow() {
    const name = draft.name.trim();
    if (!name) return;
    commit([...rows, { ...draft, id: newId(), name, value: Math.max(0, Number(draft.value) || 0) }]);
    setDraft({ id: newId(), name: "", mode: "percent", value: 0 });
  }

  if (!hydrated || !state) {
    return (
      <section className="ledgerPage">
        <header className="pageIntro collageRuled">
          <p className="kicker">Budget</p>
          <h1 className="h1">Budget ledger</h1>
          <p className="muted">Loading budget categories...</p>
        </header>
      </section>
    );
  }

  return (
    <section className="ledgerPage">
      <header className="pageIntro collageRuled">
        <p className="kicker">Budget</p>
        <h1 className="h1">Budget ledger</h1>
        <p className="muted">Percentage and fixed plans now live in one ruled table that mirrors onboarding step three.</p>
      </header>

      <section className="dashboardStats">
        <article className="statCard collageRuled">
          <p className="statLabel">Percent Planned</p>
          <p className="stat">{percentTotal.toFixed(0)}%</p>
        </article>
        <article className="statCard collageRuled">
          <p className="statLabel">Fixed Planned</p>
          <p className="stat">{money(fixedTotal)}</p>
        </article>
        <article className="statCard collageRuled">
          <p className="statLabel">Status</p>
          <p className="stat">{percentTotal <= 100 ? "In Balance" : "Overdrawn"}</p>
        </article>
      </section>

      <section className="ledgerCard collageRuled">
        <div className="cardHeader">
          <h2 className="h2">Budget entries</h2>
          <span className="sheetCaption">Use Percent or Fixed $ exactly as in onboarding.</span>
        </div>
        <div className="ledgerTableWrap">
          <table className="ledgerTable">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Value</th>
                <th className="colTight" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input className="input" value={row.name} onChange={(e) => updateRow(row.id, { name: e.target.value })} />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={row.mode}
                      onChange={(e) => updateRow(row.id, { mode: e.target.value === "fixed" ? "fixed" : "percent" })}
                    >
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={row.value}
                      onKeyDown={handleNumberArrowStep}
                      onChange={(e) => updateRow(row.id, { value: Math.max(0, Number(e.target.value || 0)) })}
                    />
                  </td>
                  <td className="colTight">
                    <button
                      className="button ghost deleteButton"
                      type="button"
                      aria-label={`Delete ${row.name}`}
                      onClick={() => commit(rows.filter((item) => item.id !== row.id))}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    className="input"
                    placeholder="+ Add new category..."
                    value={draft.name}
                    onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={draft.mode}
                    onChange={(e) => setDraft((current) => ({ ...current, mode: e.target.value === "fixed" ? "fixed" : "percent" }))}
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed $</option>
                  </select>
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={draft.value}
                    onKeyDown={handleNumberArrowStep}
                    onChange={(e) => setDraft((current) => ({ ...current, value: Math.max(0, Number(e.target.value || 0)) }))}
                  />
                </td>
                <td className="colTight">
                  <button className="button" type="button" onClick={addRow}>
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
