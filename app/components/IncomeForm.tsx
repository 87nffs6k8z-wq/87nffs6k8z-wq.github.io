"use client";

import { useMemo, useState } from "react";
import { newId, type Income, type PayCycle } from "../lib/storage";
import { InfoTip } from "./InfoTip";

export function IncomeForm({ onAdd, onCancel }: { onAdd: (i: Income) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [payCycle, setPayCycle] = useState<PayCycle>("biweekly");
  const [lastPaycheckDate, setLastPaycheckDate] = useState("");

  const amountNumber = useMemo(() => {
    const n = Number(amount.replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const canSubmit =
    name.trim().length > 0 &&
    amountNumber > 0 &&
    (payCycle !== "biweekly" || lastPaycheckDate);

  function submit() {
    if (!canSubmit) return;
    onAdd({
      id: newId(),
      name: name.trim(),
      amount: Number(amountNumber.toFixed(2)),
      cadence: "monthly",
      payCycle,
      lastPaycheckDate: payCycle === "biweekly" ? lastPaycheckDate : "",
    });
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="h2" style={{ margin: 0 }}>
          Add Income
        </h2>
        <button className="button ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="form" aria-label="Add income form">
        <div className="field">
          <label className="label" htmlFor="income-name">
            Name
          </label>
          <input
            className="input"
            id="income-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Primary job, Side gig..."
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="income-amount">
            Amount
          </label>
          <p className="hint">The amount you receive per paycheck after taxes.</p>
          <input
            className="input"
            id="income-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2,500.00"
          />
        </div>

        <fieldset className="fieldset">
          <legend className="legend">Pay cycle</legend>

          <div className="radioRow" role="radiogroup" aria-label="Pay cycle type">
            <div className="radioLabel" style={{ justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <input
                  className="radio"
                  id="income-payCycle-biweekly"
                  type="radio"
                  name="incomePayCycle"
                  value="biweekly"
                  checked={payCycle === "biweekly"}
                  onChange={() => setPayCycle("biweekly")}
                />
                <label htmlFor="income-payCycle-biweekly" style={{ fontWeight: 700 }}>
                  Bi-weekly
                </label>
              </div>

              <InfoTip label="Bi-weekly info">
                Paid every 14 days (26 paychecks per year). We’ll use your last paycheck date to predict the next ones.
              </InfoTip>
            </div>

            <div className="radioLabel" style={{ justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <input
                  className="radio"
                  id="income-payCycle-semimonthly"
                  type="radio"
                  name="incomePayCycle"
                  value="semimonthly"
                  checked={payCycle === "semimonthly"}
                  onChange={() => setPayCycle("semimonthly")}
                />
                <label htmlFor="income-payCycle-semimonthly" style={{ fontWeight: 700 }}>
                  Semi-monthly
                </label>
              </div>

              <InfoTip label="Semi-monthly info">Paid twice per month (1st and 15th).</InfoTip>
            </div>
          </div>
        </fieldset>

        {payCycle === "biweekly" ? (
          <div className="field">
            <label className="label" htmlFor="income-lastPaycheckDate">
              Last paycheck date
            </label>
            <input
              className="input"
              id="income-lastPaycheckDate"
              type="date"
              value={lastPaycheckDate}
              onChange={(e) => setLastPaycheckDate(e.target.value)}
              aria-describedby="incomeLastPayHint"
            />
            <p className="hint" id="incomeLastPayHint">
              Used to forecast your bi-weekly paycheck dates.
            </p>
          </div>
        ) : null}

        <button className="button" type="button" onClick={submit} disabled={!canSubmit} aria-disabled={!canSubmit}>
          Add Income
        </button>
      </div>
    </div>
  );
}
