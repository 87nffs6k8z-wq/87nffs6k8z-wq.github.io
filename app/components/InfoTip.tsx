"use client";

import { useId, useState } from "react";

export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="infoTip">
      <button
        type="button"
        className="infoTipBtn"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>

      <span
        id={id}
        className={`infoTipPanel ${open ? "open" : ""}`}
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
}
