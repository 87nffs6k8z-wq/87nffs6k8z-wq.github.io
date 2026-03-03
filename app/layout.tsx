import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";

export const metadata: Metadata = {
  title: "Neo Budget",
  description: "A simple, futuristic budgeting starter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bgGrid" aria-hidden="true" />
        <div className="bgGlow" aria-hidden="true" />

        <SiteHeader />

        <main id="main" className="main">
          <OnboardingGate>{children}</OnboardingGate>
        </main>

        <footer className="footer" aria-label="Footer">
          <p className="muted">
            Built for GitHub Pages static export. Keyboard-friendly. Reduced-motion aware.
          </p>
        </footer>

        {/* Mobile-only bottom navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
