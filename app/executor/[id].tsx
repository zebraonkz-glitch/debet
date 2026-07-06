import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
} from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import {
  ExecutorFormFields,
  type ExecutorFormValues,
} from '../../components/executor/ExecutorFormFields';
import {
  deleteExecutor,
  getExecutorById,
  updateExecutor,
} from '../../repositories/executorRepository';
import { getProjectIdsByExecutorId } from '../../repositories/projectExecutorRepository';
import type { Executor } from '../../types/entities';

export default function ExecutorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const executorId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executor, setExecutor] = useState<Executor | null>(null);
  const [values, setValues] = useState<ExecutorFormValues | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExecutor = useCallback(async () => {
    if (!Number.isFinite(executorId)) {
      setExecutor(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const loadedExecutor = await getExecutorById(executorId);

      if (!loadedExecutor) {
        setExecutor(null);
        setValues(null);
        return;
      }

      const projectIds = await getProjectIdsByExecutorId(executorId);

      setExecutor(loadedExecutor);
      setProjectCount(projectIds.length);
      setValues({
        name: loadedExecutor.name,
        phone: loadedExecutor.phone,
        email: loadedExecutor.email,
        note: loadedExecutor.note,
      });
    } finally {
      setLoading(false);
    }
  }, [executorId]);

  useFocusEffect(
    useCallback(() => {
      void loadExecutor();
    }, [loadExecutor]),
  );

  const handleSave = async () => {
    if (!executor || !values) {
      return;
    }

    if (!values.name.trim()) {
      setErrorMessage('Укажите имя исполнителя');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateExecutor(executor.id, {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        note: values.note.trim(),
      });

      if (updated) {
        setExecutor(updated);
        setValues({
          name: updated.name,
          phone: updated.phone,
          email: updated.email,
          note: updated.note,
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
    if (!executor) {
      return;
    }

    const message =
      projectCount > 0
        ? `Исполнитель привязан к ${projectCount} проект(ам). Удалить из всех проектов?`
        : 'Это действие нельзя отменить.';

    Alert.alert('Удалить исполнителя?', message, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteExecutor(executor.id);
          router.back();
        },
      },
    ]);
  };

  const openPhone = () => {
    if (executor?.phone) {
      void Linking.openURL(`tel:${executor.phone}`);
    }
  };

  const openEmail = () => {
    if (executor?.email) {
      void Linking.openURL(`mailto:${executor.email}`);
    }
  };

  if (loading) {
    return (
      <ScreenLayout title="Исполнитель">
        <ActivityIndicator style={styles.loader} />
      </ScreenLayout>
    );
  }

  if (!executor || !values) {
    return (
      <ScreenLayout title="Исполнитель">
        <Text variant="bodyLarge">Исполнитель не найден</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={executor.name}>
      <Text variant="bodySmall" style={styles.meta}>
        Привязан к проектам: {projectCount}
      </Text>

      <ExecutorFormFields values={values} onChange={setValues} />

      <View style={styles.quickActions}>
        {executor.phone ? (
          <Button mode="outlined" icon="phone" onPress={openPhone}>
            Позвонить
          </Button>
        ) : null}
        {executor.email ? (
          <Button mode="outlined" icon="email" onPress={openEmail}>
            Написать
          </Button>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button mode="contained" loading={saving} onPress={handleSave}>
          Сохранить изменения
        </Button>
        <Button mode="outlined" textColor="#d93025" onPress={handleDelete}>
          Удалить исполнителя
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
    marginBottom: 16,
  },
  quickActions: {
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
});
