import type { BudgetItem, Expense } from '../types/entities';

export type ExpenseGroup = {
  budgetItemId: number;
  budgetItemName: string;
  expenses: Expense[];
};

export function groupExpensesByBudgetItem(
  expenses: Expense[],
  budgetItems: BudgetItem[],
): ExpenseGroup[] {
  const names = new Map(budgetItems.map((item) => [item.id, item.name]));
  const groups = new Map<number, Expense[]>();

  for (const expense of expenses) {
    const current = groups.get(expense.budgetItemId) ?? [];
    current.push(expense);
    groups.set(expense.budgetItemId, current);
  }

  const orderedIds = budgetItems.map((item) => item.id);
  const extraIds = [...groups.keys()].filter((id) => !orderedIds.includes(id));

  return [...orderedIds, ...extraIds]
    .filter((id) => groups.has(id))
    .map((budgetItemId) => ({
      budgetItemId,
      budgetItemName: names.get(budgetItemId) ?? `Пункт #${budgetItemId}`,
      expenses: groups.get(budgetItemId) ?? [],
    }));
}
