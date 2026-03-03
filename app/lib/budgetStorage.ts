export const BUDGET_KEY = "budgetApp:v1";

export type PayCycle = "biweekly" | "semimonthly";

export type Expense = {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
};

export type RecurringExpense = {
  id: string;
  name: string;
  amount: number;
  cadence: "monthly" | "annual";
  dueDay?: number;
  dueMonth?: number;
};

export type Income = {
  id: string;
  name: string;
  amount: number;
  cadence: "monthly" | "annual";
  payCycle: PayCycle;
  lastPaycheckDate: string;
};

export type BudgetCategory = {
  id: string;
  name: string;
  percent: number;
};

export type OnboardingExpense = {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "per-paycheck";
};

export type Allocation = {
  id: string;
  name: string;
  mode: "percent" | "fixed";
  value: number;
};

export type BudgetState = {
  settings: {
    payCycleType: PayCycle;
    paycheckAmount: number;
  };
  expenses: OnboardingExpense[];
  allocations: Allocation[];
  meta: {
    onboardingComplete: boolean;
    version: 1;
    createdAt: string;
  };
  incomeMonthly: number;
  payCycle: PayCycle;
  lastPaycheckDate: string;
  recurringExpenses: RecurringExpense[];
  incomes: Income[];
  paycheckAmount: number;
  budgetCategories: BudgetCategory[];
};

export function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function defaultBudget(overrides?: Partial<BudgetState>): BudgetState {
  const base: BudgetState = {
    settings: {
      payCycleType: "biweekly",
      paycheckAmount: 0,
    },
    expenses: [],
    allocations: [],
    meta: {
      onboardingComplete: false,
      version: 1,
      createdAt: new Date().toISOString(),
    },
    incomeMonthly: 0,
    payCycle: "biweekly",
    lastPaycheckDate: "",
    recurringExpenses: [],
    incomes: [],
    paycheckAmount: 0,
    budgetCategories: [],
  };

  return {
    ...base,
    ...overrides,
    settings: {
      ...base.settings,
      ...(overrides?.settings || {}),
    },
    meta: {
      ...base.meta,
      ...(overrides?.meta || {}),
    },
    expenses: Array.isArray(overrides?.expenses) ? overrides.expenses : base.expenses,
    allocations: Array.isArray(overrides?.allocations) ? overrides.allocations : base.allocations,
    recurringExpenses: Array.isArray(overrides?.recurringExpenses) ? overrides.recurringExpenses : base.recurringExpenses,
    incomes: Array.isArray(overrides?.incomes) ? overrides.incomes : base.incomes,
    budgetCategories: Array.isArray(overrides?.budgetCategories) ? overrides.budgetCategories : base.budgetCategories,
  };
}

