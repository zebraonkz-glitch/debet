import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import { formatCoordinates } from '../../utils/format';

export default function ProjectMapScreen() {
  const { lat, lng, name } = useLocalSearchParams<{
    lat: string;
    lng: string;
    name?: string;
  }>();

  const latitude = Number(lat);
  const longitude = Number(lng);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!hasCoordinates) {
    return (
      <ScreenLayout title="Карта" scrollable={false}>
        <Text variant="bodyLarge">Координаты не заданы</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={name ?? 'Карта'} scrollable={false}>
      <Text variant="bodyMedium" style={styles.coords}>
        {formatCoordinates(latitude, longitude)}
      </Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={name ?? 'Проект'}
          />
        </MapView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  coords: {
    paddingBottom: 12,
    color: '#1a5fb4',
  },
  mapContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  map: {
    flex: 1,
    borderRadius: 12,
  },
});
