import { site } from "@/content/site";
import { applyThemeVars } from "@/lib/utils";
import { StockChart } from "@/components/StockChart";

export function Hero() {
  const themeStyle = applyThemeVars(site.brand.colors);
  const base = process.env.NEXT_PUBLIC_BASEPATH ?? "";

  return (
    <section className="bg-grid" style={{ ...themeStyle, padding: "54px 0 34px" }}>
      <div className="container">
        <div className="grid grid2" style={{ alignItems: "stretch" }}>
          <div className="panel" style={{ padding: 22 }}>
            <div className="badge">
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--primary)", boxShadow: "0 0 14px rgba(77,225,193,.8)" }} />
              Profit-Forward Entertainment Protocol
            </div>

            <h1 className="h1">{site.brand.name}</h1>
            <p className="p" style={{ fontSize: 16 }}>
              <strong style={{ color: "var(--text)" }}>{site.brand.tagline}</strong>
              <br />
              {site.brand.subtagline}
            </p>

            <div className="btnRow">
              <a className="btn btnPrimary" href={site.links.primaryCta.href}>
                {site.links.primaryCta.label} <span style={{ color: "var(--muted)" }}>↗</span>
              </a>
              <a className="btn" href={site.links.secondaryCta.href}>
                {site.links.secondaryCta.label}
              </a>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            </div>
          </div>

          <StockChart />
        </div>

        {/* Optional Twitch embed */}
        {site.embeds.twitchChannel ? (
          <div className="panel" style={{ marginTop: 16, padding: 14 }}>
            <div className="kicker">Live Feed</div>
            <div style={{ marginTop: 10 }}>
              <iframe
                title="Twitch stream"
                src={`https://player.twitch.tv/?channel=${encodeURIComponent(site.embeds.twitchChannel)}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`}
                height="400"
                width="100%"
                allowFullScreen
                style={{ border: "0", borderRadius: 14, background: "rgba(0,0,0,.2)" }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}