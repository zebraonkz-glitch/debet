import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';

import type { BudgetItemSummary, ProjectBudgetSummary } from '../../types/entities';
import { formatMoney } from '../../utils/format';

type BudgetSectionProps = {
  summary: ProjectBudgetSummary;
  onAdd: () => void;
  onEdit: (item: BudgetItemSummary) => void;
  onDelete: (item: BudgetItemSummary) => void;
  onMoveUp: (item: BudgetItemSummary) => void;
  onMoveDown: (item: BudgetItemSummary) => void;
};

export function BudgetSection({
  summary,
  onAdd,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: BudgetSectionProps) {
  const confirmDelete = (item: BudgetItemSummary) => {
    Alert.alert(
      'Удалить пункт бюджета?',
      item.actualAmount > 0
        ? 'Связанные расходы также будут удалены.'
        : undefined,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => onDelete(item),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Бюджет
        </Text>
        <Button mode="outlined" compact onPress={onAdd}>
          Добавить
        </Button>
      </View>

      <Card style={[styles.summaryCard, summary.isOverBudget && styles.overBudgetCard]}>
        <Card.Content>
          <Text variant="bodyMedium">
            План: {formatMoney(summary.plannedTotal)}
          </Text>
          <Text variant="bodyMedium">
            Факт: {formatMoney(summary.actualTotal)}
          </Text>
          <Text variant="bodyMedium">
            Остаток: {formatMoney(summary.remainingTotal)}
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
        summary.items.map((item, index) => {
          const isNext = summary.nextBudgetItem?.id === item.id;

          return (
            <Card
              key={item.id}
              style={[
                styles.itemCard,
                item.isOverBudget && styles.overBudgetCard,
                isNext && styles.nextItemCard,
              ]}
            >
              <Card.Content>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text variant="titleSmall">
                      {item.order + 1}. {item.name}
                    </Text>
                    {isNext ? (
                      <Text variant="bodySmall" style={styles.nextBadge}>
                        Следующий пункт
                      </Text>
                    ) : null}
                    <Text variant="bodySmall" style={styles.amounts}>
                      План: {formatMoney(item.plannedAmount)} · Факт:{' '}
                      {formatMoney(item.actualAmount)} · Остаток:{' '}
                      {formatMoney(item.remainingAmount)}
                    </Text>
                    {item.isOverBudget ? (
                      <Text variant="bodySmall" style={styles.warning}>
                        Превышение по пункту
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.itemActions}>
                    <IconButton
                      icon="chevron-up"
                      size={18}
                      disabled={index === 0}
                      onPress={() => onMoveUp(item)}
                    />
                    <IconButton
                      icon="chevron-down"
                      size={18}
                      disabled={index === summary.items.length - 1}
                      onPress={() => onMoveDown(item)}
                    />
                    <IconButton
                      icon="pencil"
                      size={18}
                      onPress={() => onEdit(item)}
                    />
                    <IconButton
                      icon="delete"
                      size={18}
                      onPress={() => confirmDelete(item)}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        })
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
  nextItemCard: {
    borderColor: '#1a5fb4',
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
  nextBadge: {
    color: '#1a5fb4',
    marginTop: 2,
    fontWeight: '600',
  },
  empty: {
    color: '#6b7280',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 4,
  },
  amounts: {
    color: '#5c6370',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginRight: -8,
  },
});
