export function Section({
    id,
    title,
    subtitle,
    children
  }: {
    id?: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) {
    return (
      <section id={id} style={{ padding: "28px 0" }}>
        <div style={{ marginBottom: 14 }}>
          <div className="kicker">G-Corp Division</div>
          <div className="h2">{title}</div>
          {subtitle ? <p className="p">{subtitle}</p> : null}
        </div>
        {children}
      </section>
    );
  }