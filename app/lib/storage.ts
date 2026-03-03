import {
  defaultBudget,
  loadBudget,
  newId,
  saveBudget,
  type BudgetCategory,
  type BudgetState,
  type Expense,
  type Income,
  type PayCycle,
  type RecurringExpense,
} from "./budgetStorage";

export type { BudgetCategory, BudgetState, Expense, Income, PayCycle, RecurringExpense };

export function defaultState(): BudgetState {
  return defaultBudget();
}

export function loadState(): BudgetState {
  return loadBudget() ?? defaultBudget();
}

export function saveState(state: BudgetState) {
  saveBudget(state);
}

export { newId };
