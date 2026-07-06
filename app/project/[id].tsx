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
import { BudgetItemDialog } from '../../components/project/BudgetItemDialog';
import { BudgetSection } from '../../components/project/BudgetSection';
import { ProjectExpensesList } from '../../components/expense/ProjectExpensesList';
import { LinkExecutorDialog } from '../../components/project/LinkExecutorDialog';
import { ExecutorsList } from '../../components/project/ExecutorsList';
import {
  ProjectFormFields,
  type ProjectFormValues,
} from '../../components/project/ProjectFormFields';
import { ProjectPhotoPicker } from '../../components/project/ProjectPhotoPicker';
import { SavedPhotoGallery } from '../../components/project/SavedPhotoGallery';
import {
  createBudgetItem,
  deleteBudgetItem,
  getBudgetItemsByProjectId,
  reorderBudgetItem,
  updateBudgetItem,
} from '../../repositories/budgetItemRepository';
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
import type {
  BudgetItemSummary,
  Executor,
  Photo,
  Project,
  ProjectBudgetSummary,
} from '../../types/entities';
import { getProjectBudgetSummary } from '../../utils/budget';
import { groupExpensesByBudgetItem, type ExpenseGroup } from '../../utils/expenses';
import { formatDate } from '../../utils/format';
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
  const [budgetSummary, setBudgetSummary] = useState<ProjectBudgetSummary | null>(
    null,
  );
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [executorDialogVisible, setExecutorDialogVisible] = useState(false);
  const [budgetDialogVisible, setBudgetDialogVisible] = useState(false);
  const [budgetDialogMode, setBudgetDialogMode] = useState<'create' | 'edit'>('create');
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItemSummary | null>(
    null,
  );
  const [suggestedBudgetOrder, setSuggestedBudgetOrder] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshBudgetSummary = useCallback(async () => {
    if (!Number.isFinite(projectId)) {
      return;
    }

    setBudgetSummary(await getProjectBudgetSummary(projectId));
  }, [projectId]);

  const loadProject = useCallback(async () => {
    if (!Number.isFinite(projectId)) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [loadedProject, loadedPhotos, summary, loadedExecutors, expenses, budgetItems] =
        await Promise.all([
          getProjectById(projectId),
          getPhotosByProjectId(projectId),
          getProjectBudgetSummary(projectId),
          getExecutorsByProjectId(projectId),
          getExpensesByProjectId(projectId),
          getBudgetItemsByProjectId(projectId),
        ]);

      setProject(loadedProject);
      setPhotos(loadedPhotos);
      setBudgetSummary(summary);
      setExecutors(loadedExecutors);
      setExpenseGroups(groupExpensesByBudgetItem(expenses, budgetItems));
      setPendingPhotos([]);

      if (loadedProject) {
        setValues({
          name: loadedProject.name,
          description: loadedProject.description,
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

    setSaving(true);
    try {
      const updated = await updateProject(project.id, {
        name: values.name.trim(),
        description: values.description.trim(),
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
          finished: updated.finished,
          liked: updated.liked,
          dd: updated.dd,
        });
      }

      const loadedPhotos = await getPhotosByProjectId(project.id);
      setPhotos(loadedPhotos);
      setPendingPhotos([]);
      await refreshBudgetSummary();
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

  const openCreateBudgetDialog = () => {
    const nextOrder = budgetSummary?.items.length ?? 0;
    setSuggestedBudgetOrder(nextOrder);
    setBudgetDialogMode('create');
    setEditingBudgetItem(null);
    setBudgetDialogVisible(true);
  };

  const openEditBudgetDialog = (item: BudgetItemSummary) => {
    setBudgetDialogMode('edit');
    setEditingBudgetItem(item);
    setBudgetDialogVisible(true);
  };

  const handleSaveBudgetItem = async (input: {
    name: string;
    plannedAmount: number;
    order: number;
  }) => {
    if (!project) {
      return;
    }

    try {
      if (budgetDialogMode === 'create') {
        await createBudgetItem({
          projectId: project.id,
          name: input.name,
          plannedAmount: input.plannedAmount,
          order: input.order,
        });
      } else if (editingBudgetItem) {
        await updateBudgetItem(editingBudgetItem.id, {
          name: input.name,
          plannedAmount: input.plannedAmount,
          order: input.order,
        });
      }

      await refreshBudgetSummary();
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось сохранить пункт бюджета');
    }
  };

  const handleDeleteBudgetItem = async (item: BudgetItemSummary) => {
    try {
      await deleteBudgetItem(item.id);
      await refreshBudgetSummary();
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось удалить пункт бюджета');
    }
  };

  const handleMoveBudgetItem = async (
    item: BudgetItemSummary,
    direction: 'up' | 'down',
  ) => {
    if (!project) {
      return;
    }

    try {
      await reorderBudgetItem(project.id, item.id, direction);
      await refreshBudgetSummary();
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось изменить порядок пунктов');
    }
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
        Создан: {formatDate(project.createdAt)}
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

      {budgetSummary ? (
        <BudgetSection
          summary={budgetSummary}
          onAdd={openCreateBudgetDialog}
          onEdit={openEditBudgetDialog}
          onDelete={handleDeleteBudgetItem}
          onMoveUp={(item) => handleMoveBudgetItem(item, 'up')}
          onMoveDown={(item) => handleMoveBudgetItem(item, 'down')}
        />
      ) : null}

      <ProjectExpensesList
        groups={expenseGroups}
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

      <BudgetItemDialog
        visible={budgetDialogVisible}
        mode={budgetDialogMode}
        item={editingBudgetItem}
        suggestedOrder={suggestedBudgetOrder}
        onDismiss={() => setBudgetDialogVisible(false)}
        onSubmit={handleSaveBudgetItem}
      />

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
