import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type AppPermissions = {
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
  location: PermissionStatus;
};

function mapStatus(status: ImagePicker.PermissionStatus): PermissionStatus {
  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return 'granted';
  }

  if (status === ImagePicker.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

function mapLocationStatus(status: Location.PermissionStatus): PermissionStatus {
  if (status === Location.PermissionStatus.GRANTED) {
    return 'granted';
  }

  if (status === Location.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

export function getPermissionStatusLabel(status: PermissionStatus): string {
  switch (status) {
    case 'granted':
      return 'Разрешено';
    case 'denied':
      return 'Запрещено';
    default:
      return 'Не запрошено';
  }
}

export async function getAppPermissions(): Promise<AppPermissions> {
  const [camera, mediaLibrary, location] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
  ]);

  return {
    camera: mapStatus(camera.status),
    mediaLibrary: mapStatus(mediaLibrary.status),
    location: mapLocationStatus(location.status),
  };
}

export async function requestCameraPermission(): Promise<PermissionStatus> {
  const result = await ImagePicker.requestCameraPermissionsAsync();
  return mapStatus(result.status);
}

export async function requestMediaLibraryPermission(): Promise<PermissionStatus> {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return mapStatus(result.status);
}

export async function requestLocationPermission(): Promise<PermissionStatus> {
  const result = await Location.requestForegroundPermissionsAsync();
  return mapLocationStatus(result.status);
}
