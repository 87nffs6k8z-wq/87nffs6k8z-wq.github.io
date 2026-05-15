"use client";

import { useEffect, useState } from "react";
import { loadState, newId, saveState, type BudgetState, type Income, type PayCycle } from "../lib/storage";
import { useHydrated } from "../lib/useHydrated";
import { todayISO, monthlyIncomeOf } from "../lib/month";
import { UndoToast, type UndoEntry } from "../components/UndoToast";
import { SavedIndicator, useSavedIndicator } from "../components/SavedIndicator";
import { moneyFmt } from "../lib/currency";

export default function IncomePage() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    amount: string;
    payCycle: PayCycle;
    lastPaycheckDate: string;
  }>({
    name: "",
    amount: "",
    payCycle: "biweekly",
    lastPaycheckDate: todayISO(),
  });
  const [attempted, setAttempted] = useState(false);
  const [undo, setUndo] = useState<UndoEntry | null>(null);
  const saved = useSavedIndicator();

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  function update(id: string, patch: Partial<Income>) {
    setState((s) => s ? { ...s, incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)) } : s);
    saved.flash();
  }

  function remove(id: string) {
    setState((s) => {
      if (!s) return s;
      const target = s.incomes.find((i) => i.id === id);
      if (!target) return s;
      setUndo({
        id,
        message: `Deleted ${target.name || "income"}`,
        onUndo: () => {
          setState((cur) => cur ? { ...cur, incomes: [...cur.incomes, target] } : cur);
          saved.flash();
        },
      });
      return { ...s, incomes: s.incomes.filter((i) => i.id !== id) };
    });
  }

  const parsedAmount = Number(draft.amount.replace(/[^0-9.]/g, ""));
  const nameError = !draft.name.trim() ? "Required" : null;
  const amountError = !(parsedAmount > 0) ? "Must be more than 0" : null;
  const dateError = draft.payCycle === "biweekly" && !draft.lastPaycheckDate ? "Pick a paycheck date" : null;
  const canAdd = !nameError && !amountError && !dateError;

  function add() {
    if (!canAdd) {
      setAttempted(true);
      return;
    }
    const name = draft.name.trim();
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        incomes: [
          ...s.incomes,
          {
            id: newId(),
            name,
            amount: Math.max(0, parsedAmount),
            cadence: "monthly" as const,
            payCycle: draft.payCycle,
            lastPaycheckDate: draft.payCycle === "biweekly" ? draft.lastPaycheckDate || todayISO() : "",
          },
        ],
      };
    });
    setDraft({ name: "", amount: "", payCycle: "biweekly", lastPaycheckDate: todayISO() });
    setAttempted(false);
    saved.flash();
  }

  if (!hydrated || !state) {
    return (
      <section className="container" aria-busy="true">
        <header className="sheet page-head">
          <p className="kicker">Income</p>
          <h1 className="page-head__title">Income ledger</h1>
          <p className="page-head__lead">Loading income entries…</p>
        </header>
        <div className="sheet" style={{ padding: "20px 28px" }} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton skeleton--row" />
          ))}
        </div>
      </section>
    );
  }

  const monthly = monthlyIncomeOf(state);
  const annual = monthly * 12;
  const biweeklyCount = state.incomes.filter((i) => i.payCycle === "biweekly").length;
  const semiCount = state.incomes.filter((i) => i.payCycle === "semimonthly").length;

  return (
    <section className="container">
      {/* Page head */}
      <header className="sheet page-head">
        <p className="kicker">Income</p>
        <h1 className="page-head__title">Income ledger</h1>
        <p className="page-head__lead">Track all your income sources. Each one's paycheck dates are calculated independently and feed into your period breakdown.</p>
      </header>

      {/* Stats row */}
      <div className="stat-row">
        <article className="sheet stat" style={{ padding: "16px 22px 18px" }}>
          <div className="stat__label">Monthly income</div>
          <div className="stat__value">{moneyFmt(monthly)}</div>
        </article>
        <article className="sheet stat" style={{ padding: "16px 22px 18px" }}>
          <div className="stat__label">Bi-weekly sources</div>
          <div className="stat__value">{biweeklyCount}</div>
        </article>
        <article className="sheet stat" style={{ padding: "16px 22px 18px" }}>
          <div className="stat__label">Semi-monthly sources</div>
          <div className="stat__value">{semiCount}</div>
        </article>
      </div>

      {/* Ledger table */}
      <div className="sheet" style={{ paddingTop: "20px", paddingBottom: 0 }}>
        <div style={{ padding: "0 28px" }} className="row-between mb-3">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p className="kicker">Sources</p>
              <h2 className="section-title">All inflow lines</h2>
            </div>
            <SavedIndicator visible={saved.visible} />
          </div>
          <span className="badge">{state.incomes.length} sources</span>
        </div>

        <div className="ledger-table-wrap-no-line" style={{ borderRadius: "0 0 0 0" }}>
          <table className="ledger-table ledger-table--responsive">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Source</th>
                <th className="text-right" style={{ width: "20%" }}>Amount</th>
                <th style={{ width: "20%" }}>Cycle</th>
                <th style={{ width: "25%" }}>Anchor / Days</th>
                <th className="text-tight" />
              </tr>
            </thead>
            <tbody>
              {state.incomes.map((inc) => (
                <tr key={inc.id}>
                  <td data-label="Source">
                    <input
                      className="input"
                      value={inc.name}
                      aria-label="Income source name"
                      onChange={(e) => update(inc.id, { name: e.target.value })}
                    />
                  </td>
                  <td className="text-right mono" data-label="Amount">
                    <input
                      className="input input--mono"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.]*"
                      value={inc.amount}
                      style={{ textAlign: "right" }}
                      aria-label="Income amount"
                      onChange={(e) =>
                        update(inc.id, { amount: Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, "")) || 0) })
                      }
                    />
                  </td>
                  <td data-label="Cycle">
                    <select
                      className="select"
                      value={inc.payCycle}
                      aria-label="Pay cycle"
                      onChange={(e) =>
                        update(inc.id, {
                          payCycle: e.target.value as PayCycle,
                          lastPaycheckDate: e.target.value === "biweekly" ? inc.lastPaycheckDate || todayISO() : "",
                        })
                      }
                    >
                      <option value="biweekly">Bi-weekly</option>
                      <option value="semimonthly">Semi-monthly</option>
                    </select>
                  </td>
                  <td data-label="Anchor">
                    {inc.payCycle === "biweekly" ? (
                      <input
                        className="input"
                        type="date"
                        value={inc.lastPaycheckDate || ""}
                        aria-label="Last paycheck date"
                        onChange={(e) => update(inc.id, { lastPaycheckDate: e.target.value })}
                      />
                    ) : (
                      <span className="muted" style={{ fontStyle: "italic" }}>1st &amp; 15th</span>
                    )}
                  </td>
                  <td className="text-tight">
                    <button
                      className="btn btn--icon"
                      type="button"
                      aria-label={`Delete ${inc.name || "income"}`}
                      onClick={() => remove(inc.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inline add form */}
        <div className={`inline-form${draft.payCycle === "biweekly" ? " inline-form--4col" : ""}`}>
          <div className={`field${attempted && nameError ? " field--has-error" : ""}`}>
            <label className="field__label" htmlFor="inc-draft-name">New source</label>
            <input
              id="inc-draft-name"
              className="input"
              placeholder="e.g. Day job"
              value={draft.name}
              aria-invalid={attempted && !!nameError}
              aria-describedby={attempted && nameError ? "inc-draft-name-err" : undefined}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
            {attempted && nameError && (
              <span id="inc-draft-name-err" className="field__error">{nameError}</span>
            )}
          </div>
          <div className={`field${attempted && amountError ? " field--has-error" : ""}`}>
            <label className="field__label" htmlFor="inc-draft-amount">Amount</label>
            <input
              id="inc-draft-amount"
              className="input input--mono"
              type="text"
              inputMode="decimal"
              pattern="[0-9.]*"
              placeholder="0"
              value={draft.amount}
              aria-invalid={attempted && !!amountError}
              aria-describedby={attempted && amountError ? "inc-draft-amount-err" : undefined}
              onChange={(e) =>
                setDraft((d) => ({ ...d, amount: e.target.value.replace(/[^0-9.]/g, "") }))
              }
            />
            {attempted && amountError && (
              <span id="inc-draft-amount-err" className="field__error">{amountError}</span>
            )}
          </div>
          <div className="field">
            <label className="field__label">Cycle</label>
            <select
              className="select"
              value={draft.payCycle}
              onChange={(e) => setDraft((d) => ({ ...d, payCycle: e.target.value as PayCycle }))}
            >
              <option value="biweekly">Bi-weekly</option>
              <option value="semimonthly">Semi-monthly</option>
            </select>
          </div>
          {draft.payCycle === "biweekly" && (
            <div className={`field${attempted && dateError ? " field--has-error" : ""}`}>
              <label className="field__label" htmlFor="inc-draft-date">Last paycheck</label>
              <input
                id="inc-draft-date"
                className="input"
                type="date"
                value={draft.lastPaycheckDate}
                aria-invalid={attempted && !!dateError}
                aria-describedby={attempted && dateError ? "inc-draft-date-err" : undefined}
                onChange={(e) => setDraft((d) => ({ ...d, lastPaycheckDate: e.target.value }))}
              />
              {attempted && dateError && (
                <span id="inc-draft-date-err" className="field__error">{dateError}</span>
              )}
            </div>
          )}
          <button className="btn" type="button" onClick={add}>
            Add source
          </button>
        </div>
      </div>
      <UndoToast entry={undo} onDismiss={() => setUndo(null)} />
    </section>
  );
}
