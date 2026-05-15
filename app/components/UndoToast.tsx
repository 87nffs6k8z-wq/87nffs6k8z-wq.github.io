"use client";

import { useEffect, useRef } from "react";

export type UndoEntry = {
  id: string;
  message: string;
  onUndo: () => void;
  onCommit?: () => void;
};

export function UndoToast({
  entry,
  onDismiss,
  durationMs = 5000,
}: {
  entry: UndoEntry | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  const committedRef = useRef(false);

  useEffect(() => {
    if (!entry) return;
    committedRef.current = false;
    const t = setTimeout(() => {
      if (!committedRef.current) {
        entry.onCommit?.();
        committedRef.current = true;
        onDismiss();
      }
    }, durationMs);
    return () => {
      clearTimeout(t);
      if (!committedRef.current) {
        entry.onCommit?.();
        committedRef.current = true;
      }
    };
  }, [entry, durationMs, onDismiss]);

  if (!entry) return null;

  return (
    <div className="undo-toast-wrap" role="status" aria-live="polite">
      <div className="undo-toast">
        <span className="undo-toast__msg">{entry.message}</span>
        <button
          type="button"
          className="undo-toast__btn"
          onClick={() => {
            committedRef.current = true;
            entry.onUndo();
            onDismiss();
          }}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
