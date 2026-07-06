import { getDatabase, nowIso } from '../db/database';
import type { BudgetItem } from '../types/entities';
import type {
  CreateBudgetItemInput,
  UpdateBudgetItemInput,
} from '../types/inputs';
import { mapBudgetItem, type BudgetItemRow } from '../utils/mappers';

async function getNextOrder(projectId: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ maxOrder: number | null }>(
    'SELECT MAX(sort_order) AS maxOrder FROM budget_items WHERE project_id = ?',
    projectId,
  );

  return (row?.maxOrder ?? -1) + 1;
}

export async function createBudgetItem(
  input: CreateBudgetItemInput,
): Promise<BudgetItem> {
  const db = await getDatabase();
  const createdAt = input.createdAt ?? nowIso();
  const order =
    input.order !== undefined ? input.order : await getNextOrder(input.projectId);

  const result = await db.runAsync(
    `INSERT INTO budget_items (
      project_id, name, planned_amount, sort_order, created_at
    ) VALUES (?, ?, ?, ?, ?)`,
    input.projectId,
    input.name,
    input.plannedAmount,
    order,
    createdAt,
  );

  const item = await getBudgetItemById(result.lastInsertRowId);
  if (!item) {
    throw new Error('Не удалось создать пункт бюджета');
  }

  return item;
}

export async function getBudgetItemById(id: number): Promise<BudgetItem | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BudgetItemRow>(
    'SELECT * FROM budget_items WHERE id = ?',
    id,
  );

  return row ? mapBudgetItem(row) : null;
}

export async function getBudgetItemsByProjectId(
  projectId: number,
): Promise<BudgetItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BudgetItemRow>(
    'SELECT * FROM budget_items WHERE project_id = ? ORDER BY sort_order ASC, id ASC',
    projectId,
  );

  return rows.map(mapBudgetItem);
}

export async function updateBudgetItem(
  id: number,
  input: UpdateBudgetItemInput,
): Promise<BudgetItem | null> {
  const current = await getBudgetItemById(id);
  if (!current) {
    return null;
  }

  const db = await getDatabase();

  await db.runAsync(
    `UPDATE budget_items
     SET name = ?, planned_amount = ?, sort_order = ?
     WHERE id = ?`,
    input.name ?? current.name,
    input.plannedAmount ?? current.plannedAmount,
    input.order ?? current.order,
    id,
  );

  return getBudgetItemById(id);
}

export async function deleteBudgetItem(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM budget_items WHERE id = ?', id);
  return result.changes > 0;
}