function normalizeParsed(parsed: any): BudgetState {
  const payCycle: PayCycle = parsed?.payCycle === "semimonthly" ? "semimonthly" : "biweekly";
  const paycheckAmount = Math.max(0, Number(parsed?.paycheckAmount ?? parsed?.settings?.paycheckAmount ?? 0) || 0);
  const payCycleType: PayCycle = parsed?.settings?.payCycleType === "semimonthly" ? "semimonthly" : payCycle;

  const expenses: OnboardingExpense[] = Array.isArray(parsed?.expenses)
    ? parsed.expenses
        .map((item: any) => ({
          id: typeof item?.id === "string" ? item.id : newId(),
          name: typeof item?.name === "string" ? item.name : "",
          amount: Math.max(0, Number(item?.amount ?? 0) || 0),
          frequency: item?.frequency === "per-paycheck" ? "per-paycheck" : "monthly",
        }))
        .filter((item: OnboardingExpense) => item.name.trim().length > 0)
    : [];

  const allocations: Allocation[] = Array.isArray(parsed?.allocations)
    ? parsed.allocations
        .map((item: any) => ({
          id: typeof item?.id === "string" ? item.id : newId(),
          name: typeof item?.name === "string" ? item.name : "",
          mode: item?.mode === "fixed" ? "fixed" : "percent",
          value: Math.max(0, Number(item?.value ?? 0) || 0),
        }))
        .filter((item: Allocation) => item.name.trim().length > 0)
    : [];

  const recurringExpenses: RecurringExpense[] = Array.isArray(parsed?.recurringExpenses) ? parsed.recurringExpenses : [];
  const rawBudgetCategories: BudgetCategory[] = Array.isArray(parsed?.budgetCategories) ? parsed.budgetCategories : [];
  const incomes: Income[] = Array.isArray(parsed?.incomes) ? parsed.incomes : [];
  const fixedAllocationIds = new Set(allocations.filter((item) => item.mode === "fixed").map((item) => item.id));
  let budgetCategories: BudgetCategory[] = rawBudgetCategories.filter((item) => !fixedAllocationIds.has(item.id));

  // Backward compatibility: if categories are missing, rebuild percentage categories from percent allocations.
  if (budgetCategories.length === 0 && allocations.length > 0) {
    budgetCategories = allocations
      .filter((item) => item.mode === "percent")
      .map((item) => ({
        id: item.id,
        name: item.name,
        percent: item.value,
      }));
  }

  return defaultBudget({
    settings: {
      payCycleType,
      paycheckAmount,
    },
    expenses,
    allocations,
    meta: {
      onboardingComplete: !!parsed?.meta?.onboardingComplete,
      version: 1,
      createdAt: typeof parsed?.meta?.createdAt === "string" ? parsed.meta.createdAt : new Date().toISOString(),
    },
    incomeMonthly: Math.max(0, Number(parsed?.incomeMonthly ?? 0) || 0),
    payCycle,
    lastPaycheckDate: typeof parsed?.lastPaycheckDate === "string" ? parsed.lastPaycheckDate : "",
    recurringExpenses,
    incomes,
    paycheckAmount,
    budgetCategories,
  });
}

function migrateLegacyState(): BudgetState | null {
  if (typeof window === "undefined") return null;

  const legacyKeys = [
    "neoBudget.state.v5",
    "neoBudget.state.v4",
    "neoBudget.state.v3",
    "neoBudget.state.v2",
    "neoBudget.state.v1",
  ];

  for (const key of legacyKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as any;
      const payCycle: PayCycle = parsed?.payCycle === "semimonthly" ? "semimonthly" : "biweekly";
      const paycheckAmount = Math.max(0, Number(parsed?.paycheckAmount ?? 0) || 0);
      const recurringExpenses: RecurringExpense[] = Array.isArray(parsed?.recurringExpenses) ? parsed.recurringExpenses : [];
      const budgetCategories: BudgetCategory[] = Array.isArray(parsed?.budgetCategories) ? parsed.budgetCategories : [];

      const migrated = defaultBudget({
        settings: { payCycleType: payCycle, paycheckAmount },
        expenses: [],
        allocations: budgetCategories.map((c) => ({
          id: typeof c.id === "string" ? c.id : newId(),
          name: typeof c.name === "string" ? c.name : "",
          mode: "percent",
          value: Math.max(0, Number(c.percent ?? 0) || 0),
        })),
        meta: {
          onboardingComplete: true,
          version: 1,
          createdAt: new Date().toISOString(),
        },
        incomeMonthly: Math.max(0, Number(parsed?.incomeMonthly ?? 0) || 0),
        payCycle,
        lastPaycheckDate: typeof parsed?.lastPaycheckDate === "string" ? parsed.lastPaycheckDate : "",
        recurringExpenses,
        incomes: Array.isArray(parsed?.incomes) ? parsed.incomes : [],
        paycheckAmount,
        budgetCategories,
      });

      saveBudget(migrated);
      return migrated;
    } catch {
      return null;
    }
  }

  return null;
}

export function loadBudget(): BudgetState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw || raw.trim().length === 0) {
      return migrateLegacyState();
    }
    return normalizeParsed(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveBudget(data: BudgetState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUDGET_KEY, JSON.stringify(data));
}

export function clearBudget() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BUDGET_KEY);
  localStorage.removeItem("neoBudget.state.v5");
  localStorage.removeItem("neoBudget.state.v4");
  localStorage.removeItem("neoBudget.state.v3");
  localStorage.removeItem("neoBudget.state.v2");
  localStorage.removeItem("neoBudget.state.v1");
}
