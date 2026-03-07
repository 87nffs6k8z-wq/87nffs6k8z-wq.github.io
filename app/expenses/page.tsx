"use client";

import { useEffect, useMemo, useState } from "react";
import { RecurringExpenseForm } from "../components/RecurringExpenseForm";
import { RecurringExpenseList } from "../components/RecurringExpenseList";
import { loadState, saveState, type BudgetState } from "../lib/storage";
import { money } from "../lib/currency";
import { annualMonthlySetAside } from "../lib/annualSetAside";
import { useHydrated } from "../lib/useHydrated";

export default function ExpensesPage() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const totals = useMemo(() => {
    if (!state) return { monthly: 0, annual: 0, annualMonthlyBudgeted: 0 };
    const monthly = state.recurringExpenses
      .filter((e) => e.cadence === "monthly")
      .reduce((sum, e) => sum + e.amount, 0);
    const annualItems = state.recurringExpenses.filter((e) => e.cadence === "annual");
    const annual = annualItems.reduce((sum, e) => sum + e.amount, 0);
    const annualMonthlyBudgeted = annualItems.reduce((sum, e) => sum + annualMonthlySetAside(e.amount, e.dueMonth), 0);
    return { monthly, annual, annualMonthlyBudgeted };
  }, [state]);

  if (!hydrated || !state) {
    return (
      <section className="stack">
        <header className="pageHeader">
          <h1 className="h1">Expenses</h1>
          <p className="muted">Loading…</p>
        </header>
        <div className="card" aria-busy="true">
          <p className="muted">Preparing expenses…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <header className="pageHeader">
        <h1 className="h1">Expenses</h1>
        <p className="muted">Track recurring expenses like rent or annual fees. Saved locally in this browser.</p>
      </header>

      {showForm ? (
        <RecurringExpenseForm
          onAdd={(exp) => {
            setState((s) => {
              if (!s) return s;
              return {
                ...s,
                recurringExpenses: [exp, ...s.recurringExpenses],
              };
            });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="card">
            <div className="cardHeader">
              <h2 className="h2" style={{ margin: 0 }}>
                Summary
              </h2>
              <button className="button" type="button" onClick={() => setShowForm(true)}>
                Add Expense
              </button>
            </div>
          </div>

          <div className="cards">
            <article className="card" aria-label="Monthly total">
              <p className="kicker">Monthly</p>
              <p className="stat">{money(totals.monthly)}</p>
            </article>
            <article className="card" aria-label="Annual total">
              <p className="kicker">Annual</p>
              <p className="stat">{money(totals.annual)}</p>
            </article>
            <article className="card" aria-label="Monthly equivalent">
              <p className="kicker">Monthly Equivalent</p>
              <p className="stat">{money(totals.monthly + totals.annualMonthlyBudgeted)}</p>
              <p className="hint">Monthly recurring plus annual set-asides based on next due month.</p>
            </article>
          </div>
        </>
      )}

      <RecurringExpenseList
        items={state.recurringExpenses}
        onDelete={(id) =>
          setState((s) => {
            if (!s) return s;
            return {
              ...s,
              recurringExpenses: s.recurringExpenses.filter((e) => e.id !== id),
            };
          })
        }
      />
    </section>
  );
}
