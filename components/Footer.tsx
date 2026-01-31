import { site } from "@/content/site";

export function Footer() {
  return (
    <footer style={{ padding: "22px 0 38px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800 }}>{site.brand.shortName}</div>
          <p className="p" style={{ marginTop: 6, maxWidth: 520 }}>
            {site.contact.blurb}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="kicker">Business Inquiries</div>
          <a className="btn" href={`mailto:${site.contact.email}`} style={{ marginTop: 10, display: "inline-flex" }}>
            {site.contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}