"use client";

import { useMemo, useState } from "react";
import { Expense, newId } from "../lib/storage";
import { todayISO } from "../lib/month";

const CATEGORIES = ["Rent", "Utilities", "Groceries", "Transport", "Subscriptions", "Dining", "Other"];

export function ExpenseForm({ onAdd }: { onAdd: (e: Expense) => void }) {
  const [date, setDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState<string>("");

  const amountNumber = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const canSubmit =
    date.trim().length > 0 && name.trim().length > 0 && category.trim().length > 0 && amountNumber > 0;

  function submit() {
    if (!canSubmit) return;
    onAdd({
      id: newId(),
      date,
      name: name.trim(),
      category,
      amount: Number(amountNumber.toFixed(2)),
    });
    setName("");
    setAmount("");
  }

  return (
    <div className="card">
      <h2 className="h2">Add expense</h2>

      <div className="form" aria-label="Add expense form">
        <div className="field">
          <label className="label" htmlFor="date">
            Date
          </label>
          <input className="input" id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="field">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            className="input"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Groceries, Gas, Rent..."
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="category">
            Category
          </label>
          <select className="input" id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="amount">
            Amount
          </label>
          <input
            className="input"
            id="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            aria-describedby="amountHint"
          />
          <p className="hint" id="amountHint">
            Use positive numbers (e.g., 25.50).
          </p>
        </div>

        <button className="button" type="button" onClick={submit} disabled={!canSubmit} aria-disabled={!canSubmit}>
          Add
        </button>
      </div>
    </div>
  );
}
