import { getExpensesByProjectId } from '../repositories/expenseRepository';
import { getAllProjects, getProjectById } from '../repositories/projectRepository';
import type { Expense, Project } from '../types/entities';
import {
  compareProjectsByDate,
  isProjectDateInPeriod,
  sortProjectsByDate,
} from './projects';

export type ReportProjectSection = {
  project: Project;
  expenses: Expense[];
  projectAmount: number;
  expensesTotal: number;
  profit: number;
};

export type ReportTotals = {
  projectAmount: number;
  expensesTotal: number;
  profit: number;
};

export type ReportResult = {
  fromDate: string | null;
  toDate: string | null;
  sections: ReportProjectSection[];
  totals: ReportTotals;
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

    const expenses = await getExpensesByProjectId(projectId);
    const expensesTotal = roundAmount(
      expenses.reduce((sum, expense) => sum + expense.amount, 0),
    );
    const projectAmount = roundAmount(project.amount);
    const profit = roundAmount(projectAmount - expensesTotal);

    sections.push({
      project,
      expenses,
      projectAmount,
      expensesTotal,
      profit,
    });
  }

  sections.sort((left, right) => compareProjectsByDate(left.project, right.project));

  const totals = sections.reduce<ReportTotals>(
    (accumulator, section) => ({
      projectAmount: accumulator.projectAmount + section.projectAmount,
      expensesTotal: accumulator.expensesTotal + section.expensesTotal,
      profit: accumulator.profit + section.profit,
    }),
    { projectAmount: 0, expensesTotal: 0, profit: 0 },
  );

  totals.projectAmount = roundAmount(totals.projectAmount);
  totals.expensesTotal = roundAmount(totals.expensesTotal);
  totals.profit = roundAmount(totals.profit);

  return {
    fromDate: fromIso ?? null,
    toDate: toIso ?? null,
    sections,
    totals,
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
