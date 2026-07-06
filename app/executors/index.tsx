import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, FAB, Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import { getAllExecutors } from '../../repositories/executorRepository';
import type { Executor } from '../../types/entities';

export default function ExecutorsScreen() {
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExecutors = useCallback(async () => {
    setLoading(true);
    try {
      setExecutors(await getAllExecutors());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadExecutors();
    }, [loadExecutors]),
  );

  return (
    <ScreenLayout title="Исполнители" scrollable={false}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : executors.length === 0 ? (
        <Text variant="bodyLarge" style={styles.empty}>
          Исполнители не созданы
        </Text>
      ) : (
        <View style={styles.list}>
          {executors.map((executor) => (
            <Pressable
              key={executor.id}
              onPress={() => router.push(`/executor/${executor.id}`)}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium">{executor.name}</Text>
                  {executor.phone ? (
                    <Text variant="bodySmall" style={styles.contact}>
                      {executor.phone}
                    </Text>
                  ) : null}
                  {executor.email ? (
                    <Text variant="bodySmall" style={styles.contact}>
                      {executor.email}
                    </Text>
                  ) : null}
                </Card.Content>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/executor/create')}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 24,
  },
  empty: {
    color: '#6b7280',
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
    paddingBottom: 88,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  contact: {
    color: '#6b7280',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1a5fb4',
  },
});
