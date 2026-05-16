export function jumpToAddForm(id: string = "add-form") {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    const input = el.querySelector<HTMLElement>("input, select, textarea");
    input?.focus({ preventScroll: true });
  }, 350);
}
