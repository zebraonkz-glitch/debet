import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import {
  ExpenseFormFields,
  type ExpenseFormValues,
} from '../../components/expense/ExpenseFormFields';
import { getBudgetItemsByProjectId } from '../../repositories/budgetItemRepository';
import { createExpense } from '../../repositories/expenseRepository';
import { getAllProjects } from '../../repositories/projectRepository';
import type { BudgetItem, Project } from '../../types/entities';

const INITIAL_VALUES: ExpenseFormValues = {
  projectId: null,
  budgetItemId: null,
  amount: '',
  description: '',
  date: new Date(),
};

export default function CreateExpenseScreen() {
  const { projectId: projectIdParam, budgetItemId: budgetItemIdParam } =
    useLocalSearchParams<{
      projectId?: string;
      budgetItemId?: string;
    }>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [values, setValues] = useState<ExpenseFormValues>(INITIAL_VALUES);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    const loadedProjects = await getAllProjects();
    setProjects(loadedProjects);

    const initialProjectId = Number(projectIdParam);
    const projectId = Number.isFinite(initialProjectId)
      ? initialProjectId
      : loadedProjects[0]?.id ?? null;

    const initialBudgetItemId = Number(budgetItemIdParam);
    const budgetItemId = Number.isFinite(initialBudgetItemId)
      ? initialBudgetItemId
      : null;

    setValues((current) => ({
      ...current,
      projectId,
      budgetItemId,
    }));
  }, [projectIdParam, budgetItemIdParam]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const loadBudgetItems = async () => {
      if (!values.projectId) {
        setBudgetItems([]);
        return;
      }

      const items = await getBudgetItemsByProjectId(values.projectId);
      setBudgetItems(items);

      if (items.length === 0) {
        setValues((current) => ({ ...current, budgetItemId: null }));
        return;
      }

      setValues((current) => {
        if (current.budgetItemId && items.some((item) => item.id === current.budgetItemId)) {
          return current;
        }

        return {
          ...current,
          budgetItemId: items[0]?.id ?? null,
        };
      });
    };

    void loadBudgetItems();
  }, [values.projectId]);

  const handleSave = async () => {
    if (!values.projectId || !values.budgetItemId) {
      setErrorMessage('Выберите проект и пункт бюджета');
      return;
    }

    const amount = Number(values.amount.replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Укажите корректную сумму');
      return;
    }

    setSaving(true);
    try {
      const expense = await createExpense({
        projectId: values.projectId,
        budgetItemId: values.budgetItemId,
        amount,
        description: values.description.trim(),
        createdAt: values.date.toISOString(),
      });

      router.replace(`/expense/${expense.id}`);
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось сохранить расход');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="Создать расход">
      <ExpenseFormFields
        projects={projects}
        budgetItems={budgetItems}
        values={values}
        onChange={setValues}
      />

      <View style={styles.actions}>
        <Button mode="contained" loading={saving} onPress={handleSave}>
          Сохранить расход
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
  actions: {
    marginTop: 8,
  },
});
