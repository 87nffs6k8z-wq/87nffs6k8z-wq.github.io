export function annualMonthlySetAside(amount: number, dueMonth?: number, referenceMonth?: number): number {
  const safeAmount = Math.max(0, Number(amount) || 0);
  const ref = referenceMonth ?? new Date().getMonth() + 1;

  if (!dueMonth || dueMonth < 1 || dueMonth > 12) {
    return safeAmount / 12;
  }

  const monthsLeft = ((dueMonth - ref + 12) % 12) + 1;
  return safeAmount / monthsLeft;
}
