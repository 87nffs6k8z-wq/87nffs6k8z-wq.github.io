export function Card({ children }: { children: React.ReactNode }) {
    return <div className="panel" style={{ padding: 16 }}>{children}</div>;
  }