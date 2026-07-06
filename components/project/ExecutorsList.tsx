import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';

import type { Executor } from '../../types/entities';

type ExecutorsListProps = {
  executors: Executor[];
  onAdd: () => void;
  onRemove: (executorId: number) => void;
};

export function ExecutorsList({
  executors,
  onAdd,
  onRemove,
}: ExecutorsListProps) {
  const openPhone = (phone: string) => {
    void Linking.openURL(`tel:${phone}`);
  };

  const openEmail = (email: string) => {
    void Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Исполнители
        </Text>
        <Button mode="outlined" compact onPress={onAdd}>
          Добавить
        </Button>
      </View>

      {executors.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          Исполнители не привязаны
        </Text>
      ) : (
        executors.map((executor) => (
          <Card key={executor.id} style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Pressable
                  style={styles.info}
                  onPress={() => router.push(`/executor/${executor.id}`)}
                >
                  <Text variant="titleSmall">{executor.name}</Text>
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
                  {executor.note ? (
                    <Text variant="bodySmall" style={styles.note}>
                      {executor.note}
                    </Text>
                  ) : null}
                </Pressable>

                <View style={styles.actions}>
                  {executor.phone ? (
                    <IconButton
                      icon="phone"
                      size={18}
                      onPress={() => openPhone(executor.phone)}
                    />
                  ) : null}
                  {executor.email ? (
                    <IconButton
                      icon="email"
                      size={18}
                      onPress={() => openEmail(executor.email)}
                    />
                  ) : null}
                  <IconButton
                    icon="pencil"
                    size={18}
                    onPress={() => router.push(`/executor/${executor.id}`)}
                  />
                  <IconButton
                    icon="link-off"
                    size={18}
                    onPress={() => onRemove(executor.id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#1a1a2e',
  },
  empty: {
    color: '#6b7280',
  },
  card: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    paddingRight: 4,
  },
  contact: {
    color: '#5c6370',
    marginTop: 2,
  },
  note: {
    color: '#6b7280',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginRight: -8,
  },
});
