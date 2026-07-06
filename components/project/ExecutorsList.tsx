import { Linking, StyleSheet, View } from 'react-native';
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
                <View style={styles.info}>
                  <Text variant="titleSmall">{executor.name}</Text>
                  {executor.phone ? (
                    <Text
                      variant="bodySmall"
                      style={styles.link}
                      onPress={() => openPhone(executor.phone)}
                    >
                      {executor.phone}
                    </Text>
                  ) : null}
                  {executor.email ? (
                    <Text
                      variant="bodySmall"
                      style={styles.link}
                      onPress={() => openEmail(executor.email)}
                    >
                      {executor.email}
                    </Text>
                  ) : null}
                  {executor.note ? (
                    <Text variant="bodySmall" style={styles.note}>
                      {executor.note}
                    </Text>
                  ) : null}
                </View>
                <IconButton
                  icon="link-off"
                  onPress={() => onRemove(executor.id)}
                />
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
  },
  link: {
    color: '#1a5fb4',
    marginTop: 2,
  },
  note: {
    color: '#6b7280',
    marginTop: 4,
  },
});
