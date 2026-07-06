import type { Expense } from '../types/entities';

function startOfDayIso(date: Date): string {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

function endOfDayIso(date: Date): string {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
}

export function isExpenseDateInPeriod(
  expense: Expense,
  fromDate?: Date | null,
  toDate?: Date | null,
): boolean {
  const expenseTime = new Date(expense.createdAt).getTime();

  if (fromDate) {
    const fromTime = new Date(startOfDayIso(fromDate)).getTime();
    if (expenseTime < fromTime) {
      return false;
    }
  }

  if (toDate) {
    const toTime = new Date(endOfDayIso(toDate)).getTime();
    if (expenseTime > toTime) {
      return false;
    }
  }

  return true;
}

export function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return right.id - left.id;
  });
}
