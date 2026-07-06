import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';

export default function ReportsScreen() {
  return (
    <ScreenLayout title="Отчёты">
      <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
        Сводные отчёты будут реализованы на следующем этапе.
      </Text>
      <Button mode="outlined" onPress={() => router.push('/reports/form')}>
        Открыть форму отчёта
      </Button>
    </ScreenLayout>
  );
}
