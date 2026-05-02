import { ReactNode } from "react";

export function PaperTable({
  headers,
  children,
  className = "",
}: {
  headers: ReactNode[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ledgerTableWrap ${className}`.trim()}>
      <table className="paperTable ledgerTable">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={typeof h === "string" ? h : `col-${i}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
