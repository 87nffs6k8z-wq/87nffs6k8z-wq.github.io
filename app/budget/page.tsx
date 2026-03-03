"use client";

import { useEffect, useMemo, useState } from "react";
import { loadState, saveState, type BudgetCategory, type BudgetState, newId } from "../lib/storage";
import { useHydrated } from "../lib/useHydrated";

export default function BudgetPage() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const totals = useMemo(() => {
    if (!state) return { percent: 0, fixed: 0 };
    const percent = state.budgetCategories.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);
    const fixed = state.allocations
      .filter((item) => item.mode === "fixed")
      .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    return { percent, fixed };
  }, [state]);

  if (!hydrated || !state) {
    return (
      <section className="stack">
        <header className="pageHeader">
          <h1 className="h1">Budget</h1>
          <p className="muted">Loading…</p>
        </header>
        <div className="card" aria-busy="true">
          <p className="muted">Preparing budget…</p>
        </div>
      </section>
    );
  }

  const updateCategory = (id: string, patch: Partial<BudgetCategory>) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        budgetCategories: s.budgetCategories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      };
    });
  };

  const updatePercent = (id: string, value: number) => {
    setState((s) => {
      if (!s) return s;
      const categories = s.budgetCategories;
      const current = categories.find((c) => c.id === id);
      const currentValue = Number(current?.percent || 0);
      const total = categories.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);
      const remaining = 100 - (total - currentValue);
      const next = Math.max(0, Math.min(value, remaining));

      return {
        ...s,
        budgetCategories: categories.map((c) => (c.id === id ? { ...c, percent: next } : c)),
      };
    });
  };

  const addCategory = () => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        budgetCategories: [
          ...s.budgetCategories,
          {
            id: newId(),
            name: "New category",
            percent: 0,
          },
        ],
      };
    });
  };

  const removeCategory = (id: string) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        budgetCategories: s.budgetCategories.filter((c) => c.id !== id),
      };
    });
  };

  const fixedItems = state.allocations.filter((item) => item.mode === "fixed");

  const updateFixedItem = (id: string, patch: { name?: string; value?: number }) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        allocations: s.allocations.map((item) =>
          item.id === id && item.mode === "fixed"
            ? {
                ...item,
                ...(typeof patch.name === "string" ? { name: patch.name } : {}),
                ...(typeof patch.value === "number" ? { value: Math.max(0, patch.value) } : {}),
              }
            : item,
        ),
      };
    });
  };

  const addFixedItem = () => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        allocations: [
          ...s.allocations,
          {
            id: newId(),
            name: "One-time item",
            mode: "fixed",
            value: 0,
          },
        ],
      };
    });
  };

  const removeFixedItem = (id: string) => {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        allocations: s.allocations.filter((item) => item.id !== id),
      };
    });
  };


  return (
    <section className="stack">
      <header className="pageHeader">
        <h1 className="h1">Budget</h1>
        <p className="muted">
          Percentage categories are tracked against 100%. Fixed items are tracked separately as flat dollars per paycheck.
        </p>
      </header>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2" style={{ margin: 0 }}>
            Categories
          </h2>
          <button className="button" type="button" onClick={addCategory}>
            Add category
          </button>
        </div>

        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Item", "Percentage", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.budgetCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 12 }}>
                    <p className="muted">No categories yet. Add your first one to get started.</p>
                  </td>
                </tr>
              ) : (
                state.budgetCategories.map((c) => {
                  return (
                    <tr key={c.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
                        <input
                          className="input"
                          type="text"
                          value={c.name}
                          onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                          placeholder="Spending, Groceries, Savings…"
                        />
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid var(--line)", width: 160 }}>
                        <div className="row" style={{ alignItems: "center" }}>
                          <input
                            className="input"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={c.percent}
                            onChange={(e) => updatePercent(c.id, Number(e.target.value || 0))}
                          />
                          <span className="muted">%</span>
                        </div>
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid var(--line)", width: 1 }}>
                        <button className="button ghost" type="button" onClick={() => removeCategory(c.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: 10, borderTop: "1px solid var(--line)", fontWeight: 700 }}>Total</td>
                <td style={{ padding: 10, borderTop: "1px solid var(--line)", fontWeight: 700 }}>
                  {totals.percent.toFixed(2)}%
                </td>
                <td style={{ padding: 10, borderTop: "1px solid var(--line)" }} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2" style={{ margin: 0 }}>
            Fixed items
          </h2>
          <button className="button" type="button" onClick={addFixedItem}>
            Add fixed item
          </button>
        </div>

        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Item", "Amount", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fixedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 12 }}>
                    <p className="muted">No fixed items yet. Add one for flat dollar allocations per paycheck.</p>
                  </td>
                </tr>
              ) : (
                fixedItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
                      <input
                        className="input"
                        type="text"
                        value={item.name}
                        onChange={(e) => updateFixedItem(item.id, { name: e.target.value })}
                        placeholder="Car payment, Debt extra, One-time..."
                      />
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)", width: 180 }}>
                      <input
                        className="input"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={item.value}
                        onChange={(e) => updateFixedItem(item.id, { value: Number(e.target.value || 0) })}
                      />
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)", width: 1 }}>
                      <button className="button ghost" type="button" onClick={() => removeFixedItem(item.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: 10, borderTop: "1px solid var(--line)", fontWeight: 700 }}>Total</td>
                <td style={{ padding: 10, borderTop: "1px solid var(--line)", fontWeight: 700 }}>
                  ${totals.fixed.toFixed(2)}
                </td>
                <td style={{ padding: 10, borderTop: "1px solid var(--line)" }} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </section>
  );
}
  
