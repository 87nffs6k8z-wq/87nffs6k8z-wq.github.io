"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthPicker } from "./components/MonthPicker";
import { loadState, saveState, type BudgetState, type Income, type RecurringExpense } from "./lib/storage";
import { currentMonthKey, formatMonthLabel } from "./lib/month";
import { money } from "./lib/currency";
import { annualMonthlySetAside } from "./lib/annualSetAside";
import { useHydrated } from "./lib/useHydrated";

type PeriodSummary = {
  key: string;
  label: string;
  totalIncome: number;
  totalBills: number;
  leftover: number;
  notes: { id: string; name: string; dateLabel: string; amount: number }[];
};

function parseISODate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  if (date.getFullYear() !== year || date.getMonth() !== (month ?? 1) - 1 || date.getDate() !== day) return null;
  return date;
}

function formatDateLabel(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthBounds(monthKey: string) {
  const [yearValue, monthValue] = monthKey.split("-").map(Number);
  const year = yearValue ?? new Date().getFullYear();
  const monthIndex = (monthValue ?? 1) - 1;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return { year, monthIndex, lastDay };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function incomeDatesForMonth(income: Income, monthKey: string) {
  const { year, monthIndex } = monthBounds(monthKey);

  if (income.payCycle === "semimonthly") {
    return [new Date(year, monthIndex, 1), new Date(year, monthIndex, 15)];
  }

  const lastPaycheck = parseISODate(income.lastPaycheckDate);
  if (!lastPaycheck) return [];

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const dates: Date[] = [];

  let cursor = new Date(lastPaycheck);
  while (cursor > monthStart) {
    cursor = addDays(cursor, -14);
  }
  while (cursor < monthStart) {
    cursor = addDays(cursor, 14);
  }
  while (cursor <= monthEnd) {
    dates.push(new Date(cursor));
    cursor = addDays(cursor, 14);
  }

  return dates;
}

function recurringDueDate(expense: RecurringExpense, monthKey: string) {
  const { year, monthIndex, lastDay } = monthBounds(monthKey);

  if (expense.cadence === "annual") {
    if (expense.dueMonth !== monthIndex + 1) return null;
    const dueDay = Math.max(1, Math.min(expense.dueDay ?? 1, lastDay));
    return new Date(year, monthIndex, dueDay);
  }

  const dueDay = Math.max(1, Math.min(expense.dueDay ?? 1, lastDay));
  return new Date(year, monthIndex, dueDay);
}

export default function Home() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [month, setMonth] = useState(currentMonthKey());

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const summaries = useMemo(() => {
    if (!state) return [] as PeriodSummary[];

    const { year, monthIndex, lastDay } = monthBounds(month);
    const periodDefinitions = [
      { key: "first", label: `${formatDateLabel(year, monthIndex, 1)} - ${formatDateLabel(year, monthIndex, 15)}`, start: 1, end: 15 },
      {
        key: "second",
        label: `${formatDateLabel(year, monthIndex, 16)} - ${formatDateLabel(year, monthIndex, lastDay)}`,
        start: 16,
        end: lastDay,
      },
    ];

    return periodDefinitions.map((period) => {
      const totalIncome = state.incomes.reduce((sum, income) => {
        const amount = incomeDatesForMonth(income, month).reduce((dateSum, date) => {
          const day = date.getDate();
          return day >= period.start && day <= period.end ? dateSum + income.amount : dateSum;
        }, 0);
        return sum + amount;
      }, 0);

      const notes = state.recurringExpenses
        .map((expense) => {
          const dueDate = recurringDueDate(expense, month);
          if (!dueDate) return null;
          const day = dueDate.getDate();
          if (day < period.start || day > period.end) return null;
          const amount =
            expense.cadence === "annual" ? annualMonthlySetAside(expense.amount, expense.dueMonth, monthIndex + 1) : expense.amount;
          return {
            id: expense.id,
            name: expense.name,
            dateLabel: toISODate(dueDate),
            amount,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const totalBills = notes.reduce((sum, item) => sum + item.amount, 0);

      return {
        key: period.key,
        label: period.label,
        totalIncome,
        totalBills,
        leftover: totalIncome - totalBills,
        notes,
      };
    });
  }, [month, state]);

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, item) => ({
        income: acc.income + item.totalIncome,
        bills: acc.bills + item.totalBills,
        leftover: acc.leftover + item.leftover,
      }),
      { income: 0, bills: 0, leftover: 0 },
    );
  }, [summaries]);

  if (!hydrated || !state) {
    return (
      <section className="ledgerPage">
        <header className="pageIntro collageRuled">
          <p className="kicker">Overview</p>
          <h1 className="h1">Paycheck periods</h1>
          <p className="muted">Loading the current ledger...</p>
        </header>
      </section>
    );
  }

  return (
    <section className="ledgerPage">
      <header className="pageIntro collageRuled">
        <div className="ledgerHeader">
          <div>
            <p className="kicker">Overview</p>
            <h1 className="h1">Paycheck periods</h1>
            <p className="muted">Each ledger section groups income, bills due, and leftover balance inside the selected month.</p>
          </div>
          <div className="topMeta">
            <span>{formatMonthLabel(month)}</span>
            <span>{state.incomes.length} income sources</span>
            <span>{state.recurringExpenses.length} bill entries</span>
          </div>
        </div>
      </header>

      <section className="ledgerCard collageRuled">
        <div className="cardHeader">
          <h2 className="h2">Ledger month</h2>
          <span className="sheetCaption">Shift the sheet by month to review both half-periods.</span>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </section>

      <section className="dashboardStats">
        <article className="statCard collageRuled">
          <p className="statLabel">Total Income</p>
          <p className="stat">{money(totals.income)}</p>
        </article>
        <article className="statCard collageRuled">
          <p className="statLabel">Total Bills Due</p>
          <p className="stat">{money(totals.bills)}</p>
        </article>
        <article className="statCard collageRuled">
          <p className="statLabel">Leftover Balance</p>
          <p className="stat">{money(totals.leftover)}</p>
        </article>
      </section>

      <section className="periodGrid">
        {summaries.map((period) => (
          <article key={period.key} className="widgetCard collageRuled">
            <div className="periodHeader">
              <div>
                <h2 className="h2">{period.label}</h2>
                <p className="muted">Recent Notations for this paycheck period.</p>
              </div>
              <span className="badge">{period.notes.length} entries</span>
            </div>

            <div className="dashboardStats">
              <div>
                <p className="statLabel">Total Income</p>
                <p className="entryText">{money(period.totalIncome)}</p>
              </div>
              <div>
                <p className="statLabel">Total Bills Due</p>
                <p className="entryText">{money(period.totalBills)}</p>
              </div>
              <div>
                <p className="statLabel">Leftover Balance</p>
                <p className="entryText">{money(period.leftover)}</p>
              </div>
            </div>

            <div className="recentList" aria-label={`Recent notations for ${period.label}`}>
              {period.notes.length === 0 ? (
                <p className="muted">No bills due in this period.</p>
              ) : (
                period.notes.map((note) => (
                  <div key={note.id} className="recentItem">
                    <span>{note.name}</span>
                    <span>
                      {note.dateLabel} · {money(note.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
