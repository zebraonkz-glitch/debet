import { getDatabase } from '../db/database';
import type { Executor } from '../types/entities';
import type { CreateExecutorInput, UpdateExecutorInput } from '../types/inputs';
import { mapExecutor, type ExecutorRow } from '../utils/mappers';

export async function createExecutor(
  input: CreateExecutorInput,
): Promise<Executor> {
  const db = await getDatabase();

  const result = await db.runAsync(
    `INSERT INTO executors (name, phone, email, note)
     VALUES (?, ?, ?, ?)`,
    input.name,
    input.phone ?? '',
    input.email ?? '',
    input.note ?? '',
  );

  const executor = await getExecutorById(result.lastInsertRowId);
  if (!executor) {
    throw new Error('Не удалось создать исполнителя');
  }

  return executor;
}

export async function getExecutorById(id: number): Promise<Executor | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExecutorRow>(
    'SELECT * FROM executors WHERE id = ?',
    id,
  );

  return row ? mapExecutor(row) : null;
}

export async function getAllExecutors(): Promise<Executor[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExecutorRow>(
    'SELECT * FROM executors ORDER BY name COLLATE NOCASE ASC',
  );

  return rows.map(mapExecutor);
}

export async function updateExecutor(
  id: number,
  input: UpdateExecutorInput,
): Promise<Executor | null> {
  const current = await getExecutorById(id);
  if (!current) {
    return null;
  }

  const db = await getDatabase();

  await db.runAsync(
    `UPDATE executors
     SET name = ?, phone = ?, email = ?, note = ?
     WHERE id = ?`,
    input.name ?? current.name,
    input.phone ?? current.phone,
    input.email ?? current.email,
    input.note ?? current.note,
    id,
  );

  return getExecutorById(id);
}

export async function deleteExecutor(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM executors WHERE id = ?', id);
  return result.changes > 0;
}
