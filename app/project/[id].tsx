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
import { ProjectExpensesList } from '../../components/expense/ProjectExpensesList';
import { LinkExecutorDialog } from '../../components/project/LinkExecutorDialog';
import { ExecutorsList } from '../../components/project/ExecutorsList';
import {
  ProjectFormFields,
  type ProjectFormValues,
} from '../../components/project/ProjectFormFields';
import { ProjectPhotoPicker } from '../../components/project/ProjectPhotoPicker';
import { SavedPhotoGallery } from '../../components/project/SavedPhotoGallery';
import { createExecutor } from '../../repositories/executorRepository';
import { getExpensesByProjectId } from '../../repositories/expenseRepository';
import { createPhoto, deletePhoto, getPhotosByProjectId } from '../../repositories/photoRepository';
import {
  deleteProject,
  getProjectById,
  updateProject,
} from '../../repositories/projectRepository';
import {
  getExecutorsByProjectId,
  linkExecutorToProject,
  unlinkExecutorFromProject,
} from '../../repositories/projectExecutorRepository';
import type { Executor, Expense, Photo, Project } from '../../types/entities';
import { formatDate, formatDateOnly, formatMoney } from '../../utils/format';
import { getCurrentCoordinates } from '../../utils/location';
import { savePhotoFromUri } from '../../utils/photos';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [values, setValues] = useState<ProjectFormValues | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [executorDialogVisible, setExecutorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!Number.isFinite(projectId)) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [loadedProject, loadedPhotos, loadedExecutors, loadedExpenses] =
        await Promise.all([
          getProjectById(projectId),
          getPhotosByProjectId(projectId),
          getExecutorsByProjectId(projectId),
          getExpensesByProjectId(projectId),
        ]);

      setProject(loadedProject);
      setPhotos(loadedPhotos);
      setExecutors(loadedExecutors);
      setExpenses(loadedExpenses);
      setPendingPhotos([]);

      if (loadedProject) {
        setValues({
          name: loadedProject.name,
          description: loadedProject.description,
          date: new Date(loadedProject.date),
          amount: String(loadedProject.amount),
          finished: loadedProject.finished,
          liked: loadedProject.liked,
          dd: loadedProject.dd,
        });
      } else {
        setValues(null);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      void loadProject();
    }, [loadProject]),
  );

  const handleRequestLocation = async () => {
    if (!values) {
      return;
    }

    setLocationLoading(true);
    try {
      const coordinates = await getCurrentCoordinates();

      if (!coordinates) {
        Alert.alert(
          'Геолокация',
          'Не удалось получить координаты. Проверьте разрешения.',
        );
        return;
      }

      setValues({ ...values, dd: coordinates });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSave = async () => {
    if (!values || !project) {
      return;
    }

    if (!values.name.trim()) {
      setErrorMessage('Укажите название проекта');
      return;
    }

    const amount = values.amount.trim()
      ? Number(values.amount.replace(',', '.'))
      : 0;

    if (values.amount.trim() && (!Number.isFinite(amount) || amount < 0)) {
      setErrorMessage('Укажите корректную сумму');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProject(project.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        date: values.date.toISOString(),
        amount,
        finished: values.finished,
        liked: values.liked,
        dd: values.dd,
      });

      for (const uri of pendingPhotos) {
        const filePath = await savePhotoFromUri(uri, project.id);
        await createPhoto({ projectId: project.id, filePath });
      }

      if (updated) {
        setProject(updated);
        setValues({
          name: updated.name,
          description: updated.description,
          date: new Date(updated.date),
          amount: String(updated.amount),
          finished: updated.finished,
          liked: updated.liked,
          dd: updated.dd,
        });
      }

      const loadedPhotos = await getPhotosByProjectId(project.id);
      setPhotos(loadedPhotos);
      setPendingPhotos([]);
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    await deletePhoto(photoId);
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  };

  const handleDeleteProject = () => {
    if (!project) {
      return;
    }

    Alert.alert('Удалить проект?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(project.id);
          router.replace('/projects');
        },
      },
    ]);
  };

  const handleLinkExistingExecutor = async (executorId: number) => {
    if (!project) {
      return;
    }

    await linkExecutorToProject(project.id, executorId);
    setExecutors(await getExecutorsByProjectId(project.id));
  };

  const handleCreateAndLinkExecutor = async (input: {
    name: string;
    phone: string;
    email: string;
    note: string;
  }) => {
    if (!project) {
      return;
    }

    const executor = await createExecutor(input);
    await linkExecutorToProject(project.id, executor.id);
    setExecutors(await getExecutorsByProjectId(project.id));
  };

  const handleRemoveExecutor = async (executorId: number) => {
    if (!project) {
      return;
    }

    await unlinkExecutorFromProject(project.id, executorId);
    setExecutors(await getExecutorsByProjectId(project.id));
  };

  const openMap = () => {
    if (!project?.dd) {
      return;
    }

    router.push({
      pathname: '/project/map',
      params: {
        lat: String(project.dd.latitude),
        lng: String(project.dd.longitude),
        name: project.name,
      },
    });
  };

  if (loading) {
    return (
      <ScreenLayout title="Проект">
        <ActivityIndicator style={styles.loader} />
      </ScreenLayout>
    );
  }

  if (!project || !values) {
    return (
      <ScreenLayout title="Проект">
        <Text variant="bodyLarge">Проект не найден</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={project.name}>
      <Text variant="bodySmall" style={styles.meta}>
        Создан: {formatDate(project.createdAt)} · Дата проекта:{' '}
        {formatDateOnly(project.date)} · Сумма: {formatMoney(project.amount)}
      </Text>

      <ProjectFormFields
        values={values}
        onChange={setValues}
        onRequestLocation={handleRequestLocation}
        locationLoading={locationLoading}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Фотографии проекта
      </Text>
      <SavedPhotoGallery photos={photos} onDelete={handleDeletePhoto} />
      <ProjectPhotoPicker
        photos={pendingPhotos}
        onChange={setPendingPhotos}
        title="Добавить фотографии"
      />

      <ProjectExpensesList
        expenses={expenses}
        onAdd={() => router.push(`/expense/create?projectId=${project.id}`)}
      />

      <ExecutorsList
        executors={executors}
        onAdd={() => setExecutorDialogVisible(true)}
        onRemove={handleRemoveExecutor}
      />

      {project.dd ? (
        <Button mode="outlined" icon="map" onPress={openMap} style={styles.button}>
          Открыть на карте
        </Button>
      ) : null}

      <View style={styles.actions}>
        <Button mode="contained" loading={saving} onPress={handleSave}>
          Сохранить изменения
        </Button>
        <Button mode="outlined" textColor="#d93025" onPress={handleDeleteProject}>
          Удалить проект
        </Button>
      </View>

      <LinkExecutorDialog
        visible={executorDialogVisible}
        linkedExecutorIds={executors.map((executor) => executor.id)}
        onDismiss={() => setExecutorDialogVisible(false)}
        onLinkExisting={handleLinkExistingExecutor}
        onCreateAndLink={handleCreateAndLinkExecutor}
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
  loader: {
    marginTop: 24,
  },
  meta: {
    color: '#9aa0a6',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  button: {
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
});
