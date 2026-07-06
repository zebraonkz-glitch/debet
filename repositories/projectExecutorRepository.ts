import { getDatabase } from '../db/database';
import type { Executor } from '../types/entities';
import { mapExecutor, type ExecutorRow } from '../utils/mappers';

export async function linkExecutorToProject(
  projectId: number,
  executorId: number,
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR IGNORE INTO project_executors (project_id, executor_id)
     VALUES (?, ?)`,
    projectId,
    executorId,
  );
}

export async function unlinkExecutorFromProject(
  projectId: number,
  executorId: number,
): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'DELETE FROM project_executors WHERE project_id = ? AND executor_id = ?',
    projectId,
    executorId,
  );

  return result.changes > 0;
}

export async function getExecutorsByProjectId(
  projectId: number,
): Promise<Executor[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExecutorRow>(
    `SELECT e.*
     FROM executors e
     INNER JOIN project_executors pe ON pe.executor_id = e.id
     WHERE pe.project_id = ?
     ORDER BY e.name COLLATE NOCASE ASC`,
    projectId,
  );

  return rows.map(mapExecutor);
}

export async function getProjectIdsByExecutorId(
  executorId: number,
): Promise<number[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ project_id: number }>(
    'SELECT project_id FROM project_executors WHERE executor_id = ?',
    executorId,
  );

  return rows.map((row) => row.project_id);
}
