import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import {
  ExpenseFormFields,
  type ExpenseFormValues,
} from '../../components/expense/ExpenseFormFields';
import { createExpense } from '../../repositories/expenseRepository';
import { getAllProjects } from '../../repositories/projectRepository';
import type { Project } from '../../types/entities';

const INITIAL_VALUES: ExpenseFormValues = {
  projectId: null,
  amount: '',
  description: '',
  date: new Date(),
};

export default function CreateExpenseScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{
    projectId?: string;
  }>();

  const [projects, setProjects] = useState<Project[]>([]);
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

    setValues((current) => ({
      ...current,
      projectId,
    }));
  }, [projectIdParam]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleSave = async () => {
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
      await createExpense({
        projectId: values.projectId,
        amount,
        description: values.description.trim(),
        createdAt: values.date.toISOString(),
      });

      if (projectIdParam) {
        router.replace(`/project/${values.projectId}`);
      } else {
        router.replace('/expenses');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось сохранить расход');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="Новый расход">
      <ExpenseFormFields
        projects={projects}
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
