"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthPicker } from "./components/MonthPicker";
import { BudgetState, loadState, saveState, type Income } from "./lib/storage";
import { currentMonthKey, formatMonthLabel } from "./lib/month";
import { money } from "./lib/currency";
import { annualMonthlySetAside } from "./lib/annualSetAside";
import { useHydrated } from "./lib/useHydrated";

type PaycheckRow = {
  date: string;
  incomeTotal: number;
  expensesTotal: number;
  leftover: number;
  allocations: { name: string; amount: number }[];
  fixedTotal: number;
  unallocated: number;
};

function parseISODate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (dt.getFullYear() !== y || dt.getMonth() !== (m - 1) || dt.getDate() !== d) return null;
  return dt;
}

function toISODate(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dt: Date, days: number): Date {
  const d = new Date(dt);
  d.setDate(d.getDate() + days);
  return d;
}

function monthBounds(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  const year = y ?? new Date().getFullYear();
  const monthIndex = (m ?? 1) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  return { year, monthIndex, start, end, lastDay: end.getDate() };
}

function paydatesForIncome(income: Income, monthKey: string): { dates: string[]; error?: string } {
  const { year, monthIndex, start, end } = monthBounds(monthKey);

  if (income.payCycle === "semimonthly") {
    const d1 = new Date(year, monthIndex, 1);
    const d2 = new Date(year, monthIndex, 15);
    return { dates: [toISODate(d1), toISODate(d2)] };
  }

  const last = parseISODate(income.lastPaycheckDate);
  if (!last) return { dates: [], error: `Add a last paycheck date for ${income.name || "an income source"}.` };

  const dates: string[] = [];
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  let d = new Date(last);
  if (d >= startDay && d <= endDay) dates.push(toISODate(d));

  let back = addDays(d, -14);
  while (back >= startDay) {
    dates.push(toISODate(back));
    back = addDays(back, -14);
  }

  let forward = addDays(d, 14);
  while (forward <= endDay) {
    dates.push(toISODate(forward));
    forward = addDays(forward, 14);
  }

  return { dates: Array.from(new Set(dates)).sort() };
}

function clampDay(day: number, lastDay: number) {
  return Math.max(1, Math.min(day, lastDay));
}

