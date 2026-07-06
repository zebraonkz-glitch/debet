import { Text } from 'react-native-paper';

import { ScreenLayout } from './ScreenLayout';

type PlaceholderScreenProps = {
  title: string;
  description?: string;
};

export function PlaceholderScreen({
  title,
  description = 'Раздел в разработке',
}: PlaceholderScreenProps) {
  return (
    <ScreenLayout title={title}>
      <Text variant="bodyLarge">{description}</Text>
    </ScreenLayout>
  );
}
