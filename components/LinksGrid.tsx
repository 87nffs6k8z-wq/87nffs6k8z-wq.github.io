import { site } from "@/content/site";
import { Card } from "@/components/Card";
import { SocialIcon } from "@/components/SocialIcon";

export function LinksGrid() {
  return (
    <div className="grid grid3">
      {site.links.socials.map((l) => (
        <a key={l.label} href={l.href}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(255,255,255,.04)",
                    color: "var(--text)"
                  }}
                >
                  <SocialIcon name={l.icon} size={18} />
                </span>

                <div>
                  <div style={{ fontWeight: 800 }}>{l.label}</div>
                  <div className="p" style={{ fontSize: 13, marginTop: 6 }}>
                    Authorized external endpoint
                  </div>
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