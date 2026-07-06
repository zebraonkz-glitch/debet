import { Linking, Platform } from 'react-native';

export async function openInMaps(
  latitude: number,
  longitude: number,
  label?: string,
): Promise<void> {
  const encodedLabel = encodeURIComponent(label ?? 'Проект');
  const url = Platform.select({
    ios: `maps:0,0?q=${latitude},${longitude}(${encodedLabel})`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });

  if (!url) {
    return;
  }

  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  await Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  );
}
