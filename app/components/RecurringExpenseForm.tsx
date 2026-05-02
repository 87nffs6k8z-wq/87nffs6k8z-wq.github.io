"use client";

import { useMemo, useState } from "react";
import { newId, type RecurringExpense } from "../lib/storage";
import { handleNumberArrowStep } from "../lib/numberInput";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function RecurringExpenseForm({
  onAdd,
  onCancel,
}: {
  onAdd: (e: RecurringExpense) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [cadence, setCadence] = useState<"monthly" | "annual">("monthly");
  const [dueDay, setDueDay] = useState<string>("1");
  const [dueMonth, setDueMonth] = useState<string>("1");

  const amountNumber = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const dueDayNumber = useMemo(() => {
    const n = Number(dueDay);
    return Number.isFinite(n) ? n : NaN;
  }, [dueDay]);

  const dueMonthNumber = useMemo(() => {
    const n = Number(dueMonth);
    return Number.isFinite(n) ? n : NaN;
  }, [dueMonth]);

  const cadenceOk =
    cadence === "monthly"
      ? dueDayNumber >= 1 && dueDayNumber <= 31
      : dueMonthNumber >= 1 && dueMonthNumber <= 12;

  const canSubmit = name.trim().length > 0 && amountNumber > 0 && cadenceOk;

  function submit() {
    if (!canSubmit) return;
    const base: RecurringExpense = {
      id: newId(),
      name: name.trim(),
      amount: Number(amountNumber.toFixed(2)),
      cadence,
    };

    const withDue =
      cadence === "monthly"
        ? { ...base, dueDay: Math.round(dueDayNumber) }
        : { ...base, dueMonth: Math.round(dueMonthNumber) };

    onAdd(withDue);
    setName("");
    setAmount("");
  }

  return (
    <div className="card">
      <h2 className="h2">Add Expense</h2>
      <div className="row sectionActions">
        <button className="button ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="form" aria-label="Add recurring expense form">
        <div className="field">
          <label className="label" htmlFor="recurring-name">
            Name
          </label>
          <input
            className="input"
            id="recurring-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rent, Insurance, Internet..."
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="recurring-amount">
            Amount
          </label>
          <input
            className="input"
            id="recurring-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={amount}
            onKeyDown={handleNumberArrowStep}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            aria-describedby="recurringAmountHint"
          />
          <p className="hint" id="recurringAmountHint">
            Use positive numbers (e.g., 120.00).
          </p>
        </div>

        <div className="field">
          <label className="label" htmlFor="recurring-cadence">
            Frequency
          </label>
          <select
            className="input"
            id="recurring-cadence"
            value={cadence}
            onChange={(e) => setCadence(e.target.value as "monthly" | "annual")}
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        {cadence === "monthly" ? (
          <div className="field">
            <label className="label" htmlFor="recurring-due-day">
              Due Day (1-31)
            </label>
            <input
              className="input"
              id="recurring-due-day"
              type="number"
              min="1"
              max="31"
              step="1"
              value={dueDay}
              onKeyDown={handleNumberArrowStep}
              onChange={(e) => setDueDay(e.target.value)}
              aria-describedby="recurringDueDayHint"
            />
            <p className="hint" id="recurringDueDayHint">
              The day of the month this is due.
            </p>
          </div>
        ) : (
          <div className="field">
            <label className="label" htmlFor="recurring-due-month">
              Due Month
            </label>
            <select
              className="input"
              id="recurring-due-month"
              value={dueMonth}
              onChange={(e) => setDueMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button className="button" type="button" onClick={submit} disabled={!canSubmit} aria-disabled={!canSubmit}>
          Add Expense
        </button>
      </div>
    </div>
  );
}
