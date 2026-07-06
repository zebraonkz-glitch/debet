import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import type { ExpenseGroup } from '../../utils/expenses';
import { formatDate, formatMoney } from '../../utils/format';

type ProjectExpensesListProps = {
  groups: ExpenseGroup[];
  onAdd: () => void;
};

export function ProjectExpensesList({ groups, onAdd }: ProjectExpensesListProps) {
  const totalExpenses = groups.reduce(
    (sum, group) => sum + group.expenses.length,
    0,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Расходы
        </Text>
        <Button mode="outlined" compact onPress={onAdd}>
          Добавить
        </Button>
      </View>

      {totalExpenses === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          Расходы пока не добавлены
        </Text>
      ) : (
        groups.map((group) => (
          <View key={group.budgetItemId} style={styles.group}>
            <Text variant="titleSmall" style={styles.groupTitle}>
              {group.budgetItemName}
            </Text>
            {group.expenses.map((expense) => (
              <Pressable
                key={expense.id}
                onPress={() => router.push(`/expense/${expense.id}`)}
              >
                <Card style={styles.card} mode="elevated">
                  <Card.Content>
                    <View style={styles.row}>
                      <Text variant="titleSmall" style={styles.amount}>
                        {formatMoney(expense.amount)}
                      </Text>
                      <Text variant="bodySmall" style={styles.date}>
                        {formatDate(expense.createdAt)}
                      </Text>
                    </View>
                    {expense.description ? (
                      <Text variant="bodyMedium" style={styles.description}>
                        {expense.description}
                      </Text>
                    ) : null}
                  </Card.Content>
                </Card>
              </Pressable>
            ))}
          </View>
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
  group: {
    marginBottom: 12,
  },
  groupTitle: {
    color: '#1a5fb4',
    marginBottom: 6,
  },
  card: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: {
    color: '#1a1a2e',
  },
  date: {
    color: '#9aa0a6',
  },
  description: {
    color: '#5c6370',
  },
});
