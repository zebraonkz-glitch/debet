import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import type { Expense } from '../../types/entities';
import { formatDate, formatMoney } from '../../utils/format';

type ExpenseListCardProps = {
  expense: Expense;
  projectName: string;
};

export function ExpenseListCard({ expense, projectName }: ExpenseListCardProps) {
  return (
    <Pressable onPress={() => router.push(`/expense/${expense.id}`)}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.project}>
            {projectName}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {formatDate(expense.createdAt)} · {formatMoney(expense.amount)}
          </Text>
          {expense.description ? (
            <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
              {expense.description}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  project: {
    color: '#1a1a2e',
    marginBottom: 4,
  },
  meta: {
    color: '#9aa0a6',
    marginBottom: 4,
  },
  description: {
    color: '#5c6370',
  },
});
