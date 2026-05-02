"use client";

import { useEffect, useMemo, useState } from "react";
import { loadState, newId, saveState, type BudgetState, type OnboardingExpense } from "../lib/storage";
import { useHydrated } from "../lib/useHydrated";
import { handleNumberArrowStep } from "../lib/numberInput";
import { money } from "../lib/currency";
import { annualMonthlySetAside } from "../lib/annualSetAside";

function syncRecurringExpenses(state: BudgetState, expenses: OnboardingExpense[]) {
  const annualItems = state.recurringExpenses.filter((item) => item.cadence === "annual");
  const monthlyItems = expenses
    .filter((item) => item.frequency === "monthly")
    .map((item, index) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      cadence: "monthly" as const,
      dueDay: index % 2 === 0 ? 1 : 16,
    }));

  return {
    ...state,
    expenses,
    recurringExpenses: [...annualItems, ...monthlyItems],
  };
}

export default function ExpensesPage() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [draft, setDraft] = useState<OnboardingExpense>({
    id: newId(),
    name: "",
    amount: 0,
    frequency: "monthly",
  });

  useEffect(() => {
    if (!hydrated) return;
    const loaded = loadState();
    if (loaded.expenses.length === 0 && loaded.recurringExpenses.some((item) => item.cadence === "monthly")) {
      const derivedExpenses = loaded.recurringExpenses
        .filter((item) => item.cadence === "monthly")
        .map((item) => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          frequency: "monthly" as const,
        }));
      setState(syncRecurringExpenses(loaded, derivedExpenses));
      return;
    }
    setState(loaded);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const totals = useMemo(() => {
    if (!state) return { monthly: 0, perPaycheck: 0, annualSetAside: 0, monthlyIncome: 0 };
    const monthly = state.expenses.filter((item) => item.frequency === "monthly").reduce((sum, item) => sum + item.amount, 0);
    const perPaycheck = state.expenses.filter((item) => item.frequency === "per-paycheck").reduce((sum, item) => sum + item.amount, 0);
    const annualSetAside = state.recurringExpenses
      .filter((item) => item.cadence === "annual")
      .reduce((sum, item) => sum + annualMonthlySetAside(item.amount, item.dueMonth), 0);
    const monthlyIncome =
      state.incomes.reduce(
        (sum, item) => sum + (item.payCycle === "biweekly" ? (item.amount * 26) / 12 : (item.amount * 24) / 12),
        0,
      ) || state.incomeMonthly;
    return { monthly, perPaycheck, annualSetAside, monthlyIncome };
  }, [state]);

  const balanced = totals.monthlyIncome >= totals.monthly + totals.perPaycheck * 2 + totals.annualSetAside;

  function commitExpenses(nextExpenses: OnboardingExpense[]) {
    setState((current) => {
      if (!current) return current;
      return syncRecurringExpenses(current, nextExpenses);
    });
  }

  function addExpense() {
    const name = draft.name.trim();
    if (!name) return;
    commitExpenses([
      ...(state?.expenses ?? []),
      {
        ...draft,
        id: newId(),
        name,
        amount: Math.max(0, Number(draft.amount) || 0),
      },
    ]);
    setDraft({ id: newId(), name: "", amount: 0, frequency: "monthly" });
  }

  if (!hydrated || !state) {
    return (
      <section className="ledgerPage">
        <header className="pageIntro collageRuled">
          <p className="kicker">Expenses</p>
          <h1 className="h1">Expense notations</h1>
          <p className="muted">Loading the ruled bill register...</p>
        </header>
      </section>
    );
  }

  return (
    <section className="ledgerPage">
      <header className="pageIntro collageRuled">
        <p className="kicker">Expenses</p>
        <h1 className="h1">Expense notations</h1>
        <p className="muted">Track each recurring notation in the same ruled table used during onboarding.</p>
      </header>

      <section className="dashboardStats">
        <article className="statCard collageRuled">
          <p className="statLabel">Monthly Bills</p>
          <p className="stat">{money(totals.monthly)}</p>
        </article>
        <article className="statCard collageRuled">
          <p className="statLabel">Per Paycheck</p>
          <p className="stat">{money(totals.perPaycheck)}</p>
        </article>
        <article className="statCard collageRuled">
          <p className="statLabel">Monthly Cushion</p>
          <p className="stat">{money(totals.monthlyIncome - (totals.monthly + totals.perPaycheck * 2 + totals.annualSetAside))}</p>
        </article>
      </section>

      <section className="ledgerCard collageRuled">
        {balanced ? <div className="stamp">Audited</div> : null}
        <div className="cardHeader">
          <h2 className="h2">Expense ledger</h2>
          <span className="sheetCaption">Balanced stamp appears when projected monthly income covers current obligations.</span>
        </div>
        <div className="ledgerTableWrap">
          <table className="ledgerTable">
            <thead>
              <tr>
                <th>Notation</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th className="colTight" />
              </tr>
            </thead>
            <tbody>
              {state.expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <input
                      className="input"
                      value={expense.name}
                      onChange={(e) =>
                        commitExpenses(
                          state.expenses.map((item) => (item.id === expense.id ? { ...item, name: e.target.value } : item)),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={expense.amount}
                      onKeyDown={handleNumberArrowStep}
                      onChange={(e) =>
                        commitExpenses(
                          state.expenses.map((item) =>
                            item.id === expense.id ? { ...item, amount: Math.max(0, Number(e.target.value || 0)) } : item,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={expense.frequency}
                      onChange={(e) =>
                        commitExpenses(
                          state.expenses.map((item) =>
                            item.id === expense.id
                              ? { ...item, frequency: e.target.value === "per-paycheck" ? "per-paycheck" : "monthly" }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="monthly">Monthly</option>
                      <option value="per-paycheck">Per paycheck</option>
                    </select>
                  </td>
                  <td className="colTight">
                    <button
                      className="button ghost deleteButton"
                      type="button"
                      aria-label={`Delete ${expense.name}`}
                      onClick={() => commitExpenses(state.expenses.filter((item) => item.id !== expense.id))}
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
                    placeholder="+ Add new notation..."
                    value={draft.name}
                    onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={draft.amount}
                    onKeyDown={handleNumberArrowStep}
                    onChange={(e) => setDraft((current) => ({ ...current, amount: Math.max(0, Number(e.target.value || 0)) }))}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={draft.frequency}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        frequency: e.target.value === "per-paycheck" ? "per-paycheck" : "monthly",
                      }))
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="per-paycheck">Per paycheck</option>
                  </select>
                </td>
                <td className="colTight">
                  <button className="button" type="button" onClick={addExpense}>
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
