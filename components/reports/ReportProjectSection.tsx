import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import type { ReportProjectSection as ReportSection } from '../../utils/reports';
import { formatDate, formatDateOnly, formatMoney } from '../../utils/format';

type ReportProjectSectionProps = {
  section: ReportSection;
};

export function ReportProjectSection({ section }: ReportProjectSectionProps) {
  const { project, expenses, projectAmount, expensesTotal, profit } = section;

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.projectName}>
        {formatDateOnly(project.date)} · {project.name}
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

      <Card style={[styles.summaryCard, profit < 0 && styles.lossCard]}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.blockTitle}>
            Прибыль
          </Text>
          <Text variant="bodyMedium">
            Сумма проекта: {formatMoney(projectAmount)}
          </Text>
          <Text variant="bodyMedium">Расходы: {formatMoney(expensesTotal)}</Text>
          <Text
            variant="titleMedium"
            style={[styles.profitValue, profit < 0 && styles.warning]}
          >
            Прибыль: {formatMoney(profit)}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.expenses}>
        <Text variant="titleSmall" style={styles.blockTitle}>
          Расходы: {formatMoney(expensesTotal)}
        </Text>
        {expenses.length === 0 ? (
          <Text variant="bodyMedium" style={styles.empty}>
            Расходов пока нет
          </Text>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} style={styles.expenseCard} mode="elevated">
              <Card.Content>
                <View style={styles.expenseRow}>
                  <Text variant="titleSmall">{formatMoney(expense.amount)}</Text>
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
  lossCard: {
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
  profitValue: {
    color: '#1a5fb4',
    marginTop: 8,
  },
  expenses: {
    marginTop: 4,
  },
  empty: {
    color: '#6b7280',
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
