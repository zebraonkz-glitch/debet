import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
} from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import {
  ExpenseFormFields,
  type ExpenseFormValues,
} from '../../components/expense/ExpenseFormFields';
import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from '../../repositories/expenseRepository';
import { getAllProjects } from '../../repositories/projectRepository';
import type { Expense, Project } from '../../types/entities';
import { formatDate, formatMoney } from '../../utils/format';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [values, setValues] = useState<ExpenseFormValues | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExpense = useCallback(async () => {
    if (!Number.isFinite(expenseId)) {
      setExpense(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [loadedExpense, loadedProjects] = await Promise.all([
        getExpenseById(expenseId),
        getAllProjects(),
      ]);

      setProjects(loadedProjects);

      if (!loadedExpense) {
        setExpense(null);
        setValues(null);
        return;
      }

      setExpense(loadedExpense);
      setValues({
        projectId: loadedExpense.projectId,
        amount: String(loadedExpense.amount),
        description: loadedExpense.description,
        date: new Date(loadedExpense.createdAt),
      });
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useFocusEffect(
    useCallback(() => {
      void loadExpense();
    }, [loadExpense]),
  );

  const handleSave = async () => {
    if (!expense || !values) {
      return;
    }

    if (!values.projectId) {
      setErrorMessage('Выберите проект');
      return;
    }

    const amount = Number(values.amount.replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Укажите корректную сумму');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateExpense(expense.id, {
        projectId: values.projectId,
        amount,
        description: values.description.trim(),
        createdAt: values.date.toISOString(),
      });

      if (updated) {
        setExpense(updated);
        setValues({
          projectId: updated.projectId,
          amount: String(updated.amount),
          description: updated.description,
          date: new Date(updated.createdAt),
        });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!expense) {
      return;
    }

    Alert.alert('Удалить расход?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(expense.id);
          router.replace(`/project/${expense.projectId}`);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenLayout title="Расход">
        <ActivityIndicator style={styles.loader} />
      </ScreenLayout>
    );
  }

  if (!expense || !values) {
    return (
      <ScreenLayout title="Расход">
        <Text variant="bodyLarge">Расход не найден</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Расход">
      <Text variant="bodySmall" style={styles.meta}>
        Создан: {formatDate(expense.createdAt)} · Сумма: {formatMoney(expense.amount)}
      </Text>

      <ExpenseFormFields
        projects={projects}
        values={values}
        onChange={setValues}
      />

      <View style={styles.actions}>
        <Button mode="contained" loading={saving} onPress={handleSave}>
          Сохранить изменения
        </Button>
        <Button mode="outlined" textColor="#d93025" onPress={handleDelete}>
          Удалить расход
        </Button>
      </View>

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
  loader: {
    marginTop: 24,
  },
  meta: {
    color: '#9aa0a6',
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
});
