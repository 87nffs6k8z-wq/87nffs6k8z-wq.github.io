export function applyThemeVars(colors: {
    bg: string;
    panel: string;
    text: string;
    muted: string;
    primary: string;
    secondary: string;
    accent: string;
  }) {
    return {
      ["--bg" as any]: colors.bg,
      ["--panel" as any]: colors.panel,
      ["--text" as any]: colors.text,
      ["--muted" as any]: colors.muted,
      ["--primary" as any]: colors.primary,
      ["--secondary" as any]: colors.secondary,
      ["--accent" as any]: colors.accent
    } as React.CSSProperties;
  }