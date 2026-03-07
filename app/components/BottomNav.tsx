"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Item = { href: string; label: string; icon: ReactNode };

const items: Item[] = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h4v8H4zm6-6h4v14h-4zm6 3h4v11h-4z" />
      </svg>
    ),
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/budget",
    label: "Budget",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="7" height="7" />
        <rect x="13" y="4" width="7" height="7" />
        <rect x="4" y="13" width="7" height="7" />
        <rect x="13" y="13" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/income",
    label: "Income",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4v16M7.5 8.5A3.5 3.5 0 0 1 11 5h2a3.5 3.5 0 1 1 0 7h-2a3.5 3.5 0 1 0 0 7h2a3.5 3.5 0 0 0 3.5-3.5" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.5v2.1M12 19.4v2.1M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.5 12h2.1M19.4 12h2.1M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
      </svg>
    ),
  },
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
