import { getBudgetItemsByProjectId } from '../repositories/budgetItemRepository';
import { getExpensesByProjectId } from '../repositories/expenseRepository';
import { getAllProjects, getProjectById } from '../repositories/projectRepository';
import type { Expense, Project, ProjectBudgetSummary } from '../types/entities';
import { getProjectBudgetSummary } from './budget';
import { groupExpensesByBudgetItem, type ExpenseGroup } from './expenses';

export type ReportProjectSection = {
  project: Project;
  budgetSummary: ProjectBudgetSummary;
  expenses: Expense[];
  expenseGroups: ExpenseGroup[];
  projectAmount: number;
  expensesTotal: number;
  profit: number;
};

export type ReportTotals = {
  planned: number;
  actual: number;
  remaining: number;
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

export function compareProjectsByDate(left: Project, right: Project): number {
  const leftTime = new Date(left.date).getTime();
  const rightTime = new Date(right.date).getTime();

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return left.id - right.id;
}

export function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort(compareProjectsByDate);
}

export function isProjectDateInPeriod(
  project: Project,
  fromDate?: Date | null,
  toDate?: Date | null,
): boolean {
  const projectTime = new Date(project.date).getTime();

  if (fromDate) {
    const fromTime = new Date(startOfDayIso(fromDate)).getTime();
    if (projectTime < fromTime) {
      return false;
    }
  }

  if (toDate) {
    const toTime = new Date(endOfDayIso(toDate)).getTime();
    if (projectTime > toTime) {
      return false;
    }
  }

  return true;
}

export async function resolveReportProjectIds(options: {
  selectedIds: number[];
  fromDate?: Date | null;
  toDate?: Date | null;
}): Promise<number[]> {
  if (options.selectedIds.length > 0) {
    const projects: Project[] = [];

    for (const projectId of options.selectedIds) {
      const project = await getProjectById(projectId);
      if (project) {
        projects.push(project);
      }
    }

    return sortProjectsByDate(projects).map((project) => project.id);
  }

  const allProjects = await getAllProjects();
  const projectsInPeriod = allProjects.filter((project) =>
    isProjectDateInPeriod(project, options.fromDate, options.toDate),
  );

  return sortProjectsByDate(projectsInPeriod).map((project) => project.id);
}

export async function buildReport(
  options: BuildReportOptions,
): Promise<ReportResult> {
  const fromIso = options.fromDate ? startOfDayIso(options.fromDate) : undefined;
  const toIso = options.toDate ? endOfDayIso(options.toDate) : undefined;
  const projectIds = await resolveReportProjectIds({
    selectedIds: options.projectIds,
    fromDate: options.fromDate,
    toDate: options.toDate,
  });
  const sections: ReportProjectSection[] = [];

  for (const projectId of projectIds) {
    const project = await getProjectById(projectId);
    if (!project) {
      continue;
    }

    const budgetSummary = await getProjectBudgetSummary(projectId);
    const expenses = await getExpensesByProjectId(projectId);
    const budgetItems = await getBudgetItemsByProjectId(projectId);
    const expenseGroups = groupExpensesByBudgetItem(expenses, budgetItems);
    const expensesTotal = roundAmount(budgetSummary.actualTotal);
    const projectAmount = roundAmount(project.amount);
    const profit = roundAmount(projectAmount - expensesTotal);

    sections.push({
      project,
      budgetSummary,
      expenses,
      expenseGroups,
      projectAmount,
      expensesTotal,
      profit,
    });
  }

  sections.sort((left, right) => compareProjectsByDate(left.project, right.project));

  const totals = sections.reduce<ReportTotals>(
    (accumulator, section) => ({
      planned: accumulator.planned + section.budgetSummary.plannedTotal,
      actual: accumulator.actual + section.budgetSummary.actualTotal,
      remaining: accumulator.remaining + section.budgetSummary.remainingTotal,
      projectAmount: accumulator.projectAmount + section.projectAmount,
      expensesTotal: accumulator.expensesTotal + section.expensesTotal,
      profit: accumulator.profit + section.profit,
    }),
    {
      planned: 0,
      actual: 0,
      remaining: 0,
      projectAmount: 0,
      expensesTotal: 0,
      profit: 0,
    },
  );

  totals.planned = roundAmount(totals.planned);
  totals.actual = roundAmount(totals.actual);
  totals.remaining = roundAmount(totals.remaining);
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
