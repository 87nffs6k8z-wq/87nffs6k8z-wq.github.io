"use client";

import { money } from "../lib/currency";
import { annualMonthlySetAside } from "../lib/annualSetAside";
import type { RecurringExpense } from "../lib/storage";
import { WidgetCard } from "./WidgetCard";
import { PaperTable } from "./PaperTable";

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
      <WidgetCard title="Current Expenses">
        <p className="muted">No expenses yet. Add your monthly or annual items.</p>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Current Expenses">
      <PaperTable className="recurringTableDesktop" headers={["Name", "Frequency", "Due", "Amount", ""]}>
        {items.map((e) => (
          <tr key={e.id}>
            <td>{e.name}</td>
            <td className="cellCapitalize">{e.cadence}</td>
            <td>{dueLabel(e)}</td>
            <td>
              {money(e.amount)}
              {e.cadence === "annual" ? <span className="muted"> ({money(monthlySetAsideForAnnual(e))}/mo allocated)</span> : null}
            </td>
            <td className="colNarrow">
              <button className="button ghost" type="button" onClick={() => onDelete(e.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </PaperTable>

      <div className="recurringMobileList" aria-label="Expenses list">
        {items.map((e) => (
          <article key={e.id} className="recurringMobileItem">
            <div>
              <p className="kicker">{e.cadence === "annual" ? "Annual" : "Monthly"}</p>
              <h3 className="h2">{e.name}</h3>
              <p className="muted">{dueLabel(e)}</p>
            </div>
            <div className="recurringMobileRow">
              <p className="stat">{money(e.amount)}</p>
              {e.cadence === "annual" ? (
                <p className="hint">{money(monthlySetAsideForAnnual(e))}/mo allocated</p>
              ) : null}
            </div>
            <button className="button ghost" type="button" onClick={() => onDelete(e.id)}>
              Delete
            </button>
          </article>
        ))}
      </div>
    </WidgetCard>
  );
}
