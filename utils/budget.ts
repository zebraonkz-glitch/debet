import {
  getBudgetItemsByProjectId,
} from '../repositories/budgetItemRepository';
import {
  getExpenseTotalByBudgetItem,
  getExpenseTotalByProject,
} from '../repositories/expenseRepository';
import type {
  BudgetItemSummary,
  ProjectBudgetSummary,
} from '../types/entities';

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildBudgetItemSummary(
  item: {
    id: number;
    projectId: number;
    name: string;
    plannedAmount: number;
    order: number;
    createdAt: string;
  },
  actualAmount: number,
): BudgetItemSummary {
  const remainingAmount = roundAmount(item.plannedAmount - actualAmount);

  return {
    ...item,
    actualAmount: roundAmount(actualAmount),
    remainingAmount,
    isOverBudget: actualAmount > item.plannedAmount,
  };
}

export async function getBudgetItemSummariesByProjectId(
  projectId: number,
): Promise<BudgetItemSummary[]> {
  const items = await getBudgetItemsByProjectId(projectId);
  const summaries: BudgetItemSummary[] = [];

  for (const item of items) {
    const actualAmount = await getExpenseTotalByBudgetItem(item.id);
    summaries.push(buildBudgetItemSummary(item, actualAmount));
  }

  return summaries;
}

export function findNextBudgetItem(
  items: BudgetItemSummary[],
): BudgetItemSummary | null {
  return (
    items.find((item) => item.actualAmount < item.plannedAmount) ?? null
  );
}

export async function getProjectBudgetSummary(
  projectId: number,
): Promise<ProjectBudgetSummary> {
  const items = await getBudgetItemSummariesByProjectId(projectId);
  const plannedTotal = roundAmount(
    items.reduce((sum, item) => sum + item.plannedAmount, 0),
  );
  const actualTotal = roundAmount(await getExpenseTotalByProject(projectId));
  const remainingTotal = roundAmount(plannedTotal - actualTotal);

  return {
    projectId,
    plannedTotal,
    actualTotal,
    remainingTotal,
    isOverBudget: actualTotal > plannedTotal,
    items,
    nextBudgetItem: findNextBudgetItem(items),
  };
}

export async function isProjectOverBudget(projectId: number): Promise<boolean> {
  const summary = await getProjectBudgetSummary(projectId);
  return summary.isOverBudget;
}

export async function isBudgetItemOverBudget(
  budgetItemId: number,
  plannedAmount: number,
): Promise<boolean> {
  const actualAmount = await getExpenseTotalByBudgetItem(budgetItemId);
  return actualAmount > plannedAmount;
}
