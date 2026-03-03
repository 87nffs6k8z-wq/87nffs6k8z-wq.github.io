"use client";

import { Expense } from "../lib/storage";
import { money } from "../lib/currency";

export function ExpenseList({ items, onDelete }: { items: Expense[]; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="h2">Expenses</h2>
        <p className="muted">No expenses yet for this month.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="h2">Expenses</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "Name", "Category", "Amount", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id}>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{e.date}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{e.name}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{e.category}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{money(e.amount)}</td>
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
