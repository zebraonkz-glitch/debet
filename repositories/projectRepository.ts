import { getDatabase, nowIso } from '../db/database';
import type { Project } from '../types/entities';
import type { CreateProjectInput, UpdateProjectInput } from '../types/inputs';
import { mapProject, type ProjectRow } from '../utils/mappers';
import { deletePhotosByProjectId } from './photoRepository';

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const db = await getDatabase();
  const createdAt = input.createdAt ?? nowIso();

  const result = await db.runAsync(
    `INSERT INTO projects (
      name, description, visitlater, liked, latitude, longitude, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.description ?? '',
    input.finished === false ? 1 : 0,
    input.liked ? 1 : 0,
    input.dd?.latitude ?? null,
    input.dd?.longitude ?? null,
    createdAt,
  );

  const project = await getProjectById(result.lastInsertRowId);
  if (!project) {
    throw new Error('Не удалось создать проект');
  }

  return project;
}

export async function getProjectById(id: number): Promise<Project | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProjectRow>(
    'SELECT * FROM projects WHERE id = ?',
    id,
  );

  return row ? mapProject(row) : null;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProjectRow>(
    'SELECT * FROM projects ORDER BY created_at DESC',
  );

  return rows.map(mapProject);
}

export async function getProjectsByFlags(options: {
  finished?: boolean;
  liked?: boolean;
}): Promise<Project[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const params: number[] = [];

  if (options.finished !== undefined) {
    conditions.push('visitlater = ?');
    params.push(options.finished ? 0 : 1);
  }

  if (options.liked !== undefined) {
    conditions.push('liked = ?');
    params.push(options.liked ? 1 : 0);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await db.getAllAsync<ProjectRow>(
    `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC`,
    ...params,
  );

  return rows.map(mapProject);
}

export async function updateProject(
  id: number,
  input: UpdateProjectInput,
): Promise<Project | null> {
  const current = await getProjectById(id);
  if (!current) {
    return null;
  }

  const db = await getDatabase();
  const dd = input.dd !== undefined ? input.dd : current.dd;

  await db.runAsync(
    `UPDATE projects
     SET name = ?, description = ?, visitlater = ?, liked = ?, latitude = ?, longitude = ?
     WHERE id = ?`,
    input.name ?? current.name,
    input.description ?? current.description,
    (input.finished ?? current.finished) ? 0 : 1,
    (input.liked ?? current.liked) ? 1 : 0,
    dd?.latitude ?? null,
    dd?.longitude ?? null,
    id,
  );

  return getProjectById(id);
}

export async function deleteProject(id: number): Promise<boolean> {
  const db = await getDatabase();
  await deletePhotosByProjectId(id);

  const result = await db.runAsync('DELETE FROM projects WHERE id = ?', id);
  return result.changes > 0;
}
