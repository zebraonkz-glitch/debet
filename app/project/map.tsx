import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import { formatCoordinates } from '../../utils/format';
import { openInMaps } from '../../utils/openInMaps';

export default function ProjectMapScreen() {
  const { lat, lng, name } = useLocalSearchParams<{
    lat: string;
    lng: string;
    name?: string;
  }>();

  const latitude = Number(lat);
  const longitude = Number(lng);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const projectName = name ?? 'Проект';

  if (!hasCoordinates) {
    return (
      <ScreenLayout title="Карта" scrollable={false}>
        <Text variant="bodyLarge">Координаты не заданы</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={projectName} scrollable={false}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            Координаты проекта
          </Text>
          <Text variant="bodyLarge" style={styles.coords}>
            {formatCoordinates(latitude, longitude)}
          </Text>
          <Text variant="bodyMedium" style={styles.hint}>
            Встроенная карта недоступна в Expo Go. Откройте точку во внешнем
            приложении «Карты».
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="map"
          onPress={() => openInMaps(latitude, longitude, projectName)}
        >
          Открыть в приложении «Карты»
        </Button>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  label: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  coords: {
    color: '#1a5fb4',
    marginBottom: 12,
  },
  hint: {
    color: '#6b7280',
  },
  actions: {
    gap: 12,
  },
});
