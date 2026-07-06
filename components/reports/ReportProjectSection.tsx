import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import type { ReportProjectSection as ReportSection } from '../../utils/reports';
import { formatDate, formatMoney } from '../../utils/format';

type ReportProjectSectionProps = {
  section: ReportSection;
  hasPeriodFilter: boolean;
};

export function ReportProjectSection({
  section,
  hasPeriodFilter,
}: ReportProjectSectionProps) {
  const { project, budgetSummary, expenseGroups, periodTotal } = section;

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.projectName}>
        {project.name}
      </Text>

      <View style={styles.chips}>
        {project.finished ? (
          <Chip compact style={styles.chip}>
            Закончен
          </Chip>
        ) : (
          <Chip compact style={styles.chip}>
            В работе
          </Chip>
        )}
        {project.liked ? (
          <Chip compact style={styles.chip} icon="heart">
            Понравилось
          </Chip>
        ) : null}
      </View>

      <Card
        style={[
          styles.summaryCard,
          budgetSummary.isOverBudget && styles.overBudgetCard,
        ]}
      >
        <Card.Content>
          <Text variant="titleSmall" style={styles.blockTitle}>
            Бюджет проекта
          </Text>
          <Text variant="bodyMedium">
            План: {formatMoney(budgetSummary.plannedTotal)}
          </Text>
          <Text variant="bodyMedium">
            Факт: {formatMoney(budgetSummary.actualTotal)}
          </Text>
          <Text variant="bodyMedium">
            Остаток: {formatMoney(budgetSummary.remainingTotal)}
          </Text>
          {budgetSummary.isOverBudget ? (
            <Text variant="bodyMedium" style={styles.warning}>
              Превышение бюджета
            </Text>
          ) : null}
          {budgetSummary.nextBudgetItem ? (
            <Text variant="bodySmall" style={styles.nextItem}>
              Следующий пункт: {budgetSummary.nextBudgetItem.name}
            </Text>
          ) : null}
        </Card.Content>
      </Card>

      {budgetSummary.items.length > 0 ? (
        <View style={styles.budgetItems}>
          <Text variant="titleSmall" style={styles.blockTitle}>
            По пунктам бюджета
          </Text>
          {budgetSummary.items.map((item) => (
            <Card key={item.id} style={styles.itemCard} mode="outlined">
              <Card.Content>
                <Text variant="titleSmall">{item.name}</Text>
                <Text variant="bodySmall">
                  План: {formatMoney(item.plannedAmount)} · Факт:{' '}
                  {formatMoney(item.actualAmount)} · Остаток:{' '}
                  {formatMoney(item.remainingAmount)}
                </Text>
                {item.isOverBudget ? (
                  <Text variant="bodySmall" style={styles.warning}>
                    Превышение по пункту
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={styles.expenses}>
        <Text variant="titleSmall" style={styles.blockTitle}>
          {hasPeriodFilter
            ? `Расходы за период: ${formatMoney(periodTotal)}`
            : `Расходы: ${formatMoney(periodTotal)}`}
        </Text>
          {expenseGroups.length === 0 ? (
            <Text variant="bodyMedium" style={styles.empty}>
              {hasPeriodFilter
                ? 'Расходов за выбранный период нет'
                : 'Расходов пока нет'}
            </Text>
          ) : (
            expenseGroups.map((group) => (
              <View key={group.budgetItemId} style={styles.group}>
                <Text variant="titleSmall" style={styles.groupTitle}>
                  {group.budgetItemName}
                </Text>
                {group.expenses.map((expense) => (
                  <Card key={expense.id} style={styles.expenseCard} mode="elevated">
                    <Card.Content>
                      <View style={styles.expenseRow}>
                        <Text variant="titleSmall">
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
                ))}
              </View>
            ))
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  projectName: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#eef2f7',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  overBudgetCard: {
    borderColor: '#c62828',
    borderWidth: 1,
  },
  blockTitle: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  warning: {
    color: '#c62828',
    marginTop: 4,
  },
  nextItem: {
    color: '#1a5fb4',
    marginTop: 4,
  },
  budgetItems: {
    marginBottom: 12,
  },
  itemCard: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  expenses: {
    marginTop: 4,
  },
  empty: {
    color: '#6b7280',
  },
  group: {
    marginBottom: 8,
  },
  groupTitle: {
    color: '#1a5fb4',
    marginBottom: 6,
  },
  expenseCard: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    color: '#9aa0a6',
  },
  description: {
    color: '#5c6370',
  },
});