export default function Home() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BudgetState | null>(null);
  const [month, setMonth] = useState<string>(currentMonthKey());

  useEffect(() => {
    if (!hydrated) return;
    setState(loadState());
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !state) return;
    saveState(state);
  }, [hydrated, state]);

  const paycheckRows = useMemo(() => {
    if (!state) return { rows: [], errors: [] as string[] };
    const errors: string[] = [];
    const paychecks = new Map<string, { date: string; incomeTotal: number }>();

    state.incomes.forEach((income) => {
      const { dates, error } = paydatesForIncome(income, month);
      if (error) errors.push(error);
      dates.forEach((date) => {
        const existing = paychecks.get(date);
        if (existing) {
          existing.incomeTotal += income.amount;
        } else {
          paychecks.set(date, { date, incomeTotal: income.amount });
        }
      });
    });

    const sortedDates = Array.from(paychecks.keys()).sort();
    if (sortedDates.length === 0) {
      return { rows: [] as PaycheckRow[], errors };
    }

    const count = sortedDates.length;

    const monthlyExpenses = state.recurringExpenses.filter((e) => e.cadence === "monthly");
    const annualExpenses = state.recurringExpenses.filter((e) => e.cadence === "annual");

    const expensesByDate = new Map<string, number>();
    sortedDates.forEach((d) => expensesByDate.set(d, 0));

    const { year, monthIndex, lastDay } = monthBounds(month);

    // Set aside annual items by their next due month instead of always /12.
    const annualMonthlyBudgeted = annualExpenses.reduce((sum, exp) => {
      const dueMonth = exp.dueMonth;
      if (!dueMonth || dueMonth < 1 || dueMonth > 12) {
        errors.push(`Annual expense "${exp.name}" is missing a due month. Using 12-month spread.`);
        return sum + annualMonthlySetAside(exp.amount, undefined, monthIndex + 1);
      }
      return sum + annualMonthlySetAside(exp.amount, dueMonth, monthIndex + 1);
    }, 0);

    const annualPerPaycheck = annualMonthlyBudgeted / count;
    sortedDates.forEach((d) => expensesByDate.set(d, annualPerPaycheck));

    monthlyExpenses.forEach((exp) => {
      const dueDay = clampDay(exp.dueDay ?? 1, lastDay);
      const dueDate = new Date(year, monthIndex, dueDay);
      const dueISO = toISODate(dueDate);

      let target = sortedDates[0];
      for (const date of sortedDates) {
        if (date <= dueISO) target = date;
      }
      expensesByDate.set(target, (expensesByDate.get(target) || 0) + exp.amount);
    });

    const percentTotal = state.budgetCategories.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);
    const fixedAllocations = state.allocations.filter((item) => item.mode === "fixed" && (Number(item.value) || 0) > 0);
    const fixedTotal = fixedAllocations.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

    const rows: PaycheckRow[] = sortedDates.map((date) => {
      const incomeTotal = paychecks.get(date)?.incomeTotal ?? 0;
      const expensesTotal = expensesByDate.get(date) || 0;
      const leftover = incomeTotal - expensesTotal;
      const afterFixed = leftover - fixedTotal;
      const percentBase = Math.max(0, afterFixed);
      const percentAllocations = state.budgetCategories.map((c) => ({
        name: c.name,
        amount: percentBase * ((Number(c.percent) || 0) / 100),
      }));
      const fixedAllocationRows = fixedAllocations.map((item) => ({
        name: item.name,
        amount: Number(item.value) || 0,
      }));
      const allocations = [...percentAllocations, ...fixedAllocationRows];
      const percentAllocatedAmount = percentBase * (percentTotal / 100);
      const unallocated = afterFixed - percentAllocatedAmount;
      return { date, incomeTotal, expensesTotal, leftover, allocations, fixedTotal, unallocated };
    });

    return { rows, errors };
  }, [state, month]);

  const percentTotal = useMemo(() => {
    if (!state) return 0;
    return state.budgetCategories.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);
  }, [state]);

  const fixedTotal = useMemo(() => {
    if (!state) return 0;
    return state.allocations
      .filter((item) => item.mode === "fixed")
      .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [state]);

  if (!hydrated || !state) {
    return (
      <section className="stack">
        <header className="hero">
          <p className="kicker">BUDGET OS</p>
          <h1 className="h1">Overview</h1>
          <p className="lead">Loading…</p>
        </header>
      </section>
    );
  }

  return (
    <section className="stack">
      <header className="hero">
        <p className="kicker">BUDGET OS</p>
        <h1 className="h1">Overview</h1>
        <p className="lead">
          Pick a month to see each paycheck, the expenses due before it, and what to allocate by your budget
          percentages.
        </p>
      </header>

      <div className="card">
        <h2 className="h2">Month</h2>
        <div className="form">
          <MonthPicker value={month} onChange={setMonth} />
        </div>
        <p className="hint">Selected: {formatMonthLabel(month)}</p>
      </div>

      {paycheckRows.errors.length > 0 ? (
        <div className="card" role="status">
          <h2 className="h2">Missing info</h2>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
            {paycheckRows.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {percentTotal > 100 ? (
        <div className="card" role="alert">
          <h2 className="h2">Budget over 100%</h2>
          <p className="muted">Your budget categories total {percentTotal.toFixed(2)}%. Reduce them to 100%.</p>
        </div>
      ) : null}

      <div className="card">
        <h2 className="h2">Paychecks</h2>
        {paycheckRows.rows.length === 0 ? (
          <p className="muted">Add incomes to see paychecks for this month.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Pay date", "Income", "Expenses due", "Leftover"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paycheckRows.rows.map((row) => (
                  <tr key={row.date}>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{row.date}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{money(row.incomeTotal)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{money(row.expensesTotal)}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{money(row.leftover)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paycheckRows.rows.length > 0 ? (
        <div className="card">
          <h2 className="h2">Allocations by paycheck</h2>
          <div className="stack">
            {paycheckRows.rows.map((row) => (
              <div key={`${row.date}-alloc`} className="card">
                <h3 className="h2" style={{ marginBottom: 10 }}>
                  {row.date} — {money(row.leftover)} to allocate
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Category", "Amount"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {row.allocations.map((a) => (
                        <tr key={`${row.date}-${a.name}`}>
                          <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{a.name}</td>
                          <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{money(a.amount)}</td>
                        </tr>
                      ))}
                      {percentTotal < 100 || row.fixedTotal > 0 ? (
                        <tr>
                          <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>Unallocated</td>
                          <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
                            {money(row.unallocated)}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
