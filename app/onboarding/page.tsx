"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultBudget, loadBudget, newId, saveBudget, type Allocation, type OnboardingExpense, type PayCycle } from "../lib/budgetStorage";
import { useHydrated } from "../lib/useHydrated";
import { handleNumberArrowStep } from "../lib/numberInput";
import { money } from "../lib/currency";

type ExpenseDraft = OnboardingExpense;
type AllocationDraft = Allocation;

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [step, setStep] = useState(0);
  const [incomeSource, setIncomeSource] = useState("Primary income");
  const [paycheckAmount, setPaycheckAmount] = useState(0);
  const [payCycleType, setPayCycleType] = useState<PayCycle>("biweekly");
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([]);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft>({ id: newId(), name: "", amount: 0, frequency: "monthly" });
  const [allocations, setAllocations] = useState<AllocationDraft[]>([]);
  const [allocationDraft, setAllocationDraft] = useState<AllocationDraft>({ id: newId(), name: "", mode: "percent", value: 0 });

  useEffect(() => {
    if (!hydrated) return;
    const existing = loadBudget();
    if (existing?.meta?.onboardingComplete) {
      router.replace("/");
    }
  }, [hydrated, router]);

  const monthlyExpenseSubtotal = useMemo(
    () => expenses.filter((item) => item.frequency === "monthly").reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );

  const perPaycheckExpenseSubtotal = useMemo(
    () => expenses.filter((item) => item.frequency === "per-paycheck").reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );

  const percentTotal = useMemo(
    () => allocations.filter((item) => item.mode === "percent").reduce((sum, item) => sum + item.value, 0),
    [allocations],
  );

  const fixedTotal = useMemo(
    () => allocations.filter((item) => item.mode === "fixed").reduce((sum, item) => sum + item.value, 0),
    [allocations],
  );

  const estimatedBillsPerPeriod = perPaycheckExpenseSubtotal + monthlyExpenseSubtotal / 2;
  const availableAfterBills = Math.max(paycheckAmount - estimatedBillsPerPeriod, 0);
  const budgetedAmount = Math.max(0, fixedTotal + availableAfterBills * (percentTotal / 100));
  const balanceProgress = availableAfterBills > 0 ? Math.min((budgetedAmount / availableAfterBills) * 100, 100) : 0;

  function addExpense() {
    const name = expenseDraft.name.trim();
    if (!name) return;
    setExpenses((current) => [
      ...current,
      {
        ...expenseDraft,
        id: newId(),
        name,
        amount: Math.max(0, Number(expenseDraft.amount) || 0),
      },
    ]);
    setExpenseDraft({ id: newId(), name: "", amount: 0, frequency: "monthly" });
  }

  function addAllocation() {
    const name = allocationDraft.name.trim();
    if (!name) return;
    setAllocations((current) => [
      ...current,
      {
        ...allocationDraft,
        id: newId(),
        name,
        value: Math.max(0, Number(allocationDraft.value) || 0),
      },
    ]);
    setAllocationDraft({ id: newId(), name: "", mode: "percent", value: 0 });
  }

  function completeOnboarding() {
    const existing = loadBudget();
    if (existing?.meta?.onboardingComplete) {
      router.replace("/");
      return;
    }

    const cleanExpenses = expenses
      .map((item) => ({ ...item, name: item.name.trim(), amount: Math.max(0, Number(item.amount) || 0) }))
      .filter((item) => item.name.length > 0);

    const cleanAllocations = allocations
      .map((item) => ({ ...item, name: item.name.trim(), value: Math.max(0, Number(item.value) || 0) }))
      .filter((item) => item.name.length > 0);

    const budgetCategories = cleanAllocations
      .filter((item) => item.mode === "percent")
      .map((item) => ({ id: item.id, name: item.name, percent: item.value }));

    const recurringExpenses = cleanExpenses
      .filter((item) => item.frequency === "monthly")
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        cadence: "monthly" as const,
        dueDay: index % 2 === 0 ? 1 : 16,
      }));

    const today = todayIso();

    saveBudget(
      defaultBudget({
        settings: {
          payCycleType,
          paycheckAmount,
        },
        expenses: cleanExpenses,
        allocations: cleanAllocations,
        meta: {
          onboardingComplete: true,
          version: 1,
          createdAt: new Date().toISOString(),
        },
        payCycle: payCycleType,
        paycheckAmount,
        incomeMonthly: payCycleType === "biweekly" ? (paycheckAmount * 26) / 12 : (paycheckAmount * 24) / 12,
        lastPaycheckDate: payCycleType === "biweekly" ? today : "",
        incomes: [
          {
            id: newId(),
            name: incomeSource.trim() || "Primary income",
            amount: paycheckAmount,
            cadence: "monthly",
            payCycle: payCycleType,
            lastPaycheckDate: payCycleType === "biweekly" ? today : "",
          },
        ],
        recurringExpenses,
        budgetCategories,
      }),
    );

    router.replace("/");
  }

  function skipForNow() {
    const existing = loadBudget();
    if (existing?.meta?.onboardingComplete) {
      router.replace("/");
      return;
    }

    saveBudget(
      defaultBudget({
        meta: {
          onboardingComplete: true,
          version: 1,
          createdAt: new Date().toISOString(),
        },
      }),
    );

    router.replace("/");
  }

  if (!hydrated) {
    return (
      <section className="ledgerPage">
        <header className="pageIntro collageRuled">
          <p className="kicker">Opening Ledger</p>
          <h1 className="h1">Paper &amp; Ink setup</h1>
          <p className="muted">Loading your first sheet...</p>
        </header>
      </section>
    );
  }

  return (
    <section className="ledgerPage">
      <header className="pageIntro collageRuled">
        <div className="ledgerHeader">
          <div>
            <p className="kicker">Opening Ledger</p>
            <h1 className="h1">Three-step onboarding</h1>
            <p className="muted">Record your income, recurring notations, and budget mix before entering the ledger.</p>
          </div>
          <div className="stepRail" aria-label="Onboarding steps">
            {["Income", "Expenses", "Budget"].map((label, index) => (
              <span
                key={label}
                className={`stepChip ${index === step ? "isActive" : ""} ${index < step ? "isDone" : ""}`.trim()}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {step === 0 ? (
        <section className="ledgerCard collageRuled">
          <div className="cardHeader">
            <h2 className="h2">Step 1: Income</h2>
            <span className="badge">One source to start</span>
          </div>
          <div className="ledgerTableWrap">
            <table className="ledgerTable">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Cycle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input className="input" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={paycheckAmount}
                      onKeyDown={handleNumberArrowStep}
                      onChange={(e) => setPaycheckAmount(Math.max(0, Number(e.target.value || 0)))}
                    />
                  </td>
                  <td>
                    <select className="input" value={payCycleType} onChange={(e) => setPayCycleType(e.target.value as PayCycle)}>
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="semimonthly">Semi-Monthly</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="ledgerCard collageRuled">
          <div className="cardHeader">
            <h2 className="h2">Step 2: Expenses</h2>
            <span className="sheetCaption">All entry rows follow the 32px ledger line.</span>
          </div>
          <div className="ledgerTableWrap">
            <table className="ledgerTable">
              <thead>
                <tr>
                  <th>Notation</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th className="colTight" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{money(item.amount)}</td>
                    <td>{item.frequency === "per-paycheck" ? "Per paycheck" : "Monthly"}</td>
                    <td className="colTight">
                      <button
                        className="button ghost deleteButton"
                        type="button"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => setExpenses((current) => current.filter((row) => row.id !== item.id))}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <input
                      className="input"
                      placeholder="+ Add new notation..."
                      value={expenseDraft.name}
                      onChange={(e) => setExpenseDraft((current) => ({ ...current, name: e.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={expenseDraft.amount}
                      onKeyDown={handleNumberArrowStep}
                      onChange={(e) =>
                        setExpenseDraft((current) => ({ ...current, amount: Math.max(0, Number(e.target.value || 0)) }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={expenseDraft.frequency}
                      onChange={(e) =>
                        setExpenseDraft((current) => ({
                          ...current,
                          frequency: e.target.value === "per-paycheck" ? "per-paycheck" : "monthly",
                        }))
                      }
                    >
                      <option value="monthly">Monthly</option>
                      <option value="per-paycheck">Per paycheck</option>
                    </select>
                  </td>
                  <td className="colTight">
                    <button className="button" type="button" onClick={addExpense}>
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="progressMeta">
            <span className="muted">Monthly: {money(monthlyExpenseSubtotal)}</span>
            <span className="muted">Per paycheck: {money(perPaycheckExpenseSubtotal)}</span>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="ledgerCard collageRuled">
          <div className="cardHeader">
            <h2 className="h2">Step 3: Budget</h2>
            <span className="badge">Balance Sheet</span>
          </div>
          <div className="ledgerTableWrap">
            <table className="ledgerTable">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th className="colTight" />
                </tr>
              </thead>
              <tbody>
                {allocations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.mode === "fixed" ? "Fixed $" : "Percent"}</td>
                    <td>{item.mode === "fixed" ? money(item.value) : `${item.value.toFixed(0)}%`}</td>
                    <td className="colTight">
                      <button
                        className="button ghost deleteButton"
                        type="button"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => setAllocations((current) => current.filter((row) => row.id !== item.id))}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <input
                      className="input"
                      placeholder="+ Add new category..."
                      value={allocationDraft.name}
                      onChange={(e) => setAllocationDraft((current) => ({ ...current, name: e.target.value }))}
                    />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={allocationDraft.mode}
                      onChange={(e) =>
                        setAllocationDraft((current) => ({
                          ...current,
                          mode: e.target.value === "fixed" ? "fixed" : "percent",
                        }))
                      }
                    >
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={allocationDraft.value}
                      onKeyDown={handleNumberArrowStep}
                      onChange={(e) =>
                        setAllocationDraft((current) => ({ ...current, value: Math.max(0, Number(e.target.value || 0)) }))
                      }
                    />
                  </td>
                  <td className="colTight">
                    <button className="button" type="button" onClick={addAllocation}>
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="stack">
            <div className="progressMeta">
              <span className="muted">Available after bills: {money(availableAfterBills)}</span>
              <span className="muted">Budgeted: {money(budgetedAmount)}</span>
              <span className="muted">Percent mix: {percentTotal.toFixed(0)}%</span>
            </div>
            <div className="progressBar" aria-label="Balance Sheet progress">
              <div className="progressFill" style={{ width: `${balanceProgress}%` }} />
            </div>
            <p className="muted">
              {balanceProgress.toFixed(0)}% of your estimated per-period balance sheet is assigned. Fixed plans total{" "}
              {money(fixedTotal)}.
            </p>
          </div>
        </section>
      ) : null}

      <div className="ledgerCard collageRuled">
        <div className="cardHeader">
          <button className="button ghost" type="button" onClick={skipForNow}>
            Skip for now
          </button>
          <div className="sectionActions">
            {step > 0 ? (
              <button className="button ghost" type="button" onClick={() => setStep((current) => current - 1)}>
                Back
              </button>
            ) : null}
            {step < 2 ? (
              <button className="button" type="button" onClick={() => setStep((current) => current + 1)} disabled={paycheckAmount <= 0}>
                Continue
              </button>
            ) : (
              <button className="button" type="button" onClick={completeOnboarding} disabled={paycheckAmount <= 0}>
                Open ledger
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
