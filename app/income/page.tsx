"use client";

import { useEffect, useState } from "react";
import { loadState, newId, saveState, type BudgetState, type Income, type PayCycle } from "../lib/storage";
import { useHydrated } from "../lib/useHydrated";
import { handleNumberArrowStep } from "../lib/numberInput";

export default function IncomePage() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [draft, setDraft] = useState<Income>({
    id: newId(),
    name: "",
    amount: 0,
    cadence: "monthly",
    payCycle: "biweekly",
    lastPaycheckDate: "",
  });

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  function addIncome() {
    const name = draft.name.trim();
    if (!name) return;
    const defaultDate = currentIso();

    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        incomes: [
          ...current.incomes,
          {
            ...draft,
            id: newId(),
            name,
            amount: Math.max(0, Number(draft.amount) || 0),
            lastPaycheckDate: draft.payCycle === "biweekly" ? defaultDate : "",
          },
        ],
      };
    });

    setDraft({
      id: newId(),
      name: "",
      amount: 0,
      cadence: "monthly",
      payCycle: "biweekly",
      lastPaycheckDate: "",
    });
  }

  function currentIso() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  function updateIncome(id: string, patch: Partial<Income>) {
    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        incomes: current.incomes.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      };
    });
  }

  if (!hydrated || !state) {
    return (
      <section className="ledgerPage">
        <header className="pageIntro collageRuled">
          <p className="kicker">Income</p>
          <h1 className="h1">Income ledger</h1>
          <p className="muted">Loading income entries...</p>
        </header>
      </section>
    );
  }

  return (
    <section className="ledgerPage">
      <header className="pageIntro collageRuled">
        <p className="kicker">Income</p>
        <h1 className="h1">Income ledger</h1>
        <p className="muted">Maintain the same three-column setup sheet across onboarding and the main income page.</p>
      </header>

      <section className="ledgerCard collageRuled">
        <div className="cardHeader">
          <h2 className="h2">Sources</h2>
          <span className="sheetCaption">Bi-weekly entries keep their current last-paycheck anchor automatically.</span>
        </div>
        <div className="ledgerTableWrap">
          <table className="ledgerTable">
            <thead>
              <tr>
                <th>Source</th>
                <th>Amount</th>
                <th>Cycle</th>
                <th className="colTight" />
              </tr>
            </thead>
            <tbody>
              {state.incomes.map((income) => (
                <tr key={income.id}>
                  <td>
                    <input className="input" value={income.name} onChange={(e) => updateIncome(income.id, { name: e.target.value })} />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={income.amount}
                      onKeyDown={handleNumberArrowStep}
                      onChange={(e) => updateIncome(income.id, { amount: Math.max(0, Number(e.target.value || 0)) })}
                    />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={income.payCycle}
                      onChange={(e) =>
                        updateIncome(income.id, {
                          payCycle: e.target.value as PayCycle,
                          lastPaycheckDate:
                            e.target.value === "biweekly" ? income.lastPaycheckDate || currentIso() : "",
                        })
                      }
                    >
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="semimonthly">Semi-Monthly</option>
                    </select>
                  </td>
                  <td className="colTight">
                    <button
                      className="button ghost deleteButton"
                      type="button"
                      aria-label={`Delete ${income.name}`}
                      onClick={() =>
                        setState((current) =>
                          current
                            ? {
                                ...current,
                                incomes: current.incomes.filter((item) => item.id !== income.id),
                              }
                            : current,
                        )
                      }
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
                    placeholder="+ Add new source..."
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
                    value={draft.payCycle}
                    onChange={(e) => setDraft((current) => ({ ...current, payCycle: e.target.value as PayCycle }))}
                  >
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="semimonthly">Semi-Monthly</option>
                  </select>
                </td>
                <td className="colTight">
                  <button className="button" type="button" onClick={addIncome}>
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
