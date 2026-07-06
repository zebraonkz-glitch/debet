import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';

export default function SettingsScreen() {
  return (
    <ScreenLayout title="Настройки">
      <Text variant="bodyLarge" style={styles.description}>
        Параметры приложения будут расширены на следующем этапе.
      </Text>

      <View style={styles.links}>
        <Button
          mode="outlined"
          icon="account-group"
          onPress={() => router.push('/executors')}
        >
          Все исполнители
        </Button>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  description: {
    color: '#6b7280',
    marginBottom: 16,
  },
  links: {
    gap: 12,
  },
});
