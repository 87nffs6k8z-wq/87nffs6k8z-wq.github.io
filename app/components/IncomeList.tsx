"use client";

import { money } from "../lib/currency";
import type { Income } from "../lib/storage";
import { WidgetCard } from "./WidgetCard";
import { PaperTable } from "./PaperTable";

export function IncomeList({ items, onDelete }: { items: Income[]; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <WidgetCard title="Income">
        <p className="muted">No income entries yet. Add one to get started.</p>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Income">
      <PaperTable headers={["Name", "Pay cycle", "Amount", ""]}>
        {items.map((i) => (
          <tr key={i.id}>
            <td>{i.name}</td>
            <td className="cellCapitalize">{i.payCycle === "semimonthly" ? "Semi-monthly" : "Bi-weekly"}</td>
            <td>{money(i.amount)}</td>
            <td className="colNarrow">
              <button className="button ghost" type="button" onClick={() => onDelete(i.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </PaperTable>
    </WidgetCard>
  );
}
