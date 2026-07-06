import { getBudgetItemsByProjectId } from '../repositories/budgetItemRepository';
import { getExpensesByProjectAndPeriod } from '../repositories/expenseRepository';
import { getProjectById } from '../repositories/projectRepository';
import type { Expense, Project, ProjectBudgetSummary } from '../types/entities';
import { getProjectBudgetSummary } from './budget';
import { groupExpensesByBudgetItem, type ExpenseGroup } from './expenses';

export type ReportProjectSection = {
  project: Project;
  budgetSummary: ProjectBudgetSummary;
  periodExpenses: Expense[];
  periodTotal: number;
  expenseGroups: ExpenseGroup[];
  projectAmount: number;
  expensesTotal: number;
  profit: number;
};

export type ReportTotals = {
  planned: number;
  actual: number;
  remaining: number;
  periodExpenses: number;
  projectAmount: number;
  expensesTotal: number;
  profit: number;
};

export type ReportResult = {
  fromDate: string | null;
  toDate: string | null;
  sections: ReportProjectSection[];
  totals: ReportTotals;
  overBudgetProjectNames: string[];
};

export type BuildReportOptions = {
  projectIds: number[];
  fromDate?: Date | null;
  toDate?: Date | null;
};

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

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

export async function buildReport(
  options: BuildReportOptions,
): Promise<ReportResult> {
  const fromIso = options.fromDate ? startOfDayIso(options.fromDate) : undefined;
  const toIso = options.toDate ? endOfDayIso(options.toDate) : undefined;
  const sections: ReportProjectSection[] = [];

  for (const projectId of options.projectIds) {
    const project = await getProjectById(projectId);
    if (!project) {
      continue;
    }

    const budgetSummary = await getProjectBudgetSummary(projectId);
    const periodExpenses = await getExpensesByProjectAndPeriod(
      projectId,
      fromIso,
      toIso,
    );
    const budgetItems = await getBudgetItemsByProjectId(projectId);
    const expenseGroups = groupExpensesByBudgetItem(periodExpenses, budgetItems);
    const periodTotal = periodExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const expensesTotal = roundAmount(
      fromIso || toIso ? periodTotal : budgetSummary.actualTotal,
    );
    const projectAmount = roundAmount(project.amount);
    const profit = roundAmount(projectAmount - expensesTotal);

    sections.push({
      project,
      budgetSummary,
      periodExpenses,
      periodTotal: roundAmount(periodTotal),
      expenseGroups,
      projectAmount,
      expensesTotal,
      profit,
    });
  }

  const totals = sections.reduce<ReportTotals>(
    (accumulator, section) => ({
      planned: accumulator.planned + section.budgetSummary.plannedTotal,
      actual: accumulator.actual + section.budgetSummary.actualTotal,
      remaining: accumulator.remaining + section.budgetSummary.remainingTotal,
      periodExpenses: accumulator.periodExpenses + section.periodTotal,
      projectAmount: accumulator.projectAmount + section.projectAmount,
      expensesTotal: accumulator.expensesTotal + section.expensesTotal,
      profit: accumulator.profit + section.profit,
    }),
    {
      planned: 0,
      actual: 0,
      remaining: 0,
      periodExpenses: 0,
      projectAmount: 0,
      expensesTotal: 0,
      profit: 0,
    },
  );

  totals.planned = roundAmount(totals.planned);
  totals.actual = roundAmount(totals.actual);
  totals.remaining = roundAmount(totals.remaining);
  totals.periodExpenses = roundAmount(totals.periodExpenses);
  totals.projectAmount = roundAmount(totals.projectAmount);
  totals.expensesTotal = roundAmount(totals.expensesTotal);
  totals.profit = roundAmount(totals.profit);

  const overBudgetProjectNames = sections
    .filter((section) => section.budgetSummary.isOverBudget)
    .map((section) => section.project.name);

  return {
    fromDate: fromIso ?? null,
    toDate: toIso ?? null,
    sections,
    totals,
    overBudgetProjectNames,
  };
}

export function parseReportProjectIds(value: string | string[] | undefined): number[] {
  const raw = Array.isArray(value) ? value.join(',') : value ?? '';
  if (!raw.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function parseReportDateParam(
  value: string | string[] | undefined,
): Date | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
