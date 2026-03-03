"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultBudget, loadBudget, newId, saveBudget, type Allocation, type OnboardingExpense, type PayCycle } from "../lib/budgetStorage";
import { useHydrated } from "../lib/useHydrated";

type AllocationDraft = Allocation;
type ExpenseDraft = OnboardingExpense;

const starterAllocations: AllocationDraft[] = [
  { id: newId(), name: "Groceries", mode: "percent", value: 0 },
  { id: newId(), name: "Gas/Transport", mode: "percent", value: 0 },
  { id: newId(), name: "Savings", mode: "percent", value: 0 },
];

const defaultExpenseRow: ExpenseDraft = {
  id: newId(),
  name: "",
  amount: 0,
  frequency: "monthly",
};

export default function OnboardingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [step, setStep] = useState(0);
  const [paycheckAmount, setPaycheckAmount] = useState(0);
  const [payCycleType, setPayCycleType] = useState<PayCycle>("biweekly");
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([{ ...defaultExpenseRow }]);
  const [allocations, setAllocations] = useState<AllocationDraft[]>([]);
  const [showStarters, setShowStarters] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const existing = loadBudget();
    if (existing?.meta?.onboardingComplete) {
      router.replace("/");
    }
  }, [hydrated, router]);

  const monthlyExpenseSubtotal = useMemo(
    () => expenses.filter((e) => e.frequency === "monthly").reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses],
  );

  const perPaycheckExpenseSubtotal = useMemo(
    () => expenses.filter((e) => e.frequency === "per-paycheck").reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses],
  );

  const percentTotal = useMemo(
    () => allocations.filter((a) => a.mode === "percent").reduce((sum, a) => sum + (Number(a.value) || 0), 0),
    [allocations],
  );

  const fixedTotal = useMemo(
    () => allocations.filter((a) => a.mode === "fixed").reduce((sum, a) => sum + (Number(a.value) || 0), 0),
    [allocations],
  );

  const canContinueFromIncome = paycheckAmount > 0;

  const cleanedExpenses = expenses
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      amount: Math.max(0, Number(item.amount) || 0),
    }))
    .filter((item) => item.name.length > 0);

  const cleanedAllocations = allocations
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      value: Math.max(0, Number(item.value) || 0),
    }))
    .filter((item) => item.name.length > 0);

  function addExpenseRow() {
    setExpenses((prev) => [...prev, { id: newId(), name: "", amount: 0, frequency: "monthly" }]);
  }

  function addAllocationRow() {
    setAllocations((prev) => [...prev, { id: newId(), name: "", mode: "percent", value: 0 }]);
  }

  function completeOnboarding() {
    const existing = loadBudget();
    if (existing?.meta?.onboardingComplete) {
      router.replace("/");
      return;
    }

    const budgetCategories = cleanedAllocations
      .filter((item) => item.mode === "percent")
      .map((item) => ({
        id: item.id,
        name: item.name,
        percent: Math.max(0, item.value),
      }));

    const recurringExpenses = cleanedExpenses
      .filter((item) => item.frequency === "monthly")
      .map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        cadence: "monthly" as const,
        dueDay: 1,
      }));

    saveBudget(
      defaultBudget({
        settings: {
          payCycleType,
          paycheckAmount,
        },
        expenses: cleanedExpenses,
        allocations: cleanedAllocations,
        meta: {
          onboardingComplete: true,
          version: 1,
          createdAt: new Date().toISOString(),
        },
        payCycle: payCycleType,
        paycheckAmount,
        incomeMonthly: payCycleType === "biweekly" ? (paycheckAmount * 26) / 12 : (paycheckAmount * 24) / 12,
        lastPaycheckDate: payCycleType === "biweekly" ? todayIso : "",
        incomes: [
          {
            id: newId(),
            name: "Primary income",
            amount: paycheckAmount,
            cadence: "monthly",
            payCycle: payCycleType,
            lastPaycheckDate: payCycleType === "biweekly" ? todayIso : "",
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

  async function importFromFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as any;
      const incoming = parsed?.budgetAppV1 ?? parsed;
      if (!incoming || typeof incoming !== "object") {
        setImportMessage("Import failed: invalid budget file.");
        return;
      }

      saveBudget(incoming);
      setImportMessage("Import complete. Redirecting...");
      router.replace("/");
    } catch {
      setImportMessage("Import failed: invalid JSON.");
    } finally {
      event.target.value = "";
    }
  }

  if (!hydrated) {
    return (
      <section className="stack">
        <header className="pageHeader">
          <h1 className="h1">Onboarding</h1>
          <p className="muted">Loading…</p>
        </header>
      </section>
    );
  }

  return (
    <section className="stack">
      <header className="pageHeader">
        <h1 className="h1">First-run setup</h1>
        <p className="muted">Step {step + 1} of 4</p>
      </header>

      {step === 0 ? (
        <div className="card">
          <h2 className="h2">Start with import?</h2>
          <p className="muted">If you already have a backup file, import it now. Otherwise continue with setup.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <label className="button ghost" style={{ cursor: "pointer" }}>
              Import JSON
              <input type="file" accept="application/json,.json" onChange={importFromFile} style={{ display: "none" }} />
            </label>
            <button className="button" type="button" onClick={() => setStep(1)}>
              Start setup
            </button>
          </div>
          {importMessage ? (
            <p className="muted" role="status" style={{ marginTop: 10 }}>
              {importMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="card">
          <h2 className="h2">Income</h2>
          <div className="form">
            <label htmlFor="paycheck-amount" className="label">
              How much do you take home each paycheck?
            </label>
            <input
              id="paycheck-amount"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              value={paycheckAmount}
              onChange={(e) => setPaycheckAmount(Math.max(0, Number(e.target.value || 0)))}
            />

            <fieldset className="field">
              <legend className="label">Pay cycle</legend>
              <div className="row">
                <label className="row">
                  <input
                    type="radio"
                    name="pay-cycle"
                    checked={payCycleType === "biweekly"}
                    onChange={() => setPayCycleType("biweekly")}
                  />
                  <span>Bi-weekly</span>
                </label>
                <label className="row">
                  <input
                    type="radio"
                    name="pay-cycle"
                    checked={payCycleType === "semimonthly"}
                    onChange={() => setPayCycleType("semimonthly")}
                  />
                  <span>Semi-monthly</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Expenses
            </h2>
            <button className="button" type="button" onClick={addExpenseRow}>
              Add row
            </button>
          </div>

          <div className="stack" style={{ marginTop: 10 }}>
            {expenses.map((item) => (
              <div key={item.id} className="row" style={{ gap: 8, alignItems: "flex-end" }}>
                <label style={{ flex: 2 }}>
                  <span className="label">Name</span>
                  <input
                    className="input"
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      setExpenses((prev) => prev.map((row) => (row.id === item.id ? { ...row, name: e.target.value } : row)))
                    }
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span className="label">Amount</span>
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) =>
                      setExpenses((prev) =>
                        prev.map((row) =>
                          row.id === item.id ? { ...row, amount: Math.max(0, Number(e.target.value || 0)) } : row,
                        ),
                      )
                    }
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span className="label">Frequency</span>
                  <select
                    className="input"
                    value={item.frequency}
                    onChange={(e) =>
                      setExpenses((prev) =>
                        prev.map((row) =>
                          row.id === item.id
                            ? { ...row, frequency: e.target.value === "per-paycheck" ? "per-paycheck" : "monthly" }
                            : row,
                        ),
                      )
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="per-paycheck">Per-paycheck</option>
                  </select>
                </label>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setExpenses((prev) => prev.filter((row) => row.id !== item.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 10, gap: 24 }}>
            <p className="muted">Monthly subtotal: ${monthlyExpenseSubtotal.toFixed(2)}</p>
            <p className="muted">Per-paycheck subtotal: ${perPaycheckExpenseSubtotal.toFixed(2)}</p>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Allocation
            </h2>
            <div className="row" style={{ gap: 8 }}>
              <button className="button ghost" type="button" onClick={() => setShowStarters((v) => !v)}>
                {showStarters ? "Hide starters" : "Use starter rows"}
              </button>
              <button className="button" type="button" onClick={addAllocationRow}>
                Add row
              </button>
            </div>
          </div>

          {showStarters ? (
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="button ghost"
                type="button"
                onClick={() =>
                  setAllocations((prev) => {
                    const existing = new Set(prev.map((i) => i.name.toLowerCase()));
                    const additions = starterAllocations
                      .filter((s) => !existing.has(s.name.toLowerCase()))
                      .map((s) => ({ ...s, id: newId() }));
                    return [...prev, ...additions];
                  })
                }
              >
                Add Groceries, Gas/Transport, Savings
              </button>
            </div>
          ) : null}

          <div className="stack" style={{ marginTop: 10 }}>
            {allocations.map((item) => (
              <div key={item.id} className="row" style={{ gap: 8, alignItems: "flex-end" }}>
                <label style={{ flex: 2 }}>
                  <span className="label">Category</span>
                  <input
                    className="input"
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      setAllocations((prev) => prev.map((row) => (row.id === item.id ? { ...row, name: e.target.value } : row)))
                    }
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span className="label">Type</span>
                  <select
                    className="input"
                    value={item.mode}
                    onChange={(e) =>
                      setAllocations((prev) =>
                        prev.map((row) =>
                          row.id === item.id ? { ...row, mode: e.target.value === "fixed" ? "fixed" : "percent" } : row,
                        ),
                      )
                    }
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed dollars</option>
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <span className="label">Value</span>
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.value}
                    onChange={(e) =>
                      setAllocations((prev) =>
                        prev.map((row) =>
                          row.id === item.id ? { ...row, value: Math.max(0, Number(e.target.value || 0)) } : row,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setAllocations((prev) => prev.filter((row) => row.id !== item.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="stack" style={{ marginTop: 10 }}>
            <p className="muted">Allocated total (percent): {percentTotal.toFixed(2)}%</p>
            {percentTotal > 100 ? <p role="alert">Warning: percent allocations are over 100%.</p> : null}
            <p className="muted">Allocated total (fixed): ${fixedTotal.toFixed(2)}</p>
            {fixedTotal > paycheckAmount ? (
              <p role="alert">Warning: fixed allocations are greater than paycheck amount.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step > 0 ? (
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="button ghost" type="button" onClick={skipForNow}>
            Skip for now
          </button>

          <div className="row" style={{ gap: 8 }}>
            {step > 1 ? (
              <button className="button ghost" type="button" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button
                className="button"
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !canContinueFromIncome}
              >
                Continue
              </button>
            ) : (
              <button className="button" type="button" onClick={completeOnboarding}>
                Finish setup
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
