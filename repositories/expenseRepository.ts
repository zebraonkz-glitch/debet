import { getDatabase, nowIso } from '../db/database';
import type { Expense } from '../types/entities';
import type { CreateExpenseInput, UpdateExpenseInput } from '../types/inputs';
import { mapExpense, type ExpenseRow } from '../utils/mappers';

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const db = await getDatabase();
  const createdAt = input.createdAt ?? nowIso();

  const result = await db.runAsync(
    `INSERT INTO expenses (
      project_id, amount, description, created_at
    ) VALUES (?, ?, ?, ?)`,
    input.projectId,
    input.amount,
    input.description ?? '',
    createdAt,
  );

  const expense = await getExpenseById(result.lastInsertRowId);
  if (!expense) {
    throw new Error('Не удалось создать расход');
  }

  return expense;
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE id = ?',
    id,
  );

  return row ? mapExpense(row) : null;
}

export async function getExpensesByProjectId(projectId: number): Promise<Expense[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE project_id = ? ORDER BY created_at DESC',
    projectId,
  );

  return rows.map(mapExpense);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses ORDER BY created_at DESC',
  );

  return rows.map(mapExpense);
}

export async function getExpensesByProjectAndPeriod(
  projectId: number,
  fromDate?: string,
  toDate?: string,
): Promise<Expense[]> {
  const db = await getDatabase();
  const conditions = ['project_id = ?'];
  const params: (number | string)[] = [projectId];

  if (fromDate) {
    conditions.push('created_at >= ?');
    params.push(fromDate);
  }

  if (toDate) {
    conditions.push('created_at <= ?');
    params.push(toDate);
  }

  const rows = await db.getAllAsync<ExpenseRow>(
    `SELECT * FROM expenses WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    ...params,
  );

  return rows.map(mapExpense);
}

export async function updateExpense(
  id: number,
  input: UpdateExpenseInput,
): Promise<Expense | null> {
  const current = await getExpenseById(id);
  if (!current) {
    return null;
  }

  const db = await getDatabase();

  await db.runAsync(
    `UPDATE expenses
     SET project_id = ?, amount = ?, description = ?, created_at = ?
     WHERE id = ?`,
    input.projectId ?? current.projectId,
    input.amount ?? current.amount,
    input.description ?? current.description,
    input.createdAt ?? current.createdAt,
    id,
  );

  return getExpenseById(id);
}

export async function deleteExpense(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
  return result.changes > 0;
}

export async function getExpenseTotalByProject(projectId: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE project_id = ?',
    projectId,
  );

  return row?.total ?? 0;
}
