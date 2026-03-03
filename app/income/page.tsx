"use client";

import { useEffect, useMemo, useState } from "react";
import { useHydrated } from "../lib/useHydrated";
import { loadState, saveState, type BudgetState } from "../lib/storage";
import { IncomeForm } from "../components/IncomeForm";
import { IncomeList } from "../components/IncomeList";

export default function IncomePage() {
  const hydrated = useHydrated();

  // Render-safe initial state (server + first client paint)
  const [state, setState] = useState<BudgetState | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load real state only on the client, after mount
  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  // Save whenever state changes (client only)
  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const incomes = useMemo(() => {
    if (!state) return [];
    return state.incomes;
  }, [state]);

  if (!hydrated || !state) {
    // simple skeleton to avoid mismatch
    return (
      <section className="stack">
      <header className="pageHeader">
        <h1 className="h1">Income</h1>
        <p className="muted">Loading…</p>
      </header>
      <div className="card" aria-busy="true">
        <p className="muted">Preparing income…</p>
      </div>
    </section>
  );
  }
  return (
    <section className="stack">
      <header className="pageHeader">
        <h1 className="h1">Income</h1>
        <p className="muted">Track income sources and pay cycles. Saved locally in this browser.</p>
      </header>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2" style={{ margin: 0 }}>
            Income
          </h2>
          <button className="button" type="button" onClick={() => setShowForm(true)}>
            Add income
          </button>
        </div>
      </div>

      {showForm ? (
        <IncomeForm
          onAdd={(inc) => {
            setState((s) => {
              if (!s) return s;
              return {
                ...s,
                incomes: [inc, ...s.incomes],
              };
            });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : null}

      <IncomeList
        items={incomes}
        onDelete={(id) =>
          setState((s) => {
            if (!s) return s;
            return {
              ...s,
              incomes: s.incomes.filter((i) => i.id !== id),
            };
          })
        }
      />
    </section>
  );
}
