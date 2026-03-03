export function money(n: number): string {
    const val = Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(val);
  }
  