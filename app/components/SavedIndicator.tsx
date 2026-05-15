"use client";

import { useEffect, useState } from "react";

export function useSavedIndicator(durationMs = 1600) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (savedAt === null) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [savedAt, durationMs]);

  return {
    visible,
    flash: () => setSavedAt(Date.now()),
  };
}

export function SavedIndicator({ visible }: { visible: boolean }) {
  return (
    <span
      className={`saved-indicator${visible ? " saved-indicator--visible" : ""}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {visible ? "Saved ✓" : ""}
    </span>
  );
}
