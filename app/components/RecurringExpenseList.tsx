"use client";

import { money } from "../lib/currency";
import { annualMonthlySetAside } from "../lib/annualSetAside";
import type { RecurringExpense } from "../lib/storage";

const MONTH_LABELS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dueLabel(item: RecurringExpense): string {
  if (item.cadence === "monthly") {
    const day = item.dueDay ?? 1;
    return `Day ${day}`;
  }
  const month = item.dueMonth ?? 1;
  return MONTH_LABELS[month] ?? "January";
}

function monthlySetAsideForAnnual(item: RecurringExpense): number {
  return annualMonthlySetAside(item.amount, item.dueMonth);
}

export function RecurringExpenseList({
  items,
  onDelete,
}: {
  items: RecurringExpense[];
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="h2">Current expenses</h2>
        <p className="muted">No expenses yet. Add your monthly or annual items.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="h2">Current expenses</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Frequency", "Due", "Amount", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id}>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{e.name}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>
                  {e.cadence}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{dueLabel(e)}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
                  {money(e.amount)}
                  {e.cadence === "annual" ? (
                    <span className="muted"> ({money(monthlySetAsideForAnnual(e))}/mo allocated)</span>
                  ) : null}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
                  <button className="button ghost" type="button" onClick={() => onDelete(e.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
