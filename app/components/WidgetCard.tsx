import { ReactNode } from "react";

export function WidgetCard({
  title,
  children,
  actions,
  className = "",
  role,
}: {
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  role?: React.AriaRole;
}) {
  return (
    <div className={`widgetCard ${className}`.trim()} role={role}>
      <div className="cardHeader">
        <h2 className="h2">{title}</h2>
        {actions ? <div className="sectionActions">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
