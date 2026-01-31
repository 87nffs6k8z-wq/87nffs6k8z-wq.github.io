import { site } from "@/content/site";
import { Card } from "@/components/Card";
import { SocialIcon } from "@/components/SocialIcon";
import { ExternalArrowIcon } from "@/components/ExternalArrowIcon";

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
                </div>
              </div>

              <span
                aria-hidden="true"
                style={{
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                <ExternalArrowIcon size={14} />
              </span>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}