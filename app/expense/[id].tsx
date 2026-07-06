import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenLayout title="Расход">
      <Text variant="bodyLarge">Карточка расхода #{id}</Text>
      <Text variant="bodyMedium" style={{ marginTop: 12, color: '#6b7280' }}>
        Раздел в разработке
      </Text>
    </ScreenLayout>
  );
}
