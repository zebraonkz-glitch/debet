import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  FAB,
  Snackbar,
  Text,
} from 'react-native-paper';

import { DateField } from '../../components/common/DateField';
import { ExpenseListCard } from '../../components/expense/ExpenseListCard';
import { ScreenLayout } from '../../components/ScreenLayout';
import { getAllExpenses } from '../../repositories/expenseRepository';
import { getAllProjects } from '../../repositories/projectRepository';
import type { Expense, Project } from '../../types/entities';
import { isExpenseDateInPeriod, sortExpensesByDate } from '../../utils/expenses';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const projectNames = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.name]));
  }, [projects]);

  const visibleExpenses = useMemo(() => {
    const inPeriod = expenses.filter((expense) =>
      isExpenseDateInPeriod(expense, fromDate, toDate),
    );

    return sortExpensesByDate(inPeriod);
  }, [expenses, fromDate, toDate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedExpenses, loadedProjects] = await Promise.all([
        getAllExpenses(),
        getAllProjects(),
      ]);
      setExpenses(loadedExpenses);
      setProjects(loadedProjects);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const handlePeriodChange = (nextFrom: Date | null, nextTo: Date | null) => {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setErrorMessage('Дата начала не может быть позже даты окончания');
      return;
    }

    setFromDate(nextFrom);
    setToDate(nextTo);
  };

  const listHeader = (
    <View style={styles.header}>
      <Text variant="titleSmall" style={styles.periodTitle}>
        Период отображения
      </Text>
      <Text variant="bodySmall" style={styles.hint}>
        Оставьте пустым, чтобы показать все даты
      </Text>

      <DateField
        label="С даты"
        value={fromDate ?? new Date()}
        mode="date"
        onChange={(date) => handlePeriodChange(date, toDate)}
      />
      {fromDate ? (
        <Button
          mode="text"
          compact
          onPress={() => handlePeriodChange(null, toDate)}
        >
          Очистить начало периода
        </Button>
      ) : null}

      <DateField
        label="По дату"
        value={toDate ?? new Date()}
        mode="date"
        onChange={(date) => handlePeriodChange(fromDate, date)}
      />
      {toDate ? (
        <Button
          mode="text"
          compact
          onPress={() => handlePeriodChange(fromDate, null)}
        >
          Очистить конец периода
        </Button>
      ) : null}
    </View>
  );

  return (
    <ScreenLayout title="Расходы" scrollable={false}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : visibleExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          {listHeader}
          <Text variant="bodyLarge" style={styles.empty}>
            Расходы не найдены
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleExpenses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ExpenseListCard
              expense={item}
              projectName={projectNames.get(item.projectId) ?? 'Без проекта'}
            />
          )}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/expense/create')}
      />

      <Snackbar
        visible={Boolean(errorMessage)}
        onDismiss={() => setErrorMessage(null)}
        duration={3000}
      >
        {errorMessage}
      </Snackbar>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 8,
  },
  periodTitle: {
    color: '#1a1a2e',
    marginBottom: 4,
  },
  hint: {
    color: '#6b7280',
    marginBottom: 8,
  },
  list: {
    paddingBottom: 88,
  },
  loader: {
    marginTop: 24,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    color: '#6b7280',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1a5fb4',
  },
});
