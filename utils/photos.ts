import { Directory, File, Paths } from 'expo-file-system';

const PHOTOS_DIR_NAME = 'photos';

function getPhotosRootDirectory(): Directory {
  const directory = new Directory(Paths.document, PHOTOS_DIR_NAME);

  if (!directory.exists) {
    directory.create({ idempotent: true });
  }

  return directory;
}

function getProjectPhotosDirectory(projectId: number): Directory {
  const directory = new Directory(getPhotosRootDirectory(), String(projectId));

  if (!directory.exists) {
    directory.create({ idempotent: true });
  }

  return directory;
}

function getExtensionFromUri(uri: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);

  return match?.[1]?.toLowerCase() ?? 'jpg';
}

function createPhotoFileName(extension: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

export async function savePhotoFromUri(
  sourceUri: string,
  projectId: number,
): Promise<string> {
  const extension = getExtensionFromUri(sourceUri);
  const fileName = createPhotoFileName(extension);
  const destination = new File(getProjectPhotosDirectory(projectId), fileName);
  const source = new File(sourceUri);

  await source.copy(destination);

  return destination.uri;
}

export async function deletePhotoFile(filePath: string): Promise<void> {
  const file = new File(filePath);

  if (file.exists) {
    file.delete();
  }
}

export async function deleteProjectPhotoDirectory(
  projectId: number,
): Promise<void> {
  const directory = new Directory(getPhotosRootDirectory(), String(projectId));

  if (directory.exists) {
    directory.delete();
  }
}
