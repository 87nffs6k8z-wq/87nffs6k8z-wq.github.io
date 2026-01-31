import schedule from "@/content/schedule.json";
import { Card } from "@/components/Card";

export function Schedule() {
  return (
    <Card>
      <div className="kicker">Timezone: {(schedule as any).timezone}</div>
      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {(schedule as any).items.map((it: any, idx: number) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.08)",
              background: "rgba(255,255,255,.03)"
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ width: 44, fontWeight: 800, color: "var(--secondary)" }}>{it.day}</div>
              <div style={{ fontWeight: 700 }}>{it.title}</div>
            </div>
            <div style={{ color: "var(--muted)" }}>{it.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}