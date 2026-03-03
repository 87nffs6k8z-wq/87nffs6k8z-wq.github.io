"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const items: Item[] = [
  { href: "/", label: "Overview", icon: "◈" },
  { href: "/expenses", label: "Expenses", icon: "◬" },
  { href: "/budget", label: "Budget", icon: "▣" },
  { href: "/income", label: "Income", icon: "⟐" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <nav className="bottomNav" aria-label="Primary">
      <ul className="bottomNavList">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="bottomNavItem">
              <Link
                href={item.href}
                className={`bottomNavLink ${active ? "isActive" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="bottomNavIcon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="bottomNavLabel">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
