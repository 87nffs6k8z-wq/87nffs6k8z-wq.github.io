"use client";

import { Expense } from "../lib/storage";
import { money } from "../lib/currency";
import { WidgetCard } from "./WidgetCard";
import { PaperTable } from "./PaperTable";

export function ExpenseList({ items, onDelete }: { items: Expense[]; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <WidgetCard title="Expenses">
        <p className="muted">No expenses yet for this month.</p>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Expenses">
      <PaperTable headers={["Date", "Name", "Category", "Amount", ""]}>
        {items.map((e) => (
          <tr key={e.id}>
            <td>{e.date}</td>
            <td>{e.name}</td>
            <td>{e.category}</td>
            <td>{money(e.amount)}</td>
            <td className="colNarrow">
              <button className="button ghost" type="button" onClick={() => onDelete(e.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </PaperTable>
    </WidgetCard>
  );
}
