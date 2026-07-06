import type { ProjectBudgetSummary } from '../../types/entities';
import { formatAmount } from '../../utils/format';
import { Card, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

type BudgetOverviewProps = {
  summary: ProjectBudgetSummary;
};

export function BudgetOverview({ summary }: BudgetOverviewProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Бюджет
      </Text>

      <Card style={[styles.summaryCard, summary.isOverBudget && styles.overBudgetCard]}>
        <Card.Content>
          <Text variant="bodyMedium">
            План: {formatAmount(summary.plannedTotal)} ₽
          </Text>
          <Text variant="bodyMedium">
            Факт: {formatAmount(summary.actualTotal)} ₽
          </Text>
          <Text variant="bodyMedium">
            Остаток: {formatAmount(summary.remainingTotal)} ₽
          </Text>
          {summary.isOverBudget ? (
            <Text variant="bodyMedium" style={styles.warning}>
              Превышение бюджета проекта
            </Text>
          ) : null}
          {summary.nextBudgetItem ? (
            <Text variant="bodySmall" style={styles.nextItem}>
              Следующий пункт: {summary.nextBudgetItem.name}
            </Text>
          ) : null}
        </Card.Content>
      </Card>

      {summary.items.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          Пункты бюджета пока не добавлены
        </Text>
      ) : (
        summary.items.map((item) => (
          <Card
            key={item.id}
            style={[styles.itemCard, item.isOverBudget && styles.overBudgetCard]}
          >
            <Card.Content>
              <Text variant="titleSmall">{item.name}</Text>
              <Text variant="bodySmall">
                План: {formatAmount(item.plannedAmount)} ₽ · Факт:{' '}
                {formatAmount(item.actualAmount)} ₽ · Остаток:{' '}
                {formatAmount(item.remainingAmount)} ₽
              </Text>
              {item.isOverBudget ? (
                <Text variant="bodySmall" style={styles.warning}>
                  Превышение по пункту
                </Text>
              ) : null}
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
  title: {
    marginBottom: 8,
    color: '#1a1a2e',
  },
  summaryCard: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  itemCard: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  overBudgetCard: {
    borderColor: '#d93025',
    borderWidth: 1,
  },
  warning: {
    color: '#d93025',
    marginTop: 4,
    fontWeight: '600',
  },
  nextItem: {
    color: '#1a5fb4',
    marginTop: 8,
  },
  empty: {
    color: '#6b7280',
  },
});
