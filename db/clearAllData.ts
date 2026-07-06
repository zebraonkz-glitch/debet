import { Directory, Paths } from 'expo-file-system';

import { getDatabase } from './database';

const PHOTOS_DIR_NAME = 'photos';

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    DELETE FROM photos;
    DELETE FROM expenses;
    DELETE FROM project_executors;
    DELETE FROM executors;
    DELETE FROM projects;
  `);

  const photosRoot = new Directory(Paths.document, PHOTOS_DIR_NAME);

  if (photosRoot.exists) {
    photosRoot.delete();
  }
}
