"use client";

import { formatMonthLabel } from "../lib/month";

export function MonthPicker({
  value,
  onChange,
}: {
  value: string; // YYYY-MM
  onChange: (v: string) => void;
}) {
  // Simple: show last 12 months including current
  const options = (() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      out.push(key);
    }
    return out;
  })();

  return (
    <div className="field">
      <select
        className="input"
        id="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select month"
      >
        {options.map((k) => (
          <option key={k} value={k}>
            {formatMonthLabel(k)}
          </option>
        ))}
      </select>
      <p className="hint">Expenses are filtered to the selected month.</p>
    </div>
  );
}
