export function todayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  
  export function monthKeyFromISO(iso: string): string {
    // YYYY-MM from YYYY-MM-DD
    return iso.slice(0, 7);
  }
  
  export function currentMonthKey(): string {
    return monthKeyFromISO(todayISO());
  }
  
  export function formatMonthLabel(monthKey: string): string {
    const [y, m] = monthKey.split("-").map(Number);
    const d = new Date(y, (m ?? 1) - 1, 1);
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }
  