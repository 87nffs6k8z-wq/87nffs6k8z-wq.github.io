import { site } from "@/content/site";
import { Card } from "@/components/Card";

export function LinksGrid() {
  return (
    <div className="grid grid3">
      {site.links.socials.map((l) => (
        <a key={l.label} href={l.href}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{l.label}</div>
                <div className="p" style={{ fontSize: 13, marginTop: 6 }}>
                  Authorized external endpoint
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>↗</span>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}