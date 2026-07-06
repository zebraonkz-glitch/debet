import { getDatabase, nowIso } from '../db/database';
import type { Photo } from '../types/entities';
import type { CreatePhotoInput } from '../types/inputs';
import { mapPhoto, type PhotoRow } from '../utils/mappers';
import { deletePhotoFile, deleteProjectPhotoDirectory } from '../utils/photos';

export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  const db = await getDatabase();
  const createdAt = input.createdAt ?? nowIso();

  const result = await db.runAsync(
    `INSERT INTO photos (project_id, file_path, created_at)
     VALUES (?, ?, ?)`,
    input.projectId,
    input.filePath,
    createdAt,
  );

  const photo = await getPhotoById(result.lastInsertRowId);
  if (!photo) {
    throw new Error('Не удалось сохранить фотографию');
  }

  return photo;
}

export async function getPhotoById(id: number): Promise<Photo | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PhotoRow>(
    'SELECT * FROM photos WHERE id = ?',
    id,
  );

  return row ? mapPhoto(row) : null;
}

export async function getPhotosByProjectId(projectId: number): Promise<Photo[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PhotoRow>(
    'SELECT * FROM photos WHERE project_id = ? ORDER BY created_at ASC',
    projectId,
  );

  return rows.map(mapPhoto);
}

export async function deletePhoto(id: number): Promise<boolean> {
  const photo = await getPhotoById(id);
  if (!photo) {
    return false;
  }

  await deletePhotoFile(photo.filePath);

  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM photos WHERE id = ?', id);
  return result.changes > 0;
}

export async function deletePhotosByProjectId(projectId: number): Promise<void> {
  const photos = await getPhotosByProjectId(projectId);

  for (const photo of photos) {
    await deletePhotoFile(photo.filePath);
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM photos WHERE project_id = ?', projectId);
  await deleteProjectPhotoDirectory(projectId);
}
