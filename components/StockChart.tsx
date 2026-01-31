import { Card } from "@/components/Card";

const points = [
  12, 14, 13, 15, 16, 18, 17, 21, 20, 24, 23, 28, 27, 31, 35
]; // deterministic (no randomness) = no hydration surprises

function buildPath(values: number[], w: number, h: number, pad: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xStep = (w - pad * 2) / (values.length - 1);

  const y = (v: number) => {
    if (max === min) return h / 2;
    const t = (v - min) / (max - min);
    return pad + (1 - t) * (h - pad * 2);
  };

  return values
    .map((v, i) => {
      const x = pad + i * xStep;
      const yy = y(v);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${yy.toFixed(2)}`;
    })
    .join(" ");
}

export function StockChart() {
  const w = 900;
  const h = 520;
  const pad = 30;

  const path = buildPath(points, w, h, pad);

  // Area fill path
  const lastX = w - pad;
  const baseY = h - pad;
  const area = `${path} L ${lastX} ${baseY} L ${pad} ${baseY} Z`;

  const latest = points[points.length - 1];
  const first = points[0];
  const pct = (((latest - first) / first) * 100);
  const sign = pct >= 0 ? "+" : "";

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        {/* background glow */}
        <defs>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--secondary)" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--secondary)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* grid */}
        <g opacity="0.18" stroke="white">
          {Array.from({ length: 8 }).map((_, i) => {
            const y = (h / 8) * i;
            return <line key={`h-${i}`} x1="0" y1={y} x2={w} y2={y} />;
          })}
          {Array.from({ length: 10 }).map((_, i) => {
            const x = (w / 10) * i;
            return <line key={`v-${i}`} x1={x} y1="0" x2={x} y2={h} />;
          })}
        </g>

        {/* area + line */}
        <path d={area} fill="url(#area)" />
        <path d={path} fill="none" stroke="url(#line)" strokeWidth="5" />

        {/* end point dot */}
        <circle cx={w - pad} cy={pad + 10} r="0" />
      </svg>

      <div
  style={{
    position: "absolute",
    inset: 0,
    padding: 18,
    pointerEvents: "none" // overlay should not block clicks (if you ever add them)
  }}
>
  {/* TOP LEFT: badge + % */}
  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
    <div
      className="badge"
      style={{
        borderColor: "rgba(255,255,255,.12)",
        background: "rgba(7,10,18,.55)",
        backdropFilter: "blur(8px)"
      }}
    >
      <span style={{ color: "var(--accent)", fontWeight: 800 }}>G</span>-INDEX
      <span style={{ marginLeft: 10, color: "var(--muted)" }}>QTD</span>
    </div>

    <div
      className="panel"
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(7,10,18,.55)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 24px rgba(0,0,0,.35)"
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{latest.toFixed(2)}</div>
        <div
          className="badge"
          style={{
            borderColor: "rgba(77,225,193,.25)",
            background: "rgba(77,225,193,.10)"
          }}
        >
          {sign}
          {pct.toFixed(1)}%
        </div>
      </div>

    </div>
  </div>
</div>
    </div>
  );
}