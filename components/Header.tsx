import { site } from "@/content/site";
import { applyThemeVars } from "@/lib/utils";

export function Header() {
  const style = applyThemeVars(site.brand.colors);

  return (
    <header className="bg-grid" style={{ ...style, padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={`${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/images/logo.svg`} alt={`${site.brand.shortName} logo`} width={34} height={34} />
          <div>
            <div style={{ fontWeight: 700, letterSpacing: ".02em" }}>{site.brand.shortName}</div>
            <div className="kicker" style={{ marginTop: 2 }}>Corporate Stream Portal</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 14, color: "var(--muted)", fontSize: 14 }}>
          <a href="#links">Links</a>
          <a href="#schedule">Schedule</a>
          <a href="#highlights">Highlights</a>
        </nav>
      </div>
    </header>
  );
}