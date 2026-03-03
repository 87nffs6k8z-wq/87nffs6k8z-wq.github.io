"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadBudget } from "../lib/budgetStorage";
import { useHydrated } from "../lib/useHydrated";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const state = loadBudget();
    const complete = !!state?.meta?.onboardingComplete;
    const onOnboarding = pathname === "/onboarding";

    if (!complete && !onOnboarding) {
      setReady(false);
      router.replace("/onboarding");
      return;
    }

    if (complete && onOnboarding) {
      setReady(false);
      router.replace("/");
      return;
    }

    setReady(true);
  }, [hydrated, pathname, router]);

  if (!hydrated || !ready) return null;
  return <>{children}</>;
}
