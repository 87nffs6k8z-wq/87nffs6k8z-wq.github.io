import type { KeyboardEvent } from "react";

function clampToBounds(value: number, input: HTMLInputElement): number {
  const min = input.min === "" ? Number.NEGATIVE_INFINITY : Number(input.min);
  const max = input.max === "" ? Number.POSITIVE_INFINITY : Number(input.max);
  return Math.min(max, Math.max(min, value));
}

export function handleNumberArrowStep(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

  event.preventDefault();
  const input = event.currentTarget;
  const current = input.value === "" ? 0 : Number(input.value);
  if (!Number.isFinite(current)) return;

  const baseStep = event.repeat ? 5 : 1;
  const delta = event.key === "ArrowUp" ? baseStep : -baseStep;
  const next = clampToBounds(current + delta, input);

  const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  valueSetter?.call(input, String(next));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
