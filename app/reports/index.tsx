import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Chip,
  Snackbar,
  Text,
} from 'react-native-paper';

import { DateField } from '../../components/common/DateField';
import { ScreenLayout } from '../../components/ScreenLayout';
import { getAllProjects } from '../../repositories/projectRepository';
import type { Project } from '../../types/entities';
import {
  isProjectDateInPeriod,
  sortProjectsByDate,
} from '../../utils/projects';
import { formatDateOnly } from '../../utils/format';

type ProjectFilter = 'all' | 'finished' | 'liked';

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'finished', label: 'Закончен' },
  { id: 'liked', label: 'Понравилось' },
];

function filterProjects(projects: Project[], filter: ProjectFilter): Project[] {
  if (filter === 'finished') {
    return projects.filter((project) => project.finished);
  }

  if (filter === 'liked') {
    return projects.filter((project) => project.liked);
  }

  return projects;
}

export default function ReportsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleProjects = useMemo(() => {
    const filtered = filterProjects(projects, filter).filter((project) =>
      isProjectDateInPeriod(project, fromDate, toDate),
    );

    return sortProjectsByDate(filtered);
  }, [projects, filter, fromDate, toDate]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [loadProjects]),
  );

  const toggleProject = (projectId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const selectVisible = () => {
    setSelectedIds(new Set(visibleProjects.map((project) => project.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleGenerate = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setErrorMessage('Дата начала не может быть позже даты окончания');
      return;
    }

    if (selectedIds.size === 0 && visibleProjects.length === 0) {
      setErrorMessage('Нет проектов за выбранный период');
      return;
    }

    router.push({
      pathname: '/reports/form',
      params: {
        projectIds: [...selectedIds].join(','),
        fromDate: fromDate?.toISOString() ?? '',
        toDate: toDate?.toISOString() ?? '',
      },
    });
  };

  return (
    <ScreenLayout title="Отчёты">
      <Text variant="bodyLarge" style={styles.intro}>
        Выберите проекты и период. Если проекты не отмечены, в отчёт попадут все
        проекты за период по дате проекта.
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Фильтр проектов
      </Text>
      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Chip
            key={item.id}
            selected={filter === item.id}
            onPress={() => setFilter(item.id)}
            style={styles.chip}
          >
            {item.label}
          </Chip>
        ))}
      </View>

      <View style={styles.selectionActions}>
        <Button mode="text" compact onPress={selectVisible}>
          Выбрать все
        </Button>
        <Button mode="text" compact onPress={clearSelection}>
          Сбросить
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : visibleProjects.length === 0 ? (
        <Text variant="bodyLarge" style={styles.empty}>
          Нет проектов для отчёта
        </Text>
      ) : (
        <View style={styles.projectList}>
          {visibleProjects.map((project) => (
            <Checkbox.Item
              key={project.id}
              label={`${formatDateOnly(project.date)} · ${project.name}`}
              status={selectedIds.has(project.id) ? 'checked' : 'unchecked'}
              onPress={() => toggleProject(project.id)}
              style={styles.checkbox}
            />
          ))}
        </View>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Период
      </Text>
      <Text variant="bodySmall" style={styles.hint}>
        Период отбирает проекты по дате. Расходы учитываются полностью.
      </Text>

      <DateField
        label="С даты"
        value={fromDate ?? new Date()}
        mode="date"
        onChange={(date) => setFromDate(date)}
      />
      {fromDate ? (
        <Button mode="text" compact onPress={() => setFromDate(null)}>
          Очистить начало периода
        </Button>
      ) : (
        <Text variant="bodySmall" style={styles.hint}>
          Начало периода не задано
        </Text>
      )}

      <DateField
        label="По дату"
        value={toDate ?? new Date()}
        mode="date"
        onChange={(date) => setToDate(date)}
      />
      {toDate ? (
        <Button mode="text" compact onPress={() => setToDate(null)}>
          Очистить конец периода
        </Button>
      ) : (
        <Text variant="bodySmall" style={styles.hint}>
          Конец периода не задан
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleGenerate}
        style={styles.generateButton}
        disabled={loading || (projects.length === 0 && selectedIds.size === 0)}
      >
        Сформировать отчёт
      </Button>

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
  intro: {
    color: '#5c6370',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  projectList: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkbox: {
    backgroundColor: '#ffffff',
  },
  loader: {
    marginVertical: 24,
  },
  empty: {
    color: '#6b7280',
    marginBottom: 20,
  },
  hint: {
    color: '#6b7280',
    marginBottom: 8,
  },
  generateButton: {
    marginTop: 8,
  },
});
