"use client";

import { money } from "../lib/currency";
import type { Income } from "../lib/storage";

export function IncomeList({ items, onDelete }: { items: Income[]; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="h2">Income</h2>
        <p className="muted">No income entries yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="h2">Income</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Pay cycle", "Amount", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{i.name}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>
                  {i.payCycle === "semimonthly" ? "Semi-monthly" : "Bi-weekly"}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{money(i.amount)}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
                  <button className="button ghost" type="button" onClick={() => onDelete(i.id)}>
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
